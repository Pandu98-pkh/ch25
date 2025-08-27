// filepath: d:\Backup\Downloads\project\src\services\userService.ts
// Import will be used when switching from localStorage to real API
// @ts-ignore
import api from './api';
import { User } from '../types';
import axios from 'axios';

// Get API base URL (same as TestLogin yang berhasil)
const getApiBaseURL = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port || '5000';
  
  // Jika ada VITE_API_URL, gunakan itu
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Buat URL penuh berdasarkan lokasi saat ini
  const baseURL = `${protocol}//${hostname}:${port}`;
  return baseURL;
};

const API_URL = getApiBaseURL();

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/users`, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Koneksi timeout. Periksa jaringan internet dan coba lagi.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Coba lagi nanti.');
    } else {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch users');
    }
  }
};

// Get a user by ID
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await axios.get(`${API_URL}/api/users/${userId}`, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Koneksi timeout. Periksa jaringan internet dan coba lagi.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Coba lagi nanti.');
    } else {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch user');
    }
  }
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/api/users`, userData, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Koneksi timeout. Periksa jaringan internet dan coba lagi.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Coba lagi nanti.');
    } else {
      throw new Error(error.response?.data?.error || error.message || 'Failed to create user');
    }
  }
};

// Update an existing user
export const updateUser = async (userId: string, userData: User): Promise<User> => {
  try {
    const response = await axios.put(`${API_URL}/api/users/${userId}`, userData, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error updating user with ID ${userId}:`, error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Koneksi timeout. Periksa jaringan internet dan coba lagi.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Coba lagi nanti.');
    } else {
      throw new Error(error.response?.data?.error || error.message || 'Failed to update user');
    }
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/users/${userId}`, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  } catch (error: any) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Koneksi timeout. Periksa jaringan internet dan coba lagi.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi jaringan.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Coba lagi nanti.');
    } else {
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete user');
    }
  }
};

// Authentication function that Login.tsx is expecting (sama seperti TestLogin yang berhasil)
export const authenticateUser = async (username: string, password: string): Promise<{ user: User }> => {
  const loginURL = `${API_URL}/api/users/auth/login`;
  console.log('Authenticating user with URL:', loginURL);
  
  try {
    // Gunakan axios persis seperti TestLogin yang berhasil
    const response = await axios({
      method: 'POST',
      url: loginURL,
      data: { username, password },
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      validateStatus: (status) => status < 500, // Accept 4xx and 2xx
    });
    
    console.log('Authentication response status:', response.status);
    console.log('Authentication response data:', response.data);
    
    if (response.status === 200 && response.data.user) {
      console.log('Authentication successful:', response.data);
      return response.data;
    } else if (response.status === 401) {
      throw new Error('Username atau password salah');
    } else {
      throw new Error(`Login failed with status ${response.status}: ${response.data?.error || 'Unknown error'}`);
    }
    
  } catch (error: any) {
    console.error('Authentication error:', error);
    
    // Error handling sama seperti TestLogin
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Koneksi timeout. Periksa jaringan internet dan coba lagi.');
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      throw new Error(`Tidak dapat terhubung ke server di ${API_URL}. Periksa koneksi jaringan.`);
    } else if (error.response?.status === 401) {
      throw new Error('Username atau password tidak valid');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Data login tidak valid');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Coba lagi nanti.');
    } else {
      const errorMsg = error.response?.data?.error || error.message || 'Login gagal';
      throw new Error(`Login gagal: ${errorMsg}`);
    }
  }
};

// Get users who are not yet students
export const getNonStudentUsers = async (): Promise<User[]> => {
  try {
    // Get all users with student role
    const allUsers = await getUsers();
    const studentUsers = allUsers.filter(user => user.role === 'student');
    
    // For this we need to check which students are already in the student table
    // We'll need to call an endpoint that gives us users who are not yet in student table
    try {
      // Try to get users who are not yet students from a dedicated endpoint
      const response = await axios.get(`${API_URL}/api/users/available-for-student`, {
        timeout: 10000,
      });
      return response.data;
    } catch (endpointError) {
      console.log('Dedicated endpoint not available, using client-side filtering');
    }
    
    // Fallback: Get all students and filter out users who are already students
    try {
      // Import studentService to check existing students
      const { getStudents } = await import('./studentService');
      const studentsResponse = await getStudents({}, 1, 1000); // Get many students
      const existingStudents = studentsResponse.data || [];
        // Get user IDs that are already students
      const existingStudentUserIds = new Set(
        existingStudents
          .map(student => student.id || student.studentId)
          .filter(Boolean)
      );
        // Filter out users who are already students
      const availableUsers = studentUsers.filter(user => 
        !existingStudentUserIds.has(user.id || user.userId)
      );
      
      return availableUsers;
    } catch (studentServiceError) {
      console.error('Error checking existing students:', studentServiceError);
      // Final fallback: return all student users
      return studentUsers;
    }
    
  } catch (error) {
    console.error('Error fetching non-student users:', error);
    
    // Fallback: return empty array if API fails
    return [];
  }
};

interface UserStatistics {
  totalUsers: number;
  totalCounselors: number;
  totalStudents: number;
  totalAdmins: number;
}

// Get user statistics
export const getUserStatistics = async (): Promise<UserStatistics> => {
  try {
    const response = await axios.get(`${API_URL}/api/users/statistics`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user statistics:', error);
    
    // Fallback: calculate from all users if statistics endpoint is not available
    try {
      const allUsers = await getUsers();
      const totalUsers = allUsers.length;
      const totalCounselors = allUsers.filter(user => user.role === 'counselor').length;
      const totalStudents = allUsers.filter(user => user.role === 'student').length;
      const totalAdmins = allUsers.filter(user => user.role === 'admin').length;
      
      return {
        totalUsers,
        totalCounselors,
        totalStudents,
        totalAdmins
      };
    } catch (fallbackError) {
      console.error('Error in fallback user statistics calculation:', fallbackError);
      throw error;
    }
  }
};

// Export all user operations
export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
  getNonStudentUsers,
  getUserStatistics
};