/* eslint-disable */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register user
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      role,
      specialization
    } = req.body;

    console.log('Registration attempt:', { email, role, firstName, lastName });

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth,
      gender,
      role: role || 'patient',
      specialization: role === 'doctor' ? specialization : null,
      isVerified: role === 'patient' ? true : false, // Patients auto-verified
      verificationStatus: role === 'patient' ? 'approved' : 'pending'
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialization: user.specialization,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus
    };

    console.log('User created successfully:', userResponse);

    res.status(201).json({
      success: true,
      message: role === 'doctor' 
        ? 'Doctor account created successfully. Please complete verification to start consultations.'
        : 'Account created successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if doctor is verified (only for doctors)
    if (user.role === 'doctor' && !user.isVerified) {
      let message = 'Your doctor account is not verified yet.';
      
      if (user.verificationStatus === 'pending') {
        message += ' Your verification application is being reviewed.';
      } else if (user.verificationStatus === 'rejected') {
        message += ` Verification was rejected: ${user.rejectionReason}`;
      } else {
        message += ' Please complete the verification process.';
      }

      return res.status(403).json({
        success: false,
        message,
        requiresVerification: true,
        verificationStatus: user.verificationStatus
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      specialization: user.specialization,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus
    };

    console.log('Login successful:', userResponse);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
