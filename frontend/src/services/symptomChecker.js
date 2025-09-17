// Symptom checker service for health analysis
// Handles symptom processing and condition matching
import { apiEndpoints } from './api';

class SymptomCheckerService {
  constructor() {
    // Local symptom database for offline functionality
    this.localSymptoms = {
      'fever': ['Common Cold', 'Flu', 'COVID-19', 'Infection'],
      'cough': ['Common Cold', 'Flu', 'COVID-19', 'Bronchitis', 'Asthma'],
      'headache': ['Migraine', 'Tension Headache', 'Flu', 'Dehydration'],
      'sore throat': ['Common Cold', 'Strep Throat', 'Flu'],
      'nausea': ['Food Poisoning', 'Migraine', 'Gastroenteritis'],
      'fatigue': ['Flu', 'Anemia', 'Depression', 'Sleep Disorder'],
      'chest pain': ['Heart Disease', 'Anxiety', 'Muscle Strain'],
      'shortness of breath': ['Asthma', 'Heart Disease', 'COVID-19'],
      'dizziness': ['Low Blood Pressure', 'Dehydration', 'Anemia'],
      'stomach pain': ['Gastritis', 'Food Poisoning', 'Appendicitis']
    };
  }

  // Analyze symptoms using API
  async analyzeSymptoms(symptoms) {
    try {
      const response = await apiEndpoints.checkSymptoms(symptoms);
      return response.data;
    } catch (error) {
      console.error('API symptom analysis failed, using local fallback:', error);
      return this.localSymptomAnalysis(symptoms);
    }
  }

  // Local symptom analysis for offline use
  localSymptomAnalysis(symptoms) {
    const conditionScores = new Map();
    const matchedSymptoms = [];

    symptoms.forEach(symptom => {
      const normalizedSymptom = symptom.toLowerCase().trim();
      
      // Find matching symptoms
      Object.keys(this.localSymptoms).forEach(localSymptom => {
        if (normalizedSymptom.includes(localSymptom) || localSymptom.includes(normalizedSymptom)) {
          matchedSymptoms.push(symptom);
          
          this.localSymptoms[localSymptom].forEach(condition => {
            const currentScore = conditionScores.get(condition) || 0;
            conditionScores.set(condition, currentScore + 1);
          });
        }
      });
    });

    // Convert to results format
    const possibleConditions = Array.from(conditionScores.entries())
      .map(([condition, score]) => ({
        condition,
        confidence: Math.min(Math.round((score / symptoms.length) * 100), 95),
        matchingSymptoms: score
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    return {
      success: true,
      data: {
        analyzedSymptoms: [...new Set(matchedSymptoms)],
        possibleConditions,
        confidence: matchedSymptoms.length > 0 ? Math.round((matchedSymptoms.length / symptoms.length) * 100) : 0,
        disclaimer: 'This is a basic analysis. Please consult a healthcare professional for proper diagnosis.',
        totalSymptoms: symptoms.length,
        matchedSymptoms: matchedSymptoms.length,
        recommendations: this.generateRecommendations(possibleConditions)
      }
    };
  }

  // Generate recommendations based on analysis
  generateRecommendations(conditions) {
    const recommendations = [];

    if (conditions.length === 0) {
      recommendations.push({
        type: 'general',
        message: 'No specific conditions identified',
        action: 'Monitor symptoms and consult healthcare provider if they persist'
      });
      return recommendations;
    }

    const highConfidenceConditions = conditions.filter(c => c.confidence > 70);
    
    if (highConfidenceConditions.length > 0) {
      const hasSerious = highConfidenceConditions.some(c => 
        ['Heart Disease', 'COVID-19', 'Appendicitis'].includes(c.condition)
      );
      
      if (hasSerious) {
        recommendations.push({
          type: 'urgent',
          message: 'High confidence in potentially serious condition',
          action: 'Seek immediate medical attention'
        });
      } else {
        recommendations.push({
          type: 'important',
          message: 'Probable condition identified',
          action: 'Schedule consultation with healthcare provider within 24-48 hours'
        });
      }
    } else {
      recommendations.push({
        type: 'general',
        message: 'Monitor symptoms closely',
        action: 'Rest, stay hydrated, and consult healthcare provider if symptoms worsen'
      });
    }

    recommendations.push({
      type: 'lifestyle',
      message: 'General health maintenance',
      action: 'Maintain good hygiene, adequate rest, and healthy nutrition'
    });

    return recommendations;
  }

  // Get symptom suggestions for autocomplete
  getSymptomSuggestions(query) {
    if (!query || query.length < 2) return [];
    
    const queryLower = query.toLowerCase();
    return Object.keys(this.localSymptoms)
      .filter(symptom => symptom.includes(queryLower))
      .slice(0, 10);
  }

  // Validate symptoms input
  validateSymptoms(symptoms) {
    if (!Array.isArray(symptoms)) {
      return { valid: false, error: 'Symptoms must be an array' };
    }
    
    if (symptoms.length === 0) {
      return { valid: false, error: 'At least one symptom is required' };
    }
    
    if (symptoms.length > 10) {
      return { valid: false, error: 'Too many symptoms (maximum 10)' };
    }
    
    const validSymptoms = symptoms.filter(s => 
      typeof s === 'string' && s.trim().length > 0
    );
    
    if (validSymptoms.length === 0) {
      return { valid: false, error: 'No valid symptoms provided' };
    }
    
    return { valid: true, symptoms: validSymptoms };
  }
}

// Export singleton instance
export const symptomCheckerService = new SymptomCheckerService();
export default symptomCheckerService;
