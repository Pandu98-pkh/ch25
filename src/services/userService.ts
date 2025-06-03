// filepath: d:\Backup\Downloads\project\src\services\userService.ts
// Import will be used when switching from localStorage to real API
// @ts-ignore
import api from './api';
import { User } from '../types';

const API_URL = 'http://localhost:5000/api';

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get a user by ID
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userId: string, userData: User): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
};

// Authentication function that Login.tsx is expecting
export const authenticateUser = async (username: string, password: string): Promise<{ user: User }> => {
  try {
    const response = await fetch(`${API_URL}/users/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
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
      const response = await fetch(`${API_URL}/users/available-for-student`);
      if (response.ok) {
        const availableUsers = await response.json();
        return availableUsers;
      }
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
    const response = await fetch(`${API_URL}/users/statistics`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user statistics');
    }
    return await response.json();
  } catch (error) {
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