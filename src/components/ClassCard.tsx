import { Class } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, School, BookOpen, GraduationCap, User } from 'lucide-react';
import { cn } from '../utils/cn';

interface ClassCardProps {
  classItem: Class;
  onClick: (classItem: Class) => void;
}

// Warna berdasarkan tingkat kelas
const gradeLevelColors: Record<string, string> = {
  'X': 'bg-blue-50 text-blue-700',
  'XI': 'bg-purple-50 text-purple-700',
  'XII': 'bg-green-50 text-green-700',
  // Default untuk kelas lain
  'default': 'bg-indigo-50 text-indigo-700',
};

export default function ClassCard({ classItem, onClick }: ClassCardProps) {
  const { t } = useLanguage();
  
  // Menentukan warna berdasarkan gradeLevel (X, XI, XII, atau lainnya)
  const gradePrefix = classItem.gradeLevel.split('-')[0]?.trim().toUpperCase() || '';
  const gradeLevelColor = gradeLevelColors[gradePrefix] || gradeLevelColors.default;
  
  // Menentukan ikon untuk tampilan kelas
  const getClassIcon = () => {
    if (gradePrefix === 'X') return <BookOpen className="h-6 w-6 text-blue-600" />;
    if (gradePrefix === 'XI') return <School className="h-6 w-6 text-purple-600" />;
    if (gradePrefix === 'XII') return <GraduationCap className="h-6 w-6 text-green-600" />; 
    return <School className="h-6 w-6 text-indigo-600" />;
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-brand-300"
      onClick={() => onClick(classItem)}
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 rounded-full p-3">
            {getClassIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{classItem.name}</h3>
            <p className="text-sm text-gray-500">
              {t('classes.gradeLevel')}: {classItem.gradeLevel}
            </p>
          </div>
          <div
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center',
              gradeLevelColor
            )}
          >
            {gradePrefix || classItem.gradeLevel}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('classes.academicYear')}</p>
            <p className="font-medium text-gray-900 truncate">
              {classItem.academicYear}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t('classes.students')}</p>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-indigo-600" />
              <p className="font-medium text-gray-900">
                {classItem.studentCount}
              </p>
            </div>
          </div>
          {classItem.teacherName && (
            <div className="col-span-2">
              <p className="text-gray-500">{t('classes.teacher')}</p>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1 text-indigo-600" />
                <p className="font-medium text-gray-900 truncate">
                  {classItem.teacherName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
