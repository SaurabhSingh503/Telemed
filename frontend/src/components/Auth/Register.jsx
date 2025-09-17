/* eslint-disable */
// Registration component with comprehensive form fields
// Professional healthcare design with form validation
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  DateRange as DateIcon,
  Visibility,
  VisibilityOff,
  LocalHospital as HospitalIcon,
  Favorite as HeartIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../Layout/LanguageSelector';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Form state management - FIXED: separate firstName and lastName
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    role: 'patient',
    specialization: '',
    agreeTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate terms agreement
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms & Privacy Policy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Navigate to dashboard after successful registration
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      {/* Background with healthcare theme */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        zIndex: -1
      }} />
      
      <Paper 
        elevation={24}
        sx={{ 
          width: '100%',
          maxWidth: 1000,
          margin: 'auto',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          minHeight: 600
        }}
      >
        {/* Left side - Healthcare illustration */}
        <Box sx={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          position: 'relative'
        }}>
          {/* Healthcare theme */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4
          }}>
            <HeartIcon sx={{ fontSize: 80, color: 'primary.main', mr: 2 }} />
            <HospitalIcon sx={{ fontSize: 60, color: 'secondary.main' }} />
          </Box>
          
          <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom textAlign="center">
            Join Our Healthcare Community
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center">
            Connect with doctors, manage your health records, and access quality healthcare from anywhere.
          </Typography>
        </Box>

        {/* Right side - Registration form */}
        <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Language selector */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <LanguageSelector />
          </Box>

          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Create Your Health Account
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ mt: 2 }}>
              {/* Error alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Name fields - FIXED: Separate first and last name */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Email field */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password fields */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Role selection */}
              <FormControl fullWidth margin="normal">
                <InputLabel>I am a</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="I am a"
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                </Select>
              </FormControl>

              {/* Specialization for doctors */}
              {formData.role === 'doctor' && (
                <TextField
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  margin="normal"
                  placeholder="e.g., General Medicine, Cardiology, Pediatrics"
                />
              )}

              {/* Terms checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the <Link href="#" color="primary">Terms & Privacy Policy</Link>
                  </Typography>
                }
                sx={{ mt: 2 }}
              />

              {/* Register button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mt: 2,
                  borderRadius: 3
                }}
              >
                {loading ? 'Creating Account...' : 'Create Health Account'}
              </Button>

              {/* Login link */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" color="primary">
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
