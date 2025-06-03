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
  FileText,
  LogOut,
  Bell,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import LanguageSwitch from './LanguageSwitch';
import NotificationPanel from './NotificationPanel';

const adminNavigation = [
  { name: 'nav.dashboard', href: '/app', icon: BarChart3 },
  { name: 'nav.userManagement', href: '/app/user-management', icon: Shield },
  { name: 'nav.classes', href: '/app/classes', icon: Users },
  { name: 'nav.students', href: '/app/students', icon: GraduationCap },
  { name: 'nav.sessions', href: '/app/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/app/mental-health', icon: Brain },
  { name: 'nav.behavior', href: '/app/behavior', icon: BarChart3 },
  { name: 'nav.career', href: '/app/career', icon: Briefcase },
  { name: 'nav.flowchart', href: '/app/flowchart', icon: BarChart3 },
  { name: 'nav.userManual', href: '/app/user-manual', icon: BookOpen },
  { name: 'nav.settings', href: '/app/settings', icon: Settings },
];

const counselorNavigation = [
  { name: 'nav.dashboard', href: '/app', icon: BarChart3 },
  { name: 'nav.classes', href: '/app/classes', icon: Users },
  { name: 'nav.sessions', href: '/app/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/app/mental-health', icon: Brain },
  { name: 'nav.behavior', href: '/app/behavior', icon: BarChart3 },
  { name: 'nav.career', href: '/app/career', icon: Briefcase },
  { name: 'nav.flowchart', href: '/app/flowchart', icon: BarChart3 },
  { name: 'nav.userManual', href: '/app/user-manual', icon: BookOpen },
  { name: 'nav.settings', href: '/app/settings', icon: Settings },
];

const studentNavigation = [
  { name: 'nav.dashboard', href: '/app', icon: BarChart3 },
  { name: 'nav.sessions', href: '/app/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/app/mental-health', icon: Brain },
  { name: 'nav.career', href: '/app/career', icon: Briefcase },
  { name: 'nav.behavior', href: '/app/behavior', icon: BarChart3 },
  { name: 'nav.reports', href: '/app/reports', icon: FileText },
  { name: 'nav.flowchart', href: '/app/flowchart', icon: BarChart3 },
  { name: 'nav.userManual', href: '/app/user-manual', icon: BookOpen },
  { name: 'nav.settings', href: '/app/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
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
    }, 1000);
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

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!user) {
    return <Navigate to="/" />;
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
      {/* Mobile sidebar */}
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

            <nav className="flex-1 p-4 overflow-y-auto scrollbar-custom">
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

      {/* Desktop sidebar */}
      <div className={cn(
        'hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      )}>
        <div className="flex flex-col flex-1 bg-gradient-to-b from-indigo-800 via-indigo-700 to-purple-800 shadow-xl overflow-hidden">
          <div className={cn(
            'flex h-14 items-center border-b border-indigo-700/50 transition-all duration-300',
            sidebarCollapsed ? 'px-2 justify-center' : 'px-4'
          )}>
            {!sidebarCollapsed && (
              <>
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-base font-bold text-white">
                  Counselor Hub
                </span>
              </>
            )}
            {sidebarCollapsed && (
              <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="p-3">
              <div className="p-3 bg-gradient-to-br from-indigo-700/60 to-purple-700/60 rounded-lg border border-indigo-600/30 backdrop-blur-sm shadow-lg">
                <div className="flex items-center">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="h-10 w-10 rounded-full ring-2 ring-white/30 object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="ml-2">
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-indigo-200 flex items-center">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                      {t(`roles.${user.role}`)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-indigo-200 italic">
                  {getGreeting()}, {user.name.split(' ')[0]}!
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-custom">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-all duration-200 group',
                    sidebarCollapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                      : 'text-indigo-100 hover:bg-indigo-700/50'
                  )}
                  title={sidebarCollapsed ? t(item.name) : undefined}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-lg transition-all duration-200',
                      sidebarCollapsed ? 'h-7 w-7 mr-0' : 'h-6 w-6 mr-2',
                      location.pathname === item.href
                        ? 'bg-white/20'
                        : 'bg-white/10 group-hover:bg-white/15'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  {!sidebarCollapsed && t(item.name)}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center rounded-lg text-sm font-medium text-indigo-100 hover:bg-red-500/30 transition-all duration-200 group',
                  sidebarCollapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'
                )}
                title={sidebarCollapsed ? t('nav.logout') : undefined}
              >
                <div className={cn(
                  'flex items-center justify-center rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors duration-200',
                  sidebarCollapsed ? 'h-7 w-7 mr-0' : 'h-6 w-6 mr-2'
                )}>
                  <LogOut className="h-4 w-4" />
                </div>
                {!sidebarCollapsed && t('nav.logout')}
              </button>
            </div>
          </nav>

          {!sidebarCollapsed && (
            <div className="p-3 border-t border-indigo-700/30 backdrop-blur-sm">
              <LanguageSwitch />
            </div>
          )}
        </div>
      </div>

      {/* Floating toggle button - positioned at right side of sidebar, below top nav */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'hidden lg:flex fixed top-16 z-40 bg-indigo-600 hover:bg-indigo-700 rounded-r-lg rounded-l-none p-2 shadow-lg border border-l-0 border-indigo-500 text-white transition-all duration-200 items-center justify-center',
          sidebarCollapsed ? 'left-16' : 'left-64'
        )}
        title={sidebarCollapsed ? t('nav.expand') : t('nav.collapse')}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className={cn(
        'flex flex-col flex-1 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-md border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
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
              {/* Desktop version - all in one line */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-indigo-500 mr-1" />
                  <span className="text-sm font-medium text-indigo-700">
                    {formatTimeWithLocale(currentTime, 'EEEE, dd MMMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-800 font-medium  mr-1">
                    {formatTimeWithLocale(currentTime, 'HH:mm:ss')}
                  </span>
                  <Clock className="h-4 w-4 text-indigo-500" />
                </div>
              </div>

              {/* Mobile version - already in one line */}
              <div className="md:hidden flex items-center text-xs font-medium text-gray-600 bg-indigo-50 px-2 py-1 rounded-full">
                <span>{formatTimeWithLocale(currentTime, 'dd MMM yyyy')}</span>
                <Clock className="h-4 w-4 text-indigo-500 ml-1" />
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
                to="/app/profile"
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
          <div className="py-1">
            <div className="mx-auto max-w-none px-1 sm:px-1 lg:px-2 animate-fadeIn">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}