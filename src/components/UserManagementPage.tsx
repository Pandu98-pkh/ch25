import { useState, useRef, useEffect } from 'react';
import { User, Edit, Trash2, Download, Upload, UserPlus, Search, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User as UserType } from '../types';
import { cn } from '../utils/cn';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import UserForm from './ui/UserForm';

export default function UserManagementPage() {
  const { t } = useLanguage();
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-8 py-6 shadow-lg">
        <h1 className="text-3xl font-bold">{t('userManagement.title', 'User Management')}</h1>
        <p className="mt-2 text-indigo-100 max-w-3xl">
          {t('userManagement.subtitle', 'Manage users and their roles in the system')}
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8 border border-gray-100">
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-md mr-3">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('userManagement.users', 'Users')}</h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleImportClick}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200 hover:text-brand-600 hover:border-brand-500"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t('userManagement.importUsers', 'Import Users')}
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
                  {t('userManagement.exportUsers', 'Export Users')}
                </button>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('userManagement.addUser', 'Add User')}
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
              placeholder={t('userManagement.searchUsers', 'Search users...')}
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
                      {t('userManagement.name', 'Name')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('userManagement.username', 'Username')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('userManagement.email', 'Email')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('userManagement.role', 'Role')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('userManagement.actions', 'Actions')}
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
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all" style={{animation: 'modalFadeIn 0.3s ease-out'}}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                {t('userManagement.addUser', 'Add User')}
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
                {t('userManagement.editUser', 'Edit User')}
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('userManagement.confirmDelete', 'Confirm Delete')}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {t('userManagement.deleteConfirmation', 'Are you sure you want to delete this user? This action cannot be undone.')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDeleteModal(false);
                  setCurrentUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => handleDeleteUser(currentUser.id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {t('userManagement.confirmDelete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('userManagement.importPreview', 'Import Preview')}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('userManagement.importCSVDescription', 'Review the users that will be imported from your CSV file. Click "Import" to add these users to the system.')}
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('userManagement.name', 'Name')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('userManagement.username', 'Username')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('userManagement.email', 'Email')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('userManagement.role', 'Role')}
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
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                {t('userManagement.confirmImport', 'Import')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
