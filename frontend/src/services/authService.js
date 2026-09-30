import api from './api';

export const authService = {
  async login(usernameOrEmail, password) {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    if (res.data && res.data.data) {
      const authData = res.data.data;
      localStorage.setItem('csrm_token', authData.token);
      localStorage.setItem('csrm_user', JSON.stringify({
        id: authData.id,
        username: authData.username,
        email: authData.email,
        role: authData.role,
        status: authData.status,
      }));
      return authData;
    }
    throw new Error('Invalid login response');
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  logout() {
    localStorage.removeItem('csrm_token');
    localStorage.removeItem('csrm_user');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('csrm_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('csrm_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('csrm_token');
  }
};
