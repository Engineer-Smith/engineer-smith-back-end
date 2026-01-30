import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Eye,
    Pause,
    Play,
    Users,
    X,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import apiService from '../services/ApiService';
import type { SessionStatus } from '../types';

// Define the populated session interface that matches server response
export interface PopulatedSession {
    _id: string;
    testId: string;
    testTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    organizationId: string;
    organizationName: string;
    attemptNumber: number;
    status: SessionStatus;
    startedAt: string;
    completedAt?: string;
    finalScore?: any;
    isConnected: boolean;
    lastConnectedAt?: string;
    currentQuestionIndex: number;
    answeredQuestions: number[];
    completedSections: number[];
    currentSectionIndex: number;
    testSnapshot: any;
}

interface SessionWithTestInfo extends PopulatedSession {
    progress: number;
    lastActivity: Date;
}

const LiveSessionMonitor: React.FC = () => {
    const [sessions, setSessions] = useState<SessionWithTestInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSession, setSelectedSession] = useState<SessionWithTestInfo | null>(null);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchActiveSessions();
    }, []);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchActiveSessions();
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const fetchActiveSessions = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get active sessions using the actual API service
            const allSessions = await apiService.getPopulatedTestSessions({
                status: 'inProgress',
                limit: 100
            }) as PopulatedSession[];

            // The sessions already come with populated user/test/org data from the server
            const sessionsWithInfo: SessionWithTestInfo[] = allSessions.map(session => {
                // Calculate progress using current question vs total
                const totalQuestions = session.testSnapshot?.totalQuestions || 0;
                const currentQuestionIndex = session.currentQuestionIndex || 0;
                const answeredQuestions = session.answeredQuestions?.length || 0;
                const questionsProgressed = Math.max(currentQuestionIndex, answeredQuestions);
                const progress = totalQuestions > 0 ? Math.round((questionsProgressed / totalQuestions) * 100) : 0;

                return {
                    ...session,
                    progress,
                    lastActivity: new Date(session.lastConnectedAt || session.startedAt)
                };
            });

            setSessions(sessionsWithInfo);
        } catch (err) {
            console.error('Failed to fetch active sessions:', err);
            setError('Failed to fetch active sessions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: SessionStatus, lastActivity: Date) => {
        const minutesSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / 60000);

        if (status === 'paused') {
            return (
                <span className="badge-amber flex items-center gap-1">
                    <Pause className="w-3 h-3" />
                    Paused
                </span>
            );
        }

        if (minutesSinceActivity > 5) {
            return (
                <span className="badge-red flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Inactive
                </span>
            );
        }

        return (
            <span className="badge-green flex items-center gap-1">
                <Play className="w-3 h-3" />
                Active
            </span>
        );
    };

    const getProgressColor = (progress: number) => {
        if (progress < 30) return 'bg-red-500';
        if (progress < 70) return 'bg-amber-500';
        return 'bg-green-500';
    };

    const handleViewSession = (session: SessionWithTestInfo) => {
        setSelectedSession(session);
        setShowSessionModal(true);
    };

    const handleForceComplete = async (sessionId: string) => {
        if (!confirm('Are you sure you want to force complete this session? This action cannot be undone.')) {
            return;
        }

        try {
            // Use the submit endpoint with forceSubmit flag
            await apiService.submitTestSession(sessionId, { forceSubmit: true });
            alert(`Session ${sessionId} has been force completed`);
            fetchActiveSessions(); // Refresh the list
        } catch (err) {
            console.error('Failed to force complete session:', err);
            setError('Failed to force complete session');
        }
    };

    const activeSessions = sessions.filter(s => s.status === 'inProgress');
    const pausedSessions = sessions.filter(s => s.status === 'paused');
    const totalStudents = sessions.length;

    // Calculate average session time
    const averageSessionTime = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => {
            const sessionDuration = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
            return acc + sessionDuration;
        }, 0) / sessions.length / 60)
        : 0;

    return (
        <div className="min-h-screen bg-[#0a0a0b] py-8">
            <div className="container-section">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-1">Live Session Monitor</h2>
                        <p className="text-[#6b6b70]">Real-time monitoring of active testing sessions</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`btn-secondary text-sm flex items-center gap-2 ${autoRefresh ? 'ring-1 ring-amber-500/50' : ''}`}
                        >
                            <Activity className="w-4 h-4" />
                            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
                        </button>
                        <button
                            onClick={fetchActiveSessions}
                            disabled={loading}
                            className="btn-primary text-sm flex items-center gap-2"
                        >
                            {loading && <div className="spinner w-4 h-4" />}
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-blue-500/10">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-mono text-2xl font-bold text-[#f5f5f4]">{totalStudents}</h4>
                                <p className="text-sm text-[#6b6b70]">Total Students</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-green-500/10">
                                <Activity className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h4 className="font-mono text-2xl font-bold text-[#f5f5f4]">{activeSessions.length}</h4>
                                <p className="text-sm text-[#6b6b70]">Active Sessions</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-amber-500/10">
                                <Pause className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-mono text-2xl font-bold text-[#f5f5f4]">{pausedSessions.length}</h4>
                                <p className="text-sm text-[#6b6b70]">Paused Sessions</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-cyan-500/10">
                                <Clock className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h4 className="font-mono text-2xl font-bold text-[#f5f5f4]">{averageSessionTime}m</h4>
                                <p className="text-sm text-[#6b6b70]">Avg Session Time</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 mb-6">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">{error}</span>
                    </div>
                )}

                {/* Sessions Table */}
                <div className="card">
                    <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
                        <h5 className="font-mono font-semibold text-[#f5f5f4]">Current Testing Sessions</h5>
                        <span className="text-sm text-[#6b6b70]">
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="p-4">
                        {loading && sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="spinner mb-4 mx-auto" />
                                <p className="text-[#6b6b70]">Loading sessions...</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
                                <h6 className="text-[#6b6b70] font-medium">No Active Sessions</h6>
                                <p className="text-[#6b6b70] text-sm">All students have completed their tests</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#2a2a2e]">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Student</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Test</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Organization</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Progress</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Started</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Last Activity</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((session) => {
                                            const minutesSinceActivity = Math.floor(
                                                (Date.now() - session.lastActivity.getTime()) / 60000
                                            );

                                            return (
                                                <tr key={session._id} className="border-b border-[#1c1c1f] hover:bg-[#1c1c1f]/50 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <div className="font-medium text-[#f5f5f4]">{session.userName}</div>
                                                            <div className="text-sm text-[#6b6b70]">{session.userEmail}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-[#f5f5f4]">{session.testTitle}</div>
                                                        <div className="text-sm text-[#6b6b70]">
                                                            Question {session.currentQuestionIndex + 1}/{session.testSnapshot?.totalQuestions || 0}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm text-[#6b6b70]">{session.organizationName}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {getStatusBadge(session.status, session.lastActivity)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-[#2a2a2e] rounded-full overflow-hidden w-24">
                                                                <div
                                                                    className={`h-full ${getProgressColor(session.progress)} transition-all`}
                                                                    style={{ width: `${session.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-[#6b6b70]">{session.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm text-[#a1a1aa]">{new Date(session.startedAt).toLocaleDateString()}</div>
                                                        <div className="text-sm text-[#6b6b70]">{new Date(session.startedAt).toLocaleTimeString()}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`text-sm ${minutesSinceActivity > 5 ? 'text-red-400' : 'text-[#6b6b70]'}`}>
                                                            {minutesSinceActivity < 1 ? 'Just now' : `${minutesSinceActivity}m ago`}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleViewSession(session)}
                                                                className="p-2 hover:bg-[#2a2a2e] rounded-lg transition-colors text-blue-400"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleForceComplete(session._id)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                                                                title="Force Complete"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Session Detail Modal */}
                {showSessionModal && selectedSession && (
                    <div className="modal-backdrop flex items-center justify-center p-4">
                        <div className="modal-content w-full max-w-2xl">
                            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
                                <h3 className="font-mono font-semibold text-[#f5f5f4]">Session Details</h3>
                                <button
                                    onClick={() => setShowSessionModal(false)}
                                    className="text-[#6b6b70] hover:text-[#f5f5f4] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Student:</span>
                                            <p className="text-[#f5f5f4]">{selectedSession.userName}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Test:</span>
                                            <p className="text-[#f5f5f4]">{selectedSession.testTitle}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Started:</span>
                                            <p className="text-[#f5f5f4]">{new Date(selectedSession.startedAt).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Progress:</span>
                                            <p className="text-[#f5f5f4]">{selectedSession.currentQuestionIndex + 1}/{selectedSession.testSnapshot?.totalQuestions || 0} questions</p>
                                        </div>
                                        {selectedSession.testSnapshot?.sections && (
                                            <div>
                                                <span className="text-sm font-medium text-[#6b6b70]">Section:</span>
                                                <p className="text-[#f5f5f4]">{selectedSession.currentSectionIndex + 1}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">User ID:</span>
                                            <p className="text-[#f5f5f4] font-mono text-sm">{selectedSession.userId}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Organization:</span>
                                            <p className="text-[#f5f5f4]">{selectedSession.organizationName}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Attempt:</span>
                                            <p className="text-[#f5f5f4]">#{selectedSession.attemptNumber}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Status:</span>
                                            <div className="mt-1">{getStatusBadge(selectedSession.status, selectedSession.lastActivity)}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Answered Questions:</span>
                                            <p className="text-[#f5f5f4]">{selectedSession.answeredQuestions?.length || 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-[#6b6b70]">Connection Status:</span>
                                            <p className={selectedSession.isConnected ? 'text-green-400' : 'text-red-400'}>
                                                {selectedSession.isConnected ? 'Connected' : 'Disconnected'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 p-4 border-t border-[#2a2a2e]">
                                <button
                                    className="btn-secondary flex-1"
                                    onClick={() => setShowSessionModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    className="btn-primary bg-red-500 hover:bg-red-600 flex-1"
                                    onClick={() => {
                                        handleForceComplete(selectedSession._id);
                                        setShowSessionModal(false);
                                    }}
                                >
                                    Force Complete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveSessionMonitor;