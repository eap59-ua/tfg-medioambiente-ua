const { handleUpload } = require('../../src/middlewares/upload.middleware');
const multer = require('multer');

jest.mock('multer', () => {
  const m = () => ({
    array: () => (req, res, cb) => {
      if (req.mockError) {
        cb(req.mockError);
      } else {
        cb(null);
      }
    }
  });
  m.memoryStorage = jest.fn();
  m.MulterError = class extends Error {
    constructor(code, field) {
      super(code);
      this.code = code;
      this.field = field;
    }
  };
  return m;
});

describe('Upload Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('handleUpload', () => {
    it('debería continuar si no hay error', () => {
      handleUpload(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería manejar LIMIT_FILE_SIZE', () => {
      mockReq.mockError = new (require('multer').MulterError)('LIMIT_FILE_SIZE');
      handleUpload(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'El archivo supera el tamaño máximo de 10MB'
      }));
    });

    it('debería manejar LIMIT_FILE_COUNT', () => {
      mockReq.mockError = new (require('multer').MulterError)('LIMIT_FILE_COUNT');
      handleUpload(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Máximo 5 fotos por incidencia'
      }));
    });

    it('debería manejar otros Multer errors', () => {
      mockReq.mockError = new (require('multer').MulterError)('UNEXPECTED_FIELD');
      handleUpload(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Error de upload')
      }));
    });

    it('debería manejar errores genéricos', () => {
      const err = new Error('Fallo general');
      err.statusCode = 415;
      mockReq.mockError = err;
      handleUpload(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(415);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Fallo general'
      }));
    });
  });
});
