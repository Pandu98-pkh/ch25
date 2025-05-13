import { createContext, useContext, useState, ReactNode } from 'react';

// Define our interfaces
export interface PHQ9Response {
  questionId: number;
  answer: number;
}

export interface PHQ9Assessment {
  id: string;
  score: number;
  date: string;
  responses?: PHQ9Response[];
}

export interface MLPrediction {
  trend: 'improving' | 'stable' | 'worsening';
  confidence: number;
  nextPredictedScore?: number;
  recommendedInterventions: string[];
}

// The mock ML model logic
class PHQ9PredictionModel {
  private assessmentHistory: PHQ9Assessment[] = [];
  
  public addAssessment(assessment: PHQ9Assessment): void {
    this.assessmentHistory.push(assessment);
    // Sort by date ascending
    this.assessmentHistory.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
  
  public predictTrend(): MLPrediction {
    // Need at least 2 assessments to predict a trend
    if (this.assessmentHistory.length < 2) {
      return {
        trend: 'stable',
        confidence: 0.5,
        recommendedInterventions: [
          "Continue monitoring",
          "Complete regular PHQ-9 assessments"
        ]
      };
    }
    
    // Get the last two assessments
    const lastAssessment = this.assessmentHistory[this.assessmentHistory.length - 1];
    const previousAssessment = this.assessmentHistory[this.assessmentHistory.length - 2];
    
    // Calculate score difference
    const scoreDifference = lastAssessment.score - previousAssessment.score;
    
    // Determine trend direction
    let trend: 'improving' | 'stable' | 'worsening';
    if (scoreDifference <= -3) trend = 'improving';
    else if (scoreDifference >= 3) trend = 'worsening';
    else trend = 'stable';
    
    // Calculate confidence (mock calculation)
    const confidence = Math.min(0.5 + Math.abs(scoreDifference) * 0.05, 0.95);
    
    // Calculate next predicted score
    const nextPredictedScore = Math.max(0, Math.min(27, 
      lastAssessment.score + (trend === 'improving' ? -2 : trend === 'stable' ? 0 : 2)
    ));
    
    // Generate interventions based on severity and trend
    const recommendedInterventions = this.generateRecommendations(
      lastAssessment.score,
      trend
    );
    
    return {
      trend,
      confidence,
      nextPredictedScore,
      recommendedInterventions
    };
  }
  
  private generateRecommendations(score: number, trend: string): string[] {
    const recommendations: string[] = [];
    
    // Based on PHQ-9 severity guidelines
    if (score <= 4) {
      // Minimal depression
      recommendations.push("Continue regular self-monitoring");
      if (trend === 'worsening') {
        recommendations.push("Consider scheduling a check-in with healthcare provider");
      }
    } else if (score <= 9) {
      // Mild depression
      recommendations.push("Consider self-guided mental health resources");
      recommendations.push("Maintain regular physical activity");
      recommendations.push("Practice stress reduction techniques");
      
      if (trend === 'worsening') {
        recommendations.push("Schedule an appointment with healthcare provider");
      }
    } else if (score <= 14) {
      // Moderate depression
      recommendations.push("Schedule follow-up with healthcare provider");
      recommendations.push("Consider psychotherapy options (CBT, interpersonal therapy)");
      recommendations.push("Implement regular sleep schedule and physical activity");
      
      if (trend === 'worsening') {
        recommendations.push("Discuss medication options with healthcare provider");
      }
    } else if (score <= 19) {
      // Moderately severe depression
      recommendations.push("Urgent follow-up with mental health professional");
      recommendations.push("Consider combined therapy and medication approach");
      recommendations.push("Develop a safety plan and identify support network");
      
      if (trend === 'stable' || trend === 'worsening') {
        recommendations.push("Discuss treatment plan adjustment with provider");
      }
    } else {
      // Severe depression
      recommendations.push("Immediate consultation with mental health professional");
      recommendations.push("Comprehensive treatment plan with close monitoring");
      recommendations.push("Safety planning and crisis resources");
      recommendations.push("Consider intensive outpatient or inpatient treatment if symptoms include suicidality");
    }
    
    return recommendations;
  }
  
  public getHistoricalData() {
    return this.assessmentHistory;
  }
  
  public reset() {
    this.assessmentHistory = [];
  }
}

// Create the context
interface PHQ9MLContextType {
  addAssessment: (assessment: PHQ9Assessment) => void;
  getPrediction: () => MLPrediction;
  getHistoricalData: () => PHQ9Assessment[];
  resetModel: () => void;
}

const PHQ9MLContext = createContext<PHQ9MLContextType | undefined>(undefined);

// Provider component
export function PHQ9MachineLearningProvider({ children }: { children: ReactNode }) {
  const [model] = useState<PHQ9PredictionModel>(new PHQ9PredictionModel());
  
  const contextValue: PHQ9MLContextType = {
    addAssessment: (assessment: PHQ9Assessment) => {
      model.addAssessment(assessment);
    },
    getPrediction: () => {
      return model.predictTrend();
    },
    getHistoricalData: () => {
      return model.getHistoricalData();
    },
    resetModel: () => {
      model.reset();
    }
  };
  
  return (
    <PHQ9MLContext.Provider value={contextValue}>
      {children}
    </PHQ9MLContext.Provider>
  );
}

// Hook for using the ML context
export function usePHQ9ML() {
  const context = useContext(PHQ9MLContext);
  if (context === undefined) {
    console.warn('usePHQ9ML: Context not found, using fallback implementation');
    
    // Provide a fallback implementation
    return {
      getPrediction: () => ({
        trend: 'stable' as const,
        confidence: 0.5,
        recommendedInterventions: ["Continue monitoring", "Complete regular assessments"]
      }),
      getHistoricalData: () => [],
      resetModel: () => {}
    };
  }
  return context;
}
