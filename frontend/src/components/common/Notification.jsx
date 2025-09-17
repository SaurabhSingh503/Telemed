// Notification component for user feedback
// Handles success, error, warning, and info messages
import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const Notification = ({ 
  open, 
  onClose, 
  message, 
  severity = 'info', 
  title,
  duration = 6000,
  position = { vertical: 'top', horizontal: 'right' }
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
    onClose && onClose();
  };

  const getIcon = () => {
    switch (severity) {
      case 'success': return <SuccessIcon />;
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const SlideTransition = (props) => {
    return <Slide {...props} direction="left" />;
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        icon={getIcon()}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          width: '100%',
          minWidth: 300,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

// Hook for using notifications
export const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
    title: ''
  });

  const showNotification = (message, severity = 'info', title = '') => {
    setNotification({
      open: true,
      message,
      severity,
      title
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const showSuccess = (message, title = 'Success') => {
    showNotification(message, 'success', title);
  };

  const showError = (message, title = 'Error') => {
    showNotification(message, 'error', title);
  };

  const showWarning = (message, title = 'Warning') => {
    showNotification(message, 'warning', title);
  };

  const showInfo = (message, title = 'Information') => {
    showNotification(message, 'info', title);
  };

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification
  };
};

export default Notification;
