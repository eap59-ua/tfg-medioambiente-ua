/**
 * Servicio de cifrado AES-256-GCM — EcoAlerta
 * Cifra/descifra secretos TOTP en reposo.
 *
 * @module services/crypto.service
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recomendados para GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Obtiene la clave de cifrado desde la variable de entorno.
 * @returns {Buffer} Clave de 32 bytes
 */
const getEncryptionKey = () => {
  const keyBase64 = process.env.TOTP_ENCRYPTION_KEY;
  if (!keyBase64) {
    throw new Error('TOTP_ENCRYPTION_KEY no está configurada');
  }
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== 32) {
    throw new Error('TOTP_ENCRYPTION_KEY debe ser de 32 bytes (base64)');
  }
  return key;
};

/**
 * Cifra un texto plano con AES-256-GCM.
 * @param {string} plaintext - Texto a cifrar (ej. secreto TOTP base32)
 * @returns {string} Formato: iv:authTag:ciphertext (todo en base64)
 */
const encryptSecret = (plaintext) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
};

/**
 * Descifra un secreto cifrado con AES-256-GCM.
 * @param {string} encoded - Formato: iv:authTag:ciphertext (base64)
 * @returns {string} Texto plano original
 */
const decryptSecret = (encoded) => {
  const key = getEncryptionKey();
  const [ivBase64, authTagBase64, ciphertext] = encoded.split(':');

  if (!ivBase64 || !authTagBase64 || !ciphertext) {
    throw new Error('Formato de secreto cifrado inválido');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = { encryptSecret, decryptSecret };
