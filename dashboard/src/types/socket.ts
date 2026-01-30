// src/types/socket.ts - CORRECTED to match ACTUAL backend socket implementation
import type {
  SessionStatus,
  QuestionStatus
} from './common';
import type { SessionFinalScore } from './session';

// =====================
// SOCKET EVENT TYPES (CORRECTED TO MATCH ACTUAL BACKEND)
// =====================

export interface BaseSocketEvent {
  sessionId: string;
  timestamp?: string;
  userId?: string;
}

// =====================
// SESSION LIFECYCLE EVENTS (CORRECTED TO MATCH socketService.js)
// =====================

// Backend: socketService.onSessionJoined
export interface SessionJoinedEvent extends BaseSocketEvent {
  message: string;
  timestamp?: string;
  // Backend includes additional data from handleSocketJoin result
  [key: string]: any;
}

// Backend: socketService.onSessionRejoined  
export interface SessionRejoinedEvent extends BaseSocketEvent {
  message: string; // 'Successfully rejoined session'
  timestamp?: string;
  // Backend includes additional data from handleSocketRejoin result
  [key: string]: any;
}

// CORRECTED: Backend socketService.sendTimerSync() - actual structure
export interface TimerSyncEvent extends BaseSocketEvent {
  timeRemaining: number;  // timerData.timeRemaining
  serverTime: number;     // Date.now()
  sectionIndex: number;   // timerData.sectionIndex || 0
  type: string;          // timerData.type || 'regular'
}

// CORRECTED: Backend socketService.sendTimerWarning() - actual structure
export interface TimerWarningEvent extends BaseSocketEvent {
  timeRemaining: number;
  message: string;
  type: 'warning';
}

// CORRECTED: Backend socketService.sendSectionExpired() - actual structure
export interface SectionExpiredEvent extends BaseSocketEvent {
  message: string;          // data.message || 'Section time expired'
  newSectionIndex: number;  // data.newSectionIndex
  timestamp: string;        // new Date().toISOString()
}

// CORRECTED: Backend socketService.sendTestCompleted() - actual structure
export interface TestCompletedEvent extends BaseSocketEvent {
  message: string;    // data.message || 'Test completed'
  result: any;        // data.result
  timestamp: string;  // new Date().toISOString()
}

// CORRECTED: Backend socketService.sendSessionPaused() - actual structure
export interface SessionPausedEvent extends BaseSocketEvent {
  reason: string;               // data.reason || 'disconnection'
  gracePeriodSeconds: number;   // data.gracePeriodSeconds || 300
  message: string;              // data.message || 'Session paused due to disconnection'
}

// CORRECTED: Backend socketService.sendSessionResumed() - actual structure
export interface SessionResumedEvent extends BaseSocketEvent {
  message: string;    // data.message || 'Session resumed'
  [key: string]: any; // Additional data
}

// Backend socket error events
export interface SessionErrorEvent {
  sessionId: string;
  message: string;
  error: string;
  timestamp?: string;
}

// Socket-based answer processing events (if using socket submission)
export interface AnswerProcessedEvent extends BaseSocketEvent {
  success: boolean;
  action: string; // result.action
  [key: string]: any; // ...result.data
}

export interface AnswerErrorEvent {
  message: string;
  error: string;
}

// =====================
// CLIENT TO SERVER EVENTS (ACTUAL EVENTS BACKEND EXPECTS)
// =====================

export interface JoinTestSessionRequest {
  sessionId: string;
}

export interface LeaveTestSessionRequest {
  sessionId: string;
}

export interface RejoinSessionRequest {
  sessionId: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  answer?: any;
  timeSpent?: number;
  action: 'submit' | 'skip';
  skipReason?: string;
}

export interface TimerSyncRequest {
  sessionId: string;
}

// =====================
// SOCKET SERVICE CONFIGURATION
// =====================

export interface SocketServiceConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  timeout?: number;
  autoConnect?: boolean;
  forceNew?: boolean;
  transports?: ('websocket' | 'polling')[];
  auth?: {
    token?: string;
  };
}

export interface SocketServiceCallbacks {
  // Session lifecycle (CORRECTED - actual events backend emits)
  onSessionJoined?: (data: SessionJoinedEvent) => void;
  onSessionRejoined?: (data: SessionRejoinedEvent) => void;
  
  // Timer events (CORRECTED - actual events backend emits)
  onTimerSync?: (data: TimerSyncEvent) => void;
  onTimerWarning?: (data: TimerWarningEvent) => void;
  
  // Session state events (CORRECTED - actual events backend emits)
  onSessionPaused?: (data: SessionPausedEvent) => void;
  onSessionResumed?: (data: SessionResumedEvent) => void;
  
  // Test progression events (CORRECTED - actual events backend emits)
  onSectionExpired?: (data: SectionExpiredEvent) => void;
  onTestCompleted?: (data: TestCompletedEvent) => void;
  
  // Error events
  onSessionError?: (data: SessionErrorEvent) => void;
  
  // Socket-based answer submission (if used)
  onAnswerProcessed?: (data: AnswerProcessedEvent) => void;
  onAnswerError?: (data: AnswerErrorEvent) => void;
  onQuestionNext?: (data: any) => void;
  onSectionTransition?: (data: any) => void;
  onTestReadyForCompletion?: (data: any) => void;
  
  // Connection events
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onReconnect?: (attemptNumber: number) => void;
  onReconnectError?: (error: Error) => void;
  onError?: (error: Error) => void;
}

// =====================
// SOCKET CONNECTION STATES
// =====================

export type SocketConnectionState = 
  | 'connecting'
  | 'connected' 
  | 'disconnected' 
  | 'reconnecting' 
  | 'error'
  | 'timeout';

export interface SocketConnectionInfo {
  state: SocketConnectionState;
  connectedAt?: Date;
  lastDisconnect?: Date;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  sessionId?: string;
  canRejoin?: boolean;
}

// =====================
// SOCKET SERVICE INTERFACE (CORRECTED)
// =====================

export interface ISocketService {
  // Connection management
  connect(config: SocketServiceConfig): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
  
  // Session management (CORRECTED - actual methods in SocketService.ts)
  joinTestSession(sessionId: string): Promise<void>;
  rejoinTestSession(sessionId: string): Promise<void>;
  leaveTestSession(sessionId: string): Promise<void>;
  
  // Answer submission (if using socket-based submission)
  submitAnswer(sessionId: string, answerData: any): Promise<void>;
  
  // Timer sync
  requestTimerSync(sessionId: string): Promise<void>;
  
  // Event listeners (CORRECTED - actual methods in SocketService.ts)
  onSessionJoined(callback: (data: SessionJoinedEvent) => void): () => void;
  onSessionRejoined(callback: (data: SessionRejoinedEvent) => void): () => void;
  onTimerSync(callback: (data: TimerSyncEvent) => void): () => void;
  onTimerWarning(callback: (data: TimerWarningEvent) => void): () => void;
  onSectionExpired(callback: (data: SectionExpiredEvent) => void): () => void;
  onTestCompleted(callback: (data: TestCompletedEvent) => void): () => void;
  onSessionError(callback: (data: SessionErrorEvent) => void): () => void;
  onSessionPaused(callback: (data: SessionPausedEvent) => void): () => void;
  onSessionResumed(callback: (data: SessionResumedEvent) => void): () => void;
  onAnswerProcessed(callback: (data: AnswerProcessedEvent) => void): () => void;
  onAnswerError(callback: (data: AnswerErrorEvent) => void): () => void;
  onQuestionNext(callback: (data: any) => void): () => void;
  onSectionTransition(callback: (data: any) => void): () => void;
  onTestReadyForCompletion(callback: (data: any) => void): () => void;
  
  // Generic event handling
  on(eventName: string, callback: (...args: any[]) => void): () => void;
  off(eventName: string, callback?: (...args: any[]) => void): void;
  
  // Connection state
  getConnectionInfo(): SocketConnectionInfo;
  isConnected(): boolean;
  getCurrentSessionId(): string | null;
  getSocket(): any;
}

// =====================
// EVENT NAME CONSTANTS (CORRECTED TO MATCH ACTUAL BACKEND)
// =====================

export const SOCKET_EVENTS = {
  // Client to Server (CORRECTED - actual events backend expects)
  SESSION_JOIN: 'session:join',
  SESSION_REJOIN: 'session:rejoin',
  ANSWER_SUBMIT: 'answer:submit',
  TIMER_REQUEST_SYNC: 'timer:request_sync',
  
  // Server to Client (CORRECTED - actual events backend emits)
  SESSION_JOINED: 'session:joined',
  SESSION_REJOINED: 'session:rejoined',
  TIMER_SYNC: 'timer:sync',
  TIMER_WARNING: 'timer:warning',
  SECTION_EXPIRED: 'section:expired',
  TEST_COMPLETED: 'test:completed',
  SESSION_ERROR: 'session:error',
  SESSION_PAUSED: 'session:paused',
  SESSION_RESUMED: 'session:resumed',
  
  // Socket-based answer flow (if used)
  ANSWER_PROCESSED: 'answer:processed',
  ANSWER_ERROR: 'answer:error',
  QUESTION_NEXT: 'question:next',
  SECTION_TRANSITION: 'section:transition',
  TEST_READY_FOR_COMPLETION: 'test:ready_for_completion',
  
  // Standard Socket.IO events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  RECONNECT_ERROR: 'reconnect_error',
  ERROR: 'error',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

// =====================
// TYPE GUARDS (CORRECTED)
// =====================

export const isSessionEvent = (event: any): event is BaseSocketEvent => {
  return event && typeof event.sessionId === 'string';
};

export const isTimerSyncEvent = (event: any): event is TimerSyncEvent => {
  return event && 
    typeof event.sessionId === 'string' && 
    typeof event.timeRemaining === 'number' &&
    typeof event.serverTime === 'number' &&
    typeof event.sectionIndex === 'number' &&
    typeof event.type === 'string';
};

export const isTimerWarningEvent = (event: any): event is TimerWarningEvent => {
  return event && 
    typeof event.sessionId === 'string' && 
    typeof event.timeRemaining === 'number' &&
    typeof event.message === 'string' &&
    event.type === 'warning';
};

export const isSectionExpiredEvent = (event: any): event is SectionExpiredEvent => {
  return event && 
    typeof event.sessionId === 'string' && 
    typeof event.newSectionIndex === 'number' &&
    typeof event.message === 'string' &&
    typeof event.timestamp === 'string';
};

export const isTestCompletedEvent = (event: any): event is TestCompletedEvent => {
  return event && 
    typeof event.sessionId === 'string' && 
    typeof event.message === 'string' &&
    typeof event.timestamp === 'string' &&
    event.result;
};

export const isSessionErrorEvent = (event: any): event is SessionErrorEvent => {
  return event && 
    typeof event.sessionId === 'string' && 
    typeof event.message === 'string' &&
    typeof event.error === 'string';
};

export const isSessionPausedEvent = (event: any): event is SessionPausedEvent => {
  return event && 
    typeof event.sessionId === 'string' && 
    typeof event.reason === 'string' &&
    typeof event.gracePeriodSeconds === 'number' &&
    typeof event.message === 'string';
};

export const isSessionResumedEvent = (event: any): event is SessionResumedEvent => {
  return event && 
    typeof event.sessionId === 'string' && 
    typeof event.message === 'string';
};

// =====================
// REACT HOOK TYPES (CORRECTED FOR ACTUAL IMPLEMENTATION)
// =====================

export interface UseSocketOptions {
  config: SocketServiceConfig;
  callbacks?: SocketServiceCallbacks;
  autoConnect?: boolean;
  sessionId?: string;
}

export interface UseSocketReturn {
  socket: ISocketService | null;
  connectionInfo: SocketConnectionInfo;
  isConnected: boolean;
  joinTestSession: (sessionId: string) => Promise<void>;
  rejoinTestSession: (sessionId: string) => Promise<void>;
  leaveTestSession: (sessionId: string) => Promise<void>;
  getCurrentSessionId: () => string | null;
}

// =====================
// TIMER HOOK TYPES (CORRECTED)
// =====================

export interface UseTimerOptions {
  sessionId: string;
  onTimerExpired?: () => void;
  onSectionExpired?: (data: SectionExpiredEvent) => void;
  onTestCompleted?: (data: TestCompletedEvent) => void;
  onTimerWarning?: (data: TimerWarningEvent) => void;
}

export interface UseTimerReturn {
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  serverTime?: number;
  type?: string;
  currentSection?: {
    index: number;
    name?: string;
  };
  formatTimeRemaining: () => string;
  isLowTime: boolean;
  isCriticalTime: boolean;
  isWarningTime: boolean;
}

// =====================
// UTILITY TYPES (CORRECTED)
// =====================

export interface SocketHealth {
  connected: boolean;
  sessionId?: string;
  connectionUptime: number;
  errors: Error[];
  lastTimerSync?: Date;
  timeSkew?: number; // Server time difference
}

// =====================
// SOCKET EVENT AGGREGATION TYPES (CORRECTED)
// =====================

export type SessionLifecycleEvent = 
  | SessionJoinedEvent 
  | SessionRejoinedEvent
  | SessionPausedEvent
  | SessionResumedEvent
  | SessionErrorEvent;

export type TimerEvent = 
  | TimerSyncEvent 
  | TimerWarningEvent;

export type TestProgressEvent = 
  | SectionExpiredEvent 
  | TestCompletedEvent;

export type AnswerFlowEvent = 
  | AnswerProcessedEvent
  | AnswerErrorEvent;

export type AllSessionEvents = 
  | SessionLifecycleEvent 
  | TimerEvent 
  | TestProgressEvent
  | AnswerFlowEvent;

// =====================
// LEGACY COMPATIBILITY
// =====================

// Keep for backwards compatibility - map old names to new
export type TestSessionScore = SessionFinalScore;

// Deprecated - use TimerSyncEvent instead
export interface TimerUpdateEvent extends TimerSyncEvent {
  /** @deprecated Use TimerSyncEvent instead */
}

// Re-export common types that might be used with socket events
export type { SessionStatus, QuestionStatus, SessionFinalScore };