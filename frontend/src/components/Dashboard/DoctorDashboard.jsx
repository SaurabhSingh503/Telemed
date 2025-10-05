/* eslint-disable no-unused-vars */
// Doctor dashboard with professional medical interface and verification check
// Provides access to patient management and consultation tools
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
  Divider,
  IconButton,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  VideoCall as VideoIcon,
  People as PatientsIcon,
  Assignment as RecordsIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ALREADY IMPORTED
import { useAuth } from '../../context/AuthContext';
import { apiEndpoints } from '../../services/api';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    completedConsultations: 0
  });

  // Load dashboard data and verification status
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [appointmentsRes, recordsRes, verificationRes] = await Promise.all([
          apiEndpoints.getAppointments(),
          apiEndpoints.getHealthRecords(),
          apiEndpoints.getDoctorVerificationStatus()
        ]);
        
        const appointmentsData = appointmentsRes.data.appointments || [];
        const recordsData = recordsRes.data.records || [];
        
        setAppointments(appointmentsData);
        setHealthRecords(recordsData);
        
        // Set verification status
        if (verificationRes.data.success) {
          setVerificationStatus(verificationRes.data.data);
        }
        
        // Calculate stats
        const today = new Date().toDateString();
        const todayAppointments = appointmentsData.filter(apt => 
          new Date(apt.appointmentDate).toDateString() === today
        ).length;
        
        const completedConsultations = appointmentsData.filter(apt => 
          apt.status === 'completed'
        ).length;
        
        const totalPatients = new Set(
          appointmentsData.map(apt => apt.patientId)
        ).size;
        
        setStats({
          todayAppointments,
          totalPatients,
          completedConsultations
        });
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return {
          chip: <Chip icon={<PendingIcon />} label={t('doctor.verification_pending')} color="warning" />,
          message: 'Your documents are being reviewed by our medical verification team.',
          severity: 'info',
          action: null
        };
      case 'approved':
        return {
          chip: <Chip icon={<VerifiedIcon />} label={t('doctor.verified_doctor')} color="success" />,
          message: 'Congratulations! Your medical credentials have been verified.',
          severity: 'success',
          action: null
        };
      case 'rejected':
        return {
          chip: <Chip icon={<CancelIcon />} label={t('doctor.verification_rejected')} color="error" />,
          message: `Verification was rejected: ${verificationStatus?.rejectionReason}`,
          severity: 'error',
          action: (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<UploadIcon />}
              onClick={() => navigate('/doctor-verification')}
              sx={{ mt: 2 }}
            >
              {t('doctor.resubmit_documents')}
            </Button>
          )
        };
      default:
        return {
          chip: <Chip icon={<WarningIcon />} label={t('doctor.verification_required')} color="error" />,
          message: 'Please complete your medical credential verification to start consultations.',
          severity: 'warning',
          action: (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<UploadIcon />}
              onClick={() => navigate('/doctor-verification')}
              sx={{ mt: 2 }}
            >
              {t('doctor.complete_verification')}
            </Button>
          )
        };
    }
  };

  // Quick action cards for doctors - WITH TRANSLATIONS
  const quickActions = [
    {
      title: t('actions.start_consultation'),
      description: t('descriptions.begin_video_consultation'),
      icon: <VideoIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      action: () => navigate('/video-call/doctor-consultation'),
      disabled: !user?.isVerified
    },
    {
      title: t('actions.patient_records'),
      description: t('descriptions.manage_patient_records'),
      icon: <RecordsIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      action: () => {/* Navigate to records */},
      disabled: !user?.isVerified
    },
    {
      title: t('actions.schedule_management'),
      description: t('descriptions.manage_appointments'),
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      action: () => {/* Navigate to schedule */},
      disabled: !user?.isVerified
    },
    {
      title: t('actions.add_health_record'),
      description: t('descriptions.create_patient_record'),
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      action: () => {/* Open record form */},
      disabled: !user?.isVerified
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
          {t('dashboard.loading_dashboard')}
        </Typography>
      </Container>
    );
  }

  const statusDisplay = getStatusDisplay(verificationStatus?.verificationStatus);

  // If doctor is not verified, show verification prompt
  if (!user?.isVerified) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Verification Status Alert */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Box textAlign="center">
            <WarningIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              {t('doctor.medical_verification_required')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              {t('dashboard.welcome')} Dr. {user?.firstName}! To ensure patient safety and maintain the highest standards 
              of healthcare, all doctors must complete medical credential verification.
            </Typography>

            <Card sx={{ mb: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Status: {statusDisplay.chip}
                </Typography>
                <Alert severity={statusDisplay.severity}>
                  {statusDisplay.message}
                </Alert>
                {statusDisplay.action}
              </CardContent>
            </Card>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                📋 {t('doctor.verification_requirements')}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    ✅ {t('doctor.medical_license')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    ✅ {t('doctor.degree_certificates')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    ✅ {t('doctor.government_id')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    ✅ {t('doctor.hospital_affiliation')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  // If verified, show normal doctor dashboard
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <HospitalIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dr. {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {user?.specialization || 'General Practitioner'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip 
                icon={<VerifiedIcon />}
                label={t('doctor.verified_doctor')}
                sx={{ bgcolor: 'rgba(76,175,80,0.9)', color: 'white' }}
              />
              <Chip 
                label={`${t('dashboard.doctor_id')}: DR-${user?.id.toString().padStart(4, '0')}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Statistics cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={4} sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <ScheduleIcon sx={{ fontSize: 48, color: '#2196f3', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.todayAppointments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.today_appointments')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={4} sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <PatientsIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.totalPatients}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.total_patients')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={4} sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <CheckIcon sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.completedConsultations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.completed_consultations')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Quick actions */}
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HospitalIcon color="primary" />
            {t('dashboard.quick_actions')}
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  elevation={4} 
                  sx={{ 
                    height: '100%',
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    opacity: action.disabled ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: action.disabled ? 'none' : 'translateY(-4px)',
                      boxShadow: action.disabled ? 4 : 8
                    }
                  }}
                  onClick={!action.disabled ? action.action : undefined}
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
                    {action.disabled && (
                      <Chip 
                        label={t('doctor.verification_required')} 
                        size="small" 
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Today's appointments */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              {t('dashboard.today_appointments')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {appointments.filter(apt => 
              new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
            ).length === 0 ? (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                {t('dashboard.no_appointments_today')}
              </Typography>
            ) : (
              <List>
                {appointments
                  .filter(apt => 
                    new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
                  )
                  .slice(0, 3)
                  .map((appointment, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${appointment.Patient?.firstName} ${appointment.Patient?.lastName}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.reason || t('dashboard.general_consultation')}
                          </Typography>
                          <Chip
                            icon={<TimeIcon />}
                            label={new Date(appointment.appointmentDate).toLocaleTimeString()}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                    />
                    <IconButton 
                      color="primary"
                      onClick={() => navigate(`/video-call/${appointment.meetingRoomId}`)}
                    >
                      <VideoIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
            
            <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
              {t('dashboard.view_all_appointments')}
            </Button>
          </Paper>
        </Grid>

        {/* Recent patient records */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RecordsIcon color="primary" />
              {t('dashboard.recent_patient_records')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {healthRecords.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                {t('dashboard.no_records')}
              </Typography>
            ) : (
              <List>
                {healthRecords.slice(0, 3).map((record, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={record.diagnosis || t('dashboard.general_consultation')}
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {new Date(record.visitDate).toLocaleDateString()} - 
                          {record.Patient?.firstName} {record.Patient?.lastName}
                        </Typography>
                      }
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
    </Container>
  );
};

export default DoctorDashboard;
