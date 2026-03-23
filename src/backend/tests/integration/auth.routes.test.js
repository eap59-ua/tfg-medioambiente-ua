/**
 * Tests de integración — Auth Routes
 * EcoAlerta — Sprint 1
 *
 * Estos tests utilizan supertest contra la app Express.
 * Requieren una BD de test configurada (o mocks del query).
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock de la base de datos para integración
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  connectDB: jest.fn().mockResolvedValue(true),
  pool: { connect: jest.fn() },
  getClient: jest.fn(),
}));

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const app = require('../../src/app');
const { query } = require('../../src/config/database');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test_jwt_secret_for_integration';

describe('Auth Routes — /api/v1/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── POST /register ───────────────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    it('debería registrar un usuario con datos válidos → 201', async () => {
      const mockUser = {
        id: 'test-uuid-new',
        email: 'nuevo@test.com',
        display_name: 'Nuevo Usuario',
        role: 'citizen',
        password_hash: '$2a$10$hash',
        is_active: true,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock: email no existe
      query.mockResolvedValueOnce({ rows: [] });
      // Mock: insertar usuario
      query.mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'nuevo@test.com',
          password: 'Password1',
          displayName: 'Nuevo Usuario',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('nuevo@test.com');
      expect(res.body.data.user.password_hash).toBeUndefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('debería rechazar registro sin email → 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          password: 'Password1',
          displayName: 'Test User',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('debería rechazar password sin mayúscula → 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password1',
          displayName: 'Test User',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── POST /login ──────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('debería devolver tokens con credenciales válidas → 200', async () => {
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

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'usuario@test.com',
          password: 'Password1',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    it('debería rechazar password incorrecto → 401', async () => {
      const hashedPassword = await bcrypt.hash('Password1', 10);
      query.mockResolvedValueOnce({
        rows: [{
          id: 'test-uuid-1',
          email: 'usuario@test.com',
          password_hash: hashedPassword,
          is_active: true,
        }],
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'usuario@test.com',
          password: 'WrongPassword1',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── GET /me ──────────────────────────────────────────────────────────────

  describe('GET /api/v1/auth/me', () => {
    it('debería devolver perfil con token válido → 200', async () => {
      const mockUser = {
        id: 'test-uuid-1',
        email: 'usuario@test.com',
        display_name: 'Test User',
        role: 'citizen',
        bio: null,
        avatar_url: null,
        entity_name: null,
        is_active: true,
      };

      const token = jwt.sign(
        { id: 'test-uuid-1', email: 'usuario@test.com', role: 'citizen' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      query.mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('usuario@test.com');
    });

    it('debería rechazar sin token → 401', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
