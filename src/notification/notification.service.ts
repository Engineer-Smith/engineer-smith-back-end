// src/notification/notification.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Test, TestDocument } from '../schemas/test.schema';
import { AttemptRequest, AttemptRequestDocument } from '../schemas/attempt-request.schema';
import {
    StudentTestOverride,
    StudentTestOverrideDocument,
} from '../schemas/student-test-override.schema';
import {
    GetNotificationsQueryDto,
    SendCustomNotificationDto,
    SubmitAttemptRequestDto,
    ReviewAttemptRequestDto,
    NotificationsListResponseDto,
} from './dto/notification.dto';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import { Inject, forwardRef } from '@nestjs/common';  // Add forwardRef
import { AppGateway } from '../gateway/gateway';       // Add gateway import

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Test.name) private testModel: Model<TestDocument>,
        @InjectModel(AttemptRequest.name) private attemptRequestModel: Model<AttemptRequestDocument>,
        @InjectModel(StudentTestOverride.name) private overrideModel: Model<StudentTestOverrideDocument>,
        @Inject(forwardRef(() => AppGateway))
        private readonly gateway: AppGateway,
    ) { }

    /**
     * Get user's notifications with pagination
     */
    async getUserNotifications(
        filters: GetNotificationsQueryDto,
        user: RequestUser,
    ): Promise<NotificationsListResponseDto> {
        const limit = filters.limit || 20;
        const page = filters.page || 1;
        const skip = (page - 1) * limit;

        const query: any = {
            recipientId: new Types.ObjectId(user.userId),
        };

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.isRead !== undefined) {
            query.isRead = filters.isRead === 'true';
        }

        const [notifications, total] = await Promise.all([
            this.notificationModel
                .find(query)
                .populate('senderId', 'firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.notificationModel.countDocuments(query),
        ]);

        return {
            notifications: notifications.map((n: any) => ({
                _id: n._id.toString(),
                recipientId: n.recipientId.toString(),
                senderId: n.senderId?._id?.toString(),
                senderName: n.senderId
                    ? `${n.senderId.firstName} ${n.senderId.lastName}`
                    : undefined,
                organizationId: n.organizationId.toString(),
                type: n.type,
                title: n.title,
                message: n.message,
                relatedModel: n.relatedModel,
                relatedId: n.relatedId?.toString(),
                actionUrl: n.actionUrl,
                actionText: n.actionText,
                isRead: n.isRead,
                readAt: n.readAt,
                createdAt: n.createdAt,
            })),
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasNext: skip + notifications.length < total,
            },
        };
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(user: RequestUser): Promise<number> {
        return this.notificationModel.countDocuments({
            recipientId: new Types.ObjectId(user.userId),
            isRead: false,
        });
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string, user: RequestUser): Promise<{ success: boolean }> {
        const result = await this.notificationModel.findOneAndUpdate(
            {
                _id: notificationId,
                recipientId: new Types.ObjectId(user.userId),
            },
            {
                isRead: true,
                readAt: new Date(),
            },
        );

        if (!result) {
            throw new NotFoundException('Notification not found');
        }

        return { success: true };
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(user: RequestUser): Promise<{ success: boolean; markedCount: number }> {
        const result = await this.notificationModel.updateMany(
            {
                recipientId: new Types.ObjectId(user.userId),
                isRead: false,
            },
            {
                isRead: true,
                readAt: new Date(),
            },
        );

        return {
            success: true,
            markedCount: result.modifiedCount,
        };
    }

    /**
     * Delete a notification
     */
    async deleteNotification(
        notificationId: string,
        user: RequestUser,
    ): Promise<{ success: boolean }> {
        const result = await this.notificationModel.findOneAndDelete({
            _id: notificationId,
            recipientId: new Types.ObjectId(user.userId),
        });

        if (!result) {
            throw new NotFoundException('Notification not found');
        }

        return { success: true };
    }

    /**
     * Send custom notification (admin only)
     */
    async sendCustomNotification(
        dto: SendCustomNotificationDto,
        user: RequestUser,
    ): Promise<{ success: boolean; count: number }> {
        const notifications = dto.recipientIds.map((recipientId) => ({
            recipientId: new Types.ObjectId(recipientId),
            senderId: new Types.ObjectId(user.userId),
            organizationId: new Types.ObjectId(user.organizationId),
            type: dto.type,
            title: dto.title,
            message: dto.message,
            actionUrl: dto.actionUrl,
            actionText: dto.actionText,
        }));

        const created = await this.notificationModel.insertMany(notifications);

        // Send real-time notifications via WebSocket
        for (const notification of created) {
            this.safeGatewaySend(notification.recipientId.toString(), {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                actionUrl: notification.actionUrl,
                createdAt: notification.createdAt,
            });
        }

        return {
            success: true,
            count: created.length,
        };
    }

    /**
     * Submit attempt request with notifications
     */
    async submitAttemptRequest(
        dto: SubmitAttemptRequestDto,
        user: RequestUser,
    ): Promise<any> {
        const test = await this.testModel.findById(dto.testId);
        if (!test) {
            throw new NotFoundException('Test not found');
        }

        // Check for existing pending request
        const existingRequest = await this.attemptRequestModel.findOne({
            userId: new Types.ObjectId(user.userId),
            testId: new Types.ObjectId(dto.testId),
            status: 'pending',
        });

        if (existingRequest) {
            throw new BadRequestException('You already have a pending request for this test');
        }

        // Create the attempt request
        const attemptRequest = await this.attemptRequestModel.create({
            userId: new Types.ObjectId(user.userId),
            testId: new Types.ObjectId(dto.testId),
            organizationId: new Types.ObjectId(user.organizationId),
            requestedAttempts: dto.requestedAttempts,
            reason: dto.reason,
            status: 'pending',
        });

        // Get student info for notification
        const student = await this.userModel.findById(user.userId);
        const studentName = student
            ? `${student.firstName} ${student.lastName}`
            : 'A student';

        // Find instructors/admins to notify
        const instructors = await this.userModel.find({
            organizationId: new Types.ObjectId(user.organizationId),
            role: { $in: ['instructor', 'admin'] },
            _id: { $ne: new Types.ObjectId(user.userId) },
        } as any);

        // Create notifications for instructors
        if (instructors.length > 0) {
            const notifications = instructors.map((instructor) => ({
                recipientId: instructor._id,
                senderId: new Types.ObjectId(user.userId),
                organizationId: new Types.ObjectId(user.organizationId),
                type: 'attempt_request_pending_review',
                title: 'New Attempt Request',
                message: `${studentName} has requested ${dto.requestedAttempts} additional attempt(s) for "${test.title}"`,
                relatedModel: 'AttemptRequest',
                relatedId: attemptRequest._id,
                actionUrl: `/admin/attempt-requests/${attemptRequest._id}`,
                actionText: 'Review Request',
            }));

            await this.notificationModel.insertMany(notifications);

            // Send real-time notifications to instructors
            for (const instructor of instructors) {
                this.safeGatewaySend(instructor._id.toString(), {
                    type: 'attempt_request_pending_review',
                    title: 'New Attempt Request',
                    message: `${studentName} has requested ${dto.requestedAttempts} additional attempt(s) for "${test.title}"`,
                    actionUrl: `/admin/attempt-requests/${attemptRequest._id}`,
                });
            }
        }

        return {
            success: true,
            requestId: attemptRequest._id,
            message: 'Attempt request submitted successfully',
        };
    }

    /**
     * Review attempt request with notifications
     */
    async reviewAttemptRequest(
        dto: ReviewAttemptRequestDto,
        user: RequestUser,
    ): Promise<any> {
        const attemptRequest = await this.attemptRequestModel
            .findById(dto.requestId)
            .populate('userId', 'firstName lastName')
            .populate('testId', 'title');

        if (!attemptRequest) {
            throw new NotFoundException('Request not found');
        }

        if (attemptRequest.status !== 'pending') {
            throw new BadRequestException('Request has already been reviewed');
        }

        // Check permission
        if (
            !user.isSuperOrgAdmin &&
            attemptRequest.organizationId.toString() !== user.organizationId
        ) {
            throw new ForbiddenException('Access denied');
        }

        // Update request status
        attemptRequest.status = dto.decision;
        attemptRequest.reviewedBy = new Types.ObjectId(user.userId);
        attemptRequest.reviewedAt = new Date();
        attemptRequest.reviewNotes = dto.reviewNotes || '';
        await attemptRequest.save();

        // If approved, create/update override
        if (dto.decision === 'approved') {
            await this.overrideModel.findOneAndUpdate(
                {
                    userId: attemptRequest.userId,
                    testId: attemptRequest.testId,
                },
                {
                    $inc: { extraAttempts: attemptRequest.requestedAttempts },
                    $set: {
                        organizationId: attemptRequest.organizationId,
                        reason: `Request approved: ${attemptRequest.reason}`,
                        grantedBy: new Types.ObjectId(user.userId),
                        grantedAt: new Date(),
                    },
                },
                { upsert: true, new: true },
            );
        }

        // Create notification for the student
        const testTitle = (attemptRequest.testId as any).title || 'the test';
        const isApproved = dto.decision === 'approved';

        const notificationMessage = isApproved
            ? `Your request for ${attemptRequest.requestedAttempts} additional attempt(s) for "${testTitle}" has been approved!`
            : `Your request for additional attempts for "${testTitle}" has been rejected.${dto.reviewNotes ? ' ' + dto.reviewNotes : ''}`;
        const notificationActionUrl = isApproved ? `/tests/${attemptRequest.testId}` : undefined;

        await this.notificationModel.create({
            recipientId: attemptRequest.userId,
            senderId: new Types.ObjectId(user.userId),
            organizationId: attemptRequest.organizationId,
            type: `attempt_request_${dto.decision}`,
            title: `Attempt Request ${isApproved ? 'Approved' : 'Rejected'}`,
            message: notificationMessage,
            relatedModel: 'Test',
            relatedId: attemptRequest.testId as any,
            actionUrl: notificationActionUrl,
            actionText: isApproved ? 'Take Test' : undefined,
        });

        // Send real-time notification to student
        this.safeGatewaySend(attemptRequest.userId.toString(), {
            type: isApproved ? 'attempt_request_approved' : 'attempt_request_rejected',
            title: isApproved ? 'Request Approved!' : 'Request Rejected',
            message: notificationMessage,
            actionUrl: notificationActionUrl,
        });

        return {
            success: true,
            decision: dto.decision,
            message: `Request ${dto.decision} successfully`,
        };
    }

    /**
     * Get all pending attempt requests for the organization
     * For admins/instructors to review
     */
    async getPendingAttemptRequests(user: RequestUser): Promise<any[]> {
        const query: any = {
            status: 'pending',
        };

        // Scope to organization unless super admin
        if (!user.isSuperOrgAdmin) {
            query.organizationId = new Types.ObjectId(user.organizationId);
        }

        const requests = await this.attemptRequestModel
            .find(query)
            .populate('userId', 'firstName lastName email')
            .populate('testId', 'title description')
            .sort({ createdAt: -1 })
            .lean();

        return requests.map((r: any) => ({
            _id: r._id.toString(),
            userId: r.userId?._id?.toString(),
            testId: r.testId?._id?.toString(),
            organizationId: r.organizationId.toString(),
            requestedAttempts: r.requestedAttempts,
            reason: r.reason,
            status: r.status,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            user: r.userId ? {
                _id: r.userId._id.toString(),
                firstName: r.userId.firstName,
                lastName: r.userId.lastName,
                email: r.userId.email,
                fullName: `${r.userId.firstName} ${r.userId.lastName}`,
            } : undefined,
            test: r.testId ? {
                _id: r.testId._id.toString(),
                title: r.testId.title,
                description: r.testId.description,
            } : undefined,
        }));
    }

    /**
     * Get current user's own attempt requests
     */
    async getUserAttemptRequests(user: RequestUser): Promise<any[]> {
        const requests = await this.attemptRequestModel
            .find({ userId: new Types.ObjectId(user.userId) })
            .populate('testId', 'title description')
            .populate('reviewedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        return requests.map((r: any) => ({
            _id: r._id.toString(),
            userId: r.userId.toString(),
            testId: r.testId?._id?.toString(),
            organizationId: r.organizationId.toString(),
            requestedAttempts: r.requestedAttempts,
            reason: r.reason,
            status: r.status,
            reviewedBy: r.reviewedBy?._id?.toString(),
            reviewedAt: r.reviewedAt,
            reviewNotes: r.reviewNotes,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            test: r.testId ? {
                _id: r.testId._id.toString(),
                title: r.testId.title,
                description: r.testId.description,
            } : undefined,
            reviewer: r.reviewedBy ? {
                _id: r.reviewedBy._id.toString(),
                firstName: r.reviewedBy.firstName,
                lastName: r.reviewedBy.lastName,
                fullName: `${r.reviewedBy.firstName} ${r.reviewedBy.lastName}`,
            } : undefined,
        }));
    }

    /**
     * Get a specific attempt request by ID
     * User can view their own requests, admins/instructors can view org requests
     */
    async getAttemptRequest(requestId: string, user: RequestUser): Promise<any> {
        const request = await this.attemptRequestModel
            .findById(requestId)
            .populate('userId', 'firstName lastName email')
            .populate('testId', 'title description')
            .populate('reviewedBy', 'firstName lastName')
            .lean();

        if (!request) {
            throw new NotFoundException('Attempt request not found');
        }

        // Check permissions
        const isOwnRequest = request.userId?._id?.toString() === user.userId;
        const isOrgAdmin = ['admin', 'instructor'].includes(user.role) &&
            (user.isSuperOrgAdmin || request.organizationId.toString() === user.organizationId);

        if (!isOwnRequest && !isOrgAdmin) {
            throw new ForbiddenException('Access denied');
        }

        const r = request as any;
        return {
            _id: r._id.toString(),
            userId: r.userId?._id?.toString(),
            testId: r.testId?._id?.toString(),
            organizationId: r.organizationId.toString(),
            requestedAttempts: r.requestedAttempts,
            reason: r.reason,
            status: r.status,
            reviewedBy: r.reviewedBy?._id?.toString(),
            reviewedAt: r.reviewedAt,
            reviewNotes: r.reviewNotes,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            user: r.userId ? {
                _id: r.userId._id.toString(),
                firstName: r.userId.firstName,
                lastName: r.userId.lastName,
                email: r.userId.email,
            } : undefined,
            test: r.testId ? {
                _id: r.testId._id.toString(),
                title: r.testId.title,
                description: r.testId.description,
            } : undefined,
            reviewer: r.reviewedBy ? {
                _id: r.reviewedBy._id.toString(),
                firstName: r.reviewedBy.firstName,
                lastName: r.reviewedBy.lastName,
            } : undefined,
        };
    }

    /**
     * Create notification for direct attempt grant
     */
    async notifyDirectAttemptGrant(
        override: StudentTestOverrideDocument,
        granterId: string,
    ): Promise<void> {
        const [student, test, granter] = await Promise.all([
            this.userModel.findById(override.userId),
            this.testModel.findById(override.testId),
            this.userModel.findById(granterId),
        ]);

        if (!student || !test || !granter) return;

        await this.notificationModel.create({
            recipientId: override.userId,
            senderId: new Types.ObjectId(granterId),
            organizationId: override.organizationId,
            type: 'attempts_granted_directly',
            title: 'Additional Attempts Granted',
            message: `${granter.firstName} ${granter.lastName} has granted you ${override.extraAttempts} additional attempt(s) for "${test.title}"`,
            relatedModel: 'Test',
            relatedId: override.testId,
            actionUrl: `/tests/${override.testId}`,
            actionText: 'Take Test',
        });

        // Send real-time notification
        this.safeGatewaySend(override.userId.toString(), {
            type: 'attempts_granted_directly',
            title: 'Additional Attempts Granted',
            message: `${granter.firstName} ${granter.lastName} has granted you ${override.extraAttempts} additional attempt(s) for "${test.title}"`,
            actionUrl: `/tests/${override.testId}`,
        });
    }

    /**
 * Safely send notification via gateway (won't crash if gateway unavailable)
 */
    private safeGatewaySend(userId: string, notification: any): void {
        try {
            if (this.gateway?.isGatewayOperational?.()) {
                this.gateway.sendNotificationToUser(userId, {
                    ...notification,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (error) {
            // Gateway might not be available - notifications still saved to DB
            // This is fine - user will see them on next page load
        }
    }
}