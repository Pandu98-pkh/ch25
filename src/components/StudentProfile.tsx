import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Student, CounselingSession } from '../types';
import { format } from 'date-fns';
import { Calendar, Brain, GraduationCap, FileText } from 'lucide-react';

// This would come from an API in a real app
const mockStudent: Student = {
  id: '1',
  name: 'Student User',
  email: 'student@example.com',
  tingkat: 'XI',
  kelas: 'IPA-1',
  academicStatus: 'good',
  avatar: '/assets/avatars/avatar-1.png',
  grade: 'XI',
  class: 'IPA-1',
  photo: '/assets/avatars/avatar-1.png',
  mentalHealthScore: 85,
  lastCounseling: '2025-04-15'
};

// Mock sessions
const mockSessions: CounselingSession[] = [
  {
    id: '1',
    studentId: '1',
    date: '2025-04-15T10:00:00.000Z',
    duration: 60,
    notes: 'Discussed academic progress and future career options.',
    type: 'academic',
    outcome: 'positive',
    counselor: {
      id: '2',
      name: 'Dr. Jane Smith'
    }
  },
  {
    id: '2',
    studentId: '1',
    date: '2025-04-30T14:00:00.000Z',
    duration: 45,
    notes: 'Follow-up on career interests.',
    type: 'career',
    outcome: 'neutral',
    counselor: {
      id: '2',
      name: 'Dr. Jane Smith'
    }
  }
];

export default function StudentProfile() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch the student data based on the user ID
    // For now we'll just use mock data
    if (user) {
      // In a real implementation, we would use the user's ID to fetch their data
      // Example: fetchStudentData(user.id);
      setStudent({
        ...mockStudent,
        name: user.name || mockStudent.name,
        email: user.email || mockStudent.email
      });
    } else {
      setStudent(mockStudent);
    }
    setSessions(mockSessions);
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
        {t('errors.studentNotFound')}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="h-24 w-24 rounded-full" />
                ) : (
                  <div className="text-3xl font-bold text-brand-600">
                    {student.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{student.name}</h2>
              <div className="mt-1 text-sm text-gray-500">{student.email}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {t('student.grade')}: {student.tingkat}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {t('student.class')}: {student.kelas}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${student.academicStatus === 'good' ? 'bg-green-100 text-green-800' : 
                  student.academicStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}`}>
                  {t(`student.status.${student.academicStatus}`)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('profile.nextSession')}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {sessions.length > 0 
                  ? format(new Date(sessions[sessions.length - 1].date), 'PPP')
                  : t('profile.noUpcomingSessions')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('profile.mentalHealth')}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {student.mentalHealthScore ? `${student.mentalHealthScore}/100` : t('profile.notAssessed')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('profile.careerInterests')}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {t('profile.viewCareerPage')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('profile.upcomingSessions')}
          </h3>
          
          {sessions.length === 0 ? (
            <p className="text-gray-500">{t('profile.noScheduledSessions')}</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <div key={session.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(session.date), 'PPP')} at {format(new Date(session.date), 'p')}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {t(`sessionTypes.${session.type}`)} • {session.duration} min • {session.counselor?.name}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${session.type === 'academic' ? 'bg-blue-100 text-blue-800' : 
                      session.type === 'career' ? 'bg-green-100 text-green-800' : 
                      session.type === 'mental-health' ? 'bg-purple-100 text-purple-800' : 
                      session.type === 'behavioral' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-pink-100 text-pink-800'}`}>
                      {t(`sessionTypes.${session.type}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('profile.recentReports')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-brand-500 transition-colors">
              <div className="flex items-start">
                <div className="p-2 bg-brand-50 rounded-lg">
                  <FileText className="h-5 w-5 text-brand-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">{t('profile.academicProgress')}</h4>
                  <p className="mt-1 text-sm text-gray-500">{t('profile.lastUpdated')}: {format(new Date(), 'PPP')}</p>
                  <button className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700">
                    {t('profile.viewReport')}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-brand-500 transition-colors">
              <div className="flex items-start">
                <div className="p-2 bg-brand-50 rounded-lg">
                  <FileText className="h-5 w-5 text-brand-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">{t('profile.careerAssessment')}</h4>
                  <p className="mt-1 text-sm text-gray-500">{t('profile.lastUpdated')}: {format(new Date(), 'PPP')}</p>
                  <button className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700">
                    {t('profile.viewReport')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}