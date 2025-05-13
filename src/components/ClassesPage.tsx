import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Class, FilterParams } from '../types';
import ClassCard from '../components/ClassCard';
import AddClassForm from '../components/AddClassForm';
import { Search, Plus, RefreshCcw, AlertCircle} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getClasses, createClass } from '../services/classes';
import axios, { AxiosError } from 'axios';
import { createAbortController } from '../services/api';

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

  const loadClasses = useCallback(async () => {
    // Create AbortController to manage timeout
    const { clearTimeout } = createAbortController(15000);
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a FilterParams object for the search term and grade level filter
      const filters: FilterParams = {};
      if (searchTerm) filters.searchQuery = searchTerm;
      if (filterGradeLevel !== 'all') filters.grade = filterGradeLevel;
      
      const response = await getClasses(filters, currentPage);
      
      // Clear timeout since request completed successfully
      clearTimeout();
      
      // Validate response data
      if (response && response.data) {
        setClasses(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        console.error('Invalid response format:', response);
        setError(t('errors.invalidData') || 'Data tidak valid');
        setClasses([]);
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      
      // Handle Axios errors specifically
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.code === 'ERR_CANCELED') {
          setError(t('errors.timeout') || 'Permintaan timeout');
        } else {
          setError(axiosError.response?.data?.detail || t('errors.loadingClasses') || 'Gagal memuat data kelas');
        }
      } else {
        // Handle non-Axios errors
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
      console.error('Error creating class:', axiosError);
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
    setFilterGradeLevel(filterGradeLevel === grade ? 'all' : grade);
  };

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterGradeLevel === 'all' || classItem.gradeLevel.startsWith(filterGradeLevel);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('classes.title') || 'Kelas'}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('classes.subtitle') || 'Kelola dan pantau kelas dan siswa'}
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('classes.search') || 'Cari kelas...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            {(['X', 'XI', 'XII'] as const).map(grade => (
              <button
                key={grade}
                onClick={() => toggleFilter(grade)}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  filterGradeLevel === grade
                    ? 'bg-brand-100 text-brand-700 border-brand-200'
                    : 'bg-white text-gray-700 border-gray-300'
                } border hover:bg-gray-50`}
              >
                {grade}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('classes.add') || 'Tambah Kelas'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              {t('actions.retry') || 'Coba lagi'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || filterGradeLevel !== 'all'
                  ? t('classes.noResults') || 'Tidak ada hasil yang cocok'
                  : t('classes.noClasses') || 'Belum ada data kelas'}
              </p>
              {!searchTerm && filterGradeLevel === 'all' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
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

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('pagination.previous') || 'Sebelumnya'}
                </button>
                <span className="text-sm text-gray-700">
                  {t('pagination.page') || 'Halaman'} {currentPage} {t('pagination.of') || 'dari'} {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('pagination.next') || 'Berikutnya'}
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {showAddForm && (
        <AddClassForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddClass}
        />
      )}
    </div>
  );
}
