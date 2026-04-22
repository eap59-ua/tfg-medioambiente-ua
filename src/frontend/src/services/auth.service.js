import api from './api';

const TOKEN_KEY = 'ecoalerta_access_token';
const REFRESH_KEY = 'ecoalerta_refresh_token';
const USER_KEY = 'ecoalerta_user';

const saveAuth = (data) => {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
};

export const register = async (email, password, displayName, turnstileToken) => {
  const { data } = await api.post('/auth/register', { email, password, displayName, turnstileToken });
  saveAuth(data.data);
  return data.data;
};

export const login = async (email, password, turnstileToken) => {
  const { data } = await api.post('/auth/login', { email, password, turnstileToken });
  const result = data.data;

  // Si el backend pide 2FA o setup obligatorio, no guardamos tokens finales
  if (result.requires2FA || result.requires2FASetup) {
    return result;
  }

  saveAuth(result);
  return result;
};

export const refreshToken = async () => {
  const token = localStorage.getItem(REFRESH_KEY);
  const { data } = await api.post('/auth/refresh', { refreshToken: token });
  localStorage.setItem(TOKEN_KEY, data.data.accessToken);
  return data.data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};

export const updateProfile = async (updates) => {
  const { data } = await api.put('/auth/me', updates);
  localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
  return data.data.user;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
