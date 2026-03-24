jest.mock('node:crypto', () => require('crypto'), { virtual: true });
const fs = require('fs');
const photoService = require('../../src/services/photo.service');
const { query } = require('../../src/config/database');

jest.mock('fs');
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn()
}));

// Sharp cannot be easily mocked here due to the try-catch in photo.service.js scope,
// but we test the fallback logic or assume standard execution.

describe('Photo Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadPhotos', () => {
    it('debería devolver array vacío si no hay archivos', async () => {
      const result = await photoService.uploadPhotos([], 'incident-1');
      expect(result).toEqual([]);
    });

    it('debería subir fotos e insertarlas en la BD', async () => {
      fs.mkdirSync.mockReturnValue(true);
      fs.writeFileSync.mockReturnValue(true);

      query.mockResolvedValueOnce({
        rows: [{ id: 'photo-1', photo_url: '/url/1.jpg' }]
      });

      const mockFiles = [{
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        size: 1024
      }];

      const result = await photoService.uploadPhotos(mockFiles, 'incident-1');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('photo-1');
      expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
      // Fallback a fs.writeFileSync se llama dos veces por foto (original y thumb) si sharp no se mockea correctamente
      // o 1 vez si sharp funciona
      expect(query).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletePhotos', () => {
    it('debería eliminar registros de bd y archivos si existen', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.rmSync.mockReturnValue(true);
      query.mockResolvedValueOnce({ rowCount: 1 });

      await photoService.deletePhotos('incident-1');
      expect(query).toHaveBeenCalledWith(
        'DELETE FROM incident_photos WHERE incident_id = $1',
        ['incident-1']
      );
      expect(fs.rmSync).toHaveBeenCalled();
    });
  });

  describe('getPhotosByIncident', () => {
    it('debería devolver las fotos ordenadas', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 'p1' }, { id: 'p2' }] });
      const result = await photoService.getPhotosByIncident('incident-1');
      expect(result).toHaveLength(2);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM incident_photos WHERE incident_id = $1 ORDER BY sort_order',
        ['incident-1']
      );
    });
  });
});
