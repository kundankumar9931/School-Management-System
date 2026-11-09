
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Handle unauthorized requests
    if (
      status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
