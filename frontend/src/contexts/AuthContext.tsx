import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';
import { profileService, Profile } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  profiles: Profile[];
  selectedProfile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  loadProfiles: () => Promise<void>;
  selectProfile: (profile: Profile) => void;
  createProfile: (input: any) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
      loadProfiles();
    }
    setIsLoading(false);

    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
      setProfiles([]);
      setSelectedProfile(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const loadProfiles = async () => {
    try {
      const profileList = await profileService.getProfiles();
      setProfiles(profileList);
      if (profileList.length > 0 && !selectedProfile) {
        setSelectedProfile(profileList[0]);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      await loadProfiles();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      await authService.register(email, password, fullName);
      // Auto login after registration
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfiles([]);
    setSelectedProfile(null);
  };

  const selectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
  };

  const createProfile = async (input: any): Promise<Profile> => {
    const result = await profileService.createProfile(input);
    await loadProfiles();
    const newProfile = profiles.find(p => p.id === result.id);
    if (newProfile) {
      setSelectedProfile(newProfile);
      return newProfile;
    }
    // Reload and find
    const reloaded = await profileService.getProfiles();
    setProfiles(reloaded);
    const created = reloaded.find(p => p.id === result.id);
    if (created) {
      setSelectedProfile(created);
      return created;
    }
    throw new Error('Profile created but not found');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profiles,
        selectedProfile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loadProfiles,
        selectProfile,
        createProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
