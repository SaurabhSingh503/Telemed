/* eslint-disable */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Login user - FIXED VERSION
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login attempt:', { email, timestamp: new Date().toISOString() });

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ 
      where: { email: email.toLowerCase().trim() } 
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('👤 User found:', { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      isVerified: user.isVerified 
    });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Password valid for user:', email);

    // Check if doctor needs verification
    if (user.role === 'doctor' && !user.isVerified) {
      console.log('⚠️ Doctor not verified:', user.verificationStatus);
      
      let message = 'Your doctor account is not verified yet.';
      
      if (user.verificationStatus === 'pending') {
        message = 'Your verification application is being reviewed by our team.';
      } else if (user.verificationStatus === 'rejected') {
        message = `Verification was rejected: ${user.rejectionReason || 'Please resubmit your documents.'}`;
      } else {
        message = 'Please complete the verification process to access your account.';
      }

      return res.status(403).json({
        success: false,
        message,
        requiresVerification: true,
        verificationStatus: user.verificationStatus
      });
    }

    // Generate token
    try {
      const token = generateToken(user.id);
      console.log('🎫 Token generated for user:', user.id);

      // Create user response (exclude password)
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

      console.log('✅ Login successful for:', email);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: userResponse
      });

    } catch (tokenError) {
      console.error('❌ Token generation failed:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Authentication failed - unable to generate token'
      });
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
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

    console.log('📝 Registration attempt:', { email, role, firstName, lastName });

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      role: role || 'patient',
      specialization: role === 'doctor' ? specialization : null,
      isVerified: role === 'patient' ? true : false, // Patients auto-verified
      verificationStatus: role === 'patient' ? 'approved' : 'pending'
    });

    console.log('👤 User created:', { id: user.id, email: user.email, role: user.role });

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

    console.log('✅ Registration successful:', userResponse);

    res.status(201).json({
      success: true,
      message: role === 'doctor' 
        ? 'Doctor account created successfully. Please complete verification to start consultations.'
        : 'Account created successfully. Welcome to TeleMedicine!',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed due to server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('👤 Getting profile for user:', userId);

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile retrieved:', user.email);

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
