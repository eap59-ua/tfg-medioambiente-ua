import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import * as incidentService from '../services/incident.service';
import IncidentCard from '../components/incidents/IncidentCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { STATUS_CONFIG } from '../utils/constants';

export default function MyIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchMyIncidents = async () => {
      try {
        setLoading(true);
        const params = { limit: 50 };
        if (statusFilter) params.status = statusFilter;
        const { incidents: data } = await incidentService.getIncidents(params);
        setIncidents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyIncidents();
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis Incidencias</h1>
          <Link to="/incidents/new" className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors">
            <Plus className="w-4 h-4" /> Nueva
          </Link>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${!statusFilter ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Todas
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${statusFilter === key ? `${cfg.bg} ${cfg.text}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cfg.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : incidents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No tienes incidencias reportadas</p>
            <Link to="/incidents/new" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
              <Plus className="w-5 h-5" /> Reportar incidencia
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((inc) => <IncidentCard key={inc.id} incident={inc} />)}
          </div>
        )}
      </div>
    </div>
  );
}
