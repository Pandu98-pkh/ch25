import axios, { AxiosRequestConfig } from 'axios';
import { Class, FilterParams } from '../types';

// Use a direct URL to avoid process.env reference
const API_URL = 'http://localhost:3001/api';

export async function getClasses(filters: FilterParams = {}, page: number = 1, config: AxiosRequestConfig = {}) {
  const params = { ...filters, page };
  const response = await axios.get(`${API_URL}/classes`, { 
    params,
    ...config,
    timeout: 10000 // set default timeout to 10 seconds
  });
  return {
    data: response.data.classes as Class[],
    totalPages: response.data.totalPages as number
  };
}

export async function getClass(id: string, config: AxiosRequestConfig = {}) {
  const response = await axios.get(`${API_URL}/classes/${id}`, {
    ...config,
    timeout: 10000
  });
  return response.data as Class;
}

export async function getClassStudents(classId: string, config: AxiosRequestConfig = {}) {
  const response = await axios.get(`${API_URL}/classes/${classId}/students`, {
    ...config,
    timeout: 10000
  });
  return response.data.students;
}

export async function createClass(classData: Omit<Class, 'id'>, config: AxiosRequestConfig = {}) {
  const response = await axios.post(`${API_URL}/classes`, classData, {
    ...config,
    timeout: 10000
  });
  return response.data as Class;
}