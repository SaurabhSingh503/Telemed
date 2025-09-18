/* eslint-disable */
// Authentication context for managing user state with doctor verification support
// Provides authentication methods and user data across the app
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

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

  // Check for existing token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token and get user profile
          const userProfile = await authService.getProfile();
          setUser(userProfile);
        }
      } catch (error) {
        // Token invalid, remove it
        localStorage.removeItem('token');
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function with verification handling
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Check if it's a verification issue (403 status)
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        return { 
          success: false, 
          error: error.response.data.message,
          requiresVerification: true,
          verificationStatus: error.response.data.verificationStatus
        };
      }
      
      // Regular login error (401, 400, etc.)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update user after verification
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
