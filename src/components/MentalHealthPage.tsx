import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Heart, 
  Calendar, 
  AlertCircle, 
  PlusCircle, 
  Trash2,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Brain,
  TrendingUp,
  Clipboard
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { useAssessments, Assessment } from '../contexts/AssessmentContext';

// GAD-7 Questions array
const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

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

export default function MentalHealthPage() {
  const { t } = useLanguage();
  const { assessments, addAssessment, deleteAssessment, loading } = useAssessments();
  const [searchTerm] = useState('');
  const [filterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showGAD7Form, setShowGAD7Form] = useState(false);
  const [gad7Responses, setGAD7Responses] = useState<number[]>(Array(7).fill(0));
  const navigate = useNavigate();
  


  // Get PHQ-9 severity level
  const getPHQ9SeverityLevel = (score: number) => {
    const severity = PHQ9_SEVERITY.find(s => 
      score >= s.range[0] && score <= s.range[1]
    );
    return severity || PHQ9_SEVERITY[0];
  };

  // Get GAD-7 severity level
  const getGAD7SeverityLevel = (score: number) => {
    const severity = GAD7_SEVERITY.find(s => 
      score >= s.range[0] && score <= s.range[1]
    );
    return severity || GAD7_SEVERITY[0];
  };

  // Get color for severity level
  const getSeverityColor = (score: number, type: string) => {
    const severity = type === 'PHQ-9' ? getPHQ9SeverityLevel(score) : getGAD7SeverityLevel(score);
    switch (severity.color) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'orange': return 'bg-amber-100 text-amber-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle GAD-7 response change
  const handleGAD7ResponseChange = (index: number, value: number) => {
    const newResponses = [...gad7Responses];
    newResponses[index] = value;
    setGAD7Responses(newResponses);
  };

  // Calculate GAD-7 score
  const calculateGAD7Score = () => {
    return gad7Responses.reduce((total, current) => total + current, 0);
  };

  // Submit GAD-7 assessment
  const submitGAD7Assessment = () => {
    const score = calculateGAD7Score();
    const risk = score < 5 ? 'low' : score < 10 ? 'moderate' : 'high';
    
    // Mock ML prediction based on score
    let trend: 'improving' | 'stable' | 'worsening';
    if (score < 5) trend = 'improving';
    else if (score < 10) trend = 'stable';
    else trend = 'worsening';
    
    // Recommendations based on severity
    const recommendations: string[] = [];
    if (score < 5) {
      recommendations.push("Continue regular monitoring");
      recommendations.push("Practice mindfulness and stress management techniques");
    } else if (score < 10) {
      recommendations.push("Consider self-guided anxiety management tools");
      recommendations.push("Regular exercise and relaxation practices recommended");
      recommendations.push("Follow up assessment in 2-4 weeks");
    } else if (score < 15) {
      recommendations.push("Consult with a healthcare provider for evaluation");
      recommendations.push("Consider cognitive behavioral therapy for anxiety");
      recommendations.push("Daily anxiety tracking and management techniques recommended");
    } else {
      recommendations.push("Prompt consultation with a mental health professional");
      recommendations.push("Consider therapy and medication evaluation");
      recommendations.push("Implement structured anxiety management plan");
      recommendations.push("Develop coping strategies for acute anxiety episodes");
    }
    
    const responses = gad7Responses.map((answer, idx) => ({
      questionId: idx + 1,
      answer
    }));
    
    // Generate comprehensive clinical analysis
    const severity = getGAD7SeverityLevel(score);
    
    // Identify strongest symptoms (highest scoring items)
    const strongSymptoms = gad7Responses
      .map((value, index) => ({ value, question: GAD7_QUESTIONS[index] }))
      .filter(item => item.value >= 2) // Items scored 2 or 3 are significant symptoms
      .sort((a, b) => b.value - a.value)
      .map(item => item.question);
    
    // Format symptoms list
    const symptomsText = strongSymptoms.length > 0 
      ? `Primary symptoms: ${strongSymptoms.join('; ')}` 
      : 'No primary symptoms identified';
    
    // Get DSM-5 alignment
    const meetsThreshold = score >= 10; // Clinical threshold often used for GAD screening
    const dsm5Alignment = meetsThreshold 
      ? 'Assessment results indicate symptoms consistent with criteria that may suggest Generalized Anxiety Disorder per DSM-5 guidelines'
      : 'Assessment results do not meet threshold typically associated with Generalized Anxiety Disorder diagnosis';
    
    // Create detailed analysis notes
    const analysisNotes = `GAD-7 Assessment Analysis:
Score: ${score}/21 - Severity: ${severity.level}
${symptomsText}
${dsm5Alignment}

Recommended clinical actions:
${recommendations.join('\n')}

Follow-up recommendation: ${score < 5 ? '3 months' : score < 10 ? '4-6 weeks' : '1-2 weeks'}`;
    
    const newAssessmentItem: Omit<Assessment, 'id'> = {
      type: 'GAD-7',
      score,
      date: format(new Date(), 'yyyy-MM-dd'),
      risk,
      notes: analysisNotes,
      responses,
      mlPrediction: {
        trend,
        confidence: 0.70 + (Math.random() * 0.25),
        nextPredictedScore: Math.max(0, score + (trend === 'improving' ? -2 : trend === 'stable' ? 0 : 2))
      },
      recommendations
    };
    
    addAssessment(newAssessmentItem);
    setShowGAD7Form(false);
    setGAD7Responses(Array(7).fill(0));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  

  const handleDeleteAssessment = (id: string) => {
    deleteAssessment(id);
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      assessment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    const matchesType = filterType === 'all' || assessment.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Add a debugging effect to log assessments changes
  useEffect(() => {
    console.log('Current assessments:', assessments);
  }, [assessments]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get the latest PHQ-9 assessment
  const latestPHQ9 = assessments.find(a => a.type === 'PHQ-9');
  
  // Get the latest GAD-7 assessment
  const latestGAD7 = assessments.find(a => a.type === 'GAD-7');
  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('mentalHealth.title', 'Mental Health Tracking')}
        </h1>
        <p className="text-gray-600">
          {t('mentalHealth.description', 'Monitor mental health assessments and track progress over time')}
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              {t('dashboard.totalAssessments', 'Total Assessments')}
            </h2>
          </div>
          <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
          <p className="text-sm text-gray-500 mt-2">
            {assessments.length > 0 
              ? t('dashboard.lastAssessment', `Last assessment on ${format(new Date(assessments[0].date), 'MMM d, yyyy')}`) 
              : t('dashboard.noAssessments', 'No assessments yet')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              {t('dashboard.riskAssessment', 'Risk Assessment')}
            </h2>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center bg-green-50 px-2.5 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
              <span className="text-xs font-medium text-green-700">
                {assessments.filter(a => a.risk === 'low').length} {t('risk.low', 'Low')}
              </span>
            </div>
            <div className="flex items-center bg-yellow-50 px-2.5 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div>
              <span className="text-xs font-medium text-yellow-700">
                {assessments.filter(a => a.risk === 'moderate').length} {t('risk.moderate', 'Moderate')}
              </span>
            </div>
            <div className="flex items-center bg-red-50 px-2.5 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
              <span className="text-xs font-medium text-red-700">
                {assessments.filter(a => a.risk === 'high').length} {t('risk.high', 'High')}
              </span>
            </div>
          </div>
        </div>

        {/* PHQ-9 Assessment Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              {t('dashboard.phq9Assessment', 'PHQ-9 Assessment')}
            </h2>
          </div>
          
          {latestPHQ9 ? (
            <>
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Latest Score: {latestPHQ9.score}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(latestPHQ9.score, 'PHQ-9')}`}>
                    {getPHQ9SeverityLevel(latestPHQ9.score).level}
                  </span>
                </div>
                
                {latestPHQ9.mlPrediction && (
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className={`h-4 w-4 mr-1.5 ${
                      latestPHQ9.mlPrediction.trend === 'improving' 
                        ? 'text-green-500' 
                        : latestPHQ9.mlPrediction.trend === 'stable' 
                          ? 'text-blue-500' 
                          : 'text-red-500'
                    }`} />
                    <span className="text-gray-600">
                      {latestPHQ9.mlPrediction.trend === 'improving' 
                        ? 'Trend: Improving' 
                        : latestPHQ9.mlPrediction.trend === 'stable' 
                          ? 'Trend: Stable' 
                          : 'Trend: Needs Attention'}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No PHQ-9 assessments yet</p>
          )}
          
          <button
            onClick={() => navigate('/mental-health/phq9-test')}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            {t('actions.takePHQ9Test', 'Take PHQ-9 Depression Test')}
          </button>
        </div>

        {/* GAD-7 Assessment Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              {t('dashboard.gad7Assessment', 'GAD-7 Anxiety')}
            </h2>
          </div>
          
          {latestGAD7 ? (
            <>
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Latest Score: {latestGAD7.score}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(latestGAD7.score, 'GAD-7')}`}>
                    {getGAD7SeverityLevel(latestGAD7.score).level}
                  </span>
                </div>
                
                {latestGAD7.mlPrediction && (
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className={`h-4 w-4 mr-1.5 ${
                      latestGAD7.mlPrediction.trend === 'improving' 
                        ? 'text-green-500' 
                        : latestGAD7.mlPrediction.trend === 'stable' 
                          ? 'text-blue-500' 
                          : 'text-red-500'
                    }`} />
                    <span className="text-gray-600">
                      {latestGAD7.mlPrediction.trend === 'improving' 
                        ? 'Trend: Improving' 
                        : latestGAD7.mlPrediction.trend === 'stable' 
                          ? 'Trend: Stable' 
                          : 'Trend: Needs Attention'}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No GAD-7 assessments yet</p>
          )}
          
          <button
            onClick={() => navigate('/mental-health/gad7-test')}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            {t('actions.takeGAD7Test', 'Take GAD-7 Anxiety Test')}
          </button>
        </div>

        {/* DASS-21 Assessment Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Brain className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              {t('dashboard.dass21Assessment', 'DASS-21 Assessment')}
            </h2>
          </div>
          
          {assessments.find(a => a.type === 'DASS-21') ? (
            <>
              <div className="mb-3">
                {/* Display the latest DASS-21 assessment details */}
                {(() => {
                  const latestDASS21 = assessments.find(a => a.type === 'DASS-21');
                  if (!latestDASS21 || !latestDASS21.subScores) return null;
                  
                  return (
                    <>
                      <div className="flex flex-col space-y-2 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500">Depression</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            getSeverityColor(latestDASS21.subScores.depression, 'DASS-21')
                          }`}>
                            {latestDASS21.subScores.depression}/42
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500">Anxiety</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            getSeverityColor(latestDASS21.subScores.anxiety, 'DASS-21')
                          }`}>
                            {latestDASS21.subScores.anxiety}/42
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500">Stress</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            getSeverityColor(latestDASS21.subScores.stress, 'DASS-21')
                          }`}>
                            {latestDASS21.subScores.stress}/42
                          </span>
                        </div>
                      </div>
                      
                      {latestDASS21.mlPrediction && (
                        <div className="flex items-center mt-2 text-sm">
                          <TrendingUp className={`h-4 w-4 mr-1.5 ${
                            latestDASS21.mlPrediction.trend === 'improving' 
                              ? 'text-green-500' 
                              : latestDASS21.mlPrediction.trend === 'stable' 
                                ? 'text-blue-500' 
                                : 'text-red-500'
                          }`} />
                          <span className="text-gray-600">
                            {latestDASS21.mlPrediction.trend === 'improving' 
                              ? 'Trend: Improving' 
                              : latestDASS21.mlPrediction.trend === 'stable' 
                                ? 'Trend: Stable' 
                                : 'Trend: Needs Attention'}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No DASS-21 assessments yet</p>
          )}
          
          <button
            onClick={() => navigate('/mental-health/dass21-test')}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            {t('actions.takeDASS21Test', 'Take DASS-21 Assessment')}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">
              {t('dashboard.quickActions', 'Quick Actions')}
            </h2>
          </div>
          <button
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {t('actions.addAssessment', 'Add New Assessment')}
          </button>
        </div>
      </div>

      {/* GAD-7 Assessment Form */}
      {showGAD7Form && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('form.gad7Assessment', 'GAD-7 Anxiety Assessment')}
            </h2>
            <button
              onClick={() => setShowGAD7Form(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Over the last 2 weeks, how often have you been bothered by the following problems?
          </p>
          
          <div className="space-y-6">
            {GAD7_QUESTIONS.map((question, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <p className="font-medium text-gray-900 mb-3">{index + 1}. {question}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((option, valueIndex) => (
                    <div key={valueIndex}>
                      <input
                        type="radio"
                        id={`gad-q${index}-${valueIndex}`}
                        name={`gad-question-${index}`}
                        className="sr-only peer"
                        checked={gad7Responses[index] === valueIndex}
                        onChange={() => handleGAD7ResponseChange(index, valueIndex)}
                      />
                      <label
                        htmlFor={`gad-q${index}-${valueIndex}`}
                        className="flex items-center justify-center p-3 border rounded-lg text-sm text-center cursor-pointer peer-checked:bg-indigo-50 peer-checked:border-indigo-500 peer-checked:text-indigo-700 hover:bg-gray-50"
                      >
                        {option} ({valueIndex})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Additional functional impact question */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult'].map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      id={`impact-${idx}`}
                      name="functional-impact"
                      type="radio"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor={`impact-${idx}`} className="ml-2 block text-sm text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">Ready to submit your responses</p>
                <p className="mt-1 text-xs text-gray-500">
                  Your assessment will be analyzed for anxiety symptoms
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowGAD7Form(false)}
                >
                  {t('actions.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={submitGAD7Assessment}
                >
                  {t('actions.saveAssessment', 'Submit Assessment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t('assessments.title', 'Assessment History')}
          </h2>
          
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterType !== 'all'
                  ? t('assessments.noResults', 'No assessments match your search')
                  : t('assessments.noAssessments', 'No assessments yet')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all'
                  ? t('assessments.tryDifferentSearch', 'Try a different search or filter')
                  : t('assessments.getStarted', 'Get started by adding a new assessment')}
              </p>
              {!searchTerm && filterType === 'all' && (
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    {t('actions.addAssessment', 'Add New Assessment')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAssessments.map((assessment) => (
                <div key={assessment.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2.5 rounded-lg ${getRiskColor(assessment.risk)}`}>
                        {assessment.risk === 'low' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : assessment.risk === 'moderate' ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          {assessment.type} - {t('assessments.score', 'Score')}: {assessment.score}
                        </h4>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          {format(new Date(assessment.date), 'MMMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedId(expandedId === assessment.id ? null : assessment.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        title={t('actions.viewDetails', 'View Details')}
                      >
                        {expandedId === assessment.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(assessment.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100"
                        title={t('actions.delete', 'Delete')}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {expandedId === assessment.id && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            {t('assessments.type', 'Assessment Type')}
                          </p>
                          <p className="mt-1 text-sm text-gray-900">{assessment.type}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            {t('assessments.score', 'Score')}
                          </p>
                          <p className="mt-1 text-sm text-gray-900">{assessment.score}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            {t('assessments.date', 'Date')}
                          </p>
                          <p className="mt-1 text-sm text-gray-900">
                            {format(new Date(assessment.date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            {t('assessments.risk', 'Risk Level')}
                          </p>
                          <p className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(assessment.risk)}`}>
                            {t(`risk.${assessment.risk}`, assessment.risk)}
                          </p>
                        </div>
                      </div>
                      
                      {assessment.notes && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {t('assessments.notes', 'Notes')}
                          </p>
                          <pre className="text-xs text-gray-900 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap font-sans">
                            {assessment.notes}
                          </pre>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                        >
                          {t('actions.addFollowUp', 'Schedule Follow-up')}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}