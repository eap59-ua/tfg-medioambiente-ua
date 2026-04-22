/**
 * Middleware de Cloudflare Turnstile — EcoAlerta
 * Verificación CAPTCHA para formularios públicos.
 *
 * @module middlewares/turnstile.middleware
 */

const { verifyTurnstileToken } = require('../services/turnstile.service');
const { query } = require('../config/database');

/**
 * Middleware genérico que verifica el token Turnstile del body.
 * @param {string} action - Nombre de la acción para logging
 * @returns {Function} Middleware Express
 */
const verifyTurnstile = (action) => {
  return async (req, res, next) => {
    const token = req.body.turnstileToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token de verificación CAPTCHA requerido',
        code: 'CAPTCHA_REQUIRED',
      });
    }

    const ip = req.ip || req.connection?.remoteAddress;
    const result = await verifyTurnstileToken(token, ip, action);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Verificación CAPTCHA fallida. Inténtalo de nuevo.',
        code: 'CAPTCHA_FAILED',
      });
    }

    next();
  };
};

/**
 * Ventana de tiempo para contar intentos fallidos (15 minutos).
 */
const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_BEFORE_CAPTCHA = 3;

/**
 * Middleware específico para login que exige CAPTCHA tras N intentos fallidos.
 * Comprueba la tabla users por email. Si el usuario tiene >= 3 intentos
 * fallidos en los últimos 15 min, exige un token Turnstile.
 */
const requireCaptchaOnRetry = () => {
  return async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next();

    try {
      const result = await query(
        'SELECT failed_login_attempts, failed_login_window_start FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        // Usuario no existe — dejamos que el controller maneje el error
        return next();
      }

      const user = result.rows[0];
      const windowStart = user.failed_login_window_start
        ? new Date(user.failed_login_window_start).getTime()
        : 0;
      const now = Date.now();

      // Si estamos dentro de la ventana y hay suficientes intentos fallidos
      if (
        user.failed_login_attempts >= MAX_ATTEMPTS_BEFORE_CAPTCHA &&
        (now - windowStart) < FAILED_LOGIN_WINDOW_MS
      ) {
        const token = req.body.turnstileToken;

        if (!token) {
          return res.status(400).json({
            success: false,
            error: 'Demasiados intentos fallidos. Completa la verificación CAPTCHA.',
            code: 'CAPTCHA_REQUIRED',
            captchaRequired: true,
          });
        }

        const ip = req.ip || req.connection?.remoteAddress;
        const verification = await verifyTurnstileToken(token, ip, 'login_retry');

        if (!verification.success) {
          return res.status(400).json({
            success: false,
            error: 'Verificación CAPTCHA fallida. Inténtalo de nuevo.',
            code: 'CAPTCHA_FAILED',
            captchaRequired: true,
          });
        }
      }

      next();
    } catch (err) {
      // Si falla la consulta, no bloqueamos el login
      next();
    }
  };
};

module.exports = { verifyTurnstile, requireCaptchaOnRetry };
