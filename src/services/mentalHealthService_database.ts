import api from './api';
import { MentalHealthAssessment, ApiResponse} from '../types';

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

// Mental Health Assessment endpoints - DATABASE ONLY via app.py
export const getMentalHealthAssessments = async (params: { 
  studentId?: string; 
  page?: number; 
  limit?: number; 
}): Promise<ApiResponse<MentalHealthAssessment>> => {
  try {
    console.log('✅ Fetching mental health assessments from database via app.py - no localStorage');
    
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
    console.log('✅ Saving mental health assessment to database via app.py - bypassing localStorage');
    
    // Prepare data for API based on actual database schema
    const apiAssessmentData = {
      student_id: assessmentData.studentId,
      score: assessmentData.score,
      assessment_type: assessmentData.type,
      risk_level: assessmentData.risk,
      notes: assessmentData.notes || '',
      date: assessmentData.date,
      category: assessmentData.category || 'self-assessment',
      // Map assessor to assessor_id
      assessor_id: typeof assessmentData.assessor === 'object' && assessmentData.assessor.id ? 
        assessmentData.assessor.id : 
        (typeof assessmentData.assessor === 'string' ? assessmentData.assessor : 'system'),
      responses: assessmentData.responses ? JSON.stringify(assessmentData.responses) : null,
      recommendations: assessmentData.mlInsights?.recommendedActions ? 
        JSON.stringify(assessmentData.mlInsights.recommendedActions) : null
    };
    
    console.log('📊 Assessment data prepared for database via app.py:', {
      type: apiAssessmentData.assessment_type,
      score: apiAssessmentData.score,
      student_id: apiAssessmentData.student_id,
      hasResponses: !!apiAssessmentData.responses
    });
    
    // Direct API call to save assessment to database via app.py
    const response = await api.post('/mental-health/assessments', apiAssessmentData);
    
    console.log('✅ Mental Health Assessment saved successfully to database via app.py:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error creating mental health assessment in database via app.py:', error);
    throw error;
  }
};

export const deleteMentalHealthAssessment = async (id: string): Promise<void> => {
  try {
    console.log('✅ Deleting mental health assessment from database via app.py:', id);
    
    const response = await api.delete(`/mental-health/assessments/${id}`);
    
    console.log('✅ Mental health assessment deleted successfully from database via app.py');
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting mental health assessment from database via app.py:', error);
    throw error;
  }
};

export const updateMentalHealthAssessment = async (
  id: string,
  updateData: Partial<{
    score: number;
    notes: string;
    risk_level: 'low' | 'moderate' | 'high';
    assessment_type: string;
    category: string;
    responses: Record<string, number>;
    recommendations: string[];
  }>
): Promise<any> => {
  try {
    console.log('✅ Updating mental health assessment in database via app.py:', id);
    
    // Transform frontend format to backend format if needed
    const apiUpdateData: any = {};
    
    if (updateData.score !== undefined) apiUpdateData.score = updateData.score;
    if (updateData.notes !== undefined) apiUpdateData.notes = updateData.notes;
    if (updateData.risk_level !== undefined) apiUpdateData.risk_level = updateData.risk_level;
    if (updateData.assessment_type !== undefined) apiUpdateData.assessment_type = updateData.assessment_type;
    if (updateData.category !== undefined) apiUpdateData.category = updateData.category;
    if (updateData.responses !== undefined) apiUpdateData.responses = JSON.stringify(updateData.responses);
    if (updateData.recommendations !== undefined) apiUpdateData.recommendations = JSON.stringify(updateData.recommendations);
    
    const response = await api.put(`/mental-health/assessments/${id}`, apiUpdateData);
    
    console.log('✅ Mental health assessment updated successfully in database via app.py');
    return response.data;
  } catch (error) {
    console.error('❌ Error updating mental health assessment in database via app.py:', error);
    throw error;
  }
};

// Trend data via database
export const getMentalHealthTrends = async (studentId: string): Promise<MentalHealthTrendData> => {
  try {
    console.log('✅ Fetching mental health trends from database via app.py:', studentId);
    
    const response = await api.get(`/mental-health/trends?student_id=${studentId}`);
    
    return {
      dates: response.data?.dates || [],
      scores: response.data?.scores || []
    };
  } catch (error) {
    console.error('❌ Error fetching mental health trends from database via app.py:', error);
    // Return empty data instead of throwing
    return {
      dates: [],
      scores: []
    };
  }
};

// Export a status function to confirm database-only mode
export const getServiceStatus = () => {
  return {
    mode: 'DATABASE_VIA_APP_PY',
    mockData: false,
    localStorage: false,
    database: true,
    description: 'All mental health data operations use database exclusively via app.py backend - no localStorage or mock data'
  };
};
