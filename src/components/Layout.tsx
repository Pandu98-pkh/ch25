import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { format } from 'date-fns';
import { enUS, id } from 'date-fns/locale'; // Import locales for date formatting
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
  Search,
  ChevronRight,
  Clock, // Add Clock icon for time display
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import LanguageSwitch from './LanguageSwitch';

// Navigation items for different roles
const adminNavigation = [
  { name: 'nav.profile', href: '/profile', icon: User },
  { name: 'nav.classes', href: '/classes', icon: Users },
  { name: 'nav.students', href: '/students', icon: GraduationCap },
  { name: 'nav.sessions', href: '/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/mental-health', icon: Brain },
  { name: 'nav.behavior', href: '/behavior', icon: BarChart3 },
  { name: 'nav.career', href: '/career', icon: GraduationCap },
  { name: 'nav.settings', href: '/settings', icon: Settings },
];

const counselorNavigation = [
  { name: 'nav.profile', href: '/profile', icon: User },
  { name: 'nav.classes', href: '/classes', icon: Users },
  { name: 'nav.students', href: '/students', icon: GraduationCap },
  { name: 'nav.sessions', href: '/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/mental-health', icon: Brain },
  { name: 'nav.behavior', href: '/behavior', icon: BarChart3 },
  { name: 'nav.career', href: '/career', icon: GraduationCap },
  { name: 'nav.settings', href: '/settings', icon: Settings },
];

const studentNavigation = [
  { name: 'nav.profile', href: '/profile', icon: User },
  { name: 'nav.sessions', href: '/sessions', icon: Calendar },
  { name: 'nav.mentalHealth', href: '/mental-health', icon: Brain },
  { name: 'nav.career', href: '/career', icon: GraduationCap },
  { name: 'nav.reports', href: '/reports', icon: FileText },
  { name: 'nav.settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t, language } = useLanguage(); // Get current language
  const { user, isAdmin, isCounselor, setUser } = useUser();

  // Determine which navigation to use based on role
  const navigation = isAdmin 
    ? adminNavigation 
    : isCounselor 
      ? counselorNavigation 
      : studentNavigation;

  // Update time every second instead of every minute to show seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second instead of minute
    return () => clearInterval(timer);
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

  // Format greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  // Using the locale with date-fns format function
  const formatTimeWithLocale = (date: Date, formatStr: string) => {
    return format(date, formatStr, { locale: language === 'id' ? id : enUS });
  };

  // Get day name from translation with proper typing
  const getDayName = (date: Date) => {
    const day = date.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t(`date.days.${days[day]}`);
  };

  // Get month name from translation with proper typing
  const getMonthName = (date: Date) => {
    const month = date.getMonth();
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];
    return t(`date.months.${months[month]}`);
  };

  // Format date with translations with proper typing
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = getMonthName(date);
    const year = date.getFullYear();
    return `${getDayName(date)}, ${day} ${month} ${year}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay - already fixed position */}
      <div className="lg:hidden">
        <div className={cn(
          'fixed inset-0 z-40 flex transform ease-in-out duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div
            className={cn(
              'fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity ease-linear duration-300',
              sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Mobile sidebar content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-900 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <span className="text-white text-2xl">&times;</span>
              </button>
            </div>
            
            {/* Mobile sidebar content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Brain className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="ml-3 text-xl font-bold text-white">
                  Counselor Hub
                </span>
              </div>
              
              {/* User card in mobile view */}
              <div className="mt-6 mx-4">
                <div className="p-4 bg-indigo-600/30 backdrop-blur-sm rounded-xl border border-indigo-500/40">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="h-12 w-12 rounded-full object-cover border-2 border-indigo-300" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 flex items-center justify-center text-indigo-700 text-lg font-semibold border-2 border-indigo-300">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-semibold text-white">{user.name}</div>
                      <div className="text-sm font-medium text-indigo-200">
                        {t(`roles.${user.role}`)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile navigation */}
              <nav className="mt-8 px-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200',
                      location.pathname === item.href
                        ? 'bg-indigo-800/60 text-white shadow-sm'
                        : 'text-indigo-100 hover:bg-indigo-800/40 hover:text-white'
                    )}
                  >
                    <item.icon
                      className="mr-4 flex-shrink-0 h-6 w-6"
                    />
                    {t(item.name)}
                  </Link>
                ))}
                
                {/* Logout Button for mobile */}
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-4 py-3 text-base font-medium rounded-xl text-indigo-100 hover:bg-indigo-800/40 hover:text-white transition-all duration-200"
                >
                  <LogOut className="mr-4 flex-shrink-0 h-6 w-6" />
                  {t('nav.logout')}
                </button>
              </nav>
            </div>
            
            {/* Mobile language switch */}
            <div className="flex-shrink-0 flex border-t border-indigo-600/50 p-4">
              <LanguageSwitch />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed desktop sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-40 lg:w-72">
        <div className="flex flex-col h-full bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-900 shadow-xl">
          {/* App logo and branding */}
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-indigo-600/50">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">
              Counselor Hub
            </span>
          </div>
          
          {/* User card with visually appealing design */}
          <div className="px-5 pt-6">
            <div className="p-4 bg-indigo-600/30 backdrop-blur-sm rounded-xl border border-indigo-500/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="h-12 w-12 rounded-full object-cover border-2 border-indigo-300" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 flex items-center justify-center text-indigo-700 text-lg font-semibold border-2 border-indigo-300">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-semibold text-white">{user.name}</div>
                    <div className="text-sm font-medium text-indigo-200 flex items-center">
                      <span className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        user.role === 'admin' ? "bg-purple-400" :
                        user.role === 'counselor' ? "bg-blue-400" :
                        "bg-green-400"
                      )}></span>
                      {t(`roles.${user.role}`)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs font-medium text-indigo-200 mt-2">
                {getGreeting()}, {user.name.split(' ')[0]}!
              </div>
            </div>
          </div>
          
          {/* Enhanced desktop navigation */}
          <nav className="flex-1 px-4 pt-6 pb-4 overflow-y-auto space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  location.pathname === item.href
                    ? 'bg-indigo-800/60 text-white shadow-sm border-l-4 border-indigo-400'
                    : 'text-indigo-100 hover:bg-indigo-800/40 hover:text-white hover:translate-x-1'
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-lg mr-3",
                  location.pathname === item.href
                    ? "bg-indigo-700/70"
                    : "bg-indigo-700/30 group-hover:bg-indigo-700/50"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{t(item.name)}</span>
              </Link>
            ))}
            
            {/* Enhanced logout button */}
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-indigo-100 hover:bg-red-500/20 hover:text-white transition-all duration-200 hover:translate-x-1"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg mr-3 bg-red-500/30 group-hover:bg-red-500/50">
                <LogOut className="h-5 w-5" />
              </div>
              <span>{t('nav.logout')}</span>
            </button>
          </nav>
          
          {/* Bottom section with language switch */}
          <div className="flex-shrink-0 flex border-t border-indigo-600/50 p-4">
            <LanguageSwitch />
          </div>
        </div>
      </div>

      {/* Main content area with padding for fixed sidebar */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Fixed top navigation bar */}
        <div className="sticky top-0 z-30 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden -ml-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Search bar in header */}
            <div className="hidden md:flex md:flex-1 md:items-center lg:ml-6">
              <div className="max-w-lg w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={t('common.search')}
                />
              </div>
            </div>
            
            {/* Header actions */}
            <div className="flex items-center space-x-4">
              {/* Current date and time display */}
              <div className="hidden md:flex flex-col items-end mr-2">
                <div className="text-sm font-medium text-gray-800 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                  {formatDate(currentTime)}
                </div>
                <div className="text-xs font-mono text-gray-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1.5 text-indigo-500" />
                  {formatTimeWithLocale(currentTime, 'HH:mm:ss')}
                </div>
              </div>
              
              <button className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <Bell className="h-6 w-6" />
              </button>
              <a href="/profile" className="hidden md:block">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </a>
            </div>
          </div>
        </div>
        
        {/* Fixed breadcrumb navigation */}
        <div className="sticky top-16 z-20 bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-1 text-sm font-medium text-gray-500">
              <Link to="/" className="hover:text-indigo-600">Dashboard</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name 
                  ? t(navigation.find(item => item.href === location.pathname)?.name || '') 
                  : 'Page'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Scrollable main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}