// /controllers/testSessionController.js
const TestSession = require('../models/TestSession');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const Result = require('../models/Result');
const createError = require('http-errors');

const validQuestionTypes = ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'];

// Start a test session (students)
const startTestSession = async (req, res, next) => {
  try {
    const { user } = req; // From JWT middleware
    const { testId } = req.body;

    // Validate input
    if (!testId) {
      throw createError(400, 'Test ID is required');
    }

    // Fetch test
    const test = await Test.findById(testId);
    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate access
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor) {
      if (test.isGlobal) {
        if (user.role !== 'student') {
          throw createError(403, 'Only students can start global tests');
        }
      } else if (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to start this test');
      }
    } else {
      throw createError(403, 'Only students can start test sessions');
    }

    // Check attempt limit
    const previousAttempts = await TestSession.countDocuments({ testId, userId: user.userId });
    if (previousAttempts >= test.settings.attemptsAllowed) {
      throw createError(403, 'Maximum attempts reached');
    }

    // Calculate total points
    const questionIds = test.settings.useSections
      ? test.sections.flatMap(section => section.questions.map(q => q.questionId))
      : test.questions.map(q => q.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const totalPoints = test.settings.useSections
      ? test.sections.reduce((sum, section) => sum + section.questions.reduce((acc, q) => acc + q.points, 0), 0)
      : test.questions.reduce((sum, q) => sum + q.points, 0);

    // Create session
    const session = new TestSession({
      testId,
      userId: user.userId,
      organizationId: test.organizationId || user.organizationId,
      attemptNumber: previousAttempts + 1,
      status: 'inProgress',
      startedAt: new Date(),
      questions: questions.map(q => ({
        questionId: q._id,
        sectionIndex: test.settings.useSections ? test.sections.findIndex(section => section.questions.some(sq => sq.questionId.toString() === q._id.toString())) : undefined,
        sectionName: test.settings.useSections ? test.sections.find(section => section.questions.some(sq => sq.questionId.toString() === q._id.toString()))?.name : undefined,
      })),
      score: { totalPoints, earnedPoints: 0, passed: false },
      completedSections: [],
    });

    await session.save();

    res.status(201).json({
      id: session._id,
      testId: session.testId,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      startedAt: session.startedAt,
      questions: session.questions,
      score: session.score,
      completedSections: session.completedSections,
      createdAt: session.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// Get a test session (super org admins/instructors, org admins/instructors, or students)
const getTestSession = async (req, res, next) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;

    const session = await TestSession.findById(sessionId).populate('questions.questionId', 'title description type language options testCases');
    if (!session) {
      throw createError(404, 'Test session not found');
    }

    // Validate access
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor && session.userId.toString() !== user.userId.toString()) {
      if (session.organizationId && session.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access this test session');
      }
      if (user.role !== 'admin') {
        throw createError(403, 'Only admins or instructors can access other users’ sessions');
      }
    }

    // Hide sensitive data for students
    if (user.role === 'student' && session.userId.toString() === user.userId.toString()) {
      session.questions.forEach(q => {
        if (q.questionId) {
          q.questionId.correctAnswer = undefined;
          q.questionId.testCases = undefined;
        }
      });
    }

    res.json({
      id: session._id,
      testId: session.testId,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      timeSpent: session.timeSpent,
      questions: session.questions,
      score: session.score,
      completedSections: session.completedSections,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// List test sessions (super org admins/instructors, org admins/instructors, or students)
const getAllTestSessions = async (req, res, next) => {
  try {
    const { user } = req;
    const { userId, testId, orgId, limit = 10, skip = 0 } = req.query;

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = {};
    if (isSuperOrgAdminOrInstructor) {
      if (userId) query.userId = userId;
      if (testId) query.testId = testId;
      if (orgId) query.organizationId = orgId;
    } else if (user.role === 'admin') {
      if (orgId && orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access sessions for this organization');
      }
      query.organizationId = user.organizationId;
      if (userId) query.userId = userId;
      if (testId) query.testId = testId;
    } else {
      query.userId = user.userId;
      if (testId) query.testId = testId;
    }

    const sessions = await TestSession.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('testId userId organizationId attemptNumber status startedAt completedAt score createdAt');

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// Submit test session answers (students)
const submitTestSession = async (req, res, next) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;
    const { questions, status, completedSections } = req.body;

    // Validate input
    if (!questions || !Array.isArray(questions)) {
      throw createError(400, 'Questions array is required');
    }
    if (status && !['completed', 'expired'].includes(status)) {
      throw createError(400, 'Invalid status');
    }

    const session = await TestSession.findById(sessionId);
    if (!session) {
      throw createError(404, 'Test session not found');
    }

    // Validate access
    if (session.userId.toString() !== user.userId.toString()) {
      throw createError(403, 'Unauthorized to submit this test session');
    }
    if (session.status !== 'inProgress') {
      throw createError(400, 'Test session is not in progress');
    }

    // Fetch test and questions
    const test = await Test.findById(session.testId);
    if (!test) {
      throw createError(404, 'Test not found');
    }
    const questionIds = questions.map(q => q.questionId);
    const questionDocs = await Question.find({ _id: { $in: questionIds } });
    if (questionDocs.length !== questionIds.length) {
      throw createError(400, 'Some question IDs are invalid');
    }

    // Update session
    let earnedPoints = 0;
    session.questions.forEach(sessionQuestion => {
      const submitted = questions.find(q => q.questionId.toString() === sessionQuestion.questionId.toString());
      if (submitted) {
        const questionDoc = questionDocs.find(q => q._id.toString() === submitted.questionId.toString());
        sessionQuestion.answer = submitted.answer;
        sessionQuestion.timeSpent = submitted.timeSpent || 0;

        // Evaluate answer
        if (questionDoc.type === 'multipleChoice') {
          sessionQuestion.isCorrect = submitted.answer === questionDoc.correctAnswer;
        } else if (questionDoc.type === 'trueFalse') {
          sessionQuestion.isCorrect = submitted.answer === questionDoc.correctAnswer;
        } else if (questionDoc.type === 'codeChallenge' || questionDoc.type === 'codeDebugging') {
          sessionQuestion.codeSubmissions = submitted.codeSubmissions || [];
          sessionQuestion.isCorrect = submitted.codeSubmissions?.every(sub => sub.passed) || false;
        }

        // Calculate points
        const points = test.settings.useSections
          ? test.sections
              .flatMap(section => section.questions)
              .find(q => q.questionId.toString() === sessionQuestion.questionId.toString())?.points || 0
          : test.questions.find(q => q.questionId.toString() === sessionQuestion.questionId.toString())?.points || 0;
        sessionQuestion.pointsAwarded = sessionQuestion.isCorrect ? points : 0;
        earnedPoints += sessionQuestion.pointsAwarded;

        // Update Question.usageStats
        questionDoc.usageStats.totalAttempts += 1;
        questionDoc.usageStats.correctAttempts += sessionQuestion.isCorrect ? 1 : 0;
        questionDoc.usageStats.timesUsed += 1;
        questionDoc.usageStats.averageTime = (questionDoc.usageStats.averageTime * (questionDoc.usageStats.totalAttempts - 1) + sessionQuestion.timeSpent) / questionDoc.usageStats.totalAttempts;
        questionDoc.usageStats.successRate = questionDoc.usageStats.correctAttempts / questionDoc.usageStats.totalAttempts;
        questionDoc.markModified('usageStats');
        questionDoc.save(); // No await needed in async context
      }
    });

    // Update session
    session.score.earnedPoints = earnedPoints;
    session.score.passed = earnedPoints >= (session.score.totalPoints * 0.7); // Example passing threshold
    session.status = status || 'completed';
    session.completedAt = status === 'completed' ? new Date() : session.completedAt;
    session.timeSpent = (new Date() - session.startedAt) / 1000; // Seconds
    session.completedSections = completedSections || session.completedSections;

    // Update Test.stats
    test.stats.totalAttempts += 1;
    test.stats.averageScore = (test.stats.averageScore * (test.stats.totalAttempts - 1) + earnedPoints) / test.stats.totalAttempts;
    test.stats.passRate = test.stats.passed ? (test.stats.passRate * (test.stats.totalAttempts - 1) + (session.score.passed ? 1 : 0)) / test.stats.totalAttempts : session.score.passed ? 1 : 0;
    test.markModified('stats');
    await test.save();

    // Create Result document
    const result = new Result({
      sessionId: session._id,
      testId: session.testId,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      completedAt: session.completedAt,
      timeSpent: session.timeSpent,
      questions: session.questions,
      score: session.score,
    });
    await result.save();

    await session.save();

    res.json({
      id: session._id,
      testId: session.testId,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      timeSpent: session.timeSpent,
      questions: session.questions,
      score: session.score,
      completedSections: session.completedSections,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// Abandon a test session (students)
const abandonTestSession = async (req, res, next) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;

    const session = await TestSession.findById(sessionId);
    if (!session) {
      throw createError(404, 'Test session not found');
    }

    // Validate access
    if (session.userId.toString() !== user.userId.toString()) {
      throw createError(403, 'Unauthorized to abandon this test session');
    }
    if (session.status !== 'inProgress') {
      throw createError(400, 'Test session is not in progress');
    }

    session.status = 'abandoned';
    session.completedAt = new Date();
    session.timeSpent = (new Date() - session.startedAt) / 1000; // Seconds
    await session.save();

    // Create Result document for abandoned session
    const result = new Result({
      sessionId: session._id,
      testId: session.testId,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: session.status,
      completedAt: session.completedAt,
      timeSpent: session.timeSpent,
      questions: session.questions,
      score: session.score,
    });
    await result.save();

    res.json({ message: 'Test session abandoned' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startTestSession,
  getTestSession,
  getAllTestSessions,
  submitTestSession,
  abandonTestSession,
};