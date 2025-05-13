import { User, Settings, Home, Users, BookOpen, BarChart, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useUser } from '../contexts/UserContext';

function Sidebar() {
  const { t } = useLanguage();
  const { user } = useUser();

  // IMPORTANT: Hard-coded basic navigation items without translation to ensure they're visible
  const allNavItems = [
    // These must be visible for all users
    {
      icon: User,
      label: "Profile", // No translation to ensure it's visible
      href: '/profile',
    },
    {
      icon: Settings,
      label: "Settings", // No translation to ensure it's visible 
      href: '/settings',
    },
    // Other menu items
    {
      icon: Home,
      label: t('navigation.dashboard'), // Fixed: removed second argument
      href: '/',
    },
    {
      icon: Users,
      label: t('navigation.students'), // Fixed: removed second argument
      href: '/students',
    },
    {
      icon: BookOpen,
      label: t('navigation.courses'), // Fixed: removed second argument
      href: '/courses',
    },
    {
      icon: BarChart,
      label: t('navigation.reports'), // Fixed: removed second argument
      href: '/reports',
    },
    {
      icon: Calendar,
      label: t('navigation.calendar'), // Fixed: removed second argument
      href: '/calendar',
    },
  ];

  console.log("SIDEBAR RENDERED", { items: allNavItems, user });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">School App</h2>
        {/* DEBUG INFO - REMOVE AFTER TESTING */}
        <p className="text-xs text-red-500">Debug: Menu items: {allNavItems.length}</p>
      </div>
      
      {/* SIMPLIFIED NAVIGATION - All items in one list */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {allNavItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User info at bottom */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;