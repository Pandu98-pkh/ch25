import { useState, useEffect } from 'react';

interface DeletedUser {
  userId: string;
  username: string;
  email: string;
  name: string;
  role: string;
  photo?: string;
  isActive: boolean;
  createdAt?: string;
  deletedAt?: string;
  id: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  isDestructive?: boolean;
  requiresTextConfirmation?: boolean;
  confirmationText?: string;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isDestructive = false,
  requiresTextConfirmation = false,
  confirmationText = ''
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requiresTextConfirmation && inputValue !== confirmationText) {
      return;
    }
    onConfirm();
    onClose();
  };

  const isValidConfirmation = !requiresTextConfirmation || inputValue === confirmationText;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center mb-4">
          {isDestructive ? (
            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          ) : (
            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4 whitespace-pre-line">{message}</p>
          
          {requiresTextConfirmation && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ketik "{confirmationText}" untuk konfirmasi:
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Ketik "${confirmationText}"`}
              />
            </div>
          )}
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValidConfirmation}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300'
            } disabled:cursor-not-allowed`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

function NotificationModal({ isOpen, onClose, title, message, type }: NotificationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center mb-4">
          {getIcon()}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4 whitespace-pre-line">{message}</p>
        </div>
        
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

const API_URL = 'http://localhost:5000/api';

export default function DeletedUsersManagement() {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal states
  const [restoreModal, setRestoreModal] = useState<{isOpen: boolean, userId: string, userName: string}>({
    isOpen: false,
    userId: '',
    userName: ''
  });
  const [hardDeleteModal, setHardDeleteModal] = useState<{isOpen: boolean, userId: string, userName: string}>({
    isOpen: false,
    userId: '',
    userName: ''
  });
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/users/deleted`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch deleted users');
      }
      
      const data = await response.json();
      setDeletedUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  const restoreUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`${API_URL}/admin/users/${userId}/restore`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to restore user');
      }
      
      const result = await response.json();
      
      // Remove user from deleted list
      setDeletedUsers(prev => prev.filter(user => user.userId !== userId));
      
      // Show success notification
      setNotificationModal({
        isOpen: true,
        title: 'Berhasil!',
        message: `✅ ${result.message}`,
        type: 'success'
      });
      
    } catch (err) {
      setNotificationModal({
        isOpen: true,
        title: 'Error!',
        message: `❌ Error: ${err instanceof Error ? err.message : 'Failed to restore user'}`,
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const hardDeleteUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`${API_URL}/admin/users/${userId}/hard-delete`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to permanently delete user');
      }
      
      const result = await response.json();
      
      // Remove user from deleted list
      setDeletedUsers(prev => prev.filter(user => user.userId !== userId));
      
      // Show warning notification
      setNotificationModal({
        isOpen: true,
        title: 'Data Dihapus Permanen!',
        message: `⚠️ ${result.message}\n${result.warning}`,
        type: 'warning'
      });
      
    } catch (err) {
      setNotificationModal({
        isOpen: true,
        title: 'Error!',
        message: `❌ Error: ${err instanceof Error ? err.message : 'Failed to delete user permanently'}`,
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreClick = (userId: string, userName: string) => {
    setRestoreModal({
      isOpen: true,
      userId,
      userName
    });
  };

  const handleHardDeleteClick = (userId: string, userName: string) => {
    setHardDeleteModal({
      isOpen: true,
      userId,
      userName
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'counselor': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading deleted users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🗑️ Manajemen User yang Dihapus
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola user yang telah dihapus (soft delete)
          </p>
        </div>
        
        <button
          onClick={fetchDeletedUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Informasi Soft Delete
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>• <strong>Restore</strong>: Mengaktifkan kembali user yang dihapus</p>
              <p>• <strong>Hard Delete</strong>: Menghapus permanen dari database (BERBAHAYA!)</p>
              <p>• User yang dihapus tidak dapat login tetapi data tetap tersimpan untuk audit</p>
            </div>
          </div>
        </div>
      </div>

      {deletedUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada user yang dihapus
          </h3>
          <p className="text-gray-600">
            Semua user dalam keadaan aktif atau telah dipulihkan.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {deletedUsers.map((user) => (
              <li key={user.userId} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>ID:</strong> {user.userId} | <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Username:</strong> {user.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Dibuat:</strong> {formatDate(user.createdAt)} | 
                          <strong> Dihapus:</strong> {formatDate(user.deletedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRestoreClick(user.userId, user.name)}
                      disabled={actionLoading === user.userId}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === user.userId ? (
                        <>🔄 Restoring...</>
                      ) : (
                        <>🔄 Restore</>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleHardDeleteClick(user.userId, user.name)}
                      disabled={actionLoading === user.userId}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === user.userId ? (
                        <>⏳ Processing...</>
                      ) : (
                        <>🗑️ Hard Delete</>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}      {deletedUsers.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Total {deletedUsers.length} user dihapus
        </div>
      )}

      {/* Restore Confirmation Modal */}
      <ConfirmationModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({isOpen: false, userId: '', userName: ''})}
        onConfirm={() => restoreUser(restoreModal.userId)}
        title="Konfirmasi Restore User"
        message={`Apakah Anda yakin ingin mengaktifkan kembali user "${restoreModal.userName}"?\n\nUser akan dapat login dan mengakses sistem kembali.`}
        confirmText="Ya, Restore"
        isDestructive={false}
      />

      {/* Hard Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={hardDeleteModal.isOpen}
        onClose={() => setHardDeleteModal({isOpen: false, userId: '', userName: ''})}
        onConfirm={() => hardDeleteUser(hardDeleteModal.userId)}
        title="⚠️ PERINGATAN: Hapus Permanen"
        message={`Menghapus permanen user "${hardDeleteModal.userName}"?\n\nData akan hilang SELAMANYA dan tidak dapat dipulihkan!\n\nTindakan ini tidak dapat dibatalkan!`}
        confirmText="Hapus Permanen"
        isDestructive={true}
        requiresTextConfirmation={true}
        confirmationText="HAPUS PERMANEN"
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal({isOpen: false, title: '', message: '', type: 'success'})}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />
    </div>
  );
}
