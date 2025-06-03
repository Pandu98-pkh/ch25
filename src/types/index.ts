// Model types
export interface Student {
  id: string;
  studentId?: string; // For compatibility with studentService  
  name: string;
  grade: string;
  class: string;
  photo: string;
  email: string;
  tingkat: string;
  kelas: string;
  avatar?: string;
  academicStatus: 'good' | 'warning' | 'critical';
  mentalHealthScore?: number;
  lastCounseling?: string;
  program?: string;
}

export interface CounselingSession {
  id: string;
  studentId: string;
  date: string;
  duration: number;
  notes: string;
  type: 'academic' | 'behavioral' | 'mental-health' | 'career' | 'social';
  outcome: 'positive' | 'neutral' | 'negative';
  nextSteps?: string;
  followUp?: string;
  // Approval workflow fields
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  counselor: {
    id: string;
    name: string;
  };
}

export interface MentalHealthAssessment {
  id: string;
  studentId: string;
  type: string; // 'PHQ-9', 'GAD-7', 'PSS', 'PCL-5', 'WSAS', 'DASS-21'
  score: number;
  risk: 'low' | 'moderate' | 'high';
  notes?: string;
  date: string;
  category: string;
  assessor: string | { id: string; name: string; };
  mlInsights?: MLInsights;
  responses?: Record<number, number>;
  followUp?: {
    date: string;
    notes?: string;
    completed: boolean;
  };
}

export interface MLInsights {
  probability: number;
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidenceScore: number;
  recommendedActions: string[];
  riskFactors: string[];
  featureImportance?: Record<string, number>;
}

export interface HistoricalTrend {
  date: string;
  score: number;
  risk: 'low' | 'moderate' | 'high';
  type: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  date: string;
  category?: 'attendance' | 'discipline' | 'participation' | 'social';
  type: 'positive' | 'negative';
  description: string;
  severity: 'positive' | 'neutral' | 'minor' | 'major';
  actionTaken?: string;
  reporter: {
    id: string;
    name: string;
  };
}

export interface CareerAssessment {
  id: string;
  studentId: string;
  date: string;
  type: string;
  interests: string[];
  skills: string[];
  values: string[];
  recommendedPaths: string[];
  notes?: string;
  interestAreas?: string[];
  strengthAreas?: string[];
  results?: string; // JSON string of detailed assessment results
  assessor?: {
    id: string;
    name: string;
  };
}

export interface CareerResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'assessment' | 'program';
  description: string;
  url: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// Alias for legacy API responses
export interface LegacyApiResponse<T> {
  results: T[];
  count: number;
  total_pages: number;
  current_page: number;
}

// Authentication types
export interface User {
  id: string;
  userId?: string;
  username: string;
  email: string;
  name: string;
  role: 'counselor' | 'admin' | 'teacher' | 'student' | 'staff';
  password?: string;
  photo?: string;
  avatar?: string;
  avatarType?: 'base64' | 'file' | 'url';
  avatarFilename?: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Chart Data types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

// Filter params type
export interface FilterParams {
  grade?: string;
  class?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  category?: string;
  tingkat?: string;
  kelas?: string;
  academicStatus?: string;
  searchQuery?: string;
  studentId?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}

// Interface for student form data
export interface StudentFormData {
  name: string;
  email: string;
  tingkat: string;
  kelas: string;
  academicStatus: 'good' | 'warning' | 'critical';
  avatar?: string;
  grade?: string;
  class?: string;
  photo?: string;
}