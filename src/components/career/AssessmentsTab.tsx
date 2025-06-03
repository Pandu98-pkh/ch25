import { format } from 'date-fns';
import { BrainCircuit, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../utils/cn';
import { RiasecResult } from '../RiasecAssessment';
import { MbtiResult } from '../MbtiAssessment';
import { useStudentAssessments, useAllAssessments } from '../../hooks/useCareerAssessments';

interface AssessmentsTabProps {
  studentId?: string; // Add studentId prop for filtering
  onStartRiasecAssessment: () => void;
  onStartMbtiAssessment: () => void;
  onViewAssessmentDetails: (result: RiasecResult | MbtiResult, type: 'riasec' | 'mbti') => void;
}

export default function AssessmentsTab({
  studentId,
  onStartRiasecAssessment,
  onStartMbtiAssessment,
  onViewAssessmentDetails
}: AssessmentsTabProps) {
  const { t } = useLanguage();
  const { user } = useUser();

  // Use studentId prop if provided, otherwise use role-based logic
  const {
    assessments,
    loading,
    error,
    totalCount,
    refetch
  } = studentId 
    ? useStudentAssessments(studentId) // Filter by specific student
    : user?.role === 'student' 
      ? useStudentAssessments(user.userId || '') 
      : useAllAssessments();

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-3" />
            <p className="text-gray-600">{t('common.loading', 'Memuat data...')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
            <p className="text-red-600 mb-3">{error}</p>
            <button 
              onClick={refetch}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.retry', 'Coba Lagi')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">      {/* Header with role-specific actions */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {user?.role === 'student' 
              ? t('career.myAssessments', 'Penilaian Saya')
              : t('career.allAssessments', 'Semua Penilaian Siswa')
            }
          </h2>
          {user?.role !== 'student' && (
            <div className="flex items-center mt-1 space-x-4">
              <p className="text-sm text-gray-600">
                {t('career.viewAllStudentAssessments', 'Lihat dan pantau hasil penilaian karir dari semua siswa')}
              </p>
              <div className="text-sm text-gray-500">
                Total: <span className="font-semibold text-brand-600">{totalCount}</span> penilaian
              </div>
            </div>
          )}
        </div>
        
        {/* Only students can start new assessments */}
        {user?.role === 'student' && (
          <div className="flex space-x-3">
            <button 
              onClick={onStartRiasecAssessment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm transition-all duration-200"
            >
              <BrainCircuit className="h-5 w-5 mr-2" />
              {t('career.startRiasecAssessment', 'Mulai Penilaian RIASEC')}
            </button>
            <button 
              onClick={onStartMbtiAssessment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200"
            >
              <BrainCircuit className="h-5 w-5 mr-2" />
              {t('career.startMbtiAssessment', 'Mulai Penilaian MBTI')}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="p-6">
          {/* Student view - card layout with assessment info */}
          {user?.role === 'student' && (
            <>
              {/* Assessment Types Info Banner */}
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-xl">
                      <BrainCircuit className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-md font-semibold text-blue-900">
                        {t('career.riasecInfo', 'Penilaian Minat Karir RIASEC')}
                      </h3>
                      <div className="mt-2 text-sm text-blue-800">
                        <p>
                          {t('career.riasecDescription', 'Penilaian RIASEC menganalisis preferensi dan minat Anda berdasarkan teori Holland untuk merekomendasikan jalur karir yang paling sesuai dengan kepribadian Anda.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex">
                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-xl">
                      <BrainCircuit className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-md font-semibold text-purple-900">
                        {t('career.mbtiInfo', 'Penilaian Kepribadian MBTI')}
                      </h3>
                      <div className="mt-2 text-sm text-purple-800">
                        <p>
                          {t('career.mbtiDescription', 'Myers-Briggs Type Indicator (MBTI) membantu Anda memahami preferensi alami dalam cara berpikir dan berinteraksi, untuk menemukan jalur karir yang sesuai dengan kepribadian Anda.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="py-5 first:pt-0 last:pb-0 hover:bg-gray-50 transition-colors duration-150 px-3 -mx-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <div className="bg-brand-100 p-2 rounded-xl">
                            <BrainCircuit className="h-5 w-5 text-brand-600" />
                          </div>
                          <p className="ml-3 text-md font-semibold text-gray-900">
                            {assessment.type === 'riasec' ? 'Penilaian RIASEC' : 'Penilaian MBTI'} - {format(new Date(assessment.date), 'PPP')}
                          </p>
                        </div>
                        <div className="mt-3 space-y-2 ml-10">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{t('career.interests')}:</span>{' '}
                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                              {assessment.interests.map(interest => 
                                typeof interest === 'string' 
                                  ? interest 
                                  : t(`riasec.categories.${interest}`, interest)
                              ).join(', ')}
                            </span>
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{t('career.recommendedPaths')}:</span>{' '}
                            <span className="text-gray-600">{assessment.recommendedPaths.join(', ')}</span>
                          </p>
                        </div>
                      </div>                      <button 
                        onClick={() => {
                          if ('result' in assessment) {
                            onViewAssessmentDetails(assessment.result, assessment.type);
                          }
                        }}
                        className="text-sm font-medium px-4 py-2 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors duration-150"
                      >
                        {t('career.viewDetails')}
                      </button>
                    </div>
                  </div>
                ))}
                {assessments.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="p-5 bg-gray-50 rounded-full mb-5">
                      <BrainCircuit className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('career.noAssessments')}</h3>
                    <p className="text-sm text-gray-600 text-center max-w-md mb-8">
                      {t('career.assessmentsDescription', 'Penilaian minat karir membantu Anda menemukan jalur karir yang sesuai dengan minat dan kekuatan Anda. Mulai penilaian pertama Anda untuk mendapatkan rekomendasi personal.')}
                    </p>
                    <button 
                      onClick={onStartRiasecAssessment}
                      className="inline-flex items-center px-5 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm transition-all duration-200"
                    >
                      <BrainCircuit className="h-5 w-5 mr-2" />
                      {t('career.takeFirstAssessment', 'Ambil Penilaian Pertama')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Counselor/Admin view - table layout */}
          {user?.role !== 'student' && (
            <>
              {assessments.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="p-5 bg-gray-50 rounded-full mb-5">
                    <BrainCircuit className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('career.noStudentAssessments', 'Belum Ada Penilaian Siswa')}
                  </h3>
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    {t('career.noStudentAssessmentsDesc', 'Belum ada siswa yang mengambil penilaian karir. Data akan muncul di sini setelah siswa menyelesaikan penilaian RIASEC atau MBTI.')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('career.student', 'Siswa')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('career.assessmentType', 'Jenis Penilaian')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('career.date', 'Tanggal')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('career.results', 'Hasil')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('career.recommendations', 'Rekomendasi')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('career.actions', 'Aksi')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assessments.map((assessment) => (
                        <tr key={assessment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {(assessment as any).userName?.charAt(0) || 'A'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {(assessment as any).userName || 'Anonymous User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {(assessment as any).userId || 'anonymous'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              assessment.type === 'riasec' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            )}>
                              <BrainCircuit className="h-3 w-3 mr-1" />
                              {assessment.type === 'riasec' ? 'RIASEC' : 'MBTI'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(assessment.date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assessment.interests.map(interest => 
                                typeof interest === 'string' 
                                  ? interest 
                                  : t(`riasec.categories.${interest}`, interest)
                              ).slice(0, 2).join(', ')}
                              {assessment.interests.length > 2 && '...'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {assessment.recommendedPaths.slice(0, 2).join(', ')}
                              {assessment.recommendedPaths.length > 2 && '...'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                if ('result' in assessment) {
                                  onViewAssessmentDetails(assessment.result, assessment.type);
                                }
                              }}
                              className="text-brand-600 hover:text-brand-900 font-medium"
                            >
                              {t('career.viewDetails', 'Lihat Detail')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
