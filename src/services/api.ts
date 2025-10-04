import axios from 'axios';

const api = axios.create({
  baseURL: 'https://website-tmdt-ai.onrender.com/', // Ensure this matches your backend API address
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;