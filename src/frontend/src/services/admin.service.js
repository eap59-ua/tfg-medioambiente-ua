import api from './api';

const adminService = {
  // Stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  // Incidencias
  getIncidents: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/incidents?${params.toString()}`);
    return {
      incidents: response.data.data,
      meta: response.data.meta
    };
  },

  assignIncident: async (incidentId, entityId) => {
    const response = await api.put(`/admin/incidents/${incidentId}/assign`, { entityId });
    return response.data.data;
  },

  updateIncidentStatus: async (incidentId, status, note = '') => {
    const response = await api.put(`/admin/incidents/${incidentId}/status`, { status, note });
    return response.data.data;
  },

  // Usuarios
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/admin/users?${params.toString()}`);
    return {
      users: response.data.data,
      meta: response.data.meta
    };
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data.data;
  },

  toggleUserActive: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-active`);
    return response.data.data;
  },

  // Entidades Responsables
  getEntities: async () => {
    const response = await api.get('/admin/entities');
    return response.data.data;
  },

  createEntity: async (data) => {
    const response = await api.post('/admin/entities', data);
    return response.data.data;
  },

  updateEntity: async (id, data) => {
    const response = await api.put(`/admin/entities/${id}`, data);
    return response.data.data;
  },

  deleteEntity: async (id) => {
    const response = await api.delete(`/admin/entities/${id}`);
    return response.data.data;
  }
};

export default adminService;
