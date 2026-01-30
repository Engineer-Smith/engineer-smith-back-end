// src/pages/admin/AnalyticsDashboard.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle,
  Loader2,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react';
import apiService from '../../services/ApiService';
import type { ResultAnalytics, UserAnalytics } from '../../types';

interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: string;
  language: string;
  category?: string;
  difficulty: string;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  averageTime: number;
  averagePoints: number;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';
type ViewTab = 'overview' | 'tests' | 'users' | 'questions';

const difficultyColors: Record<string, string> = {
  easy: 'badge-green',
  medium: 'badge-amber',
  hard: 'badge-red'
};

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [refreshing, setRefreshing] = useState(false);

  // Analytics data
  const [resultAnalytics, setResultAnalytics] = useState<ResultAnalytics[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics[]>([]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);

      const [results, users, questions] = await Promise.all([
        apiService.getResultAnalytics({ timeRange }),
        apiService.getUserAnalytics({ timeRange }),
        apiService.getQuestionAnalytics({ timeRange })
      ]);

      setResultAnalytics(results || []);
      setUserAnalytics(users || []);
      setQuestionAnalytics(questions as unknown as QuestionAnalytics[] || []);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Calculate overview stats
  const overviewStats = {
    totalTests: resultAnalytics.length,
    totalUsers: userAnalytics.length,
    avgScore: userAnalytics.length > 0
      ? (userAnalytics.reduce((sum, u) => sum + u.averageScore, 0) / userAnalytics.length).toFixed(1)
      : '0',
    avgPassRate: userAnalytics.length > 0
      ? (userAnalytics.reduce((sum, u) => sum + u.passRate, 0) / userAnalytics.length).toFixed(1)
      : '0',
    totalAttempts: resultAnalytics.reduce((sum, r) => sum + r.totalResults, 0),
    questionSuccessRate: questionAnalytics.length > 0
      ? (questionAnalytics.reduce((sum, q) => sum + q.successRate, 0) / questionAnalytics.length).toFixed(1)
      : '0'
  };

  // Find top/bottom performers
  const topPerformers = [...userAnalytics]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  const strugglingUsers = [...userAnalytics]
    .filter(u => u.passRate < 50)
    .sort((a, b) => a.passRate - b.passRate)
    .slice(0, 5);

  // Find hardest questions
  const hardestQuestions = [...questionAnalytics]
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 5);

  const easiestQuestions = [...questionAnalytics]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
          <p className="text-[#a1a1aa] mb-4">{error}</p>
          <button onClick={fetchAnalytics} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-[#a1a1aa]">
              Performance insights and trends across tests and users
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="select"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 bg-[#1c1c1f] rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'tests', label: 'Tests', icon: BookOpen },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'questions', label: 'Questions', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ViewTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-[#a1a1aa] hover:text-[#f5f5f4]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="card p-4 text-center">
                <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#f5f5f4]">{overviewStats.totalTests}</p>
                <p className="text-xs text-[#6b6b70]">Active Tests</p>
              </div>
              <div className="card p-4 text-center">
                <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#f5f5f4]">{overviewStats.totalUsers}</p>
                <p className="text-xs text-[#6b6b70]">Active Users</p>
              </div>
              <div className="card p-4 text-center">
                <Target className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#f5f5f4]">{overviewStats.avgScore}%</p>
                <p className="text-xs text-[#6b6b70]">Avg Score</p>
              </div>
              <div className="card p-4 text-center">
                <CheckCircle className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#f5f5f4]">{overviewStats.avgPassRate}%</p>
                <p className="text-xs text-[#6b6b70]">Pass Rate</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Performers */}
              <div className="card">
                <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h2 className="font-mono font-semibold">Top Performers</h2>
                </div>
                <div className="p-4">
                  {topPerformers.length === 0 ? (
                    <p className="text-center text-[#6b6b70] py-4">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {topPerformers.map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-amber-500 text-black' :
                              index === 1 ? 'bg-gray-400 text-black' :
                              index === 2 ? 'bg-amber-700 text-white' :
                              'bg-[#2a2a2e] text-[#6b6b70]'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-[#f5f5f4]">User #{user.userId.slice(-6)}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-green-400">{user.averageScore.toFixed(1)}%</span>
                            <span className="text-[#6b6b70] text-sm ml-2">({user.totalTests} tests)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Struggling Users */}
              <div className="card">
                <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h2 className="font-mono font-semibold">Need Attention</h2>
                </div>
                <div className="p-4">
                  {strugglingUsers.length === 0 ? (
                    <p className="text-center text-[#6b6b70] py-4">No struggling users found</p>
                  ) : (
                    <div className="space-y-3">
                      {strugglingUsers.map(user => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <span className="text-[#f5f5f4]">User #{user.userId.slice(-6)}</span>
                          <div className="text-right">
                            <span className="font-semibold text-red-400">{user.passRate.toFixed(1)}%</span>
                            <span className="text-[#6b6b70] text-sm ml-2">pass rate</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hardest Questions */}
              <div className="card">
                <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h2 className="font-mono font-semibold">Hardest Questions</h2>
                </div>
                <div className="p-4">
                  {hardestQuestions.length === 0 ? (
                    <p className="text-center text-[#6b6b70] py-4">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {hardestQuestions.map(q => (
                        <div key={q.questionId} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-[#f5f5f4] truncate text-sm">{q.questionTitle}</p>
                            <span className={`text-xs ${difficultyColors[q.difficulty]}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <span className="font-semibold text-red-400 flex-shrink-0">
                            {q.successRate.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Easiest Questions */}
              <div className="card">
                <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h2 className="font-mono font-semibold">Easiest Questions</h2>
                </div>
                <div className="p-4">
                  {easiestQuestions.length === 0 ? (
                    <p className="text-center text-[#6b6b70] py-4">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {easiestQuestions.map(q => (
                        <div key={q.questionId} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-[#f5f5f4] truncate text-sm">{q.questionTitle}</p>
                            <span className={`text-xs ${difficultyColors[q.difficulty]}`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <span className="font-semibold text-green-400 flex-shrink-0">
                            {q.successRate.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h2 className="font-mono font-semibold">Test Performance</h2>
              <span className="text-sm text-[#6b6b70]">{resultAnalytics.length} tests</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2e]">
                    <th className="text-left p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Test</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Attempts</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Avg Score</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Pass Rate</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Avg Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2e]">
                  {resultAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#6b6b70]">
                        No test data available for this time range
                      </td>
                    </tr>
                  ) : (
                    resultAnalytics.map(test => (
                      <tr key={test.testId} className="hover:bg-[#1c1c1f]/50">
                        <td className="p-4">
                          <span className="text-[#f5f5f4]">Test #{test.testId.slice(-6)}</span>
                        </td>
                        <td className="p-4 text-center text-[#a1a1aa]">{test.totalResults}</td>
                        <td className="p-4 text-center">
                          <span className={test.averageScore >= 70 ? 'text-green-400' : test.averageScore >= 50 ? 'text-amber-400' : 'text-red-400'}>
                            {test.averageScore.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={test.passRate >= 70 ? 'text-green-400' : test.passRate >= 50 ? 'text-amber-400' : 'text-red-400'}>
                            {test.passRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-center text-[#a1a1aa]">
                          {Math.round(test.averageTime / 60)} min
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h2 className="font-mono font-semibold">User Performance</h2>
              <span className="text-sm text-[#6b6b70]">{userAnalytics.length} users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2e]">
                    <th className="text-left p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">User</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Tests Taken</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Avg Score</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Pass Rate</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Best Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2e]">
                  {userAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#6b6b70]">
                        No user data available for this time range
                      </td>
                    </tr>
                  ) : (
                    userAnalytics.map(user => (
                      <tr key={user.userId} className="hover:bg-[#1c1c1f]/50">
                        <td className="p-4">
                          <span className="text-[#f5f5f4]">User #{user.userId.slice(-6)}</span>
                        </td>
                        <td className="p-4 text-center text-[#a1a1aa]">{user.totalTests}</td>
                        <td className="p-4 text-center">
                          <span className={user.averageScore >= 70 ? 'text-green-400' : user.averageScore >= 50 ? 'text-amber-400' : 'text-red-400'}>
                            {user.averageScore.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={user.passRate >= 70 ? 'text-green-400' : user.passRate >= 50 ? 'text-amber-400' : 'text-red-400'}>
                            {user.passRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-green-400">
                            {user.tests && user.tests.length > 0
                              ? Math.max(...user.tests.map(t => t.percentage)).toFixed(1)
                              : user.averageScore.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h2 className="font-mono font-semibold">Question Analytics</h2>
              <span className="text-sm text-[#6b6b70]">{questionAnalytics.length} questions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2e]">
                    <th className="text-left p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Question</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Type</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Difficulty</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Attempts</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Success Rate</th>
                    <th className="text-center p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Avg Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2e]">
                  {questionAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#6b6b70]">
                        No question data available for this time range
                      </td>
                    </tr>
                  ) : (
                    questionAnalytics.map(q => (
                      <tr key={q.questionId} className="hover:bg-[#1c1c1f]/50">
                        <td className="p-4">
                          <p className="text-[#f5f5f4] truncate max-w-xs">{q.questionTitle}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400">
                            {q.questionType}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${difficultyColors[q.difficulty]}`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="p-4 text-center text-[#a1a1aa]">{q.totalAttempts}</td>
                        <td className="p-4 text-center">
                          <span className={q.successRate >= 70 ? 'text-green-400' : q.successRate >= 50 ? 'text-amber-400' : 'text-red-400'}>
                            {q.successRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-4 text-center text-[#a1a1aa]">
                          {q.averageTime > 60 ? `${Math.round(q.averageTime / 60)}m` : `${Math.round(q.averageTime)}s`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
