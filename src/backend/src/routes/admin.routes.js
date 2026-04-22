const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const validators = require('../validators/admin.validator');
const { validateRequest } = require('../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Rutas de administración (requieren rol admin/entity)
 * 
 * /admin/dashboard:
 *   get:
 *     summary: Obtener estadísticas del dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas
 * 
 * /admin/incidents:
 *   get:
 *     summary: Listado administrativo de incidencias
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de incidencias
 * 
 * /admin/incidents/{id}/assign:
 *   put:
 *     summary: Asignar entidad responsable a incidencia
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entity_id: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Asignación exitosa
 * 
 * /admin/incidents/{id}/status:
 *   put:
 *     summary: Cambiar estado desde admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Estado actualizado
 * 
 * /admin/users:
 *   get:
 *     summary: Listar usuarios
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 * 
 * /admin/entities:
 *   get:
 *     summary: Listar entidades
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de entidades
 *   post:
 *     summary: Crear entidad
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Entity'
 *     responses:
 *       201:
 *         description: Entidad creada
 */

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

// 2FA Admin Reset (Sprint 6)
const twofaController = require('../controllers/twofa.controller');
router.post('/users/:id/2fa/reset', twofaController.adminReset);

module.exports = router;
