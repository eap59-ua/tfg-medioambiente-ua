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

/**
 * @swagger
 * tags:
 *   name: Incidents
 *   description: Gestión de incidencias medioambientales
 * 
 * /incidents/nearby:
 *   get:
 *     summary: Búsqueda geoespacial de incidencias cercanas
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5000
 *     responses:
 *       200:
 *         description: Lista de incidencias cercanas
 * 
 * /incidents:
 *   get:
 *     summary: Listar incidencias con paginación y filtros
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de incidencias
 *   post:
 *     summary: Crear nueva incidencia (multipart/form-data)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               category_id: { type: integer }
 *               severity: { type: string }
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Incidencia creada
 * 
 * /incidents/{id}:
 *   get:
 *     summary: Obtener detalle de incidencia
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalle de incidencia
 *   put:
 *     summary: Editar incidencia (solo autor o admin)
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Incidencia actualizada
 *   delete:
 *     summary: Eliminar incidencia
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Incidencia eliminada
 * 
 * /incidents/{id}/history:
 *   get:
 *     summary: Historial de estados de la incidencia
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de cambios de estado
 * 
 * /incidents/{id}/comments:
 *   get:
 *     summary: Comentarios de una incidencia
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Comentarios
 *   post:
 *     summary: Añadir comentario
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment_text: { type: string }
 *     responses:
 *       201:
 *         description: Comentario añadido
 * 
 * /incidents/{id}/vote:
 *   post:
 *     summary: Votar incidencia
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Voto registrado
 *   delete:
 *     summary: Quitar voto
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Voto eliminado
 */

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
