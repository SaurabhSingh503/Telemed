/* eslint-disable */
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
  
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
    specialization: '' // Only for doctors
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.role === 'doctor' && !formData.specialization) {
      setError('Please select your specialization');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        if (formData.role === 'doctor') {
          // Redirect doctor to verification page
          navigate('/doctor-verification');
        } else {
          // Redirect patient to dashboard
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    { value: 'general', label: 'General Medicine' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'gynecology', label: 'Gynecology' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'ophthalmology', label: 'Ophthalmology' },
    { value: 'ent', label: 'ENT (Ear, Nose, Throat)' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'anesthesiology', label: 'Anesthesiology' },
    { value: 'pathology', label: 'Pathology' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="md">
        <Paper elevation={10} sx={{ 
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <Grid container>
            {/* Left side - Branding */}
            <Grid item xs={12} md={5} sx={{
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <HospitalIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Join TeleMedicine
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                {t('app.subtitle')}
              </Typography>
              <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  👨‍⚕️ For Healthcare Providers
                </Typography>
                <Typography variant="body2">
                  Register as a doctor and help patients in rural areas access quality healthcare through telemedicine.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  ⚠️ Document verification required after registration
                </Typography>
              </Box>
            </Grid>

            {/* Right side - Registration form */}
            <Grid item xs={12} md={7} sx={{ p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill in your details to get started
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Account Type Selection */}
                <Card sx={{ mb: 3, border: '2px solid #e3f2fd' }}>
                  <CardContent>
                    <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                      <AccountIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      I am registering as:
                    </FormLabel>
                    <RadioGroup
                      row
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      sx={{ justifyContent: 'space-around' }}
                    >
                      <FormControlLabel 
                        value="patient" 
                        control={<Radio />} 
                        label="Patient" 
                        sx={{ 
                          border: formData.role === 'patient' ? '2px solid #2196f3' : '1px solid #ddd',
                          borderRadius: 1,
                          px: 2,
                          py: 1,
                          m: 0.5
                        }}
                      />
                      <FormControlLabel 
                        value="doctor" 
                        control={<Radio />} 
                        label="Doctor" 
                        sx={{
                          border: formData.role === 'doctor' ? '2px solid #2196f3' : '1px solid #ddd',
                          borderRadius: 1,
                          px: 2,
                          py: 1,
                          m: 0.5
                        }}
                      />
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      variant="outlined"
                      placeholder="+91 9876543210"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        label="Gender"
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Doctor-specific field */}
                  {formData.role === 'doctor' && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom color="primary">
                          🏥 Medical Specialization
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          After registration, you'll need to upload your medical license and certificates for verification.
                        </Alert>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControl fullWidth required>
                          <InputLabel>Medical Specialization</InputLabel>
                          <Select
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                            label="Medical Specialization"
                          >
                            {specializations.map((spec) => (
                              <MenuItem key={spec.value} value={spec.value}>
                                {spec.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      helperText="Minimum 6 characters"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    mt: 4, 
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? 'Creating Account...' : 
                   formData.role === 'doctor' ? 'Register & Verify Credentials' : 'Create Account'}
                </Button>

                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#2196f3', textDecoration: 'none' }}>
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </form>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
