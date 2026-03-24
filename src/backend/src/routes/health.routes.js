/**
 * Rutas de health check — verificación del estado del sistema
 */

const router = require('express').Router();
const { query } = require('../config/database');

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Estado del sistema
 * 
 * /health:
 *   get:
 *     summary: Health check básico
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: El servidor está operativo
 */
router.get('/', async (_req, res) => {
  try {
    const dbResult = await query('SELECT NOW() as now');
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        time: dbResult.rows[0].now,
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'error',
      database: { connected: false, error: error.message },
    });
  }
});

module.exports = router;
