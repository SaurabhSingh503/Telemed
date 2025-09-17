// AI-powered symptom checker component
// Provides health guidance based on symptoms
import React, { useState } from 'react';
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
  AccordionDetails
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Add as AddIcon,
  HealthAndSafety as HealthIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { apiEndpoints } from '../../services/api';

const SymptomChecker = () => {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common symptoms for quick selection
  const commonSymptoms = [
    'fever', 'cough', 'headache', 'sore throat', 'nausea',
    'fatigue', 'chest pain', 'shortness of breath', 'dizziness',
    'stomach pain', 'muscle aches', 'runny nose', 'loss of appetite'
  ];

  const addSymptom = (symptom) => {
    if (symptom && !symptoms.includes(symptom.toLowerCase())) {
      setSymptoms([...symptoms, symptom.toLowerCase()]);
      setNewSymptom('');
      setError(''); // Clear any existing errors
    }
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
    setError(''); // Clear any existing errors
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiEndpoints.checkSymptoms(symptoms);
      
      if (response.data && response.data.success) {
        setResults(response.data.data);
      } else {
        setResults(response.data);
      }
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
      console.error('Symptom analysis error:', err);
    } finally {
      setLoading(false);
    }
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

      <Grid container spacing={4}>
        {/* Symptom input */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Select Your Symptoms
            </Typography>

            {/* Add custom symptom */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                fullWidth
                label="Add symptom"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSymptom(newSymptom);
                  }
                }}
                placeholder="e.g., headache, fever, cough"
              />
              <Button
                variant="contained"
                onClick={() => addSymptom(newSymptom)}
                disabled={!newSymptom.trim()}
                sx={{ minWidth: 100 }}
              >
                <AddIcon />
              </Button>
            </Box>

            {/* Common symptoms */}
            <Typography variant="subtitle2" gutterBottom>
              Common symptoms (click to add):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {commonSymptoms.map((symptom) => (
                <Chip
                  key={symptom}
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
              ))}
            </Box>

            {/* Selected symptoms */}
            <Typography variant="subtitle2" gutterBottom>
              Selected symptoms ({symptoms.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, minHeight: 40 }}>
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
                  />
                ))
              )}
            </Box>

            {/* Analyze button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={analyzeSymptoms}
              disabled={loading || symptoms.length === 0}
              sx={{ mt: 2, py: 1.5 }}
            >
              {loading ? 'Analyzing Symptoms...' : `Analyze ${symptoms.length} Symptom${symptoms.length !== 1 ? 's' : ''}`}
            </Button>

            {/* Error display */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Analysis Results
            </Typography>

            {loading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Analyzing your symptoms...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {results ? (
              <Box>
                {/* Analysis summary */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Analysis Summary:</strong> {results.matchedSymptoms?.length || 0} of {results.totalSymptoms || 0} symptoms matched our database.
                    {results.confidence && ` Confidence: ${results.confidence}%`}
                  </Typography>
                </Alert>

                {/* Possible conditions */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                  Possible Conditions:
                </Typography>
                
                {results.possibleConditions && results.possibleConditions.length > 0 ? (
                  <List sx={{ mb: 2 }}>
                    {results.possibleConditions.map((condition, index) => (
                      <ListItem key={index} divider sx={{ px: 0 }}>
                        <ListItemIcon>
                          <HealthIcon 
                            color={getSeverityColor(condition.confidence)}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {condition.condition}
                              </Typography>
                              <Chip
                                label={`${condition.confidence}%`}
                                size="small"
                                color={getSeverityColor(condition.confidence)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={`Based on ${condition.matchingSymptoms || 'multiple'} matching symptoms`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No specific conditions identified based on the symptoms provided.
                  </Typography>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        📋 Recommendations
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {results.recommendations.map((rec, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon>
                              {getSeverityIcon(rec.type === 'urgent' ? 'severe' : rec.type === 'important' ? 'moderate' : 'mild')}
                            </ListItemIcon>
                            <ListItemText
                              primary={rec.message}
                              secondary={rec.action}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Disclaimer */}
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Important Disclaimer:</strong> {results.disclaimer || 'This analysis is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.'}
                  </Typography>
                </Alert>

                {/* Recommendation */}
                <Card sx={{ mt: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      💡 Next Steps
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      For professional medical advice and proper treatment, schedule a consultation with our qualified healthcare providers.
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Book Medical Consultation
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BrainIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Add your symptoms and click "Analyze" to get health insights
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Our AI will analyze your symptoms and provide preliminary health guidance
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SymptomChecker;
