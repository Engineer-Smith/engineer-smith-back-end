// src/contexts/NotificationContext.tsx - REFACTORED to use SocketContext
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/ApiService';
import type {
    AttemptRequest,
    GrantAttemptsDirectlyData,
    Notification,
    NotificationContextType,
    NotificationType,
    ReviewAttemptRequestData,
    StudentTestOverride,
    SubmitAttemptRequestData
} from '../types/notifications';
import { useSocket } from './SocketContext'; // Use SocketContext instead of direct socketService

// =====================
// TYPES (unchanged)
// =====================

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    pendingRequests: AttemptRequest[];
    userRequests: AttemptRequest[];
    overrides: StudentTestOverride[];
}

type NotificationAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'SET_UNREAD_COUNT'; payload: number }
    | { type: 'MARK_NOTIFICATION_READ'; payload: string }
    | { type: 'MARK_ALL_READ' }
    | { type: 'SET_PENDING_REQUESTS'; payload: AttemptRequest[] }
    | { type: 'SET_USER_REQUESTS'; payload: AttemptRequest[] }
    | { type: 'ADD_ATTEMPT_REQUEST'; payload: AttemptRequest }
    | { type: 'UPDATE_ATTEMPT_REQUEST'; payload: { id: string; updates: Partial<AttemptRequest> } }
    | { type: 'SET_OVERRIDES'; payload: StudentTestOverride[] }
    | { type: 'ADD_OVERRIDE'; payload: StudentTestOverride }
    | { type: 'UPDATE_OVERRIDE'; payload: { id: string; updates: Partial<StudentTestOverride> } }
    | { type: 'REMOVE_OVERRIDE'; payload: string };

// =====================
// UTILITY FUNCTIONS (unchanged)
// =====================

function convertToNotification(apiData: any): Notification {
    return {
        _id: apiData._id || `socket-${Date.now()}-${Math.random()}`,
        recipientId: apiData.recipientId || apiData.recipient_id,
        senderId: apiData.senderId || apiData.sender_id,
        organizationId: apiData.organizationId,
        type: apiData.type as NotificationType,
        title: apiData.title,
        message: apiData.message,
        relatedModel: apiData.relatedModel,
        relatedId: apiData.relatedId,
        actionUrl: apiData.actionUrl,
        actionText: apiData.actionText,
        isRead: apiData.isRead || false,
        readAt: apiData.readAt,
        createdAt: apiData.createdAt || new Date().toISOString(),
        updatedAt: apiData.updatedAt || new Date().toISOString(),
        sender: apiData.sender,
        source: apiData.source || 'database' // Track if from socket or database
    };
}

function convertToOverride(apiData: any): StudentTestOverride {
    return {
        _id: apiData._id,
        userId: apiData.userId,
        testId: apiData.testId,
        organizationId: apiData.organizationId,
        extraAttempts: apiData.extraAttempts,
        reason: apiData.reason,
        grantedBy: apiData.grantedBy,
        grantedAt: apiData.grantedAt,
        expiresAt: apiData.expiresAt,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
        user: apiData.user,
        test: apiData.test,
        granter: apiData.granter
    };
}

// =====================
// INITIAL STATE & REDUCER (unchanged)
// =====================

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pendingRequests: [],
    userRequests: [],
    overrides: []
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };

        case 'SET_NOTIFICATIONS':
            return { ...state, notifications: action.payload, loading: false };

        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [action.payload, ...state.notifications],
                unreadCount: state.unreadCount + 1
            };

        case 'SET_UNREAD_COUNT':
            return { ...state, unreadCount: action.payload };

        case 'MARK_NOTIFICATION_READ':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n._id === action.payload ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            };

        case 'MARK_ALL_READ':
            return {
                ...state,
                notifications: state.notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
                unreadCount: 0
            };

        case 'SET_PENDING_REQUESTS':
            return { ...state, pendingRequests: action.payload };

        case 'SET_USER_REQUESTS':
            return { ...state, userRequests: action.payload };

        case 'ADD_ATTEMPT_REQUEST':
            return {
                ...state,
                userRequests: [action.payload, ...state.userRequests],
                pendingRequests: action.payload.status === 'pending'
                    ? [action.payload, ...state.pendingRequests]
                    : state.pendingRequests
            };

        case 'UPDATE_ATTEMPT_REQUEST':
            const updateRequests = (requests: AttemptRequest[]) =>
                requests.map(r => r._id === action.payload.id ? { ...r, ...action.payload.updates } : r);

            return {
                ...state,
                pendingRequests: updateRequests(state.pendingRequests),
                userRequests: updateRequests(state.userRequests)
            };

        case 'SET_OVERRIDES':
            return { ...state, overrides: action.payload };

        case 'ADD_OVERRIDE':
            return { ...state, overrides: [action.payload, ...state.overrides] };

        case 'UPDATE_OVERRIDE':
            return {
                ...state,
                overrides: state.overrides.map(o =>
                    o._id === action.payload.id ? { ...o, ...action.payload.updates } : o
                )
            };

        case 'REMOVE_OVERRIDE':
            return {
                ...state,
                overrides: state.overrides.filter(o => o._id !== action.payload)
            };

        default:
            return state;
    }
}

// =====================
// CONTEXT
// =====================

const NotificationContext = createContext<NotificationContextType | null>(null);

// =====================
// PROVIDER - REFACTORED to use SocketContext
// =====================

interface NotificationProviderProps {
    children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [state, dispatch] = useReducer(notificationReducer, initialState);
    const { user } = useAuth();

    // USE SOCKET CONTEXT instead of managing socket directly
    const {
        isConnected,
        registerEventHandlers
    } = useSocket();

    // =====================
    // API FUNCTIONS (updated to use socket from context)
    // =====================

    const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const result = await ApiService.getNotifications({ page, limit });

            const notifications = result.notifications.map(convertToNotification);
            dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });

            // Get accurate unread count from database
            const unreadResult = await ApiService.getUnreadNotificationCount();
            const unreadCount = unreadResult.count || result.notifications.filter(n => !n.isRead).length;
            dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });

        } catch (error) {
            console.error('Error fetching notifications:', error);
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch notifications' });
        }
    }, [user]);

    const fetchPendingRequests = useCallback(async () => {
        if (!user || !['instructor', 'admin'].includes(user.role)) {
            return;
        }

        try {
            const requests = await ApiService.getPendingAttemptRequests();
            dispatch({ type: 'SET_PENDING_REQUESTS', payload: requests });
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    }, [user]);

    const fetchUserRequests = useCallback(async () => {
        try {
            const requests = await ApiService.getUserAttemptRequests();
            dispatch({ type: 'SET_USER_REQUESTS', payload: requests });
        } catch (error) {
            console.error('Error fetching user requests:', error);
        }
    }, []);

    const fetchOverrides = useCallback(async () => {
        if (!user || !['instructor', 'admin'].includes(user.role)) {
            return;
        }

        try {
            const overrides = await ApiService.getStudentOverrides();
            const convertedOverrides = overrides.map(convertToOverride);
            dispatch({ type: 'SET_OVERRIDES', payload: convertedOverrides });
        } catch (error) {
            console.error('Error fetching overrides:', error);
        }
    }, [user]);

    // =====================
    // ACTIONS (simplified - no more socket connection management)
    // =====================

    const markAsRead = useCallback(async (id: string) => {
        try {
            // Optimistically update frontend immediately
            dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });

            // Update backend
            await ApiService.markNotificationAsRead(id);

            // If using socket, also notify server via socket for real-time badge updates
            if (isConnected) {
                const socketService = (await import('../services/SocketService')).default;
                await socketService.markNotificationAsRead(id);
            }

        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert optimistic update on error by refreshing from server
            fetchNotifications();
        }
    }, [isConnected, fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        try {

            if (isConnected) {
                const socketService = (await import('../services/SocketService')).default;

                try {
                    await socketService.markAllNotificationsAsRead();
                    // Update will come through socket listener
                } catch (socketError) {
                    console.warn('📖 NotificationContext: Socket method failed, falling back to HTTP:', socketError);
                    await ApiService.markAllNotificationsAsRead();
                    dispatch({ type: 'MARK_ALL_READ' });
                }
            } else {
                await ApiService.markAllNotificationsAsRead();
                dispatch({ type: 'MARK_ALL_READ' });
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [isConnected]);

    const submitAttemptRequest = useCallback(async (data: SubmitAttemptRequestData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            if (isConnected) {
                // Import socketService and make the actual call
                const socketService = (await import('../services/SocketService')).default;

                try {
                    await socketService.submitAttemptRequest(data);
                    // Response will come through event handlers
                } catch (socketError) {
                    console.warn('📤 NotificationContext: Socket method failed, falling back to HTTP:', socketError);
                    await ApiService.submitAttemptRequest(data);
                    await fetchUserRequests();
                }
            } else {
                await ApiService.submitAttemptRequest(data);
                await fetchUserRequests();
            }
        } catch (error) {
            console.error('Error submitting attempt request:', error);
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to submit request' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [isConnected, fetchUserRequests]);

    const reviewAttemptRequest = useCallback(async (data: ReviewAttemptRequestData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            if (isConnected) {
                const socketService = (await import('../services/SocketService')).default;

                try {
                    await socketService.reviewAttemptRequest(data);
                    // Response will come through event handlers
                } catch (socketError) {
                    console.warn('📝 NotificationContext: Socket method failed, falling back to HTTP:', socketError);
                    await ApiService.reviewAttemptRequest(data.requestId, {
                        decision: data.decision,
                        reviewNotes: data.reviewNotes
                    });
                    await fetchPendingRequests();
                }
            } else {
                await ApiService.reviewAttemptRequest(data.requestId, {
                    decision: data.decision,
                    reviewNotes: data.reviewNotes
                });
                await fetchPendingRequests();
            }
        } catch (error) {
            console.error('Error reviewing attempt request:', error);
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to review request' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [isConnected, fetchPendingRequests]);

    const grantAttemptsDirectly = useCallback(async (data: GrantAttemptsDirectlyData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            if (isConnected) {
                const socketService = (await import('../services/SocketService')).default;

                try {
                    await socketService.grantAttemptsDirectly(data);
                    // Response will come through event handlers
                } catch (socketError) {
                    console.warn('🎁 NotificationContext: Socket method failed, falling back to HTTP:', socketError);
                    const result = await ApiService.grantAttemptsDirectly(data);
                    if (result.override) {
                        const convertedOverride = convertToOverride(result.override);
                        dispatch({ type: 'ADD_OVERRIDE', payload: convertedOverride });
                    }
                }
            } else {
                const result = await ApiService.grantAttemptsDirectly(data);
                if (result.override) {
                    const convertedOverride = convertToOverride(result.override);
                    dispatch({ type: 'ADD_OVERRIDE', payload: convertedOverride });
                }
            }
        } catch (error) {
            console.error('Error granting attempts:', error);
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to grant attempts' });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [isConnected]);

    const reconnect = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            // Role-based data fetching
            const promises = [fetchNotifications(), fetchUserRequests()];

            if (user && ['instructor', 'admin'].includes(user.role)) {
                promises.push(fetchPendingRequests(), fetchOverrides());
            }

            await Promise.all(promises);
        } catch (error) {
            console.error('Error reconnecting:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to reconnect' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [fetchNotifications, fetchPendingRequests, fetchUserRequests, fetchOverrides, user]);

    // =====================
    // SOCKET EVENT HANDLERS - Using SocketContext
    // =====================

    // Complete updated useEffect for NotificationContext.tsx

    useEffect(() => {
        if (!user || !isConnected) {
            return;
        }

        // Register notification-specific event handlers with SocketContext
        const unregisterHandlers = registerEventHandlers({
            // Session error handling
            onSessionError: (data) => {
                console.error('Session error in notifications:', data);
                dispatch({ type: 'SET_ERROR', payload: data.message });
            },

            // UPDATED: Notification events with proper targeting
            onNotificationReceived: (notification) => {

                // FIXED: Validate this notification is for current user
                if (notification.recipientId !== user._id) {
                    return;
                }

                try {
                    const convertedNotification = convertToNotification(notification);

                    dispatch({ type: 'ADD_NOTIFICATION', payload: convertedNotification });

                    // Show browser notification
                    if ('Notification' in window && window.Notification.permission === 'granted') {
                        new window.Notification(notification.title, {
                            body: notification.message,
                            icon: '/favicon.ico',
                            tag: `notification-${notification.relatedId}` // Prevent duplicates
                        });
                    }
                } catch (convertError) {
                    console.error('🔔 Error converting notification:', convertError);
                }
            },

            onNotificationBadgeUpdate: (data) => {
                dispatch({ type: 'SET_UNREAD_COUNT', payload: data.unreadCount });
            },

            onNotificationsUnreadCount: (data) => {
                dispatch({ type: 'SET_UNREAD_COUNT', payload: data.count });
            },

            onNotificationsRecent: (data) => {

                // UPDATED: Apply proper filtering for recent notifications from database
                const filteredNotifications = data.notifications.filter((notification: any) => {
                    // For database notifications, check recipientId directly
                    return notification.recipientId === user._id;
                });

                const notifications = filteredNotifications.map(convertToNotification);
                dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
            },

            // Request events
            onAttemptRequestSubmitted: (data) => {
                if (data.success) {
                    fetchUserRequests();
                }
            },

            onAttemptRequestReviewed: (data) => {
                if (data.success && data.requestId) {
                    dispatch({
                        type: 'UPDATE_ATTEMPT_REQUEST',
                        payload: {
                            id: data.requestId,
                            updates: {
                                status: data.decision as any,
                                reviewedAt: new Date().toISOString()
                            }
                        }
                    });
                }
            },

            // Override events
            onOverrideGranted: (data) => {
                if (data.success && data.override) {
                    const convertedOverride = convertToOverride(data.override);
                    dispatch({ type: 'ADD_OVERRIDE', payload: convertedOverride });
                }
            }
        });

        return unregisterHandlers;
    }, [user, isConnected, registerEventHandlers, fetchUserRequests]);

    // =====================
    // INITIALIZATION - Simplified
    // =====================

    // Complete updated useEffect for NotificationContext.tsx

    useEffect(() => {
        if (!user || !isConnected) {
            return;
        }

        // Register notification-specific event handlers with SocketContext
        const unregisterHandlers = registerEventHandlers({
            // Session error handling
            onSessionError: (data) => {
                console.error('Session error in notifications:', data);
                dispatch({ type: 'SET_ERROR', payload: data.message });
            },

            // UPDATED: Notification events with proper targeting
            onNotificationReceived: (notification) => {

                // FIXED: Validate this notification is for current user
                if (notification.recipientId !== user._id) {
                    return;
                }

                try {
                    const convertedNotification = convertToNotification(notification);

                    dispatch({ type: 'ADD_NOTIFICATION', payload: convertedNotification });

                    // Show browser notification
                    if ('Notification' in window && window.Notification.permission === 'granted') {
                        new window.Notification(notification.title, {
                            body: notification.message,
                            icon: '/favicon.ico',
                            tag: `notification-${notification.relatedId}` // Prevent duplicates
                        });
                    }
                } catch (convertError) {
                    console.error('🔔 Error converting notification:', convertError);
                }
            },

            onNotificationBadgeUpdate: (data) => {
                dispatch({ type: 'SET_UNREAD_COUNT', payload: data.unreadCount });
            },

            onNotificationsUnreadCount: (data) => {
                dispatch({ type: 'SET_UNREAD_COUNT', payload: data.count });
            },

            onNotificationsRecent: (data) => {

                // UPDATED: Apply proper filtering for recent notifications from database
                const filteredNotifications = data.notifications.filter((notification: any) => {
                    // For database notifications, check recipientId directly
                    return notification.recipientId === user._id;
                });

                const notifications = filteredNotifications.map(convertToNotification);
                dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
            },

            // Request events
            onAttemptRequestSubmitted: (data) => {
                if (data.success) {
                    fetchUserRequests();
                }
            },

            onAttemptRequestReviewed: (data) => {
                if (data.success && data.requestId) {
                    dispatch({
                        type: 'UPDATE_ATTEMPT_REQUEST',
                        payload: {
                            id: data.requestId,
                            updates: {
                                status: data.decision as any,
                                reviewedAt: new Date().toISOString()
                            }
                        }
                    });
                }
            },

            // Override events
            onOverrideGranted: (data) => {
                if (data.success && data.override) {
                    const convertedOverride = convertToOverride(data.override);
                    dispatch({ type: 'ADD_OVERRIDE', payload: convertedOverride });
                }
            }
        });

        return unregisterHandlers;
    }, [user, isConnected, registerEventHandlers, fetchUserRequests]);


    // Add this useEffect for initialization - fetch notifications on page load
    useEffect(() => {
        if (!user) {
            return;
        }

        // Fetch initial notifications from database
        fetchNotifications()

        // Fetch other data based on role
        const promises = [fetchUserRequests()];
        if (['instructor', 'admin'].includes(user.role)) {
            promises.push(fetchPendingRequests(), fetchOverrides());
        }

        Promise.all(promises).catch(error => {
            console.error('Failed to initialize notification data:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load notifications' });
        });

    }, [user, fetchNotifications, fetchUserRequests, fetchPendingRequests, fetchOverrides]);

    // =====================
    // CONTEXT VALUE
    // =====================

    const contextValue: NotificationContextType = {
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        loading: state.loading,
        error: state.error,
        isConnected, // From SocketContext

        markAsRead,
        markAllAsRead,
        fetchNotifications,
        submitAttemptRequest,
        reviewAttemptRequest,
        grantAttemptsDirectly,
        reconnect
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
}

// =====================
// HOOK
// =====================

export function useNotifications(): NotificationContextType {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}