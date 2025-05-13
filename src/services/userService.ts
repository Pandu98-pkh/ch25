// filepath: d:\Backup\Downloads\project\src\services\userService.ts
// Import will be used when switching from localStorage to real API
// @ts-ignore
import api from './api';
import { User } from '../types';

// Mock storage for users in local development
const USERS_STORAGE_KEY = 'counselorApp_users';

// Function to get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    // In a real application, this would call the API
    // return (await api.get('/users')).data;
    
    // For this demo, we'll use localStorage
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    
    // Default users if none exist
    const defaultUsers: User[] = [
      { 
        id: '1', 
        name: 'Administrator', 
        email: 'admin@example.com', 
        role: 'admin',
        username: 'admin',
        password: 'admin123456'
      },
      { 
        id: '2', 
        name: 'John Smith', 
        email: 'john@example.com', 
        role: 'counselor',
        username: 'john',
        password: 'password123'
      },
      { 
        id: '3', 
        name: 'Jane Doe', 
        email: 'jane@example.com', 
        role: 'counselor',
        username: 'jane',
        password: 'password123'
      },
      { 
        id: '4', 
        name: 'Student User', 
        email: 'student@example.com', 
        role: 'student',
        username: 'student',
        password: 'password123'
      }
    ];
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Function to create a new user
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    // In a real application, this would call the API
    // return (await api.post('/users', userData)).data;
    
    // For this demo, we'll use localStorage
    const users = await getUsers();
    
    const newUser: User = {
      ...userData,
      id: (users.length + 1).toString()
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Function to update an existing user
export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  try {
    // In a real application, this would call the API
    // return (await api.put(`/users/${id}`, userData)).data;
    
    // For this demo, we'll use localStorage
    const users = await getUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    // If password is empty, keep the old password
    if (userData.password === '') {
      delete userData.password;
    }
    
    const updatedUser = {
      ...users[index],
      ...userData
    };
    
    users[index] = updatedUser;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Function to delete a user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    // In a real application, this would call the API
    // await api.delete(`/users/${id}`);
    
    // For this demo, we'll use localStorage
    const users = await getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Function to authenticate a user
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // In a real application, this would call the API
    // return (await api.post('/auth/login', { username, password })).data;
    
    // For this demo, we'll use localStorage
    const users = await getUsers();
    
    const user = users.find(
      user => user.username === username && user.password === password
    );
    
    return user || null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

// Export all user operations
export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser
};