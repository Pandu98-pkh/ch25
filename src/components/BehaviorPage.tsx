import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, AlertCircle, CheckCircle2, Clock, Users, X, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { BehaviorRecord } from '../types';
import { cn } from '../utils/cn';
import { getBehaviorRecords, createBehaviorRecord } from '../services/mentalHealthService';
import { toast } from '../utils/toast';
import { createAbortController } from '../services/api';

// Define the allowed category types
type BehaviorCategory = 'attendance' | 'discipline' | 'participation' | 'social';
type SeverityType = 'positive' | 'neutral' | 'minor' | 'major';

const severityColors = {
  positive: 'bg-green-50 text-green-700',
  neutral: 'bg-gray-50 text-gray-700',
  minor: 'bg-yellow-50 text-yellow-700',
  major: 'bg-red-50 text-red-700',
};

const categoryIcons = {
  attendance: Clock,
  discipline: AlertCircle,
  participation: CheckCircle2,
  social: Users,
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
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId || '');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
  // New record form state
  const [newRecord, setNewRecord] = useState<{
    category: BehaviorCategory;
    severity: SeverityType;
    description: string;
    actionTaken?: string;
  }>({
    category: 'discipline',
    severity: 'neutral',
    description: '',
    actionTaken: '',
  });

  // Load students data
  const loadStudents = useCallback(async () => {
    try {
      // Mock data - in a real app this would come from an API
      setStudents([
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Alex Johnson' },
      ]);
    } catch (err) {
      console.error('Error loading students:', err);
    }
  }, []);

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

    if (!selectedStudentId) {
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
        studentId: selectedStudentId,
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
        loadRecords();

        // Reset form
        setNewRecord({
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
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
  }, [studentId]);

  // Derived data
  const filteredRecords = records.filter((record) =>
    record.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const thisMonthRecords = records.filter(
    (record) => new Date(record.date).getMonth() === new Date().getMonth()
  );

  const needsAttention = records.filter((record) => record.severity === 'major');

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
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
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-center space-x-2 text-red-700 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">{t('behavior.errorLoading') || 'Gagal memuat catatan perilaku'}</h3>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-800 transition-colors"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          {t('actions.retry') || 'Coba Lagi'}
        </button>
      </div>
    );
  }

  // Main content render
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('behavior.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('behavior.subtitle')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-brand-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-brand-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('behavior.stats.total')}</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{records.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('behavior.stats.thisMonth')}</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{thisMonthRecords.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('behavior.stats.needsAttention')}</p>
              <p className="mt-1 text-3xl font-semibold text-red-600">{needsAttention.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('behavior.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            {t('behavior.filter')}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('behavior.newRecord')}
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredRecords.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>{t('behavior.noRecordsFound') || 'Tidak ada catatan yang ditemukan'}</p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const Icon = categoryIcons[record.category as BehaviorCategory];
              return (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(record.date), 'PPP')}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {t(`behavior.category.${record.category}`)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-medium',
                        severityColors[record.severity]
                      )}
                    >
                      {t(`behavior.severity.${record.severity}`)}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{record.description}</p>
                  {record.actionTaken && (
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="font-medium">Action taken:</span> {record.actionTaken}
                    </p>
                  )}
                  <div className="mt-4 flex space-x-4">
                    <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      {t('behavior.viewDetails')}
                    </button>
                    {record.severity === 'major' && (
                      <button className="text-sm font-medium text-red-600 hover:text-red-700">
                        {t('behavior.scheduleIntervention')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">{t('behavior.createNewRecord')}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-6 space-y-4">
              {!studentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('behavior.student')}
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">{t('behavior.selectStudent')}</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('behavior.category.label')}
                </label>
                <select
                  value={newRecord.category}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, category: e.target.value as BehaviorCategory })
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="attendance">{t('behavior.category.attendance')}</option>
                  <option value="discipline">{t('behavior.category.discipline')}</option>
                  <option value="participation">{t('behavior.category.participation')}</option>
                  <option value="social">{t('behavior.category.social')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('behavior.severity.label')}
                </label>
                <select
                  value={newRecord.severity}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, severity: e.target.value as SeverityType })
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="positive">{t('behavior.severity.positive')}</option>
                  <option value="neutral">{t('behavior.severity.neutral')}</option>
                  <option value="minor">{t('behavior.severity.minor')}</option>
                  <option value="major">{t('behavior.severity.major')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('behavior.description')}
                </label>
                <textarea
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder={t('behavior.descriptionPlaceholder')}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('behavior.actionTaken')} ({t('common.optional')})
                </label>
                <textarea
                  value={newRecord.actionTaken || ''}
                  onChange={(e) => setNewRecord({ ...newRecord, actionTaken: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder={t('behavior.actionTakenPlaceholder')}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {isSubmitting ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}