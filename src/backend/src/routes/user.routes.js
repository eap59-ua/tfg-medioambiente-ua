/**
 * Rutas de usuarios
 * GET    /api/v1/users/:id          — Perfil público de usuario
 * PUT    /api/v1/users/:id          — Actualizar perfil (propio)
 * GET    /api/v1/users/:id/incidents — Incidencias de un usuario
 */

const router = require('express').Router();

// TODO: Implementar en Sprint 2-3

router.get('/', (_req, res) => {
  res.json({ message: 'User routes — pendiente de implementación' });
});

module.exports = router;
