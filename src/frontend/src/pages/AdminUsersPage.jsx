import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, UserCheck, UserX, Search, RefreshCw } from 'lucide-react';
import adminService from '../services/admin.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Toast from '../components/common/Toast';

const ROLES = ['citizen', 'entity', 'moderator', 'admin'];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: '',
    page: 1,
    limit: 20
  });

  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(filters);
      setUsers(data.users);
      setMeta(data.meta);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.role, filters.isActive, filters.page, filters.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setToast({ message: 'Rol actualizado correctamente', type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al actualizar rol', type: 'error' });
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await adminService.toggleUserActive(userId);
      setToast({ message: 'Estado del usuario actualizado', type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al actualizar estado', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Total: {meta.total} usuarios registrados</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Rol</label>
            <select 
              value={filters.role} 
              onChange={e => setFilters(p => ({ ...p, role: e.target.value, page: 1 }))} 
              className="input-field py-2 text-sm"
            >
              <option value="">Todos los roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
            <select 
              value={filters.isActive} 
              onChange={e => setFilters(p => ({ ...p, isActive: e.target.value, page: 1 }))} 
              className="input-field py-2 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <button onClick={() => fetchUsers()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refrescar
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar email o nombre..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="input-field pl-10 py-2 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Buscar</button>
        </form>
      </div>

      {/* Table */}
      {error ? (
        <ErrorMessage message={error} />
      ) : loading && users.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="px-6 py-3 font-medium">Usuario</th>
                  <th className="px-6 py-3 font-medium">Rol</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium text-center">Incidencias</th>
                  <th className="px-6 py-3 font-medium">Registro</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {users.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No se encontraron usuarios</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.display_name}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-1.5"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-700">
                        {user.incident_count}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleToggleActive(user.id)}
                          title={user.is_active ? "Desactivar" : "Activar"}
                          className={`p-1.5 rounded transition-colors ${user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {user.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </button>
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
    </div>
  );
};

export default AdminUsersPage;
