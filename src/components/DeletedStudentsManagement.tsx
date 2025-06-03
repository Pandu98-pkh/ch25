import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface DeletedStudent {
  studentId: string;
  name?: string;
  email?: string;
  username?: string;
  grade?: string;
  tingkat?: string;
  kelas?: string;
  academicStatus?: string;
  academic_status?: string;
  program?: string;
  mentalHealthScore?: number;
  mental_health_score?: number;
  photo?: string;
  isActive: boolean;
  createdAt?: string;
  deletedAt?: string;
  userId?: string;
  user_id?: string;
  id: string;
  // Fallback fields from users table if student data is missing
  userTableId?: string;
  userTableName?: string;
  userTableEmail?: string;
  userTablePhoto?: string;
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

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning';
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
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDestructive
                ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
                : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300'
            } disabled:cursor-not-allowed`}
          >            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
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
    </div>  );
}

const API_URL = 'http://localhost:5000/api';

// Helper function to safely get student data with fallbacks between students and users tables
const getStudentData = (student: DeletedStudent) => {
  return {
    id: student.id || student.studentId,
    studentId: student.studentId || student.id,
    name: student.name || student.userTableName || 'Unknown Student',
    email: student.email || student.userTableEmail || 'No email',
    username: student.username || 'N/A',
    grade: student.grade || (student.tingkat && student.kelas ? `${student.tingkat}${student.kelas}` : 'N/A'),
    academicStatus: student.academicStatus || student.academic_status || 'warning',
    program: student.program || 'N/A',
    mentalHealthScore: student.mentalHealthScore || student.mental_health_score || 0,
    photo: student.photo || student.userTablePhoto || null,
    isActive: student.isActive,
    createdAt: student.createdAt,
    deletedAt: student.deletedAt,
    userId: student.userId || student.user_id || student.userTableId
  };
};

interface DeletedStudentsManagementProps {
  onBack?: () => void;
}

export default function DeletedStudentsManagement({ onBack }: DeletedStudentsManagementProps = {}) {
  const [deletedStudents, setDeletedStudents] = useState<DeletedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Selection states
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Modal states
  const [restoreModal, setRestoreModal] = useState<{isOpen: boolean, studentId: string, studentName: string}>({
    isOpen: false,
    studentId: '',
    studentName: ''
  });
  const [hardDeleteModal, setHardDeleteModal] = useState<{isOpen: boolean, studentId: string, studentName: string}>({
    isOpen: false,
    studentId: '',
    studentName: ''
  });
  const [bulkHardDeleteModal, setBulkHardDeleteModal] = useState<{isOpen: boolean, count: number}>({
    isOpen: false,
    count: 0
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
    fetchDeletedStudents();
  }, []);  const fetchDeletedStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to fetch deleted students from:', `${API_URL}/admin/students/deleted`);
      
      const response = await fetch(`${API_URL}/admin/students/deleted`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch deleted students'}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      // Process each student to handle missing data from either students or users table
      const processedStudents = data.map((student: any) => {
        // If student data is missing, try to fetch from users table
        const processedStudent: DeletedStudent = {
          id: student.id || student.studentId || student.userId,
          studentId: student.studentId || student.id,
          name: student.name || `Student ${student.studentId || student.id}`,
          email: student.email || '',
          username: student.username || '',
          grade: student.grade || (student.tingkat && student.kelas ? `${student.tingkat}${student.kelas}` : ''),
          academicStatus: student.academicStatus || student.academic_status || 'warning',
          academic_status: student.academic_status || student.academicStatus || 'warning',
          program: student.program || '',
          mentalHealthScore: student.mentalHealthScore || student.mental_health_score || 0,
          mental_health_score: student.mental_health_score || student.mentalHealthScore || 0,
          photo: student.photo || '',
          isActive: student.isActive || false,
          createdAt: student.createdAt,
          deletedAt: student.deletedAt,
          userId: student.userId || student.user_id,
          user_id: student.user_id || student.userId,
          userTableId: student.userTableId,
          userTableName: student.userTableName,
          userTableEmail: student.userTableEmail,
          userTablePhoto: student.userTablePhoto
        };
        
        return processedStudent;
      });      // Check if we have students with missing user data and attempt to enrich them
      const studentsWithMissingData = processedStudents.filter((student: DeletedStudent) => 
        student.name === 'Unknown Student' || 
        (student.name && student.name.startsWith('Student ')) || 
        !student.email || 
        !student.userId
      );

      if (studentsWithMissingData.length > 0) {
        console.log(`Found ${studentsWithMissingData.length} students with missing user data, attempting to enrich from users table...`);
        
        try {
          // Fetch deleted users to enrich missing data
          const usersResponse = await fetch(`${API_URL}/admin/users/deleted`);
          if (usersResponse.ok) {
            const userData = await usersResponse.json();
            const studentUsers = userData.filter((user: any) => user.role === 'student');
            
            // Create a map of user data by userId for quick lookup
            const userDataMap = new Map();
            studentUsers.forEach((user: any) => {
              userDataMap.set(user.userId || user.id, user);
            });
              // Enrich students with missing data
            const enrichedStudents = processedStudents.map((student: DeletedStudent) => {
              if (studentsWithMissingData.includes(student)) {
                // Try to find matching user data by studentId
                const userData = userDataMap.get(student.studentId);
                if (userData) {
                  return {
                    ...student,
                    name: userData.name || student.name,
                    email: userData.email || student.email,
                    username: userData.username || student.username,
                    photo: userData.photo || student.photo,
                    userId: userData.userId || userData.id || student.userId,
                    user_id: userData.userId || userData.id || student.user_id,
                    userTableId: userData.userId || userData.id,
                    userTableName: userData.name,
                    userTableEmail: userData.email,
                    userTablePhoto: userData.photo
                  };
                }
              }
              return student;
            });
            
            setDeletedStudents(enrichedStudents);
              // Show info message if data was enriched
            const enrichedCount = enrichedStudents.filter((student: DeletedStudent, index: number) => 
              student.name !== processedStudents[index].name || 
              student.email !== processedStudents[index].email
            ).length;
            
            if (enrichedCount > 0) {
              setError(`Successfully loaded ${enrichedStudents.length} deleted students (${enrichedCount} enriched with user data)`);
            } else {
              setError(null);
            }
          } else {
            setDeletedStudents(processedStudents);
            setError(null);
          }
        } catch (enrichErr) {
          console.error('Error enriching student data:', enrichErr);
          setDeletedStudents(processedStudents);
          setError(null);
        }
      } else {
        setDeletedStudents(processedStudents);
        setError(null);
      }
    } catch (err) {
      console.error('Network error or API unavailable:', err);
      
      // More specific error handling
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Tidak dapat terhubung ke server. Pastikan server backend berjalan di http://localhost:5000');
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui');
      }
      
      // Set empty array as fallback
      setDeletedStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (studentId: string, studentName: string) => {
    try {
      setActionLoading(studentId);
      
      console.log('Attempting to restore student:', studentId);
      
      const response = await fetch(`${API_URL}/admin/students/${studentId}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Restore error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData || 'Failed to restore student'}`);
      }
      
      const result = await response.json();
      console.log('Restore result:', result);
      
      // Remove from deleted students list
      setDeletedStudents(prev => prev.filter(student => student.studentId !== studentId));
      
      // Show success notification
      setNotificationModal({
        isOpen: true,
        title: 'Berhasil!',
        message: `✅ Siswa ${studentName} berhasil dipulihkan.`,
        type: 'success'
      });
      
      setRestoreModal({ isOpen: false, studentId: '', studentName: '' });    } catch (err) {
      console.error('Error restoring student:', err);
      
      let errorMessage = 'Terjadi kesalahan saat memulihkan siswa.';
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setNotificationModal({
        isOpen: true,
        title: 'Error!',
        message: `❌ Error: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleHardDelete = async (studentId: string, _studentName: string) => {
    try {
      setActionLoading(studentId);
      
      console.log('Attempting to hard delete student:', studentId);
      
      const response = await fetch(`${API_URL}/admin/students/${studentId}/hard-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Hard delete error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData || 'Failed to permanently delete student'}`);
      }
      
      const result = await response.json();
      console.log('Hard delete result:', result);
      
      // Remove from deleted students list
      setDeletedStudents(prev => prev.filter(student => student.studentId !== studentId));
      
      // Show success notification with warning
      setNotificationModal({
        isOpen: true,
        title: 'Data Dihapus Permanen!',
        message: `⚠️ ${result.message}\n${result.warning || ''}`,
        type: 'warning'
      });
      
      setHardDeleteModal({ isOpen: false, studentId: '', studentName: '' });
    } catch (err) {
      console.error('Error hard deleting student:', err);
      
      let errorMessage = 'Terjadi kesalahan saat menghapus siswa permanen.';
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setNotificationModal({
        isOpen: true,
        title: 'Error!',
        message: `❌ Error: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkHardDelete = async () => {
    if (selectedStudents.size === 0) return;
    
    try {
      setBulkActionLoading(true);
      const studentIds = Array.from(selectedStudents);
      
      console.log('Attempting bulk hard delete for students:', studentIds);
      
      const response = await fetch(`${API_URL}/admin/students/bulk-hard-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds }),
      });
      
      console.log('Bulk delete response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Bulk delete error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData || 'Failed to permanently delete students'}`);
      }
      
      const result = await response.json();
      console.log('Bulk delete result:', result);
      
      // Remove deleted students from list
      setDeletedStudents(prev => prev.filter(student => 
        !selectedStudents.has(getStudentData(student).studentId)
      ));
      
      // Clear selection
      setSelectedStudents(new Set());
      
      // Show success notification
      setNotificationModal({
        isOpen: true,
        title: 'Data Dihapus Permanen!',
        message: `⚠️ ${result.message}\n${result.warning || ''}`,
        type: 'warning'
      });
      
      setBulkHardDeleteModal({ isOpen: false, count: 0 });
    } catch (err) {
      console.error('Error bulk hard deleting students:', err);
      
      let errorMessage = 'Terjadi kesalahan saat menghapus siswa permanen.';
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setNotificationModal({
        isOpen: true,
        title: 'Error!',
        message: `❌ Error: ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setBulkActionLoading(false);
    }
  };
  // Selection handlers
  const handleSelectStudent = (studentId: string, isSelected: boolean) => {
    setSelectedStudents(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(studentId);
      } else {
        newSelected.delete(studentId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      // Select all students
      setSelectedStudents(new Set(deletedStudents.map(student => student.id)));
    } else {
      // Deselect all students
      setSelectedStudents(new Set());
    }
  };

  useEffect(() => {
    // Log the selected students whenever it changes
    console.log('Selected students:', Array.from(selectedStudents));
  }, [selectedStudents]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            🗑️ Manajemen Siswa yang Dihapus
          </h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data siswa yang dihapus...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              🗑️ Manajemen Siswa yang Dihapus
            </h1>
          </div>
          <p className="text-gray-600">
            Kelola siswa yang telah dihapus (soft delete)
          </p>
        </div>
        
        <button
          onClick={fetchDeletedStudents}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >        🔄 Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <span className="text-red-400 mr-2">⚠️</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-medium">Koneksi Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <div className="mt-2">
                <button
                  onClick={fetchDeletedStudents}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Coba lagi
                </button>
                <span className="mx-2 text-red-400">|</span>
                <a
                  href="http://localhost:5000/api/test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Test koneksi server
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informational Section */}
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
            </h3>            <div className="mt-2 text-sm text-yellow-700">
              <p>• <strong>Pulihkan</strong>: Mengaktifkan kembali siswa yang dihapus</p>
              <p>• <strong>Hapus Permanen</strong>: Menghapus data siswa permanen dari database (akun user tetap dipertahankan)</p>
              <p>• Siswa yang dihapus tidak dapat login tetapi data tetap tersimpan untuk audit</p>
            </div>
          </div>
        </div>
      </div>      {/* Students List */}
      {deletedStudents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada siswa yang dihapus
          </h3>
          <p className="text-gray-600">
            Semua siswa dalam keadaan aktif atau telah dipulihkan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bulk Actions */}
          {selectedStudents.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedStudents.size} siswa dipilih
                  </span>
                  <button
                    onClick={() => setSelectedStudents(new Set())}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Batalkan pilihan
                  </button>
                </div>
                <button
                  onClick={() => setBulkHardDeleteModal({
                    isOpen: true,
                    count: selectedStudents.size
                  })}
                  disabled={bulkActionLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                >
                  {bulkActionLoading ? '⏳' : '🗑️'} Hapus Permanen ({selectedStudents.size})
                </button>
              </div>
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.size === deletedStudents.length && deletedStudents.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dihapus
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedStudents.map((student) => {
                    // Use helper function to safely get student data
                    const studentData = getStudentData(student);
                    const isSelected = selectedStudents.has(studentData.studentId);
                    
                    return (
                      <tr key={studentData.studentId} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectStudent(studentData.studentId, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {studentData.photo ? (
                                <img 
                                  src={studentData.photo} 
                                  alt={studentData.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-500">👤</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {studentData.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {studentData.studentId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{studentData.email}</div>
                          {studentData.username && (
                            <div className="text-sm text-gray-500">{studentData.username}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentData.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            studentData.academicStatus === 'good' ? 'bg-green-100 text-green-800' :
                            studentData.academicStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {studentData.academicStatus === 'good' ? 'Baik' :
                             studentData.academicStatus === 'warning' ? 'Perhatian' : 'Kritis'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentData.program}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentData.deletedAt ? 
                            new Date(studentData.deletedAt).toLocaleDateString('id-ID') : 
                            '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setRestoreModal({
                                isOpen: true,
                                studentId: studentData.studentId,
                                studentName: studentData.name
                              })}
                              disabled={actionLoading === studentData.studentId}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {actionLoading === studentData.studentId ? '⏳' : '↩️'} Pulihkan
                            </button>
                            <button
                              onClick={() => setHardDeleteModal({
                                isOpen: true,
                                studentId: studentData.studentId,
                                studentName: studentData.name
                              })}
                              disabled={actionLoading === studentData.studentId}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {actionLoading === studentData.studentId ? '⏳' : '🗑️'} Hapus Permanen
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {deletedStudents.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Total {deletedStudents.length} siswa dihapus
        </div>
      )}

      {/* Restore Confirmation Modal */}
      <ConfirmationModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, studentId: '', studentName: '' })}
        onConfirm={() => handleRestore(restoreModal.studentId, restoreModal.studentName)}
        title="Konfirmasi Pemulihan Siswa"
        message={`Apakah Anda yakin ingin memulihkan siswa "${restoreModal.studentName}"? Siswa akan menjadi aktif kembali.`}
        confirmText="Pulihkan"
        isDestructive={false}
      />      {/* Hard Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={hardDeleteModal.isOpen}
        onClose={() => setHardDeleteModal({ isOpen: false, studentId: '', studentName: '' })}
        onConfirm={() => handleHardDelete(hardDeleteModal.studentId, hardDeleteModal.studentName)}
        title="Konfirmasi Penghapusan Permanen"
        message={`PERINGATAN: Anda akan menghapus siswa "${hardDeleteModal.studentName}" secara PERMANEN dari database. Semua data akademik siswa (sesi konseling, penilaian kesehatan mental, catatan perilaku) akan ikut terhapus. Namun, akun user akan tetap dipertahankan. Tindakan ini TIDAK DAPAT DIBATALKAN.`}
        confirmText="Hapus Permanen"
        isDestructive={true}
        requiresTextConfirmation={true}
        confirmationText="HAPUS PERMANEN"
      />      {/* Bulk Hard Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={bulkHardDeleteModal.isOpen}
        onClose={() => setBulkHardDeleteModal({ isOpen: false, count: 0 })}
        onConfirm={handleBulkHardDelete}
        title="Konfirmasi Penghapusan Permanen Massal"
        message={`PERINGATAN: Anda akan menghapus ${bulkHardDeleteModal.count} siswa secara PERMANEN dari database. Semua data akademik siswa (sesi konseling, penilaian kesehatan mental, catatan perilaku) akan ikut terhapus. Namun, akun user akan tetap dipertahankan. Tindakan ini TIDAK DAPAT DIBATALKAN.`}
        confirmText="Hapus Permanen Semua"
        isDestructive={true}
        requiresTextConfirmation={true}
        confirmationText="HAPUS PERMANEN SEMUA"
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