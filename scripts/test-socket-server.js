// simple-socket-test.js - Minimal server-side socket test
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const TestSession = require('../models/TestSession');
const Test = require('../models/Test');
const socketService = require('../services/socketService');
const { handleSocketDisconnection, handleSocketReconnection } = require('../services/testSession/sessionManager');
require('dotenv').config();

async function testDisconnectionScenarios() {
    console.log('Testing Socket Disconnection Scenarios...\n');
    
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');
        
        // Get real user
        const user = await User.findOne({ loginId: 'student_engineersmith' }).populate('organizationId');
        if (!user) {
            throw new Error('student_engineersmith user not found');
        }
        console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.loginId})`);
        
        // Find a test or create a minimal session
        const test = await Test.findOne().limit(1);
        console.log(`✅ Found ${test ? 'real test' : 'no tests, will use mock'}`);
        
        // Create test session with all required fields
        let sessionId;
        if (test) {
            const session = new TestSession({
                testId: test._id,
                userId: user._id,
                organizationId: user.organizationId._id,
                status: 'inProgress',
                startedAt: new Date(),
                timeLimit: 300, // 5 minutes
                attemptNumber: 1, // Required field
                questionStates: [],
                progress: {
                    questionsAnswered: 0,
                    questionsViewed: 0,
                    totalQuestions: test.questions?.length || 10
                },
                disconnectionTracking: {
                    disconnectionCount: 0,
                    totalOfflineTime: 0,
                    lastDisconnectionReason: null,
                    lastDisconnectedAt: null,
                    lastReconnectedAt: null,
                    navigationGraceUsed: 0,
                    offlineGraceUsed: 0
                },
                // Required testSnapshot fields
                testSnapshot: {
                    originalTestId: test._id,
                    title: test.title || 'Test Session',
                    description: test.description || 'Socket test session',
                    totalPoints: test.totalPoints || 100,
                    totalQuestions: test.questions?.length || 10,
                    randomizationSeed: Math.floor(Math.random() * 10000),
                    settings: {
                        attemptsAllowed: test.settings?.attemptsAllowed || 1,
                        timeLimit: test.settings?.timeLimit || 300,
                        randomizeQuestions: test.settings?.randomizeQuestions || false,
                        showResults: test.settings?.showResults || true,
                        allowReview: test.settings?.allowReview || false
                    },
                    questions: test.questions || [],
                    createdAt: new Date(),
                    snapshotVersion: 1
                }
            });
            
            await session.save();
            sessionId = session._id.toString();
            console.log(`✅ Created test session: ${sessionId}`);
        } else {
            sessionId = 'mock-session-123';
            console.log('⚠️  Using mock session ID');
        }
        
        // Initialize socket service
        const http = require('http');
        const server = http.createServer();
        socketService.initialize(server);
        console.log('✅ Socket service initialized');
        
        // Create mock socket
        const mockSocket = {
            id: 'mock-socket-123',
            userId: user._id.toString(),
            organizationId: user.organizationId._id.toString(),
            role: 'student',
            sessionId: sessionId,
            rooms: new Set(),
            
            join: (room) => {
                console.log(`  📍 Socket joined room: ${room}`);
                return mockSocket;
            },
            
            leave: (room) => {
                console.log(`  📍 Socket left room: ${room}`);
                return mockSocket;
            },
            
            emit: (event, data) => {
                console.log(`  📤 Socket emit: ${event}`, JSON.stringify(data, null, 2));
            },
            
            to: (room) => ({
                emit: (event, data) => {
                    console.log(`  📤 Socket emit to room ${room}: ${event}`, JSON.stringify(data, null, 2));
                }
            }),
            
            request: {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Test Browser) Socket Tester'
                }
            }
        };
        
        console.log('\n=== Testing Socket Handlers ===');
        
        // Test 1: Join session
        console.log('\n1. Testing join session...');
        await socketService.handleJoinSession(mockSocket, { sessionId });
        
        // Test 2: Go offline
        console.log('\n2. Testing client offline...');
        await socketService.handleClientOffline(mockSocket, { sessionId });
        
        // Wait 2 seconds
        console.log('   Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 3: Come back online
        console.log('\n3. Testing client online...');
        await socketService.handleClientOnline(mockSocket, { sessionId });
        
        // Test 4: Leave session (navigation)
        console.log('\n4. Testing leave session (navigation)...');
        await socketService.handleLeaveSession(mockSocket, { sessionId });
        
        // Wait 1 second
        console.log('   Waiting 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 5: Rejoin session
        console.log('\n5. Testing rejoin session...');
        await socketService.handleRejoinSession(mockSocket, { sessionId });
        
        // Test 6: Direct disconnection tracking
        console.log('\n6. Testing direct disconnection tracking...');
        const userAgent = 'Mozilla/5.0 (Test Browser) Socket Tester';
        
        await handleSocketDisconnection(sessionId, 'offline', userAgent);
        console.log('   ✅ Handled offline disconnection');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await handleSocketReconnection(sessionId, userAgent);
        console.log('   ✅ Handled reconnection');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await handleSocketDisconnection(sessionId, 'navigation', userAgent);
        console.log('   ✅ Handled navigation disconnection');
        
        // Check final session state
        if (sessionId !== 'mock-session-123') {
            const finalSession = await TestSession.findById(sessionId);
            console.log('\n=== Final Session State ===');
            console.log('Status:', finalSession?.status);
            console.log('Disconnection count:', finalSession?.disconnectionTracking?.disconnectionCount);
            console.log('Total offline time (ms):', finalSession?.disconnectionTracking?.totalOfflineTime);
            console.log('Last disconnection reason:', finalSession?.disconnectionTracking?.lastDisconnectionReason);
            console.log('Navigation grace used (ms):', finalSession?.disconnectionTracking?.navigationGraceUsed);
            console.log('Offline grace used (ms):', finalSession?.disconnectionTracking?.offlineGraceUsed);
            
            // Check if session is still valid
            const timeRemaining = finalSession?.getRemainingTimeWithGrace ? 
                finalSession.getRemainingTimeWithGrace() : 'Unknown';
            console.log('Time remaining with grace (seconds):', timeRemaining);
        }
        
        console.log('\n✅ All disconnection tests completed successfully!');
        
        // Cleanup
        if (sessionId !== 'mock-session-123') {
            await TestSession.findByIdAndDelete(sessionId);
            console.log('🧹 Cleaned up test session');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        socketService.cleanup();
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    testDisconnectionScenarios().catch(console.error);
}