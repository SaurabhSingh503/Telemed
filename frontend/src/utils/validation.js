/* eslint-disable no-unused-vars */
/* eslint-disable import/no-anonymous-default-export */
// Client-side validation utilities
// Form validation rules and functions
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

// Base validation class
class Validator {
  constructor() {
    this.errors = {};
  }

  // Add error message
  addError(field, message) {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  }

  // Clear errors for field
  clearErrors(field) {
    if (field) {
      delete this.errors[field];
    } else {
      this.errors = {};
    }
  }

  // Check if validation passed
  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  // Get all errors
  getErrors() {
    return this.errors;
  }

  // Get errors for specific field
  getFieldErrors(field) {
    return this.errors[field] || [];
  }
}

// User registration validation
export const validateRegistration = (data) => {
  const validator = new Validator();

  // First name validation
  if (!data.firstName || data.firstName.trim().length === 0) {
    validator.addError('firstName', 'First name is required');
  } else if (data.firstName.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    validator.addError('firstName', `First name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`);
  } else if (data.firstName.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    validator.addError('firstName', `First name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`);
  }

  // Last name validation
  if (!data.lastName || data.lastName.trim().length === 0) {
    validator.addError('lastName', 'Last name is required');
  } else if (data.lastName.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    validator.addError('lastName', `Last name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`);
  } else if (data.lastName.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    validator.addError('lastName', `Last name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`);
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    validator.addError('email', 'Email is required');
  } else if (!VALIDATION_RULES.EMAIL_REGEX.test(data.email)) {
    validator.addError('email', 'Please enter a valid email address');
  }

  // Password validation
  if (!data.password || data.password.length === 0) {
    validator.addError('password', 'Password is required');
  } else if (data.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    validator.addError('password', `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`);
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(data.password)) {
    validator.addError('password', 'Password must contain both letters and numbers');
  }

  // Phone validation (optional)
  if (data.phone && data.phone.trim().length > 0) {
    if (!VALIDATION_RULES.PHONE_REGEX.test(data.phone)) {
      validator.addError('phone', 'Please enter a valid phone number');
    }
  }

  // Date of birth validation (optional)
  if (data.dateOfBirth && data.dateOfBirth.trim().length > 0) {
    const birthDate = new Date(data.dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    
    if (isNaN(birthDate.getTime())) {
      validator.addError('dateOfBirth', 'Please enter a valid date');
    } else if (birthDate > now) {
      validator.addError('dateOfBirth', 'Birth date cannot be in the future');
    } else if (age > 150) {
      validator.addError('dateOfBirth', 'Please enter a valid birth date');
    }
  }

  // Role validation
  if (!data.role || !['patient', 'doctor'].includes(data.role)) {
    validator.addError('role', 'Please select a valid role');
  }

  // Specialization validation for doctors
  if (data.role === 'doctor') {
    if (!data.specialization || data.specialization.trim().length === 0) {
      validator.addError('specialization', 'Specialization is required for doctors');
    }
  }

  return validator;
};

// User login validation
export const validateLogin = (data) => {
  const validator = new Validator();

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    validator.addError('email', 'Email is required');
  } else if (!VALIDATION_RULES.EMAIL_REGEX.test(data.email)) {
    validator.addError('email', 'Please enter a valid email address');
  }

  // Password validation
  if (!data.password || data.password.length === 0) {
    validator.addError('password', 'Password is required');
  }

  return validator;
};

// Appointment validation
export const validateAppointment = (data) => {
  const validator = new Validator();

  // Doctor validation
  if (!data.doctorId) {
    validator.addError('doctorId', 'Please select a doctor');
  }

  // Date validation
  if (!data.appointmentDate) {
    validator.addError('appointmentDate', 'Appointment date is required');
  } else {
    const appointmentDate = new Date(data.appointmentDate);
    const now = new Date();
    
    if (isNaN(appointmentDate.getTime())) {
      validator.addError('appointmentDate', 'Please enter a valid date and time');
    } else if (appointmentDate <= now) {
      validator.addError('appointmentDate', 'Appointment must be scheduled for a future date and time');
    } else if (appointmentDate > new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)) {
      validator.addError('appointmentDate', 'Appointment cannot be scheduled more than a year in advance');
    }
  }

  // Type validation
  if (!data.type || !['video', 'in-person'].includes(data.type)) {
    validator.addError('type', 'Please select a valid appointment type');
  }

  // Reason validation (optional)
  if (data.reason && data.reason.trim().length > 500) {
    validator.addError('reason', 'Reason must be less than 500 characters');
  }

  return validator;
};

// Health record validation
export const validateHealthRecord = (data) => {
  const validator = new Validator();

  // At least one of diagnosis or symptoms is required
  if ((!data.diagnosis || data.diagnosis.trim().length === 0) && 
      (!data.symptoms || data.symptoms.trim().length === 0)) {
    validator.addError('general', 'Either diagnosis or symptoms must be provided');
  }

  // Diagnosis validation
  if (data.diagnosis && data.diagnosis.trim().length > 1000) {
    validator.addError('diagnosis', 'Diagnosis must be less than 1000 characters');
  }

  // Symptoms validation
  if (data.symptoms && data.symptoms.trim().length > 1000) {
    validator.addError('symptoms', 'Symptoms must be less than 1000 characters');
  }

  // Prescription validation
  if (data.prescription && data.prescription.trim().length > 2000) {
    validator.addError('prescription', 'Prescription must be less than 2000 characters');
  }

  // Notes validation
  if (data.notes && data.notes.trim().length > 2000) {
    validator.addError('notes', 'Notes must be less than 2000 characters');
  }

  // Vitals validation
  if (data.vitals) {
    const vitals = typeof data.vitals === 'string' ? JSON.parse(data.vitals) : data.vitals;
    
    // Blood pressure validation
    if (vitals.bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(vitals.bloodPressure)) {
      validator.addError('vitals.bloodPressure', 'Blood pressure must be in format XXX/XX (e.g., 120/80)');
    }
    
    // Temperature validation
    if (vitals.temperature && (isNaN(vitals.temperature) || vitals.temperature < 90 || vitals.temperature > 110)) {
      validator.addError('vitals.temperature', 'Temperature must be a number between 90 and 110°F');
    }
    
    // Heart rate validation
    if (vitals.heartRate && (isNaN(vitals.heartRate) || vitals.heartRate < 30 || vitals.heartRate > 200)) {
      validator.addError('vitals.heartRate', 'Heart rate must be a number between 30 and 200 bpm');
    }
    
    // Weight validation
    if (vitals.weight && (isNaN(vitals.weight) || vitals.weight < 1 || vitals.weight > 1000)) {
      validator.addError('vitals.weight', 'Weight must be a number between 1 and 1000 lbs');
    }
    
    // Height validation
    if (vitals.height && (isNaN(vitals.height) || vitals.height < 12 || vitals.height > 100)) {
      validator.addError('vitals.height', 'Height must be a number between 12 and 100 inches');
    }
    
    // Oxygen saturation validation
    if (vitals.oxygenSaturation && (isNaN(vitals.oxygenSaturation) || vitals.oxygenSaturation < 70 || vitals.oxygenSaturation > 100)) {
      validator.addError('vitals.oxygenSaturation', 'Oxygen saturation must be a number between 70 and 100%');
    }
  }

  return validator;
};

// Symptom checker validation
export const validateSymptoms = (symptoms) => {
  const validator = new Validator();

  if (!Array.isArray(symptoms)) {
    validator.addError('symptoms', 'Symptoms must be provided as a list');
  } else if (symptoms.length === 0) {
    validator.addError('symptoms', 'At least one symptom is required');
  } else if (symptoms.length > 10) {
    validator.addError('symptoms', 'Maximum 10 symptoms allowed');
  } else {
    // Validate individual symptoms
    symptoms.forEach((symptom, index) => {
      if (typeof symptom !== 'string' || symptom.trim().length === 0) {
        validator.addError('symptoms', `Symptom ${index + 1} is invalid`);
      } else if (symptom.trim().length > 100) {
        validator.addError('symptoms', `Symptom ${index + 1} is too long (max 100 characters)`);
      }
    });
  }

  return validator;
};

// File upload validation
export const validateFile = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  const validator = new Validator();

  if (!file) {
    validator.addError('file', 'Please select a file');
    return validator;
  }

  // File size validation
  if (file.size > maxSize) {
    validator.addError('file', `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  // File type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    validator.addError('file', `File type must be one of: ${allowedTypes.join(', ')}`);
  }

  // File name validation
  if (file.name.length > 255) {
    validator.addError('file', 'File name is too long');
  }

  return validator;
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const validator = new Validator();
  let strength = 0;
  const feedback = [];

  if (!password || password.length === 0) {
    validator.addError('password', 'Password is required');
    return { validator, strength: 0, feedback };
  }

  // Length check
  if (password.length >= 8) {
    strength += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Include numbers');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('Include special characters');
  }

  // Common passwords check
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    strength = Math.max(0, strength - 2);
    feedback.push('Avoid common passwords');
  }

  return { validator, strength, feedback };
};

// Generic field validation
export const validateField = (fieldName, value, rules = {}) => {
  const validator = new Validator();

  // Required validation
  if (rules.required && (!value || value.toString().trim().length === 0)) {
    validator.addError(fieldName, `${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
    return validator;
  }

  // Skip other validations if field is empty and not required
  if (!value || value.toString().trim().length === 0) {
    return validator;
  }

  // Min length validation
  if (rules.minLength && value.toString().length < rules.minLength) {
    validator.addError(fieldName, `Must be at least ${rules.minLength} characters`);
  }

  // Max length validation
  if (rules.maxLength && value.toString().length > rules.maxLength) {
    validator.addError(fieldName, `Must be less than ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value.toString())) {
    validator.addError(fieldName, rules.patternMessage || 'Invalid format');
  }

  // Min value validation
  if (rules.min !== undefined && Number(value) < rules.min) {
    validator.addError(fieldName, `Must be at least ${rules.min}`);
  }

  // Max value validation
  if (rules.max !== undefined && Number(value) > rules.max) {
    validator.addError(fieldName, `Must be at most ${rules.max}`);
  }

  // Custom validation
  if (rules.custom && typeof rules.custom === 'function') {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      validator.addError(fieldName, customResult || 'Invalid value');
    }
  }

  return validator;
};

export default {
  Validator,
  validateRegistration,
  validateLogin,
  validateAppointment,
  validateHealthRecord,
  validateSymptoms,
  validateFile,
  validatePasswordStrength,
  validateField
};
