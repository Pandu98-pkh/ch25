import { CounselingSession } from '../types';

// Mock data
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
    counselor: {
      id: '2',
      name: 'Prof. Michael Chen'
    }
  }
];

// Simulate API call with delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSessions = async (): Promise<{ data: CounselingSession[] }> => {
  await delay(200); // Shorter delay for better UI experience
  return { data: [...mockSessions] };
};

export const createSession = async (session: Omit<CounselingSession, 'id'>): Promise<{ data: CounselingSession }> => {
  await delay(200);
  
  // Generate a unique ID - in a real app this would come from the server
  const newId = (mockSessions.length + 1).toString();
  
  const newSession: CounselingSession = {
    ...session,
    id: newId
  };
  
  mockSessions.push(newSession);
  
  return { data: newSession };
};

export const updateSession = async (id: string, session: Omit<CounselingSession, 'id'>): Promise<{ data: CounselingSession }> => {
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
};

export const deleteSession = async (id: string): Promise<{ success: boolean }> => {
  await delay(200);
  
  const index = mockSessions.findIndex(s => s.id === id);
  if (index !== -1) {
    mockSessions = mockSessions.filter(s => s.id !== id);
  }
  
  return { success: true };
};