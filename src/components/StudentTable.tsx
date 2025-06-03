import { Student } from '../types';
import { cn } from '../utils/cn';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Eye,
  ChevronUp, 
  ChevronDown,
  Download
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStudentTable, useImageErrors, getAvatarInitials, getMentalHealthScoreColor } from '../hooks/useStudentTable';
import { bulkDeleteStudents } from '../services/studentService';
import { useState } from 'react';

// Helper function to generate unique key for students
const getStudentKey = (student: Student, index: number) => {
  // Try multiple fallback options for unique identification
  return student.id || 
         student.email || 
         `${student.name}-${student.tingkat || student.grade}-${student.kelas || student.class}` || 
         `student-${index}`;
};

interface StudentTableProps {
  students: Student[];
  onClick: (student: Student) => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onBulkAction?: (students: Student[], action: string) => void;
}

// Reuse statusConfig from StudentCard
const statusConfig: Record<string, {
  color: string,
  bgColor: string,
  borderColor: string,
  icon: typeof AlertCircle
}> = {
  good: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle2
  },
  warning: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Clock
  },
  critical: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle
  }
};

export default function StudentTable({ 
  students, 
  onClick, 
  onEdit, 
  onDelete, 
  onBulkAction 
}: StudentTableProps) {
  const { t } = useLanguage();
  const { hasImageError, handleImageError } = useImageErrors();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Use the optimized hook
  const {
    students: paginatedStudents,
    selectedStudents,
    selectedStudentIds,
    sortField,
    sortDirection,
    currentPage,
    metrics,
    handleSort,
    handleSelectAll,
    handleSelectStudent,
    handlePageChange
  } = useStudentTable(students, {
    itemsPerPage: 50,
    initialSortField: 'name'
  });
  const defaultAvatar = '/assets/images/default-avatar.png';

  const handleAction = (e: React.MouseEvent, student: Student, action: 'edit' | 'delete' | 'view') => {
    e.stopPropagation();
    if (action === 'edit' && onEdit) {
      onEdit(student);
    } else if (action === 'delete' && onDelete) {
      onDelete(student);
    } else if (action === 'view') {
      onClick(student);
    }
  };

  const renderSortIcon = (field: keyof Student | 'class') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const renderMentalHealthProgress = (score?: number) => {
    if (score === undefined) return <span className="text-gray-400 text-sm">-</span>;
    
    return (
      <div className="flex items-center space-x-2 min-w-[100px]">
        <span className="text-sm font-medium text-gray-700">{score}</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full", getMentalHealthScoreColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  const handleBulkDelete = () => {
    if (selectedStudents.length > 0) {
      setShowDeleteConfirm(true);
    }
  };
  const confirmBulkDelete = async () => {
    try {
      // Extract student IDs from selected students
      const studentIds = selectedStudents.map(student => student.id || student.studentId).filter(Boolean);
      
      if (studentIds.length === 0) {
        console.error('No valid student IDs found');
        setShowDeleteConfirm(false);
        return;
      }
      
      // Call the bulk delete API through studentService
      const result = await bulkDeleteStudents(studentIds);
      
      // Call the original onBulkAction to refresh the UI
      onBulkAction?.(selectedStudents, 'delete');
      
      // Show success message (you can implement a toast notification here)
      console.log(result.message);
      
      // Optionally show which students were not found
      if (result.notFound && result.notFound.length > 0) {
        console.warn('Students not found:', result.notFound);
      }
    } catch (error) {
      console.error('Error during bulk delete:', error);
      // Show error message to user (you can implement a toast notification here)
    }
    
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with controls */}
      {selectedStudentIds.size > 0 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end">
            {/* Bulk Actions */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedStudentIds.size} {t('selected') || 'terpilih'}
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>{t('actions.delete') || 'Hapus'}</span>
              </button>
              <button
                onClick={() => onBulkAction?.(selectedStudents, 'export')}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>{t('actions.export') || 'Export'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('confirm.deleteMultiple') || 'Hapus Siswa'}
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-3">
                {t('confirm.deleteMultipleMessage') || 
                  `Apakah Anda yakin ingin menghapus ${selectedStudentIds.size} siswa yang dipilih? Data siswa akan dipindahkan ke sampah dan dapat dipulihkan nanti.`
                }
              </p>
              
              {/* List of students to be deleted */}
              <div className="bg-gray-50 rounded-md p-3 max-h-48 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {t('confirm.studentsToDelete') || 'Siswa yang akan dihapus:'}
                </h4>
                <ul className="space-y-1">
                  {selectedStudents.map((student, index) => (
                    <li key={getStudentKey(student, index)} className="text-sm text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2 flex-shrink-0"></span>
                      <span className="truncate">
                        {student.name} 
                        {student.id && <span className="text-gray-500 ml-1">({student.id})</span>}
                        {(student.tingkat || student.grade) && (student.kelas || student.class) && (
                          <span className="text-gray-500 ml-1">
                            - {student.tingkat || student.grade} {student.kelas || student.class}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {t('actions.cancel') || 'Batal'}
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {t('actions.delete') || 'Hapus'} ({selectedStudentIds.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Select All Checkbox */}              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={paginatedStudents.length > 0 && selectedStudentIds.size === paginatedStudents.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>

              {/* Avatar */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.avatar') || 'Avatar'}
              </th>

              {/* Student ID */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center hover:text-gray-700 focus:outline-none"
                >
                  {t('table.studentId') || 'ID Siswa'}
                  {renderSortIcon('id')}
                </button>
              </th>

              {/* Name */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center hover:text-gray-700 focus:outline-none"
                >
                  {t('table.name') || 'Nama'}
                  {renderSortIcon('name')}
                </button>
              </th>

              {/* Class */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('class')}
                  className="flex items-center hover:text-gray-700 focus:outline-none"
                >
                  {t('table.class') || 'Kelas'}
                  {renderSortIcon('class')}
                </button>
              </th>

              {/* Email */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center hover:text-gray-700 focus:outline-none"
                >
                  {t('table.email') || 'Email'}
                  {renderSortIcon('email')}
                </button>
              </th>

              {/* Academic Status */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('academicStatus')}
                  className="flex items-center hover:text-gray-700 focus:outline-none"
                >
                  {t('table.status') || 'Status'}
                  {renderSortIcon('academicStatus')}
                </button>
              </th>

              {/* Mental Health Score */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('mentalHealthScore')}
                  className="flex items-center hover:text-gray-700 focus:outline-none"
                >
                  {t('table.mentalHealth') || 'Kesehatan Mental'}
                  {renderSortIcon('mentalHealthScore')}
                </button>
              </th>

              {/* Actions */}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.actions') || 'Aksi'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedStudents.map((student, index) => {
              const studentKey = getStudentKey(student, index);
              const status = student.academicStatus || 'warning';
              const statusCfg = statusConfig[status] || statusConfig.warning;
              const avatarPath = student.avatar || student.photo || defaultAvatar;
              const hasError = hasImageError(studentKey);
                return (
                <tr
                  key={studentKey}
                  onClick={() => onClick(student)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  {/* Checkbox */}                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.has(studentKey)}
                      onChange={() => handleSelectStudent(studentKey)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>

                  {/* Avatar */}
                  <td className="px-4 py-4">
                    {!hasError ? (
                      <img
                        src={avatarPath}
                        alt={student.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                        onError={() => handleImageError(studentKey)}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-2 ring-gray-100">
                        <span className="text-xs font-medium text-indigo-600">
                          {getAvatarInitials(student.name)}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Student ID */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">
                      {student.id || '-'}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {student.name}
                      </span>
                      {student.email && (
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">
                          {student.email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Class */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {student.tingkat || student.grade} {student.kelas || student.class}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900 truncate max-w-[150px] block">
                      {student.email || '-'}
                    </span>
                  </td>

                  {/* Academic Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        statusCfg.bgColor,
                        statusCfg.color,
                        `border ${statusCfg.borderColor}`
                      )}
                    >
                      <statusCfg.icon className="w-3 h-3 mr-1" />
                      {t(`status.${status}`)}
                    </span>
                  </td>

                  {/* Mental Health Score */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {renderMentalHealthProgress(student.mentalHealthScore)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => handleAction(e, student, 'view')}
                        className="text-gray-600 hover:text-indigo-600 transition-colors p-1"
                        title={t('actions.view') || 'Lihat'}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {onEdit && (
                        <button
                          onClick={(e) => handleAction(e, student, 'edit')}
                          className="text-gray-600 hover:text-indigo-600 transition-colors p-1"
                          title={t('actions.edit') || 'Edit'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => handleAction(e, student, 'delete')}
                          className="text-gray-600 hover:text-red-600 transition-colors p-1"
                          title={t('actions.delete') || 'Hapus'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {paginatedStudents.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('table.noResults') || 'Tidak ada siswa ditemukan'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('table.noResultsDesc') || 'Coba ubah filter atau kata kunci pencarian'}
            </p>
          </div>
        )}
      </div>      {/* Pagination */}
      {metrics.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!metrics.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pagination.previous') || 'Sebelumnya'}
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!metrics.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pagination.next') || 'Selanjutnya'}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t('pagination.showing') || 'Menampilkan'}{' '}
                  <span className="font-medium">{((currentPage - 1) * 50) + 1}</span>
                  {' '}{t('pagination.to') || 'sampai'}{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 50, metrics.filteredStudents)}
                  </span>
                  {' '}{t('pagination.of') || 'dari'}{' '}
                  <span className="font-medium">{metrics.filteredStudents}</span>
                  {' '}{t('pagination.results') || 'hasil'}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!metrics.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">{t('pagination.previous') || 'Sebelumnya'}</span>
                    <ChevronUp className="h-5 w-5 rotate-[-90deg]" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, metrics.totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={cn(
                          'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                          currentPage === pageNumber
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        )}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!metrics.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">{t('pagination.next') || 'Selanjutnya'}</span>
                    <ChevronDown className="h-5 w-5 rotate-[-90deg]" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
