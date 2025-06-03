import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Student, StudentFormData, User, Class } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserById } from '../services/userService';
import { getClasses } from '../services/classService';
import { ImageUploader } from './ImageUploader';

interface AddStudentFormProps {
  student?: Student; // Optional student for editing
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id'> | Student) => void;
}

export default function AddStudentForm({ student, onClose, onSubmit }: AddStudentFormProps) {
  const { t } = useLanguage();
  const isEditing = !!student;
  
  const [formData, setFormData] = useState<StudentFormData & { 
    avatarType?: 'base64' | 'file' | 'url';
    avatarFilename?: string;
    classId?: string; // Add class_id field
  }>({
    name: student?.name || '',
    email: student?.email || '',
    tingkat: student?.tingkat || student?.grade || '',
    kelas: student?.kelas || student?.class || '',
    avatar: student?.avatar || student?.photo || '',
    avatarType: 'url',
    academicStatus: (student?.academicStatus as 'good' | 'warning' | 'critical') || 'good',
    studentId: student?.studentId || student?.id || '',
    classId: student?.classId || '', // Initialize class_id
  });
  const [searchingUser, setSearchingUser] = useState(false);
  const [userFound, setUserFound] = useState<boolean | null>(null);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);

  // States for dynamic classes data
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [uniqueTingkat, setUniqueTingkat] = useState<string[]>([]);
  const [availableKelas, setAvailableKelas] = useState<string[]>([]);

  // Function to fetch classes data with retry mechanism
  const fetchClassesData = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setLoadingClasses(true);
      setClassesError(null);
      
      // Fetch all classes without pagination limits
      const response = await getClasses({}, 1, 1000);
      
      if (response && response.data) {
        setClasses(response.data);
        
        // Extract unique tingkat values
        const tingkatSet = new Set<string>();
        response.data.forEach(classItem => {
          // Extract grade level from gradeLevel field (could be 'X', 'XI', 'XII', '10', '11', '12')
          let grade = classItem.gradeLevel;
          
          // Convert numeric grades to Roman numerals for consistency
          if (grade === '10') grade = 'X';
          else if (grade === '11') grade = 'XI';
          else if (grade === '12') grade = 'XII';
          
          // Handle cases where gradeLevel might include class name (e.g., "XI IPA-1")
          const gradeOnly = grade.split(' ')[0];
          tingkatSet.add(gradeOnly);
        });
        
        const sortedTingkat = Array.from(tingkatSet).sort((a, b) => {
          const order = { 'X': 1, 'XI': 2, 'XII': 3 };
          return (order[a as keyof typeof order] || 999) - (order[b as keyof typeof order] || 999);
        });
        
        setUniqueTingkat(sortedTingkat);
        
        console.log('✅ Classes data loaded successfully:', response.data.length, 'classes');
        console.log('📊 Available tingkat:', sortedTingkat);
      }
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => fetchClassesData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      setClassesError('Gagal memuat data kelas dari database');
      
      // Fallback to hardcoded values if API fails after all retries
      console.log('🛡️ Using fallback data');
      setUniqueTingkat(['X', 'XI', 'XII']);
      setAvailableKelas(['IPA-1', 'IPA-2', 'IPA-3', 'IPS-1', 'IPS-2']);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Function to update available kelas based on selected tingkat
  const updateAvailableKelas = (selectedTingkat: string) => {
    if (!selectedTingkat) {
      setAvailableKelas([]);
      return;
    }

    const kelasForTingkat = classes
      .filter(classItem => {
        let grade = classItem.gradeLevel;
        
        // Convert numeric grades to Roman numerals if needed
        if (grade === '10') grade = 'X';
        else if (grade === '11') grade = 'XI';
        else if (grade === '12') grade = 'XII';
        
        const gradeOnly = grade.split(' ')[0];
        return gradeOnly === selectedTingkat;
      })
      .map(classItem => classItem.name)
      .sort();

    setAvailableKelas(kelasForTingkat);
  };

  // Function to get class_id from tingkat and kelas selection
  const getClassId = (tingkat: string, kelas: string): string => {
    if (!tingkat || !kelas) return '';
    
    const matchingClass = classes.find(classItem => {
      let grade = classItem.gradeLevel;
      
      // Convert numeric grades to Roman numerals if needed
      if (grade === '10') grade = 'X';
      else if (grade === '11') grade = 'XI';
      else if (grade === '12') grade = 'XII';
      
      const gradeOnly = grade.split(' ')[0];
      return gradeOnly === tingkat && classItem.name === kelas;
    });
    
    return matchingClass?.classId || '';
  };

  // Effect to fetch classes data on component mount
  useEffect(() => {
    fetchClassesData();
  }, []);

  // Effect to update available kelas when tingkat changes
  useEffect(() => {
    updateAvailableKelas(formData.tingkat);
    
    // Reset kelas selection if the current selection is not available for the new tingkat
    if (formData.kelas && formData.tingkat) {
      const isKelasAvailable = classes.some(classItem => {
        let grade = classItem.gradeLevel;
        if (grade === '10') grade = 'X';
        else if (grade === '11') grade = 'XI';
        else if (grade === '12') grade = 'XII';
        
        const gradeOnly = grade.split(' ')[0];
        return gradeOnly === formData.tingkat && classItem.name === formData.kelas;
      });
      
      if (!isKelasAvailable) {
        setFormData(prev => ({ 
          ...prev, 
          kelas: '',
          classId: '' // Also clear classId when kelas becomes invalid
        }));
      } else if (formData.kelas && !formData.classId) {
        // If kelas is valid but classId is not set, set it
        const classId = getClassId(formData.tingkat, formData.kelas);
        if (classId) {
          setFormData(prev => ({
            ...prev,
            classId
          }));
        }
      }
    }
  }, [formData.tingkat, classes, formData.kelas, formData.classId]);

  // Function to fetch and populate user data from user management
  const fetchUserData = async (userId: string) => {
    if (!userId.trim()) {
      setUserFound(null);
      setUserSearchError(null);
      return;
    }

    setSearchingUser(true);
    setUserSearchError(null);
    setUserFound(null);

    try {
      const userData: User = await getUserById(userId);
      
      // Check if user exists and is a student
      if (userData) {
        if (userData.role !== 'student') {
          setUserSearchError(`User ditemukan tetapi bukan student (Role: ${userData.role})`);
          setUserFound(false);
          return;
        }

        // Auto-populate form with user data
        setFormData(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          avatar: userData.photo || '', // Use empty string to show User icon when no photo
          // Keep existing tingkat and kelas if not available in user data
          tingkat: (userData as any).tingkat || prev.tingkat,
          kelas: (userData as any).kelas || prev.kelas,
        }));

        setUserFound(true);
        setUserSearchError(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserSearchError('User tidak ditemukan dalam sistem user management');
      setUserFound(false);
      
      // Clear auto-populated data if user not found
      setFormData(prev => ({
        ...prev,
        name: '',
        email: '',
        avatar: '', // Use empty string to show User icon
      }));
    } finally {
      setSearchingUser(false);
    }
  };

  // Debounced user search when studentId changes (only for new students)
  useEffect(() => {
    if (isEditing) return; // Skip auto-search when editing
    
    const timeoutId = setTimeout(() => {
      if (formData.studentId) {
        fetchUserData(formData.studentId);
      }
    }, 500); // 500ms delay to avoid too many API calls

    return () => clearTimeout(timeoutId);
  }, [formData.studentId, isEditing]);

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, studentId: value });
    
    // Reset user search state when typing
    if (value !== formData.studentId) {
      setUserFound(null);
      setUserSearchError(null);
    }
  };

  // State for user already exists modal
  const [showUserExistsModal, setShowUserExistsModal] = useState(false);
  const [userExistsMessage, setUserExistsMessage] = useState('');  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that studentId is provided (required for using existing user ID)
    if (!formData.studentId.trim()) {
      alert('Nomor Induk Siswa (NIS) wajib diisi. Masukkan User ID dari sistem user management.');
      return;
    }
    
    // Ensure classId is set based on tingkat and kelas selection
    let finalClassId = formData.classId;
    if (!finalClassId && formData.tingkat && formData.kelas) {
      finalClassId = getClassId(formData.tingkat, formData.kelas);
      console.log('🔍 DEBUG: getClassId result:', finalClassId);
      console.log('🔍 DEBUG: tingkat:', formData.tingkat, 'kelas:', formData.kelas);
      console.log('🔍 DEBUG: available classes:', classes.map(c => ({id: c.classId, name: c.name, grade: c.gradeLevel})));
      
      if (!finalClassId) {
        console.error('❌ No matching class_id found for the selected tingkat and kelas');
        alert('Tidak dapat menemukan class ID untuk tingkat dan kelas yang dipilih. Silakan pilih ulang.');
        return;
      }
      setFormData(prev => ({...prev, classId: finalClassId}));
    }
      // Prepare data for normalized schema
    const studentData = {
      // Core student data
      studentId: formData.studentId, // NIS/Student ID
      name: formData.name,
      email: formData.email,
      tingkat: formData.tingkat,
      kelas: formData.kelas,
      classId: finalClassId, // Use the finalized classId
      academicStatus: formData.academicStatus,
      avatar: formData.avatar || '',
      
      // Legacy compatibility fields
      grade: formData.tingkat,
      class: formData.kelas,
      photo: formData.avatar || '',
      
      // Image metadata for hybrid storage
      avatar_type: formData.avatarType || 'url',
      avatar_filename: formData.avatarFilename
    };
    
    console.log('🚀 DEBUG: Submitting student data:', studentData);
    
    try {
      await onSubmit(studentData);
      onClose();
    } catch (error: any) {
      console.error('❌ DEBUG: Error submitting student:', error);
      // Check if error is about user already exists
      if (error?.response?.data?.showModal || error?.response?.data?.error === 'USER_ALREADY_EXISTS') {
        setUserExistsMessage(error.response.data.message || 'User dengan email ini sudah terdaftar sebagai siswa');
        setShowUserExistsModal(true);
      } else {
        // For other errors, let the parent component handle them
        throw error;
      }
    }
  };

  // Handle image upload with hybrid approach
  const handleImageChange = (imageData: {
    type: 'base64' | 'file' | 'url';
    url: string;
    filename?: string;
  }) => {
    setFormData({
      ...formData,
      avatar: imageData.url,
      avatarType: imageData.type,
      avatarFilename: imageData.filename
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isEditing ? t('editStudent.title', 'Edit Student') : t('addStudent.title', 'Add Student')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 scrollbar-light">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Information notice about auto-fill functionality */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Search className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Auto-fill dari User Management
                  </h4>
                  <p className="text-sm text-blue-700">
                    Masukkan Nomor Induk Siswa (NIS) untuk mencari dan mengisi data otomatis dari sistem user management. 
                    Data seperti nama dan email akan terisi secara otomatis jika user ditemukan.
                  </p>
                </div>
              </div>
            </div>

            {/* Responsive Grid Layout - 1 column on mobile, 2 columns on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Informasi Dasar
                </h3>
                  <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                    {t('addStudent.studentId', 'Nomor Induk Siswa (NIS)')}
                    <span className="text-xs text-gray-500 font-normal block mt-1">
                      Gunakan User ID dari sistem user management
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleStudentIdChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 pr-10"
                      placeholder="Masukkan User ID (contoh: U123456)"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {searchingUser && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                      )}
                      {!searchingUser && userFound === true && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {!searchingUser && userFound === false && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {userSearchError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {userSearchError}
                    </p>
                  )}
                  {userFound === true && (
                    <p className="mt-1 text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Data user berhasil ditemukan dan diisi otomatis
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('addStudent.fullName')}
                    {userFound === true && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (Diisi otomatis dari user management)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                      userFound === true ? 'bg-green-50 border-green-300' : ''
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('addStudent.email')}
                    {userFound === true && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (Diisi otomatis dari user management)
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                      userFound === true ? 'bg-green-50 border-green-300' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Right Column - Academic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Informasi Akademik
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tingkat" className="block text-sm font-medium text-gray-700">
                      {t('students.tingkat')}
                      {loadingClasses && (
                        <span className="ml-2 text-xs text-gray-500">
                          <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                          Loading...
                        </span>
                      )}
                    </label>
                    <select
                      id="tingkat"
                      required
                      value={formData.tingkat}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tingkat: e.target.value,
                        kelas: '',  // Clear kelas when tingkat changes
                        classId: '' // Clear classId when tingkat changes
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                      disabled={loadingClasses}
                    >
                      <option value="">{t('addStudent.selectTingkat')}</option>
                      {uniqueTingkat.map((tingkat) => (
                        <option key={tingkat} value={tingkat}>
                          {tingkat}
                        </option>
                      ))}
                    </select>
                    {classesError && (
                      <p className="mt-1 text-xs text-amber-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Using fallback options (API unavailable)
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="kelas" className="block text-sm font-medium text-gray-700">
                      {t('students.kelas')}
                      {!formData.tingkat && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Pilih tingkat terlebih dahulu)
                        </span>
                      )}
                    </label>
                    <select
                      id="kelas"
                      required
                      value={formData.kelas}
                      onChange={(e) => {
                        const selectedKelas = e.target.value;
                        const classId = getClassId(formData.tingkat, selectedKelas);
                        setFormData({ 
                          ...formData, 
                          kelas: selectedKelas,
                          classId
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                      disabled={loadingClasses || !formData.tingkat}
                    >
                      <option value="">{t('addStudent.selectKelas')}</option>
                      {availableKelas.map((kelas) => (
                        <option key={kelas} value={kelas}>
                          {kelas}
                        </option>
                      ))}
                    </select>
                    {formData.tingkat && availableKelas.length === 0 && !loadingClasses && (
                      <p className="mt-1 text-xs text-amber-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Tidak ada kelas tersedia untuk tingkat {formData.tingkat}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    {t('addStudent.academicStatus')}
                  </label>
                  <select
                    id="status"
                    required
                    value={formData.academicStatus}
                    onChange={(e) => setFormData({
                      ...formData,
                      academicStatus: e.target.value as 'good' | 'warning' | 'critical'
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                  >
                    <option value="good">{t('status.good')}</option>
                    <option value="warning">{t('status.warning')}</option>
                    <option value="critical">{t('status.critical')}</option>
                  </select>
                </div>

                <ImageUploader
                  currentImage={formData.avatar || ''}
                  onImageChange={handleImageChange}
                  label="Foto Siswa"
                  className="w-full"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('addStudent.cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {t('addStudent.submit')}
            </button>
          </div>
        </div>
      </div>

      {/* User Already Exists Modal */}
      {showUserExistsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">User Sudah Ada</h3>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">{userExistsMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowUserExistsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}