import React, { createContext, useContext, ReactNode } from 'react';
import { MentalHealthAssessment } from '../types';
import { useMentalHealthAssessments } from '../hooks/useMentalHealthAssessments';
import { useUser } from './UserContext';
import { createMentalHealthAssessment } from '../services/mentalHealthService';

// Legacy Assessment interface for compatibility - maps to MentalHealthAssessment
export interface Assessment {
  id: string;
  type: string;
  score: number;
  date: string;
  risk: 'low' | 'moderate' | 'high';
  notes?: string;
  responses: Array<{
    questionId: number;
    answer: number;
    category?: string;
    question?: string;
  }>;
  mlPrediction?: {
    trend: 'improving' | 'stable' | 'worsening';
    confidence: number;
    nextPredictedScore: number;
  };
  recommendations?: string[];
  assessor?: string | { id: string; name: string; };
  // Add DASS-21 specific properties
  subScores?: {
    depression: number;
    anxiety: number;
    stress: number;
  };
  severityLevels?: {
    depression: string;
    anxiety: string;
    stress: string;
  };
  severityColors?: {
    depression: string;
    anxiety: string;
    stress: string;
  };
}

interface AssessmentContextType {
  assessments: Assessment[];
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  deleteAssessment: (id: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const useAssessments = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessments must be used within an AssessmentProvider');
  }
  return context;
};

// Transform MentalHealthAssessment to legacy Assessment format for compatibility
const transformMentalHealthToAssessment = (mhAssessment: MentalHealthAssessment): Assessment => {
  // Parse responses if they exist and convert to legacy format
  const responses: Assessment['responses'] = [];
  if ((mhAssessment as any).responses) {
    Object.entries((mhAssessment as any).responses).forEach(([questionId, answer]) => {
      responses.push({
        questionId: parseInt(questionId),
        answer: typeof answer === 'number' ? answer : parseInt(answer as string) || 0
      });
    });
  }

  const mlInsights = (mhAssessment as any).mlInsights;
  
  return {
    id: mhAssessment.id,
    type: mhAssessment.type,
    score: mhAssessment.score,
    date: mhAssessment.date,
    risk: mhAssessment.risk,
    notes: mhAssessment.notes,
    responses,
    mlPrediction: mlInsights ? {
      trend: mlInsights.severity === 'severe' ? 'worsening' : 
             mlInsights.severity === 'mild' ? 'improving' : 'stable',
      confidence: mlInsights.confidenceScore || 0.8,
      nextPredictedScore: mhAssessment.score + (mlInsights.severity === 'severe' ? 5 : 
                                                mlInsights.severity === 'mild' ? -3 : 0)
    } : undefined,
    recommendations: mlInsights?.recommendedActions || [],
    assessor: mhAssessment.assessor
  };
};

export const AssessmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {const { user, isAdmin, isCounselor } = useUser();
    // Determine studentId based on user role
  // Students see only their own data, admins and counselors see all data
  const studentIdFilter = (isAdmin || isCounselor) ? undefined : user?.userId || 'anonymous';
    // Use the new database hook
  const {
    assessments: dbAssessments,
    loading: dbLoading,
    deleteAssessment: dbDeleteAssessment,
    refetch
  } = useMentalHealthAssessments({ 
    studentId: studentIdFilter 
  });

  // Transform database assessments to legacy format for compatibility
  const assessments = dbAssessments.map(transformMentalHealthToAssessment);
  const addAssessment = async (assessment: Omit<Assessment, 'id'>) => {
    try {
      console.log('Adding assessment to database:', assessment);
        // CRITICAL FIX: Use logged-in user ID directly as studentId
      let resolvedStudentId = user?.userId || 'anonymous';
      
      console.log(`🔍 Starting assessment creation for user: ${user?.userId || 'no user'}`);
      
      if (user?.userId) {
        // For students, use their userId directly as studentId
        // The service will handle creating a student record if needed
        resolvedStudentId = user.userId;
        console.log(`✅ Using logged-in user ID as studentId: ${resolvedStudentId}`);
      } else {
        console.warn(`⚠️ No logged-in user found, using anonymous`);
        resolvedStudentId = 'anonymous';
      }
        // Prepare the assessment data for API
      const assessmentData = {
        studentId: resolvedStudentId,
        type: assessment.type,
        score: assessment.score,
        risk: assessment.risk,
        notes: assessment.notes || '',
        date: assessment.date,
        category: 'self-assessment',
        assessor: 'self-assessment',
        responses: assessment.responses ? 
          assessment.responses.reduce((acc, resp) => {
            acc[resp.questionId.toString()] = resp.answer;
            return acc;
          }, {} as Record<string, number>) : {},
        mlInsights: assessment.mlPrediction ? {
          probability: assessment.mlPrediction.confidence,
          condition: assessment.type,
          severity: assessment.mlPrediction.trend === 'worsening' ? 'severe' : 
                   assessment.mlPrediction.trend === 'improving' ? 'mild' : 'moderate',
          confidenceScore: assessment.mlPrediction.confidence,
          recommendedActions: assessment.recommendations || [],
          riskFactors: []
        } : undefined,
        // Add DASS-21 specific data if present
        subScores: assessment.subScores,
        severityLevels: assessment.severityLevels
      };
      
      // Save to database via API
      const result = await createMentalHealthAssessment(assessmentData);
      
      console.log('Assessment saved successfully:', result);
      
      // Refresh the assessments list to include the new one
      await refetch();
        } catch (error) {
      console.error('❌ Error saving assessment to database:', error);
      // Database-only mode - no localStorage fallback
      // User should be notified of the error and encouraged to retry
      throw error;
    }
  };

  const deleteAssessment = (id: string) => {
    dbDeleteAssessment(id);
  };

  const setLoading = () => {
    // This is now handled by the database hook
    // Keeping for compatibility but it's a no-op
  };

  return (
    <AssessmentContext.Provider value={{ 
      assessments, 
      addAssessment, 
      deleteAssessment, 
      loading: dbLoading, 
      setLoading 
    }}>
      {children}
    </AssessmentContext.Provider>
  );
};
