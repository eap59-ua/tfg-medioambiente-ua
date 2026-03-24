const db = require('../config/database');
const notificationService = require('./notification.service');
const emailService = require('./email.service');

/**
 * Obtiene métricas del sistema para el panel de administración
 */
const getDashboardStats = async () => {
  const result = {};

  // Total incidencias
  const totalQuery = await db.query('SELECT COUNT(*) as count FROM incidents');
  result.totalIncidents = parseInt(totalQuery.rows[0].count, 10);

  // Incidencias por estado
  const statusQuery = await db.query(`
    SELECT status, COUNT(*) as count 
    FROM incidents 
    GROUP BY status
  `);
  result.incidentsByStatus = statusQuery.rows;

  // Incidencias por severidad
  const severityQuery = await db.query(`
    SELECT severity, COUNT(*) as count 
    FROM incidents 
    GROUP BY severity
  `);
  result.incidentsBySeverity = severityQuery.rows;

  // Incidencias por categoría (top 5)
  const categoryQuery = await db.query(`
    SELECT c.name, COUNT(i.id) as count
    FROM incidents i
    JOIN categories c ON i.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY count DESC
    LIMIT 5
  `);
  result.incidentsByCategory = categoryQuery.rows;

  // Incidencias este mes
  const thisMonthQuery = await db.query(`
    SELECT COUNT(*) as count 
    FROM incidents 
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
  `);
  result.incidentsThisMonth = parseInt(thisMonthQuery.rows[0].count, 10);

  // Usuarios activos
  const usersQuery = await db.query(`
    SELECT COUNT(*) as count 
    FROM users 
    WHERE is_active = true
  `);
  result.activeUsers = parseInt(usersQuery.rows[0].count, 10);

  return result;
};

/**
 * Lista de incidencias para admin con filtros avanzados
 */
const getAdminIncidents = async (filters = {}) => {
  const { status, severity, categoryId, entityId, reporterId, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  let query = `
    SELECT i.*, 
           c.name as category_name, c.color as category_color,
           u.display_name as reporter_name, u.email as reporter_email,
           re.name as assigned_entity_name,
           (SELECT COUNT(*) FROM incident_votes iv WHERE iv.incident_id = i.id) as vote_count
    FROM incidents i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN users u ON i.reporter_id = u.id
    LEFT JOIN responsible_entities re ON i.assigned_entity_id = re.id
    WHERE 1=1
  `;
  const values = [];
  let paramIndex = 1;

  if (status) { query += ` AND i.status = $${paramIndex++}`; values.push(status); }
  if (severity) { query += ` AND i.severity = $${paramIndex++}`; values.push(severity); }
  if (categoryId) { query += ` AND i.category_id = $${paramIndex++}`; values.push(categoryId); }
  if (entityId) { query += ` AND i.assigned_entity_id = $${paramIndex++}`; values.push(entityId); }
  if (reporterId) { query += ` AND i.reporter_id = $${paramIndex++}`; values.push(reporterId); }

  query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  values.push(limit, offset);

  // Get total count
  let countQuery = `SELECT COUNT(*) FROM incidents i WHERE 1=1`;
  const countValues = [];
  let countParamIndex = 1;
  
  if (status) { countQuery += ` AND i.status = $${countParamIndex++}`; countValues.push(status); }
  if (severity) { countQuery += ` AND i.severity = $${countParamIndex++}`; countValues.push(severity); }
  if (categoryId) { countQuery += ` AND i.category_id = $${countParamIndex++}`; countValues.push(categoryId); }
  if (entityId) { countQuery += ` AND i.assigned_entity_id = $${countParamIndex++}`; countValues.push(entityId); }
  if (reporterId) { countQuery += ` AND i.reporter_id = $${countParamIndex++}`; countValues.push(reporterId); }

  const [incidentsRes, countRes] = await Promise.all([
    db.query(query, values),
    db.query(countQuery, countValues)
  ]);

  const total = parseInt(countRes.rows[0].count, 10);

  return {
    incidents: incidentsRes.rows,
    total,
    pages: Math.ceil(total / limit)
  };
};

/**
 * Asigna una incidencia a una entidad responsable
 */
const assignIncidentToEntity = async (incidentId, entityId, adminId) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Comprobar entidad
    const entityRes = await client.query('SELECT * FROM responsible_entities WHERE id = $1 AND is_active = true', [entityId]);
    if (entityRes.rows.length === 0) {
      throw new Error('Entidad no encontrada o inactiva');
    }
    const entity = entityRes.rows[0];

    // Obtener estado actual
    const incRes = await client.query('SELECT status, title, reporter_id FROM incidents WHERE id = $1 FOR UPDATE', [incidentId]);
    if (incRes.rows.length === 0) {
      throw new Error('Incidencia no encontrada');
    }
    const incident = incRes.rows[0];

    let newStatus = incident.status;
    let statusChanged = false;

    // Si estaba pendiente o validada, cambia a asignada automáticamente
    if (incident.status === 'pending' || incident.status === 'validated') {
      newStatus = 'assigned';
      statusChanged = true;
    }

    // Actualizar incidencia
    const updateRes = await client.query(`
      UPDATE incidents 
      SET assigned_entity_id = $1, status = $2, updated_at = NOW()
      WHERE id = $3 RETURNING *
    `, [entityId, newStatus, incidentId]);

    // Crear historial
    await client.query(`
      INSERT INTO incident_status_history (incident_id, old_status, new_status, changed_by, note)
      VALUES ($1, $2, $3, $4, $5)
    `, [incidentId, incident.status, newStatus, adminId, `Asignada a: ${entity.name}`]);

    // Notificar a reporter y followers
    const subsRes = await client.query(`
      SELECT DISTINCT u.id 
      FROM users u
      LEFT JOIN incident_follows f ON u.id = f.user_id AND f.incident_id = $1
      LEFT JOIN incidents i ON u.id = i.reporter_id AND i.id = $1
      WHERE (f.user_id IS NOT NULL OR i.reporter_id = u.id)
    `, [incidentId]);
    
    for (const sub of subsRes.rows) {
      await notificationService.createNotification({
        userId: sub.id,
        type: 'assignment',
        title: 'Incidencia Asignada',
        message: `La incidencia "${incident.title}" ha sido asignada a: ${entity.name}`,
        referenceType: 'incident',
        referenceId: incidentId
      });
    }

    // Notificar a usuarios de la entidad
    const entityUsersRes = await client.query('SELECT id FROM users WHERE entity_id = $1 AND is_active = true', [entityId]);
    for (const eu of entityUsersRes.rows) {
      await notificationService.createNotification({
        userId: eu.id,
        type: 'assignment',
        title: 'Nueva asignación',
        message: `Se ha asignado la incidencia "${incident.title}" a su entidad.`,
        referenceType: 'incident',
        referenceId: incidentId
      });
    }

    // Email a la entidad
    if (entity.email) {
      await emailService.sendAssignmentEmail(entity.email, incident.title, incidentId);
    }

    await client.query('COMMIT');

    return {
      incident: updateRes.rows[0],
      entity,
      statusChanged,
      oldStatus: incident.status,
      newStatus
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Cambia el estado de una incidencia desde el panel de admin
 */
const updateIncidentStatusAdmin = async (incidentId, newStatus, adminId, note) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const incRes = await client.query('SELECT status, title, reporter_id FROM incidents WHERE id = $1 FOR UPDATE', [incidentId]);
    if (incRes.rows.length === 0) throw new Error('Incidencia no encontrada');
    
    const oldStatus = incRes.rows[0].status;
    const { title, reporter_id } = incRes.rows[0];

    if (oldStatus === newStatus) {
      throw new Error('El estado es el mismo');
    }

    const updateRes = await client.query(`
      UPDATE incidents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *
    `, [newStatus, incidentId]);

    await client.query(`
      INSERT INTO incident_status_history (incident_id, old_status, new_status, changed_by, note)
      VALUES ($1, $2, $3, $4, $5)
    `, [incidentId, oldStatus, newStatus, adminId, note || null]);

    // Notificar a reporter y followers
    const subsRes = await client.query(`
      SELECT DISTINCT u.id 
      FROM users u
      LEFT JOIN incident_follows f ON u.id = f.user_id AND f.incident_id = $1
      LEFT JOIN incidents i ON u.id = i.reporter_id AND i.id = $1
      WHERE (f.user_id IS NOT NULL OR i.reporter_id = u.id)
    `, [incidentId]);
    
    for (const sub of subsRes.rows) {
      await notificationService.createNotification({
        userId: sub.id,
        type: newStatus === 'resolved' ? 'resolution' : 'status_change',
        title: newStatus === 'resolved' ? 'Incidencia Resuelta' : 'Cambio de Estado',
        message: `El estado de "${title}" ha cambiado a ${newStatus}`,
        referenceType: 'incident',
        referenceId: incidentId
      });
    }

    // Correo al reporter
    const reporterRes = await client.query('SELECT email FROM users WHERE id = $1', [reporter_id]);
    if (reporterRes.rows.length > 0) {
      await emailService.sendStatusChangeEmail(reporterRes.rows[0].email, title, oldStatus, newStatus);
    }

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Gestión de usuarios
 */
const getUsers = async (filters = {}) => {
  const { role, isActive, search, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, email, display_name, role, is_active, bio, entity_id, created_at,
      (SELECT COUNT(*) FROM incidents WHERE reporter_id = users.id) as incident_count
    FROM users WHERE 1=1
  `;
  const values = [];
  let paramIndex = 1;

  if (role) { query += ` AND role = $${paramIndex++}`; values.push(role); }
  if (isActive !== undefined) { query += ` AND is_active = $${paramIndex++}`; values.push(isActive === 'true'); }
  if (search) { 
    query += ` AND (email ILIKE $${paramIndex} OR display_name ILIKE $${paramIndex})`; 
    values.push(`%${search}%`);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  values.push(limit, offset);

  // Count query
  let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
  const countValues = [];
  let countParamIndex = 1;

  if (role) { countQuery += ` AND role = $${countParamIndex++}`; countValues.push(role); }
  if (isActive !== undefined) { countQuery += ` AND is_active = $${countParamIndex++}`; countValues.push(isActive === 'true'); }
  if (search) { 
    countQuery += ` AND (email ILIKE $${countParamIndex} OR display_name ILIKE $${countParamIndex})`; 
    countValues.push(`%${search}%`);
  }

  const [usersRes, countRes] = await Promise.all([
    db.query(query, values),
    db.query(countQuery, countValues)
  ]);

  return {
    users: usersRes.rows,
    total: parseInt(countRes.rows[0].count, 10),
    pages: Math.ceil(parseInt(countRes.rows[0].count, 10) / limit)
  };
};

const updateUserRole = async (userId, newRole) => {
  const res = await db.query(`
    UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, display_name, role
  `, [newRole, userId]);
  if (res.rows.length === 0) throw new Error('Usuario no encontrado');
  return res.rows[0];
};

const toggleUserActive = async (userId) => {
  const res = await db.query(`
    UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, email, is_active
  `, [userId]);
  if (res.rows.length === 0) throw new Error('Usuario no encontrado');
  return res.rows[0];
};

/**
 * Gestión de Entidades Responsables
 */
const getEntities = async () => {
  const res = await db.query('SELECT * FROM responsible_entities ORDER BY name ASC');
  return res.rows;
};

const createEntity = async (data) => {
  const { name, type, email, phone } = data;
  const res = await db.query(`
    INSERT INTO responsible_entities (name, type, email, phone)
    VALUES ($1, $2, $3, $4) RETURNING *
  `, [name, type, email || null, phone || null]);
  return res.rows[0];
};

const updateEntity = async (id, data) => {
  const { name, type, email, phone, isActive } = data;
  const res = await db.query(`
    UPDATE responsible_entities 
    SET name = COALESCE($1, name),
        type = COALESCE($2, type),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
    WHERE id = $6 RETURNING *
  `, [name, type, email, phone, isActive, id]);
  if (res.rows.length === 0) throw new Error('Entidad no encontrada');
  return res.rows[0];
};

const deleteEntity = async (id) => {
  // Soft delete
  await db.query('UPDATE responsible_entities SET is_active = false WHERE id = $1', [id]);
};

module.exports = {
  getDashboardStats,
  getAdminIncidents,
  assignIncidentToEntity,
  updateIncidentStatusAdmin,
  getUsers,
  updateUserRole,
  toggleUserActive,
  getEntities,
  createEntity,
  updateEntity,
  deleteEntity
};
