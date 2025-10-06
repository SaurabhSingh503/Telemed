/* eslint-disable */
// Symptom checker routes for AI-powered diagnosis suggestions
// Provides basic symptom analysis functionality
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  analyzeSymptoms, 
  getSymptomSuggestions,
  getAllSymptoms
} = require('../controllers/symptomCheckerController');

console.log('🩺 Setting up symptom checker routes...');

// Simple symptom-to-condition mapping for demo purposes
// In a real app, this would use a proper ML model
const symptomDatabase = {
  'fever': ['Common Cold', 'Flu', 'COVID-19', 'Malaria'],
  'cough': ['Common Cold', 'Flu', 'COVID-19', 'Bronchitis'],
  'headache': ['Migraine', 'Tension Headache', 'Flu', 'Dehydration'],
  'sore throat': ['Common Cold', 'Strep Throat', 'Flu'],
  'nausea': ['Food Poisoning', 'Migraine', 'Gastroenteritis'],
  'fatigue': ['Flu', 'Anemia', 'Depression', 'Sleep Disorder'],
  'chest pain': ['Heart Disease', 'Anxiety', 'Muscle Strain'],
  'shortness of breath': ['Asthma', 'Heart Disease', 'COVID-19'],
  'muscle aches': ['Flu', 'Exercise Strain', 'Fibromyalgia'],
  'runny nose': ['Common Cold', 'Allergies', 'Flu'],
  'loss of appetite': ['Depression', 'Gastroenteritis', 'Flu'],
  'dizziness': ['Low Blood Pressure', 'Dehydration', 'Anemia'],
  'stomach pain': ['Gastritis', 'Food Poisoning', 'Appendicitis']
};

// POST /api/symptom-checker/analyze - Analyze symptoms using AI controller
router.post('/analyze', authenticateToken, analyzeSymptoms);

// GET /api/symptom-checker/suggestions?query=headache - Get symptom suggestions
router.get('/suggestions', authenticateToken, getSymptomSuggestions);

// GET /api/symptom-checker/symptoms - Get all available symptoms
router.get('/symptoms', authenticateToken, getAllSymptoms);

// POST /api/symptom-checker - Legacy endpoint and fallback for current frontend
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Legacy symptom checker endpoint called with:', req.body);
    
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid symptoms data',
        message: 'Please provide an array of symptoms'
      });
    }
    
    // Find possible conditions based on symptoms
    const possibleConditions = new Set();
    const matchedSymptoms = [];
    
    symptoms.forEach(symptom => {
      const lowerSymptom = symptom.toLowerCase().trim();
      
      // Check exact match or partial match
      const matchingKeys = Object.keys(symptomDatabase).filter(key => 
        key === lowerSymptom || 
        key.includes(lowerSymptom) || 
        lowerSymptom.includes(key)
      );
      
      matchingKeys.forEach(key => {
        matchedSymptoms.push(symptom);
        symptomDatabase[key].forEach(condition => {
          possibleConditions.add(condition);
        });
      });
    });
    
    // Convert set to array and add confidence scores
    const results = Array.from(possibleConditions).map(condition => {
      // Calculate simple confidence based on symptom matches
      const matchingSymptoms = matchedSymptoms.filter(symptom => {
        const lowerSymptom = symptom.toLowerCase();
        return Object.keys(symptomDatabase).some(key => 
          (key === lowerSymptom || key.includes(lowerSymptom) || lowerSymptom.includes(key)) &&
          symptomDatabase[key].includes(condition)
        );
      });
      
      return {
        condition,
        confidence: Math.round((matchingSymptoms.length / symptoms.length) * 100),
        matchingSymptoms: matchingSymptoms.length
      };
    }).sort((a, b) => b.confidence - a.confidence);
    
    // Determine overall severity based on conditions
    let overallSeverity = 'mild';
    const severeConditions = ['Heart Disease', 'Appendicitis'];
    const moderateConditions = ['COVID-19', 'Flu', 'Migraine', 'Asthma'];
    
    if (results.some(r => severeConditions.includes(r.condition) && r.confidence > 30)) {
      overallSeverity = 'severe';
    } else if (results.some(r => moderateConditions.includes(r.condition) && r.confidence > 40)) {
      overallSeverity = 'moderate';
    }
    
    // Generate basic recommendations
    const recommendations = [];
    if (overallSeverity === 'severe') {
      recommendations.push({
        type: 'urgent',
        message: 'Seek immediate medical attention',
        action: 'Visit emergency room or call emergency services'
      });
    } else if (overallSeverity === 'moderate') {
      recommendations.push({
        type: 'important', 
        message: 'Schedule a consultation with a healthcare provider',
        action: 'Book an appointment within 24-48 hours'
      });
    } else {
      recommendations.push({
        type: 'general',
        message: 'Monitor symptoms and rest',
        action: 'Rest, stay hydrated, and track symptom changes'
      });
    }
    
    recommendations.push({
      type: 'lifestyle',
      message: 'Maintain good health practices', 
      action: 'Get adequate rest, stay hydrated, eat nutritious food'
    });
    
    const overallConfidence = matchedSymptoms.length > 0 
      ? Math.round((matchedSymptoms.length / symptoms.length) * 100)
      : 0;
    
    console.log('✅ Legacy analysis completed:', {
      matchedSymptoms: matchedSymptoms.length,
      conditions: results.length,
      severity: overallSeverity
    });
    
    // Return in the format expected by frontend
    const response = {
      success: true,
      data: {
        analyzedSymptoms: [...new Set(matchedSymptoms)],
        possibleConditions: results,
        severity: overallSeverity,
        recommendations,
        confidence: overallConfidence,
        totalSymptoms: symptoms.length,
        matchedSymptoms: matchedSymptoms.length,
        disclaimer: 'This analysis is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.'
      }
    };
    
    // Also support legacy format for backward compatibility
    res.json(response.success ? response.data : {
      analyzedSymptoms: [...new Set(matchedSymptoms)],
      possibleConditions: results,
      disclaimer: 'This is for informational purposes only. Please consult a healthcare professional for proper diagnosis.'
    });
    
  } catch (error) {
    console.error('❌ Legacy symptom analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to analyze symptoms',
      message: 'Unable to process symptom analysis at this time'
    });
  }
});

console.log('✅ Symptom checker routes configured');

module.exports = router;
