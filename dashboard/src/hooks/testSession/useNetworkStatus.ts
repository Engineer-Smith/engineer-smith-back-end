// src/hooks/testSession/useNetworkStatus.ts - ENHANCED for simplified backend (optional)
import { useState, useEffect, useRef, useCallback } from 'react';

export interface NetworkStatusInfo {
  isOnline: boolean;
  lastOnlineAt?: Date;
  lastOfflineAt?: Date;
  isReconnecting?: boolean;
  offlineDuration?: number; // seconds
}

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | undefined>();
  const [lastOfflineAt, setLastOfflineAt] = useState<Date | undefined>();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [offlineDuration, setOfflineDuration] = useState<number>(0);
  
  const offlineTimerRef = useRef<number | null>(null);

  const clearOfflineTimer = useCallback(() => {
    if (offlineTimerRef.current) {
      clearInterval(offlineTimerRef.current);
      offlineTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      const now = new Date();
      
      setIsOnline(true);
      setLastOnlineAt(now);
      setIsReconnecting(false);
      clearOfflineTimer();
      
      // Calculate how long we were offline
      if (lastOfflineAt) {
        const duration = Math.floor((now.getTime() - lastOfflineAt.getTime()) / 1000);
        setOfflineDuration(duration);
      }
    };

    const handleOffline = () => {
      const now = new Date();
      
      setIsOnline(false);
      setLastOfflineAt(now);
      setIsReconnecting(false);
      setOfflineDuration(0);
      
      // Start tracking offline duration
      clearOfflineTimer();
      offlineTimerRef.current = window.setInterval(() => {
        if (lastOfflineAt) {
          const duration = Math.floor((Date.now() - lastOfflineAt.getTime()) / 1000);
          setOfflineDuration(duration);
        }
      }, 1000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearOfflineTimer();
    };
  }, [lastOfflineAt, clearOfflineTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearOfflineTimer();
    };
  }, [clearOfflineTimer]);

  const networkInfo: NetworkStatusInfo = {
    isOnline,
    lastOnlineAt,
    lastOfflineAt,
    isReconnecting,
    offlineDuration
  };

  return {
    isOnline,
    networkInfo,
    
    // Helper methods
    isWithinGracePeriod: offlineDuration <= 300, // 5 minutes
    timeUntilGraceExpires: Math.max(0, 300 - offlineDuration),
    hasBeenOfflineTooLong: offlineDuration > 300,
    
    // For manual reconnection attempts
    setReconnecting: setIsReconnecting,
  };
};

// Simple version (your current implementation is fine!)
export const useSimpleNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};