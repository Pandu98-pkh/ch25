import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { useAssessments } from '../contexts/AssessmentContext';

// DASS-21 Questions array
const DASS21_QUESTIONS = [
  // Depression items (7)
  "I couldn't seem to experience any positive feeling at all",
  "I found it difficult to work up the initiative to do things",
  "I felt that I had nothing to look forward to",
  "I felt down-hearted and blue",
  "I was unable to become enthusiastic about anything",
  "I felt I wasn't worth much as a person",
  "I felt that life was meaningless",
  
  // Anxiety items (7)
  "I was aware of dryness of my mouth",
  "I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)",
  "I experienced trembling (e.g., in the hands)",
  "I was worried about situations in which I might panic and make a fool of myself",
  "I felt I was close to panic",
  "I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)",
  "I felt scared without any good reason",
  
  // Stress items (7)
  "I found it hard to wind down",
  "I tended to over-react to situations",
  "I felt that I was using a lot of nervous energy",
  "I found myself getting agitated",
  "I found it difficult to relax",
  "I was intolerant of anything that kept me from getting on with what I was doing",
  "I felt that I was rather touchy"
];

// Categories for each question (used for scoring)
const QUESTION_CATEGORIES = [
  "depression", "depression", "depression", "depression", "depression", "depression", "depression",
  "anxiety", "anxiety", "anxiety", "anxiety", "anxiety", "anxiety", "anxiety",
  "stress", "stress", "stress", "stress", "stress", "stress", "stress"
];

// DASS-21 severity levels
const DASS21_SEVERITY = {
  depression: [
    { range: [0, 9], level: 'normal', color: 'green' },
    { range: [10, 13], level: 'mild', color: 'blue' },
    { range: [14, 20], level: 'moderate', color: 'yellow' },
    { range: [21, 27], level: 'severe', color: 'orange' },
    { range: [28, 42], level: 'extremely severe', color: 'red' }
  ],
  anxiety: [
    { range: [0, 7], level: 'normal', color: 'green' },
    { range: [8, 9], level: 'mild', color: 'blue' },
    { range: [10, 14], level: 'moderate', color: 'yellow' },
    { range: [15, 19], level: 'severe', color: 'orange' },
    { range: [20, 42], level: 'extremely severe', color: 'red' }
  ],
  stress: [
    { range: [0, 14], level: 'normal', color: 'green' },
    { range: [15, 18], level: 'mild', color: 'blue' },
    { range: [19, 25], level: 'moderate', color: 'yellow' },
    { range: [26, 33], level: 'severe', color: 'orange' },
    { range: [34, 42], level: 'extremely severe', color: 'red' }
  ]
};

// DASS-21 response options
const RESPONSE_OPTIONS = [
  { value: 0, text: "Did not apply to me at all" },
  { value: 1, text: "Applied to me to some degree, or some of the time" },
  { value: 2, text: "Applied to me to a considerable degree, or a good part of time" },
  { value: 3, text: "Applied to me very much, or most of the time" }
];

export default function DASS21TestPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addAssessment } = useAssessments();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<number[]>(Array(21).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Auto-submit when time runs out
      submitAssessment();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeRemaining, timerActive]);

  // Get severity level for a specific category and score
  const getSeverityLevel = (category: string, score: number) => {
    const severityLevels = DASS21_SEVERITY[category as keyof typeof DASS21_SEVERITY];
    const severity = severityLevels.find(s => 
      score >= s.range[0] && score <= s.range[1]
    );
    return severity || severityLevels[0];
  };

  // Get color class for severity level
  const getSeverityColor = (severity: { color: string }) => {
    switch (severity.color) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'orange': return 'bg-amber-100 text-amber-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle response change
  const handleResponseChange = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = value;
    setResponses(newResponses);
    
    // Auto-advance to next question after selection
    if (currentQuestionIndex < DASS21_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300); // Short delay for better UX
    }
  };

  // Calculate scores for each category
  const calculateScores = () => {
    const scores = {
      depression: 0,
      anxiety: 0,
      stress: 0
    };

    responses.forEach((response, index) => {
      const category = QUESTION_CATEGORIES[index];
      scores[category as keyof typeof scores] += response * 2; // Multiply by 2 as per DASS-21 scoring guidelines
    });

    return scores;
  };

  // Go to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Go to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < DASS21_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Submit assessment
  const submitAssessment = () => {
    setIsSubmitting(true);
    
    // Calculate scores
    const scores = calculateScores();
    
    // Determine overall risk level based on the highest severity category
    const depressionSeverity = getSeverityLevel('depression', scores.depression);
    const anxietySeverity = getSeverityLevel('anxiety', scores.anxiety);
    const stressSeverity = getSeverityLevel('stress', scores.stress);
    
    // Get severity colors for visual representation
    const severityColors = {
      depression: getSeverityColor(depressionSeverity),
      anxiety: getSeverityColor(anxietySeverity),
      stress: getSeverityColor(stressSeverity)
    };
    
    // Determine overall risk based on highest severity
    const severityLevels = [depressionSeverity.level, anxietySeverity.level, stressSeverity.level];
    let overallRisk: 'low' | 'moderate' | 'high' = 'low';
    
    if (severityLevels.includes('extremely severe') || severityLevels.includes('severe')) {
      overallRisk = 'high';
    } else if (severityLevels.includes('moderate')) {
      overallRisk = 'moderate';
    }
    
    // Mock ML prediction trends based on scores
    const predictionTrends = {
      depression: scores.depression < 14 ? 'improving' : scores.depression < 21 ? 'stable' : 'worsening',
      anxiety: scores.anxiety < 10 ? 'improving' : scores.anxiety < 15 ? 'stable' : 'worsening',
      stress: scores.stress < 19 ? 'improving' : scores.stress < 26 ? 'stable' : 'worsening'
    } as const;
    
    // Generate recommendations based on severity levels
    const recommendations: string[] = [];
    
    // Depression recommendations
    if (depressionSeverity.level === 'normal' || depressionSeverity.level === 'mild') {
      recommendations.push("Continue monitoring depression symptoms");
    } else if (depressionSeverity.level === 'moderate') {
      recommendations.push("Consider psychoeducation and self-help resources for depression");
      recommendations.push("Regular monitoring of mood and engagement in pleasant activities");
    } else {
      recommendations.push("Consult with a mental health professional for depression evaluation");
      recommendations.push("Consider evidence-based interventions such as CBT or behavioral activation");
    }
    
    // Anxiety recommendations
    if (anxietySeverity.level === 'normal' || anxietySeverity.level === 'mild') {
      recommendations.push("Practice regular relaxation techniques for anxiety management");
    } else if (anxietySeverity.level === 'moderate') {
      recommendations.push("Consider anxiety management strategies such as deep breathing and progressive muscle relaxation");
      recommendations.push("Regular exercise may help reduce anxiety symptoms");
    } else {
      recommendations.push("Consult with a mental health professional for anxiety assessment");
      recommendations.push("Consider evidence-based interventions such as CBT or mindfulness-based approaches");
    }
    
    // Stress recommendations
    if (stressSeverity.level === 'normal' || stressSeverity.level === 'mild') {
      recommendations.push("Continue practicing good stress management techniques");
    } else if (stressSeverity.level === 'moderate') {
      recommendations.push("Implement regular stress reduction activities in daily routine");
      recommendations.push("Consider time management strategies and setting boundaries");
    } else {
      recommendations.push("Consult with a healthcare provider about stress management approaches");
      recommendations.push("Consider lifestyle modifications to reduce stress burden");
    }
    
    // Format responses for storage
    const formattedResponses = responses.map((answer, idx) => ({
      questionId: idx + 1,
      category: QUESTION_CATEGORIES[idx],
      question: DASS21_QUESTIONS[idx],
      answer
    }));
    
    // Generate comprehensive clinical analysis
    const analysisNotes = `DASS-21 Assessment Analysis:
    
Depression Score: ${scores.depression}/42 - Severity: ${depressionSeverity.level}
Anxiety Score: ${scores.anxiety}/42 - Severity: ${anxietySeverity.level}
Stress Score: ${scores.stress}/42 - Severity: ${stressSeverity.level}

Key Findings:
- ${depressionSeverity.level !== 'normal' ? `Depression symptoms present at ${depressionSeverity.level} levels` : 'Depression symptoms within normal range'}
- ${anxietySeverity.level !== 'normal' ? `Anxiety symptoms present at ${anxietySeverity.level} levels` : 'Anxiety symptoms within normal range'}
- ${stressSeverity.level !== 'normal' ? `Stress indicators at ${stressSeverity.level} levels` : 'Stress indicators within normal range'}

Clinical Considerations:
${depressionSeverity.level !== 'normal' ? '- Monitor for persistent low mood, anhedonia, and changes in sleep/appetite' : ''}
${anxietySeverity.level !== 'normal' ? '- Assess for physiological arousal, excessive worry, and avoidance behaviors' : ''}
${stressSeverity.level !== 'normal' ? '- Evaluate sources of stress and coping mechanisms' : ''}

Recommended clinical actions:
${recommendations.join('\n')}

Follow-up recommendation: ${overallRisk === 'high' ? '1-2 weeks' : overallRisk === 'moderate' ? '2-4 weeks' : '2-3 months'}`;

    // Create assessment object
    const assessment = {
      type: 'DASS-21',
      score: scores.depression + scores.anxiety + scores.stress, // Composite score
      date: format(new Date(), 'yyyy-MM-dd'),
      risk: overallRisk,
      notes: analysisNotes,
      responses: formattedResponses,
      mlPrediction: {
        trend: predictionTrends.depression, // Using depression trend as primary indicator
        confidence: 0.65 + (Math.random() * 0.30),
        nextPredictedScore: Math.max(0, scores.depression + (predictionTrends.depression === 'improving' ? -3 : predictionTrends.depression === 'stable' ? 0 : 3))
      },
      recommendations,
      // Additional DASS-21 specific data
      subScores: {
        depression: scores.depression,
        anxiety: scores.anxiety,
        stress: scores.stress
      },
      severityLevels: {
        depression: depressionSeverity.level,
        anxiety: anxietySeverity.level,
        stress: stressSeverity.level
      },
      severityColors
    };
    
    // Save results data for display
    setResultsData(assessment);
    
    // Add assessment to context
    addAssessment(assessment);
    
    // Show results
    setShowResults(true);
    setIsSubmitting(false);
  };

  // Reset assessment
  const resetAssessment = () => {
    setResponses(Array(21).fill(-1));
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setResultsData(null);
    setTimeRemaining(5 * 60); // Reset timer to 5 minutes
    setTimerActive(true);
  };

  // Go back to main mental health page
  const navigateBack = () => {
    navigate('/mental-health');
  };


  // Check if all questions are answered
  const isAssessmentComplete = () => {
    return responses.every(response => response !== -1);
  };

  // Get current question data
  const getCurrentQuestion = () => {
    const question = DASS21_QUESTIONS[currentQuestionIndex];
    const category = QUESTION_CATEGORIES[currentQuestionIndex];
    return { question, category };
  };

  // Pause or resume timer
  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  // Render results screen
  if (showResults && resultsData) {
    const { subScores, severityLevels, severityColors, recommendations, mlPrediction } = resultsData;
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={navigateBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">DASS-21 Assessment Results</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">Assessment Summary</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Depression</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{subScores.depression}/42</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors.depression}`}>
                  {severityLevels.depression}
                </span>
                {mlPrediction && (
                  <div className="flex items-center mt-3 text-sm">
                    <TrendingUp className={`h-4 w-4 mr-1.5 ${
                      mlPrediction.trend === 'improving' 
                        ? 'text-green-500' 
                        : mlPrediction.trend === 'stable' 
                          ? 'text-blue-500' 
                          : 'text-red-500'
                    }`} />
                    <span className="text-gray-600">
                      Trend: {mlPrediction.trend === 'improving' 
                        ? 'Improving' 
                        : mlPrediction.trend === 'stable' 
                          ? 'Stable' 
                          : 'Needs Attention'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Anxiety</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{subScores.anxiety}/42</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors.anxiety}`}>
                  {severityLevels.anxiety}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Stress</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{subScores.stress}/42</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors.stress}`}>
                  {severityLevels.stress}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Clinical Recommendations</h3>
              <ul className="space-y-2">
                {recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0">
              <button
                onClick={resetAssessment}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Take Assessment Again
              </button>
              
              <button
                onClick={navigateBack}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Understanding Your Results</h3>
            
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                The Depression Anxiety Stress Scale (DASS-21) is a set of three self-report scales designed to measure the emotional states of depression, anxiety and stress.
              </p>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Depression Scale</h4>
                <p>This scale assesses dysphoria, hopelessness, devaluation of life, self-deprecation, lack of interest/involvement, anhedonia, and inertia.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Anxiety Scale</h4>
                <p>This scale assesses autonomic arousal, skeletal muscle effects, situational anxiety, and subjective experience of anxious affect.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Stress Scale</h4>
                <p>This scale is sensitive to levels of chronic non-specific arousal. It assesses difficulty relaxing, nervous arousal, and being easily upset/agitated, irritable/over-reactive and impatient.</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700">
                  These results are intended for screening purposes only and do not constitute a clinical diagnosis. Please consult with a qualified healthcare professional for a comprehensive evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render assessment form
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={navigateBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">DASS-21 Assessment</h1>
        </div>
        
        <div className={`flex items-center ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'}`}>
          <button 
            onClick={toggleTimer}
            className="p-1 mr-2 rounded-full hover:bg-gray-100"
            title={timerActive ? "Pause timer" : "Resume timer"}
          >
            {timerActive ? "⏸️" : "▶️"}
          </button>
          <span className="font-mono text-lg font-bold">{formatTimeRemaining()}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900">Depression, Anxiety and Stress Scale</h2>
                <p className="text-sm text-gray-500">Assess your levels of depression, anxiety, and stress</p>
              </div>
            </div>
            
            <div className="text-sm font-medium text-gray-500">
              Question {currentQuestionIndex + 1} of {DASS21_QUESTIONS.length}
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-amber-50 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700">
                Please read each statement and select a number 0, 1, 2 or 3 which indicates how much the statement applied to you <strong>over the past week</strong>. 
                You have <strong>{formatTimeRemaining()}</strong> to complete all questions.
              </p>
              <p className="text-sm text-amber-700 mt-2">
                <strong>The rating scale is as follows:</strong>
              </p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                {RESPONSE_OPTIONS.map(option => (
                  <li key={option.value}>{option.value} = {option.text}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="relative w-full bg-gray-200 h-2 rounded-full mb-2">
              <div 
                className="absolute top-0 left-0 h-2 bg-indigo-600 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / DASS21_QUESTIONS.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Start</span>
              <span>Progress</span>
              <span>Finish</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {(() => {
              const { question, category } = getCurrentQuestion();
              return (
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 uppercase tracking-wide font-semibold">
                      {category}
                    </div>
                  </div>
                  <div className="flex items-start mb-6">
                    <p className="text-xl font-medium text-gray-900">
                      {currentQuestionIndex + 1}. {question}
                    </p>
                    <div className="ml-2 relative group">
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute z-10 hidden group-hover:block w-64 bg-black text-white text-xs rounded py-1 px-2 right-0 top-0">
                        This question helps assess your {category} level.
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                    {RESPONSE_OPTIONS.map(option => (
                      <div key={option.value} className="relative">
                        <input
                          type="radio"
                          id={`q${currentQuestionIndex}-${option.value}`}
                          name={`question-${currentQuestionIndex}`}
                          className="sr-only peer"
                          checked={responses[currentQuestionIndex] === option.value}
                          onChange={() => handleResponseChange(option.value)}
                        />
                        <label
                          htmlFor={`q${currentQuestionIndex}-${option.value}`}
                          className="flex flex-col items-center p-4 border rounded-lg text-sm cursor-pointer peer-checked:bg-indigo-50 peer-checked:border-indigo-500 peer-checked:text-indigo-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-bold text-2xl mb-2">{option.value}</span>
                          <span className="text-center">{option.text}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                currentQuestionIndex === 0
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Previous
            </button>
            
            {currentQuestionIndex < DASS21_QUESTIONS.length - 1 ? (
              <button
                onClick={goToNextQuestion}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitAssessment}
                disabled={!isAssessmentComplete() || isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                  isAssessmentComplete() && !isSubmitting
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-300 text-white cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
          
          {!isAssessmentComplete() && currentQuestionIndex === DASS21_QUESTIONS.length - 1 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
              <p className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Please answer all questions before submitting. Go back and check for any unanswered questions.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Question navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Question Navigation</h3>
        <div className="grid grid-cols-7 gap-2">
          {responses.map((response, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium
                ${currentQuestionIndex === index ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
                ${response !== -1 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-500 border border-gray-300'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About DASS-21</h3>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              The Depression, Anxiety and Stress Scale - 21 Items (DASS-21) is a set of three self-report scales designed to measure the emotional states of depression, anxiety and stress.
            </p>
            <p>
              Each of the three DASS-21 scales contains 7 items, divided into subscales with similar content. The depression scale assesses dysphoria, hopelessness, devaluation of life, self-deprecation, lack of interest/involvement, anhedonia, and inertia. The anxiety scale assesses autonomic arousal, skeletal muscle effects, situational anxiety, and subjective experience of anxious affect. The stress scale is sensitive to levels of chronic non-specific arousal.
            </p>
            <div className="p-4 bg-blue-50 rounded-lg flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700">
                This self-assessment is not a diagnostic tool. If you're experiencing significant distress, please consult with a qualified healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
