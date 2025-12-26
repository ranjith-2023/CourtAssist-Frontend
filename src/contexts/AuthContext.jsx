import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /** ───── TOKEN MANAGEMENT ───── */
  const getToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('accessToken');
  };

  const setToken = (token, rememberMe = false) => {
    // Clear both storage first
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('accessToken');

    if (rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('accessToken', token);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('accessToken');
  };

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  /** ───── USER MANAGEMENT ───── */
  const fetchCurrentUser = async () => {
    try {
      const userData = await userService.getUserProfile();
      const transformedUser = {
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
        mobile: userData.mobileNo || userData.mobile,
        role: (userData.role || 'USER').toLowerCase(),
        advocateName: userData.advocateName,
        isVerified: userData.isVerified,
      };

      setUser(transformedUser);
      setIsAuthenticated(true);
      setError(null);
      return transformedUser;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearTokens();
      setIsAuthenticated(false);
      throw new Error('Failed to fetch user data');
    }
  };

  const initializeAuth = async () => {
    try {
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        await fetchCurrentUser();
      } else {
        clearTokens();
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      clearTokens();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  /** ───── AUTH ACTIONS ───── */
  const login = async (identifier, password, rememberMe = false) => {
    try {
      setAuthLoading(true);
      setError(null);

      const response = await authService.login(identifier, password);

      if (response.accessToken) {
        setToken(response.accessToken, rememberMe);
        await fetchCurrentUser();
        return { success: true };
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      const message = error.data?.error || error.message || 'Login failed';
      setError(message);
      setIsAuthenticated(false);
      return {
        success: false,
        error: message,
        status: error.status,
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setAuthLoading(true);
      setError(null);

      const response = await authService.register(userData);

      if (response.accessToken) {
        setToken(response.accessToken, false);
        const user = await fetchCurrentUser();
        return { success: true, user };
      } else {
        // Registration successful but no immediate login
        return { success: true };
      }
    } catch (error) {
      const message = error.data?.error || error.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  /** ───── HELPERS ───── */
  const hasRole = (requiredRole) => {
    if (!user?.role) return false;
    return user.role.toLowerCase() === requiredRole.toLowerCase();
  };

  /** ───── CONTEXT VALUE ───── */
  const value = {
    user,
    loading,
    authLoading,
    error,
    isAuthenticated,
    // Functions
    login,
    register,
    logout,
    hasRole,
    clearError: () => setError(null),
    setUser,
    setIsAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
