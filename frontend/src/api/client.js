
import axios from 'axios';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach authentication token to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message:
        error.response?.data?.message || error.message,
    });

    return Promise.reject(error);
  }
);

export default api;
