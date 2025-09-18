/* eslint-disable */
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

console.log('🔐 Setting up auth routes...');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

console.log('✅ Auth routes configured');

module.exports = router;
