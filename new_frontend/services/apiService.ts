
import { UserAccount, UserProfile, BirthData } from '../types';
import { storageService } from './storageService';

/**
 * apiService acts as the bridge between the UI and the Data Layer.
 * Currently, it uses storageService (localStorage), but is structured
 * to be swapped with real 'fetch' calls effortlessly.
 */
export const apiService = {
  // Replace this with your actual backend URL
  BASE_URL: 'https://api.your-backend.com/v1',

  async login(credentials: { email: string; username?: string; password?: string }): Promise<UserAccount> {
    // SIMULATED BACKEND DELAY
    await new Promise(resolve => setTimeout(resolve, 1200));

    /* 
    // REAL BACKEND INTEGRATION TEMPLATE:
    const response = await fetch(`${this.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Authentication Failed');
    return await response.json();
    */

    const account: UserAccount = {
      email: credentials.email,
      username: credentials.username || credentials.email.split('@')[0],
      joinedDate: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username || 'Astro'}`
    };
    
    storageService.saveAccount(account);
    return account;
  },

  async saveUserProfile(profile: UserProfile): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    /* 
    // REAL BACKEND INTEGRATION TEMPLATE:
    const response = await fetch(`${this.BASE_URL}/user/profile`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profile)
    });
    return await response.json();
    */

    storageService.saveProfile(profile);
    return profile;
  },

  async getUserProfile(): Promise<UserProfile | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return storageService.getProfile();
  },

  async getAccount(): Promise<UserAccount | null> {
    return storageService.getAccount();
  },

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    storageService.clearAll();
  }
};
