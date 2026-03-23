/**
 * Middleware de manejo de errores
 */

const logger = require('../config/logger');

/**
 * Ruta no encontrada (404)
 */
const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    error: 'Recurso no encontrado',
    path: req.originalUrl,
  });
};

/**
 * Manejador global de errores
 */
const errorHandler = (err, _req, res, _next) => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFoundHandler, errorHandler };
