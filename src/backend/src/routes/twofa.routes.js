/**
 * Rutas de 2FA TOTP — EcoAlerta
 * Configuración, verificación y gestión del doble factor de autenticación.
 *
 * @module routes/twofa.routes
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
