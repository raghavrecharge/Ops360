/**
 * Auth Service - Authentication API calls
 */

import { storageService } from './storageService';

const API_BASE = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || '';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
  };
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    
    // Store tokens
    storageService.setToken(data.access_token);
    storageService.setRefreshToken(data.refresh_token);
    storageService.setUser(data.user);

    return data;
  },

  async register(email: string, password: string, fullName?: string): Promise<any> {
    const response = await fetch(`${API_BASE}/api/auth/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}${fullName ? `&full_name=${encodeURIComponent(fullName)}` : ''}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  },

  async getCurrentUser(): Promise<User | null> {
    const token = storageService.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        return null;
      }

      return response.json();
    } catch {
      return null;
    }
  },

  async setupDemo(): Promise<any> {
    const response = await fetch(`${API_BASE}/api/demo/setup`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Demo setup failed');
    }

    return response.json();
  },

  logout(): void {
    storageService.clearAll();
  },

  isAuthenticated(): boolean {
    return !!storageService.getToken();
  },

  getToken(): string | null {
    return storageService.getToken();
  },

  getStoredUser(): any {
    return storageService.getUser();
  },
};

export default authService;
