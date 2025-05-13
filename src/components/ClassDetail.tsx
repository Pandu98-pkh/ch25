import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClass, getClassStudents } from '../services/classService';
import { Class, Student } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  School, 
  ChevronLeft, 
  Users, 
  User, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  RefreshCcw, 
  Download,
  CheckCircle2
} from 'lucide-react';
import { createAbortController } from '../services/api';
import { cn } from '../utils/cn';

// Enhanced grade level colors with gradient backgrounds
const gradeLevelColors: Record<string, {bg: string, text: string, gradient: string, border: string, icon: React.ElementType}> = {
  'X': {
    bg: 'bg-blue-50', 
    text: 'text-blue-700',
    gradient: 'from-blue-500 to-cyan-400',
    border: 'border-blue-200',
    icon: BookOpen
  },
  'XI': {
    bg: 'bg-purple-50', 
    text: 'text-purple-700',
    gradient: 'from-purple-500 to-pink-400',
    border: 'border-purple-200',
    icon: School
  },
  'XII': {
    bg: 'bg-green-50', 
    text: 'text-green-700',
    gradient: 'from-green-500 to-emerald-400',
    border: 'border-green-200',
    icon: GraduationCap
  },
  // Default for other classes
  'default': {
    bg: 'bg-indigo-50', 
    text: 'text-indigo-700',
    gradient: 'from-indigo-500 to-blue-400',
    border: 'border-indigo-200',
    icon: School
  },
};

// Configuration for academic status styling
const statusConfig: Record<string, {
  color: string,
  bgColor: string,
  borderColor: string,
  icon: React.ElementType
}> = {
  good: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle2
  },
  warning: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Clock
  },
  critical: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle
  }
};

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'good' | 'warning' | 'critical'>('all');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Load class data and students
  const loadClassData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { clearTimeout } = createAbortController(15000);
      
      // Fetch class details
      const classResponse = await getClass(id);
      setClassData(classResponse);
      
      // Fetch students in this class
      const studentsResponse = await getClassStudents(id);
      if (studentsResponse && studentsResponse.students) {
        setStudents(studentsResponse.students);
      }
      
      clearTimeout();
    } catch (err) {
      console.error('Error loading class data:', err);
      setError(err instanceof Error ? err.message : t('errors.loadingClass') || 'Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  // Load data on component mount
  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  // Handle retry when loading fails
  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      loadClassData();
    } else {
      setError(t('errors.maxRetriesReached') || 'Batas percobaan telah tercapai');
    }
  };

  // Navigate to student detail page
  const handleStudentClick = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  // Filter students based on search term and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.academicStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get class style based on grade level
  const getClassStyle = () => {
    if (!classData) return gradeLevelColors.default;
    
    const gradePrefix = classData.gradeLevel.split(' ')[0]?.trim().toUpperCase() || '';
    return gradeLevelColors[gradePrefix] || gradeLevelColors.default;
  };

  // Generate download URL for class report
  const getClassReportDownloadUrl = () => {
    return `/api/classes/${id}/report`;
  };

  // Generate loading skeletons
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-40 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Display error state
  if (error || !classData) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md border border-red-100">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium mb-4">{error || t('errors.classNotFound')}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/classes')}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 inline mr-2" />
            {t('actions.backToClasses')}
          </button>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCcw className="h-4 w-4 inline mr-2" />
            {t('actions.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Class style based on grade level
  const classStyle = getClassStyle();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/classes')}
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        {t('classes.backToClasses')}
      </button>
      
      {/* Class header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${classStyle.gradient}`}></div>
        
        <div className="flex items-start md:items-center flex-col md:flex-row md:justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${classStyle.gradient} shadow-sm`}>
              <classStyle.icon className="h-6 w-6 text-white" />
            </div>
            
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classStyle.bg} ${classStyle.text} border ${classStyle.border}`}>
                  {classData.gradeLevel}
                </span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {classData.academicYear}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <a
              href={getClassReportDownloadUrl()}
              download={`${classData.name}-report.pdf`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 transform hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('classes.downloadReport')}
            </a>
          </div>
        </div>
        
        {/* Class teacher info */}
        {classData.teacherName && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">{t('classes.teacher')}</p>
                <p className="text-sm font-medium text-gray-900">{classData.teacherName}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Class stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-indigo-200">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-50 rounded-lg mr-4">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{t('classes.studentCount')}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg mr-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{t('classes.goodStatus')}</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {students.filter(s => s.academicStatus === 'good').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-red-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 rounded-lg mr-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{t('classes.needsAttention')}</p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {students.filter(s => s.academicStatus === 'warning' || s.academicStatus === 'critical').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Students list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('classes.students')}
            </h2>
            
            <div className="flex space-x-2">
              {(['all', 'good', 'warning', 'critical'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                    statusFilter === status
                      ? status === 'all'
                        ? 'bg-indigo-600 text-white' 
                        : status === 'good'
                          ? 'bg-green-600 text-white'
                          : status === 'warning'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {status === 'all' ? t('status.all') : t(`status.${status}`)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder={t('students.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                {searchTerm || statusFilter !== 'all'
                  ? t('students.noResults')
                  : t('students.noStudents')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => {
                const status = student.academicStatus || 'warning';
                const statusCfg = statusConfig[status] || statusConfig.warning;
                
                return (
                  <div 
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      
                      <div className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-medium',
                        statusCfg.bgColor,
                        statusCfg.color
                      )}>
                        {t(`status.${status}`)}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <button 
                        className="text-xs text-indigo-600 flex items-center opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStudentClick(student);
                        }}
                      >
                        {t('actions.viewProfile', 'View Profile')}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
