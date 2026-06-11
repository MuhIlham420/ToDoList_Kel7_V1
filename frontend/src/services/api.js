import axios from 'axios';

const appBasePath = import.meta.env.BASE_URL || '/';

const appPath = (path) => {
  const base = appBasePath.endsWith('/') ? appBasePath.slice(0, -1) : appBasePath;
  return `${base}${path}`;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = appPath('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
