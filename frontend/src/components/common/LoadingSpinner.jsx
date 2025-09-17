// Loading spinner component for async operations
// Professional healthcare-themed loading indicator
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { LocalHospital as HospitalIcon } from '@mui/icons-material';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        gap: 2
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress size={60} thickness={4} />
        <HospitalIcon 
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 24,
            color: 'primary.main'
          }} 
        />
      </Box>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
