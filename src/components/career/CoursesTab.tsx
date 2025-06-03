import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Clock,
  Layers,
  Monitor,
  Users
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

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

interface CoursesTabProps {
  courses: Course[];
}

export default function CoursesTab({ courses }: CoursesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('career.searchCourses', 'Cari kursus...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
            <Filter className="h-5 w-5 mr-2" />
            {t('career.filter', 'Filter')}
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
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
                    {course.modules.reduce((sum, module) => sum + module.duration, 0)} {t('career.minutes', 'menit')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Layers className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{course.modules.length} {t('career.modules', 'modul')}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {course.progress}% {t('career.completed', 'selesai')}
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
                  onClick={() => navigate(`/app/career/course/${course.id}`)}
                  className="inline-flex items-center text-xs font-medium px-3 py-2 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors duration-150"
                >
                  {course.progress > 0 ? t('career.continue', 'Lanjutkan') : t('career.start', 'Mulai')}
                  <ChevronRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? t('career.noCoursesFound', 'Tidak ada kursus ditemukan') : t('career.noCoursesAvailable', 'Belum ada kursus tersedia')}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? t('career.tryDifferentSearch', 'Coba kata kunci pencarian yang berbeda')
              : t('career.coursesComingSoon', 'Kursus akan segera tersedia')
            }
          </p>
        </div>
      )}
    </div>
  );
}
