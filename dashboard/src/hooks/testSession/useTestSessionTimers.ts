// src/hooks/testSession/useTestSessionTimers.ts - FIXED with backup local timer
import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';

export interface TimerDisplayState {
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  currentSection?: {
    index: number;
    name?: string;
  };
  formatTimeRemaining: () => string;
  isLowTime: boolean;
  isCriticalTime: boolean;
  isWarningTime: boolean;
  serverTime?: number;
  type?: string;
}

/**
 * FIXED: Timer hook with backup local countdown
 * - Works even when socket is disconnected
 * - Syncs with socket when available
 * - Falls back to local countdown when socket unavailable
 */
export const useTestSessionTimers = (contextTimeRemaining?: number | null): TimerDisplayState => {
  const { timerState, networkStatus, connectionStatus } = useSocket();

  // Client-side countdown state
  const [clientTimeRemaining, setClientTimeRemaining] = useState(0);
  const [localTimerActive, setLocalTimerActive] = useState(false);
  const countdownRef = useRef<number | null>(null);
  const lastSyncRef = useRef<{ time: number; timestamp: number } | null>(null);
  const initializedRef = useRef(false);

  // Initialize timer from context (API response) - this is the primary source
  useEffect(() => {
    if (contextTimeRemaining !== null && contextTimeRemaining !== undefined && contextTimeRemaining > 0) {
      setClientTimeRemaining(contextTimeRemaining);
      lastSyncRef.current = { time: contextTimeRemaining, timestamp: Date.now() };
      setLocalTimerActive(true);
      initializedRef.current = true;
    }
  }, [contextTimeRemaining]);

  // Sync with socket timer updates when available
  useEffect(() => {
    if (timerState.timeRemaining > 0 && connectionStatus.isConnected) {
      setClientTimeRemaining(timerState.timeRemaining);
      lastSyncRef.current = { time: timerState.timeRemaining, timestamp: Date.now() };
    }
  }, [timerState.timeRemaining, connectionStatus.isConnected]);

  // Clear countdown interval
  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Client-side countdown - runs independently of socket
  useEffect(() => {
    // Determine if timer should be running
    // Run if: we have time remaining AND (socket says active OR local timer is active) AND online
    const shouldRun = clientTimeRemaining > 0 &&
      (timerState.isActive || localTimerActive) &&
      networkStatus.isOnline &&
      !timerState.isPaused;

    if (!shouldRun) {
      clearCountdown();
      return;
    }

    // Don't start a new interval if one is already running
    if (countdownRef.current) {
      return;
    }

    countdownRef.current = window.setInterval(() => {
      setClientTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          clearCountdown();
          setLocalTimerActive(false);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearCountdown();
    };
  }, [
    clientTimeRemaining > 0, // Only re-run when transitioning to/from 0
    timerState.isActive,
    timerState.isPaused,
    localTimerActive,
    networkStatus.isOnline,
    clearCountdown
  ]);

  // Pause/resume based on network status
  useEffect(() => {
    if (!networkStatus.isOnline && countdownRef.current) {
      clearCountdown();
    }
  }, [networkStatus.isOnline, clearCountdown]);

  // Format time function
  const formatTimeRemaining = useCallback((): string => {
    const time = clientTimeRemaining;
    if (time <= 0) return '0:00';

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [clientTimeRemaining]);

  // Time warning calculations
  const isLowTime = useMemo(() => {
    return clientTimeRemaining <= 300 && clientTimeRemaining > 60; // 5 minutes
  }, [clientTimeRemaining]);

  const isCriticalTime = useMemo(() => {
    return clientTimeRemaining <= 60 && clientTimeRemaining > 0; // 1 minute
  }, [clientTimeRemaining]);

  const isWarningTime = useMemo(() => {
    return clientTimeRemaining <= 900 && clientTimeRemaining > 300; // 15 minutes
  }, [clientTimeRemaining]);

  // Timer is active if we have time and either socket or local timer says so
  const isActive = useMemo(() => {
    return (timerState.isActive || localTimerActive) &&
           networkStatus.isOnline &&
           clientTimeRemaining > 0;
  }, [timerState.isActive, localTimerActive, networkStatus.isOnline, clientTimeRemaining]);

  const isPaused = useMemo(() => {
    return timerState.isPaused || !networkStatus.isOnline;
  }, [timerState.isPaused, networkStatus.isOnline]);

  return {
    timeRemaining: clientTimeRemaining,
    isActive,
    isPaused,
    currentSection: timerState.currentSection,
    formatTimeRemaining,
    isLowTime,
    isCriticalTime,
    isWarningTime,
    serverTime: timerState.serverTime,
    type: timerState.type
  };
};
