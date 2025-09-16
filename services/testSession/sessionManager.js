// /services/testSession/sessionManager.js - Updated for Server-Driven Architecture
const TestSession = require('../../models/TestSession');
const createError = require('http-errors');
const { createTestSnapshot, validateTestAccess, getPopulatedTest } = require('./snapshotService');

/**
 * INTERNAL METHODS (No authentication - for server use only)
 */

// Get session by ID without authentication (internal use)
const getSessionInternal = async (sessionId) => {
  const session = await TestSession.findById(sessionId);
  if (!session) {
    throw createError(404, 'Test session not found');
  }
  return session;
};

// Update session connection state
const markSessionConnected = async (sessionId) => {
  const session = await getSessionInternal(sessionId);
  session.markConnected();
  await session.save();
  return session;
};

// Mark session as disconnected (start grace period)
const markSessionDisconnected = async (sessionId) => {
  const session = await getSessionInternal(sessionId);
  session.markDisconnected();
  await session.save();
  return session;
};

// Update connection state with optional grace timer ID
const updateConnectionState = async (sessionId, isConnected, graceTimerId = null) => {
  const session = await getSessionInternal(sessionId);

  if (isConnected) {
    session.markConnected();
  } else {
    session.markDisconnected();
    if (graceTimerId) {
      session.graceTimerId = graceTimerId;
    }
  }

  await session.save();
  return session;
};

// Get session status for server operations
const getSessionStatus = async (sessionId) => {
  const session = await getSessionInternal(sessionId);

  const status = {
    sessionId: session._id,
    status: session.status,
    isConnected: session.isConnected,
    currentSectionIndex: session.currentSectionIndex,
    currentQuestionIndex: session.currentQuestionIndex,
    timeRemaining: session.calculateTimeRemaining(),
    useSections: session.testSnapshot.settings.useSections,
    isLastQuestion: session.isLastQuestionInSection(),
    isLastSection: session.isLastSection()
  };

  return status;
};

/**
 * PUBLIC API METHODS (With authentication - for controller/route use)
 */

// Check if user can rejoin an existing session
const checkRejoinSession = async (user) => {
  // First, let's see ALL sessions for this user regardless of status
  const allUserSessions = await TestSession.find({
    userId: user.userId
  }).sort({ startedAt: -1 }).limit(5);

  const existingSession = await TestSession.findOne({
    userId: user.userId,
    status: { $in: ['inProgress', 'paused'] }
  });

  if (!existingSession) {
    return {
      success: true,
      canRejoin: false,
      message: 'No active session found'
    };
  }

  // Check if session is actually completed despite paused status
  if (existingSession.completedAt) {
    return {
      success: true,
      canRejoin: false,
      message: 'Previous session was completed'
    };
  }

  const timeRemaining = existingSession.calculateTimeRemaining();

  // Check the status again after calculation
  const sessionAfterCalc = await TestSession.findById(existingSession._id);

  if (timeRemaining <= 0) {
    // Session expired - auto-submit it
    try {
      const { submitTestSession } = require('./gradingService');
      const submitResult = await submitTestSession(existingSession._id, { forceSubmit: true }, user);

      return {
        success: true,
        canRejoin: false,
        message: 'Previous session expired and was auto-submitted'
      };
    } catch (error) {
      console.error(`Error auto-submitting expired session ${existingSession._id}:`, error);
      // Mark as abandoned instead
      existingSession.status = 'abandoned';
      existingSession.completedAt = new Date();
      await existingSession.save();

      return {
        success: true,
        canRejoin: false,
        message: 'Previous session expired and was marked as abandoned'
      };
    }
  }

  // Session is still active and can be rejoined
  return {
    success: true,
    canRejoin: true,
    sessionId: existingSession._id,
    timeRemaining,
    testInfo: {
      title: existingSession.testSnapshot.title,
      description: existingSession.testSnapshot.description,
      totalQuestions: existingSession.testSnapshot.totalQuestions,
      totalPoints: existingSession.testSnapshot.totalPoints,
      useSections: existingSession.testSnapshot.settings.useSections,
      currentQuestionIndex: existingSession.currentQuestionIndex,
      answeredQuestions: existingSession.answeredQuestions?.length || 0,
      completedSections: existingSession.completedSections?.length || 0
    },
    message: 'Active session found - you can rejoin or abandon it'
  };
};

// Create new session (simplified for server-driven approach)
const createSession = async (requestData, user) => {
  const { testId, forceNew = false } = requestData;

  if (!testId) {
    throw createError(400, 'Test ID is required');
  }

  // Check for existing session first (unless forcing new)
  if (!forceNew) {
    const existingCheck = await checkRejoinSession(user);

    if (existingCheck.canRejoin) {
      // Return conflict error with session details
      const conflictError = createError(409, 'You have an active test session. Please rejoin or abandon it first.');
      conflictError.existingSession = {
        sessionId: existingCheck.sessionId,
        testTitle: existingCheck.testInfo.title,
        timeRemaining: existingCheck.timeRemaining,
        questionProgress: `${existingCheck.testInfo.answeredQuestions}/${existingCheck.testInfo.totalQuestions}`,
        sectionProgress: existingCheck.testInfo.useSections
          ? `${existingCheck.testInfo.completedSections}/${existingCheck.testInfo.totalQuestions}`
          : null
      };
      throw conflictError;
    }
  }

  // If forceNew is true, handle existing session
  if (forceNew) {
    const existingSession = await TestSession.findOne({
      userId: user.userId,
      status: { $in: ['inProgress', 'paused'] }
    });

    if (existingSession) {
      try {
        const { submitTestSession } = require('./gradingService');
        const submitResult = await submitTestSession(existingSession._id, { forceSubmit: true }, user);
      } catch (error) {
        console.error(`Error force-submitting existing session ${existingSession._id}:`, error);
        // Mark as abandoned if submission fails
        existingSession.status = 'abandoned';
        existingSession.completedAt = new Date();
        await existingSession.save();
      }
    }
  }

  // Get populated test with all question data
  const test = await getPopulatedTest(testId);
  if (!test) {
    throw createError(404, 'Test not found');
  }

  // Validate user can start this test
  try {
    validateTestAccess(test, user);
  } catch (error) {
    throw createError(403, error.message);
  }

  // Check attempt limit using Test model methods that include overrides
  const canAttempt = await test.canStudentAttempt(user.userId);
  const remainingAttempts = await test.getRemainingAttempts(user.userId);
  const totalAllowed = await test.getAllowedAttemptsForStudent(user.userId);

  if (!canAttempt) {
    throw createError(403, 'Maximum attempts reached');
  }

  // Get the previous attempts count for attempt number calculation
  const previousAttempts = await TestSession.countDocuments({
    $or: [
      { 'testSnapshot.originalTestId': testId },
      { testId: testId }
    ],
    userId: user.userId,
    status: { $in: ['completed', 'abandoned'] }
  });

  // Create test snapshot with randomization
  const testSnapshot = await createTestSnapshot(test, user.userId);

  // Create session with minimal fields
  const sessionData = {
    testId: test._id,
    userId: user.userId,
    organizationId: test.organizationId || user.organizationId,
    attemptNumber: previousAttempts + 1,
    status: 'inProgress',
    startedAt: new Date(),
    testSnapshot,
    currentSectionIndex: 0,
    currentSectionStartedAt: test.settings.useSections ? new Date() : null,
    completedSections: [],
    currentQuestionIndex: 0,
    answeredQuestions: []
  };

  const session = new TestSession(sessionData);
  await session.save();

  // Return session info for client
  const response = {
    success: true,
    sessionId: session._id,
    isResuming: false,
    testInfo: {
      title: testSnapshot.title,
      description: testSnapshot.description,
      totalQuestions: testSnapshot.totalQuestions,
      totalPoints: testSnapshot.totalPoints,
      timeLimit: testSnapshot.settings.timeLimit,
      useSections: testSnapshot.settings.useSections,
      sectionCount: testSnapshot.sections?.length || 0
    },
    navigation: {
      currentQuestionIndex: 0,
      currentSectionIndex: 0,
      canNavigateForward: testSnapshot.totalQuestions > 1,
      canNavigateBackward: false
    },
    startedAt: session.startedAt,
    attemptNumber: session.attemptNumber,
    timeRemaining: session.calculateTimeRemaining(),
    sectionInfo: testSnapshot.settings.useSections ? {
      currentSectionIndex: 0,
      currentSectionTimeRemaining: session.calculateTimeRemaining(),
      sectionsCompleted: 0,
      totalSections: testSnapshot.sections.length,
      currentSectionName: testSnapshot.sections[0].name
    } : null
  };

  return response;
};

// Force create new session (abandon existing if present)
const forceCreateSession = async (testId, userId, organizationId) => {
  // Find and handle existing session
  const existingSession = await TestSession.findOne({
    userId: userId,
    status: 'inProgress'
  });

  if (existingSession) {
    try {
      const { submitTestSession } = require('./gradingService');
      const result = await submitTestSession(existingSession._id, { forceSubmit: true }, { userId });
    } catch (error) {
      console.error(`Error force-submitting existing session ${existingSession._id}:`, error);
      // Mark as abandoned if submission fails
      existingSession.status = 'abandoned';
      existingSession.completedAt = new Date();
      await existingSession.save();
    }
  }

  // Create new session using the updated createSession method
  const user = { userId, organizationId };
  const requestData = { testId, forceNew: false };

  return await createSession(requestData, user);
};

// Rejoin existing session (simplified for server-driven approach)
const rejoinSession = async (sessionId, userId) => {
  const session = await TestSession.findById(sessionId);

  if (!session) {
    throw createError(404, 'Test session not found');
  }

  // Validate access
  if (session.userId.toString() !== userId.toString()) {
    throw createError(403, 'Unauthorized to rejoin this test session');
  }

  if (!['inProgress', 'paused'].includes(session.status)) {
    throw createError(400, `Cannot rejoin session with status: ${session.status}`);
  }

  const timeRemaining = session.calculateTimeRemaining();

  if (timeRemaining <= 0) {
    throw createError(400, 'Session has expired and cannot be rejoined');
  }

  if (session.status === 'paused') {
    session.status = 'inProgress';
  }

  // Update connection state
  session.markConnected();
  session.updateServerState('session_rejoined');
  await session.save();

  // Return minimal data for controller
  return {
    success: true,
    sessionId: session._id,
    isResuming: true,
    timeRemaining: timeRemaining,
    useSections: session.testSnapshot.settings.useSections,
    sectionInfo: session.testSnapshot.settings.useSections ? {
      currentSectionIndex: session.currentSectionIndex,
      timeRemaining: timeRemaining,
      name: session.testSnapshot.sections[session.currentSectionIndex]?.name
    } : null
  };
};

// Abandon a test session
const abandonSession = async (sessionId, userId) => {
  const session = await TestSession.findById(sessionId);
  if (!session) {
    throw createError(404, 'Test session not found');
  }

  // Validate access
  if (session.userId.toString() !== userId.toString()) {
    throw createError(403, 'Unauthorized to abandon this test session');
  }

  if (session.status !== 'inProgress' && session.status !== 'paused') {
    throw createError(400, 'Test session is not in progress');
  }

  // Update session status
  session.status = 'abandoned';
  session.completedAt = new Date();
  session.updateServerState('session_abandoned');
  await session.save();

  // Create Result document for abandoned session with COMPLETE score object
  const Result = require('../../models/Result');
  const result = new Result({
    sessionId: session._id,
    testId: session.testSnapshot.originalTestId,
    userId: session.userId,
    organizationId: session.organizationId,
    attemptNumber: session.attemptNumber,
    status: session.status,
    completedAt: session.completedAt,
    timeSpent: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    questions: [], // Empty for abandoned session
    score: {
      totalPoints: session.testSnapshot.totalPoints || 0,
      earnedPoints: 0,
      percentage: 0,
      passed: false,
      passingThreshold: 70,
      totalQuestions: session.testSnapshot.totalQuestions || 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unansweredQuestions: session.testSnapshot.totalQuestions || 0
    }
  });

  await result.save();

  return {
    success: true,
    message: 'Test session abandoned',
    sessionId: session._id
  };
};

// Get session with validation (for API use)
const getSession = async (sessionId, user) => {
  const session = await getSessionInternal(sessionId);

  // Validate access
  if (session.userId.toString() !== user.userId.toString()) {
    throw createError(403, 'Unauthorized to access this test session');
  }

  return session;
};

// Get session for admin/instructor view
const getSessionForAdmin = async (sessionId, user) => {
  const session = await getSessionInternal(sessionId);

  // Validate admin access
  const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

  if (!isSuperOrgAdminOrInstructor && session.userId.toString() !== user.userId.toString()) {
    if (session.organizationId && session.organizationId.toString() !== user.organizationId.toString()) {
      throw createError(403, 'Unauthorized to access this test session');
    }
    if (user.role !== 'admin') {
      throw createError(403, 'Only admins or instructors can access other users sessions');
    }
  }

  // Return limited data for students viewing their own sessions
  if (user.role === 'student' && session.userId.toString() === user.userId.toString()) {
    return {
      success: true,
      sessionId: session._id,
      testTitle: session.testSnapshot.title,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      attemptNumber: session.attemptNumber,
      finalScore: session.finalScore
    };
  }

  // Return full data for instructors/admins
  return {
    success: true,
    session: {
      id: session._id,
      testId: session.testSnapshot.originalTestId,
      testTitle: session.testSnapshot.title,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      testSnapshot: session.testSnapshot,
      currentSectionIndex: session.currentSectionIndex,
      completedSections: session.completedSections,
      currentQuestionIndex: session.currentQuestionIndex,
      answeredQuestions: session.answeredQuestions,
      finalScore: session.finalScore,
      isConnected: session.isConnected,
      sessionPhase: session.sessionPhase,
      lastServerAction: session.lastServerAction
    }
  };
};

// List sessions with filtering
const listSessions = async (filters, user) => {
  const { userId, testId, orgId, status, limit = 10, skip = 0 } = filters;

  // Build query based on user permissions
  const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
  let query = {};

  if (isSuperOrgAdminOrInstructor) {
    if (userId) query.userId = userId;
    if (testId) query['testSnapshot.originalTestId'] = testId;
    if (orgId) query.organizationId = orgId;
    if (status) query.status = status;
  } else if (user.role === 'admin') {
    if (orgId && orgId !== user.organizationId.toString()) {
      throw createError(403, 'Unauthorized to access sessions for this organization');
    }
    query.organizationId = user.organizationId;
    if (userId) query.userId = userId;
    if (testId) query['testSnapshot.originalTestId'] = testId;
    if (status) query.status = status;
  } else {
    // Students can only see their own sessions
    query.userId = user.userId;
    if (testId) query['testSnapshot.originalTestId'] = testId;
    if (status) query.status = status;
  }

  const sessions = await TestSession.find(query)
    .populate({
      path: 'userId',
      select: 'loginId firstName lastName email',
      model: 'User'
    })
    .populate({
      path: 'organizationId',
      select: 'name',
      model: 'Organization'
    })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .select('testSnapshot userId organizationId attemptNumber status startedAt completedAt finalScore isConnected lastConnectedAt currentQuestionIndex answeredQuestions completedSections currentSectionIndex')
    .sort({ startedAt: -1 });

  return sessions.map(session => {
    // Handle both populated and non-populated cases
    let userName, userEmail, userIdValue, organizationName, organizationIdValue;

    if (typeof session.userId === 'object' && session.userId !== null) {
      // User is populated
      userIdValue = session.userId._id;
      userName = session.userId.fullName ||
        `${session.userId.firstName || ''} ${session.userId.lastName || ''}`.trim() ||
        session.userId.loginId ||
        `User ${session.userId._id?.toString().slice(-6) || 'Unknown'}`;
      userEmail = session.userId.email || `${session.userId.loginId || 'unknown'}@example.com`;
    } else {
      // User is not populated, just an ID
      userIdValue = session.userId;
      userName = `User ${session.userId?.toString().slice(-6) || 'Unknown'}`;
      userEmail = `user-${session.userId?.toString().slice(-6) || 'unknown'}@example.com`;
    }

    if (typeof session.organizationId === 'object' && session.organizationId !== null) {
      // Organization is populated
      organizationIdValue = session.organizationId._id;
      organizationName = session.organizationId.name || 'Unknown Organization';
    } else {
      // Organization is not populated, just an ID
      organizationIdValue = session.organizationId;
      organizationName = session.organizationId ? `Org ${session.organizationId.toString().slice(-6)}` : 'Independent';
    }

    return {
      _id: session._id,
      testId: session.testSnapshot.originalTestId,
      testTitle: session.testSnapshot.title,
      userId: userIdValue,
      userName,
      userEmail,
      organizationId: organizationIdValue,
      organizationName,
      attemptNumber: session.attemptNumber,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      finalScore: session.finalScore,
      isConnected: session.isConnected,
      lastConnectedAt: session.lastConnectedAt,
      currentQuestionIndex: session.currentQuestionIndex,
      answeredQuestions: session.answeredQuestions,
      completedSections: session.completedSections,
      currentSectionIndex: session.currentSectionIndex,
      testSnapshot: session.testSnapshot
    };
  });
};

// Get time sync data (for manual sync endpoint)
const getTimeSync = async (sessionId, user) => {
  if (!sessionId || sessionId === 'undefined' || typeof sessionId !== 'string') {
    throw createError(400, 'Valid session ID is required');
  }

  if (sessionId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(sessionId)) {
    throw createError(400, 'Invalid session ID format');
  }

  const session = await getSession(sessionId, user);

  const serverTime = Date.now();
  const startTime = new Date(session.startedAt).getTime();
  const elapsedSeconds = Math.floor((serverTime - startTime) / 1000);
  const timeRemainingSeconds = session.calculateTimeRemaining();

  const response = {
    success: true,
    serverTime,
    startTime,
    elapsedSeconds,
    timeRemainingSeconds,
    timeLimitMinutes: session.testSnapshot.settings.timeLimit,
    sessionStatus: session.status,
    isConnected: session.isConnected
  };

  // Add section timing info for sectioned tests
  if (session.testSnapshot.settings.useSections) {
    response.sectionInfo = {
      currentSectionIndex: session.currentSectionIndex,
      sectionTimeRemaining: timeRemainingSeconds,
      currentSectionName: session.testSnapshot.sections[session.currentSectionIndex]?.name,
      sectionsCompleted: session.completedSections.length,
      totalSections: session.testSnapshot.sections.length
    };
  }

  return response;
};

// Check for expired sessions (background task)
const checkAndHandleExpiredSessions = async () => {
  try {
    const inProgressSessions = await TestSession.find({
      status: { $in: ['inProgress', 'paused'] }
    });

    let expiredCount = 0;

    for (const session of inProgressSessions) {
      const timeRemaining = session.calculateTimeRemaining();

      if (timeRemaining <= 0) {
        try {
          const { submitTestSession } = require('./gradingService');
          const result = await submitTestSession(session._id, { forceSubmit: true }, { userId: session.userId });
          expiredCount++;
        } catch (error) {
          console.error(`Error auto-submitting expired session ${session._id}:`, error);

          // Mark as abandoned if submission fails
          session.status = 'abandoned';
          session.completedAt = new Date();
          await session.save();
        }
      }
    }

    return {
      success: true,
      expiredSessionsHandled: expiredCount
    };
  } catch (error) {
    console.error('Error checking for expired sessions:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  // Internal methods (no auth)
  getSessionInternal,
  markSessionConnected,
  markSessionDisconnected,
  updateConnectionState,
  getSessionStatus,

  // Public API methods (with auth)
  createSession,
  forceCreateSession,
  checkRejoinSession,
  rejoinSession,
  abandonSession,
  getSession,
  getSessionForAdmin,
  listSessions,
  getTimeSync,
  checkAndHandleExpiredSessions
};