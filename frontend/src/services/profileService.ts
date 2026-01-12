import api from './api';

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

export interface CreateProfileInput {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsa?: string;
}

export const profileService = {
  async getProfiles(): Promise<Profile[]> {
    const response = await api.get<Profile[]>('/api/profiles');
    return response.data;
  },

  async getProfile(profileId: number): Promise<Profile> {
    const response = await api.get<Profile>(`/api/profiles/${profileId}`);
    return response.data;
  },

  async createProfile(input: CreateProfileInput): Promise<{ id: number; name: string; message: string }> {
    const params = new URLSearchParams();
    params.append('name', input.name);
    params.append('birth_date', input.birth_date);
    params.append('birth_time', input.birth_time);
    params.append('birth_place', input.birth_place);
    params.append('latitude', input.latitude.toString());
    params.append('longitude', input.longitude.toString());
    params.append('timezone', input.timezone);
    if (input.ayanamsa) params.append('ayanamsa', input.ayanamsa);

    const response = await api.post(`/api/profiles?${params.toString()}`);
    return response.data;
  },

  async setupDemo(): Promise<{ status: string; message: string; credentials: { email: string; password: string } }> {
    const response = await api.post('/api/demo/setup');
    return response.data;
  },
};
