import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Video, 
  ClipboardCheck, 
  GraduationCap, 
  ChevronRight, 
  Award, 
  CheckCircle,
  Clock,
  Compass,
  Layers,
  Monitor,
  Trophy,
  Users,
  BrainCircuit,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { CareerAssessment, CareerResource } from '../types';
import { cn } from '../utils/cn';
import { searchCareerResources, getCareerResources } from '../services/careerService';
import RiasecAssessment, { RiasecResult } from './RiasecAssessment';
import RiasecResults from './RiasecResults';
import MbtiAssessment, { MbtiResult } from './MbtiAssessment';
import MbtiResults from './MbtiResults';

const typeIcons = {
  article: BookOpen,
  video: Video,
  assessment: ClipboardCheck,
  program: GraduationCap,
  course: Monitor,
  module: Layers,
  path: Compass,
  quiz: Award,
  certification: Trophy,
};

const typeColors = {
  article: 'bg-blue-100 text-blue-700',
  video: 'bg-purple-100 text-purple-700',
  assessment: 'bg-green-100 text-green-700',
  program: 'bg-orange-100 text-orange-700',
  course: 'bg-emerald-100 text-emerald-700',
  module: 'bg-indigo-100 text-indigo-700',
  path: 'bg-sky-100 text-sky-700',
  quiz: 'bg-amber-100 text-amber-700',
  certification: 'bg-rose-100 text-rose-700',
};

// Data struktur tambahan untuk LMS
interface Module {
  id: string;
  title: string;
  description: string;
  duration: number; // dalam menit
  completed: boolean;
  resources: CareerResource[];
  quizzes: Quiz[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  progress: number; // persentase penyelesaian 0-100
  instructor: string;
  thumbnail: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  courses: Course[];
  progress: number;
  icon: keyof typeof typeIcons;
}

interface Quiz {
  id: string;
  title: string;
  completed: boolean;
  questions: number;
  score?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt?: string;
  icon: keyof typeof typeIcons;
}

interface CareerPageProps {
  studentId?: string;
}

// Extend the type for assessment
interface RiasecCareerAssessment extends CareerAssessment {
  type: 'riasec';
  result: RiasecResult;
}

interface MbtiCareerAssessment extends CareerAssessment {
  type: 'mbti';
  result: MbtiResult;
}

export default function CareerPage({ studentId }: CareerPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [assessments, setAssessments] = useState<(CareerAssessment | RiasecCareerAssessment | MbtiCareerAssessment)[]>([]);
  const [resources, setResources] = useState<CareerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'paths' | 'assessments' | 'resources'>('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showRiasecAssessment, setShowRiasecAssessment] = useState(false);
  const [showMbtiAssessment, setShowMbtiAssessment] = useState(false);
  const [currentAssessmentResult, setCurrentAssessmentResult] = useState<RiasecResult | MbtiResult | null>(null);
  const [currentAssessmentType, setCurrentAssessmentType] = useState<'riasec' | 'mbti' | null>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const mockCourses = useCallback(() => {
    return [
      {
        id: '1',
        title: 'Pengenalan Perencanaan Karir',
        description: 'Kursus dasar untuk memahami perencanaan karir dan perkembangan profesional.',
        modules: [
          {
            id: '1-1',
            title: 'Mengenal Diri Sendiri',
            description: 'Memahami minat, bakat, dan nilai-nilai personal.',
            duration: 45,
            completed: true,
            resources: [],
            quizzes: [{ id: 'q1', title: 'Kuis Mengenali Diri', completed: true, questions: 10, score: 85 }]
          },
          {
            id: '1-2',
            title: 'Eksplorasi Karir',
            description: 'Menjelajahi berbagai pilihan karir dan jalur pendidikan.',
            duration: 60,
            completed: false,
            resources: [],
            quizzes: [{ id: 'q2', title: 'Kuis Eksplorasi Karir', completed: false, questions: 15 }]
          }
        ],
        progress: 50,
        instructor: 'Dr. Budi Santoso',
        thumbnail: 'https://example.com/images/career-planning.jpg',
        category: 'Pengembangan Karir',
        level: 'beginner' as const
      },
      {
        id: '2',
        title: 'Keterampilan Wawancara Kerja',
        description: 'Pelajari teknik menjawab pertanyaan dan mempersiapkan wawancara kerja.',
        modules: [
          {
            id: '2-1',
            title: 'Persiapan Wawancara',
            description: 'Langkah-langkah persiapan sebelum menghadapi wawancara.',
            duration: 30,
            completed: true,
            resources: [],
            quizzes: [{ id: 'q3', title: 'Persiapan Wawancara', completed: true, questions: 8, score: 90 }]
          },
          {
            id: '2-2',
            title: 'Menjawab Pertanyaan Sulit',
            description: 'Strategi menjawab pertanyaan wawancara yang menantang.',
            duration: 45,
            completed: true,
            resources: [],
            quizzes: [{ id: 'q4', title: 'Pertanyaan Wawancara', completed: true, questions: 12, score: 75 }]
          },
          {
            id: '2-3',
            title: 'Simulasi Wawancara',
            description: 'Latihan wawancara melalui roleplay dan umpan balik.',
            duration: 90,
            completed: false,
            resources: [],
            quizzes: [{ id: 'q5', title: 'Evaluasi Simulasi', completed: false, questions: 5 }]
          }
        ],
        progress: 70,
        instructor: 'Siti Aminah, M.Psi.',
        thumbnail: 'https://example.com/images/interview-skills.jpg',
        category: 'Keterampilan Kerja',
        level: 'intermediate' as const
      },
      {
        id: '3',
        title: 'Menulis CV dan Surat Lamaran yang Efektif',
        description: 'Belajar teknik menulis CV yang menarik perhatian rekruter.',
        modules: [
          {
            id: '3-1',
            title: 'Struktur CV Modern',
            description: 'Format dan elemen penting dalam CV.',
            duration: 40,
            completed: false,
            resources: [],
            quizzes: [{ id: 'q6', title: 'Struktur CV', completed: false, questions: 10 }]
          },
          {
            id: '3-2',
            title: 'Menulis Surat Lamaran',
            description: 'Panduan penulisan surat lamaran yang profesional.',
            duration: 35,
            completed: false,
            resources: [],
            quizzes: [{ id: 'q7', title: 'Evaluasi Surat Lamaran', completed: false, questions: 8 }]
          }
        ],
        progress: 10,
        instructor: 'Rina Wijaya, S.Psi.',
        thumbnail: 'https://example.com/images/resume-writing.jpg',
        category: 'Dokumen Karir',
        level: 'beginner' as const
      }
    ];
  }, []);

  const mockCareerPaths = useCallback((coursesData: Course[]) => {
    return [
      {
        id: '1',
        title: 'Jalur Karir Teknologi Informasi',
        description: 'Persiapan menuju karir di bidang teknologi informasi dan pengembangan software.',
        courses: [coursesData[0]],
        progress: 35,
        icon: 'course' as const
      },
      {
        id: '2',
        title: 'Jalur Karir Sumber Daya Manusia',
        description: 'Pengembangan keterampilan untuk karir di bidang manajemen SDM dan rekrutmen.',
        courses: [coursesData[1], coursesData[2]],
        progress: 42,
        icon: 'path' as const
      },
      {
        id: '3',
        title: 'Jalur Karir Kewirausahaan',
        description: 'Mempersiapkan diri untuk memulai dan mengembangkan bisnis.',
        courses: [],
        progress: 0,
        icon: 'program' as const
      }
    ];
  }, []);

  const mockAchievements = useCallback(() => {
    return [
      {
        id: '1',
        title: 'Penyelesai Kursus Pertama',
        description: 'Berhasil menyelesaikan kursus pertama tentang perencanaan karir',
        earnedAt: '2024-03-15',
        icon: 'certification' as const
      },
      {
        id: '2',
        title: 'Penjelajah Karir',
        description: 'Menyelesaikan penilaian minat karir',
        earnedAt: '2024-04-01',
        icon: 'assessment' as const
      }
    ];
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load resources and filter any student-specific ones if studentId is provided
      const [resourcesRes] = await Promise.all([
        getCareerResources(),
        // Reset assessments when studentId changes
        setAssessments([])
      ]);

      // Filter resources if we have a studentId
      const filteredResources = studentId
        ? resourcesRes.results.filter((resource: CareerResource) => 
            resource.tags.some((tag: string) => 
              tag.toLowerCase().includes('beginner') || 
              tag.toLowerCase().includes('student')
            )
          )
        : resourcesRes.results;

      setResources(filteredResources);
    } catch (err) {
      console.error('Error loading career data:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
    
    // Set mock data untuk simulasi LMS
    const mockCoursesData = mockCourses();
    setCourses(mockCoursesData);
    setCareerPaths(mockCareerPaths(mockCoursesData));
    setAchievements(mockAchievements());
  }, [loadData, mockCourses, mockCareerPaths, mockAchievements]);

  const handleResourceSearch = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        const response = await getCareerResources();
        setResources(response.results);
        return;
      }

      // If studentId is provided, we could add it as a filter parameter
      const response = await searchCareerResources({
        tags: [searchTerm]
      });
      setResources(response.results);
    } catch (err) {
      console.error('Error searching resources:', err);
    }
  };

  // Handle starting a new RIASEC assessment
  const handleStartRiasecAssessment = () => {
    setShowRiasecAssessment(true);
    setShowMbtiAssessment(false);
    setCurrentAssessmentResult(null);
    setCurrentAssessmentType('riasec');
  };
  
  // Handle starting a new MBTI assessment
  const handleStartMbtiAssessment = () => {
    setShowMbtiAssessment(true);
    setShowRiasecAssessment(false);
    setCurrentAssessmentResult(null);
    setCurrentAssessmentType('mbti');
  };

  // Handle RIASEC assessment completion
  const handleRiasecComplete = (result: RiasecResult) => {
    setShowRiasecAssessment(false);
    setCurrentAssessmentResult(result);
    setCurrentAssessmentType('riasec');
    
    // Create a new assessment record
    const newAssessment: RiasecCareerAssessment = {
      id: `riasec-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'riasec',
      interests: result.topCategories,
      recommendedPaths: result.recommendedCareers.slice(0, 3).map(career => career.title),
      result: result
    };
    
    // Add to assessments list
    setAssessments(prev => [newAssessment, ...prev]);
    
    // Simpan ke localStorage untuk persistensi data
    try {
      const storedAssessments = localStorage.getItem('careerAssessments');
      const parsedAssessments = storedAssessments ? JSON.parse(storedAssessments) : [];
      localStorage.setItem('careerAssessments', JSON.stringify([newAssessment, ...parsedAssessments]));
    } catch (error) {
      console.error('Error saving assessment to localStorage:', error);
    }
  };
  
  // Handle MBTI assessment completion
  const handleMbtiComplete = (result: MbtiResult) => {
    setShowMbtiAssessment(false);
    setCurrentAssessmentResult(result);
    setCurrentAssessmentType('mbti');
    
    // Create a new assessment record
    const newAssessment: MbtiCareerAssessment = {
      id: `mbti-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'mbti',
      interests: [result.type],
      recommendedPaths: result.careerSuggestions.slice(0, 3),
      result: result
    };
    
    // Add to assessments list
    setAssessments(prev => [newAssessment, ...prev]);
    
    // Simpan ke localStorage untuk persistensi data
    try {
      const storedAssessments = localStorage.getItem('careerAssessments');
      const parsedAssessments = storedAssessments ? JSON.parse(storedAssessments) : [];
      localStorage.setItem('careerAssessments', JSON.stringify([newAssessment, ...parsedAssessments]));
    } catch (error) {
      console.error('Error saving assessment to localStorage:', error);
    }
  };

  // Handle canceling assessment
  const handleCancelAssessment = () => {
    setShowRiasecAssessment(false);
    setShowMbtiAssessment(false);
    setCurrentAssessmentType(null);
  };

  // Handle starting a new assessment after viewing results
  const handleStartNewAssessment = () => {
    setCurrentAssessmentResult(null);
    if (currentAssessmentType === 'riasec') {
      setShowRiasecAssessment(true);
    } else if (currentAssessmentType === 'mbti') {
      setShowMbtiAssessment(true);
    }
  };
  
  // Return to main career page from results
  const handleBackToCareer = () => {
    setCurrentAssessmentResult(null);
    setCurrentAssessmentType(null);
    setActiveTab('assessments');
  };

  // Load saved assessments from localStorage on initial load
  useEffect(() => {
    try {
      const storedAssessments = localStorage.getItem('careerAssessments');
      if (storedAssessments) {
        const parsedAssessments = JSON.parse(storedAssessments);
        setAssessments(parsedAssessments);
      }
    } catch (error) {
      console.error('Error loading assessments from localStorage:', error);
    }
  }, []);

  if (showRiasecAssessment) {
    return (
      <RiasecAssessment 
        onComplete={handleRiasecComplete} 
        onCancel={handleCancelAssessment} 
      />
    );
  }
  
  if (showMbtiAssessment) {
    return (
      <MbtiAssessment
        onComplete={handleMbtiComplete}
        onCancel={handleCancelAssessment}
      />
    );
  }
  
  if (currentAssessmentResult) {
    if (currentAssessmentType === 'riasec') {
      return (
        <div className="space-y-4">
          <button 
            onClick={handleBackToCareer}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('career.backToAssessments', 'Kembali ke Penilaian Karir')}
          </button>
          
          <RiasecResults 
            result={currentAssessmentResult as RiasecResult} 
            onStartNewAssessment={handleStartNewAssessment} 
          />
        </div>
      );
    } else if (currentAssessmentType === 'mbti') {
      return (
        <div className="space-y-4">
          <button 
            onClick={handleBackToCareer}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('career.backToAssessments', 'Kembali ke Penilaian Karir')}
          </button>
          
          <MbtiResults 
            result={currentAssessmentResult as MbtiResult} 
            onStartNewAssessment={handleStartNewAssessment} 
          />
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gray-200 mr-4" />
                <div className="flex-1">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('career.title')}</h1>
        <p className="text-base text-gray-600 max-w-2xl">
          {t('career.subtitle')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
        <nav className="flex overflow-x-auto py-2 px-4 -mb-px space-x-8" aria-label="Tabs">
          {['overview', 'courses', 'paths', 'assessments', 'resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                'py-3 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors duration-200',
                activeTab === tab
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {t(`career.tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-brand-50 rounded-xl">
                  <Monitor className="h-7 w-7 text-brand-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('career.stats.enrolledCourses')}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Compass className="h-7 w-7 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('career.stats.careerPaths')}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{careerPaths.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Trophy className="h-7 w-7 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('career.stats.achievements')}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{achievements.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* In Progress Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('career.inProgressCourses')}</h2>
                <button className="text-sm font-medium text-brand-600 hover:text-brand-700 px-3 py-1 rounded-lg hover:bg-brand-50 transition-colors duration-150">
                  {t('career.viewAll')}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.slice(0, 2).map((course) => (
                  <div 
                    key={course.id}
                    className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start">
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <Monitor className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-md font-semibold text-gray-900">{course.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {course.modules.length} {t('career.modules')} • {course.level}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{course.progress}% {t('career.completed')}</span>
                            <span className="text-xs font-medium px-2 py-1 bg-brand-50 rounded-full text-brand-700">
                              {course.modules.filter(m => m.completed).length}/{course.modules.length} {t('career.modules')}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-full h-2.5" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <button 
                            onClick={() => navigate(`/career/course/${course.id}`)}
                            className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors duration-150"
                          >
                            {t('career.continue')}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Career Path Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('career.careerPathProgress')}</h2>
                <button className="text-sm font-medium text-brand-600 hover:text-brand-700 px-3 py-1 rounded-lg hover:bg-brand-50 transition-colors duration-150">
                  {t('career.explorePaths')}
                </button>
              </div>

              <div className="space-y-5">
                {careerPaths.slice(0, 2).map((path) => {
                  const Icon = typeIcons[path.icon];
                  return (
                    <div key={path.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={cn(
                            'p-3 rounded-xl',
                            typeColors[path.icon]
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-md font-semibold text-gray-900">{path.title}</h3>
                            <p className="text-sm text-gray-500">{path.courses.length} {t('career.coursesIncluded')}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold px-3 py-1 bg-gray-100 rounded-full text-gray-800">{path.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full h-2.5" 
                          style={{ width: `${path.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('career.recentAchievements')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {achievements.map((achievement) => {
                  const Icon = typeIcons[achievement.icon];
                  return (
                    <div 
                      key={achievement.id}
                      className="border border-gray-200 rounded-xl p-4 flex items-start bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200"
                    >
                      <div className={cn(
                        'p-3 rounded-xl',
                        typeColors[achievement.icon]
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-md font-semibold text-gray-900">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.earnedAt && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {t('career.earned')} {format(new Date(achievement.earnedAt), 'PPP')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('career.searchCourses')}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
              />
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                <Filter className="h-5 w-5 mr-2" />
                {t('career.filter')}
              </button>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center relative">
                  {/* Course thumbnail with gradient overlay */}
                  <Monitor className="h-16 w-16 text-white opacity-25" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-xs font-medium rounded-full text-white inline-block mb-2">
                      {course.category}
                    </span>
                    <span className="px-2 py-1 bg-brand-500/80 backdrop-blur-sm text-xs font-medium rounded-full text-white inline-block ml-2 mb-2">
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <div className="flex items-center mr-4">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span>
                        {course.modules.reduce((sum, module) => sum + module.duration, 0)} {t('career.minutes')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{course.modules.length} {t('career.modules')}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {course.progress}% {t('career.completed')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-full h-2.5" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-xs text-gray-600 ml-2">{course.instructor}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/career/course/${course.id}`)}
                      className="inline-flex items-center text-xs font-medium px-3 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors duration-150"
                    >
                      {course.progress > 0 ? t('career.continue') : t('career.start')}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'paths' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careerPaths.map((path) => {
              const Icon = typeIcons[path.icon];
              return (
                <div
                  key={path.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start mb-5">
                      <div className={cn(
                        'p-4 rounded-xl',
                        typeColors[path.icon]
                      )}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {path.progress}% {t('career.completed')}
                        </span>
                        <span className="text-xs font-medium px-3 py-1 bg-brand-50 rounded-full text-brand-700">
                          {path.courses.filter(c => c.progress === 100).length}/{path.courses.length} {t('career.courses')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full h-3" 
                          style={{ width: `${path.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Included Courses */}
                    {path.courses.length > 0 ? (
                      <div className="space-y-3 mb-5 bg-gray-50 p-4 rounded-xl">
                        <h4 className="text-sm font-semibold text-gray-700">{t('career.includedCourses')}</h4>
                        {path.courses.slice(0, 2).map(course => (
                          <div key={course.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center">
                              <Monitor className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm text-gray-700">{course.title}</span>
                            </div>
                            {course.progress === 100 ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-700">{course.progress}%</span>
                            )}
                          </div>
                        ))}
                        {path.courses.length > 2 && (
                          <p className="text-xs text-gray-500 text-center py-1">
                            +{path.courses.length - 2} {t('career.moreCourses')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 px-5 text-sm text-gray-500 mb-5 bg-gray-50 rounded-xl">
                        {t('career.noCoursesYet')}
                      </div>
                    )}

                    <button className="inline-flex items-center justify-center w-full text-sm font-medium px-4 py-3 border border-transparent rounded-xl text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm transition-all duration-200">
                      {path.progress > 0 ? t('career.continuePath') : t('career.startPath')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{t('career.assessments', 'Penilaian')}</h2>
            <div className="flex space-x-3">
              <button 
                onClick={handleStartRiasecAssessment}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm transition-all duration-200"
              >
                <BrainCircuit className="h-5 w-5 mr-2" />
                {t('career.startRiasecAssessment', 'Mulai Penilaian RIASEC')}
              </button>
              <button 
                onClick={handleStartMbtiAssessment}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200"
              >
                <BrainCircuit className="h-5 w-5 mr-2" />
                {t('career.startMbtiAssessment', 'Mulai Penilaian MBTI')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-6">
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
                      </div>
                      <button 
                        onClick={() => {
                          if ('result' in assessment) {
                            setCurrentAssessmentResult(assessment.result);
                            setCurrentAssessmentType(assessment.type);
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
                      onClick={handleStartRiasecAssessment}
                      className="inline-flex items-center px-5 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm transition-all duration-200"
                    >
                      <BrainCircuit className="h-5 w-5 mr-2" />
                      {t('career.takeFirstAssessment', 'Ambil Penilaian Pertama')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('career.searchResources')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleResourceSearch(e.target.value);
                }}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
              />
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                <Filter className="h-5 w-5 mr-2" />
                {t('career.filter')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('career.resources')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredResources.map((resource) => {
                  const Icon = typeIcons[resource.type];
                  return (
                    <div
                      key={resource.id}
                      className="border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex items-start">
                        <div className={cn(
                          'p-3 rounded-xl',
                          typeColors[resource.type]
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-md font-semibold text-gray-900">{resource.title}</h3>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors duration-150"
                            >
                              {t(`career.type.${resource.type}`)}
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}