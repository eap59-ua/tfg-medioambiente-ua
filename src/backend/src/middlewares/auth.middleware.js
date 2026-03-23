/**
 * Middleware de autenticación JWT — EcoAlerta
 * Funciones para verificar tokens y controlar acceso por roles.
 *
 * @module middlewares/auth.middleware
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Verificar token JWT obligatorio.
 * Extrae el payload y lo adjunta a req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Token inválido: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado',
    });
  }
};

/**
 * Permitir acceso anónimo (req.user será null si no hay token).
 * Útil para endpoints que permiten lectura pública.
 */
const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

/**
 * Middleware genérico para requerir uno o más roles.
 * Uso: requireRole(['admin', 'entity'])
 * @param {string[]} roles - Array de roles permitidos
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acceso restringido. Roles permitidos: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

/**
 * Requerir rol de administrador.
 */
const requireAdmin = requireRole(['admin']);

/**
 * Requerir rol de entidad responsable.
 */
const requireEntity = requireRole(['entity']);

/**
 * Requerir rol de administrador o entidad.
 */
const requireAdminOrEntity = requireRole(['admin', 'entity']);

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireEntity,
  requireAdminOrEntity,
};
