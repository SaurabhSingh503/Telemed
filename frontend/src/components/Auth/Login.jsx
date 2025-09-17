// Login component with form validation and authentication
// Matches the blue healthcare design from the attached images
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
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../Layout/LanguageSelector';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state management
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Navigate to dashboard after successful login
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      {/* Background with healthcare theme */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
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
        {/* Left side - Branding */}
        <Box sx={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          p: 4,
          position: 'relative'
        }}>
          {/* Healthcare icons background */}
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HospitalIcon sx={{ fontSize: 200 }} />
          </Box>
          
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ zIndex: 1 }}>
            {t('app.title')}
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ zIndex: 1 }}>
            {t('app.subtitle')}
          </Typography>
          
          {/* Medical illustration placeholder */}
          <Box sx={{ mt: 4, zIndex: 1 }}>
            <img 
              src="/icons/icon-192x192.png" 
              alt="Healthcare" 
              style={{ width: 120, height: 120, opacity: 0.8 }}
            />
          </Box>
        </Box>

        {/* Right side - Login form */}
        <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Language selector */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <LanguageSelector />
          </Box>

          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            {t('auth.secure_login')}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ mt: 3 }}>
              {/* Error alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Email field */}
              <TextField
                fullWidth
                label={t('auth.email')}
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
                sx={{ mb: 2 }}
              />

              {/* Password field */}
              <TextField
                fullWidth
                label={t('auth.password')}
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
                sx={{ mb: 2 }}
              />

              {/* Forgot password link */}
              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <Link href="#" color="primary">
                  {t('auth.forgot_password')}
                </Link>
              </Box>

              {/* Login button */}
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
                  textTransform: 'uppercase',
                  borderRadius: 3
                }}
              >
                {loading ? 'Signing In...' : t('auth.secure_login')}
              </Button>

              {/* Register link */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2">
                  {t('auth.dont_have_account')}{' '}
                  <Link component={RouterLink} to="/register" color="primary">
                    {t('auth.register')}
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

export default Login;
