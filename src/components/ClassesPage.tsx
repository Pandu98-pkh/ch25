import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Class, FilterParams } from '../types';
import ClassCard from '../components/ClassCard';
import AddClassForm from '../components/AddClassForm';
import { Search, Plus, RefreshCcw, AlertCircle, Filter, BookOpen, GraduationCap, School } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getClasses, createClass } from '../services/classService';
import axios, { AxiosError } from 'axios';
import { createAbortController } from '../services/api';
import { cn } from '../utils/cn';

interface ApiErrorResponse {
  detail?: string;
}

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterGradeLevel, setFilterGradeLevel] = useState<'all' | 'X' | 'XI' | 'XII'>('all');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Function to load classes data
  const loadClasses = useCallback(async () => {
    const { clearTimeout } = createAbortController(15000);
    
    try {
      setLoading(true);
      setError(null);
      
      const filters: FilterParams = {};
      if (searchTerm) filters.searchQuery = searchTerm;
      if (filterGradeLevel !== 'all') filters.grade = filterGradeLevel;
      
      const response = await getClasses(filters, currentPage);
      clearTimeout();
      
      if (response && response.data) {
        setClasses(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(t('errors.invalidData') || 'Data tidak valid');
        setClasses([]);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.code === 'ERR_CANCELED') {
          setError(t('errors.timeout') || 'Permintaan timeout');
        } else {
          setError(axiosError.response?.data?.detail || t('errors.loadingClasses') || 'Gagal memuat data kelas');
        }
      } else {
        setError(t('errors.loadingClasses') || 'Gagal memuat data kelas');
      }
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, t, searchTerm, filterGradeLevel]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleAddClass = async (newClass: Omit<Class, 'id'>) => {
    try {
      setError(null);
      const createdClass = await createClass(newClass);
      setClasses(prev => [...prev, createdClass]);
      setShowAddForm(false);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.detail || t('errors.creatingClass') || 'Gagal membuat data kelas');
    }
  };

  const handleClassClick = (classItem: Class) => {
    navigate(`/classes/${classItem.id}/students`);
  };

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      loadClasses();
    } else {
      setError(t('errors.maxRetriesReached') || 'Batas percobaan telah tercapai');
    }
  };

  const toggleFilter = (grade: 'all' | 'X' | 'XI' | 'XII') => {
    setFilterGradeLevel(prev => prev === grade ? 'all' : grade);
  };

  // Filter classes based on search term and grade level
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Improve grade level filtering for exact matching
    const matchesGrade = filterGradeLevel === 'all' || classItem.gradeLevel.split(' ')[0] === filterGradeLevel;
    
    return matchesSearch && matchesGrade;
  });

  // Get grade level icon
  const getGradeIcon = (grade: 'X' | 'XI' | 'XII') => {
    switch(grade) {
      case 'X': return <BookOpen className="h-4 w-4 mr-1" />;
      case 'XI': return <School className="h-4 w-4 mr-1" />;
      case 'XII': return <GraduationCap className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
      {/* Page Header with Animation */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg mr-4">
            <School className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {t('classes.title') || 'Kelas'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('classes.subtitle') || 'Kelola dan pantau kelas dan siswa'}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar with Enhanced Design */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('classes.search') || 'Cari kelas...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex gap-2">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                {(['X', 'XI', 'XII'] as const).map(grade => (
                  <button
                    key={grade}
                    onClick={() => toggleFilter(grade)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-all duration-200',
                      filterGradeLevel === grade
                        ? `bg-indigo-600 text-white shadow-sm transform scale-105`
                        : 'bg-transparent text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {getGradeIcon(grade)}
                    {grade}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('classes.add') || 'Tambah Kelas'}
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
                <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-400 w-full rounded-t-xl absolute top-0 left-0"></div>
                <div className="flex items-start space-x-4">
                  <div className="rounded-lg bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-3 h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Empty State with Better Design */}
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                <Filter className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                {searchTerm || filterGradeLevel !== 'all'
                  ? t('classes.noResults') || 'Tidak ada hasil yang cocok'
                  : t('classes.noClasses') || 'Belum ada data kelas'}
              </p>
              {!searchTerm && filterGradeLevel === 'all' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('classes.add') || 'Tambah Kelas'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onClick={handleClassClick}
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

      {/* Modal Form - Keep as is */}
      {showAddForm && (
        <AddClassForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddClass}
        />
      )}
    </div>
  );
}
