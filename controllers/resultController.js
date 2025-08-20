// /controllers/resultController.js
const Result = require('../models/Result');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const createError = require('http-errors');

// Get a result (super org admins/instructors, org admins/instructors, or students)
const getResult = async (req, res, next) => {
  try {
    const { user } = req;
    const { resultId } = req.params;

    const result = await Result.findById(resultId).populate(
      'questions.questionId',
      'title description type language options testCases'
    );
    if (!result) {
      throw createError(404, 'Result not found');
    }

    // Validate access
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor && result.userId.toString() !== user.userId.toString()) {
      if (result.organizationId && result.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access this result');
      }
      if (user.role !== 'admin') {
        throw createError(403, 'Only admins or instructors can access other users’ results');
      }
    }

    // Hide sensitive data for students
    if (user.role === 'student' && result.userId.toString() === user.userId.toString()) {
      result.questions.forEach(q => {
        if (q.questionId) {
          q.questionId.correctAnswer = undefined;
          q.questionId.testCases = undefined;
        }
      });
    }

    res.json({
      id: result._id,
      sessionId: result.sessionId,
      testId: result.testId,
      userId: result.userId,
      organizationId: result.organizationId,
      attemptNumber: result.attemptNumber,
      status: result.status,
      completedAt: result.completedAt,
      timeSpent: result.timeSpent,
      questions: result.questions,
      score: result.score,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// List results (super org admins/instructors, org admins/instructors, or students)
const getAllResults = async (req, res, next) => {
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
        throw createError(403, 'Unauthorized to access results for this organization');
      }
      query.organizationId = user.organizationId;
      if (userId) query.userId = userId;
      if (testId) query.testId = testId;
    } else {
      query.userId = user.userId;
      if (testId) query.testId = testId;
    }

    const results = await Result.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('sessionId testId userId organizationId attemptNumber status completedAt score createdAt');

    res.json(results);
  } catch (error) {
    next(error);
  }
};

// Get result analytics (super org admins/instructors or org admins/instructors)
const getResultAnalytics = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId, orgId, questionId, difficulty, questionType, startDate, endDate } = req.query;

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = {};
    if (!isSuperOrgAdminOrInstructor) {
      if (orgId && orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }
    if (testId) query.testId = testId;
    if (orgId) query.organizationId = orgId;
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    // Validate filters
    const validQuestionTypes = ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'];
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (questionType && !validQuestionTypes.includes(questionType)) {
      throw createError(400, 'Invalid question type');
    }
    if (difficulty && !validDifficulties.includes(difficulty)) {
      throw createError(400, 'Invalid difficulty');
    }

    // Fetch questions for type/difficulty filtering
    let questionQuery = {};
    if (questionId) questionQuery._id = questionId;
    if (questionType) questionQuery.type = questionType;
    if (difficulty) questionQuery.difficulty = difficulty;
    const questions = await Question.find(questionQuery).select('_id type difficulty');
    const questionIds = questions.map(q => q._id);

    // Aggregate analytics
    const matchStage = {
      $match: {
        ...query,
        ...(questionIds.length > 0 && { 'questions.questionId': { $in: questionIds } }),
      },
    };
    const analyticsPipeline = [
      matchStage,
      {
        $group: {
          _id: { testId: '$testId', organizationId: '$organizationId' },
          totalResults: { $sum: 1 },
          averageScore: { $avg: '$score.earnedPoints' },
          passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
          averageTime: { $avg: '$timeSpent' },
          questionStats: {
            $push: {
              questionId: '$questions.questionId',
              successRate: { $avg: { $cond: ['$questions.isCorrect', 1, 0] } },
              averageTime: { $avg: '$questions.timeSpent' },
              optionStats: {
                $cond: {
                  if: { $in: ['$questions.questionId.type', ['multipleChoice', 'trueFalse']] },
                  then: {
                    $reduce: {
                      input: '$questions.answer',
                      initialValue: [],
                      in: { $concatArrays: ['$$value', ['$$this']] },
                    },
                  },
                  else: [],
                },
              },
            },
          },
        },
      },
      {
        $unwind: '$questionStats',
      },
      {
        $group: {
          _id: { testId: '$_id.testId', questionId: '$questionStats.questionId' },
          testTotalResults: { $first: '$totalResults' },
          testAverageScore: { $first: '$averageScore' },
          testPassRate: { $first: '$passRate' },
          testAverageTime: { $first: '$averageTime' },
          questionSuccessRate: { $avg: '$questionStats.successRate' },
          questionAverageTime: { $avg: '$questionStats.averageTime' },
          questionOptionStats: { $push: '$questionStats.optionStats' },
        },
      },
    ];

    const analytics = await Result.aggregate(analyticsPipeline);

    // Format response
    const formattedAnalytics = analytics.map(item => ({
      testId: item._id.testId,
      questionId: item._id.questionId,
      totalResults: item.testTotalResults,
      averageScore: item.testAverageScore,
      passRate: item.testPassRate,
      averageTime: item.testAverageTime,
      questionSuccessRate: item.questionSuccessRate,
      questionAverageTime: item.questionAverageTime,
      questionOptionStats: item.questionOptionStats.filter(stats => stats.length > 0).reduce((acc, stats) => {
        stats.forEach((answer, index) => {
          acc[index] = (acc[index] || 0) + 1;
        });
        return acc;
      }, []),
    }));

    res.json(formattedAnalytics);
  } catch (error) {
    next(error);
  }
};

// Get user analytics (super org admins/instructors or org admins/instructors)
const getUserAnalytics = async (req, res, next) => {
  try {
    const { user } = req;
    const { userId, testId, orgId, startDate, endDate } = req.query;

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = {};
    if (!isSuperOrgAdminOrInstructor) {
      if (orgId && orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }
    if (userId) query.userId = userId;
    if (testId) query.testId = testId;
    if (orgId) query.organizationId = orgId;
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    // Aggregate user analytics
    const analyticsPipeline = [
      { $match: query },
      {
        $group: {
          _id: { userId: '$userId', organizationId: '$organizationId' },
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$score.earnedPoints' },
          passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
          averageTime: { $avg: '$timeSpent' },
          tests: {
            $push: {
              testId: '$testId',
              attemptNumber: '$attemptNumber',
              score: '$score.earnedPoints',
              passed: '$score.passed',
              timeSpent: '$timeSpent',
            },
          },
        },
      },
    ];

    const analytics = await Result.aggregate(analyticsPipeline);

    // Format response
    const formattedAnalytics = analytics.map(item => ({
      userId: item._id.userId,
      organizationId: item._id.organizationId,
      totalTests: item.totalTests,
      averageScore: item.averageScore,
      passRate: item.passRate,
      averageTime: item.averageTime,
      tests: item.tests,
    }));

    res.json(formattedAnalytics);
  } catch (error) {
    next(error);
  }
};

// Get section analytics (super org admins/instructors or org admins/instructors)
const getSectionAnalytics = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId, orgId, startDate, endDate } = req.query;

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = {};
    if (!isSuperOrgAdminOrInstructor) {
      if (orgId && orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }
    if (testId) query.testId = testId;
    if (orgId) query.organizationId = orgId;
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    // Fetch test for section names
    let sectionNames = [];
    if (testId) {
      const test = await Test.findById(testId);
      if (test && test.settings.useSections) {
        sectionNames = test.sections.map((section, index) => ({ index, name: section.name }));
      }
    }

    // Aggregate section analytics
    const analyticsPipeline = [
      { $match: query },
      { $unwind: '$questions' },
      {
        $group: {
          _id: { testId: '$testId', sectionIndex: '$questions.sectionIndex' },
          totalQuestions: { $sum: 1 },
          averageScore: { $avg: '$questions.pointsAwarded' },
          successRate: { $avg: { $cond: ['$questions.isCorrect', 1, 0] } },
          averageTime: { $avg: '$questions.timeSpent' },
        },
      },
    ];

    const analytics = await Result.aggregate(analyticsPipeline);

    // Format response
    const formattedAnalytics = analytics.map(item => ({
      testId: item._id.testId,
      sectionIndex: item._id.sectionIndex,
      sectionName: sectionNames.find(s => s.index === item._id.sectionIndex)?.name || `Section ${item._id.sectionIndex + 1}`,
      totalQuestions: item.totalQuestions,
      averageScore: item.averageScore,
      successRate: item.successRate,
      averageTime: item.averageTime,
    }));

    res.json(formattedAnalytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResult,
  getAllResults,
  getResultAnalytics,
  getUserAnalytics,
  getSectionAnalytics,
};