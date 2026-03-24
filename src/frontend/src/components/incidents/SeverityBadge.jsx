import React from 'react';
import { SEVERITY_CONFIG } from '../../utils/constants';

export default function SeverityBadge({ severity, size = 'sm' }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.moderate;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
