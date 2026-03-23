/**
 * Rutas de autenticación
 * POST /api/v1/auth/register — Registro de usuario
 * POST /api/v1/auth/login    — Inicio de sesión
 * POST /api/v1/auth/refresh  — Refrescar token
 * GET  /api/v1/auth/me       — Perfil del usuario autenticado
 */

const router = require('express').Router();
// const authController = require('../controllers/auth.controller');
// const { authenticate } = require('../middlewares/auth.middleware');

// TODO: Implementar en Sprint 1 (Semana 7)
// router.post('/register', authController.register);
// router.post('/login', authController.login);
// router.post('/refresh', authController.refreshToken);
// router.get('/me', authenticate, authController.getProfile);

// Placeholder temporal
router.get('/', (_req, res) => {
  res.json({ message: 'Auth routes — pendiente de implementación (Sprint 1)' });
});

module.exports = router;
