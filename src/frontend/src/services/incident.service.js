import api from './api';

export const getIncidents = async (params = {}) => {
  const { data } = await api.get('/incidents', { params });
  return { incidents: data.data, meta: data.meta };
};

export const getIncidentById = async (id) => {
  const { data } = await api.get(`/incidents/${id}`);
  return data.data;
};

export const createIncident = async (formData) => {
  const { data } = await api.post('/incidents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const updateIncident = async (id, updates) => {
  const { data } = await api.put(`/incidents/${id}`, updates);
  return data.data;
};

export const deleteIncident = async (id) => {
  await api.delete(`/incidents/${id}`);
};

export const getNearbyIncidents = async (lat, lng, radius = 5, filters = {}) => {
  const { data } = await api.get('/incidents/nearby', { params: { lat, lng, radius, ...filters } });
  return data.data;
};

export const voteIncident = async (id) => {
  const { data } = await api.post(`/incidents/${id}/vote`);
  return data.data;
};

export const unvoteIncident = async (id) => {
  const { data } = await api.delete(`/incidents/${id}/vote`);
  return data.data;
};

export const followIncident = async (id) => {
  await api.post(`/incidents/${id}/follow`);
};

export const unfollowIncident = async (id) => {
  await api.delete(`/incidents/${id}/follow`);
};

export const getComments = async (id, params = {}) => {
  const { data } = await api.get(`/incidents/${id}/comments`, { params });
  return { comments: data.data, meta: data.meta };
};

export const addComment = async (id, content, parentId = null) => {
  const { data } = await api.post(`/incidents/${id}/comments`, { content, parentId });
  return data.data;
};

export const getStatusHistory = async (id) => {
  const { data } = await api.get(`/incidents/${id}/history`);
  return data.data;
};
