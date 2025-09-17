// Navigation bar with user menu and language selector
// Responsive design with healthcare branding
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  Divider
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="static" elevation={2} sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        {/* Logo and app name */}
        <HospitalIcon sx={{ mr: 2 }} />
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          TeleMed
        </Typography>

        {/* Navigation buttons */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
          <Button 
            color="inherit" 
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
          >
            {t('navigation.dashboard')}
          </Button>
        </Box>

        {/* Language selector */}
        <LanguageSelector />

        {/* User menu */}
        <IconButton
          size="large"
          onClick={handleMenu}
          color="inherit"
          sx={{ ml: 1 }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {user?.firstName?.[0] || <AccountCircle />}
          </Avatar>
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">
              {user?.firstName} {user?.lastName}
            </Typography>
          </MenuItem>
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              {user?.role === 'doctor' ? 'Doctor' : 'Patient'}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            {t('navigation.logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
