// hooks/useCareerAssessments.ts
import { useState, useEffect, useCallback } from 'react';
import { CareerAssessment } from '../types';
import { RiasecResult } from '../components/RiasecAssessment';
import { MbtiResult } from '../components/MbtiAssessment';
import api from '../services/api';

// Extended assessment types with detailed results
export interface RiasecCareerAssessment extends CareerAssessment {
  type: 'riasec';
  result: RiasecResult;
  userId?: string;
  userName?: string;
}

export interface MbtiCareerAssessment extends CareerAssessment {
  type: 'mbti';
  result: MbtiResult;
  userId?: string;
  userName?: string;
}

export type ExtendedCareerAssessment = CareerAssessment | RiasecCareerAssessment | MbtiCareerAssessment;

interface UseCareerAssessmentsParams {
  studentId?: string; // If provided, filter by student; if not, get all assessments
  page?: number;
  limit?: number;
}

interface UseCareerAssessmentsReturn {
  assessments: ExtendedCareerAssessment[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  refetch: () => Promise<void>;
  createAssessment: (assessment: Omit<ExtendedCareerAssessment, 'id'>) => Promise<ExtendedCareerAssessment>;
}

export const useCareerAssessments = (params: UseCareerAssessmentsParams = {}): UseCareerAssessmentsReturn => {
  const [assessments, setAssessments] = useState<ExtendedCareerAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(params.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  // Transform backend assessment to frontend format
  const transformAssessment = (backendAssessment: any): ExtendedCareerAssessment => {
    const baseAssessment: CareerAssessment = {
      id: backendAssessment.id,
      studentId: backendAssessment.studentId,
      date: backendAssessment.date,
      type: backendAssessment.type,
      interests: Array.isArray(backendAssessment.interests) 
        ? backendAssessment.interests 
        : backendAssessment.interests?.split(',').filter(Boolean) || [],
      skills: Array.isArray(backendAssessment.skills) 
        ? backendAssessment.skills 
        : backendAssessment.skills?.split(',').filter(Boolean) || [],
      values: Array.isArray(backendAssessment.values) 
        ? backendAssessment.values 
        : backendAssessment.values?.split(',').filter(Boolean) || [],
      recommendedPaths: Array.isArray(backendAssessment.recommendedPaths) 
        ? backendAssessment.recommendedPaths 
        : backendAssessment.recommendedPaths?.split(',').filter(Boolean) || [],
      notes: backendAssessment.notes || '',
      interestAreas: Array.isArray(backendAssessment.interests) 
        ? backendAssessment.interests 
        : backendAssessment.interests?.split(',').filter(Boolean) || []
    };

    // Add extended properties if present
    if (backendAssessment.results && typeof backendAssessment.results === 'object') {
      if (backendAssessment.type === 'riasec') {        // Create a complete RiasecResult object from backend data
        const riasecScores = backendAssessment.results;
        
        // Calculate top categories (sort by score, take top 3)
        const sortedCategories = Object.entries(riasecScores)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([category]) => category);

        // Generate basic career recommendations based on top categories
        const generateBasicCareerRecommendations = (topCategories: string[], scores: any) => {
          const careerDatabase: Record<string, any> = {
            'realistic': [
              { title: 'Engineer', match: scores.realistic, description: 'Design and build systems', categories: ['realistic'], educationRequired: 'Bachelor\'s Degree', salary: { min: 8000000, max: 15000000, currency: 'IDR' }, outlookGrowth: 8 },
              { title: 'Mechanic', match: scores.realistic, description: 'Repair and maintain machinery', categories: ['realistic'], educationRequired: 'Vocational Training', salary: { min: 5000000, max: 10000000, currency: 'IDR' }, outlookGrowth: 5 }
            ],
            'investigative': [
              { title: 'Scientist', match: scores.investigative, description: 'Conduct research and experiments', categories: ['investigative'], educationRequired: 'Master\'s Degree', salary: { min: 10000000, max: 20000000, currency: 'IDR' }, outlookGrowth: 10 },
              { title: 'Data Analyst', match: scores.investigative, description: 'Analyze data and trends', categories: ['investigative'], educationRequired: 'Bachelor\'s Degree', salary: { min: 7000000, max: 15000000, currency: 'IDR' }, outlookGrowth: 15 }
            ],
            'artistic': [
              { title: 'Graphic Designer', match: scores.artistic, description: 'Create visual designs', categories: ['artistic'], educationRequired: 'Bachelor\'s Degree', salary: { min: 6000000, max: 12000000, currency: 'IDR' }, outlookGrowth: 6 },
              { title: 'Writer', match: scores.artistic, description: 'Create written content', categories: ['artistic'], educationRequired: 'Bachelor\'s Degree', salary: { min: 5000000, max: 15000000, currency: 'IDR' }, outlookGrowth: 4 }
            ],
            'social': [
              { title: 'Teacher', match: scores.social, description: 'Educate and guide students', categories: ['social'], educationRequired: 'Bachelor\'s Degree', salary: { min: 4000000, max: 8000000, currency: 'IDR' }, outlookGrowth: 7 },
              { title: 'Counselor', match: scores.social, description: 'Provide guidance and support', categories: ['social'], educationRequired: 'Master\'s Degree', salary: { min: 6000000, max: 12000000, currency: 'IDR' }, outlookGrowth: 9 }
            ],
            'enterprising': [
              { title: 'Business Manager', match: scores.enterprising, description: 'Lead and manage business operations', categories: ['enterprising'], educationRequired: 'Bachelor\'s Degree', salary: { min: 8000000, max: 20000000, currency: 'IDR' }, outlookGrowth: 12 },
              { title: 'Sales Representative', match: scores.enterprising, description: 'Sell products and services', categories: ['enterprising'], educationRequired: 'High School', salary: { min: 5000000, max: 15000000, currency: 'IDR' }, outlookGrowth: 8 }
            ],
            'conventional': [
              { title: 'Accountant', match: scores.conventional, description: 'Manage financial records', categories: ['conventional'], educationRequired: 'Bachelor\'s Degree', salary: { min: 6000000, max: 12000000, currency: 'IDR' }, outlookGrowth: 6 },
              { title: 'Administrative Assistant', match: scores.conventional, description: 'Provide administrative support', categories: ['conventional'], educationRequired: 'High School', salary: { min: 4000000, max: 8000000, currency: 'IDR' }, outlookGrowth: 3 }
            ]
          };

          let recommendations: any[] = [];
          topCategories.forEach(category => {
            if (careerDatabase[category]) {
              recommendations.push(...careerDatabase[category]);
            }
          });

          // Sort by match score and return top 5
          return recommendations
            .sort((a, b) => b.match - a.match)
            .slice(0, 5);
        };

        const careerRecommendations = generateBasicCareerRecommendations(sortedCategories, riasecScores);

        // Create complete RiasecResult object
        const riasecResult: RiasecResult = {
          realistic: riasecScores.realistic || 0,
          investigative: riasecScores.investigative || 0,
          artistic: riasecScores.artistic || 0,
          social: riasecScores.social || 0,
          enterprising: riasecScores.enterprising || 0,
          conventional: riasecScores.conventional || 0,
          timestamp: backendAssessment.date || backendAssessment.createdAt || new Date().toISOString(),
          topCategories: sortedCategories as any[],
          recommendedCareers: careerRecommendations
        };

        return {
          ...baseAssessment,
          type: 'riasec',
          result: riasecResult,
          userId: backendAssessment.studentId,
          userName: backendAssessment.studentName
        } as RiasecCareerAssessment;
      } else if (backendAssessment.type === 'mbti') {
        return {
          ...baseAssessment,
          type: 'mbti',
          result: backendAssessment.results as MbtiResult,
          userId: backendAssessment.studentId,
          userName: backendAssessment.studentName
        } as MbtiCareerAssessment;
      }
    }

    return baseAssessment;
  };

  // Fetch assessments from backend
  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.studentId) {
        queryParams.append('student', params.studentId);
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      // Make API call
      const response = await api.get(`/career-assessments?${queryParams.toString()}`);
      
      // Handle response data (backend returns 'data' field, not 'results')
      const responseData = response.data;
      const assessmentsData = responseData.data || responseData.results || [];      // Transform assessments
      const transformedAssessments = assessmentsData.map(transformAssessment);
      
      setAssessments(transformedAssessments);
      setTotalCount(responseData.totalCount || responseData.count || transformedAssessments.length);
      setCurrentPage(responseData.currentPage || params.page || 1);
      setTotalPages(responseData.totalPages || 1);

      console.log(`✅ Loaded ${transformedAssessments.length} career assessments from database`);
      
    } catch (err: any) {
      console.error('Error fetching career assessments:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load career assessments');
      
      // Set empty state on error
      setAssessments([]);
      setTotalCount(0);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [params.studentId, params.page, params.limit]);

  // Create new assessment
  const createAssessment = useCallback(async (assessmentData: Omit<ExtendedCareerAssessment, 'id'>): Promise<ExtendedCareerAssessment> => {
    try {
      // Transform to backend format
      const backendFormat = {
        studentId: assessmentData.studentId,
        type: assessmentData.type,
        interests: assessmentData.interests,
        skills: assessmentData.skills || [],
        values: assessmentData.values || [],
        recommendedPaths: assessmentData.recommendedPaths,
        notes: assessmentData.notes || '',
        results: 'result' in assessmentData ? assessmentData.result : {}
      };

      const response = await api.post('/career-assessments', backendFormat);
      const createdAssessment = transformAssessment(response.data);
      
      // Update local state
      setAssessments(prev => [createdAssessment, ...prev]);
      setTotalCount(prev => prev + 1);
      
      console.log('✅ Created new career assessment:', createdAssessment.id);
      return createdAssessment;
      
    } catch (err: any) {
      console.error('Error creating career assessment:', err);
      throw new Error(err.response?.data?.error || err.message || 'Failed to create assessment');
    }
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
    createAssessment
  };
};

// Hook for single student's assessments (for student role)
export const useStudentAssessments = (studentId: string) => {
  return useCareerAssessments({ studentId });
};

// Hook for all assessments (for counselor/admin role)
export const useAllAssessments = (page = 1, limit = 20) => {
  return useCareerAssessments({ page, limit });
};
