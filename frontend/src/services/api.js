// API service for making HTTP requests to backend
// Centralizes API calls and handles authentication headers
import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  
  // Health Records
  getHealthRecords: () => api.get('/health-records'),
  createHealthRecord: (data) => api.post('/health-records', data),
  
  // Appointments
  getAppointments: () => api.get('/appointments'),
  createAppointment: (data) => api.post('/appointments', data),
  getDoctors: () => api.get('/appointments/doctors'),
  
  // Pharmacies
  getPharmacies: (params) => api.get('/pharmacies', { params }),
  
  // Symptom Checker
  checkSymptoms: (symptoms) => api.post('/symptom-checker', { symptoms })
};

export default api;
