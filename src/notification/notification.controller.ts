
// src/notification/notification.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import {
  GetNotificationsQueryDto,
  SendCustomNotificationDto,
  SubmitAttemptRequestDto,
  ReviewAttemptRequestDto,
} from './dto/notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * GET /notifications
   * Get user's notifications with pagination
   * Access: All authenticated users
   */
  @Get()
  async getNotifications(
    @Query() filters: GetNotificationsQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationService.getUserNotifications(filters, user);
  }

  /**
   * GET /notifications/unread-count
   * Get unread notification count
   * Access: All authenticated users
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: RequestUser) {
    const count = await this.notificationService.getUnreadCount(user);
    return { count };
  }

  /**
   * PATCH /notifications/mark-all-read
   * Mark all notifications as read
   * Access: All authenticated users
   */
  @Patch('mark-all-read')
  async markAllAsRead(@CurrentUser() user: RequestUser) {
    return this.notificationService.markAllAsRead(user);
  }

  /**
   * GET /notifications/attempt-requests/pending
   * Get all pending attempt requests for the organization
   * Access: Admin, Instructor
   */
  @Get('attempt-requests/pending')
  @Roles('admin', 'instructor')
  async getPendingAttemptRequests(@CurrentUser() user: RequestUser) {
    return this.notificationService.getPendingAttemptRequests(user);
  }

  /**
   * GET /notifications/attempt-requests/my-requests
   * Get current user's own attempt requests
   * Access: All authenticated users
   */
  @Get('attempt-requests/my-requests')
  async getUserAttemptRequests(@CurrentUser() user: RequestUser) {
    return this.notificationService.getUserAttemptRequests(user);
  }

  /**
   * GET /notifications/attempt-requests/:requestId
   * Get a specific attempt request by ID
   * Access: Own requests or Admin/Instructor for org requests
   */
  @Get('attempt-requests/:requestId')
  async getAttemptRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationService.getAttemptRequest(requestId, user);
  }

  /**
   * PATCH /notifications/:notificationId/read
   * Mark specific notification as read
   * Access: All authenticated users
   */
  @Patch(':notificationId/read')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationService.markAsRead(notificationId, user);
  }

  /**
   * DELETE /notifications/:notificationId
   * Delete a notification
   * Access: All authenticated users
   */
  @Delete(':notificationId')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationService.deleteNotification(notificationId, user);
  }

  /**
   * POST /notifications/send-custom
   * Send custom notification to users
   * Access: Admin only
   */
  @Post('send-custom')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendCustomNotification(
    @Body() dto: SendCustomNotificationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationService.sendCustomNotification(dto, user);
  }

  /**
   * POST /notifications/attempt-request
   * Submit an attempt request
   * Access: All authenticated users (primarily students)
   */
  @Post('attempt-request')
  @HttpCode(HttpStatus.OK)
  async submitAttemptRequest(
    @Body() dto: SubmitAttemptRequestDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationService.submitAttemptRequest(dto, user);
  }

  /**
   * POST /notifications/attempt-request/review
   * Review an attempt request
   * Access: Admin, Instructor
   */
  @Post('attempt-request/review')
  @Roles('admin', 'instructor')
  @HttpCode(HttpStatus.OK)
  async reviewAttemptRequest(
    @Body() dto: ReviewAttemptRequestDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationService.reviewAttemptRequest(dto, user);
  }
}