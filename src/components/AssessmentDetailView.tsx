import { useState } from 'react';
import { format } from 'date-fns';
import { 
  X, 
  Calendar, 
  Brain, 
  Download, 
  Printer, 
  Share, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Minus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

// Define the Assessment interface
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

interface AssessmentDetailViewProps {
  assessment: Assessment;
  onClose: () => void;
}

// PHQ-9 severity levels
const PHQ9_SEVERITY = [
  { range: [0, 4], level: 'minimal', color: 'green' },
  { range: [5, 9], level: 'mild', color: 'blue' },
  { range: [10, 14], level: 'moderate', color: 'yellow' },
  { range: [15, 19], level: 'moderately severe', color: 'orange' },
  { range: [20, 27], level: 'severe', color: 'red' }
];

// GAD-7 severity levels
const GAD7_SEVERITY = [
  { range: [0, 4], level: 'minimal', color: 'green' },
  { range: [5, 9], level: 'mild', color: 'blue' },
  { range: [10, 14], level: 'moderate', color: 'yellow' },
  { range: [15, 21], level: 'severe', color: 'red' }
];

export default function AssessmentDetailView({ assessment, onClose }: AssessmentDetailViewProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<'summary' | 'responses' | 'analysis'>('summary');
  
  // Get severity level
  const getSeverityLevel = (score: number, type: string) => {
    if (type === 'PHQ-9') {
      return PHQ9_SEVERITY.find(s => score >= s.range[0] && score <= s.range[1]) || PHQ9_SEVERITY[0];
    } else if (type === 'GAD-7') {
      return GAD7_SEVERITY.find(s => score >= s.range[0] && score <= s.range[1]) || GAD7_SEVERITY[0];
    }
    return { level: 'unknown', color: 'gray' };
  };

  // Get color for severity level
  const getSeverityColor = (severity: { color: string }) => {
    switch (severity.color) {
      case 'green': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'blue': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'yellow': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'orange': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
      case 'red': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'moderate': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle };
      case 'high': return { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Minus };
    }
  };

  // Get trend icon
  const getTrendIcon = (trend?: string) => {
    if (!trend) return <Minus className="h-5 w-5 text-gray-500" />;
    
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      case 'worsening':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get formatted date
  const getFormattedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Get max score based on assessment type
  const getMaxScore = (type: string) => {
    switch (type) {
      case 'PHQ-9': return 27;
      case 'GAD-7': return 21;
      case 'DASS-21': return 126; // Combined max score for all three subscales
      default: return 100;
    }
  };

  const severity = getSeverityLevel(assessment.score, assessment.type);
  const severityColor = getSeverityColor(severity);
  const riskColor = getRiskColor(assessment.risk);
  const maxScore = getMaxScore(assessment.type);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center">
            <Brain className="h-6 w-6 mr-3" />
            <h2 className="text-xl font-bold">
              {assessment.type} {t('assessmentDetail.title', 'Assessment Details')}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage('summary')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentPage === 'summary' 
                  ? "bg-indigo-100 text-indigo-800" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {t('assessmentDetail.summary', 'Summary')}
            </button>
            {assessment.responses && assessment.responses.length > 0 && (
              <button
                onClick={() => setCurrentPage('responses')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentPage === 'responses' 
                    ? "bg-indigo-100 text-indigo-800" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {t('assessmentDetail.responses', 'Responses')}
              </button>
            )}
            {assessment.notes && (
              <button
                onClick={() => setCurrentPage('analysis')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentPage === 'analysis' 
                    ? "bg-indigo-100 text-indigo-800" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {t('assessmentDetail.analysis', 'Clinical Analysis')}
              </button>
            )}
          </div>
        </div>

        {/* Summary View */}
        {currentPage === 'summary' && (
          <div className="p-6">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('assessmentDetail.basicInfo', 'Basic Information')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('assessmentDetail.type', 'Assessment Type')}:</span>
                    <span className="font-medium text-gray-900">{assessment.type}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('assessmentDetail.date', 'Date Taken')}:</span>
                    <span className="font-medium text-gray-900">{getFormattedDate(assessment.date)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('assessmentDetail.score', 'Score')}:</span>
                    <span className="font-medium text-gray-900">{assessment.score}/{maxScore}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('assessmentDetail.severity', 'Severity')}:</span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      severityColor.bg,
                      severityColor.text
                    )}>
                      {severity.level}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{t('assessmentDetail.risk', 'Risk Level')}:</span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      riskColor.bg,
                      riskColor.text
                    )}>
                      {assessment.risk}
                    </span>
                  </div>
                </div>

                {/* DASS-21 Subscores if available */}
                {assessment.type === 'DASS-21' && assessment.subScores && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {t('assessmentDetail.subscores', 'Subscores')}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('assessmentDetail.depression', 'Depression')}:</span>
                        <span className="font-medium text-gray-900">{assessment.subScores.depression}/42</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('assessmentDetail.anxiety', 'Anxiety')}:</span>
                        <span className="font-medium text-gray-900">{assessment.subScores.anxiety}/42</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('assessmentDetail.stress', 'Stress')}:</span>
                        <span className="font-medium text-gray-900">{assessment.subScores.stress}/42</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Trend & Recommendations */}
              <div className="space-y-6">
                {/* Trend Analysis */}
                {assessment.mlPrediction && (
                  <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                      {t('assessmentDetail.trendAnalysis', 'Trend Analysis')}
                    </h3>
                    
                    <div className="flex items-start space-x-4">
                      <div className="bg-white rounded-full p-3 border border-indigo-200">
                        {getTrendIcon(assessment.mlPrediction.trend)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">
                          {assessment.mlPrediction.trend === 'improving' && t('assessmentDetail.improving', 'Improving')}
                          {assessment.mlPrediction.trend === 'stable' && t('assessmentDetail.stable', 'Stable')}
                          {assessment.mlPrediction.trend === 'worsening' && t('assessmentDetail.worsening', 'Needs Attention')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {assessment.mlPrediction.trend === 'improving' 
                            ? t('assessmentDetail.improvingText', 'Your scores show improvement. Continue with current strategies.')
                            : assessment.mlPrediction.trend === 'stable'
                              ? t('assessmentDetail.stableText', 'Your scores are stable. Maintain consistent monitoring.')
                              : t('assessmentDetail.worseningText', 'Your scores indicate potential decline. Consider additional support.')}
                        </p>
                        
                        {assessment.mlPrediction.confidence && (
                          <div className="mt-2 text-xs text-indigo-600">
                            {t('assessmentDetail.predictionConfidence', 'Prediction confidence')}: {Math.round(assessment.mlPrediction.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {assessment.recommendations && assessment.recommendations.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t('assessmentDetail.recommendations', 'Recommendations')}
                    </h3>
                    
                    <ul className="space-y-2">
                      {assessment.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                {t('assessmentDetail.download', 'Download Report')}
              </button>
              
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Printer className="h-4 w-4 mr-2" />
                {t('assessmentDetail.print', 'Print')}
              </button>
              
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Share className="h-4 w-4 mr-2" />
                {t('assessmentDetail.share', 'Share with Provider')}
              </button>
            </div>
          </div>
        )}

        {/* Responses View */}
        {currentPage === 'responses' && assessment.responses && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('assessmentDetail.responseDetails', 'Response Details')}
            </h3>
            
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('assessmentDetail.question', 'Question')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('assessmentDetail.response', 'Response')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessment.responses.map((response, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {response.questionText || `Question ${response.questionId}`}
                        {response.category && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {response.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {response.answer}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                {t('assessmentDetail.takenOn', 'Taken on')} {getFormattedDate(assessment.date)}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentPage('summary')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('assessmentDetail.backToSummary', 'Back to Summary')}
              </button>
              
              {assessment.notes && (
                <button
                  onClick={() => setCurrentPage('analysis')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  {t('assessmentDetail.viewAnalysis', 'View Clinical Analysis')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Clinical Analysis View */}
        {currentPage === 'analysis' && assessment.notes && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('assessmentDetail.clinicalAnalysis', 'Clinical Analysis')}
            </h3>
            
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                {assessment.notes}
              </pre>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentPage('summary')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('assessmentDetail.backToSummary', 'Back to Summary')}
              </button>
              
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Printer className="h-4 w-4 mr-2" />
                {t('assessmentDetail.print', 'Print Analysis')}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          {t('assessmentDetail.disclaimer', 'Disclaimer: This assessment is intended for screening purposes only and does not constitute a clinical diagnosis.')}
        </div>
      </div>
    </div>
  );
}
