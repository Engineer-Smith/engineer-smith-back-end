// src/pages/admin/SystemHealthPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Loader2,
  RefreshCw,
  Server,
  Shield,
  Zap,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';
import type { QueueStatus, QueueMetrics } from '../../types/admin';

export default function SystemHealthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [resettingMetrics, setResettingMetrics] = useState(false);

  // Check if user is super org admin
  const isSuperOrgAdmin = user?.organization?.isSuperOrg && user?.role === 'admin';

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [statusData, metricsData] = await Promise.all([
        apiService.getQueueStatus(),
        apiService.getQueueMetrics()
      ]);
      setStatus(statusData);
      setMetrics(metricsData);
    } catch (err: any) {
      console.error('Failed to fetch system health:', err);
      setError(err.response?.data?.message || 'Failed to load system health data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperOrgAdmin) {
      navigate('/admin');
      return;
    }
    fetchData();

    // Poll status every 5 seconds, metrics every 30 seconds
    const statusInterval = setInterval(() => {
      apiService.getQueueStatus().then(setStatus).catch(console.error);
    }, 5000);

    const metricsInterval = setInterval(() => {
      apiService.getQueueMetrics().then(setMetrics).catch(console.error);
    }, 30000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(metricsInterval);
    };
  }, [isSuperOrgAdmin, navigate, fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleResetMetrics = async () => {
    if (!confirm('Are you sure you want to reset all metrics? This cannot be undone.')) return;

    try {
      setResettingMetrics(true);
      await apiService.resetQueueMetrics();
      await fetchData();
    } catch (err: any) {
      console.error('Failed to reset metrics:', err);
      setError(err.response?.data?.message || 'Failed to reset metrics');
    } finally {
      setResettingMetrics(false);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (ts: string | null): string => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleString();
  };

  if (!isSuperOrgAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-[#a1a1aa] mb-4">
            Only super organization administrators can access system health monitoring.
          </p>
          <button onClick={() => navigate('/admin')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading system health...</p>
        </div>
      </div>
    );
  }

  if (error && !status && !metrics) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load System Health</h2>
          <p className="text-[#a1a1aa] mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary">
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
              System Health
            </h1>
            <p className="text-[#a1a1aa]">
              Monitor code execution queue, security metrics, and system performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleResetMetrics}
              disabled={resettingMetrics}
              className="btn-secondary flex items-center gap-2 text-amber-400 hover:text-amber-300"
            >
              {resettingMetrics ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              Reset Metrics
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Overall Health Status */}
        <div className={`card mb-6 p-6 border-l-4 ${
          status?.healthy ? 'border-l-green-500' : 'border-l-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {status?.healthy ? (
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-[#f5f5f4]">
                  {status?.healthy ? 'System Healthy' : 'System Degraded'}
                </h2>
                <p className="text-[#6b6b70]">
                  Code execution queue is {status?.healthy ? 'operating normally' : 'experiencing issues'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6b6b70]">Last updated</p>
              <p className="text-[#f5f5f4]">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{status?.running || 0}</p>
            <p className="text-xs text-[#6b6b70]">Running Jobs</p>
          </div>
          <div className="card p-4 text-center">
            <Server className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{status?.queueDepth || 0}</p>
            <p className="text-xs text-[#6b6b70]">Queued Jobs</p>
          </div>
          <div className="card p-4 text-center">
            <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">
              {formatDuration(status?.avgWaitMs || 0)}
            </p>
            <p className="text-xs text-[#6b6b70]">Avg Wait Time</p>
          </div>
          <div className="card p-4 text-center">
            <Activity className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">
              {metrics?.totalJobsProcessed || 0}
            </p>
            <p className="text-xs text-[#6b6b70]">Total Processed</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Queue Metrics */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              <h2 className="font-mono font-semibold">Queue Metrics</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Total Jobs Queued</span>
                <span className="font-medium text-[#f5f5f4]">{metrics?.totalJobsQueued || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Immediate Executions</span>
                <span className="font-medium text-[#f5f5f4]">{metrics?.totalJobsImmediate || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">High Priority Processed</span>
                <span className="font-medium text-[#f5f5f4]">{metrics?.highPriorityProcessed || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Normal Priority Processed</span>
                <span className="font-medium text-[#f5f5f4]">{metrics?.normalPriorityProcessed || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Max Wait Time</span>
                <span className="font-medium text-[#f5f5f4]">{formatDuration(metrics?.maxWaitTimeMs || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Last Job Processed</span>
                <span className="font-medium text-[#f5f5f4]">{formatTimestamp(metrics?.lastJobProcessedAt || null)}</span>
              </div>
            </div>
          </div>

          {/* Running by Language */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-green-500" />
              <h2 className="font-mono font-semibold">Running by Language</h2>
            </div>
            <div className="p-4">
              {metrics?.runningByLanguage && Object.keys(metrics.runningByLanguage).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(metrics.runningByLanguage).map(([lang, count]) => (
                    <div key={lang} className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                      <span className="text-[#f5f5f4] capitalize">{lang}</span>
                      <span className="font-medium text-blue-400">{count} running</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6b6b70]">
                  No jobs currently running
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Errors and Timeouts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-mono font-semibold">Errors & Timeouts</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Total Timeouts</span>
                <span className={`font-medium ${(metrics?.totalTimeouts || 0) > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {metrics?.totalTimeouts || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Total Errors</span>
                <span className={`font-medium ${(metrics?.totalErrors || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {metrics?.totalErrors || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Service Started</span>
                <span className="font-medium text-[#f5f5f4]">{formatTimestamp(metrics?.serviceStartedAt || null)}</span>
              </div>
            </div>
          </div>

          {/* Security Metrics */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <h2 className="font-mono font-semibold">Security Metrics</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Total Scans</span>
                <span className="font-medium text-[#f5f5f4]">{metrics?.security?.totalScans || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Total Rejections</span>
                <span className={`font-medium ${(metrics?.security?.totalRejections || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {metrics?.security?.totalRejections || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Rejection Rate</span>
                <span className="font-medium text-[#f5f5f4]">{metrics?.security?.rejectionRate || '0%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Security Violations */}
        {metrics?.security?.recentViolations && metrics.security.recentViolations.length > 0 && (
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-mono font-semibold">Recent Security Violations</h2>
              </div>
              <span className="text-sm text-[#6b6b70]">
                {metrics.security.recentViolations.length} recent violations
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2e]">
                    <th className="text-left p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Timestamp</th>
                    <th className="text-left p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Language</th>
                    <th className="text-left p-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Violations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2e]">
                  {metrics.security.recentViolations.map((violation, index) => (
                    <tr key={index} className="hover:bg-[#1c1c1f]/50">
                      <td className="p-4 text-[#a1a1aa]">
                        {new Date(violation.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 capitalize">
                          {violation.language}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {violation.violations.map((v, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400">
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
