// src/types/notifications.ts
import type { BaseEntity, Role } from './common';

// =====================
// NOTIFICATION TYPES
// =====================

export type NotificationType =
  | 'attempt_request_submitted'
  | 'attempt_request_approved'
  | 'attempt_request_rejected'
  | 'attempt_request_pending_review'
  | 'attempts_granted_directly'
  | 'system_notification'
  | 'test_related';

export interface Notification extends BaseEntity {
  recipientId: string;
  senderId?: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedModel?: 'AttemptRequest' | 'Test' | 'TestSession' | 'StudentTestOverride';
  relatedId?: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: string;
  source?: 'database' | 'socket'; // Track notification origin
  // Add these fields to match API response
  sender?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

// Add API response interface that matches what your server returns
export interface NotificationApiResponse {
  _id: string;
  recipientId: string;
  senderId?: string;
  organizationId: string;
  type: string; // API returns string, not enum
  title: string;
  message?: string;
  relatedModel?: string;
  relatedId?: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

// =====================
// ATTEMPT REQUEST TYPES
// =====================

export type AttemptRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AttemptRequest extends BaseEntity {
  userId: string;
  testId: string;
  organizationId: string;
  requestedAttempts: number;
  reason: string;
  status: AttemptRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;

  // Populated fields
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
  test?: {
    _id: string;
    title: string;
    description: string;
  };
  reviewer?: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

export interface StudentTestOverride extends BaseEntity {
  userId: string;
  testId: string;
  organizationId: string;
  extraAttempts: number;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;

  // Populated fields
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
  test?: {
    _id: string;
    title: string;
  };
  granter?: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

// =====================
// SOCKET EVENT INTERFACES
// =====================

export interface NotificationSocketEvent {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  actionText?: string;
  timestamp: string;
}

export interface AttemptRequestSubmittedEvent {
  success: boolean;
  requestId: string;
  message: string;
}

export interface AttemptRequestReviewedEvent {
  success: boolean;
  requestId: string;
  decision: 'approved' | 'rejected';
  message: string;
}

export interface AttemptRequestErrorEvent {
  success: false;
  message: string;
}

export interface OverrideGrantedEvent {
  success: boolean;
  message: string;
  override?: StudentTestOverride;
}

export interface OverrideErrorEvent {
  success: false;
  message: string;
}

export interface NotificationBadgeUpdateEvent {
  unreadCount: number;
}

export interface NotificationMarkedReadEvent {
  notificationId: string;
  success: boolean;
}

export interface NotificationsAllMarkedReadEvent {
  success: boolean;
  markedCount: number;
}

export interface NotificationsRecentEvent {
  notifications: Notification[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
  };
}

// =====================
// API REQUEST/RESPONSE TYPES
// =====================

export interface SubmitAttemptRequestData {
  testId: string;
  requestedAttempts: number;
  reason: string;
}

export interface ReviewAttemptRequestData {
  requestId: string;
  decision: 'approved' | 'rejected';
  reviewNotes?: string;
}

export interface GrantAttemptsDirectlyData {
  userId: string;
  testId: string;
  extraAttempts: number;
  reason: string;
}

export interface NotificationApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface PendingRequestsResponse {
  requests: AttemptRequest[];
}

export interface UserRequestsResponse {
  requests: AttemptRequest[];
}

export interface OverridesResponse {
  overrides: StudentTestOverride[];
}

// =====================
// UI COMPONENT PROPS
// =====================

export interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  maxHeight?: string;
  showReadAll?: boolean;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}

export interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
}

export interface AttemptRequestFormProps {
  testId: string;
  testTitle: string;
  onSubmit: (data: SubmitAttemptRequestData) => void;
  onCancel: () => void;
  loading?: boolean;
  maxAttempts?: number;
}

export interface AttemptRequestReviewProps {
  request: AttemptRequest;
  onReview: (data: ReviewAttemptRequestData) => void;
  loading?: boolean;
}

export interface AttemptRequestListProps {
  requests: AttemptRequest[];
  loading?: boolean;
  onReview: (request: AttemptRequest, decision: 'approved' | 'rejected', notes?: string) => void;
  userRole: Role;
  emptyMessage?: string;
}

export interface GrantAttemptsFormProps {
  onSubmit: (data: GrantAttemptsDirectlyData) => void;
  onCancel: () => void;
  loading?: boolean;
  availableStudents: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  availableTests: Array<{
    id: string;
    title: string;
  }>;
}

export interface OverrideListProps {
  overrides: StudentTestOverride[];
  loading?: boolean;
  onEdit?: (override: StudentTestOverride) => void;
  onDelete?: (override: StudentTestOverride) => void;
  userRole: Role;
}

// =====================
// NOTIFICATION CONTEXT
// =====================

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  submitAttemptRequest: (data: SubmitAttemptRequestData) => Promise<void>;
  reviewAttemptRequest: (data: ReviewAttemptRequestData) => Promise<void>;
  grantAttemptsDirectly: (data: GrantAttemptsDirectlyData) => Promise<void>;

  // State
  isConnected: boolean;
  reconnect: () => void;
}