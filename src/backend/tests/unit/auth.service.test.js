/**
 * Tests unitarios — Auth Service
 * EcoAlerta — Sprint 1
 */

// Mock de la base de datos
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../src/config/database');
const authService = require('../../src/services/auth.service');

// Configurar JWT secret para tests
process.env.JWT_SECRET = 'test_jwt_secret_for_unit_tests';

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── registerUser ─────────────────────────────────────────────────────────

  describe('registerUser', () => {
    it('debería registrar un usuario nuevo y devolver tokens', async () => {
      const mockUser = {
        id: 'test-uuid-1',
        email: 'nuevo@test.com',
        display_name: 'Test User',
        role: 'citizen',
        password_hash: '$2a$10$hashedpassword',
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock: email no existe
      query.mockResolvedValueOnce({ rows: [] });
      // Mock: insertar usuario
      query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.registerUser({
        email: 'nuevo@test.com',
        password: 'Password1',
        displayName: 'Test User',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('nuevo@test.com');
      expect(result.user.password_hash).toBeUndefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Verificar que el hash se genera correctamente
      const insertCall = query.mock.calls[1];
      const hashedPassword = insertCall[1][1];
      expect(await bcrypt.compare('Password1', hashedPassword)).toBe(true);
    });

    it('debería fallar si el email ya existe', async () => {
      // Mock: email ya existe
      query.mockResolvedValueOnce({ rows: [{ id: 'existing-uuid' }] });

      await expect(
        authService.registerUser({
          email: 'existente@test.com',
          password: 'Password1',
          displayName: 'Test',
        })
      ).rejects.toThrow('El email ya está registrado');
    });
  });

  // ─── loginUser ────────────────────────────────────────────────────────────

  describe('loginUser', () => {
    it('debería devolver tokens con credenciales correctas', async () => {
      const hashedPassword = await bcrypt.hash('Password1', 10);
      const mockUser = {
        id: 'test-uuid-1',
        email: 'usuario@test.com',
        password_hash: hashedPassword,
        display_name: 'Test User',
        role: 'citizen',
        is_active: true,
      };

      query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.loginUser({
        email: 'usuario@test.com',
        password: 'Password1',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('usuario@test.com');
      expect(result.user.password_hash).toBeUndefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('debería fallar con password incorrecto', async () => {
      const hashedPassword = await bcrypt.hash('Password1', 10);
      const mockUser = {
        id: 'test-uuid-1',
        email: 'usuario@test.com',
        password_hash: hashedPassword,
        is_active: true,
      };

      query.mockResolvedValueOnce({ rows: [mockUser] });

      await expect(
        authService.loginUser({
          email: 'usuario@test.com',
          password: 'WrongPassword1',
        })
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('debería fallar si el usuario no existe', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await expect(
        authService.loginUser({
          email: 'noexiste@test.com',
          password: 'Password1',
        })
      ).rejects.toThrow('Credenciales inválidas');
    });
  });

  // ─── refreshAccessToken ───────────────────────────────────────────────────

  describe('refreshAccessToken', () => {
    it('debería generar un nuevo access token con refresh válido', async () => {
      const mockUser = {
        id: 'test-uuid-1',
        email: 'usuario@test.com',
        role: 'citizen',
        is_active: true,
      };

      // Generar un refresh token real
      const refreshToken = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      const decoded = jwt.verify(result.accessToken, process.env.JWT_SECRET);
      expect(decoded.id).toBe('test-uuid-1');
    });

    it('debería fallar con refresh token expirado', async () => {
      // Token que expiró hace 1 segundo
      const expiredToken = jwt.sign(
        { id: 'test', email: 'test@test.com', role: 'citizen' },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      await expect(
        authService.refreshAccessToken(expiredToken)
      ).rejects.toThrow('Refresh token inválido o expirado');
    });
  });
});
