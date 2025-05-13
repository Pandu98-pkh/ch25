import axios from 'axios';
import { Class, FilterParams } from '../types';

// Use a direct URL to avoid process.env reference
const API_URL = 'http://localhost:3001/api';

export async function getClasses(filters: FilterParams = {}, page: number = 1) {
  const params = { ...filters, page };
  const response = await axios.get(`${API_URL}/classes`, { params });
  return {
    data: response.data.classes as Class[],
    totalPages: response.data.totalPages as number
  };
}

export async function getClass(id: string) {
  const response = await axios.get(`${API_URL}/classes/${id}`);
  return response.data as Class;
}

export async function getClassStudents(classId: string) {
  const response = await axios.get(`${API_URL}/classes/${classId}/students`);
  return response.data.students;
}

export async function createClass(classData: Omit<Class, 'id'>) {
  const response = await axios.post(`${API_URL}/classes`, classData);
  return response.data as Class;
}
