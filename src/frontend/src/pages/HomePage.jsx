import React, { useState, useEffect, useCallback } from 'react';
import { Crosshair } from 'lucide-react';
import MapView from '../components/map/MapView';
import IncidentMarker from '../components/map/IncidentMarker';
import MapFilters from '../components/map/MapFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as incidentService from '../services/incident.service';
import { useGeolocation } from '../hooks/useGeolocation';

export default function HomePage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ severity: '', status: '', categoryId: '', sortBy: 'created_at' });
  const [mapCenter, setMapCenter] = useState(null);
  const { latitude, longitude, requestLocation } = useGeolocation();

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (filters.severity) params.severity = filters.severity;
      if (filters.status) params.status = filters.status;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const { incidents: data } = await incidentService.getIncidents(params);
      setIncidents(data);
    } catch (err) {
      console.error('Error cargando incidencias:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleLocate = () => {
    requestLocation();
    setMapCenter([latitude, longitude]);
  };

  const clearFilters = () => setFilters({ severity: '', status: '', categoryId: '', sortBy: 'created_at' });

  return (
    <div className="relative" style={{ height: 'calc(100vh - 64px)' }}>
      {loading && (
        <div className="absolute inset-0 z-[1003] bg-white/50 flex items-center justify-center">
          <LoadingSpinner message="Cargando incidencias..." />
        </div>
      )}

      <MapView center={mapCenter} className="w-full h-full">
        {incidents.map((inc) => (
          <IncidentMarker key={inc.id} incident={inc} />
        ))}
      </MapView>

      <MapFilters
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        resultCount={incidents.length}
        isOpen={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
      />

      {/* Locate me button */}
      <button
        onClick={handleLocate}
        className="absolute bottom-6 right-6 z-[1001] bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
        title="Mi ubicación"
      >
        <Crosshair className="w-5 h-5 text-primary-600" />
      </button>
    </div>
  );
}
