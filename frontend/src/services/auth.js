/* eslint-disable */
// Authentication service for handling login/register API calls
// Manages user authentication operations
import { apiEndpoints } from './api';

export const authService = {
  // Login user with email and password
  login: async (email, password) => {
    try {
      const response = await apiEndpoints.login({ email, password });
      console.log('Login response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await apiEndpoints.register(userData);
      console.log('Register response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiEndpoints.getProfile();
      console.log('Profile response:', response.data); // Debug log
      return response.data.user;
    } catch (error) {
      console.error('Profile error:', error.response?.data || error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Remove token
  clearToken: () => {
    localStorage.removeItem('token');
  }
};
