/**
 * Rutas de incidencias medioambientales — EcoAlerta
 * CRUD, búsqueda geoespacial, votos, follows, comentarios.
 *
 * Endpoints:
 * GET    /api/v1/incidents           — Listar (público, paginado, filtros)
 * GET    /api/v1/incidents/nearby    — Búsqueda geoespacial (público)
 * GET    /api/v1/incidents/:id       — Detalle (público)
 * POST   /api/v1/incidents           — Crear (auth required, multipart)
 * PUT    /api/v1/incidents/:id       — Actualizar (autor o admin)
 * DELETE /api/v1/incidents/:id       — Eliminar (autor o admin)
 * GET    /api/v1/incidents/:id/history  — Historial de estados
 * POST   /api/v1/incidents/:id/vote    — Votar
 * DELETE /api/v1/incidents/:id/vote    — Quitar voto
 * POST   /api/v1/incidents/:id/follow  — Seguir
 * DELETE /api/v1/incidents/:id/follow  — Dejar de seguir
 * POST   /api/v1/incidents/:id/comments — Comentar
 * GET    /api/v1/incidents/:id/comments — Ver comentarios
 */

const router = require('express').Router();
const incidentController = require('../controllers/incident.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { handleUpload } = require('../middlewares/upload.middleware');
const {
  validateCreateIncident,
  validateUpdateIncident,
  validateAddComment,
  validateQueryParams,
  validateNearbyParams,
} = require('../validators/incident.validator');

// ─── Rutas públicas (con optionalAuth para features sociales) ───────────────

// IMPORTANTE: /nearby ANTES de /:id para que Express no confunda "nearby" con UUID
router.get('/nearby', optionalAuth, validateNearbyParams, incidentController.getNearbyIncidents);
router.get('/', optionalAuth, validateQueryParams, incidentController.getIncidents);
router.get('/:id', optionalAuth, incidentController.getIncidentById);
router.get('/:id/history', optionalAuth, incidentController.getStatusHistory);
router.get('/:id/comments', optionalAuth, incidentController.getComments);

// ─── Rutas protegidas (requieren autenticación) ─────────────────────────────

router.post('/', authenticate, handleUpload, validateCreateIncident, incidentController.createIncident);
router.put('/:id', authenticate, validateUpdateIncident, incidentController.updateIncident);
router.delete('/:id', authenticate, incidentController.deleteIncident);

// Social
router.post('/:id/vote', authenticate, incidentController.voteIncident);
router.delete('/:id/vote', authenticate, incidentController.unvoteIncident);
router.post('/:id/follow', authenticate, incidentController.followIncident);
router.delete('/:id/follow', authenticate, incidentController.unfollowIncident);
router.post('/:id/comments', authenticate, validateAddComment, incidentController.addComment);

module.exports = router;
