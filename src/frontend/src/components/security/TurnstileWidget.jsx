import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

/**
 * Wrapper de Cloudflare Turnstile para EcoAlerta.
 * Renderiza el widget CAPTCHA y notifica al padre con el token verificado.
 *
 * @param {Object} props
 * @param {Function} props.onVerify - Callback con el token tras verificación exitosa
 * @param {Function} [props.onError] - Callback en caso de error
 * @param {Function} [props.onExpire] - Callback cuando el token expira
 * @param {string} [props.action] - Nombre de la acción (register, login, etc.)
 * @param {string} [props.className] - Clases CSS adicionales
 */
export default function TurnstileWidget({ onVerify, onError, onExpire, action, className = '' }) {
  const siteKey = process.env.REACT_APP_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  return (
    <div className={`turnstile-container ${className}`}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        onExpire={onExpire}
        options={{
          action: action,
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  );
}
