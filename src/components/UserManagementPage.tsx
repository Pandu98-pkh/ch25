import { useState, useRef, useEffect } from 'react';
import { User, Edit, Trash2, Download, Upload, UserPlus, Search, Shield, Archive } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User as UserType } from '../types';
import { cn } from '../utils/cn';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import UserForm from './ui/UserForm';
import DeletedUsersManagement from './DeletedUsersManagement';

export default function UserManagementPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserType[]>([]);  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);  const [showImportModal, setShowImportModal] = useState(false);
  const [importedUsers, setImportedUsers] = useState<UserType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [importCompleted, setImportCompleted] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

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
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.userId && user.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );  const handleAddUser = async (userData: Omit<UserType, 'id'>) => {
    try {
      setError(null);
      const newUser = await createUser(userData);
      
      // Add new user to local state
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // Force a refresh to ensure consistency
      try {
        const refreshedUsers = await getUsers();
        setUsers(refreshedUsers);
      } catch (refreshError) {
        console.warn('Failed to refresh users list after creation:', refreshError);
        // Continue with local update if refresh fails
      }
      
      setShowAddUserModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user. Please try again.';
      setError(errorMessage);
      // Keep modal open to show the error and allow corrections
    }
  };  const handleEditUser = async (user: UserType) => {
    try {
      setError(null);
      if (!user.userId) return;
        const updatedUser = await updateUser(user.userId, user);
      
      // Update the local state with the updated user
      setUsers(prevUsers => prevUsers.map((u) => (u.userId === user.userId ? updatedUser : u)));
        // Force a refresh by reloading users from server to ensure consistency
      try {
        const refreshedUsers = await getUsers();
        setUsers(refreshedUsers);
      } catch (refreshError) {
        console.warn('Failed to refresh users list after update:', refreshError);
        // Continue with local update if refresh fails
      }
      
      setShowEditUserModal(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user. Please try again.';
      setError(errorMessage);
      // Keep modal open to show the error and allow corrections
    }
  };
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.userId !== userId));
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
        const userIdIndex = headers.indexOf('userId');
        
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
            name: values[nameIndex],
            email: values[emailIndex],
            role: values[roleIndex],
            username: usernameIndex !== -1 ? values[usernameIndex] : `user${users.length + newUsers.length + 1}`,
            password: 'password123', // Default password
            userId: userIdIndex !== -1 ? values[userIdIndex] : '' // Get userId from CSV or leave empty
          };
          
          // If userId is not provided, generate one based on role
          if (!user.userId) {
            if (user.role === 'admin') {
              user.userId = `ADM${String(users.filter(u => u.role === 'admin').length + newUsers.filter(u => u.role === 'admin').length + 1).padStart(3, '0')}`;
            } else if (user.role === 'counselor') {
              user.userId = `COUN${String(users.filter(u => u.role === 'counselor').length + newUsers.filter(u => u.role === 'counselor').length + 1).padStart(3, '0')}`;
            } else if (user.role === 'student') {
              user.userId = `S${Math.floor(10000 + Math.random() * 90000)}`; // Random 5-digit number for students
            } else {
              user.userId = `USER${String(users.length + newUsers.length + 1).padStart(3, '0')}`;
            }
          }
          
          // Check if userId already exists
          if (users.some(u => u.userId === user.userId) || newUsers.some(u => u.userId === user.userId)) {
            // Generate a new unique userId by adding a random suffix
            user.userId = `${user.userId}-${Math.floor(1000 + Math.random() * 9000)}`;
          }
          
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
  };  const confirmImport = async () => {
    try {
      setError(null);
      setImportLoading(true);
      setImportCompleted(false);
      setImportProgress(0);
      
      // Track successfully imported users and errors
      const successfulImports: UserType[] = [];
      const failedImports: { user: UserType; error: string }[] = [];
      const totalUsers = importedUsers.length;
      
      // Create each imported user using the user service
      for (let i = 0; i < importedUsers.length; i++) {
        const userData = importedUsers[i];
        try {
          const createdUser = await createUser(userData);
          successfulImports.push(createdUser);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          failedImports.push({ user: userData, error: errorMessage });
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / totalUsers) * 100);
        setImportProgress(progress);
        
        // Small delay to show progress (optional, can be removed in production)
        if (i < importedUsers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Reload users after import
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      
      // Set completion status and messages
      setImportCompleted(true);
      
      if (failedImports.length > 0) {
        setSuccessMessage(`${successfulImports.length} users imported successfully.`);
        const errorMessage = `${failedImports.length} users failed to import: ` + 
          failedImports.map(f => `${f.user.name} (${f.error})`).join(', ');
        setError(errorMessage);
      } else {
        setSuccessMessage(`Successfully imported all ${successfulImports.length} users!`);
      }
    } catch (error) {
      console.error('Error importing users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import users. Please try again.';
      setError(errorMessage);
      setImportCompleted(true);
    } finally {
      setImportLoading(false);
    }
  };const exportUsers = () => {
    // Create CSV headers
    const headers = ['userId', 'name', 'email', 'role', 'username'];
    
    // Create rows for each user, omitting password
    const rows = users.map(({ password, ...user }) => [
      user.userId || '',
      user.name,
      user.email,
      user.role,
      user.username || ''
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

  const downloadImportTemplate = () => {
    // Create CSV template with headers and example data
    const headers = ['name', 'email', 'role', 'username', 'userId'];
    const exampleRows = [
      ['John Doe', 'john.doe@example.com', 'admin', 'johndoe', 'ADM001'],
      ['Jane Smith', 'jane.smith@example.com', 'counselor', 'janesmith', 'COUN001'],
      ['Bob Wilson', 'bob.wilson@example.com', 'student', 'bobwilson', 'S12345'],
      ['Alice Brown', 'alice.brown@example.com', 'counselor', 'alicebrown', ''],
      ['Charlie Green', 'charlie.green@example.com', 'student', 'charliegreen', '']
    ];
    
    // Combine headers and example rows
    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the template file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle between active users and deleted users view
  if (showDeletedUsers) {
    return (
      <div>
        <div className="mb-8 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl px-8 py-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🗑️ User yang Dihapus</h1>
              <p className="mt-2 text-red-100 max-w-3xl">
                Kelola user yang telah dihapus dari sistem (soft delete)
              </p>
            </div>
            <button
              onClick={() => setShowDeletedUsers(false)}
              className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              ← Kembali ke User Aktif
            </button>
          </div>
        </div>
        <DeletedUsersManagement />
      </div>
    );
  }

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
                  onClick={downloadImportTemplate}
                  className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm transition-all duration-200 hover:text-blue-800 hover:border-blue-400"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('userManagement.downloadTemplate', 'Download Template')}
                </button>
                
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
                />                <button
                  onClick={exportUsers}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200 hover:text-brand-600 hover:border-brand-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('userManagement.exportUsers', 'Export Users')}
                </button>
                
                <button
                  onClick={() => setShowDeletedUsers(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200 hover:text-orange-600 hover:border-orange-500"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  User Dihapus
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
          </div>          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
            <div className="overflow-x-auto scrollbar-light">
              <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gradient-to-r from-gray-50 to-gray-100">
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
                      {t('userManagement.id', 'ID')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('userManagement.role', 'Role')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t('userManagement.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.userId} className={`hover:bg-indigo-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            {user.photo || user.avatar ? (
                              <img
                                src={user.photo || user.avatar}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                  // Fallback to default icon if image fails to load
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) {
                                    fallback.classList.remove('hidden');
                                  }
                                }}
                                key={`${user.userId}-${user.photo || user.avatar}`} // Force re-render when photo changes
                              />
                            ) : null}
                            <div className={`h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200 ${user.photo || user.avatar ? 'hidden' : ''}`}>
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">{user.username}</div>
                      </td>                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-medium">
                          {user.userId || t('userManagement.idNotSet', 'Not set')}
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
      </div>      {/* Add User Modal */}
      {showAddUserModal && (
        <UserForm
          onSubmit={handleAddUser}
          onCancel={() => {
            setShowAddUserModal(false);
            setError(null);
          }}
          isModal={true}
          title={t('userManagement.addUser', 'Tambah User Baru')}
          error={error}
        />
      )}      {/* Edit User Modal */}
      {showEditUserModal && currentUser && (
        <UserForm
          initialData={currentUser}
          onSubmit={handleEditUser}
          onCancel={() => {
            setShowEditUserModal(false);
            setCurrentUser(null);
            setError(null);
          }}
          isModal={true}
          title={t('userManagement.editUser', 'Edit User')}
          error={error}
        />
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
              </button>              <button
                onClick={() => handleDeleteUser(currentUser.userId)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {t('userManagement.confirmDelete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}      {/* Import Preview Modal */}      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto scrollbar-light">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {importCompleted ? 'Import Results' : t('userManagement.importPreview', 'Import Preview')}
            </h3>
            
            {!importCompleted && (
              <p className="text-sm text-gray-500 mb-4">
                {t('userManagement.importCSVDescription', 'Review the users that will be imported from your CSV file. Click "Import" to add these users to the system.')}
              </p>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <strong>Success:</strong> {successMessage}
              </div>
            )}

            {importLoading && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Importing users...</span>
                  <span className="text-sm font-medium text-gray-500">{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-brand-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Processing {Math.ceil((importProgress / 100) * importedUsers.length)} of {importedUsers.length} users
                </div>
              </div>
            )}

            {!importCompleted && !importLoading && (
              <div className="overflow-x-auto mb-6 scrollbar-light">
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
                        {t('userManagement.id', 'ID')}
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
                          <div className="text-sm text-gray-500">{user.userId || t('userManagement.idNotSet', 'Not set')}</div>
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
            )}
            
            <div className="flex justify-end space-x-3">
              {importCompleted ? (
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportedUsers([]);
                    setError(null);
                    setSuccessMessage(null);
                    setImportCompleted(false);
                    setImportProgress(0);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportedUsers([]);
                      setError(null);
                      setSuccessMessage(null);
                      setImportProgress(0);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={importLoading}
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={confirmImport}
                    disabled={importLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {importLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing... ({importProgress}%)
                      </>
                    ) : (
                      t('userManagement.confirmImport', 'Import')
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
