/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { apiEndpoints } from '../../services/api';

const DoctorVerificationForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    specialization: '',
    medicalLicenseNumber: '',
    qualification: '',
    experience: '',
    hospitalAffiliation: '',
    consultationFee: ''
  });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await apiEndpoints.getDoctorVerificationStatus();
      if (response.data.success) {
        setVerificationStatus(response.data.data);
        setFormData({
          specialization: response.data.data.specialization || '',
          medicalLicenseNumber: response.data.data.medicalLicenseNumber || '',
          qualification: response.data.data.qualification || '',
          experience: response.data.data.experience || '',
          hospitalAffiliation: response.data.data.hospitalAffiliation || '',
          consultationFee: response.data.data.consultationFee || ''
        });
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({
      ...files,
      [name]: selectedFiles[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const submitFormData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        submitFormData.append(key, formData[key]);
      });

      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitFormData.append(key, files[key]);
        }
      });

      const response = await apiEndpoints.submitDoctorVerification(submitFormData);
      
      if (response.data.success) {
        setMessage('Verification application submitted successfully!');
        fetchVerificationStatus();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit verification application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending Review" color="warning" />;
      case 'approved':
        return <Chip icon={<CheckIcon />} label="Verified" color="success" />;
      case 'rejected':
        return <Chip icon={<CancelIcon />} label="Rejected" color="error" />;
      default:
        return <Chip label="Not Submitted" color="default" />;
    }
  };

  if (verificationStatus && verificationStatus.verificationStatus === 'approved') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Verification Complete!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your doctor credentials have been verified successfully.
            You can now start providing consultations to patients.
          </Typography>
          {getStatusChip(verificationStatus.verificationStatus)}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Doctor Verification Process
      </Typography>

      {verificationStatus && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Current Status</Typography>
              {getStatusChip(verificationStatus.verificationStatus)}
            </Box>
            
            {verificationStatus.verificationStatus === 'rejected' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Rejection Reason:</strong> {verificationStatus.rejectionReason}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Professional Information & Document Verification
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          Please provide accurate information and upload clear, legible documents for verification.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Professional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Professional Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Specialization</InputLabel>
                <Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="general">General Medicine</MenuItem>
                  <MenuItem value="cardiology">Cardiology</MenuItem>
                  <MenuItem value="dermatology">Dermatology</MenuItem>
                  <MenuItem value="pediatrics">Pediatrics</MenuItem>
                  <MenuItem value="orthopedics">Orthopedics</MenuItem>
                  <MenuItem value="gynecology">Gynecology</MenuItem>
                  <MenuItem value="psychiatry">Psychiatry</MenuItem>
                  <MenuItem value="neurology">Neurology</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medical License Number"
                name="medicalLicenseNumber"
                value={formData.medicalLicenseNumber}
                onChange={handleInputChange}
                required
                helperText="Enter your valid medical license number"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                required
                placeholder="e.g., MBBS, MD, MS"
                helperText="Your medical degrees"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hospital/Clinic Affiliation"
                name="hospitalAffiliation"
                value={formData.hospitalAffiliation}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consultation Fee (₹)"
                name="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={handleInputChange}
                required
                inputProps={{ min: 100, max: 5000 }}
              />
            </Grid>

            {/* Document Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Required Documents
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ border: '2px dashed #ccc', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" gutterBottom>
                  Medical License Certificate
                </Typography>
                <input
                  type="file"
                  name="medicalLicense"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="medical-license-upload"
                  required
                />
                <label htmlFor="medical-license-upload">
                  <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                    Choose File
                  </Button>
                </label>
                {files.medicalLicense && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {files.medicalLicense.name}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ border: '2px dashed #ccc', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" gutterBottom>
                  Degree Certificates
                </Typography>
                <input
                  type="file"
                  name="degreesCertificates"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="degrees-upload"
                  required
                />
                <label htmlFor="degrees-upload">
                  <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                    Choose File
                  </Button>
                </label>
                {files.degreesCertificates && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {files.degreesCertificates.name}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ border: '2px dashed #ccc', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" gutterBottom>
                  Identity Proof (Aadhaar/PAN)
                </Typography>
                <input
                  type="file"
                  name="identityProof"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="identity-upload"
                  required
                />
                <label htmlFor="identity-upload">
                  <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                    Choose File
                  </Button>
                </label>
                {files.identityProof && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {files.identityProof.name}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ border: '2px dashed #ccc', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" gutterBottom>
                  Hospital ID Card (Optional)
                </Typography>
                <input
                  type="file"
                  name="hospitalIdCard"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="hospital-id-upload"
                />
                <label htmlFor="hospital-id-upload">
                  <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                    Choose File
                  </Button>
                </label>
                {files.hospitalIdCard && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {files.hospitalIdCard.name}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                {loading && <LinearProgress sx={{ mb: 2 }} />}
                
                {message && (
                  <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
                    {message}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || (verificationStatus && verificationStatus.verificationStatus === 'pending')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {loading ? 'Submitting...' : 
                   verificationStatus && verificationStatus.verificationStatus === 'pending' ? 
                   'Application Under Review' : 'Submit for Verification'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default DoctorVerificationForm;
