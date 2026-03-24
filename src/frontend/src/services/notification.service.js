import api from './api';

const notificationService = {
  getNotifications: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/notifications?${params.toString()}`);
    return {
      notifications: response.data.data,
      meta: response.data.meta
    };
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

export default notificationService;
