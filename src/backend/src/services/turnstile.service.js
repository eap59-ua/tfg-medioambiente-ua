/**
 * Servicio de verificación Cloudflare Turnstile — EcoAlerta
 * Valida tokens CAPTCHA contra la API de Cloudflare.
 *
 * @module services/turnstile.service
 */

const logger = require('../config/logger');

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifica un token de Cloudflare Turnstile contra la API de Cloudflare.
 * @param {string} token - Token generado por el widget Turnstile en el frontend
 * @param {string} ip - IP del cliente
 * @param {string} action - Nombre de la acción (register, login, password_reset)
 * @returns {Promise<{ success: boolean, errorCodes?: string[] }>}
 */
const verifyTurnstileToken = async (token, ip, action) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    logger.warn('TURNSTILE_SECRET_KEY no configurada — saltando verificación en desarrollo');
    return { success: true };
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      logger.warn(`Turnstile verification failed [${action}]: ${JSON.stringify(data['error-codes'])}`);
    }

    return {
      success: data.success,
      errorCodes: data['error-codes'] || [],
    };
  } catch (err) {
    logger.error(`Turnstile verification network error [${action}]:`, err.message);
    // En caso de error de red, dejamos pasar para no bloquear al usuario
    // por un problema de Cloudflare
    return { success: true };
  }
};

module.exports = { verifyTurnstileToken };
