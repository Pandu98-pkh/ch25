import { Class } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, School, BookOpen, GraduationCap, User, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';

interface ClassCardProps {
  classItem: Class;
  onClick: (classItem: Class) => void;
}

// Enhanced grade level colors with gradient backgrounds
const gradeLevelColors: Record<string, {bg: string, text: string, gradient: string, border: string}> = {
  'X': {
    bg: 'bg-blue-50', 
    text: 'text-blue-700',
    gradient: 'from-blue-500 to-cyan-400',
    border: 'border-blue-200'
  },
  'XI': {
    bg: 'bg-purple-50', 
    text: 'text-purple-700',
    gradient: 'from-purple-500 to-pink-400',
    border: 'border-purple-200'
  },
  'XII': {
    bg: 'bg-green-50', 
    text: 'text-green-700',
    gradient: 'from-green-500 to-emerald-400',
    border: 'border-green-200'
  },
  // Default for other classes
  'default': {
    bg: 'bg-indigo-50', 
    text: 'text-indigo-700',
    gradient: 'from-indigo-500 to-blue-400',
    border: 'border-indigo-200'
  },
};

export default function ClassCard({ classItem, onClick }: ClassCardProps) {
  const { t } = useLanguage();
  
  // Get grade prefix (X, XI, XII, or other)
  const gradePrefix = classItem.gradeLevel.split('-')[0]?.trim().toUpperCase() || '';
  const gradeStyle = gradeLevelColors[gradePrefix] || gradeLevelColors.default;
  
  // Get class icon based on grade level
  const getClassIcon = () => {
    if (gradePrefix === 'X') return <BookOpen className="h-5 w-5 text-white" />;
    if (gradePrefix === 'XI') return <School className="h-5 w-5 text-white" />;
    if (gradePrefix === 'XII') return <GraduationCap className="h-5 w-5 text-white" />; 
    return <School className="h-5 w-5 text-white" />;
  };
  
  return (
    <div 
      className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                transform hover:-translate-y-1 cursor-pointer overflow-hidden group border border-gray-200"
      onClick={() => onClick(classItem)}
    >
      {/* Decorative top bar with gradient */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradeStyle.gradient}`}></div>
      
      <div className="p-5">
        <div className="flex items-start space-x-4">
          {/* Icon with gradient background */}
          <div className={`rounded-lg p-2.5 bg-gradient-to-br ${gradeStyle.gradient} shadow-sm flex-shrink-0`}>
            {getClassIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">
                {classItem.name}
              </h3>
              
              {/* Grade badge */}
              <div
                className={cn(
                  'ml-2 px-3 py-1 rounded-full text-xs font-semibold',
                  gradeStyle.bg,
                  gradeStyle.text,
                  `border ${gradeStyle.border}`
                )}
              >
                {gradePrefix || classItem.gradeLevel}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-1">
              {classItem.gradeLevel}
            </p>
          </div>
        </div>
        
        {/* Stats with improved styling */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${gradeStyle.bg} border ${gradeStyle.border} transition-all duration-200`}>
            <div className="flex items-center text-sm">
              <Calendar className={`h-4 w-4 mr-2 ${gradeStyle.text}`} />
              <span className="text-gray-600">{t('classes.academicYear')}</span>
            </div>
            <p className={`font-semibold mt-1 ${gradeStyle.text}`}>
              {classItem.academicYear}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${gradeStyle.bg} border ${gradeStyle.border} transition-all duration-200`}>
            <div className="flex items-center text-sm">
              <Users className={`h-4 w-4 mr-2 ${gradeStyle.text}`} />
              <span className="text-gray-600">{t('classes.students')}</span>
            </div>
            <p className={`font-semibold mt-1 ${gradeStyle.text}`}>
              {classItem.studentCount} {t('classes.studentsShort')}
            </p>
          </div>
        </div>
        
        {/* Teacher info with improved styling */}
        {classItem.teacherName && (
          <div className="mt-3 flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mr-3 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('classes.teacher')}</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {classItem.teacherName}
              </p>
            </div>
          </div>
        )}
        
        {/* Action indicator at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradeStyle.gradient}"></div>
      </div>
    </div>
  );
}
