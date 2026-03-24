const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Sistema de notificaciones
 * 
 * /notifications:
 *   get:
 *     summary: Listar notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated notifications
 * 
 * /notifications/read-all:
 *   put:
 *     summary: Marcar todas como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones actualizadas
 * 
 * /notifications/{id}/read:
 *   put:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notificación actualizada
 */

// Todas las notificaciones requieren autenticación
router.use(authenticate);

// Listar mis notificaciones
router.get('/', notificationController.getMyNotifications);

// Marcar todas como leídas
router.put('/read-all', notificationController.markAllAsRead);

// Marcar una como leída
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
