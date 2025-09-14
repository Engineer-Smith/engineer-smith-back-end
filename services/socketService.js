// /services/socketService.js - Simplified Event Router for Server-Driven Architecture
const jwt = require('jsonwebtoken');

class SocketService {
    constructor() {
        this.io = null;
        this.testSessionController = null; // Will be injected
        console.log('SocketService initialized - Simple event router');
    }

    // Initialize Socket.IO with server instance
    initialize(server) {
        const { Server } = require('socket.io');

        this.io = new Server(server, {
            cors: {
                origin: process.env.NODE_ENV === 'production'
                    ? 'https://engineersmith.com'
                    : 'http://localhost:5173',
                methods: ['GET', 'POST', 'PATCH', 'DELETE'],
                credentials: true,
            },
        });

        this.setupMiddleware();
        this.setupEventHandlers();

        console.log('Socket.IO service initialized - Simple event routing');
        return this.io;
    }

    // Inject the test session controller
    setTestSessionController(controller) {
        this.testSessionController = controller;
        console.log('Test session controller injected into socket service');
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

    // Simple event handlers - delegate to controller
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected:`, socket.id);
            socket.join(`org_${socket.organizationId}`);

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

    // Handle session join
    async handleSessionJoin(socket, data) {
        try {
            if (!this.testSessionController) {
                throw new Error('Test session controller not available');
            }

            const { sessionId } = data;
            socket.join(`session_${sessionId}`);
            socket.sessionId = sessionId;

            console.log(`User ${socket.userId} joining session ${sessionId}`);

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

    // Handle session rejoin
    async handleSessionRejoin(socket, data) {
        try {
            if (!this.testSessionController) {
                throw new Error('Test session controller not available');
            }

            const { sessionId } = data;
            socket.join(`session_${sessionId}`);
            socket.sessionId = sessionId;

            console.log(`User ${socket.userId} rejoining session ${sessionId}`);

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

    // Handle answer submission
    async handleAnswerSubmit(socket, data) {
        try {
            if (!this.testSessionController) {
                throw new Error('Test session controller not available');
            }

            if (!socket.sessionId) {
                throw new Error('No active session for this socket');
            }

            console.log(`User ${socket.userId} submitting answer for session ${socket.sessionId}`);

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

    // Handle disconnection
    async handleDisconnection(socket, reason) {
        try {
            console.log(`User ${socket.userId} disconnected: ${reason}`);

            if (socket.sessionId && this.testSessionController) {
                // Delegate disconnection handling to controller
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

    // Utility methods for sending messages (called by controller)
    sendToSession(sessionId, event, data) {
        if (!this.io) return;
        this.io.to(`session_${sessionId}`).emit(event, data);
    }

    sendToUser(userId, event, data) {
        if (!this.io) return;
        // Find sockets for this user and send
        this.io.sockets.sockets.forEach(socket => {
            if (socket.userId === userId) {
                socket.emit(event, data);
            }
        });
    }

    sendToOrganization(organizationId, event, data) {
        if (!this.io) return;
        this.io.to(`org_${organizationId}`).emit(event, data);
    }

    // Send timer sync to specific session (called by timer service)
    sendTimerSync(sessionId, timerData) {
        this.sendToSession(sessionId, 'timer:sync', {
            sessionId,
            timeRemaining: timerData.timeRemaining,
            serverTime: Date.now(),
            sectionIndex: timerData.sectionIndex || 0,
            type: timerData.type || 'regular'
        });
    }

    // Send timer warning (called by timer service)
    sendTimerWarning(sessionId, warning) {
        this.sendToSession(sessionId, 'timer:warning', {
            sessionId,
            timeRemaining: warning.timeRemaining,
            message: warning.message,
            type: 'warning'
        });
    }

    // Send session paused notification
    sendSessionPaused(sessionId, data) {
        this.sendToSession(sessionId, 'session:paused', {
            sessionId,
            reason: data.reason || 'disconnection',
            gracePeriodSeconds: data.gracePeriodSeconds || 300,
            message: data.message || 'Session paused due to disconnection'
        });
    }

    // Send session resumed notification
    sendSessionResumed(sessionId, data) {
        this.sendToSession(sessionId, 'session:resumed', {
            sessionId,
            message: data.message || 'Session resumed',
            ...data
        });
    }

    // Send test completion notification
    sendTestCompleted(sessionId, data) {
        this.sendToSession(sessionId, 'test:completed', {
            sessionId,
            message: data.message || 'Test completed',
            result: data.result,
            timestamp: new Date().toISOString()
        });
    }

    // Send section expired notification
    sendSectionExpired(sessionId, data) {
        this.sendToSession(sessionId, 'section:expired', {
            sessionId,
            message: data.message || 'Section time expired',
            newSectionIndex: data.newSectionIndex,
            timestamp: new Date().toISOString()
        });
    }

    // Check if session has connected clients
    hasConnectedClients(sessionId) {
        if (!this.io) return false;
        const room = this.io.sockets.adapter.rooms.get(`session_${sessionId}`);
        return room && room.size > 0;
    }

    // Get connected client count for session
    getConnectedClientCount(sessionId) {
        if (!this.io) return 0;
        const room = this.io.sockets.adapter.rooms.get(`session_${sessionId}`);
        return room ? room.size : 0;
    }

    // Cleanup - much simpler now
    cleanup() {
        console.log('Cleaning up socket service...');
        
        if (this.io) {
            this.io.close();
            console.log('Socket.IO server closed');
        }
    }

    getIO() {
        return this.io;
    }
}

// Export singleton instance
const socketService = new SocketService();
module.exports = socketService;