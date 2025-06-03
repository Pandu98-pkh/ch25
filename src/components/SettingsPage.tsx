import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Globe, PaintBucket, CheckCircle, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    mentionEmail: false,
    mentionDesktop: true,
  });

  const [darkMode, setDarkMode] = useState(false);

  // Add effect to apply dark mode
  useEffect(() => {
    // Apply dark mode to the document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add function to handle language change
  const handleLanguageChange = (newLanguage: 'en' | 'id') => {
    setLanguage(newLanguage);
  };

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-8 py-6 shadow-lg">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="mt-2 text-indigo-100 max-w-3xl">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8 border border-gray-100">
        {isAdmin && (
          <div className="p-4 bg-indigo-50 border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="text-sm font-medium text-indigo-700">
                  {t('settings.adminSettings', 'Admin Settings')}
                </span>
              </div>
              <button
                onClick={() => navigate('/app/user-management')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {t('settings.goToUserManagement', 'Go to User Management')}
              </button>
            </div>
          </div>
        )}

        <div className="p-8 space-y-8">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <PaintBucket className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">{t('settings.appearance')}</h3>
            </div>
            
            <div className="flex items-center">
              <div className="relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 bg-gray-200" 
                   role="switch"
                   aria-checked={darkMode}
                   onClick={() => setDarkMode(!darkMode)}>
                <span
                  className={`pointer-events-none relative inline-block h-6 w-6 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                    darkMode ? 'translate-x-7 bg-brand-600' : 'translate-x-0 bg-white'
                  }`}
                >
                  {darkMode ? 
                    <Moon className="h-4 w-4 absolute top-1 left-1 text-white" /> : 
                    <Sun className="h-4 w-4 absolute top-1 left-1 text-yellow-500" />
                  }
                </span>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">{t('settings.darkMode')}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">{t('settings.notifications')}</h3>
            </div>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                  <label htmlFor="email-notifications" className="text-sm font-medium text-gray-800 block">
                    {t('settings.emailNotifications')}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Receive email updates about your account activity</p>
                </div>
                <div className="relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 bg-gray-200" 
                     role="switch"
                     aria-checked={notifications.email}
                     id="email-notifications"
                     onClick={() => setNotifications({ ...notifications, email: !notifications.email })}>
                  <span
                    className={`pointer-events-none relative inline-block h-6 w-6 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.email ? 'translate-x-7 bg-brand-600' : 'translate-x-0 bg-white'
                    }`}
                  >
                    {notifications.email && <CheckCircle className="h-4 w-4 absolute top-1 left-1 text-white" />}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                  <label htmlFor="desktop-notifications" className="text-sm font-medium text-gray-800 block">
                    {t('settings.desktopNotifications')}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Show desktop notifications for important updates</p>
                </div>
                <div className="relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 bg-gray-200" 
                     role="switch"
                     aria-checked={notifications.desktop}
                     id="desktop-notifications"
                     onClick={() => setNotifications({ ...notifications, desktop: !notifications.desktop })}>
                  <span
                    className={`pointer-events-none relative inline-block h-6 w-6 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.desktop ? 'translate-x-7 bg-brand-600' : 'translate-x-0 bg-white'
                    }`}
                  >
                    {notifications.desktop && <CheckCircle className="h-4 w-4 absolute top-1 left-1 text-white" />}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">{t('settings.language')}</h3>
            </div>
            
            <div className="mt-2">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    language === 'en' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105' 
                      : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mr-2 border-2 overflow-hidden ${language === 'en' ? 'border-white' : 'border-gray-200'}`}>
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">EN</div>
                  </div>
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('id')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    language === 'id' 
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md transform scale-105' 
                      : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mr-2 border-2 overflow-hidden ${language === 'id' ? 'border-white' : 'border-gray-200'}`}>
                    <div className="w-full h-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">ID</div>
                  </div>
                  Indonesia
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}