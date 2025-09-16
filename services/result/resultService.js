// /services/result/resultService.js - Updated for new flat Result schema
const Result = require('../../models/Result');
const createError = require('http-errors');
const { validateResultAccess } = require('./resultValidation');
const mongoose = require('mongoose')

class ResultService {
  async getResult(resultId, user) {
    const result = await Result.findById(resultId)
      .populate('userId', 'firstName lastName email')
      .populate('testId', 'title')
      .lean();

    if (!result) {
      throw createError(404, 'Result not found');
    }

    // Validate access permissions
    await validateResultAccess(result, user);

    // Filter sensitive data for students
    if (user.role === 'student') {
      result.questions = result.questions.map(q => this._filterSensitiveDataForStudent(q));
    }

    return result;
  }

  async getAllResults(filters, user) {
    const query = this._buildResultQuery(filters, user);

    const results = await Result.find(query)
      .skip(parseInt(filters.skip) || 0)
      .limit(parseInt(filters.limit) || 10)
      .populate({
        path: 'userId',
        select: 'loginId firstName lastName fullName email',
        model: 'User'
      })
      .populate({
        path: 'organizationId',
        select: 'name',
        model: 'Organization'
      })
      .populate({
        path: 'testId',
        select: 'title description',
        model: 'Test'
      })
      .select('sessionId testId userId organizationId attemptNumber status completedAt timeSpent score createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return results;
  }

  // UPDATED: Filter sensitive data from flat structure
  _filterSensitiveDataForStudent(question) {
    const filtered = { ...question };

    // Remove sensitive fields from main question object
    delete filtered.correctAnswer;

    // Filter details object if it exists
    if (filtered.details) {
      // Remove correct answers from fill-in-blank details
      if (filtered.details.blanks) {
        filtered.details.blanks = filtered.details.blanks.map(blank => ({
          id: blank.id,
          studentAnswer: blank.studentAnswer,
          isCorrect: blank.isCorrect,
          hint: blank.hint
          // correctAnswers removed
        }));
      }

      // Remove correct option from multiple choice
      if (filtered.details.correctOption !== undefined) {
        delete filtered.details.correctOption;
      }
    }

    return filtered;
  }

  async getResultAnalytics(filters, user) {
    const query = this._buildAnalyticsQuery(filters, user);

    const analyticsPipeline = this._buildResultAnalyticsPipeline(query, filters);
    const analytics = await Result.aggregate(analyticsPipeline);

    return this._formatAnalyticsResponse(analytics);
  }

  async getUserAnalytics(filters, user) {
    const query = this._buildUserAnalyticsQuery(filters, user);

    const analyticsPipeline = [
      { $match: query },
      {
        $group: {
          _id: { userId: '$userId', organizationId: '$organizationId' },
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$score.earnedPoints' },
          passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
          averageTime: { $avg: '$timeSpent' },
          totalTimeSpent: { $sum: '$timeSpent' },
          tests: {
            $push: {
              testId: '$testId',
              attemptNumber: '$attemptNumber',
              score: '$score.earnedPoints',
              totalPoints: '$score.totalPoints',
              percentage: '$score.percentage',
              passed: '$score.passed',
              timeSpent: '$timeSpent',
              completedAt: '$completedAt'
            }
          }
        }
      },
      {
        $project: {
          userId: '$_id.userId',
          organizationId: '$_id.organizationId',
          totalTests: 1,
          averageScore: { $round: ['$averageScore', 2] },
          passRate: { $round: [{ $multiply: ['$passRate', 100] }, 2] },
          averageTime: { $round: ['$averageTime'] },
          totalTimeSpent: 1,
          tests: 1,
          _id: 0
        }
      }
    ];

    const analytics = await Result.aggregate(analyticsPipeline);
    return analytics;
  }

  async getSectionAnalytics(filters, user) {
    const query = this._buildSectionAnalyticsQuery(filters, user);

    const analyticsPipeline = [
      { $match: query },
      { $unwind: '$questions' },
      {
        $group: {
          _id: {
            testId: '$testId',
            sectionIndex: '$questions.sectionIndex',
            sectionName: '$questions.sectionName'
          },
          totalQuestions: { $sum: 1 },
          averageScore: { $avg: '$questions.pointsEarned' }, // UPDATED: pointsEarned vs pointsAwarded
          successRate: { $avg: { $cond: ['$questions.isCorrect', 1, 0] } },
          averageTime: { $avg: '$questions.timeSpent' },
          totalAttempts: { $sum: 1 },
          correctAttempts: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } }
        }
      },
      {
        $project: {
          testId: '$_id.testId',
          sectionIndex: '$_id.sectionIndex',
          sectionName: '$_id.sectionName',
          totalQuestions: 1,
          averageScore: { $round: ['$averageScore', 2] },
          successRate: { $round: [{ $multiply: ['$successRate', 100] }, 2] },
          averageTime: { $round: ['$averageTime'] },
          totalAttempts: 1,
          correctAttempts: 1,
          _id: 0
        }
      },
      { $sort: { testId: 1, sectionIndex: 1 } }
    ];

    const analytics = await Result.aggregate(analyticsPipeline);
    return analytics;
  }

  async getQuestionAnalytics(filters, user) {
    try {

      const query = this._buildQuestionAnalyticsQuery(filters, user);


      const pipeline = [
        { $match: query },
        { $unwind: '$questions' },

        // FIXED: Convert questionId to ObjectId for proper matching
        ...(filters.questionId ? [{
          $match: {
            'questions.questionId': new mongoose.Types.ObjectId(filters.questionId)
          }
        }] : []),

        // Filter by question type and difficulty using flat structure
        ...(filters.questionType ? [{ $match: { 'questions.type': filters.questionType } }] : []),
        ...(filters.difficulty ? [{ $match: { 'questions.difficulty': filters.difficulty } }] : []),

        {
          $group: {
            _id: '$questions.questionId',
            questionTitle: { $first: '$questions.title' },
            questionType: { $first: '$questions.type' },
            language: { $first: '$questions.language' },
            category: { $first: '$questions.category' },
            difficulty: { $first: '$questions.difficulty' },
            totalAttempts: { $sum: 1 },
            correctAttempts: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } },
            averageTime: { $avg: '$questions.timeSpent' },
            averagePoints: { $avg: '$questions.pointsEarned' },
            successRate: { $avg: { $cond: ['$questions.isCorrect', 1, 0] } }
          }
        },

        {
          $project: {
            questionId: { $toString: '$_id' }, // Convert ObjectId back to string for frontend
            questionTitle: 1,
            questionType: 1,
            language: 1,
            category: 1,
            difficulty: 1,
            totalAttempts: 1,
            correctAttempts: 1,
            successRate: { $round: [{ $multiply: ['$successRate', 100] }, 2] },
            averageTime: { $round: ['$averageTime'] },
            averagePoints: { $round: ['$averagePoints', 2] },
            _id: 0
          }
        },

        { $sort: { totalAttempts: -1 } },
        { $skip: parseInt(filters.skip) || 0 },
        { $limit: parseInt(filters.limit) || 20 }
      ];

      const analytics = await Result.aggregate(pipeline);

      return analytics;
    } catch (error) {
      console.error('resultService.getQuestionAnalytics: Error:', error);
      throw error;
    }
  }

  // Helper methods remain mostly the same
  _buildQuestionAnalyticsQuery(filters, user) {
    const query = {
      status: 'completed' // Only completed results
    };

    // Organization filtering
    if (!user.isSuperOrgAdmin) {
      // Regular users see only their org's data
      query.organizationId = new mongoose.Types.ObjectId(user.organizationId);
    } else if (filters.orgId) {
      // Super admins can filter by specific org
      query.organizationId = new mongoose.Types.ObjectId(filters.orgId);
    }

    // Test filtering
    if (filters.testId) {
      query.testId = new mongoose.Types.ObjectId(filters.testId);
    }

    // Date filtering
    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) {
        query.completedAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.completedAt.$lte = new Date(filters.endDate);
      }
    }

    return query;
  }

  _buildAnalyticsQuery(filters, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = {};

    if (!isSuperOrgAdminOrInstructor) {
      if (filters.orgId && filters.orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }

    if (filters.testId) query.testId = filters.testId;
    if (filters.orgId) query.organizationId = filters.orgId;
    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) query.completedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.completedAt.$lte = new Date(filters.endDate);
    }

    return query;
  }

  _buildUserAnalyticsQuery(filters, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = { status: 'completed' };

    if (!isSuperOrgAdminOrInstructor) {
      if (filters.orgId && filters.orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }

    if (filters.userId) query.userId = filters.userId;
    if (filters.testId) query.testId = filters.testId;
    if (filters.orgId) query.organizationId = filters.orgId;
    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) query.completedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.completedAt.$lte = new Date(filters.endDate);
    }

    return query;
  }

  _buildSectionAnalyticsQuery(filters, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = { status: 'completed' };

    if (!isSuperOrgAdminOrInstructor) {
      if (filters.orgId && filters.orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }

    if (filters.testId) query.testId = filters.testId;
    if (filters.orgId) query.organizationId = filters.orgId;
    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) query.completedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.completedAt.$lte = new Date(filters.endDate);
    }

    return query;
  }


  _buildResultQuery(filters, user) {
    const { userId, testId, orgId } = filters;
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

    return query;
  }

  // _buildQuestionAnalyticsQuery(filters, user) {
  //   const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
  //   let query = { status: 'completed' };

  //   if (!isSuperOrgAdminOrInstructor) {
  //     if (user.role !== 'admin') {
  //       throw createError(403, 'Only admins or instructors can access question analytics');
  //     }
  //     if (filters.orgId && filters.orgId !== user.organizationId.toString()) {
  //       throw createError(403, 'Unauthorized to access analytics for this organization');
  //     }
  //     query.organizationId = user.organizationId;
  //   }

  //   if (filters.testId) query.testId = filters.testId;
  //   if (filters.orgId) query.organizationId = filters.orgId;
  //   if (filters.startDate || filters.endDate) {
  //     query.completedAt = {};
  //     if (filters.startDate) query.completedAt.$gte = new Date(filters.startDate);
  //     if (filters.endDate) query.completedAt.$lte = new Date(filters.endDate);
  //   }

  //   return query;
  // }

  // UPDATED: Analytics pipeline for flat structure
  _buildResultAnalyticsPipeline(query, filters) {
    const pipeline = [
      { $match: { ...query, status: 'completed' } }
    ];

    // Add question filtering if needed
    if (filters.questionType || filters.difficulty) {
      pipeline.push({ $unwind: '$questions' });

      if (filters.questionType) {
        pipeline.push({ $match: { 'questions.type': filters.questionType } });
      }
      if (filters.difficulty) {
        pipeline.push({ $match: { 'questions.difficulty': filters.difficulty } });
      }

      pipeline.push({
        $group: {
          _id: '$_id',
          testId: { $first: '$testId' },
          organizationId: { $first: '$organizationId' },
          score: { $first: '$score' },
          timeSpent: { $first: '$timeSpent' },
          questions: { $push: '$questions' }
        }
      });
    }

    pipeline.push({
      $group: {
        _id: { testId: '$testId', organizationId: '$organizationId' },
        totalResults: { $sum: 1 },
        averageScore: { $avg: '$score.earnedPoints' },
        passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
        averageTime: { $avg: '$timeSpent' }
      }
    });

    return pipeline;
  }

  _formatAnalyticsResponse(analytics) {
    return analytics.map(item => ({
      testId: item._id.testId,
      organizationId: item._id.organizationId,
      totalResults: item.totalResults,
      averageScore: Math.round(item.averageScore * 100) / 100,
      passRate: Math.round(item.passRate * 10000) / 100,
      averageTime: Math.round(item.averageTime)
    }));
  }
}

module.exports = new ResultService();