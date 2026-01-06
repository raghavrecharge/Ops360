import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to restore auth state:', e);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      
      // Store token and user in context and localStorage
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      
      // Also set the old keys for backward compatibility with existing code
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthorized = (requiredRoles) => {
    if (!isAuthenticated || !user) {
      return false;
    }

    // If no specific roles required, just check authentication
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user's role matches any of the required roles
    return requiredRoles.includes(user.role);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    isAuthorized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
