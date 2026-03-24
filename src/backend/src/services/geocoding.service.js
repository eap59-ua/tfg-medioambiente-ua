/**
 * Servicio de geocodificación inversa — EcoAlerta
 * Convierte coordenadas GPS en direcciones legibles usando Nominatim/OpenStreetMap.
 *
 * @module services/geocoding.service
 */

const https = require('https');
const logger = require('../config/logger');

// Caché simple en memoria para evitar requests duplicados y respetar rate limit
const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Realiza una petición HTTPS GET y devuelve el body como string.
 * @param {string} url
 * @returns {Promise<string>}
 */
const httpsGet = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'EcoAlerta/1.0 (TFG Universidad de Alicante)' },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
};

/**
 * Geocodificación inversa: coordenadas → dirección legible.
 * Usa Nominatim OpenStreetMap (gratuito, sin API key).
 * Cachea resultados para respetar el TOS (1 req/seg máximo).
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string|null>} Dirección o null si falla
 */
const reverseGeocode = async (latitude, longitude) => {
  // Redondear para clave de caché (precisión ~11m)
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

  // Verificar caché
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return cached.address;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const body = await httpsGet(url);
    const data = JSON.parse(body);

    const address = data.display_name || null;

    // Guardar en caché
    cache.set(cacheKey, { address, timestamp: Date.now() });

    logger.debug(`Geocodificación: (${latitude}, ${longitude}) → ${address}`);
    return address;
  } catch (error) {
    logger.warn(`Error en geocodificación inversa: ${error.message}`);
    return null;
  }
};

module.exports = {
  reverseGeocode,
};
