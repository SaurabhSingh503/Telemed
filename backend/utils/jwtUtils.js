// JWT utility functions for token management
// Handles token generation and verification
const jwt = require('jsonwebtoken');

// Generate JWT token for authenticated user
const generateToken = (userId, email, role) => {
  const payload = {
    userId,
    email,
    role
  };
  
  // Generate token with 7 day expiration
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'telemedicine-app'
  });
};

// Verify token and return payload
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Extract token from Authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader
};
