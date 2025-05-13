import api from './api';

export interface ReportParams {
  studentId: string;
  startDate?: string;
  endDate?: string;
  includeAssessments?: boolean;
  includeBehavior?: boolean;
  includeSessions?: boolean;
}

// Tipe data untuk mock report
interface MockReport {
  studentId: string;
  reportDate: string;
  summary: {
    totalSessions: number;
    mentalHealthScore: number;
    behaviorRecords: number;
    status: string;
  };
  sessions: Array<{
    id: string;
    date: string;
    type: string;
    notes: string;
    outcome: string;
  }>;
  assessments: Array<{
    id: string;
    date: string;
    score: number;
    category: string;
    notes: string;
  }>;
  behavior: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    severity: string;
  }>;
}

// Mock data untuk report sebagai fallback
const generateMockReportData = (studentId: string): Blob => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const mockData: MockReport = {
    studentId,
    reportDate: currentDate,
    summary: {
      totalSessions: 5,
      mentalHealthScore: 78,
      behaviorRecords: 8,
      status: "good"
    },
    sessions: [
      {
        id: "1",
        date: "2025-03-15",
        type: "academic",
        notes: "Diskusi tentang kemajuan akademik dan strategi belajar",
        outcome: "positive"
      },
      {
        id: "2",
        date: "2025-02-20",
        type: "behavioral",
        notes: "Membahas interaksi sosial di kelas",
        outcome: "neutral"
      }
    ],
    assessments: [
      {
        id: "1",
        date: "2025-03-20",
        score: 82,
        category: "routine",
        notes: "Perkembangan positif dalam manajemen stres"
      },
      {
        id: "2",
        date: "2025-02-10",
        score: 75,
        category: "academic",
        notes: "Menunjukkan kecemasan terkait ujian"
      }
    ],
    behavior: [
      {
        id: "1",
        date: "2025-03-25",
        type: "positive",
        description: "Membantu teman sekelas dalam proyek kelompok",
        severity: "mild"
      },
      {
        id: "2",
        date: "2025-02-15",
        type: "negative",
        description: "Terlambat mengumpulkan tugas",
        severity: "minor"
      }
    ]
  };
  
  return new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
};

// Pengaturan untuk menggunakan mock data
let useMockData = true;

export const generateReport = async (params: ReportParams): Promise<Blob> => {
  try {
    if (useMockData) {
      console.log('Using mock report data');
      
      // Buat blob dari data mock
      const blob = generateMockReportData(params.studentId);
      
      // Buat link dan trigger download
      triggerDownload(blob, `student_report_${params.studentId}_${new Date().toISOString().slice(0, 10)}.json`);
      
      return blob;
    }
    
    try {
      const response = await api.get(
        `/students/${params.studentId}/report/`, 
        { 
          params,
          responseType: 'blob' 
        }
      );
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/json' });
      
      // Create a link and trigger download
      const filename = `student_report_${params.studentId}_${new Date().toISOString().slice(0, 10)}.json`;
      triggerDownload(blob, filename);
      
      return blob;
    } catch (apiError) {
      console.error('API error generating report:', apiError);
      throw apiError;
    }
  } catch (error: unknown) {
    console.error('Error generating report:', error);
    useMockData = true;
    
    // Fallback ke mock data
    const blob = generateMockReportData(params.studentId);
    
    // Trigger download for mock data
    const filename = `student_report_${params.studentId}_${new Date().toISOString().slice(0, 10)}.json`;
    triggerDownload(blob, filename);
    
    return blob;
  }
};

// Fungsi helper untuk memicu download
const triggerDownload = (blob: Blob, filename: string): void => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error triggering download:', error);
    throw new Error('Gagal mengunduh file');
  }
};

export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await api.get(url, { 
      responseType: 'blob',
      timeout: 30000 // 30 seconds timeout for file downloads
    });
    
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    triggerDownload(blob, filename);
  } catch (error: unknown) {
    console.error('Error downloading file:', error);
    
    // Show user-friendly error
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'status' in error.response && 
        error.response.status === 404) {
      throw new Error('File tidak ditemukan.');
    } else if (error && typeof error === 'object' && 
               (('code' in error && error.code === 'ECONNABORTED') || 
                ('message' in error && typeof error.message === 'string' && error.message.includes('timeout')))) {
      throw new Error('Waktu download habis. Coba lagi nanti.');
    } else if (!navigator.onLine) {
      throw new Error('Anda sedang offline. Periksa koneksi internet Anda.');
    } else {
      throw new Error('Gagal mengunduh file. Silakan coba lagi nanti.');
    }
  }
};

// Utility function to toggle mock data mode
export const toggleReportMockData = (enable?: boolean) => {
  useMockData = enable !== undefined ? enable : !useMockData;
  return useMockData;
};