// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCodeChallenge } from '../context/CodeChallengeContext';
import apiService from '../services/ApiService';
import {
  AlertCircle,
  Activity,
  BarChart3,
  Code,
  Book,
  Target,
  Users,
  FileText,
  ClipboardList,
  Plus,
  Settings,
  Bell,
  ChevronRight
} from 'lucide-react';

import type {
  DashboardStats,
  QuickActionType,
  User,
  TestSession,
  Test,
  QuestionStatsResponse
} from '../types';
import QueueStatusCard from '../components/admin/dashboard/QueueStatusCard';

// Calculate stats function
const calculateStats = (
  users: User[],
  questionStats: QuestionStatsResponse | null,
  tests: Test[],
  sessions: TestSession[],
  currentUser: User
): DashboardStats => {
  const isSuperOrgAdmin = currentUser.organization?.isSuperOrg && currentUser.role === 'admin';

  const relevantUsers = isSuperOrgAdmin ? users : users.filter(u => u.organizationId === currentUser.organizationId);
  const relevantTests = isSuperOrgAdmin ? tests : tests.filter(t => t.organizationId === currentUser.organizationId);
  const relevantSessions = isSuperOrgAdmin ? sessions : sessions.filter(s =>
    relevantTests.some(t => t._id === s.testId)
  );

  const totalUsers = relevantUsers.length;
  const independentStudents = isSuperOrgAdmin
    ? users.filter(u => !u.organizationId || u.organizationId === null).length
    : 0;
  const orgAffiliatedUsers = isSuperOrgAdmin
    ? users.filter(u => u.organizationId && u.organizationId !== null).length
    : totalUsers;

  const totalQuestions = questionStats?.totals?.totalQuestions || 0;
  const globalQuestions = isSuperOrgAdmin ? totalQuestions : 0;
  const orgSpecificQuestions = isSuperOrgAdmin ? 0 : totalQuestions;

  const activeTests = relevantTests.filter(t => t.status === 'active').length;
  const totalTestsCount = relevantTests.length;

  const activeSessions = relevantSessions.filter(s => s.status === 'inProgress').length;
  const completedSessions = relevantSessions.filter(s => s.status === 'completed').length;

  return {
    totalUsers,
    independentStudents,
    orgAffiliatedUsers,
    globalQuestions,
    orgSpecificQuestions,
    totalQuestions,
    activeTests,
    totalTests: totalTestsCount,
    activeSessions,
    completedSessions,
    organizationsCount: 0
  };
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const {
    dashboard: codeChallengesDashboard,
    adminChallenges,
    adminTracks: _adminTracks,
    analytics: _analytics,
    loadDashboard: loadCodeChallengesDashboard,
    loadAllChallengesAdmin,
    loadAllTracksAdmin,
    loadAnalytics
  } = useCodeChallenge();
  void _adminTracks; // Suppress unused variable warning
  void _analytics; // Suppress unused variable warning

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typedUser = user as User | null;
  const isSuperOrgAdmin = Boolean(typedUser?.organization?.isSuperOrg && typedUser?.role === 'admin');

  const fetchStats = async (): Promise<void> => {
    if (!typedUser) return;

    try {
      setLoading(true);
      setError(null);

      const [users, questionStats, tests, sessions] = await Promise.all([
        apiService.getAllUsers(isSuperOrgAdmin ? {} : { orgId: typedUser.organizationId }),
        apiService.getQuestionStats(),
        apiService.getAllTests(isSuperOrgAdmin ? {} : { orgId: typedUser.organizationId }),
        apiService.getAllTestSessions(isSuperOrgAdmin ? {} : { orgId: typedUser.organizationId })
      ]);

      if (!Array.isArray(users) || !questionStats || !Array.isArray(tests) || !Array.isArray(sessions)) {
        throw new Error('Failed to fetch dashboard data');
      }

      const calculatedStats = calculateStats(users, questionStats, tests, sessions, typedUser);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadCodeChallengesData = async (): Promise<void> => {
    if (!typedUser) return;

    try {
      await Promise.all([
        loadCodeChallengesDashboard(),
        loadAllChallengesAdmin(),
        loadAllTracksAdmin(),
        loadAnalytics('30d')
      ]);
    } catch (err) {
      console.error('Error loading code challenges data:', err);
    }
  };

  useEffect(() => {
    if (typedUser) {
      fetchStats();
      loadCodeChallengesData();
    }
  }, []);

  const handleQuickAction = (action: QuickActionType): void => {
    const routes: Record<string, string> = {
      addUser: '/admin/users/new',
      createQuestion: '/admin/question-bank/add',
      createTest: '/admin/tests/new',
      addOrganization: '/admin/organizations/new',
      createCodeChallenge: '/admin/code-lab/challenges/new',
      createTrack: '/admin/code-lab/tracks'
    };
    if (routes[action]) navigate(routes[action]);
  };

  // Loading state
  if (!typedUser || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="card p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
          <p className="text-[#a1a1aa] mb-4">{error}</p>
          <button className="btn-primary" onClick={fetchStats}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pendingRequests = notifications?.filter(n => (n as any).status === 'pending')?.length || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="container-section py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-amber">Admin Dashboard</span>
            {isSuperOrgAdmin && <span className="badge-purple">Super Admin</span>}
          </div>
          <h1 className="font-mono text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{typedUser.firstName}</span>
          </h1>
          <p className="text-[#a1a1aa] text-lg">
            {typedUser.organization?.name || 'EngineerSmith Platform'}
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              color="blue"
              onClick={() => navigate('/admin/users')}
            />
            <StatCard
              icon={FileText}
              label="Questions"
              value={stats.totalQuestions}
              color="green"
              onClick={() => navigate('/admin/question-bank')}
            />
            <StatCard
              icon={ClipboardList}
              label="Active Tests"
              value={stats.activeTests}
              subtext={`${stats.totalTests} total`}
              color="amber"
              onClick={() => navigate('/admin/tests')}
            />
            <StatCard
              icon={Activity}
              label="Live Sessions"
              value={stats.activeSessions}
              subtext={`${stats.completedSessions} completed`}
              color="purple"
              onClick={() => navigate('/admin/sessions/active')}
            />
          </div>
        )}

        {/* Code Challenges Overview */}
        {codeChallengesDashboard && (
          <div className="card p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-amber-500" />
              <h2 className="font-mono text-lg font-semibold">Code Challenges Overview</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-blue-500">
                  {codeChallengesDashboard.challengeStats?.totalAttempted || 0}
                </p>
                <p className="text-sm text-[#6b6b70]">Total Attempts</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-green-500">
                  {codeChallengesDashboard.challengeStats?.totalSolved || 0}
                </p>
                <p className="text-sm text-[#6b6b70]">Solved</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-purple-500">
                  {codeChallengesDashboard.trackStats?.totalEnrolled || 0}
                </p>
                <p className="text-sm text-[#6b6b70]">Track Enrollments</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-amber-500">
                  {adminChallenges.length}
                </p>
                <p className="text-sm text-[#6b6b70]">Active Challenges</p>
              </div>
            </div>
          </div>
        )}

        {/* Queue Status (Super Admin Only) */}
        {isSuperOrgAdmin && <QueueStatusCard className="mb-8" />}

        {/* Pending Requests Alert */}
        {pendingRequests > 0 && (
          <div
            className="card p-4 mb-8 border-amber-500/50 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors"
            onClick={() => navigate('/admin/attempt-requests')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">Pending Student Requests</p>
                  <p className="text-sm text-[#a1a1aa]">{pendingRequests} requests need your attention</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6b6b70]" />
            </div>
          </div>
        )}

        {/* Feature Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <FeatureCard
            icon={Users}
            title="User Management"
            description="Manage students, instructors, and roles"
            onClick={() => navigate('/admin/users')}
          />
          <FeatureCard
            icon={FileText}
            title="Question Bank"
            description="Create and organize assessment questions"
            onClick={() => navigate('/admin/question-bank')}
          />
          <FeatureCard
            icon={ClipboardList}
            title="Test Management"
            description="Build and configure assessments"
            onClick={() => navigate('/admin/tests')}
          />
          <FeatureCard
            icon={Code}
            title="Code Challenges"
            description="Manage coding challenges and tracks"
            onClick={() => navigate('/admin/code-lab/challenges')}
          />
          <FeatureCard
            icon={Book}
            title="Learning Tracks"
            description="Create learning paths and curricula"
            onClick={() => navigate('/admin/code-lab/tracks')}
          />
          <FeatureCard
            icon={Activity}
            title="Live Sessions"
            description="Monitor active test sessions"
            onClick={() => navigate('/admin/sessions/active')}
            badge={stats?.activeSessions ? `${stats.activeSessions} active` : undefined}
          />
          <FeatureCard
            icon={BarChart3}
            title="Results & Analytics"
            description="View performance data and insights"
            onClick={() => navigate('/admin/results')}
          />
          <FeatureCard
            icon={Target}
            title="Attempt Requests"
            description="Review student retry requests"
            onClick={() => navigate('/admin/attempt-requests')}
            badge={pendingRequests > 0 ? `${pendingRequests} pending` : undefined}
          />
          <FeatureCard
            icon={Settings}
            title="Settings"
            description="Platform configuration"
            onClick={() => navigate('/admin/settings')}
          />
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="font-mono text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => handleQuickAction('createQuestion')}
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => handleQuickAction('createTest')}
            >
              <Plus className="w-4 h-4" />
              Create Test
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => handleQuickAction('addUser')}
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => handleQuickAction('createCodeChallenge')}
            >
              <Plus className="w-4 h-4" />
              New Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  subtext?: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
  onClick?: () => void;
}) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    purple: 'text-purple-500 bg-purple-500/10'
  };

  return (
    <div
      className={`card p-4 ${onClick ? 'cursor-pointer hover:border-[#3a3a3f] transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="text-sm text-[#a1a1aa]">{label}</p>
      {subtext && <p className="text-xs text-[#6b6b70] mt-1">{subtext}</p>}
    </div>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  badge
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}) => (
  <div
    className="card-hover p-5 cursor-pointer group"
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
        <Icon className="w-5 h-5 text-amber-500" />
      </div>
      {badge && <span className="badge-amber text-xs">{badge}</span>}
    </div>
    <h3 className="font-medium mb-1">{title}</h3>
    <p className="text-sm text-[#6b6b70]">{description}</p>
  </div>
);

export default AdminDashboard;
