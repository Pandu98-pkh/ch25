import api, { createAbortController } from './api';
import { Student, ApiResponse, FilterParams } from '../types';

// Mock data untuk Students
const MOCK_STUDENTS: Student[] = [
  {
    studentId: 'S12345', // NIS as primary key
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    tingkat: 'XI',
    kelas: 'IPA-1',
    academicStatus: 'good',
    avatar: '/assets/avatars/avatar-1.png',
    grade: 'XI',
    class: 'IPA-1',
    photo: '/assets/avatars/avatar-1.png',
    id: '1' // Kept for backward compatibility
  },
  {
    studentId: 'S67890', // NIS as primary key
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    tingkat: 'XII',
    kelas: 'IPS-2',
    academicStatus: 'warning',
    avatar: '/assets/avatars/avatar-2.png',
    grade: 'XII',
    class: 'IPS-2',
    photo: '/assets/avatars/avatar-2.png',
    id: '2' // Kept for backward compatibility
  },
  {
    studentId: 'S24680', // NIS as primary key
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    tingkat: 'X',
    kelas: 'IPA-3',
    academicStatus: 'critical',
    avatar: '/assets/avatars/avatar-3.png',
    grade: 'X',
    class: 'IPA-3',
    photo: '/assets/avatars/avatar-3.png',
    id: '3' // Kept for backward compatibility
  }
];

// Pengaturan untuk menggunakan mock data
// Set to false to use real backend API (database integration now available)
let useMockData = false;

// Memastikan semua student IDs unik
const validateUniqueIds = (students: Student[]): Student[] => {
  const studentIds = new Set<string>();
  const result: Student[] = [];
  
  for (const student of students) {
    const currentStudentId = student.studentId || student.id || `generated-${Date.now()}-${Math.random()}`;
    
    if (!studentIds.has(currentStudentId)) {
      studentIds.add(currentStudentId);
      result.push({
        ...student,
        studentId: currentStudentId
      });
    } else {
      // Buat ID baru jika ditemukan duplikat
      const newId = `${currentStudentId}-${Date.now()}`;
      studentIds.add(newId);
      result.push({
        ...student, 
        studentId: newId
      });
    }
  }
  
  return result;
};

// For backward compatibility, still maintain id uniqueness
const validateLegacyIds = (students: Student[]): Student[] => {
  const ids = new Set<string>();
  const result: Student[] = [];
  
  for (const student of students) {
    if (student.id) {
      if (!ids.has(student.id)) {
        ids.add(student.id);
        result.push(student);
      } else {
        // Buat ID baru jika ditemukan duplikat
        const newId = `${student.id}-${Date.now()}`;
        ids.add(newId);
        result.push({...student, id: newId});
      }
    } else {
      result.push(student);
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
      
      // Pastikan studentIds unik sebelum dikembalikan
      const uniqueStudents = validateUniqueIds(filteredStudents);
      // Also ensure legacy ids are unique for backward compatibility
      const uniqueStudentsWithLegacyIds = validateLegacyIds(uniqueStudents);
      
      return {
        data: uniqueStudentsWithLegacyIds,
        totalPages: 1,
        currentPage: 1,
        count: uniqueStudentsWithLegacyIds.length
      };
    }
    
    try {
      // Setup AbortController for timeout handling
      const { signal, clearTimeout } = createAbortController();
      
      const response = await api.get('/students', {
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
      const uniqueStudents = validateUniqueIds(response.data.data || []);
      // Also ensure legacy ids are unique for backward compatibility
      const uniqueStudentsWithLegacyIds = validateLegacyIds(uniqueStudents);
        return {
        data: uniqueStudentsWithLegacyIds,
        currentPage: response.data.currentPage || page,
        totalPages: response.data.totalPages || Math.ceil((response.data.count || 0) / limit),
        count: response.data.count || uniqueStudentsWithLegacyIds.length
      };
    } catch (error) {
      console.error('Error fetching students with API:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const getStudent = async (id: string): Promise<Student> => {
  try {
    if (useMockData) {
      // Try to find student by studentId first, then fall back to legacy id
      let student = MOCK_STUDENTS.find(s => s.studentId === id);
      
      // If not found by studentId, try with legacy id
      if (!student) {
        student = MOCK_STUDENTS.find(s => s.id === id);
      }
      
      if (!student) throw new Error('Student not found');
      return student;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.get(`/students/${id}`, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
      return response.data;
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error);
    throw error;
  }
};

export const createStudent = async (student: Omit<Student, 'id' | 'studentId'> & { studentId?: string }): Promise<Student> => {
  try {
    console.log('🚀 studentService.createStudent called with:', student);
    
    if (useMockData) {
      // Use the provided studentId (which should be the user ID from user management)
      const studentId = student.studentId;
      
      // Validate that studentId is provided - required for consistency with user management
      if (!studentId) {
        throw new Error('Student ID is required. Please provide a valid User ID from the user management system.');
      }
      
      // Check if studentId already exists
      if (MOCK_STUDENTS.some(s => s.studentId === studentId)) {
        throw new Error('Student ID already exists. Please use a different ID.');
      }
      
      const newStudent: Student = {
        ...student,
        studentId, // Use the provided user ID as student ID
        id: String(MOCK_STUDENTS.length + 1) // Maintain legacy id for backward compatibility
      };
      
      MOCK_STUDENTS.push(newStudent);
      return newStudent;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    console.log('📡 Sending POST request to /students with data:', student);
    const response = await api.post('/students', student, { signal });
    
    console.log('✅ Student creation successful, response:', response.data);
    
    // Clear timeout as request completed successfully
    clearTimeout();
      return response.data;
  } catch (error) {
    console.error('❌ Error creating student:', error);
    throw error;
  }
};

export const updateStudent = async (studentId: string, studentData: Partial<Student>): Promise<Student> => {
  try {
    if (useMockData) {
      // Try to find student by studentId first, then fall back to legacy id
      let index = MOCK_STUDENTS.findIndex(s => s.studentId === studentId);
      
      // If not found by studentId, try with legacy id
      if (index === -1) {
        index = MOCK_STUDENTS.findIndex(s => s.id === studentId);
      }
      
      if (index === -1) throw new Error('Student not found');
      
      // If trying to update studentId, check if it already exists
      if (studentData.studentId && studentData.studentId !== MOCK_STUDENTS[index].studentId) {
        if (MOCK_STUDENTS.some(s => s.studentId === studentData.studentId)) {
          throw new Error('Student ID already exists. Please use a different ID.');
        }
      }
      
      MOCK_STUDENTS[index] = {
        ...MOCK_STUDENTS[index],
        ...studentData
      };
      
      return MOCK_STUDENTS[index];
    }
      // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.put(`/students/${studentId}`, studentData, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error(`Error updating student with ID ${studentId}:`, error);
    throw error;
  }
};

export const deleteStudent = async (studentId: string): Promise<boolean> => {
  try {
    if (useMockData) {
      // Try to find student by studentId first, then fall back to legacy id
      let index = MOCK_STUDENTS.findIndex(s => s.studentId === studentId);
      
      // If not found by studentId, try with legacy id
      if (index === -1) {
        index = MOCK_STUDENTS.findIndex(s => s.id === studentId);
      }
      
      if (index === -1) throw new Error('Student not found');
      
      MOCK_STUDENTS.splice(index, 1);
      return true;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    await api.delete(`/students/${studentId}`, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return true;
  } catch (error) {
    console.error(`Error deleting student with ID ${studentId}:`, error);
    throw error;
  }
};

// Bulk delete students function
export const bulkDeleteStudents = async (studentIds: string[]): Promise<{ message: string; deletedCount: number; deletedStudents: string[]; notFound?: string[] }> => {
  try {
    if (useMockData) {
      const deletedStudents: string[] = [];
      const notFound: string[] = [];
      
      studentIds.forEach(studentId => {
        let index = MOCK_STUDENTS.findIndex(s => s.studentId === studentId);
        
        // If not found by studentId, try with legacy id
        if (index === -1) {
          index = MOCK_STUDENTS.findIndex(s => s.id === studentId);
        }
        
        if (index !== -1) {
          deletedStudents.push(MOCK_STUDENTS[index].name);
          MOCK_STUDENTS.splice(index, 1);
        } else {
          notFound.push(studentId);
        }
      });
      
      const response = {
        message: `Successfully deleted ${deletedStudents.length} student(s)`,
        deletedCount: deletedStudents.length,
        deletedStudents
      };
      
      if (notFound.length > 0) {
        (response as any).notFound = notFound;
      }
      
      return response;
    }
    
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    const response = await api.post('/students/bulk-delete', { studentIds }, { signal });
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting students:', error);
    throw error;
  }
};

// Utility function to toggle mock data mode
export const toggleStudentMockData = (enable?: boolean) => {
  useMockData = enable !== undefined ? enable : !useMockData;
  return useMockData;
};

// New function to get student by userId - needed for mental health assessments
export const getStudentByUserId = async (userId: string): Promise<Student | null> => {
  try {
    if (useMockData) {
      // In mock data, userId often matches studentId for compatibility
      let student = MOCK_STUDENTS.find(s => s.studentId === userId);
      
      // If not found by studentId, try with legacy id
      if (!student) {
        student = MOCK_STUDENTS.find(s => s.id === userId);
      }
      
      return student || null;
    }

    // Real database call - query by userId to get the corresponding student
    // This resolves the userId -> studentId mapping through the normalized schema
    try {
      // Setup AbortController for timeout handling
      const { signal, clearTimeout } = createAbortController();
      
      const response = await api.get(`/students/by-user/${userId}`, { signal });
      
      // Clear timeout as request completed successfully
      clearTimeout();
      
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching student by userId ${userId}:`, error);
      // Return null if student not found (user might not be a student)
      return null;
    }
  } catch (error) {
    console.error(`Error in getStudentByUserId for userId ${userId}:`, error);
    return null;
  }
};

// Batch add students function
// IMPORTANT: This function uses existing User IDs from the database `users` table as Student IDs
// to maintain consistency between user management and student records.
// The userId parameter should come from the database users table, not generated.
export const addStudentsBatch = async (studentsData: Array<{
  userId: string; // This MUST be an existing User ID from database users table
  name: string;
  email: string;
  tingkat: string;
  kelas: string;
  academicStatus: 'good' | 'warning' | 'critical';
  classId?: string;
}>): Promise<Student[]> => {
  try {
    if (useMockData) {
      // In mock mode, simulate batch creation
      const newStudents: Student[] = [];
      
      for (const studentData of studentsData) {
        // CRITICAL: Use the existing userId from database users table as studentId
        // This ensures consistency between user management and student systems
        const studentId = studentData.userId;
        
        // Check if student ID already exists
        if (MOCK_STUDENTS.some(s => s.studentId === studentId)) {
          throw new Error(`Student ID ${studentId} already exists`);
        }
        
        const newStudent: Student = {
          studentId, // This is the User ID from database users table - NO new ID generation
          name: studentData.name,
          email: studentData.email,
          tingkat: studentData.tingkat,
          kelas: studentData.kelas,
          academicStatus: studentData.academicStatus,
          avatar: '',
          grade: studentData.tingkat,
          class: studentData.kelas,
          photo: '',
          id: studentId // Kept for backward compatibility - same as studentId
        };
        
        MOCK_STUDENTS.push(newStudent);
        newStudents.push(newStudent);
      }
      
      return newStudents;
    }
      // Real API call for batch student creation
    // IMPORTANT: The backend API should use the provided userId as studentId
    // without generating new IDs to maintain consistency with user management
    // Setup AbortController for timeout handling
    const { signal, clearTimeout } = createAbortController();
    
    console.log('📡 Sending POST request to /students/batch with existing User IDs from database:', studentsData);
    const response = await api.post('/students/batch', { students: studentsData }, { signal });
    
    console.log('✅ Batch student creation successful, response:', response.data);
    
    // Clear timeout as request completed successfully
    clearTimeout();
    
    return response.data;
  } catch (error) {
    console.error('❌ Error in batch add students:', error);
    throw error;
  }
};