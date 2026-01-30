import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Code,
  FileText,
  Play,
  Target,
  TrendingUp,
  User
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/ApiService';

// Types
interface StudentDashboardStats {
  testsAvailable: number;
  testsCompleted: number;
  averageScore: number;
  passedTests: number;
  totalTimeSpent: number;
}

interface TestAttempts {
  total: number | 'unlimited';
  used: number;
  remaining: number | 'unlimited';
  unlimited?: boolean;
}

interface StudentTest {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  attempts: TestAttempts;
  canTakeTest: boolean;
  hasOverride: boolean;
}

interface StudentActivity {
  id: string;
  testTitle: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  score?: number;
  timestamp: string;
}

interface StudentDashboard {
  stats: StudentDashboardStats;
  tests: StudentTest[];
  recentActivity: StudentActivity[];
  requests: any[];
  overrides: any[];
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'in_progress' | 'abandoned';
  score?: number;
  icon: ReactNode;
}

// Difficulty badge colors
const difficultyColors: Record<string, string> = {
  easy: 'badge-green',
  medium: 'badge-amber',
  hard: 'badge-red'
};

export default function ModernStudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [dashboardData, setDashboardData] = useState<StudentDashboard | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const data = await ApiService.getStudentDashboard();
        setDashboardData(data);

        // Transform recent activity
        const transformedActivity: ActivityItem[] = (data.recentActivity || []).map((item: StudentActivity) => ({
          id: item.id,
          title: item.testTitle,
          description: item.status === 'completed'
            ? `Scored ${item.score}%`
            : item.status === 'in_progress'
              ? 'In progress'
              : 'Abandoned',
          timestamp: item.timestamp,
          status: item.status === 'completed'
            ? (item.score && item.score >= 60 ? 'completed' : 'failed')
            : item.status,
          score: item.score,
          icon: item.status === 'completed'
            ? <CheckCircle size={16} />
            : item.status === 'in_progress'
              ? <Clock size={16} />
              : <AlertCircle size={16} />
        }));

        setRecentActivity(transformedActivity);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const navigateToPath = (path: string) => {
    navigate(path);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
          <p className="text-[#a1a1aa] mb-4">{error || 'Something went wrong'}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, tests } = dashboardData;

  // Get a featured test (first available test with remaining attempts)
  const featuredTest = tests.find(t => {
    const isUnlimited = t.attempts.unlimited || t.attempts.total === 'unlimited';
    const hasAttempts = isUnlimited || (typeof t.attempts.remaining === 'number' && t.attempts.remaining > 0);
    return hasAttempts && t.canTakeTest;
  });

  // Calculate progress percentage
  const progressPercent = stats.testsAvailable > 0
    ? Math.round((stats.testsCompleted / (stats.testsCompleted + stats.testsAvailable)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-[#a1a1aa]">
            Here's an overview of your learning progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-mono text-3xl font-bold text-[#f5f5f4] mb-1">{stats.testsCompleted}</h3>
            <p className="text-[#a1a1aa] text-sm">Tests Completed</p>
          </div>
          <div className="card p-6 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-mono text-3xl font-bold text-[#f5f5f4] mb-1">{stats.averageScore}%</h3>
            <p className="text-[#a1a1aa] text-sm">Average Score</p>
          </div>
          <div className="card p-6 text-center">
            <Award className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="font-mono text-3xl font-bold text-[#f5f5f4] mb-1">{stats.passedTests}</h3>
            <p className="text-[#a1a1aa] text-sm">Tests Passed</p>
          </div>
          <div className="card p-6 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-mono text-3xl font-bold text-[#f5f5f4] mb-1">{stats.testsAvailable}</h3>
            <p className="text-[#a1a1aa] text-sm">Available Tests</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => navigateToPath('/tests')}
                className="card p-6 text-left hover:border-blue-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Play className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-[#f5f5f4] mb-1">Take a Test</h3>
                <p className="text-sm text-[#6b6b70]">
                  {stats.testsAvailable} tests available
                </p>
                <ChevronRight className="w-5 h-5 text-[#6b6b70] mt-3 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigateToPath('/results')}
                className="card p-6 text-left hover:border-green-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <FileText className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold text-[#f5f5f4] mb-1">View Results</h3>
                <p className="text-sm text-[#6b6b70]">
                  {stats.testsCompleted} completed tests
                </p>
                <ChevronRight className="w-5 h-5 text-[#6b6b70] mt-3 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigateToPath('/code-lab')}
                className="card p-6 text-left hover:border-amber-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Code className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-semibold text-[#f5f5f4] mb-1">Code Lab</h3>
                <p className="text-sm text-[#6b6b70]">
                  Practice coding challenges
                </p>
                <ChevronRight className="w-5 h-5 text-[#6b6b70] mt-3 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Progress Overview */}
            <div className="card">
              <div className="p-4 border-b border-[#2a2a2e]">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-lg font-semibold">Your Progress</h2>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[#6b6b70] text-sm">Overall Completion</p>
                    <p className="text-2xl font-bold text-[#f5f5f4]">{progressPercent}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6b6b70] text-sm">Tests Completed</p>
                    <p className="text-2xl font-bold text-[#f5f5f4]">
                      {stats.testsCompleted}/{stats.testsCompleted + stats.testsAvailable}
                    </p>
                  </div>
                </div>
                <div className="progress-bar h-3 mb-6">
                  <div
                    className="progress-fill bg-gradient-to-r from-blue-500 to-green-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#2a2a2e]">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{stats.passedTests}</p>
                    <p className="text-xs text-[#6b6b70]">Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{stats.testsCompleted - stats.passedTests}</p>
                    <p className="text-xs text-[#6b6b70]">Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{stats.testsAvailable}</p>
                    <p className="text-xs text-[#6b6b70]">Remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Test CTA */}
            {featuredTest && (
              <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-blue-400 text-sm font-medium mb-1">Ready to take?</p>
                      <h3 className="text-xl font-semibold text-[#f5f5f4]">{featuredTest.title}</h3>
                    </div>
                    <span className={difficultyColors[featuredTest.difficulty]}>
                      {featuredTest.difficulty}
                    </span>
                  </div>
                  <p className="text-[#a1a1aa] text-sm mb-4 line-clamp-2">
                    {featuredTest.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[#6b6b70] mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {featuredTest.questionCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {featuredTest.timeLimit} min
                    </span>
                  </div>
                  <button
                    onClick={() => navigateToPath(`/test-details/${featuredTest._id}`)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Play size={16} />
                    Start Test
                  </button>
                </div>
              </div>
            )}

            {/* No tests available message */}
            {!featuredTest && stats.testsAvailable === 0 && (
              <div className="card p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#f5f5f4] mb-2">All Caught Up!</h3>
                <p className="text-[#6b6b70]">
                  You've completed all available tests. Check back later for new assessments.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="card">
              <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
                <h6 className="font-mono font-semibold">Recent Activity</h6>
                <button
                  onClick={() => navigateToPath('/results')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              </div>
              <div className="p-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-[#3a3a3f] mx-auto mb-2" />
                    <p className="text-[#6b6b70] text-sm">No recent activity</p>
                    <p className="text-[#6b6b70] text-xs mt-1">Take a test to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-[#1c1c1f] last:border-0">
                        <div className={`mt-1 ${item.status === 'completed' ? 'text-green-500' :
                          item.status === 'failed' ? 'text-red-500' : 'text-blue-500'
                          }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h6 className="text-sm font-medium text-[#f5f5f4] truncate">{item.title}</h6>
                          <p className="text-xs text-[#6b6b70]">{item.description}</p>
                          <p className="text-xs text-[#6b6b70] mt-1">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {item.score !== undefined && (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${item.score >= 80 ? 'bg-green-500/10 text-green-400' :
                            item.score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                              'bg-red-500/10 text-red-400'
                            }`}>
                            {Math.round(item.score)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Requests */}
            {dashboardData.requests.length > 0 && (
              <div className="card">
                <div className="p-4 border-b border-[#2a2a2e]">
                  <h6 className="font-mono font-semibold">My Requests</h6>
                </div>
                <div className="p-4 space-y-3">
                  {dashboardData.requests.slice(0, 3).map((request: any) => (
                    <div key={request.id} className="p-3 bg-[#0a0a0b] rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h6 className="text-sm font-medium text-[#f5f5f4]">{request.testTitle}</h6>
                          <p className="text-xs text-[#6b6b70]">{request.requestedAttempts} attempts requested</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${request.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                          request.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="card">
              <div className="p-4 border-b border-[#2a2a2e]">
                <h6 className="font-mono font-semibold">Quick Links</h6>
              </div>
              <div className="p-4 space-y-2">
                <button
                  className="btn-secondary w-full flex items-center gap-2 justify-center"
                  onClick={() => navigateToPath('/tests')}
                >
                  <BookOpen size={16} />
                  Browse All Tests
                </button>
                <button
                  className="btn-secondary w-full flex items-center gap-2 justify-center"
                  onClick={() => navigateToPath('/results')}
                >
                  <BarChart3 size={16} />
                  View All Results
                </button>
                <button
                  className="btn-secondary w-full flex items-center gap-2 justify-center"
                  onClick={() => navigateToPath('/profile')}
                >
                  <User size={16} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
