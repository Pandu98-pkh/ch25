import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, Search, Plus, Filter, Download, BarChart3, User, ArrowUp, ArrowDown, X, ChevronDown, FileText, Bell, BarChart, Eye, Pencil, Trash2, Calendar, List, ArrowLeft, ArrowRight, BookOpen, Activity, Brain, Briefcase, Users } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, addDays, isFuture, startOfWeek, endOfWeek, eachDayOfInterval, getDate, isSameDay, isSameMonth, subDays, addMonths, subMonths, setHours } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { CounselingSession } from '../types';
import { getSessions, createSession, deleteSession } from '../services/sessionService';
import SessionCharts from './analytics/SessionCharts';
import StudentQuickView from './students/StudentQuickView';
import NotificationCenter from './notifications/NotificationCenter';
import { generateSessionReport } from '../utils/reportGenerator';

const sessionTypeColors = {
  academic: 'bg-blue-50 text-blue-700 border-blue-200',
  behavioral: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'mental-health': 'bg-purple-50 text-purple-700 border-purple-200',
  career: 'bg-green-50 text-green-700 border-green-200',
  social: 'bg-pink-50 text-pink-700 border-pink-200',
};

const outcomeColors = {
  positive: 'text-green-700',
  neutral: 'text-gray-600',
  negative: 'text-red-700',
};

interface SessionsPageProps {
  studentId?: string;
}

type SortField = 'date' | 'duration' | 'type';
type SortDirection = 'asc' | 'desc';

export default function SessionsPage({ studentId }: SessionsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedType, setSelectedType] = useState<CounselingSession['type'] | ''>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'date',
    direction: 'desc',
  });

  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showStudentInfo, setShowStudentInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSessions();
      const filteredSessions = studentId
        ? response.data.filter((session) => session.studentId === studentId)
        : response.data;
      setSessions(filteredSessions);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const upcomingSessions = sessions.filter((session) => {
      const sessionDate = parseISO(session.date);
      return isFuture(sessionDate) && isBefore(sessionDate, addDays(new Date(), 7));
    });

    setNotifications(
      upcomingSessions.map((session) => ({
        id: session.id,
        type: 'upcoming',
        title: `Upcoming ${session.type} session`,
        message: `Session scheduled for ${format(parseISO(session.date), 'PPP')} at ${format(parseISO(session.date), 'p')}`,
        date: session.date,
        read: false,
      }))
    );
  }, [sessions]);

  const handleCreateSession = async (newSession: Omit<CounselingSession, 'id'>) => {
    try {
      const response = await createSession(newSession);
      setSessions(prev => [...prev, response.data]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const confirmDelete = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const handleSort = (field: SortField) => {
    setSortConfig((prevConfig) => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const exportSessionsAsCsv = () => {
    const headers = ['Date', 'Type', 'Duration', 'Notes', 'Outcome', 'Next Steps', 'Counselor'];
    const csvRows = [
      headers.join(','),
      ...filteredAndSortedSessions.map((session) =>
        [
          session.date,
          session.type,
          session.duration,
          `"${session.notes.replace(/"/g, '""')}"`,
          session.outcome,
          `"${session.nextSteps?.replace(/"/g, '""') || ''}"`,
          session.counselor?.name,
        ].join(',')
      ),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `counseling_sessions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedSessions = useMemo(() => {
    let filteredSessions = sessions;

    filteredSessions = filteredSessions.filter(
      (session) =>
        session.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.nextSteps?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.counselor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedType) {
      filteredSessions = filteredSessions.filter((session) => session.type === selectedType);
    }

    filteredSessions = filteredSessions.filter((session) => {
      const sessionDate = parseISO(session.date);
      return (
        (!dateRange.start || isAfter(sessionDate, parseISO(dateRange.start)) || session.date === dateRange.start) &&
        (!dateRange.end || isBefore(sessionDate, parseISO(dateRange.end)) || session.date === dateRange.end)
      );
    });

    return [...filteredSessions].sort((a, b) => {
      if (sortConfig.field === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortConfig.field === 'duration') {
        return sortConfig.direction === 'asc' ? a.duration - b.duration : b.duration - a.duration;
      } else if (sortConfig.field === 'type') {
        return sortConfig.direction === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
      }
      return 0;
    });
  }, [sessions, searchTerm, selectedType, dateRange, sortConfig]);

  const handleGenerateReport = useCallback(() => {
    generateSessionReport(filteredAndSortedSessions);
  }, [filteredAndSortedSessions]);

  const handleViewStudentInfo = (id: string) => {
    setSelectedStudentId(id);
    setShowStudentInfo(true);
  };

  const handleViewSessionDetails = (session: CounselingSession) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const handleEditSession = (session: CounselingSession) => {
    setSelectedSession(session);
    setShowEditModal(true);
  };

  const handleUpdateSession = async (updatedSession: Omit<CounselingSession, 'id'>) => {
    try {
      if (!selectedSession) return;

      const completeUpdatedSession = {
        ...updatedSession,
        id: selectedSession.id
      };

      console.log('Updating session:', completeUpdatedSession);

      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === selectedSession.id 
            ? completeUpdatedSession 
            : session
        )
      );

      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const analytics = useMemo(() => {
    const types = filteredAndSortedSessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const outcomes = filteredAndSortedSessions.reduce((acc, session) => {
      acc[session.outcome] = (acc[session.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSessions = filteredAndSortedSessions.length;
    const totalDuration = filteredAndSortedSessions.reduce((acc, session) => acc + (Number(session.duration) || 0), 0);

    return { types, outcomes, totalSessions, totalDuration };
  }, [filteredAndSortedSessions]);

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, CounselingSession[]> = {};
    
    filteredAndSortedSessions.forEach(session => {
      const dateKey = format(parseISO(session.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });
    
    return grouped;
  }, [filteredAndSortedSessions]);

  const goToPrevious = () => {
    setCurrentDate(prev => {
      if (calendarView === 'day') {
        return subDays(prev, 1);
      } else if (calendarView === 'week') {
        return subDays(prev, 7);
      } else {
        return subMonths(prev, 1);
      }
    });
  };

  const goToNext = () => {
    setCurrentDate(prev => {
      if (calendarView === 'day') {
        return addDays(prev, 1);
      } else if (calendarView === 'week') {
        return addDays(prev, 7);
      } else {
        return addMonths(prev, 1);
      }
    });
  };

  const goToCurrent = () => {
    setCurrentDate(new Date());
  };

  const calendarDaysToShow = useMemo(() => {
    if (calendarView === 'day') {
      return [currentDate];
    } else if (calendarView === 'week') {
      const weekStart = startOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
  }, [currentDate, calendarView]);

  const calendarTitle = useMemo(() => {
    if (calendarView === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    } else if (calendarView === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  }, [currentDate, calendarView]);

  const dayViewHours = useMemo(() => {
    const hours = [];
    for (let i = 7; i <= 17; i++) {
      hours.push(setHours(currentDate, i));
    }
    return hours;
  }, [currentDate]);

  const getSessionsForDay = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return (sessionsByDate[dateStr] || []).sort((a, b) => {
      return parseISO(a.date).getTime() - parseISO(b.date).getTime();
    });
  }, [sessionsByDate]);

  const dayViewSessions = useMemo(() => {
    if (calendarView !== 'day') return [];
    
    const dayStart = setHours(currentDate, 7); // 7:00 AM
    const dayEnd = setHours(currentDate, 17); // 5:00 PM
    const totalMinutes = (dayEnd.getTime() - dayStart.getTime()) / 60000;
    
    return getSessionsForDay(currentDate).map(session => {
      const sessionDate = parseISO(session.date);
      const sessionStartMinutes = (sessionDate.getTime() - dayStart.getTime()) / 60000;
      
      // Calculate position and height
      const topPercent = Math.max(0, (sessionStartMinutes / totalMinutes) * 100);
      const heightPercent = Math.min(
        100 - topPercent, 
        (session.duration / totalMinutes) * 100
      );
      
      return {
        ...session,
        topPercent,
        heightPercent
      };
    });
  }, [calendarView, currentDate, getSessionsForDay]);

  const openCreateSessionModal = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Opening create session modal');
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-8">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="text-white mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold">Counseling Sessions</h1>
              <p className="mt-1 text-indigo-100 text-sm md:text-base max-w-2xl">
                Manage and track all student counseling sessions, schedule appointments, and view analytics
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center px-3 py-2 border border-indigo-400 rounded-lg text-sm font-medium text-white bg-indigo-700/50 hover:bg-indigo-700/70 transition-colors shadow-md"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-indigo-600">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="inline-flex items-center px-3 py-2 border border-indigo-400 rounded-lg text-sm font-medium text-white bg-indigo-700/50 hover:bg-indigo-700/70 transition-colors shadow-md"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
              <button
                onClick={handleGenerateReport}
                className="inline-flex items-center px-3 py-2 border border-indigo-400 rounded-lg text-sm font-medium text-white bg-indigo-700/50 hover:bg-indigo-700/70 transition-colors shadow-md"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="mb-8">
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={(id) => {
              setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
            }}
            onClose={() => setShowNotifications(false)}
          />
        </div>
      )}

      {showStudentInfo && selectedStudentId && (
        <div className="mb-8">
          <StudentQuickView studentId={selectedStudentId} onClose={() => setShowStudentInfo(false)} />
        </div>
      )}

      {showAnalytics && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Analytics Dashboard</h3>
            <button
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              className="text-sm text-brand-600 hover:text-brand-800 flex items-center"
            >
              <BarChart className="h-4 w-4 mr-1" />
              {showAdvancedAnalytics ? 'Show Basic Analytics' : 'Show Advanced Analytics'}
            </button>
          </div>

          {!showAdvancedAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Sessions</p>
                    <p className="text-2xl font-semibold">{analytics.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Duration</p>
                    <p className="text-2xl font-semibold">{analytics.totalDuration} minutes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">By Type</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.types).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sessionTypeColors[type as CounselingSession['type']]}`}
                      >
                        {type === 'academic' ? 'Academic' : 
                         type === 'behavioral' ? 'Behavioral' : 
                         type === 'mental-health' ? 'Mental Health' : 
                         type === 'career' ? 'Career' : 'Social'}
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">By Outcome</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.outcomes).map(([outcome, count]) => (
                    <div key={outcome} className="flex items-center justify-between">
                      <span className={`font-medium ${outcomeColors[outcome as keyof typeof outcomeColors]}`}>
                        {outcome === 'positive' ? 'Positive' : 
                         outcome === 'neutral' ? 'Neutral' : 'Negative'}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div ref={chartRef} className="bg-white p-6 rounded-lg shadow">
              <SessionCharts sessions={filteredAndSortedSessions} />
            </div>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filter
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">Filter Options</h3>
                  <button onClick={() => setShowFilterMenu(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as CounselingSession['type'] | '')}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    >
                      <option value="">All Types</option>
                      <option value="academic">Academic</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="mental-health">Mental Health</option>
                      <option value="career">Career</option>
                      <option value="social">Social</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      onClick={() => {
                        setSelectedType('');
                        setDateRange({
                          start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                          end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                        });
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {viewMode === 'list' ? (
              <>
                <Calendar className="h-5 w-5 mr-2" />
                Calendar View
              </>
            ) : (
              <>
                <List className="h-5 w-5 mr-2" />
                List View
              </>
            )}
          </button>

          <button
            onClick={exportSessionsAsCsv}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>

          <button
            onClick={openCreateSessionModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Schedule Session
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      <span className="group-hover:text-brand-600 transition-colors">Date</span>
                      {sortConfig.field === 'date' && (
                        <span className="ml-1 bg-brand-100 rounded-full p-0.5 group-hover:bg-brand-200 transition-colors">
                          {sortConfig.direction === 'asc' 
                            ? <ArrowUp className="h-3 w-3 text-brand-600" /> 
                            : <ArrowDown className="h-3 w-3 text-brand-600" />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      <span className="group-hover:text-brand-600 transition-colors">Type</span>
                      {sortConfig.field === 'type' && (
                        <span className="ml-1 bg-brand-100 rounded-full p-0.5 group-hover:bg-brand-200 transition-colors">
                          {sortConfig.direction === 'asc' 
                            ? <ArrowUp className="h-3 w-3 text-brand-600" /> 
                            : <ArrowDown className="h-3 w-3 text-brand-600" />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer group"
                    onClick={() => handleSort('duration')}
                  >
                    <div className="flex items-center">
                      <span className="group-hover:text-brand-600 transition-colors">Duration</span>
                      {sortConfig.field === 'duration' && (
                        <span className="ml-1 bg-brand-100 rounded-full p-0.5 group-hover:bg-brand-200 transition-colors">
                          {sortConfig.direction === 'asc' 
                            ? <ArrowUp className="h-3 w-3 text-brand-600" /> 
                            : <ArrowDown className="h-3 w-3 text-brand-600" />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedSessions.map((session, index) => (
                  <tr 
                    key={session.id} 
                    className={`hover:bg-indigo-50/30 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">ID: {session.studentId}</span>
                            <button
                              onClick={() => handleViewStudentInfo(session.studentId)}
                              className="ml-2 text-xs text-brand-600 hover:text-brand-800 font-medium hover:underline"
                            >
                              View Info
                            </button>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1 text-gray-400" />
                              {session.counselor?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start">
                        <div className="text-sm font-medium text-gray-900 flex items-center mb-1 rounded-md bg-blue-50 px-2 py-1 border border-blue-100">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                          {format(parseISO(session.date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          {format(parseISO(session.date), 'h:mm a')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${sessionTypeColors[session.type as CounselingSession['type']]}`}
                      >
                        {session.type === 'academic' && <BookOpen className="h-3.5 w-3.5 mr-1" />}
                        {session.type === 'behavioral' && <Activity className="h-3.5 w-3.5 mr-1" />}
                        {session.type === 'mental-health' && <Brain className="h-3.5 w-3.5 mr-1" />}
                        {session.type === 'career' && <Briefcase className="h-3.5 w-3.5 mr-1" />}
                        {session.type === 'social' && <Users className="h-3.5 w-3.5 mr-1" />}
                        {session.type === 'academic'
                          ? 'Academic'
                          : session.type === 'behavioral'
                          ? 'Behavioral'
                          : session.type === 'mental-health'
                          ? 'Mental Health'
                          : session.type === 'career'
                          ? 'Career'
                          : 'Social'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex items-center justify-center rounded-md bg-indigo-50 mr-2">
                          <Clock className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{session.duration} <span className="text-gray-500 font-normal">minutes</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-xs bg-gray-50 p-2 rounded-md border border-gray-100 shadow-inner">
                        {session.notes}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center w-fit ${
                        session.outcome === 'positive' ? 'bg-green-100 text-green-800 border border-green-200' : 
                        session.outcome === 'neutral' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {session.outcome === 'positive' && 
                          <svg className="h-3.5 w-3.5 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        }
                        {session.outcome === 'negative' && 
                          <svg className="h-3.5 w-3.5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        }
                        {session.outcome === 'neutral' && 
                          <svg className="h-3.5 w-3.5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                          </svg>
                        }
                        {session.outcome === 'positive' ? 'Positive' : session.outcome === 'neutral' ? 'Neutral' : 'Negative'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-1 justify-end">
                        <button
                          onClick={() => handleViewSessionDetails(session)}
                          className="text-brand-600 hover:text-brand-900 p-1.5 rounded-full hover:bg-brand-50 transition-colors"
                          title="View Details"
                          aria-label="View session details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleEditSession(session)}
                          className="text-gray-600 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                          title="Edit"
                          aria-label="Edit session"
                        >
                          <Pencil className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(session.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete"
                          aria-label="Delete session"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredAndSortedSessions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center">
                      <div className="text-gray-500 flex flex-col items-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-4 w-24 h-24 flex items-center justify-center border border-gray-100 shadow-inner">
                          <CalendarIcon className="h-12 w-12 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-600 mb-1">No Sessions Found</p>
                        <p className="text-sm text-gray-500 mb-6 max-w-md">
                          No counseling sessions match your current filters. Try adjusting your filters or create a new session.
                        </p>
                        <button
                          onClick={openCreateSessionModal}
                          className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Schedule Session
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-brand-600" />
                {calendarTitle}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-1 bg-white rounded-md p-1 shadow-sm border border-gray-200">
                  <button 
                    onClick={() => setCalendarView('day')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${calendarView === 'day' 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Day
                  </button>
                  <button 
                    onClick={() => setCalendarView('week')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${calendarView === 'week' 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setCalendarView('month')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${calendarView === 'month' 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Month
                  </button>
                </div>
                <div className="flex items-center space-x-1 bg-white rounded-md shadow-sm border border-gray-200">
                  <button 
                    onClick={goToPrevious}
                    className="p-2 rounded-l-md hover:bg-gray-100 transition-colors border-r border-gray-200"
                    aria-label="Previous"
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={goToCurrent}
                    className="px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-gray-100 transition-colors"
                  >
                    Today
                  </button>
                  <button 
                    onClick={goToNext}
                    className="p-2 rounded-r-md hover:bg-gray-100 transition-colors border-l border-gray-200"
                    aria-label="Next"
                  >
                    <ArrowRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {calendarView === 'day' ? (
            <div className="overflow-y-auto" style={{ height: '700px' }}>
              <div className="relative" style={{ height: '100%' }}>
                {/* Time indicators column */}
                <div className="absolute top-0 left-0 w-20 h-full border-r border-gray-200 bg-gray-50">
                  {dayViewHours.map((hour, i) => (
                    <div key={i} className="h-[80px] relative border-b border-gray-200">
                      <div className="absolute top-0 right-0 transform -translate-y-1/2 pr-2 text-xs font-medium text-gray-500 bg-gray-50 px-2">
                        {format(setHours(currentDate, 7 + i), 'h a')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Content area */}
                <div className="ml-20 h-full relative">
                  {/* Time grid lines */}
                  {dayViewHours.map((_, i) => (
                    <div key={i} className="h-[80px] border-b border-gray-200 relative">
                      <div className="absolute left-0 right-0 top-0 h-[40px] border-b border-dashed border-gray-100"></div>
                    </div>
                  ))}
                  
                  {/* Current time indicator */}
                  {isSameDay(currentDate, new Date()) && (
                    <div className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                         style={{ 
                           top: `${((new Date().getHours()-7) * 80) + ((new Date().getMinutes()/60) * 80)}px` 
                         }}>
                      <div className="w-3 h-3 rounded-full bg-red-500 absolute -left-1.5 -top-1.5"></div>
                      <div className="absolute -left-16 -top-3 bg-red-500 text-white text-xs font-medium px-1 py-0.5 rounded">
                        {format(new Date(), 'h:mm a')}
                      </div>
                    </div>
                  )}
                  
                  {/* Session blocks */}
                  {dayViewSessions.map(session => (
                    <div 
                      key={session.id}
                      onClick={() => handleViewSessionDetails(session)}
                      className={`absolute left-4 right-4 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-0.5 duration-150 overflow-hidden`}
                      style={{ 
                        top: `${session.topPercent}%`, 
                        height: `${Math.max(session.heightPercent, 3)}%`,
                        minHeight: '30px'
                      }}
                    >
                      <div className={`h-full w-full p-2 flex flex-col ${
                        session.type === 'academic' ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500' :
                        session.type === 'behavioral' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500' :
                        session.type === 'mental-health' ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500' :
                        session.type === 'career' ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500' :
                        'bg-gradient-to-r from-pink-50 to-pink-100 border-l-4 border-pink-500'
                      }`}>
                        <div className="font-medium text-sm text-gray-800 truncate flex items-center">
                          {session.type === 'academic' && <BookOpen className="h-3.5 w-3.5 mr-1 text-blue-600" />}
                          {session.type === 'behavioral' && <Activity className="h-3.5 w-3.5 mr-1 text-yellow-600" />}
                          {session.type === 'mental-health' && <Brain className="h-3.5 w-3.5 mr-1 text-purple-600" />}
                          {session.type === 'career' && <Briefcase className="h-3.5 w-3.5 mr-1 text-green-600" />}
                          {session.type === 'social' && <Users className="h-3.5 w-3.5 mr-1 text-pink-600" />}
                          {format(parseISO(session.date), 'h:mm a')} - {format(addDays(parseISO(session.date), 0).setMinutes(parseISO(session.date).getMinutes() + session.duration), 'h:mm a')}
                        </div>
                        <div className="text-xs flex items-center text-gray-600 mt-0.5">
                          <User className="h-3 w-3 mr-1 inline" /> 
                          Student ID: {session.studentId}
                        </div>
                        {session.heightPercent > 8 && (
                          <div className="text-xs mt-1 text-gray-600 overflow-hidden flex-grow line-clamp-2">
                            {session.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : calendarView === 'week' ? (
            <div className="overflow-auto">
              <div className="grid grid-cols-7 text-center bg-gradient-to-b from-gray-50 to-white">
                {calendarDaysToShow.map((day, i) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={i} className={`py-3 ${isToday ? 'bg-brand-50' : ''}`}>
                      <p className={`text-sm font-medium ${isToday ? 'text-brand-800' : 'text-gray-700'}`}>{format(day, 'EEEE')}</p>
                      <div className={`mt-1 flex justify-center items-center ${
                        isToday ? 'bg-brand-500 text-white' : 'text-gray-900'
                      } rounded-full w-8 h-8 mx-auto`}>
                        {format(day, 'd')}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{format(day, 'MMM yyyy')}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-7 divide-x divide-gray-200" style={{ minHeight: '500px' }}>
                {calendarDaysToShow.map((day, i) => {
                  const daySessionsList = getSessionsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div key={i} className={`relative ${isToday ? 'bg-brand-50/40' : ''} hover:bg-gray-50 transition-colors duration-200`}>
                      <div className="p-2 space-y-2">
                        {daySessionsList.map(session => (
                          <div 
                            key={session.id}
                            onClick={() => handleViewSessionDetails(session)}
                            className={`rounded-md shadow-sm border-l-[3px] cursor-pointer hover:shadow-md transition-all ${
                              session.type === 'academic' ? 'border-blue-500 bg-blue-50/70' :
                              session.type === 'behavioral' ? 'border-yellow-500 bg-yellow-50/70' :
                              session.type === 'mental-health' ? 'border-purple-500 bg-purple-50/70' :
                              session.type === 'career' ? 'border-green-500 bg-green-50/70' :
                              'border-pink-500 bg-pink-50/70'
                            }`}
                          >
                            <div className="p-2">
                              <div className="flex items-center text-xs font-medium text-gray-700">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(parseISO(session.date), 'h:mm a')}
                                <span className="ml-1 text-gray-500">({session.duration} min)</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1 flex items-center">
                                {session.type === 'academic' && <BookOpen className="h-3 w-3 mr-1 text-blue-600" />}
                                {session.type === 'behavioral' && <Activity className="h-3 w-3 mr-1 text-yellow-600" />}
                                {session.type === 'mental-health' && <Brain className="h-3 w-3 mr-1 text-purple-600" />}
                                {session.type === 'career' && <Briefcase className="h-3 w-3 mr-1 text-green-600" />}
                                {session.type === 'social' && <Users className="h-3 w-3 mr-1 text-pink-600" />}
                                {session.type === 'academic' ? 'Academic' :
                                 session.type === 'behavioral' ? 'Behavioral' :
                                 session.type === 'mental-health' ? 'Mental Health' :
                                 session.type === 'career' ? 'Career' : 'Social'}
                              </div>
                              <div className="text-xs truncate text-gray-600 mt-1 flex items-center">
                                <User className="h-3 w-3 mr-1 inline" />
                                ID: {session.studentId}
                              </div>
                            </div>
                          </div>
                        ))}

                        {daySessionsList.length === 0 && (
                          <div className="h-full min-h-[50px] flex items-center justify-center">
                            <button
                              onClick={() => openCreateSessionModal()}
                              className="text-xs text-brand-600 hover:text-brand-800 flex items-center"
                            >
                              <Plus className="h-3 w-3 mr-1" /> 
                              Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-7 text-center py-3 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={i} className="py-2">
                    <span className="text-sm font-semibold text-gray-700">{day}</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-[1px] bg-gray-200">
                {calendarDaysToShow.map((day, i) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const daySessions = sessionsByDate[dateKey] || [];
                  
                  return (
                    <div 
                      key={i} 
                      className={`min-h-[120px] bg-white ${
                        isCurrentMonth ? '' : 'bg-gray-50/70'
                      } hover:bg-gray-50 transition-colors relative`}
                    >
                      {/* Date indicator */}
                      <div className="p-1 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          {isToday ? (
                            <span className="flex items-center justify-center w-7 h-7 bg-brand-600 text-white rounded-full text-sm font-medium">
                              {getDate(day)}
                            </span>
                          ) : (
                            <span className={`text-sm ${isCurrentMonth ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                              {getDate(day)}
                            </span>
                          )}
                          
                          <button
                            onClick={() => openCreateSessionModal()}
                            className="text-gray-400 hover:text-brand-600 p-0.5 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Sessions for this day */}
                      <div className="p-1 space-y-1">
                        {daySessions.map((session) => (
                          <div 
                            key={session.id}
                            onClick={() => handleViewSessionDetails(session)}
                            className={`p-1 text-xs rounded-md cursor-pointer hover:shadow-sm transition-all ${
                              session.type === 'academic' ? 'bg-blue-50 border-l-2 border-blue-500' :
                              session.type === 'behavioral' ? 'bg-yellow-50 border-l-2 border-yellow-500' :
                              session.type === 'mental-health' ? 'bg-purple-50 border-l-2 border-purple-500' :
                              session.type === 'career' ? 'bg-green-50 border-l-2 border-green-500' :
                              'bg-pink-50 border-l-2 border-pink-500'
                            }`}
                          >
                            <div className="flex items-center font-medium">
                              <Clock className="h-2.5 w-2.5 mr-1 text-gray-500" />
                              {format(parseISO(session.date), 'h:mm a')}
                            </div>
                            <div className="truncate mt-0.5">
                              {session.type === 'academic' ? 'Academic' :
                               session.type === 'behavioral' ? 'Behavioral' :
                               session.type === 'mental-health' ? 'Mental Health' :
                               session.type === 'career' ? 'Career' : 'Social'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[100] transition-all duration-300 ease-in-out">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
            style={{animation: 'modalFadeIn 0.3s ease-out'}}
          >
            <div className="relative">
              {/* Modal header with improved layout */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Schedule New Session
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <SessionForm onSubmit={handleCreateSession} onCancel={() => setShowCreateModal(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Edit Session Modal */}
      {showEditModal && selectedSession && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[100] transition-all duration-300 ease-in-out">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
            style={{animation: 'modalFadeIn 0.3s ease-out'}}
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Pencil className="h-5 w-5 mr-2" />
                  Edit Session
                </h2>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <SessionForm
                  initialData={selectedSession}
                  onSubmit={handleUpdateSession}
                  onCancel={() => setShowEditModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[100] transition-all duration-300 ease-in-out">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
            style={{animation: 'modalFadeIn 0.3s ease-out'}}
          >
            <div className="relative">
              <div className={`px-6 py-4 rounded-t-xl flex items-center justify-between ${
                selectedSession.type === 'academic' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                selectedSession.type === 'behavioral' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                selectedSession.type === 'mental-health' ? 'bg-gradient-to-r from-purple-500 to-purple-700' :
                selectedSession.type === 'career' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                'bg-gradient-to-r from-pink-500 to-rose-600'
              }`}>
                <h2 className="text-xl font-semibold text-white flex items-center">
                  {selectedSession.type === 'academic' && <BookOpen className="h-5 w-5 mr-2" />}
                  {selectedSession.type === 'behavioral' && <Activity className="h-5 w-5 mr-2" />}
                  {selectedSession.type === 'mental-health' && <Brain className="h-5 w-5 mr-2" />}
                  {selectedSession.type === 'career' && <Briefcase className="h-5 w-5 mr-2" />}
                  {selectedSession.type === 'social' && <Users className="h-5 w-5 mr-2" />}
                  Session Details
                </h2>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Student Information</h3>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">Student ID: {selectedSession.studentId}</p>
                          <p className="text-sm text-gray-500">Counselor: {selectedSession.counselor?.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Session Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Date:</span> {format(parseISO(selectedSession.date), 'PPP')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Time:</span> {format(parseISO(selectedSession.date), 'p')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm text-gray-700 mr-2">Duration:</span> 
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                            {selectedSession.duration} minutes
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm text-gray-700 mr-2">Type:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            sessionTypeColors[selectedSession.type]
                          }`}>
                            {selectedSession.type === 'academic' ? 'Academic' : 
                             selectedSession.type === 'behavioral' ? 'Behavioral' : 
                             selectedSession.type === 'mental-health' ? 'Mental Health' : 
                             selectedSession.type === 'career' ? 'Career' : 'Social'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm text-gray-700 mr-2">Outcome:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedSession.outcome === 'positive' ? 'bg-green-100 text-green-800' : 
                            selectedSession.outcome === 'neutral' ? 'bg-gray-100 text-gray-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedSession.outcome === 'positive' ? 'Positive' : 
                             selectedSession.outcome === 'neutral' ? 'Neutral' : 'Negative'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <div className="mt-2 p-4 bg-white rounded-md border border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSession.notes}</p>
                    </div>
                  </div>

                  {selectedSession.nextSteps && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Next Steps</h3>
                      <div className="mt-2 p-4 bg-white rounded-md border border-gray-100">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSession.nextSteps}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleEditSession(selectedSession);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                    >
                      <Pencil className="h-4 w-4 mr-1.5 inline" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        openCreateSessionModal();
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1.5 inline" />
                      Schedule New Session
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[100] transition-all duration-300 ease-in-out">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all"
            style={{animation: 'modalFadeIn 0.3s ease-out'}}
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <Trash2 className="h-5 w-5 mr-2" />
                  Confirm Deletion
                </h3>
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this session? This action cannot be undone and all associated data will be permanently removed.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animation for modals */}
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          
          /* Ensure body doesn't scroll when modal is open */
          body:has(.fixed.inset-0.z-\\[100\\]) {
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
}

interface SessionFormProps {
  initialData?: Partial<CounselingSession>;
  onSubmit: (session: Omit<CounselingSession, 'id'>) => void;
  onCancel: () => void;
}

function SessionForm({ initialData, onSubmit, onCancel }: SessionFormProps) {
  const initialDate = initialData?.date ? parseISO(initialData.date) : new Date();

  const initialTime = initialData?.date 
    ? format(initialDate, 'HH:mm')
    : '09:00';

  const initialDateString = initialData?.date 
    ? format(initialDate, 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState<Omit<CounselingSession, 'id'>>({
    studentId: initialData?.studentId || '',
    date: initialData?.date || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    duration: initialData?.duration || 60,
    notes: initialData?.notes || '',
    type: initialData?.type || 'academic',
    outcome: initialData?.outcome || 'neutral',
    nextSteps: initialData?.nextSteps || '',
    counselor: initialData?.counselor || {
      id: '1',
      name: 'Current User',
    },
  });

  const [dateDisplay, setDateDisplay] = useState(initialDateString);
  const [timeValue, setTimeValue] = useState(initialTime);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'time') {
      setTimeValue(value);
      updateDateTime(dateDisplay, value);
    } else if (name === 'date') {
      setDateDisplay(value);
      updateDateTime(value, timeValue);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const updateDateTime = (dateStr: string, timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      const dateParts = dateStr.split('-').map(Number);
      const year = dateParts[0];
      const month = dateParts[1] - 1;
      const day = dateParts[2];
      
      const newDateObj = new Date(year, month, day, hours, minutes, 0);
      
      const isoString = `${format(newDateObj, "yyyy-MM-dd")}T${timeStr}:00.000`;
      
      setFormData(prev => ({
        ...prev,
        date: isoString
      }));
    } catch (err) {
      console.error("Error updating date/time:", err);
    }
  };

  const handleDurationChange = (value: string) => {
    const numValue = parseInt(value, 10) || 60;
    setFormData(prev => ({
      ...prev,
      duration: numValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
            Student *
          </label>
          <div className="relative">
            <select
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              required
              className="appearance-none w-full bg-white rounded-md border border-gray-300 shadow-sm py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              <option value="">Select a student</option>
              <option value="1">Alice Johnson</option>
              <option value="2">Bob Smith</option>
              <option value="3">Carol Williams</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown className="h-5 w-5" />
            </div>
            {!formData.studentId && (
              <div className="absolute left-3 top-2.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400 mr-2" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Session Type *
          </label>
          <div className="relative">
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="appearance-none w-full bg-white rounded-md border border-gray-300 shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              <option value="academic">Academic</option>
              <option value="behavioral">Behavioral</option>
              <option value="mental-health">Mental Health</option>
              <option value="career">Career</option>
              <option value="social">Social</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown className="h-5 w-5" />
            </div>
            <div className="absolute left-3 top-2.5 flex items-center pointer-events-none">
              {formData.type === 'academic' && <BookOpen className="h-4 w-4 text-blue-500 mr-2" />}
              {formData.type === 'behavioral' && <Activity className="h-4 w-4 text-yellow-500 mr-2" />}
              {formData.type === 'mental-health' && <Brain className="h-4 w-4 text-purple-500 mr-2" />}
              {formData.type === 'career' && <Briefcase className="h-4 w-4 text-green-500 mr-2" />}
              {formData.type === 'social' && <Users className="h-4 w-4 text-pink-500 mr-2" />}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={dateDisplay}
            onChange={handleInputChange}
            required
            className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Time * (7:00 AM - 3:00 PM)
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={timeValue}
            onChange={handleInputChange}
            min="07:00"
            max="15:00"
            required
            className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          />
          {timeValue < "07:00" || timeValue > "15:00" ? (
            <p className="mt-1 text-sm text-red-600">Please select a time between 7:00 AM and 3:00 PM</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            min="15"
            max="180"
            step="15"
            required
            className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
            Outcome
          </label>
          <select
            id="outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes *
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={4}
          required
          className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          placeholder="Enter session notes here..."
        />
      </div>

      <div>
        <label htmlFor="nextSteps" className="block text-sm font-medium text-gray-700 mb-1">
          Next Steps
        </label>
        <textarea
          id="nextSteps"
          name="nextSteps"
          value={formData.nextSteps}
          onChange={handleInputChange}
          rows={2}
          className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
          placeholder="Enter next steps here..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}