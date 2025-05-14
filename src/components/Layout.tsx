import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import {
  Users,
  Calendar,
  Brain,
  BarChart3,
  GraduationCap,
  Settings,
  Menu,
  User,
  FileText,
  LogOut,
  Bell,
  Shield,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import LanguageSwitch from './LanguageSwitch';
import NotificationPanel from './NotificationPanel';

const adminNavigation = [
  { name: 'nav.userManagement', href: '/user-management', icon: Shield },
  { name: 'nav.classes', href: '/classes', icon: Users },
  { name: 'nav.students', href: '/students', icon: GraduationCap },
  { name: 'nav.sessions', href: '/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/mental-health', icon: Brain },
  { name: 'nav.behavior', href: '/behavior', icon: BarChart3 },
  { name: 'nav.settings', href: '/settings', icon: Settings },
];

const counselorNavigation = [
  { name: 'nav.students', href: '/students', icon: GraduationCap },
  { name: 'nav.sessions', href: '/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/mental-health', icon: Brain },
  { name: 'nav.settings', href: '/settings', icon: Settings },
];

const studentNavigation = [
  { name: 'nav.sessions', href: '/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/mental-health', icon: Brain },
  { name: 'nav.career', href: '/career', icon: User },
  { name: 'nav.behavior', href: '/behavior', icon: BarChart3 },
  { name: 'nav.reports', href: '/reports', icon: FileText },
  { name: 'nav.settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t, language } = useLanguage();
  const { user, isAdmin, isCounselor, setUser } = useUser();
  const { unreadCount } = useNotifications();
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const navigation = isAdmin
    ? adminNavigation
    : isCounselor
    ? counselorNavigation
    : studentNavigation;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationPanelOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  const formatTimeWithLocale = (date: Date, formatStr: string) => {
    return format(date, formatStr, { locale: language === 'id' ? id : enUS });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div
          className={cn(
            'fixed inset-y-0 left-0 w-full max-w-xs flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="bg-gradient-to-r from-indigo-800 to-purple-800 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-indigo-700/50">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm animate-pulse">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <span className="ml-3 text-lg font-bold text-white">Counselor Hub</span>
              </div>
              <button
                className="text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            <div className="p-4">
              <div className="p-3 bg-gradient-to-br from-indigo-700/60 to-purple-700/60 rounded-lg border border-indigo-600/30 backdrop-blur-sm shadow-lg">
                <div className="flex items-center">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="h-12 w-12 rounded-full ring-2 ring-white/30 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name}</div>
                    <div className="text-xs text-indigo-200 flex items-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                      {t(`roles.${user.role}`)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-indigo-200 italic">
                  {getGreeting()}, {user.name.split(' ')[0]}!
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                      location.pathname === item.href
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                        : 'text-indigo-100 hover:bg-indigo-700/50 hover:translate-x-1'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-lg mr-3 transition-colors duration-200',
                        location.pathname === item.href
                          ? 'bg-white/20'
                          : 'bg-white/10 group-hover:bg-white/15'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    {t(item.name)}
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-indigo-100 hover:bg-red-500/30 transition-all duration-200 hover:translate-x-1 group"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg mr-3 bg-red-500/20 group-hover:bg-red-500/30 transition-colors duration-200">
                    <LogOut className="h-5 w-5" />
                  </div>
                  {t('nav.logout')}
                </button>
              </div>
            </nav>

            <div className="p-4 border-t border-indigo-700/30 backdrop-blur-sm">
              <LanguageSwitch />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 bg-gradient-to-b from-indigo-800 via-indigo-700 to-purple-800 shadow-xl overflow-hidden">
          <div className="flex h-16 items-center px-6 border-b border-indigo-700/50">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <span className="ml-3 text-lg font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Counselor Hub
            </span>
          </div>

          <div className="p-5">
            <div className="p-4 bg-gradient-to-br from-indigo-700/60 to-purple-700/60 rounded-xl border border-indigo-600/30 backdrop-blur-sm shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="h-12 w-12 rounded-full ring-2 ring-white/30 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name}</div>
                    <div className="text-xs text-indigo-200 flex items-center">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                      {t(`roles.${user.role}`)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-indigo-200 italic">
                {getGreeting()}, {user.name.split(' ')[0]}!
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-5 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border-l-4 border-indigo-300'
                      : 'text-indigo-100 hover:bg-indigo-700/50 hover:translate-x-1'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-lg mr-3 transition-all duration-200',
                      location.pathname === item.href
                        ? 'bg-white/20'
                        : 'bg-white/10 group-hover:bg-white/15'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  {t(item.name)}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-indigo-100 hover:bg-red-500/30 transition-all duration-200 hover:translate-x-1 group"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg mr-3 bg-red-500/20 group-hover:bg-red-500/30 transition-colors duration-200">
                  <LogOut className="h-5 w-5" />
                </div>
                {t('nav.logout')}
              </button>
            </div>
          </nav>

          <div className="p-5 border-t border-indigo-700/30 backdrop-blur-sm">
            <LanguageSwitch />
          </div>
        </div>
      </div>

      <div className="lg:pl-72 flex flex-col flex-1">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-md border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              type="button"
              className="lg:hidden -ml-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 px-4 lg:px-0">
              <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">
                {navigation.find((item) => item.href === location.pathname)?.name
                  ? t(navigation.find((item) => item.href === location.pathname)?.name || '')
                  : 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-sm font-medium text-gray-600 bg-indigo-50 px-3 py-1 rounded-full">
                {formatTimeWithLocale(currentTime, 'PPP')}
              </div>

              <div className="relative" ref={notificationRef}>
                <button 
                  className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200 relative"
                  onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                  aria-label="Notifications"
                >
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <Bell className="h-6 w-6" />
                </button>
                
                <NotificationPanel 
                  isOpen={notificationPanelOpen} 
                  onClose={() => setNotificationPanelOpen(false)} 
                />
              </div>

              <Link
                to="/profile"
                className="transform hover:scale-110 transition-transform duration-200"
              >
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border-2 border-indigo-200 hover:border-indigo-400 transition-colors duration-200 shadow-sm"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-colors duration-200">
                    {user.name.charAt(0)}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 transition-all duration-300 ease-in-out">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-fadeIn">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}