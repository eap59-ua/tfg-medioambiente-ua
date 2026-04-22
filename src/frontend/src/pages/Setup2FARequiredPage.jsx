import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';
import TwoFactorSetupModal from '../components/security/TwoFactorSetupModal';
import * as twofaService from '../services/twofa.service';

/**
 * Pantalla bloqueante para admins/entidades que deben activar 2FA.
 * Se muestra tras login correcto si el usuario tiene rol privilegiado sin 2FA.
 */
export default function Setup2FARequiredPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tempToken, role, email } = location.state || {};
  const [qrData, setQrData] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tempToken) {
      navigate('/login', { replace: true });
    }
  }, [tempToken, navigate]);

  const handleStartSetup = async () => {
    try {
      // Usar el tempToken para autenticar la petición de setup
      const originalToken = localStorage.getItem('ecoalerta_access_token');
      localStorage.setItem('ecoalerta_access_token', tempToken);

      const data = await twofaService.setup2FA();
      setQrData(data);
      setShowSetup(true);

      // Restaurar token original
      if (originalToken) {
        localStorage.setItem('ecoalerta_access_token', originalToken);
      } else {
        localStorage.removeItem('ecoalerta_access_token');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar la configuración 2FA');
    }
  };

  const handleVerify = async (code) => {
    // Usar tempToken para la petición de enable
    const originalToken = localStorage.getItem('ecoalerta_access_token');
    localStorage.setItem('ecoalerta_access_token', tempToken);

    try {
      const data = await twofaService.enable2FA(code);
      setRecoveryCodes(data.recoveryCodes);

      if (originalToken) {
        localStorage.setItem('ecoalerta_access_token', originalToken);
      } else {
        localStorage.removeItem('ecoalerta_access_token');
      }
    } catch (err) {
      if (originalToken) {
        localStorage.setItem('ecoalerta_access_token', originalToken);
      }
      throw new Error(err.response?.data?.error || 'Código inválido');
    }
  };

  const handleClose = () => {
    // Ahora necesitamos hacer login de nuevo con 2FA activo
    navigate('/login', { replace: true });
  };

  if (!tempToken) return null;

  const roleName = role === 'admin' ? 'Administrador' : 'Entidad responsable';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-primary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración de seguridad obligatoria</h1>
            <p className="text-gray-500 mt-2">
              Como <strong>{roleName}</strong>, debes activar la autenticación de doble factor (2FA)
              antes de acceder al sistema.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">¿Por qué es obligatorio?</p>
                <p>
                  Tu cuenta tiene privilegios que permiten modificar incidencias, gestionar usuarios
                  y acceder a datos sensibles. La autenticación de doble factor protege la plataforma
                  frente a accesos no autorizados.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Necesitarás una app de autenticación en tu móvil:
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>Google Authenticator</li>
              <li>Microsoft Authenticator</li>
              <li>Aegis (Android) o 2FAS</li>
            </ul>
          </div>

          <button
            onClick={handleStartSetup}
            className="w-full mt-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Configurar 2FA ahora
          </button>
        </div>
      </div>

      {showSetup && qrData && (
        <TwoFactorSetupModal
          qrData={qrData}
          onVerify={handleVerify}
          onClose={handleClose}
          recoveryCodes={recoveryCodes}
        />
      )}
    </div>
  );
}
