import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5255/api',
});

// Giriş yapıldığında Token'ı her isteğe otomatik ekler
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;