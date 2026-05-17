const qrService = require('../services/qr.service');
const { query } = require('../config/database');

/**
 * GET /api/v1/entities/:id/qr
 * Genera un código QR PNG para el perfil público de la entidad.
 */
const getEntityQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const size = parseInt(req.query.size, 10) || 256;
    const margin = parseInt(req.query.margin, 10) || 2;

    // Verificar que la entidad existe
    const result = await query('SELECT id, name FROM entities WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Entidad no encontrada' });
    }

    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const entityUrl = `${frontendUrl}/profile/${id}`;

    const qrBuffer = await qrService.generateQR(entityUrl, { size, margin });

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': qrBuffer.length,
      'Cache-Control': 'public, max-age=3600',
    });
    res.send(qrBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEntityQR,
};
