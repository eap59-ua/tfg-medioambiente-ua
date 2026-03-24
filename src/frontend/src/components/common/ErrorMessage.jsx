import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message = 'Ha ocurrido un error', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="mt-3 text-gray-700 text-center">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          Reintentar
        </button>
      )}
    </div>
  );
}
