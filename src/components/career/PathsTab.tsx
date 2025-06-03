import { CheckCircle, Monitor } from 'lucide-react';
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

const typeIcons = {
  course: Monitor,
  path: Monitor,
  program: Monitor,
};

const typeColors = {
  course: 'bg-emerald-100 text-emerald-700',
  path: 'bg-sky-100 text-sky-700',
  program: 'bg-orange-100 text-orange-700',
};

interface PathsTabProps {
  careerPaths: CareerPath[];
}

export default function PathsTab({ careerPaths }: PathsTabProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careerPaths.map((path) => {
          const Icon = typeIcons[path.icon as keyof typeof typeIcons] || Monitor;
          return (
            <div
              key={path.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start mb-5">
                  <div className={cn(
                    'p-4 rounded-xl',
                    typeColors[path.icon as keyof typeof typeColors] || 'bg-gray-100 text-gray-700'
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
                      {path.progress}% {t('career.completed', 'selesai')}
                    </span>
                    <span className="text-xs font-medium px-3 py-1 bg-brand-50 rounded-full text-brand-700">
                      {path.courses.filter(c => c.progress === 100).length}/{path.courses.length} {t('career.courses', 'kursus')}
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
                    <h4 className="text-sm font-semibold text-gray-700">{t('career.includedCourses', 'Kursus yang Disertakan')}</h4>
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
                        +{path.courses.length - 2} {t('career.moreCourses', 'kursus lainnya')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-4 px-5 text-sm text-gray-500 mb-5 bg-gray-50 rounded-xl">
                    {t('career.noCoursesYet', 'Belum ada kursus')}
                  </div>
                )}

                <button className="inline-flex items-center justify-center w-full text-sm font-medium px-4 py-3 border border-transparent rounded-xl text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm transition-all duration-200">
                  {path.progress > 0 ? t('career.continuePath', 'Lanjutkan Jalur') : t('career.startPath', 'Mulai Jalur')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {careerPaths.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('career.noPathsAvailable', 'Belum ada jalur karir tersedia')}
          </h3>
          <p className="text-gray-600">
            {t('career.pathsComingSoon', 'Jalur karir akan segera tersedia')}
          </p>
        </div>
      )}
    </div>
  );
}
