import api from './api';

export const adminService = {
  async getAllUsers() {
    const res = await api.get('/admin/users');
    return res.data.data;
  },

  async getPendingUsers() {
    const res = await api.get('/admin/users/pending');
    return res.data.data;
  },

  async approveUser(id) {
    const res = await api.put(`/admin/users/${id}/approve`);
    return res.data.data;
  },

  async rejectUser(id) {
    const res = await api.put(`/admin/users/${id}/reject`);
    return res.data.data;
  },

  async updateUserStatus(id, status) {
    const res = await api.put(`/admin/users/${id}/status`, { status });
    return res.data.data;
  },

  async updateUserRole(id, role) {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data.data;
  },

  async getAllBookings() {
    const res = await api.get('/admin/bookings');
    return res.data.data;
  },

  async updateBooking(id, data) {
    const res = await api.put(`/admin/bookings/${id}`, data);
    return res.data.data;
  },

  async cancelBooking(id) {
    const res = await api.put(`/admin/bookings/${id}/cancel`);
    return res.data.data;
  },

  async getDashboardStats() {
    const res = await api.get('/admin/reports/dashboard');
    return res.data.data;
  },

  async getUtilizationReport() {
    const res = await api.get('/admin/reports/utilization');
    return res.data.data;
  },

  async getConflictReport() {
    const res = await api.get('/admin/reports/conflicts');
    return res.data.data;
  },

  async getUserActivityReport() {
    const res = await api.get('/admin/reports/user-activity');
    return res.data.data;
  },

  async getAuditLogs(params = {}) {
    const res = await api.get('/admin/audit', { params });
    return res.data.data;
  }
};
