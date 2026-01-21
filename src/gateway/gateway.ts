// src/gateway/gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TestSessionService } from '../test-session/test-session.service';
import { NotificationService } from '../notification/notification.service';

// Extended socket interface with user data
interface AuthenticatedSocket extends Socket {
  userId?: string;
  organizationId?: string;
  role?: string;
  sessionId?: string;
}

// Helper to validate MongoDB ObjectId format
const isValidObjectId = (id: string): boolean => {
  return /^[a-f\d]{24}$/i.test(id);
};

@WebSocketGateway({
  cors: {
    // Allow all origins - let the app work without WebSocket if needed
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  // Allow connection even if upgrade fails
  allowUpgrades: true,
  // Don't require strict handshake
  serveClient: false,
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => TestSessionService))
    private readonly testSessionService: TestSessionService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // Connection error logging - don't crash, just log
    server.engine.on('connection_error', (err: any) => {
      this.logger.warn(`Socket.IO connection error (non-fatal): ${err.message}`);
    });
  }

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie?.match(/accessToken=([^;]+)/)?.[1] ||
        (socket.handshake.query?.token as string);

      if (!token) {
        // Don't log as error - user might just be browsing without auth
        this.logger.debug('Socket connection without token - allowing limited access');
        // Allow connection but mark as unauthenticated
        socket.emit('connection:status', { authenticated: false });
        return;
      }

      // Verify token - wrap in try/catch to not break on invalid tokens
      try {
        const decoded = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });

        // Attach user info to socket
        socket.userId = decoded.userId;
        socket.organizationId = decoded.organizationId;
        socket.role = decoded.role;

        // Join rooms
        socket.join(`org_${socket.organizationId}`);
        socket.join(`user_${socket.userId}`);

        // Join instructor room if applicable
        if (socket.role && ['instructor', 'admin'].includes(socket.role)) {
          socket.join(`org_${socket.organizationId}_instructors`);
        }

        socket.emit('connection:status', { authenticated: true, userId: socket.userId });
        this.logger.log(`Client connected: ${socket.id} (User: ${socket.userId})`);
      } catch (tokenError) {
        // Token invalid/expired - still allow connection for public features
        this.logger.debug(`Socket connection with invalid token: ${tokenError.message}`);
        socket.emit('connection:status', { authenticated: false, reason: 'invalid_token' });
      }
    } catch (error) {
      // Catch-all - never crash on connection
      this.logger.warn(`Socket connection error (handled): ${error.message}`);
      socket.emit('connection:status', { authenticated: false, reason: 'error' });
    }
  }

  async handleDisconnect(socket: AuthenticatedSocket) {
    this.logger.debug(`Client disconnected: ${socket.id}`);

    // Only handle session disconnection if user was authenticated and had a session
    if (socket.userId && socket.sessionId) {
      try {
        await this.handleSessionDisconnection(socket);
      } catch (error) {
        // Don't throw - just log
        this.logger.warn('Error handling disconnection (non-fatal):', error.message);
      }
    }

    // Clear socket properties to prevent any stale references
    socket.sessionId = undefined;
    socket.userId = undefined;
    socket.organizationId = undefined;
    socket.role = undefined;
  }

  // ==========================================
  // SESSION EVENTS
  // ==========================================

  @SubscribeMessage('session:join')
  async handleSessionJoin(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    // Check if authenticated
    if (!socket.userId) {
      socket.emit('session:error', {
        message: 'Authentication required to join session',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    try {
      const { sessionId } = data;

      // Validate sessionId format
      if (!sessionId || !isValidObjectId(sessionId)) {
        socket.emit('session:error', {
          message: 'Invalid session ID format',
          code: 'INVALID_SESSION_ID',
        });
        return;
      }

      socket.join(`session_${sessionId}`);
      socket.sessionId = sessionId;

      const result = await this.testSessionService.handleSocketJoin(
        sessionId,
        socket.userId!,  // Non-null assertion safe after check above
        socket.id,
      );

      if (result.success) {
        socket.emit('session:joined', {
          sessionId,
          message: 'Successfully joined session',
          ...result.data,
        });
      } else {
        socket.emit('session:error', {
          message: result.message || 'Failed to join session',
          code: 'JOIN_FAILED',
        });
      }
    } catch (error) {
      this.logger.error('Error handling session join:', error.message);
      socket.emit('session:error', {
        message: 'Failed to join session',
        code: 'SERVER_ERROR',
      });
    }
  }

  @SubscribeMessage('session:rejoin')
  async handleSessionRejoin(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (!socket.userId) {
      socket.emit('session:error', {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    try {
      const { sessionId } = data;

      // Validate sessionId format
      if (!sessionId || !isValidObjectId(sessionId)) {
        socket.emit('session:error', {
          message: 'Invalid session ID format',
          code: 'INVALID_SESSION_ID',
        });
        return;
      }

      socket.join(`session_${sessionId}`);
      socket.sessionId = sessionId;

      const result = await this.testSessionService.handleSocketRejoin(
        sessionId,
        socket.userId!,  // Non-null assertion safe after check above
        socket.id,
      );

      if (result.success) {
        socket.emit('session:rejoined', {
          sessionId,
          message: 'Successfully rejoined session',
          ...result.data,
        });
      } else {
        socket.emit('session:error', {
          message: result.message || 'Failed to rejoin session',
          code: 'REJOIN_FAILED',
        });
      }
    } catch (error) {
      this.logger.error('Error handling session rejoin:', error.message);
      socket.emit('session:error', {
        message: 'Failed to rejoin session',
        code: 'SERVER_ERROR',
      });
    }
  }

  @SubscribeMessage('answer:submit')
  async handleAnswerSubmit(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    if (!socket.userId) {
      socket.emit('answer:error', {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!socket.sessionId) {
      socket.emit('answer:error', {
        message: 'No active session. Please rejoin the test.',
        code: 'NO_SESSION',
      });
      return;
    }

    try {
      const result = await this.testSessionService.handleAnswerSubmit(
        socket.sessionId,
        socket.userId,
        data,
      );

      if (result.success) {
        socket.emit('answer:processed', {
          sessionId: socket.sessionId,
          success: true,
          action: result.action,
          ...result.data,
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
          code: 'SUBMIT_FAILED',
        });
      }
    } catch (error) {
      this.logger.error('Error handling answer submission:', error.message);
      socket.emit('answer:error', {
        message: 'Failed to process answer. Your answer may still be saved.',
        code: 'SERVER_ERROR',
      });
    }
  }

  @SubscribeMessage('timer:request_sync')
  async handleTimerSyncRequest(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    if (!socket.sessionId) return;

    try {
      const syncData = await this.testSessionService.getTimerSync(socket.sessionId);

      socket.emit('timer:sync', {
        sessionId: socket.sessionId,
        ...syncData,
      });
    } catch (error) {
      // Don't emit error - timer sync is non-critical
      this.logger.debug('Timer sync failed (non-fatal):', error.message);
    }
  }

  private async handleSessionDisconnection(socket: AuthenticatedSocket) {
    if (!socket.sessionId) return;

    try {
      // Check if session is in a final state
      const session = await this.testSessionService.getSessionInternal(socket.sessionId);

      if (['completed', 'abandoned', 'expired', 'failed'].includes(session?.status)) {
        return;
      }

      await this.testSessionService.handleSocketDisconnection(
        socket.sessionId!,
        socket.userId!,
        'disconnect',
      );
    } catch (error) {
      // Non-fatal - just log
      this.logger.debug('Session disconnection handling failed:', error.message);
    }
  }

  // ==========================================
  // NOTIFICATION EVENTS
  // ==========================================

  @SubscribeMessage('notifications:get_unread_count')
  async handleGetUnreadCount(@ConnectedSocket() socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    try {
      const count = await this.notificationService.getUnreadCount({
        userId: socket.userId,
        organizationId: socket.organizationId,
        role: socket.role,
      } as any);

      socket.emit('notifications:unread_count', { count });
    } catch (error) {
      this.logger.debug('Error getting unread count (non-fatal):', error.message);
    }
  }

  @SubscribeMessage('notifications:mark_read')
  async handleMarkNotificationRead(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (!socket.userId) return;

    try {
      await this.notificationService.markAsRead(data.notificationId, {
        userId: socket.userId,
        organizationId: socket.organizationId,
        role: socket.role,
      } as any);

      socket.emit('notification:marked_read', {
        notificationId: data.notificationId,
        success: true,
      });

      // Send updated count
      const count = await this.notificationService.getUnreadCount({
        userId: socket.userId,
        organizationId: socket.organizationId,
        role: socket.role,
      } as any);
      socket.emit('notifications:unread_count', { count });
    } catch (error) {
      this.logger.debug('Error marking notification as read:', error.message);
    }
  }

  @SubscribeMessage('notifications:mark_all_read')
  async handleMarkAllNotificationsRead(@ConnectedSocket() socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    try {
      const result = await this.notificationService.markAllAsRead({
        userId: socket.userId,
        organizationId: socket.organizationId,
        role: socket.role,
      } as any);

      socket.emit('notifications:all_marked_read', {
        success: true,
        markedCount: result.markedCount,
      });

      socket.emit('notifications:unread_count', { count: 0 });
    } catch (error) {
      this.logger.debug('Error marking all notifications as read:', error.message);
    }
  }

  @SubscribeMessage('notifications:get_recent')
  async handleGetRecentNotifications(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { limit?: number; page?: number },
  ) {
    if (!socket.userId) return;

    try {
      const result = await this.notificationService.getUserNotifications(
        { limit: data.limit || 10, page: data.page || 1 },
        {
          userId: socket.userId,
          organizationId: socket.organizationId,
          role: socket.role,
        } as any,
      );

      socket.emit('notifications:recent', result);
    } catch (error) {
      this.logger.debug('Error getting recent notifications:', error.message);
    }
  }

  // ==========================================
  // ATTEMPT REQUEST EVENTS
  // ==========================================

  @SubscribeMessage('attempt_request:submit')
  async handleAttemptRequestSubmit(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { testId: string; requestedAttempts: number; reason: string },
  ) {
    if (!socket.userId) {
      socket.emit('attempt_request:error', {
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    try {
      const result = await this.notificationService.submitAttemptRequest(
        {
          testId: data.testId,
          requestedAttempts: data.requestedAttempts,
          reason: data.reason,
        },
        {
          userId: socket.userId,
          organizationId: socket.organizationId,
          role: socket.role,
        } as any,
      );

      if (result.success) {
        socket.emit('attempt_request:submitted', {
          success: true,
          requestId: result.requestId,
          message: 'Request submitted successfully',
        });

        // Notify instructors
        this.sendToInstructors(socket.organizationId!, 'notification:new', {
          type: 'attempt_request_submitted',
          title: 'New Attempt Request',
          message: result.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        socket.emit('attempt_request:error', {
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      this.logger.error('Error handling attempt request submission:', error.message);
      socket.emit('attempt_request:error', {
        success: false,
        message: 'Failed to submit request',
      });
    }
  }

  @SubscribeMessage('attempt_request:review')
  async handleAttemptRequestReview(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { requestId: string; decision: 'approved' | 'rejected'; reviewNotes?: string },
  ) {
    if (!socket.userId) {
      socket.emit('attempt_request:error', {
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Verify permission
    if (!socket.role || !['instructor', 'admin'].includes(socket.role)) {
      socket.emit('attempt_request:error', {
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    try {
      const result = await this.notificationService.reviewAttemptRequest(
        {
          requestId: data.requestId,
          decision: data.decision,
          reviewNotes: data.reviewNotes,
        },
        {
          userId: socket.userId,
          organizationId: socket.organizationId,
          role: socket.role,
        } as any,
      );

      if (result.success) {
        socket.emit('attempt_request:reviewed', {
          success: true,
          requestId: data.requestId,
          decision: data.decision,
          message: `Request ${data.decision} successfully`,
        });

        // Update other instructors
        socket.to(`org_${socket.organizationId}_instructors`).emit('attempt_request:decision_made', {
          requestId: data.requestId,
          decision: data.decision,
          reviewedBy: socket.userId,
        });
      } else {
        socket.emit('attempt_request:error', {
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      this.logger.error('Error handling attempt request review:', error.message);
      socket.emit('attempt_request:error', {
        success: false,
        message: 'Failed to process review',
      });
    }
  }

  // ==========================================
  // UTILITY METHODS (called by services)
  // These methods are safe to call even if no clients connected
  // ==========================================

  sendToSession(sessionId: string, event: string, data: any) {
    if (!this.server) return;
    try {
      this.server.to(`session_${sessionId}`).emit(event, data);
    } catch (error) {
      this.logger.debug(`Failed to send to session ${sessionId}:`, error.message);
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    if (!this.server) return;
    try {
      this.server.to(`user_${userId}`).emit(event, data);
    } catch (error) {
      this.logger.debug(`Failed to send to user ${userId}:`, error.message);
    }
  }

  sendToOrganization(organizationId: string, event: string, data: any) {
    if (!this.server) return;
    try {
      this.server.to(`org_${organizationId}`).emit(event, data);
    } catch (error) {
      this.logger.debug(`Failed to send to org ${organizationId}:`, error.message);
    }
  }

  sendToInstructors(organizationId: string, event: string, data: any) {
    if (!this.server) return;
    try {
      this.server.to(`org_${organizationId}_instructors`).emit(event, {
        ...data,
        recipientRole: 'instructor',
        organizationId,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    } catch (error) {
      this.logger.debug(`Failed to send to instructors:`, error.message);
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    if (!this.server) return;
    try {
      this.server.to(`user_${userId}`).emit('notification:new', {
        ...notification,
        recipientId: userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.debug(`Failed to send notification to user ${userId}:`, error.message);
    }
  }

  sendTimerSync(sessionId: string, timerData: any) {
    this.sendToSession(sessionId, 'timer:sync', {
      sessionId,
      timeRemaining: timerData.timeRemaining,
      serverTime: Date.now(),
      sectionIndex: timerData.sectionIndex || 0,
      type: timerData.type || 'regular',
    });
  }

  sendTimerWarning(sessionId: string, warning: any) {
    this.sendToSession(sessionId, 'timer:warning', {
      sessionId,
      timeRemaining: warning.timeRemaining,
      message: warning.message,
      type: 'warning',
    });
  }

  sendSessionPaused(sessionId: string, data: any) {
    this.sendToSession(sessionId, 'session:paused', {
      sessionId,
      reason: data.reason || 'disconnection',
      gracePeriodSeconds: data.gracePeriodSeconds || 300,
      message: data.message || 'Session paused due to disconnection',
    });
  }

  sendSessionResumed(sessionId: string, data: any) {
    this.sendToSession(sessionId, 'session:resumed', {
      sessionId,
      message: data.message || 'Session resumed',
      ...data,
    });
  }

  sendTestCompleted(sessionId: string, data: any) {
    this.sendToSession(sessionId, 'test:completed', {
      sessionId,
      message: data.message || 'Test completed',
      result: data.result,
      timestamp: new Date().toISOString(),
    });
  }

  sendSectionExpired(sessionId: string, data: any) {
    this.sendToSession(sessionId, 'section:expired', {
      sessionId,
      message: data.message || 'Section time expired',
      newSectionIndex: data.newSectionIndex,
      timestamp: new Date().toISOString(),
    });
  }

  hasConnectedClients(sessionId: string): boolean {
    if (!this.server) return false;
    try {
      const room = this.server.sockets.adapter.rooms.get(`session_${sessionId}`);
      return room ? room.size > 0 : false;
    } catch {
      return false;
    }
  }

  getConnectedClientCount(sessionId: string): number {
    if (!this.server) return 0;
    try {
      const room = this.server.sockets.adapter.rooms.get(`session_${sessionId}`);
      return room ? room.size : 0;
    } catch {
      return 0;
    }
  }

  isGatewayOperational(): boolean {
    return !!this.server;
  }
}