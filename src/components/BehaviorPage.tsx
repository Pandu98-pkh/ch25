import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, AlertCircle, CheckCircle2, Clock, Users, X, RefreshCcw, ArrowRight, Award, Star, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { BehaviorRecord, Student } from '../types';
import { cn } from '../utils/cn';
import { getBehaviorRecords, createBehaviorRecord } from '../services/mentalHealthService';
import { getStudents } from '../services/studentService';
import { toast } from '../utils/toast';
import { createAbortController } from '../services/api';

// Define the allowed category types
type BehaviorCategory = 'attendance' | 'discipline' | 'participation' | 'social';
type SeverityType = 'positive' | 'neutral' | 'minor' | 'major';

// Enhanced severity configuration with colors and icons
const severityConfig = {
  positive: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    gradient: 'from-green-500 to-teal-400',
    icon: Star
  },
  neutral: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    gradient: 'from-gray-400 to-gray-300',
    icon: CheckCircle2
  },
  minor: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    gradient: 'from-yellow-500 to-amber-400',
    icon: Clock
  },
  major: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    gradient: 'from-red-500 to-rose-400',
    icon: AlertCircle
  }
};

// Enhanced category configuration with colors and icons
const categoryConfig = {
  attendance: {
    icon: Clock,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  discipline: {
    icon: AlertCircle,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  participation: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  social: {
    icon: Users,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  }
};

interface BehaviorPageProps {
  studentId?: string;
}

export default function BehaviorPage({ studentId }: BehaviorPageProps) {
  const { t } = useLanguage();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BehaviorCategory | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId || '');
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
  // New record form state
  const [newRecord, setNewRecord] = useState<{
    studentId: string;
    category: BehaviorCategory;
    severity: SeverityType;
    description: string;
    actionTaken?: string;
  }>({
    studentId: studentId || '',
    category: 'discipline',
    severity: 'neutral',
    description: '',
    actionTaken: '',
  });

  // Load students data for dropdown
  const loadStudents = useCallback(async () => {
    // Skip loading students if studentId is provided from props
    if (studentId) return;
    
    try {
      setLoadingStudents(true);
      const response = await getStudents({}, 1);
      if (response && response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoadingStudents(false);
    }
  }, [studentId]);

  // Load behavior records
  const loadRecords = useCallback(async () => {
    if (!selectedStudentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { clearTimeout } = createAbortController(15000);

      const response = await getBehaviorRecords(selectedStudentId);
      clearTimeout();

      if (response && response.data) {
        setRecords(response.data);
      } else {
        setError(t('errors.invalidData') || 'Format respons tidak valid');
        setRecords([]);
      }
    } catch (err) {
      console.error('Error loading behavior records:', err);
      
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('timeout')) {
          setError(t('errors.timeout') || 'Waktu permintaan habis');
        } else {
          setError(err.message || t('errors.loadingRecords') || 'Gagal memuat data');
        }
      } else {
        setError(t('errors.loadingRecords') || 'Gagal memuat data');
      }
      
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, t]);

  // Create a new behavior record
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRecord.studentId) {
      toast.error(t('behavior.noStudentSelected') || 'Silakan pilih siswa terlebih dahulu');
      return;
    }

    if (!newRecord.description.trim()) {
      toast.error(t('behavior.descriptionRequired') || 'Deskripsi tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);

      const recordToCreate: Omit<BehaviorRecord, 'id'> = {
        studentId: newRecord.studentId,
        date: new Date().toISOString().split('T')[0],
        type: newRecord.severity === 'positive' ? 'positive' : 'negative',
        description: newRecord.description,
        category: newRecord.category,
        severity: newRecord.severity,
        reporter: { id: 'system', name: 'System' },
        ...(newRecord.actionTaken ? { actionTaken: newRecord.actionTaken } : {}),
      };

      const response = await createBehaviorRecord(recordToCreate);

      if (response) {
        toast.success(t('behavior.recordCreated') || 'Catatan berhasil dibuat');
        setIsModalOpen(false);
        
        // Update selectedStudentId if it was changed in the form
        if (newRecord.studentId !== selectedStudentId) {
          setSelectedStudentId(newRecord.studentId);
        } else {
          loadRecords();
        }

        // Reset form
        setNewRecord({
          studentId: newRecord.studentId, // Keep the selected student
          category: 'discipline',
          severity: 'neutral',
          description: '',
          actionTaken: '',
        });
      } else {
        throw new Error('Failed to create record');
      }
    } catch (err) {
      console.error('Error creating behavior record:', err);
      toast.error(err instanceof Error ? err.message : (t('behavior.createFailed') || 'Gagal membuat catatan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for student selection
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStudentId = e.target.value;
    setNewRecord({
      ...newRecord,
      studentId: newStudentId,
    });
  };

  // Handle retry when loading fails
  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      loadRecords();
    } else {
      setError(t('errors.maxRetriesReached') || 'Batas percobaan telah tercapai');
    }
  };

  // Initial data loading
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (studentId) {
      setSelectedStudentId(studentId);
      // Update form state as well
      setNewRecord(prev => ({
        ...prev,
        studentId
      }));
    }
  }, [studentId]);

  // Load students for dropdown when modal opens
  useEffect(() => {
    if (isModalOpen) {
      loadStudents();
    }
  }, [isModalOpen, loadStudents]);

  // Filter records based on search term and selected category
  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get stats for dashboard
  const getStats = () => {
    const thisMonthRecords = records.filter(
      (record) => new Date(record.date).getMonth() === new Date().getMonth()
    );
    
    const positiveRecords = records.filter(record => record.severity === 'positive');
    const needsAttention = records.filter(record => record.severity === 'major');
    
    return {
      thisMonth: thisMonthRecords.length,
      positive: positiveRecords.length,
      needsAttention: needsAttention.length,
      total: records.length
    };
  };
  
  const stats = getStats();

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg mr-4 animate-pulse">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm animate-pulse border border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gray-200 mr-4" />
                <div className="flex-1">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-red-100 rounded-full p-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-700">{t('behavior.errorLoading') || 'Gagal memuat catatan perilaku'}</h3>
        </div>
        <p className="text-red-600 mb-6 pl-11">{error}</p>
        <div className="flex justify-end">
          <button
            onClick={handleRetry}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <RefreshCcw className="h-4 w-4 mr-2 animate-spin-slow" />
            {t('actions.retry') || 'Coba Lagi'}
          </button>
        </div>
      </div>
    );
  }

  // Main content render
  return (
    <div className="space-y-6">
      {/* Header with animation */}
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-lg mr-4">
          <Award className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {t('behavior.title') || 'Behavior Records'}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('behavior.subtitle') || 'Track and manage student behavior patterns'}
          </p>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-50 rounded-lg mr-4">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{t('behavior.stats.total') || 'Total Records'}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100 hover:shadow transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg mr-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{t('behavior.stats.positive') || 'Positive'}</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{stats.positive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 hover:shadow transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{t('behavior.stats.thisMonth') || 'This Month'}</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 hover:shadow transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 rounded-lg mr-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{t('behavior.stats.needsAttention') || 'Needs Attention'}</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.needsAttention}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('behavior.search') || 'Search records...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              {(['all', 'attendance', 'discipline', 'participation', 'social'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {category === 'all' 
                    ? t('behavior.all') || 'All'
                    : t(`behavior.category.${category}`) || category}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('behavior.newRecord') || 'New Record'}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Records List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-20 w-20 text-gray-400 mb-4">
                <AlertCircle className="h-full w-full" />
              </div>
              <p className="text-gray-500 font-medium mb-4">
                {t('behavior.noRecordsFound') || 'No records found'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('behavior.addFirstRecord') || 'Add First Record'}
              </button>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const catConfig = categoryConfig[record.category as BehaviorCategory];
              const sevConfig = severityConfig[record.severity as SeverityType];
              
              return (
                <div key={record.id} className="group hover:bg-gray-50 transition-colors duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn("p-2 rounded-lg", catConfig.bgColor)}>
                          <catConfig.icon className={cn("h-5 w-5", catConfig.textColor)} />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {format(new Date(record.date), 'PPP')}
                            </span>
                            <span className={cn("ml-2 text-xs px-2 py-0.5 rounded-full font-medium", catConfig.bgColor, catConfig.textColor)}>
                              {t(`behavior.category.${record.category}`) || record.category}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{record.description}</p>
                        </div>
                      </div>
                      
                      <div className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center',
                        sevConfig.bgColor,
                        sevConfig.textColor,
                        `border ${sevConfig.borderColor}`
                      )}>
                        <sevConfig.icon className="h-4 w-4 mr-1.5" />
                        {t(`behavior.severity.${record.severity}`) || record.severity}
                      </div>
                    </div>
                    
                    {record.actionTaken && (
                      <div className="mt-4 pl-11">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-700">{t('behavior.actionTaken') || 'Action:'}:</span> {record.actionTaken}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 pl-11 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {t('behavior.reportedBy') || 'Reported by'}: {record.reporter?.name || 'System'}
                      </p>
                      
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                        {t('behavior.viewDetails') || 'View Details'}
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Enhanced Create Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  {t('behavior.createNewRecord') || 'Create New Record'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateRecord} className="p-6 space-y-5">
              {/* Student Selection */}
              {!studentId && (
                <div className="space-y-1">
                  <label htmlFor="student-select" className="block text-sm font-medium text-gray-700">
                    {t('behavior.selectStudent') || 'Select Student'}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="student-select"
                      value={newRecord.studentId}
                      onChange={handleStudentChange}
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">{t('behavior.selectStudentPrompt') || 'Select a student...'}</option>
                      {loadingStudents ? (
                        <option disabled>{t('common.loading') || 'Loading...'}</option>
                      ) : (
                        students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name} - {student.tingkat || student.grade} {student.kelas || student.class}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('behavior.category.label') || 'Category'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['attendance', 'discipline', 'participation', 'social'] as const).map((category) => {
                    const config = categoryConfig[category];
                    return (
                      <div 
                        key={category}
                        onClick={() => setNewRecord({ ...newRecord, category })}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer flex items-center transition-all",
                          newRecord.category === category 
                            ? `${config.borderColor} ${config.bgColor} shadow-sm` 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className={cn("p-2 rounded-lg mr-3", config.bgColor)}>
                          <config.icon className={cn("h-4 w-4", config.textColor)} />
                        </div>
                        <span className="text-sm font-medium">
                          {t(`behavior.category.${category}`) || category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('behavior.severity.label') || 'Severity'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['positive', 'neutral', 'minor', 'major'] as const).map((severity) => {
                    const config = severityConfig[severity];
                    return (
                      <div 
                        key={severity}
                        onClick={() => setNewRecord({ ...newRecord, severity })}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer flex items-center transition-all",
                          newRecord.severity === severity 
                            ? `${config.borderColor} ${config.bgColor} shadow-sm` 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className={cn("p-2 rounded-lg mr-3", config.bgColor)}>
                          <config.icon className={cn("h-4 w-4", config.textColor)} />
                        </div>
                        <span className="text-sm font-medium">
                          {t(`behavior.severity.${severity}`) || severity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('behavior.description') || 'Description'}
                </label>
                <textarea
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('behavior.descriptionPlaceholder') || 'Describe the behavior...'}
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('behavior.actionTaken') || 'Action Taken'} 
                  <span className="text-gray-400 text-xs ml-1">
                    ({t('common.optional') || 'Optional'})
                  </span>
                </label>
                <textarea
                  value={newRecord.actionTaken || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, actionTaken: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('behavior.actionTakenPlaceholder') || 'Describe any actions taken...'}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newRecord.description.trim()}
                  className={cn(
                    "px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white",
                    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                    "transition-all duration-200",
                    (isSubmitting || !newRecord.description.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('common.saving') || 'Saving...'}
                    </span>
                  ) : (
                    t('common.save') || 'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}