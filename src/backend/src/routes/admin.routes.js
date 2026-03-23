/**
 * Rutas de administración
 * GET    /api/v1/admin/dashboard    — Estadísticas generales
 * GET    /api/v1/admin/incidents    — Gestión de incidencias (filtros avanzados)
 * PUT    /api/v1/admin/incidents/:id/status — Cambiar estado de incidencia
 * GET    /api/v1/admin/users        — Listar usuarios
 */

const router = require('express').Router();
// const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// TODO: Implementar en Sprint 4 (Semana 10)

router.get('/', (_req, res) => {
  res.json({ message: 'Admin routes — pendiente de implementación (Sprint 4)' });
});

module.exports = router;
