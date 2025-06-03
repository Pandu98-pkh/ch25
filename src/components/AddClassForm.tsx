import { useState } from 'react';
import { Class } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X } from 'lucide-react';

interface AddClassFormProps {
  onClose: () => void;
  onSubmit: (classData: Omit<Class, 'id'>) => void;
}

export default function AddClassForm({ onClose, onSubmit }: AddClassFormProps) {  const { t } = useLanguage();  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: '',
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    studentCount: 0,
    teacherName: '',
    schoolId: '',
    classId: '' // Add classId field
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'studentCount' ? parseInt(value) || 0 : value
    }));
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    }
    if (!formData.gradeLevel.trim()) {
      newErrors.gradeLevel = t('validation.required');
    }
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = t('validation.required');
    }
    // schoolId is optional - backend will auto-generate if not provided
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{t('classes.addNew')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classes.name')}*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classes.gradeLevel')}*
              </label>
              <select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.gradeLevel ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500`}
              >
                <option value="">Pilih tingkat kelas</option>
                <option value="10">Kelas 10 (X)</option>
                <option value="11">Kelas 11 (XI)</option>
                <option value="12">Kelas 12 (XII)</option>
              </select>
              {errors.gradeLevel && <p className="mt-1 text-sm text-red-600">{errors.gradeLevel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classes.academicYear')}*
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.academicYear ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500`}
              />
              {errors.academicYear && <p className="mt-1 text-sm text-red-600">{errors.academicYear}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classes.teacherName')}
              </label>              <input
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classes.maxStudents', 'Kuota Maksimal Siswa')}
              </label>
              <input
                type="number"
                name="studentCount"
                value={formData.studentCount}
                onChange={handleChange}
                min="1"
                max="50"
                placeholder="Contoh: 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Masukkan jumlah maksimal siswa yang dapat diterima di kelas ini
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('classes.schoolId', 'ID Sekolah')} (Opsional)
              </label>
              <input
                type="text"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.schoolId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500`}
                placeholder="Akan dibuat otomatis jika dikosongkan"
              />
              {errors.schoolId && <p className="mt-1 text-sm text-red-600">{errors.schoolId}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {t('actions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
