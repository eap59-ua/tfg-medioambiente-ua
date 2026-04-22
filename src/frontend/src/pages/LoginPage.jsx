import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import TurnstileWidget from '../components/security/TurnstileWidget';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password, turnstileToken);

      // Flujo 2FA: redirigir a verificación
      if (result.requires2FA) {
        navigate('/login/2fa', { state: { tempToken: result.tempToken, email } });
        return;
      }

      // Flujo setup 2FA obligatorio (admin/entidad)
      if (result.requires2FASetup) {
        navigate('/setup-2fa-required', {
          state: { tempToken: result.tempToken, role: result.role, email },
        });
        return;
      }

      navigate('/');
    } catch (err) {
      const responseData = err.response?.data;
      // Detectar si el backend pide CAPTCHA
      if (responseData?.code === 'CAPTCHA_REQUIRED' || responseData?.captchaRequired) {
        setCaptchaRequired(true);
        setError('Demasiados intentos fallidos. Completa la verificación de seguridad.');
      } else {
        setError(responseData?.error || 'Credenciales incorrectas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a EcoAlerta</h1>
          <p className="text-gray-500 mt-1">Inicia sesión para reportar incidencias</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                placeholder="tu@email.com" aria-invalid={!!error} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input id="password" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 pr-10"
                  placeholder="••••••••" aria-invalid={!!error} />
                <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
            {captchaRequired && (
              <TurnstileWidget onVerify={setTurnstileToken} action="login" className="flex justify-center" />
            )}
            <button type="submit" disabled={loading || (captchaRequired && !turnstileToken)}
              className="w-full py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> Iniciar sesión</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
