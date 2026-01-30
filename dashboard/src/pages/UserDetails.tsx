// src/pages/UserDetails.tsx - Enhanced with dashboard functionality
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Mail,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';

import type {
  User,
  UserDetailsDashboard
} from '../types';

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<UserDetailsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');

  const typedUser = user as User | null;

  // Fetch user dashboard data
  const fetchUserDashboard = async (showRefreshSpinner = false) => {
    if (!userId || !typedUser) return;

    try {
      if (showRefreshSpinner) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const dashboardData = await apiService.getUserDetailsDashboard(userId);
      setDashboard(dashboardData);

    } catch (err) {
      console.error('Error fetching user dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId && typedUser) {
      fetchUserDashboard();
    }
  }, [userId, typedUser]);

  // Handle user actions
  const handleDeleteUser = async () => {
    if (!userId) return;

    try {
      await apiService.deleteUser(userId);
      navigate('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
    setDeleteModalOpen(false);
  };

  // Helper functions
  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case 'admin': return 'badge-red';
      case 'instructor': return 'badge-amber';
      case 'student': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (!typedUser) {
    return (
      <div className="container-section py-8 text-center text-[#a1a1aa]">
        Please log in to access this page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-section py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-[#a1a1aa]">Loading user dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container-section py-12">
        <div className="max-w-xl mx-auto">
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertCircle size={20} className="text-red-400" />
              <span className="text-red-400">{error || 'User not found'}</span>
            </div>
            <button className="btn-primary" onClick={() => navigate('/admin/users')}>
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user: userDetails, performance, activity, content } = dashboard;

  return (
    <div className="container-section py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            className="btn-secondary p-2"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-mono text-2xl font-bold text-[#f5f5f4]">{userDetails.fullName}</h2>
            <p className="text-[#a1a1aa]">
              {userDetails.email || userDetails.loginId} • {userDetails.organization.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            onClick={() => fetchUserDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate(`/admin/users/${userId}/edit`)}
          >
            <Edit size={16} className="mr-2" />
            Edit
          </button>
          <button
            className="btn-danger"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
          <button
            className="text-red-400 hover:text-red-300"
            onClick={() => setError(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                <UserIcon size={36} className="text-white" />
              </div>
              <h4 className="font-semibold text-[#f5f5f4] mb-2">{userDetails.fullName}</h4>
              <span className={`${getRoleBadgeClass(userDetails.role)} mr-2`}>
                {userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}
              </span>
              <span className={userDetails.isSSO ? 'badge-blue' : 'badge-gray'}>
                {userDetails.isSSO ? 'SSO Account' : 'Regular Account'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon size={16} className="text-[#6b6b70]" />
                <div>
                  <small className="text-[#6b6b70] block">Login ID</small>
                  <span className="text-[#f5f5f4]">{userDetails.loginId}</span>
                </div>
              </div>

              {userDetails.email && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#6b6b70]" />
                  <div>
                    <small className="text-[#6b6b70] block">Email</small>
                    <span className="text-[#f5f5f4]">{userDetails.email}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Building size={16} className="text-[#6b6b70]" />
                <div>
                  <small className="text-[#6b6b70] block">Organization</small>
                  <span className="text-[#f5f5f4]">{userDetails.organization.name}</span>
                  {userDetails.organization.isSuperOrg && (
                    <span className="badge-amber ml-2">Super</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[#6b6b70]" />
                <div>
                  <small className="text-[#6b6b70] block">Member Since</small>
                  <span className="text-[#f5f5f4]">{new Date(userDetails.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h6 className="font-semibold text-[#f5f5f4]">Performance Overview</h6>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <small className="text-[#6b6b70]">Average Score</small>
                  <small className="font-semibold text-[#f5f5f4]">{performance.overview.averageScore.toFixed(1)}%</small>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getPerformanceColor(performance.overview.averageScore)}`}
                    style={{ width: `${performance.overview.averageScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <small className="text-[#6b6b70]">Pass Rate</small>
                  <small className="font-semibold text-[#f5f5f4]">{performance.overview.passRate}%</small>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getPerformanceColor(performance.overview.passRate)}`}
                    style={{ width: `${performance.overview.passRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <small className="text-[#6b6b70]">Efficiency</small>
                  <small className="font-semibold text-[#f5f5f4]">{performance.overview.efficiency}%</small>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getPerformanceColor(performance.overview.efficiency)}`}
                    style={{ width: `${performance.overview.efficiency}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2a2a2e]">
                <div className="text-center">
                  <h5 className="text-xl font-bold text-[#f5f5f4]">{performance.overview.totalTests}</h5>
                  <small className="text-[#6b6b70]">Total Tests</small>
                </div>
                <div className="text-center">
                  <h5 className="text-xl font-bold text-[#f5f5f4]">{formatDuration(performance.overview.totalTimeSpent)}</h5>
                  <small className="text-[#6b6b70]">Time Spent</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Performance Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card bg-blue-500 text-white p-4 text-center">
              <FileText size={24} className="mx-auto mb-2" />
              <h4 className="text-2xl font-bold">{performance.overview.completedTests}</h4>
              <small>Completed</small>
            </div>
            <div className="card bg-green-500 text-white p-4 text-center">
              <CheckCircle size={24} className="mx-auto mb-2" />
              <h4 className="text-2xl font-bold">{performance.overview.passRate}%</h4>
              <small>Pass Rate</small>
            </div>
            <div className="card bg-cyan-500 text-white p-4 text-center">
              {performance.trends.isImproving ? (
                <TrendingUp size={24} className="mx-auto mb-2" />
              ) : (
                <TrendingDown size={24} className="mx-auto mb-2" />
              )}
              <h4 className="text-2xl font-bold">{Math.abs(performance.trends.scoreChange).toFixed(1)}</h4>
              <small>Score Change</small>
            </div>
            <div className="card bg-amber-500 text-white p-4 text-center">
              <Clock size={24} className="mx-auto mb-2" />
              <h4 className="text-2xl font-bold">{Object.values(activity.sessions).reduce((sum, s) => sum + s.count, 0)}</h4>
              <small>Total Sessions</small>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="border-b border-[#2a2a2e]">
              <nav className="flex">
                <button
                  className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-[#a1a1aa] hover:text-[#f5f5f4]'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  <Activity size={16} />
                  Recent Activity
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'performance'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-[#a1a1aa] hover:text-[#f5f5f4]'
                  }`}
                  onClick={() => setActiveTab('performance')}
                >
                  <BarChart3 size={16} />
                  Performance
                </button>
                {content && (
                  <button
                    className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                      activeTab === 'content'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-[#a1a1aa] hover:text-[#f5f5f4]'
                    }`}
                    onClick={() => setActiveTab('content')}
                  >
                    <BookOpen size={16} />
                    Created Content
                  </button>
                )}
              </nav>
            </div>

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                {activity.recent.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity size={48} className="text-[#6b6b70] mx-auto mb-3" />
                    <h5 className="text-[#a1a1aa] font-semibold mb-2">No recent activity</h5>
                    <p className="text-[#6b6b70]">This user hasn't taken any tests yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#1a1a1e] border-b border-[#2a2a2e]">
                        <tr>
                          <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Test</th>
                          <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Type</th>
                          <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Score</th>
                          <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Status</th>
                          <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity.recent.map((test, index) => (
                          <tr key={index} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1e]">
                            <td className="p-4">
                              <div>
                                <div className="font-semibold text-[#f5f5f4]">{test.testTitle}</div>
                                <small className="text-[#6b6b70]">Attempt #{test.attemptNumber}</small>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="badge-gray">
                                {test.testType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </td>
                            <td className="p-4">
                              <div>
                                <span className="font-semibold text-[#f5f5f4]">{test.score.percentage.toFixed(1)}%</span>
                                <br />
                                <small className="text-[#6b6b70]">
                                  {test.score.earnedPoints}/{test.score.totalPoints} pts
                                </small>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={test.score.passed ? 'badge-green' : 'badge-red'}>
                                {test.score.passed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                            <td className="p-4">
                              <small className="text-[#6b6b70]">
                                {test.completedAt ? formatDate(test.completedAt) : 'In Progress'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h6 className="font-semibold text-[#f5f5f4] mb-4">Performance by Question Type</h6>
                    <div className="space-y-3">
                      {Object.entries(performance.breakdown.byType).map(([type, metrics]) => (
                        <div key={type}>
                          <div className="flex justify-between items-center mb-1">
                            <small className="text-[#a1a1aa] capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</small>
                            <small className="font-semibold text-[#f5f5f4]">
                              {metrics.length > 0
                                ? `${(metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length).toFixed(1)}%`
                                : 'N/A'
                              }
                            </small>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${getPerformanceColor(
                                metrics.length > 0
                                  ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
                                  : 0
                              )}`}
                              style={{
                                width: `${metrics.length > 0
                                  ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
                                  : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h6 className="font-semibold text-[#f5f5f4] mb-4">Performance by Difficulty</h6>
                    <div className="space-y-3">
                      {Object.entries(performance.breakdown.byDifficulty).map(([difficulty, metrics]) => (
                        <div key={difficulty}>
                          <div className="flex justify-between items-center mb-1">
                            <small className="text-[#a1a1aa] capitalize">{difficulty}</small>
                            <small className="font-semibold text-[#f5f5f4]">
                              {metrics.length > 0
                                ? `${(metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length).toFixed(1)}%`
                                : 'N/A'
                              }
                            </small>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${getPerformanceColor(
                                metrics.length > 0
                                  ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
                                  : 0
                              )}`}
                              style={{
                                width: `${metrics.length > 0
                                  ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
                                  : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && content && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h6 className="font-semibold text-[#f5f5f4] mb-4">Created Questions ({content.questions.length})</h6>
                    {content.questions.length === 0 ? (
                      <p className="text-[#6b6b70]">No questions created</p>
                    ) : (
                      <div className="space-y-3">
                        {content.questions.slice(0, 5).map((question) => (
                          <div key={question._id} className="p-3 border border-[#2a2a2e] rounded-lg bg-[#1a1a1e]">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-[#f5f5f4]">{question.title}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="badge-gray">{question.language}</span>
                                  <span className="badge-gray">{question.difficulty}</span>
                                  <span className={question.status === 'active' ? 'badge-green' : 'badge-amber'}>
                                    {question.status}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <small className="text-[#6b6b70] block">Used {question.timesUsed} times</small>
                                <small className="text-[#6b6b70]">{question.successRate.toFixed(1)}% success</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h6 className="font-semibold text-[#f5f5f4] mb-4">Created Tests ({content.tests.length})</h6>
                    {content.tests.length === 0 ? (
                      <p className="text-[#6b6b70]">No tests created</p>
                    ) : (
                      <div className="space-y-3">
                        {content.tests.slice(0, 5).map((test) => (
                          <div key={test._id} className="p-3 border border-[#2a2a2e] rounded-lg bg-[#1a1a1e]">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-[#f5f5f4]">{test.title}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="badge-gray">{test.testType.replace('_', ' ')}</span>
                                  <span className={test.status === 'active' ? 'badge-green' : 'badge-amber'}>
                                    {test.status}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <small className="text-[#6b6b70] block">{test.totalAttempts} attempts</small>
                                <small className="text-[#6b6b70]">{test.averageScore.toFixed(1)}% avg</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
              <h5 className="font-semibold text-[#f5f5f4]">Confirm User Deletion</h5>
              <button
                className="text-[#6b6b70] hover:text-[#f5f5f4]"
                onClick={() => setDeleteModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[#a1a1aa] mb-4">
                Are you sure you want to delete user <strong className="text-[#f5f5f4]">{userDetails.fullName}</strong>?
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-400 mt-0.5" />
                  <div className="text-sm text-amber-400">
                    <strong>Warning:</strong> This action cannot be undone. All user data, test sessions,
                    and results will be permanently removed.
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#2a2a2e] flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteUser}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;
