/* eslint-disable */
// API service for making HTTP requests to backend
// Centralizes API calls and handles authentication headers
import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

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
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.params); // Debug log
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data); // Debug log
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    
    // If token is invalid, redirect to login
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
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
  
  // Pharmacies - THIS IS THE KEY ONE
  getPharmacies: (params) => {
    console.log('Calling pharmacy API with params:', params);
    return api.get('/pharmacies', { params });
  },
  
  // Symptom Checker
  checkSymptoms: (symptoms) => api.post('/symptom-checker', { symptoms }),

  // Doctor Verification
  submitDoctorVerification: (formData) => {
    return api.post('/doctor-verification/submit-application', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getDoctorVerificationStatus: () => api.get('/doctor-verification/status'),
  
 // Admin endpoints
  getPendingVerifications: () => api.get('/doctor-verification/pending'),
  getVerifiedDoctors: () => api.get('/doctor-verification/verified'),
  approveDoctorVerification: (doctorId, data) => api.post(`/doctor-verification/approve/${doctorId}`, data),
  rejectDoctorVerification: (doctorId, data) => api.post(`/doctor-verification/reject/${doctorId}`, data)
};

export default api;
