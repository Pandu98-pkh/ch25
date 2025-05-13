import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Quiz } from '../services/CourseCareer';
import { cn } from '../utils/cn';

interface QuizCourseProps {
  quiz: Quiz;
  onExit: () => void;
  onSubmit: () => void;
}

export default function QuizCourse({ quiz, onExit, onSubmit }: QuizCourseProps) {
  const { t } = useLanguage();
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Initialize quiz timer
  useEffect(() => {
    if (quiz.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60);
      setQuizStartTime(new Date());
    } else {
      setTimeRemaining(null);
    }
  }, [quiz.timeLimit]);

  // Timer countdown
  useEffect(() => {
    let timerId: number | null = null;
    
    if (timeRemaining !== null && timeRemaining > 0) {
      timerId = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            if (timerId) clearInterval(timerId);
            onSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timeRemaining, onSubmit]);
  
  const formatTimeRemaining = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);
  
  const goToNextQuestion = useCallback(() => {
    const totalQuestions = quiz.questions || 3;
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, quiz.questions]);
  
  const goToPrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);
  
  const goToQuestion = useCallback((index: number) => {
    const totalQuestions = quiz.questions || 3;
    
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  }, [quiz.questions]);
  
  const isQuestionAnswered = useCallback((questionIndex: number) => {
    return Boolean(quizAnswers[`q${questionIndex + 1}`]);
  }, [quizAnswers]);
  
  const handleQuizAnswer = useCallback((questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 sticky top-0 z-10 border-b">
        <button 
          onClick={() => setShowExitConfirmation(true)}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('course.exitQuiz')}
        </button>
        
        <h2 className="text-lg font-bold text-gray-900">{quiz.title}</h2>
        
        {timeRemaining !== null && (
          <div className={`text-sm font-medium px-3 py-1.5 rounded-full ${
            timeRemaining < 60 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <Clock className="h-4 w-4 inline mr-1" />
            {formatTimeRemaining(timeRemaining)}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-20">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('course.questionNavigation')}</h3>
            
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: quiz.questions || 3 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-full aspect-square flex items-center justify-center text-sm font-medium rounded ${
                    currentQuestionIndex === index
                      ? 'bg-brand-600 text-white'
                      : isQuestionAnswered(index)
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 flex justify-between mb-2">
                <span>{t('course.answered')}</span>
                <span>
                  {Object.keys(quizAnswers).length}/{quiz.questions || 3}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${(Object.keys(quizAnswers).length / (quiz.questions || 3)) * 100}%` }}
                ></div>
              </div>
              
              {Object.keys(quizAnswers).length === (quiz.questions || 3) && (
                <button
                  onClick={onSubmit}
                  className="w-full mt-6 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  {t('course.submitQuiz')}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Question header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('course.question')} {currentQuestionIndex + 1} 
                  <span className="text-gray-500 text-sm font-normal ml-2">
                    {t('course.ofQuestions').replace('{current}', (currentQuestionIndex + 1).toString())
                      .replace('{total}', (quiz?.questions || 3).toString())}
                  </span>
                </h3>
                <span className="text-sm text-gray-500">
                  {isQuestionAnswered(currentQuestionIndex) ? t('course.answered') : t('course.unanswered')}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-brand-600 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${((currentQuestionIndex + 1) / (quiz.questions || 3)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Question content */}
            <div className="prose max-w-none mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">
                {currentQuestionIndex + 1}. {t('course.sampleQuestion')} {currentQuestionIndex + 1}?
              </h4>
              <p className="text-gray-700 mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris?
              </p>
            </div>
            
            {/* Answer options */}
            <div className="space-y-3 mb-8">
              {['A', 'B', 'C', 'D'].map((option) => (
                <label 
                  key={option} 
                  className={cn(
                    "block w-full relative p-4 border rounded-lg transition-all cursor-pointer hover:bg-gray-50",
                    quizAnswers[`q${currentQuestionIndex + 1}`] === option
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                      : 'border-gray-200'
                  )}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`q${currentQuestionIndex + 1}-${option}`}
                      name={`question-${currentQuestionIndex + 1}`}
                      value={option}
                      onChange={() => handleQuizAnswer(`q${currentQuestionIndex + 1}`, option)}
                      checked={quizAnswers[`q${currentQuestionIndex + 1}`] === option}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mr-3">
                        {option}
                      </span>
                      <span className="text-gray-900">{t('course.sampleAnswer')} {option}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={goToPrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={cn(
                  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium",
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('course.previousQuestion')}
              </button>
              
              {currentQuestionIndex < (quiz.questions || 3) - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
                >
                  {t('course.nextQuestion')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={onSubmit}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  {t('course.finishQuiz')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('course.exitQuizTitle')}
              </h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700">
                {t('course.confirmExitQuiz')}
              </p>
            </div>
            <div className="px-5 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowExitConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
              >
                {t('course.exitQuiz')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
