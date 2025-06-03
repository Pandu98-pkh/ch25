import { useState } from 'react';
import { Student } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Grid, List, Filter, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import StudentCard from './StudentCard';
import StudentTable from './StudentTable';
import { getStudentId } from '../hooks/useStudentTable';

interface StudentViewProps {
  students: Student[];
  onStudentClick: (student: Student) => void;
  onStudentEdit?: (student: Student) => void;
  onStudentDelete?: (student: Student) => void;
  onBulkAction?: (students: Student[], action: string) => void;
  defaultView?: 'card' | 'table';
}

export default function StudentView({
  students,
  onStudentClick,
  onStudentEdit,
  onStudentDelete,
  onBulkAction,
  defaultView = 'table' // Default to table for better performance with large datasets
}: StudentViewProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'card' | 'table'>(defaultView);
  const [limitFilter, setLimitFilter] = useState<string>('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Apply limit filter with pagination (no status filter needed)
  const itemsPerPage = limitFilter === 'semua' ? students.length : parseInt(limitFilter);
  const totalPages = limitFilter === 'semua' ? 1 : Math.ceil(students.length / itemsPerPage);
  const startIndex = limitFilter === 'semua' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = limitFilter === 'semua' ? students.length : startIndex + itemsPerPage;
  const paginatedStudents = students.slice(startIndex, endIndex);

  // Limit cards to 100 for performance (show message if more)
  const cardViewStudents = viewMode === 'card' ? paginatedStudents.slice(0, 100) : paginatedStudents;
  const hasMoreStudents = viewMode === 'card' && paginatedStudents.length > 100;

  // Reset page when filters change
  const handleLimitChange = (value: string) => {
    setLimitFilter(value);
    setCurrentPage(1);
  };

  const handleBulkDelete = async () => {
    const studentsToDelete = paginatedStudents.filter((student, index) => {
      const studentKey = student.id || student.email || `${student.name}-${student.tingkat || student.grade}-${student.kelas || student.class}` || `student-${index}`;
      return selectedStudents.has(studentKey);
    });
    
    try {
      // Extract student IDs
      const studentIds = studentsToDelete.map(student => student.id || student.studentId);
      
      // Call the bulk delete API
      const response = await fetch('/api/students/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: studentIds
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Call the original onBulkAction to refresh the UI
        if (onBulkAction) {
          onBulkAction(studentsToDelete, 'delete');
        }
        
        // Show success message
        console.log(result.message);
      } else {
        const error = await response.json();
        console.error('Bulk delete failed:', error.message);
      }
    } catch (error) {
      console.error('Network error during bulk delete:', error);
    }
    
    setSelectedStudents(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Limit filter - show for both views */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={limitFilter}
                onChange={(e) => handleLimitChange(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="10">{t('limit.ten') || 'Tampilkan 10'}</option>
                <option value="100">{t('limit.hundred') || 'Tampilkan 100'}</option>
                <option value="500">{t('limit.fiveHundred') || 'Tampilkan 500'}</option>
                <option value="semua">{t('limit.all') || 'Tampilkan Semua'}</option>
              </select>
            </div>

            {/* Results info */}
            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium">{paginatedStudents.length}</span>
              <span className="ml-1">
                {paginatedStudents.length === 1 ? 
                  (t('students.singular') || 'siswa') : 
                  (t('students.plural') || 'siswa')
                }
              </span>
              {(students.length !== paginatedStudents.length) && (
                <span className="ml-1 text-gray-400">
                  {t('search.from') || 'dari'} {students.length}
                </span>
              )}
              {totalPages > 1 && (
                <span className="ml-2 text-gray-500">
                  • {t('pagination.page') || 'Halaman'} {currentPage} {t('pagination.of') || 'dari'} {totalPages}
                </span>
              )}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                viewMode === 'table'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <List className="h-4 w-4" />
              <span>{t('view.table') || 'Tabel'}</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                viewMode === 'card'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Grid className="h-4 w-4" />
              <span>{t('view.card') || 'Kartu'}</span>
            </button>
          </div>
        </div>

        {/* Performance warning for card view */}
        {viewMode === 'card' && students.length > 100 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Filter className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {t('performance.warning') || 'Peringatan Performa'}
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    {t('performance.cardLimit') || 
                      'View kartu dibatasi 100 siswa untuk performa optimal. Gunakan view tabel untuk dataset besar atau gunakan filter untuk mempersempit hasil.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}        {/* Show more students message */}
        {hasMoreStudents && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              {`Menampilkan 100 dari ${paginatedStudents.length} siswa. Gunakan filter atau beralih ke view tabel untuk melihat semua data.`}
            </div>
          </div>
        )}

        {/* Limit filter message */}
        {limitFilter !== 'semua' && students.length > parseInt(limitFilter) && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              {`Menampilkan ${Math.min(parseInt(limitFilter), students.length)} dari ${students.length} siswa yang sesuai filter. Gunakan pagination atau pilih "Tampilkan Semua" untuk melihat semua hasil.`}
            </div>
          </div>
        )}
      </div>      {/* Content */}
      {viewMode === 'table' ? (
        <StudentTable
          students={paginatedStudents}
          onClick={onStudentClick}
          onEdit={onStudentEdit}
          onDelete={onStudentDelete}
          onBulkAction={onBulkAction}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cardViewStudents.map((student) => (
            <StudentCard
              key={getStudentId(student)}
              student={student}
              onClick={onStudentClick}
              onEdit={onStudentEdit}
              onDelete={onStudentDelete}
            />
          ))}
          
          {cardViewStudents.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Filter className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('search.noResults') || 'Tidak ada siswa ditemukan'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('search.noResultsDesc') || 'Coba ubah filter atau kata kunci pencarian'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t('pagination.showing') || 'Menampilkan'} {startIndex + 1} - {Math.min(endIndex, students.length)} {t('pagination.of') || 'dari'} {students.length} {t('students.plural') || 'siswa'}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 border',
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{t('pagination.previous') || 'Sebelumnya'}</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium border',
                        currentPage === pageNumber
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 border',
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                )}
              >
                <span>{t('pagination.next') || 'Selanjutnya'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions for Card View */}
      {viewMode === 'card' && selectedStudents.size > 0 && (
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-700 font-medium">
            {selectedStudents.size} {t('selected') || 'terpilih'}
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-1"
            title={t('actions.deleteSelected') || 'Hapus yang dipilih'}
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('actions.delete') || 'Hapus'}</span>
          </button>
          <button
            onClick={() => setSelectedStudents(new Set())}
            className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            {t('actions.clearSelection') || 'Batal'}
          </button>
        </div>
      )}
    </div>
  );
}
