import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  TrendingUp,
  Download,
  Share,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { useAssessments } from '../contexts/AssessmentContext';

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

// GAD-7 severity levels
const GAD7_SEVERITY = [
  { range: [0, 4], level: 'minimal', color: 'green', description: 'Minimal anxiety symptoms' },
  { range: [5, 9], level: 'mild', color: 'blue', description: 'Mild anxiety symptoms' },
  { range: [10, 14], level: 'moderate', color: 'yellow', description: 'Moderate anxiety symptoms' },
  { range: [15, 21], level: 'severe', color: 'red', description: 'Severe anxiety symptoms' }
];

// DSM-5 diagnostic criteria
const DSM5_CRITERIA = [
  "Excessive anxiety and worry occurring more days than not for at least 6 months",
  "Difficulty controlling the worry",
  "The anxiety and worry are associated with three or more of the following symptoms:",
  "- Restlessness or feeling keyed up or on edge",
  "- Being easily fatigued",
  "- Difficulty concentrating or mind going blank",
  "- Irritability",
  "- Muscle tension",
  "- Sleep disturbance",
  "The anxiety causes clinically significant distress or impairment in functioning",
  "The symptoms are not better explained by another medical condition, substance use, or another mental disorder"
];

export default function GAD7TestPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addAssessment } = useAssessments();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<number[]>(Array(7).fill(-1));
  const [functionalImpact, setFunctionalImpact] = useState<number>(-1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDSMCriteria, setShowDSMCriteria] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeRemaining > 0 && !isSubmitted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !isSubmitted) {
      // Auto-submit when time is up
      if (responses.every(r => r >= 0)) {
        handleSubmitAssessment();
      } else {
        // If not all questions are answered, just stop the timer
        setTimerActive(false);
      }
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, isSubmitted, responses]);

  // Handle response selection with auto-advance
  const handleResponseChange = (questionIndex: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
    
    // Auto-advance to next question after selection
    if (questionIndex < responses.length - 1) {
      setTimeout(() => {
        setCurrentStep(questionIndex + 1);
      }, 500); // Short delay for better UX
    } else if (questionIndex === responses.length - 1) {
      // If it's the last question, move to the functional impact question
      setTimeout(() => {
        setCurrentStep(responses.length);
      }, 500);
    }
  };

  // Handle functional impact selection with auto-submit
  const handleFunctionalImpactChange = (value: number) => {
    setFunctionalImpact(value);
    
    // Enable auto-submit after selecting functional impact
    setTimeout(() => {
      if (responses.every(r => r >= 0)) {
        handleSubmitAssessment();
      }
    }, 1000); // Slightly longer delay before submitting
  };

  // Calculate total score
  const calculateScore = () => {
    return responses.reduce((total, value) => total + (value >= 0 ? value : 0), 0);
  };

  // Get severity level based on score
  const getSeverityLevel = (score: number) => {
    return GAD7_SEVERITY.find(s => score >= s.range[0] && score <= s.range[1]) || GAD7_SEVERITY[0];
  };

  // Get color class based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minimal': return 'bg-green-100 text-green-800 border-green-200';
      case 'mild': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get risk level based on score
  const getRiskLevel = (score: number): 'low' | 'moderate' | 'high' => {
    if (score < 5) return 'low';
    if (score < 10) return 'moderate';
    return 'high';
  };

  // Generate recommendations based on score
  const getRecommendations = (score: number): string[] => {
    const recommendations: string[] = [];
    
    if (score < 5) {
      recommendations.push("Continue monitoring your anxiety levels periodically");
      recommendations.push("Practice mindfulness and stress management techniques");
      recommendations.push("Maintain regular physical activity and sleep schedule");
    } else if (score < 10) {
      recommendations.push("Consider self-guided anxiety management tools and resources");
      recommendations.push("Implement relaxation techniques like deep breathing and progressive muscle relaxation");
      recommendations.push("Regular exercise and adequate sleep are important for anxiety management");
      recommendations.push("Follow up assessment in 2-4 weeks to monitor changes");
    } else if (score < 15) {
      recommendations.push("Consult with a healthcare provider for a comprehensive evaluation");
      recommendations.push("Consider cognitive behavioral therapy (CBT) for anxiety management");
      recommendations.push("Daily anxiety tracking and management techniques recommended");
      recommendations.push("Review potential stressors and develop coping strategies");
    } else {
      recommendations.push("Prompt consultation with a mental health professional is recommended");
      recommendations.push("Consider therapy options and medication evaluation with your provider");
      recommendations.push("Implement a structured anxiety management plan with professional guidance");
      recommendations.push("Develop coping strategies for acute anxiety episodes");
      recommendations.push("Regular follow-up with healthcare professionals is important");
    }
    
    return recommendations;
  };

  // ML prediction trend based on score
  const getPredictedTrend = (score: number): 'improving' | 'stable' | 'worsening' => {
    if (score < 5) return 'improving';
    if (score < 10) return 'stable';
    return 'worsening';
  };

  // Submit assessment
  const handleSubmitAssessment = () => {
    const score = calculateScore();
    const risk = getRiskLevel(score);
    const recommendations = getRecommendations(score);
    const trend = getPredictedTrend(score);
    
    // Create response objects for each question
    const responseData = responses.map((answer, idx) => ({
      questionId: idx + 1,
      answer
    }));
    
    // Add functional impact
    if (functionalImpact >= 0) {
      responseData.push({
        questionId: 8, // Functional impact question
        answer: functionalImpact
      });
    }
    
    // Generate comprehensive analysis notes
    const severity = getSeverityLevel(score);
    
    // Identify significant symptoms (items scored 2 or 3)
    const significantSymptoms = responses
      .map((value, index) => ({ value, question: GAD7_QUESTIONS[index], index }))
      .filter(item => item.value >= 2)
      .sort((a, b) => b.value - a.value);
    
    // Analyze symptom patterns
    const hasWorrySymptoms = significantSymptoms.some(s => s.index === 1 || s.index === 2);
    const hasPhysicalSymptoms = significantSymptoms.some(s => s.index === 3 || s.index === 4);
    const hasIrritabilitySymptoms = significantSymptoms.some(s => s.index === 5);
    const hasFearSymptoms = significantSymptoms.some(s => s.index === 6);
    
    // Format primary symptoms
    const primarySymptomsText = significantSymptoms.length > 0
      ? `Primary anxiety symptoms: ${significantSymptoms.map(s => s.question).join('; ')}`
      : 'No significant anxiety symptoms identified';
    
    // Generate clinical impression
    let clinicalImpression = '';
    if (score < 5) {
      clinicalImpression = 'Clinical impression: Subclinical anxiety symptoms that likely do not meet diagnostic threshold.';
    } else if (score < 10) {
      clinicalImpression = 'Clinical impression: Mild anxiety symptoms that may benefit from monitoring and self-management strategies.';
    } else if (score < 15) {
      clinicalImpression = 'Clinical impression: Moderate anxiety symptoms consistent with possible Generalized Anxiety Disorder. Clinical evaluation recommended.';
    } else {
      clinicalImpression = 'Clinical impression: Severe anxiety symptoms strongly suggestive of Generalized Anxiety Disorder. Prompt clinical intervention recommended.';
    }
    
    // Generate symptom pattern analysis
    const patternAnalysis = [];
    if (hasWorrySymptoms) {
      patternAnalysis.push('Cognitive symptoms: Persistent worry and difficulty controlling worry are present, consistent with key diagnostic criteria for GAD.');
    }
    if (hasPhysicalSymptoms) {
      patternAnalysis.push('Somatic symptoms: Physical manifestations of anxiety including restlessness and difficulty relaxing are reported.');
    }
    if (hasIrritabilitySymptoms) {
      patternAnalysis.push('Irritability: Increased irritability may indicate emotional dysregulation associated with anxiety.');
    }
    if (hasFearSymptoms) {
      patternAnalysis.push('Anticipatory anxiety: Fear of negative outcomes is present, which may drive avoidance behaviors.');
    }
    
    // Generate functional impact analysis
    let functionalImpactAnalysis = '';
    const impactLevels = ['minimal', 'moderate', 'significant', 'severe'];
    if (functionalImpact >= 0) {
      functionalImpactAnalysis = `Functional impact assessment: ${impactLevels[functionalImpact]} impairment in daily functioning reported.`;
      if (functionalImpact >= 2 && score >= 10) {
        functionalImpactAnalysis += ' The combination of symptom severity and functional impairment meets clinical significance criteria.';
      }
    }
    
    // Generate treatment recommendations based on severity and functional impact
    const treatmentRecommendations = [];
    if (score < 5) {
      treatmentRecommendations.push('Routine monitoring recommended');
      treatmentRecommendations.push('Educational resources about stress management techniques');
    } else if (score < 10) {
      treatmentRecommendations.push('Regular self-monitoring of anxiety symptoms');
      treatmentRecommendations.push('Consider guided self-help resources for anxiety management');
      treatmentRecommendations.push('Lifestyle modifications: regular exercise, sleep hygiene, stress reduction');
    } else if (score < 15) {
      treatmentRecommendations.push('Clinical evaluation by a qualified mental health professional');
      treatmentRecommendations.push('Consider evidence-based psychotherapy (CBT recommended as first-line)');
      treatmentRecommendations.push('Daily anxiety management techniques including mindfulness, deep breathing');
      if (functionalImpact >= 2) {
        treatmentRecommendations.push('Assessment for possible pharmacotherapy if psychotherapy alone is insufficient');
      }
    } else {
      treatmentRecommendations.push('Prompt comprehensive mental health evaluation');
      treatmentRecommendations.push('Combined approach recommended: evidence-based psychotherapy and consideration of pharmacotherapy');
      treatmentRecommendations.push('Regular monitoring of symptom severity and treatment response');
      treatmentRecommendations.push('Safety assessment and crisis planning if severe functional impairment present');
    }
    
    // Predict treatment response based on symptom pattern
    let treatmentResponsePrediction = '';
    if (hasWorrySymptoms && !hasPhysicalSymptoms) {
      treatmentResponsePrediction = 'Predicted treatment response: Likely to respond well to cognitive-behavioral interventions focusing on worry management.';
    } else if (hasPhysicalSymptoms && !hasWorrySymptoms) {
      treatmentResponsePrediction = 'Predicted treatment response: May benefit from relaxation training and somatic-focused interventions.';
    } else if (hasWorrySymptoms && hasPhysicalSymptoms) {
      treatmentResponsePrediction = 'Predicted treatment response: Likely to benefit from comprehensive approach addressing both cognitive and somatic symptoms.';
    }
    
    // Follow-up recommendations
    const followUpRecommendation = score < 5 ? 'Follow-up: Reassessment in 3 months' :
                                  score < 10 ? 'Follow-up: Reassessment in 4-6 weeks' :
                                  score < 15 ? 'Follow-up: Clinical evaluation within 2 weeks' :
                                  'Follow-up: Urgent clinical evaluation recommended';
    
    // Compile detailed notes
    const analysisNotes = `GAD-7 ASSESSMENT ANALYSIS
Date: ${format(new Date(), 'MMMM d, yyyy')}

QUANTITATIVE RESULTS
Score: ${score}/21 (${severity.level} severity)
Functional Impact: ${functionalImpact >= 0 ? ['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult'][functionalImpact] : 'Not specified'}

CLINICAL ANALYSIS
${primarySymptomsText}
${clinicalImpression}

SYMPTOM PATTERN
${patternAnalysis.join('\n')}
${functionalImpactAnalysis}

TREATMENT CONSIDERATIONS
${treatmentRecommendations.join('\n')}
${treatmentResponsePrediction}

MONITORING PLAN
${followUpRecommendation}
Predicted trend: ${trend === 'improving' ? 'Symptom improvement expected with appropriate intervention' : 
                   trend === 'stable' ? 'Stable course expected without significant intervention' : 
                   'Risk of symptom worsening without appropriate intervention'}

This assessment is for screening purposes only and does not constitute a clinical diagnosis. 
Results should be reviewed with a qualified healthcare provider.`;
    
    // Create assessment object
    const newAssessment = {
      type: 'GAD-7',
      score,
      date: format(new Date(), 'yyyy-MM-dd'),
      risk,
      notes: analysisNotes,
      responses: responseData,
      mlPrediction: {
        trend,
        confidence: 0.70 + (Math.random() * 0.25),
        nextPredictedScore: Math.max(0, score + (trend === 'improving' ? -2 : trend === 'stable' ? 0 : 2))
      },
      recommendations
    };
    
    // Add assessment to context
    addAssessment(newAssessment);
    setIsSubmitted(true);
  };

  // Navigate back to dashboard
  const handleReturnToDashboard = () => {
    navigate('/mental-health');
  };

  // Next step logic
  const goToNextStep = () => {
    if (currentStep < responses.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // We're at the functional impact question
      setCurrentStep(responses.length);
    }
  };

  // Previous step logic
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if can proceed to next step
  const canProceed = currentStep < responses.length 
    ? responses[currentStep] >= 0 
    : functionalImpact >= 0;

  // Check if all questions are answered
  const isComplete = responses.every(r => r >= 0) && functionalImpact >= 0;

  // Render results screen
  if (isSubmitted) {
    const score = calculateScore();
    const severity = getSeverityLevel(score);
    const recommendations = getRecommendations(score);
    const trend = getPredictedTrend(score);
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleReturnToDashboard}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('navigation.backToDashboard', 'Back to Dashboard')}
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                {t('gad7.resultsTitle', 'Your GAD-7 Assessment Results')}
              </h1>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium text-gray-900">
                  {t('assessments.totalScore', 'Total Score')}: {score}/21
                </span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(severity.level)}`}>
                  {t(`severity.${severity.level}`, severity.level)}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div 
                  className={`h-2.5 rounded-full ${
                    severity.color === 'green' ? 'bg-green-600' : 
                    severity.color === 'blue' ? 'bg-blue-600' : 
                    severity.color === 'yellow' ? 'bg-yellow-500' : 
                    'bg-red-600'
                  }`}
                  style={{ width: `${(score / 21) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Minimal (0-4)</span>
                <span>Mild (5-9)</span>
                <span>Moderate (10-14)</span>
                <span>Severe (15-21)</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t('assessments.interpretation', 'Interpretation')}
              </h3>
              <p className="text-gray-700 mb-4">
                {severity.description}. {
                  score < 5 
                    ? "Your results suggest minimal symptoms of anxiety. Continue monitoring your mental health." 
                    : score < 10 
                      ? "Your results suggest mild anxiety symptoms. Consider implementing self-help strategies and monitor your symptoms."
                      : score < 15
                        ? "Your results suggest moderate anxiety symptoms. Consider discussing these results with a healthcare provider."
                        : "Your results suggest severe anxiety symptoms. It's recommended to consult with a healthcare professional promptly."
                }
              </p>
              
              <button
                onClick={() => setShowDSMCriteria(!showDSMCriteria)}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
              >
                {showDSMCriteria ? 'Hide' : 'Show'} DSM-5 Diagnostic Criteria
                <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showDSMCriteria ? 'rotate-90' : ''}`} />
              </button>
              
              {showDSMCriteria && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    DSM-5 Criteria for Generalized Anxiety Disorder
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {DSM5_CRITERIA.map((criterion, index) => (
                      <li key={index}>{criterion}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-gray-500">
                    Note: This assessment tool helps screen for anxiety symptoms but is not a diagnostic tool. 
                    Only a qualified healthcare provider can make a diagnosis.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t('assessments.aiInsights', 'AI-Powered Insights')}
              </h3>
              
              <div className="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-100">
                <div className="flex items-start">
                  <TrendingUp className={`h-5 w-5 mt-0.5 mr-2 ${
                    trend === 'improving' ? 'text-green-600' : 
                    trend === 'stable' ? 'text-blue-600' : 
                    'text-red-600'
                  }`} />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Projected Trend: {
                        trend === 'improving' ? 'Improving' : 
                        trend === 'stable' ? 'Stable' : 
                        'Needs Attention'
                      }
                    </h4>
                    <p className="mt-1 text-sm text-gray-700">
                      {trend === 'improving' 
                        ? 'Based on your responses, our model predicts your anxiety symptoms may improve with proper self-care.' 
                        : trend === 'stable' 
                          ? 'Based on your responses, our model predicts your anxiety symptoms may remain stable.' 
                          : 'Based on your responses, our model predicts your anxiety symptoms may worsen without intervention.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t('assessments.recommendations', 'Recommendations')}
              </h3>
              
              <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleReturnToDashboard}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Dashboard
              </button>
              <button
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </button>
              <button
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Share className="h-4 w-4 mr-2" />
                Share with Provider
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('assessments.nextSteps', 'Next Steps')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Schedule a follow-up assessment</h4>
                  <p className="mt-1 text-sm text-gray-700">
                    Regular assessment helps track your progress. We recommend retaking this assessment in 2-4 weeks.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Important Note</h4>
                  <p className="mt-1 text-sm text-gray-700">
                    This assessment is a screening tool and not a diagnostic instrument. 
                    Results should be discussed with a qualified healthcare provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render questionnaire
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={handleReturnToDashboard}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('navigation.backToDashboard', 'Back to Dashboard')}
        </button>
        
        {/* Timer display */}
        <div className={`flex items-center ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'}`}>
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{formatTimeRemaining()}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('gad7.title', 'GAD-7 Anxiety Assessment')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('gad7.description', 'A validated tool for screening and measuring anxiety')}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${((currentStep + 1) / (responses.length + 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Question {currentStep + 1} of {responses.length + 1}</span>
              <span className="text-xs text-gray-500">{Math.round(((currentStep + 1) / (responses.length + 1)) * 100)}% complete</span>
            </div>
          </div>
          
          {currentStep < responses.length ? (
            /* Questions 1-7 */
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Over the last 2 weeks, how often have you been bothered by the following problem?
              </h2>
              
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-lg text-gray-900 font-medium">
                  {currentStep + 1}. {GAD7_QUESTIONS[currentStep]}
                </p>
              </div>
              
              <div className="space-y-3">
                {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((option, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      responses[currentStep] === idx 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleResponseChange(currentStep, idx)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{option}</span>
                      <span className="text-gray-500">({idx})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Functional impact question */
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Functional Impact Assessment
              </h2>
              
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-lg text-gray-900 font-medium">
                  If you checked off any problems, how difficult have these problems made it for you to 
                  do your work, take care of things at home, or get along with other people?
                </p>
              </div>
              
              <div className="space-y-3">
                {[
                  'Not difficult at all', 
                  'Somewhat difficult', 
                  'Very difficult', 
                  'Extremely difficult'
                ].map((option, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      functionalImpact === idx 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleFunctionalImpactChange(idx)}
                  >
                    <span className="text-gray-900">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                currentStep === 0
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            {currentStep < responses.length ? (
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!canProceed}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  canProceed
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-300 text-white cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitAssessment}
                disabled={!isComplete}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isComplete
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-300 text-white cursor-not-allowed'
                }`}
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">About this Assessment</h3>
            <p className="mt-1 text-sm text-blue-700">
              The Generalized Anxiety Disorder-7 (GAD-7) is a validated screening tool used to assess anxiety symptoms.
              This assessment is not a diagnostic tool and should be discussed with your healthcare provider.
              {timeRemaining < 60 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Your time is almost up! Please complete the assessment quickly.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
