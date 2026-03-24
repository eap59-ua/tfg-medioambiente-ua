import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, AlertCircle, RefreshCw, Layers, ShieldCheck, User } from 'lucide-react';
import adminService from '../services/admin.service';
import { SEVERITY_CONFIG, STATUS_CONFIG, CATEGORIES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Toast from '../components/common/Toast';
import SeverityBadge from '../components/incidents/SeverityBadge';
import StatusBadge from '../components/incidents/StatusBadge';

const AdminIncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [entities, setEntities] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    categoryId: '',
    entityId: '',
    page: 1,
    limit: 20
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'status' | 'assign'
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalValue, setModalValue] = useState('');
  const [modalNote, setModalNote] = useState('');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await adminService.getIncidents(filters);
      setIncidents(data.incidents);
      setMeta(data.meta);
      setError(null);
    } catch (err) {
      setError('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // Fetch entities for assignment dropdown
    adminService.getEntities().then(setEntities).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const openModal = (incident, type) => {
    setSelectedIncident(incident);
    setModalType(type);
    setModalValue(type === 'status' ? incident.status : (incident.assigned_entity_id || ''));
    setModalNote('');
    setModalOpen(true);
  };

  const handleAction = async () => {
    try {
      if (modalType === 'status') {
        await adminService.updateIncidentStatus(selectedIncident.id, modalValue, modalNote);
        setToast({ message: 'Estado actualizado correctamente', type: 'success' });
      } else if (modalType === 'assign') {
        if (!modalValue) return; // entity_id
        await adminService.assignIncident(selectedIncident.id, modalValue);
        setToast({ message: 'Incidencia asignada correctamente', type: 'success' });
      }
      setModalOpen(false);
      fetchIncidents();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al ejecutar la acción', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Incidencias</h1>
          <p className="text-gray-600 mt-1">Total: {meta.total} incidencias reportadas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="input-field py-2 text-sm">
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
          <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="input-field py-2 text-sm">
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Severidad</label>
          <select name="severity" value={filters.severity} onChange={handleFilterChange} className="input-field py-2 text-sm">
            <option value="">Todas las severidades</option>
            {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <button onClick={() => fetchIncidents()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refrescar
        </button>
      </div>

      {/* Table */}
      {error ? (
        <ErrorMessage message={error} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="px-4 py-3 font-medium">ID Corto</th>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Reporter / Fecha</th>
                  <th className="px-4 py-3 font-medium">Categoría & Severidad</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Entidad</th>
                  <th className="px-4 py-3 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {incidents.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No se encontraron incidencias</td></tr>
                ) : (
                  incidents.map(inc => (
                    <tr key={inc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{inc.id.split('-')[0]}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-xs" title={inc.title}>{inc.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{inc.address || `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[120px]" title={inc.reporter_email}>{inc.reporter_name || 'Anónimo'}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(inc.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: inc.category_color }}></span>
                          <span className="truncate max-w-[120px]">{inc.category_name}</span>
                        </div>
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {inc.assigned_entity_name ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            {inc.assigned_entity_name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No asignada</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/incidents/${inc.id}`} title="Ver Detalle" className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openModal(inc, 'status')} title="Cambiar Estado" className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                            <Layers className="w-4 h-4" />
                          </button>
                          <button onClick={() => openModal(inc, 'assign')} title="Asignar Entidad" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Edit className="w-4 h-4" />
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
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
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

      {/* Modal Actions */}
      {modalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">
                {modalType === 'status' ? 'Cambiar Estado' : 'Asignar Entidad Responsable'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-100">
                <strong>Incidencia:</strong> {selectedIncident.title}
              </div>

              {modalType === 'status' ? (
                <>
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
                      placeholder="Motivo del cambio de estado..."
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Entidad</label>
                  <select value={modalValue} onChange={e => setModalValue(e.target.value)} className="input-field">
                    <option value="" disabled>Seleccione una entidad...</option>
                    {entities.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleAction} className="btn-primary" disabled={modalType === 'assign' && !modalValue}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIncidentsPage;
