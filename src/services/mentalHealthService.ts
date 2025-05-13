import api from './api';
import { MentalHealthAssessment, BehaviorRecord, ApiResponse, FilterParams } from '../types';

// Objek untuk menyimpan mock data dengan tipe indeks yang jelas
interface MockMentalHealthTrends {
  [key: string]: { dates: string[], scores: number[] }
}

interface MockBehaviorSummary {
  [key: string]: {
    total: number;
    byCategory: { positive: number; negative: number };
    bySeverity: { 
      minor: number; 
      major: number;
      positive: number;
      neutral: number;
    };
  }
}

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

// Mock data untuk MentalHealthAssessment
const MOCK_MENTAL_HEALTH_ASSESSMENTS: MentalHealthAssessment[] = [
  {
    id: '1',
    studentId: '1',
    date: '2024-04-01',
    score: 85,
    notes: 'Siswa menunjukkan perkembangan yang baik, tingkat stres menurun',
    assessor: {
      id: '1',
      name: 'Dr. Smith'
    },
    category: 'routine',
    type: 'DASS-21',
    risk: 'low'
  },
  {
    id: '2',
    studentId: '1',
    date: '2024-03-01',
    score: 75,
    notes: 'Menunjukkan beberapa tanda kecemasan terkait ujian',
    assessor: {
      id: '2',
      name: 'Dr. Johnson'
    },
    category: 'stress',
    type: 'PHQ-9',
    risk: 'moderate'
  },
  {
    id: '3',
    studentId: '2',
    date: '2024-04-05',
    score: 65,
    notes: 'Mengalami kesulitan dalam mengelola stres akademik',
    assessor: {
      id: '1',
      name: 'Dr. Smith'
    },
    category: 'academic',
    type: 'DASS-21',
    risk: 'moderate'
  }
];

// Mock data untuk BehaviorRecord 
const MOCK_BEHAVIOR_RECORDS: BehaviorRecord[] = [
  {
    id: '1',
    studentId: '1',
    date: '2024-04-02',
    type: 'positive',
    description: 'Membantu teman sekelas menyelesaikan tugas kelompok',
    severity: 'positive',
    reporter: {
      id: '3',
      name: 'Ms. Reynolds'
    },
    actionTaken: 'Penghargaan verbal',
    category: 'participation'
  },
  {
    id: '2',
    studentId: '2',
    date: '2024-04-03',
    type: 'negative',
    description: 'Tidak mengumpulkan tugas tepat waktu untuk ketiga kalinya',
    severity: 'minor',
    reporter: {
      id: '4',
      name: 'Mr. Wilson'
    },
    actionTaken: 'Diskusi dengan siswa',
    category: 'discipline'
  },
  {
    id: '3',
    studentId: '1',
    date: '2024-03-25',
    type: 'negative',
    description: 'Terlambat masuk kelas',
    severity: 'minor',
    reporter: {
      id: '3',
      name: 'Ms. Reynolds'
    },
    actionTaken: 'Peringatan verbal',
    category: 'attendance'
  }
];

// Mock data untuk trend mental health
const MOCK_MENTAL_HEALTH_TRENDS: MockMentalHealthTrends = {
  '1': {
    dates: ['2024-01-15', '2024-02-15', '2024-03-15', '2024-04-01'],
    scores: [65, 70, 75, 85]
  },
  '2': {
    dates: ['2024-02-01', '2024-03-01', '2024-04-05'],
    scores: [80, 70, 65]
  },
  '3': {
    dates: ['2024-01-20', '2024-03-20'],
    scores: [75, 78]
  }
};

// Mock data untuk behavior summary
const MOCK_BEHAVIOR_SUMMARY: MockBehaviorSummary = {
  '1': {
    total: 6,
    byCategory: {
      positive: 4,
      negative: 2
    },
    bySeverity: {
      minor: 2,
      major: 0,
      positive: 3,
      neutral: 1
    }
  },
  '2': {
    total: 8,
    byCategory: {
      positive: 2,
      negative: 6
    },
    bySeverity: {
      minor: 3,
      major: 3,
      positive: 1,
      neutral: 1
    }
  },
  '3': {
    total: 3,
    byCategory: {
      positive: 3,
      negative: 0
    },
    bySeverity: {
      minor: 0,
      major: 0,
      positive: 2,
      neutral: 1
    }
  }
};

// Pengaturan untuk menggunakan mock data
let useMockData = true;

// Memastikan semua assessment IDs unik
const validateUniqueAssessmentIds = (assessments: MentalHealthAssessment[]): MentalHealthAssessment[] => {
  const ids = new Set<string>();
  const result: MentalHealthAssessment[] = [];
  
  for (const assessment of assessments) {
    if (!ids.has(assessment.id)) {
      ids.add(assessment.id);
      result.push(assessment);
    } else {
      // Buat ID baru jika ditemukan duplikat
      const newId = `${assessment.id}-${Date.now()}`;
      ids.add(newId);
      result.push({...assessment, id: newId});
    }
  }
  
  return result;
};

// Memastikan semua behavior record IDs unik
const validateUniqueBehaviorIds = (records: BehaviorRecord[]): BehaviorRecord[] => {
  const ids = new Set<string>();
  const result: BehaviorRecord[] = [];
  
  for (const record of records) {
    if (!ids.has(record.id)) {
      ids.add(record.id);
      result.push(record);
    } else {
      // Buat ID baru jika ditemukan duplikat
      const newId = `${record.id}-${Date.now()}`;
      ids.add(newId);
      result.push({...record, id: newId});
    }
  }
  
  return result;
};

// Mental Health Assessment endpoints
export const getMentalHealthAssessments = async (studentId: string): Promise<ApiResponse<MentalHealthAssessment>> => {
  try {
    if (useMockData) {
      console.log('Using mock mental health assessment data');
      const filteredAssessments = MOCK_MENTAL_HEALTH_ASSESSMENTS.filter(
        assessment => assessment.studentId === studentId
      );
      
      // Ensure all IDs are unique
      const uniqueAssessments = validateUniqueAssessmentIds(filteredAssessments);
      
      return {
        data: uniqueAssessments,
        count: uniqueAssessments.length,
        totalPages: 1,
        currentPage: 1
      };
    }
    
    const response = await api.get(`/mental-health/assessments?studentId=${studentId}`);
    
    // Format response to match ApiResponse interface
    return {
      data: response.data || [],
      count: response.data?.length || 0,
      totalPages: response.data?.totalPages || 1,
      currentPage: response.data?.currentPage || 1
    };
  } catch (error) {
    console.error('Error fetching mental health assessments:', error);
    
    // Fallback to mock data on API failure
    useMockData = true;
    
    const filteredAssessments = MOCK_MENTAL_HEALTH_ASSESSMENTS.filter(
      assessment => assessment.studentId === studentId
    );
    
    // Ensure all IDs are unique
    const uniqueAssessments = validateUniqueAssessmentIds(filteredAssessments);
    
    return {
      data: uniqueAssessments,
      count: uniqueAssessments.length,
      totalPages: 1,
      currentPage: 1
    };
  }
};

// Update the function to accept a partial assessment with fewer required fields
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
  }
) => {
  try {
    // Check if using mock data
    if (useMockData) {
      console.log('Using mock create assessment data');
      
      // Create a new mock assessment with a unique ID
      const newId = `${Date.now()}`;
      
      // Convert string assessor to object format if needed
      const assessorObject = typeof assessmentData.assessor === 'string' 
        ? { id: assessmentData.assessor, name: assessmentData.assessor === 'ml-system' ? 'ML System' : 'Counselor' }
        : assessmentData.assessor;
      
      const newAssessment = {
        ...assessmentData,
        assessor: assessorObject,
        id: newId
      };
      
      // Add to mock data array
      MOCK_MENTAL_HEALTH_ASSESSMENTS.push(newAssessment as MentalHealthAssessment);
      
      // Return a simulated successful response
      return {
        data: newAssessment,
        status: 201
      };
    }
    
    // For real API call, we need to ensure assessor is in the right format
    const apiAssessmentData = {
      ...assessmentData,
      assessor: typeof assessmentData.assessor === 'string' 
        ? { id: assessmentData.assessor, name: assessmentData.assessor === 'ml-system' ? 'ML System' : 'Counselor' }
        : assessmentData.assessor
    };
    
    // Real API call if not using mock data
    return await api.post('/mental-health/assessments', apiAssessmentData);
  } catch (error) {
    console.error('Error creating mental health assessment:', error);
    throw error;
  }
};

export const updateMentalHealthAssessment = async (id: string, data: Partial<MentalHealthAssessment>): Promise<MentalHealthAssessment> => {
  try {
    if (useMockData) {
      const index = MOCK_MENTAL_HEALTH_ASSESSMENTS.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Assessment not found');
      
      MOCK_MENTAL_HEALTH_ASSESSMENTS[index] = {
        ...MOCK_MENTAL_HEALTH_ASSESSMENTS[index],
        ...data
      };
      
      return MOCK_MENTAL_HEALTH_ASSESSMENTS[index];
    }
    
    const response = await api.put(`/mental-health/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }
};

export const deleteMentalHealthAssessment = async (id: string): Promise<void> => {
  try {
    if (useMockData) {
      const index = MOCK_MENTAL_HEALTH_ASSESSMENTS.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Assessment not found');
      
      MOCK_MENTAL_HEALTH_ASSESSMENTS.splice(index, 1);
      return;
    }
    
    await api.delete(`/mental-health/${id}/`);
  } catch (error) {
    console.error('Error deleting assessment:', error);
    throw error;
  }
};

export const getMentalHealthTrends = async (studentId: string): Promise<MentalHealthTrendData> => {
  try {
    if (useMockData) {
      // Gunakan data mock jika tersedia untuk studentId tersebut
      return MOCK_MENTAL_HEALTH_TRENDS[studentId] || {
        dates: [],
        scores: []
      };
    }
    
    const response = await api.get(`/mental-health/trends/`, {
      params: { student_id: studentId }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error loading mental health trends:', error);
    useMockData = true;
    
    return MOCK_MENTAL_HEALTH_TRENDS[studentId] || {
      dates: [],
      scores: []
    };
  }
};

export const scheduleFollowUp = async (assessmentId: string, followUpData: { date: string, notes: string }) => {
  try {
    return await api.post(`/mental-health/assessments/${assessmentId}/follow-up`, followUpData);
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    throw error;
  }
};

// Behavior Record endpoints
export const getBehaviorRecords = async (
  studentId: string, 
  filters?: FilterParams,
  page = 1
): Promise<ApiResponse<BehaviorRecord>> => {
  try {
    if (useMockData) {
      console.log('Using mock behavior record data');
      let filteredRecords = MOCK_BEHAVIOR_RECORDS.filter(
        record => record.studentId === studentId
      );

      // Apply additional filters
      if (filters) {
        if (filters.type) {
          filteredRecords = filteredRecords.filter(r => r.type === filters.type);
        }
        
        if (filters.category) {
          filteredRecords = filteredRecords.filter(r => r.category === filters.category);
        }
        
        if (filters.startDate && filters.startDate !== '') {
          filteredRecords = filteredRecords.filter(r => r.date >= filters.startDate!);
        }
        
        if (filters.endDate && filters.endDate !== '') {
          filteredRecords = filteredRecords.filter(r => r.date <= filters.endDate!);
        }
      }

      return {
        data: filteredRecords,
        count: filteredRecords.length,
        totalPages: 1,
        currentPage: 1
      };
    }
    
    const response = await api.get('/behavior/', {
      params: {
        student: studentId,
        page,
        ...filters
      }
    });
    
    // Ensure data from API also has unique IDs
    const uniqueRecords = validateUniqueBehaviorIds(response.data.results || []);
    
    return {
      data: uniqueRecords,
      count: uniqueRecords.length,
      totalPages: response.data.total_pages || 1,
      currentPage: response.data.current_page || page
    };
  } catch (error) {
    console.error('Error loading behavior records:', error);
    useMockData = true;
    
    // Fallback to mock data
    const filteredRecords = MOCK_BEHAVIOR_RECORDS.filter(
      record => record.studentId === studentId
    );
    
    // Ensure all IDs are unique
    const uniqueRecords = validateUniqueBehaviorIds(filteredRecords);
    
    return {
      data: uniqueRecords,
      count: uniqueRecords.length,
      totalPages: 1,
      currentPage: 1
    };
  }
};

export const createBehaviorRecord = async (record: Omit<BehaviorRecord, 'id'>): Promise<BehaviorRecord> => {
  try {
    if (useMockData) {
      const newRecord: BehaviorRecord = {
        ...record,
        id: String(MOCK_BEHAVIOR_RECORDS.length + 1)
      };
      MOCK_BEHAVIOR_RECORDS.push(newRecord);
      return newRecord;
    }
    
    const response = await api.post('/behavior/', record);
    return response.data;
  } catch (error) {
    console.error('Error creating behavior record:', error);
    
    if (!useMockData) {
      useMockData = true;
      const newRecord: BehaviorRecord = {
        ...record,
        id: String(Date.now())
      };
      MOCK_BEHAVIOR_RECORDS.push(newRecord);
      return newRecord;
    }
    
    throw error;
  }
};

export const updateBehaviorRecord = async (id: string, data: Partial<BehaviorRecord>): Promise<BehaviorRecord> => {
  try {
    if (useMockData) {
      const index = MOCK_BEHAVIOR_RECORDS.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Behavior record not found');
      
      MOCK_BEHAVIOR_RECORDS[index] = {
        ...MOCK_BEHAVIOR_RECORDS[index],
        ...data
      };
      
      return MOCK_BEHAVIOR_RECORDS[index];
    }
    
    const response = await api.put(`/behavior/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating behavior record:', error);
    throw error;
  }
};

export const deleteBehaviorRecord = async (id: string): Promise<void> => {
  try {
    if (useMockData) {
      const index = MOCK_BEHAVIOR_RECORDS.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Behavior record not found');
      
      MOCK_BEHAVIOR_RECORDS.splice(index, 1);
      return;
    }
    
    await api.delete(`/behavior/${id}/`);
  } catch (error) {
    console.error('Error deleting behavior record:', error);
    throw error;
  }
};

// Statistics and Analysis
export const getBehaviorSummary = async (studentId: string): Promise<BehaviorSummaryData> => {
  try {
    if (useMockData) {
      return MOCK_BEHAVIOR_SUMMARY[studentId] || {
        total: 0,
        byCategory: {
          positive: 0,
          negative: 0
        },
        bySeverity: {
          minor: 0,
          major: 0,
          positive: 0,
          neutral: 0
        }
      };
    }
    
    const response = await api.get('/behavior/summary/', {
      params: { student: studentId }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error loading behavior summary:', error);
    useMockData = true;
    
    return MOCK_BEHAVIOR_SUMMARY[studentId] || {
      total: 0,
      byCategory: {
        positive: 0,
        negative: 0
      },
      bySeverity: {
        minor: 0,
        major: 0,
        positive: 0,
        neutral: 0
      }
    };
  }
};

// Utility function to toggle mock data mode
export const toggleMentalHealthMockData = (enable?: boolean): boolean => {
  useMockData = enable !== undefined ? enable : !useMockData;
  return useMockData;
};

/**
 * Sends assessment data to the ML service and receives predictions
 * @param mlData - The data to be analyzed by the ML model
 * @returns Promise with the ML prediction response
 */
export const getMLPrediction = async (mlData: any) => {
  try {
    // Check if using mock data
    if (useMockData) {
      console.log('Using mock ML prediction data');
      
      // Generate mock ML prediction based on assessment type and score
      const totalScore = mlData.totalScore || 0;
      const assessmentType = mlData.assessmentType || 'DASS-21';
      
      // Determine mock severity based on score
      let severity: 'mild' | 'moderate' | 'severe';
      let condition: string;
      let probability: number;
      
      if (assessmentType === 'PHQ-9') {
        if (totalScore > 15) {
          severity = 'severe';
          condition = 'Depresi Mayor';
          probability = 0.85;
        } else if (totalScore > 10) {
          severity = 'moderate';
          condition = 'Depresi Sedang';
          probability = 0.7;
        } else {
          severity = 'mild';
          condition = 'Depresi Ringan';
          probability = 0.6;
        }
      } else if (assessmentType === 'GAD-7') {
        if (totalScore > 15) {
          severity = 'severe';
          condition = 'Gangguan Kecemasan Umum';
          probability = 0.82;
        } else if (totalScore > 10) {
          severity = 'moderate';
          condition = 'Kecemasan Sedang';
          probability = 0.68;
        } else {
          severity = 'mild';
          condition = 'Kecemasan Ringan';
          probability = 0.55;
        }
      } else {
        // Default for DASS-21 and others
        if (totalScore > 25) {
          severity = 'severe';
          condition = 'Stres Berat';
          probability = 0.78;
        } else if (totalScore > 15) {
          severity = 'moderate';
          condition = 'Stres Sedang';
          probability = 0.65;
        } else {
          severity = 'mild';
          condition = 'Stres Ringan';
          probability = 0.5;
        }
      }
      
      // Create mock ML prediction response
      const mockPrediction = {
        data: {
          probability,
          condition,
          severity,
          confidenceScore: Math.random() * 0.3 + 0.6, // Random confidence between 0.6 and 0.9
          recommendedActions: [
            'Konsultasi dengan psikolog sekolah',
            'Teknik relaksasi dan pernapasan',
            'Manajemen waktu dan prioritas',
            'Dukungan sosial dari teman dan keluarga'
          ],
          riskFactors: [
            'Tekanan akademik',
            'Kesulitan beradaptasi',
            'Masalah dalam hubungan sosial',
            'Kurang tidur dan istirahat'
          ]
        },
        status: 200
      };
      
      // Simulate network delay
      return new Promise(resolve => {
        setTimeout(() => resolve(mockPrediction), 1500);
      });
    }
    
    // Real API call if not using mock data
    const encryptedData = encryptSensitiveData(mlData);
    return await api.post('/mental-health/ml-analysis', encryptedData);
  } catch (error) {
    console.error('Error getting ML prediction:', error);
    throw error;
  }
};

/**
 * Client-side encryption for sensitive mental health data
 * In a production environment, this would use a proper encryption library
 * @param data - The data to encrypt
 * @returns The encrypted data
 */
const encryptSensitiveData = (data: any) => {
  // In a real implementation, this would use a proper encryption library
  // like CryptoJS to encrypt the data before sending it to the server
  
  // For the sake of this example, we'll just mark the data as needing encryption
  return {
    ...data,
    _encrypted: true,
    _encryptionVersion: '1.0'
  };
};

/**
 * Retrieves historical trend data for visualizing assessment progress over time
 * @param studentId - The ID of the student
 * @returns Promise with the historical data
 */
export const getHistoricalTrends = async (studentId: string) => {
  try {
    return await api.get(`/mental-health/trends`, {
      params: { studentId },
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error fetching historical trends:', error);
    throw error;
  }
};