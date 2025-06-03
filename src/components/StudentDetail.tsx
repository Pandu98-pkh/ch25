import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student } from '../types';
import { getStudent } from '../services/studentService';
import { generateReport, ReportParams } from '../services/reportService';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Download, User, Mail, BookOpen, Activity, AlertCircle, CheckCircle2, Clock, Award } from 'lucide-react';
import SessionsPage from './SessionsPage';
import MentalHealthPage from './MentalHealthPage';
import BehaviorPage from './BehaviorPage';
import CareerPage from './CareerPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '../utils/cn';

const statusConfig: Record<string, {
  color: string,
  bgColor: string,
  borderColor: string,
  icon: typeof AlertCircle
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

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const loadStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const studentData = await getStudent(id!);
      setStudent(studentData);
    } catch (error) {
      console.error('Error loading student:', error);
      setError(t('errors.loadingStudent'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) {
      loadStudentData();
    }
  }, [id, loadStudentData]);

  const handleGenerateReport = async () => {
    if (!student?.studentId) return;

    try {
      setGenerating(true);
      const params: ReportParams = {
        studentId: student.studentId,
        includeAssessments: true,
        includeBehavior: true,
        includeSessions: true
      };
      
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      await generateReport(params);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

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
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md border border-red-100">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium mb-4">{error || t('errors.studentNotFound')}</p>
        <button
          onClick={() => navigate('/app/students')}
          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          {t('actions.backToStudents')}
        </button>
      </div>
    );
  }

  const status = student.academicStatus || 'warning';
  const statusCfg = statusConfig[status] || statusConfig.warning;
  const defaultAvatar = '/assets/images/default-avatar.png';
  const avatarPath = student.avatar || student.photo || defaultAvatar;

  return (
    <div className="space-y-6">
      {/* Student header with enhanced design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={t('actions.goBack', 'Kembali')}
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="flex items-center">
              {!imageError ? (
                <img
                  src={avatarPath}
                  alt={student.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-2 ring-gray-100">
                  <User className="h-8 w-8 text-indigo-400" />
                </div>
              )}
              
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                <div className="flex items-center mt-1">
                  <BookOpen className="h-4 w-4 text-indigo-500 mr-1.5" />
                  <p className="text-sm text-gray-600">
                    {t('students.tingkat')} {student.tingkat || student.grade} • {t('students.kelas')} {student.kelas || student.class}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300",
              generating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm"
            )}
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('actions.generating')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('actions.generateReport')}
              </>
            )}
          </button>
        </div>
        
        {/* Student stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className={cn(
            "p-4 rounded-xl border", 
            statusCfg.borderColor,
            statusCfg.bgColor
          )}>
            <div className="flex items-center">
              <div className={cn(
                "p-2 rounded-full", 
                statusCfg.bgColor === "bg-green-50" ? "bg-green-100" : 
                statusCfg.bgColor === "bg-yellow-50" ? "bg-yellow-100" : 
                "bg-red-100"
              )}>
                <statusCfg.icon className={cn("h-5 w-5", statusCfg.color)} />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">{t('studentDetail.academicStatus')}</p>
                <p className={cn("font-semibold", statusCfg.color)}>
                  {t(`status.${status}`)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-indigo-50">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">{t('studentDetail.email')}</p>
                <p className="font-medium text-gray-900 truncate">
                  {student.email}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-50">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">{t('studentDetail.studentId', 'Nomor Induk Siswa')}</p>
                <p className="font-medium text-gray-900">
                  {student.studentId || t('studentDetail.notAvailable', 'N/A')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-50">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">{t('studentDetail.tingkat')}</p>
                <p className="font-medium text-gray-900">
                  {student.tingkat || student.grade}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-50">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">{t('studentDetail.kelas')}</p>
                <p className="font-medium text-gray-900">
                  {student.kelas || student.class}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced tabs */}
      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="bg-white shadow-sm rounded-xl p-1.5 flex w-full border border-gray-200">
          <TabsTrigger 
            value="sessions" 
            className="rounded-lg py-2.5 px-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            {t('nav.sessions')}
          </TabsTrigger>
          <TabsTrigger 
            value="mental-health" 
            className="rounded-lg py-2.5 px-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            {t('nav.mentalHealth')}
          </TabsTrigger>
          <TabsTrigger 
            value="behavior" 
            className="rounded-lg py-2.5 px-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            {t('nav.behavior')}
          </TabsTrigger>
          <TabsTrigger 
            value="career" 
            className="rounded-lg py-2.5 px-4 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            {t('nav.career')}
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <TabsContent value="sessions" className="mt-0 focus:outline-none">
            <SessionsPage studentId={student.id} />
          </TabsContent>

          <TabsContent value="mental-health" className="mt-0 focus:outline-none">
            <MentalHealthPage />
          </TabsContent>

          <TabsContent value="behavior" className="mt-0 focus:outline-none">
            <BehaviorPage studentId={student.id} />
          </TabsContent>

          <TabsContent value="career" className="mt-0 focus:outline-none">
            <CareerPage studentId={student.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}