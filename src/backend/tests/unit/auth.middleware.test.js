const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middlewares/auth.middleware');

jest.mock('jsonwebtoken');
jest.mock('../../src/config/logger', () => ({
  warn: jest.fn()
}));

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    process.env.JWT_SECRET = 'test_secret';
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('debería fallar si no hay header authorization', () => {
      authMiddleware.authenticate(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, error: 'Token de autenticación requerido' });
    });

    it('debería fallar si no empieza con Bearer', () => {
      mockReq.headers.authorization = 'InvalidTokenFormat';
      authMiddleware.authenticate(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('debería autenticar si el token es válido', () => {
      mockReq.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user-1' });
      authMiddleware.authenticate(mockReq, mockRes, mockNext);
      expect(mockReq.user.id).toBe('user-1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería fallar si jwt.verify lanza error', () => {
      mockReq.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => { throw new Error('Expired'); });
      authMiddleware.authenticate(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('optionalAuth', () => {
    it('debería parsear el usuario si hay token válido', () => {
      mockReq.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user-1' });
      authMiddleware.optionalAuth(mockReq, mockRes, mockNext);
      expect(mockReq.user.id).toBe('user-1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería ignorar (user=null) si el token es inválido', () => {
      mockReq.headers.authorization = 'Bearer errortoken';
      jwt.verify.mockImplementation(() => { throw new Error('Invalid'); });
      authMiddleware.optionalAuth(mockReq, mockRes, mockNext);
      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería poner user=null si no hay header', () => {
      authMiddleware.optionalAuth(mockReq, mockRes, mockNext);
      expect(mockReq.user).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    const adminMiddleware = authMiddleware.requireRole(['admin', 'entity']);

    it('debería permitir acceso si el rol coincide', () => {
      mockReq.user = { role: 'admin' };
      adminMiddleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería rechazar si no hay req.user', () => {
      adminMiddleware(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('debería rechazar si el rol no coincide', () => {
      mockReq.user = { role: 'citizen' };
      adminMiddleware(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
