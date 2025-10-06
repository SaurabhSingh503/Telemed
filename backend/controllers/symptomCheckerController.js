/* eslint-disable */
// Symptom checker controller with AI-powered analysis
// Provides health guidance based on symptom patterns
const symptomDatabase = {
  // Common symptoms and their associated conditions
  'fever': [
    { condition: 'Common Cold', probability: 0.6, severity: 'mild' },
    { condition: 'Flu', probability: 0.7, severity: 'moderate' },
    { condition: 'COVID-19', probability: 0.5, severity: 'moderate' },
    { condition: 'Malaria', probability: 0.3, severity: 'severe' }
  ],
  'cough': [
    { condition: 'Common Cold', probability: 0.8, severity: 'mild' },
    { condition: 'Flu', probability: 0.6, severity: 'moderate' },
    { condition: 'COVID-19', probability: 0.7, severity: 'moderate' },
    { condition: 'Bronchitis', probability: 0.5, severity: 'moderate' }
  ],
  'headache': [
    { condition: 'Migraine', probability: 0.7, severity: 'moderate' },
    { condition: 'Tension Headache', probability: 0.8, severity: 'mild' },
    { condition: 'Flu', probability: 0.4, severity: 'moderate' },
    { condition: 'Dehydration', probability: 0.6, severity: 'mild' }
  ],
  'sore throat': [
    { condition: 'Common Cold', probability: 0.7, severity: 'mild' },
    { condition: 'Strep Throat', probability: 0.6, severity: 'moderate' },
    { condition: 'Flu', probability: 0.5, severity: 'moderate' }
  ],
  'nausea': [
    { condition: 'Food Poisoning', probability: 0.6, severity: 'moderate' },
    { condition: 'Migraine', probability: 0.4, severity: 'moderate' },
    { condition: 'Gastroenteritis', probability: 0.7, severity: 'moderate' }
  ],
  'fatigue': [
    { condition: 'Flu', probability: 0.6, severity: 'moderate' },
    { condition: 'Anemia', probability: 0.4, severity: 'moderate' },
    { condition: 'Depression', probability: 0.3, severity: 'moderate' },
    { condition: 'Sleep Disorder', probability: 0.5, severity: 'mild' }
  ],
  'chest pain': [
    { condition: 'Heart Disease', probability: 0.3, severity: 'severe' },
    { condition: 'Anxiety', probability: 0.6, severity: 'mild' },
    { condition: 'Muscle Strain', probability: 0.7, severity: 'mild' }
  ],
  'shortness of breath': [
    { condition: 'Asthma', probability: 0.7, severity: 'moderate' },
    { condition: 'Heart Disease', probability: 0.4, severity: 'severe' },
    { condition: 'COVID-19', probability: 0.5, severity: 'moderate' }
  ],
  'dizziness': [
    { condition: 'Low Blood Pressure', probability: 0.6, severity: 'mild' },
    { condition: 'Dehydration', probability: 0.7, severity: 'mild' },
    { condition: 'Anemia', probability: 0.4, severity: 'moderate' }
  ],
  'stomach pain': [
    { condition: 'Gastritis', probability: 0.6, severity: 'moderate' },
    { condition: 'Food Poisoning', probability: 0.5, severity: 'moderate' },
    { condition: 'Appendicitis', probability: 0.2, severity: 'severe' }
  ],
  'muscle aches': [
    { condition: 'Flu', probability: 0.7, severity: 'moderate' },
    { condition: 'Exercise Strain', probability: 0.8, severity: 'mild' },
    { condition: 'Fibromyalgia', probability: 0.3, severity: 'moderate' }
  ],
  'runny nose': [
    { condition: 'Common Cold', probability: 0.9, severity: 'mild' },
    { condition: 'Allergies', probability: 0.7, severity: 'mild' },
    { condition: 'Flu', probability: 0.4, severity: 'moderate' }
  ],
  'loss of appetite': [
    { condition: 'Depression', probability: 0.5, severity: 'moderate' },
    { condition: 'Gastroenteritis', probability: 0.6, severity: 'moderate' },
    { condition: 'Flu', probability: 0.4, severity: 'moderate' }
  ]
};

// Analyze symptoms using simple ML approach
const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    console.log('🔍 Analyzing symptoms:', symptoms);
    
    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid symptoms data',
        message: 'Please provide an array of symptoms'
      });
    }
    
    // Clean and normalize symptoms
    const normalizedSymptoms = symptoms
      .map(s => s.toString().toLowerCase().trim())
      .filter(s => s.length > 0);
    
    if (normalizedSymptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid symptoms provided'
      });
    }
    
    console.log('🔄 Normalized symptoms:', normalizedSymptoms);
    
    // Analyze symptoms
    const analysis = performSymptomAnalysis(normalizedSymptoms);
    
    // Generate recommendations
    const recommendations = generateRecommendations(analysis);
    
    console.log('✅ Analysis completed:', {
      matchedSymptoms: analysis.matchedSymptoms.length,
      conditions: analysis.conditions.length,
      severity: analysis.overallSeverity
    });
    
    res.json({
      success: true,
      data: {
        analyzedSymptoms: analysis.matchedSymptoms,
        possibleConditions: analysis.conditions,
        severity: analysis.overallSeverity,
        recommendations,
        disclaimer: 'This analysis is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.',
        confidence: analysis.confidence,
        totalSymptoms: normalizedSymptoms.length,
        matchedSymptoms: analysis.matchedSymptoms.length
      }
    });
    
  } catch (error) {
    console.error('❌ Symptom analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to analyze symptoms',
      message: 'Unable to process symptom analysis at this time'
    });
  }
};

// Core symptom analysis algorithm
const performSymptomAnalysis = (symptoms) => {
  const conditionScores = new Map();
  const matchedSymptoms = [];
  let severityLevels = [];
  
  console.log('🧠 Starting symptom analysis for:', symptoms);
  
  // Process each symptom
  symptoms.forEach(symptom => {
    const symptomLower = symptom.toLowerCase();
    
    // Check for exact matches and partial matches
    const matchingEntries = Object.entries(symptomDatabase).filter(([key]) => {
      // Exact match or contains
      return key === symptomLower || 
             key.includes(symptomLower) || 
             symptomLower.includes(key) ||
             // Handle common variations
             (symptomLower.includes('throat') && key.includes('sore throat')) ||
             (symptomLower.includes('nose') && key.includes('runny nose')) ||
             (symptomLower.includes('appetite') && key.includes('loss of appetite'));
    });
    
    if (matchingEntries.length > 0) {
      console.log(`✅ Found matches for "${symptom}":`, matchingEntries.map(([key]) => key));
    }
    
    matchingEntries.forEach(([symptomKey, conditions]) => {
      matchedSymptoms.push(symptom);
      
      conditions.forEach(({ condition, probability, severity }) => {
        const currentScore = conditionScores.get(condition) || 0;
        const newScore = currentScore + probability;
        conditionScores.set(condition, newScore);
        
        severityLevels.push(severity);
      });
    });
  });
  
  // Calculate overall severity
  const severityOrder = { 'mild': 1, 'moderate': 2, 'severe': 3 };
  const overallSeverity = severityLevels.length > 0 
    ? Object.keys(severityOrder).find(key => 
        severityOrder[key] === Math.max(...severityLevels.map(s => severityOrder[s]))
      ) 
    : 'mild';
  
  // Sort conditions by score and calculate confidence
  const conditions = Array.from(conditionScores.entries())
    .map(([condition, score]) => ({
      condition,
      confidence: Math.min(Math.round((score / symptoms.length) * 100), 95),
      matchingSymptoms: symptoms.length
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // Top 5 conditions
  
  // Calculate overall confidence
  const overallConfidence = matchedSymptoms.length > 0 
    ? Math.round((matchedSymptoms.length / symptoms.length) * 100)
    : 0;
  
  console.log('📊 Analysis results:', {
    matchedSymptoms: matchedSymptoms.length,
    totalConditions: conditions.length,
    overallSeverity,
    overallConfidence
  });
  
  return {
    matchedSymptoms: [...new Set(matchedSymptoms)],
    conditions,
    overallSeverity,
    confidence: overallConfidence
  };
};

// Generate personalized recommendations
const generateRecommendations = (analysis) => {
  const recommendations = [];
  
  // Severity-based recommendations
  if (analysis.overallSeverity === 'severe') {
    recommendations.push({
      type: 'urgent',
      message: '⚠️ Seek immediate medical attention',
      action: 'Visit emergency room or call emergency services immediately'
    });
    recommendations.push({
      type: 'important',
      message: '📞 Contact healthcare provider now',
      action: 'Call your doctor or hospital for immediate consultation'
    });
  } else if (analysis.overallSeverity === 'moderate') {
    recommendations.push({
      type: 'important',
      message: '🏥 Schedule a consultation with a healthcare provider',
      action: 'Book an appointment within 24-48 hours for proper evaluation'
    });
    recommendations.push({
      type: 'general',
      message: '👩‍⚕️ Consider telehealth consultation',
      action: 'Use our platform to consult with verified doctors online'
    });
  } else {
    recommendations.push({
      type: 'general',
      message: '👀 Monitor symptoms and rest',
      action: 'Get plenty of rest, stay hydrated, and track any changes in symptoms'
    });
    recommendations.push({
      type: 'advice',
      message: '📱 Consider online consultation if symptoms persist',
      action: 'Book a consultation if symptoms worsen or last more than 3-5 days'
    });
  }
  
  // Confidence-based recommendations
  if (analysis.confidence < 30) {
    recommendations.push({
      type: 'advice',
      message: '📝 Provide more specific symptom details',
      action: 'Add information about symptom duration, severity, and associated factors for better analysis'
    });
  } else if (analysis.confidence > 70) {
    recommendations.push({
      type: 'important',
      message: '🎯 High confidence analysis - take action',
      action: 'The analysis shows strong symptom correlation - consider following the medical recommendations above'
    });
  }
  
  // General health recommendations
  recommendations.push({
    type: 'lifestyle',
    message: '💪 Maintain good health practices',
    action: 'Get adequate sleep, stay hydrated, eat nutritious food, exercise regularly, and manage stress'
  });
  
  // Emergency warning for severe symptoms
  if (analysis.conditions.some(c => c.condition.includes('Heart Disease') && c.confidence > 40)) {
    recommendations.unshift({
      type: 'urgent',
      message: '🚨 Possible cardiac symptoms detected',
      action: 'If experiencing chest pain, shortness of breath, or dizziness - seek immediate emergency care'
    });
  }
  
  return recommendations;
};

// Get symptom suggestions (autocomplete)
const getSymptomSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    console.log('🔍 Getting symptom suggestions for query:', query);
    
    if (!query || query.length < 2) {
      return res.json({ 
        success: true,
        suggestions: [] 
      });
    }
    
    const queryLower = query.toLowerCase();
    const suggestions = Object.keys(symptomDatabase)
      .filter(symptom => symptom.includes(queryLower))
      .slice(0, 10);
    
    console.log('✅ Found suggestions:', suggestions);
    
    res.json({ 
      success: true,
      suggestions 
    });
  } catch (error) {
    console.error('❌ Symptom suggestions error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get symptom suggestions' 
    });
  }
};

// Get all available symptoms
const getAllSymptoms = async (req, res) => {
  try {
    const allSymptoms = Object.keys(symptomDatabase).sort();
    
    res.json({
      success: true,
      symptoms: allSymptoms,
      count: allSymptoms.length
    });
  } catch (error) {
    console.error('❌ Get all symptoms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get symptoms list'
    });
  }
};

module.exports = {
  analyzeSymptoms,
  getSymptomSuggestions,
  getAllSymptoms
};
