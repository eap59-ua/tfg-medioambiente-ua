const notificationService = require('../../src/services/notification.service');
const db = require('../../src/config/database');

jest.mock('../../src/config/database');
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('crea notificación exitosamente', async () => {
      db.query.mockResolvedValue({
        rows: [{ id: 'notif-1', title: 'Status Changed', is_read: false }]
      });

      const notif = await notificationService.createNotification({
        userId: 'user-1', type: 'status_change', title: 'Status Changed', message: 'Changed'
      });

      expect(notif.title).toBe('Status Changed');
      expect(notif.is_read).toBe(false);
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNotifications', () => {
    it('lista notificaciones paginadas', async () => {
      db.query.mockImplementation((queryStr) => {
        if (queryStr.includes('COUNT(*)')) {
          return Promise.resolve({ rows: [{ count: '5' }] });
        }
        return Promise.resolve({
          rows: [{ id: 'notif-1' }, { id: 'notif-2' }]
        });
      });

      const result = await notificationService.getNotifications('user-1', { page: 1, limit: 10 });
      expect(result.notifications).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.pages).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('marca como leída', async () => {
      db.query.mockResolvedValue({
        rows: [{ id: 'notif-1', is_read: true }]
      });

      const result = await notificationService.markAsRead('notif-1', 'user-1');
      expect(result.is_read).toBe(true);
    });

    it('falla si no se encuentra', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(notificationService.markAsRead('notif-1', 'user-1'))
        .rejects
        .toThrow('Notificación no encontrada o no autorizada');
    });
  });
});
