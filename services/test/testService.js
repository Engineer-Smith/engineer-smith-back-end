// /services/test/testService.js - Core test business logic
const Test = require('../../models/Test');
const Question = require('../../models/Question');
const Organization = require('../../models/Organization');
const createError = require('http-errors');
const { validateTestData, validateTestPermissions } = require('./testValidation');
const { formatTestResponse, formatTestWithQuestionsResponse } = require('./testFormatter');

class TestService {
  async createTest(testData, user, orgId = null) {
    // Validate input data
    await validateTestData(testData, 'create');
    
    // Validate permissions and determine organization settings
    const { organizationId, isGlobal } = await validateTestPermissions(user, orgId);
    
    // Validate that all questions exist
    await this._validateQuestionsExist(testData, user);
    
    const test = new Test({
      title: testData.title,
      description: testData.description,
      testType: testData.testType || 'custom',
      languages: testData.languages || [],
      tags: testData.tags || [],
      settings: testData.settings,
      sections: testData.settings.useSections ? testData.sections : undefined,
      questions: testData.settings.useSections ? undefined : testData.questions,
      organizationId,
      isGlobal,
      status: testData.status || 'draft',
      createdBy: user.userId,
      stats: { totalAttempts: 0, averageScore: 0, passRate: 0 },
    });

    await test.save();
    return formatTestResponse(test);
  }

  async getTest(testId, user) {
    const test = await Test.findById(testId)
      .populate('sections.questions.questionId', 'title description type language options testCases difficulty category codeConfig codeTemplate blanks buggyCode solutionCode')
      .populate('questions.questionId', 'title description type language options testCases difficulty category codeConfig codeTemplate blanks buggyCode solutionCode');

    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate access permissions
    await this._validateTestAccess(test, user);
    
    return formatTestResponse(test, user);
  }

  async getAllTests(filters, user) {
    const query = this._buildTestQuery(filters, user);
    
    const tests = await Test.find(query)
      .skip(parseInt(filters.skip) || 0)
      .limit(parseInt(filters.limit) || 10)
      .select('title description testType languages tags settings organizationId isGlobal status stats createdBy createdAt updatedAt')
      .sort({ createdAt: -1 });

    return tests.map(test => ({
      _id: test._id,
      title: test.title,
      description: test.description,
      testType: test.testType,
      languages: test.languages,
      tags: test.tags,
      settings: test.settings,
      organizationId: test.organizationId,
      isGlobal: test.isGlobal,
      status: test.status,
      stats: test.stats,
      createdBy: test.createdBy,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt
    }));
  }

  async updateTest(testId, updateData, user) {
    const test = await Test.findById(testId);
    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate permissions
    await this._validateTestUpdateAccess(test, user);
    
    // Validate update data
    await validateTestData({ ...test.toObject(), ...updateData }, 'update');
    
    // Validate questions if provided
    if (updateData.sections || updateData.questions) {
      await this._validateQuestionsExist({
        settings: updateData.settings || test.settings,
        sections: updateData.sections || test.sections,
        questions: updateData.questions || test.questions
      }, user);
    }

    // Build update object
    const finalUpdateData = { ...updateData, updatedAt: Date.now() };
    
    // Handle sections/questions based on useSections setting
    if (updateData.settings?.useSections !== undefined) {
      if (updateData.settings.useSections) {
        finalUpdateData.sections = updateData.sections || test.sections;
        finalUpdateData.$unset = { questions: 1 };
      } else {
        finalUpdateData.questions = updateData.questions || test.questions;
        finalUpdateData.$unset = { sections: 1 };
      }
    }

    const updatedTest = await Test.findByIdAndUpdate(testId, finalUpdateData, { new: true, runValidators: true });
    
    return formatTestResponse(updatedTest);
  }

  async deleteTest(testId, user) {
    const test = await Test.findById(testId);
    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate permissions
    await this._validateTestUpdateAccess(test, user);
    
    await Test.deleteOne({ _id: testId });
    return { message: 'Test deleted' };
  }

  async getTestWithQuestions(testId, user) {
    const test = await Test.findById(testId);
    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate access permissions (stricter for students)
    await this._validateTestWithQuestionsAccess(test, user);
    
    // Collect question IDs
    const questionIds = this._collectQuestionIds(test);
    
    // Fetch questions
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select('title description type language category options correctAnswer testCases codeConfig codeTemplate blanks buggyCode solutionCode difficulty tags createdAt updatedAt');

    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));
    
    return formatTestWithQuestionsResponse(test, questionMap, user);
  }

  // Private helper methods
  async _validateTestAccess(test, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    
    if (!isSuperOrgAdminOrInstructor) {
      if (test.isGlobal) {
        if (user.role !== 'student') {
          throw createError(403, 'Only students can access global tests');
        }
      } else if (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access this test');
      }
    }
  }

  async _validateTestUpdateAccess(test, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    
    if (!isSuperOrgAdminOrInstructor) {
      throw createError(403, 'Only admins/instructors can modify tests');
    }

    // Enhanced access control for global tests
    if (test.isGlobal) {
      const userOrganization = await Organization.findById(user.organizationId);
      if (!userOrganization || !userOrganization.isSuperOrg) {
        throw createError(403, 'Only superOrg users can modify global tests');
      }
    } else {
      if (!user.isSuperOrgAdmin && (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString())) {
        throw createError(403, 'Unauthorized to update this test');
      }
    }
  }

  async _validateTestWithQuestionsAccess(test, user) {
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    
    if (!isSuperOrgAdminOrInstructor) {
      if (test.isGlobal) {
        if (user.role !== 'student' || test.status !== 'active') {
          throw createError(403, 'Only students can access active global tests');
        }
      } else if (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access this test');
      } else if (user.role === 'student' && test.status !== 'active') {
        throw createError(403, 'Students can only access active tests');
      }
    }
  }

  async _validateQuestionsExist(testData, user) {
    const questionIds = testData.settings.useSections
      ? testData.sections.flatMap(section => section.questions.map(q => q.questionId))
      : testData.questions.map(q => q.questionId);
      
    const foundQuestions = await Question.find({ _id: { $in: questionIds } });
    if (foundQuestions.length !== questionIds.length) {
      throw createError(400, 'Some question IDs are invalid');
    }
  }

  _buildTestQuery(filters, user) {
    const { orgId, isGlobal, testType, language, tag, status } = filters;
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    
    let query = {};

    // Status filtering
    if (status && ['draft', 'active', 'archived'].includes(status)) {
      query.status = status;
    }

    // Students should only see active tests
    if (user.role === 'student') {
      query.status = 'active';
    }

    // Organization and global filtering
    if (isSuperOrgAdminOrInstructor) {
      if (orgId) query.organizationId = orgId;
      if (isGlobal !== undefined) query.isGlobal = isGlobal === 'true';
    } else {
      if (orgId && orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access tests for this organization');
      }
      query.$or = [
        { isGlobal: true },
        { organizationId: user.organizationId },
      ];
    }

    // Additional filters
    if (testType) query.testType = testType;
    if (language) query.languages = language;
    if (tag) query.tags = tag;

    return query;
  }

  _collectQuestionIds(test) {
    if (test.settings.useSections && test.sections) {
      return test.sections.flatMap(section => section.questions.map(q => q.questionId));
    } else if (test.questions) {
      return test.questions.map(q => q.questionId);
    }
    return [];
  }
}

module.exports = new TestService();