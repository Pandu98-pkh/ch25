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
    classId: 'C2023-XI-IPA1', // Primary key for classes
    schoolId: 'C2023-XI-IPA1', // Kept for backward compatibility
    name: 'XI IPA-1',
    gradeLevel: 'XI',
    academicYear: '2023/2024',
    teacherName: 'Budi Santoso',
    studentCount: 32,
    id: '1' // Kept for backward compatibility
  },
  {
    classId: 'C2023-XII-IPS2', // Primary key for classes
    schoolId: 'C2023-XII-IPS2', // Kept for backward compatibility
    name: 'XII IPS-2',
    gradeLevel: 'XII',
    academicYear: '2023/2024',
    teacherName: 'Siti Aminah',
    studentCount: 28,
    id: '2' // Kept for backward compatibility
  },
  {
    classId: 'C2023-X-IPA3', // Primary key for classes
    schoolId: 'C2023-X-IPA3', // Kept for backward compatibility
    name: 'X IPA-3',
    gradeLevel: 'X',
    academicYear: '2023/2024',
    teacherName: 'Ahmad Hidayat',
    studentCount: 34,
    id: '3' // Kept for backward compatibility
  }
];

// Pengaturan untuk menggunakan mock data
// Set to false to use real backend API
let useMockData = false;

// Memastikan semua class classIds unik
const validateUniqueIds = (classes: Class[]): Class[] => {
  const classIds = new Set<string>();
  const result: Class[] = [];
  
  for (const classItem of classes) {
    if (!classIds.has(classItem.classId)) {
      classIds.add(classItem.classId);
      result.push(classItem);
    } else {
      // Buat ID baru jika ditemukan duplikat
      const newId = `${classItem.classId}-${Date.now()}`;
      classIds.add(newId);
      result.push({...classItem, classId: newId});
    }
  }
  
  return result;
};

// For backward compatibility, still maintain id uniqueness
const validateLegacyIds = (classes: Class[]): Class[] => {
  const ids = new Set<string>();
  const result: Class[] = [];
  
  for (const classItem of classes) {
    if (classItem.id) {
      if (!ids.has(classItem.id)) {
        ids.add(classItem.id);
        result.push(classItem);
      } else {
        // Buat ID baru jika ditemukan duplikat
        const newId = `${classItem.id}-${Date.now()}`;
        ids.add(newId);
        result.push({...classItem, id: newId});
      }
    } else {
      result.push(classItem);
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
      
      // Pastikan schoolIds unik sebelum dikembalikan
      const uniqueClasses = validateUniqueIds(filteredClasses);
      // Also ensure legacy ids are unique for backward compatibility
      const uniqueClassesWithLegacyIds = validateLegacyIds(uniqueClasses);
      
      return {
        data: uniqueClassesWithLegacyIds,
        totalPages: 1,
        currentPage: 1,
        count: uniqueClassesWithLegacyIds.length
      };
    }
      try {
      // Setup AbortController for timeout handling
      const { signal, clearTimeout } = createAbortController();
        console.log('🔌 Making API request to:', `/classes`);
      console.log('📊 Filters:', filters);
      console.log('📄 Page:', page, 'Limit:', limit);
      
      const response = await api.get('/classes', {
        signal,
        params: {
          page,
          limit,
          ...filters
        }      });
      
      // Clear timeout as request completed successfully
      clearTimeout();
      
      console.log('✅ API Response received:', response.data);
      
      // Pastikan data dari API juga memiliki ID unik
      const uniqueClasses = validateUniqueIds(response.data.data || []);
      // Also ensure legacy ids are unique for backward compatibility
      const uniqueClassesWithLegacyIds = validateLegacyIds(uniqueClasses);
      
      return {
        data: uniqueClassesWithLegacyIds,
        currentPage: response.data.currentPage || page,
        totalPages: response.data.totalPages || Math.ceil((response.data.totalRecords || 0) / limit),
        count: response.data.totalRecords || uniqueClassesWithLegacyIds.length
      };
    } catch (error) {
      console.error('Error fetching classes with API:', error);
      throw error;
    }  } catch (error) {
    console.error('Error fetching classes:', error);
    
    // DON'T set global useMockData flag - let other functions try the API independently
    console.log('⚠️ API call failed, but keeping API connection alive for other functions');
    
    // Return empty data instead of fallback to prevent confusion
    throw error;
  }
};

export const getClass = async (id: string): Promise<Class> => {
  try {
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
      console.log('🔌 Fetching class with ID:', id);
    const response = await api.get(`/classes/${id}`, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    console.log('✅ Class data fetched:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching class with ID ${id}:`, error);
    
    // Fallback to mock data if available
    let mockClass = MOCK_CLASSES.find(c => c.schoolId === id);
    
    // If not found by schoolId, try with legacy id
    if (!mockClass) {
      mockClass = MOCK_CLASSES.find(c => c.id === id);
    }
    
    if (mockClass) {
      console.log('📋 Using mock data for class:', id);
      return mockClass;
    }
    
    throw error;
  }
};

export const getClassStudents = async (classId: string) => {
  try {
    if (useMockData) {
      // Get the class to determine student count
      // Try to find class by schoolId first, then fall back to legacy id
      let classItem = MOCK_CLASSES.find(c => c.schoolId === classId);
      
      // If not found by schoolId, try with legacy id
      if (!classItem) {
        classItem = MOCK_CLASSES.find(c => c.id === classId);
      }
      
      if (!classItem) throw new Error('Class not found');
      
      // Generate mock students for the class
      const mockStudents = Array.from({ length: classItem.studentCount }, (_, i) => ({
        studentId: `S-${classId}-${i+1}`, // Use studentId as primary key
        name: `Student ${i+1}`,
        email: `student${i+1}@example.com`,
        grade: classItem.gradeLevel.split(' ')[0],
        class: classItem.name,
        tingkat: classItem.gradeLevel.split(' ')[0],
        kelas: classItem.name,
        academicStatus: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)],
        id: `student-${classId}-${i+1}` // Kept for backward compatibility
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
      // Try to find class by schoolId first, then fall back to legacy id
      let classItem = MOCK_CLASSES.find(c => c.schoolId === classId);
      
      // If not found by schoolId, try with legacy id
      if (!classItem) {
        classItem = MOCK_CLASSES.find(c => c.id === classId);
      }
      
      if (!classItem) throw new Error('Class not found');
      
      const mockStudents = Array.from({ length: 5 }, (_, i) => ({
        studentId: `S-${classId}-${i+1}`, // Use studentId as primary key
        name: `Student ${i+1}`,
        email: `student${i+1}@example.com`,
        grade: classItem.gradeLevel.split(' ')[0],
        class: classItem.name,
        tingkat: classItem.gradeLevel.split(' ')[0],
        kelas: classItem.name,
        academicStatus: ['good', 'warning', 'critical'][Math.floor(Math.random() * 3)],
        id: `student-${classId}-${i+1}` // Kept for backward compatibility
      }));
      
      return {
        students: mockStudents,
        totalCount: mockStudents.length
      };
    }
    
    throw error;
  }
};

export const createClass = async (classData: Omit<Class, 'id' | 'schoolId'> & { schoolId?: string }): Promise<Class> => {
  try {
    if (useMockData) {
      // Generate a school ID if not provided
      const academicYear = classData.academicYear?.split('/')[0] || new Date().getFullYear();
      const schoolId = classData.schoolId || `C${academicYear}-${classData.gradeLevel}-${classData.name.replace(/\s/g, '')}`;
      
      // Check if schoolId already exists
      if (MOCK_CLASSES.some(c => c.schoolId === schoolId)) {
        throw new Error('School ID already exists. Please use a different ID.');
      }
      
      const newClass: Class = {
        ...classData,
        schoolId,
        id: String(MOCK_CLASSES.length + 1) // Maintain legacy id for backward compatibility
      };
      
      MOCK_CLASSES.push(newClass);
      return newClass;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.post('/classes', classData, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error);
    
    // Fallback ke mock data jika terjadi error koneksi
    if (!useMockData) {
      useMockData = true;
      // Generate a school ID if not provided
      const academicYear = classData.academicYear?.split('/')[0] || new Date().getFullYear();
      const schoolId = classData.schoolId || `C${academicYear}-${classData.gradeLevel}-${classData.name.replace(/\s/g, '')}`;
      
      // Check if schoolId already exists
      if (MOCK_CLASSES.some(c => c.schoolId === schoolId)) {
        throw new Error('School ID already exists. Please use a different ID.');
      }
      
      const newClass: Class = {
        ...classData,
        schoolId,
        id: String(Date.now())  // Gunakan timestamp sebagai ID unik (legacy)
      };
      
      MOCK_CLASSES.push(newClass);
      return newClass;
    }
    
    throw error;
  }
};

export const updateClass = async (schoolId: string, classData: Partial<Class>): Promise<Class> => {
  try {
    if (useMockData) {
      // Try to find class by schoolId first, then fall back to legacy id
      let index = MOCK_CLASSES.findIndex(c => c.schoolId === schoolId);
      
      // If not found by schoolId, try with legacy id
      if (index === -1) {
        index = MOCK_CLASSES.findIndex(c => c.id === schoolId);
      }
      
      if (index === -1) throw new Error('Class not found');
      
      // If trying to update schoolId, check if it already exists
      if (classData.schoolId && classData.schoolId !== MOCK_CLASSES[index].schoolId) {
        if (MOCK_CLASSES.some(c => c.schoolId === classData.schoolId)) {
          throw new Error('School ID already exists. Please use a different ID.');
        }
      }
      
      MOCK_CLASSES[index] = {
        ...MOCK_CLASSES[index],
        ...classData
      };
      
      return MOCK_CLASSES[index];
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.patch(`/classes/${schoolId}/`, classData, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error(`Error updating class with ID ${schoolId}:`, error);
    
    // If using real API but encountered an error, fallback to mock
    if (!useMockData) {
      useMockData = true;
      // Try to find class by schoolId first, then fall back to legacy id
      let index = MOCK_CLASSES.findIndex(c => c.schoolId === schoolId);
      
      // If not found by schoolId, try with legacy id
      if (index === -1) {
        index = MOCK_CLASSES.findIndex(c => c.id === schoolId);
      }
      
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

export const deleteClass = async (schoolId: string): Promise<boolean> => {
  try {
    if (useMockData) {
      // Try to find class by schoolId first, then fall back to legacy id
      let index = MOCK_CLASSES.findIndex(c => c.schoolId === schoolId);
      
      // If not found by schoolId, try with legacy id
      if (index === -1) {
        index = MOCK_CLASSES.findIndex(c => c.id === schoolId);
      }
      
      if (index === -1) throw new Error('Class not found');
      
      MOCK_CLASSES.splice(index, 1);
      return true;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    await api.delete(`/classes/${schoolId}/`, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return true;
  } catch (error) {
    console.error(`Error deleting class with ID ${schoolId}:`, error);
    
    // If using real API but encountered an error, fallback to mock
    if (!useMockData) {
      useMockData = true;
      // Try to find class by schoolId first, then fall back to legacy id
      let index = MOCK_CLASSES.findIndex(c => c.schoolId === schoolId);
      
      // If not found by schoolId, try with legacy id
      if (index === -1) {
        index = MOCK_CLASSES.findIndex(c => c.id === schoolId);
      }
      
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

// Delete management functions
export const getDeletedClasses = async (): Promise<Class[]> => {
  try {
    const { signal, clearTimeout } = createAbortController();
    
    console.log('🔌 Fetching deleted classes from API...');
    const response = await api.get('/admin/classes/deleted', { signal });
    
    clearTimeout();
    console.log('✅ Deleted classes fetched successfully:', response.data);
    
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching deleted classes:', error);
    throw error;
  }
};

export const restoreClass = async (classId: string): Promise<Class> => {
  try {
    const { signal, clearTimeout } = createAbortController();
    
    console.log('🔄 Restoring class:', classId);
    const response = await api.put(`/admin/classes/${classId}/restore`, {}, { signal });
    
    clearTimeout();
    console.log('✅ Class restored successfully:', response.data);
    
    return response.data.class;
  } catch (error) {
    console.error('❌ Error restoring class:', error);
    throw error;
  }
};

export const hardDeleteClass = async (classId: string): Promise<boolean> => {
  try {
    const { signal, clearTimeout } = createAbortController();
    
    console.log('🗑️ Permanently deleting class:', classId);
    await api.delete(`/admin/classes/${classId}/hard-delete`, { signal });
    
    clearTimeout();
    console.log('✅ Class permanently deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Error permanently deleting class:', error);
    throw error;
  }
};

// Soft delete for regular class deletion
export const softDeleteClass = async (classId: string): Promise<boolean> => {
  try {
    const { signal, clearTimeout } = createAbortController();
    
    console.log('🗑️ Soft deleting class:', classId);
    await api.delete(`/classes/${classId}`, { signal });
    
    clearTimeout();
    console.log('✅ Class soft deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Error soft deleting class:', error);
    throw error;
  }
};

// Get actual student count from database
export const getClassStudentCount = async (classId: string): Promise<number> => {
  try {
    const { signal, clearTimeout } = createAbortController();
      console.log('🔌 Fetching student count for class:', classId);
    const response = await api.get(`/classes/${classId}/students`, { signal });
    
    clearTimeout();
    console.log('✅ Student count fetched:', response.data.count);
    
    return response.data.count || 0;
  } catch (error) {
    console.error('❌ Error fetching student count for class:', classId, error);
    
    // Try to get the count from the class data as fallback
    try {
      const classData = await getClass(classId);
      return classData.studentCount || 0;
    } catch (classError) {
      console.error('❌ Could not get fallback count from class data:', classError);
      return 0;
    }
  }
};

// Get students in a class with detailed information
export const getClassStudentsDetailed = async (classId: string) => {  try {
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.get(`/classes/${classId}/students`, { signal });
    
    clearTimeout();
    
    return {
      students: response.data.students || [],
      count: response.data.count || 0
    };
  } catch (error) {
    console.error('❌ Error fetching detailed students for class:', classId, error);
    return { students: [], count: 0 };
  }
};
