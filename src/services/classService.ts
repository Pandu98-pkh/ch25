import api, { createAbortController } from './api';
import { Class, ApiResponse, FilterParams } from '../types';

// Extended FilterParams for classes
interface ClassFilterParams extends FilterParams {
  academicYear?: string;
  grade?: string;
}

// Mock data untuk Classes
const MOCK_CLASSES: Class[] = [
  {
    id: '1',
    name: 'XI IPA-1',
    gradeLevel: 'XI',
    academicYear: '2023/2024',
    teacherName: 'Budi Santoso',
    studentCount: 32
  },
  {
    id: '2',
    name: 'XII IPS-2',
    gradeLevel: 'XII',
    academicYear: '2023/2024',
    teacherName: 'Siti Aminah',
    studentCount: 28
  },
  {
    id: '3',
    name: 'X IPA-3',
    gradeLevel: 'X',
    academicYear: '2023/2024',
    teacherName: 'Ahmad Hidayat',
    studentCount: 34
  }
];

// Pengaturan untuk menggunakan mock data
// Selalu menggunakan mock data secara default untuk mencegah error ketika backend tidak berjalan
let useMockData = true;

// Memastikan semua class IDs unik
const validateUniqueIds = (classes: Class[]): Class[] => {
  const ids = new Set<string>();
  const result: Class[] = [];
  
  for (const classItem of classes) {
    if (!ids.has(classItem.id)) {
      ids.add(classItem.id);
      result.push(classItem);
    } else {
      // Buat ID baru jika ditemukan duplikat
      const newId = `${classItem.id}-${Date.now()}`;
      ids.add(newId);
      result.push({...classItem, id: newId});
    }
  }
  
  return result;
};

export const getClasses = async (
  filters?: ClassFilterParams,
  page = 1,
  limit = 10
): Promise<ApiResponse<Class>> => {
  try {
    // Jika menggunakan mock data, langsung kembalikan
    if (useMockData) {
      console.log('Using mock class data');
      
      // Filter mock data jika ada filter yang diberikan
      let filteredClasses = [...MOCK_CLASSES];
      
      if (filters) {
        if (filters.grade) {
          filteredClasses = filteredClasses.filter(c => c.gradeLevel.startsWith(filters.grade!));
        }
        
        if (filters.academicYear) {
          filteredClasses = filteredClasses.filter(c => c.academicYear === filters.academicYear);
        }
        
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredClasses = filteredClasses.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.teacherName?.toLowerCase().includes(query)
          );
        }
      }
      
      // Pastikan IDs unik sebelum dikembalikan
      const uniqueClasses = validateUniqueIds(filteredClasses);
      
      return {
        data: uniqueClasses,
        totalPages: 1,
        currentPage: 1,
        count: uniqueClasses.length
      };
    }
    
    try {
      // Setup AbortController for timeout handling
      const { signal, clearTimeout } = createAbortController();
      
      const response = await api.get('/classes/', {
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
      const uniqueClasses = validateUniqueIds(response.data.results || []);
      
      return {
        data: uniqueClasses,
        currentPage: response.data.current_page || page,
        totalPages: response.data.total_pages || Math.ceil((response.data.count || 0) / limit),
        count: response.data.count || uniqueClasses.length
      };
    } catch (error) {
      console.error('Error fetching classes with API:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error fetching classes:', error);
    
    // Selalu fallback ke mock data jika terjadi error
    useMockData = true;
    
    // Pastikan IDs unik sebelum dikembalikan
    const uniqueClasses = validateUniqueIds(MOCK_CLASSES);
    
    return {
      data: uniqueClasses,
      totalPages: 1,
      currentPage: 1,
      count: uniqueClasses.length
    };
  }
};

export const getClass = async (id: string): Promise<Class> => {
  try {
    if (useMockData) {
      const classItem = MOCK_CLASSES.find(c => c.id === id);
      if (!classItem) throw new Error('Class not found');
      return classItem;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.get(`/classes/${id}/`, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching class with ID ${id}:`, error);
    
    // Fallback ke mock data jika terjadi error koneksi
    if (useMockData) {
      const mockClass = MOCK_CLASSES.find(c => c.id === id);
      if (mockClass) return mockClass;
    }
    
    throw error;
  }
};

export const getClassStudents = async (classId: string) => {
  try {
    if (useMockData) {
      // Get the class to determine student count
      const classItem = MOCK_CLASSES.find(c => c.id === classId);
      if (!classItem) throw new Error('Class not found');
      
      // Generate mock students for the class
      const mockStudents = Array.from({ length: classItem.studentCount }, (_, i) => ({
        id: `student-${classId}-${i+1}`,
        name: `Student ${i+1}`,
        email: `student${i+1}@example.com`,
        grade: classItem.gradeLevel.split(' ')[0],
        class: classItem.name,
        tingkat: classItem.gradeLevel.split(' ')[0],
        kelas: classItem.name,
        academicStatus: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)]
      }));
      
      return {
        students: mockStudents,
        totalCount: mockStudents.length
      };
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.get(`/classes/${classId}/students/`, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return {
      students: response.data.students || [],
      totalCount: response.data.count || 0
    };
  } catch (error) {
    console.error(`Error fetching students for class ID ${classId}:`, error);
    
    if (useMockData) {
      // Fallback to mock data
      const classItem = MOCK_CLASSES.find(c => c.id === classId);
      if (!classItem) throw new Error('Class not found');
      
      const mockStudents = Array.from({ length: 5 }, (_, i) => ({
        id: `student-${classId}-${i+1}`,
        name: `Student ${i+1}`,
        email: `student${i+1}@example.com`,
        grade: classItem.gradeLevel.split(' ')[0],
        class: classItem.name,
        tingkat: classItem.gradeLevel.split(' ')[0],
        kelas: classItem.name,
        academicStatus: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)]
      }));
      
      return {
        students: mockStudents,
        totalCount: mockStudents.length
      };
    }
    
    throw error;
  }
};

export const createClass = async (classData: Omit<Class, 'id'>): Promise<Class> => {
  try {
    if (useMockData) {
      const newClass: Class = {
        ...classData,
        id: String(MOCK_CLASSES.length + 1)
      };
      MOCK_CLASSES.push(newClass);
      return newClass;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.post('/classes/', classData, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error);
    
    // Fallback ke mock data jika terjadi error koneksi
    if (!useMockData) {
      useMockData = true;
      const newClass: Class = {
        ...classData,
        id: String(Date.now())  // Gunakan timestamp sebagai ID unik
      };
      MOCK_CLASSES.push(newClass);
      return newClass;
    }
    
    throw error;
  }
};

export const updateClass = async (id: string, classData: Partial<Class>): Promise<Class> => {
  try {
    if (useMockData) {
      const index = MOCK_CLASSES.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Class not found');
      
      MOCK_CLASSES[index] = {
        ...MOCK_CLASSES[index],
        ...classData
      };
      
      return MOCK_CLASSES[index];
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.patch(`/classes/${id}/`, classData, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error(`Error updating class with ID ${id}:`, error);
    
    // If using real API but encountered an error, fallback to mock
    if (!useMockData) {
      useMockData = true;
      const index = MOCK_CLASSES.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Class not found');
      
      MOCK_CLASSES[index] = {
        ...MOCK_CLASSES[index],
        ...classData
      };
      
      return MOCK_CLASSES[index];
    }
    
    throw error;
  }
};

export const deleteClass = async (id: string): Promise<boolean> => {
  try {
    if (useMockData) {
      const index = MOCK_CLASSES.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Class not found');
      
      MOCK_CLASSES.splice(index, 1);
      return true;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    await api.delete(`/classes/${id}/`, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return true;
  } catch (error) {
    console.error(`Error deleting class with ID ${id}:`, error);
    
    // If using real API but encountered an error, fallback to mock
    if (!useMockData) {
      useMockData = true;
      const index = MOCK_CLASSES.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Class not found');
      
      MOCK_CLASSES.splice(index, 1);
      return true;
    }
    
    throw error;
  }
};

// Utility function to toggle mock data mode
export const toggleClassMockData = (enable?: boolean) => {
  useMockData = enable !== undefined ? enable : !useMockData;
  return useMockData;
};
