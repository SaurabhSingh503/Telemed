// Symptom checker routes for AI-powered diagnosis suggestions
// Provides basic symptom analysis functionality
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

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
  'shortness of breath': ['Asthma', 'Heart Disease', 'COVID-19']
};

// POST /api/symptom-checker - Analyze symptoms
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ 
        error: 'Invalid symptoms data',
        message: 'Please provide an array of symptoms'
      });
    }
    
    // Find possible conditions based on symptoms
    const possibleConditions = new Set();
    const matchedSymptoms = [];
    
    symptoms.forEach(symptom => {
      const lowerSymptom = symptom.toLowerCase();
      if (symptomDatabase[lowerSymptom]) {
        matchedSymptoms.push(symptom);
        symptomDatabase[lowerSymptom].forEach(condition => {
          possibleConditions.add(condition);
        });
      }
    });
    
    // Convert set to array and add confidence scores
    const results = Array.from(possibleConditions).map(condition => {
      // Calculate simple confidence based on symptom matches
      const matchingSymptoms = matchedSymptoms.filter(symptom => 
        symptomDatabase[symptom.toLowerCase()]?.includes(condition)
      );
      
      return {
        condition,
        confidence: Math.round((matchingSymptoms.length / symptoms.length) * 100),
        matchingSymptoms
      };
    }).sort((a, b) => b.confidence - a.confidence);
    
    res.json({
      analyzedSymptoms: matchedSymptoms,
      possibleConditions: results,
      disclaimer: 'This is for informational purposes only. Please consult a healthcare professional for proper diagnosis.'
    });
    
  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze symptoms' });
  }
});

module.exports = router;
