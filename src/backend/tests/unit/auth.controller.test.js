const authController = require('../../src/controllers/auth.controller');
const authService = require('../../src/services/auth.service');

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('../../src/services/auth.service');

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 'test-user-id' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar y devolver HTTP 201', async () => {
      mockReq.body = { email: 'a@a.com', password: '123', displayName: 'A' };
      authService.registerUser.mockResolvedValueOnce({ token: 'abc' });

      await authController.register(mockReq, mockRes, mockNext);

      expect(authService.registerUser).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { token: 'abc' } });
    });

    it('debería propagar errores al middleware (next)', async () => {
      const err = new Error('Test Error');
      authService.registerUser.mockRejectedValueOnce(err);

      await authController.register(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('login', () => {
    it('debería loguear y devolver HTTP 200', async () => {
      mockReq.body = { email: 'a@a.com', password: '123' };
      authService.loginUser.mockResolvedValueOnce({ token: 'abc' });

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.loginUser).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debería propagar errores', async () => {
      const err = new Error('Test Error');
      authService.loginUser.mockRejectedValueOnce(err);
      await authController.login(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('refresh', () => {
    it('debería refrescar token y devolver HTTP 200', async () => {
      mockReq.body = { refreshToken: 'rt' };
      authService.refreshAccessToken.mockResolvedValueOnce({ token: 'abc' });

      await authController.refresh(mockReq, mockRes, mockNext);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith('rt');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debería propagar errores', async () => {
      const err = new Error('Test Error');
      authService.refreshAccessToken.mockRejectedValueOnce(err);
      await authController.refresh(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('getProfile', () => {
    it('debería devolver el perfil del usuario HTTP 200', async () => {
      authService.getUserProfile.mockResolvedValueOnce({ email: 'a@a.com' });

      await authController.getProfile(mockReq, mockRes, mockNext);

      expect(authService.getUserProfile).toHaveBeenCalledWith('test-user-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debería propagar errores', async () => {
      const err = new Error('Test Error');
      authService.getUserProfile.mockRejectedValueOnce(err);
      await authController.getProfile(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('updateProfile', () => {
    it('debería actualizar el perfil y devolver HTTP 200', async () => {
      mockReq.body = { displayName: 'A', bio: 'B' };
      authService.updateUserProfile.mockResolvedValueOnce({ email: 'a@a.com' });

      await authController.updateProfile(mockReq, mockRes, mockNext);

      expect(authService.updateUserProfile).toHaveBeenCalledWith('test-user-id', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debería propagar errores', async () => {
      const err = new Error('Test Error');
      authService.updateUserProfile.mockRejectedValueOnce(err);
      await authController.updateProfile(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });
});
