// src/notification/dto/notification.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsMongoId,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Notification types enum
 */
export type NotificationType =
  | 'attempt_request_submitted'
  | 'attempt_request_approved'
  | 'attempt_request_rejected'
  | 'attempt_request_pending_review'
  | 'attempts_granted_directly'
  | 'system_notification'
  | 'test_related';

/**
 * DTO for getting notifications with pagination
 */
export class GetNotificationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsEnum([
    'attempt_request_submitted',
    'attempt_request_approved',
    'attempt_request_rejected',
    'attempt_request_pending_review',
    'attempts_granted_directly',
    'system_notification',
    'test_related',
  ])
  type?: NotificationType;

  @IsOptional()
  @IsString()
  isRead?: string; // 'true' or 'false' as query string
}

/**
 * DTO for sending custom notification
 */
export class SendCustomNotificationDto {
  @IsArray()
  @IsMongoId({ each: true })
  recipientIds: string[];

  @IsEnum([
    'attempt_request_submitted',
    'attempt_request_approved',
    'attempt_request_rejected',
    'attempt_request_pending_review',
    'attempts_granted_directly',
    'system_notification',
    'test_related',
  ])
  type: NotificationType;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(1000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionText?: string;
}

/**
 * DTO for submitting attempt request
 */
export class SubmitAttemptRequestDto {
  @IsMongoId()
  testId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  requestedAttempts: number;

  @IsString()
  @MaxLength(500)
  reason: string;
}

/**
 * DTO for reviewing attempt request
 */
export class ReviewAttemptRequestDto {
  @IsMongoId()
  requestId: string;

  @IsEnum(['approved', 'rejected'])
  decision: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNotes?: string;
}

/**
 * Response DTOs
 */
export class NotificationResponseDto {
  _id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedModel?: string;
  relatedId?: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export class PaginationResponseDto {
  current: number;
  total: number;
  hasNext: boolean;
}

export class NotificationsListResponseDto {
  notifications: NotificationResponseDto[];
  pagination: PaginationResponseDto;
}

export class UnreadCountResponseDto {
  count: number;
}