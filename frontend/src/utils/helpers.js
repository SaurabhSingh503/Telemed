/* eslint-disable no-useless-escape */
/* eslint-disable import/no-anonymous-default-export */
// Helper utility functions
// Common utility functions used throughout the application

// Date and time helpers
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    'MM/DD/YYYY': { month: '2-digit', day: '2-digit', year: 'numeric' },
    'MMM DD, YYYY': { month: 'short', day: 'numeric', year: 'numeric' },
    'MMMM DD, YYYY': { month: 'long', day: 'numeric', year: 'numeric' },
    'DD/MM/YYYY': { day: '2-digit', month: '2-digit', year: 'numeric' }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options['MM/DD/YYYY']);
};

export const formatTime = (date, format = '12h') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = format === '24h' 
    ? { hour: '2-digit', minute: '2-digit', hour12: false }
    : { hour: '2-digit', minute: '2-digit', hour12: true };
  
  return dateObj.toLocaleTimeString('en-US', options);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date, 'MMM DD, YYYY')} at ${formatTime(date)}`;
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date, 'MMM DD, YYYY');
};

// String helpers
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Number helpers
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (isNaN(amount)) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatNumber = (num, decimals = 0) => {
  if (isNaN(num)) return '';
  return Number(num).toFixed(decimals);
};

export const formatPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Array helpers
export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const removeDuplicates = (array, key) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    return array.filter((item, index, self) =>
      index === self.findIndex(t => t[key] === item[key])
    );
  }
  
  return [...new Set(array)];
};

// Object helpers
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(deepClone);
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

export const omit = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const result = { ...obj };
  
  keysArray.forEach(key => {
    delete result[key];
  });
  
  return result;
};

export const pick = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return {};
  
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const result = {};
  
  keysArray.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  });
  
  return result;
};

// URL helpers
export const buildQueryString = (params) => {
  if (!params || typeof params !== 'object') return '';
  
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString) => {
  if (!queryString || typeof queryString !== 'string') return {};
  
  const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
  const result = {};
  
  for (let [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

// File helpers
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  return filename.split('.').pop().toLowerCase();
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
};

// Validation helpers
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

export const isValidURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Color helpers
export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return null;
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Local Storage helpers
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

// Device detection
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTablet = () => {
  return /iPad|Android(?=.*Tablet)|Android(?=.*(?!Mobile))/i.test(navigator.userAgent);
};

export const isDesktop = () => {
  return !isMobile() && !isTablet();
};

// Error handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
      data: null
    };
  }
};

export default {
  // Date/Time
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  
  // String
  capitalize,
  capitalizeWords,
  truncateText,
  slugify,
  
  // Number
  formatCurrency,
  formatNumber,
  formatPhone,
  
  // Array
  groupBy,
  sortBy,
  removeDuplicates,
  
  // Object
  deepClone,
  omit,
  pick,
  
  // URL
  buildQueryString,
  parseQueryString,
  
  // File
  formatFileSize,
  getFileExtension,
  isImageFile,
  
  // Validation
  isValidEmail,
  isValidPhone,
  isValidURL,
  
  // Color
  hexToRgb,
  rgbToHex,
  
  // Storage
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  
  // Device
  isMobile,
  isTablet,
  isDesktop,
  
  // Error
  handleApiError
};
