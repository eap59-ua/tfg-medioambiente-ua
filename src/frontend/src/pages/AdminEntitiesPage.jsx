import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import adminService from '../services/admin.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Toast from '../components/common/Toast';

const ENTITY_TYPES = ['municipality', 'police', 'fire_department', 'seprona', 'environmental_agency', 'ngo', 'other'];

const AdminEntitiesPage = () => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', type: 'municipality', email: '', phone: '' });

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const data = await adminService.getEntities();
      setEntities(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar entidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  const handleOpenModal = (entity = null) => {
    if (entity) {
      setIsEditing(true);
      setFormData({ 
        id: entity.id, 
        name: entity.name, 
        type: entity.type, 
        email: entity.email || '', 
        phone: entity.phone || '' 
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, name: '', type: 'municipality', email: '', phone: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await adminService.updateEntity(formData.id, formData);
        setToast({ message: 'Entidad actualizada', type: 'success' });
      } else {
        await adminService.createEntity(formData);
        setToast({ message: 'Entidad creada correctamente', type: 'success' });
      }
      setModalOpen(false);
      fetchEntities();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al guardar entidad', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas desactivar esta entidad?')) return;
    try {
      await adminService.deleteEntity(id);
      setToast({ message: 'Entidad desactivada', type: 'success' });
      fetchEntities();
    } catch (err) {
      setToast({ message: 'Error al eliminar', type: 'error' });
    }
  };

  if (loading && entities.length === 0) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entidades Responsables</h1>
          <p className="text-gray-600 mt-1">Gestión de autoridades encargadas de resolver incidencias</p>
        </div>
        <button onClick={() => handleOpenModal()} className="mt-4 md:mt-0 btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nueva Entidad
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Contacto</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {entities.map(entity => (
                <tr key={entity.id} className={`hover:bg-gray-50 ${!entity.is_active ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {entity.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider">
                      {entity.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{entity.email || '-'}</div>
                    <div className="text-gray-500 text-xs">{entity.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${entity.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {entity.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(entity)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      {entity.is_active && (
                        <button onClick={() => handleDelete(entity.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Desactivar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">
                {isEditing ? 'Editar Entidad' : 'Nueva Entidad'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input 
                    type="text" required 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="input-field" placeholder="Ej: Ayuntamiento de Alicante"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="input-field"
                  >
                    {ENTITY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="input-field" placeholder="contacto@entidad.es"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="input-field" placeholder="+34 900 000 000"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{isEditing ? 'Guardar Cambios' : 'Crear Entidad'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEntitiesPage;
