import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ChevronRight, 
  CheckCircle,
  Clock,
  Compass,
  Monitor,
  Trophy,
  Users
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../utils/cn';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  resources: any[];
  quizzes: any[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  progress: number;
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
  icon: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt?: string;
  icon: string;
}

const typeIcons = {
  course: Monitor,
  path: Compass,
  program: Trophy,
  certification: Trophy,
  assessment: Trophy,
};

const typeColors = {
  course: 'bg-emerald-100 text-emerald-700',
  path: 'bg-sky-100 text-sky-700',
  program: 'bg-orange-100 text-orange-700',
  certification: 'bg-rose-100 text-rose-700',
  assessment: 'bg-green-100 text-green-700',
};

interface OverviewTabProps {
  courses: Course[];
  careerPaths: CareerPath[];
  achievements: Achievement[];
}

export default function OverviewTab({ courses, careerPaths, achievements }: OverviewTabProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-brand-50 rounded-xl">
              <Monitor className="h-7 w-7 text-brand-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('career.stats.enrolledCourses', 'Kursus Terdaftar')}</p>
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
              <p className="text-sm font-medium text-gray-500">{t('career.stats.careerPaths', 'Jalur Karir')}</p>
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
              <p className="text-sm font-medium text-gray-500">{t('career.stats.achievements', 'Pencapaian')}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{achievements.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Courses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('career.inProgressCourses', 'Kursus Sedang Berjalan')}</h2>
            <button className="text-sm font-medium text-brand-600 hover:text-brand-700 px-3 py-1 rounded-lg hover:bg-brand-50 transition-colors duration-150">
              {t('career.viewAll', 'Lihat Semua')}
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
                      {course.modules.length} {t('career.modules', 'modul')} • {course.level}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{course.progress}% {t('career.completed', 'selesai')}</span>
                        <span className="text-xs font-medium px-2 py-1 bg-brand-50 rounded-full text-brand-700">
                          {course.modules.filter(m => m.completed).length}/{course.modules.length} {t('career.modules', 'modul')}
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
                        onClick={() => navigate(`/app/career/course/${course.id}`)}
                        className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors duration-150"
                      >
                        {t('career.continue', 'Lanjutkan')}
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
            <h2 className="text-xl font-semibold text-gray-900">{t('career.careerPathProgress', 'Progress Jalur Karir')}</h2>
            <button className="text-sm font-medium text-brand-600 hover:text-brand-700 px-3 py-1 rounded-lg hover:bg-brand-50 transition-colors duration-150">
              {t('career.explorePaths', 'Jelajahi Jalur')}
            </button>
          </div>

          <div className="space-y-5">
            {careerPaths.slice(0, 2).map((path) => {
              const Icon = typeIcons[path.icon as keyof typeof typeIcons] || Monitor;
              return (
                <div key={path.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={cn(
                        'p-3 rounded-xl',
                        typeColors[path.icon as keyof typeof typeColors] || 'bg-gray-100 text-gray-700'
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-md font-semibold text-gray-900">{path.title}</h3>
                        <p className="text-sm text-gray-500">{path.courses.length} {t('career.coursesIncluded', 'kursus disertakan')}</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('career.recentAchievements', 'Pencapaian Terbaru')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((achievement) => {
              const Icon = typeIcons[achievement.icon as keyof typeof typeIcons] || Trophy;
              return (
                <div 
                  key={achievement.id}
                  className="border border-gray-200 rounded-xl p-4 flex items-start bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200"
                >
                  <div className={cn(
                    'p-3 rounded-xl',
                    typeColors[achievement.icon as keyof typeof typeColors] || 'bg-gray-100 text-gray-700'
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-semibold text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.earnedAt && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('career.earned', 'Diperoleh')} {format(new Date(achievement.earnedAt), 'PPP')}
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
  );
}
