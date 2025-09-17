// Sidebar navigation component for desktop layout
// Provides quick access to main application features
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoCall as VideoIcon,
  Assignment as RecordsIcon,
  Psychology as SymptomIcon,
  LocalPharmacy as PharmacyIcon,
  Schedule as ScheduleIcon,
  Person as ProfileIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 280;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['patient', 'doctor']
    },
    {
      text: 'Video Consultation',
      icon: <VideoIcon />,
      path: '/video-call',
      roles: ['patient', 'doctor']
    },
    {
      text: 'Health Records',
      icon: <RecordsIcon />,
      path: '/health-records',
      roles: ['patient', 'doctor']
    },
    {
      text: 'Appointments',
      icon: <ScheduleIcon />,
      path: '/appointments',
      roles: ['patient', 'doctor']
    },
    {
      text: 'Symptom Checker',
      icon: <SymptomIcon />,
      path: '/symptom-checker',
      roles: ['patient']
    },
    {
      text: 'Find Pharmacies',
      icon: <PharmacyIcon />,
      path: '/pharmacies',
      roles: ['patient']
    },
    {
      text: 'Profile',
      icon: <ProfileIcon />,
      path: '/profile',
      roles: ['patient', 'doctor']
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <HospitalIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight="bold">
            TeleMed
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            {user?.firstName?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Chip
              label={user?.role === 'doctor' ? 'Doctor' : 'Patient'}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 2 }}>
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText'
                    },
                    '&:hover': {
                      bgcolor: 'primary.main'
                    }
                  },
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 'bold' : 'normal'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      <Divider sx={{ mt: 2 }} />

      {/* Footer */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          TeleMedicine Platform v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
