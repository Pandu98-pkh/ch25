import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { User as UserIcon, Edit, ArrowLeft, Briefcase, BookOpen, Calendar, Clock, Users, Award, Star, Activity, BarChart4 } from 'lucide-react';
import { cn } from '../utils/cn';
import { Student, CounselingSession, User } from '../types';
import { format } from 'date-fns';
import ProfileEditor from './ProfileEditor';
import { getUserStatistics } from '../services/userService';

// Mock data for the student section
const mockStudent: Student = {
  id: '1',
  studentId: 'S12345', // Added NIS
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

// Add an extended user type that includes student-specific fields
interface ExtendedUserData extends Partial<User> {
  tingkat?: string;
  kelas?: string;
}

export default function ProfilePage() {
  const { user, isAdmin, isCounselor, isStudent, updateCurrentUser } = useUser();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'reports'>('overview');  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalCounselors: 0,
    totalStudents: 0,
    totalAdmins: 0
  });  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Function to fetch user statistics
  const fetchUserStatistics = async () => {
    if (!isAdmin) return;
    
    setStatsLoading(true);
    setStatsError(null);
    try {
      const stats = await getUserStatistics();
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      setStatsError('Failed to load user statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);      try {
        // Fetch user statistics if user is admin
        if (isAdmin) {
          await fetchUserStatistics();
        }

        // Only fetch student data if the user is a student
        if (isStudent && user) {
          // In a real app, this would fetch the student data based on the user ID
          setStudent({
            ...mockStudent,
            name: user.name || mockStudent.name,
            email: user.email || mockStudent.email
          });
          setSessions(mockSessions);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isStudent, isAdmin]);

  const handleUpdateProfile = async (updatedUserData: Partial<User>) => {
    try {
      if (user && updateCurrentUser) {
        // Update user in context/backend
        await updateCurrentUser(updatedUserData);

        // If student, also update student details
        if (isStudent && student) {
          // Cast to ExtendedUserData to access student-specific fields
          const extendedData = updatedUserData as ExtendedUserData;
          setStudent({
            ...student,
            name: updatedUserData.name || student.name,
            email: updatedUserData.email || student.email,
            tingkat: extendedData.tingkat || student.tingkat,
            kelas: extendedData.kelas || student.kelas
          });
        }

        // Exit edit mode
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">{t('profile.notLoggedIn')}</p>
      </div>
    );
  }

  const ProfileHeader = () => (
    <div className="relative mb-2 overflow-hidden rounded-t-2xl shadow-lg">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
      <div className="absolute inset-0 bg-pattern opacity-10" style={{ backgroundImage: 'url("/assets/patterns/grid.svg")' }}></div>
      
      <div className="relative pt-12 pb-8 px-6 md:px-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile Photo with elegant border */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                  <UserIcon className="h-16 w-16 text-indigo-500" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center",
                isAdmin ? "bg-purple-500" : 
                isCounselor ? "bg-blue-500" : 
                "bg-green-500"
              )}>
                {isAdmin && <Star className="h-3.5 w-3.5 text-white" />}
                {isCounselor && <Award className="h-3.5 w-3.5 text-white" />}
                {isStudent && <BookOpen className="h-3.5 w-3.5 text-white" />}
              </div>
            </div>
          </div>
          
          {/* User Info - with enhanced styling */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-indigo-100 text-sm mb-3">{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm",
                isAdmin ? "bg-white/20 text-white border border-white/30" :
                isCounselor ? "bg-white/20 text-white border border-white/30" :
                "bg-white/20 text-white border border-white/30"
              )}>
                {t(`roles.${user.role}`)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                <Clock className="h-3 w-3 mr-1" />
                {isAdmin ? "2023-05-24" : isStudent ? "Since 2022" : "5 years exp."}
              </span>
            </div>
          </div>
          
          {/* Action button - styled */}
          <button 
            onClick={() => setEditing(!editing)}
            className="absolute top-4 right-4 inline-flex items-center px-3 py-2 shadow-lg text-sm font-medium rounded-lg 
              transition-all duration-200 ease-in-out
              border border-white/20 bg-white/10 text-white hover:bg-white hover:text-indigo-700"
          >
            {editing ? (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('profile.cancel')}
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                {t('profile.edit')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
  const ProfileTabs = () => (
    <div className="bg-white border-t border-gray-100 px-6 py-3 flex space-x-8 overflow-x-auto scrollbar-light mb-8 rounded-b-2xl shadow-lg">
      <button
        type="button"
        onClick={() => setActiveTab('overview')}
        className={cn(
          "font-medium pb-3 px-1 transition-colors focus:outline-none",
          activeTab === 'overview' 
            ? "border-b-2 border-indigo-600 text-indigo-600" 
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        {t('profile.overview')}
      </button>
      <button 
        type="button"
        onClick={() => setActiveTab('activity')}
        className={cn(
          "font-medium pb-3 px-1 transition-colors focus:outline-none",
          activeTab === 'activity' 
            ? "border-b-2 border-indigo-600 text-indigo-600" 
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        {t('profile.activity')}
      </button>
      <button 
        type="button"
        onClick={() => setActiveTab('reports')}
        className={cn(
          "font-medium pb-3 px-1 transition-colors focus:outline-none",
          activeTab === 'reports' 
            ? "border-b-2 border-indigo-600 text-indigo-600" 
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        {t('profile.reports')}
      </button>
    </div>
  );

  const ActivityContent = () => (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
      <div className="flex items-center mb-6">
        <Activity className="h-5 w-5 text-indigo-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">{t('profile.recentActivity')}</h3>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1"></div>
              <div className="w-0.5 h-full bg-gray-200"></div>
            </div>
            <div className="pb-6">
              <p className="text-sm font-medium text-gray-900">
                {isAdmin ? 'Updated system settings' : 
                 isCounselor ? 'Completed counseling session' : 
                 'Attended counseling session'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(Date.now() - item * 86400000).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
          {t('profile.viewAllActivity')}
        </button>
      </div>
    </div>
  );
  
  const ReportsContent = () => (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
      <div className="flex items-center mb-6">
        <BarChart4 className="h-5 w-5 text-indigo-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">{t('profile.reports')}</h3>
      </div>
      
      {isAdmin && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <h4 className="font-medium text-gray-900">System Usage Report</h4>
            <p className="text-sm text-gray-500 mt-1">Monthly overview of user activity and system performance.</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <h4 className="font-medium text-gray-900">User Growth Report</h4>
            <p className="text-sm text-gray-500 mt-1">Analysis of new user registrations and retention rates.</p>
          </div>
        </div>
      )}
      
      {isCounselor && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <h4 className="font-medium text-gray-900">Session Outcomes Report</h4>
            <p className="text-sm text-gray-500 mt-1">Analysis of counseling session effectiveness.</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <h4 className="font-medium text-gray-900">Student Progress Report</h4>
            <p className="text-sm text-gray-500 mt-1">Track improvements in student wellbeing over time.</p>
          </div>
        </div>
      )}
      
      {isStudent && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <h4 className="font-medium text-gray-900">Academic Progress Report</h4>
            <p className="text-sm text-gray-500 mt-1">Summary of your academic standing and performance.</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <h4 className="font-medium text-gray-900">Counseling Summary Report</h4>
            <p className="text-sm text-gray-500 mt-1">Overview of your counseling journey and milestones.</p>
          </div>
        </div>
      )}
    </div>
  );

  const AdminProfile = () => (
    <>
      {editing ? (
        <ProfileEditor user={user} onUpdate={handleUpdateProfile} />
      ) : (
        <>
          <ProfileHeader />
          <ProfileTabs />
          
          {activeTab === 'overview' && (
            <>              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">                {statsLoading ? (
                  // Loading skeleton for statistics cards
                  <>
                    <div className="bg-gradient-to-br from-indigo-50 to-white shadow-md rounded-xl p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center">
                          <div className="rounded-full bg-gray-200 p-3 mr-4">
                            <div className="h-8 w-8 bg-gray-300 rounded"></div>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                            <div className="flex items-end">
                              <div className="h-8 bg-gray-300 rounded w-16"></div>
                              <div className="ml-2 h-5 bg-gray-200 rounded w-12"></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-white shadow-md rounded-xl p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center">
                          <div className="rounded-full bg-gray-200 p-3 mr-4">
                            <div className="h-8 w-8 bg-gray-300 rounded"></div>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                            <div className="flex items-end">
                              <div className="h-8 bg-gray-300 rounded w-16"></div>
                              <div className="ml-2 h-5 bg-gray-200 rounded w-12"></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-white shadow-md rounded-xl p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center">
                          <div className="rounded-full bg-gray-200 p-3 mr-4">
                            <div className="h-8 w-8 bg-gray-300 rounded"></div>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                            <div className="flex items-end">
                              <div className="h-8 bg-gray-300 rounded w-16"></div>
                              <div className="ml-2 h-5 bg-gray-200 rounded w-12"></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </>
                ) : statsError ? (
                  // Error state for statistics cards
                  <>
                    <div className="bg-red-50 border border-red-200 shadow-md rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="rounded-full bg-red-100 p-3 mr-4">
                          <Users className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t('profile.totalUsers')}</p>
                          <div className="flex items-end">
                            <h3 className="text-lg font-medium text-red-700">Error</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 shadow-md rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="rounded-full bg-red-100 p-3 mr-4">
                          <Briefcase className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t('profile.counselors')}</p>
                          <div className="flex items-end">
                            <h3 className="text-lg font-medium text-red-700">Error</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 shadow-md rounded-xl p-6">
                      <div className="flex items-center">
                        <div className="rounded-full bg-red-100 p-3 mr-4">
                          <BookOpen className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t('profile.students')}</p>
                          <div className="flex items-end">
                            <h3 className="text-lg font-medium text-red-700">Error</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Normal statistics cards with data
                  <>
                    <div className="bg-gradient-to-br from-indigo-50 to-white shadow-md rounded-xl p-6 transform transition-all hover:scale-105 hover:shadow-lg">
                      <div className="flex items-center">
                        <div className="rounded-full bg-indigo-100 p-3 mr-4">
                          <Users className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t('profile.totalUsers')}</p>
                          <div className="flex items-end">
                            <h3 className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</h3>
                            <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">Active</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-white shadow-md rounded-xl p-6 transform transition-all hover:scale-105 hover:shadow-lg">
                      <div className="flex items-center">
                        <div className="rounded-full bg-green-100 p-3 mr-4">
                          <Briefcase className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t('profile.counselors')}</p>
                          <div className="flex items-end">
                            <h3 className="text-3xl font-bold text-gray-900">{userStats.totalCounselors}</h3>
                            <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Active</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{width: '40%'}}></div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-white shadow-md rounded-xl p-6 transform transition-all hover:scale-105 hover:shadow-lg">
                      <div className="flex items-center">
                        <div className="rounded-full bg-blue-100 p-3 mr-4">
                          <BookOpen className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t('profile.students')}</p>
                          <div className="flex items-end">
                            <h3 className="text-3xl font-bold text-gray-900">{userStats.totalStudents}</h3>
                            <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">Enrolled</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{width: '75%'}}></div>
                      </div>                    </div>
                  </>
                )}
              </div>
                {/* Error message for statistics loading */}
              {statsError && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 text-red-400">
                        ⚠️
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        {t('profile.statisticsError', 'Unable to load user statistics')}
                      </h3>
                      <p className="mt-1 text-sm text-red-700">
                        {statsError}. {t('profile.statisticsErrorHelp', 'Please refresh the page or contact support if the issue persists.')}
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={fetchUserStatistics}
                          disabled={statsLoading}
                          className={cn(
                            "inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors",
                            statsLoading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {statsLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-700" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              {t('profile.retrying', 'Retrying...')}
                            </>
                          ) : (
                            <>
                              <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {t('profile.retry', 'Retry')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">{t('profile.adminDetails')}</h3>
                </div>
                <div className="px-6 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-indigo-900 mb-1">{t('profile.systemAccess')}</h4>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <p className="text-sm text-gray-900">Full Access</p>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-indigo-900 mb-1">{t('profile.lastLogin')}</h4>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-indigo-600 mr-2" />
                        <p className="text-sm text-gray-900">2023-05-24 08:45 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Recent System Activity</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <BarChart4 className="h-16 w-16 text-gray-300" />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'activity' && <ActivityContent />}
          {activeTab === 'reports' && <ReportsContent />}
        </>
      )}
    </>
  );

  const CounselorProfile = () => (
    <>
      {editing ? (
        <ProfileEditor user={user} onUpdate={handleUpdateProfile} />
      ) : (
        <>
          <ProfileHeader />
          <ProfileTabs />
          
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow-md rounded-xl p-6 transform transition-all hover:scale-105 hover:shadow-lg border-t-4 border-indigo-500">
                  <div className="flex items-center">
                    <div className="rounded-full bg-indigo-100 p-3 mr-4">
                      <Users className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t('profile.assignedStudents')}</p>
                      <h3 className="text-3xl font-bold text-gray-900">28</h3>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Active management</span>
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6 transform transition-all hover:scale-105 hover:shadow-lg border-t-4 border-green-500">
                  <div className="flex items-center">
                    <div className="rounded-full bg-green-100 p-3 mr-4">
                      <Calendar className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t('profile.upcomingSessions')}</p>
                      <h3 className="text-3xl font-bold text-gray-900">12</h3>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Next: Tomorrow 10:00 AM</span>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">View Schedule</span>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6 transform transition-all hover:scale-105 hover:shadow-lg border-t-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-3 mr-4">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{t('profile.completedSessions')}</p>
                      <h3 className="text-3xl font-bold text-gray-900">124</h3>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Avg. 12 sessions/week</span>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-xs font-medium text-blue-600">98% success rate</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Award className="h-5 w-5 text-indigo-600 mr-2" />
                    {t('profile.counselorDetails')}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">{t('profile.specialization')}</h4>
                      <p className="text-base font-medium text-gray-900">Career Guidance</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">{t('profile.certification')}</h4>
                      <p className="text-base font-medium text-gray-900">Certified School Counselor</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">{t('profile.experience')}</h4>
                      <p className="text-base font-medium text-gray-900">5 years</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">{t('profile.availability')}</h4>
                      <p className="text-base font-medium text-gray-900">Monday - Friday, 8:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Session Statistics</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <Activity className="h-16 w-16 text-gray-300" />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'activity' && <ActivityContent />}
          {activeTab === 'reports' && <ReportsContent />}
        </>
      )}
    </>
  );

  const CombinedStudentProfile = () => {
    if (loading || !student) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      );
    }

    return (
      <>
        {editing ? (
          <ProfileEditor user={user} onUpdate={handleUpdateProfile} />
        ) : (
          <>
            <ProfileHeader />
            <ProfileTabs />
            
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white shadow-lg rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-blue-100 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 rounded-full bg-blue-100 opacity-50"></div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Standing</h3>
                    <div className="flex items-center mt-4">
                      <div className="relative w-16 h-16 mr-4">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent" 
                             style={{ transform: 'rotate(72deg)' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-700">B+</span>
                        </div>
                      </div>
                      <div>
                        <p className={cn(
                          "text-lg font-medium",
                          student.academicStatus === 'good' ? "text-green-600" : 
                          student.academicStatus === 'warning' ? "text-yellow-600" : 
                          "text-red-600"
                        )}>
                          {t(`student.status.${student.academicStatus}`)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Grade: {student.tingkat}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-lg rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-purple-100 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 rounded-full bg-purple-100 opacity-50"></div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Counseling Progress</h3>
                    <div className="flex items-center mt-4">
                      <div className="relative w-16 h-16 mr-4">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent border-r-transparent" 
                             style={{ transform: 'rotate(180deg)' }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-700">50%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-purple-600">
                          On Track
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {student.lastCounseling ? format(new Date(student.lastCounseling), 'PPP') : t('profile.never')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-lg rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-green-100 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 rounded-full bg-green-100 opacity-50"></div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mental Health</h3>
                    <div className="flex items-center mt-4">
                      <div className="relative w-16 h-16 mr-4">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent border-r-transparent border-b-transparent" 
                             style={{ transform: `rotate(${(student?.mentalHealthScore ?? 0) * 3.6}deg)` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-700">{student.mentalHealthScore}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-green-600">
                          Good
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Class: {student.kelas}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
                  <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center px-6">
                    <h3 className="text-lg font-medium text-white">{t('profile.studentDetails')}</h3>
                  </div>
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">{t('profile.grade')}</h4>
                        <p className="mt-1 text-sm text-gray-900">{student.tingkat}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">{t('profile.class')}</h4>
                        <p className="mt-1 text-sm text-gray-900">{student.kelas}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">{t('profile.academicStatus')}</h4>
                        <p className={cn(
                          "mt-1 text-sm font-medium",
                          student.academicStatus === 'good' ? "text-green-600" : 
                          student.academicStatus === 'warning' ? "text-yellow-600" : 
                          "text-red-600"
                        )}>
                          {t(`student.status.${student.academicStatus}`)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">{t('profile.lastCounseling')}</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {student.lastCounseling ? format(new Date(student.lastCounseling), 'PPP') : t('profile.never')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('profile.upcomingSessions')}
                    </h3>
                    <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {sessions.length} sessions
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {sessions.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t('profile.noScheduledSessions')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sessions.map((session) => (
                          <div key={session.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 transform transition-all hover:shadow-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {format(new Date(session.date), 'PPP')} at {format(new Date(session.date), 'p')}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {t(`sessionTypes.${session.type}`)} • {session.duration} min • {session.counselor?.name}
                                </p>
                              </div>
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                session.type === 'academic' ? 'bg-blue-100 text-blue-800' : 
                                session.type === 'career' ? 'bg-green-100 text-green-800' : 
                                session.type === 'mental-health' ? 'bg-purple-100 text-purple-800' : 
                                session.type === 'behavioral' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-pink-100 text-pink-800'
                              )}>
                                {t(`sessionTypes.${session.type}`)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'activity' && <ActivityContent />}
            {activeTab === 'reports' && <ReportsContent />}
          </>
        )}
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-indigo-100 opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-purple-100 opacity-20"></div>
        
        {isAdmin && <AdminProfile />}
        {isCounselor && <CounselorProfile />}
        {isStudent && <CombinedStudentProfile />}
      </div>
    </div>
  );
}
