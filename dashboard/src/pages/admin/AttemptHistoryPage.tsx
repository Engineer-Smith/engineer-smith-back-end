// src/pages/admin/AttemptHistoryPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  History,
  Loader2,
  RefreshCw,
  Search,
  User,
  XCircle
} from 'lucide-react';
import apiService from '../../services/ApiService';

interface AttemptRecord {
  _id: string;
  user: {
    _id: string;
    loginId: string;
    firstName: string;
    lastName: string;
  };
  test: {
    _id: string;
    title: string;
  };
  requestedAt: string;
  grantedAt?: string;
  grantedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reason: string;
  attemptsGranted: number;
  status: 'pending' | 'approved' | 'denied';
}

export default function AttemptHistoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AttemptRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [dateRange, setDateRange] = useState(searchParams.get('range') || '30');

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      const data = await apiService.getAttemptHistory({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        days: parseInt(dateRange)
      });
      setRecords(data || []);
    } catch (err: any) {
      console.error('Failed to fetch attempt history:', err);
      setError(err.response?.data?.message || 'Failed to load attempt history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter, dateRange]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);

    if (key === 'search') setSearchQuery(value);
    if (key === 'status') setStatusFilter(value);
    if (key === 'range') setDateRange(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="badge-green flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
      case 'denied':
        return <span className="badge-red flex items-center gap-1"><XCircle size={12} /> Denied</span>;
      default:
        return <span className="badge-amber flex items-center gap-1"><Clock size={12} /> Pending</span>;
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

  // Stats
  const stats = {
    total: records.length,
    approved: records.filter(r => r.status === 'approved').length,
    denied: records.filter(r => r.status === 'denied').length,
    pending: records.filter(r => r.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading attempt history...</p>
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
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2 flex items-center gap-2">
              <History className="w-6 h-6 text-blue-500" />
              Attempt Request History
            </h1>
            <p className="text-[#a1a1aa]">
              View history of all attempt requests and their resolutions
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{stats.total}</p>
            <p className="text-xs text-[#6b6b70]">Total Requests</p>
          </div>
          <div className="card p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{stats.approved}</p>
            <p className="text-xs text-[#6b6b70]">Approved</p>
          </div>
          <div className="card p-4 text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{stats.denied}</p>
            <p className="text-xs text-[#6b6b70]">Denied</p>
          </div>
          <div className="card p-4 text-center">
            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{stats.pending}</p>
            <p className="text-xs text-[#6b6b70]">Pending</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                <input
                  type="text"
                  placeholder="Search by user or test..."
                  value={searchQuery}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input w-full pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="select"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => handleFilterChange('range', e.target.value)}
                className="select"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>

              <button
                className="btn-secondary flex items-center gap-2"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateRange('30');
                  setSearchParams({});
                }}
              >
                <Filter size={16} />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="card">
          {records.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
              <p className="text-[#6b6b70]">
                {searchQuery || statusFilter !== 'all'
                  ? 'No records match your filters'
                  : 'No attempt request history found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1e] border-b border-[#2a2a2e]">
                  <tr>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Student</th>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Test</th>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Requested</th>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Status</th>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Resolved By</th>
                    <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1e]">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-[#6b6b70]" />
                          <div>
                            <div className="font-medium text-[#f5f5f4]">
                              {record.user.firstName} {record.user.lastName}
                            </div>
                            <div className="text-xs text-[#6b6b70]">{record.user.loginId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/admin/tests/view/${record.test._id}`)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {record.test.title}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                          <Calendar size={14} />
                          {formatDate(record.requestedAt)}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(record.status)}</td>
                      <td className="p-4">
                        {record.grantedBy ? (
                          <div className="text-sm">
                            <div className="text-[#f5f5f4]">
                              {record.grantedBy.firstName} {record.grantedBy.lastName}
                            </div>
                            {record.grantedAt && (
                              <div className="text-xs text-[#6b6b70]">
                                {formatDate(record.grantedAt)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#6b6b70]">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {record.attemptsGranted > 0 ? (
                          <span className="badge-green">+{record.attemptsGranted}</span>
                        ) : (
                          <span className="text-[#6b6b70]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
