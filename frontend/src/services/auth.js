/* eslint-disable */
// Authentication service for handling login/register API calls
// Manages user authentication operations
import { apiEndpoints } from './api';

export const authService = {
  // Login user with email and password
  login: async (email, password) => {
    try {
      console.log('🔧 AuthService login called:', email);
      const response = await apiEndpoints.login({ email, password });
      console.log('🔧 AuthService login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔧 AuthService login error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      console.log('🔧 AuthService register called:', userData.email);
      const response = await apiEndpoints.register(userData);
      console.log('🔧 AuthService register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔧 AuthService register error:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      console.log('🔧 AuthService getProfile called');
      const response = await apiEndpoints.getProfile();
      console.log('🔧 AuthService getProfile response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('🔧 AuthService getProfile error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    console.log('🔧 AuthService isAuthenticated:', !!token);
    return !!token;
  },

  // Get stored token
  getToken: () => {
    const token = localStorage.getItem('token');
    console.log('🔧 AuthService getToken:', token ? 'Found' : 'Not found');
    return token;
  },

  // Remove token
  clearToken: () => {
    console.log('🔧 AuthService clearToken called');
    localStorage.removeItem('token');
  }
};
