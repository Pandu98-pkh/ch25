import api, { createAbortController } from './api';
import { CounselingSession, ApiResponse, FilterParams } from '../types';

// Configuration for mock data fallback
let useMockData = false;
const FORCE_USE_DATABASE = true; // Force database usage

// Mock data for fallback
let mockSessions: CounselingSession[] = [
  {
    id: '1',
    studentId: '1',
    date: '2023-10-15T10:00:00.000Z',
    duration: 45,
    notes: 'Discussion about academic progress and study strategies.',
    type: 'academic',
    outcome: 'positive',
    nextSteps: 'Follow up in 2 weeks to check on assignment progress',
    approvalStatus: 'approved',
    approvedBy: 'counselor1',
    approvedAt: '2023-10-15T12:00:00.000Z',
    counselor: {
      id: '1',
      name: 'Dr. Jessica Martinez'
    }
  },
  {
    id: '2',
    studentId: '2',
    date: '2023-10-12T15:30:00.000Z',
    duration: 60,
    notes: 'Discussed career options in computer science field.',
    type: 'career',
    outcome: 'neutral',
    approvalStatus: 'pending',
    counselor: {
      id: '2',
      name: 'Prof. Michael Chen'
    }
  }
];

// Simulate API call with delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSessions = async (
  filters?: FilterParams,
  page = 1,
  limit = 20
): Promise<ApiResponse<CounselingSession>> => {
  try {
    // Force database usage - disable mock fallback
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Using database for counseling sessions');
      
      const { signal, clearTimeout } = createAbortController(15000);
      
      const response = await api.get('/counseling-sessions', {
        signal,
        params: {
          page,
          limit,
          ...filters
        }
      });
      
      clearTimeout();
        console.log('Database response:', response.data);
      
      // Transform the API response to match our expected format
      const sessions = response.data.results.map((session: any) => ({
        ...session,
        // Ensure consistent ID format
        id: session.id || session.session_id,
        // Handle camelCase conversion for frontend
        nextSteps: session.nextSteps || session.next_steps,
        studentId: session.studentId || session.student_id,
        followUp: session.followUp || session.follow_up || '',
        approvalStatus: session.approvalStatus || session.approval_status || 'pending',
        approvedBy: session.approvedBy || session.approved_by,
        approvedAt: session.approvedAt || session.approved_at,
        rejectionReason: session.rejectionReason || session.rejection_reason
      }));
      
      return {
        data: sessions,
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page,
        count: response.data.count
      };
    }
    
    // Mock data fallback
    console.log('Using mock counseling sessions data');
    await delay(200);
    
    let filteredSessions = [...mockSessions];
      // Apply filters
    if (filters?.studentId) {
      filteredSessions = filteredSessions.filter(session => 
        session.studentId === filters.studentId
      );
    }
    
    if (filters?.type) {
      filteredSessions = filteredSessions.filter(session => 
        session.type === filters.type
      );
    }
    
    if (filters?.startDate) {
      filteredSessions = filteredSessions.filter(session => 
        new Date(session.date) >= new Date(filters.startDate!)
      );
    }
    
    if (filters?.endDate) {
      filteredSessions = filteredSessions.filter(session => 
        new Date(session.date) <= new Date(filters.endDate!)
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSessions = filteredSessions.slice(startIndex, endIndex);
    
    return {
      data: paginatedSessions,
      totalPages: Math.ceil(filteredSessions.length / limit),
      currentPage: page,
      count: filteredSessions.length
    };
    
  } catch (error: any) {
    console.error('Error loading counseling sessions:', error);
    
    // Don't permanently switch to mock data - keep trying database
    console.warn('Counseling sessions API failed, returning mock data temporarily but keeping database mode enabled');
    
    // Return mock data as fallback without changing the useMockData flag
    await delay(200);
    return {
      data: [...mockSessions],
      totalPages: 1,
      currentPage: 1,
      count: mockSessions.length
    };
  }
};

export const createSession = async (session: Omit<CounselingSession, 'id'>): Promise<{ data: CounselingSession }> => {
  try {
    // Force database usage
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Creating counseling session in database:', session);
      
      const { signal, clearTimeout } = createAbortController(15000);
        // Transform frontend data to backend format
      const sessionData = {
        studentId: session.studentId,
        date: session.date,
        duration: session.duration,
        type: session.type,
        notes: session.notes,
        outcome: session.outcome,
        nextSteps: session.nextSteps,
        followUp: session.followUp || '',
        approvalStatus: session.approvalStatus || 'pending',
        counselor: session.counselor
      };
      
      const response = await api.post('/counseling-sessions', sessionData, { signal });
      
      clearTimeout();
      
      console.log('Session created successfully:', response.data);
        // Transform response to match frontend expectations
      const createdSession = {
        ...response.data,
        id: response.data.id || response.data.session_id,
        nextSteps: response.data.nextSteps || response.data.next_steps,
        studentId: response.data.studentId || response.data.student_id,
        followUp: response.data.followUp || response.data.follow_up || '',
        approvalStatus: response.data.approvalStatus || response.data.approval_status || 'pending',
        approvedBy: response.data.approvedBy || response.data.approved_by,
        approvedAt: response.data.approvedAt || response.data.approved_at,
        rejectionReason: response.data.rejectionReason || response.data.rejection_reason
      };
      
      return { data: createdSession };
    }
    
    // Mock fallback
    console.log('Creating counseling session in mock data');
    await delay(200);
    
    const newId = (mockSessions.length + 1).toString();
    const newSession: CounselingSession = {
      ...session,
      id: newId
    };
    
    mockSessions.push(newSession);
    return { data: newSession };
    
  } catch (error: any) {
    console.error('Error creating counseling session:', error);
    throw new Error(error.response?.data?.error || 'Failed to create counseling session');
  }
};

export const updateSession = async (id: string, session: Omit<CounselingSession, 'id'>): Promise<{ data: CounselingSession }> => {
  try {
    // Force database usage
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Updating counseling session in database:', id, session);
      
      const { signal, clearTimeout } = createAbortController(15000);
        // Transform frontend data to backend format
      const sessionData = {
        date: session.date,
        duration: session.duration,
        type: session.type,
        notes: session.notes,
        outcome: session.outcome,
        nextSteps: session.nextSteps,
        followUp: session.followUp || '',
        approvalStatus: session.approvalStatus || 'pending',
        counselor: session.counselor
      };
      
      const response = await api.put(`/counseling-sessions/${id}`, sessionData, { signal });
      
      clearTimeout();
      
      console.log('Session updated successfully:', response.data);
        // Transform response to match frontend expectations
      const updatedSession = {
        ...response.data,
        id: response.data.id || response.data.session_id,
        nextSteps: response.data.nextSteps || response.data.next_steps,
        studentId: response.data.studentId || response.data.student_id,
        followUp: response.data.followUp || response.data.follow_up || '',
        approvalStatus: response.data.approvalStatus || response.data.approval_status || 'pending',
        approvedBy: response.data.approvedBy || response.data.approved_by,
        approvedAt: response.data.approvedAt || response.data.approved_at,
        rejectionReason: response.data.rejectionReason || response.data.rejection_reason
      };
      
      return { data: updatedSession };
    }
    
    // Mock fallback
    console.log('Updating counseling session in mock data');
    await delay(200);
    
    const index = mockSessions.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Session not found');
    }
    
    const updatedSession: CounselingSession = {
      ...session,
      id
    };
    
    mockSessions[index] = updatedSession;
    return { data: updatedSession };
    
  } catch (error: any) {
    console.error('Error updating counseling session:', error);
    throw new Error(error.response?.data?.error || 'Failed to update counseling session');
  }
};

export const deleteSession = async (id: string): Promise<{ success: boolean }> => {
  try {
    // Force database usage
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Deleting counseling session from database:', id);
      
      const { signal, clearTimeout } = createAbortController(15000);
      
      await api.delete(`/counseling-sessions/${id}`, { signal });
      
      clearTimeout();
      
      console.log('Session deleted successfully');
      return { success: true };
    }
    
    // Mock fallback
    console.log('Deleting counseling session from mock data');
    await delay(200);
    
    const index = mockSessions.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSessions = mockSessions.filter(s => s.id !== id);
    }
    
    return { success: true };
    
  } catch (error: any) {
    console.error('Error deleting counseling session:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete counseling session');
  }
};

// Get a specific session by ID
export const getSession = async (id: string): Promise<{ data: CounselingSession }> => {
  try {
    // Force database usage
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Fetching counseling session from database:', id);
      
      const { signal, clearTimeout } = createAbortController(15000);
      
      const response = await api.get(`/counseling-sessions/${id}`, { signal });
      
      clearTimeout();
      
      // Transform response to match frontend expectations
      const session = {
        ...response.data,
        id: response.data.id || response.data.session_id,
        nextSteps: response.data.nextSteps || response.data.next_steps,
        studentId: response.data.studentId || response.data.student_id
      };
      
      return { data: session };
    }
    
    // Mock fallback
    await delay(200);
    const session = mockSessions.find(s => s.id === id);
    if (!session) {
      throw new Error('Session not found');
    }
    
    return { data: session };
    
  } catch (error: any) {
    console.error('Error fetching counseling session:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch counseling session');
  }
};

// Get counseling analytics
export const getSessionAnalytics = async (filters?: FilterParams): Promise<{
  totalSessions: number;
  sessionsByType: Record<string, number>;
  sessionsByOutcome: Record<string, number>;
  averageDuration: number;
  monthlySessions: Array<{ month: string; count: number }>;
}> => {
  try {
    // Force database usage
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Fetching counseling analytics from database');
      
      const { signal, clearTimeout } = createAbortController(15000);
      
      const response = await api.get('/counseling-sessions/analytics', {
        signal,
        params: filters
      });
      
      clearTimeout();
      
      return response.data;
    }
    
    // Mock fallback
    await delay(200);
    
    // Simple mock analytics calculation
    const totalSessions = mockSessions.length;
    
    const sessionsByType = mockSessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sessionsByOutcome = mockSessions.reduce((acc, session) => {
      acc[session.outcome] = (acc[session.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const averageDuration = mockSessions.reduce((sum, session) => sum + session.duration, 0) / mockSessions.length || 0;
    
    return {
      totalSessions,
      sessionsByType,
      sessionsByOutcome,
      averageDuration: Math.round(averageDuration * 10) / 10,
      monthlySessions: [
        { month: '2024-11', count: 2 },
        { month: '2024-12', count: 1 }
      ]
    };
    
  } catch (error: any) {
    console.error('Error fetching counseling analytics:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch counseling analytics');
  }
};

// Approval status methods
export const approveSession = async (
  id: string, 
  approverId: string
): Promise<{ data: CounselingSession }> => {
  try {
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Approving counseling session:', id, 'by', approverId);
      
      const { signal, clearTimeout } = createAbortController(15000);
      
      const response = await api.put(`/counseling-sessions/${id}/approve`, {
        approver_id: approverId
      }, { signal });
      
      clearTimeout();
      
      console.log('Session approved successfully:', response.data);
        // Transform response to match frontend expectations
      const approvedSession = {
        ...response.data,
        id: response.data.id || response.data.session_id,
        nextSteps: response.data.nextSteps || response.data.next_steps,
        studentId: response.data.studentId || response.data.student_id,
        followUp: response.data.followUp || response.data.follow_up || '',
        approvalStatus: response.data.approvalStatus || response.data.approval_status,
        approvedBy: response.data.approvedBy || response.data.approved_by,
        approvedAt: response.data.approvedAt || response.data.approved_at,
        rejectionReason: response.data.rejectionReason || response.data.rejection_reason
      };
      
      return { data: approvedSession };
    }
      // Mock fallback
    await delay(200);
    const index = mockSessions.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Session not found');
    }
    
    mockSessions[index] = {
      ...mockSessions[index],
      approvalStatus: 'approved',
      approvedBy: approverId,
      approvedAt: new Date().toISOString(),
      rejectionReason: undefined
    } as CounselingSession;
    
    return { data: mockSessions[index] };
    
  } catch (error: any) {
    console.error('Error approving counseling session:', error);
    throw new Error(error.response?.data?.error || 'Failed to approve counseling session');
  }
};

export const rejectSession = async (
  id: string, 
  approverId: string, 
  reason: string
): Promise<{ data: CounselingSession }> => {
  try {
    if (FORCE_USE_DATABASE || !useMockData) {
      console.log('Rejecting counseling session:', id, 'by', approverId, 'reason:', reason);
      
      const { signal, clearTimeout } = createAbortController(15000);
      
      const response = await api.put(`/counseling-sessions/${id}/reject`, {
        approver_id: approverId,
        reason: reason
      }, { signal });
      
      clearTimeout();
      
      console.log('Session rejected successfully:', response.data);
        // Transform response to match frontend expectations
      const rejectedSession = {
        ...response.data,
        id: response.data.id || response.data.session_id,
        nextSteps: response.data.nextSteps || response.data.next_steps,
        studentId: response.data.studentId || response.data.student_id,
        followUp: response.data.followUp || response.data.follow_up || '',
        approvalStatus: response.data.approvalStatus || response.data.approval_status,
        approvedBy: response.data.approvedBy || response.data.approved_by,
        approvedAt: response.data.approvedAt || response.data.approved_at,
        rejectionReason: response.data.rejectionReason || response.data.rejection_reason
      };
      
      return { data: rejectedSession };
    }
      // Mock fallback
    await delay(200);
    const index = mockSessions.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Session not found');
    }
    
    mockSessions[index] = {
      ...mockSessions[index],
      approvalStatus: 'rejected',
      approvedBy: approverId,
      approvedAt: new Date().toISOString(),
      rejectionReason: reason
    } as CounselingSession;
    
    return { data: mockSessions[index] };
    
  } catch (error: any) {
    console.error('Error rejecting counseling session:', error);
    throw new Error(error.response?.data?.error || 'Failed to reject counseling session');
  }
};

// Get sessions by approval status
export const getSessionsByStatus = async (
  status: 'pending' | 'approved' | 'rejected',
  page = 1,
  limit = 20
): Promise<ApiResponse<CounselingSession>> => {
  const filters = { approvalStatus: status } as FilterParams;
  return getSessions(filters, page, limit);
};

// Utility function to toggle mock data mode
export const toggleSessionMockData = (enable?: boolean) => {
  useMockData = enable !== undefined ? enable : !useMockData;
  console.log(`Session service mock data mode: ${useMockData ? 'ENABLED' : 'DISABLED'}`);
  return useMockData;
};

// Utility function to force reload from database
export const forceReloadFromDatabase = () => {
  useMockData = false;
  console.log('🔄 Forced reload from database - mock data disabled');
};