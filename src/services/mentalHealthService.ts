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

// localStorage keys
const STORAGE_KEYS = {
  ASSESSMENTS: 'mentalHealthAssessments',
  COUNTER: 'mentalHealthCounter'
};

// Mock data untuk mental health assessments
const MOCK_MENTAL_HEALTH_ASSESSMENTS: MentalHealthAssessment[] = [
  {
    id: '1',
    studentId: 'test-student-1',
    date: '2024-12-01',
    score: 8,
    risk: 'moderate',
    notes: 'Student menunjukkan gejala kecemasan ringan. Perlu follow up.',
    type: 'PHQ-9',
    category: 'routine',
    assessor: { id: 'counselor-1', name: 'Dr. Sarah Johnson' },
    responses: { 1: 2, 2: 1, 3: 2, 4: 3, 5: 1, 6: 2, 7: 1, 8: 2, 9: 1 },
    mlInsights: {
      severity: 'moderate',
      confidenceScore: 0.85,
      recommendedActions: [
        'Lakukan konseling individual',
        'Monitor perkembangan mingguan',
        'Diskusikan strategi coping'
      ],
      riskFactors: ['Stres akademik', 'Perubahan pola tidur']
    }
  },
  {
    id: '2',
    studentId: 'test-student-1',
    date: '2024-11-15',
    score: 12,
    risk: 'moderate',
    notes: 'Follow up assessment. Menunjukkan peningkatan skor.',
    type: 'GAD-7',
    category: 'follow-up',
    assessor: { id: 'counselor-1', name: 'Dr. Sarah Johnson' },
    responses: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 1, 7: 1 },
    mlInsights: {
      severity: 'moderate',
      confidenceScore: 0.78,
      recommendedActions: [
        'Lanjutkan sesi konseling',
        'Teknik relaksasi',
        'Evaluasi ulang dalam 2 minggu'
      ]
    }
  },
  {
    id: '3',
    studentId: 'test-student-2',
    date: '2024-12-03',
    score: 18,
    risk: 'high',
    notes: 'Skor tinggi pada skala depresi. Memerlukan perhatian segera.',
    type: 'PHQ-9',
    category: 'urgent',
    assessor: { id: 'counselor-2', name: 'Dr. Michael Chen' },
    responses: { 1: 3, 2: 2, 3: 3, 4: 2, 5: 2, 6: 3, 7: 2, 8: 1, 9: 0 },
    mlInsights: {
      severity: 'severe',
      confidenceScore: 0.92,
      recommendedActions: [
        'Rujuk ke psikolog klinis',
        'Konseling intensif 2x seminggu',
        'Monitor risiko bunuh diri',
        'Libatkan keluarga'
      ],
      riskFactors: ['Riwayat depresi keluarga', 'Masalah akademik', 'Isolasi sosial']
    }
  },
  {
    id: '4',
    studentId: 'test-student-2',
    date: '2024-11-28',
    score: 35,
    risk: 'high',
    notes: 'Assessment DASS-21 menunjukkan tingkat stress yang tinggi.',
    type: 'DASS-21',
    category: 'comprehensive',
    assessor: { id: 'counselor-2', name: 'Dr. Michael Chen' },
    responses: {},
    mlInsights: {
      severity: 'severe',
      confidenceScore: 0.89,
      recommendedActions: [
        'Program manajemen stress',
        'Terapi kognitif behavioral',
        'Evaluasi beban akademik'
      ]
    }
  },
  {
    id: '5',
    studentId: 'test-student-3',
    date: '2024-12-05',
    score: 4,
    risk: 'low',
    notes: 'Hasil assessment baik. Student dalam kondisi mental yang stabil.',
    type: 'PHQ-9',
    category: 'routine',
    assessor: { id: 'counselor-1', name: 'Dr. Sarah Johnson' },
    responses: { 1: 1, 2: 0, 3: 1, 4: 0, 5: 1, 6: 0, 7: 1, 8: 0, 9: 0 },
    mlInsights: {
      severity: 'mild',
      confidenceScore: 0.95,
      recommendedActions: [
        'Lanjutkan pola hidup sehat',
        'Check-up rutin bulanan'
      ]
    }
  },
  {
    id: '6',
    studentId: 'test-student-3',
    date: '2024-11-20',
    score: 6,
    risk: 'low',
    notes: 'Assessment GAD-7 normal. Tidak ada indikasi kecemasan berlebih.',
    type: 'GAD-7',
    category: 'routine',
    assessor: { id: 'counselor-1', name: 'Dr. Sarah Johnson' },
    responses: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0 },
    mlInsights: {
      severity: 'mild',
      confidenceScore: 0.88,
      recommendedActions: [
        'Pertahankan aktivitas positif',
        'Monitor stress level'
      ]
    }
  }
];

// Helper functions untuk localStorage
const getAssessmentsFromStorage = (): MentalHealthAssessment[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
  }
  return [...MOCK_MENTAL_HEALTH_ASSESSMENTS];
};

const saveAssessmentsToStorage = (assessments: MentalHealthAssessment[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getNextId = (): string => {
  try {
    const counter = localStorage.getItem(STORAGE_KEYS.COUNTER);
    const nextId = counter ? parseInt(counter) + 1 : 7;
    localStorage.setItem(STORAGE_KEYS.COUNTER, nextId.toString());
    return nextId.toString();
  } catch (error) {
    console.error('Error generating ID:', error);
    return Date.now().toString();
  }
};

// Initialize localStorage dengan mock data jika belum ada
const initializeStorage = (): void => {
  const existing = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
  if (!existing) {
    saveAssessmentsToStorage(MOCK_MENTAL_HEALTH_ASSESSMENTS);
    localStorage.setItem(STORAGE_KEYS.COUNTER, '6');
    console.log('✅ Mental Health localStorage initialized with mock data');
  }
};

// Mental Health Assessment endpoints - LOCAL STORAGE ONLY
export const getMentalHealthAssessments = async (params: { 
  studentId?: string; 
  page?: number; 
  limit?: number; 
}): Promise<ApiResponse<MentalHealthAssessment>> => {
  // Initialize storage on first access
  initializeStorage();
  
  console.log('✅ Fetching mental health assessments from localStorage with mock data');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    let assessments = getAssessmentsFromStorage();
    
    // Filter by studentId if provided
    if (params.studentId) {
      assessments = assessments.filter(assessment => assessment.studentId === params.studentId);
      console.log(`📊 Filtered ${assessments.length} assessments for student: ${params.studentId}`);
    }
    
    // Sort by date (newest first)
    assessments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Implement pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAssessments = assessments.slice(startIndex, endIndex);
    
    return {
      data: paginatedAssessments,
      count: assessments.length,
      totalPages: Math.ceil(assessments.length / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('❌ Error fetching mental health assessments from localStorage:', error);
    throw new Error('Failed to load mental health assessments from localStorage');
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
  // Initialize storage on first access
  initializeStorage();
  
  console.log('✅ Saving mental health assessment to localStorage with mock data');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const assessments = getAssessmentsFromStorage();
    
    // Create new assessment
    const newAssessment: MentalHealthAssessment = {
      id: getNextId(),
      studentId: assessmentData.studentId,
      date: assessmentData.date,
      score: assessmentData.score,
      risk: assessmentData.risk,
      notes: assessmentData.notes || '',
      type: assessmentData.type,
      category: assessmentData.category || 'routine',
      assessor: typeof assessmentData.assessor === 'object' 
        ? assessmentData.assessor 
        : { id: 'system', name: assessmentData.assessor || 'System' },
      responses: assessmentData.responses || {},
      mlInsights: assessmentData.mlInsights || {
        severity: assessmentData.risk === 'high' ? 'severe' : assessmentData.risk === 'moderate' ? 'moderate' : 'mild',
        confidenceScore: 0.8,
        recommendedActions: [
          'Monitor perkembangan',
          'Follow up dalam 2 minggu'
        ]
      }
    };
    
    // Add to beginning of array
    const updatedAssessments = [newAssessment, ...assessments];
    saveAssessmentsToStorage(updatedAssessments);
    
    console.log('✅ Mental health assessment saved to localStorage:', newAssessment.id);
    
    return {
      data: newAssessment,
      status: 201
    };
  } catch (error: any) {
    console.error('❌ Error saving mental health assessment to localStorage:', error);
    throw new Error('Failed to save assessment to localStorage');
  }
};

export const deleteMentalHealthAssessment = async (id: string): Promise<void> => {
  console.log('✅ Deleting mental health assessment from localStorage:', id);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    const assessments = getAssessmentsFromStorage();
    const updatedAssessments = assessments.filter(assessment => assessment.id !== id);
    
    if (assessments.length === updatedAssessments.length) {
      throw new Error('Assessment not found');
    }
    
    saveAssessmentsToStorage(updatedAssessments);
    console.log('✅ Mental health assessment deleted from localStorage');
  } catch (error) {
    console.error('❌ Error deleting mental health assessment from localStorage:', error);
    throw error;
  }
};

// Trend data (mock implementation)
export const getMentalHealthTrends = async (studentId: string): Promise<MentalHealthTrendData> => {
  initializeStorage();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const assessments = getAssessmentsFromStorage().filter(a => a.studentId === studentId);
  
  return {
    dates: assessments.map(a => a.date).slice(0, 10),
    scores: assessments.map(a => a.score).slice(0, 10)
  };
};

// Export a status function to confirm localStorage-only mode
export const getServiceStatus = () => {
  return {
    mode: 'LOCAL_STORAGE_ONLY',
    mockData: true,
    localStorage: true,
    database: false,
    description: 'All mental health data operations use localStorage with mock data - no database connectivity',
    mockDataCount: MOCK_MENTAL_HEALTH_ASSESSMENTS.length,
    storageKeys: STORAGE_KEYS
  };
};
