import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Search, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DeletedClass {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: string;
  academicYear: string;
  teacherName?: string;
  studentCount: number;
  isActive: boolean;
  createdAt?: string;
  deletedAt?: string;
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
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-blue-600" />
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
          >
            {confirmText}
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
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
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

export default function DeletedClassesManagement() {
  const navigate = useNavigate();
  const [deletedClasses, setDeletedClasses] = useState<DeletedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<DeletedClass | null>(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'restore' as 'restore' | 'permanent-delete',
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    requiresTextConfirmation: false,
    confirmationText: ''
  });
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning'
  });

  useEffect(() => {
    fetchDeletedClasses();
  }, []);

  const fetchDeletedClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching deleted classes...');
      const response = await fetch(`${API_URL}/admin/classes/deleted`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Successfully fetched deleted classes:', data.length);
      
      setDeletedClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching deleted classes:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data kelas yang dihapus');
      setDeletedClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (classItem: DeletedClass) => {
    try {
      console.log('🔄 Restoring class:', classItem.id);
      const response = await fetch(`${API_URL}/admin/classes/${classItem.id}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Class restored successfully:', result);

      // Remove from deleted classes list
      setDeletedClasses(prev => prev.filter(c => c.id !== classItem.id));

      // Show success notification
      setNotificationModal({
        isOpen: true,
        title: 'Kelas Dipulihkan',
        message: `Kelas "${classItem.name}" berhasil dipulihkan.`,
        type: 'success'
      });
    } catch (err) {
      console.error('❌ Error restoring class:', err);
      setNotificationModal({
        isOpen: true,
        title: 'Gagal Memulihkan',
        message: err instanceof Error ? err.message : 'Gagal memulihkan kelas',
        type: 'error'
      });
    }
  };

  const handlePermanentDelete = async (classItem: DeletedClass) => {
    try {
      console.log('🗑️ Permanently deleting class:', classItem.id);
      const response = await fetch(`${API_URL}/admin/classes/${classItem.id}/hard-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Class permanently deleted:', result);

      // Remove from deleted classes list
      setDeletedClasses(prev => prev.filter(c => c.id !== classItem.id));

      // Show success notification
      setNotificationModal({
        isOpen: true,
        title: 'Kelas Dihapus Permanen',
        message: `Kelas "${classItem.name}" telah dihapus secara permanen dari database.`,
        type: 'warning'
      });
    } catch (err) {
      console.error('❌ Error permanently deleting class:', err);
      setNotificationModal({
        isOpen: true,
        title: 'Gagal Menghapus',
        message: err instanceof Error ? err.message : 'Gagal menghapus kelas secara permanen',
        type: 'error'
      });
    }
  };

  const openRestoreConfirmation = (classItem: DeletedClass) => {
    setSelectedClass(classItem);
    setConfirmationModal({
      isOpen: true,
      type: 'restore',
      title: 'Pulihkan Kelas',
      message: `Apakah Anda yakin ingin memulihkan kelas "${classItem.name}"?\n\nKelas akan dikembalikan ke daftar kelas aktif.`,
      confirmText: 'Pulihkan',
      isDestructive: false,
      requiresTextConfirmation: false,
      confirmationText: ''
    });
  };

  const openPermanentDeleteConfirmation = (classItem: DeletedClass) => {
    setSelectedClass(classItem);
    setConfirmationModal({
      isOpen: true,
      type: 'permanent-delete',
      title: 'Hapus Permanen',
      message: `PERINGATAN: Aksi ini akan menghapus kelas "${classItem.name}" secara PERMANEN dari database.\n\nData kelas tidak dapat dipulihkan setelah dihapus permanen.\n\nKetik nama kelas untuk konfirmasi:`,
      confirmText: 'Hapus Permanen',
      isDestructive: true,
      requiresTextConfirmation: true,
      confirmationText: classItem.name
    });
  };

  const handleConfirmAction = () => {
    if (!selectedClass) return;

    if (confirmationModal.type === 'restore') {
      handleRestore(selectedClass);
    } else if (confirmationModal.type === 'permanent-delete') {
      handlePermanentDelete(selectedClass);
    }

    setSelectedClass(null);
  };

  const filteredClasses = deletedClasses.filter(classItem => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      classItem.name.toLowerCase().includes(searchLower) ||
      classItem.gradeLevel.toLowerCase().includes(searchLower) ||
      classItem.academicYear.toLowerCase().includes(searchLower) ||
      (classItem.teacherName && classItem.teacherName.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">            <button
              onClick={() => navigate('/app/classes')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelas yang Dihapus</h1>
              <p className="text-gray-600 mt-1">Kelola kelas yang telah dihapus - pulihkan atau hapus permanen</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari kelas yang dihapus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={fetchDeletedClasses}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data kelas yang dihapus...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Classes List */}
        {!loading && !error && (
          <>
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Trash2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Tidak Ada Hasil' : 'Tidak Ada Kelas yang Dihapus'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Tidak ada kelas yang dihapus sesuai dengan pencarian Anda.'
                    : 'Semua kelas masih aktif. Kelas yang dihapus akan muncul di sini.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kelas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tingkat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tahun Ajaran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Guru
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah Siswa
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
                      {filteredClasses.map((classItem) => (
                        <tr key={classItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                              <div className="text-sm text-gray-500">{classItem.schoolId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {classItem.gradeLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {classItem.academicYear}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {classItem.teacherName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {classItem.studentCount} siswa
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(classItem.deletedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openRestoreConfirmation(classItem)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Pulihkan
                              </button>
                              <button
                                onClick={() => openPermanentDeleteConfirmation(classItem)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Hapus Permanen
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    Menampilkan {filteredClasses.length} dari {deletedClasses.length} kelas yang dihapus
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={handleConfirmAction}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          isDestructive={confirmationModal.isDestructive}
          requiresTextConfirmation={confirmationModal.requiresTextConfirmation}
          confirmationText={confirmationModal.confirmationText}
        />

        {/* Notification Modal */}
        <NotificationModal
          isOpen={notificationModal.isOpen}
          onClose={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}
          title={notificationModal.title}
          message={notificationModal.message}
          type={notificationModal.type}
        />
      </div>
    </div>
  );
}
