/* eslint-disable no-unused-vars */
// AI-powered symptom checker component
// Provides health guidance based on symptoms
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Tooltip
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Add as AddIcon,
  HealthAndSafety as HealthIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  RefreshIcon,
  TipsAndUpdates as TipsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../../services/api';
import SymptomResult from './SymptomResult';

const SymptomChecker = () => {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  // Common symptoms for quick selection
  const commonSymptoms = [
    'fever', 'cough', 'headache', 'sore throat', 'nausea',
    'fatigue', 'chest pain', 'shortness of breath', 'dizziness',
    'stomach pain', 'muscle aches', 'runny nose', 'loss of appetite'
  ];

  // Load available symptoms on component mount
  useEffect(() => {
    loadAvailableSymptoms();
  }, []);

  const loadAvailableSymptoms = async () => {
    try {
      const response = await apiEndpoints.getAllSymptoms();
      if (response.data.success) {
        setAvailableSymptoms(response.data.symptoms || []);
      }
    } catch (error) {
      console.error('Failed to load symptoms:', error);
    }
  };

  const addSymptom = (symptom) => {
    if (symptom && !symptoms.includes(symptom.toLowerCase().trim())) {
      const normalizedSymptom = symptom.toLowerCase().trim();
      setSymptoms([...symptoms, normalizedSymptom]);
      setNewSymptom('');
      setError(''); // Clear any existing errors
      console.log('Added symptom:', normalizedSymptom);
    }
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
    setError(''); // Clear any existing errors
    console.log('Removed symptom:', symptom);
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    console.log('🔍 Starting symptom analysis for:', symptoms);
    setLoading(true);
    setError('');

    try {
      const response = await apiEndpoints.checkSymptoms(symptoms);
      console.log('📊 Analysis response:', response.data);
      
      if (response.data && response.data.success) {
        setResults(response.data.data);
        console.log('✅ Analysis successful');
      } else {
        // Handle legacy response format
        setResults(response.data);
        console.log('✅ Analysis successful (legacy format)');
      }
    } catch (err) {
      console.error('❌ Symptom analysis error:', err);
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setResults(null);
    setSymptoms([]);
    setError('');
    setNewSymptom('');
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'severe':
        return <WarningIcon color="error" />;
      case 'moderate':
        return <InfoIcon color="warning" />;
      default:
        return <CheckIcon color="success" />;
    }
  };

  const getSeverityColor = (confidence) => {
    if (confidence > 70) return 'error';
    if (confidence > 40) return 'warning';
    return 'success';
  };

  // If we have results, show the result component
  if (results) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <SymptomResult 
          results={results} 
          onNewAnalysis={resetAnalysis}
          onBookAppointment={() => window.location.href = '/dashboard'}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BrainIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              AI Symptom Checker
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Get instant health guidance based on your symptoms
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> Add your symptoms below and click "Analyze" to get preliminary health guidance. 
          Our AI will analyze your symptoms and provide recommendations based on medical knowledge.
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        {/* Symptom input */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Select Your Symptoms
            </Typography>

            {/* Add custom symptom with autocomplete */}
            <Box sx={{ mb: 3 }}>
              <Autocomplete
                options={availableSymptoms}
                value={newSymptom}
                onInputChange={(event, newInputValue) => {
                  setNewSymptom(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search and add symptoms"
                    placeholder="e.g., headache, fever, cough"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <SearchIcon color="action" />
                        </>
                      ),
                    }}
                  />
                )}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSymptom(newSymptom);
                  }
                }}
                freeSolo
                clearOnSelect
              />
              <Button
                variant="contained"
                onClick={() => addSymptom(newSymptom)}
                disabled={!newSymptom.trim()}
                sx={{ mt: 2, minWidth: 120 }}
                startIcon={<AddIcon />}
              >
                Add Symptom
              </Button>
            </Box>

            {/* Common symptoms */}
            <Typography variant="subtitle2" gutterBottom>
              Common symptoms (click to add):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {commonSymptoms.map((symptom) => (
                <Tooltip key={symptom} title={`Add ${symptom} to your symptom list`}>
                  <Chip
                    label={symptom}
                    onClick={() => addSymptom(symptom)}
                    disabled={symptoms.includes(symptom)}
                    color="primary"
                    variant="outlined"
                    clickable
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: symptoms.includes(symptom) ? 'action.disabled' : 'primary.light' 
                      } 
                    }}
                  />
                </Tooltip>
              ))}
            </Box>

            {/* Selected symptoms */}
            <Typography variant="subtitle2" gutterBottom>
              Selected symptoms ({symptoms.length}):
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                minHeight: 60,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: symptoms.length === 0 ? 'center' : 'flex-start',
                justifyContent: symptoms.length === 0 ? 'center' : 'flex-start'
              }}
            >
              {symptoms.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No symptoms selected
                </Typography>
              ) : (
                symptoms.map((symptom) => (
                  <Chip
                    key={symptom}
                    label={symptom}
                    onDelete={() => removeSymptom(symptom)}
                    deleteIcon={<CloseIcon />}
                    color="secondary"
                    variant="filled"
                    sx={{ m: 0.5 }}
                  />
                ))
              )}
            </Paper>

            {/* Action buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={analyzeSymptoms}
                disabled={loading || symptoms.length === 0}
                sx={{ flex: 1, py: 1.5 }}
                startIcon={loading ? <LinearProgress /> : <BrainIcon />}
              >
                {loading ? 'Analyzing...' : `Analyze ${symptoms.length} Symptom${symptoms.length !== 1 ? 's' : ''}`}
              </Button>
              
              {symptoms.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => setSymptoms([])}
                  disabled={loading}
                  startIcon={<CloseIcon />}
                >
                  Clear All
                </Button>
              )}
            </Box>

            {/* Error display */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Information panel */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              How Our AI Symptom Checker Works
            </Typography>

            {loading && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Analyzing your symptoms using AI...
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Processing {symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''} against medical database
                </Typography>
              </Box>
            )}

            {!loading && (
              <Box>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <BrainIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Advanced AI Analysis"
                      secondary="Uses machine learning algorithms to analyze symptom patterns"
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <HealthIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Medical Database"
                      secondary="Compares symptoms against comprehensive medical knowledge base"
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <TipsIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Personalized Recommendations"
                      secondary="Provides tailored health guidance based on symptom severity"
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Professional Guidance"
                      secondary="Recommends when to seek immediate or routine medical care"
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📋 Tips for Better Analysis:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Be specific about your symptoms (e.g., "severe headache" vs "headache")
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Include duration information when possible
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Add multiple related symptoms for more accurate results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Consider recent activities or changes in your routine
                </Typography>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Ready to analyze?</strong> Add at least one symptom and click the "Analyze" button to get started.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Disclaimer */}
      <Alert severity="warning" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Important Medical Disclaimer
        </Typography>
        <Typography variant="body2">
          This AI symptom checker is for informational purposes only and should not replace professional medical advice, 
          diagnosis, or treatment. Always consult with a qualified healthcare provider for any health concerns or before 
          making any medical decisions. If you're experiencing a medical emergency, call emergency services immediately.
        </Typography>
      </Alert>
    </Container>
  );
};

export default SymptomChecker;
