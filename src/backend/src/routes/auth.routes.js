/**
 * Rutas de autenticación — EcoAlerta
 * POST /api/v1/auth/register — Registro de usuario
 * POST /api/v1/auth/login    — Inicio de sesión
 * POST /api/v1/auth/refresh  — Refrescar token
 * GET  /api/v1/auth/me       — Perfil del usuario autenticado
 * PUT  /api/v1/auth/me       — Actualizar perfil
 */

const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateUpdateProfile,
} = require('../validators/auth.validator');

// Rutas públicas (no requieren autenticación)
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', validateRefresh, authController.refresh);

// Rutas protegidas (requieren token JWT válido)
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, validateUpdateProfile, authController.updateProfile);

module.exports = router;
