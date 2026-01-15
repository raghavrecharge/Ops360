/**
 * Profile Service - Profile management API calls
 */

import { storageService } from './storageService';

const API_BASE = import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || '';

export interface Profile {
  id: number;
  name: string;
  birth_date: string;
  birth_time?: string;
  birth_place: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  ayanamsa?: string;
  chart_style?: string;
}

const getAuthHeaders = () => {
  const token = storageService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const profileService = {
  async getProfiles(): Promise<Profile[]> {
    const response = await fetch(`${API_BASE}/api/profiles`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }

    return response.json();
  },

  async getProfile(profileId: number): Promise<Profile> {
    const response = await fetch(`${API_BASE}/api/profiles/${profileId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },

  async createProfile(profileData: Omit<Profile, 'id'>): Promise<Profile> {
    const params = new URLSearchParams();
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE}/api/profiles?${params.toString()}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to create profile');
    }

    return response.json();
  },

  async updateProfile(profileId: number, profileData: Partial<Profile>): Promise<Profile> {
    const response = await fetch(`${API_BASE}/api/profiles/${profileId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  },

  async deleteProfile(profileId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/profiles/${profileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete profile');
    }
  },

  // Local storage for selected profile
  getSelectedProfile(): Profile | null {
    return storageService.getSelectedProfile();
  },

  setSelectedProfile(profile: Profile): void {
    storageService.setSelectedProfile(profile);
  },

  clearSelectedProfile(): void {
    storageService.clearSelectedProfile();
  },
};

export default profileService;
