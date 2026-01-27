import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Attendance, Activity, Expense, DashboardStats, LoginCredentials, RegisterData } from '../types';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<{
      access_token: string;
      token_type: string;
      user: User;
    }>('/auth/login', credentials);
    return response.data;
  },
  register: async (data: RegisterData) => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

export const attendanceAPI = {
  markAttendance: async (data: {
    action: 'start' | 'end';
    latitude: number;
    longitude: number;
    accuracy?: number;
    photo?: string;
    notes?: string;
  }) => {
    const response = await api.post<Attendance>('/attendance', data);
    return response.data;
  },
  getToday: async () => {
    const response = await api.get<Attendance | null>('/attendance/today');
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get<Attendance[]>('/attendance/history');
    return response.data;
  },
};

export const activitiesAPI = {
  create: async (data: {
    description?: string;
    photo: string;
    latitude: number;
    longitude: number;
    activity_type?: string;
  }) => {
    const response = await api.post<Activity>('/activities', data);
    return response.data;
  },
  getToday: async () => {
    const response = await api.get<Activity[]>('/activities/today');
    return response.data;
  },
  getAll: async (dateFilter?: string) => {
    const response = await api.get<Activity[]>('/activities', {
      params: dateFilter ? { date_filter: dateFilter } : {},
    });
    return response.data;
  },
};

export const expensesAPI = {
  getCategories: async () => {
    const response = await api.get<{ categories: string[] }>('/expenses/categories');
    return response.data.categories;
  },
  create: async (data: {
    category: string;
    amount: number;
    description?: string;
    receipt_image?: string;
  }) => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },
  getToday: async () => {
    const response = await api.get<Expense[]>('/expenses/today');
    return response.data;
  },
  getTodayTotal: async () => {
    const response = await api.get<{ total: number; count: number }>('/expenses/today/total');
    return response.data;
  },
  getAll: async (dateFilter?: string) => {
    const response = await api.get<Expense[]>('/expenses', {
      params: dateFilter ? { date_filter: dateFilter } : {},
    });
    return response.data;
  },
};

export const dashboardAPI = {
  getMobileStats: async () => {
    const response = await api.get<DashboardStats>('/dashboard/mobile');
    return response.data;
  },
};

export default api;
