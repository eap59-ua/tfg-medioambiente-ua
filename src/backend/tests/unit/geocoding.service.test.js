const https = require('https');
const geocodingService = require('../../src/services/geocoding.service');
const logger = require('../../src/config/logger');

jest.mock('https', () => ({
  get: jest.fn()
}));

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Geocoding Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpiar caché reseteando el Map, aunque es interno, el clearAllMocks() o correr con diferentes params ayuda
  });

  describe('reverseGeocode', () => {
    it('debería devolver una dirección si la API responde correctamente', async () => {
      // Mock de https.get
      const mockResponse = {
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback(JSON.stringify({ display_name: 'Calle Falsa 123' }));
          }
          if (event === 'end') {
            callback();
          }
          return mockResponse;
        })
      };

      const mockReq = {
        on: jest.fn()
      };

      https.get.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockReq;
      });

      const result = await geocodingService.reverseGeocode(40.0, -3.0);
      expect(result).toBe('Calle Falsa 123');
      expect(https.get).toHaveBeenCalled();
    });

    it('debería usar caché en la segunda llamada', async () => {
      // De la prueba anterior, ya está en caché 40.0, -3.0
      https.get.mockClear();
      const result = await geocodingService.reverseGeocode(40.0, -3.0);
      expect(result).toBe('Calle Falsa 123');
      expect(https.get).not.toHaveBeenCalled();
    });

    it('debería devolver null si falla la petición HTTPS (error on req)', async () => {
      const mockReq = {
        on: jest.fn((event, callback) => {
          if (event === 'error') callback(new Error('Network error'));
          return mockReq;
        })
      };

      https.get.mockImplementation((url, options, callback) => {
        return mockReq;
      });

      const result = await geocodingService.reverseGeocode(39.0, -3.0);
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
