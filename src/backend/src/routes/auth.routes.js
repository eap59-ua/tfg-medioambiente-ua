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
const { verifyTurnstile, requireCaptchaOnRetry } = require('../middlewares/turnstile.middleware');
const {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateUpdateProfile,
} = require('../validators/auth.validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación (Registro, Login, Sesión)
 * 
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, display_name]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               display_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 * 
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, retorna tokens
 * 
 * /auth/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nuevo acces token generado
 * 
 * /auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *   put:
 *     summary: Actualizar perfil propio
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */

// Rutas públicas (no requieren autenticación)
router.post('/register', verifyTurnstile('register'), validateRegister, authController.register);
router.post('/login', requireCaptchaOnRetry(), validateLogin, authController.login);
router.post('/refresh', validateRefresh, authController.refresh);

// Rutas protegidas (requieren token JWT válido)
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, validateUpdateProfile, authController.updateProfile);

module.exports = router;
