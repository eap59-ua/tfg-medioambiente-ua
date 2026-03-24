/**
 * Servicio de gestión de fotos — EcoAlerta
 * Upload, thumbnails y almacenamiento local de fotografías de incidencias.
 *
 * @module services/photo.service
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const logger = require('../config/logger');

// Directorio base para uploads
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

/**
 * Intenta cargar sharp para thumbnails. Si no está disponible (Node < 18),
 * se genera un fallback que copia el archivo original.
 */
let sharp;
try {
  sharp = require('sharp');
} catch {
  logger.warn('sharp no disponible — thumbnails se copiarán del original');
  sharp = null;
}

/**
 * Crea los directorios necesarios para una incidencia.
 * @param {string} incidentId
 * @returns {{ photosDir: string, thumbsDir: string }}
 */
const ensureDirectories = (incidentId) => {
  const photosDir = path.join(UPLOADS_DIR, 'incidents', incidentId);
  const thumbsDir = path.join(photosDir, 'thumbs');
  fs.mkdirSync(photosDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });
  return { photosDir, thumbsDir };
};

/**
 * Sube fotos de una incidencia, genera thumbnails y registra en BD.
 * @param {Array} files - Archivos de multer (buffer en memoria)
 * @param {string} incidentId - UUID de la incidencia
 * @returns {Promise<Array>} Fotos insertadas en BD
 */
const uploadPhotos = async (files, incidentId) => {
  if (!files || files.length === 0) {
    return [];
  }

  const { photosDir, thumbsDir } = ensureDirectories(incidentId);
  const photos = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const photoPath = path.join(photosDir, filename);
    const thumbPath = path.join(thumbsDir, filename);

    // Guardar foto original
    fs.writeFileSync(photoPath, file.buffer);

    // Generar thumbnail (300px width)
    if (sharp) {
      try {
        await sharp(file.buffer)
          .resize(300, null, { withoutEnlargement: true })
          .toFile(thumbPath);
      } catch (err) {
        logger.warn(`Error generando thumbnail: ${err.message}`);
        fs.writeFileSync(thumbPath, file.buffer);
      }
    } else {
      fs.writeFileSync(thumbPath, file.buffer);
    }

    // URLs relativas para servir estáticamente
    const photoUrl = `/uploads/incidents/${incidentId}/${filename}`;
    const thumbnailUrl = `/uploads/incidents/${incidentId}/thumbs/${filename}`;

    // Insertar en BD
    const result = await query(
      `INSERT INTO incident_photos (incident_id, photo_url, thumbnail_url, caption, sort_order, file_size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [incidentId, photoUrl, thumbnailUrl, null, i, file.size]
    );

    photos.push(result.rows[0]);
  }

  logger.info(`${photos.length} fotos subidas para incidencia ${incidentId}`);
  return photos;
};

/**
 * Elimina todas las fotos de una incidencia (archivos + registros BD).
 * @param {string} incidentId
 */
const deletePhotos = async (incidentId) => {
  // Eliminar registros de BD
  await query('DELETE FROM incident_photos WHERE incident_id = $1', [incidentId]);

  // Eliminar archivos del disco
  const photosDir = path.join(UPLOADS_DIR, 'incidents', incidentId);
  if (fs.existsSync(photosDir)) {
    fs.rmSync(photosDir, { recursive: true, force: true });
  }

  logger.info(`Fotos eliminadas para incidencia ${incidentId}`);
};

/**
 * Obtiene las fotos de una incidencia.
 * @param {string} incidentId
 * @returns {Promise<Array>}
 */
const getPhotosByIncident = async (incidentId) => {
  const result = await query(
    'SELECT * FROM incident_photos WHERE incident_id = $1 ORDER BY sort_order',
    [incidentId]
  );
  return result.rows;
};

module.exports = {
  uploadPhotos,
  deletePhotos,
  getPhotosByIncident,
  UPLOADS_DIR,
};
