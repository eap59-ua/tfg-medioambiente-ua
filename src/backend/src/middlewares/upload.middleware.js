/**
 * Middleware de upload de archivos — EcoAlerta
 * Configuración de multer para fotos de incidencias.
 *
 * @module middlewares/upload.middleware
 */

const multer = require('multer');

// Tipos MIME permitidos
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PHOTOS = 5;

/**
 * Filtro de archivos: solo imágenes jpg, png, webp.
 */
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo JPG, PNG y WebP.`);
    error.statusCode = 400;
    cb(error, false);
  }
};

/**
 * Configuración de multer con almacenamiento en memoria.
 * Los buffers se procesan con sharp antes de guardar en disco.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_PHOTOS,
  },
  fileFilter,
});

/**
 * Middleware para upload de fotos (array de hasta 5).
 */
const uploadPhotos = upload.array('photos', MAX_PHOTOS);

/**
 * Wrapper que maneja errores de multer con formato JSON estándar.
 */
const handleUpload = (req, res, next) => {
  uploadPhotos(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'El archivo supera el tamaño máximo de 10MB',
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: `Máximo ${MAX_PHOTOS} fotos por incidencia`,
        });
      }
      return res.status(400).json({
        success: false,
        error: `Error de upload: ${err.message}`,
      });
    }
    if (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message,
      });
    }
    next();
  });
};

module.exports = {
  handleUpload,
  uploadPhotos,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  MAX_PHOTOS,
};
