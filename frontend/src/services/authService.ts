import api from './api';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  id: number;
  email: string;
  full_name: string | null;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<LoginResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Store tokens
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  },

  async register(email: string, password: string, fullName?: string): Promise<RegisterResponse> {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    if (fullName) params.append('full_name', fullName);

    const response = await api.post<RegisterResponse>(`/api/auth/register?${params.toString()}`);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  async setupDemo(): Promise<{ email: string; password: string }> {
    const response = await api.post('/api/demo/setup');
    return response.data.credentials;
  },
};
