import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Info, LockKeyhole, User, ArrowRight, Globe, Mail, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { authenticateUser } from '../services/userService';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();
  const { t, language, setLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authenticateUser(username, password);

      if (!user) {
        throw new Error('Invalid username or password');
      }

      const mockToken = btoa(`${user.username}:${user.role}:${Date.now()}`);

      localStorage.setItem('token', mockToken);
      localStorage.setItem('refresh_token', mockToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      // Always navigate to dashboard (root path) after login
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetEmailSent(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setEmail('');
        setResetEmailSent(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Branding and illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-700 to-purple-700">
        <div className="absolute inset-0 pattern-dots pattern-indigo-500 pattern-opacity-10 pattern-size-4"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-white">
          <div className="flex items-center mb-8">
            <Brain className="h-12 w-12 text-white mr-3" />
            <h1 className="text-4xl font-bold">Counselor Hub</h1>
          </div>
          <p className="text-xl max-w-md text-center mb-6">
            {t('login.platformDescription')}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-lg">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-1">{t('login.students')}</h3>
              <p className="text-sm text-indigo-100">{t('login.studentDescription')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-1">{t('login.counselors')}</h3>
              <p className="text-sm text-indigo-100">{t('login.counselorDescription')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-1">{t('login.admins')}</h3>
              <p className="text-sm text-indigo-100">{t('login.adminDescription')}</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
          © 2025 Counselor Hub. {t('login.allRightsReserved')}
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="lg:hidden flex flex-col items-center mb-6">
                <Brain className="h-10 w-10 text-indigo-600" />
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Counselor Hub</h2>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {t('login.welcomeBack')}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('login.signInPrompt')}
              </p>
            </div>
            
            {/* Language switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              {language === 'en' ? 'ID' : 'EN'}
            </button>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
            <div className="flex">
              <Info className="h-5 w-5 mr-3 text-blue-500" />
              <div>
                <p className="font-medium">{t('login.demoCredentials')}</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center p-2 bg-white rounded shadow-sm">
                    <div className="flex-shrink-0 p-1 bg-purple-100 rounded-full">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{t('login.adminUser')}</p>
                      <p className="text-xs text-gray-500">admin / admin123456</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-white rounded shadow-sm">
                    <div className="flex-shrink-0 p-1 bg-blue-100 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{t('login.counselorUser')}</p>
                      <p className="text-xs text-gray-500">john / password123</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-white rounded shadow-sm">
                    <div className="flex-shrink-0 p-1 bg-green-100 rounded-full">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{t('login.studentUser')}</p>
                      <p className="text-xs text-gray-500">student / password123</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-medium">{t('login.loginFailed')}</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.username')}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder={t('login.enterUsername')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.password')}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder={t('login.enterPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t('login.rememberMe')}
                </label>
              </div>
              
              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login.signingIn')}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {t('login.signIn')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Forgot password modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowForgotPassword(false)}></div>
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-md">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="text-center sm:mt-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
                    {t('login.resetPassword')}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {t('login.resetInstructions')}
                  </p>
                </div>
                
                {resetEmailSent ? (
                  <div className="rounded-md bg-green-50 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          {t('login.resetEmailSent')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="mt-3">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('login.email')}
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder={t('login.enterEmail')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('login.sending')}
                          </span>
                        ) : (
                          t('login.sendResetLink')
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}