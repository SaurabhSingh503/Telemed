// Authentication service for handling login/register API calls
// Manages user authentication operations
import { apiEndpoints } from './api';

export const authService = {
  // Login user with email and password
  login: async (email, password) => {
    const response = await apiEndpoints.login({ email, password });
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await apiEndpoints.register(userData);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiEndpoints.getProfile();
    return response.data.user;
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
