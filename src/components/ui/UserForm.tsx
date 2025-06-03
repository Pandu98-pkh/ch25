import { useState } from 'react';
import { X, User as UserIcon, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ImageUploader } from '../ImageUploader';

interface UserFormProps {
  initialData?: User;
  onSubmit: (userData: User) => void;
  onCancel: () => void;
  isModal?: boolean;
  title?: string;
  error?: string | null;
}

export default function UserForm({ initialData, onSubmit, onCancel, isModal = true, title, error }: UserFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<User>({
    userId: initialData?.userId || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'counselor',
    username: initialData?.username || '',
    password: initialData?.password || '',
    photo: initialData?.photo || initialData?.avatar || '',
    avatar: initialData?.avatar || initialData?.photo || '',
    avatarType: initialData?.avatarType || 'url',
    avatarFilename: initialData?.avatarFilename || '',
  });
  
  const [showPassword, setShowPassword] = useState(false);  const handleImageChange = (imageData: {
    type: 'base64' | 'file' | 'url';
    url: string;
    filename?: string;
  }) => {
    setFormData({
      ...formData,
      photo: imageData.url,
      avatar: imageData.url,
      avatarType: imageData.type,
      avatarFilename: imageData.filename
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'counselor':
        return <UserIcon className="h-4 w-4" />;
      case 'student':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };
  const formContent = (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Error
              </h4>
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Information notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <UserIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              {initialData ? 'Edit User' : 'Tambah User Baru'}
            </h4>
            <p className="text-sm text-blue-700">
              {initialData 
                ? 'Perbarui informasi user. ID pengguna tidak dapat diubah setelah dibuat.'
                : 'Isi informasi lengkap untuk membuat user baru. Pastikan ID unik untuk setiap user.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Responsive Grid Layout - 1 column on mobile, 2 columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Informasi Dasar
          </h3>
          
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              {formData.role === 'student' 
                ? t('settings.studentId', 'Nomor Induk Siswa (NIS)') 
                : formData.role === 'counselor' 
                  ? t('settings.counselorId', 'ID Konselor') 
                  : t('settings.adminId', 'ID Administrator')}
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              readOnly={!!initialData}
              disabled={!!initialData}
              placeholder={formData.role === 'student' 
                ? "Contoh: 123456789" 
                : formData.role === 'counselor' 
                  ? "Contoh: KSL-2025-001" 
                  : "Contoh: ADM-2025-001"}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                initialData ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {initialData && (
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {t('settings.userIdCannotBeEdited', 'ID pengguna tidak dapat diubah setelah dibuat')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {t('settings.name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('settings.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              {t('settings.username')}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Right Column - Security & Profile */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Keamanan & Profil
          </h3>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('settings.password')}
              {initialData && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  (Kosongkan jika tidak ingin mengubah password)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!initialData}
                placeholder={initialData ? "Kosongkan untuk tetap menggunakan password lama" : "Masukkan password"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              {t('settings.role')}
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 pl-10"
              >
                <option value="admin">{t('settings.roles.admin')}</option>
                <option value="counselor">{t('settings.roles.counselor')}</option>
                <option value="student">{t('settings.roles.student')}</option>
                <option value="staff">{t('settings.roles.staff')}</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {getRoleIcon(formData.role)}
              </div>
            </div>
          </div>          <div>
            
            <ImageUploader
              currentImage={formData.photo || formData.avatar || ''}
              onImageChange={handleImageChange}
              label={t('settings.photo', 'Foto Profil')}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </form>
  );

  if (!isModal) {
    return (
      <div className="bg-white rounded-lg shadow">
        {formContent}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('settings.cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {initialData ? t('settings.update') : t('settings.create')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-semibold text-gray-900">
            {title || (initialData ? t('settings.editUser', 'Edit User') : t('settings.addUser', 'Tambah User'))}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 scrollbar-light">
          {formContent}
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('settings.cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {initialData ? t('settings.update') : t('settings.create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}