/**
 * Servicio de incidencias — EcoAlerta
 * CRUD completo, búsqueda geoespacial, votos, follows, comentarios e historial.
 *
 * @module services/incident.service
 */

const { query } = require('../config/database');
const logger = require('../config/logger');

// Mapeo de severidad a valor numérico para priority_score
const SEVERITY_VALUES = { low: 1, moderate: 2, high: 3, critical: 4 };

// ─── CRUD Principal ─────────────────────────────────────────────────────────

/**
 * Crea una nueva incidencia con geolocalización PostGIS.
 * @param {object} data
 * @returns {Promise<object>} Incidencia creada
 */
const createIncident = async ({ title, description, categoryId, severity, latitude, longitude, isAnonymous, reporterId }) => {
  const severityVal = SEVERITY_VALUES[severity] || 2;

  const result = await query(
    `INSERT INTO incidents
       (title, description, category_id, reporter_id, location, severity, priority_score, is_anonymous)
     VALUES
       ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, $9)
     RETURNING *,
       ST_X(location::geometry) AS longitude,
       ST_Y(location::geometry) AS latitude`,
    [title, description, categoryId, reporterId, longitude, latitude, severity, severityVal * 10, isAnonymous || false]
  );

  const incident = result.rows[0];
  logger.info(`Incidencia creada: ${incident.id} por ${reporterId}`);
  return incident;
};

/**
 * Lista incidencias con paginación y filtros.
 * @param {object} params - { page, limit, status, categoryId, severity, sortBy, order }
 * @returns {Promise<{ incidents: Array, total: number, pages: number }>}
 */
const getIncidents = async ({ page = 1, limit = 20, status, categoryId, severity, sortBy = 'created_at', order = 'desc' }) => {
  const conditions = [];
  const values = [];
  let paramIdx = 1;

  if (status) {
    conditions.push(`i.status = $${paramIdx++}`);
    values.push(status);
  }
  if (categoryId) {
    conditions.push(`i.category_id = $${paramIdx++}`);
    values.push(categoryId);
  }
  if (severity) {
    conditions.push(`i.severity = $${paramIdx++}`);
    values.push(severity);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validar sortBy y order
  const allowedSort = ['created_at', 'priority_score', 'vote_count'];
  const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'created_at';
  const safeOrder = order === 'asc' ? 'ASC' : 'DESC';

  // Si ordenamos por vote_count, necesitamos un subquery
  const orderClause = safeSortBy === 'vote_count'
    ? `ORDER BY vote_count ${safeOrder}, i.created_at DESC`
    : `ORDER BY i.${safeSortBy} ${safeOrder}`;

  // Contar total
  const countResult = await query(
    `SELECT COUNT(*) AS total FROM incidents i ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Obtener incidencias
  const offset = (page - 1) * limit;
  const dataResult = await query(
    `SELECT i.*,
       ST_X(i.location::geometry) AS longitude,
       ST_Y(i.location::geometry) AS latitude,
       c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
       u.display_name AS reporter_name, u.avatar_url AS reporter_avatar,
       re.name AS entity_name,
       COALESCE(v.vote_count, 0) AS vote_count,
       COALESCE(p.photo_count, 0) AS photo_count,
       (SELECT photo_url FROM incident_photos ip WHERE ip.incident_id = i.id ORDER BY sort_order LIMIT 1) AS cover_photo
     FROM incidents i
     LEFT JOIN categories c ON i.category_id = c.id
     LEFT JOIN users u ON i.reporter_id = u.id
     LEFT JOIN responsible_entities re ON i.assigned_entity_id = re.id
     LEFT JOIN (SELECT incident_id, COUNT(*) AS vote_count FROM incident_votes GROUP BY incident_id) v ON v.incident_id = i.id
     LEFT JOIN (SELECT incident_id, COUNT(*) AS photo_count FROM incident_photos GROUP BY incident_id) p ON p.incident_id = i.id
     ${whereClause}
     ${orderClause}
     LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...values, limit, offset]
  );

  return {
    incidents: dataResult.rows,
    total,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Obtiene el detalle completo de una incidencia.
 * @param {string} id - UUID
 * @param {string|null} userId - UUID del usuario que consulta (para saber si votó/sigue)
 * @returns {Promise<object>}
 */
const getIncidentById = async (id, userId = null) => {
  const result = await query(
    `SELECT i.*,
       ST_X(i.location::geometry) AS longitude,
       ST_Y(i.location::geometry) AS latitude,
       c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
       c.description AS category_description,
       u.display_name AS reporter_name, u.avatar_url AS reporter_avatar,
       re.name AS entity_name, re.type AS entity_type,
       COALESCE(v.vote_count, 0) AS vote_count,
       ${userId ? `EXISTS(SELECT 1 FROM incident_votes WHERE incident_id = i.id AND user_id = '${userId}') AS has_voted,
       EXISTS(SELECT 1 FROM incident_follows WHERE incident_id = i.id AND user_id = '${userId}') AS is_following,`
       : 'FALSE AS has_voted, FALSE AS is_following,'}
       COALESCE(cm.comment_count, 0) AS comment_count
     FROM incidents i
     LEFT JOIN categories c ON i.category_id = c.id
     LEFT JOIN users u ON i.reporter_id = u.id
     LEFT JOIN responsible_entities re ON i.assigned_entity_id = re.id
     LEFT JOIN (SELECT incident_id, COUNT(*) AS vote_count FROM incident_votes GROUP BY incident_id) v ON v.incident_id = i.id
     LEFT JOIN (SELECT incident_id, COUNT(*) AS comment_count FROM incident_comments GROUP BY incident_id) cm ON cm.incident_id = i.id
     WHERE i.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Incidencia no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Incrementar view_count
  await query('UPDATE incidents SET view_count = view_count + 1 WHERE id = $1', [id]);

  return result.rows[0];
};

/**
 * Actualiza una incidencia.
 * @param {string} id
 * @param {object} updates
 * @param {object} user - { id, role }
 * @returns {Promise<object>}
 */
const updateIncident = async (id, updates, user) => {
  // Verificar existencia y permisos
  const existing = await query('SELECT reporter_id, status FROM incidents WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    const error = new Error('Incidencia no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const incident = existing.rows[0];

  // Solo autor puede editar si pendiente; admin puede editar siempre
  if (user.role !== 'admin') {
    if (incident.reporter_id !== user.id) {
      const error = new Error('No tienes permiso para editar esta incidencia');
      error.statusCode = 403;
      throw error;
    }
    if (incident.status !== 'pending') {
      const error = new Error('Solo se pueden editar incidencias en estado pendiente');
      error.statusCode = 403;
      throw error;
    }
  }

  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIdx++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIdx++}`);
    values.push(updates.description);
  }
  if (updates.severity !== undefined) {
    fields.push(`severity = $${paramIdx++}`);
    values.push(updates.severity);
  }
  if (updates.categoryId !== undefined) {
    fields.push(`category_id = $${paramIdx++}`);
    values.push(updates.categoryId);
  }

  if (fields.length === 0) {
    return getIncidentById(id);
  }

  values.push(id);
  const result = await query(
    `UPDATE incidents SET ${fields.join(', ')} WHERE id = $${paramIdx}
     RETURNING *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude`,
    values
  );

  logger.info(`Incidencia actualizada: ${id} por ${user.id}`);
  return result.rows[0];
};

/**
 * Elimina una incidencia.
 * @param {string} id
 * @param {object} user - { id, role }
 */
const deleteIncident = async (id, user) => {
  const existing = await query('SELECT reporter_id, status FROM incidents WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    const error = new Error('Incidencia no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const incident = existing.rows[0];
  if (user.role !== 'admin' && incident.reporter_id !== user.id) {
    const error = new Error('No tienes permiso para eliminar esta incidencia');
    error.statusCode = 403;
    throw error;
  }

  await query('DELETE FROM incidents WHERE id = $1', [id]);
  logger.info(`Incidencia eliminada: ${id} por ${user.id}`);
};

/**
 * Busca incidencias cercanas a un punto geográfico.
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusKm - Radio en kilómetros
 * @param {object} filters - { status, categoryId, severity }
 * @returns {Promise<Array>}
 */
const getNearbyIncidents = async (lat, lng, radiusKm = 5, filters = {}) => {
  const radiusMeters = radiusKm * 1000;
  const conditions = [
    `ST_DWithin(i.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`
  ];
  const values = [lng, lat, radiusMeters];
  let paramIdx = 4;

  if (filters.status) {
    conditions.push(`i.status = $${paramIdx++}`);
    values.push(filters.status);
  }
  if (filters.categoryId) {
    conditions.push(`i.category_id = $${paramIdx++}`);
    values.push(filters.categoryId);
  }
  if (filters.severity) {
    conditions.push(`i.severity = $${paramIdx++}`);
    values.push(filters.severity);
  }

  const result = await query(
    `SELECT i.*,
       ST_X(i.location::geometry) AS longitude,
       ST_Y(i.location::geometry) AS latitude,
       ST_Distance(i.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters,
       c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
       COALESCE(v.vote_count, 0) AS vote_count
     FROM incidents i
     LEFT JOIN categories c ON i.category_id = c.id
     LEFT JOIN (SELECT incident_id, COUNT(*) AS vote_count FROM incident_votes GROUP BY incident_id) v ON v.incident_id = i.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY distance_meters ASC
     LIMIT 50`,
    values
  );

  return result.rows;
};

// ─── Social: Votos, Follows, Comentarios ────────────────────────────────────

/**
 * Vota/apoya una incidencia.
 * @param {string} incidentId
 * @param {string} userId
 * @returns {Promise<{ voteCount: number }>}
 */
const voteIncident = async (incidentId, userId) => {
  try {
    await query(
      'INSERT INTO incident_votes (incident_id, user_id) VALUES ($1, $2)',
      [incidentId, userId]
    );
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      const error = new Error('Ya has votado esta incidencia');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }

  // Actualizar priority_score
  await _updatePriorityScore(incidentId);

  const countResult = await query(
    'SELECT COUNT(*) AS count FROM incident_votes WHERE incident_id = $1',
    [incidentId]
  );
  return { voteCount: parseInt(countResult.rows[0].count, 10) };
};

/**
 * Quita el voto de una incidencia.
 * @param {string} incidentId
 * @param {string} userId
 * @returns {Promise<{ voteCount: number }>}
 */
const unvoteIncident = async (incidentId, userId) => {
  const result = await query(
    'DELETE FROM incident_votes WHERE incident_id = $1 AND user_id = $2',
    [incidentId, userId]
  );

  if (result.rowCount === 0) {
    const error = new Error('No has votado esta incidencia');
    error.statusCode = 404;
    throw error;
  }

  await _updatePriorityScore(incidentId);

  const countResult = await query(
    'SELECT COUNT(*) AS count FROM incident_votes WHERE incident_id = $1',
    [incidentId]
  );
  return { voteCount: parseInt(countResult.rows[0].count, 10) };
};

/**
 * Sigue una incidencia.
 * @param {string} incidentId
 * @param {string} userId
 */
const followIncident = async (incidentId, userId) => {
  try {
    await query(
      'INSERT INTO incident_follows (incident_id, user_id) VALUES ($1, $2)',
      [incidentId, userId]
    );
  } catch (err) {
    if (err.code === '23505') {
      const error = new Error('Ya sigues esta incidencia');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Deja de seguir una incidencia.
 * @param {string} incidentId
 * @param {string} userId
 */
const unfollowIncident = async (incidentId, userId) => {
  const result = await query(
    'DELETE FROM incident_follows WHERE incident_id = $1 AND user_id = $2',
    [incidentId, userId]
  );
  if (result.rowCount === 0) {
    const error = new Error('No sigues esta incidencia');
    error.statusCode = 404;
    throw error;
  }
};

/**
 * Añade un comentario a una incidencia.
 * @param {string} incidentId
 * @param {string} userId
 * @param {string} content
 * @param {boolean} isOfficial
 * @param {string|null} parentId
 * @returns {Promise<object>}
 */
const addComment = async (incidentId, userId, content, isOfficial = false, parentId = null) => {
  // Verificar que la incidencia existe
  const incidentCheck = await query('SELECT id FROM incidents WHERE id = $1', [incidentId]);
  if (incidentCheck.rows.length === 0) {
    const error = new Error('Incidencia no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Si tiene parentId, verificar que existe y pertenece a esta incidencia
  if (parentId) {
    const parentCheck = await query(
      'SELECT id, parent_id FROM incident_comments WHERE id = $1 AND incident_id = $2',
      [parentId, incidentId]
    );
    if (parentCheck.rows.length === 0) {
      const error = new Error('Comentario padre no encontrado');
      error.statusCode = 404;
      throw error;
    }
    // Solo 1 nivel de anidación
    if (parentCheck.rows[0].parent_id !== null) {
      const error = new Error('No se permiten respuestas a respuestas (máximo 1 nivel)');
      error.statusCode = 400;
      throw error;
    }
  }

  const result = await query(
    `INSERT INTO incident_comments (incident_id, user_id, content, is_official, parent_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [incidentId, userId, content, isOfficial, parentId]
  );

  // Obtener datos del usuario
  const userResult = await query(
    'SELECT display_name, avatar_url, role FROM users WHERE id = $1',
    [userId]
  );

  return {
    ...result.rows[0],
    user_display_name: userResult.rows[0]?.display_name,
    user_avatar_url: userResult.rows[0]?.avatar_url,
    user_role: userResult.rows[0]?.role,
  };
};

/**
 * Lista comentarios de una incidencia con paginación.
 * @param {string} incidentId
 * @param {{ page: number, limit: number }} params
 * @returns {Promise<{ comments: Array, total: number }>}
 */
const getComments = async (incidentId, { page = 1, limit = 20 } = {}) => {
  const countResult = await query(
    'SELECT COUNT(*) AS total FROM incident_comments WHERE incident_id = $1',
    [incidentId]
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT ic.*,
       u.display_name AS user_display_name,
       u.avatar_url AS user_avatar_url,
       u.role AS user_role
     FROM incident_comments ic
     JOIN users u ON ic.user_id = u.id
     WHERE ic.incident_id = $1
     ORDER BY ic.created_at ASC
     LIMIT $2 OFFSET $3`,
    [incidentId, limit, offset]
  );

  return { comments: result.rows, total };
};

// ─── Estado e historial ─────────────────────────────────────────────────────

/**
 * Cambia el estado de una incidencia y registra en el historial.
 * @param {string} incidentId
 * @param {string} newStatus
 * @param {string} changedBy - UUID del usuario que cambia
 * @param {string|null} note
 * @returns {Promise<object>}
 */
const updateIncidentStatus = async (incidentId, newStatus, changedBy, note = null) => {
  const existing = await query('SELECT id, status FROM incidents WHERE id = $1', [incidentId]);
  if (existing.rows.length === 0) {
    const error = new Error('Incidencia no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = existing.rows[0].status;

  // Actualizar estado
  const updateFields = { status: newStatus };
  if (newStatus === 'resolved') {
    updateFields.resolved_at = new Date();
    updateFields.resolved_by = changedBy;
  }

  const result = await query(
    `UPDATE incidents SET status = $1,
       resolved_at = $2, resolved_by = $3, resolution_note = $4
     WHERE id = $5
     RETURNING *, ST_X(location::geometry) AS longitude, ST_Y(location::geometry) AS latitude`,
    [
      newStatus,
      newStatus === 'resolved' ? new Date() : null,
      newStatus === 'resolved' ? changedBy : null,
      newStatus === 'resolved' ? note : null,
      incidentId,
    ]
  );

  // Registrar en historial
  await query(
    `INSERT INTO incident_status_history (incident_id, old_status, new_status, changed_by, note)
     VALUES ($1, $2, $3, $4, $5)`,
    [incidentId, oldStatus, newStatus, changedBy, note]
  );

  logger.info(`Estado cambiado: ${incidentId} ${oldStatus} → ${newStatus}`);
  return result.rows[0];
};

/**
 * Obtiene el historial de cambios de estado de una incidencia.
 * @param {string} incidentId
 * @returns {Promise<Array>}
 */
const getStatusHistory = async (incidentId) => {
  const result = await query(
    `SELECT ish.*, u.display_name AS changed_by_name
     FROM incident_status_history ish
     LEFT JOIN users u ON ish.changed_by = u.id
     WHERE ish.incident_id = $1
     ORDER BY ish.created_at ASC`,
    [incidentId]
  );
  return result.rows;
};

// ─── Helpers internos ───────────────────────────────────────────────────────

/**
 * Recalcula el priority_score de una incidencia.
 * priority_score = (votos * 10) + (severity_value * 10)
 */
const _updatePriorityScore = async (incidentId) => {
  const result = await query(
    `SELECT i.severity, COALESCE(v.cnt, 0) AS vote_count
     FROM incidents i
     LEFT JOIN (SELECT incident_id, COUNT(*) AS cnt FROM incident_votes WHERE incident_id = $1 GROUP BY incident_id) v
       ON v.incident_id = i.id
     WHERE i.id = $1`,
    [incidentId]
  );

  if (result.rows.length > 0) {
    const { severity, vote_count } = result.rows[0];
    const severityVal = SEVERITY_VALUES[severity] || 2;
    const score = (parseInt(vote_count, 10) * 10) + (severityVal * 10);
    await query('UPDATE incidents SET priority_score = $1 WHERE id = $2', [score, incidentId]);
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getNearbyIncidents,
  voteIncident,
  unvoteIncident,
  followIncident,
  unfollowIncident,
  addComment,
  getComments,
  updateIncidentStatus,
  getStatusHistory,
};
