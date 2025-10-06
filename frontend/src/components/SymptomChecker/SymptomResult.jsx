/* eslint-disable */
// Symptom analysis result component
// Displays detailed analysis results and recommendations
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Button,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container
} from '@mui/material';
import {
  HealthAndSafety as HealthIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  LocalHospital as HospitalIcon,
  Psychology as BrainIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  ReportProblem as EmergencyIcon,  // CHANGED: Use ReportProblem instead of Emergency
  TipsAndUpdates as TipsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SymptomResult = ({ results, onNewAnalysis, onBookAppointment }) => {
  const navigate = useNavigate();

  console.log('📊 Displaying symptom results:', results);

  // Get severity level color
  const getSeverityColor = (confidence) => {
    if (confidence > 70) return 'error';
    if (confidence > 40) return 'warning';
    return 'success';
  };

  // Get severity icon
  const getSeverityIcon = (confidence) => {
    if (confidence > 70) return <WarningIcon color="error" />;
    if (confidence > 40) return <InfoIcon color="warning" />;
    return <CheckIcon color="success" />;
  };

  // Get recommendation icon
  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <EmergencyIcon color="error" />; // Now uses ReportProblem
      case 'important':
        return <HospitalIcon color="warning" />;
      case 'general':
        return <InfoIcon color="info" />;
      case 'advice':
        return <TipsIcon color="primary" />;
      case 'lifestyle':
        return <CheckIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Format confidence level text
  const getConfidenceText = (confidence) => {
    if (confidence > 80) return 'Very High Confidence';
    if (confidence > 60) return 'High Confidence';
    if (confidence > 40) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  // Get severity alert level
  const getSeverityAlert = (severity) => {
    switch (severity) {
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (!results) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <BrainIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Analysis Results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please add symptoms and run analysis to see results here.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BrainIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Symptom Analysis Results
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              AI-powered health assessment completed
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Analysis Summary */}
      <Card elevation={3} sx={{ mb: 3, borderLeft: 4, borderColor: 'primary.main' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BrainIcon color="primary" />
            Analysis Summary
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {results.totalSymptoms || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Symptoms
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {results.matchedSymptoms || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Matched Symptoms
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {results.possibleConditions?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Possible Conditions
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {results.confidence || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Confidence
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Confidence bar */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Analysis Confidence: {getConfidenceText(results.confidence || 0)}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={results.confidence || 0} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: results.confidence > 60 ? 'success.main' : results.confidence > 30 ? 'warning.main' : 'error.main'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Analyzed Symptoms */}
      {results.analyzedSymptoms && results.analyzedSymptoms.length > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Analyzed Symptoms ({results.analyzedSymptoms.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {results.analyzedSymptoms.map((symptom, index) => (
                <Chip
                  key={index}
                  label={symptom}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Severity Assessment */}
      {results.severity && (
        <Alert 
          severity={getSeverityAlert(results.severity)} 
          sx={{ mb: 3 }}
          icon={results.severity === 'severe' ? <EmergencyIcon /> : results.severity === 'moderate' ? <WarningIcon /> : <InfoIcon />}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Severity Assessment: {results.severity.toUpperCase()}
          </Typography>
          <Typography variant="body2">
            {results.severity === 'severe' && '🚨 This appears to be a potentially serious condition requiring immediate medical attention.'}
            {results.severity === 'moderate' && '⚠️ This condition may require medical evaluation. Consider scheduling an appointment soon.'}
            {results.severity === 'mild' && 'ℹ️ This appears to be a mild condition. Monitor symptoms and seek care if they worsen.'}
          </Typography>
        </Alert>
      )}

      {/* Possible Conditions */}
      {results.possibleConditions && results.possibleConditions.length > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HealthIcon color="primary" />
              Possible Health Conditions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Based on your symptoms, here are the most likely conditions (ranked by confidence):
            </Typography>

            <List>
              {results.possibleConditions.map((condition, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    {getSeverityIcon(condition.confidence)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {index + 1}. {condition.condition}
                        </Typography>
                        <Chip
                          label={`${condition.confidence}% confidence`}
                          size="small"
                          color={getSeverityColor(condition.confidence)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Based on {condition.matchingSymptoms} matching symptom{condition.matchingSymptoms !== 1 ? 's' : ''}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TipsIcon color="info" />
              Personalized Health Recommendations
            </Typography>

            <List>
              {results.recommendations.map((recommendation, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ mt: 0.5 }}>
                    {getRecommendationIcon(recommendation.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {recommendation.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {recommendation.action}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card elevation={3} sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🎯 Recommended Next Steps
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<ScheduleIcon />}
                onClick={() => onBookAppointment ? onBookAppointment() : navigate('/dashboard')}
                sx={{ mb: 1 }}
              >
                Book Medical Consultation
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<PhoneIcon />}
                href="tel:911"
                sx={{ 
                  mb: 1,
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Emergency: Call 911
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          ⚠️ Important Medical Disclaimer
        </Typography>
        <Typography variant="body2">
          {results.disclaimer || 'This analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for any health concerns or before making any medical decisions. If you are experiencing a medical emergency, call emergency services immediately.'}
        </Typography>
      </Alert>

      {/* Additional Information Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            🤖 How This AI Analysis Works
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Our AI-powered symptom checker uses advanced algorithms to analyze your reported symptoms against a comprehensive medical database. Here's how it works:
          </Typography>
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Symptom Pattern Recognition"
                secondary="Compares your symptoms with thousands of documented medical conditions" 
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Probability Calculation"
                secondary="Calculates confidence scores based on symptom-condition correlations" 
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Severity Assessment"
                secondary="Evaluates the urgency level based on symptom severity patterns" 
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Personalized Recommendations"
                secondary="Provides tailored health guidance and next steps based on analysis" 
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            <strong>Analysis Accuracy:</strong> This tool achieved {results.confidence || 0}% confidence in matching your symptoms. 
            Higher confidence indicates stronger correlation with known medical conditions.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={onNewAnalysis}
          size="large"
          startIcon={<RefreshIcon />}
        >
          New Analysis
        </Button>
        
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          size="large"
          startIcon={<DashboardIcon />}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default SymptomResult;
