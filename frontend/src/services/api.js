import axios from 'axios';

// In production (Railway), VITE_API_BASE_URL is injected at build time.
// In local dev, it is undefined and we fall back to '/api' (handled by Vite proxy).
const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('csrm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const data = error.response ? error.response.data : null;

    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (data && data.message) {
      friendlyMessage = data.message;
    }

    if (status === 401) {
      // Clear token and user on 401
      localStorage.removeItem('csrm_token');
      localStorage.removeItem('csrm_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?sessionExpired=true';
      }
    } else if (status === 403) {
      console.warn('Access Denied (403):', friendlyMessage);
    } else if (status === 409) {
      console.warn('Booking Conflict (409):', friendlyMessage);
    } else if (status === 400) {
      console.warn('Validation/Bad Request (400):', friendlyMessage);
    } else if (status >= 500) {
      console.error('Server Error (500+):', friendlyMessage);
    }

    // Attach extracted message so caller components can display it easily
    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export default api;
