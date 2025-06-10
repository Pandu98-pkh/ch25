import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Brain,
  AlertCircle,
  CheckCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Clipboard,
  Trash2,
  User,
  UserCircle,
  Users,
  Lock,
  Info,
  ShieldCheck,
  X, // Add X icon for modal close button
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { useMentalHealthAssessments } from '../hooks/useMentalHealthAssessments';
import { useUser } from '../contexts/UserContext';
import { cn } from '../utils/cn';
import AssessmentDetailView from './AssessmentDetailView';

// Define the Assessment type
interface Assessment {
  id: string;
  type: string;
  score: number;
  date: string;
  risk: 'low' | 'moderate' | 'high';
  notes?: string;
  studentId?: string; // Added for admin/counselor table views
  responses?: {
    questionId: number;
    answer: number;
    questionText?: string;
    category?: string;
  }[];
  mlPrediction?: {
    trend: 'improving' | 'stable' | 'worsening';
    confidence: number;
    nextPredictedScore?: number;
  };
  recommendations?: string[];
  subScores?: {
    depression: number;
    anxiety: number;
    stress: number;
  };
}

interface MentalHealthPageProps {
  studentId?: string; // Optional prop for filtering by specific student
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assessment: Assessment | null;
  isDeleting: boolean;
}

function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  assessment, 
  isDeleting 
}: DeleteConfirmationModalProps) {
  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trash2 className="h-5 w-5 mr-2" />
            Konfirmasi Hapus Assessment
          </h3>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors disabled:opacity-50"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center mr-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Apakah Anda yakin ingin menghapus assessment ini?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Tindakan ini tidak dapat dibatalkan. Assessment akan dihapus secara permanen dari sistem.
              </p>
            </div>
          </div>

          {/* Assessment Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Jenis Assessment:</span>
                <span className="text-sm text-gray-900">{assessment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Skor:</span>
                <span className="text-sm text-gray-900">{assessment.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Tanggal:</span>
                <span className="text-sm text-gray-900">
                  {format(new Date(assessment.date), 'dd MMM yyyy')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Level Risiko:</span>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  assessment.risk === 'low' ? 'bg-green-100 text-green-800' :
                  assessment.risk === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}>
                  {assessment.risk === 'low' ? 'Rendah' : 
                   assessment.risk === 'moderate' ? 'Sedang' : 'Tinggi'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Assessment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MentalHealthPage({ studentId }: MentalHealthPageProps = {}) {
  const { t } = useLanguage();
  const { user, isAdmin, isCounselor } = useUser();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  // Add modal states
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    assessment: Assessment | null;
  }>({
    isOpen: false,
    assessment: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  // Implement role-based filtering:
  // - If studentId prop is provided, use it (for student detail view)
  // - Students see only their own data
  // - Admins and counselors see all data
  const studentIdFilter = studentId 
    ? studentId // Use specific student ID from props
    : (isAdmin || isCounselor) ? undefined : user?.userId;
  
  const {
    assessments: dbAssessments,
    loading,
    error,
    refetch
  } = useMentalHealthAssessments({ 
    studentId: studentIdFilter
  });
  // Transform database assessments to legacy format for compatibility
  const assessments = dbAssessments.map((assessment): Assessment => ({
    id: assessment.id,
    type: assessment.type,
    score: assessment.score,
    date: assessment.date,
    risk: assessment.risk,
    notes: assessment.notes,
    responses: assessment.responses ? Object.entries(assessment.responses).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer: answer as number
    })) : undefined,
    mlPrediction: assessment.mlInsights ? {
      trend: assessment.mlInsights.severity === 'severe' ? 'worsening' : 
             assessment.mlInsights.severity === 'mild' ? 'improving' : 'stable',
      confidence: assessment.mlInsights.confidenceScore || 0.5,
      nextPredictedScore: undefined
    } : undefined,
    recommendations: assessment.mlInsights?.recommendedActions,
    subScores: (assessment as any).subScores,
    // ✅ IMPORTANT: Include studentId for admin/counselor table views
    studentId: assessment.studentId
  }));
  const deleteAssessment = async (id: string) => {
    try {
      // Call the localStorage service's delete function
      await import('../services/mentalHealthService').then(service => 
        service.deleteMentalHealthAssessment(id)
      );
      
      // Refetch data to update the UI
      await refetch();
      
      console.log('✅ Assessment deleted successfully from localStorage:', id);
    } catch (error) {
      console.error('❌ Error deleting assessment from localStorage:', error);
      // Still try to refetch in case the delete succeeded but response failed
      await refetch();
    }
  };


  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'moderate':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle };
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
    }
  };

  const handleDeleteAssessment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, assessment: assessments.find(a => a.id === id) || null });
  };

  const handleViewDetails = (assessment: Assessment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssessment(assessment);
  };

  // Admin-specific stats
  const getTotalAssessments = () => {
    const counts = {
      total: assessments.length,
      phq9: assessments.filter((a) => a.type === 'PHQ-9').length,
      gad7: assessments.filter((a) => a.type === 'GAD-7').length,
      dass21: assessments.filter((a) => a.type === 'DASS-21').length,
      atRisk: assessments.filter((a) => a.risk === 'high').length,
    };
    return counts;
  };

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                {t('error.databaseConnection', 'Database Connection Error')}
              </h3>
              <p className="text-red-700 mt-1">
                {error}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('actions.retry', 'Retry Connection')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="flex">
            <div className="h-12 w-12 rounded-lg bg-indigo-200 mr-4"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-indigo-200 rounded w-1/3"></div>
              <div className="h-4 bg-indigo-100 rounded w-1/2"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>

          <div className="h-96 bg-white rounded-xl border border-gray-200 shadow-sm"></div>
        </div>
      </div>
    );  }

  // Admin View
  if (isAdmin) {
    const stats = getTotalAssessments();

    return (
      <div className="bg-gray-50 p-6 max-w-6xl mx-auto rounded-xl">
        {/* Admin Header */}
        <div className="mb-8 flex items-center">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg mr-4">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              {t('mentalHealth.adminTitle', 'Mental Health Administration')}
            </h1>
            <p className="mt-1 text-gray-500">
              {t('mentalHealth.adminDescription', 'Monitor and manage mental health assessments across the school')}
            </p>
          </div>
        </div>

        {/* Admin Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-indigo-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BarChart className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">
                {t('dashboard.assessmentOverview', 'Assessment Overview')}
              </h2>
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <div className="flex flex-wrap gap-2">
                <div className="bg-indigo-50 px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></div>
                  <span className="text-xs font-medium text-indigo-700">PHQ-9: {stats.phq9}</span>
                </div>
                <div className="bg-purple-50 px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>
                  <span className="text-xs font-medium text-purple-700">GAD-7: {stats.gad7}</span>
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                  <span className="text-xs font-medium text-blue-700">DASS-21: {stats.dass21}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-red-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">
                {t('mentalHealth.highRiskStudents', 'High Risk Students')}
              </h2>
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-gray-900">{stats.atRisk}</p>
              <p className="text-sm text-gray-600">
                {t('mentalHealth.studentsRequiringAttention', 'Students requiring immediate attention')}
              </p>
              <button
                onClick={() => navigate('/app/students')}
                className="w-full flex items-center justify-end px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                {t('mentalHealth.viewAtRiskStudents', 'View at-risk students')}
                <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-green-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">
                {t('mentalHealth.assessmentAdministration', 'Assessment Admin')}
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    /* Admin action */
                  }}
                  className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('mentalHealth.approveAssessments', 'Approve Assessments')}
                </button>
                <button
                  onClick={() => {
                    /* Admin action */
                  }}
                  className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {t('mentalHealth.managePermissions', 'Manage Permissions')}
                </button>
              </div>
            </div>
          </div>
        </div>        {/* Admin Assessment List - Table View like Counselor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
              {t('assessments.recentAssessments', 'Recent Assessments')}
            </h2>

            <div className="overflow-x-auto scrollbar-light">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.student', 'Student')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.type', 'Type')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.date', 'Date')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.score', 'Score')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.risk', 'Risk')}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">{t('actions.view', 'View')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">
                          {t('assessments.noAssessments', 'No assessments yet')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t('assessments.adminGetStarted', 'Encourage students to complete assessments to start monitoring mental health')}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    assessments.slice(0, 10).map((assessment) => {
                      const riskColor =
                        assessment.risk === 'low'
                          ? 'bg-green-100 text-green-800'
                          : assessment.risk === 'moderate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800';

                      return (
                        <tr key={assessment.id} className="hover:bg-gray-50">                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  Student ID: {assessment.studentId || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Assessment ID: {assessment.id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{assessment.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(new Date(assessment.date), 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{assessment.score}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${riskColor}`}
                            >
                              {t(`risk.${assessment.risk}`, assessment.risk)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 font-medium mr-4"
                              onClick={(e) => handleViewDetails(assessment, e)}
                            >
                              {t('actions.view', 'View')}
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 font-medium"
                              onClick={(e) => handleDeleteAssessment(assessment.id, e)}
                            >
                              {t('actions.delete', 'Delete')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>        {/* Admin Info Panel like Counselor */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start mt-6">
          <Info className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-purple-800">{t('mentalHealth.adminInfo', 'Administrator Information')}</h3>
            <p className="mt-1 text-sm text-purple-700">
              {t(
                'mentalHealth.adminMessage',
                'You have full access to all student mental health assessments. Use this data to monitor overall school mental health trends and identify students who may need additional support.'
              )}
            </p>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedAssessment && (
          <AssessmentDetailView assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} />
        )}
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteConfirmModal.isOpen}
          onClose={() => setDeleteConfirmModal({ isOpen: false, assessment: null })}
          onConfirm={async () => {
            if (deleteConfirmModal.assessment) {
              setIsDeleting(true);
              await deleteAssessment(deleteConfirmModal.assessment.id);
              setDeleteConfirmModal({ isOpen: false, assessment: null });
              setIsDeleting(false);
            }
          }}
          assessment={deleteConfirmModal.assessment}
          isDeleting={isDeleting}
        />
      </div>
    );
  }

  // Counselor View
  if (isCounselor) {
    return (
      <div className="bg-gray-50 p-6 max-w-6xl mx-auto rounded-xl">
        {/* Counselor Header */}
        <div className="mb-8 flex items-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg mr-4">
            <UserCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {t('mentalHealth.counselorTitle', 'Student Mental Health Monitoring')}
            </h1>
            <p className="mt-1 text-gray-500">
              {t('mentalHealth.counselorDescription', 'Monitor and support student mental health assessments')}
            </p>
          </div>
        </div>

        {/* Counselor action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Student selector card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-indigo-200 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">
                {t('mentalHealth.selectStudent', 'Select Student')}
              </h2>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={t('mentalHealth.searchStudents', 'Search students...')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              <div className="mt-4 space-y-2 max-h-56 overflow-y-auto scrollbar-light">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 cursor-pointer border border-gray-200 hover:border-indigo-200 transition-colors"
                    onClick={() => navigate(`/app/students/${num}`)}
                  >
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Student {num}</h3>
                      <p className="text-xs text-gray-500">Class XI-A</p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        3 assessments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-indigo-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">
                {t('mentalHealth.quickActions', 'Quick Actions')}
              </h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/app/sessions')}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{t('mentalHealth.scheduleSession', 'Schedule Session')}</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  /* Admin action */
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <Clipboard className="h-5 w-5 mr-2" />
                  <span>{t('mentalHealth.assignAssessment', 'Assign Assessment')}</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  /* Admin action */
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  <span>{t('mentalHealth.viewReports', 'View Reports')}</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent assessments overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
              {t('assessments.recentAssessments', 'Recent Assessments')}
            </h2>

            <div className="overflow-x-auto scrollbar-light">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.student', 'Student')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.type', 'Type')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.date', 'Date')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.score', 'Score')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t('assessments.risk', 'Risk')}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">{t('actions.view', 'View')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">
                          {t('assessments.noAssessments', 'No assessments yet')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {t('assessments.counselorGetStarted', 'Students will appear here after completing assessments')}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    assessments.slice(0, 10).map((assessment) => {
                      const riskColor =
                        assessment.risk === 'low'
                          ? 'bg-green-100 text-green-800'
                          : assessment.risk === 'moderate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800';

                      return (
                        <tr key={assessment.id} className="hover:bg-gray-50">                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  Student ID: {assessment.studentId || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Assessment ID: {assessment.id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{assessment.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(new Date(assessment.date), 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{assessment.score}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${riskColor}`}
                            >
                              {t(`risk.${assessment.risk}`, assessment.risk)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 font-medium mr-4"
                              onClick={(e) => handleViewDetails(assessment, e)}
                            >
                              {t('actions.view', 'View')}
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 font-medium"
                              onClick={(e) => handleDeleteAssessment(assessment.id, e)}
                            >
                              {t('actions.delete', 'Delete')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start">
          <Info className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-indigo-800">{t('mentalHealth.counselorInfo', 'Counselor Information')}</h3>
            <p className="mt-1 text-sm text-indigo-700">
              {t(
                'mentalHealth.counselorMessage',
                'Select a student to view their complete mental health profile, assign assessments, or schedule counseling sessions.'
              )}
            </p>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedAssessment && (
          <AssessmentDetailView assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} />
        )}
      </div>
    );
  }

  // Student View (default)
  return (
    <div className="bg-gray-50 p-6 max-w-6xl mx-auto rounded-xl">
      {/* Header with animation */}
      <div className="mb-8 flex items-center">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg mr-4">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {t('mentalHealth.title', 'Mental Health Dashboard')}
          </h1>
          <p className="mt-1 text-gray-500">
            {t('mentalHealth.description', 'Track your mental health with standardized assessments')}
          </p>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-indigo-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              {t('dashboard.totalAssessments', 'Assessment Overview')}
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
            <div className="flex flex-wrap gap-2">
              <div className="bg-indigo-50 px-3 py-1 rounded-full flex items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></div>
                <span className="text-xs font-medium text-indigo-700">
                  PHQ-9: {assessments.filter((a) => a.type === 'PHQ-9').length}
                </span>
              </div>
              <div className="bg-purple-50 px-3 py-1 rounded-full flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></div>
                <span className="text-xs font-medium text-purple-700">
                  GAD-7: {assessments.filter((a) => a.type === 'GAD-7').length}
                </span>
              </div>
              <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                <span className="text-xs font-medium text-blue-700">
                  DASS-21: {assessments.filter((a) => a.type === 'DASS-21').length}
                </span>
              </div>
            </div>
            {assessments.length > 0 && (
              <p className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {t('dashboard.lastAssessment', 'Last assessment')}: {format(new Date(assessments[0].date), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>        {/* Enhanced Integrated Mental Health Test Card */}
        <div className="bg-gradient-to-br from-white to-emerald-50 p-6 rounded-xl shadow-lg border-2 border-emerald-200 transform transition-all duration-300 hover:shadow-xl hover:border-emerald-300 col-span-2 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-30 -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">Comprehensive Mental Health Assessment</h2>
                  <p className="text-sm text-gray-600">Unified evaluation combining PHQ-9, DASS-21, and GAD-7</p>
                </div>
              </div>
              <div className="bg-emerald-100 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-emerald-700">ALL-IN-ONE</span>
              </div>
            </div>

            {/* Combined Assessment Overview */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-xs font-medium text-purple-700">Depression</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">PHQ-9 Questions</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                  <span className="text-xs font-medium text-indigo-700">Anxiety</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">GAD-7 Questions</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200 shadow-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                  <span className="text-xs font-medium text-teal-700">Stress</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">DASS-21 Questions</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-emerald-800">
                  <p className="font-semibold mb-2">🎯 Complete Mental Health Evaluation</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <ul className="space-y-1">
                      <li>• Sequential flow through all assessments</li>
                      <li>• Holistic scoring system (0-100 scale)</li>
                    </ul>
                    <ul className="space-y-1">
                      <li>• Personalized recommendations</li>
                      <li>• 15-minute completion time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/app/mental-health/integrated-test')}
              className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:via-teal-700 hover:to-green-700 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              <Brain className="w-5 h-5 mr-3" />
              🧠 Take Comprehensive Assessment
              <div className="ml-3 bg-white/20 px-2 py-1 rounded-full text-xs">NEW</div>
            </button>
          </div>
        </div>
      </div>

      {/* Assessment List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
            {t('assessments.title', 'Assessment History')}
          </h2>

          {assessments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {t('assessments.noAssessments', 'No assessments yet')}
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                {t(
                  'assessments.getStarted',
                  'Take your first assessment to start tracking your mental health progress'
                )}
              </p>              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate('/app/mental-health/integrated-test')}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-sm transform transition-all duration-200 hover:scale-[1.02]"
                >
                  🧠 Take Comprehensive Test (All-in-One)
                </button>
                <button
                  onClick={() => navigate('/app/mental-health/phq9-test')}
                  className="px-3 py-1.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  Take PHQ-9 Test
                </button>
                <button
                  onClick={() => navigate('/app/mental-health/gad7-test')}
                  className="px-3 py-1.5 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Take GAD-7 Test
                </button>
                <button
                  onClick={() => navigate('/app/mental-health/dass21-test')}
                  className="px-3 py-1.5 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  Take DASS-21 Test
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assessments.map((assessment) => {
                const riskStyle = getRiskColor(assessment.risk);
                return (
                  <div
                    key={assessment.id}
                    className="py-4 first:pt-0 last:pb-0 group transition-colors hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => setExpandedId(expandedId === assessment.id ? null : assessment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={cn(
                            'p-2.5 rounded-lg transform transition-transform group-hover:scale-110',
                            riskStyle.bg
                          )}
                        >
                          <riskStyle.icon className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {assessment.type} - Score: {assessment.score}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            {format(new Date(assessment.date), 'MMMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => handleDeleteAssessment(assessment.id, e)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title={t('actions.delete', 'Delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="text-gray-400 group-hover:text-indigo-500 transform transition-transform duration-300">
                          {expandedId === assessment.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedId === assessment.id && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              {t('assessments.type', 'Assessment Type')}
                            </p>
                            <p className="mt-1 text-sm text-gray-900">{assessment.type}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">{t('assessments.score', 'Score')}</p>
                            <p className="mt-1 text-sm text-gray-900">{assessment.score}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">{t('assessments.date', 'Date')}</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {format(new Date(assessment.date), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">{t('assessments.risk', 'Risk Level')}</p>
                            <p
                              className={cn(
                                'mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                riskStyle.bg,
                                riskStyle.text
                              )}
                            >
                              {t(`risk.${assessment.risk}`, assessment.risk)}
                            </p>
                          </div>
                        </div>

                        {assessment.recommendations && assessment.recommendations.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 mb-2">
                              {t('assessments.recommendations', 'Recommendations')}
                            </p>
                            <ul className="space-y-1 pl-5 list-disc text-xs text-gray-700">
                              {assessment.recommendations.slice(0, 3).map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                              {assessment.recommendations.length > 3 && (
                                <li className="text-indigo-600 cursor-pointer">
                                  {t('assessments.moreRecommendations', '+ more recommendations')}
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        <div className="mt-4 flex justify-end">
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                            onClick={(e) => handleViewDetails(assessment, e)}
                          >
                            {t('actions.viewDetails', 'View Full Details')}
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAssessment && (
        <AssessmentDetailView assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} />
      )}
    </div>
  );
}