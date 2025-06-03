import api, { createAbortController } from './api';

export interface Counselor {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

// Get list of counselors
export const getCounselors = async (): Promise<{ data: Counselor[] }> => {
  try {
    console.log('Fetching counselors from database');
    
    const { signal, clearTimeout } = createAbortController(10000);
    
    // Call the backend API to get counselors
    const response = await api.get('/counselors', { signal });
    
    clearTimeout();
    
    console.log('Counselors response:', response.data);
    
    // Transform the response to match our expected format
    const counselors = response.data.map((counselor: any) => ({
      id: counselor.id || counselor.user_id,
      name: counselor.name,
      email: counselor.email,
      role: counselor.role
    }));
    
    return { data: counselors };
    
  } catch (error: any) {
    console.error('Error loading counselors:', error);
    
    // Fallback counselors based on what we know exists in the database
    const fallbackCounselors: Counselor[] = [
      { id: 'KSL-2025-001', name: 'Counselor 1' },
      { id: 'KSL-2025-002', name: 'Counselor 2' },
      { id: 'KSL-2025-003', name: 'Counselor 3' }
    ];
    
    console.log('Using fallback counselors:', fallbackCounselors);
    return { data: fallbackCounselors };
  }
};
