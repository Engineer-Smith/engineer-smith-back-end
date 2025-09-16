// /controllers/testSessionController.js - Server-Driven Test Session Controller
const createError = require('http-errors');

// Import updated services
const sessionManager = require('../services/testSession/sessionManager');
const questionHandler = require('../services/testSession/questionHandler');
const timerService = require('../services/testSession/timerService');
const gradingService = require('../services/testSession/gradingService');
const adminService = require('../services/testSession/adminService');

class TestSessionController {
  constructor() {
    this.socketService = null; // Will be injected
  }

  // Inject socket service for real-time communication
  setSocketService(socketService) {
    this.socketService = socketService;
  }

  /**
   * REST API ENDPOINTS
   */

  // Check if user has existing session to rejoin
  checkExistingSession = async (req, res, next) => {
    try {
      const { user } = req;
      const result = await sessionManager.checkRejoinSession(user);
      res.json(result);
    } catch (error) {
      console.error('Error checking existing session:', error);
      next(error);
    }
  };

  // Start new test session
  startTestSession = async (req, res, next) => {
    try {
      const { user } = req;
      const { testId, forceNew = false } = req.body;

      let sessionData;

      if (forceNew) {
        // FIXED: Pass the correct parameters - requestData object and user
        sessionData = await sessionManager.createSession({ testId, forceNew: true }, user);
      } else {
        // FIXED: Pass the correct parameters - requestData object and user  
        sessionData = await sessionManager.createSession({ testId, forceNew: false }, user);
      }

      // Get first question
      const questionData = await questionHandler.getCurrentQuestion(sessionData.sessionId);

      // Start timer
      await this.startSessionTimer(sessionData.sessionId, sessionData);

      res.status(201).json({
        success: true,
        session: sessionData,
        question: questionData,
        message: 'Test session started successfully'
      });

    } catch (error) {
      // Handle session conflict specifically
      if (error.status === 409) {
        return res.status(409).json({
          success: false,
          error: error.message,
          code: 'EXISTING_SESSION_FOUND',
          existingSession: error.existingSession
        });
      }

      console.error('Error starting test session:', error);
      next(error);
    }
  };

  // Rejoin existing session
  rejoinTestSession = async (req, res, next) => {
    try {
      const { user } = req;
      const { sessionId } = req.params;

      const sessionData = await sessionManager.rejoinSession(sessionId, user.userId);
      const questionData = await questionHandler.getCurrentQuestion(sessionId);

      // Resume timer
      await this.resumeSessionTimer(sessionId, sessionData);

      res.json({
        success: true,
        session: sessionData,
        question: questionData,
        message: 'Successfully rejoined test session'
      });

    } catch (error) {
      console.error('Error rejoining test session:', error);
      next(error);
    }
  };

  // Get current question (for manual refresh)
  getCurrentQuestion = async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const result = await questionHandler.getCurrentQuestion(sessionId);
      res.json(result);
    } catch (error) {
      console.error('Error getting current question:', error);
      next(error);
    }
  };

  // Submit answer (SERVER-DRIVEN - auto-advancement)
  submitAnswer = async (req, res, next) => {
    try {
      const { user } = req;
      const { sessionId } = req.params;
      const answerData = req.body;

      // Process answer and get next action
      const result = await questionHandler.submitAnswer(sessionId, answerData);

      // Execute the determined action
      const response = await this.handleSubmissionResult(sessionId, result);

      res.json({
        success: true,
        action: result.action,
        ...response
      });

    } catch (error) {
      console.error('Error submitting answer:', error);
      next(error);
    }
  };

  // Submit final test
  // Submit final test
  submitTestSession = async (req, res, next) => {
    try {
      const { user } = req;
      const { sessionId } = req.params;
      const { forceSubmit = false } = req.body;

      // Stop timer
      timerService.clearTimer(sessionId);

      // Submit for grading - THIS IS WHERE THE WAIT NEEDS TO HAPPEN
      const result = await gradingService.submitTestSession(
        sessionId,
        { forceSubmit },
        user
      );

      // ADD THIS: Additional verification that session is actually completed
      const TestSession = require('../models/TestSession');
      const finalSession = await TestSession.findById(sessionId);

      if (finalSession.status !== 'completed') {
        console.error(`Session ${sessionId} not properly completed after grading. Status: ${finalSession.status}`);
        throw new Error('Session was not properly completed');
      }


      // Notify via socket if available
      if (this.socketService) {
        this.socketService.sendTestCompleted(sessionId, {
          message: 'Test completed successfully',
          result
        });
      }

      res.json(result);

    } catch (error) {
      console.error('Test submission failed:', error);
      next(error);
    }
  };

  // Abandon session
  abandonTestSession = async (req, res, next) => {
    try {

      timerService.clearTimer(req.params.sessionId);

      // Abandon session
      const result = await sessionManager.abandonSession(req.params.sessionId, req.user.userId);

      res.json(result);

    } catch (error) {
      console.error('Error in abandonTestSession:', error);
      next(error);
    }
  };

  // Get session time sync
  getSessionTimeSync = async (req, res, next) => {
    try {
      const { user } = req;
      const { sessionId } = req.params;

      const result = await sessionManager.getTimeSync(sessionId, user);
      res.json(result);

    } catch (error) {
      console.error('Error getting session time sync:', error);
      next(error);
    }
  };

  /**
   * SOCKET EVENT HANDLERS
   */

  // Handle socket connection to session
  handleSocketJoin = async (sessionId, userId, socketId) => {
    try {

      // Get session status first
      const sessionStatus = await sessionManager.getSessionStatus(sessionId);

      // If session is paused, handle reconnection during grace period
      if (sessionStatus.status === 'paused') {
        await this.resumeSessionAfterReconnection(sessionId);
      } else {
        // Mark session as connected for active sessions
        await sessionManager.markSessionConnected(sessionId);
      }

      // Get current question data
      const questionData = await questionHandler.getCurrentQuestion(sessionId);

      return {
        success: true,
        data: {
          sessionStatus: sessionStatus.status,
          currentQuestion: questionData.questionState,
          timeRemaining: sessionStatus.timeRemaining,
          sectionInfo: questionData.navigationContext.currentSection
        }
      };

    } catch (error) {
      console.error('Error handling socket join:', error);
      return {
        success: false,
        message: 'Failed to join session',
        error: error.message
      };
    }
  };

  // Handle socket rejoin
  handleSocketRejoin = async (sessionId, userId, socketId) => {
    try {

      // Same as join for now
      return await this.handleSocketJoin(sessionId, userId, socketId);

    } catch (error) {
      console.error('Error handling socket rejoin:', error);
      return {
        success: false,
        message: 'Failed to rejoin session',
        error: error.message
      };
    }
  };

  // Handle answer submission via socket
  handleAnswerSubmit = async (sessionId, userId, answerData) => {
    try {

      // Process answer
      const result = await questionHandler.submitAnswer(sessionId, answerData);

      // Handle the result
      const response = await this.handleSubmissionResult(sessionId, result);

      return {
        success: true,
        action: result.action,
        data: response
      };

    } catch (error) {
      console.error('Error handling answer submit:', error);
      return {
        success: false,
        message: 'Failed to process answer',
        error: error.message
      };
    }
  };

  // CORRECTED: Handle socket disconnection with proper grace period
  handleSocketDisconnection = async (sessionId, userId, reason) => {
    try {

      // Get session and check if it's already completed
      const session = await sessionManager.getSessionInternal(sessionId);

      // DON'T PAUSE COMPLETED SESSIONS - This is the key fix
      if (['completed', 'abandoned', 'expired'].includes(session.status)) {
        return;
      }

      // Only proceed with pause logic for sessions that are actually in progress
      if (session.status === 'inProgress' && session.currentSectionStartedAt) {
        // Calculate time used in current section
        const timeUsedMs = Date.now() - session.currentSectionStartedAt.getTime();
        const timeUsedSeconds = Math.floor(timeUsedMs / 1000);

        // Initialize sectionTimeUsed array if needed
        if (!session.sectionTimeUsed) {
          session.sectionTimeUsed = new Array(session.testSnapshot.sections?.length || 1).fill(0);
        }

        // Store accumulated time for current section
        session.sectionTimeUsed[session.currentSectionIndex] =
          (session.sectionTimeUsed[session.currentSectionIndex] || 0) + timeUsedSeconds;


        // Mark session as paused and disconnected
        session.status = 'paused';
        session.isConnected = false;
        session.disconnectedAt = new Date();
        await session.save();

        // Pause the test timer completely
        timerService.pauseTimer(sessionId);

        // Start 5-minute grace period timer
        timerService.startGracePeriod(
          sessionId,
          this.handleGracePeriodExpired,
          5 * 60 * 1000 // 5 minutes
        );

        // Notify via socket
        if (this.socketService) {
          this.socketService.sendSessionPaused(sessionId, {
            reason: 'disconnection',
            gracePeriodSeconds: 300,
            message: 'Test paused due to disconnection. You have 5 minutes to reconnect before timer resumes.'
          });
        }

      } else {
        console.log(`[CONTROLLER] Session ${sessionId} status is ${session.status}, no pause action needed`);
      }

    } catch (error) {
      console.error('Error handling socket disconnection:', error);
    }
  };

  /**
   * TIMER MANAGEMENT
   */

  // Start timer for new session  
  startSessionTimer = async (sessionId, sessionData) => {
    try {
      let timeLimit;

      if (sessionData.useSections && sessionData.sectionInfo) {
        timeLimit = sessionData.sectionInfo.timeLimit;
      } else {
        timeLimit = sessionData.timeLimit;
      }

      // FIXED: Handle undefined timeLimit
      if (!timeLimit || timeLimit === undefined || isNaN(timeLimit)) {
        console.warn(`Invalid time limit for session ${sessionId}: ${timeLimit}, using default 20 minutes`);
        timeLimit = 20; // Default 20 minutes
      }

      const timeLimitMs = timeLimit * 60 * 1000;

      timerService.startSectionTimer(
        sessionId,
        timeLimitMs,
        sessionData.sectionInfo?.currentSectionIndex || 0,
        this.handleTimerExpiration,
        this.handleTimerSync
      );

    } catch (error) {
      console.error('Error starting session timer:', error);
    }
  };

  // Resume timer for rejoined session
  resumeSessionTimer = async (sessionId, sessionData) => {
    try {
      const sessionStatus = await sessionManager.getSessionStatus(sessionId);
      const timeRemainingMs = sessionStatus.timeRemaining * 1000;

      if (timeRemainingMs > 0) {
        timerService.startSectionTimer(
          sessionId,
          timeRemainingMs,
          sessionStatus.currentSectionIndex,
          this.handleTimerExpiration,
          this.handleTimerSync
        );

      } else {
        // Timer already expired
        await this.handleTimerExpiration(sessionId);
      }

    } catch (error) {
      console.error('Error resuming session timer:', error);
    }
  };

  // CORRECTED: Resume after reconnection during grace period
  resumeSessionAfterReconnection = async (sessionId) => {
    try {
      const session = await sessionManager.getSessionInternal(sessionId);

      // Check if grace period hasn't expired yet
      if (session.status === 'paused' && !session.gracePeriodExpired) {

        // Clear grace period timer since student reconnected
        timerService.clearGracePeriod(sessionId);

        // Resume from paused state
        session.status = 'inProgress';
        session.isConnected = true;
        session.disconnectedAt = null;

        // Reset section timer for continued timing
        if (session.testSnapshot.settings.useSections) {
          session.currentSectionStartedAt = new Date();
        }

        await session.save();

        // Resume test timer from where it was paused
        const success = timerService.resumeTimer(
          sessionId,
          this.handleTimerExpiration,
          this.handleTimerSync
        );

        if (success && this.socketService) {
          this.socketService.sendSessionResumed(sessionId, {
            message: 'Welcome back! Test timer resumed from where you left off.'
          });
        }

      } else {
        // Grace period already expired, just mark as connected
        session.isConnected = true;
        await session.save();

        if (this.socketService) {
          this.socketService.sendSessionResumed(sessionId, {
            message: 'Reconnected. Note: Grace period expired, so timer continued while you were away.'
          });
        }

      }

    } catch (error) {
      console.error('Error resuming session after reconnection:', error);
    }
  };

  /**
   * TIMER CALLBACKS
   */

  // Handle timer expiration
  handleTimerExpiration = async (sessionId) => {
    try {

      const sessionStatus = await sessionManager.getSessionStatus(sessionId);

      if (sessionStatus.useSections) {
        // Section expired
        if (sessionStatus.isLastSection) {
          // Last section expired - complete test
          await this.completeExpiredTest(sessionId);
        } else {
          // Move to next section
          await this.advanceToNextSection(sessionId);
        }
      } else {
        // Overall test expired
        await this.completeExpiredTest(sessionId);
      }

    } catch (error) {
      console.error('Error handling timer expiration:', error);
    }
  };

  // Handle periodic timer sync
  handleTimerSync = async (sessionId, timeRemaining, type, message) => {
    try {
      if (!this.socketService) return;

      if (type === 'warning') {
        this.socketService.sendTimerWarning(sessionId, {
          timeRemaining,
          message
        });
      } else {
        this.socketService.sendTimerSync(sessionId, {
          timeRemaining,
          sectionIndex: 0, // Will be updated with actual section info
          type: 'regular'
        });
      }

    } catch (error) {
      console.error('Error handling timer sync:', error);
    }
  };

  // CORRECTED: Grace period expiration should resume timer regardless of connection
  handleGracePeriodExpired = async (sessionId) => {
    try {

      const session = await sessionManager.getSessionInternal(sessionId);

      // Resume the session (even if student still offline)
      session.status = 'inProgress'; // Resume test progression
      session.gracePeriodExpired = true; // Mark that grace period ended
      // Keep isConnected as false if student is still offline

      // Reset section timer for continued timing
      if (session.testSnapshot.settings.useSections) {
        session.currentSectionStartedAt = new Date();
      }

      await session.save();

      // Resume the test timer (this will continue counting down even if offline)
      const success = timerService.resumeTimer(
        sessionId,
        this.handleTimerExpiration,
        this.handleTimerSync
      );

      if (success) {

        // Notify if student reconnects later
        if (this.socketService) {
          this.socketService.sendToSession(sessionId, 'grace_period_expired', {
            message: 'Grace period expired. Test timer has resumed.',
            timestamp: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      console.error('Error handling grace period expiration:', error);
    }
  };

  /**
   * HELPER METHODS
   */

  // FIXED: Handle submission result and determine next action
  handleSubmissionResult = async (sessionId, result) => {
    // The result.action contains the determined action type
    // But the execution results have different type values
    const actionType = result.action || result.type;

    switch (actionType) {
      case 'advance_to_next_question':  // From questionHandler.determineNextAction
      case 'next_question':             // From questionHandler.advanceToNextQuestion
        return {
          type: 'next_question',
          questionState: result.questionState,        // ✅ Correct property name
          navigationContext: result.navigationContext, // ✅ Correct property name
          message: result.message
        };

      case 'advance_to_next_section':   // From questionHandler.determineNextAction  
      case 'section_transition':        // From questionHandler.advanceToNextSection
        // Start timer for new section
        if (result.newSection) {
          await this.startTimerForNewSection(sessionId, result.newSection);
        }

        return {
          type: 'section_transition',
          newSection: result.newSection,
          questionState: result.questionState,        // ✅ Correct property name
          navigationContext: result.navigationContext, // ✅ Correct property name
          message: result.message
        };

      case 'complete_test':             // From questionHandler.determineNextAction
      case 'test_completed_confirmation': // From questionHandler.prepareTestCompletion
        // Stop timers - test is already submitted
        timerService.clearTimer(sessionId);

        // Notify via socket
        if (this.socketService) {
          this.socketService.sendTestCompleted(sessionId, {
            message: 'Test completed and automatically submitted!',
            result: result.submissionResult,
            showConfirmation: true
          });
        }

        return {
          type: 'test_completed_confirmation',
          message: result.message,
          submissionResult: result.submissionResult,
          finalScore: result.finalScore,
          completedAt: result.completedAt,
          showConfirmation: result.showConfirmation,
          confirmationData: result.confirmationData
        };

      case 'test_completed_with_error':
        // Stop timers
        timerService.clearTimer(sessionId);

        // Notify via socket
        if (this.socketService) {
          this.socketService.sendToSession(sessionId, 'test:completed_with_error', {
            message: result.message,
            error: result.error,
            requiresManualSubmission: result.requiresManualSubmission
          });
        }

        return {
          type: 'test_completed_with_error',
          message: result.message,
          error: result.error,
          sessionId: result.sessionId,
          showConfirmation: result.showConfirmation,
          requiresManualSubmission: result.requiresManualSubmission
        };

      case 'start_review_phase':        // From questionHandler.determineNextAction
      case 'review_phase_started':      // From questionHandler.startReviewPhase  
        return {
          type: 'review_phase_started',
          questionState: result.questionState,        // ✅ Correct property name
          navigationContext: result.navigationContext, // ✅ Correct property name
          message: result.message
        };

      case 'advance_in_review':         // From questionHandler.determineNextAction
      case 'next_review_question':      // From questionHandler.advanceInReview
        return {
          type: 'next_review_question',
          questionState: result.questionState,        // ✅ Correct property name
          navigationContext: result.navigationContext, // ✅ Correct property name
          message: result.message
        };

      default:
        console.error(`Unknown submission action: ${actionType}`, {
          resultAction: result.action,
          resultType: result.type,
          fullResult: result
        });
        throw new Error(`Unknown submission action: ${actionType}`);
    }
  };

  // Start timer for new section
  startTimerForNewSection = async (sessionId, sectionInfo) => {
    try {
      const timeLimitMs = sectionInfo.timeLimit * 60 * 1000;

      timerService.startSectionTimer(
        sessionId,
        timeLimitMs,
        sectionInfo.index,
        this.handleTimerExpiration,
        this.handleTimerSync
      );

    } catch (error) {
      console.error('Error starting timer for new section:', error);
    }
  };

  // Advance to next section (timer expired)
  advanceToNextSection = async (sessionId) => {
    try {
      const session = await sessionManager.getSessionInternal(sessionId);
      const result = session.completeCurrentSection();
      await session.save();

      if (result.hasMoreSections) {
        // Get first question of new section
        const questionData = await questionHandler.getCurrentQuestion(sessionId);

        // Start timer for new section
        const newSection = session.testSnapshot.sections[session.currentSectionIndex];
        await this.startTimerForNewSection(sessionId, {
          index: session.currentSectionIndex,
          timeLimit: newSection.timeLimit,
          name: newSection.name
        });

        // Notify via socket
        if (this.socketService) {
          this.socketService.sendSectionExpired(sessionId, {
            message: `Section time expired. Moving to ${newSection.name}.`,
            newSectionIndex: session.currentSectionIndex
          });
        }

      } else {
        // No more sections - complete test
        await this.completeExpiredTest(sessionId);
      }

    } catch (error) {
      console.error('Error advancing to next section:', error);
    }
  };

  // Complete test (normal submission)
  completeTest = async (sessionId) => {
    try {
      // Stop timer
      timerService.clearTimer(sessionId);

      const session = await sessionManager.getSessionInternal(sessionId);
      const result = await gradingService.submitTestSession(
        sessionId,
        { forceSubmit: true },
        { userId: session.userId }
      );

      // Notify via socket
      if (this.socketService) {
        this.socketService.sendTestCompleted(sessionId, {
          message: 'Test completed successfully!',
          result
        });
      }

      return result;

    } catch (error) {
      console.error('Error completing test:', error);
      throw error;
    }
  };

  // Complete expired test
  completeExpiredTest = async (sessionId) => {
    try {
      await this.completeTest(sessionId);

      // Additional notification for expiration
      if (this.socketService) {
        this.socketService.sendToSession(sessionId, 'test:expired', {
          message: 'Test time expired. Your test has been automatically submitted.',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error completing expired test:', error);
    }
  };

  // Get timer sync data
  getTimerSync = async (sessionId) => {
    try {
      const timeRemaining = timerService.getTimeRemaining(sessionId);
      const sessionStatus = await sessionManager.getSessionStatus(sessionId);

      return {
        timeRemaining,
        serverTime: Date.now(),
        sessionStatus: sessionStatus.status,
        sectionIndex: sessionStatus.currentSectionIndex
      };

    } catch (error) {
      console.error('Error getting timer sync:', error);
      return {
        timeRemaining: 0,
        serverTime: Date.now(),
        sessionStatus: 'unknown'
      };
    }
  };

  /**
   * ADMIN ENDPOINTS (delegate to adminService)
   */

  // Get session overview
  getSessionOverview = async (req, res, next) => {
    try {
      const { user } = req;
      const { sessionId } = req.params;

      const result = await adminService.getSessionOverview(sessionId, user);
      res.json(result);

    } catch (error) {
      console.error('Error getting session overview:', error);
      next(error);
    }
  };

  // Get session analytics
  getSessionAnalytics = async (req, res, next) => {
    try {
      const { user } = req;
      const { sessionId } = req.params;

      if (user.role === 'student') {
        throw createError(403, 'Only instructors and admins can access session analytics');
      }

      const result = await adminService.getSessionAnalytics(sessionId, user);
      res.json(result);

    } catch (error) {
      console.error('Error getting session analytics:', error);
      next(error);
    }
  };

  // Get class analytics
  getClassAnalytics = async (req, res, next) => {
    try {
      const { user } = req;
      const { testId, orgId, userId, status, limit = 100 } = req.query;

      if (user.role === 'student') {
        throw createError(403, 'Only instructors and admins can access class analytics');
      }

      const result = await adminService.getClassAnalytics({
        testId, orgId, userId, status, limit
      }, user);

      res.json(result);

    } catch (error) {
      console.error('Error getting class analytics:', error);
      next(error);
    }
  };

  // Get test analytics
  getTestAnalytics = async (req, res, next) => {
    try {
      const { user } = req;
      const { testId } = req.params;

      if (user.role === 'student') {
        throw createError(403, 'Only instructors and admins can access test analytics');
      }

      const result = await adminService.getTestAnalytics(testId, user);
      res.json(result);

    } catch (error) {
      console.error('Error getting test analytics:', error);
      next(error);
    }
  };

  // Get all test sessions
  getAllTestSessions = async (req, res, next) => {
    try {
      const { user } = req;
      const { userId, testId, orgId, status, limit = 10, skip = 0 } = req.query;

      const sessions = await sessionManager.listSessions({
        userId, testId, orgId, status, limit, skip
      }, user);

      res.json(sessions);
    } catch (error) {
      console.error('Error getting test sessions:', error);
      next(error);
    }
  };

  // Get specific test session
  getTestSession = async (req, res, next) => {
    try {
      const { user } = req;
      const { sessionId } = req.params;

      const result = await sessionManager.getSessionForAdmin(sessionId, user);
      res.json(result);
    } catch (error) {
      console.error('Error getting test session:', error);
      next(error);
    }
  };
}

// Export singleton instance
const testSessionController = new TestSessionController();
module.exports = testSessionController;