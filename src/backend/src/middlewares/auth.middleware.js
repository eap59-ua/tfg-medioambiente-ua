/**
 * Middleware de autenticación JWT
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Verificar token JWT obligatorio
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
 * Permitir acceso anónimo (req.user será null si no hay token)
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
 * Requerir rol de administrador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso restringido a administradores',
    });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin };
