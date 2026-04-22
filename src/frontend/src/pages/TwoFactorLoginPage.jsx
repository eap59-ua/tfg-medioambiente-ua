import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import TwoFactorVerifyForm from '../components/security/TwoFactorVerifyForm';
import * as twofaService from '../services/twofa.service';
import { useAuth } from '../hooks/useAuth';
import * as authStorageService from '../services/auth.service';

export default function TwoFactorLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { tempToken, email } = location.state || {};

  // Si no hay tempToken, redirigir a login
  if (!tempToken) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleVerify = async (code) => {
    setError('');
    setLoading(true);
    try {
      const result = await twofaService.verify2FALogin(tempToken, code);
      // Guardar tokens
      localStorage.setItem('ecoalerta_access_token', result.accessToken);
      localStorage.setItem('ecoalerta_refresh_token', result.refreshToken);
      localStorage.setItem('ecoalerta_user', JSON.stringify(result.user));
      await refreshUser();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido');
      setLoading(false);
    }
  };

  const handleRecovery = async (recoveryCode) => {
    setError('');
    setLoading(true);
    try {
      const result = await twofaService.verify2FARecovery(tempToken, recoveryCode);
      localStorage.setItem('ecoalerta_access_token', result.accessToken);
      localStorage.setItem('ecoalerta_refresh_token', result.refreshToken);
      localStorage.setItem('ecoalerta_user', JSON.stringify(result.user));
      await refreshUser();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Código de recuperación inválido');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-500 rounded-2xl mb-3">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          {email && <p className="text-sm text-gray-500">{email}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <TwoFactorVerifyForm
            onVerify={handleVerify}
            onRecovery={handleRecovery}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
