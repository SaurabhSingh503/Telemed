/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-undef */
// Meeting room component for video consultations
// Enhanced Jitsi Meet integration with custom controls
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CallEnd as EndCallIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideoIcon,
  VideocamOff as VideoOffIcon,
  ScreenShare as ScreenShareIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jitsiContainerRef = useRef(null);
  const jitsiApi = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    let mounted = true;

    const initializeJitsi = async () => {
      try {
        // Wait for Jitsi API to be available
        if (!window.JitsiMeetExternalAPI) {
          console.error('Jitsi Meet API not loaded');
          return;
        }

        if (jitsiContainerRef.current && !jitsiApi.current && mounted) {
          const options = {
            roomName: roomId,
            width: '100%',
            height: 500,
            parentNode: jitsiContainerRef.current,
            userInfo: {
              displayName: `${user?.firstName} ${user?.lastName}`,
              email: user?.email
            },
            configOverwrite: {
              startWithAudioMuted: true,
              startWithVideoMuted: true,
              enableWelcomePage: false,
              prejoinPageEnabled: false,
              toolbarButtons: [
                'microphone', 'camera', 'closedcaptions', 
                'desktop', 'fullscreen', 'fodeviceselection', 
                'hangup', 'profile', 'settings', 'videoquality'
              ],
              defaultLanguage: 'en',
              disableInviteFunctions: true
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 
                'desktop', 'fullscreen', 'fodeviceselection', 
                'hangup', 'profile', 'settings', 'videoquality'
              ],
              SETTINGS_SECTIONS: ['devices', 'language'],
              MOBILE_APP_PROMO: false,
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false
            }
          };

          try {
            jitsiApi.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);
            
            // Event listeners
            jitsiApi.current.addEventListener('videoConferenceJoined', () => {
              console.log('Conference joined');
              setIsLoading(false);
            });

            jitsiApi.current.addEventListener('videoConferenceLeft', () => {
              console.log('Conference left');
              handleEndCall();
            });

            jitsiApi.current.addEventListener('readyToClose', () => {
              console.log('Ready to close');
              handleEndCall();
            });

            jitsiApi.current.addEventListener('participantJoined', (participant) => {
              console.log('Participant joined:', participant);
              setParticipants(prev => prev + 1);
            });

            jitsiApi.current.addEventListener('participantLeft', (participant) => {
              console.log('Participant left:', participant);
              setParticipants(prev => Math.max(1, prev - 1));
            });

            // Audio/Video state listeners
            jitsiApi.current.addEventListener('audioMuteStatusChanged', ({ muted }) => {
              setIsAudioMuted(muted);
            });

            jitsiApi.current.addEventListener('videoMuteStatusChanged', ({ muted }) => {
              setIsVideoMuted(muted);
            });

          } catch (error) {
            console.error('Error initializing Jitsi:', error);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in initializeJitsi:', error);
        setIsLoading(false);
      }
    };

    // Initialize with a small delay to ensure DOM is ready
    const timer = setTimeout(initializeJitsi, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (jitsiApi.current) {
        try {
          jitsiApi.current.dispose();
        } catch (error) {
          console.error('Error disposing Jitsi API:', error);
        }
        jitsiApi.current = null;
      }
    };
  }, [roomId, user, navigate]);

  const handleEndCall = () => {
    if (jitsiApi.current) {
      try {
        jitsiApi.current.dispose();
      } catch (error) {
        console.error('Error disposing Jitsi API:', error);
      }
      jitsiApi.current = null;
    }
    navigate('/dashboard');
  };

  const toggleAudio = () => {
    if (jitsiApi.current) {
      jitsiApi.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApi.current) {
      jitsiApi.current.executeCommand('toggleVideo');
    }
  };

  const shareScreen = () => {
    if (jitsiApi.current) {
      jitsiApi.current.executeCommand('toggleShareScreen');
    }
  };

  return (
    <Box sx={{ p: 2, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => setShowEndDialog(true)}
          variant="outlined"
          color="secondary"
        >
          Leave Meeting
        </Button>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">
            Medical Consultation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Room: {roomId} • Participants: {participants}
          </Typography>
        </Box>

        {/* Control buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isAudioMuted ? "Unmute" : "Mute"}>
            <IconButton
              onClick={toggleAudio}
              color={isAudioMuted ? "error" : "primary"}
              sx={{ bgcolor: isAudioMuted ? 'error.light' : 'primary.light' }}
            >
              {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isVideoMuted ? "Turn on camera" : "Turn off camera"}>
            <IconButton
              onClick={toggleVideo}
              color={isVideoMuted ? "error" : "primary"}
              sx={{ bgcolor: isVideoMuted ? 'error.light' : 'primary.light' }}
            >
              {isVideoMuted ? <VideocamOffIcon /> : <VideoIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Share screen">
            <IconButton onClick={shareScreen} color="info">
              <ScreenShareIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="End call">
            <IconButton
              onClick={() => setShowEndDialog(true)}
              color="error"
              sx={{ bgcolor: 'error.light' }}
            >
              <EndCallIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Loading state */}
      {isLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Connecting to video consultation...
        </Alert>
      )}

      {/* Video container */}
      <Paper 
        elevation={3} 
        sx={{ 
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: '#000'
        }}
      >
        <div 
          ref={jitsiContainerRef} 
          style={{ 
            width: '100%', 
            height: '500px',
            minHeight: '400px'
          }} 
        />
      </Paper>

      {/* Medical consultation info */}
      <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          🏥 Medical Consultation Guidelines
        </Typography>
        <Typography variant="body2">
          • Ensure you're in a quiet, private location
          • Have your medical history and current medications ready
          • Take notes during the consultation
          • This session may be recorded for medical records
        </Typography>
      </Paper>

      {/* End call confirmation dialog */}
      <Dialog open={showEndDialog} onClose={() => setShowEndDialog(false)}>
        <DialogTitle>End Consultation?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave this medical consultation? 
            This will end the video call for all participants.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEndDialog(false)}>
            Stay in Call
          </Button>
          <Button onClick={handleEndCall} color="error" variant="contained">
            End Consultation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingRoom;
