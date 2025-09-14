// /services/question/questionService.js - Updated to include all fields
const Question = require('../../models/Question');
const Organization = require('../../models/Organization');
const User = require('../../models/User');
const createError = require('http-errors');
const { validateQuestionData, validateQuestionPermissions } = require('./questionValidation');
const { formatQuestionResponse } = require('./questionFormatter');

class QuestionService {
  async createQuestion(questionData, user) {
    // Validate input data
    await validateQuestionData(questionData, 'create');

    // Check permissions and determine organization/global settings
    const { organizationId, isGlobal } = await validateQuestionPermissions(user, questionData.isGlobal);

    // Create question with validated data
    const question = new Question({
      ...questionData,
      organizationId,
      isGlobal,
      status: questionData.status || 'draft',
      createdBy: user.userId,
      usageStats: { timesUsed: 0, totalAttempts: 0, correctAttempts: 0, successRate: 0, averageTime: 0 }
    });

    await question.save();
    return formatQuestionResponse(question, user);
  }

  async getQuestion(questionId, user) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw createError(404, 'Question not found');
    }

    // Check access permissions
    await this._validateQuestionAccess(question, user);

    return formatQuestionResponse(question, user);
  }

  async getAllQuestions(filters, user) {
    const query = this._buildQuery(filters, user);

    let totalCount = null;
    if (filters.includeTotalCount === 'true') {
      totalCount = await Question.countDocuments(query);
    }

    // UPDATED: Remove the .select() to include ALL fields
    const questions = await Question.find(query)
      .skip(parseInt(filters.skip) || 0)
      .limit(parseInt(filters.limit) || 10)
      .lean(); // Removed the .select() - now gets all fields

    // UPDATED: Use formatQuestionResponse for each question to ensure proper formatting
    const formattedQuestions = questions.map(question => 
      formatQuestionResponse(question, user)
    );

    const result = {
      questions: formattedQuestions,
      pagination: {
        skip: parseInt(filters.skip) || 0,
        limit: parseInt(filters.limit) || 10,
        total: formattedQuestions.length
      }
    };

    if (totalCount !== null) {
      result.pagination.totalCount = totalCount;
    }

    return result;
  }

  async updateQuestion(questionId, updateData, user) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw createError(404, 'Question not found');
    }

    // Validate permissions
    await this._validateQuestionUpdateAccess(question, user);

    // Validate update data
    await validateQuestionData(updateData, 'update');

    console.log('=== UPDATE DEBUG START ===');
    console.log('Original question codeTemplate length:', question.codeTemplate?.length || 0);
    console.log('Update data codeTemplate length:', updateData.codeTemplate?.length || 0);

    // Remove undefined fields from updateData to avoid overwriting with undefined
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    console.log('Filtered update data keys:', Object.keys(filteredUpdateData));

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: filteredUpdateData },
      { new: true, runValidators: true }
    );

    console.log('Updated question codeTemplate length:', updatedQuestion.codeTemplate?.length || 0);
    console.log('=== UPDATE DEBUG END ===');

    return formatQuestionResponse(updatedQuestion, user);
  }

  async deleteQuestion(questionId, user) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw createError(404, 'Question not found');
    }

    // Validate permissions
    await this._validateQuestionUpdateAccess(question, user);

    await Question.deleteOne({ _id: questionId });
    return { message: 'Question deleted successfully' };
  }

  async getQuestionStats(user) {
    const matchQuery = this._buildStatsQuery(user);

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          difficulties: { $push: '$difficulty' },
          types: { $push: '$type' },
          categories: { $push: '$category' }
        }
      },
      {
        $project: {
          language: '$_id',
          count: 1,
          difficultyBreakdown: {
            easy: { $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'easy'] } } } },
            medium: { $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'medium'] } } } },
            hard: { $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'hard'] } } } }
          },
          typeBreakdown: {
            multipleChoice: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'multipleChoice'] } } } },
            trueFalse: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'trueFalse'] } } } },
            codeChallenge: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'codeChallenge'] } } } },
            fillInTheBlank: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'fillInTheBlank'] } } } },
            codeDebugging: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'codeDebugging'] } } } }
          },
          categoryBreakdown: {
            logic: { $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'logic'] } } } },
            ui: { $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'ui'] } } } },
            syntax: { $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'syntax'] } } } }
          },
          _id: 0
        }
      },
      { $sort: { language: 1 } }
    ];

    const stats = await Question.aggregate(pipeline);
    const totalStats = await this._getTotalStats(matchQuery);

    return {
      byLanguage: stats,
      totals: totalStats
    };
  }

  // Private helper methods
  async _validateQuestionAccess(question, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    if (!isSuperOrgAdminOrInstructor) {
      if (!question.isGlobal) {
        if (!question.organizationId || question.organizationId.toString() !== user.organizationId.toString()) {
          throw createError(403, 'Unauthorized to access this question');
        }
      }
    }
  }

  async _validateQuestionUpdateAccess(question, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    const isSuperOrgAdmin = user.isSuperOrgAdmin || (user.organization?.isSuperOrg && user.role === 'admin');

    if (!isSuperOrgAdminOrInstructor) {
      if (!question.organizationId || question.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to update this question');
      }
      if (question.isGlobal && !isSuperOrgAdmin) {
        throw createError(403, 'Only super organization admins can update global questions');
      }
    }
  }

  _buildQuery(filters, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    let query = {};

    // Base visibility rules
    if (isSuperOrgAdminOrInstructor) {
      // Super org admins and instructors can see all questions
      if (filters.organizationId) {
        query.$or = [
          { organizationId: filters.organizationId },
          { isGlobal: true }
        ];
      } else {
        // No organization filter - show all questions they have access to
        if (user.organizationId) {
          query.$or = [
            { organizationId: user.organizationId },
            { isGlobal: true }
          ];
        } else {
          // Super org admin without specific org filter
          query = {}; // Can see everything
        }
      }
    } else {
      // Regular users can only see global questions or their org's questions
      query.$or = [
        { isGlobal: true }
      ];
      
      if (user.organizationId) {
        query.$or.push({ organizationId: user.organizationId });
      }
    }

    // Apply additional filters
    if (filters.isGlobal !== undefined) {
      query.isGlobal = filters.isGlobal === 'true';
    }
    if (filters.language) {
      query.language = filters.language;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.tag) {
      query.tags = { $in: [filters.tag] };
    }
    if (filters.status) {
      query.status = filters.status;
    }

    return query;
  }

  _buildStatsQuery(user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    let query = {};

    if (isSuperOrgAdminOrInstructor) {
      if (user.organizationId) {
        query.$or = [
          { organizationId: user.organizationId },
          { isGlobal: true }
        ];
      }
    } else {
      query.$or = [
        { isGlobal: true }
      ];
      
      if (user.organizationId) {
        query.$or.push({ organizationId: user.organizationId });
      }
    }

    return query;
  }

  async _getTotalStats(matchQuery) {
    const totalStats = await Question.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          difficulties: { $push: '$difficulty' },
          types: { $push: '$type' },
          categories: { $push: '$category' }
        }
      },
      {
        $project: {
          totalQuestions: 1,
          difficultyBreakdown: {
            easy: { $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'easy'] } } } },
            medium: { $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'medium'] } } } },
            hard: { $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'hard'] } } } }
          },
          typeBreakdown: {
            multipleChoice: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'multipleChoice'] } } } },
            trueFalse: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'trueFalse'] } } } },
            codeChallenge: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'codeChallenge'] } } } },
            fillInTheBlank: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'fillInTheBlank'] } } } },
            codeDebugging: { $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'codeDebugging'] } } } }
          },
          categoryBreakdown: {
            logic: { $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'logic'] } } } },
            ui: { $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'ui'] } } } },
            syntax: { $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'syntax'] } } } }
          },
          _id: 0
        }
      }
    ]);

    return totalStats[0] || {
      totalQuestions: 0,
      difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
      typeBreakdown: { multipleChoice: 0, trueFalse: 0, codeChallenge: 0, fillInTheBlank: 0, codeDebugging: 0 },
      categoryBreakdown: { logic: 0, ui: 0, syntax: 0 }
    };
  }
}

module.exports = new QuestionService();