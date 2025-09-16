// /controllers/notificationController.js
const AttemptRequest = require('../models/AttemptRequest');
const StudentTestOverride = require('../models/StudentTestOverride');
const Notification = require('../models/Notification');
const Test = require('../models/Test');
const User = require('../models/User');

class NotificationController {
    constructor() {
        this.socketService = null;
    }

    setSocketService(socketService) {
        this.socketService = socketService;
    }

    // Submit attempt request with notifications
    async submitAttemptRequest(data) {
        try {
            const { userId, organizationId, testId, requestedAttempts, reason } = data;

            // Validate test and user attempts
            const test = await Test.findById(testId);
            if (!test) {
                return { success: false, message: 'Test not found' };
            }

            const remainingAttempts = await test.getRemainingAttempts(userId);
            if (remainingAttempts > 0) {
                return { success: false, message: `You still have ${remainingAttempts} attempt(s) remaining` };
            }

            // Check for existing pending request
            const existingRequest = await AttemptRequest.findOne({
                userId,
                testId,
                status: 'pending'
            });

            if (existingRequest) {
                return { success: false, message: 'You already have a pending request for this test' };
            }

            // Create request
            const attemptRequest = await AttemptRequest.create({
                userId,
                testId,
                organizationId,
                requestedAttempts,
                reason
            });

            // Get student data
            const student = await User.findById(userId);
            const studentName = student.fullName ||
                `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                student.loginId ||
                `Student ${student._id.toString().slice(-6)}`;

            // Create database notifications
            try {
                await Notification.createAttemptRequestNotification(attemptRequest);
            } catch (notifError) {
                console.error('Error creating database notifications:', notifError);
            }

            // Send individual socket notifications to each instructor
            if (this.socketService) {
                try {
                    // Get all instructors who should receive this notification
                    const instructors = await User.find({
                        organizationId,
                        role: { $in: ['instructor', 'admin'] }
                    }).select('_id firstName lastName');

                    // Send individual notification to each instructor
                    instructors.forEach(instructor => {
                        this.socketService.sendNotificationToUser(instructor._id.toString(), {
                            type: 'attempt_request_submitted',
                            title: 'New Attempt Request',
                            message: `${studentName} has requested ${requestedAttempts} additional attempt(s) for "${test.title}"`,
                            recipientId: instructor._id.toString(),
                            senderId: userId.toString(),
                            organizationId: organizationId.toString(),
                            relatedModel: 'AttemptRequest',
                            relatedId: attemptRequest._id.toString(),
                            actionUrl: `/admin/attempt-requests/${attemptRequest._id}`,
                            actionText: 'Review Request',
                            isRead: false,
                            createdAt: new Date().toISOString()
                        });
                    });
                } catch (socketError) {
                    console.error('Error sending socket notifications:', socketError);
                }
            }

            return {
                success: true,
                requestId: attemptRequest._id,
                requestData: {
                    requestId: attemptRequest._id,
                    studentId: userId,
                    studentName: studentName,
                    testId,
                    testTitle: test.title,
                    requestedAttempts,
                    reason
                }
            };

        } catch (error) {
            console.error('Error submitting attempt request:', error);
            return { success: false, message: 'Failed to submit request' };
        }
    }

    // Review attempt request with notifications
    async reviewAttemptRequest(data) {
        try {
            const { requestId, reviewerId, decision, reviewNotes } = data;

            const attemptRequest = await AttemptRequest.findById(requestId)
                .populate('userId', 'firstName lastName fullName')
                .populate('testId', 'title');

            if (!attemptRequest) {
                return { success: false, message: 'Request not found' };
            }

            if (attemptRequest.status !== 'pending') {
                return { success: false, message: 'Request already reviewed' };
            }

            // Process decision
            if (decision === 'approved') {
                await attemptRequest.approve(reviewerId, reviewNotes);
            } else {
                await attemptRequest.reject(reviewerId, reviewNotes);
            }

            // Create database notification for student
            await Notification.notifyRequestDecision(attemptRequest, decision);

            // Send real-time socket notification to the student
            if (this.socketService) {
                const studentName = attemptRequest.userId.fullName ||
                    `${attemptRequest.userId.firstName} ${attemptRequest.userId.lastName}`.trim() ||
                    'Student';

                const notification = {
                    type: `attempt_request_${decision}`,
                    title: `Attempt Request ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
                    message: decision === 'approved'
                        ? `Your request for ${attemptRequest.requestedAttempts} additional attempt(s) for "${attemptRequest.testId.title}" has been approved!`
                        : `Your request for additional attempts for "${attemptRequest.testId.title}" has been rejected.${reviewNotes ? ' ' + reviewNotes : ''}`,
                    recipientId: attemptRequest.userId._id.toString(),
                    senderId: reviewerId.toString(),
                    relatedModel: 'Test',
                    relatedId: attemptRequest.testId._id.toString(),
                    actionUrl: decision === 'approved' ? `/tests/${attemptRequest.testId._id}` : null,
                    actionText: decision === 'approved' ? 'Take Test' : null,
                    isRead: false,
                    createdAt: new Date().toISOString()
                };

                this.socketService.sendNotificationToUser(attemptRequest.userId._id.toString(), notification);
            }

            return {
                success: true,
                studentId: attemptRequest.userId._id,
                decisionData: {
                    requestId,
                    decision,
                    reviewNotes,
                    testId: attemptRequest.testId._id,
                    testTitle: attemptRequest.testId.title,
                    requestedAttempts: attemptRequest.requestedAttempts
                }
            };

        } catch (error) {
            console.error('Error reviewing attempt request:', error);
            return { success: false, message: 'Failed to process review' };
        }
    }

    // Grant attempts directly with notifications
    async grantAttemptsDirectly(data) {
        try {
            const { userId, testId, extraAttempts, reason, grantedBy, organizationId } = data;

            // Validate test and user
            const test = await Test.findById(testId);
            if (!test) {
                return { success: false, message: 'Test not found' };
            }

            const student = await User.findById(userId);
            if (!student) {
                return { success: false, message: 'Student not found' };
            }

            const granter = await User.findById(grantedBy);

            // Create or update override
            const override = await StudentTestOverride.findOneAndUpdate(
                { userId, testId },
                {
                    $inc: { extraAttempts: extraAttempts },
                    $set: {
                        organizationId,
                        reason: reason,
                        grantedBy,
                        grantedAt: new Date(),
                    }
                },
                { upsert: true, new: true }
            );

            // Create notification for student
            await Notification.notifyDirectAttemptGrant(override);

            return {
                success: true,
                message: `Granted ${extraAttempts} additional attempt(s) to ${student.fullName}`,
                override,
                notificationData: {
                    message: `${granter.fullName} has granted you ${extraAttempts} additional attempt(s) for "${test.title}"`,
                    testId,
                    data: {
                        extraAttempts,
                        testTitle: test.title,
                        granterName: granter.fullName
                    }
                }
            };

        } catch (error) {
            console.error('Error granting attempts directly:', error);
            return { success: false, message: 'Failed to grant attempts' };
        }
    }

    // Notification management methods
    async markNotificationRead(notificationId, userId) {
        try {
            const ObjectId = require('mongoose').Types.ObjectId;
            const userObjectId = new ObjectId(userId);

            await Notification.findOneAndUpdate(
                { _id: notificationId, recipientId: userObjectId },
                {
                    isRead: true,
                    readAt: new Date()
                }
            );

            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false };
        }
    }

    async markAllNotificationsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { recipientId: userId, isRead: false },
                {
                    isRead: true,
                    readAt: new Date()
                }
            );

            return result.modifiedCount;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return 0;
        }
    }

    async getUnreadCount(userId) {
        try {
            const ObjectId = require('mongoose').Types.ObjectId;
            const userObjectId = new ObjectId(userId);

            return await Notification.countDocuments({
                recipientId: userObjectId,
                isRead: false
            });
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    async getUserNotifications(userId, limit = 20, page = 1) {
        try {
            const skip = (page - 1) * limit;
            const ObjectId = require('mongoose').Types.ObjectId;

            // Convert userId to ObjectId for proper MongoDB querying
            let userObjectId;
            try {
                userObjectId = new ObjectId(userId);
            } catch (conversionError) {
                console.error('ObjectId conversion failed:', conversionError);
                userObjectId = userId; // Fallback to string query
            }

            const notifications = await Notification.find({
                recipientId: userObjectId
            })
                .populate('senderId', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const total = await Notification.countDocuments({
                recipientId: userObjectId
            });

            return {
                notifications,
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    hasNext: skip + notifications.length < total
                }
            };
        } catch (error) {
            console.error('Error getting user notifications:', error);
            return { notifications: [], pagination: { current: 1, total: 0, hasNext: false } };
        }
    }

    // Send custom notification
    async sendCustomNotification(data) {
        try {
            const { recipientIds, senderId, organizationId, type, title, message, actionUrl, actionText } = data;

            const notifications = recipientIds.map(recipientId => ({
                recipientId,
                senderId,
                organizationId,
                type,
                title,
                message,
                actionUrl,
                actionText
            }));

            const createdNotifications = await Notification.insertMany(notifications);

            // Send real-time notifications via socket
            if (this.socketService) {
                recipientIds.forEach(recipientId => {
                    this.socketService.sendNotificationToUser(recipientId, {
                        type,
                        title,
                        message,
                        actionUrl,
                        actionText,
                        timestamp: new Date().toISOString()
                    });
                });
            }

            return { success: true, count: createdNotifications.length };
        } catch (error) {
            console.error('Error sending custom notification:', error);
            return { success: false, message: 'Failed to send notifications' };
        }
    }

    async submitNotificationOnly(data) {
        try {
            const { userId, organizationId, testId, requestedAttempts, reason, requestId } = data;

            // Get test and student data
            const test = await Test.findById(testId);
            const student = await User.findById(userId);

            if (!test || !student) {
                console.error('Test or student not found for notification');
                return { success: false, message: 'Test or student not found' };
            }

            // Create student name fallback
            const studentName = student.fullName ||
                `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                student.loginId ||
                `Student ${student._id.toString().slice(-6)}`;

            // Create database notifications for instructors
            try {
                const AttemptRequest = require('../models/AttemptRequest');
                const attemptRequest = await AttemptRequest.findById(requestId);

                if (attemptRequest) {
                    await Notification.createAttemptRequestNotification(attemptRequest);
                }
            } catch (notifError) {
                console.error('Error creating database notifications:', notifError);
            }

            // Send real-time socket notifications
            if (this.socketService) {
                const notification = {
                    type: 'attempt_request_submitted',
                    title: 'New Attempt Request',
                    message: `${studentName} has requested ${requestedAttempts} additional attempt(s) for "${test.title}"`,
                    data: {
                        requestId,
                        studentId: userId,
                        testId,
                        requestedAttempts,
                        reason
                    },
                    actionUrl: `/admin/attempt-requests/${requestId}`,
                    actionText: 'Review Request',
                    timestamp: new Date().toISOString()
                };

                this.socketService.sendToInstructors(organizationId, 'notification:new', notification);
            }

            return { success: true };

        } catch (error) {
            console.error('Error in submitNotificationOnly:', error);
            return { success: false, message: 'Failed to send notifications' };
        }
    }
}

module.exports = NotificationController;