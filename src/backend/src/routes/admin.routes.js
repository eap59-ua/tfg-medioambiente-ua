const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const validators = require('../validators/admin.validator');
const { validateRequest } = require('../middlewares/validation.middleware');

// Todo el panel de admin requiere estar autenticado y ser admin
// Excepción: las entidades podrían tener acceso a ciertas partes, pero aquí definimos rutas 100% admin
router.use(authenticate, requireRole(['admin']));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Incidents
router.get('/incidents', validators.validateAdminIncidentQuery, validateRequest, adminController.getAdminIncidents);
router.put('/incidents/:id/assign', validators.validateAssignIncident, validateRequest, adminController.assignIncident);
router.put('/incidents/:id/status', validators.validateStatusUpdate, validateRequest, adminController.updateIncidentStatus);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', validators.validateRoleUpdate, validateRequest, adminController.updateUserRole);
router.put('/users/:id/toggle-active', adminController.toggleUserActive);

// Entities
router.get('/entities', adminController.getEntities);
router.post('/entities', validators.validateEntityCreate, validateRequest, adminController.createEntity);
router.put('/entities/:id', validators.validateEntityUpdate, validateRequest, adminController.updateEntity);
router.delete('/entities/:id', adminController.deleteEntity);

module.exports = router;
