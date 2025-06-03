import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClass, getClassStudentsDetailed } from '../services/classService';
import { Class, Student } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  School, 
  ChevronLeft, 
  Users, 
  User, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  RefreshCcw, 
  Download,
  CheckCircle2,
  Mail,
  Grid3X3,
  List
} from 'lucide-react';
import { createAbortController } from '../services/api';
import { cn } from '../utils/cn';
import StudentTable from './StudentTable';
import BatchAddStudentForm from './BatchAddStudentForm';

// Student Card Component for Class Detail
function StudentCardComponent({ 
  student, 
  status, 
  statusCfg, 
  avatarPath, 
  onStudentClick, 
  t 
}: {
  student: Student;
  status: string;
  statusCfg: any;
  avatarPath: string;
  onStudentClick: (student: Student) => void;
  t: any;
}) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div 
      onClick={() => onStudentClick(student)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                cursor-pointer overflow-hidden group border border-gray-200 relative transform hover:-translate-y-1"
    >
      {/* Top status indicator bar */}
      <div className={cn(
        "h-1.5 w-full absolute top-0 left-0", 
        statusCfg.bgColor
      )}></div>

      {/* View Profile button */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStudentClick(student);
          }}
          className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          title={t('actions.viewProfile', 'View Profile')}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-5 pt-6">
        <div className="flex items-center space-x-4">
          {/* Student avatar with fallback */}
          {!imageError ? (
            <img
              src={avatarPath}
              alt={student.name}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-indigo-200 transition-all duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-indigo-200 transition-all">
              <User className="h-8 w-8 text-indigo-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200 truncate">
                {student.name}
              </h3>
              
              {/* Status badge */}
              <div
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium flex items-center',
                  statusCfg.bgColor,
                  statusCfg.color,
                  `border ${statusCfg.borderColor}`
                )}
              >
                <statusCfg.icon className="w-3.5 h-3.5 mr-1" />
                {t(`status.${status}`)}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <BookOpen className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
              {t('students.tingkat')} {student.tingkat || student.grade} • {t('students.kelas')} {student.kelas || student.class}
            </p>
          </div>
        </div>
        
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 transition-all duration-200 group-hover:border-indigo-100">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Mail className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
              {t('studentDetail.email')}
            </div>
            <p className="font-medium text-sm text-gray-700 truncate">
              {student.email || 'No email'}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 transition-all duration-200 group-hover:border-indigo-100">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <User className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
              {t('studentDetail.studentId', 'Student ID')}
            </div>
            <p className="font-medium text-sm text-gray-700 truncate">
              {student.studentId || student.id || 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Additional info if available */}
        {(student.mentalHealthScore !== undefined || student.lastCounseling) && (
          <div className="mt-3 grid grid-cols-1 gap-3">
            {student.mentalHealthScore !== undefined && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-medium">{t('studentDetail.mentalHealthScore')}</span>
                  <span className="text-sm font-bold text-indigo-700">{student.mentalHealthScore}/100</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full" 
                    style={{ width: `${student.mentalHealthScore}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {student.lastCounseling && (
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                {t('studentDetail.lastCounseling')}: <span className="ml-1 font-medium text-gray-700">{student.lastCounseling}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showBatchAddForm, setShowBatchAddForm] = useState(false);
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
      
      // Fetch students in this class with detailed information
      const studentsResponse = await getClassStudentsDetailed(id);
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
  };  // Navigate to student detail page
  const handleStudentClick = (student: Student) => {
    navigate(`/app/students/${student.studentId || student.id}`);
  };
  // Handle successful batch add
  const handleBatchAddSuccess = () => {
    setShowBatchAddForm(false);
    
    // Refresh class data to get updated student list and counts
    loadClassData();
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
        <div className="flex justify-center space-x-4">          <button
            onClick={() => navigate('/app/classes')}
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
      {/* Back button */}      <button
        onClick={() => navigate('/app/classes')}
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
            <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowBatchAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm transition-all duration-200 transform hover:scale-105"
            >
              <Users className="h-4 w-4 mr-2" />
              {t('classes.addStudents', 'Tambah Siswa')}
            </button>
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
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle - Hidden on mobile, table is forced */}
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                  title={t('view.table') || 'Tampilan Tabel'}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'cards'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                  title={t('view.cards') || 'Tampilan Kartu'}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>

              {/* Status Filter */}
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
            <>
              {/* Desktop: Table view or Cards view based on toggle */}
              <div className="hidden md:block">
                {viewMode === 'table' ? (
                  <StudentTable
                    students={filteredStudents}
                    onClick={handleStudentClick}
                  />
                ) : (                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => {
                      const status = student.academicStatus || 'warning';
                      const statusCfg = statusConfig[status] || statusConfig.warning;
                      const defaultAvatar = '/assets/images/default-avatar.png';
                      const avatarPath = student.avatar || student.photo || defaultAvatar;
                      
                      return (
                        <StudentCardComponent 
                          key={student.id}
                          student={student}
                          status={status}
                          statusCfg={statusCfg}
                          avatarPath={avatarPath}
                          onStudentClick={handleStudentClick}
                          t={t}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mobile: Always Cards view */}
              <div className="block md:hidden">                <div className="grid grid-cols-1 gap-4">
                  {filteredStudents.map(student => {
                    const status = student.academicStatus || 'warning';
                    const statusCfg = statusConfig[status] || statusConfig.warning;
                    const defaultAvatar = '/assets/images/default-avatar.png';
                    const avatarPath = student.avatar || student.photo || defaultAvatar;
                    
                    return (
                      <StudentCardComponent 
                        key={student.id}
                        student={student}
                        status={status}
                        statusCfg={statusCfg}
                        avatarPath={avatarPath}
                        onStudentClick={handleStudentClick}
                        t={t}
                      />
                    );
                  })}
                </div>
              </div>
            </>          )}
        </div>
      </div>

      {/* Batch Add Student Form Modal */}
      {showBatchAddForm && (
        <BatchAddStudentForm
          isOpen={showBatchAddForm}
          onClose={() => setShowBatchAddForm(false)}
          onSuccess={handleBatchAddSuccess}
          classData={classData}
        />
      )}
    </div>
  );
}
