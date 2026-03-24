const db = require('../config/database');

/**
 * Crea una notificación
 * @param {Object} data { userId, type, title, message, referenceType, referenceId }
 */
const createNotification = async (data) => {
  const { userId, type, title, message, referenceType, referenceId } = data;
  const query = `
    INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [userId, type, title, message, referenceType || null, referenceId || null];
  const res = await db.query(query, values);
  return res.rows[0];
};

/**
 * Obtener notificaciones para un usuario
 * @param {string} userId UUID
 * @param {Object} options Filtros (unreadOnly, limit, page)
 */
const getNotifications = async (userId, options = {}) => {
  const { unreadOnly = false, limit = 20, page = 1 } = options;
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM notifications WHERE user_id = $1`;
  const values = [userId];
  
  if (unreadOnly) {
    query += ` AND is_read = false`;
  }
  
  query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
  values.push(limit, offset);

  // Get total count
  let countQuery = `SELECT COUNT(*) FROM notifications WHERE user_id = $1`;
  if (unreadOnly) countQuery += ` AND is_read = false`;

  // Get unread count specifically
  const unreadCountQuery = `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`;

  const [notifRes, countRes, unreadRes] = await Promise.all([
    db.query(query, values),
    db.query(countQuery, [userId]),
    db.query(unreadCountQuery, [userId])
  ]);

  return {
    notifications: notifRes.rows,
    total: parseInt(countRes.rows[0].count, 10),
    unreadCount: parseInt(unreadRes.rows[0].count, 10),
    pages: Math.ceil(parseInt(countRes.rows[0].count, 10) / limit)
  };
};

/**
 * Marcar una notificación como leída
 * @param {string} notificationId 
 * @param {string} userId (para verificar propiedad)
 */
const markAsRead = async (notificationId, userId) => {
  const res = await db.query(`
    UPDATE notifications SET is_read = true 
    WHERE id = $1 AND user_id = $2 RETURNING *
  `, [notificationId, userId]);
  
  if (res.rows.length === 0) throw new Error('Notificación no encontrada o no autorizada');
  return res.rows[0];
};

/**
 * Marcar todas las notificaciones de un usuario como leídas
 * @param {string} userId 
 */
const markAllAsRead = async (userId) => {
  const res = await db.query(`
    UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING id
  `, [userId]);
  return { updated: res.rowCount };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead
};
