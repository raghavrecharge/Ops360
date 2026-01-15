
import { UserAccount, UserProfile, BirthData } from '../types';

const KEYS = {
  ACCOUNT: 'astro_jyotish_account',
  RECENT_ACCOUNTS: 'astro_jyotish_recent_accounts',
  PROFILE: 'astro_jyotish_profile',
  PREFERENCES: 'astro_jyotish_prefs'
};

export const storageService = {
  saveAccount(account: UserAccount): void {
    localStorage.setItem(KEYS.ACCOUNT, JSON.stringify(account));
    this.addRecentAccount(account);
  },

  getAccount(): UserAccount | null {
    const data = localStorage.getItem(KEYS.ACCOUNT);
    return data ? JSON.parse(data) : null;
  },

  addRecentAccount(account: UserAccount): void {
    const recent = this.getRecentAccounts();
    const exists = recent.find(a => a.email === account.email);
    if (!exists) {
      const updated = [account, ...recent].slice(0, 5); // Keep last 5
      localStorage.setItem(KEYS.RECENT_ACCOUNTS, JSON.stringify(updated));
    }
  },

  getRecentAccounts(): UserAccount[] {
    const data = localStorage.getItem(KEYS.RECENT_ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getProfile(): UserProfile | null {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  clearAll(): void {
    // We clear current session but keep recent accounts list for convenience
    localStorage.removeItem(KEYS.ACCOUNT);
    localStorage.removeItem(KEYS.PROFILE);
  },

  hasSession(): boolean {
    return !!localStorage.getItem(KEYS.ACCOUNT);
  }
};
