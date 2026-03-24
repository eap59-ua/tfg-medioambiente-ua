const { notFoundHandler, errorHandler } = require('../../src/middlewares/error.middleware');
const logger = require('../../src/config/logger');

jest.mock('../../src/config/logger', () => ({
  error: jest.fn()
}));

describe('Error Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { originalUrl: '/api/not-found' };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('notFoundHandler', () => {
    it('debería devolver 404', () => {
      notFoundHandler(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recurso no encontrado',
        path: '/api/not-found'
      });
    });
  });

  describe('errorHandler', () => {
    it('debería devolver mensaje de error interno por defecto', () => {
      const err = new Error('Database connection failed');
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      errorHandler(err, mockReq, mockRes, mockNext);

      expect(logger.error).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error interno del servidor'
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('debería devolver mensaje específico si statusCode != 500', () => {
      const err = new Error('Bad Request');
      err.statusCode = 400;

      errorHandler(err, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Bad Request'
      }));
    });

    it('debería devolver stack en modo development', () => {
      const err = new Error('Some Error');
      err.stack = 'stacktrace';
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      errorHandler(err, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        stack: 'stacktrace'
      }));

      process.env.NODE_ENV = originalEnv;
    });
  });
});
