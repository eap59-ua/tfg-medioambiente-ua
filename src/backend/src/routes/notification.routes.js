const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Todas las notificaciones requieren autenticación
router.use(authenticate);

// Listar mis notificaciones
router.get('/', notificationController.getMyNotifications);

// Marcar todas como leídas
router.put('/read-all', notificationController.markAllAsRead);

// Marcar una como leída
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
