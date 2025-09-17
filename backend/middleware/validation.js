// Validation middleware for request data
// Ensures data integrity and proper format
const validateRegistration = (req, res, next) => {
  const { email, password, firstName, lastName, role } = req.body;
  
  // Check required fields
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email, password, first name, and last name are required'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      message: 'Please provide a valid email address'
    });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Weak password',
      message: 'Password must be at least 6 characters long'
    });
  }
  
  // Validate role
  if (role && !['patient', 'doctor'].includes(role)) {
    return res.status(400).json({
      error: 'Invalid role',
      message: 'Role must be either patient or doctor'
    });
  }
  
  next();
};

// Validate login request
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Email and password are required'
    });
  }
  
  next();
};

module.exports = { validateRegistration, validateLogin };
