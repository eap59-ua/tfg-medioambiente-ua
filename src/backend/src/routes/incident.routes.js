/**
 * Rutas de incidencias medioambientales
 * GET    /api/v1/incidents          — Listar incidencias (público con filtros)
 * GET    /api/v1/incidents/:id      — Detalle de incidencia
 * POST   /api/v1/incidents          — Crear incidencia (auth requerido)
 * PUT    /api/v1/incidents/:id      — Actualizar incidencia (autor o admin)
 * DELETE /api/v1/incidents/:id      — Eliminar incidencia (autor o admin)
 * GET    /api/v1/incidents/nearby   — Incidencias cercanas (geoespacial)
 */

const router = require('express').Router();
// const incidentController = require('../controllers/incident.controller');
// const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');

// TODO: Implementar en Sprint 2 (Semana 8)

// Placeholder temporal
router.get('/', (_req, res) => {
  res.json({ message: 'Incident routes — pendiente de implementación (Sprint 2)' });
});

module.exports = router;
