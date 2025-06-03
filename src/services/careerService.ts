import api from './api';
import { CareerAssessment, CareerResource, ApiResponse } from '../types';


// Memastikan semua assessment IDs unik
const validateUniqueIds = (items: { id: string }[]) => {
  const ids = new Set<string>();
  const result: any[] = [];
  
  for (const item of items) {
    if (!ids.has(item.id)) {
      ids.add(item.id);
      result.push(item);
    } else {
      // Buat ID baru jika ditemukan duplikat
      const newId = `${item.id}-${Date.now()}`;
      ids.add(newId);
      result.push({...item, id: newId});
    }
  }
  
  return result;
};

// Mock data untuk CareerAssessment
const MOCK_CAREER_ASSESSMENTS: CareerAssessment[] = [
  {
    id: '1',
    studentId: '1',
    date: '2024-03-15',
    type: 'Holland Code',
    interests: ['teknologi', 'sains', 'pendidikan'],
    skills: ['analitis', 'komunikasi'],
    values: ['inovasi', 'pengetahuan'],
    recommendedPaths: ['teknik informatika', 'data science'],
    notes: 'Siswa memiliki bakat kuat di bidang analisis dan pemecahan masalah',
    interestAreas: ['teknologi', 'sains', 'pendidikan']
  },
  {
    id: '2',
    studentId: '2',
    date: '2024-04-01',
    type: 'MBTI',
    interests: ['seni', 'desain', 'media'],
    skills: ['kreativitas', 'visualisasi'],
    values: ['originalitas', 'kreativitas'],
    recommendedPaths: ['desain grafis', 'arsitektur'],
    notes: 'Bakat kreatif yang kuat, perlu eksplorasi lebih lanjut di bidang seni visual',
    interestAreas: ['seni', 'desain', 'media']
  },
  {
    id: '3',
    studentId: '3',
    date: '2024-02-20',
    type: 'Strong Interest Inventory',
    interests: ['kesehatan', 'psikologi', 'pendidikan'],
    skills: ['empati', 'komunikasi', 'kerjasama'],
    values: ['menolong orang lain', 'pelayanan'],
    recommendedPaths: ['keperawatan', 'terapi', 'pengajaran'],
    notes: 'Memiliki kemampuan interpersonal yang kuat, cocok untuk karir dalam layanan kesehatan',
    interestAreas: ['kesehatan', 'psikologi', 'pendidikan']
  }
];

// Mock data untuk CareerResource
const MOCK_CAREER_RESOURCES: CareerResource[] = [
  {
    id: '1',
    title: 'Panduan Karir di Bidang Teknologi',
    description: 'Panduan lengkap mengenai berbagai jalur karir di bidang teknologi informasi',
    url: 'https://example.com/tech-career-guide',
    type: 'article',
    tags: ['teknologi', 'karir', 'komputer'],
    datePublished: '2024-01-15',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-01'
  },
  {
    id: '2',
    title: 'Webinar: Mempersiapkan Diri untuk Karir di Bidang Kesehatan',
    description: 'Diskusi dengan para profesional kesehatan tentang jalur karir dan persiapan yang diperlukan',
    url: 'https://example.com/health-career-webinar',
    type: 'video',
    tags: ['kesehatan', 'karir', 'webinar'],
    datePublished: '2024-02-10',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  },
  {
    id: '3',
    title: 'Asesmen Minat Karir',
    description: 'Alat asesmen untuk membantu mengidentifikasi minat dan kekuatan untuk perencanaan karir',
    url: 'https://example.com/career-assessment-tool',
    type: 'assessment',
    tags: ['asesmen', 'karir', 'minat'],
    datePublished: '2023-11-20',
    createdAt: '2023-11-20',
    updatedAt: '2024-01-05'
  },
  {
    id: '4',
    title: 'Program Magang Musim Panas untuk Siswa SMA',
    description: 'Informasi tentang program magang yang tersedia untuk siswa SMA di berbagai industri',
    url: 'https://example.com/summer-internship-program',
    type: 'program',
    tags: ['magang', 'pengalaman kerja', 'musim panas'],
    datePublished: '2024-03-01',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15'
  }
];

// Pengaturan untuk menggunakan mock data - disabled untuk menggunakan database
let useMockData = false;

// Career Assessment endpoints
export const getCareerAssessments = async (studentId: string, page = 1): Promise<ApiResponse<CareerAssessment>> => {
  try {
    if (useMockData) {
      console.log('Using mock career assessment data');
      const filteredAssessments = MOCK_CAREER_ASSESSMENTS.filter(
        assessment => assessment.studentId === studentId
      );
      
      // Pastikan semua ID unik
      const uniqueAssessments = validateUniqueIds(filteredAssessments) as CareerAssessment[];
      
      return {
        data: uniqueAssessments,
        count: uniqueAssessments.length,
        totalPages: 1,
        currentPage: 1
      };
    }
    
    const response = await api.get(`/career-assessments?student=${studentId}&page=${page}`);
    
    // Pastikan data dari API juga memiliki ID unik
    const uniqueAssessments = validateUniqueIds(response.data.results || []) as CareerAssessment[];
    
    return {
      data: uniqueAssessments,
      count: response.data.count || uniqueAssessments.length,
      totalPages: response.data.total_pages || 1,
      currentPage: response.data.current_page || page
    };  } catch (error) {
    console.error('Error loading career assessments:', error);
    
    // Don't immediately switch to mock data - check if it's a real backend failure
    console.warn('API call failed, but keeping useMockData = false. Backend might be accessible.');
    
    // Only return mock data as last resort, but don't permanently enable mock mode
    const filteredAssessments = MOCK_CAREER_ASSESSMENTS.filter(
      assessment => assessment.studentId === studentId
    );
    
    const uniqueAssessments = validateUniqueIds(filteredAssessments) as CareerAssessment[];
    
    return {
      data: uniqueAssessments,
      count: uniqueAssessments.length,
      totalPages: 1,
      currentPage: 1
    };
  }
};

export const createCareerAssessment = async (assessment: Omit<CareerAssessment, 'id'>) => {
  try {
    if (useMockData) {
      const newAssessment: CareerAssessment = {
        ...assessment,
        id: String(MOCK_CAREER_ASSESSMENTS.length + 1)
      };
      MOCK_CAREER_ASSESSMENTS.push(newAssessment);
      return newAssessment;
    }
      const response = await api.post('/career-assessments', assessment);
    return response.data;  } catch (error) {
    console.error('Error creating career assessment:', error);
    
    // Don't permanently enable mock mode - let user know the operation failed
    throw new Error('Failed to save assessment to database. Please try again.');
  }
};

export const updateCareerAssessment = async (id: string, data: Partial<CareerAssessment>) => {
  const response = await api.put(`/career-assessments/${id}`, data);
  return response.data;
};

export const deleteCareerAssessment = async (id: string) => {
  await api.delete(`/career-assessments/${id}`);
};

// Career Resource endpoints
export const getCareerResources = async (page = 1) => {
  try {
    if (useMockData) {
      console.log('Using mock career resources data');
      return {
        results: MOCK_CAREER_RESOURCES,
        count: MOCK_CAREER_RESOURCES.length,
        total_pages: 1,
        current_page: 1
      };
    }
      const response = await api.get(`/career-resources?page=${page}`);
    return response.data;  } catch (error) {
    console.error('Error loading career resources:', error);
    
    // Don't permanently switch to mock data - keep trying database
    console.warn('Career resources API failed, returning mock data temporarily but keeping database mode enabled');
    
    // Return mock data as fallback without changing the useMockData flag
    return {
      results: MOCK_CAREER_RESOURCES,
      count: MOCK_CAREER_RESOURCES.length,
      total_pages: 1,
      current_page: 1
    };
  }
};

export const searchCareerResources = async (params: {
  tags?: string[];
  type?: 'article' | 'video' | 'assessment' | 'program';
}) => {
  try {
    if (useMockData) {
      // Filter resources berdasarkan tag dan tipe
      let filteredResources = [...MOCK_CAREER_RESOURCES];
      
      if (params.tags?.length) {
        filteredResources = filteredResources.filter(resource => 
          params.tags!.some(tag => resource.tags.includes(tag))
        );
      }
      
      if (params.type) {
        filteredResources = filteredResources.filter(resource => 
          resource.type === params.type
        );
      }
      
      return {
        results: filteredResources,
        count: filteredResources.length
      };
    }
      // The backend supports filtering via query parameters, so we'll use the main endpoint
    let url = '/career-resources?';
    const queryParams = new URLSearchParams();
    
    if (params.tags?.length) {
      // For tags, we'll join them with commas for the backend search
      queryParams.append('tags', params.tags.join(','));
    }
    if (params.type) {
      queryParams.append('type', params.type);
    }
    
    const response = await api.get(`${url}${queryParams}`);
    return response.data;  } catch (error) {
    console.error('Error searching career resources:', error);
    
    // Don't permanently enable mock mode - return fallback data temporarily
    console.warn('Search API failed, returning filtered mock data temporarily');
    
    // Filter mock data as fallback
    let filteredResources = [...MOCK_CAREER_RESOURCES];
    
    if (params.tags?.length) {
      filteredResources = filteredResources.filter(resource => 
        params.tags!.some(tag => resource.tags.includes(tag))
      );
    }
    
    if (params.type) {
      filteredResources = filteredResources.filter(resource => 
        resource.type === params.type
      );
    }
    
    return {
      results: filteredResources,
      count: filteredResources.length
    };
  }
};

export const createCareerResource = async (resource: Omit<CareerResource, 'id'>) => {
  const response = await api.post('/career-resources', resource);
  return response.data;
};

export const updateCareerResource = async (id: string, data: Partial<CareerResource>) => {
  const response = await api.put(`/career-resources/${id}`, data);
  return response.data;
};

export const deleteCareerResource = async (id: string) => {
  await api.delete(`/career-resources/${id}`);
};

// Utility function to toggle mock data mode
export const toggleCareerMockData = (enable?: boolean) => {
  useMockData = enable !== undefined ? enable : !useMockData;
  console.log(`Career service mock data mode: ${useMockData ? 'ENABLED' : 'DISABLED'}`);
  return useMockData;
};

// Utility function to force reload from database
export const forceReloadFromDatabase = () => {
  useMockData = false;
  console.log('🔄 Forced reload from database - mock data disabled');
  return useMockData;
};

// Utility function to check current mock data status
export const getCareerMockDataStatus = () => {
  return {
    useMockData,
    message: useMockData ? 'Using mock data' : 'Using database'
  };
};



// Interface for searching resources
interface ResourceSearchParams {
  tags?: string[];
  type?: string;
  query?: string;
}

// Mock CareerResource data
const mockResources: CareerResource[] = [
  {
    id: '1',
    title: 'Pengenalan Teori RIASEC Holland',
    description: 'Panduan lengkap tentang teori kepribadian karir Holland dan bagaimana menggunakannya.',
    type: 'article',
    url: 'https://example.com/holland-theory',
    tags: ['career planning', 'riasec', 'personality', 'beginner'],
    datePublished: '2023-01-15'
  },
  {
    id: '2',
    title: 'Menulis CV yang Efektif',
    description: 'Langkah-langkah menyusun CV yang menarik perhatian rekruter.',
    type: 'video',
    url: 'https://example.com/cv-writing',
    tags: ['resume', 'job search', 'cv', 'student'],
    datePublished: '2023-03-10'
  },
  {
    id: '3',
    title: 'Persiapan Wawancara Kerja',
    description: 'Persiapan menghadapi wawancara kerja dengan percaya diri.',
    type: 'article',
    url: 'https://example.com/interview-prep',
    tags: ['interview', 'job search', 'communication', 'student'],
    datePublished: '2023-02-22'
  },
  {
    id: '4',
    title: 'Kursus Keterampilan Presentasi',
    description: 'Pelajari dasar-dasar presentasi yang efektif untuk dunia profesional.',
    type: 'course',
    url: 'https://example.com/presentation-skills',
    tags: ['soft skills', 'communication', 'presentation', 'student'],
    datePublished: '2023-04-05'
  },
  {
    id: '5',
    title: 'Sertifikasi Manajemen Proyek',
    description: 'Persiapan untuk mendapatkan sertifikasi manajemen proyek yang diakui industri.',
    type: 'certification',
    url: 'https://example.com/project-management-cert',
    tags: ['project management', 'certification', 'career advancement'],
    datePublished: '2023-01-30'
  }
];

// Get career resources (mock API call)
export const getCareerResourcesMock = async (): Promise<{ results: CareerResource[] }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    results: mockResources
  };
};

// Search career resources (mock API call)
export const searchCareerResourcesMock = async (
  params: ResourceSearchParams
): Promise<{ results: CareerResource[] }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let results = [...mockResources];
  
  // Filter by tags if provided
  if (params.tags && params.tags.length > 0) {
    results = results.filter(resource => 
      params.tags!.some(tag => 
        resource.tags.some(resourceTag => 
          resourceTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }
  
  // Filter by type if provided
  if (params.type) {
    results = results.filter(resource => 
      resource.type.toLowerCase() === params.type!.toLowerCase()
    );
  }
  
  // Filter by query if provided
  if (params.query) {
    const query = params.query.toLowerCase();
    results = results.filter(resource => 
      resource.title.toLowerCase().includes(query) || 
      resource.description.toLowerCase().includes(query)
    );
  }
  
  return {
    results
  };
};

// Types for specific assessment formats used by CareerPage
interface RiasecCareerAssessment {
  id: string;
  date: string;
  type: 'riasec';
  interests: string[];
  recommendedPaths: string[];
  result: any; // RiasecResult
  userId?: string;
  userName?: string;
}

interface MbtiCareerAssessment {
  id: string;
  date: string;
  type: 'mbti';
  interests: string[];
  recommendedPaths: string[];
  result: any; // MbtiResult
  userId?: string;
  userName?: string;
}

type ExtendedCareerAssessment = CareerAssessment | RiasecCareerAssessment | MbtiCareerAssessment;

// Load user's assessments with enhanced fallback to localStorage
export const loadUserAssessments = async (userId: string): Promise<ExtendedCareerAssessment[]> => {
  try {
    if (useMockData) {
      // Load from localStorage as fallback
      const storedAssessments = localStorage.getItem('careerAssessments');
      if (storedAssessments) {
        const parsedAssessments = JSON.parse(storedAssessments);
        return parsedAssessments.filter((assessment: any) => 
          assessment.userId === userId || !assessment.userId
        );
      }
      return [];
    }

    // Load from API
    const response = await getCareerAssessments(userId);
    return response.data;
  } catch (error) {
    console.error('Error loading user assessments:', error);
    
    // Fallback to localStorage
    try {
      const storedAssessments = localStorage.getItem('careerAssessments');
      if (storedAssessments) {
        const parsedAssessments = JSON.parse(storedAssessments);
        return parsedAssessments.filter((assessment: any) => 
          assessment.userId === userId || !assessment.userId
        );
      }
    } catch (localStorageError) {
      console.error('Error loading from localStorage:', localStorageError);
    }
    
    return [];
  }
};

// Save assessment to database with localStorage backup
export const saveAssessment = async (assessment: RiasecCareerAssessment | MbtiCareerAssessment): Promise<void> => {
  try {
    // Map the frontend assessment format to backend format
    const backendAssessment = {
      studentId: assessment.userId || 'anonymous',
      date: assessment.date,
      type: assessment.type,
      interests: assessment.interests,
      skills: [], // Not used in current assessments
      values: [], // Not used in current assessments
      recommendedPaths: assessment.recommendedPaths,
      notes: `${assessment.type.toUpperCase()} Assessment - User: ${assessment.userName || 'Anonymous'}`,
      results: assessment.result // Store the detailed result as object
    };    if (!useMockData) {
      // Save to database
      await createCareerAssessment(backendAssessment);
      console.log('✅ Assessment saved to database successfully');
    } else {
      console.log('ℹ️ Mock mode enabled - assessment not saved to database');
    }
      // Also save to localStorage as backup
    try {
      const storedAssessments = localStorage.getItem('careerAssessments');
      const parsedAssessments = storedAssessments ? JSON.parse(storedAssessments) : [];
      localStorage.setItem('careerAssessments', JSON.stringify([assessment, ...parsedAssessments]));
      console.log('✅ Assessment also saved to localStorage as backup');
    } catch (localStorageError: any) {
      console.warn('⚠️ Could not save to localStorage:', localStorageError);
      // Don't fail the entire operation for localStorage issues
    }
      } catch (error: any) {
    console.error('❌ Error saving assessment to database:', error);
    
    // Try to save to localStorage as fallback
    try {
      const storedAssessments = localStorage.getItem('careerAssessments');
      const parsedAssessments = storedAssessments ? JSON.parse(storedAssessments) : [];
      localStorage.setItem('careerAssessments', JSON.stringify([assessment, ...parsedAssessments]));
      console.log('✅ Assessment saved to localStorage as fallback');
      
      // Don't throw error if localStorage save succeeds
      throw new Error(`Database save failed, but assessment was saved locally: ${error.message || error}`);
    } catch (localStorageError: any) {
      console.error('❌ Both database and localStorage save failed:', localStorageError);
      throw new Error(`Failed to save assessment: ${error.message || error}`);
    }
  }
};

// Load all assessments for counselors/admins
export const loadAllAssessments = async (): Promise<ExtendedCareerAssessment[]> => {
  try {
    if (useMockData) {
      // Load from localStorage as fallback
      const storedAssessments = localStorage.getItem('careerAssessments');
      if (storedAssessments) {
        return JSON.parse(storedAssessments);
      }
      return [];
    }

    // Load all assessments from API (admin endpoint)
    const response = await getCareerAssessments(''); // Empty string for all assessments
    return response.data;
  } catch (error) {
    console.error('Error loading all assessments:', error);
    
    // Fallback to localStorage
    try {
      const storedAssessments = localStorage.getItem('careerAssessments');
      if (storedAssessments) {
        return JSON.parse(storedAssessments);
      }
    } catch (localStorageError) {
      console.error('Error loading from localStorage:', localStorageError);
    }
    
    return [];
  }
};



