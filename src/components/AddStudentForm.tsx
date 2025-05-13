import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Student, StudentFormData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AddStudentFormProps {
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id'>) => void;
}

export default function AddStudentForm({ onClose, onSubmit }: AddStudentFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    tingkat: '',
    kelas: '',
    avatar: '/assets/avatars/default-avatar.png', // Default avatar
    academicStatus: 'good' as const,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a new object that includes both current and legacy properties
    const studentData = {
      ...formData,
      // Map current properties to legacy properties for backward compatibility
      grade: formData.tingkat,
      class: formData.kelas,
      photo: formData.avatar || '/assets/avatars/default-avatar.png' // Ensure photo is always a string
    };
    onSubmit(studentData);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert(t('addStudent.invalidImageType'));
      return;
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(t('addStudent.imageTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData({
          ...formData,
          avatar: event.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">{t('addStudent.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('addStudent.fullName')}
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('addStudent.email')}
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tingkat" className="block text-sm font-medium text-gray-700">
                  {t('students.tingkat')}
                </label>
                <select
                  id="tingkat"
                  required
                  value={formData.tingkat}
                  onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="">{t('addStudent.selectTingkat')}</option>
                  {['X', 'XI', 'XII'].map((tingkat) => (
                    <option key={tingkat} value={tingkat}>
                      {tingkat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="kelas" className="block text-sm font-medium text-gray-700">
                  {t('students.kelas')}
                </label>
                <select
                  id="kelas"
                  required
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="">{t('addStudent.selectKelas')}</option>
                  {['IPA-1', 'IPA-2', 'IPA-3', 'IPS-1', 'IPS-2'].map((kelas) => (
                    <option key={kelas} value={kelas}>
                      {kelas}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                {t('addStudent.academicStatus')}
              </label>
              <select
                id="status"
                required
                value={formData.academicStatus}
                onChange={(e) => setFormData({
                  ...formData,
                  academicStatus: e.target.value as 'good' | 'warning' | 'critical'
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="good">{t('status.good')}</option>
                <option value="warning">{t('status.warning')}</option>
                <option value="critical">{t('status.critical')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Foto Siswa
              </label>
              <div className="mt-1 flex flex-col items-center">
                <div className="mb-4 relative w-32 h-32">
                  <img 
                    src={formData.avatar}
                    alt="Pratinjau foto siswa"
                    className="absolute inset-0 w-full h-full object-cover rounded-full border border-gray-300"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/assets/avatars/default-avatar.png';
                      img.onerror = null;
                    }}
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Pilih Foto
                </button>
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-500">
                    Format: JPG, PNG, atau GIF
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ukuran maksimum: 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('addStudent.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {t('addStudent.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}