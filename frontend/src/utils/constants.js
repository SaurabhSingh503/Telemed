/* eslint-disable no-useless-escape */
/* eslint-disable import/no-anonymous-default-export */
// Application constants and configuration
// Centralized configuration values and constants

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:9000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 30
};


// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'telemedicine_token',
  REFRESH_TOKEN_KEY: 'telemedicine_refresh_token',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  APPOINTMENTS: '/appointments',
  HEALTH_RECORDS: '/health-records',
  SYMPTOM_CHECKER: '/symptom-checker',
  PHARMACY_FINDER: '/pharmacies',
  VIDEO_CALL: '/video-call'
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Appointment Types
export const APPOINTMENT_TYPES = {
  VIDEO: 'video',
  IN_PERSON: 'in-person'
};

// Health Record Categories
export const HEALTH_CATEGORIES = {
  CONSULTATION: 'consultation',
  DIAGNOSIS: 'diagnosis',
  PRESCRIPTION: 'prescription',
  LABORATORY: 'laboratory',
  RADIOLOGY: 'radiology'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// File Upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILES: 10
};

// Geolocation
export const LOCATION_CONFIG = {
  DEFAULT_RADIUS: 10, // 10 km
  MAX_RADIUS: 50, // 50 km
  HIGH_ACCURACY: true,
  TIMEOUT: 5000, // 5 seconds
  MAXIMUM_AGE: 300000 // 5 minutes
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Form Validation
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]{10,15}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
  INPUT_DATE: 'YYYY-MM-DD',
  INPUT_DATETIME: 'YYYY-MM-DDTHH:mm',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  UNSUPPORTED_FILE_TYPE: 'File type is not supported.',
  LOCATION_DENIED: 'Location access denied. Please enable location services.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  APPOINTMENT_BOOKED: 'Appointment booked successfully',
  RECORD_SAVED: 'Health record saved successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_SENT: 'Email sent successfully'
};

// PWA Configuration
export const PWA_CONFIG = {
  CACHE_NAME: 'telemedicine-v1',
  CACHE_URLS: [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json'
  ],
  OFFLINE_URL: '/offline.html'
};

// Jitsi Meet Configuration
export const JITSI_CONFIG = {
  DOMAIN: 'meet.jit.si',
  DEFAULT_ROOM_PREFIX: 'telemedicine-',
  CONFIG_OVERWRITE: {
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    enableWelcomePage: false,
    prejoinPageEnabled: false
  }
};

// Theme Configuration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#2196f3',
  SECONDARY_COLOR: '#4caf50',
  ERROR_COLOR: '#f44336',
  WARNING_COLOR: '#ff9800',
  INFO_COLOR: '#2196f3',
  SUCCESS_COLOR: '#4caf50'
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 900,
  LG: 1200,
  XL: 1536
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'telemedicine_preferences',
  LANGUAGE: 'telemedicine_language',
  THEME: 'telemedicine_theme',
  RECENT_SEARCHES: 'telemedicine_recent_searches'
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  USER_ROLES,
  ROUTES,
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPES,
  HEALTH_CATEGORIES,
  NOTIFICATION_TYPES,
  UPLOAD_CONFIG,
  LOCATION_CONFIG,
  PAGINATION,
  VALIDATION_RULES,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PWA_CONFIG,
  JITSI_CONFIG,
  THEME_CONFIG,
  BREAKPOINTS,
  STORAGE_KEYS
};
