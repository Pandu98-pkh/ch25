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
  TrendingUp,
  TrendingDown,
  Minus,
  Clipboard,
  Trash2,
  User,
  UserCircle,
  Users,
  Lock,
  Info,
  ShieldCheck,
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

// PHQ-9 severity levels
const PHQ9_SEVERITY = [
  { range: [0, 4], level: 'minimal', color: 'green' },
  { range: [5, 9], level: 'mild', color: 'blue' },
  { range: [10, 14], level: 'moderate', color: 'yellow' },
  { range: [15, 19], level: 'moderately severe', color: 'orange' },
  { range: [20, 27], level: 'severe', color: 'red' },
];

// GAD-7 severity levels
const GAD7_SEVERITY = [
  { range: [0, 4], level: 'minimal', color: 'green' },
  { range: [5, 9], level: 'mild', color: 'blue' },
  { range: [10, 14], level: 'moderate', color: 'yellow' },
  { range: [15, 21], level: 'severe', color: 'red' },
];

export default function MentalHealthPage() {
  const { t } = useLanguage();
  const { user, isAdmin, isCounselor } = useUser();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const navigate = useNavigate();
  // Use the new database hook - show all assessments without filter
  const {
    assessments: dbAssessments,
    loading,
    error,
    refetch
  } = useMentalHealthAssessments({ 
    // No studentId filter - show all assessments
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
    subScores: (assessment as any).subScores
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

  // Get PHQ-9 severity level
  const getPHQ9SeverityLevel = (score: number) => {
    return PHQ9_SEVERITY.find((s) => score >= s.range[0] && score <= s.range[1]) || PHQ9_SEVERITY[0];
  };

  // Get GAD-7 severity level
  const getGAD7SeverityLevel = (score: number) => {
    return GAD7_SEVERITY.find((s) => score >= s.range[0] && score <= s.range[1]) || GAD7_SEVERITY[0];
  };

  // Get color for severity level
  const getSeverityColor = (score: number, type: string) => {
    const severity = type === 'PHQ-9' ? getPHQ9SeverityLevel(score) : getGAD7SeverityLevel(score);
    switch (severity.color) {
      case 'green':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'blue':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'yellow':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'orange':
        return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
      case 'red':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getRiskIcon = (trend?: string) => {
    if (!trend) return <Minus className="h-4 w-4" />;

    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
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
    if (window.confirm(t('confirmation.deleteAssessment', 'Are you sure you want to delete this assessment?'))) {
      deleteAssessment(id);
    }
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
    );
  }

  // Get latest assessments
  const latestPHQ9 = assessments.find((a) => a.type === 'PHQ-9');
  const latestGAD7 = assessments.find((a) => a.type === 'GAD-7');
  const latestDASS21 = assessments.find((a) => a.type === 'DASS-21');

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
        </div>

        {/* Admin Assessment List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
              {t('assessments.recentAssessments', 'Recent Assessments')}
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
                    'assessments.adminGetStarted',
                    'Encourage students to complete assessments to start monitoring mental health'
                  )}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {assessments.slice(0, 5).map((assessment) => {
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
                        <div className="text-gray-400 group-hover:text-indigo-500 transform transition-transform duration-300">
                          {expandedId === assessment.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>

                      {expandedId === assessment.id && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fadeIn">
                          {/* Admin-specific assessment details */}
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500">
                                {t('assessments.student', 'Student')}
                              </p>
                              <p className="mt-1 text-sm text-gray-900">John Doe</p>
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
                {assessments.length > 5 && (
                  <div className="pt-4 text-center">
                    <button
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      onClick={() => {
                        /* View all assessments */
                      }}
                    >
                      {t('assessments.viewAll', 'View all assessments')} ({assessments.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
                        <tr key={assessment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  Student ID: {assessment.id.slice(0, 8)}
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
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start">
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
        </div>

        {/* PHQ-9 Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">PHQ-9 Depression</h2>
            </div>
            {latestPHQ9 && (
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getSeverityColor(latestPHQ9.score, 'PHQ-9').bg,
                  getSeverityColor(latestPHQ9.score, 'PHQ-9').text
                )}
              >
                {getPHQ9SeverityLevel(latestPHQ9.score).level}
              </div>
            )}
          </div>

          {latestPHQ9 ? (
            <div className="mb-4">
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Latest Score</span>
                  <span className="text-xl font-bold text-gray-900">{latestPHQ9.score}/27</span>
                </div>

                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full',
                      latestPHQ9.score < 5
                        ? 'bg-green-500'
                        : latestPHQ9.score < 10
                        ? 'bg-blue-500'
                        : latestPHQ9.score < 15
                        ? 'bg-yellow-500'
                        : latestPHQ9.score < 20
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    )}
                    style={{ width: `${(latestPHQ9.score / 27) * 100}%` }}
                  ></div>
                </div>

                {latestPHQ9.mlPrediction && (
                  <div className="flex items-center mt-3 text-sm">
                    {getRiskIcon(latestPHQ9.mlPrediction.trend)}
                    <span className="ml-1.5 text-gray-600">
                      {latestPHQ9.mlPrediction.trend === 'improving'
                        ? 'Improving'
                        : latestPHQ9.mlPrediction.trend === 'stable'
                        ? 'Stable'
                        : 'Needs Attention'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No PHQ-9 assessments yet</p>
          )}

          <button
            onClick={() => navigate('/app/mental-health/phq9-test')}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-sm transform transition-all duration-200 hover:scale-[1.02]"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            Take PHQ-9 Depression Test
          </button>
        </div>

        {/* GAD-7 Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">GAD-7 Anxiety</h2>
            </div>
            {latestGAD7 && (
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getSeverityColor(latestGAD7.score, 'GAD-7').bg,
                  getSeverityColor(latestGAD7.score, 'GAD-7').text
                )}
              >
                {getGAD7SeverityLevel(latestGAD7.score).level}
              </div>
            )}
          </div>

          {latestGAD7 ? (
            <div className="mb-4">
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Latest Score</span>
                  <span className="text-xl font-bold text-gray-900">{latestGAD7.score}/21</span>
                </div>

                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full',
                      latestGAD7.score < 5
                        ? 'bg-green-500'
                        : latestGAD7.score < 10
                        ? 'bg-blue-500'
                        : latestGAD7.score < 15
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    )}
                    style={{ width: `${(latestGAD7.score / 21) * 100}%` }}
                  ></div>
                </div>

                {latestGAD7.mlPrediction && (
                  <div className="flex items-center mt-3 text-sm">
                    {getRiskIcon(latestGAD7.mlPrediction.trend)}
                    <span className="ml-1.5 text-gray-600">
                      {latestGAD7.mlPrediction.trend === 'improving'
                        ? 'Improving'
                        : latestGAD7.mlPrediction.trend === 'stable'
                        ? 'Stable'
                        : 'Needs Attention'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No GAD-7 assessments yet</p>
          )}

          <button
            onClick={() => navigate('/app/mental-health/gad7-test')}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-lg shadow-sm transform transition-all duration-200 hover:scale-[1.02]"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            Take GAD-7 Anxiety Test
          </button>
        </div>

        {/* DASS-21 Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-teal-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Brain className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">DASS-21 Assessment</h2>
          </div>

          {latestDASS21 && latestDASS21.subScores ? (
            <div className="mb-4 space-y-3">
              <div className="flex flex-col space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Depression</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      getSeverityColor(latestDASS21.subScores.depression, 'DASS-21').bg,
                      getSeverityColor(latestDASS21.subScores.depression, 'DASS-21').text
                    )}
                  >
                    {latestDASS21.subScores.depression}/42
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Anxiety</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      getSeverityColor(latestDASS21.subScores.anxiety, 'DASS-21').bg,
                      getSeverityColor(latestDASS21.subScores.anxiety, 'DASS-21').text
                    )}
                  >
                    {latestDASS21.subScores.anxiety}/42
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Stress</span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      getSeverityColor(latestDASS21.subScores.stress, 'DASS-21').bg,
                      getSeverityColor(latestDASS21.subScores.stress, 'DASS-21').text
                    )}
                  >
                    {latestDASS21.subScores.stress}/42
                  </span>
                </div>
              </div>

              {latestDASS21.mlPrediction && (
                <div className="flex items-center text-sm">
                  {getRiskIcon(latestDASS21.mlPrediction.trend)}
                  <span className="ml-1.5 text-gray-600">
                    {latestDASS21.mlPrediction.trend === 'improving'
                      ? 'Improving'
                      : latestDASS21.mlPrediction.trend === 'stable'
                      ? 'Stable'
                      : 'Needs Attention'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No DASS-21 assessments yet</p>
          )}

          <button
            onClick={() => navigate('/app/mental-health/dass21-test')}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 rounded-lg shadow-sm transform transition-all duration-200 hover:scale-[1.02]"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            Take DASS-21 Assessment
          </button>
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
              </p>
              <div className="flex flex-wrap justify-center gap-3">
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