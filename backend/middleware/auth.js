// Authentication middleware to protect routes
// Verifies JWT tokens and extracts user information
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and authenticate user
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify token and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user from database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      message: 'Please login again'
    });
  }
};

// Middleware to check if user has specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `${role} role required`
      });
    }
  };
};

module.exports = { authenticateToken, requireRole };
