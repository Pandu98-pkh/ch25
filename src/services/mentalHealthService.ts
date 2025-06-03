import api from './api';
import { MentalHealthAssessment, BehaviorRecord, ApiResponse, FilterParams } from '../types';

// Tipe untuk respons trend data
export interface MentalHealthTrendData {
  dates: string[];
  scores: number[];
}

// Tipe untuk respons behavior summary  
export interface BehaviorSummaryData {
  total: number;
  byCategory: { positive: number; negative: number };
  bySeverity: { 
    minor: number; 
    major: number;
    positive: number;
    neutral: number;
  };
}

// Mental Health Assessment endpoints - DATABASE ONLY
export const getMentalHealthAssessments = async (params: { 
  studentId?: string; 
  page?: number; 
  limit?: number; 
}): Promise<ApiResponse<MentalHealthAssessment>> => {
  try {
    console.log('✅ Fetching mental health assessments from database only - no localStorage or mock data');
    
    const queryParams = new URLSearchParams();
    if (params.studentId) queryParams.append('studentId', params.studentId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/mental-health/assessments?${queryParams.toString()}`);
    
    return {
      data: response.data?.data || response.data || [],
      count: response.data?.count || response.data?.length || 0,
      totalPages: response.data?.totalPages || 1,
      currentPage: response.data?.currentPage || params.page || 1
    };
  } catch (error) {
    console.error('❌ Error fetching mental health assessments from database:', error);
    throw error;
  }
};

export const createMentalHealthAssessment = async (
  assessmentData: {
    studentId: string;
    type: string;
    score: number;
    risk: 'low' | 'moderate' | 'high';
    notes: string;
    date: string;
    category: string;
    assessor: string | { id: string; name: string; };
    mlInsights?: any;
    responses?: Record<string, number>;
    subScores?: { depression: number; anxiety: number; stress: number; };
    severityLevels?: { depression: string; anxiety: string; stress: string; };
  }
): Promise<{ data: any; status: number }> => {
  try {
    console.log('✅ Saving PHQ-9 assessment directly to database - bypassing localStorage and mock data');
    
    // Prepare data for API based on actual database schema
    const apiAssessmentData = {
      student_id: assessmentData.studentId,
      score: assessmentData.score,
      assessment_type: assessmentData.type,
      risk_level: assessmentData.risk,
      notes: assessmentData.notes || '',
      date: assessmentData.date,
      category: assessmentData.category || 'self-assessment',
      // Map assessor to assessor_id (use 'system' as default if not provided)
      assessor_id: typeof assessmentData.assessor === 'object' && assessmentData.assessor.id ? 
        assessmentData.assessor.id : 
        (typeof assessmentData.assessor === 'string' ? assessmentData.assessor : 'system'),
      responses: assessmentData.responses ? JSON.stringify(assessmentData.responses) : null,
      recommendations: assessmentData.mlInsights?.recommendedActions ? 
        JSON.stringify(assessmentData.mlInsights.recommendedActions) : null
    };
    
    console.log('📊 Assessment data prepared for database:', {
      type: apiAssessmentData.assessment_type,
      score: apiAssessmentData.score,
      student_id: apiAssessmentData.student_id,
      hasResponses: !!apiAssessmentData.responses
    });
    
    // Direct API call to save assessment to database
    const response = await api.post('/mental-health/assessments', apiAssessmentData);
    
    console.log('✅ PHQ-9 Assessment saved successfully to database:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error creating mental health assessment in database:', error);
    throw error;
  }
};

// Export a status function to confirm database-only mode
export const getServiceStatus = () => {
  return {
    mode: 'DATABASE_ONLY',
    mockData: false,
    localStorage: false,
    description: 'All mental health data operations use database exclusively - no localStorage or mock data fallback'
  };
};
