// ==============================================================================
// Middleware de validación — express-validator
// ==============================================================================
// Ejecuta las validaciones definidas en los validators y, si hay errores,
// responde con 400 sin pasar a los controladores.
// ==============================================================================

const { validationResult } = require('express-validator');

/**
 * Middleware que comprueba los errores de validación de express-validator.
 * Debe colocarse DESPUÉS de las reglas de validación en la cadena del router.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = { validateRequest };
