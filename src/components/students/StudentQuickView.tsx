import React, { useState, useEffect } from 'react';
import { User, X, FileText, PhoneCall, Mail, MapPin, School, Book } from 'lucide-react';

interface StudentQuickViewProps {
  studentId: string;
  onClose: () => void;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  grade: string;
  major?: string;
  gpa: number;
  totalSessions: number;
  recentSessions: Array<{
    id: string;
    date: string;
    type: string;
    outcome: string;
  }>;
}

const StudentQuickView: React.FC<StudentQuickViewProps> = ({ studentId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  
  useEffect(() => {
    // Mock API call - in a real app, this would fetch from your backend
    const fetchStudent = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - would be replaced with real API call
        const mockStudent: Student = {
          id: studentId,
          name: ['Alice Johnson', 'Bob Smith', 'Carol Williams'][Number(studentId) - 1] || 'Unknown Student',
          email: `student${studentId}@university.edu`,
          phone: `(555) 123-${4567 + Number(studentId)}`,
          address: '123 Campus Drive, University City',
          grade: ['Sophomore', 'Junior', 'Senior'][Number(studentId) - 1] || 'Freshman',
          major: ['Computer Science', 'Psychology', 'Business'][Number(studentId) - 1],
          gpa: 3.5 + (Number(studentId) - 1) * 0.2,
          totalSessions: 5 + Number(studentId),
          recentSessions: [
            {
              id: 's1',
              date: '2023-10-15',
              type: 'academic',
              outcome: 'positive'
            },
            {
              id: 's2',
              date: '2023-09-22',
              type: 'career',
              outcome: 'neutral'
            }
          ]
        };
        
        setStudent(mockStudent);
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudent();
  }, [studentId]);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <button className="text-gray-400">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <p className="text-red-500">Student not found</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-700">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
              <p className="text-sm text-gray-500">ID: {student.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{student.email}</span>
              </div>
              <div className="flex items-center">
                <PhoneCall className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{student.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{student.address}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Academic Information</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <School className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{student.grade}</span>
              </div>
              {student.major && (
                <div className="flex items-center">
                  <Book className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{student.major}</span>
                </div>
              )}
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">GPA: {student.gpa.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Counseling History</h4>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Total Sessions: {student.totalSessions}</span>
            <a href="#" className="text-brand-600 hover:text-brand-800">View Complete History</a>
          </div>
          
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-4 mb-2">Recent Sessions</h5>
          <div className="space-y-2">
            {student.recentSessions.map(session => (
              <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {session.type === 'academic' ? 'Academic' : 
                     session.type === 'behavioral' ? 'Behavioral' : 
                     session.type === 'mental-health' ? 'Mental Health' : 
                     session.type === 'career' ? 'Career' : 'Social'} Session
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(session.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium
                  ${session.outcome === 'positive' ? 'bg-green-100 text-green-800' : 
                    session.outcome === 'neutral' ? 'bg-gray-100 text-gray-800' : 
                    'bg-red-100 text-red-800'}`
                }>
                  {session.outcome.charAt(0).toUpperCase() + session.outcome.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 flex justify-end">
        <button className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700">
          Schedule New Session
        </button>
      </div>
    </div>
  );
};

export default StudentQuickView;
