/**
 * Servicio de autenticación de doble factor (2FA TOTP) — EcoAlerta
 * Genera secretos, verifica tokens TOTP, gestiona códigos de recuperación.
 *
 * @module services/twofa.service
 */

const { TOTP, Secret } = require('otpauth');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/database');
const { encryptSecret, decryptSecret } = require('./crypto.service');
const logger = require('../config/logger');

const TOTP_ISSUER = 'EcoAlerta';
const TOTP_ALGORITHM = 'SHA1';
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;
const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

/**
 * Genera un secreto TOTP y devuelve QR + datos de configuración.
 * NO persiste aún (eso ocurre en enable).
 * @param {string} email - Email del usuario
 * @returns {Promise<{ secret: string, otpauthUrl: string, qrDataUrl: string }>}
 */
const generateSecret = async (email) => {
  const secret = new Secret({ size: 20 }); // 160 bits

  const totp = new TOTP({
    issuer: TOTP_ISSUER,
    label: email,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: secret,
  });

  const otpauthUrl = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
    width: 256,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });

  return {
    secretBase32: secret.base32,
    otpauthUrl,
    qrDataUrl,
  };
};

/**
 * Guarda (o actualiza) el secreto TOTP cifrado para un usuario.
 * @param {string} userId
 * @param {string} secretBase32
 */
const saveSecret = async (userId, secretBase32) => {
  const encrypted = encryptSecret(secretBase32);

  await query(
    `INSERT INTO user_2fa (user_id, secret_encrypted, enabled, created_at)
     VALUES ($1, $2, FALSE, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET secret_encrypted = $2, enabled = FALSE, enabled_at = NULL, last_used_counter = NULL`,
    [userId, encrypted]
  );
};

/**
 * Verifica un código TOTP de 6 dígitos con protección anti-replay.
 * @param {string} userId
 * @param {string} code - Código TOTP de 6 dígitos
 * @returns {Promise<boolean>}
 */
const verifyToken = async (userId, code) => {
  const result = await query(
    'SELECT secret_encrypted, last_used_counter FROM user_2fa WHERE user_id = $1 AND enabled = TRUE',
    [userId]
  );

  if (result.rows.length === 0) return false;

  const { secret_encrypted, last_used_counter } = result.rows[0];
  const secretBase32 = decryptSecret(secret_encrypted);

  const totp = new TOTP({
    issuer: TOTP_ISSUER,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: Secret.fromBase32(secretBase32),
  });

  // Verificar con ventana de ±1 step
  const delta = totp.validate({ token: code, window: 1 });

  if (delta === null) return false;

  // Calcular counter actual para anti-replay
  const counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD) + delta;

  if (last_used_counter !== null && counter <= parseInt(last_used_counter)) {
    logger.warn(`[2FA] Código TOTP reusado detectado para usuario ${userId}`);
    return false;
  }

  // Actualizar último counter usado
  await query(
    'UPDATE user_2fa SET last_used_counter = $1, last_used_at = NOW() WHERE user_id = $2',
    [counter, userId]
  );

  return true;
};

/**
 * Activa 2FA para un usuario (tras verificar el primer código TOTP).
 * @param {string} userId
 */
const enableTwoFA = async (userId) => {
  await query(
    'UPDATE user_2fa SET enabled = TRUE, enabled_at = NOW() WHERE user_id = $1',
    [userId]
  );
};

/**
 * Desactiva 2FA para un usuario.
 * @param {string} userId
 */
const disableTwoFA = async (userId) => {
  await query('DELETE FROM user_2fa WHERE user_id = $1', [userId]);
  await query('DELETE FROM user_recovery_codes WHERE user_id = $1', [userId]);
};

/**
 * Comprueba si un usuario tiene 2FA activo.
 * @param {string} userId
 * @returns {Promise<{ enabled: boolean, enabledAt: string|null }>}
 */
const getStatus = async (userId) => {
  const result = await query(
    'SELECT enabled, enabled_at FROM user_2fa WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return { enabled: false, enabledAt: null };
  }

  // Contar recovery codes restantes
  const codesResult = await query(
    'SELECT COUNT(*) as remaining FROM user_recovery_codes WHERE user_id = $1 AND used = FALSE',
    [userId]
  );

  return {
    enabled: result.rows[0].enabled,
    enabledAt: result.rows[0].enabled_at,
    recoveryCodesRemaining: parseInt(codesResult.rows[0].remaining),
  };
};

/**
 * Genera códigos de recuperación y los guarda hasheados.
 * @param {string} userId
 * @returns {Promise<string[]>} Códigos en texto plano (mostrar SOLO UNA VEZ)
 */
const generateRecoveryCodes = async (userId) => {
  // Borrar códigos antiguos
  await query('DELETE FROM user_recovery_codes WHERE user_id = $1', [userId]);

  const codes = [];
  const inserts = [];

  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    const code = crypto
      .randomBytes(RECOVERY_CODE_LENGTH)
      .toString('hex')
      .slice(0, RECOVERY_CODE_LENGTH)
      .toUpperCase();
    const hash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    codes.push(code);
    inserts.push(
      query(
        'INSERT INTO user_recovery_codes (user_id, code_hash) VALUES ($1, $2)',
        [userId, hash]
      )
    );
  }

  await Promise.all(inserts);

  return codes;
};

/**
 * Consume un código de recuperación.
 * @param {string} userId
 * @param {string} code - Código de recuperación en texto plano
 * @returns {Promise<boolean>}
 */
const consumeRecoveryCode = async (userId, code) => {
  const result = await query(
    'SELECT id, code_hash FROM user_recovery_codes WHERE user_id = $1 AND used = FALSE',
    [userId]
  );

  for (const row of result.rows) {
    const isMatch = await bcrypt.compare(code.toUpperCase(), row.code_hash);
    if (isMatch) {
      await query(
        'UPDATE user_recovery_codes SET used = TRUE, used_at = NOW() WHERE id = $1',
        [row.id]
      );
      return true;
    }
  }

  return false;
};

module.exports = {
  generateSecret,
  saveSecret,
  verifyToken,
  enableTwoFA,
  disableTwoFA,
  getStatus,
  generateRecoveryCodes,
  consumeRecoveryCode,
};
