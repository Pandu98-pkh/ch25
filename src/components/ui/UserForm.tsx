import { useState } from 'react';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface UserFormProps {
  initialData?: User;
  onSubmit: (userData: User) => void;
  onCancel: () => void;
}

export default function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<User>({
    id: initialData?.id || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'counselor',
    username: initialData?.username || '',
    password: initialData?.password || '',
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
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
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
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
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('settings.password')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!initialData}
            placeholder={initialData ? "Leave blank to keep current password" : ""}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          {t('settings.role')}
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="admin">{t('settings.roles.admin')}</option>
          <option value="counselor">{t('settings.roles.counselor')}</option>
          <option value="student">{t('settings.roles.student')}</option>
          <option value="staff">{t('settings.roles.staff')}</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('settings.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          {initialData ? t('settings.update') : t('settings.create')}
        </button>
      </div>
    </form>
  );
}