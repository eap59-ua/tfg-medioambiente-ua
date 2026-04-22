import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getStoredToken();
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch {
          authService.logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const loginAction = useCallback(async (email, password, turnstileToken) => {
    const result = await authService.login(email, password, turnstileToken);
    // Si requiere 2FA, no setear el user aún
    if (result.requires2FA || result.requires2FASetup) {
      return result;
    }
    setUser(result.user);
    return result;
  }, []);

  const registerAction = useCallback(async (email, password, displayName, turnstileToken) => {
    const result = await authService.register(email, password, displayName, turnstileToken);
    setUser(result.user);
    return result;
  }, []);

  const logoutAction = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      logoutAction();
    }
  }, [logoutAction]);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEntity: user?.role === 'entity',
    isLoading,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
