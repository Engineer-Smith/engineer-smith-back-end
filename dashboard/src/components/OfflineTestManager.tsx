import {
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  RefreshCw,
  Wifi,
  WifiOff,
  X,
  Loader2
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface OfflineManagerProps {
  isTestActive: boolean;
  sessionId: string;
}

interface ConnectionState {
  isOnline: boolean;
  wasOffline: boolean;
  offlineStartTime: number | null;
  offlineDuration: number;
  reconnectAttempts: number;
  lastSuccessfulSync: number;
  maxOfflineTime: number;
}

const OfflineTestManager: React.FC<OfflineManagerProps> = ({
  isTestActive,
  sessionId
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    offlineStartTime: null,
    offlineDuration: 0,
    reconnectAttempts: 0,
    lastSuccessfulSync: Date.now(),
    maxOfflineTime: 10 * 60 * 1000 // 10 minutes max offline time
  });

  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showReconnectedModal, setShowReconnectedModal] = useState(false);
  const [showMaxOfflineModal, setShowMaxOfflineModal] = useState(false);
  const [isTestPaused, setIsTestPaused] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  const reconnectTimeoutRef = useRef<number | null>(null);
  const offlineTimerRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const maxOfflineTimeoutRef = useRef<number | null>(null);

  // Enhanced connection detection with heartbeat
  const checkConnectionHealth = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Connection health check failed:', error);
      return false;
    }
  }, []);

  // Handle going offline
  const handleOffline = useCallback(() => {
    const now = Date.now();
    setConnectionState(prev => ({
      ...prev,
      isOnline: false,
      wasOffline: true,
      offlineStartTime: now,
      reconnectAttempts: 0
    }));

    // Pause the test immediately
    if (isTestActive && !isTestPaused) {
      setIsTestPaused(true);
      window.dispatchEvent(new CustomEvent('testPaused', {
        detail: { reason: 'offline', timestamp: now }
      }));
    }

    // Save current test state to localStorage
    const testState = {
      sessionId,
      timestamp: now,
      paused: true,
      reason: 'offline'
    };
    localStorage.setItem(`offline_test_${sessionId}`, JSON.stringify(testState));

    // Show offline modal
    setShowOfflineModal(true);

    // Start offline duration timer
    if (offlineTimerRef.current) clearInterval(offlineTimerRef.current);
    offlineTimerRef.current = window.setInterval(() => {
      setConnectionState(prev => {
        const newDuration = prev.offlineStartTime ? Date.now() - prev.offlineStartTime : 0;
        return { ...prev, offlineDuration: newDuration };
      });
    }, 1000);

    // Set maximum offline time timeout
    maxOfflineTimeoutRef.current = window.setTimeout(() => {
      setShowMaxOfflineModal(true);
    }, connectionState.maxOfflineTime);

    // Start reconnection attempts
    attemptReconnection();
  }, [isTestActive, isTestPaused, sessionId, connectionState.maxOfflineTime]);

  // Handle coming back online
  const handleOnline = useCallback(async () => {
    // Verify connection is actually working
    const isHealthy = await checkConnectionHealth();
    if (!isHealthy) {
      console.warn('Connection restored but health check failed');
      return;
    }

    // Clear all timers
    if (offlineTimerRef.current) {
      clearInterval(offlineTimerRef.current);
      offlineTimerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (maxOfflineTimeoutRef.current) {
      clearTimeout(maxOfflineTimeoutRef.current);
      maxOfflineTimeoutRef.current = null;
    }

    const offlineDuration = connectionState.offlineStartTime ?
      Date.now() - connectionState.offlineStartTime : 0;

    setConnectionState(prev => ({
      ...prev,
      isOnline: true,
      offlineStartTime: null,
      reconnectAttempts: 0,
      offlineDuration: 0
    }));

    // Close offline modals
    setShowOfflineModal(false);
    setShowMaxOfflineModal(false);

    // Sync offline data if any
    if (offlineQueue.length > 0) {
      await syncOfflineData();
    }

    // Dispatch event to notify parent about reconnection
    window.dispatchEvent(new CustomEvent('testReconnected', {
      detail: {
        offlineDuration,
        queuedActions: offlineQueue.length,
        timestamp: Date.now()
      }
    }));

    // Show reconnection modal
    setShowReconnectedModal(true);
  }, [checkConnectionHealth, offlineQueue, connectionState.offlineStartTime]);

  // Attempt to reconnect with exponential backoff
  const attemptReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    reconnectTimeoutRef.current = window.setTimeout(async () => {
      setConnectionState(prev => ({
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1
      }));

      const isHealthy = await checkConnectionHealth();
      if (isHealthy) {
        handleOnline();
      } else {
        // Exponential backoff: 2s, 4s, 8s, 16s, then 30s intervals
        const attempt = connectionState.reconnectAttempts;
        const delay = Math.min(2000 * Math.pow(2, Math.min(attempt, 4)), 30000);
        setTimeout(attemptReconnection, delay);
      }
    }, 2000);
  }, [connectionState.reconnectAttempts, checkConnectionHealth, handleOnline]);

  // Queue offline actions
  const queueOfflineAction = useCallback((action: any) => {
    setOfflineQueue(prev => [...prev, {
      ...action,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    }]);
  }, []);

  // Sync offline data when connection restored
  const syncOfflineData = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    setSyncingData(true);
    try {
      for (const item of offlineQueue) {
        await fetch('/api/test-sessions/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            ...item,
            timestamp: item.timestamp,
            wasOffline: true
          })
        });
      }

      setOfflineQueue([]);
      setConnectionState(prev => ({
        ...prev,
        lastSuccessfulSync: Date.now()
      }));
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    } finally {
      setSyncingData(false);
    }
  }, [offlineQueue, sessionId]);

  // Resume test after reconnection
  const handleResumeTest = useCallback(() => {
    if (connectionState.isOnline && isTestPaused) {
      setIsTestPaused(false);
      setShowReconnectedModal(false);

      window.dispatchEvent(new CustomEvent('testResumed', {
        detail: {
          offlineDuration: connectionState.offlineDuration,
          timestamp: Date.now()
        }
      }));

      localStorage.removeItem(`offline_test_${sessionId}`);
    }
  }, [connectionState.isOnline, connectionState.offlineDuration, isTestPaused, sessionId]);

  // Manual reconnection attempt
  const handleManualReconnect = useCallback(async () => {
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    const isHealthy = await checkConnectionHealth();
    if (isHealthy) {
      handleOnline();
    } else {
      attemptReconnection();
    }
  }, [checkConnectionHealth, handleOnline, attemptReconnection]);

  // Handle maximum offline time reached
  const handleMaxOfflineReached = useCallback(() => {
    window.dispatchEvent(new CustomEvent('testForceSubmit', {
      detail: {
        reason: 'maxOfflineTimeReached',
        offlineDuration: connectionState.offlineDuration,
        timestamp: Date.now()
      }
    }));
  }, [connectionState.offlineDuration]);

  // Set up event listeners
  useEffect(() => {
    const handleOnlineEvent = () => handleOnline();
    const handleOfflineEvent = () => handleOffline();

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);

    if (isTestActive) {
      heartbeatRef.current = window.setInterval(async () => {
        if (navigator.onLine && connectionState.isOnline) {
          const isHealthy = await checkConnectionHealth();
          if (!isHealthy && connectionState.isOnline) {
            handleOffline();
          }
        }
      }, 30000);
    }

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);

      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (offlineTimerRef.current) clearInterval(offlineTimerRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (maxOfflineTimeoutRef.current) clearTimeout(maxOfflineTimeoutRef.current);
    };
  }, [handleOnline, handleOffline, checkConnectionHealth, connectionState.isOnline, isTestActive]);

  // Expose queue function to parent via custom events
  useEffect(() => {
    const handleQueueAction = (event: CustomEvent) => {
      queueOfflineAction(event.detail);
    };

    window.addEventListener('queueOfflineAction', handleQueueAction as EventListener);

    return () => {
      window.removeEventListener('queueOfflineAction', handleQueueAction as EventListener);
    };
  }, [queueOfflineAction]);

  // Format offline duration
  const formatOfflineDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getReconnectDelay = () => {
    const attempt = connectionState.reconnectAttempts;
    return Math.min(2000 * Math.pow(2, Math.min(attempt, 4)), 30000) / 1000;
  };

  const offlineProgress = (connectionState.offlineDuration / connectionState.maxOfflineTime) * 100;

  return (
    <>
      {/* Connection Status Indicator */}
      <div
        className={`fixed top-0 right-0 m-3 px-3 py-2 rounded-full flex items-center text-sm text-white z-50 ${
          connectionState.isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        {connectionState.isOnline ? (
          <>
            <Wifi size={16} className="mr-1" />
            Connected
          </>
        ) : (
          <>
            <WifiOff size={16} className="mr-1" />
            Offline
            {connectionState.reconnectAttempts > 0 && (
              <span className="ml-1">
                (#{connectionState.reconnectAttempts})
              </span>
            )}
          </>
        )}
      </div>

      {/* Test Paused Indicator */}
      {isTestPaused && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-3 px-4 py-3 bg-amber-500 text-[#0a0a0b] rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <Pause size={20} className="mr-2" />
            <strong>Test Paused</strong>
            <span className="ml-2">- Connection lost</span>
          </div>
        </div>
      )}

      {/* Offline Modal */}
      {showOfflineModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
              <WifiOff size={24} className="text-red-400" />
              <h5 className="font-semibold text-[#f5f5f4]">Connection Lost</h5>
            </div>
            <div className="p-4">
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                <strong className="text-amber-400">Your test has been automatically paused</strong>
              </div>

              <div className="mb-4">
                <p className="text-[#a1a1aa] mb-2">Don't worry! Your progress has been saved locally and your test timer is paused.</p>
                <ul className="text-[#a1a1aa] space-y-1 text-sm">
                  <li>All answers saved to device storage</li>
                  <li>Test timer paused automatically</li>
                  <li>Attempting to reconnect...</li>
                  <li>Time offline will be added back to your test</li>
                </ul>
              </div>

              <div className="bg-[#1a1a1e] p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[#6b6b70]">Offline Duration:</span>
                  <span className="font-bold text-[#f5f5f4]">{formatOfflineDuration(connectionState.offlineDuration)}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[#6b6b70]">Reconnect Attempts:</span>
                  <span className="text-[#f5f5f4]">{connectionState.reconnectAttempts}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[#6b6b70]">Queued Actions:</span>
                  <span className="text-[#f5f5f4]">{offlineQueue.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b70]">Next attempt in:</span>
                  <span className="text-[#f5f5f4]">{getReconnectDelay()}s</span>
                </div>
              </div>

              {/* Connection progress indicator */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2 text-xs text-[#6b6b70]">
                  <span>Max offline time:</span>
                  <span>{formatOfflineDuration(connectionState.maxOfflineTime)}</span>
                </div>
                <div className="progress-bar h-1.5">
                  <div
                    className={`progress-fill ${offlineProgress > 80 ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${offlineProgress}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-blue-400" />
                  <small className="text-[#6b6b70]">
                    Attempting to reconnect... (attempt #{connectionState.reconnectAttempts + 1})
                  </small>
                </div>
                <button
                  className="btn-secondary text-sm"
                  onClick={handleManualReconnect}
                >
                  <RefreshCw size={14} className="mr-1" />
                  Try Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maximum Offline Time Modal */}
      {showMaxOfflineModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-400" />
              <h5 className="font-semibold text-[#f5f5f4]">Maximum Offline Time Reached</h5>
            </div>
            <div className="p-4">
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <strong className="text-red-400">You've been offline for too long</strong>
              </div>

              <div className="mb-4">
                <p className="text-[#a1a1aa] mb-3">For test integrity, there's a maximum time you can be offline during a test.</p>
                <div className="bg-[#1a1a1e] p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-[#6b6b70]">Time offline:</span>
                    <span className="font-bold text-red-400">
                      {formatOfflineDuration(connectionState.offlineDuration)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[#6b6b70] text-sm">
                Your test will be automatically submitted with your current progress.
              </p>
            </div>
            <div className="p-4 border-t border-[#2a2a2e] flex justify-end">
              <button className="btn-danger" onClick={handleMaxOfflineReached}>
                Submit Test Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconnected Modal */}
      {showReconnectedModal && (
        <div className="modal-backdrop" onClick={() => setShowReconnectedModal(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={24} className="text-green-400" />
                <h5 className="font-semibold text-[#f5f5f4]">Connection Restored</h5>
              </div>
              <button
                className="text-[#6b6b70] hover:text-[#f5f5f4]"
                onClick={() => setShowReconnectedModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/25 rounded-lg flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <strong className="text-green-400">Welcome back! Your connection has been restored.</strong>
              </div>

              <div className="mb-4">
                <p className="text-[#a1a1aa] mb-2">Your test progress has been preserved:</p>
                <ul className="text-[#a1a1aa] space-y-1 text-sm">
                  <li>All offline answers will be synced</li>
                  <li>Time spent offline: {formatOfflineDuration(connectionState.offlineDuration)}</li>
                  <li>You can continue exactly where you left off</li>
                </ul>
              </div>

              {syncingData && (
                <div className="bg-[#1a1a1e] p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 size={14} className="animate-spin text-blue-400" />
                    <span className="text-[#a1a1aa]">Syncing offline data...</span>
                  </div>
                  <div className="progress-bar h-1">
                    <div className="progress-fill bg-blue-500 animate-pulse w-full" />
                  </div>
                </div>
              )}

              {offlineQueue.length > 0 && (
                <div className="bg-[#1a1a1e] p-3 rounded-lg mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b70]">Actions to sync:</span>
                    <span className="font-bold text-[#f5f5f4]">{offlineQueue.length}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#2a2a2e] flex justify-end">
              <button
                className="btn-primary"
                onClick={handleResumeTest}
                disabled={syncingData}
              >
                <Play size={16} className="mr-2" />
                Resume Test
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Hook for using offline management in test session
export const useOfflineTestManager = (sessionId: string) => {
  const [isTestPaused, setIsTestPaused] = useState(false);
  const [offlineTimeToAdd, setOfflineTimeToAdd] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  const queueOfflineAction = useCallback((action: any) => {
    window.dispatchEvent(new CustomEvent('queueOfflineAction', { detail: action }));

    setOfflineQueue(prev => [...prev, {
      ...action,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    }]);
  }, []);

  useEffect(() => {
    const handleTestPaused = () => {
      setIsTestPaused(true);
    };

    const handleTestResumed = (event: CustomEvent) => {
      setIsTestPaused(false);
      setOfflineTimeToAdd(event.detail.offlineDuration);
    };

    const handleTestReconnected = () => {
      setOfflineQueue([]);
    };

    const handleTestForceSubmit = (event: CustomEvent) => {
      window.dispatchEvent(new CustomEvent('forceSubmitTest', { detail: event.detail }));
    };

    window.addEventListener('testPaused', handleTestPaused as EventListener);
    window.addEventListener('testResumed', handleTestResumed as EventListener);
    window.addEventListener('testReconnected', handleTestReconnected as EventListener);
    window.addEventListener('testForceSubmit', handleTestForceSubmit as EventListener);

    return () => {
      window.removeEventListener('testPaused', handleTestPaused as EventListener);
      window.removeEventListener('testResumed', handleTestResumed as EventListener);
      window.removeEventListener('testReconnected', handleTestReconnected as EventListener);
      window.removeEventListener('testForceSubmit', handleTestForceSubmit as EventListener);
    };
  }, []);

  const OfflineManagerComponent = useCallback((props: any) => (
    <OfflineTestManager
      {...props}
      sessionId={sessionId}
    />
  ), [sessionId]);

  return {
    OfflineTestManager: OfflineManagerComponent,
    isTestPaused,
    offlineTimeToAdd,
    queueOfflineAction,
    offlineQueue
  };
};

export default OfflineTestManager;
