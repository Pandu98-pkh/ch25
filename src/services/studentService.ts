import api, { createAbortController } from './api';
import { Student, ApiResponse, FilterParams } from '../types';

// Mock data untuk Students
const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    tingkat: 'XI',
    kelas: 'IPA-1',
    academicStatus: 'good',
    avatar: '/assets/avatars/avatar-1.png',
    grade: 'XI',
    class: 'IPA-1',
    photo: '/assets/avatars/avatar-1.png'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    tingkat: 'XII',
    kelas: 'IPS-2',
    academicStatus: 'warning',
    avatar: '/assets/avatars/avatar-2.png',
    grade: 'XII',
    class: 'IPS-2',
    photo: '/assets/avatars/avatar-2.png'
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    tingkat: 'X',
    kelas: 'IPA-3',
    academicStatus: 'critical',
    avatar: '/assets/avatars/avatar-3.png',
    grade: 'X',
    class: 'IPA-3',
    photo: '/assets/avatars/avatar-3.png'
  }
];

// Pengaturan untuk menggunakan mock data
// Selalu menggunakan mock data secara default untuk mencegah error ketika backend tidak berjalan
let useMockData = true;

// Memastikan semua student IDs unik
const validateUniqueIds = (students: Student[]): Student[] => {
  const ids = new Set<string>();
  const result: Student[] = [];
  
  for (const student of students) {
    if (!ids.has(student.id)) {
      ids.add(student.id);
      result.push(student);
    } else {
      // Buat ID baru jika ditemukan duplikat
      const newId = `${student.id}-${Date.now()}`;
      ids.add(newId);
      result.push({...student, id: newId});
    }
  }
  
  return result;
};

export const getStudents = async (
  filters?: FilterParams,
  page = 1,
  limit = 10
): Promise<ApiResponse<Student>> => {
  try {
    // Jika menggunakan mock data, langsung kembalikan
    if (useMockData) {
      console.log('Using mock student data');
      
      // Filter mock data jika ada filter yang diberikan
      let filteredStudents = [...MOCK_STUDENTS];
      
      if (filters) {
        if (filters.tingkat) {
          filteredStudents = filteredStudents.filter(s => s.tingkat === filters.tingkat);
        }
        
        if (filters.kelas) {
          filteredStudents = filteredStudents.filter(s => s.kelas === filters.kelas);
        }
        
        if (filters.academicStatus) {
          filteredStudents = filteredStudents.filter(s => s.academicStatus === filters.academicStatus);
        }
        
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredStudents = filteredStudents.filter(s => 
            s.name.toLowerCase().includes(query) || 
            s.email.toLowerCase().includes(query)
          );
        }
      }
      
      // Pastikan IDs unik sebelum dikembalikan
      const uniqueStudents = validateUniqueIds(filteredStudents);
      
      return {
        data: uniqueStudents,
        totalPages: 1,
        currentPage: 1,
        count: uniqueStudents.length
      };
    }
    
    try {
      // Setup AbortController for timeout handling
      const { signal, clearTimeout } = createAbortController();
      
      const response = await api.get('/students/', {
        signal,
        params: { 
          page, 
          limit,
          ...filters 
        }
      });
      
      // Clear timeout as request completed successfully
      clearTimeout();
      
      // Pastikan data dari API juga memiliki ID unik
      const uniqueStudents = validateUniqueIds(response.data.results || []);
      
      return {
        data: uniqueStudents,
        currentPage: response.data.current_page || page,
        totalPages: response.data.total_pages || Math.ceil((response.data.count || 0) / limit),
        count: response.data.count || uniqueStudents.length
      };
    } catch (error) {
      console.error('Error fetching students with API:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    
    // Selalu fallback ke mock data jika terjadi error
    useMockData = true;
    
    // Pastikan IDs unik sebelum dikembalikan
    const uniqueStudents = validateUniqueIds(MOCK_STUDENTS);
    
    return {
      data: uniqueStudents,
      totalPages: 1,
      currentPage: 1,
      count: uniqueStudents.length
    };
  }
};

export const getStudent = async (id: string): Promise<Student> => {
  try {
    if (useMockData) {
      const student = MOCK_STUDENTS.find(s => s.id === id);
      if (!student) throw new Error('Student not found');
      return student;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.get(`/students/${id}/`, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error);
    
    // Fallback ke mock data jika terjadi error koneksi
    if (useMockData) {
      const mockStudent = MOCK_STUDENTS.find(s => s.id === id);
      if (mockStudent) return mockStudent;
    }
    
    throw error;
  }
};

export const createStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  try {
    if (useMockData) {
      const newStudent: Student = {
        ...student,
        id: String(MOCK_STUDENTS.length + 1)
      };
      MOCK_STUDENTS.push(newStudent);
      return newStudent;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.post('/students/', student, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    
    // Fallback ke mock data jika terjadi error koneksi
    if (!useMockData) {
      useMockData = true;
      const newStudent: Student = {
        ...student,
        id: String(Date.now())  // Gunakan timestamp sebagai ID unik
      };
      MOCK_STUDENTS.push(newStudent);
      return newStudent;
    }
    
    throw error;
  }
};

// Utility function to toggle mock data mode
export const toggleStudentMockData = (enable?: boolean) => {
  useMockData = enable !== undefined ? enable : !useMockData;
  return useMockData;
};