const { body, query, param } = require('express-validator');

exports.validateAdminIncidentQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isString(),
  query('severity').optional().isString(),
];

exports.validateAssignIncident = [
  param('id').isString().isLength({ min: 36, max: 36 }).withMessage('El ID de la incidencia debe ser UUID'),
  body('entityId').isString().isLength({ min: 36, max: 36 }).withMessage('Requerido entityId válido')
];

exports.validateStatusUpdate = [
  param('id').isString().isLength({ min: 36, max: 36 }).withMessage('ID debe ser UUID'),
  body('status').isIn(['pending', 'validated', 'assigned', 'in_progress', 'resolved', 'rejected', 'duplicate'])
    .withMessage('Estado inválido')
];

exports.validateRoleUpdate = [
  param('id').isString().isLength({ min: 36, max: 36 }),
  body('role').isIn(['citizen', 'entity', 'moderator', 'admin']).withMessage('Rol inválido')
];

exports.validateEntityCreate = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('type').trim().notEmpty()
];

exports.validateEntityUpdate = [
  param('id').isString().isLength({ min: 36, max: 36 }),
  body('name').optional().trim().notEmpty(),
  body('isActive').optional().isBoolean()
];
