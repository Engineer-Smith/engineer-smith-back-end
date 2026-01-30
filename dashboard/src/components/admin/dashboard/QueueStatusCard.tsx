// src/components/admin/dashboard/QueueStatusCard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shield,
  Loader2,
  Server,
  Zap
} from 'lucide-react';
import apiService from '../../../services/ApiService';
import type { QueueStatus, QueueMetrics } from '../../../types/admin';

interface QueueStatusCardProps {
  className?: string;
}

const QueueStatusCard: React.FC<QueueStatusCardProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Fetch lightweight status (every 5 seconds)
  const fetchStatus = useCallback(async () => {
    try {
      const data = await apiService.getQueueStatus();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch queue status:', err);
      // Don't set error for status - just keep polling
    }
  }, []);

  // Fetch detailed metrics (every 30 seconds, or when expanded)
  const fetchMetrics = useCallback(async () => {
    try {
      const data = await apiService.getQueueMetrics();
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch queue metrics:', err);
      setError('Failed to load queue metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset metrics handler
  const handleResetMetrics = async () => {
    if (!confirm('Reset all queue metrics? This cannot be undone.')) return;

    setResetting(true);
    try {
      await apiService.resetQueueMetrics();
      await fetchMetrics();
    } catch (err: any) {
      console.error('Failed to reset metrics:', err);
      setError('Failed to reset metrics');
    } finally {
      setResetting(false);
    }
  };

  // Initial load and polling
  useEffect(() => {
    fetchStatus();
    fetchMetrics();

    // Poll status every 5 seconds
    const statusInterval = setInterval(fetchStatus, 5000);

    // Poll metrics every 30 seconds
    const metricsInterval = setInterval(fetchMetrics, 30000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(metricsInterval);
    };
  }, [fetchStatus, fetchMetrics]);

  // Format milliseconds to readable string
  const formatMs = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Format timestamp
  const formatTime = (timestamp: string | null): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (loading && !status) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#6b6b70]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a2a2e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-500" />
            <h3 className="font-mono text-lg font-semibold">Code Execution Queue</h3>
          </div>
          <div className="flex items-center gap-2">
            {status?.healthy ? (
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs">
                <CheckCircle className="w-3 h-3" />
                Healthy
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs">
                <AlertTriangle className="w-3 h-3" />
                Degraded
              </span>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-[#2a2a2e] rounded-lg transition-colors text-[#6b6b70] hover:text-[#f5f5f4]"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="font-mono text-2xl font-bold text-green-500">
                {status?.running ?? '-'}
              </span>
            </div>
            <p className="text-xs text-[#6b6b70]">Running</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="font-mono text-2xl font-bold text-blue-500">
                {status?.queueDepth ?? '-'}
              </span>
            </div>
            <p className="text-xs text-[#6b6b70]">Queued</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-2xl font-bold text-amber-500">
                {status ? formatMs(status.avgWaitMs) : '-'}
              </span>
            </div>
            <p className="text-xs text-[#6b6b70]">Avg Wait</p>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && metrics && (
        <div className="px-6 pb-6 border-t border-[#2a2a2e] pt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Processing Stats */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#a1a1aa] mb-3">Processing Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Jobs Processed</p>
                <p className="font-mono text-lg font-semibold">{metrics.totalJobsProcessed.toLocaleString()}</p>
              </div>
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Jobs Queued</p>
                <p className="font-mono text-lg font-semibold">{metrics.totalJobsQueued.toLocaleString()}</p>
              </div>
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Immediate Jobs</p>
                <p className="font-mono text-lg font-semibold">{metrics.totalJobsImmediate.toLocaleString()}</p>
              </div>
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Max Wait Time</p>
                <p className="font-mono text-lg font-semibold">{formatMs(metrics.maxWaitTimeMs)}</p>
              </div>
            </div>
          </div>

          {/* Running by Language */}
          {Object.keys(metrics.runningByLanguage).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#a1a1aa] mb-3">Running by Language</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(metrics.runningByLanguage).map(([lang, count]) => (
                  <span
                    key={lang}
                    className="px-3 py-1.5 bg-[#1c1c1f] rounded-lg text-sm"
                  >
                    <span className="text-[#f5f5f4] font-medium">{lang}</span>
                    <span className="text-[#6b6b70] ml-2">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Priority Stats */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#a1a1aa] mb-3">Priority Breakdown</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">High Priority</p>
                <p className="font-mono text-lg font-semibold text-amber-400">{metrics.highPriorityProcessed.toLocaleString()}</p>
              </div>
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Normal Priority</p>
                <p className="font-mono text-lg font-semibold">{metrics.normalPriorityProcessed.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Errors and Timeouts */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#a1a1aa] mb-3">Errors & Timeouts</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Total Errors</p>
                <p className={`font-mono text-lg font-semibold ${metrics.totalErrors > 0 ? 'text-red-400' : ''}`}>
                  {metrics.totalErrors.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Total Timeouts</p>
                <p className={`font-mono text-lg font-semibold ${metrics.totalTimeouts > 0 ? 'text-amber-400' : ''}`}>
                  {metrics.totalTimeouts.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Security Metrics */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#a1a1aa] mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Metrics
            </h4>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Total Scans</p>
                <p className="font-mono text-lg font-semibold">{metrics.security.totalScans.toLocaleString()}</p>
              </div>
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Rejections</p>
                <p className={`font-mono text-lg font-semibold ${metrics.security.totalRejections > 0 ? 'text-red-400' : ''}`}>
                  {metrics.security.totalRejections.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1c1c1f] rounded-lg p-3">
                <p className="text-xs text-[#6b6b70] mb-1">Rejection Rate</p>
                <p className="font-mono text-lg font-semibold">{metrics.security.rejectionRate}</p>
              </div>
            </div>

            {/* Recent Violations */}
            {metrics.security.recentViolations.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                <h5 className="text-xs font-medium text-red-400 mb-2">Recent Violations</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {metrics.security.recentViolations.slice(0, 5).map((violation, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <span className="text-[#6b6b70]">{formatTime(violation.timestamp)}</span>
                        <span className="px-1.5 py-0.5 bg-[#2a2a2e] rounded">{violation.language}</span>
                      </div>
                      <p className="text-red-300 mt-0.5">{violation.violations.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="mb-6 text-xs text-[#6b6b70]">
            <p>Last job processed: {formatTime(metrics.lastJobProcessedAt)}</p>
            <p>Service started: {formatTime(metrics.serviceStartedAt)}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => fetchMetrics()}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleResetMetrics}
              disabled={resetting}
              className="btn-secondary text-sm flex items-center gap-2 text-amber-400 hover:text-amber-300"
            >
              {resetting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Reset Metrics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueStatusCard;
