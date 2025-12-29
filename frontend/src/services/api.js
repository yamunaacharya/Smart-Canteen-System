import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401 globally
api.interceptors.response.use((res) => res, (error) => {
  if (error?.response?.status === 401) {
    // simple global logout behavior
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // redirect to login to force re-auth
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
