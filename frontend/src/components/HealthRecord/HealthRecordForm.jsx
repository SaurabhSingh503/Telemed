/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// Health record form component for medical data entry
// Allows doctors and patients to create/edit health records
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  HealthAndSafety as HealthIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiEndpoints } from '../../services/api';
import { useNotification } from '../common/Notification';

const HealthRecordForm = ({ recordId = null, onSave, onCancel }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: '',
    prescription: '',
    notes: '',
    vitals: {
      bloodPressure: '',
      temperature: '',
      heartRate: '',
      weight: '',
      height: '',
      oxygenSaturation: ''
    }
  });

  // Common symptoms for quick selection
  const commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Sore Throat', 'Nausea',
    'Fatigue', 'Chest Pain', 'Shortness of Breath', 'Dizziness'
  ];

  // Load existing record if editing
  useEffect(() => {
    if (recordId) {
      loadRecord();
    }
  }, [recordId]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      const response = await apiEndpoints.getHealthRecordById(recordId);
      
      if (response.data.success) {
        const record = response.data.record;
        setFormData({
          patientId: record.patientId || '',
          diagnosis: record.diagnosis || '',
          symptoms: record.symptoms || '',
          prescription: record.prescription || '',
          notes: record.notes || '',
          vitals: record.vitals || {
            bloodPressure: '',
            temperature: '',
            heartRate: '',
            weight: '',
            height: '',
            oxygenSaturation: ''
          }
        });
      }
    } catch (error) {
      showError('Failed to load health record');
      console.error('Error loading record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [name]: value
      }
    }));
  };

  const addSymptom = (symptom) => {
    const currentSymptoms = formData.symptoms ? formData.symptoms.split(', ') : [];
    if (!currentSymptoms.includes(symptom)) {
      const newSymptoms = [...currentSymptoms, symptom].join(', ');
      setFormData(prev => ({
        ...prev,
        symptoms: newSymptoms
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.symptoms && !formData.diagnosis) {
      showError('Please provide either symptoms or diagnosis');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        vitals: JSON.stringify(formData.vitals)
      };

      let response;
      if (recordId) {
        // Update existing record
        response = await apiEndpoints.updateHealthRecord(recordId, submitData);
      } else {
        // Create new record
        response = await apiEndpoints.createHealthRecord(submitData);
      }

      if (response.data.success) {
        showSuccess(recordId ? 'Health record updated successfully' : 'Health record created successfully');
        if (onSave) {
          onSave(response.data.record);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      showError('Failed to save health record');
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HealthIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {recordId ? 'Edit Health Record' : 'New Health Record'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {user?.role === 'doctor' ? 'Add patient medical information' : 'Update your health information'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Primary diagnosis or condition"
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    placeholder="List symptoms separated by commas"
                    multiline
                    rows={3}
                  />
                  
                  {/* Quick symptom selection */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Quick add symptoms:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {commonSymptoms.map((symptom) => (
                        <Chip
                          key={symptom}
                          label={symptom}
                          size="small"
                          onClick={() => addSymptom(symptom)}
                          clickable
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Prescription */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Treatment & Prescription
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                label="Prescription & Treatment Plan"
                name="prescription"
                value={formData.prescription}
                onChange={handleInputChange}
                placeholder="Medications, dosages, and treatment instructions"
                multiline
                rows={4}
              />
            </Paper>
          </Grid>

          {/* Vital Signs */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Vital Signs
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Blood Pressure"
                    name="bloodPressure"
                    value={formData.vitals.bloodPressure}
                    onChange={handleVitalsChange}
                    placeholder="e.g., 120/80"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Temperature (°F)"
                    name="temperature"
                    type="number"
                    value={formData.vitals.temperature}
                    onChange={handleVitalsChange}
                    placeholder="e.g., 98.6"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Heart Rate (bpm)"
                    name="heartRate"
                    type="number"
                    value={formData.vitals.heartRate}
                    onChange={handleVitalsChange}
                    placeholder="e.g., 72"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Weight (lbs)"
                    name="weight"
                    type="number"
                    value={formData.vitals.weight}
                    onChange={handleVitalsChange}
                    placeholder="e.g., 150"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Height (inches)"
                    name="height"
                    type="number"
                    value={formData.vitals.height}
                    onChange={handleVitalsChange}
                    placeholder="e.g., 68"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Oxygen Saturation (%)"
                    name="oxygenSaturation"
                    type="number"
                    value={formData.vitals.oxygenSaturation}
                    onChange={handleVitalsChange}
                    placeholder="e.g., 98"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Additional Notes */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Additional Notes
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                label="Clinical Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional observations, follow-up instructions, or notes"
                multiline
                rows={4}
              />
            </Paper>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<CancelIcon />}
                  size="large"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  size="large"
                >
                  {loading ? 'Saving...' : recordId ? 'Update Record' : 'Save Record'}
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  This health record will be securely stored and accessible to authorized healthcare providers.
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default HealthRecordForm;
