import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { SEVERITY_CONFIG, UPLOADS_URL } from '../../utils/constants';
import SeverityBadge from '../incidents/SeverityBadge';

const createMarkerIcon = (severity) => {
  const color = SEVERITY_CONFIG[severity]?.color || '#F39C12';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  });
};

export default function IncidentMarker({ incident }) {
  const position = [
    parseFloat(incident.latitude),
    parseFloat(incident.longitude),
  ];

  return (
    <Marker position={position} icon={createMarkerIcon(incident.severity)}>
      <Popup maxWidth={280} className="incident-popup">
        <div className="p-1">
          {incident.cover_photo && (
            <img
              src={`${UPLOADS_URL}${incident.cover_photo}`}
              alt={incident.title}
              className="w-full h-24 object-cover rounded-md mb-2"
            />
          )}
          <div className="mb-1"><SeverityBadge severity={incident.severity} /></div>
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{incident.title}</h3>
          {incident.category_name && (
            <p className="text-xs text-gray-500 mt-0.5">{incident.category_name}</p>
          )}
          <Link
            to={`/incidents/${incident.id}`}
            className="mt-2 block text-center text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 rounded py-1.5"
          >
            Ver detalle →
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
