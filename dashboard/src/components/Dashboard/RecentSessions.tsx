// components/Dashboard/RecentSessions.tsx - FIXED to work standalone
import React from 'react';
import { Clock, Play, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TestSession } from '../../types';

interface RecentSessionsProps {
  sessions: TestSession[];
}

// Check if session has basic required data
const hasBasicSessionData = (session: any): boolean => {
  return session &&
    session.testSnapshot &&
    session.testSnapshot.title &&
    session.startedAt;
};

// Calculate time remaining for display purposes only
const calculateDisplayTimeRemaining = (session: TestSession): number => {
  if (session.status !== 'inProgress' || !session.startedAt || !session.testSnapshot?.settings?.timeLimit) {
    return 0;
  }

  const startTime = new Date(session.startedAt).getTime();
  const now = Date.now();
  const timeLimitMs = session.testSnapshot.settings.timeLimit * 60 * 1000;
  const elapsedMs = now - startTime;
  const remainingMs = Math.max(0, timeLimitMs - elapsedMs);

  return Math.floor(remainingMs / 1000);
};

export const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions }) => {
  const navigate = useNavigate();

  const getStatusBadgeClass = (status: string): string => {
    const classes: Record<string, string> = {
      completed: 'badge-green',
      inProgress: 'badge-amber',
      abandoned: 'badge-red',
      expired: 'badge-gray'
    };
    return classes[status] || 'badge-gray';
  };

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0m';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate time spent for completed sessions
  const getTimeSpent = (session: TestSession): number => {
    if (session.status === 'completed' && session.startedAt && session.completedAt) {
      return Math.floor((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000);
    }
    return 0;
  };

  return (
    <div className="card h-full">
      <div className="p-4 border-b border-[#2a2a2e]">
        <h5 className="font-mono text-lg font-semibold flex items-center gap-2 mb-0">
          <Clock className="w-5 h-5 text-amber-500" />
          Recent Sessions
        </h5>
      </div>
      <div className="p-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-[#6b6b70] mx-auto mb-3" />
            <p className="text-[#a1a1aa]">No recent sessions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2e]">
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Test</th>
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Status</th>
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 5).map((session) => {
                  const hasData = hasBasicSessionData(session);

                  // Calculate time remaining for in-progress sessions
                  let timeRemaining = 0;
                  if (session.status === 'inProgress' && hasData) {
                    timeRemaining = calculateDisplayTimeRemaining(session);
                  }

                  const isExpired = session.status === 'inProgress' && hasData && timeRemaining <= 0;

                  return (
                    <tr key={session._id} className="border-b border-[#2a2a2e] last:border-0">
                      <td className="py-2">
                        <div>
                          <small className="block text-[#f5f5f4]">{session.testSnapshot?.title || 'Test'}</small>
                          <small className="text-[#6b6b70]">Attempt #{session.attemptNumber}</small>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={getStatusBadgeClass(isExpired ? 'expired' : session.status)}>
                          {isExpired ? 'expired' : session.status}
                        </span>

                        {/* Show time remaining for in-progress sessions */}
                        {session.status === 'inProgress' && hasData && !isExpired && timeRemaining > 0 && (
                          <div className="mt-1">
                            <small className="text-amber-400">
                              {formatTimeRemaining(timeRemaining)} left
                            </small>
                          </div>
                        )}

                        {/* Show loading for incomplete data */}
                        {session.status === 'inProgress' && !hasData && (
                          <div className="mt-1">
                            <small className="text-[#6b6b70]">Loading...</small>
                          </div>
                        )}

                        {/* Show expired state */}
                        {isExpired && (
                          <div className="mt-1">
                            <small className="text-red-400">Time expired</small>
                          </div>
                        )}

                        {/* Show final score for completed sessions */}
                        {session.status === 'completed' && session.finalScore && (
                          <div className="mt-1">
                            <small className={session.finalScore.passed ? 'text-green-400' : 'text-red-400'}>
                              {session.finalScore.percentage.toFixed(1)}%
                              {session.finalScore.passed ? ' (Passed)' : ' (Failed)'}
                            </small>
                          </div>
                        )}
                      </td>
                      <td className="py-2">
                        {session.status === 'inProgress' && !isExpired ? (
                          <button
                            className="btn-primary text-xs flex items-center gap-1"
                            onClick={() => navigate(`/test-session/${session._id}`)}
                          >
                            <Play className="w-3 h-3" />
                            Resume
                          </button>
                        ) : isExpired ? (
                          <button
                            className="btn-secondary text-xs flex items-center gap-1 opacity-50 cursor-not-allowed"
                            disabled
                          >
                            <Clock className="w-3 h-3" />
                            Expired
                          </button>
                        ) : session.status === 'completed' ? (
                          <div className="text-center">
                            <small className="text-[#6b6b70] block">
                              {formatDuration(getTimeSpent(session))}
                            </small>
                            <button
                              className="btn-secondary text-xs flex items-center gap-1"
                              onClick={() => navigate(`/results/${session._id}`)}
                            >
                              <BarChart3 className="w-3 h-3" />
                              View
                            </button>
                          </div>
                        ) : (
                          <small className="text-[#6b6b70]">
                            {session.status === 'abandoned' ? 'Abandoned' : 'N/A'}
                          </small>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Show all sessions link if there are more */}
        {sessions.length > 5 && (
          <div className="text-center mt-4">
            <button
              className="btn-secondary text-sm"
              onClick={() => navigate('/results')}
            >
              View All Sessions ({sessions.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
