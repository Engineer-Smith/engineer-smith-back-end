// /services/testSession/adminService.js - Consolidated Admin and Analytics Functions
const createError = require('http-errors');
const TestSession = require('../../models/TestSession');

/**
 * SESSION OVERVIEW & MONITORING
 */

// Get detailed session overview (from navigationService)
const getSessionOverview = async (sessionId, user) => {
  const { getSessionForAdmin } = require('./sessionManager');
  const sessionData = await getSessionForAdmin(sessionId, user);
  
  if (!sessionData.success) {
    throw createError(404, 'Session not found');
  }

  const session = sessionData.session;

  // Build detailed question overview
  const questionOverview = [];
  let globalIndex = 0;

  if (session.testSnapshot.settings.useSections) {
    for (let sectionIndex = 0; sectionIndex < session.testSnapshot.sections.length; sectionIndex++) {
      const section = session.testSnapshot.sections[sectionIndex];
      const isCompleted = session.completedSections.includes(sectionIndex);
      
      const sectionQuestions = section.questions.map((q, localIndex) => ({
        globalIndex: globalIndex + localIndex,
        localIndex,
        questionId: q.questionId,
        status: q.status,
        hasAnswer: q.studentAnswer !== null && q.studentAnswer !== undefined,
        studentAnswer: q.studentAnswer,
        timeSpent: q.timeSpentOnQuestion || 0,
        points: q.points,
        isCorrect: q.isCorrect,
        pointsEarned: q.pointsEarned || 0,
        viewCount: q.viewCount || 0,
        firstViewedAt: q.firstViewedAt,
        lastViewedAt: q.lastViewedAt
      }));
      
      questionOverview.push({
        sectionName: section.name,
        sectionIndex: sectionIndex,
        isCompleted: isCompleted,
        timeLimit: section.timeLimit,
        questions: sectionQuestions
      });
      
      globalIndex += section.questions.length;
    }
  } else {
    const nonSectionedQuestions = session.testSnapshot.questions.map((q, index) => ({
      globalIndex: index,
      questionId: q.questionId,
      status: q.status,
      hasAnswer: q.studentAnswer !== null && q.studentAnswer !== undefined,
      studentAnswer: q.studentAnswer,
      timeSpent: q.timeSpentOnQuestion || 0,
      points: q.points,
      isCorrect: q.isCorrect,
      pointsEarned: q.pointsEarned || 0,
      viewCount: q.viewCount || 0,
      firstViewedAt: q.firstViewedAt,
      lastViewedAt: q.lastViewedAt
    }));
    
    questionOverview.push({
      sectionName: null,
      sectionIndex: 0,
      isCompleted: false,
      questions: nonSectionedQuestions
    });
  }

  return {
    success: true,
    sessionId: session.id,
    sessionInfo: {
      testTitle: session.testTitle,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      isConnected: session.isConnected,
      sessionPhase: session.sessionPhase,
      lastServerAction: session.lastServerAction
    },
    questionOverview,
    navigation: {
      currentQuestionIndex: session.currentQuestionIndex,
      currentSectionIndex: session.currentSectionIndex,
      answeredQuestions: session.answeredQuestions || [],
      completedSections: session.completedSections || []
    },
    timeRemaining: session.calculateTimeRemaining ? session.calculateTimeRemaining() : 0
  };
};

// Get active sessions for monitoring
const getActiveSessions = async (user) => {
  const { listSessions } = require('./sessionManager');
  
  const activeSessions = await listSessions({
    status: 'inProgress',
    limit: 100
  }, user);

  return activeSessions.map(session => ({
    sessionId: session._id,
    userId: session.userId,
    testTitle: session.testTitle,
    startedAt: session.startedAt,
    isConnected: session.isConnected,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.testSnapshot ? session.testSnapshot.totalQuestions : 0,
    answeredQuestions: session.answeredQuestions ? session.answeredQuestions.length : 0
  }));
};

// Get real-time session status
const getSessionStatus = async (sessionId, user) => {
  const { getSessionForAdmin } = require('./sessionManager');
  const sessionData = await getSessionForAdmin(sessionId, user);
  
  if (!sessionData.success) {
    throw createError(404, 'Session not found');
  }

  const session = sessionData.session;

  return {
    sessionId: session.id,
    status: session.status,
    isConnected: session.isConnected,
    currentQuestionIndex: session.currentQuestionIndex,
    currentSectionIndex: session.currentSectionIndex,
    answeredQuestions: session.answeredQuestions ? session.answeredQuestions.length : 0,
    timeRemaining: session.calculateTimeRemaining ? session.calculateTimeRemaining() : 0,
    sessionPhase: session.sessionPhase,
    lastServerAction: session.lastServerAction,
    lastActivity: session.updatedAt
  };
};

/**
 * SESSION ANALYTICS (from analyticsService)
 */

// Get comprehensive analytics for a specific session
const getSessionAnalytics = async (sessionId, user) => {
  const { getSessionForAdmin } = require('./sessionManager');
  const sessionData = await getSessionForAdmin(sessionId, user);
  
  if (!sessionData.success) {
    throw createError(404, 'Session not found');
  }

  const session = sessionData.session;

  // Basic session analytics
  const analytics = {
    sessionInfo: {
      sessionId: session.id,
      testId: session.testId,
      testTitle: session.testTitle,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      timeSpent: calculateTimeSpent(session)
    },

    // Question-level analytics
    questionAnalytics: buildQuestionAnalytics(session),

    // Overall performance metrics
    performanceMetrics: calculatePerformanceMetrics(session),

    // Navigation and engagement metrics
    engagementMetrics: calculateEngagementMetrics(session),

    // Section analytics (if applicable)
    sectionAnalytics: session.testSnapshot.settings.useSections ? 
      buildSectionAnalytics(session) : null,

    // Time-based analytics
    timeAnalytics: buildTimeAnalytics(session),

    // Final scoring breakdown
    scoringAnalytics: session.finalScore || null
  };

  return {
    success: true,
    analytics
  };
};

// Get analytics for multiple sessions (class overview)
const getClassAnalytics = async (filters, user) => {
  const { listSessions } = require('./sessionManager');
  
  // Get all sessions matching the filters
  const sessions = await listSessions({
    ...filters,
    limit: 1000 // Get more sessions for analytics
  }, user);

  if (!sessions || sessions.length === 0) {
    return {
      success: true,
      analytics: {
        totalSessions: 0,
        message: 'No sessions found matching the criteria'
      }
    };
  }

  // Build class-level analytics
  const analytics = {
    overview: {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      inProgressSessions: sessions.filter(s => s.status === 'inProgress').length,
      abandonedSessions: sessions.filter(s => s.status === 'abandoned').length,
      averageScore: calculateAverageScore(sessions),
      passRate: calculatePassRate(sessions)
    },

    // Score distribution
    scoreDistribution: buildScoreDistribution(sessions),

    // Time analytics
    timeMetrics: buildClassTimeMetrics(sessions),

    // Individual session summaries
    sessionSummaries: sessions.map(session => ({
      sessionId: session._id,
      userId: session.userId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      finalScore: session.finalScore,
      isConnected: session.isConnected
    }))
  };

  return {
    success: true,
    analytics
  };
};

// Get test-level analytics across all attempts
const getTestAnalytics = async (testId, user) => {
  const { listSessions } = require('./sessionManager');
  
  // Get all sessions for this test
  const sessions = await listSessions({
    testId: testId,
    limit: 1000
  }, user);

  if (!sessions || sessions.length === 0) {
    return {
      success: true,
      analytics: {
        totalAttempts: 0,
        message: 'No attempts found for this test'
      }
    };
  }

  const analytics = {
    testOverview: {
      testId: testId,
      totalAttempts: sessions.length,
      uniqueStudents: new Set(sessions.map(s => s.userId)).size,
      completionRate: (sessions.filter(s => s.status === 'completed').length / sessions.length) * 100,
      averageScore: calculateAverageScore(sessions),
      passRate: calculatePassRate(sessions)
    },

    // Performance trends
    performanceTrends: buildPerformanceTrends(sessions),

    // Question difficulty analysis (for completed sessions)
    questionDifficulty: await buildQuestionDifficultyAnalysis(sessions, testId),

    // Time analysis
    timeAnalysis: buildTestTimeAnalysis(sessions),

    // Attempt patterns
    attemptPatterns: buildAttemptPatterns(sessions)
  };

  return {
    success: true,
    analytics
  };
};

/**
 * ADMIN ACTIONS
 */

// Force complete a session (admin intervention)
const forceCompleteSession = async (sessionId, user) => {
  // Check admin permissions
  if (user.role !== 'admin' && user.role !== 'instructor' && !user.isSuperOrgAdmin) {
    throw createError(403, 'Insufficient permissions to force complete sessions');
  }

  const { getSessionInternal } = require('./sessionManager');
  const session = await getSessionInternal(sessionId);

  if (session.status !== 'inProgress' && session.status !== 'paused') {
    throw createError(400, 'Session is not in progress');
  }

  try {
    const { submitTestSession } = require('./gradingService');
    const result = await submitTestSession(sessionId, { forceSubmit: true }, { userId: session.userId });
    
    console.log(`Admin ${user.userId} force-completed session ${sessionId}`);
    
    return {
      success: true,
      message: 'Session force-completed successfully',
      result
    };
  } catch (error) {
    console.error('Error force-completing session:', error);
    throw createError(500, 'Failed to force complete session');
  }
};

// Get instructor dashboard data
const getInstructorDashboard = async (user) => {
  if (user.role !== 'instructor' && user.role !== 'admin' && !user.isSuperOrgAdmin) {
    throw createError(403, 'Insufficient permissions');
  }

  const { listSessions } = require('./sessionManager');
  
  // Get recent sessions for instructor's organization
  const recentSessions = await listSessions({
    orgId: user.organizationId,
    limit: 50
  }, user);

  const activeSessions = recentSessions.filter(s => s.status === 'inProgress');
  const completedToday = recentSessions.filter(s => 
    s.status === 'completed' && 
    new Date(s.completedAt).toDateString() === new Date().toDateString()
  );

  return {
    success: true,
    dashboard: {
      activeSessions: activeSessions.length,
      completedToday: completedToday.length,
      totalSessions: recentSessions.length,
      recentActivity: recentSessions.slice(0, 10).map(session => ({
        sessionId: session._id,
        userId: session.userId,
        testTitle: session.testTitle,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        finalScore: session.finalScore
      }))
    }
  };
};

/**
 * HELPER FUNCTIONS (from analyticsService)
 */

const buildQuestionAnalytics = (session) => {
  const questions = session.testSnapshot.settings.useSections ?
    session.testSnapshot.sections.flatMap(section => section.questions) :
    session.testSnapshot.questions;

  return questions.map((question, index) => ({
    questionIndex: index,
    questionId: question.questionId,
    questionType: question.questionData.type,
    language: question.questionData.language,
    category: question.questionData.category,
    difficulty: question.questionData.difficulty,
    points: question.points,
    
    // Student performance
    status: question.status,
    hasAnswer: question.studentAnswer !== null && question.studentAnswer !== undefined,
    studentAnswer: question.studentAnswer,
    isCorrect: question.isCorrect,
    pointsEarned: question.pointsEarned || 0,
    
    // Time metrics
    timeSpent: question.timeSpentOnQuestion || 0,
    viewCount: question.viewCount || 0,
    firstViewedAt: question.firstViewedAt,
    lastViewedAt: question.lastViewedAt,
    
    // Engagement metrics
    wasSkipped: question.status === 'skipped',
    pointsEfficiency: question.points > 0 ? (question.pointsEarned || 0) / question.points : 0
  }));
};

const calculatePerformanceMetrics = (session) => {
  const questions = session.testSnapshot.settings.useSections ?
    session.testSnapshot.sections.flatMap(section => section.questions) :
    session.testSnapshot.questions;

  const answeredQuestions = questions.filter(q => 
    q.studentAnswer !== null && q.studentAnswer !== undefined && q.studentAnswer !== '');
  
  const correctQuestions = questions.filter(q => q.isCorrect === true);
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);

  return {
    totalQuestions: questions.length,
    answeredQuestions: answeredQuestions.length,
    correctQuestions: correctQuestions.length,
    skippedQuestions: questions.filter(q => q.status === 'skipped').length,
    
    // Score metrics
    totalPossiblePoints: totalPoints,
    totalEarnedPoints: earnedPoints,
    scorePercentage: totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0,
    
    // Efficiency metrics
    answerRate: questions.length > 0 ? (answeredQuestions.length / questions.length) * 100 : 0,
    accuracyRate: answeredQuestions.length > 0 ? (correctQuestions.length / answeredQuestions.length) * 100 : 0
  };
};

const calculateEngagementMetrics = (session) => {
  const questions = session.testSnapshot.settings.useSections ?
    session.testSnapshot.sections.flatMap(section => section.questions) :
    session.testSnapshot.questions;

  const totalTimeSpent = questions.reduce((sum, q) => sum + (q.timeSpentOnQuestion || 0), 0);
  const questionsViewed = questions.filter(q => q.viewCount > 0).length;
  const averageTimePerQuestion = questionsViewed > 0 ? totalTimeSpent / questionsViewed : 0;

  return {
    totalTimeSpent: totalTimeSpent,
    averageTimePerQuestion: Math.round(averageTimePerQuestion),
    questionsViewed: questionsViewed,
    viewRate: questions.length > 0 ? (questionsViewed / questions.length) * 100 : 0,
    
    // Engagement patterns
    quickAnswers: questions.filter(q => (q.timeSpentOnQuestion || 0) < 30).length, // < 30 seconds
    thoughtfulAnswers: questions.filter(q => (q.timeSpentOnQuestion || 0) > 120).length, // > 2 minutes
    
    // Current session status
    isCompleted: session.status === 'completed',
    completionRate: session.testSnapshot.settings.useSections ? 
      (session.completedSections.length / session.testSnapshot.sections.length) * 100 :
      (session.answeredQuestions.length / questions.length) * 100
  };
};

const buildSectionAnalytics = (session) => {
  if (!session.testSnapshot.settings.useSections) return null;

  return session.testSnapshot.sections.map((section, index) => {
    const sectionQuestions = section.questions;
    const answeredInSection = sectionQuestions.filter(q => 
      q.studentAnswer !== null && q.studentAnswer !== undefined).length;
    const correctInSection = sectionQuestions.filter(q => q.isCorrect === true).length;
    const timeSpentInSection = sectionQuestions.reduce((sum, q) => sum + (q.timeSpentOnQuestion || 0), 0);

    return {
      sectionIndex: index,
      sectionName: section.name,
      isCompleted: session.completedSections.includes(index),
      
      // Question metrics
      totalQuestions: sectionQuestions.length,
      answeredQuestions: answeredInSection,
      correctQuestions: correctInSection,
      
      // Performance metrics
      sectionScore: sectionQuestions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0),
      maxSectionScore: sectionQuestions.reduce((sum, q) => sum + q.points, 0),
      sectionAccuracy: answeredInSection > 0 ? (correctInSection / answeredInSection) * 100 : 0,
      
      // Time metrics
      timeSpent: timeSpentInSection,
      averageTimePerQuestion: sectionQuestions.length > 0 ? timeSpentInSection / sectionQuestions.length : 0
    };
  });
};

const buildTimeAnalytics = (session) => {
  const startTime = new Date(session.startedAt);
  const endTime = session.completedAt ? new Date(session.completedAt) : new Date();
  const totalSessionTime = Math.floor((endTime - startTime) / 1000);
  
  const questions = session.testSnapshot.settings.useSections ?
    session.testSnapshot.sections.flatMap(section => section.questions) :
    session.testSnapshot.questions;

  const activeTime = questions.reduce((sum, q) => sum + (q.timeSpentOnQuestion || 0), 0);

  return {
    sessionStarted: session.startedAt,
    sessionEnded: session.completedAt,
    totalSessionTime: totalSessionTime,
    activeQuestionTime: activeTime,
    
    // Time efficiency
    timeUtilization: totalSessionTime > 0 ? (activeTime / totalSessionTime) * 100 : 0,
    
    // Pacing
    timePerQuestion: {
      fastest: Math.min(...questions.map(q => q.timeSpentOnQuestion || Infinity).filter(t => t !== Infinity)),
      slowest: Math.max(...questions.map(q => q.timeSpentOnQuestion || 0)),
      average: questions.length > 0 ? activeTime / questions.length : 0
    }
  };
};

// Class-level analytics helpers
const calculateAverageScore = (sessions) => {
  const completedSessions = sessions.filter(s => s.finalScore);
  if (completedSessions.length === 0) return 0;
  
  const totalScore = completedSessions.reduce((sum, s) => sum + s.finalScore.percentage, 0);
  return Math.round((totalScore / completedSessions.length) * 100) / 100;
};

const calculatePassRate = (sessions) => {
  const completedSessions = sessions.filter(s => s.finalScore);
  if (completedSessions.length === 0) return 0;
  
  const passedSessions = completedSessions.filter(s => s.finalScore.passed);
  return Math.round((passedSessions.length / completedSessions.length) * 100 * 100) / 100;
};

const buildScoreDistribution = (sessions) => {
  const completedSessions = sessions.filter(s => s.finalScore);
  const ranges = [
    { min: 90, max: 100, label: 'A (90-100%)', count: 0 },
    { min: 80, max: 89, label: 'B (80-89%)', count: 0 },
    { min: 70, max: 79, label: 'C (70-79%)', count: 0 },
    { min: 60, max: 69, label: 'D (60-69%)', count: 0 },
    { min: 0, max: 59, label: 'F (0-59%)', count: 0 }
  ];

  completedSessions.forEach(session => {
    const score = session.finalScore.percentage;
    const range = ranges.find(r => score >= r.min && score <= r.max);
    if (range) range.count++;
  });

  return ranges;
};

const buildClassTimeMetrics = (sessions) => {
  const completedSessions = sessions.filter(s => s.timeSpent);
  if (completedSessions.length === 0) return null;

  const times = completedSessions.map(s => s.timeSpent);
  const averageTime = times.reduce((sum, t) => sum + t, 0) / times.length;

  return {
    averageCompletionTime: Math.round(averageTime),
    fastestCompletion: Math.min(...times),
    slowestCompletion: Math.max(...times),
    totalStudentHours: Math.round(times.reduce((sum, t) => sum + t, 0) / 3600 * 100) / 100
  };
};

const calculateTimeSpent = (session) => {
  if (session.status === 'completed' && session.completedAt) {
    return Math.floor((new Date(session.completedAt) - new Date(session.startedAt)) / 1000);
  } else {
    return Math.floor((Date.now() - new Date(session.startedAt)) / 1000);
  }
};

// Additional helper functions for test-level analytics
const buildPerformanceTrends = (sessions) => {
  const sortedSessions = sessions
    .filter(s => s.finalScore)
    .sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));

  return sortedSessions.map((session, index) => ({
    attemptNumber: index + 1,
    date: session.startedAt,
    score: session.finalScore.percentage,
    passed: session.finalScore.passed,
    timeSpent: session.timeSpent
  }));
};

const buildQuestionDifficultyAnalysis = async (sessions, testId) => {
  const completedSessions = sessions.filter(s => s.status === 'completed');
  
  return {
    totalAnalyzedSessions: completedSessions.length,
    note: 'Detailed question difficulty analysis requires individual session data'
  };
};

const buildTestTimeAnalysis = (sessions) => {
  const completedSessions = sessions.filter(s => s.timeSpent);
  if (completedSessions.length === 0) return null;

  const times = completedSessions.map(s => s.timeSpent / 60); // Convert to minutes
  const averageTime = times.reduce((sum, t) => sum + t, 0) / times.length;

  return {
    averageCompletionTimeMinutes: Math.round(averageTime),
    quickestCompletionMinutes: Math.round(Math.min(...times)),
    longestCompletionMinutes: Math.round(Math.max(...times)),
    completionTimeVariation: Math.round(Math.sqrt(times.reduce((sum, t) => sum + Math.pow(t - averageTime, 2), 0) / times.length))
  };
};

const buildAttemptPatterns = (sessions) => {
  const attemptCounts = {};
  sessions.forEach(session => {
    const userId = session.userId;
    attemptCounts[userId] = (attemptCounts[userId] || 0) + 1;
  });

  const attempts = Object.values(attemptCounts);
  return {
    multipleAttempts: attempts.filter(count => count > 1).length,
    averageAttemptsPerStudent: attempts.reduce((sum, count) => sum + count, 0) / attempts.length,
    maxAttempts: Math.max(...attempts),
    studentsWithOneAttempt: attempts.filter(count => count === 1).length
  };
};

module.exports = {
  // Session Overview & Monitoring
  getSessionOverview,
  getActiveSessions,
  getSessionStatus,
  
  // Analytics
  getSessionAnalytics,
  getClassAnalytics,
  getTestAnalytics,
  
  // Admin Actions
  forceCompleteSession,
  getInstructorDashboard
};