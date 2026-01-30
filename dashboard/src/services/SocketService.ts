// src/services/SocketService.ts - Complete implementation with notification support and transports option
import { io, Socket } from 'socket.io-client';
import type {
  NotificationSocketEvent,
  AttemptRequestSubmittedEvent,
  AttemptRequestReviewedEvent,
  AttemptRequestErrorEvent,
  OverrideGrantedEvent,
  OverrideErrorEvent,
  NotificationBadgeUpdateEvent,
  NotificationMarkedReadEvent,
  NotificationsAllMarkedReadEvent,
  NotificationsRecentEvent,
  SubmitAttemptRequestData,
  ReviewAttemptRequestData,
  GrantAttemptsDirectlyData
} from '../types/notifications';

// CORRECTED: Event interfaces to match server exactly
interface SessionJoinedEvent {
  sessionId: string;
  timestamp?: string;
  message: string;
  // Backend may include additional data from handleSocketJoin result
  [key: string]: any;
}

// CORRECTED: Backend sendTimerSync() sends this exact structure
interface TimerSyncEvent {
  sessionId: string;
  timeRemaining: number; // timerData.timeRemaining
  serverTime: number;    // Date.now()
  sectionIndex: number;  // timerData.sectionIndex || 0
  type: string;         // timerData.type || 'regular'
}

// CORRECTED: Backend sendTimerWarning() sends this
interface TimerWarningEvent {
  sessionId: string;
  timeRemaining: number;
  message: string;
  type: 'warning';
}

// CORRECTED: Backend sendSectionExpired() sends this exact structure  
interface SectionExpiredEvent {
  sessionId: string;
  message: string; // data.message || 'Section time expired'
  newSectionIndex: number; // data.newSectionIndex
  timestamp: string; // new Date().toISOString()
}

// CORRECTED: Backend sendTestCompleted() sends this exact structure
interface TestCompletedEvent {
  sessionId: string;
  message: string; // data.message || 'Test completed'
  result: any; // data.result  
  timestamp: string; // new Date().toISOString()
}

// CORRECTED: Backend session error events
interface SessionErrorEvent {
  sessionId: string;
  message: string;
  error: string;
  timestamp?: string;
}

// CORRECTED: Backend sends session:rejoined for rejoin confirmation
interface SessionRejoinedEvent {
  sessionId: string;
  message: string; // 'Successfully rejoined session'  
  timestamp?: string;
  // Backend includes additional data from handleSocketRejoin result
  [key: string]: any;
}

// Backend session pause/resume notifications
interface SessionPausedEvent {
  sessionId: string;
  reason: string; // data.reason || 'disconnection'
  gracePeriodSeconds: number; // data.gracePeriodSeconds || 300
  message: string; // data.message || 'Session paused due to disconnection'
}

interface SessionResumedEvent {
  sessionId: string;
  message: string; // data.message || 'Session resumed'
  [key: string]: any; // Additional data
}

// Backend answer processing events (if using socket submission)
interface AnswerProcessedEvent {
  sessionId: string;
  success: boolean;
  action: string; // result.action
  [key: string]: any; // ...result.data
}

interface AnswerErrorEvent {
  message: string;
  error: string;
}

// FIXED: Added transports option
interface SocketServiceConfig {
  url: string;
  auth?: {
    token?: string;
  };
  transports?: string[]; // NEW: Allow specifying transports (e.g., ['polling'] or ['websocket'])
}

class SocketService {
  private socket: Socket | null = null;
  private currentSessionId: string | null = null;

  // FIXED: Accept and use transports option
  async connect(config: SocketServiceConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(config.url, {
        withCredentials: true,
        auth: config.auth || { token: this.getAuthToken() },
        transports: config.transports || ['polling', 'websocket'] // NEW: Use provided transports or default
      });

      this.socket.on('connect', () => {
        this.setupNotificationEventHandlers();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('SocketService: Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (_reason) => {

      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.currentSessionId) {
      await this.leaveTestSession(this.currentSessionId);
    }
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.currentSessionId = null;
  }

  // =====================
  // TEST SESSION MANAGEMENT
  // =====================

  // CORRECTED: Session management using exact backend event names
  async joinTestSession(sessionId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.currentSessionId = sessionId;
    
    // ✅ Backend expects 'session:join'
    this.socket.emit('session:join', { sessionId });
  }

  async rejoinTestSession(sessionId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.currentSessionId = sessionId;
    
    // ✅ Backend expects 'session:rejoin'
    this.socket.emit('session:rejoin', { sessionId });
  }

  async leaveTestSession(sessionId: string): Promise<void> {
    if (!this.socket?.connected) return;
    
    // Backend doesn't have explicit leave handler, but emit anyway for completeness
    this.socket.emit('session:leave', { sessionId });
    
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }

  // Submit answer via socket (optional - your app uses REST)
  async submitAnswer(sessionId: string, answerData: any): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    
    // ✅ Backend expects 'answer:submit'
    this.socket.emit('answer:submit', {
      sessionId,
      ...answerData
    });
  }

  // Manual timer sync request  
  async requestTimerSync(sessionId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    
    // ✅ Backend expects 'timer:request_sync'
    this.socket.emit('timer:request_sync', { sessionId });
  }

  // =====================
  // NOTIFICATION EVENT HANDLERS SETUP
  // =====================

  private setupNotificationEventHandlers(): void {
    if (!this.socket) return;

    // Set up automatic unread count refresh on connect
    this.getUnreadNotificationCount();

  }

  // =====================
  // TEST SESSION EVENT LISTENERS
  // =====================

  // ✅ Backend emits 'session:joined'
  onSessionJoined(callback: (data: SessionJoinedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:joined', callback);
    return () => this.socket?.off('session:joined', callback);
  }

  // ✅ Backend emits 'session:rejoined'  
  onSessionRejoined(callback: (data: SessionRejoinedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:rejoined', callback);
    return () => this.socket?.off('session:rejoined', callback);
  }

  // ✅ Backend emits 'timer:sync' via sendTimerSync()
  onTimerSync(callback: (data: TimerSyncEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('timer:sync', callback);
    return () => this.socket?.off('timer:sync', callback);
  }

  // ✅ Backend emits 'timer:warning' via sendTimerWarning()
  onTimerWarning(callback: (data: TimerWarningEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('timer:warning', callback);
    return () => this.socket?.off('timer:warning', callback);
  }

  // ✅ Backend emits 'section:expired' via sendSectionExpired()
  onSectionExpired(callback: (data: SectionExpiredEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('section:expired', callback);
    return () => this.socket?.off('section:expired', callback);
  }

  // ✅ Backend emits 'test:completed' via sendTestCompleted()
  onTestCompleted(callback: (data: TestCompletedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('test:completed', callback);
    return () => this.socket?.off('test:completed', callback);
  }

  // ✅ Backend emits 'session:error'
  onSessionError(callback: (data: SessionErrorEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:error', callback);
    return () => this.socket?.off('session:error', callback);
  }

  // ✅ Backend emits 'session:paused' via sendSessionPaused()
  onSessionPaused(callback: (data: SessionPausedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:paused', callback);
    return () => this.socket?.off('session:paused', callback);
  }

  // ✅ Backend emits 'session:resumed' via sendSessionResumed()
  onSessionResumed(callback: (data: SessionResumedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:resumed', callback);
    return () => this.socket?.off('session:resumed', callback);
  }

  // =====================
  // SOCKET-BASED ANSWER SUBMISSION EVENTS (if you use them)
  // =====================

  // ✅ Backend emits 'answer:processed' after socket answer submission
  onAnswerProcessed(callback: (data: AnswerProcessedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('answer:processed', callback);
    return () => this.socket?.off('answer:processed', callback);
  }

  // ✅ Backend emits 'answer:error' on socket answer submission failure
  onAnswerError(callback: (data: AnswerErrorEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('answer:error', callback);
    return () => this.socket?.off('answer:error', callback);
  }

  // ✅ Backend emits 'question:next' for socket-based navigation
  onQuestionNext(callback: (data: any) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('question:next', callback);
    return () => this.socket?.off('question:next', callback);
  }

  // ✅ Backend emits 'section:transition' for socket-based navigation  
  onSectionTransition(callback: (data: any) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('section:transition', callback);
    return () => this.socket?.off('section:transition', callback);
  }

  // ✅ Backend emits 'test:ready_for_completion' for socket-based flow
  onTestReadyForCompletion(callback: (data: any) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('test:ready_for_completion', callback);
    return () => this.socket?.off('test:ready_for_completion', callback);
  }

  // =====================
  // NOTIFICATION EVENT LISTENERS
  // =====================

  /**
   * Listen for new notifications
   */
  onNotificationReceived(callback: (notification: NotificationSocketEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('notification:new', callback);
    return () => this.socket?.off('notification:new', callback);
  }

  /**
   * Listen for notification badge updates
   */
  onNotificationBadgeUpdate(callback: (data: NotificationBadgeUpdateEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('notification:badge_update', callback);
    return () => this.socket?.off('notification:badge_update', callback);
  }

  /**
   * Listen for refresh badge requests (for instructors)
   */
  onNotificationRefreshBadge(callback: () => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('notification:refresh_badge', callback);
    return () => this.socket?.off('notification:refresh_badge', callback);
  }

  /**
   * Listen for notification marked as read confirmations
   */
  onNotificationMarkedRead(callback: (data: NotificationMarkedReadEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('notification:marked_read', callback);
    return () => this.socket?.off('notification:marked_read', callback);
  }

  /**
   * Listen for all notifications marked as read confirmations
   */
  onNotificationsAllMarkedRead(callback: (data: NotificationsAllMarkedReadEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('notifications:all_marked_read', callback);
    return () => this.socket?.off('notifications:all_marked_read', callback);
  }

  /**
   * Listen for recent notifications response
   */
  onNotificationsRecent(callback: (data: NotificationsRecentEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('notifications:recent', callback);
    return () => this.socket?.off('notifications:recent', callback);
  }

  /**
   * Listen for unread count updates
   */
  onNotificationsUnreadCount(callback: (data: { count: number }) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('notifications:unread_count', callback);
    return () => this.socket?.off('notifications:unread_count', callback);
  }

  // =====================
  // ATTEMPT REQUEST EVENT LISTENERS
  // =====================

  /**
   * Listen for attempt request submission confirmations
   */
  onAttemptRequestSubmitted(callback: (data: AttemptRequestSubmittedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('attempt_request:submitted', callback);
    return () => this.socket?.off('attempt_request:submitted', callback);
  }

  /**
   * Listen for attempt request review confirmations
   */
  onAttemptRequestReviewed(callback: (data: AttemptRequestReviewedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('attempt_request:reviewed', callback);
    return () => this.socket?.off('attempt_request:reviewed', callback);
  }

  /**
   * Listen for attempt request errors
   */
  onAttemptRequestError(callback: (data: AttemptRequestErrorEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('attempt_request:error', callback);
    return () => this.socket?.off('attempt_request:error', callback);
  }

  /**
   * Listen for decision notifications from other instructors
   */
  onAttemptRequestDecisionMade(callback: (data: {
    requestId: string;
    decision: 'approved' | 'rejected';
    reviewedBy: string;
  }) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('attempt_request:decision_made', callback);
    return () => this.socket?.off('attempt_request:decision_made', callback);
  }

  // =====================
  // OVERRIDE EVENT LISTENERS
  // =====================

  /**
   * Listen for override grant confirmations
   */
  onOverrideGranted(callback: (data: OverrideGrantedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('override:granted', callback);
    return () => this.socket?.off('override:granted', callback);
  }

  /**
   * Listen for override errors
   */
  onOverrideError(callback: (data: OverrideErrorEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('override:error', callback);
    return () => this.socket?.off('override:error', callback);
  }

  // =====================
  // NOTIFICATION ACTIONS
  // =====================

  /**
   * Request current unread notification count
   */
  async getUnreadNotificationCount(): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('notifications:get_unread_count');
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('notifications:mark_read', { notificationId });
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('notifications:mark_all_read');
  }

  /**
   * Get recent notifications
   */
  async getRecentNotifications(limit: number = 10, page: number = 1): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('notifications:get_recent', { limit, page });
  }

  // =====================
  // ATTEMPT REQUEST ACTIONS
  // =====================

  /**
   * Submit an attempt request via socket
   */
  async submitAttemptRequest(data: SubmitAttemptRequestData): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('attempt_request:submit', data);
  }

  /**
   * Review an attempt request via socket
   */
  async reviewAttemptRequest(data: ReviewAttemptRequestData): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('attempt_request:review', data);
  }

  // =====================
  // OVERRIDE ACTIONS
  // =====================

  /**
   * Grant attempts directly via socket
   */
  async grantAttemptsDirectly(data: GrantAttemptsDirectlyData): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('override:grant_attempts', data);
  }

  // =====================
  // LEGACY COMPATIBILITY
  // =====================

  // Keep old method for backward compatibility
  onTimerUpdate(callback: (data: any) => void): () => void {
    console.warn('SocketService: onTimerUpdate is deprecated, use onTimerSync instead');
    return this.onTimerSync(callback);
  }

  // =====================
  // UTILITY METHODS  
  // =====================

  // Generic event listener
  on(eventName: string, callback: (...args: any[]) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on(eventName, callback);
    return () => this.socket?.off(eventName, callback);
  }

  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(eventName, callback);
    } else {
      this.socket.removeAllListeners(eventName);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  private getAuthToken(): string | null {
    const cookieMatch = document.cookie.match(/accessToken=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }
    return null;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;