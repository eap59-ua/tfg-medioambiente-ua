import api from './api';

/**
 * Servicio de 2FA — frontend
 */

export const setup2FA = async () => {
  const { data } = await api.post('/auth/2fa/setup');
  return data.data;
};

export const enable2FA = async (code) => {
  const { data } = await api.post('/auth/2fa/enable', { code });
  return data.data;
};

export const disable2FA = async (password, code) => {
  const { data } = await api.post('/auth/2fa/disable', { password, code });
  return data;
};

export const get2FAStatus = async () => {
  const { data } = await api.get('/auth/2fa/status');
  return data.data;
};

export const regenerateRecoveryCodes = async (password, code) => {
  const { data } = await api.post('/auth/2fa/recovery-codes', { password, code });
  return data.data;
};

export const verify2FALogin = async (tempToken, code) => {
  const { data } = await api.post('/auth/login/2fa/verify', { tempToken, code });
  return data.data;
};

export const verify2FARecovery = async (tempToken, recoveryCode) => {
  const { data } = await api.post('/auth/login/2fa/recovery', { tempToken, recoveryCode });
  return data.data;
};
