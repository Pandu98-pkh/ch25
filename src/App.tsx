import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { PHQ9MachineLearningProvider } from './components/PHQ9MachineLearningProvider';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Lazy load route components
const StudentsPage = lazy(() => import('./components/StudentsPage'));
const ClassesPage = lazy(() => import('./components/ClassesPage'));
const ClassDetail = lazy(() => import('./components/ClassDetail'));
const StudentDetail = lazy(() => import('./components/StudentDetail'));
const SessionsPage = lazy(() => import('./components/SessionsPage'));
const MentalHealthPage = lazy(() => import('./components/MentalHealthPage'));
const PHQ9TestPage = lazy(() => import('./components/PHQ9TestPage'));
const GAD7TestPage = lazy(() => import('./components/GAD7TestPage'));
const BehaviorPage = lazy(() => import('./components/BehaviorPage'));
const CareerPage = lazy(() => import('./components/CareerPage'));
const CoursePage = lazy(() => import('./components/CoursePage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const DASS21TestPage = lazy(() => import('./components/DASS21TestPage'));
const UserManagementPage = lazy(() => import('./components/UserManagementPage'));
const DeletedStudentsManagement = lazy(() => import('./components/DeletedStudentsManagement'));
const DeletedClassesManagement = lazy(() => import('./components/DeletedClassesManagement'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const UserManualPage = lazy(() => import('./components/UserManualPage'));
const FlowchartPage = lazy(() => import('./components/FlowchartPage'));

// Component to require authentication
function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Component to require admin authentication
function RequireAdminAuth({ children }: { children: JSX.Element }) {
  const { isAdmin } = useUser();

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

// Temporary StudentReports component until import issue is resolved
function StudentReportsTemp() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Reports</h1>
      <p className="text-gray-600 mb-6">View and download your academic and counseling reports.</p>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p>Your reports will appear here.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <PHQ9MachineLearningProvider>
        <AssessmentProvider>
          <UserProvider>
            <NotificationProvider>
              <Router>
                <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                  <Routes>
                    {/* Landing page as the main entry point */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    {/* Authenticated routes under /app */}
                    <Route
                      path="/app"
                      element={
                        <RequireAuth>
                          <Layout />
                        </RequireAuth>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="classes" element={<ClassesPage />} />
                      <Route 
                        path="classes/deleted" 
                        element={
                          <RequireAdminAuth>
                            <DeletedClassesManagement />
                          </RequireAdminAuth>
                        } 
                      />
                      <Route path="classes/:id/students" element={<ClassDetail />} />
                      <Route path="students" element={<StudentsPage />} />
                      <Route 
                        path="students/deleted" 
                        element={
                          <RequireAdminAuth>
                            <DeletedStudentsManagement />
                          </RequireAdminAuth>
                        } 
                      />
                      <Route path="students/:id" element={<StudentDetail />} />
                      <Route path="sessions" element={<SessionsPage />} />
                      <Route path="sessions/student/:id" element={<SessionsPage />} />
                      <Route path="mental-health" element={<MentalHealthPage />} />
                      <Route path="mental-health/student/:id" element={<MentalHealthPage />} />
                      <Route path="mental-health/phq9-test" element={<PHQ9TestPage />} />
                      <Route path="mental-health/gad7-test" element={<GAD7TestPage />} />
                      <Route path="mental-health/dass21-test" element={<DASS21TestPage />} />
                      <Route path="behavior" element={<BehaviorPage />} />
                      <Route path="behavior/student/:id" element={<BehaviorPage />} />
                      <Route path="career" element={<CareerPage />} />
                      <Route path="career/student/:id" element={<CareerPage />} />
                      <Route path="career/course/:courseId" element={<CoursePage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route 
                        path="user-management" 
                        element={
                          <RequireAdminAuth>
                            <UserManagementPage />
                          </RequireAdminAuth>
                        } 
                      />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="reports" element={<StudentReportsTemp />} />
                      <Route path="user-manual" element={<UserManualPage />} />
                      <Route path="flowchart" element={<FlowchartPage />} />
                    </Route>
                  </Routes>
                </Suspense>
              </Router>
            </NotificationProvider>
          </UserProvider>
        </AssessmentProvider>
      </PHQ9MachineLearningProvider>
    </LanguageProvider>
  );
}

export default App;