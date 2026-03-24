const adminController = require('../../src/controllers/admin.controller');
const adminService = require('../../src/services/admin.service');
const emailService = require('../../src/services/email.service');
const notificationService = require('../../src/services/notification.service');

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('../../src/services/admin.service');
jest.mock('../../src/services/email.service');
jest.mock('../../src/services/notification.service');

describe('Admin Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 'admin-1' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('debería devolver stats con HTTP 200', async () => {
      adminService.getDashboardStats.mockResolvedValueOnce({ total: 10 });
      await adminController.getDashboardStats(mockReq, mockRes, mockNext);
      expect(adminService.getDashboardStats).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { total: 10 } });
    });
    it('debería propagar errores', async () => {
      adminService.getDashboardStats.mockRejectedValueOnce(new Error('err'));
      await adminController.getDashboardStats(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('getAdminIncidents', () => {
    it('debería devolver incidencias paginadas con HTTP 200', async () => {
      adminService.getAdminIncidents.mockResolvedValueOnce({ incidents: [], total: 0, pages: 1 });
      await adminController.getAdminIncidents(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ data: [], meta: { total: 0, pages: 1 } }));
    });
  });

  describe('assignIncident', () => {
    it('debería asignar incidencia y notificar', async () => {
      mockReq.params.id = 'inc-1';
      mockReq.body.entityId = 'ent-1';
      adminService.assignIncidentToEntity.mockResolvedValueOnce({
        incident: { title: 'Test Inc' },
        entity: { email: 'e@e.com', name: 'Ent Test' }
      });

      await adminController.assignIncident(mockReq, mockRes, mockNext);

      expect(adminService.assignIncidentToEntity).toHaveBeenCalledWith('inc-1', 'ent-1', 'admin-1');
      expect(notificationService.createNotification).toHaveBeenCalled();
      expect(emailService.sendAssignmentEmail).toHaveBeenCalledWith('e@e.com', 'Test Inc', 'inc-1');
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('updateIncidentStatus', () => {
    it('debería actualizar estado', async () => {
      mockReq.params.id = 'inc-1';
      mockReq.body = { status: 'validated', note: 'test' };
      adminService.updateIncidentStatusAdmin.mockResolvedValueOnce({ id: 'inc-1', status: 'validated' });

      await adminController.updateIncidentStatus(mockReq, mockRes, mockNext);

      expect(adminService.updateIncidentStatusAdmin).toHaveBeenCalledWith('inc-1', 'validated', 'admin-1', 'test');
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  // REST of the endpoints (CRUD Users, Entities) mapped briefly:
  describe('Entities CRUD', () => {
    it('debería listar entidades', async () => {
      adminService.getEntities.mockResolvedValueOnce([]);
      await adminController.getEntities(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [] });
    });

    it('debería crear entidad', async () => {
      adminService.createEntity.mockResolvedValueOnce({ id: '1' });
      await adminController.createEntity(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('debería actualizar entidad', async () => {
      mockReq.params.id = '1';
      adminService.updateEntity.mockResolvedValueOnce({ id: '1', name: 'new' });
      await adminController.updateEntity(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('debería eliminar entidad', async () => {
      mockReq.params.id = '1';
      adminService.deleteEntity.mockResolvedValueOnce();
      await adminController.deleteEntity(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Entity deactivated' });
    });
  });

  describe('Users', () => {
    it('debería listar usuarios', async () => {
      adminService.getUsers.mockResolvedValueOnce({ users: [], total: 0, pages: 1 });
      await adminController.getUsers(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
    
    it('debería actualizar rol', async () => {
      mockReq.params.id = '1';
      mockReq.body.role = 'admin';
      adminService.updateUserRole.mockResolvedValueOnce({ id: '1' });
      await adminController.updateUserRole(mockReq, mockRes, mockNext);
      expect(adminService.updateUserRole).toHaveBeenCalledWith('1', 'admin');
    });

    it('debería alternar actividad', async () => {
      mockReq.params.id = '1';
      adminService.toggleUserActive.mockResolvedValueOnce({ id: '1' });
      await adminController.toggleUserActive(mockReq, mockRes, mockNext);
      expect(adminService.toggleUserActive).toHaveBeenCalledWith('1');
    });
  });

});
