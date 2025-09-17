// Validation utilities for data integrity
// Common validation functions used across controllers
const validator = require('validator');

// Validate email format
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate password strength
const isValidPassword = (password) => {
  // At least 6 characters, contains letter and number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

// Validate phone number
const isValidPhone = (phone) => {
  // Basic phone validation (10-15 digits)
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

// Validate date format
const isValidDate = (date) => {
  return validator.isISO8601(date);
};

// Validate required fields
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      missingFields.push(field);
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(str.trim());
};

// Validate user registration data
const validateUserRegistration = (userData) => {
  const errors = [];
  
  // Required fields check
  const requiredFields = ['firstName', 'lastName', 'email', 'password'];
  const { isValid, missingFields } = validateRequiredFields(userData, requiredFields);
  
  if (!isValid) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Email validation
  if (userData.email && !isValidEmail(userData.email)) {
    errors.push('Invalid email format');
  }
  
  // Password validation
  if (userData.password && !isValidPassword(userData.password)) {
    errors.push('Password must be at least 6 characters and contain both letters and numbers');
  }
  
  // Phone validation (if provided)
  if (userData.phone && !isValidPhone(userData.phone)) {
    errors.push('Invalid phone number format');
  }
  
  // Role validation
  if (userData.role && !['patient', 'doctor'].includes(userData.role)) {
    errors.push('Role must be either patient or doctor');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate appointment data
const validateAppointmentData = (appointmentData) => {
  const errors = [];
  
  // Required fields
  const requiredFields = ['doctorId', 'appointmentDate'];
  const { isValid, missingFields } = validateRequiredFields(appointmentData, requiredFields);
  
  if (!isValid) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Date validation
  if (appointmentData.appointmentDate) {
    const appointmentDate = new Date(appointmentData.appointmentDate);
    const now = new Date();
    
    if (appointmentDate <= now) {
      errors.push('Appointment date must be in the future');
    }
  }
  
  // Type validation
  if (appointmentData.type && !['video', 'in-person'].includes(appointmentData.type)) {
    errors.push('Appointment type must be either video or in-person');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidDate,
  validateRequiredFields,
  sanitizeString,
  validateUserRegistration,
  validateAppointmentData
};
