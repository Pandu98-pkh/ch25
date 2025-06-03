// Example implementation untuk menggantikan StudentCard grid dengan StudentTable
// File: src/pages/StudentsPage.tsx (contoh)

import { useState, useEffect } from 'react';
import { Student } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import StudentView from '../components/StudentView';

// Mock data untuk demo (ganti dengan API call yang sebenarnya)
const generateMockStudents = (count: number): Student[] => {
  const statuses: ('good' | 'warning' | 'critical')[] = ['good', 'warning', 'critical'];
  const tingkats = ['10', '11', '12'];
  const kelas = ['A', 'B', 'C', 'D', 'E'];
  
  return Array.from({ length: count }, (_, i) => ({
    studentId: `student-${i + 1}`, // Primary key
    name: `Siswa ${i + 1}`,
    email: `siswa${i + 1}@sekolah.edu`,
    tingkat: tingkats[Math.floor(Math.random() * tingkats.length)],
    kelas: kelas[Math.floor(Math.random() * kelas.length)],
    academicStatus: statuses[Math.floor(Math.random() * statuses.length)],
    mentalHealthScore: Math.floor(Math.random() * 100),
    avatar: i % 3 === 0 ? `/assets/images/avatar${(i % 5) + 1}.jpg` : undefined,
    lastCounseling: i % 4 === 0 ? '2024-01-15' : undefined,
    // Optional fields for compatibility
    id: `student-${i + 1}`,
    grade: tingkats[Math.floor(Math.random() * tingkats.length)],
    class: kelas[Math.floor(Math.random() * kelas.length)]
  }));
};

export default function StudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Load students data
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo: generate 1200 students
        const mockStudents = generateMockStudents(1200);
        setStudents(mockStudents);
        
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Event handlers
  const handleStudentClick = (student: Student) => {
    console.log('View student:', student);
    // TODO: Implement student detail view/modal
  };

  const handleStudentEdit = (student: Student) => {
    console.log('Edit student:', student);
    // TODO: Implement student edit modal
  };

  const handleStudentDelete = (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      setStudents(prev => prev.filter(s => s.studentId !== student.studentId));
      console.log('Student deleted:', student.name);
    }
  };

  const handleBulkAction = async (selectedStudents: Student[], action: string) => {
    console.log('Bulk action:', action, 'on', selectedStudents.length, 'students');
    
    switch (action) {
      case 'export':
        await exportStudents(selectedStudents);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) {
          const idsToDelete = new Set(selectedStudents.map(s => s.studentId));
          setStudents(prev => prev.filter(s => !idsToDelete.has(s.studentId)));
        }
        break;
      default:
        console.log('Unknown bulk action:', action);
    }
  };

  // Export function
  const exportStudents = async (studentsToExport: Student[]) => {
    try {
      // Create CSV data
      const csvData = studentsToExport.map(student => ({
        Name: student.name,
        Email: student.email,
        Class: `${student.tingkat} ${student.kelas}`,
        Status: student.academicStatus,
        MentalHealth: student.mentalHealthScore || '-'
      }));

      // Convert to CSV string
      const csvHeaders = Object.keys(csvData[0]).join(',');
      const csvRows = csvData.map(row => Object.values(row).join(','));
      const csvContent = [csvHeaders, ...csvRows].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      console.log('Export completed for', studentsToExport.length, 'students');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">{t('loading') || 'Loading students...'}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('students.title') || 'Data Siswa'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('students.subtitle') || 'Kelola data siswa sekolah'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => console.log('Add new student')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <span>{t('students.add') || 'Tambah Siswa'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentView
          students={students}
          defaultView="table" // Use table as default for performance
          onStudentClick={handleStudentClick}
          onStudentEdit={handleStudentEdit}
          onStudentDelete={handleStudentDelete}
          onBulkAction={handleBulkAction}
        />
      </div>
    </div>
  );
}
