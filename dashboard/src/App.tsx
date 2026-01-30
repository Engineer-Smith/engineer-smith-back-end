import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import AppNavbar from "./components/navbar/Navbar";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ✅ CORRECTED: Import the proper components
import QuestionBankPage from './pages/QuestionBankPage';
import SkillQuestionsPage from './pages/SkillQuestionsPage';
import EditQuestionPage from './pages/EditQuestionPage';
import ViewQuestionPage from './pages/ViewQuestionPage';
import QuestionFormComponent from './components/QuestionFormComponent';
import TestManagementPage from './pages/TestManagementPage';
import CreateTestPage from './pages/CreateTestPage';
import FeaturesPage from './pages/FeaturesPage';
import LanguagesPage from './pages/LanguagesPage';
import ForOrganizationsPage from './pages/ForOrganizationsPage';
import ForIndividualsPage from './pages/ForIndividualsPage';

// ✅ NEW: Import test-related components
import TestPreviewPage from './pages/TestPreviewPage';
import EditTestPage from './pages/admin/EditTestPage';
import ViewTestPage from './pages/admin/ViewTestPage';

// Admin pages
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import OrganizationsPage from './pages/admin/OrganizationsPage';
import AddOrganizationPage from './pages/admin/AddOrganizationPage';
import SystemHealthPage from './pages/admin/SystemHealthPage';
import ImportQuestionsPage from './pages/admin/ImportQuestionsPage';
import GlobalContentPage from './pages/admin/GlobalContentPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import EditUserPage from './pages/admin/EditUserPage';
import AddUserPage from './pages/admin/AddUserPage';
import AttemptHistoryPage from './pages/admin/AttemptHistoryPage';

// User pages
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Marketing pages - disabled until backend integration
// import ContactPage from './pages/ContactPage';
// import DemoPage from './pages/DemoPage';

// ✅ NEW: Import student test flow components
import TestDetailsPage from './pages/TestDetailsPage';
import TestSessionPage from './pages/TestSessionPage';
import { TestSessionProvider } from './context/TestSessionContext';
import TestResultsPage from './pages/TestResultsPage';
import ResultDetailsPage from './pages/ResultDetailsPage';
import AvailableTestsPage from './pages/AvailableTestsPage';
import { SocketProvider } from './context/SocketContext';
import LiveSessionMonitor from './pages/LiveSessionMonitor';
import TestResultsDashboard from './pages/TestResultsDashboard';
import UserManagementPage from './pages/UserManagement';
import UserDetailsPage from './pages/UserDetails';
import { NotificationProvider } from './context/NotificationContext';
import PendingRequests from './pages/PendingRequests';
import GrantAttemptsPage from './pages/GrantAttemptsPage';
import { CodeChallengeProvider } from './context/CodeChallengeContext';

// Code Lab Pages
import {
  CodeLabPage,
  TrackDetailPage,
  ChallengeSolverPage,
  CodeLabDashboard,
  TrackManagementPage,
  ChallengeManagementPage,
  ChallengeEditorPage,
  AdminTrackDetailPage,
  ImportChallengesPage
} from './pages/code-challenges';

// Placeholder components for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
    <div className="card p-8 text-center max-w-md">
      <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-amber-500/10 flex items-center justify-center">
        <span className="text-4xl">🔨</span>
      </div>
      <h2 className="font-mono text-2xl font-bold mb-3">{title}</h2>
      <p className="text-[#a1a1aa] mb-6">This page is under construction and will be available soon.</p>
      <button
        className="btn-primary"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  </div>
);

// ✅ NEW: PublicRoute - Redirects authenticated users away from auth pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and trying to access auth pages, redirect them to appropriate dashboard
  if (isAuthenticated && ['/login', '/register'].includes(location.pathname)) {
    const defaultRoute = user?.role === 'admin' || user?.role === 'instructor'
      ? '/admin'
      : '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

// ✅ UPDATED: ProtectedRoute - Enhanced to remember where user was trying to go
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate
      to="/login"
      state={{ from: location }}
      replace
    />
  );
};

// ✅ NEW: SmartDashboardRoute - Redirects to role-appropriate dashboard
const SmartDashboardRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Redirect based on user role
  switch (user?.role) {
    case 'admin':
    case 'instructor':
      return <Navigate to="/admin" replace />;
    case 'student':
    default:
      return <Navigate to="/student-dashboard" replace />;
  }
};

// ✅ UPDATED: AdminRoute - Enhanced with better role checking
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// StudentRoute component - only allows students
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (user?.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ✅ UPDATED: SSO Callback component - Uses smart dashboard route
const SSOCallback = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'true') {
      // SSO successful, navigate to smart dashboard route
      navigate('/dashboard', { replace: true });
    } else if (error) {
      // SSO failed, navigate to login with error parameter
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
    } else {
      // No success or error parameter, redirect to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mb-4 mx-auto" />
        <p className="text-[#a1a1aa]">Processing SSO authentication...</p>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <div className="pt-16">
      <Routes>
        {/* Public Routes with Smart Redirects */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
        <Route path="/auth/callback" element={<SSOCallback />} />

        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/languages" element={<LanguagesPage />} />
        <Route path="/for-organizations" element={<ForOrganizationsPage />} />
        <Route path="/for-individuals" element={<ForIndividualsPage />} />
        {/* Disabled until backend integration */}
        {/* <Route path="/contact" element={<ContactPage />} /> */}
        {/* <Route path="/demo" element={<DemoPage />} /> */}

        {/* ✅ NEW: Smart Dashboard Route - Redirects based on role */}
        <Route path="/dashboard" element={<SmartDashboardRoute />} />

        {/* ✅ NEW: Specific Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <StudentRoute>
              <Dashboard />
            </StudentRoute>
          }
        />

        {/* ✅ UPDATED: Student Test Flow Routes - All use StudentRoute */}
        <Route
          path="/test-details/:testId"
          element={
            <StudentRoute>
              <TestDetailsPage />
            </StudentRoute>
          }
        />
        <Route
          path="/test-session/:testId"
          element={
            <StudentRoute>
              <TestSessionPage />
            </StudentRoute>
          }
        />
        <Route
          path="/test-results/:sessionId"
          element={
            <StudentRoute>
              <PlaceholderPage title="Test Results Summary" />
            </StudentRoute>
          }
        />

        {/* ✅ UPDATED: Student Routes - Use StudentRoute guard */}
        <Route
          path="/tests"
          element={
            <StudentRoute>
              <AvailableTestsPage />
            </StudentRoute>
          }
        />
        <Route
          path="/results"
          element={
            <StudentRoute>
              <TestResultsPage />
            </StudentRoute>
          }
        />
        <Route
          path="/result-details/:resultId"
          element={
            <StudentRoute>
              <ResultDetailsPage />
            </StudentRoute>
          }
        />

        {/* Code Lab Student Routes */}
        <Route
          path="/code-lab"
          element={
            <ProtectedRoute>
              <CodeLabPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/code-lab/:language/:trackSlug"
          element={
            <ProtectedRoute>
              <TrackDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/code-lab/:language/:trackSlug/:challengeId"
          element={
            <ProtectedRoute>
              <ChallengeSolverPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Management Routes - All use AdminRoute */}
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/users/:userId'
          element={
            <AdminRoute>
              <UserDetailsPage />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/users/:userId/edit'
          element={
            <AdminRoute>
              <EditUserPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/new"
          element={
            <AdminRoute>
              <AddUserPage />
            </AdminRoute>
          }
        />

        {/* ✅ CORRECTED: Question Bank Routes */}
        <Route
          path="/admin/question-bank"
          element={
            <AdminRoute>
              <QuestionBankPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/question-bank/add"
          element={
            <AdminRoute>
              <QuestionFormComponent />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/question-bank/edit/:questionId"
          element={
            <AdminRoute>
              <EditQuestionPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/question-bank/view/:questionId"
          element={
            <AdminRoute>
              <ViewQuestionPage />
            </AdminRoute>
          }
        />
        {/* ✅ IMPORTANT: This must come AFTER the specific routes above */}
        <Route
          path="/admin/question-bank/:skillName"
          element={
            <AdminRoute>
              <SkillQuestionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/question-bank/import"
          element={
            <AdminRoute>
              <ImportQuestionsPage />
            </AdminRoute>
          }
        />

        {/* ✅ UPDATED: Test Management Routes */}
        <Route
          path="/admin/tests"
          element={
            <AdminRoute>
              <TestManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tests/new"
          element={
            <AdminRoute>
              <CreateTestPage />
            </AdminRoute>
          }
        />
        {/* ✅ NEW: Test-specific routes - ORDER MATTERS! Put specific routes first */}
        <Route
          path="/admin/tests/preview/:testId"
          element={
            <AdminRoute>
              <TestPreviewPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tests/edit/:testId"
          element={
            <AdminRoute>
              <EditTestPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tests/view/:testId"
          element={
            <AdminRoute>
              <ViewTestPage />
            </AdminRoute>
          }
        />

        {/* Other Admin Routes */}
        <Route
          path="/admin/sessions/active"
          element={
            <AdminRoute>
              <LiveSessionMonitor />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/results"
          element={
            <AdminRoute>
              <TestResultsDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AnalyticsDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/organizations"
          element={
            <AdminRoute>
              <OrganizationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/organizations/new"
          element={
            <AdminRoute>
              <AddOrganizationPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/global-content"
          element={
            <AdminRoute>
              <GlobalContentPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/system-health"
          element={
            <AdminRoute>
              <SystemHealthPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettingsPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/attempt-requests"
          element={
            <AdminRoute>
              <PendingRequests />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/grant-attempts"
          element={
            <AdminRoute>
              <GrantAttemptsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/attempt-history"
          element={
            <AdminRoute>
              <AttemptHistoryPage />
            </AdminRoute>
          }
        />

        {/* Admin Code Lab Routes */}
        <Route
          path="/admin/code-lab"
          element={
            <AdminRoute>
              <CodeLabDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/code-lab/tracks"
          element={
            <AdminRoute>
              <TrackManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/code-lab/tracks/:language/:trackSlug"
          element={
            <AdminRoute>
              <AdminTrackDetailPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/code-lab/challenges"
          element={
            <AdminRoute>
              <ChallengeManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/code-lab/challenges/new"
          element={
            <AdminRoute>
              <ChallengeEditorPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/code-lab/challenges/import"
          element={
            <AdminRoute>
              <ImportChallengesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/code-lab/challenges/:challengeId/edit"
          element={
            <AdminRoute>
              <ChallengeEditorPage />
            </AdminRoute>
          }
        />

        {/* ✅ UPDATED: Profile/Settings - Use ProtectedRoute for all roles */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes for backward compatibility */}
        <Route
          path="/questions"
          element={<Navigate to="/admin/question-bank" replace />}
        />
        <Route
          path="/users"
          element={<Navigate to="/admin/users" replace />}
        />
        <Route
          path="/analytics"
          element={<Navigate to="/admin/analytics" replace />}
        />

        {/* Catch all route - redirect to dashboard if authenticated, otherwise to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <TestSessionProvider>
              <CodeChallengeProvider>
                <div>
                  <AppNavbar />
                  <AppRoutes />
                </div>
              </CodeChallengeProvider>
            </TestSessionProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;