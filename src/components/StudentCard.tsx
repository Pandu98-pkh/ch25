import { Student } from '../types';
import { cn } from '../utils/cn';
import { AlertCircle, CheckCircle2, Clock, User, BookOpen, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

interface StudentCardProps {
  student: Student;
  onClick: (student: Student) => void;
}

const statusConfig: Record<string, {
  color: string,
  bgColor: string,
  borderColor: string,
  icon: typeof AlertCircle
}> = {
  good: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle2
  },
  warning: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Clock
  },
  critical: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle
  }
};

export default function StudentCard({ student, onClick }: StudentCardProps) {
  const status = student.academicStatus || 'warning';
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  
  // Default avatar path that's properly imported in the project
  const defaultAvatar = '/assets/images/default-avatar.png';
  
  // Get avatar path
  const avatarPath = student.avatar || student.photo || defaultAvatar;
  
  // Get status configuration
  const statusCfg = statusConfig[status] || statusConfig.warning;
  
  return (
    <div
      onClick={() => onClick(student)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                cursor-pointer overflow-hidden group border border-gray-200 relative transform hover:-translate-y-1"
    >
      {/* Top status indicator bar */}
      <div className={cn(
        "h-1.5 w-full absolute top-0 left-0", 
        statusCfg.bgColor
      )}></div>
      
      <div className="p-5 pt-6">
        <div className="flex items-center space-x-4">
          {/* Student avatar with fallback */}
          {!imageError ? (
            <img
              src={avatarPath}
              alt={student.name}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-indigo-200 transition-all duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-indigo-200 transition-all">
              <User className="h-8 w-8 text-indigo-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200 truncate">
                {student.name}
              </h3>
              
              {/* Status badge */}
              <div
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium flex items-center',
                  statusCfg.bgColor,
                  statusCfg.color,
                  `border ${statusCfg.borderColor}`
                )}
              >
                <statusCfg.icon className="w-3.5 h-3.5 mr-1" />
                {t(`status.${status}`)}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <BookOpen className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
              {t('students.tingkat')} {student.tingkat || student.grade} • {t('students.kelas')} {student.kelas || student.class}
            </p>
          </div>
        </div>
        
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 transition-all duration-200 group-hover:border-indigo-100">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Award className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
              {t('studentDetail.academicStatus')}
            </div>
            <p className={cn(
              "font-semibold text-sm",
              statusCfg.color
            )}>
              {t(`status.${status}`)}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 transition-all duration-200 group-hover:border-indigo-100">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <User className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
              {t('studentDetail.email')}
            </div>
            <p className="font-medium text-sm text-gray-700 truncate">
              {student.email || 'No email'}
            </p>
          </div>
        </div>
        
        {/* Additional info if available */}
        {(student.mentalHealthScore !== undefined || student.lastCounseling) && (
          <div className="mt-3 grid grid-cols-1 gap-3">
            {student.mentalHealthScore !== undefined && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-medium">{t('studentDetail.mentalHealthScore')}</span>
                  <span className="text-sm font-bold text-indigo-700">{student.mentalHealthScore}/100</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full" 
                    style={{ width: `${student.mentalHealthScore}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {student.lastCounseling && (
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                {t('studentDetail.lastCounseling')}: <span className="ml-1 font-medium text-gray-700">{student.lastCounseling}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}