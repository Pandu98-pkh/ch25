import { useState, useEffect, useCallback } from 'react';
import { MentalHealthAssessment } from '../types';
import { getMentalHealthAssessments, createMentalHealthAssessment } from '../services/mentalHealthService';

interface UseMentalHealthAssessmentsParams {
  studentId?: string; // If provided, filter by student; if not, get all assessments
  page?: number;
  limit?: number;
}

interface UseMentalHealthAssessmentsReturn {
  assessments: MentalHealthAssessment[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  refetch: () => Promise<void>;
  createAssessment: (assessment: Omit<MentalHealthAssessment, 'id'>) => Promise<MentalHealthAssessment>;
  addAssessment: (assessment: Omit<MentalHealthAssessment, 'id'>) => void;
  deleteAssessment: (id: string) => void;
}

export const useMentalHealthAssessments = (params: UseMentalHealthAssessmentsParams = {}): UseMentalHealthAssessmentsReturn => {
  const [assessments, setAssessments] = useState<MentalHealthAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(params.page || 1);
  const [totalPages, setTotalPages] = useState(1);  // Transform backend assessment to frontend format
  const transformAssessment = (backendAssessment: any): MentalHealthAssessment => {
    const result = {
      id: backendAssessment.id || backendAssessment.assessment_id?.toString(),
      studentId: backendAssessment.student_id?.toString() || backendAssessment.studentId,
      type: backendAssessment.assessment_type || backendAssessment.type,
      score: backendAssessment.score,
      risk: backendAssessment.risk_level || backendAssessment.risk,
      notes: backendAssessment.notes || '',
      date: backendAssessment.date,
      category: backendAssessment.category || 'general',
      assessor: backendAssessment.assessor_id 
        ? { id: backendAssessment.assessor_id.toString(), name: backendAssessment.assessor_name || 'Unknown' }
        : (typeof backendAssessment.assessor === 'object' ? backendAssessment.assessor : 
           typeof backendAssessment.assessor === 'string' ? backendAssessment.assessor : 'system'),
      responses: backendAssessment.responses || {}
    } as MentalHealthAssessment;
    
    // Add mlInsights if recommendations exist
    if (backendAssessment.recommendations) {
      (result as any).mlInsights = {
        probability: 0.75,
        condition: backendAssessment.type,
        severity: backendAssessment.risk === 'high' ? 'severe' : backendAssessment.risk === 'moderate' ? 'moderate' : 'mild',
        confidenceScore: 0.8,
        recommendedActions: Array.isArray(backendAssessment.recommendations) 
          ? backendAssessment.recommendations 
          : typeof backendAssessment.recommendations === 'string' 
            ? backendAssessment.recommendations.split(',')
            : [],
        riskFactors: []
      };
    }
    
    return result;
  };
  // Fetch assessments from backend/service
  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (params.studentId) {
        // Fetch assessments for specific student
        response = await getMentalHealthAssessments({ 
          studentId: params.studentId,
          page: params.page,
          limit: params.limit 
        });
      } else {
        // For admin/counselor view - get all assessments
        response = await getMentalHealthAssessments({
          page: params.page,
          limit: params.limit
        });
      }

      // Transform assessments if they come from the database
      let transformedAssessments: MentalHealthAssessment[];
        if (response.data && response.data.length > 0) {
        // Check if data needs transformation (from database)
        const firstItem = response.data[0];
        if ((firstItem as any).assessment_id || (firstItem as any).student_id || (firstItem as any).assessment_type) {
          // Data is from database, needs transformation
          transformedAssessments = response.data.map(transformAssessment);
        } else {
          // Data is already in correct format (mock data)
          transformedAssessments = response.data as MentalHealthAssessment[];
        }
      } else {
        transformedAssessments = [];
      }

      setAssessments(transformedAssessments);
      setTotalCount(response.count || transformedAssessments.length);
      setCurrentPage(response.currentPage || params.page || 1);
      setTotalPages(response.totalPages || 1);

      console.log(`✅ Loaded ${transformedAssessments.length} mental health assessments from database`);
      
    } catch (err: any) {
      console.error('Error fetching mental health assessments:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load mental health assessments');
      
      // Set empty state on error
      setAssessments([]);
      setTotalCount(0);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [params.studentId, params.page, params.limit]);
  // Create new assessment via API
  const createAssessment = useCallback(async (assessmentData: Omit<MentalHealthAssessment, 'id'>): Promise<MentalHealthAssessment> => {
    try {
      // Transform to backend format
      const backendFormat = {
        studentId: assessmentData.studentId,
        type: assessmentData.type,
        score: assessmentData.score,
        risk: assessmentData.risk,
        notes: assessmentData.notes || '',
        date: assessmentData.date,
        category: assessmentData.category || 'general',
        assessor: assessmentData.assessor,
        mlInsights: (assessmentData as any).mlInsights,
        responses: (assessmentData as any).responses || {}
      };

      const response = await createMentalHealthAssessment(backendFormat);
      
      // Transform the response if needed
      let createdAssessment: MentalHealthAssessment;
      if (response.data.assessment_id || response.data.student_id) {
        createdAssessment = transformAssessment(response.data);
      } else {
        createdAssessment = response.data as MentalHealthAssessment;
      }
      
      // Update local state
      setAssessments(prev => [createdAssessment, ...prev]);
      setTotalCount(prev => prev + 1);
      
      console.log('✅ Created new mental health assessment:', createdAssessment.id);
      return createdAssessment;
      
    } catch (err: any) {
      console.error('Error creating mental health assessment:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to create assessment');
    }
  }, []);

  // Add assessment to local state (for compatibility with existing context)
  const addAssessment = useCallback((assessment: Omit<MentalHealthAssessment, 'id'>) => {
    const highestId = assessments.reduce((max, item) => {
      const id = parseInt(item.id);
      return isNaN(id) ? max : Math.max(max, id);
    }, 0);
    
    const newId = (highestId + 1).toString();
    const newAssessment = { ...assessment, id: newId };
    
    setAssessments(prev => [newAssessment, ...prev]);
    setTotalCount(prev => prev + 1);
  }, [assessments]);

  // Delete assessment from local state
  const deleteAssessment = useCallback((id: string) => {
    setAssessments(prev => prev.filter(assessment => assessment.id !== id));
    setTotalCount(prev => prev - 1);
  }, []);

  // Fetch assessments on mount and when parameters change
  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return {
    assessments,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    refetch: fetchAssessments,
    createAssessment,
    addAssessment,
    deleteAssessment
  };
};

// Hook for single student's assessments (for student role)
export const useStudentMentalHealthAssessments = (studentId: string) => {
  return useMentalHealthAssessments({ studentId });
};

// Hook for all assessments (for counselor/admin role)
export const useAllMentalHealthAssessments = (page = 1, limit = 20) => {
  return useMentalHealthAssessments({ page, limit });
};
