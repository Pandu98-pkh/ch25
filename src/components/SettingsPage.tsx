import { useState, useRef, useEffect } from 'react';
import { User, Edit, Trash2, Download, Upload, UserPlus, Search, Moon, Sun, Bell, Shield, Globe, PaintBucket, Palette, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { User as UserType } from '../types';
import { cn } from '../utils/cn';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import UserForm from './ui/UserForm';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { isAdmin } = useUser();
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    mentionEmail: false,
    mentionDesktop: true,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedUsers, setImportedUsers] = useState<UserType[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async (userData: Omit<UserType, 'id'>) => {
    try {
      const newUser = await createUser(userData);
      setUsers([...users, newUser]);
      setShowAddUserModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleEditUser = async (user: UserType) => {
    try {
      if (!user.id) return;
      
      const updatedUser = await updateUser(user.id, user);
      setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
      setShowEditUserModal(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      setShowConfirmDeleteModal(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Parse CSV content
        const csvContent = event.target?.result as string;
        const rows = csvContent.split('\n');
        
        // Extract headers (first row)
        const headers = rows[0].split(',').map(header => header.trim());
        
        // Map CSV columns to expected properties
        const nameIndex = headers.indexOf('name');
        const emailIndex = headers.indexOf('email');
        const roleIndex = headers.indexOf('role');
        const usernameIndex = headers.indexOf('username');
        
        if (nameIndex === -1 || emailIndex === -1 || roleIndex === -1) {
          alert('Invalid CSV format. The file must contain name, email, and role columns.');
          return;
        }
        
        // Convert CSV rows to user objects
        const newUsers: UserType[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows
          
          const values = rows[i].split(',').map(value => value.trim());
          
          const user: any = {
            id: (users.length + newUsers.length + 1).toString(),
            name: values[nameIndex],
            email: values[emailIndex],
            role: values[roleIndex],
            username: usernameIndex !== -1 ? values[usernameIndex] : `user${users.length + newUsers.length + 1}`,
            password: 'password123' // Default password
          };
          
          // Validate required fields
          if (user.name && user.email && user.role) {
            newUsers.push(user);
          }
        }
        
        if (newUsers.length > 0) {
          setImportedUsers(newUsers);
          setShowImportModal(true);
        } else {
          alert('No valid users found in the CSV file.');
        }
      } catch (error) {
        alert('Error parsing CSV file. Please ensure the file contains valid CSV data.');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
  };

  const confirmImport = async () => {
    try {
      // Create each imported user using the user service
      for (const userData of importedUsers) {
        // Skip the id property when creating a new user
        const { id, ...userDataWithoutId } = userData;
        await createUser(userDataWithoutId);
      }
      
      // Reload users after import
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      
      setShowImportModal(false);
      setImportedUsers([]);
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Failed to import some users. Please try again.');
    }
  };

  const exportUsers = () => {
    // Create CSV headers
    const headers = ['id', 'name', 'email', 'role', 'username'];
    
    // Create rows for each user, omitting password
    const rows = users.map(({ password, ...user }) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.username
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-8 py-6 shadow-lg">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="mt-2 text-indigo-100 max-w-3xl">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8 border border-gray-100">
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={cn(
                'px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap flex items-center',
                activeTab === 'general'
                  ? 'border-brand-500 text-brand-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Palette className="w-4 h-4 mr-2" />
              {t('settings.tabs.general')}
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  'px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap flex items-center',
                  activeTab === 'users'
                    ? 'border-brand-500 text-brand-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Shield className="w-4 h-4 mr-2" />
                {t('settings.tabs.userManagement')}
              </button>
            )}
          </nav>
        </div>

        {(activeTab === 'general' || !isAdmin) ? (
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
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-md mr-3">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.userManagement')}</h3>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleImportClick}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200 hover:text-brand-600 hover:border-brand-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('settings.importUsers')}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    onClick={exportUsers}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200 hover:text-brand-600 hover:border-brand-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('settings.exportUsers')}
                  </button>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t('settings.addUser')}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('settings.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm bg-white"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('settings.name')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('settings.username')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('settings.email')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('settings.role')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('settings.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user, index) => (
                      <tr key={user.id} className={`hover:bg-indigo-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium",
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            user.role === 'counselor' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-green-100 text-green-800 border border-green-200'
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setCurrentUser(user);
                                setShowEditUserModal(true);
                              }}
                              className="text-brand-600 hover:text-brand-900 p-1.5 rounded-full hover:bg-brand-50 transition-colors"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentUser(user);
                                setShowConfirmDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                              disabled={user.role === 'admin' && filteredUsers.filter(u => u.role === 'admin').length === 1}
                            >
                              <Trash2 className={cn(
                                "h-5 w-5",
                                user.role === 'admin' && filteredUsers.filter(u => u.role === 'admin').length === 1 ? "opacity-50 cursor-not-allowed" : ""
                              )} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal - Enhanced */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all" style={{animation: 'modalFadeIn 0.3s ease-out'}}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                {t('settings.addUser')}
              </h3>
              <button 
                onClick={() => setShowAddUserModal(false)} 
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="p-6">
              <UserForm
                onSubmit={handleAddUser}
                onCancel={() => setShowAddUserModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Style for modal animations */}
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

      {/* Edit User Modal */}
      {showEditUserModal && currentUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all" style={{animation: 'modalFadeIn 0.3s ease-out'}}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2" />
                {t('settings.editUser')}
              </h3>
              <button 
                onClick={() => {
                  setShowEditUserModal(false);
                  setCurrentUser(null);
                }} 
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="p-6">
              <UserForm
                initialData={currentUser}
                onSubmit={handleEditUser}
                onCancel={() => {
                  setShowEditUserModal(false);
                  setCurrentUser(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDeleteModal && currentUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.confirmDelete')}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('settings.deleteConfirmation')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDeleteModal(false);
                  setCurrentUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={() => handleDeleteUser(currentUser.id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {t('settings.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.importPreview')}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('settings.importCSVDescription') || 'Review the users that will be imported from your CSV file. Click "Import" to add these users to the system.'}
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('settings.name')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('settings.username')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('settings.email')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('settings.role')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importedUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-medium",
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'counselor' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        )}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportedUsers([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                {t('settings.confirmImport')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}