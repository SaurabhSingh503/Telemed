/* eslint-disable */
// Authentication context with proper login/logout handling
// Manages user state and authentication operations
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
  const [error, setError] = useState('');

  // Initialize user state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing auth state...');
        const token = authService.getToken();
        
        if (token) {
          console.log('📧 Token found, fetching user profile...');
          try {
            const userData = await authService.getProfile();
            console.log('✅ User profile loaded:', userData);
            setUser(userData);
          } catch (profileError) {
            console.error('❌ Failed to load profile:', profileError);
            // Token might be invalid, clear it
            authService.clearToken();
            setUser(null);
          }
        } else {
          console.log('❌ No token found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        authService.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔑 Login attempt for:', email);
      setError('');
      setLoading(true);

      const result = await authService.login(email, password);
      console.log('📧 Login API response:', result);

      if (result.success && result.token && result.user) {
        // Store token
        localStorage.setItem('token', result.token);
        
        // Set user state
        setUser(result.user);
        
        console.log('✅ Login successful:', result.user);
        return { success: true, user: result.user };
      } else {
        const errorMessage = result.message || 'Login failed';
        console.error('❌ Login failed:', errorMessage);
        setError(errorMessage);
        
        return { 
          success: false, 
          error: errorMessage,
          requiresVerification: result.requiresVerification,
          verificationStatus: result.verificationStatus
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      let errorMessage = 'Login failed';
      let requiresVerification = false;
      let verificationStatus = null;
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        requiresVerification = error.response.data.requiresVerification || false;
        verificationStatus = error.response.data.verificationStatus || null;
      }
      
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        requiresVerification,
        verificationStatus
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('📝 Registration attempt for:', userData.email);
      setError('');
      setLoading(true);

      const result = await authService.register(userData);
      console.log('📧 Register API response:', result);

      if (result.success && result.token && result.user) {
        // Store token
        localStorage.setItem('token', result.token);
        
        // Set user state
        setUser(result.user);
        
        console.log('✅ Registration successful:', result.user);
        return { success: true, user: result.user };
      } else {
        const errorMessage = result.message || 'Registration failed';
        console.error('❌ Registration failed:', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 Logging out user...');
    
    // Clear token from storage
    authService.clearToken();
    
    // Clear user state
    setUser(null);
    setError('');
    
    console.log('✅ Logout successful');
  };

  // Update user function (for profile updates)
  const updateUser = (updatedUserData) => {
    console.log('🔄 Updating user data:', updatedUserData);
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    setError // For clearing errors from components
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
