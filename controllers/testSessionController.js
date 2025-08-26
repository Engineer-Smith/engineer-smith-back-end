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
    const { sessionId } = req.params; // ADD THIS LINE - extract sessionId from params

    const session = await TestSession.findById(sessionId) // Now sessionId is defined
      .populate({
        path: 'questions.questionId',
        select: 'title description type language options testCases difficulty'
      });

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
        throw createError(403, 'Only admins or instructors can access other users sessions');
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

    // Transform for frontend compatibility
    const transformedSession = {
      ...session.toObject(),
      questions: session.questions.map(q => ({
        ...q.toObject(),
        questionData: q.questionId, // Frontend expects this structure
        questionId: q.questionId._id // Keep reference
      }))
    };

    res.json(transformedSession);
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
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

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

    // Fetch session with transaction
    const session = await TestSession.findById(sessionId).session(mongoSession);
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

    // Fetch test and questions with transaction
    const test = await Test.findById(session.testId).session(mongoSession);
    if (!test) {
      throw createError(404, 'Test not found');
    }

    const questionIds = questions.map(q => q.questionId);
    const questionDocs = await Question.find({ _id: { $in: questionIds } }).session(mongoSession);
    if (questionDocs.length !== questionIds.length) {
      throw createError(400, 'Some question IDs are invalid');
    }

    // Collect question updates and process session questions
    const questionUpdates = [];
    let earnedPoints = 0;

    session.questions.forEach(sessionQuestion => {
      const submitted = questions.find(q => q.questionId.toString() === sessionQuestion.questionId.toString());
      if (submitted) {
        const questionDoc = questionDocs.find(q => q._id.toString() === submitted.questionId.toString());

        if (!questionDoc) {
          console.warn(`Question document not found for ID: ${submitted.questionId}`);
          return;
        }

        sessionQuestion.answer = submitted.answer;
        sessionQuestion.timeSpent = submitted.timeSpent || 0;

        // Evaluate answer
        let isCorrect = false;
        if (questionDoc.type === 'multipleChoice') {
          isCorrect = submitted.answer === questionDoc.correctAnswer;
        } else if (questionDoc.type === 'trueFalse') {
          isCorrect = submitted.answer === questionDoc.correctAnswer;
        } else if (questionDoc.type === 'codeChallenge' || questionDoc.type === 'codeDebugging') {
          sessionQuestion.codeSubmissions = submitted.codeSubmissions || [];
          isCorrect = submitted.codeSubmissions?.every(sub => sub.passed) || false;
        }

        sessionQuestion.isCorrect = isCorrect;

        // Calculate points
        const points = test.settings.useSections
          ? test.sections
            .flatMap(section => section.questions)
            .find(q => q.questionId.toString() === sessionQuestion.questionId.toString())?.points || 0
          : test.questions.find(q => q.questionId.toString() === sessionQuestion.questionId.toString())?.points || 0;

        sessionQuestion.pointsAwarded = isCorrect ? points : 0;
        earnedPoints += sessionQuestion.pointsAwarded;

        // Collect update data for batch processing
        questionUpdates.push({
          questionId: questionDoc._id,
          isCorrect: isCorrect,
          timeSpent: sessionQuestion.timeSpent
        });
      }
    });

    // Update session score and status
    session.score.earnedPoints = earnedPoints;
    session.score.passed = earnedPoints >= (session.score.totalPoints * 0.7); // Example passing threshold
    session.status = status || 'completed';
    session.completedAt = status === 'completed' ? new Date() : session.completedAt;
    session.timeSpent = (new Date() - session.startedAt) / 1000; // Seconds
    session.completedSections = completedSections || session.completedSections;

    // Save session with transaction
    await session.save({ session: mongoSession });

    // Update question statistics atomically
    const updateQuestionStats = async (questionId, isCorrect, timeSpent) => {
      // First, get current stats in a way that works with the transaction
      const currentQuestion = await Question.findById(questionId).session(mongoSession);
      if (!currentQuestion) {
        console.warn(`Question not found for stats update: ${questionId}`);
        return;
      }

      const currentStats = currentQuestion.usageStats || {
        totalAttempts: 0,
        correctAttempts: 0,
        timesUsed: 0,
        averageTime: 0,
        successRate: 0
      };

      // Calculate new values
      const newTotalAttempts = currentStats.totalAttempts + 1;
      const newCorrectAttempts = currentStats.correctAttempts + (isCorrect ? 1 : 0);
      const newTimesUsed = currentStats.timesUsed + 1;
      const newAverageTime = (currentStats.averageTime * currentStats.totalAttempts + timeSpent) / newTotalAttempts;
      const newSuccessRate = newCorrectAttempts / newTotalAttempts;

      // Update atomically
      return Question.findByIdAndUpdate(
        questionId,
        {
          $set: {
            'usageStats.totalAttempts': newTotalAttempts,
            'usageStats.correctAttempts': newCorrectAttempts,
            'usageStats.timesUsed': newTimesUsed,
            'usageStats.averageTime': newAverageTime,
            'usageStats.successRate': newSuccessRate
          }
        },
        {
          session: mongoSession,
          new: true,
          upsert: false
        }
      );
    };

    // Process all question updates in parallel within the transaction
    await Promise.all(
      questionUpdates.map(update =>
        updateQuestionStats(update.questionId, update.isCorrect, update.timeSpent)
      )
    );

    // Update Test statistics
    const currentTestStats = test.stats || {
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
      passed: 0
    };

    const newTestTotalAttempts = currentTestStats.totalAttempts + 1;
    const newTestAverageScore = (currentTestStats.averageScore * currentTestStats.totalAttempts + earnedPoints) / newTestTotalAttempts;
    const newTestPassedCount = currentTestStats.passed + (session.score.passed ? 1 : 0);
    const newTestPassRate = newTestPassedCount / newTestTotalAttempts;

    test.stats = {
      totalAttempts: newTestTotalAttempts,
      averageScore: newTestAverageScore,
      passRate: newTestPassRate,
      passed: newTestPassedCount
    };

    await test.save({ session: mongoSession });

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

    await result.save({ session: mongoSession });

    // Commit the transaction
    await mongoSession.commitTransaction();

    // Emit real-time update (after successful commit)
    if (req.io) {
      req.io.to(`session_${sessionId}`).emit('session_completed', {
        sessionId: session._id,
        userId: session.userId,
        status: session.status,
        score: session.score,
        completedAt: session.completedAt
      });

      // Notify organization admins/instructors
      req.io.to(`org_${session.organizationId}_instructors`).emit('student_completed_test', {
        sessionId: session._id,
        userId: session.userId,
        testId: session.testId,
        score: session.score
      });
    }

    // Return response
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
    // Rollback transaction on any error
    await mongoSession.abortTransaction();
    console.error('Test submission failed:', {
      sessionId: req.params.sessionId,
      userId: req.user?.userId,
      error: error.message,
      stack: error.stack
    });
    next(error);
  } finally {
    // Always end the session
    mongoSession.endSession();
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

// Submit a single section
const submitSection = async (req, res, next) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;
    const { sectionIndex, questions } = req.body;

    if (!Array.isArray(questions) || sectionIndex === undefined) {
      throw createError(400, 'Section index and questions array are required');
    }

    const session = await TestSession.findById(sessionId);
    if (!session) {
      throw createError(404, 'Test session not found');
    }

    if (session.userId.toString() !== user.userId.toString()) {
      throw createError(403, 'Unauthorized to submit this section');
    }

    if (session.status !== 'inProgress') {
      throw createError(400, 'Test session is not in progress');
    }

    // Check if section already completed
    if (session.completedSections.includes(sectionIndex)) {
      throw createError(400, 'Section already completed');
    }

    // Get test to validate section
    const test = await Test.findById(session.testId);
    if (!test || !test.settings.useSections || !test.sections[sectionIndex]) {
      throw createError(400, 'Invalid section');
    }

    // Update questions for this section
    questions.forEach(submittedQuestion => {
      const sessionQuestion = session.questions.find(
        q => q.questionId.toString() === submittedQuestion.questionId.toString() &&
          q.sectionIndex === sectionIndex
      );

      if (sessionQuestion) {
        sessionQuestion.answer = submittedQuestion.answer;
        sessionQuestion.timeSpent = submittedQuestion.timeSpent || 0;
        // Note: Don't calculate scores yet, wait for final submission
      }
    });

    // Mark section as completed
    session.completedSections.push(sectionIndex);
    session.updatedAt = Date.now();
    await session.save();

    // Check if all sections completed
    const allSectionsCompleted = session.completedSections.length === test.sections.length;

    res.json({
      message: 'Section submitted successfully',
      completedSections: session.completedSections,
      allSectionsCompleted,
      nextSectionIndex: allSectionsCompleted ? null : findNextIncompleteSection(session, test)
    });
  } catch (error) {
    next(error);
  }
};

const findNextIncompleteSection = (session, test) => {
  for (let i = 0; i < test.sections.length; i++) {
    if (!session.completedSections.includes(i)) {
      return i;
    }
  }
  return null;
};

const getSessionTimeSync = async (req, res, next) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;

    console.log('getSessionTimeSync called with:', { sessionId, userId: user?.userId });

    // Validate sessionId
    if (!sessionId || sessionId === 'undefined' || typeof sessionId !== 'string') {
      throw createError(400, 'Valid session ID is required');
    }

    // Check if it's a valid MongoDB ObjectId format
    if (sessionId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(sessionId)) {
      throw createError(400, 'Invalid session ID format');
    }

    const session = await TestSession.findById(sessionId);
    if (!session) {
      throw createError(404, 'Test session not found');
    }

    // Validate access
    if (session.userId.toString() !== user.userId.toString()) {
      throw createError(403, 'Unauthorized to access this test session');
    }

    const serverTime = Date.now();
    const startTime = new Date(session.startedAt).getTime();
    const elapsedSeconds = Math.floor((serverTime - startTime) / 1000);

    res.json({
      serverTime,
      startTime,
      elapsedSeconds,
      sessionTimeSpent: session.timeSpent + elapsedSeconds
    });
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
  submitSection,
  getSessionTimeSync
};