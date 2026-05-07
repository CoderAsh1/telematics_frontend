import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL
console.log('🌐 API Configured with Base URL:', API_BASE_URL);
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      // Handle authentication failures (Expired, Invalid, or Forbidden)
      const isExpired = data?.message === 'Token has expired.';
      const isInvalid = data?.message === 'Invalid token.';
      const isUnauthorized = status === 401 && localStorage.getItem('token');
      const isForbidden = status === 403 && localStorage.getItem('token');

      if (isExpired || isInvalid || isUnauthorized || isForbidden) {
        console.warn('🔑 Auth failure detected, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if we're not already on the login page to avoid loops
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
