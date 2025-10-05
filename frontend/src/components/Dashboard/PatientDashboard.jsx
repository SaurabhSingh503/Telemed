/* eslint-disable */
// Patient dashboard with healthcare features including appointment booking
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert
} from '@mui/material';
import {
  VideoCall as VideoIcon,
  Assignment as RecordsIcon,
  Psychology as SymptomIcon,
  LocalPharmacy as PharmacyIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  BookOnline as BookIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { apiEndpoints } from '../../services/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    reason: '',
    preferredDate: '',
    preferredTime: '',
    symptoms: '',
    urgency: 'normal'
  });
  const [bookingError, setBookingError] = useState('');

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [appointmentsRes, recordsRes, doctorsRes] = await Promise.all([
          apiEndpoints.getAppointments(),
          apiEndpoints.getHealthRecords(),
          apiEndpoints.getDoctors()
        ]);
        
        setAppointments(appointmentsRes.data.appointments || []);
        setHealthRecords(recordsRes.data.records || []);
        setDoctors(doctorsRes.data.doctors || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle booking form changes
  const handleBookingChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
    if (bookingError) setBookingError('');
  };

  // Submit appointment booking
  const handleBookAppointment = async () => {
    try {
      setBookingError('');
      
      // Validate required fields
      if (!bookingData.doctorId || !bookingData.reason || !bookingData.preferredDate) {
        setBookingError('Please fill in all required fields');
        return;
      }

      const appointmentData = {
        ...bookingData,
        patientId: user.id,
        status: 'pending'
      };

      const response = await apiEndpoints.createAppointment(appointmentData);
      
      if (response.data.success) {
        // Refresh appointments
        const updatedAppointments = await apiEndpoints.getAppointments();
        setAppointments(updatedAppointments.data.appointments || []);
        
        // Close dialog and reset form
        setBookingDialog(false);
        setBookingData({
          doctorId: '',
          reason: '',
          preferredDate: '',
          preferredTime: '',
          symptoms: '',
          urgency: 'normal'
        });
        
        // Show success message (you can add a snackbar here)
        alert('Appointment booked successfully! The doctor will confirm shortly.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  // Quick action cards for patients - UPDATED WITH BOOK APPOINTMENT
  const quickActions = [
    {
      title: t('dashboard.book_appointment'),
      description: 'Schedule consultation with verified doctors',
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      color: '#e91e63',
      action: () => setBookingDialog(true)
    },
    {
      title: t('actions.talk_to_doctor'),
      description: t('descriptions.video_consultation'),
      icon: <VideoIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      action: () => navigate('/video-call/patient-consultation')
    },
    {
      title: t('actions.ai_chatbot'),
      description: t('descriptions.instant_health_guidance'),
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      action: () => navigate('/symptom-checker')
    },
    {
      title: t('actions.health_records'),
      description: t('descriptions.view_medical_history'),
      icon: <RecordsIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      action: () => navigate('/health-records')
    },
    {
      title: t('actions.find_pharmacies'),
      description: t('descriptions.locate_pharmacies'),
      icon: <PharmacyIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      action: () => navigate('/pharmacies')
    }
  ];

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {t('dashboard.welcome')}, {user?.firstName}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {t('dashboard.your_health_priority')}
              </Typography>
              <Chip 
                label={`${t('dashboard.patient_id')}: PT-${user?.id.toString().padStart(4, '0')}`}
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* Quick actions */}
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HospitalIcon color="primary" />
              {t('dashboard.quick_actions')}
            </Typography>
            <Grid container spacing={3}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <Card 
                    elevation={4} 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 8
                      }
                    }}
                    onClick={action.action}
                  >
                    <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                      <Box sx={{ color: action.color, mb: 2 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Recent appointments */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {t('dashboard.recent_appointments')}
              </Typography>
              
              {appointments.length === 0 ? (
                <Box textAlign="center" sx={{ py: 4 }}>
                  <BookIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    {t('dashboard.no_appointments')}
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<BookIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => setBookingDialog(true)}
                  >
                    Book Your First Appointment
                  </Button>
                </Box>
              ) : (
                <List>
                  {appointments.slice(0, 3).map((appointment, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <VideoIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`Dr. ${appointment.Doctor?.firstName} ${appointment.Doctor?.lastName}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.reason || t('dashboard.general_consultation')}
                            </Typography>
                            <Chip
                              icon={<TimeIcon />}
                              label={new Date(appointment.appointmentDate).toLocaleDateString()}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                {t('dashboard.view_all_appointments')}
              </Button>
            </Paper>
          </Grid>

          {/* Recent health records */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {t('dashboard.recent_records')}
              </Typography>
              
              {healthRecords.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  {t('dashboard.no_records')}
                </Typography>
              ) : (
                <List>
                  {healthRecords.slice(0, 3).map((record, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <RecordsIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={record.diagnosis || t('dashboard.general_consultation')}
                        secondary={new Date(record.visitDate).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                {t('dashboard.view_all_records')}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Floating Book Appointment Button */}
        <Fab
          color="primary"
          aria-label="book appointment"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: '#e91e63',
            '&:hover': {
              bgcolor: '#ad1457',
            }
          }}
          onClick={() => setBookingDialog(true)}
        >
          <BookIcon />
        </Fab>
      </Container>

      {/* Book Appointment Dialog */}
      <Dialog 
        open={bookingDialog} 
        onClose={() => setBookingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookIcon color="primary" />
            Book New Appointment
          </Box>
          <IconButton onClick={() => setBookingDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {bookingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookingError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Doctor Selection */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Select Doctor *"
                name="doctorId"
                value={bookingData.doctorId}
                onChange={handleBookingChange}
                required
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doctor.specialization} • ⭐ {doctor.rating || '4.5'}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Reason */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reason for Visit *"
                name="reason"
                value={bookingData.reason}
                onChange={handleBookingChange}
                required
                placeholder="e.g., Routine checkup, Fever, Chest pain"
              />
            </Grid>

            {/* Preferred Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Preferred Date *"
                name="preferredDate"
                value={bookingData.preferredDate}
                onChange={handleBookingChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            {/* Preferred Time */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Preferred Time"
                name="preferredTime"
                value={bookingData.preferredTime}
                onChange={handleBookingChange}
              >
                <MenuItem value="09:00">9:00 AM</MenuItem>
                <MenuItem value="10:00">10:00 AM</MenuItem>
                <MenuItem value="11:00">11:00 AM</MenuItem>
                <MenuItem value="14:00">2:00 PM</MenuItem>
                <MenuItem value="15:00">3:00 PM</MenuItem>
                <MenuItem value="16:00">4:00 PM</MenuItem>
                <MenuItem value="17:00">5:00 PM</MenuItem>
              </TextField>
            </Grid>

            {/* Urgency */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Urgency Level"
                name="urgency"
                value={bookingData.urgency}
                onChange={handleBookingChange}
              >
                <MenuItem value="low">Low - Routine checkup</MenuItem>
                <MenuItem value="normal">Normal - Regular consultation</MenuItem>
                <MenuItem value="high">High - Need urgent care</MenuItem>
                <MenuItem value="emergency">Emergency - Immediate attention</MenuItem>
              </TextField>
            </Grid>

            {/* Symptoms */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Symptoms & Additional Notes"
                name="symptoms"
                value={bookingData.symptoms}
                onChange={handleBookingChange}
                placeholder="Describe your symptoms, medical history, or any specific concerns..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBookingDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleBookAppointment}
            startIcon={<BookIcon />}
            disabled={!bookingData.doctorId || !bookingData.reason || !bookingData.preferredDate}
          >
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PatientDashboard;
