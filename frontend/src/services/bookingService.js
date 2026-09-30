import api from './api';

export const bookingService = {
  async getMyBookings() {
    const res = await api.get('/bookings');
    return res.data.data;
  },

  async getBookingById(id) {
    const res = await api.get(`/bookings/${id}`);
    return res.data.data;
  },

  async createBooking(data) {
    const res = await api.post('/bookings', data);
    return res.data.data;
  },

  async updateBooking(id, data) {
    const res = await api.put(`/bookings/${id}`, data);
    return res.data.data;
  },

  async cancelBooking(id) {
    const res = await api.put(`/bookings/${id}/cancel`);
    return res.data.data;
  }
};
