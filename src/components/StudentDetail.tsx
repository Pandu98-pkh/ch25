import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student } from '../types';
import { getStudent } from '../services/studentService';
import { generateReport, ReportParams } from '../services/reportService';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Download } from 'lucide-react';
import SessionsPage from './SessionsPage';
import MentalHealthPage from './MentalHealthPage';
import BehaviorPage from './BehaviorPage';
import CareerPage from './CareerPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const { t } = useLanguage();

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
    if (!student?.id) return;

    try {
      setGenerating(true);
      const params: ReportParams = {
        studentId: student.id,
        includeAssessments: true,
        includeBehavior: true,
        includeSessions: true
      };
      await generateReport(params);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded mb-6"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || t('errors.studentNotFound')}</p>
        <button
          onClick={() => navigate('/students')}
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          {t('actions.backToStudents')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/students')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-sm text-gray-500">
              {t('students.tingkat')} {student.tingkat} • {t('students.kelas')} {student.kelas}
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5 mr-2" />
          {generating ? t('actions.generating') : t('actions.generateReport')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">{t('studentDetail.academicStatus')}</p>
            <p className={`mt-1 font-medium ${
              student.academicStatus === 'good' ? 'text-green-600' :
              student.academicStatus === 'warning' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {t(`status.${student.academicStatus}`)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('studentDetail.email')}</p>
            <p className="mt-1 font-medium text-gray-900 truncate">
              {student.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('studentDetail.tingkat')}</p>
            <p className="mt-1 font-medium text-gray-900">
              {student.tingkat}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('studentDetail.kelas')}</p>
            <p className="mt-1 font-medium text-gray-900">
              {student.kelas}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="bg-white shadow rounded-lg p-1">
          <TabsTrigger value="sessions">{t('nav.sessions')}</TabsTrigger>
          <TabsTrigger value="mental-health">{t('nav.mentalHealth')}</TabsTrigger>
          <TabsTrigger value="behavior">{t('nav.behavior')}</TabsTrigger>
          <TabsTrigger value="career">{t('nav.career')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <SessionsPage studentId={student.id} />
        </TabsContent>

        <TabsContent value="mental-health">
          <MentalHealthPage studentId={student.id} />
        </TabsContent>

        <TabsContent value="behavior">
          <BehaviorPage studentId={student.id} />
        </TabsContent>

        <TabsContent value="career">
          <CareerPage studentId={student.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}