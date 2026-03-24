import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ThumbsUp } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';
import { UPLOADS_URL } from '../../utils/constants';

export default function IncidentCard({ incident }) {
  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  return (
    <Link to={`/incidents/${incident.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all duration-200">
        {incident.cover_photo && (
          <div className="h-40 overflow-hidden">
            <img
              src={`${UPLOADS_URL}${incident.cover_photo}`}
              alt={incident.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {incident.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{incident.description}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                {incident.vote_count || 0}
              </span>
              {incident.category_name && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: incident.category_color }} />
                  {incident.category_name}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(incident.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
