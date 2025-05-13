import { Student } from '../types';
import { cn } from '../utils/cn';
import { AlertCircle, CheckCircle2, Clock, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

interface StudentCardProps {
  student: Student;
  onClick: (student: Student) => void;
}

const statusColors: Record<string, string> = {
  good: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  critical: 'bg-red-50 text-red-700',
};

type AcademicStatus = 'good' | 'warning' | 'critical';

const StatusIcon: Record<AcademicStatus, typeof AlertCircle> = {
  good: CheckCircle2,
  warning: Clock,
  critical: AlertCircle,
};

export default function StudentCard({ student, onClick }: StudentCardProps) {
  const status = student.academicStatus || 'warning';
  const Icon = StatusIcon[status as AcademicStatus];
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  // Menggunakan avatar lokal sebagai fallback
  const defaultAvatar = '/assets/avatars/default-avatar.png';
  
  // Mendapatkan path avatar yang akan digunakan
  const avatarPath = student.avatar || student.photo || defaultAvatar;

  return (
    <div
      onClick={() => onClick(student)}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-brand-300"
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          {!imageError ? (
            <img
              src={avatarPath}
              alt={student.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              onError={() => {
                // Jika gambar gagal dimuat, tampilkan ikon pengguna
                setImageError(true);
              }}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
              <User className="h-8 w-8 text-gray-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">
              {student.name}
            </p>
            <p className="text-sm text-gray-500">
              {t('students.tingkat')} {student.tingkat || student.grade} • {t('students.kelas')} {student.kelas || student.class}
            </p>
          </div>
          <div
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center',
              statusColors[status]
            )}
          >
            <Icon className="w-4 h-4 mr-1" />
            {t(`status.${status}`)}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('studentDetail.email')}</p>
            <p className="font-medium text-gray-900 truncate">
              {student.email}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t('studentDetail.academicStatus')}</p>
            <p className={`font-medium ${
              status === 'good' ? 'text-green-600' :
              status === 'warning' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {t(`status.${status}`)}
            </p>
          </div>
          {student.mentalHealthScore !== undefined && (
            <div>
              <p className="text-gray-500">{t('studentDetail.mentalHealthScore')}</p>
              <p className="font-medium text-gray-900">{student.mentalHealthScore}</p>
            </div>
          )}
          {student.lastCounseling && (
            <div>
              <p className="text-gray-500">{t('studentDetail.lastCounseling')}</p>
              <p className="font-medium text-gray-900">{student.lastCounseling}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}