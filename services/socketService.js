// /services/socketService.js - Enhanced with notification support
const jwt = require('jsonwebtoken');

class SocketService {
    constructor() {
        this.io = null;
        this.testSessionController = null;
        this.notificationController = null;
    }

    // Initialize Socket.IO with server instance
    initialize(server) {
        const { Server } = require('socket.io');

        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                methods: ['GET', 'POST', 'PATCH', 'DELETE'],
                credentials: true,
            },
        });

        this.setupMiddleware();
        this.setupEventHandlers();

        return this.io;
    }

    // Inject the test session controller
    setTestSessionController(controller) {
        this.testSessionController = controller;
    }

    // Inject notification controller
    setNotificationController(controller) {
        this.notificationController = controller;
    }

    // Authentication middleware
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token ||
                    socket.handshake.headers.cookie?.match(/accessToken=([^;]+)/)?.[1];

                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.userId;
                socket.organizationId = decoded.organizationId;
                socket.role = decoded.role;

                next();
            } catch (err) {
                next(new Error('Authentication failed'));
            }
        });
    }

    // Enhanced event handlers with notification support
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            // Enhanced room joining for notifications
            socket.join(`org_${socket.organizationId}`);
            socket.join(`user_${socket.userId}`);

            // Join role-specific rooms for instructors/admins
            if (['instructor', 'admin'].includes(socket.role)) {
                socket.join(`org_${socket.organizationId}_instructors`);
            }

            // Session connection events
            socket.on('session:join', async (data) => {
                await this.handleSessionJoin(socket, data);
            });

            socket.on('session:rejoin', async (data) => {
                await this.handleSessionRejoin(socket, data);
            });

            // Answer submission
            socket.on('answer:submit', async (data) => {
                await this.handleAnswerSubmit(socket, data);
            });

            // Notification events
            socket.on('notifications:get_unread_count', async () => {
                await this.handleGetUnreadCount(socket);
            });

            socket.on('notifications:mark_read', async (data) => {
                await this.handleMarkNotificationRead(socket, data);
            });

            socket.on('notifications:mark_all_read', async () => {
                await this.handleMarkAllNotificationsRead(socket);
            });

            socket.on('notifications:get_recent', async (data) => {
                await this.handleGetRecentNotifications(socket, data);
            });

            // Attempt request events
            socket.on('attempt_request:submit', async (data) => {
                await this.handleAttemptRequestSubmit(socket, data);
            });

            socket.on('attempt_request:review', async (data) => {
                await this.handleAttemptRequestReview(socket, data);
            });

            // Direct override events  
            socket.on('override:grant_attempts', async (data) => {
                await this.handleGrantAttempts(socket, data);
            });

            // Disconnection
            socket.on('disconnect', async (reason) => {
                await this.handleDisconnection(socket, reason);
            });

            // Time sync request (manual)
            socket.on('timer:request_sync', async (data) => {
                await this.handleTimerSyncRequest(socket, data);
            });
        });
    }

    // Session event handlers
    async handleSessionJoin(socket, data) {
        try {
            if (!this.testSessionController) {
                throw new Error('Test session controller not available');
            }

            const { sessionId } = data;
            socket.join(`session_${sessionId}`);
            socket.sessionId = sessionId;

            // Delegate to controller
            const result = await this.testSessionController.handleSocketJoin(
                sessionId,
                socket.userId,
                socket.id
            );

            if (result.success) {
                socket.emit('session:joined', {
                    sessionId,
                    message: 'Successfully joined session',
                    ...result.data
                });
            } else {
                socket.emit('session:error', {
                    message: result.message || 'Failed to join session',
                    error: result.error
                });
            }

        } catch (error) {
            console.error('Error handling session join:', error);
            socket.emit('session:error', {
                message: 'Failed to join session',
                error: error.message
            });
        }
    }

    async handleSessionRejoin(socket, data) {
        try {
            if (!this.testSessionController) {
                throw new Error('Test session controller not available');
            }

            const { sessionId } = data;
            socket.join(`session_${sessionId}`);
            socket.sessionId = sessionId;

            // Delegate to controller
            const result = await this.testSessionController.handleSocketRejoin(
                sessionId,
                socket.userId,
                socket.id
            );

            if (result.success) {
                socket.emit('session:rejoined', {
                    sessionId,
                    message: 'Successfully rejoined session',
                    ...result.data
                });
            } else {
                socket.emit('session:error', {
                    message: result.message || 'Failed to rejoin session',
                    error: result.error
                });
            }

        } catch (error) {
            console.error('Error handling session rejoin:', error);
            socket.emit('session:error', {
                message: 'Failed to rejoin session',
                error: error.message
            });
        }
    }

    async handleAnswerSubmit(socket, data) {
        try {
            if (!this.testSessionController) {
                throw new Error('Test session controller not available');
            }

            if (!socket.sessionId) {
                throw new Error('No active session for this socket');
            }

            // Delegate to controller
            const result = await this.testSessionController.handleAnswerSubmit(
                socket.sessionId,
                socket.userId,
                data
            );

            if (result.success) {
                // Send result back to student
                socket.emit('answer:processed', {
                    sessionId: socket.sessionId,
                    success: true,
                    action: result.action,
                    ...result.data
                });

                // Handle different action types
                switch (result.action) {
                    case 'next_question':
                        socket.emit('question:next', result.data);
                        break;

                    case 'section_transition':
                        socket.emit('section:transition', result.data);
                        break;

                    case 'test_completion':
                        socket.emit('test:ready_for_completion', result.data);
                        break;
                }

            } else {
                socket.emit('answer:error', {
                    message: result.message || 'Failed to process answer',
                    error: result.error
                });
            }

        } catch (error) {
            console.error('Error handling answer submission:', error);
            socket.emit('answer:error', {
                message: 'Failed to process answer',
                error: error.message
            });
        }
    }

    // Attempt request submission via socket
    async handleAttemptRequestSubmit(socket, data) {
        try {
            if (!this.notificationController) {
                throw new Error('Notification controller not available');
            }

            const { testId, requestedAttempts, reason } = data;

            // Submit through controller
            const result = await this.notificationController.submitAttemptRequest({
                userId: socket.userId,
                organizationId: socket.organizationId,
                testId,
                requestedAttempts,
                reason
            });

            if (result.success) {
                // Confirm to student
                socket.emit('attempt_request:submitted', {
                    success: true,
                    requestId: result.requestId,
                    message: 'Request submitted successfully'
                });

                // Notify all instructors/admins in real-time
                this.sendNewAttemptRequestNotification(
                    socket.organizationId,
                    result.requestData
                );

            } else {
                socket.emit('attempt_request:error', {
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error handling attempt request submission:', error);
            socket.emit('attempt_request:error', {
                success: false,
                message: 'Failed to submit request'
            });
        }
    }

    // Attempt request review via socket
    async handleAttemptRequestReview(socket, data) {
        try {
            if (!this.notificationController) {
                throw new Error('Notification controller not available');
            }

            // Verify permission
            if (!['instructor', 'admin'].includes(socket.role)) {
                socket.emit('attempt_request:error', {
                    success: false,
                    message: 'Insufficient permissions'
                });
                return;
            }

            const { requestId, decision, reviewNotes } = data;

            // Process review through controller
            const result = await this.notificationController.reviewAttemptRequest({
                requestId,
                reviewerId: socket.userId,
                decision,
                reviewNotes
            });

            if (result.success) {
                // Confirm to reviewer
                socket.emit('attempt_request:reviewed', {
                    success: true,
                    requestId,
                    decision,
                    message: `Request ${decision} successfully`
                });

                // Notify student in real-time
                this.sendAttemptRequestDecisionNotification(
                    result.studentId,
                    result.decisionData
                );

                // Update other instructors about the decision
                socket.to(`org_${socket.organizationId}_instructors`).emit('attempt_request:decision_made', {
                    requestId,
                    decision,
                    reviewedBy: socket.userId
                });

            } else {
                socket.emit('attempt_request:error', {
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error handling attempt request review:', error);
            socket.emit('attempt_request:error', {
                success: false,
                message: 'Failed to process review'
            });
        }
    }

    // Direct attempt granting via socket
    async handleGrantAttempts(socket, data) {
        try {
            if (!this.notificationController) {
                throw new Error('Notification controller not available');
            }

            // Verify permission
            if (!['instructor', 'admin'].includes(socket.role)) {
                socket.emit('override:error', {
                    success: false,
                    message: 'Insufficient permissions'
                });
                return;
            }

            const { userId, testId, extraAttempts, reason } = data;

            // Grant through controller
            const result = await this.notificationController.grantAttemptsDirectly({
                userId,
                testId,
                extraAttempts,
                reason,
                grantedBy: socket.userId,
                organizationId: socket.organizationId
            });

            if (result.success) {
                // Confirm to granter
                socket.emit('override:granted', {
                    success: true,
                    message: result.message,
                    override: result.override
                });

                // Notify student in real-time
                this.sendDirectAttemptGrantNotification(
                    userId,
                    result.notificationData
                );

            } else {
                socket.emit('override:error', {
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error handling direct attempt grant:', error);
            socket.emit('override:error', {
                success: false,
                message: 'Failed to grant attempts'
            });
        }
    }

    // Notification management handlers
    async handleGetUnreadCount(socket) {
        try {
            if (!this.notificationController) return;

            const count = await this.notificationController.getUnreadCount(socket.userId);
            socket.emit('notifications:unread_count', { count });

        } catch (error) {
            console.error('Error getting unread count:', error);
        }
    }

    async handleMarkNotificationRead(socket, data) {
        try {
            if (!this.notificationController) return;

            const { notificationId } = data;
            await this.notificationController.markNotificationRead(notificationId, socket.userId);

            socket.emit('notification:marked_read', {
                notificationId,
                success: true
            });

            // Send updated count
            const count = await this.notificationController.getUnreadCount(socket.userId);
            socket.emit('notifications:unread_count', { count });

        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async handleMarkAllNotificationsRead(socket) {
        try {
            if (!this.notificationController) return;

            const count = await this.notificationController.markAllNotificationsRead(socket.userId);

            socket.emit('notifications:all_marked_read', {
                success: true,
                markedCount: count
            });

            socket.emit('notifications:unread_count', { count: 0 });

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    async handleGetRecentNotifications(socket, data) {
        try {
            if (!this.notificationController) return;

            const { limit = 10, page = 1 } = data;
            const result = await this.notificationController.getUserNotifications(socket.userId, limit, page);

            socket.emit('notifications:recent', result);

        } catch (error) {
            console.error('Error getting recent notifications:', error);
        }
    }

    // Handle disconnection
    async handleDisconnection(socket, reason) {
        try {
            if (socket.sessionId && this.testSessionController) {
                // Check if session is in a final state
                try {
                    const sessionManager = require('../testSession/sessionManager');
                    const session = await sessionManager.getSessionInternal(socket.sessionId);

                    // Don't pause sessions that are already in a final state
                    if (['completed', 'abandoned', 'expired'].includes(session.status)) {
                        return;
                    }
                } catch (statusError) {
                    // Could not check session status, proceeding with disconnection handling
                }

                // Only handle disconnection for active sessions
                await this.testSessionController.handleSocketDisconnection(
                    socket.sessionId,
                    socket.userId,
                    reason
                );
            }

        } catch (error) {
            console.error('Error handling disconnection:', error);
        }
    }

    // Handle manual timer sync request
    async handleTimerSyncRequest(socket, data) {
        try {
            if (!this.testSessionController || !socket.sessionId) {
                return;
            }

            const syncData = await this.testSessionController.getTimerSync(socket.sessionId);

            socket.emit('timer:sync', {
                sessionId: socket.sessionId,
                ...syncData
            });

        } catch (error) {
            console.error('Error handling timer sync request:', error);
        }
    }

    // Notification Broadcasting Methods

    // Send new attempt request notification to instructors
    sendNewAttemptRequestNotification(organizationId, requestData) {
        const notification = {
            type: 'attempt_request_submitted',
            title: 'New Attempt Request',
            message: `${requestData.studentName} has requested ${requestData.requestedAttempts} additional attempt(s) for "${requestData.testTitle}"`,
            data: {
                requestId: requestData.requestId,
                studentId: requestData.studentId,
                testId: requestData.testId,
                requestedAttempts: requestData.requestedAttempts,
                reason: requestData.reason
            },
            actionUrl: `/admin/attempt-requests/${requestData.requestId}`,
            actionText: 'Review Request',
            timestamp: new Date().toISOString()
        };

        // Send to all instructors/admins
        this.io.to(`org_${organizationId}_instructors`).emit('notification:new', notification);

        // Update notification badges for instructors
        this.updateNotificationBadge(organizationId, 'instructors');
    }

    // Send attempt request decision notification to student
    sendAttemptRequestDecisionNotification(studentId, decisionData) {
        const notification = {
            type: `attempt_request_${decisionData.decision}`,
            title: `Attempt Request ${decisionData.decision === 'approved' ? 'Approved' : 'Rejected'}`,
            message: decisionData.decision === 'approved'
                ? `Your request for ${decisionData.requestedAttempts} additional attempt(s) for "${decisionData.testTitle}" has been approved!`
                : `Your request for additional attempts for "${decisionData.testTitle}" has been rejected. ${decisionData.reviewNotes || ''}`,
            data: {
                requestId: decisionData.requestId,
                testId: decisionData.testId,
                decision: decisionData.decision,
                reviewNotes: decisionData.reviewNotes,
                canRetakeNow: decisionData.decision === 'approved'
            },
            actionUrl: decisionData.decision === 'approved' ? `/tests/${decisionData.testId}` : null,
            actionText: decisionData.decision === 'approved' ? 'Take Test' : null,
            timestamp: new Date().toISOString()
        };

        // Send to specific student
        this.io.to(`user_${studentId}`).emit('notification:new', notification);

        // Update notification badge
        this.updateNotificationBadgeForUser(studentId);
    }

    // Send direct attempt grant notification to student
    sendDirectAttemptGrantNotification(studentId, notificationData) {
        const notification = {
            type: 'attempts_granted_directly',
            title: 'Additional Attempts Granted',
            message: notificationData.message,
            data: notificationData.data,
            actionUrl: `/tests/${notificationData.testId}`,
            actionText: 'Take Test',
            timestamp: new Date().toISOString()
        };

        // Send to specific student
        this.io.to(`user_${studentId}`).emit('notification:new', notification);

        // Update notification badge
        this.updateNotificationBadgeForUser(studentId);
    }

    // Update notification badge for specific user
    async updateNotificationBadgeForUser(userId) {
        try {
            if (!this.notificationController) return;

            const unreadCount = await this.notificationController.getUnreadCount(userId);
            this.io.to(`user_${userId}`).emit('notification:badge_update', {
                unreadCount
            });

        } catch (error) {
            console.error('Error updating notification badge:', error);
        }
    }

    // Update notification badge for organization role
    async updateNotificationBadge(organizationId, role) {
        try {
            if (!this.notificationController) return;

            // Trigger refresh request for all instructors
            this.io.to(`org_${organizationId}_instructors`).emit('notification:refresh_badge');

        } catch (error) {
            console.error('Error updating notification badge:', error);
        }
    }

    // Utility methods for sending messages (called by controller)
    sendToSession(sessionId, event, data) {
        if (!this.io) return;
        this.io.to(`session_${sessionId}`).emit(event, data);
    }

    sendToUser(userId, event, data) {
        if (!this.io) return;
        this.io.to(`user_${userId}`).emit(event, data);
    }

    sendToOrganization(organizationId, event, data) {
        if (!this.io) return;
        this.io.to(`org_${organizationId}`).emit(event, data);
    }

    // Send to instructors/admins only
    sendToInstructors(organizationId, event, data) {
        if (!this.io) return;

        // Check how many sockets are in the room
        const room = this.io.sockets.adapter.rooms.get(`org_${organizationId}_instructors`);

        // Add recipient information to the data
        const enrichedData = {
            ...data,
            recipientRole: 'instructor',
            organizationId: organizationId,
            timestamp: data.timestamp || new Date().toISOString()
        };

        this.io.to(`org_${organizationId}_instructors`).emit(event, enrichedData);
    }

    // Send general notification to user
    sendNotificationToUser(userId, notification) {
        if (!this.io) {
            return;
        }

        const enrichedNotification = {
            ...notification,
            recipientId: userId,
            timestamp: new Date().toISOString(),
            source: 'socket'
        };

        // Send to user's personal room
        const userRoom = `user_${userId}`;

        // Check if user is connected
        const room = this.io.sockets.adapter.rooms.get(userRoom);
        const socketCount = room ? room.size : 0;

        if (socketCount > 0) {
            this.io.to(userRoom).emit('notification:new', enrichedNotification);

            // Update badge count for user
            this.updateNotificationBadgeForUser(userId);
        }
    }

    // Send notification to multiple users
    sendNotificationToUsers(userIds, notification) {
        userIds.forEach(userId => {
            this.sendNotificationToUser(userId, notification);
        });
    }

    // Send system notification (maintenance, updates, etc.)
    sendSystemNotification(organizationId, notification) {
        this.io.to(`org_${organizationId}`).emit('notification:system', {
            ...notification,
            type: 'system',
            timestamp: new Date().toISOString()
        });
    }

    // Broadcast test-related notifications
    sendTestNotification(organizationId, testId, notification) {
        this.io.to(`org_${organizationId}`).emit('notification:test', {
            ...notification,
            testId,
            type: 'test_related',
            timestamp: new Date().toISOString()
        });
    }

    // Timer and session methods
    sendTimerSync(sessionId, timerData) {
        this.sendToSession(sessionId, 'timer:sync', {
            sessionId,
            timeRemaining: timerData.timeRemaining,
            serverTime: Date.now(),
            sectionIndex: timerData.sectionIndex || 0,
            type: timerData.type || 'regular'
        });
    }

    sendTimerWarning(sessionId, warning) {
        this.sendToSession(sessionId, 'timer:warning', {
            sessionId,
            timeRemaining: warning.timeRemaining,
            message: warning.message,
            type: 'warning'
        });
    }

    sendSessionPaused(sessionId, data) {
        this.sendToSession(sessionId, 'session:paused', {
            sessionId,
            reason: data.reason || 'disconnection',
            gracePeriodSeconds: data.gracePeriodSeconds || 300,
            message: data.message || 'Session paused due to disconnection'
        });
    }

    sendSessionResumed(sessionId, data) {
        this.sendToSession(sessionId, 'session:resumed', {
            sessionId,
            message: data.message || 'Session resumed',
            ...data
        });
    }

    sendTestCompleted(sessionId, data) {
        this.sendToSession(sessionId, 'test:completed', {
            sessionId,
            message: data.message || 'Test completed',
            result: data.result,
            timestamp: new Date().toISOString()
        });
    }

    sendSectionExpired(sessionId, data) {
        this.sendToSession(sessionId, 'section:expired', {
            sessionId,
            message: data.message || 'Section time expired',
            newSectionIndex: data.newSectionIndex,
            timestamp: new Date().toISOString()
        });
    }

    // Connection utility methods
    hasConnectedClients(sessionId) {
        if (!this.io) return false;
        const room = this.io.sockets.adapter.rooms.get(`session_${sessionId}`);
        return room && room.size > 0;
    }

    getConnectedClientCount(sessionId) {
        if (!this.io) return 0;
        const room = this.io.sockets.adapter.rooms.get(`session_${sessionId}`);
        return room ? room.size : 0;
    }

    // Cleanup
    cleanup() {
        if (this.io) {
            this.io.close();
        }
    }

    getIO() {
        return this.io;
    }
}

// Export singleton instance
const socketService = new SocketService();
module.exports = socketService;