# StudentTable & StudentView Components

Komponen yang dioptimasi untuk menangani 1200+ siswa dengan performa tinggi.

## 🚀 Fitur Utama

### StudentTable
- **Performa Tinggi**: Optimasi untuk dataset besar (1200+ siswa)
- **Pagination**: 50 siswa per halaman untuk loading cepat
- **Search & Filter**: Pencarian real-time di semua field
- **Sorting**: Semua kolom dapat diurutkan (asc/desc)
- **Bulk Actions**: Seleksi multiple siswa untuk aksi massal
- **Responsive**: Adaptif di semua ukuran layar
- **Accessibility**: Support keyboard navigation dan screen readers

### StudentView (Hybrid Component)
- **Toggle View**: Beralih antara Card dan Table view
- **Smart Defaults**: Otomatis gunakan Table untuk dataset besar
- **Performance Warnings**: Notifikasi untuk user tentang batasan Card view

## 📁 Struktur File

```
src/
├── components/
│   ├── StudentCard.tsx          # Komponen kartu siswa (existing)
│   ├── StudentTable.tsx         # Komponen tabel siswa (new)
│   └── StudentView.tsx          # Wrapper hybrid view (new)
└── hooks/
    └── useStudentTable.ts       # Hook optimasi performa (new)
```

## 🔧 Penggunaan

### Basic Usage - StudentTable

```tsx
import StudentTable from '../components/StudentTable';
import { Student } from '../types';

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);

  const handleStudentClick = (student: Student) => {
    // Handle view student
    console.log('View student:', student);
  };

  const handleStudentEdit = (student: Student) => {
    // Handle edit student
    console.log('Edit student:', student);
  };

  const handleStudentDelete = (student: Student) => {
    // Handle delete student
    console.log('Delete student:', student);
  };

  const handleBulkAction = (students: Student[], action: string) => {
    // Handle bulk actions (export, delete, etc.)
    console.log('Bulk action:', action, students);
  };

  return (
    <StudentTable
      students={students}
      onClick={handleStudentClick}
      onEdit={handleStudentEdit}
      onDelete={handleStudentDelete}
      onBulkAction={handleBulkAction}
    />
  );
}
```

### Hybrid Usage - StudentView

```tsx
import StudentView from '../components/StudentView';

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);

  return (
    <StudentView
      students={students}
      defaultView="table" // 'table' or 'card'
      onStudentClick={handleStudentClick}
      onStudentEdit={handleStudentEdit}
      onStudentDelete={handleStudentDelete}
      onBulkAction={handleBulkAction}
    />
  );
}
```

### Advanced Usage - Custom Hook

```tsx
import { useStudentTable } from '../hooks/useStudentTable';

function CustomStudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  
  const {
    students: paginatedStudents,
    selectedStudents,
    metrics,
    handleSort,
    handleSearch,
    handleSelectAll,
    clearSelection
  } = useStudentTable(students, {
    itemsPerPage: 25, // Custom page size
    initialSortField: 'academicStatus',
    initialSortDirection: 'desc'
  });

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        Showing {metrics.currentPageStudents} of {metrics.filteredStudents} students
        {metrics.selectedCount > 0 && (
          <span> • {metrics.selectedCount} selected</span>
        )}
      </div>
      
      {/* Custom table implementation */}
      {/* ... */}
    </div>
  );
}
```

## ⚡ Optimasi Performa

### 1. Pagination
- Default 50 siswa per halaman
- Lazy loading untuk performa optimal
- Virtual scrolling support (opsional)

### 2. Memoization
- `useMemo` untuk filter dan sorting
- `useCallback` untuk event handlers
- Optimized re-rendering

### 3. Image Handling
- Error handling untuk avatar yang gagal load
- Fallback ke inisial nama
- Lazy loading images

### 4. Search Debouncing
```tsx
// Implementasi debouncing untuk search
const debouncedSearch = useDebounce(searchTerm, 300);
```

## 🎨 Styling & Theming

### Status Colors
```tsx
// Status configuration (dari StudentCard)
const statusConfig = {
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
```

### Custom Styling
```tsx
// Override default classes
<StudentTable
  students={students}
  className="custom-table-style"
  // ... other props
/>
```

## 🌍 Internationalization

Komponen mendukung i18n melalui `useLanguage` hook:

```tsx
// Translation keys yang digunakan:
const translationKeys = {
  'search.placeholder': 'Cari siswa...',
  'filter.all': 'Semua Status',
  'status.good': 'Baik',
  'status.warning': 'Peringatan',
  'status.critical': 'Kritis',
  'table.name': 'Nama',
  'table.class': 'Kelas',
  'table.email': 'Email',
  'table.status': 'Status',
  'table.mentalHealth': 'Kesehatan Mental',
  'table.actions': 'Aksi',
  'actions.view': 'Lihat',
  'actions.edit': 'Edit',
  'actions.delete': 'Hapus',
  'actions.export': 'Export',
  'pagination.showing': 'Menampilkan',
  'pagination.to': 'sampai',
  'pagination.of': 'dari',
  'pagination.results': 'hasil',
  'pagination.previous': 'Sebelumnya',
  'pagination.next': 'Selanjutnya'
};
```

## 📱 Responsive Design

### Desktop (≥1024px)
- Tabel penuh dengan semua kolom
- Hover effects dan tooltips
- Bulk selection dengan keyboard shortcuts

### Tablet (768px - 1023px)
- Horizontal scroll untuk tabel
- Kompak spacing
- Touch-friendly buttons

### Mobile (<768px)
- Simplified pagination
- Stacked view untuk data penting
- Swipe gestures (opsional)

## 🔧 Configuration Options

### StudentTable Props
```tsx
interface StudentTableProps {
  students: Student[];                    // Required: Array siswa
  onClick: (student: Student) => void;    // Required: Handler click
  onEdit?: (student: Student) => void;    // Optional: Handler edit
  onDelete?: (student: Student) => void;  // Optional: Handler delete
  onBulkAction?: (students: Student[], action: string) => void; // Optional: Bulk actions
  className?: string;                     // Optional: Custom CSS classes
  itemsPerPage?: number;                 // Optional: Default 50
  enableVirtualization?: boolean;         // Optional: Default false
}
```

### useStudentTable Options
```tsx
interface UseStudentTableOptions {
  initialSortField?: keyof Student | 'class';  // Default: 'name'
  initialSortDirection?: 'asc' | 'desc';       // Default: 'asc'
  itemsPerPage?: number;                       // Default: 50
  enableVirtualization?: boolean;              // Default: false
}
```

## 🧪 Testing

### Unit Tests
```bash
# Test komponen
npm test StudentTable.test.tsx
npm test StudentView.test.tsx
npm test useStudentTable.test.ts
```

### Performance Tests
```bash
# Test dengan dataset besar
npm run test:performance
```

### E2E Tests
```bash
# Test user flows
npm run test:e2e
```

## 🚀 Best Practices

### 1. Data Loading
```tsx
// Lazy load student data
const { data: students, loading } = useStudentsQuery({
  variables: { 
    limit: 50, 
    offset: currentPage * 50 
  }
});
```

### 2. Error Handling
```tsx
// Handle loading dan error states
if (loading) return <StudentTableSkeleton />;
if (error) return <ErrorMessage />;
```

### 3. Bulk Operations
```tsx
// Implementasi bulk delete
const handleBulkDelete = async (students: Student[]) => {
  try {
    await Promise.all(
      students.map(student => deleteStudent(student.id))
    );
    // Refresh data
    refetch();
  } catch (error) {
    // Handle error
  }
};
```

### 4. Accessibility
```tsx
// ARIA labels dan keyboard navigation
<table role="table" aria-label="Students data table">
  <thead>
    <tr role="row">
      <th role="columnheader" aria-sort={sortDirection}>
        Name
      </th>
    </tr>
  </thead>
</table>
```

## 🔄 Migration dari StudentCard

### Step 1: Import Components
```tsx
// Sebelum
import StudentCard from '../components/StudentCard';

// Sesudah
import StudentView from '../components/StudentView';
// atau
import StudentTable from '../components/StudentTable';
```

### Step 2: Update Props
```tsx
// Sebelum (Card Grid)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {students.map(student => (
    <StudentCard
      key={student.id}
      student={student}
      onClick={handleClick}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ))}
</div>

// Sesudah (Hybrid View)
<StudentView
  students={students}
  defaultView="table"
  onStudentClick={handleClick}
  onStudentEdit={handleEdit}
  onStudentDelete={handleDelete}
  onBulkAction={handleBulkAction}
/>
```

### Step 3: Add Bulk Actions
```tsx
// Implementasi bulk actions
const handleBulkAction = (students: Student[], action: string) => {
  switch (action) {
    case 'export':
      exportStudents(students);
      break;
    case 'delete':
      bulkDeleteStudents(students);
      break;
    case 'archive':
      bulkArchiveStudents(students);
      break;
  }
};
```

## 🐛 Troubleshooting

### Performance Issues
1. **Slow rendering**: Pastikan menggunakan pagination
2. **Memory leaks**: Clear selection saat unmount
3. **Heavy re-renders**: Check memoization

### Data Issues
1. **Missing student data**: Handle undefined values
2. **Image loading errors**: Implement error boundaries
3. **Sort not working**: Verify field types

### UI Issues
1. **Responsive problems**: Test di berbagai ukuran layar
2. **Accessibility**: Test dengan screen readers
3. **Translation missing**: Add fallback text

## 📈 Performance Metrics

Target performa untuk 1200 siswa:
- **Initial load**: < 2 detik
- **Search response**: < 300ms
- **Page navigation**: < 100ms
- **Sort operation**: < 200ms
- **Memory usage**: < 50MB

## 🔮 Future Enhancements

1. **Virtual Scrolling**: Untuk dataset > 10,000
2. **Advanced Filters**: Multiple filter kombinasi
3. **Export Options**: PDF, Excel, CSV
4. **Drag & Drop**: Reorder dan bulk operations
5. **Real-time Updates**: WebSocket integration
6. **Mobile App**: React Native version

---

**Komponen StudentTable & StudentView** memberikan solusi performa tinggi untuk mengelola data siswa dalam skala besar sambil mempertahankan user experience yang optimal.
