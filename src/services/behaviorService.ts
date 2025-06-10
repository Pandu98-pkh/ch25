import api from './api';
import { BehaviorRecord, ApiResponse, FilterParams } from '../types';

// Mock data (hanya jika ingin mock, bisa hapus bagian ini jika tidak dipakai)
const MOCK_BEHAVIOR_RECORDS: BehaviorRecord[] = [
  // ... contoh data mock
];

// Utility memastikan ID unik (jika pakai mock)
const validateUniqueBehaviorIds = (records: BehaviorRecord[]): BehaviorRecord[] => {
  const ids = new Set<string>();
  const result: BehaviorRecord[] = [];
  for (const record of records) {
    if (!ids.has(record.id)) {
      ids.add(record.id);
      result.push(record);
    } else {
      const newId = `${record.id}-${Date.now()}`;
      ids.add(newId);
      result.push({ ...record, id: newId });
    }
  }
  return result;
};

const FORCE_USE_DATABASE = true;
let useMockData = false;

// Ambil records perilaku siswa
export const getBehaviorRecords = async (
  studentId: string, 
  filters?: FilterParams,
  page = 1
): Promise<ApiResponse<BehaviorRecord>> => {
  try {
    if (FORCE_USE_DATABASE || !useMockData) {
      const response = await api.get('/behavior-records', {
        params: {
          student: studentId,
          page,
          ...filters
        }
      });
      const uniqueRecords = validateUniqueBehaviorIds(response.data.results || []);
      return {
        data: uniqueRecords,
        count: response.data.count || uniqueRecords.length,
        totalPages: response.data.total_pages || 1,
        currentPage: response.data.current_page || page
      };
    }
    // Fallback mock
    let filteredRecords = MOCK_BEHAVIOR_RECORDS.filter(record => record.studentId === studentId);
    // ...filter logic (optional, jika pakai mock)
    return {
      data: filteredRecords,
      count: filteredRecords.length,
      totalPages: 1,
      currentPage: 1
    };
  } catch (error) {
    console.error('Error loading behavior records:', error);
    throw error;
  }
};

// Buat record perilaku baru
export const createBehaviorRecord = async (record: Omit<BehaviorRecord, 'id'>): Promise<BehaviorRecord> => {
  try {
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Creating behavior record with data:', record);
      const response = await api.post('/behavior-records', record);
      return response.data;
    }
    // Fallback mock
    const newRecord: BehaviorRecord = { ...record, id: String(MOCK_BEHAVIOR_RECORDS.length + 1) };
    MOCK_BEHAVIOR_RECORDS.push(newRecord);
    return newRecord;
  } catch (error) {
    console.error('Error creating behavior record:', error);
    throw error;
  }
};

// Update record perilaku
export const updateBehaviorRecord = async (id: string, data: Partial<BehaviorRecord>): Promise<BehaviorRecord> => {
  try {
    if (useMockData) {
      const index = MOCK_BEHAVIOR_RECORDS.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Behavior record not found');
      MOCK_BEHAVIOR_RECORDS[index] = { ...MOCK_BEHAVIOR_RECORDS[index], ...data };
      return MOCK_BEHAVIOR_RECORDS[index];
    }
    const response = await api.put(`/behavior-records/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating behavior record:', error);
    throw error;
  }
};

// Hapus behavior record
export const deleteBehaviorRecord = async (id: string): Promise<void> => {
  try {
    if (useMockData) {
      const index = MOCK_BEHAVIOR_RECORDS.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Behavior record not found');
      MOCK_BEHAVIOR_RECORDS.splice(index, 1);
      return;
    }
    await api.delete(`/behavior-records/${id}`);
  } catch (error) {
    console.error('Error deleting behavior record:', error);
    throw error;
  }
};

// Statistik ringkasan perilaku siswa
export interface BehaviorSummaryData {
  total: number;
  byCategory: { positive: number; negative: number };
  bySeverity: { 
    minor: number; 
    major: number;
    positive: number;
    neutral: number;
  };
}

export const getBehaviorSummary = async (studentId: string): Promise<BehaviorSummaryData> => {
  try {
    if (useMockData) {
      // return MOCK_BEHAVIOR_SUMMARY[studentId] || ...;
    }
    const response = await api.get('/behavior-records/summary', {
      params: { student: studentId }
    });
    return response.data;
  } catch (error) {
    console.error('Error loading behavior summary:', error);
    throw error;
  }
};