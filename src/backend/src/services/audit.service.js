/**
 * Servicio de auditoría de seguridad — EcoAlerta
 * Registra eventos de seguridad en la tabla security_audit_log.
 *
 * @module services/audit.service
 */

const { query } = require('../config/database');
const logger = require('../config/logger');

/**
 * Registra un evento de seguridad.
 * @param {string|null} userId - UUID del usuario (puede ser null)
 * @param {string} action - Tipo de acción (2fa_enabled, 2fa_disabled, recovery_used, etc.)
 * @param {object} req - Express request object (para IP y user-agent)
 * @param {object} [metadata] - Información adicional en formato JSON
 */
const logSecurityEvent = async (userId, action, req, metadata = null) => {
  try {
    const ip = req?.ip || req?.connection?.remoteAddress || null;
    const userAgent = req?.headers?.['user-agent'] || null;

    await query(
      `INSERT INTO security_audit_log (user_id, action, ip, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, ip, userAgent, metadata ? JSON.stringify(metadata) : null]
    );

    logger.info(`[AUDIT] ${action} — user: ${userId || 'anonymous'}`);
  } catch (err) {
    // No lanzamos error para no romper el flujo principal
    logger.error(`[AUDIT] Error registrando evento ${action}:`, err.message);
  }
};

module.exports = { logSecurityEvent };
