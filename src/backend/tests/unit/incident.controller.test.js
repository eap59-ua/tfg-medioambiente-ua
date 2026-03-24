jest.mock('node:crypto', () => require('crypto'), { virtual: true });
const incidentController = require('../../src/controllers/incident.controller');
const incidentService = require('../../src/services/incident.service');
const photoService = require('../../src/services/photo.service');
const geocodingService = require('../../src/services/geocoding.service');

// Mock dependencies
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));
jest.mock('../../src/services/incident.service');
jest.mock('../../src/services/photo.service');
jest.mock('../../src/services/geocoding.service');
jest.mock('../../src/config/database', () => ({
  query: jest.fn().mockResolvedValue({}),
}));

describe('Incident Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user-1', role: 'citizen' },
      files: []
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createIncident', () => {
    it('debería crear una incidencia y subir fotos', async () => {
      mockReq.body = { title: 'Test', description: 'desc', categoryId: '1', severity: 'low', latitude: '40', longitude: '-3', isAnonymous: 'false' };
      mockReq.files = [{ buffer: Buffer.from('test') }];
      
      incidentService.createIncident.mockResolvedValueOnce({ id: 'inc-1', title: 'Test' });
      photoService.uploadPhotos.mockResolvedValueOnce([{ id: 'p1' }]);
      geocodingService.reverseGeocode.mockResolvedValueOnce('Calle 123');

      await incidentController.createIncident(mockReq, mockRes, mockNext);

      expect(incidentService.createIncident).toHaveBeenCalled();
      expect(photoService.uploadPhotos).toHaveBeenCalledWith(mockReq.files, 'inc-1');
      expect(geocodingService.reverseGeocode).toHaveBeenCalledWith(40, -3);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 'inc-1', title: 'Test', photos: [{ id: 'p1' }] }
      });
    });

    it('debería propagar errores', async () => {
      incidentService.createIncident.mockRejectedValueOnce(new Error('err'));
      await incidentController.createIncident(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('getIncidents', () => {
    it('debería listar incidencias paginadas', async () => {
      incidentService.getIncidents.mockResolvedValueOnce({ incidents: [], total: 0, pages: 1 });
      await incidentController.getIncidents(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: [],
        meta: { page: 1, limit: 20, total: 0, pages: 1 }
      }));
    });
  });

  describe('getNearbyIncidents', () => {
    it('debería listar incidencias cercanas', async () => {
      mockReq.query = { lat: '40', lng: '-3', radius: '5' };
      incidentService.getNearbyIncidents.mockResolvedValueOnce([]);
      await incidentController.getNearbyIncidents(mockReq, mockRes, mockNext);
      expect(incidentService.getNearbyIncidents).toHaveBeenCalledWith(40, -3, 5, expect.any(Object));
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('getIncidentById', () => {
    it('debería devolver incidencia con fotos', async () => {
      mockReq.params.id = 'inc-1';
      incidentService.getIncidentById.mockResolvedValueOnce({ id: 'inc-1' });
      photoService.getPhotosByIncident.mockResolvedValueOnce([{ id: 'p1' }]);
      await incidentController.getIncidentById(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { id: 'inc-1', photos: [{ id: 'p1' }] } });
    });
  });

  describe('updateIncident', () => {
    it('debería actualizar incidencia', async () => {
      mockReq.params.id = 'inc-1';
      incidentService.updateIncident.mockResolvedValueOnce({ id: 'inc-1', title: 'new' });
      await incidentController.updateIncident(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('deleteIncident', () => {
    it('debería eliminar incidencia', async () => {
      mockReq.params.id = 'inc-1';
      photoService.deletePhotos.mockResolvedValueOnce();
      incidentService.deleteIncident.mockResolvedValueOnce();
      await incidentController.deleteIncident(mockReq, mockRes, mockNext);
      expect(photoService.deletePhotos).toHaveBeenCalledWith('inc-1');
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('getStatusHistory', () => {
    it('debería devolver historial', async () => {
      mockReq.params.id = 'inc-1';
      incidentService.getStatusHistory.mockResolvedValueOnce([]);
      await incidentController.getStatusHistory(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('Social Features', () => {
    it('debería votar incidencia', async () => {
      incidentService.voteIncident.mockResolvedValueOnce({ count: 1 });
      await incidentController.voteIncident(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
    it('debería quitar voto', async () => {
      incidentService.unvoteIncident.mockResolvedValueOnce({ count: 0 });
      await incidentController.unvoteIncident(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
    it('debería seguir incidencia', async () => {
      incidentService.followIncident.mockResolvedValueOnce();
      await incidentController.followIncident(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
    it('debería dejar de seguir', async () => {
      incidentService.unfollowIncident.mockResolvedValueOnce();
      await incidentController.unfollowIncident(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('Comments', () => {
    it('debería añadir comentario', async () => {
      mockReq.params.id = 'inc-1';
      mockReq.body.content = 'test';
      incidentService.addComment.mockResolvedValueOnce({ id: 'c1' });
      await incidentController.addComment(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('debería listar comentarios', async () => {
      incidentService.getComments.mockResolvedValueOnce({ comments: [], total: 0 });
      await incidentController.getComments(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
