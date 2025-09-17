/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// Health record viewer component for displaying medical records
// Shows detailed view of patient health records
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  Medication as MedicationIcon,
  MonitorHeart as VitalsIcon,
  DateRange as DateIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiEndpoints } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const HealthRecordView = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printDialog, setPrintDialog] = useState(false);

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
        setRecord(response.data.record);
      } else {
        setError('Health record not found');
      }
    } catch (err) {
      setError('Failed to load health record');
      console.error('Error loading record:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/health-record/edit/${recordId}`);
  };

  const handlePrint = () => {
    setPrintDialog(true);
  };

  const printRecord = () => {
    window.print();
    setPrintDialog(false);
  };

  const formatVitals = (vitals) => {
    if (!vitals) return [];
    
    const vitalsObj = typeof vitals === 'string' ? JSON.parse(vitals) : vitals;
    const vitalsArray = [];
    
    if (vitalsObj.bloodPressure) vitalsArray.push({ label: 'Blood Pressure', value: vitalsObj.bloodPressure, unit: 'mmHg' });
    if (vitalsObj.temperature) vitalsArray.push({ label: 'Temperature', value: vitalsObj.temperature, unit: '°F' });
    if (vitalsObj.heartRate) vitalsArray.push({ label: 'Heart Rate', value: vitalsObj.heartRate, unit: 'bpm' });
    if (vitalsObj.weight) vitalsArray.push({ label: 'Weight', value: vitalsObj.weight, unit: 'lbs' });
    if (vitalsObj.height) vitalsArray.push({ label: 'Height', value: vitalsObj.height, unit: 'in' });
    if (vitalsObj.oxygenSaturation) vitalsArray.push({ label: 'O2 Saturation', value: vitalsObj.oxygenSaturation, unit: '%' });
    
    return vitalsArray;
  };

  if (loading) return <LoadingSpinner message="Loading health record..." />;

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!record) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }} className="no-print">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Health Record Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Medical Record ID: HR-{record.id?.toString().padStart(4, '0')}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {user?.role === 'doctor' && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit Record
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Print
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Patient Information */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {record.Patient ? `${record.Patient.firstName} ${record.Patient.lastName}` : 'Current Patient'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Visit Date
                </Typography>
                <Typography variant="body1">
                  {new Date(record.visitDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
              
              {record.Doctor && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Attending Physician
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Dr. {record.Doctor.firstName} {record.Doctor.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {record.Doctor.specialization}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Medical Information */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Diagnosis */}
            {record.diagnosis && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HospitalIcon color="primary" />
                      Diagnosis
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {record.diagnosis}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Symptoms */}
            {record.symptoms && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon color="warning" />
                      Symptoms
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {record.symptoms.split(',').map((symptom, index) => (
                        <Chip
                          key={index}
                          label={symptom.trim()}
                          variant="outlined"
                          color="warning"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Prescription */}
            {record.prescription && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MedicationIcon color="success" />
                      Prescription & Treatment
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {record.prescription}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Vital Signs */}
            {record.vitals && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VitalsIcon color="error" />
                      Vital Signs
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      {formatVitals(record.vitals).map((vital, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {vital.label}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {vital.value} {vital.unit}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Clinical Notes */}
            {record.notes && (
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon color="info" />
                      Clinical Notes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {record.notes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Print Dialog */}
      <Dialog open={printDialog} onClose={() => setPrintDialog(false)}>
        <DialogTitle>Print Health Record</DialogTitle>
        <DialogContent>
          <Typography>
            This will print the complete health record including patient information, 
            diagnosis, symptoms, prescription, and vital signs.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialog(false)}>Cancel</Button>
          <Button onClick={printRecord} variant="contained">Print</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HealthRecordView;
