// Authentication routes for login, register, and profile
// Handles user authentication endpoints
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// POST /api/auth/register - Register new user
router.post('/register', validateRegistration, register);

// POST /api/auth/login - Login user
router.post('/login', validateLogin, login);

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
