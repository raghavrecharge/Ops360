import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getOne: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
};

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
};

export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  getOne: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
};

export const vendorsAPI = {
  getAll: () => api.get('/vendors'),
  getOne: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
};

export const vehiclesAPI = {
  getAll: () => api.get('/vehicles'),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
};

export const driversAPI = {
  getAll: () => api.get('/drivers'),
  getOne: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
};

export const promotersAPI = {
  getAll: () => api.get('/promoters'),
  create: (data) => api.post('/promoters', data),
};

export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  approve: (id) => api.patch(`/expenses/${id}/approve`),
};

export const reportsAPI = {
  getAll: () => api.get('/reports'),
  getByCampaign: (id) => api.get(`/reports/campaign/${id}`),
  create: (data) => api.post('/reports', data),
};
