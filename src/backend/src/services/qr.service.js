/**
 * Servicio de generación de códigos QR — EcoAlerta
 * Genera QR codes como PNG para compartir incidencias y entidades.
 *
 * @module services/qr.service
 */

const QRCode = require('qrcode');
const logger = require('../config/logger');

// Caché simple en memoria con TTL
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora
const MAX_CACHE_SIZE = 1000;

/**
 * Limpia entradas expiradas del caché.
 */
const cleanCache = () => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
};

/**
 * Genera un QR code como buffer PNG.
 * @param {string} url - URL a codificar
 * @param {Object} [opts] - Opciones
 * @param {number} [opts.size=256] - Tamaño en píxeles
 * @param {number} [opts.margin=2] - Margen
 * @returns {Promise<Buffer>} Buffer PNG del QR
 */
const generateQR = async (url, opts = {}) => {
  const { size = 256, margin = 2 } = opts;
  const cacheKey = `${url}:${size}:${margin}`;

  // Revisar caché
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.buffer;
  }

  // Limpiar caché si está lleno
  if (cache.size >= MAX_CACHE_SIZE) {
    cleanCache();
    // Si sigue lleno, borrar el más antiguo
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
  }

  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: size,
    margin: margin,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });

  cache.set(cacheKey, { buffer, timestamp: Date.now() });

  logger.debug(`QR generado para: ${url}`);

  return buffer;
};

module.exports = { generateQR };
