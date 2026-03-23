/**
 * Controlador de autenticación — EcoAlerta
 * Endpoints REST para registro, login, refresh y perfil.
 *
 * @module controllers/auth.controller
 */

const authService = require('../services/auth.service');

/**
 * POST /api/v1/auth/register
 * Registra un nuevo usuario ciudadano.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    const result = await authService.registerUser({ email, password, displayName });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Inicia sesión y devuelve tokens JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh
 * Renueva el access token usando un refresh token válido.
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Devuelve el perfil del usuario autenticado.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/auth/me
 * Actualiza el perfil del usuario autenticado.
 */
const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio } = req.body;
    const user = await authService.updateUserProfile(req.user.id, {
      displayName,
      bio,
    });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  getProfile,
  updateProfile,
};
