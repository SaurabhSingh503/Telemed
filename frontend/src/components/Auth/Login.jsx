/* eslint-disable */
// Login component with form validation, authentication, and doctor verification handling
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  LocalHospital as HospitalIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../Layout/LanguageSelector';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError, setError } = useAuth();
  
  // Form state management
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState({
    open: false,
    message: '',
    status: '',
    isDoctor: false
  });

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setLocalError('');
    if (authError && setError) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setLocalError('');
    if (setError) setError('');
    
    // Basic validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setLocalError('Please fill in both email and password');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    console.log('🔑 Login form submitted:', formData.email);
    setLoading(true);

    try {
      const result = await login(formData.email.trim(), formData.password);
      
      console.log('📧 Login result received:', result);
      
      if (result && result.success) {
        console.log('✅ Login successful, navigating to dashboard...');
        
        // Clear form data
        setFormData({ email: '', password: '' });
        
        // Navigate to dashboard with replace to prevent back button issues
        navigate('/dashboard', { replace: true });
        
      } else {
        console.log('❌ Login failed:', result);
        
        // Check if it's a verification issue
        if (result && result.requiresVerification) {
          console.log('⚠️ Doctor verification required');
          setVerificationDialog({
            open: true,
            message: result.error || 'Doctor verification required',
            status: result.verificationStatus || 'pending',
            isDoctor: true
          });
        } else {
          const errorMessage = result?.error || 'Login failed. Please check your credentials.';
          setLocalError(errorMessage);
        }
      }
    } catch (err) {
      console.error('❌ Login error caught:', err);
      setLocalError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationDialogClose = () => {
    setVerificationDialog({ open: false, message: '', status: '', isDoctor: false });
  };

  const handleGoToVerification = () => {
    setVerificationDialog({ open: false, message: '', status: '', isDoctor: false });
    navigate('/doctor-verification');
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getVerificationSeverity = (status) => {
    switch (status) {
      case 'pending':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  // Show current error (local or from auth context)
  const currentError = error || authError;
  const isLoading = loading || authLoading;

  return (
    <>
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
            <Typography variant="h6" textAlign="center" sx={{ zIndex: 1, mb: 4 }}>
              {t('app.subtitle')}
            </Typography>
            
            {/* Medical features highlight */}
            <Box sx={{ zIndex: 1, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                🩺 For Healthcare Providers
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                All doctors must complete credential verification for patient safety
              </Typography>
            </Box>

            {/* Medical illustration placeholder */}
            <Box sx={{ mt: 4, zIndex: 1 }}>
              <img 
                src="/icons/icon-192x192.png" 
                alt="Healthcare" 
                style={{ width: 120, height: 120, opacity: 0.8 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
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
                {currentError && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => {
                    setLocalError('');
                    if (setError) setError('');
                  }}>
                    {currentError}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                          disabled={isLoading}
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
                  disabled={isLoading}
                  sx={{ 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    borderRadius: 3,
                    position: 'relative'
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Signing In...
                    </Box>
                  ) : (
                    t('auth.secure_login')
                  )}
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

      {/* Doctor Verification Required Dialog */}
      <Dialog 
        open={verificationDialog.open} 
        onClose={handleVerificationDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getVerificationIcon(verificationDialog.status)}
          Doctor Verification Required
        </DialogTitle>
        <DialogContent>
          <Alert severity={getVerificationSeverity(verificationDialog.status)} sx={{ mb: 2 }}>
            {verificationDialog.message}
          </Alert>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            To maintain the highest standards of patient care and safety, all medical professionals 
            must complete credential verification before accessing consultation features.
          </Typography>

          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              📋 Required Documents:
            </Typography>
            <Typography variant="body2" component="div">
              • Medical License Certificate<br />
              • Degree Certificates (MBBS/MD/MS)<br />
              • Government ID Proof<br />
              • Hospital Affiliation (if applicable)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVerificationDialogClose}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleGoToVerification}
            color="primary"
            startIcon={verificationDialog.status === 'rejected' ? <CancelIcon /> : <CheckIcon />}
          >
            {verificationDialog.status === 'rejected' ? 'Resubmit Documents' : 'Complete Verification'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Login;
