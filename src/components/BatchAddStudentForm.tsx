import { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Search,
  AlertCircle,
  Clock,
  User,
  School
} from 'lucide-react';
import { getNonStudentUsers } from '../services/userService';
import { addStudentsBatch } from '../services/studentService';
import { Class, User as UserType } from '../types';
import { cn } from '../utils/cn';

interface BatchAddStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classData: Class;
}

interface PendingStudent extends UserType {
  academicStatus: 'good' | 'warning' | 'critical';
}

// Status configuration
const statusConfig = {
  good: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle2,
    label: 'Baik'
  },
  warning: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Clock,
    label: 'Perhatian'
  },
  critical: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    label: 'Kritis'
  }
};

export default function BatchAddStudentForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  classData 
}: BatchAddStudentFormProps) {  const [currentStep, setCurrentStep] = useState<'select' | 'review'>('select');
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load non-student users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadNonStudentUsers();
    }
  }, [isOpen]);

  const loadNonStudentUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNonStudentUsers();
      setUsers(response || []);
    } catch (err) {
      console.error('Error loading non-student users:', err);
      setError('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user selection
  const handleUserSelect = (userId: string, selected: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (selected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      const validUserIds = filteredUsers.map(user => user.id).filter((id): id is string => Boolean(id));
      setSelectedUsers(new Set(validUserIds));
    }
  };

  // Handle status change for pending student
  const handleStatusChange = (userId: string, status: 'good' | 'warning' | 'critical') => {
    setPendingStudents(prev =>
      prev.map(student =>
        student.id === userId ? { ...student, academicStatus: status } : student
      )
    );
  };
  // Move to review step
  const moveToReview = () => {
    const selectedUserData = users.filter(user => user.id && selectedUsers.has(user.id));
    const pending: PendingStudent[] = selectedUserData.map(user => ({
      ...user,
      academicStatus: 'good' as const // Default status
    }));
    setPendingStudents(pending);
    setCurrentStep('review');
  };

  // Save students to database
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);      const studentsToAdd = pendingStudents.map(student => ({
        userId: student.id!, // This will be used as the student ID to maintain consistency
        name: student.name,
        email: student.email,
        tingkat: classData.gradeLevel,
        kelas: classData.name,
        academicStatus: student.academicStatus,
        classId: classData.id
      }));

      await addStudentsBatch(studentsToAdd);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error saving students:', err);
      setError('Gagal menyimpan data siswa');
    } finally {
      setSaving(false);
    }
  };

  // Reset and close modal
  const handleClose = () => {
    setCurrentStep('select');
    setSelectedUsers(new Set());
    setPendingStudents([]);
    setSearchTerm('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tambah Siswa Batch
              </h2>
              <p className="text-sm text-gray-500">
                Kelas: {classData.name} • Tingkat: {classData.gradeLevel}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium",
              currentStep === 'select' 
                ? "bg-indigo-100 text-indigo-700" 
                : "bg-green-100 text-green-700"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                currentStep === 'select' ? "bg-indigo-600" : "bg-green-600"
              )}></div>
              Pilih Pengguna
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium",
              currentStep === 'review' 
                ? "bg-indigo-100 text-indigo-700" 
                : "bg-gray-100 text-gray-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                currentStep === 'review' ? "bg-indigo-600" : "bg-gray-400"
              )}></div>
              Review & Simpan
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {currentStep === 'select' && (
            <div className="space-y-4">
              {/* Search and select all */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari pengguna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {selectedUsers.size === filteredUsers.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
              </div>

              {/* Users table */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Memuat data...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Tidak ada pengguna yang sesuai' : 'Semua pengguna sudah menjadi siswa'}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pengguna
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>                    <tbody className="bg-white divide-y divide-gray-200">                      {filteredUsers.map((user) => {
                        if (!user.id) return null;
                        const userId = user.id; // TypeScript now knows this is string
                        
                        return (
                        <tr key={userId} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(userId)}
                              onChange={(e) => handleUserSelect(userId, e.target.checked)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                <User className="h-4 w-4 text-indigo-600" />
                              </div>
                              <span className="font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                            {user.role}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedUsers.size > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-indigo-700 font-medium">
                    {selectedUsers.size} pengguna dipilih
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-4">              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Detail Penambahan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Kelas:</span>
                    <span className="ml-2 text-blue-800">{classData.name}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Tingkat:</span>
                    <span className="ml-2 text-blue-800">{classData.gradeLevel}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Jumlah Siswa:</span>
                    <span className="ml-2 text-blue-800">{pendingStudents.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Tahun Akademik:</span>
                    <span className="ml-2 text-blue-800">{classData.academicYear}</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded border-l-4 border-blue-400">
                  <p className="text-xs text-blue-800">
                    <strong>Info:</strong> User ID dari sistem user management akan digunakan sebagai Student ID (NIS) untuk menjaga konsistensi data.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Siswa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID → NIS
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Akademik
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">                    {pendingStudents.map((student) => {
                      if (!student.id) return null;
                      const studentId = student.id; // TypeScript now knows this is string
                      
                      return (                      <tr key={studentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {studentId}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={student.academicStatus}
                            onChange={(e) => handleStatusChange(studentId, e.target.value as any)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <option key={key} value={key}>
                                {config.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {currentStep === 'review' && (
              <button
                onClick={() => setCurrentStep('select')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>

            {currentStep === 'select' ? (
              <button
                onClick={moveToReview}
                disabled={selectedUsers.size === 0}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Lanjut
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <School className="h-4 w-4 mr-2" />
                    Simpan Siswa
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}