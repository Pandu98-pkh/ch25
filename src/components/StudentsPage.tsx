import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, FilterParams } from '../types';
import StudentCard from './StudentCard';
import AddStudentForm from './AddStudentForm';
import { Search, RefreshCcw, AlertCircle, Filter, UserPlus, CheckCircle2, Clock, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getStudents, createStudent } from '../services/studentService';
import axios, { AxiosError } from 'axios';
import { createAbortController } from '../services/api';
import { cn } from '../utils/cn';

interface ApiErrorResponse {
  detail?: string;
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'good' | 'warning' | 'critical'>('all');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const { t } = useLanguage();
  const navigate = useNavigate();

  const loadStudents = useCallback(async () => {
    const { clearTimeout } = createAbortController(15000);
    
    try {
      setLoading(true);
      setError(null);
      
      const filters: FilterParams = {};
      if (searchTerm) filters.searchQuery = searchTerm;
      if (filterStatus !== 'all') filters.academicStatus = filterStatus;
      
      const response = await getStudents(filters, currentPage);
      clearTimeout();
      
      if (response && response.data) {
        setStudents(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(t('errors.invalidData') || 'Data tidak valid');
        setStudents([]);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.code === 'ERR_CANCELED') {
          setError(t('errors.timeout') || 'Waktu permintaan habis');
        } else {
          setError(axiosError.response?.data?.detail || 
                  (axiosError.code === 'ECONNABORTED' ? 
                    (t('errors.timeout') || 'Waktu permintaan habis') : 
                    (t('errors.loadingStudents') || 'Gagal memuat data siswa')));
        }
      } else {
        setError(t('errors.loadingStudents') || 'Gagal memuat data siswa');
      }
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, t, searchTerm, filterStatus]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = async (newStudent: Omit<Student, 'id'>) => {
    try {
      setError(null);
      const createdStudent = await createStudent(newStudent);
      setStudents(prev => [...prev, createdStudent]);
      setShowAddForm(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.detail || t('errors.creatingStudent') || 'Gagal membuat data siswa');
    }
  };

  const handleStudentClick = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      loadStudents();
    } else {
      setError(t('errors.maxRetriesReached') || 'Batas percobaan telah tercapai');
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.academicStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (status: 'all' | 'good' | 'warning' | 'critical') => {
    setFilterStatus(currentStatus => currentStatus === status ? 'all' : status);
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch(status) {
      case 'good': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'warning': return <Clock className="h-4 w-4 mr-1" />;
      case 'critical': return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
      {/* Page Header with Animation */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg mr-4">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {t('students.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('students.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('students.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex gap-2">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                {(['good', 'warning', 'critical'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => toggleFilter(status)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all duration-200',
                      filterStatus === status
                        ? status === 'good' 
                          ? 'bg-green-600 text-white shadow-sm transform scale-105'
                          : status === 'warning'
                            ? 'bg-yellow-600 text-white shadow-sm transform scale-105'
                            : 'bg-red-600 text-white shadow-sm transform scale-105'
                        : 'bg-transparent text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {getStatusIcon(status)}
                    {t(`status.${status}`)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 transform hover:scale-105"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {t('students.add')}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message with Enhanced Design */}
      {error && (
        <div className="mb-6 bg-red-50 rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin-slow" />
                {t('actions.retry') || 'Coba lagi'}
              </button>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-red-300"></div>
        </div>
      )}

      {/* Loading Skeleton with Better Animation */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 overflow-hidden">
              <div className="animate-pulse">
                <div className="h-1.5 bg-indigo-200 w-full absolute top-0 left-0"></div>
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-3 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Empty State with Better Design */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                <Filter className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">
                {searchTerm || filterStatus !== 'all'
                  ? t('students.noResults') || 'Tidak ada hasil yang cocok'
                  : t('students.noStudents') || 'Belum ada data siswa'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  {t('students.add') || 'Tambah Siswa'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={handleStudentClick}
                />
              ))}
            </div>
          )}

          {/* Pagination with Enhanced Design */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex rounded-lg shadow-sm bg-white border border-gray-200 overflow-hidden divide-x divide-gray-200">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                >
                  {t('pagination.previous') || 'Sebelumnya'}
                </button>
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-200"
                >
                  {t('pagination.next') || 'Berikutnya'}
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Only keep the modal form as is */}
      {showAddForm && (
        <AddStudentForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddStudent}
        />
      )}
    </div>
  );
}