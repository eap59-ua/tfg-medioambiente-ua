/**
 * Rutas de 2FA TOTP — EcoAlerta
 * Configuración, verificación y gestión del doble factor de autenticación.
 *
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y Seguridad
 *
 * /auth/2fa/setup:
 *   post:
 *     summary: Iniciar configuración de 2FA
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Secreto TOTP y URI generados
 *
 * /auth/2fa/enable:
 *   post:
 *     summary: Activar 2FA con código
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA activado y códigos de recuperación
 *
 * /auth/2fa/disable:
 *   post:
 *     summary: Desactivar 2FA
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA desactivado
 *
 * /auth/2fa/recovery-codes:
 *   post:
 *     summary: Regenerar códigos de recuperación
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nuevos códigos de recuperación
 *
 * /auth/2fa/status:
 *   get:
 *     summary: Estado del 2FA del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado devuelto
 *
 * /auth/login/2fa/verify:
 *   post:
 *     summary: Verificar código 2FA en login
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Tokens JWT devueltos
 *
 * /auth/login/2fa/recovery:
 *   post:
 *     summary: Login con código de recuperación
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Tokens JWT devueltos
 */

const router = require('express').Router();
const twofaController = require('../controllers/twofa.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

// ─── Rutas de configuración 2FA (requieren autenticación) ────────────────────
router.post('/2fa/setup', authenticate, twofaController.setup);
router.post('/2fa/enable', authenticate, twofaController.enable);
router.post('/2fa/disable', authenticate, twofaController.disable);
router.post('/2fa/recovery-codes', authenticate, twofaController.regenerateRecoveryCodes);
router.get('/2fa/status', authenticate, twofaController.getStatus);

// ─── Rutas de verificación 2FA en login (públicas, usan tempToken) ───────────
router.post('/login/2fa/verify', twofaController.verifyLogin);
router.post('/login/2fa/recovery', twofaController.verifyRecovery);

module.exports = router;
