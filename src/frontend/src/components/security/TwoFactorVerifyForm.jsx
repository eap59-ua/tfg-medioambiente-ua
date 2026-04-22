import React, { useState, useRef, useEffect } from 'react';
import { Shield, Loader2, Key } from 'lucide-react';

/**
 * Formulario de verificación 2FA (6 dígitos) para la pantalla de login.
 * Auto-submit al completar los 6 dígitos.
 */
export default function TwoFactorVerifyForm({ onVerify, onRecovery, loading, error }) {
  const [code, setCode] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [showRecovery]);

  const handleCodeChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
    // Auto-submit al completar 6 dígitos
    if (cleaned.length === 6) {
      onVerify(cleaned);
    }
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (recoveryCode.trim()) {
      onRecovery(recoveryCode.trim());
    }
  };

  if (showRecovery) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Key className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-900">Código de recuperación</h2>
          <p className="text-sm text-gray-500 mt-1">
            Introduce uno de tus códigos de recuperación de 8 caracteres
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleRecoverySubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            maxLength={8}
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
            className="w-full text-center text-xl font-mono tracking-widest rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 py-3"
            placeholder="XXXXXXXX"
          />
          <button
            type="submit"
            disabled={loading || recoveryCode.length < 8}
            className="w-full py-2.5 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Usar código de recuperación'}
          </button>
        </form>

        <button
          onClick={() => { setShowRecovery(false); setRecoveryCode(''); }}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver al código TOTP
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Shield className="w-8 h-8 text-primary-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-gray-900">Verificación en dos pasos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Introduce el código de 6 dígitos de tu app de autenticación
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="w-full text-center text-3xl font-mono tracking-[0.5em] rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 py-4"
          placeholder="000000"
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        )}
      </div>

      <button
        onClick={() => setShowRecovery(true)}
        className="w-full text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        ¿No tienes acceso a tu app? Usar código de recuperación
      </button>
    </div>
  );
}
