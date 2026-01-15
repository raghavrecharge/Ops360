/**
 * Storage Service - Local storage management
 */

const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  PROFILES: 'profiles',
  SELECTED_PROFILE: 'selected_profile',
};

export const storageService = {
  // Token management
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // User management
  getUser(): any {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  setUser(user: any): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Profile management
  getSelectedProfile(): any {
    const profile = localStorage.getItem(STORAGE_KEYS.SELECTED_PROFILE);
    return profile ? JSON.parse(profile) : null;
  },

  setSelectedProfile(profile: any): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROFILE, JSON.stringify(profile));
  },

  clearSelectedProfile(): void {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PROFILE);
  },

  // Clear all
  clearAll(): void {
    this.clearTokens();
    this.clearUser();
    this.clearSelectedProfile();
  },

  // Get recent accounts (for login history)
  getRecentAccounts(): Array<{ email: string; lastLogin: string }> {
    const accounts = localStorage.getItem('recent_accounts');
    return accounts ? JSON.parse(accounts) : [];
  },

  // Save recent account
  addRecentAccount(email: string): void {
    const accounts = this.getRecentAccounts();
    const existing = accounts.findIndex(a => a.email === email);
    if (existing >= 0) {
      accounts.splice(existing, 1);
    }
    accounts.unshift({ email, lastLogin: new Date().toISOString() });
    localStorage.setItem('recent_accounts', JSON.stringify(accounts.slice(0, 5)));
  },
};

export default storageService;
