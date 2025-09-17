// Jitsi Meet integration for video consultations
// Provides secure video calling functionality
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Button, Typography } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const JitsiMeeting = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jitsiContainerRef = useRef(null);
  const jitsiApi = useRef(null);

  useEffect(() => {
    // Load Jitsi Meet API
    const loadJitsiMeet = () => {
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi();
      } else {
        // Wait for script to load
        const checkJitsi = setInterval(() => {
          if (window.JitsiMeetExternalAPI) {
            clearInterval(checkJitsi);
            initializeJitsi();
          }
        }, 100);

        // Cleanup interval after 10 seconds
        setTimeout(() => clearInterval(checkJitsi), 10000);
      }
    };

    const initializeJitsi = () => {
      if (jitsiContainerRef.current && !jitsiApi.current) {
        const options = {
          roomName: roomId,
          width: '100%',
          height: 600,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: `${user?.firstName} ${user?.lastName}`,
            email: user?.email
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            enableWelcomePage: false,
            prejoinPageEnabled: false
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop',
              'fullscreen', 'fodeviceselection', 'hangup', 'profile',
              'settings', 'videoquality'
            ],
            SETTINGS_SECTIONS: ['devices', 'language'],
            MOBILE_APP_PROMO: false
          }
        };

        jitsiApi.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);

        // Event listeners
        jitsiApi.current.addEventListener('videoConferenceLeft', () => {
          navigate('/dashboard');
        });

        jitsiApi.current.addEventListener('readyToClose', () => {
          navigate('/dashboard');
        });
      }
    };

    loadJitsiMeet();

    // Cleanup
    return () => {
      if (jitsiApi.current) {
        jitsiApi.current.dispose();
        jitsiApi.current = null;
      }
    };
  }, [roomId, user, navigate]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/dashboard')}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Video Consultation - Room: {roomId}
          </Typography>
        </Box>
      </Paper>

      {/* Jitsi Meet container */}
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <div ref={jitsiContainerRef} style={{ width: '100%', height: '600px' }} />
      </Paper>
    </Box>
  );
};

export default JitsiMeeting;
