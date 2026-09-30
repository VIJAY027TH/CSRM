import api from './api';

export const resourceService = {
  async getResources(params = {}) {
    const res = await api.get('/resources', { params });
    return res.data.data;
  },

  async getResourceById(id) {
    const res = await api.get(`/resources/${id}`);
    return res.data.data;
  },

  async getResourceSlots(id, dateString) {
    const res = await api.get(`/resources/${id}/slots`, {
      params: { date: dateString }
    });
    return res.data.data;
  },

  async createResource(data) {
    const res = await api.post('/resources', data);
    return res.data.data;
  },

  async updateResource(id, data) {
    const res = await api.put(`/resources/${id}`, data);
    return res.data.data;
  },

  async deleteResource(id) {
    const res = await api.delete(`/resources/${id}`);
    return res.data;
  }
};
