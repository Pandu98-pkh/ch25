import React from 'react';
import { useUser } from '../contexts/UserContext';
import { User } from '../types';

const RoleTestPanel: React.FC = () => {
  const { setUser } = useUser();  const createTestUser = (role: 'student' | 'counselor' | 'admin', studentId?: string): User => {
    const baseUser = {
      id: studentId || `test-${role}-${Date.now()}`,
      userId: studentId || `test-${role}-${Date.now()}`,
      username: `test${role}`,
      email: `test${role}@example.com`,
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
    };

    return baseUser;
  };

  const switchToRole = (role: 'student' | 'counselor' | 'admin', studentId?: string) => {
    const testUser = createTestUser(role, studentId);
    setUser(testUser);
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Role Test Panel</h3>      <div className="space-y-2">
        <button
          onClick={() => switchToRole('student', 'test-student-1')}
          className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          Student 1 (2 assessments)
        </button>
        <button
          onClick={() => switchToRole('student', 'test-student-2')}
          className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          Student 2 (2 assessments)
        </button>
        <button
          onClick={() => switchToRole('student', 'test-student-3')}
          className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          Student 3 (2 assessments)
        </button>
        <button
          onClick={() => switchToRole('counselor')}
          className="w-full px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
        >
          Counselor (All data)
        </button>
        <button
          onClick={() => switchToRole('admin')}
          className="w-full px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
        >
          Admin (All data)
        </button>
      </div>
    </div>
  );
};

export default RoleTestPanel;
