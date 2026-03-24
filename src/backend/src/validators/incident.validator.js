/**
 * Validadores de incidencias — EcoAlerta
 * Reglas de validación con express-validator.
 *
 * @module validators/incident.validator
 */

const { body, query: queryValidator, validationResult } = require('express-validator');

/**
 * Middleware que comprueba errores de validación y responde 400.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/**
 * Validación para crear incidencia.
 */
const validateCreateIncident = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ min: 5, max: 200 }).withMessage('El título debe tener entre 5 y 200 caracteres'),

  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ min: 10, max: 5000 }).withMessage('La descripción debe tener entre 10 y 5000 caracteres'),

  body('categoryId')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isInt({ min: 1 }).withMessage('La categoría debe ser un número válido'),

  body('severity')
    .notEmpty().withMessage('La severidad es obligatoria')
    .isIn(['low', 'moderate', 'high', 'critical']).withMessage('Severidad inválida'),

  body('latitude')
    .notEmpty().withMessage('La latitud es obligatoria')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),

  body('longitude')
    .notEmpty().withMessage('La longitud es obligatoria')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),

  body('isAnonymous')
    .optional()
    .isBoolean().withMessage('isAnonymous debe ser booleano'),

  handleValidationErrors,
];

/**
 * Validación para actualizar incidencia.
 */
const validateUpdateIncident = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('El título debe tener entre 5 y 200 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('La descripción debe tener entre 10 y 5000 caracteres'),

  body('severity')
    .optional()
    .isIn(['low', 'moderate', 'high', 'critical']).withMessage('Severidad inválida'),

  body('categoryId')
    .optional()
    .isInt({ min: 1 }).withMessage('La categoría debe ser un número válido'),

  handleValidationErrors,
];

/**
 * Validación para añadir comentario.
 */
const validateAddComment = [
  body('content')
    .trim()
    .notEmpty().withMessage('El contenido es obligatorio')
    .isLength({ min: 1, max: 2000 }).withMessage('El comentario debe tener entre 1 y 2000 caracteres'),

  body('parentId')
    .optional()
    .isUUID().withMessage('parentId debe ser un UUID válido'),

  handleValidationErrors,
];

/**
 * Validación de parámetros de query para listar incidencias.
 */
const validateQueryParams = [
  queryValidator('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número positivo')
    .toInt(),

  queryValidator('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('El límite debe ser entre 1 y 50')
    .toInt(),

  queryValidator('status')
    .optional()
    .isIn(['pending', 'validated', 'assigned', 'in_progress', 'resolved', 'rejected', 'duplicate'])
    .withMessage('Estado inválido'),

  queryValidator('categoryId')
    .optional()
    .isInt({ min: 1 }).withMessage('categoryId debe ser un número')
    .toInt(),

  queryValidator('severity')
    .optional()
    .isIn(['low', 'moderate', 'high', 'critical'])
    .withMessage('Severidad inválida'),

  queryValidator('sortBy')
    .optional()
    .isIn(['created_at', 'priority_score', 'vote_count'])
    .withMessage('Ordenación inválida'),

  queryValidator('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Dirección de orden inválida'),

  handleValidationErrors,
];

/**
 * Validación de parámetros para búsqueda nearby.
 */
const validateNearbyParams = [
  queryValidator('lat')
    .notEmpty().withMessage('La latitud es obligatoria')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida')
    .toFloat(),

  queryValidator('lng')
    .notEmpty().withMessage('La longitud es obligatoria')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida')
    .toFloat(),

  queryValidator('radius')
    .optional()
    .isFloat({ min: 0.1, max: 50 }).withMessage('Radio debe ser entre 0.1 y 50 km')
    .toFloat(),

  handleValidationErrors,
];

module.exports = {
  validateCreateIncident,
  validateUpdateIncident,
  validateAddComment,
  validateQueryParams,
  validateNearbyParams,
  handleValidationErrors,
};
