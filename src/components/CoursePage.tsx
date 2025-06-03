import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowLeft, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  Award, 
  User, 
  Star,
  ChevronRight,
  Download,
  ExternalLink,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';
import { format } from 'date-fns';
import { 
  Course, 
  Module, 
  Resource, 
  Quiz, 
  Discussion, 
  Lesson, 
  getCourseWithResources 
} from '../services/CourseCareer';
import VideoCourse from './VideoCourse';
import QuizCourse from './QuizCourse';

const LessonTypeTag = ({ type }: { type: Lesson['type'] }) => {
  const { t } = useLanguage();
  
  const typeConfig = {
    video: { bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: <PlayCircle className="h-3 w-3 mr-1" /> },
    reading: { bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', icon: <BookOpen className="h-3 w-3 mr-1" /> },
    practice: { bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: <FileText className="h-3 w-3 mr-1" /> },
    discussion: { bgColor: 'bg-purple-100', textColor: 'text-purple-800', icon: <MessageCircle className="h-3 w-3 mr-1" /> }
  };
  
  const config = typeConfig[type];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      {config.icon}
      {t(`course.lessonType.${type}`)}
    </span>
  );
};

const PracticeExercise = ({ lesson, onComplete }: { lesson: Lesson, onComplete: () => void }) => {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiChoiceAnswer, setMultiChoiceAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  
  const handleTextAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, textAnswer: value }));
  };
  
  const handleMultiChoiceChange = (option: string) => {
    setMultiChoiceAnswer(option);
  };
  
  const checkAnswers = () => {
    setSubmitted(true);
    
    const isCorrect = !!answers.textAnswer && !!multiChoiceAnswer;
    
    setFeedback(isCorrect ? 'success' : 'error');
    
    if (isCorrect) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-amber-200 shadow-sm my-6 overflow-hidden">
      <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-amber-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">{t('course.practiceExercise')}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">{t('course.instructions')}</h4>
          <div className="prose prose-amber max-w-none text-gray-700">
            <p>
              {lesson.content || 
                "This practice exercise helps you apply what you've learned in a hands-on way. Follow the instructions below to complete the exercise."}
            </p>
          </div>
        </div>
        
        <div className="mb-6 bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="flex items-center text-base font-medium text-gray-900 mb-3">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mr-2">1</span>
            {t('course.practicePart1')}
          </h4>
          <p className="text-gray-700 ml-7">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          
          <div className="ml-7 mt-3 mb-4">
            <textarea 
              placeholder={t('course.enterYourAnswer')}
              className={cn(
                "w-full rounded-md shadow-sm", 
                feedback === 'error' && !answers.textAnswer ? 
                  "border-red-300 focus:border-red-500 focus:ring-red-500" : 
                  "border-gray-300 focus:border-amber-500 focus:ring-amber-500"
              )}
              rows={3}
              value={answers.textAnswer || ''}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              disabled={feedback === 'success'}
            ></textarea>
            {submitted && !answers.textAnswer && feedback === 'error' && (
              <p className="mt-1 text-sm text-red-600">{t('course.answerRequired')}</p>
            )}
          </div>
          
          <h4 className="flex items-center text-base font-medium text-gray-900 mb-3">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mr-2">2</span>
            {t('course.practicePart2')}
          </h4>
          <p className="text-gray-700 ml-7">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          
          <div className="ml-7 mt-3">
            <div className="flex flex-wrap gap-4">
              {['Option A', 'Option B', 'Option C'].map((option) => (
                <label 
                  key={option} 
                  className={cn(
                    "inline-flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors",
                    multiChoiceAnswer === option ? 
                      "bg-amber-50 border-amber-300 text-amber-800" : 
                      "bg-white border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <input 
                    type="radio" 
                    name="practiceOptions" 
                    value={option}
                    checked={multiChoiceAnswer === option}
                    onChange={() => handleMultiChoiceChange(option)}
                    className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    disabled={feedback === 'success'}
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {submitted && !multiChoiceAnswer && feedback === 'error' && (
              <p className="mt-1 text-sm text-red-600">{t('course.selectionRequired')}</p>
            )}
          </div>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="flex items-center text-base font-medium text-gray-900 mb-2">
            <Award className="h-5 w-5 text-amber-600 mr-2" />
            {t('course.bonusChallenge')}
          </h4>
          <p className="text-gray-700">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
        
        {feedback === 'success' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
              <div>
                <h5 className="text-base font-medium text-green-800">{t('course.goodJob')}</h5>
                <p className="text-sm text-green-700">{t('course.exerciseCompleted')}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          {feedback === 'success' ? (
            <button
              onClick={onComplete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
            >
              {t('course.markAsCompleted')}
              <CheckCircle className="ml-2 h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={checkAnswers}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
            >
              {t('course.checkAnswers')}
              <CheckCircle className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const DiscussionLesson = ({ lesson, onComplete }: { lesson: Lesson, onComplete: () => void }) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [discussions, setDiscussions] = useState([
    {
      id: '1',
      author: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'I found this concept really helpful for understanding the broader context. Has anyone applied this to a real-world project?',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      likes: 8,
      replies: [
        {
          id: '1-1',
          author: 'Emily Chen',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          content: 'Yes! I used it in my last project and it really streamlined our workflow.',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        }
      ]
    },
    {
      id: '2',
      author: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      content: 'Could someone explain how this relates to what we learned in Module 2? I\'m having trouble connecting the concepts.',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      likes: 3,
      replies: []
    }
  ]);

  const handlePostComment = () => {
    if (!comment.trim()) return;
    
    const newDiscussion = {
      id: `new-${Date.now()}`,
      author: 'You',
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      content: comment,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: []
    };
    
    setDiscussions([newDiscussion, ...discussions]);
    setComment('');
    setSubmitted(true);
    
    // Show success message briefly
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-purple-200 shadow-sm my-6 overflow-hidden">
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
        <div className="flex items-center">
          <MessageCircle className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">{t('course.discussionForum')}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">{t('course.discussionPrompt')}</h4>
          <div className="prose prose-purple max-w-none text-gray-700">
            <p>{lesson.content || "Join the discussion with your peers! Share your thoughts, ask questions, and engage with others learning this material."}</p>
          </div>
        </div>
        
        {/* New comment form */}
        <div className="mb-6 bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">{t('course.yourThoughts')}</h4>
          <textarea
            placeholder={t('course.writeComment')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
          <div className="flex justify-end mt-3">
            <button
              onClick={handlePostComment}
              disabled={!comment.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                comment.trim() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {t('course.postComment')}
            </button>
          </div>
        </div>
        
        {/* Existing discussions */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 mb-3">{t('course.classDiscussion')}</h4>
          
          {discussions.map((discussion) => (
            <div key={discussion.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex">
                <img
                  src={discussion.avatar}
                  alt={discussion.author}
                  className="h-10 w-10 rounded-full object-cover mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-gray-900">{discussion.author}</h5>
                    <span className="text-xs text-gray-500">{format(new Date(discussion.timestamp), 'PPp')}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{discussion.content}</p>
                  <div className="flex items-center space-x-4">
                    <button className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {discussion.likes}
                    </button>
                    <button className="text-sm text-gray-500 hover:text-purple-600">{t('course.reply')}</button>
                  </div>
                </div>
              </div>
              
              {/* Replies */}
              {discussion.replies.length > 0 && (
                <div className="ml-12 mt-3 pl-4 border-l-2 border-gray-100">
                  {discussion.replies.map((reply) => (
                    <div key={reply.id} className="mt-3">
                      <div className="flex">
                        <img
                          src={reply.avatar}
                          alt={reply.author}
                          className="h-8 w-8 rounded-full object-cover mr-2"
                        />
                        <div>
                          <div className="flex items-center mb-1">
                            <h6 className="text-sm font-medium text-gray-900">{reply.author}</h6>
                            <span className="text-xs text-gray-500 ml-2">{format(new Date(reply.timestamp), 'PP')}</span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {submitted && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
              <div>
                <h5 className="text-base font-medium text-green-800">{t('course.thankYou')}</h5>
                <p className="text-sm text-green-700">{t('course.commentPosted')}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onComplete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
          >
            {t('course.markAsCompleted')}
            <CheckCircle className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'discussions' | 'resources'>('overview');
  const [allResources, setAllResources] = useState<Resource[]>([]);
  
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [showLessonContent, setShowLessonContent] = useState(false);
  const [showQuizContent, setShowQuizContent] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Fetch course data
  const fetchCourseData = useCallback(async (id: string) => {
    try {
      return getCourseWithResources(id);
    } catch (error) {
      console.error(`Error fetching course data for ID ${id}:`, error);
      throw error;
    }
  }, []);
  
  useEffect(() => {
    if (courseId) {
      setLoading(true);
      fetchCourseData(courseId)
        .then(({ course, resources }) => {
          setCourse(course);
          setAllResources(resources);
          
          if (course.modules.length > 0) {
            setActiveModule(course.modules[0].id);
          }
        })
        .catch(error => {
          console.error('Error loading course:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [courseId, fetchCourseData]);
  
  // Lesson management
  const markLessonCompleted = useCallback((lessonId: string) => {
    if (!course) return;
    
    const updatedCourse = {...course};
    const moduleIndex = updatedCourse.modules.findIndex(m => m.id === activeModule);
    
    if (moduleIndex === -1) return;
    
    const lessonIndex = updatedCourse.modules[moduleIndex].lessons.findIndex(l => l.id === lessonId);
    
    if (lessonIndex === -1) return;
    
    updatedCourse.modules[moduleIndex].lessons[lessonIndex].completed = true;
    
    const allLessonsCompleted = updatedCourse.modules[moduleIndex].lessons.every(l => l.completed);
    const allQuizzesCompleted = updatedCourse.modules[moduleIndex].quizzes.every(q => q.completed);
    
    if (allLessonsCompleted && allQuizzesCompleted) {
      updatedCourse.modules[moduleIndex].completed = true;
    }
    
    updatedCourse.progress = calculateProgress(updatedCourse);
    
    setCourse(updatedCourse);
    
    console.log(`Lesson ${lessonId} marked as completed`);
  }, [course, activeModule]);
  
  const calculateProgress = useCallback((courseData: Course) => {
    const totalItems = courseData.modules.reduce(
      (count, module) => count + module.lessons.length + module.quizzes.length,
      0
    );
    
    const completedItems = courseData.modules.reduce(
      (count, module) => 
        count + 
        module.lessons.filter(l => l.completed).length + 
        module.quizzes.filter(q => q.completed).length,
      0
    );
    
    return Math.round((completedItems / totalItems) * 100);
  }, []);
  
  // Navigation between lesson and module
  const startLesson = useCallback((lesson: Lesson) => {
    setCurrentLesson(lesson);
    setShowLessonContent(true);
    setShowQuizContent(false);
    setCurrentQuiz(null);
  }, []);
  
  const completeCurrentLesson = useCallback(() => {
    if (currentLesson) {
      markLessonCompleted(currentLesson.id);
      setShowLessonContent(false);
      setCurrentLesson(null);
    }
  }, [currentLesson, markLessonCompleted]);
  
  // Quiz management
  const startQuiz = useCallback((quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setShowQuizContent(true);
    setShowLessonContent(false);
    setCurrentLesson(null);
  }, []);
  
  const exitQuiz = useCallback(() => {
    setShowExitConfirmation(false);
    setShowQuizContent(false);
    setCurrentQuiz(null);
  }, []);
  
  const submitQuiz = useCallback(() => {
    if (!currentQuiz || !course) return;
    
    const score = Math.floor(Math.random() * 41) + 60;
    
    const updatedCourse = {...course};
    const moduleIndex = updatedCourse.modules.findIndex(m => m.id === activeModule);
    
    if (moduleIndex === -1) return;
    
    const quizIndex = updatedCourse.modules[moduleIndex].quizzes.findIndex(q => q.id === currentQuiz.id);
    
    if (quizIndex === -1) return;
    
    updatedCourse.modules[moduleIndex].quizzes[quizIndex].completed = true;
    updatedCourse.modules[moduleIndex].quizzes[quizIndex].score = score;
    
    const allLessonsCompleted = updatedCourse.modules[moduleIndex].lessons.every(l => l.completed);
    const allQuizzesCompleted = updatedCourse.modules[moduleIndex].quizzes.every(q => q.completed);
    
    if (allLessonsCompleted && allQuizzesCompleted) {
      updatedCourse.modules[moduleIndex].completed = true;
    }
    
    updatedCourse.progress = calculateProgress(updatedCourse);
    
    setCourse(updatedCourse);
    setShowQuizContent(false);
    setCurrentQuiz(null);
    
    console.log(`Quiz ${currentQuiz.id} submitted with score ${score}`);
  }, [course, currentQuiz, activeModule, calculateProgress]);

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="h-40 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="md:col-span-3 space-y-4">
            <div className="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-60 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('course.notFound')}</h2>
        <p className="text-gray-600 mb-6">{t('course.notFoundDescription')}</p>
        <button
          onClick={() => navigate('/app/career')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>
      </div>
    );
  }

  const currentModule = course.modules.find(m => m.id === activeModule) || course.modules[0];
  
  const completedLessons = course.modules.reduce(
    (count, module) => count + module.lessons.filter(lesson => lesson.completed).length,
    0
  );
  const totalLessons = course.modules.reduce(
    (count, module) => count + module.lessons.length,
    0
  );
  
  const completedQuizzes = course.modules.reduce(
    (count, module) => count + module.quizzes.filter(quiz => quiz.completed).length,
    0
  );
  const totalQuizzes = course.modules.reduce(
    (count, module) => count + module.quizzes.length,
    0
  );
  
  const totalDuration = course.modules.reduce(
    (total, module) => total + module.duration,
    0
  );
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative h-48 bg-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/80 to-brand-800/80 flex items-center p-8">
            <div>              <button
                onClick={() => navigate('/app/career')}
                className="inline-flex items-center text-sm font-medium text-white mb-4 hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('course.backToCourses')}
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{course.title}</h1>
              <div className="flex flex-wrap items-center text-white/80 text-sm space-x-4">
                <span className="inline-flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {totalDuration} {t('course.minutes')}
                </span>
                <span className="inline-flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {course.level}
                </span>
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(course.startDate), 'PPP')}
                </span>
                <span className="inline-flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {course.enrollmentCount} {t('course.students')}
                </span>
                <span className="inline-flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-300" />
                  {course.rating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('course.progress')}</h3>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('course.completion')}</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-brand-600 h-2.5 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>{t('course.lessons')}</span>
                  <span>{completedLessons}/{totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('course.quizzes')}</span>
                  <span>{completedQuizzes}/{totalQuizzes}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('course.modules')}</h3>
              <div className="space-y-3">
                {course.modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors flex items-start",
                      activeModule === module.id
                        ? "bg-brand-50 text-brand-700 border border-brand-200"
                        : "hover:bg-gray-50 text-gray-800 border border-transparent"
                    )}
                  >
                    <div className="mr-3 mt-0.5">
                      {module.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-medium text-gray-500">
                          {module.order}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{module.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {module.duration} {t('course.minutes')} • {module.lessons.length} {t('course.lessons').toLowerCase()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-4" aria-label="Tabs">
                {['overview', 'modules', 'discussions', 'resources'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                      activeTab === tab
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    {t(`course.tabs.${tab}`)}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{t('course.description')}</h2>
                    <p className="text-gray-700">{course.overview}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{t('course.learningObjectives')}</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {course.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">{t('course.prerequisites')}</h2>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        {course.prerequisites.map((prerequisite, index) => (
                          <li key={index}>{prerequisite}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{t('course.instructors')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.instructors.map((instructor) => (
                        <div key={instructor.id} className="flex items-start border border-gray-200 rounded-lg p-4">
                          <img 
                            src={instructor.photo} 
                            alt={instructor.name}
                            className="h-16 w-16 rounded-full object-cover mr-4"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{instructor.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{instructor.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-3">{instructor.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'modules' && currentModule && (
                <div className="space-y-6">
                  {showLessonContent && currentLesson ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => setShowLessonContent(false)}
                          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-800"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {t('course.backToModule')}
                        </button>
                        <span className="text-sm text-gray-500">{currentLesson.duration} {t('course.minutes')}</span>
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{currentLesson.title}</h2>
                        <div className="mt-2">
                          <LessonTypeTag type={currentLesson.type} />
                        </div>
                      </div>
                      
                      <div className="prose max-w-none">
                        <p>
                          {currentLesson.content || 
                            "This is placeholder content for this lesson. In a real application, this would contain the actual lesson content such as text, videos, or interactive elements."}
                        </p>
                        
                        {currentLesson.type === 'video' && (
                          <VideoCourse lesson={currentLesson} />
                        )}
                        
                        {currentLesson.type === 'reading' && (
                          <div className="bg-white rounded-lg border border-gray-200 p-6 my-6">
                            <div className="max-w-3xl mx-auto">
                              <div className="flex items-center justify-center mb-6">
                                <BookOpen className="h-8 w-8 text-indigo-600 mr-2" />
                                <h3 className="text-xl font-medium text-gray-900">{t('course.readingMaterial')}</h3>
                              </div>
                              <div className="prose prose-indigo prose-lg max-w-none leading-relaxed">
                                <p className="text-lg">
                                  {currentLesson.content || 
                                    "This is placeholder content for this reading lesson. In a real application, this would contain well-formatted text with headings, paragraphs, and potentially images for a better reading experience."}
                                </p>
                                <h4 className="text-xl font-medium mt-6 mb-4">Key Concepts</h4>
                                <p>
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                </p>
                                <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-50 text-indigo-800">
                                  "The key to successful learning is understanding the fundamental concepts and principles rather than memorizing facts."
                                </blockquote>
                                <p>
                                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentLesson.type === 'practice' && (
                          <PracticeExercise 
                            lesson={currentLesson} 
                            onComplete={completeCurrentLesson}
                          />
                        )}

                        {currentLesson.type === 'discussion' && (
                          <DiscussionLesson
                            lesson={currentLesson}
                            onComplete={completeCurrentLesson}
                          />
                        )}
                        
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur
                          interdum, nisl nisi consectetur purus, eget porttitor nisl nisl eget diam.
                        </p>
                      </div>
                      
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={completeCurrentLesson}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
                        >
                          {currentLesson.completed ? t('course.lessonCompleted') : t('course.markAsCompleted')}
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : showQuizContent && currentQuiz ? (
                    <QuizCourse 
                      quiz={currentQuiz}
                      onExit={exitQuiz}
                      onSubmit={submitQuiz}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">{currentModule.title}</h2>
                        <span className="text-sm text-gray-500">{currentModule.duration} {t('course.minutes')}</span>
                      </div>
                      
                      <p className="text-gray-700">{currentModule.description}</p>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">{t('course.lessons')}</h3>
                        <div className="space-y-3">
                          {currentModule.lessons.map((lesson) => {
                            const LessonIcon = {
                              'video': PlayCircle,
                              'reading': BookOpen,
                              'practice': FileText,
                              'discussion': MessageCircle
                            }[lesson.type];
                            
                            return (
                              <div 
                                key={lesson.id}
                                className="flex items-start border border-gray-200 rounded-lg p-4 hover:border-brand-300 transition-colors"
                              >
                                <div className={cn(
                                  "p-2 rounded-lg mr-4",
                                  lesson.completed ? "bg-green-50" : "bg-gray-50"
                                )}>
                                  <LessonIcon className={cn(
                                    "h-5 w-5",
                                    lesson.completed ? "text-green-600" : "text-gray-500"
                                  )} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <span>{lesson.duration} {t('course.minutes')}</span>
                                        <span>•</span>
                                        <LessonTypeTag type={lesson.type} />
                                      </div>
                                    </div>
                                    {lesson.completed ? (
                                      <button 
                                        onClick={() => startLesson(lesson)}
                                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                                      >
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        {t('course.review')}
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => startLesson(lesson)}
                                        className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700"
                                      >
                                        {t('course.start')}
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {currentModule.quizzes.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">{t('course.quizzes')}</h3>
                          <div className="space-y-3">
                            {currentModule.quizzes.map((quiz) => (
                              <div 
                                key={quiz.id}
                                className="flex items-start border border-gray-200 rounded-lg p-4 hover:border-brand-300 transition-colors"
                              >
                                <div className={cn(
                                  "p-2 rounded-lg mr-4",
                                  quiz.completed ? "bg-green-50" : "bg-amber-50"
                                )}>
                                  <Award className={cn(
                                    "h-5 w-5",
                                    quiz.completed ? "text-green-600" : "text-amber-600"
                                  )} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                                      <p className="text-sm text-gray-500 mt-1">
                                        {quiz.questions} {t('course.questions')} • {quiz.timeLimit} {t('course.minutes')}
                                      </p>
                                      {quiz.completed && quiz.score !== undefined && (
                                        <p className="text-sm font-medium text-green-600 mt-1">
                                          {t('course.score')}: {quiz.score}%
                                        </p>
                                      )}
                                    </div>
                                    {quiz.completed ? (
                                      <button 
                                        onClick={() => startQuiz(quiz)}
                                        className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700"
                                      >
                                        {t('course.retake')}
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => startQuiz(quiz)}
                                        className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700"
                                      >
                                        {t('course.takeQuiz')}
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {activeTab === 'discussions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{t('course.discussions')}</h2>
                    <button className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t('course.newDiscussion')}
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
                    {course.discussions.map((discussion, index) => (
                      <div key={discussion.id} className={`p-6 transition-colors hover:bg-gray-50 ${index === 0 ? 'border-t-0' : ''}`}>
                        <div className="flex items-start">
                          {discussion.authorPhoto && (
                            <img 
                              src={discussion.authorPhoto} 
                              alt={discussion.authorName}
                              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm mr-4"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                              <h3 className="font-semibold text-gray-900 text-base mb-1 sm:mb-0">{discussion.authorName}</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                <span>{format(new Date(discussion.timestamp), 'PPp')}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3 line-clamp-2 sm:line-clamp-none">{discussion.content}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                              <button className="inline-flex items-center text-sm text-gray-600 hover:text-brand-600 transition-colors">
                                <ThumbsUp className="h-4 w-4 mr-1.5" />
                                <span>{discussion.likes}</span>
                              </button>
                              <button className="inline-flex items-center text-sm text-gray-600 hover:text-brand-600 transition-colors">
                                <MessageCircle className="h-4 w-4 mr-1.5" />
                                <span>{discussion.replies} {t('course.replies')}</span>
                              </button>
                              <button className="inline-flex items-center text-sm text-brand-600 hover:text-brand-700 ml-auto">
                                {t('course.viewDiscussion')}
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Optional: Preview of replies if any */}
                        {discussion.replies > 0 && (
                          <div className="mt-4 ml-16 pl-4 border-l-2 border-gray-200">
                            <div className="flex items-start">
                              <img 
                                src="https://randomuser.me/api/portraits/women/62.jpg" 
                                alt="Reply author"
                                className="h-8 w-8 rounded-full object-cover mr-3"
                              />
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium text-sm text-gray-900">Jane Smith</h4>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">{format(new Date(discussion.timestamp), 'PP')}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-1">
                                  Great point! I found that particularly helpful when working through module 2.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Empty state when no discussions */}
                  {course.discussions.length === 0 && (
                    <div className="text-center py-12 px-4 border border-gray-200 rounded-lg bg-gray-50">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t('course.noDiscussions')}</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {t('course.startDiscussionPrompt')}
                      </p>
                      <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">
                        {t('course.startFirstDiscussion')}
                      </button>
                    </div>
                  )}
                  
                  {/* Pagination for longer discussion lists */}
                  {course.discussions.length > 5 && (
                    <div className="flex justify-center mt-8">
                      <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                        <a href="#" className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Previous</span>
                          <ArrowLeft className="h-4 w-4" />
                        </a>
                        <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-brand-600 hover:bg-gray-50">1</a>
                        <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</a>
                        <a href="#" className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      </nav>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{t('course.allResources')}</h2>
                  
                  <div className="space-y-4">
                    {allResources.map((resource) => {
                      const ResourceIcon = {
                        'pdf': FileText,
                        'video': PlayCircle,
                        'article': BookOpen,
                        'document': FileText,
                        'presentation': FileText
                      }[resource.type];
                      
                      return (
                        <div 
                          key={resource.id}
                          className="flex items-start border border-gray-200 rounded-lg p-4 hover:border-brand-300 transition-colors"
                        >
                          <div className="p-2 bg-blue-50 rounded-lg mr-4">
                            <ResourceIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{resource.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {t(`course.resourceType.${resource.type}`)}
                                  {resource.size && ` • ${(resource.size / 1024).toFixed(1)} MB`}
                                  {resource.duration && ` • ${resource.duration} ${t('course.minutes')}`}
                                </p>
                              </div>
                              <div className="flex space-x-3">
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  {t('course.view')}
                                </a>
                                <a
                                  href={resource.url}
                                  download
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  {t('course.download')}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Exit Confirmation Modal */}
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
                onClick={exitQuiz}
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