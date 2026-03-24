import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Map as MapIcon, Layers, CheckCircle } from 'lucide-react';
import adminService from '../services/admin.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Toast from '../components/common/Toast';
import SeverityBadge from '../components/incidents/SeverityBadge';
import StatusBadge from '../components/incidents/StatusBadge';
import { STATUS_CONFIG } from '../utils/constants';

const EntityDashboardPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalValue, setModalValue] = useState('');
  const [modalNote, setModalNote] = useState('');

  const fetchAssignedIncidents = async () => {
    try {
      setLoading(true);
      // Backend automatically checks req.user.entity_id if role is 'entity' (as per spec)
      const data = await adminService.getIncidents(filters);
      setIncidents(data.incidents);
      setMeta(data.meta);
      setError(null);
    } catch (err) {
      setError('Error al cargar incidencias asignadas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]);

  const openStatusModal = (incident) => {
    setSelectedIncident(incident);
    setModalValue(incident.status);
    setModalNote('');
    setModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await adminService.updateIncidentStatus(selectedIncident.id, modalValue, modalNote);
      setToast({ message: 'Estado actualizado correctamente', type: 'success' });
      setModalOpen(false);
      fetchAssignedIncidents();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al actualizar estado', type: 'error' });
    }
  };

  if (loading && incidents.length === 0) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Entidad</h1>
          <p className="text-gray-600 mt-1">Gestión de incidencias asignadas a mi departamento</p>
        </div>
        <button onClick={() => fetchAssignedIncidents()} className="mt-4 md:mt-0 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refrescar
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary-600" />
              Incidencias Asignadas ({meta.total})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="px-6 py-3 font-medium">Incidencia</th>
                  <th className="px-6 py-3 font-medium">Ubicación</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <p>No hay incidencias asignadas actualmente.</p>
                    </td>
                  </tr>
                ) : (
                  incidents.map(inc => (
                    <tr key={inc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 mb-1">{inc.title}</div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: inc.category_color }}></span>
                          <span className="text-xs text-gray-600">{inc.category_name}</span>
                          <SeverityBadge severity={inc.severity} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 max-w-[200px] truncate" title={inc.address}>{inc.address || 'Ubicación sin nombre'}</div>
                        <div className="text-gray-500 text-xs">Lat: {inc.latitude.toFixed(4)}, Lng: {inc.longitude.toFixed(4)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inc.status} />
                        <div className="text-xs text-gray-500 mt-1">
                          Actualizado: {new Date(inc.updated_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/incidents/${inc.id}`} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors" title="Ver Detalle">
                            Ver reporte
                          </Link>
                          <button onClick={() => openStatusModal(inc)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Actualizar Estado">
                            <Layers className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <button 
                disabled={filters.page === 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                className="btn-secondary py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">Página {filters.page} de {meta.pages}</span>
              <button 
                disabled={filters.page >= meta.pages}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                className="btn-secondary py-1 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Modal */}
      {modalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Actualizar Estado de Incidencia</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-100">
                <strong>Incidencia:</strong> {selectedIncident.title}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
                <select value={modalValue} onChange={e => setModalValue(e.target.value)} className="input-field">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota de resolución (Opcional)</label>
                <textarea 
                  value={modalNote} 
                  onChange={e => setModalNote(e.target.value)} 
                  className="input-field min-h-[80px]" 
                  placeholder="Explique las acciones tomadas..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleUpdateStatus} className="btn-primary">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityDashboardPage;
