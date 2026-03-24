const adminService = require('../../src/services/admin.service');
const db = require('../../src/config/database');

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
jest.mock('../../src/services/notification.service');
jest.mock('../../src/services/email.service');
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Admin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('devuelve estructura correcta', async () => {
      db.query.mockImplementation((queryStr) => {
        if (queryStr.includes('FROM incidents') && queryStr.includes('COUNT(*)')) {
          if (queryStr.includes('GROUP BY status')) return Promise.resolve({ rows: [{ status: 'pending', count: '10' }] });
          if (queryStr.includes('GROUP BY severity')) return Promise.resolve({ rows: [{ severity: 'high', count: '5' }] });
          if (queryStr.includes('date_trunc')) return Promise.resolve({ rows: [{ count: '2' }] });
          if (queryStr.includes('JOIN categories')) return Promise.resolve({ rows: [{ name: 'Test', count: '10' }] });
          return Promise.resolve({ rows: [{ count: '100' }] });
        }
        if (queryStr.includes('FROM users')) {
          return Promise.resolve({ rows: [{ count: '50' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const stats = await adminService.getDashboardStats();
      expect(stats).toHaveProperty('totalIncidents', 100);
      expect(stats).toHaveProperty('incidentsByStatus');
      expect(stats).toHaveProperty('activeUsers', 50);
    });
  });

  describe('assignIncidentToEntity', () => {
    it('cambia estado y asigna entidad', async () => {
      const client = {
        query: jest.fn(),
        release: jest.fn(),
      };
      db.connect.mockResolvedValue(client);

      // Mocks for queries inside transaction
      client.query.mockImplementation((queryStr) => {
        if (queryStr.includes('FROM responsible_entities')) return Promise.resolve({ rows: [{ id: 1, name: 'Entity 1', email: 'e@test.com' }] });
        if (queryStr.includes('FROM incidents WHERE id = $1 FOR UPDATE')) return Promise.resolve({ rows: [{ status: 'pending', title: 'Test Inc' }] });
        if (queryStr.includes('UPDATE incidents')) return Promise.resolve({ rows: [{ id: 'inc-1', status: 'assigned' }] });
        if (queryStr.includes('INSERT INTO incident_status_history')) return Promise.resolve({ rows: [] });
        if (queryStr.includes('SELECT DISTINCT u.id')) return Promise.resolve({ rows: [{ id: 'user-1' }] });
        if (queryStr.includes('FROM users WHERE entity_id')) return Promise.resolve({ rows: [{ id: 'ent-user-1' }] });
        return Promise.resolve({ rows: [] });
      });

      const result = await adminService.assignIncidentToEntity('inc-1', 1, 'admin-1');

      expect(result.newStatus).toBe('assigned');
      expect(client.query).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('updateIncidentStatusAdmin', () => {
    it('cambia estado y crea historial', async () => {
      const client = {
        query: jest.fn(),
        release: jest.fn(),
      };
      db.connect.mockResolvedValue(client);

      client.query.mockImplementation((queryStr) => {
        if (queryStr.includes('FOR UPDATE')) return Promise.resolve({ rows: [{ status: 'assigned', title: 'Test', reporter_id: 'rep-1' }] });
        if (queryStr.includes('UPDATE incidents')) return Promise.resolve({ rows: [{ id: 'inc-1', status: 'in_progress' }] });
        if (queryStr.includes('INSERT INTO incident_status_history')) return Promise.resolve({ rows: [] });
        if (queryStr.includes('SELECT DISTINCT u.id')) return Promise.resolve({ rows: [] });
        if (queryStr.includes('FROM users WHERE id')) return Promise.resolve({ rows: [{ email: 'rep@test.com' }] });
        return Promise.resolve({ rows: [] });
      });

      const result = await adminService.updateIncidentStatusAdmin('inc-1', 'in_progress', 'admin-1', 'Nota');
      
      expect(result.status).toBe('in_progress');
      expect(client.query).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('updateUserRole', () => {
    it('cambia rol de usuario', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 'usr-1', role: 'admin' }] });
      const user = await adminService.updateUserRole('usr-1', 'admin');
      expect(user.role).toBe('admin');
    });
  });

  describe('createEntity', () => {
    it('crea entidad responsable', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1, name: 'Ayuntamiento' }] });
      const entity = await adminService.createEntity({ name: 'Ayuntamiento', type: 'municipality' });
      expect(entity.name).toBe('Ayuntamiento');
    });
  });
});
