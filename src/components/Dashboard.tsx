import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  Calendar, 
  Brain, 
  TrendingUp, 
  Bell, 
  CheckCircle2,
  Clock, 
  AlertCircle,
  ArrowRight,
  User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getStudents } from '../services/studentService';
import { getClasses } from '../services/classService';
import { cn } from '../utils/cn';

interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  upcomingSessions: number;
  pendingAssessments: number;
  studentsAtRisk: number;
  recentActivity: {
    id: string;
    type: 'student' | 'assessment' | 'class' | 'session' | 'notification';
    title: string;
    description: string;
    time: string;
    status?: 'good' | 'warning' | 'critical';
  }[];
}

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, isAdmin, isCounselor, isStudent } = useUser();
  const { notifications } = useNotifications();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalClasses: 0,
    upcomingSessions: 0,
    pendingAssessments: 0,
    studentsAtRisk: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Different data loading based on role
        if (isAdmin || isCounselor) {
          // Admin and counselor can see students and classes data
          const studentsResponse = await getStudents();
          const classesResponse = await getClasses();
          
          // Calculate students at risk (with warning or critical status)
          const studentsAtRisk = studentsResponse?.data?.filter(
            student => student.academicStatus === 'warning' || student.academicStatus === 'critical'
          ).length || 0;
          
          // Generate dummy data for other stats
          const upcomingSessions = Math.floor(Math.random() * 5) + 1;
          const pendingAssessments = Math.floor(Math.random() * 3);
          
          // Set stats based on role
          setStats({
            totalStudents: studentsResponse?.data?.length || 0,
            totalClasses: classesResponse?.data?.length || 0,
            upcomingSessions,
            pendingAssessments,
            studentsAtRisk,
            recentActivity: generateRecentActivity()
          });
        } else {
          // Student dashboard with personal stats
          setStats({
            totalStudents: 0,
            totalClasses: 0,
            upcomingSessions: Math.floor(Math.random() * 2) + 1,  // Fewer sessions for students
            pendingAssessments: Math.floor(Math.random() * 2),    // Fewer assessments for students
            studentsAtRisk: 0,
            recentActivity: generateStudentActivity()
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [notifications, isAdmin, isCounselor, isStudent]);
  
  // Generate role-specific activity feeds
  const generateRecentActivity = () => {
    // Add notifications to recent activity
    const notificationActivities = notifications.slice(0, 2).map((notification) => ({
      id: `n-${notification.id}`,
      type: 'notification' as const,
      title: notification.title,
      description: notification.message,
      time: notification.date,
      status: notification.type === 'error' ? 'critical' as const : 
              notification.type === 'warning' ? 'warning' as const : 
              'good' as const
    }));
    
    // Generate role-specific activities
    const roleSpecificActivities = isAdmin ? [
      {
        id: '1',
        type: 'session' as const,
        title: 'New Counseling Session',
        description: 'Session scheduled between Dr. Sarah and Budi Santoso',
        time: '2 hours ago',
        status: 'good' as const
      },
      {
        id: '2',
        type: 'student' as const,
        title: 'Student Registration',
        description: '3 new students registered this week',
        time: '1 day ago'
      },
      {
        id: '3',
        type: 'class' as const,
        title: 'Class Update',
        description: 'Grade report updated for XII IPA-2',
        time: '2 days ago',
        status: 'good' as const
      }
    ] : isCounselor ? [
      {
        id: '1',
        type: 'session' as const,
        title: 'Upcoming Session',
        description: 'You have a scheduled session with Budi Santoso',
        time: '2 hours ago',
        status: 'good' as const
      },
      {
        id: '2',
        type: 'assessment' as const,
        title: 'Assessment Results',
        description: 'New PHQ-9 results for Siti Aminah',
        time: '4 hours ago',
        status: 'warning' as const
      },
      {
        id: '3',
        type: 'student' as const,
        title: 'Student Alert',
        description: 'Ahmad Hidayat needs attention (risk level: high)',
        time: '1 day ago',
        status: 'critical' as const
      }
    ] : [];
    
    return [...notificationActivities, ...roleSpecificActivities];
  };
  
  // Generate student-specific activity
  const generateStudentActivity = () => {
    const notificationActivities = notifications.slice(0, 2).map((notification) => ({
      id: `n-${notification.id}`,
      type: 'notification' as const,
      title: notification.title,
      description: notification.message,
      time: notification.date,
      status: notification.type === 'error' ? 'critical' as const : 
              notification.type === 'warning' ? 'warning' as const : 
              'good' as const
    }));
    
    return [
      ...notificationActivities,
      {
        id: '1',
        type: 'session' as const,
        title: 'Counseling Session',
        description: 'Your next session is on Friday at 10:00 AM',
        time: '1 day ago',
        status: 'good' as const
      },
      {
        id: '2',
        type: 'assessment' as const,
        title: 'Assessment Due',
        description: 'Complete your monthly mental health assessment',
        time: '2 days ago',
        status: 'warning' as const
      }
    ];
  };

  // Get status icon
  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'good': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'session': return <Calendar className="h-4 w-4 text-indigo-500" />;
      case 'assessment': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'student': return <User className="h-4 w-4 text-blue-500" />;
      case 'class': return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'notification': return <Bell className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Render loading skeleton
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded-lg w-1/4 mb-8"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Render student dashboard
  if (isStudent) {
    return (
      <div className="space-y-8">
        {/* Student header with welcome message */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-8 py-6 shadow-lg text-white">
          <h1 className="text-2xl font-bold">{t('dashboard.welcomeMessage', `Hello, ${user?.name?.split(' ')[0]}!`)}</h1>
          <p className="mt-2 text-blue-100 max-w-3xl">
            {t('dashboard.studentSubtitle', 'Track your progress and upcoming sessions')}
          </p>
        </div>
        
        {/* Student-specific stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-blue-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500">{t('dashboard.upcomingSessions')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sessions')}
              className="w-full mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center justify-end"
            >
              {t('dashboard.viewSchedule')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-purple-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500">{t('dashboard.pendingAssessments')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAssessments}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/mental-health')}
              className="w-full mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center justify-end"
            >
              {t('dashboard.takeAssessment')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-green-200 col-span-1 sm:col-span-2">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500">{t('dashboard.progressTracking')}</p>
                <p className="text-lg font-medium text-gray-700 mt-1">
                  {t('dashboard.viewProgress')}
                </p>
              </div>
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
              <div className="h-2 rounded-full bg-green-500" style={{ width: '75%' }}></div>
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full mt-3 text-xs text-green-600 hover:text-green-800 flex items-center justify-end"
            >
              {t('dashboard.viewDetails')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
        </div>
        
        {/* Student dashboard sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent activity for student */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('dashboard.recentActivity')}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {stats.recentActivity.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">{t('dashboard.noRecentActivity')}</p>
                </div>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          {activity.status && (
                            <span className="ml-2">{getStatusIcon(activity.status)}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Career insights for student */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('dashboard.careerInsights')}
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Top career matches</p>
                  <p className="text-gray-500 text-sm">Based on your personality and skills</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900">Software Developer</p>
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">95% Match</span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900">Data Scientist</p>
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">90% Match</span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900">UX Designer</p>
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">85% Match</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/career')}
                className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg flex items-center justify-center hover:from-teal-600 hover:to-emerald-600 transition-colors"
              >
                {t('dashboard.exploreCareerOptions')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin/Counselor dashboard
  return (
    <div className="space-y-8">
      {/* Admin/Counselor header with welcome message */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-8 py-6 shadow-lg text-white">
        <h1 className="text-2xl font-bold">{t('dashboard.welcomeMessage', `Welcome back, ${user?.name?.split(' ')[0]}!`)}</h1>
        <p className="mt-2 text-indigo-100 max-w-3xl">
          {isAdmin 
            ? t('dashboard.adminSubtitle', 'Monitor school performance and counseling activities')
            : t('dashboard.counselorSubtitle', 'Track your students and upcoming sessions')}
        </p>
      </div>
      
      {/* Admin/Counselor stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Show student stats for both admin and counselor */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-indigo-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-gray-500">{t('dashboard.totalStudents')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/students')}
            className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-end"
          >
            {t('dashboard.viewAll')}
            <ArrowRight className="ml-1 h-3 w-3" />
          </button>
        </div>
        
        {/* Show classes only for admin */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-indigo-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500">{t('dashboard.totalClasses')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/classes')}
              className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-end"
            >
              {t('dashboard.viewAll')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
        )}
        
        {/* Show different card for counselor in this slot */}
        {isCounselor && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-indigo-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Brain className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500">{t('dashboard.pendingAssessments')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAssessments}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/mental-health')}
              className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-end"
            >
              {t('dashboard.viewAll')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-indigo-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-gray-500">{t('dashboard.upcomingSessions')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/sessions')}
            className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-end"
          >
            {t('dashboard.viewAll')}
            <ArrowRight className="ml-1 h-3 w-3" />
          </button>
        </div>
        
        {/* Shows for both admin and counselor */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-indigo-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs font-medium text-gray-500">{t('dashboard.studentsAtRisk')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.studentsAtRisk}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/students')}
            className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-end"
          >
            {t('dashboard.viewAll')}
            <ArrowRight className="ml-1 h-3 w-3" />
          </button>
        </div>
        
        {/* Admin-specific insights */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-indigo-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500">{t('dashboard.trendsAndInsights')}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {t('dashboard.viewAdminInsights')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/behavior')}
              className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-end"
            >
              {t('dashboard.viewAll')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
        )}
        
        {/* Counselor-specific action card */}
        {isCounselor && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-indigo-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-500">{t('dashboard.scheduleManagement')}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {t('dashboard.manageYourSessions')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sessions')}
              className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center justify-end"
            >
              {t('dashboard.viewSchedule')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      
      {/* Additional dashboard sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.recentActivity')}
            </h2>
          </div>
          
          {/* Activity content remains the same */}
          <div className="divide-y divide-gray-200">
            {stats.recentActivity.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">{t('dashboard.noRecentActivity')}</p>
              </div>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        {activity.status && (
                          <span className="ml-2">{getStatusIcon(activity.status)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="bg-gray-50 px-6 py-3">
            <button 
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              {t('dashboard.viewAllActivity')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </button>
          </div>
        </div>
        
        {/* Different quick actions for admin vs counselor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('dashboard.quickActions')}
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isAdmin ? (
              <>
                <button 
                  onClick={() => navigate('/students')}
                  className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-indigo-600 mr-3" />
                    <span className="text-sm font-medium text-indigo-800">
                      {t('dashboard.manageStudents')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-indigo-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/user-management')}
                  className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-purple-800">
                      {t('dashboard.manageUsers')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/classes')}
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-800">
                      {t('dashboard.manageClasses')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/settings')}
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-blue-800">
                      {t('dashboard.systemSettings')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/students')}
                  className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-indigo-600 mr-3" />
                    <span className="text-sm font-medium text-indigo-800">
                      {t('dashboard.viewStudents')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-indigo-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/sessions')}
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-blue-800">
                      {t('dashboard.scheduleSession')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/mental-health')}
                  className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-purple-800">
                      {t('dashboard.assessStudents')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                </button>
                
                <button 
                  onClick={() => navigate('/behavior')}
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-800">
                      {t('dashboard.trackBehavior')}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
