import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Globe, PaintBucket, CheckCircle, Settings, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../services/userService';
import { toast } from '../utils/toast';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAdmin } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    mentionEmail: false,
    mentionDesktop: true,
  });

  const [darkMode, setDarkMode] = useState(false);
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
  };  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;
    
    let strength = 'Sangat Lemah';
    let color = 'bg-red-500';
    let width = '20%';

    if (score >= 5) {
      strength = 'Sangat Kuat';
      color = 'bg-green-500';
      width = '100%';
    } else if (score >= 4) {
      strength = 'Kuat';
      color = 'bg-blue-500';
      width = '80%';
    } else if (score >= 3) {
      strength = 'Sedang';
      color = 'bg-yellow-500';
      width = '60%';
    } else if (score >= 2) {
      strength = 'Lemah';
      color = 'bg-orange-500';
      width = '40%';
    }

    return { strength, color, width, checks, score };
  };

  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);
  const passwordsMatch = passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword;

  // Handle password change form submit
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('settings.userNotLoggedIn', 'User not logged in'));
      return;
    }
    
    setIsChangingPassword(true);

    // Check if new password and confirm password match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('settings.passwordsDontMatch', 'New password and confirm password do not match.'));
      setIsChangingPassword(false);
      return;
    }

    // Basic password validation
    if (passwordForm.newPassword.length < 6) {
      toast.error(t('settings.passwordTooShort', 'Password must be at least 6 characters long'));
      setIsChangingPassword(false);
      return;
    }try {
      // Call updateUser service to update password
      await updateUser(user.userId, {
        ...user,
        password: passwordForm.newPassword
      });

      toast.success(t('profile.passwordChanged', 'Password changed successfully'));
      
      // Clear password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error changing password';
      toast.error(t('settings.passwordChangeError', errorMessage));
    } finally {
      setIsChangingPassword(false);
    }
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
          </div>          {/* Password Change Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <Lock className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">{t('settings.changePassword')}</h3>
                <p className="text-sm text-gray-600 mt-1">Gunakan password yang kuat untuk keamanan akun Anda</p>
              </div>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="text-sm font-medium text-gray-800 block">
                  {t('settings.currentPassword')}
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-600 focus:outline-none text-sm"
                    placeholder={t('settings.enterCurrentPassword')}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm">
                    {showPasswords.current ? (
                      <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPasswords({ ...showPasswords, current: false })} />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPasswords({ ...showPasswords, current: true })} />
                    )}
                  </div>
                </div>
              </div>              <div>
                <label htmlFor="new-password" className="text-sm font-medium text-gray-800 block">
                  {t('settings.newPassword')}
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="new-password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-600 focus:outline-none text-sm"
                    placeholder={t('settings.enterNewPassword')}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm">
                    {showPasswords.new ? (
                      <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPasswords({ ...showPasswords, new: false })} />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPasswords({ ...showPasswords, new: true })} />
                    )}
                  </div>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordForm.newPassword && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Kekuatan Password:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score >= 4 ? 'text-green-600' :
                        passwordStrength.score >= 3 ? 'text-blue-600' :
                        passwordStrength.score >= 2 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: passwordStrength.width }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-full mr-1 ${passwordStrength.checks.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Min 8 karakter
                      </div>
                      <div className={`flex items-center ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-full mr-1 ${passwordStrength.checks.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Huruf besar
                      </div>
                      <div className={`flex items-center ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-full mr-1 ${passwordStrength.checks.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Huruf kecil
                      </div>
                      <div className={`flex items-center ${passwordStrength.checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-full mr-1 ${passwordStrength.checks.numbers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Angka
                      </div>
                      <div className={`flex items-center ${passwordStrength.checks.symbols ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-3 h-3 rounded-full mr-1 ${passwordStrength.checks.symbols ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Simbol
                      </div>
                    </div>
                  </div>
                )}
              </div>              <div>
                <label htmlFor="confirm-password" className="text-sm font-medium text-gray-800 block">
                  {t('settings.confirmPassword')}
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirm-password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className={`block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none text-sm ${
                      passwordForm.confirmPassword 
                        ? passwordsMatch 
                          ? 'border-green-300 focus:ring-green-600' 
                          : 'border-red-300 focus:ring-red-600'
                        : 'border-gray-300 focus:ring-brand-600'
                    }`}
                    placeholder={t('settings.confirmNewPassword')}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-12 flex items-center text-sm">
                    {passwordForm.confirmPassword && (
                      <div className="mr-2">
                        {passwordsMatch ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">×</span>
                          </div>
                        )}
                      </div>
                    )}
                    {showPasswords.confirm ? (
                      <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPasswords({ ...showPasswords, confirm: false })} />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setShowPasswords({ ...showPasswords, confirm: true })} />
                    )}
                  </div>
                </div>
                
                {/* Password Match Indicator */}
                {passwordForm.confirmPassword && (
                  <div className="mt-2">
                    {passwordsMatch ? (
                      <div className="flex items-center text-green-600 text-xs">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Password cocok
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-xs">
                        <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center mr-1">
                          <span className="text-white text-xs font-bold">×</span>
                        </div>
                        Password tidak cocok
                      </div>
                    )}
                  </div>
                )}
              </div>              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword || !passwordsMatch || !passwordForm.confirmPassword || passwordStrength.score < 3}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center ${
                    isChangingPassword || !passwordsMatch || !passwordForm.confirmPassword || passwordStrength.score < 3
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isChangingPassword ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v5l4.5-4.5L20 9l-4.5 4.5L16 12a8 8 0 01-8 8v-5l-4.5 4.5L4 15l4.5-4.5L8 12a8 8 0 010-8V4L3.5 8.5 2 7l4.5-4.5L8 4a8 8 0 018 8h5l-4.5 4.5L15 16l4.5-4.5L20 12a8 8 0 01-8-8z" />
                      </svg>
                      Mengubah Password...
                    </>
                  ) : (
                    t('settings.changePassword', 'Change Password')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}