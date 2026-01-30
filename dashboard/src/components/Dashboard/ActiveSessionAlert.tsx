// components/Dashboard/ActiveSessionAlert.tsx - FIXED to work standalone
import React from 'react';
import { Clock, AlertTriangle, Play, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import type { TestSession } from '../../types';

interface ActiveSessionAlertProps {
  activeSession: TestSession | null;
  onResumeSession: () => void;
}

export const ActiveSessionAlert: React.FC<ActiveSessionAlertProps> = ({
  activeSession,
  onResumeSession
}) => {
  if (!activeSession) return null;

  // FIXED: Get basic connection/network data from SocketContext (always available)
  const { networkStatus, connectionStatus } = useSocket();

  // Calculate time remaining for the session
  const calculateTimeRemaining = (): number => {
    if (!activeSession.startedAt || !activeSession.testSnapshot?.settings?.timeLimit) {
      return 0;
    }

    const startTime = new Date(activeSession.startedAt).getTime();
    const now = Date.now();
    const timeLimitMs = activeSession.testSnapshot.settings.timeLimit * 60 * 1000;
    const elapsedMs = now - startTime;
    const remainingMs = Math.max(0, timeLimitMs - elapsedMs);

    return Math.floor(remainingMs / 1000);
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

  const timeRemaining = calculateTimeRemaining();

  // Determine alert color and status
  const getAlertClasses = () => {
    if (!networkStatus.isOnline) return 'bg-cyan-500/10 border-cyan-500/25';
    if (timeRemaining <= 300) return 'bg-red-500/10 border-red-500/25'; // Less than 5 minutes
    if (timeRemaining <= 900) return 'bg-amber-500/10 border-amber-500/25'; // Less than 15 minutes
    return 'bg-blue-500/10 border-blue-500/25';
  };

  const getTextColor = () => {
    if (!networkStatus.isOnline) return 'text-cyan-400';
    if (timeRemaining <= 300) return 'text-red-400';
    if (timeRemaining <= 900) return 'text-amber-400';
    return 'text-blue-400';
  };

  const getStatusMessage = () => {
    if (!networkStatus.isOnline) {
      return 'You are offline - session may be paused';
    }
    if (!connectionStatus.isConnected) {
      return 'Connection lost - session may be paused';
    }
    if (timeRemaining <= 60) {
      return 'URGENT: Less than 1 minute remaining!';
    }
    if (timeRemaining <= 300) {
      return 'Warning: Less than 5 minutes remaining';
    }
    return 'Your test session is active';
  };

  const isExpired = timeRemaining <= 0;

  if (isExpired) {
    return (
      <div className="mb-4 p-4 rounded border bg-red-500/10 border-red-500/25">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="font-mono text-sm font-semibold mb-1 text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Test session expired
            </h6>
            <p className="mb-2 text-[#a1a1aa]">
              <strong className="text-[#f5f5f4]">{activeSession.testSnapshot?.title}</strong> - Attempt #{activeSession.attemptNumber}
            </p>
            <p className="mb-0 text-sm text-[#6b6b70]">
              Your test session has expired and should be auto-submitted.
            </p>
          </div>
          <div>
            <button className="btn-secondary opacity-50 cursor-not-allowed flex items-center gap-2" disabled>
              <Clock className="w-4 h-4" />
              Expired
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 p-4 rounded border ${getAlertClasses()}`}>
      <div className="flex justify-between items-center">
        <div>
          <h6 className={`font-mono text-sm font-semibold mb-1 flex items-center gap-2 ${getTextColor()}`}>
            <Clock className="w-4 h-4" />
            {getStatusMessage()}
          </h6>
          <p className="mb-2 text-[#a1a1aa]">
            <strong className="text-[#f5f5f4]">{activeSession.testSnapshot?.title}</strong> - Attempt #{activeSession.attemptNumber}
          </p>

          {/* Time remaining display */}
          <div className="mb-0 text-sm">
            <span className="text-[#a1a1aa]">Time remaining: </span>
            <strong className={timeRemaining <= 300 ? 'text-red-400' : 'text-[#f5f5f4]'}>
              {formatTimeRemaining(timeRemaining)}
            </strong>
          </div>

          {/* Connection status indicators */}
          {!networkStatus.isOnline && (
            <div className="mt-1 text-sm text-amber-400 flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              You are offline - timer may be paused
            </div>
          )}

          {networkStatus.isOnline && !connectionStatus.isConnected && (
            <div className="mt-1 text-sm text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Connection lost - attempting to reconnect
            </div>
          )}

          {/* Status info */}
          {networkStatus.isOnline && connectionStatus.isConnected && (
            <div className="mt-1 text-sm text-[#6b6b70] flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Connected - resume to see live timer
            </div>
          )}
        </div>

        <div>
          <button
            className={`flex items-center gap-2 ${timeRemaining <= 300 ? 'btn-danger' : 'btn-primary'}`}
            onClick={onResumeSession}
          >
            <Play className="w-4 h-4" />
            {timeRemaining <= 300 ? 'Resume NOW!' : 'Resume Test'}
          </button>
        </div>
      </div>
    </div>
  );
};
