import { useMemo, useState, useCallback } from 'react';
import { Student } from '../types';

export interface UseStudentTableOptions {
  initialSortField?: keyof Student | 'class';
  initialSortDirection?: 'asc' | 'desc';
  itemsPerPage?: number;
  enableVirtualization?: boolean;
}

export function useStudentTable(
  students: Student[],
  options: UseStudentTableOptions = {}
) {  const {
    initialSortField = 'name',
    initialSortDirection = 'asc',
    itemsPerPage = 10,
    enableVirtualization = false
  } = options;

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Student | 'class'>(initialSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Memoized filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.tingkat || student.grade} ${student.kelas || student.class}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || student.academicStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  // Memoized sorted students
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      if (sortField === 'class') {
        aValue = `${a.tingkat || a.grade} ${a.kelas || a.class}`;
        bValue = `${b.tingkat || b.grade} ${b.kelas || b.class}`;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      // Convert to lowercase for string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredStudents, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Memoized paginated students
  const paginatedStudents = useMemo(() => {
    if (enableVirtualization) {
      // For virtualization, return all sorted students
      return sortedStudents;
    }
    return sortedStudents.slice(startIndex, endIndex);
  }, [sortedStudents, startIndex, endIndex, enableVirtualization]);

  // Event handlers
  const handleSort = useCallback((field: keyof Student | 'class') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  }, [sortField]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);  const handleSelectAll = useCallback(() => {
    if (selectedStudents.size === paginatedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(paginatedStudents.map(s => getStudentId(s))));
    }
  }, [selectedStudents.size, paginatedStudents]);

  const handleSelectStudent = useCallback((studentId: string) => {
    setSelectedStudents(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(studentId)) {
        newSelected.delete(studentId);
      } else {
        newSelected.add(studentId);
      }
      return newSelected;
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const clearSelection = useCallback(() => {
    setSelectedStudents(new Set());
  }, []);  const getSelectedStudents = useCallback(() => {
    return students.filter(student => {
      const studentId = getStudentId(student);
      return selectedStudents.has(studentId);
    });
  }, [students, selectedStudents]);

  // Performance metrics
  const metrics = useMemo(() => ({
    totalStudents: students.length,
    filteredStudents: filteredStudents.length,
    currentPageStudents: paginatedStudents.length,
    selectedCount: selectedStudents.size,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  }), [
    students.length,
    filteredStudents.length,
    paginatedStudents.length,
    selectedStudents.size,
    totalPages,
    currentPage
  ]);

  return {
    // Data
    students: paginatedStudents,
    allFilteredStudents: sortedStudents,
    selectedStudents: getSelectedStudents(),
    
    // State
    searchTerm,
    sortField,
    sortDirection,
    currentPage,
    statusFilter,
    selectedStudentIds: selectedStudents,
    
    // Handlers
    handleSort,
    handleSearch,
    handleStatusFilter,
    handleSelectAll,
    handleSelectStudent,
    handlePageChange,
    clearSelection,
    
    // Utilities
    metrics,
    
    // Setters (for advanced use cases)
    setSearchTerm,
    setSortField,
    setSortDirection,
    setCurrentPage,
    setStatusFilter,
    setSelectedStudents
  };
}

// Hook for image error handling
export function useImageErrors() {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((studentId: string) => {
    setImageErrors(prev => new Set(prev).add(studentId));
  }, []);

  const hasImageError = useCallback((studentId: string) => {
    return imageErrors.has(studentId);
  }, [imageErrors]);

  const clearImageError = useCallback((studentId: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
  }, []);

  const clearAllImageErrors = useCallback(() => {
    setImageErrors(new Set());
  }, []);

  return {
    hasImageError,
    handleImageError,
    clearImageError,
    clearAllImageErrors
  };
}

// Utility functions
export const getStudentId = (student: Student): string => {
  return student.studentId || student.id || student.name;
};

export const getAvatarInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return {
        text: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        progressBar: 'bg-green-500'
      };
    case 'warning':
      return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        progressBar: 'bg-yellow-500'
      };
    case 'critical':
      return {
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        progressBar: 'bg-red-500'
      };
    default:
      return {
        text: 'text-gray-700',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        progressBar: 'bg-gray-500'
      };
  }
};

export const getMentalHealthScoreColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};
