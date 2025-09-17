/* eslint-disable */
// Patient dashboard with healthcare features
// Provides access to consultations and health management tools
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
  IconButton
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
  Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiEndpoints } from '../../services/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [appointmentsRes, recordsRes] = await Promise.all([
          apiEndpoints.getAppointments(),
          apiEndpoints.getHealthRecords()
        ]);
        
        setAppointments(appointmentsRes.data.appointments || []);
        setHealthRecords(recordsRes.data.records || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Quick action cards for patients
  const quickActions = [
    {
      title: 'Talk to Doctor',
      description: 'Video consultation with healthcare providers',
      icon: <VideoIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      action: () => navigate('/video-call/patient-consultation')
    },
    {
      title: 'AI Chatbot',
      description: 'Get instant health guidance',
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      action: () => navigate('/symptom-checker')
    },
    {
      title: 'Health Records',
      description: 'View your medical history',
      icon: <RecordsIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      action: () => navigate('/health-records')
    },
    {
      title: 'Find Pharmacies',
      description: 'Locate nearby pharmacies',
      icon: <PharmacyIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      action: () => navigate('/pharmacies')
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome, {user?.firstName}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Your health is our priority
            </Typography>
            <Chip 
              label={`Patient ID: PT-${user?.id.toString().padStart(4, '0')}`}
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
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
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
              Recent Appointments
            </Typography>
            
            {appointments.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No appointments found
              </Typography>
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
                            {appointment.reason || 'General Consultation'}
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
              View All Appointments
            </Button>
          </Paper>
        </Grid>

        {/* Recent health records */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Health Records
            </Typography>
            
            {healthRecords.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No health records found
              </Typography>
            ) : (
              <List>
                {healthRecords.slice(0, 3).map((record, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <RecordsIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={record.diagnosis || 'General Consultation'}
                      secondary={new Date(record.visitDate).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
              View All Records
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientDashboard;
