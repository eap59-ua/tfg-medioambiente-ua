/**
 * Controlador de incidencias — EcoAlerta
 * Endpoints REST para CRUD, social features y búsqueda geoespacial.
 *
 * @module controllers/incident.controller
 */

const incidentService = require('../services/incident.service');
const photoService = require('../services/photo.service');
const geocodingService = require('../services/geocoding.service');
const qrService = require('../services/qr.service');
const logger = require('../config/logger');

/**
 * POST /api/v1/incidents
 * Crea una nueva incidencia con fotos y geolocalización.
 */
const createIncident = async (req, res, next) => {
  try {
    const { title, description, categoryId, severity, latitude, longitude, isAnonymous } = req.body;

    // 1. Crear incidencia en BD con PostGIS
    const incident = await incidentService.createIncident({
      title,
      description,
      categoryId: parseInt(categoryId, 10),
      severity,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      reporterId: req.user.id,
    });

    // 2. Subir fotos si existen
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = await photoService.uploadPhotos(req.files, incident.id);
    }

    // 3. Geocodificación inversa (async, no bloquea)
    geocodingService.reverseGeocode(parseFloat(latitude), parseFloat(longitude))
      .then(async (address) => {
        if (address) {
          const { query: dbQuery } = require('../config/database');
          await dbQuery('UPDATE incidents SET address = $1 WHERE id = $2', [address, incident.id]);
        }
      })
      .catch((err) => logger.warn(`Geocoding falló para ${incident.id}: ${err.message}`));

    res.status(201).json({
      success: true,
      data: { ...incident, photos },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/incidents
 * Lista incidencias con paginación y filtros.
 */
const getIncidents = async (req, res, next) => {
  try {
    const { page, limit, status, categoryId, severity, sortBy, order } = req.query;

    const result = await incidentService.getIncidents({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      status,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      severity,
      sortBy,
      order,
    });

    res.status(200).json({
      success: true,
      data: result.incidents,
      meta: {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/incidents/nearby
 * Busca incidencias cercanas a un punto geográfico.
 */
const getNearbyIncidents = async (req, res, next) => {
  try {
    const { lat, lng, radius, status, categoryId, severity } = req.query;

    const incidents = await incidentService.getNearbyIncidents(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius) || 5,
      { status, categoryId: categoryId ? parseInt(categoryId, 10) : undefined, severity }
    );

    res.status(200).json({
      success: true,
      data: incidents,
      meta: { total: incidents.length, radius: parseFloat(radius) || 5, unit: 'km' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/incidents/:id
 * Detalle completo de una incidencia.
 */
const getIncidentById = async (req, res, next) => {
  try {
    const incident = await incidentService.getIncidentById(
      req.params.id,
      req.user?.id || null
    );

    // Obtener fotos
    const photos = await photoService.getPhotosByIncident(req.params.id);

    res.status(200).json({
      success: true,
      data: { ...incident, photos },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/incidents/:id
 * Actualiza una incidencia (autor si pending, admin siempre).
 */
const updateIncident = async (req, res, next) => {
  try {
    const { title, description, severity, categoryId } = req.body;
    const incident = await incidentService.updateIncident(
      req.params.id,
      { title, description, severity, categoryId },
      req.user
    );

    res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/incidents/:id
 * Elimina una incidencia (autor o admin).
 */
const deleteIncident = async (req, res, next) => {
  try {
    // Eliminar fotos primero
    await photoService.deletePhotos(req.params.id);
    // Eliminar incidencia (cascade borra comments, votes, follows, history)
    await incidentService.deleteIncident(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: { message: 'Incidencia eliminada correctamente' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/incidents/:id/history
 * Historial de cambios de estado.
 */
const getStatusHistory = async (req, res, next) => {
  try {
    const history = await incidentService.getStatusHistory(req.params.id);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/incidents/:id/vote
 */
const voteIncident = async (req, res, next) => {
  try {
    const result = await incidentService.voteIncident(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/incidents/:id/vote
 */
const unvoteIncident = async (req, res, next) => {
  try {
    const result = await incidentService.unvoteIncident(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/incidents/:id/follow
 */
const followIncident = async (req, res, next) => {
  try {
    await incidentService.followIncident(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { message: 'Ahora sigues esta incidencia' } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/incidents/:id/follow
 */
const unfollowIncident = async (req, res, next) => {
  try {
    await incidentService.unfollowIncident(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: { message: 'Has dejado de seguir esta incidencia' } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/incidents/:id/comments
 */
const addComment = async (req, res, next) => {
  try {
    const { content, parentId } = req.body;
    const isOfficial = ['admin', 'entity'].includes(req.user.role);

    const comment = await incidentService.addComment(
      req.params.id,
      req.user.id,
      content,
      isOfficial,
      parentId || null
    );

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/incidents/:id/comments
 */
const getComments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await incidentService.getComments(req.params.id, {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });

    res.status(200).json({
      success: true,
      data: result.comments,
      meta: { total: result.total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/incidents/:id/qr
 * Genera un código QR PNG para compartir la incidencia.
 */
const getIncidentQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const size = parseInt(req.query.size, 10) || 256;
    const margin = parseInt(req.query.margin, 10) || 2;

    // Verificar que la incidencia existe
    const incident = await incidentService.getIncidentById(id, null);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incidencia no encontrada' });
    }

    // Verificar visibilidad (rechazar si rejected o eliminada)
    if (incident.status === 'rejected') {
      return res.status(403).json({ success: false, error: 'Incidencia no disponible para compartir' });
    }

    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const incidentUrl = `${frontendUrl}/incidents/${id}`;

    const qrBuffer = await qrService.generateQR(incidentUrl, { size, margin });

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
  createIncident,
  getIncidents,
  getNearbyIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getStatusHistory,
  voteIncident,
  unvoteIncident,
  followIncident,
  unfollowIncident,
  addComment,
  getComments,
  getIncidentQR,
};
