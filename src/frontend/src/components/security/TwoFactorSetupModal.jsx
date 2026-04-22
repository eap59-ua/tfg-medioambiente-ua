import React, { useState } from 'react';
import { Shield, Copy, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Modal de configuración 2FA — 3 pasos:
 * 1. Mostrar QR + secreto manual
 * 2. Verificar primer código TOTP
 * 3. Mostrar recovery codes
 */
export default function TwoFactorSetupModal({ qrData, onVerify, onClose, recoveryCodes }) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Introduce un código de 6 dígitos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onVerify(code);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Código inválido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(qrData?.secretBase32 || '');
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Step 1: QR */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Configurar 2FA</h2>
              <p className="text-sm text-gray-500 mt-1">
                Escanea este código QR con tu app de autenticación
              </p>
            </div>

            {qrData?.qrDataUrl && (
              <div className="flex justify-center mb-4">
                <img src={qrData.qrDataUrl} alt="Código QR para 2FA" className="w-56 h-56 rounded-lg border" />
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">O introduce este código manualmente:</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-white px-2 py-1 rounded border flex-1 break-all">
                  {qrData?.secretBase32}
                </code>
                <button onClick={copySecret} className="p-1.5 text-gray-400 hover:text-gray-600" title="Copiar">
                  {secretCopied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Siguiente — Verificar código
            </button>
          </>
        )}

        {/* Step 2: Verify */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Verificar código</h2>
              <p className="text-sm text-gray-500 mt-1">
                Introduce el código de 6 dígitos de tu app de autenticación
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl font-mono tracking-[0.5em] rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 py-3"
                placeholder="000000"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Activar 2FA'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Recovery codes */}
        {step === 3 && (
          <>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">¡2FA activado!</h2>
              <p className="text-sm text-gray-500 mt-1">
                Guarda estos códigos de recuperación en un lugar seguro
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800 font-medium">
                ⚠️ Estos códigos solo se muestran UNA VEZ. Si pierdes tu app de autenticación, los necesitarás para acceder.
              </p>
            </div>

            <RecoveryCodesList codes={recoveryCodes} />

            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Entendido, he guardado los códigos
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function RecoveryCodesList({ codes }) {
  const downloadCodes = () => {
    const text = `EcoAlerta — Códigos de recuperación 2FA\nGenerados: ${new Date().toLocaleString('es-ES')}\n\n${codes.join('\n')}\n\nGuarda estos códigos en un lugar seguro. Cada código solo puede usarse una vez.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecoalerta-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {codes?.map((code, i) => (
          <div key={i} className="font-mono text-sm bg-gray-100 rounded px-3 py-1.5 text-center">
            {code}
          </div>
        ))}
      </div>
      <button
        onClick={downloadCodes}
        className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        📥 Descargar como archivo TXT
      </button>
    </div>
  );
}
