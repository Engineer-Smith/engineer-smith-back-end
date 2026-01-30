// src/pages/UserManagement.tsx - Enhanced with dashboard functionality
import {
  Award,
  Building,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import type {
  User,
  UserDashboardFilters,
  UserManagementDashboard
} from '../types';

const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dashboard state
  const [dashboard, setDashboard] = useState<UserManagementDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<UserDashboardFilters>({
    search: '',
    role: undefined,
    orgId: undefined,
    limit: 20,
    skip: 0
  });

  // Separate state for search input (updates immediately)
  const [searchInput, setSearchInput] = useState('');
  // Debounced search value (updates after 300ms of no typing)
  const debouncedSearch = useDebounce(searchInput, 300);
  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  // UI state
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const typedUser = user as User | null;
  const isSuperOrgAdmin = typedUser?.organization?.isSuperOrg && typedUser?.role === 'admin';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownOpen).forEach(userId => {
        if (dropdownOpen[userId] && dropdownRefs.current[userId] &&
            !dropdownRefs.current[userId]?.contains(event.target as Node)) {
          setDropdownOpen(prev => ({ ...prev, [userId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Fetch dashboard data
  const fetchDashboard = async (showRefreshSpinner = false) => {
    if (!typedUser) return;

    try {
      if (showRefreshSpinner) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const queryParams: Record<string, string> = {};
      if (filters.search) queryParams.search = filters.search;
      if (filters.role) queryParams.role = filters.role;
      if (filters.orgId) queryParams.orgId = filters.orgId;
      if (filters.limit) queryParams.limit = filters.limit.toString();
      if (filters.skip) queryParams.skip = filters.skip.toString();

      const dashboardData = await apiService.getUserDashboard(queryParams);
      setDashboard(dashboardData);

    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sync debounced search to filters
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters(prev => ({ ...prev, search: debouncedSearch, skip: 0 }));
    }
  }, [debouncedSearch]);

  // Fetch data when filters change (except search which is handled by debounce)
  useEffect(() => {
    if (typedUser) {
      // Only show full loading spinner on initial load
      const showFullLoading = isInitialLoad.current;
      isInitialLoad.current = false;
      fetchDashboard(!showFullLoading);
    }
  }, [typedUser, filters.role, filters.orgId, filters.limit, filters.skip, filters.search]);

  // Handle filter changes
  const handleFilterChange = (key: keyof UserDashboardFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      skip: key !== 'skip' ? 0 : value // Reset pagination when other filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newSkip: number) => {
    setFilters(prev => ({ ...prev, skip: newSkip }));
  };

  // Handle user actions
  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId: string) => {
    navigate(`/admin/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiService.deleteUser(userId);
      await fetchDashboard(true);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const toggleDropdown = (userId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Get role badge class
  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case 'admin': return 'badge-red';
      case 'instructor': return 'badge-amber';
      case 'student': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  // Format time duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
          <p className="text-[#a1a1aa]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-section py-12">
        <div className="max-w-xl mx-auto">
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-red-400" />
              <h5 className="font-semibold text-red-400">Error Loading Dashboard</h5>
            </div>
            <p className="text-[#a1a1aa] mb-4">{error}</p>
            <button className="btn-primary" onClick={() => fetchDashboard()}>
              <RefreshCw size={16} className="mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container-section py-8 text-center text-[#a1a1aa]">
        No dashboard data available
      </div>
    );
  }

  const { overview, recentActivity, users, content, organizations } = dashboard;

  return (
    <div className="container-section py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-mono text-2xl font-bold flex items-center gap-2 mb-1">
            <Users size={28} className="text-blue-500" />
            User Management
          </h2>
          <p className="text-[#a1a1aa]">
            {isSuperOrgAdmin
              ? 'Manage all users across the platform'
              : `Manage users in your ${typedUser.organization?.name} organization`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/admin/users/new')}
          >
            <Plus size={16} className="mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <h5 className="text-xl font-bold text-[#f5f5f4]">{overview.totalUsers.toLocaleString()}</h5>
              <small className="text-[#6b6b70]">Total Users</small>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <div>
              <h5 className="text-xl font-bold text-[#f5f5f4]">{recentActivity.registrationTrend}</h5>
              <small className="text-[#6b6b70]">New This Month</small>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Award className="text-amber-400" size={24} />
            </div>
            <div>
              <h5 className="text-xl font-bold text-[#f5f5f4]">
                {overview.performance ? `${overview.performance.averageScore.toFixed(1)}%` : 'N/A'}
              </h5>
              <small className="text-[#6b6b70]">Avg Score</small>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Clock className="text-cyan-400" size={24} />
            </div>
            <div>
              <h5 className="text-xl font-bold text-[#f5f5f4]">
                {overview.performance ? formatDuration(overview.performance.totalTimeSpent) : 'N/A'}
              </h5>
              <small className="text-[#6b6b70]">Total Time</small>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h6 className="font-semibold text-[#f5f5f4]">User Distribution</h6>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="mb-2">
                  <span className="badge-red text-lg px-4 py-2">
                    {overview.roleDistribution.admin}
                  </span>
                </div>
                <small className="text-[#6b6b70]">Admins</small>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <span className="badge-amber text-lg px-4 py-2">
                    {overview.roleDistribution.instructor}
                  </span>
                </div>
                <small className="text-[#6b6b70]">Instructors</small>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <span className="badge-blue text-lg px-4 py-2">
                    {overview.roleDistribution.student}
                  </span>
                </div>
                <small className="text-[#6b6b70]">Students</small>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h6 className="font-semibold text-[#f5f5f4]">Account Types</h6>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <small className="text-[#6b6b70]">SSO Users</small>
                <small className="font-semibold text-[#f5f5f4]">{overview.accountTypes.sso}</small>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill bg-cyan-500"
                  style={{ width: `${(overview.accountTypes.sso / overview.totalUsers) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <small className="text-[#6b6b70]">Regular Users</small>
                <small className="font-semibold text-[#f5f5f4]">{overview.accountTypes.regular}</small>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill bg-green-500"
                  style={{ width: `${(overview.accountTypes.regular / overview.totalUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Creators */}
      {(content.topQuestionCreators.length > 0 || content.topTestCreators.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h6 className="font-semibold text-[#f5f5f4]">Top Question Creators</h6>
            </div>
            <div className="p-4">
              {content.topQuestionCreators.length === 0 ? (
                <p className="text-[#6b6b70] text-center">No question creators yet</p>
              ) : (
                <div className="space-y-3">
                  {content.topQuestionCreators.slice(0, 5).map((creator, index) => (
                    <div key={creator.creatorId} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="badge-gray">{index + 1}</span>
                        <div>
                          <small className="font-semibold text-[#f5f5f4]">{creator.creatorName}</small>
                          <br />
                          <small className="text-[#6b6b70]">{creator.creatorRole}</small>
                        </div>
                      </div>
                      <span className="badge-blue">{creator.questionCount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h6 className="font-semibold text-[#f5f5f4]">Top Test Creators</h6>
            </div>
            <div className="p-4">
              {content.topTestCreators.length === 0 ? (
                <p className="text-[#6b6b70] text-center">No test creators yet</p>
              ) : (
                <div className="space-y-3">
                  {content.topTestCreators.slice(0, 5).map((creator, index) => (
                    <div key={creator.creatorId} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="badge-gray">{index + 1}</span>
                        <div>
                          <small className="font-semibold text-[#f5f5f4]">{creator.creatorName}</small>
                          <br />
                          <small className="text-[#6b6b70]">{creator.creatorRole}</small>
                        </div>
                      </div>
                      <span className="badge-green">{creator.testCount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Organizations (Super Admin Only) */}
      {isSuperOrgAdmin && organizations && organizations.length > 0 && (
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h6 className="font-semibold text-[#f5f5f4]">Organizations Overview</h6>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {organizations.slice(0, 4).map((org) => (
                <div key={org._id} className="text-center p-4 border border-[#2a2a2e] rounded-lg bg-[#1a1a1e]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Building size={20} className="text-[#a1a1aa]" />
                    <h6 className="font-semibold text-[#f5f5f4]">{org.name}</h6>
                    {org.isSuperOrg && <span className="badge-amber">Super</span>}
                  </div>
                  <div className="text-sm text-[#6b6b70]">
                    <div>{org.userCount} users</div>
                    <div>{org.adminCount} admins, {org.instructorCount} instructors</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b70]" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input pl-9 w-full"
              />
            </div>
            <div>
              <select
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                className="select w-full"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            {isSuperOrgAdmin && organizations && (
              <div>
                <select
                  value={filters.orgId || ''}
                  onChange={(e) => handleFilterChange('orgId', e.target.value || undefined)}
                  className="select w-full"
                >
                  <option value="">All Organizations</option>
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>{org.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <select
                value={filters.limit || 20}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="select w-full"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
            <div>
              <button
                className="btn-secondary w-full"
                onClick={() => {
                  setSearchInput('');
                  setFilters({ search: '', role: undefined, orgId: undefined, limit: 20, skip: 0 });
                }}
                title="Clear filters"
              >
                <Filter size={16} className="mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {users.list.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-[#6b6b70] mx-auto mb-3" />
            <h5 className="text-[#a1a1aa] font-semibold mb-2">No users found</h5>
            <p className="text-[#6b6b70]">
              {filters.search || filters.role || filters.orgId
                ? 'Try adjusting your filters'
                : 'Start by adding your first user'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1e] border-b border-[#2a2a2e]">
                  <tr>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">User</th>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Role</th>
                    {isSuperOrgAdmin && (
                      <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Organization</th>
                    )}
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Account Type</th>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Created</th>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.list.map((userItem) => (
                    <tr key={userItem._id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1e] transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-[#f5f5f4]">{userItem.fullName}</div>
                          <small className="text-[#6b6b70]">{userItem.email || userItem.loginId}</small>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={getRoleBadgeClass(userItem.role)}>
                          {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                        </span>
                      </td>
                      {isSuperOrgAdmin && (
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-[#a1a1aa]">
                            <Building size={14} />
                            <small>{userItem.organizationName}</small>
                          </div>
                        </td>
                      )}
                      <td className="p-4">
                        <span className={userItem.isSSO ? 'badge-blue' : 'badge-gray'}>
                          {userItem.isSSO ? 'SSO' : 'Regular'}
                        </span>
                      </td>
                      <td className="p-4">
                        <small className="text-[#6b6b70]">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="p-4">
                        <div
                          className="relative"
                          ref={el => { dropdownRefs.current[userItem._id] = el; }}
                        >
                          <button
                            className="btn-ghost p-2"
                            onClick={() => toggleDropdown(userItem._id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {dropdownOpen[userItem._id] && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg shadow-lg z-10">
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-[#f5f5f4] hover:bg-[#2a2a2e] flex items-center gap-2 rounded-t-lg"
                                onClick={() => handleViewUser(userItem._id)}
                              >
                                <Eye size={14} />
                                View Details
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-[#f5f5f4] hover:bg-[#2a2a2e] flex items-center gap-2"
                                onClick={() => handleEditUser(userItem._id)}
                              >
                                <Edit size={14} />
                                Edit User
                              </button>
                              <div className="border-t border-[#2a2a2e]" />
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#2a2a2e] flex items-center gap-2 rounded-b-lg"
                                onClick={() => handleDeleteUser(userItem._id)}
                              >
                                <Trash2 size={14} />
                                Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {users.pagination.hasMore && (
              <div className="p-4 border-t border-[#2a2a2e] bg-[#1a1a1e] flex justify-between items-center">
                <small className="text-[#6b6b70]">
                  Showing {users.pagination.skip + 1} to {Math.min(users.pagination.skip + users.pagination.limit, users.pagination.total)} of {users.pagination.total} users
                </small>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary text-sm"
                    disabled={users.pagination.skip === 0}
                    onClick={() => handlePageChange(Math.max(0, users.pagination.skip - users.pagination.limit))}
                  >
                    Previous
                  </button>
                  <button
                    className="btn-secondary text-sm"
                    disabled={!users.pagination.hasMore}
                    onClick={() => handlePageChange(users.pagination.skip + users.pagination.limit)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
