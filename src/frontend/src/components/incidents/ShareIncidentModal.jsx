import React, { useState } from 'react';
import { X, Copy, CheckCircle, Download, Share2 } from 'lucide-react';

/**
 * Modal para compartir una incidencia con QR, URL copiable y descarga.
 */
export default function ShareIncidentModal({ incidentId, incidentTitle, onClose }) {
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
  const frontendUrl = window.location.origin;
  const incidentUrl = `${frontendUrl}/incidents/${incidentId}`;
  const qrUrl = `${apiUrl}/incidents/${incidentId}/qr?size=300&margin=2`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(incidentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = incidentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecoalerta-incidencia-${incidentId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando QR:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Compartir incidencia</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {incidentTitle && (
          <p className="text-sm text-gray-500 mb-4 truncate">"{incidentTitle}"</p>
        )}

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-sm">
            <img
              src={qrUrl}
              alt={`QR para incidencia ${incidentId}`}
              className="w-48 h-48"
              loading="lazy"
            />
          </div>
        </div>

        {/* URL */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Enlace directo</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={incidentUrl}
              readOnly
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 truncate"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
              title="Copiar enlace"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Copy className="w-4 h-4" />
            {copied ? '¡Copiado!' : 'Copiar enlace'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Descargar QR
          </button>
        </div>
      </div>
    </div>
  );
}
