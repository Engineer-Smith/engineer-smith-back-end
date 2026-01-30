// components/Dashboard/RecentActivity.tsx
import React from 'react';
import { History, Play, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TestSession } from '../../types';

interface RecentActivityProps {
  sessions: TestSession[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ sessions }) => {
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

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

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
          <History className="w-5 h-5 text-blue-500" />
          Recent Test Activity
        </h5>
      </div>
      <div className="p-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-8 h-8 text-[#6b6b70] mx-auto mb-3" />
            <p className="text-[#a1a1aa]">No test activity yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2e]">
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Test</th>
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Status</th>
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Score</th>
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 5).map((session) => (
                  <tr key={session._id} className="border-b border-[#2a2a2e] last:border-0">
                    <td className="py-2">
                      <div>
                        <small className="block font-medium text-[#f5f5f4]">{session.testSnapshot?.title || 'Test'}</small>
                        <small className="text-[#6b6b70]">
                          Attempt #{session.attemptNumber} • {new Date(session.startedAt).toLocaleDateString()}
                        </small>
                      </div>
                    </td>
                    <td className="py-2">
                      <span className={getStatusBadgeClass(session.status)}>
                        {session.status}
                      </span>
                      {session.status === 'completed' && (
                        <div className="mt-1">
                          <small className="text-[#6b6b70]">
                            {formatDuration(getTimeSpent(session))}
                          </small>
                        </div>
                      )}
                    </td>
                    <td className="py-2">
                      {session.status === 'completed' && session.finalScore ? (
                        <div>
                          <small className={session.finalScore.passed ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                            {session.finalScore.percentage.toFixed(1)}%
                          </small>
                          <div>
                            <span className={session.finalScore.passed ? 'badge-green' : 'badge-red'}>
                              {session.finalScore.passed ? 'Pass' : 'Fail'}
                            </span>
                          </div>
                        </div>
                      ) : session.status === 'inProgress' ? (
                        <small className="text-amber-400">In progress</small>
                      ) : (
                        <small className="text-[#6b6b70]">—</small>
                      )}
                    </td>
                    <td className="py-2">
                      {session.status === 'inProgress' ? (
                        <button
                          className="btn-primary text-xs flex items-center gap-1"
                          onClick={() => navigate(`/test-session/${session._id}`)}
                        >
                          <Play className="w-3 h-3" />
                          Resume
                        </button>
                      ) : session.status === 'completed' ? (
                        <button
                          className="btn-secondary text-xs flex items-center gap-1"
                          onClick={() => {
                            // FIXED: Navigate to results page, let it handle finding the result
                            navigate('/results', {
                              state: { highlightSession: session._id }
                            });
                          }}
                        >
                          <BarChart3 className="w-3 h-3" />
                          View
                        </button>
                      ) : (
                        <small className="text-[#6b6b70]">—</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sessions.length > 5 && (
          <div className="text-center mt-4">
            <button
              className="btn-secondary text-sm"
              onClick={() => navigate('/results')}
            >
              View All Results ({sessions.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
