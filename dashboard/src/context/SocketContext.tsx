// src/context/SocketContext.tsx - FIXED for graceful degradation and polling-only transport
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import socketService from '../services/SocketService';
import { useAuth } from './AuthContext';
import { useNetworkStatus } from '../hooks/testSession/useNetworkStatus';
import type { SessionErrorEvent } from '../types';

// Existing timer event interfaces...
interface TimerSyncEvent {
  sessionId: string;
  timeRemaining: number;
  serverTime: number;
  sectionIndex: number;
  type: string;
}

interface SectionExpiredEvent {
  sessionId: string;
  newSectionIndex: number;
  message: string;
  timestamp: string;
}

interface TestCompletedEvent {
  sessionId: string;
  message: string;
  result: any;
  timestamp: string;
}

// NEW: Notification event interfaces
interface NotificationReceivedEvent {
  _id?: string;
  recipientId?: string;
  senderId?: string;
  organizationId?: string;
  recipientRole?: string; // NEW: For socket-based role targeting
  type: string;
  title: string;
  message: string;
  relatedModel?: string;
  relatedId?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt?: string;
  sender?: any;
  data?: any;
}

interface NotificationBadgeUpdateEvent {
  unreadCount: number;
}

interface NotificationsUnreadCountEvent {
  count: number;
}

interface NotificationsRecentEvent {
  notifications: any[];
}

interface AttemptRequestEvent {
  success: boolean;
  requestId?: string;
  decision?: string;
  message?: string;
}

interface OverrideGrantedEvent {
  success: boolean;
  override?: any;
  message?: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  isOnline: boolean;
  sessionId?: string;
  lastConnectedAt?: Date;
  reconnectAttempts?: number;
  socketDisabled?: boolean; // NEW: Track if socket is intentionally disabled
  errorMessage?: string; // User-facing error when reconnection gives up
}

interface TimerState {
  timeRemaining: number;
  serverTime?: number;
  sectionIndex?: number;
  type?: string;
  isActive: boolean;
  isPaused: boolean;
  lastSyncTime?: number;
  lastSyncValue?: number;
  countdownStartTime?: number;
  currentSection?: {
    index: number;
    name?: string;
  };
}

// ENHANCED: Extended event handler interface
interface SocketContextType {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  networkStatus: ReturnType<typeof useNetworkStatus>;

  currentSessionId: string | null;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;

  timerState: TimerState;

  // ENHANCED: Support both timer and notification events
  registerEventHandlers: (handlers: {
    // Timer events
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;

    // Notification events
    onNotificationReceived?: (data: NotificationReceivedEvent) => void;
    onNotificationBadgeUpdate?: (data: NotificationBadgeUpdateEvent) => void;
    onNotificationsUnreadCount?: (data: NotificationsUnreadCountEvent) => void;
    onNotificationsRecent?: (data: NotificationsRecentEvent) => void;
    onAttemptRequestSubmitted?: (data: AttemptRequestEvent) => void;
    onAttemptRequestReviewed?: (data: AttemptRequestEvent) => void;
    onOverrideGranted?: (data: OverrideGrantedEvent) => void;
  }) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const networkStatus = useNetworkStatus();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isOnline: networkStatus.isOnline,
    reconnectAttempts: 0,
    socketDisabled: false,
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: 0,
    isActive: false,
    isPaused: false,
  });

  // FIXED: Track registration state to prevent duplicates
  const eventHandlerRefs = useRef<{
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;
    onNotificationReceived?: (data: NotificationReceivedEvent) => void;
    onNotificationBadgeUpdate?: (data: NotificationBadgeUpdateEvent) => void;
    onNotificationsUnreadCount?: (data: NotificationsUnreadCountEvent) => void;
    onNotificationsRecent?: (data: NotificationsRecentEvent) => void;
    onAttemptRequestSubmitted?: (data: AttemptRequestEvent) => void;
    onAttemptRequestReviewed?: (data: AttemptRequestEvent) => void;
    onOverrideGranted?: (data: OverrideGrantedEvent) => void;
  }>({});

  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);

  // FIXED: Track if base socket handlers are registered
  const baseHandlersRegistered = useRef<boolean>(false);
  
  // NEW: Track if socket has been disabled due to connection failures
  const socketDisabledRef = useRef<boolean>(false);
  const connectionAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MAX_CONNECTION_ATTEMPTS = 8;
  const INITIAL_BACKOFF_MS = 1000;
  const MAX_BACKOFF_MS = 60000;

  // Timer countdown functions (unchanged)
  const startCountdown = useCallback((initialTime: number, syncTime: number) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    const startTime = Date.now();

    countdownIntervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTimeRemaining = Math.max(0, initialTime - elapsed);

      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused) {
          return prev;
        }

        const isStillActive = newTimeRemaining > 0 && networkStatus.isOnline && connectionStatus.isConnected;

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          isActive: isStillActive,
        };
      });

      if (newTimeRemaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    setTimerState(prev => ({
      ...prev,
      lastSyncTime: syncTime,
      lastSyncValue: initialTime,
      countdownStartTime: startTime,
    }));
  }, [networkStatus.isOnline, connectionStatus.isConnected]);

  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Timer state management (unchanged)
  useEffect(() => {
    setTimerState(prev => {
      const shouldBePaused = !networkStatus.isOnline || !connectionStatus.isConnected;
      const shouldBeActive = prev.timeRemaining > 0 && !shouldBePaused;

      if (shouldBePaused && !prev.isPaused && countdownIntervalRef.current) {
        stopCountdown();
      }

      if (!shouldBePaused && prev.isPaused && prev.timeRemaining > 0) {
        startCountdown(prev.timeRemaining, Date.now());
      }

      return {
        ...prev,
        isPaused: shouldBePaused,
        isActive: shouldBeActive,
      };
    });
  }, [networkStatus.isOnline, connectionStatus.isConnected, startCountdown, stopCountdown]);

  // Network status updates (unchanged)
  useEffect(() => {
    setConnectionStatus(prev => {
      const newStatus = { ...prev, isOnline: networkStatus.isOnline };

      if (!networkStatus.isOnline && prev.isOnline) {
        toast.warning('You are offline. Your session will be paused.', {
          toastId: 'network-offline',
          autoClose: false,
        });
      } else if (networkStatus.isOnline && !prev.isOnline) {
        toast.success('You are back online. Reconnecting...', {
          toastId: 'network-online',
          autoClose: 3000,
        });
      }

      return newStatus;
    });
  }, [networkStatus.isOnline]);

  // FIXED: Socket connection management with graceful degradation
  useEffect(() => {
    if (!isAuthenticated || !user || !networkStatus.isOnline) {
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        sessionId: undefined
      }));
      setCurrentSessionId(null);

      // FIXED: Reset registration flag
      baseHandlersRegistered.current = false;

      stopCountdown();
      setTimerState({
        timeRemaining: 0,
        isActive: false,
        isPaused: false,
      });
      return;
    }

    // NEW: Skip connection if socket has been disabled
    if (socketDisabledRef.current) {
      return;
    }

    const connectSocket = async () => {
      try {
        // Get socket token through the API proxy
        let socketToken = null;
        try {
          const response = await fetch('/api/auth/socket-token', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            socketToken = data.socketToken;
          }
        } catch (tokenError) {
          console.warn('SocketProvider: Could not fetch socket token:', tokenError);
        }

        if (!socketToken) {
          console.warn('SocketProvider: No socket token available, continuing without real-time features');
          // Don't disable socket permanently for token issues - might be temporary
          return;
        }

        // Connect to socket via Cloudflare proxy
        await socketService.connect({
          url: import.meta.env.VITE_SOCKET_URL || '/',
          auth: { token: socketToken },
          transports: ['websocket', 'polling']
        });

        // Reset connection attempts and backoff on successful connection
        connectionAttemptsRef.current = 0;

        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          lastConnectedAt: new Date(),
          reconnectAttempts: 0,
          socketDisabled: false,
          errorMessage: undefined,
        }));

        // FIXED: Only register base handlers once per connection
        if (!baseHandlersRegistered.current) {

          const cleanupFunctions: (() => void)[] = [];

          // =====================
          // SESSION & TIMER EVENTS (existing)
          // =====================

          cleanupFunctions.push(
            socketService.onSessionJoined((data) => {
              toast.success(data.message || 'Successfully joined session');
            })
          );

          cleanupFunctions.push(
            socketService.onTimerSync((data: TimerSyncEvent) => {

              const syncTime = Date.now();

              setTimerState(prev => {
                const shouldBeActive = data.timeRemaining > 0 && networkStatus.isOnline && connectionStatus.isConnected;
                const shouldBePaused = !networkStatus.isOnline || !connectionStatus.isConnected;

                return {
                  ...prev,
                  timeRemaining: data.timeRemaining,
                  serverTime: data.serverTime,
                  sectionIndex: data.sectionIndex,
                  type: data.type,
                  isActive: shouldBeActive,
                  isPaused: shouldBePaused,
                  currentSection: data.sectionIndex !== undefined ? {
                    index: data.sectionIndex,
                    name: `Section ${data.sectionIndex + 1}`
                  } : prev.currentSection,
                };
              });

              if (data.timeRemaining > 0 && networkStatus.isOnline && connectionStatus.isConnected) {
                startCountdown(data.timeRemaining, syncTime);
              } else {
                stopCountdown();
              }

              if (eventHandlerRefs.current.onTimerSync) {
                eventHandlerRefs.current.onTimerSync(data);
              }
            })
          );

          cleanupFunctions.push(
            socketService.onSectionExpired((data: SectionExpiredEvent) => {

              stopCountdown();

              setTimerState(prev => ({
                ...prev,
                sectionIndex: data.newSectionIndex,
                currentSection: {
                  index: data.newSectionIndex,
                  name: `Section ${data.newSectionIndex + 1}`
                }
              }));

              toast.info(data.message, {
                position: 'top-center',
                toastId: `section-expired-${data.newSectionIndex}`
              });

              if (eventHandlerRefs.current.onSectionExpired) {
                eventHandlerRefs.current.onSectionExpired(data);
              }
            })
          );

          cleanupFunctions.push(
            socketService.onTestCompleted((data: TestCompletedEvent) => {

              stopCountdown();
              setCurrentSessionId(null);
              setTimerState({
                timeRemaining: 0,
                isActive: false,
                isPaused: false,
              });

              toast.success(data.message, {
                autoClose: false,
                position: 'top-center',
                toastId: 'test-completed'
              });

              if (eventHandlerRefs.current.onTestCompleted) {
                eventHandlerRefs.current.onTestCompleted(data);
              }
            })
          );

          cleanupFunctions.push(
            socketService.onSessionError((data: SessionErrorEvent) => {
              console.error('SocketProvider: Session error:', data);

              toast.error(data.message, {
                autoClose: 5000,
                position: 'top-center',
                toastId: 'session-error'
              });

              if (eventHandlerRefs.current.onSessionError) {
                eventHandlerRefs.current.onSessionError(data);
              }
            })
          );

          // =====================
          // NOTIFICATION EVENTS - FIXED: Single registration
          // =====================

          if (socketService.onNotificationReceived) {
            cleanupFunctions.push(
              socketService.onNotificationReceived((data: NotificationReceivedEvent) => {

                // FIXED: Only forward to registered handlers, don't process here
                if (eventHandlerRefs.current.onNotificationReceived) {
                  eventHandlerRefs.current.onNotificationReceived(data);
                }
              })
            );
          }

          if (socketService.onNotificationBadgeUpdate) {
            cleanupFunctions.push(
              socketService.onNotificationBadgeUpdate((data: NotificationBadgeUpdateEvent) => {

                if (eventHandlerRefs.current.onNotificationBadgeUpdate) {
                  eventHandlerRefs.current.onNotificationBadgeUpdate(data);
                }
              })
            );
          }

          if (socketService.onNotificationsUnreadCount) {
            cleanupFunctions.push(
              socketService.onNotificationsUnreadCount((data: NotificationsUnreadCountEvent) => {

                if (eventHandlerRefs.current.onNotificationsUnreadCount) {
                  eventHandlerRefs.current.onNotificationsUnreadCount(data);
                }
              })
            );
          }

          if (socketService.onNotificationsRecent) {
            cleanupFunctions.push(
              socketService.onNotificationsRecent((data: NotificationsRecentEvent) => {

                if (eventHandlerRefs.current.onNotificationsRecent) {
                  eventHandlerRefs.current.onNotificationsRecent(data);
                }
              })
            );
          }

          if (socketService.onAttemptRequestSubmitted) {
            cleanupFunctions.push(
              socketService.onAttemptRequestSubmitted((data: AttemptRequestEvent) => {

                if (eventHandlerRefs.current.onAttemptRequestSubmitted) {
                  eventHandlerRefs.current.onAttemptRequestSubmitted(data);
                }
              })
            );
          }

          if (socketService.onAttemptRequestReviewed) {
            cleanupFunctions.push(
              socketService.onAttemptRequestReviewed((data: AttemptRequestEvent) => {

                if (eventHandlerRefs.current.onAttemptRequestReviewed) {
                  eventHandlerRefs.current.onAttemptRequestReviewed(data);
                }
              })
            );
          }

          if (socketService.onOverrideGranted) {
            cleanupFunctions.push(
              socketService.onOverrideGranted((data: OverrideGrantedEvent) => {

                if (eventHandlerRefs.current.onOverrideGranted) {
                  eventHandlerRefs.current.onOverrideGranted(data);
                }
              })
            );
          }

          cleanupFunctionsRef.current = cleanupFunctions;
          baseHandlersRegistered.current = true;
        }

      } catch (error) {
        // NEW: Graceful degradation - don't crash the app, just disable socket
        console.warn('SocketProvider: Socket connection failed, continuing without real-time features:', error);
        
        connectionAttemptsRef.current += 1;

        if (connectionAttemptsRef.current >= MAX_CONNECTION_ATTEMPTS) {
          console.warn(`SocketProvider: Max connection attempts (${MAX_CONNECTION_ATTEMPTS}) reached, disabling socket`);
          socketDisabledRef.current = true;
          const errorMessage = 'Unable to connect. Please refresh the page or check your internet connection.';
          toast.error(errorMessage, { autoClose: false, toastId: 'socket-connection-failed' });
          setConnectionStatus(prev => ({
            ...prev,
            isConnected: false,
            socketDisabled: true,
            reconnectAttempts: connectionAttemptsRef.current,
            errorMessage,
          }));
        } else {
          setConnectionStatus(prev => ({
            ...prev,
            isConnected: false,
            reconnectAttempts: connectionAttemptsRef.current,
          }));
          // Schedule next reconnection with exponential backoff
          scheduleReconnect();
        }

        baseHandlersRegistered.current = false;
        // Don't throw - let app continue without socket
      }
    };

    const scheduleReconnect = () => {
      if (socketDisabledRef.current) return;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

      const attempt = connectionAttemptsRef.current;
      const delay = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
      console.log(`SocketProvider: Scheduling reconnect attempt ${attempt + 1}/${MAX_CONNECTION_ATTEMPTS} in ${delay}ms`);

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        if (socketDisabledRef.current) return;
        if (!networkStatus.isOnline || !isAuthenticated) return;

        const isConnected = socketService.isConnected();
        if (!isConnected) {
          baseHandlersRegistered.current = false;
          connectSocket();
        }
      }, delay);
    };

    connectSocket();

    // Lightweight status poll — only updates UI state, does NOT trigger reconnects.
    // Reconnects are driven by scheduleReconnect() with exponential backoff.
    const statusInterval = setInterval(() => {
      const isConnected = socketService.isConnected();
      setConnectionStatus(prev => {
        if (prev.isConnected === isConnected) return prev;
        return { ...prev, isConnected };
      });

      // If we lost the connection and no reconnect is pending, kick one off
      if (!isConnected && !socketDisabledRef.current && !reconnectTimeoutRef.current && networkStatus.isOnline && isAuthenticated) {
        baseHandlersRegistered.current = false;
        scheduleReconnect();
      }
    }, 5000);

    return () => {
      clearInterval(statusInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      baseHandlersRegistered.current = false;
      stopCountdown();
      socketService.disconnect();
    };
  }, [isAuthenticated, user, networkStatus.isOnline, startCountdown, stopCountdown]);

  // Session management (unchanged)
  useEffect(() => {
    setConnectionStatus(prev => ({
      ...prev,
      sessionId: currentSessionId || undefined,
    }));
  }, [currentSessionId]);

  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  // FIXED: joinSession now gracefully handles disabled socket
  const joinSession = useCallback(async (sessionId: string) => {
    // NEW: If socket is disabled, just track the session locally
    if (socketDisabledRef.current || !socketService.isConnected()) {
      setCurrentSessionId(sessionId);
      return;
    }

    try {
      await socketService.joinTestSession(sessionId);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('SocketProvider: Failed to join session', sessionId, error);
      // NEW: Don't throw - just track locally
      setCurrentSessionId(sessionId);
    }
  }, []);

  // FIXED: leaveSession now gracefully handles disabled socket
  const leaveSession = useCallback(async (sessionId: string) => {
    // NEW: If socket is disabled, just clear the session locally
    if (socketDisabledRef.current || !socketService.isConnected()) {
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        stopCountdown();
        setTimerState({
          timeRemaining: 0,
          isActive: false,
          isPaused: false,
        });
      }
      return;
    }

    try {
      await socketService.leaveTestSession(sessionId);

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        stopCountdown();
        setTimerState({
          timeRemaining: 0,
          isActive: false,
          isPaused: false,
        });
      }
    } catch (error) {
      console.error('SocketProvider: Failed to leave session', sessionId, error);
      // NEW: Clean up locally anyway
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        stopCountdown();
        setTimerState({
          timeRemaining: 0,
          isActive: false,
          isPaused: false,
        });
      }
    }
  }, [currentSessionId, stopCountdown]);

  // ENHANCED: Event handler registration for ALL events
  const registerEventHandlers = useCallback((handlers: {
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;
    onNotificationReceived?: (data: NotificationReceivedEvent) => void;
    onNotificationBadgeUpdate?: (data: NotificationBadgeUpdateEvent) => void;
    onNotificationsUnreadCount?: (data: NotificationsUnreadCountEvent) => void;
    onNotificationsRecent?: (data: NotificationsRecentEvent) => void;
    onAttemptRequestSubmitted?: (data: AttemptRequestEvent) => void;
    onAttemptRequestReviewed?: (data: AttemptRequestEvent) => void;
    onOverrideGranted?: (data: OverrideGrantedEvent) => void;
  }) => {

    // FIXED: Replace handlers instead of merging to prevent accumulation
    eventHandlerRefs.current = handlers;

    return () => {
      eventHandlerRefs.current = {};
    };
  }, []);

  const value: SocketContextType = {
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    networkStatus,
    currentSessionId,
    joinSession,
    leaveSession,
    timerState,
    registerEventHandlers,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Utility hooks (unchanged)
export const useSocketConnection = () => {
  const { connectionStatus, isConnected, networkStatus } = useSocket();

  const getConnectionMessage = () => {
    if (!networkStatus.isOnline) {
      return {
        type: 'warning' as const,
        message: 'You are offline. Your session is paused.',
        icon: 'wifi-off',
        gracePeriod: networkStatus.hasBeenOfflineTooLong ? 'expired' : 'active'
      };
    }

    // NEW: Show message if socket is disabled but online
    if (connectionStatus.socketDisabled) {
      return {
        type: 'info' as const,
        message: 'Real-time features unavailable. Test functionality works normally.',
        icon: 'info'
      };
    }

    if (!connectionStatus.isConnected) {
      return {
        type: 'danger' as const,
        message: 'Connection lost. Attempting to reconnect...',
        icon: 'wifi-off'
      };
    }

    return null;
  };

  return {
    connectionStatus,
    isConnected,
    networkStatus,
    isFullyConnected: networkStatus.isOnline && connectionStatus.isConnected,
    connectionMessage: getConnectionMessage(),
  };
};

export const useSocketSession = () => {
  const { currentSessionId, joinSession, leaveSession } = useSocket();

  return {
    currentSessionId,
    joinSession,
    leaveSession,
    hasActiveSession: !!currentSessionId,
  };
};