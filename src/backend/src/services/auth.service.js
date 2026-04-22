/**
 * Servicio de autenticación — EcoAlerta
 * Lógica de negocio para registro, login, refresh y perfil de usuario.
 *
 * @module services/auth.service
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../config/logger');

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

/**
 * Genera un par de tokens (access + refresh) para un usuario.
 * @param {object} user - Objeto usuario con id, email, role
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });

  return { accessToken, refreshToken };
};

/**
 * Elimina el password_hash del objeto usuario.
 * @param {object} user - Fila de la BD
 * @returns {object} Usuario sin password_hash
 */
const sanitizeUser = (user) => {
  const { password_hash: _hash, ...safeUser } = user;
  return safeUser;
};

/**
 * Registra un nuevo usuario ciudadano.
 * @param {{ email: string, password: string, displayName: string }} data
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
const registerUser = async ({ email, password, displayName }) => {
  // Verificar email único
  const existing = await query('SELECT id FROM users WHERE email = $1', [
    email.toLowerCase(),
  ]);
  if (existing.rows.length > 0) {
    const error = new Error('El email ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  // Hash del password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insertar usuario
  const result = await query(
    `INSERT INTO users (email, password_hash, display_name, role, is_active, is_verified)
     VALUES ($1, $2, $3, 'citizen', TRUE, FALSE)
     RETURNING *`,
    [email.toLowerCase(), passwordHash, displayName.trim()]
  );

  const user = result.rows[0];
  const tokens = generateTokens(user);

  logger.info(`Nuevo usuario registrado: ${user.email} (${user.id})`);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

/**
 * Inicia sesión con email y contraseña.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
const loginUser = async ({ email, password }) => {
  // Buscar usuario
  const result = await query('SELECT * FROM users WHERE email = $1', [
    email.toLowerCase(),
  ]);

  if (result.rows.length === 0) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  // Verificar cuenta activa
  if (!user.is_active) {
    const error = new Error('La cuenta está desactivada');
    error.statusCode = 403;
    throw error;
  }

  // Verificar password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    // Incrementar contador de intentos fallidos (RF-SEC-03)
    const windowStart = user.failed_login_window_start
      ? new Date(user.failed_login_window_start).getTime()
      : 0;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutos

    if ((now - windowStart) >= windowMs) {
      // Nueva ventana
      await query(
        'UPDATE users SET failed_login_attempts = 1, failed_login_window_start = NOW() WHERE id = $1',
        [user.id]
      );
    } else {
      // Incrementar en la ventana actual
      await query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
        [user.id]
      );
    }

    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  // Resetear contador de intentos fallidos tras login exitoso
  if (user.failed_login_attempts > 0) {
    await query(
      'UPDATE users SET failed_login_attempts = 0, failed_login_window_start = NULL WHERE id = $1',
      [user.id]
    );
  }

  const tokens = generateTokens(user);

  logger.info(`Login exitoso: ${user.email}`);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

/**
 * Genera un nuevo access token a partir de un refresh token válido.
 * @param {string} refreshToken
 * @returns {Promise<{ accessToken: string }>}
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Verificar que el usuario sigue existiendo y activo
    const result = await query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      const error = new Error('Usuario no encontrado o desactivado');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    return { accessToken };
  } catch (err) {
    if (err.statusCode) {
      throw err;
    }
    const error = new Error('Refresh token inválido o expirado');
    error.statusCode = 401;
    throw error;
  }
};

/**
 * Obtiene el perfil completo de un usuario por su ID.
 * @param {string} userId - UUID del usuario
 * @returns {Promise<object>} Usuario sin password_hash
 */
const getUserProfile = async (userId) => {
  const result = await query(
    `SELECT u.*, re.name AS entity_name
     FROM users u
     LEFT JOIN responsible_entities re ON u.entity_id = re.id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(result.rows[0]);
};

/**
 * Actualiza el perfil de un usuario.
 * @param {string} userId - UUID del usuario
 * @param {{ displayName?: string, bio?: string }} updates
 * @returns {Promise<object>} Usuario actualizado sin password_hash
 */
const updateUserProfile = async (userId, updates) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.displayName !== undefined) {
    fields.push(`display_name = $${paramIndex++}`);
    values.push(updates.displayName.trim());
  }

  if (updates.bio !== undefined) {
    fields.push(`bio = $${paramIndex++}`);
    values.push(updates.bio);
  }

  if (fields.length === 0) {
    return getUserProfile(userId);
  }

  values.push(userId);
  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  logger.info(`Perfil actualizado: ${userId}`);

  return sanitizeUser(result.rows[0]);
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
  generateTokens,
  sanitizeUser,
};
