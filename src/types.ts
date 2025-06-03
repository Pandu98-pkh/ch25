// Define semua tipe data yang digunakan dalam aplikasi

export interface Student {
  studentId: string; // Nomor Induk Siswa sebagai primary key
  name: string;
  email: string;
  tingkat: string;
  kelas: string;
  classId?: string; // Foreign key to classes table
  academicStatus: 'good' | 'warning' | 'critical';
  avatar?: string;
  // Properti lama (untuk kompatibilitas)
  id?: string;
  grade?: string;
  class?: string;
  photo?: string;
  program?: string;
  mentalHealthScore?: number;
  lastCounseling?: string;
  // Metadata for hybrid image storage
  avatar_type?: 'base64' | 'file' | 'url';
  avatar_filename?: string;
}

export interface CounselingSession {
  id: string;
  studentId: string;
  date: string;
  duration: number; // Durasi dalam menit
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
  counselor?: {
    id: string;
    name: string;
  };
}

export interface MentalHealthAssessment {
  id: string;
  studentId: string;
  date: string;
  score: number;
  notes: string;
  type: 'DASS-21' | 'PHQ-9' | string;
  risk: 'low' | 'moderate' | 'high';
  category: 'routine' | 'stress' | 'academic' | string;
  assessor: {
    id: string;
    name: string;
  };
  responses?: Record<number, number>;
  mlInsights?: {
    severity?: 'mild' | 'moderate' | 'severe';
    confidenceScore?: number;
    recommendedActions?: string[];
    riskFactors?: string[];
  };
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  student?: {
    id: string;
    name: string;
  };
  date: string;
  type: 'positive' | 'negative' | 'attendance' | 'discipline' | string;
  description: string;
  severity: 'positive' | 'neutral' | 'minor' | 'major';
  reporter: {
    id: string;
    name: string;
  };
  actionTaken?: string;
  category?: string;
  followUpRequired?: boolean;
}

// Career Assessment interface
export interface CareerAssessment {
  id: string;
  studentId?: string;
  date: string;
  type?: string;
  interests: string[];
  skills?: string[];
  values?: string[];
  recommendedPaths: string[];
  notes?: string;
  interestAreas?: string[];
  results?: string; // JSON string of detailed assessment results
}

// MBTI Assessment Types
export interface MbtiAssessment extends CareerAssessment {
  type: 'mbti';
  result: {
    type: string; // e.g., "INTJ", "ENFP"
    scores: {
      EI: number; // 0-100, percentage towards I
      SN: number; // 0-100, percentage towards N
      TF: number; // 0-100, percentage towards F
      JP: number; // 0-100, percentage towards P
    };
    strengths: string[];
    weaknesses: string[];
    careerSuggestions: string[];
  };
}

// Career Resource interface
export interface CareerResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'assessment' | 'program' | 'course' | 'module' | 'path' | 'quiz' | 'certification';
  url: string;
  tags: string[];
  datePublished: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  userId: string; // ID khusus berdasarkan peran yang digunakan sebagai primary key
  name: string;
  email: string;
  role: 'admin' | 'counselor' | 'student' | 'staff';
  username?: string;
  password?: string;
  photo?: string | null;
  avatar?: string;
  avatarType?: 'base64' | 'file' | 'url';
  avatarFilename?: string;
  id?: string; // Field lama (untuk kompatibilitas)
}

// API Response interface
export interface ApiResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
}

// Alias untuk kompatibilitas dengan respons API lama
export interface LegacyApiResponse<T> {
  results: T[];
  count: number;
  total_pages: number;
  current_page: number;
}

// Tipe untuk parameter filter
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
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  searchQuery?: string;
  page?: number;
  limit?: number;
  studentId?: string;
}

// Interface untuk form data
export interface StudentFormData {
  name: string;
  email: string;
  tingkat: string;
  kelas: string;
  classId?: string; // Foreign key to classes table
  academicStatus: 'good' | 'warning' | 'critical';
  avatar?: string;
  studentId: string; // Nomor Induk Siswa
  // Metadata for hybrid image storage
  avatar_type?: 'base64' | 'file' | 'url';
  avatar_filename?: string;
}

export interface Class {
  classId: string; // Primary key for classes table
  name: string;
  gradeLevel: string;
  studentCount: number;
  academicYear: string;
  teacherName?: string;
  // Legacy fields for backward compatibility
  id?: string; // Old id field
  schoolId?: string; // Old schoolId field
}