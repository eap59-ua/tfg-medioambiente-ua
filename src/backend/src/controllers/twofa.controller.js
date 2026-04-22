/**
 * Controlador de 2FA TOTP — EcoAlerta
 * Endpoints para configuración, verificación y gestión del doble factor.
 *
 * @module controllers/twofa.controller
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const twofaService = require('../services/twofa.service');
const auditService = require('../services/audit.service');
const { query } = require('../config/database');
const { generateTokens, sanitizeUser } = require('../services/auth.service');

const TEMP_TOKEN_EXPIRES = '5m';

/**
 * POST /api/v1/auth/2fa/setup
 * Genera secreto TOTP y QR. No activa aún.
 */
const setup = async (req, res, next) => {
  try {
    const result = await twofaService.generateSecret(req.user.email);

    // Guardar secreto cifrado (sin activar)
    await twofaService.saveSecret(req.user.id, result.secretBase32);

    res.json({
      success: true,
      data: {
        qrDataUrl: result.qrDataUrl,
        secretBase32: result.secretBase32,
        otpauthUrl: result.otpauthUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/2fa/enable
 * Verifica primer código TOTP y activa 2FA. Devuelve recovery codes.
 */
const enable = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Código TOTP de 6 dígitos requerido',
      });
    }

    // Verificar que hay un secreto pendiente
    const secretResult = await query(
      'SELECT secret_encrypted FROM user_2fa WHERE user_id = $1 AND enabled = FALSE',
      [req.user.id]
    );

    if (secretResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay configuración 2FA pendiente. Ejecuta /setup primero.',
      });
    }

    // Activar temporalmente para verificar el token
    await twofaService.enableTwoFA(req.user.id);

    const isValid = await twofaService.verifyToken(req.user.id, code);

    if (!isValid) {
      // Revertir activación
      await query('UPDATE user_2fa SET enabled = FALSE, enabled_at = NULL WHERE user_id = $1', [req.user.id]);
      return res.status(400).json({
        success: false,
        error: 'Código TOTP inválido. Verifica tu app de autenticación.',
      });
    }

    // Generar recovery codes
    const recoveryCodes = await twofaService.generateRecoveryCodes(req.user.id);

    await auditService.logSecurityEvent(req.user.id, '2fa_enabled', req, {
      role: req.user.role,
    });

    res.json({
      success: true,
      data: { recoveryCodes },
      message: '2FA activado correctamente. Guarda los códigos de recuperación en un lugar seguro.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/2fa/disable
 * Desactiva 2FA. Solo ciudadanos.
 */
const disable = async (req, res, next) => {
  try {
    const { password, code } = req.body;

    // Solo ciudadanos pueden desactivar
    if (req.user.role === 'admin' || req.user.role === 'entity') {
      return res.status(403).json({
        success: false,
        error: 'Los administradores y entidades no pueden desactivar 2FA.',
      });
    }

    // Verificar contraseña
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isPasswordValid = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Verificar TOTP
    const isCodeValid = await twofaService.verifyToken(req.user.id, code);
    if (!isCodeValid) {
      return res.status(400).json({ success: false, error: 'Código TOTP inválido' });
    }

    await twofaService.disableTwoFA(req.user.id);

    await auditService.logSecurityEvent(req.user.id, '2fa_disabled', req, {
      role: req.user.role,
    });

    res.json({ success: true, message: '2FA desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/2fa/recovery-codes
 * Regenera códigos de recuperación.
 */
const regenerateRecoveryCodes = async (req, res, next) => {
  try {
    const { password, code } = req.body;

    // Verificar contraseña
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isPasswordValid = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Verificar TOTP
    const isCodeValid = await twofaService.verifyToken(req.user.id, code);
    if (!isCodeValid) {
      return res.status(400).json({ success: false, error: 'Código TOTP inválido' });
    }

    const recoveryCodes = await twofaService.generateRecoveryCodes(req.user.id);

    await auditService.logSecurityEvent(req.user.id, 'recovery_regenerated', req);

    res.json({
      success: true,
      data: { recoveryCodes },
      message: 'Códigos de recuperación regenerados. Los anteriores han sido invalidados.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/2fa/status
 * Devuelve el estado de 2FA del usuario autenticado.
 */
const getStatus = async (req, res, next) => {
  try {
    const status = await twofaService.getStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login/2fa/verify
 * Verifica código TOTP con tempToken para completar login.
 */
const verifyLogin = async (req, res, next) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({
        success: false,
        error: 'tempToken y código TOTP requeridos',
      });
    }

    // Verificar tempToken
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: 'Token temporal inválido o expirado' });
    }

    if (decoded.scope !== '2fa_pending') {
      return res.status(401).json({ success: false, error: 'Token temporal inválido' });
    }

    // Verificar TOTP
    const isValid = await twofaService.verifyToken(decoded.id, code);
    if (!isValid) {
      await auditService.logSecurityEvent(decoded.id, 'login_2fa_failed', req);
      return res.status(401).json({ success: false, error: 'Código TOTP inválido' });
    }

    // Obtener usuario y generar tokens finales
    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];
    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login/2fa/recovery
 * Verifica código de recuperación con tempToken para completar login.
 */
const verifyRecovery = async (req, res, next) => {
  try {
    const { tempToken, recoveryCode } = req.body;

    if (!tempToken || !recoveryCode) {
      return res.status(400).json({
        success: false,
        error: 'tempToken y código de recuperación requeridos',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: 'Token temporal inválido o expirado' });
    }

    if (decoded.scope !== '2fa_pending') {
      return res.status(401).json({ success: false, error: 'Token temporal inválido' });
    }

    const isValid = await twofaService.consumeRecoveryCode(decoded.id, recoveryCode);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Código de recuperación inválido' });
    }

    await auditService.logSecurityEvent(decoded.id, 'recovery_used', req);

    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];
    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/users/:id/2fa/reset
 * Reset administrativo de 2FA para otro usuario.
 */
const adminReset = async (req, res, next) => {
  try {
    const { id: targetUserId } = req.params;
    const { reason } = req.body;

    await twofaService.disableTwoFA(targetUserId);

    await auditService.logSecurityEvent(req.user.id, '2fa_admin_reset', req, {
      targetUserId,
      reason: reason || 'No especificada',
    });

    res.json({ success: true, message: '2FA reseteado para el usuario' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setup,
  enable,
  disable,
  regenerateRecoveryCodes,
  getStatus,
  verifyLogin,
  verifyRecovery,
  adminReset,
  TEMP_TOKEN_EXPIRES,
};
