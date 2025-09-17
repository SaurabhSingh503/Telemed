// Authentication controller handling login and registration
// Manages user creation and authentication logic
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

// Register new user (patient or doctor)
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, dateOfBirth, gender, specialization } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Create new user
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role: role || 'patient',
      phone,
      dateOfBirth,
      gender
    };
    
    // Add specialization for doctors
    if (role === 'doctor') {
      userData.specialization = specialization;
    }
    
    const user = await User.create(userData);
    
    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);
    
    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      specialization: user.specialization
    };
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create user account'
    });
  }
};

// Login existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);
    
    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      specialization: user.specialization
    };
    
    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to authenticate user'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // Remove password from response
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      specialization: user.specialization
    };
    
    res.json({ user: userResponse });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'Unable to retrieve user information'
    });
  }
};

module.exports = { register, login, getProfile };
