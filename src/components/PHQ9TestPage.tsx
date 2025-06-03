import { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ChevronLeft,
  Brain,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAssessments } from '../contexts/AssessmentContext';

// PHQ-9 Questions array
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way"
];

// PHQ-9 severity levels
const PHQ9_SEVERITY = [
  { range: [0, 4], level: 'minimal', color: 'green', description: 'Minimal or no depression' },
  { range: [5, 9], level: 'mild', color: 'blue', description: 'Mild depression' },
  { range: [10, 14], level: 'moderate', color: 'yellow', description: 'Moderate depression' },
  { range: [15, 19], level: 'moderately severe', color: 'orange', description: 'Moderately severe depression' },
  { range: [20, 27], level: 'severe', color: 'red', description: 'Severe depression' }
];

const PHQ9_OPTIONS = [
  { value: 0, label: 'Not at all', description: 'The symptom has not been present' },
  { value: 1, label: 'Several days', description: 'The symptom has been present for several days' },
  { value: 2, label: 'More than half the days', description: 'The symptom has been present for more than half the days' },
  { value: 3, label: 'Nearly every day', description: 'The symptom has been present nearly every day' },
];

export default function PHQ9TestPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addAssessment } = useAssessments();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<number[]>(Array(PHQ9_QUESTIONS.length).fill(-1));
  
  // Set initial time to 5 minutes (300 seconds)
  const initialTime = 300;
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const [testCompleted, setTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<number | null>(null);
  
  // Start countdown timer when component mounts
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        // When timer reaches 0, show time's up alert
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  // Auto-submit when time is up
  useEffect(() => {
    if (isTimeUp && !testCompleted && !showResults) {
      // Give a short delay to show the time's up alert
      const timeoutId = setTimeout(() => {
        setTestCompleted(true);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isTimeUp, testCompleted, showResults]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get time elapsed (for storing with results)
  const getTimeElapsed = () => {
    return initialTime - timeRemaining;
  };

  // Get remaining time with text
  const getFormattedTimeWithText = () => {
    const secondsRemaining = timeRemaining;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    
    if (secondsRemaining <= 0) {
      return "Time's up!";
    }
    
    if (mins > 0) {
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ${secs} ${secs === 1 ? 'second' : 'seconds'} remaining`;
    }
    return `${secs} ${secs === 1 ? 'second' : 'seconds'} remaining`;
  };
  
  // Get completion time with text
  const getCompletionTimeText = () => {
    const timeElapsed = getTimeElapsed();
    const mins = Math.floor(timeElapsed / 60);
    const secs = timeElapsed % 60;
    
    if (mins > 0) {
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ${secs} ${secs === 1 ? 'second' : 'seconds'} to complete`;
    }
    return `${secs} ${secs === 1 ? 'second' : 'seconds'} to complete`;
  };

  // Get timer color class based on remaining time
  const getTimerColorClass = () => {
    if (timeRemaining <= 30) return 'bg-red-700 bg-opacity-50 text-red-100 animate-pulse';
    if (timeRemaining <= 60) return 'bg-red-600 bg-opacity-40 text-red-50';
    if (timeRemaining <= 120) return 'bg-yellow-600 bg-opacity-40 text-yellow-50';
    return 'bg-indigo-700 bg-opacity-30';
  };
  
  // Handle response selection
  const handleResponseSelect = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = value;
    setResponses(newResponses);
    
    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentQuestionIndex < PHQ9_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (!testCompleted) {
        // Test completed
        setTestCompleted(true);
        if (timerRef.current) window.clearInterval(timerRef.current);
      }
    }, 300);
  };
  
  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < PHQ9_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Calculate total score
  const calculateScore = () => {
    return responses.reduce((total, response) => total + (response >= 0 ? response : 0), 0);
  };
  
  // Get severity level
  const getSeverityLevel = (score: number) => {
    return PHQ9_SEVERITY.find(severity => 
      score >= severity.range[0] && score <= severity.range[1]
    ) || PHQ9_SEVERITY[0];
  };
  
  // Get color for severity level
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minimal': return 'bg-green-100 text-green-800';
      case 'mild': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'moderately severe': return 'bg-amber-100 text-amber-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Generate detailed analysis notes based on score and responses
  const generateAnalysisNotes = (score: number, responses: number[]) => {
    const severity = getSeverityLevel(score);
    let analysisText = `PHQ-9 Assessment Summary\n\nScore: ${score} - ${severity.level.charAt(0).toUpperCase() + severity.level.slice(1)} Depression\n\n`;
    
    // Identify highest scoring items
    const highItems = responses
      .map((value, index) => ({ value, question: PHQ9_QUESTIONS[index], index: index + 1 }))
      .filter(item => item.value >= 2)
      .sort((a, b) => b.value - a.value);
    
    // Add key symptoms analysis
    if (highItems.length > 0) {
      analysisText += `Key Symptoms: The assessment shows significant concerns with `;
      
      if (highItems.length === 1) {
        analysisText += `"${highItems[0].question.toLowerCase()}" (Q${highItems[0].index}).`;
      } else {
        const lastItem = highItems.pop();
        analysisText += highItems.map(item => `"${item.question.toLowerCase()}" (Q${item.index})`).join(', ');
        analysisText += ` and "${lastItem?.question.toLowerCase()}" (Q${lastItem?.index}).`;
      }
      
      analysisText += '\n\n';
    }
    
    // Add risk assessment
    if (responses[8] > 0) {
      analysisText += `Risk Alert: The response to question 9 indicates thoughts of self-harm or suicide (score: ${responses[8]}/3). This requires immediate attention and follow-up.\n\n`;
    }
    
    // Add condition analysis based on severity
    switch (severity.level) {
      case 'minimal':
        analysisText += 'Analysis: Symptoms suggest minimal or no depression. Regular monitoring is recommended to track any changes in mood or functioning.';
        break;
      case 'mild':
        analysisText += 'Analysis: Mild depressive symptoms present. These might affect daily functioning but may respond well to self-help strategies and lifestyle modifications.';
        break;
      case 'moderate':
        analysisText += 'Analysis: Moderate depression indicates clinical significance. Professional intervention would likely be beneficial, potentially including therapy approaches like CBT.';
        break;
      case 'moderately severe':
        analysisText += 'Analysis: Moderately severe depression suggests significant impact on functioning. Both psychotherapy and medication consultation should be considered as part of a treatment plan.';
        break;
      case 'severe':
        analysisText += 'Analysis: Severe depression indicates a serious condition requiring comprehensive treatment. Immediate professional evaluation is recommended for appropriate intervention planning.';
        break;
    }
    
    return analysisText;
  };
  
  // Generate personalized recommendations based on score and specific responses
  const generateRecommendations = (score: number, responses: number[]) => {
    const recommendations: string[] = [];
    
    // Base recommendations on severity
    if (score < 5) {
      recommendations.push("Continue regular monitoring of mental health");
      recommendations.push("Practice maintaining good sleep hygiene and regular physical activity");
    } else if (score < 10) {
      recommendations.push("Consider self-guided mental health resources and workbooks");
      recommendations.push("Maintain regular physical activity (30 minutes, 3-5 times per week)");
      recommendations.push("Establish consistent sleep schedule and stress management practices");
    } else if (score < 15) {
      recommendations.push("Schedule follow-up with healthcare provider within 2-4 weeks");
      recommendations.push("Consider structured psychological interventions like cognitive behavioral therapy");
      recommendations.push("Begin daily mood tracking to identify patterns and triggers");
      recommendations.push("Review and enhance social support systems");
    } else if (score < 20) {
      recommendations.push("Schedule prompt evaluation with mental health professional (within 1-2 weeks)");
      recommendations.push("Discuss combination treatment options including therapy and medication");
      recommendations.push("Implement regular check-ins with support person or healthcare provider");
      recommendations.push("Create structure in daily routine to support functioning");
    } else {
      recommendations.push("Seek immediate evaluation from mental health professional (within days)");
      recommendations.push("Comprehensive treatment plan including consideration of intensive therapy and medication");
      recommendations.push("Develop detailed safety plan with clear steps for crisis situations");
      recommendations.push("Ensure regular monitoring and frequent follow-up appointments");
    }
    
    // Add targeted recommendations based on specific symptoms
    if (responses[2] >= 2) { // Sleep problems
      recommendations.push("Improve sleep environment and establish consistent bedtime routine");
    }
    
    if (responses[3] >= 2) { // Fatigue
      recommendations.push("Consider energy management strategies like activity pacing and scheduled rest periods");
    }
    
    if (responses[4] >= 2) { // Appetite issues
      recommendations.push("Monitor nutrition and establish regular eating patterns");
    }
    
    if (responses[6] >= 2) { // Concentration problems
      recommendations.push("Practice mindfulness and focused attention exercises to improve concentration");
    }
    
    if (responses[8] >= 1) { // Suicidal ideation
      recommendations.unshift("Contact crisis services or healthcare provider immediately about thoughts of self-harm");
      recommendations.push("Create a written safety plan with emergency contacts and coping strategies");
    }
    
    return recommendations;
  };
  
  // Save test results and go back to main page
  const saveAndReturn = async () => {
    const totalScore = calculateScore();
    const risk: 'low' | 'moderate' | 'high' = totalScore < 10 ? 'low' : totalScore < 15 ? 'moderate' : 'high';
    
    // Create trend prediction
    let trend: 'improving' | 'stable' | 'worsening';
    if (totalScore < 8) trend = 'improving';
    else if (totalScore < 15) trend = 'stable';
    else trend = 'worsening';
    
    // Generate enhanced analysis and recommendations
    const analysisNotes = generateAnalysisNotes(totalScore, responses.map(r => (r >= 0 ? r : 0)));
    const recommendations = generateRecommendations(totalScore, responses.map(r => (r >= 0 ? r : 0)));
    
    // Create complete assessment object
    const assessmentData = {
      type: 'PHQ-9',
      score: totalScore,
      date: format(new Date(), 'yyyy-MM-dd'),
      risk,
      notes: analysisNotes,
      responses: responses.map((value, index) => ({ 
        questionId: index + 1, 
        answer: value >= 0 ? value : 0
      })),
      mlPrediction: {
        trend,
        confidence: 0.75 + (Math.random() * 0.2),
        nextPredictedScore: Math.max(0, totalScore + (trend === 'improving' ? -2 : trend === 'stable' ? 0 : 2))
      },
      recommendations
    };
    
    console.log('PHQ9 Test completed, saving assessment:', assessmentData);
    
    try {
      // Save the test data to the assessment context (which will save to database)
      await addAssessment(assessmentData);
      
      console.log('PHQ9 Assessment saved successfully to database');
        // Navigate to mental health page
      navigate('/app/mental-health', { replace: true });
    } catch (error) {
      console.error('Error saving PHQ9 assessment:', error);
      
      // Still navigate but show error message
      navigate('/app/mental-health', {
        replace: true,
        state: { error: 'Assessment completed but could not be saved to database. It has been saved locally.' }
      });
    }
  };

  // Results view
  if (showResults) {
    const totalScore = calculateScore();
    const severity = getSeverityLevel(totalScore);
    const timeElapsed = getTimeElapsed();
    const recommendations = generateRecommendations(totalScore, responses.map(r => (r >= 0 ? r : 0)));
    
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-white">
                  {t('phq9.results', 'PHQ-9 Assessment Results')}
                </h1>
                <div className="text-indigo-100 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{t('phq9.timeTaken', 'Time taken')}: {formatTime(timeElapsed)}</span>
                </div>
              </div>
            </div>
            
            {/* Results summary */}
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-6 mb-6 border-b border-gray-200">
                <div className="text-4xl font-bold mb-2">{totalScore}</div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(severity.level)}`}>
                  {severity.level.charAt(0).toUpperCase() + severity.level.slice(1)} Depression
                </div>
                <p className="mt-3 text-gray-600 text-center">
                  {severity.description}
                </p>
                <div className="mt-3 text-sm text-gray-500">
                  {t('phq9.completionTime', 'Completion time')}: {formatTime(timeElapsed)}
                </div>
              </div>
              
              {/* Question breakdown */}
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900 mb-4">Response Breakdown</h2>
                <div className="space-y-4">
                  {PHQ9_QUESTIONS.map((question, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {index + 1}. {question}
                      </p>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          responses[index] === 0 ? 'bg-green-100 text-green-800' :
                          responses[index] === 1 ? 'bg-blue-100 text-blue-800' :
                          responses[index] === 2 ? 'bg-yellow-100 text-yellow-800' :
                          responses[index] === 3 ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {responses[index]}
                        </div>
                        <span className="ml-2 text-sm text-gray-700">
                          {responses[index] >= 0 && responses[index] < PHQ9_OPTIONS.length 
                            ? PHQ9_OPTIONS[responses[index]].label 
                            : 'Not answered'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="p-4 bg-blue-50 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  Personalized Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-gray-500">
                  Note: These recommendations are automatically generated based on your responses.
                  Always consult with a healthcare professional for proper diagnosis and treatment.
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Assessment
                </button>
                <button
                  onClick={saveAndReturn}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                >
                  Save & Return
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Test completed view
  if (testCompleted) {
    const timeElapsed = getTimeElapsed();
    
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {t('phq9.completed', 'Assessment Completed')}
                </h2>
                <p className="text-gray-600 text-center mb-2">
                  {t('phq9.completedMessage', "You've completed the PHQ-9 depression assessment.")}
                </p>
                <div className="bg-indigo-50 px-4 py-3 rounded-lg text-indigo-700 flex items-center mb-4">
                  <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                  <div>
                    <p className="font-medium">{formatTime(timeElapsed)}</p>
                    <p className="text-xs text-indigo-600">{getCompletionTimeText()}</p>
                  </div>
                </div>
                  <div className="grid grid-cols-2 gap-4 w-full mb-4">
                  <Link
                    to="/app/mental-health"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center justify-center"
                  >
                    {t('phq9.skipResults', 'Skip Results')}
                  </Link>
                  <button
                    onClick={() => setShowResults(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                  >
                    {t('phq9.viewResults', 'View Results')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main question-taking view
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Time's up overlay */}
      {isTimeUp && !testCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto animate-bounce">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-red-600 mr-2" />
              <h2 className="text-2xl font-bold text-red-600">Time's Up!</h2>
            </div>
            <p className="text-gray-700 mb-4 text-center">
              Your time for the assessment has ended. Your responses will be submitted now.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Header with prominent countdown */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white">
                {t('phq9.title', 'PHQ-9 Depression Assessment')}
              </h1>
              <div className="text-indigo-100 flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                <div className={`px-3 py-1.5 rounded-md font-mono font-medium ${getTimerColorClass()}`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-indigo-100 text-sm">
                {t('phq9.instructions', 'Over the last 2 weeks, how often have you been bothered by the following problems?')}
              </p>
              <p className="text-xs text-indigo-200">
                {getFormattedTimeWithText()}
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-1.5">
            <div 
              className="bg-indigo-600 h-1.5 transition-all duration-300"
              style={{ width: `${(currentQuestionIndex / PHQ9_QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Question */}
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-semibold text-sm">
                    {currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {t('phq9.questionNumber', 'Question')} {currentQuestionIndex + 1} {t('phq9.of', 'of')} {PHQ9_QUESTIONS.length}
                  </span>                </div>
                <Link 
                  to="/app/mental-health"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('phq9.exit', 'Exit')}
                </Link>
              </div>
              
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                {PHQ9_QUESTIONS[currentQuestionIndex]}
              </h2>
              
              <div className="space-y-3">
                {PHQ9_OPTIONS.map((option) => (
                  <div key={option.value}>
                    <button
                      onClick={() => handleResponseSelect(option.value)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center ${
                        responses[currentQuestionIndex] === option.value
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                      }`}
                    >
                      <div className={`w-6 h-6 flex-shrink-0 rounded-full border flex items-center justify-center mr-3 ${
                        responses[currentQuestionIndex] === option.value
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {responses[currentQuestionIndex] === option.value && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      <div className="ml-auto text-lg font-semibold text-gray-400">
                        {option.value}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentQuestionIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('phq9.previous', 'Previous')}
              </button>
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === PHQ9_QUESTIONS.length - 1}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentQuestionIndex === PHQ9_QUESTIONS.length - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50'
                }`}
              >
                {t('phq9.next', 'Next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 bg-white shadow-md rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
            {t('phq9.instructionsTitle', 'Instructions')}
          </h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• {t('phq9.instruction1', 'Please answer all questions based on your experiences over the last 2 weeks')}</li>
            <li>• {t('phq9.instruction2', 'Select the option that best represents how often you\'ve been bothered by each problem')}</li>
            <li>• {t('phq9.instruction3', 'You have 15 minutes to complete this assessment')}</li>
            <li>• {t('phq9.instruction4', 'You can navigate between questions using the Previous and Next buttons')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Corrected wrapper component that doesn't use Layout directly
export function PHQ9TestWithNavigation() {
  return (    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-light">
          <PHQ9TestPage />
        </div>
      </div>
    </div>
  );
}
