import React, { useState, useEffect } from 'react';
import { User, Calendar, Shield, ShieldCheck, ShieldOff, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as twofaService from '../services/twofa.service';
import TwoFactorSetupModal from '../components/security/TwoFactorSetupModal';

export default function ProfilePage() {
  const { user } = useAuth();
  const [twofaStatus, setTwofaStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [disableForm, setDisableForm] = useState({ password: '', code: '' });
  const [disableLoading, setDisableLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await twofaService.get2FAStatus();
      setTwofaStatus(status);
    } catch {
      // Silently fail
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleStartSetup = async () => {
    try {
      const data = await twofaService.setup2FA();
      setQrData(data);
      setShowSetup(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar configuración 2FA');
    }
  };

  const handleVerify = async (code) => {
    try {
      const data = await twofaService.enable2FA(code);
      setRecoveryCodes(data.recoveryCodes);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Código inválido');
    }
  };

  const handleSetupClose = () => {
    setShowSetup(false);
    setQrData(null);
    setRecoveryCodes(null);
    loadStatus();
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setDisableLoading(true);
    setError('');
    try {
      await twofaService.disable2FA(disableForm.password, disableForm.code);
      setDisableForm({ password: '', code: '' });
      loadStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al desactivar 2FA');
    } finally {
      setDisableLoading(false);
    }
  };

  if (!user) return null;

  const isPrivileged = user.role === 'admin' || user.role === 'entity';

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-green-500 h-32" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.display_name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">{user.display_name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900">{user.display_name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-gray-600">{user.bio}</p>
            )}

            <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Desde {new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Security Section — 2FA */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Seguridad</h2>
          </div>

          {loadingStatus ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* 2FA Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  {twofaStatus?.enabled ? (
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                  ) : (
                    <ShieldOff className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      Autenticación de doble factor (2FA)
                    </p>
                    <p className="text-sm text-gray-500">
                      {twofaStatus?.enabled
                        ? `Activado — ${twofaStatus.recoveryCodesRemaining} códigos de recuperación restantes`
                        : 'Desactivado — tu cuenta podría ser más segura'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation banner for citizens without 2FA */}
              {!twofaStatus?.enabled && !isPrivileged && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Recomendamos activar 2FA</p>
                    <p className="mt-0.5">Protege tu cuenta con un segundo factor de autenticación usando tu móvil.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              {/* Enable button */}
              {!twofaStatus?.enabled && (
                <button
                  onClick={handleStartSetup}
                  className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Activar autenticación de doble factor
                </button>
              )}

              {/* Disable form for citizens */}
              {twofaStatus?.enabled && !isPrivileged && (
                <form onSubmit={handleDisable} className="space-y-3 mt-2">
                  <p className="text-sm text-gray-500">Para desactivar 2FA, introduce tu contraseña y un código TOTP:</p>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={disableForm.password}
                    onChange={(e) => setDisableForm({ ...disableForm, password: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Código TOTP (6 dígitos)"
                    value={disableForm.code}
                    onChange={(e) => setDisableForm({ ...disableForm, code: e.target.value.replace(/\D/g, '') })}
                    className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={disableLoading}
                    className="w-full py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {disableLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desactivar 2FA'}
                  </button>
                </form>
              )}

              {/* Notice for privileged roles */}
              {twofaStatus?.enabled && isPrivileged && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                  <p>Como {user.role === 'admin' ? 'administrador' : 'entidad responsable'}, la autenticación de doble factor es obligatoria y no puede desactivarse.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {showSetup && qrData && (
        <TwoFactorSetupModal
          qrData={qrData}
          onVerify={handleVerify}
          onClose={handleSetupClose}
          recoveryCodes={recoveryCodes}
        />
      )}
    </div>
  );
}
