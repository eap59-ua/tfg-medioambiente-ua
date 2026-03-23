/**
 * Validadores de autenticación — EcoAlerta
 * Reglas de validación con express-validator.
 *
 * @module validators/auth.validator
 */

const { body, validationResult } = require('express-validator');

/**
 * Middleware que comprueba errores de validación y responde 400 si existen.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/**
 * Reglas de validación para registro de usuario.
 */
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número'),

  body('displayName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  handleValidationErrors,
];

/**
 * Reglas de validación para inicio de sesión.
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),

  handleValidationErrors,
];

/**
 * Reglas de validación para actualización de perfil.
 */
const validateUpdateProfile = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La bio no puede superar los 500 caracteres'),

  handleValidationErrors,
];

/**
 * Reglas de validación para refresh token.
 */
const validateRefresh = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es obligatorio'),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateRefresh,
  handleValidationErrors,
};
