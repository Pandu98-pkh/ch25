import React, { createContext, useContext, ReactNode } from 'react';

interface MLPrediction {
  trend: 'improving' | 'stable' | 'worsening';
  confidence: number;
  nextPredictedScore: number;
  riskFactors: string[];
  recommendations: string[];
}

interface PHQ9MLContextType {
  predictTrend: (scores: number[], responses?: number[][]) => MLPrediction;
  analyzeResponses: (responses: number[]) => {
    symptomSeverity: Record<string, number>;
    criticalSymptoms: string[];
    recommendations: string[];
  };
  generateInsights: (currentScore: number, previousScores: number[]) => {
    insight: string;
    trend: string;
    confidence: number;
  };
}

const PHQ9MLContext = createContext<PHQ9MLContextType | undefined>(undefined);

export const usePHQ9ML = () => {
  const context = useContext(PHQ9MLContext);
  if (!context) {
    throw new Error('usePHQ9ML must be used within a PHQ9MachineLearningProvider');
  }
  return context;
};

export const PHQ9MachineLearningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const predictTrend = (scores: number[], responses?: number[][]): MLPrediction => {
    if (scores.length < 2) {
      return {
        trend: 'stable',
        confidence: 0.5,
        nextPredictedScore: scores[0] || 0,
        riskFactors: [],
        recommendations: ['Continue monitoring', 'Complete more assessments for better predictions']
      };
    }

    // Simple trend analysis
    const recentScores = scores.slice(-3);
    const trend = recentScores[recentScores.length - 1] - recentScores[0];
    
    let trendDirection: 'improving' | 'stable' | 'worsening';
    let confidence = 0.7;
    
    if (trend < -2) {
      trendDirection = 'improving';
      confidence = Math.min(0.9, 0.7 + Math.abs(trend) * 0.05);
    } else if (trend > 2) {
      trendDirection = 'worsening';
      confidence = Math.min(0.9, 0.7 + Math.abs(trend) * 0.05);
    } else {
      trendDirection = 'stable';
      confidence = 0.6;
    }

    // Predict next score based on trend
    const currentScore = scores[scores.length - 1];
    const trendFactor = trend / 3;
    const nextPredictedScore = Math.max(0, Math.min(27, currentScore + trendFactor));

    // Generate risk factors and recommendations
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    if (currentScore >= 15) {
      riskFactors.push('High depression score');
      recommendations.push('Consider professional mental health consultation');
    }
    if (trendDirection === 'worsening') {
      riskFactors.push('Worsening trend detected');
      recommendations.push('Monitor closely and consider intervention');
    }
    if (currentScore >= 10) {
      recommendations.push('Practice self-care activities');
      recommendations.push('Maintain regular sleep schedule');
    }

    return {
      trend: trendDirection,
      confidence,
      nextPredictedScore,
      riskFactors,
      recommendations
    };
  };

  const analyzeResponses = (responses: number[]) => {
    const symptomCategories = [
      'Interest/Pleasure',
      'Mood',
      'Sleep',
      'Energy',
      'Appetite',
      'Self-Worth',
      'Concentration',
      'Psychomotor',
      'Suicidal Ideation'
    ];

    const symptomSeverity: Record<string, number> = {};
    const criticalSymptoms: string[] = [];
    const recommendations: string[] = [];

    responses.forEach((response, index) => {
      if (index < symptomCategories.length) {
        const category = symptomCategories[index];
        symptomSeverity[category] = response;
        
        if (response >= 2) {
          criticalSymptoms.push(category);
        }
        
        // Specific recommendations based on symptoms
        if (index === 8 && response > 0) { // Suicidal ideation
          recommendations.push('URGENT: Seek immediate professional help');
        } else if (response >= 2) {
          switch (index) {
            case 0:
              recommendations.push('Engage in enjoyable activities');
              break;
            case 1:
              recommendations.push('Practice mood regulation techniques');
              break;
            case 2:
              recommendations.push('Maintain healthy sleep hygiene');
              break;
            case 3:
              recommendations.push('Regular exercise and physical activity');
              break;
            case 6:
              recommendations.push('Practice mindfulness and focus exercises');
              break;
          }
        }
      }
    });

    return {
      symptomSeverity,
      criticalSymptoms,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  };

  const generateInsights = (currentScore: number, previousScores: number[]) => {
    if (previousScores.length === 0) {
      return {
        insight: 'This is your first assessment. Continue monitoring your mental health regularly.',
        trend: 'baseline',
        confidence: 1.0
      };
    }

    const avgPreviousScore = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length;
    const scoreDifference = currentScore - avgPreviousScore;
    
    let insight: string;
    let trend: string;
    let confidence = 0.8;

    if (scoreDifference < -3) {
      insight = 'Significant improvement detected. Your mental health appears to be improving.';
      trend = 'improving';
      confidence = 0.85;
    } else if (scoreDifference > 3) {
      insight = 'Concerning increase in depression symptoms. Consider seeking support.';
      trend = 'worsening';
      confidence = 0.85;
    } else if (Math.abs(scoreDifference) <= 1) {
      insight = 'Your scores remain relatively stable. Continue current coping strategies.';
      trend = 'stable';
      confidence = 0.75;
    } else {
      insight = 'Minor changes detected. Continue monitoring your mental health.';
      trend = scoreDifference > 0 ? 'slightly worsening' : 'slightly improving';
      confidence = 0.7;
    }

    return {
      insight,
      trend,
      confidence
    };
  };

  const value: PHQ9MLContextType = {
    predictTrend,
    analyzeResponses,
    generateInsights
  };

  return (
    <PHQ9MLContext.Provider value={value}>
      {children}
    </PHQ9MLContext.Provider>
  );
};
