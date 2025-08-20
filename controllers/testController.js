// /controllers/testController.js
const Test = require('../models/Test');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const createError = require('http-errors');

// Create a test (super org admins/instructors or org admins/instructors)
const createTest = async (req, res, next) => {
  try {
    const { user } = req; // From JWT middleware
    const { title, description, testType, languages, tags, settings, sections, questions, isGlobal } = req.body;
    const { orgId } = req.query;

    // Validate input
    if (!title || !description || !settings || !settings.timeLimit || !settings.attemptsAllowed) {
      throw createError(400, 'Title, description, and settings (timeLimit, attemptsAllowed) are required');
    }
    if (settings.useSections && (!sections || !Array.isArray(sections) || sections.length === 0)) {
      throw createError(400, 'Sections are required when useSections is true');
    }
    if (!settings.useSections && (!questions || !Array.isArray(questions) || questions.length === 0)) {
      throw createError(400, 'Questions are required when useSections is false');
    }

    // Validate new fields
    if (testType && !['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'].includes(testType)) {
      throw createError(400, 'Invalid test type');
    }
    if (languages && !Array.isArray(languages)) {
      throw createError(400, 'Languages must be an array');
    }
    if (tags && !Array.isArray(tags)) {
      throw createError(400, 'Tags must be an array');
    }

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (isGlobal && !isSuperOrgAdminOrInstructor) {
      throw createError(403, 'Only super org admins/instructors can create global tests');
    }
    if (orgId && !isSuperOrgAdminOrInstructor && user.organizationId.toString() !== orgId) {
      throw createError(403, 'Unauthorized to create tests for this organization');
    }

    // Set organizationId
    let organizationId = null;
    if (orgId) {
      const org = await Organization.findById(orgId);
      if (!org) {
        throw createError(404, 'Organization not found');
      }
      organizationId = org._id;
    }

    // Validate questions
    const questionIds = settings.useSections
      ? sections.flatMap(section => section.questions.map(q => q.questionId))
      : questions.map(q => q.questionId);
    const foundQuestions = await Question.find({ _id: { $in: questionIds } });
    if (foundQuestions.length !== questionIds.length) {
      throw createError(400, 'Some question IDs are invalid');
    }

    // Create test with new fields
    const test = new Test({
      title,
      description,
      testType: testType || 'custom',
      languages: languages || [],
      tags: tags || [],
      settings,
      sections: settings.useSections ? sections : undefined,
      questions: settings.useSections ? undefined : questions,
      organizationId,
      isGlobal: isGlobal || false,
      status: 'draft',
      createdBy: user.userId,
      stats: { totalAttempts: 0, averageScore: 0, passRate: 0 },
    });

    await test.save();

    res.status(201).json({
      id: test._id,
      title: test.title,
      description: test.description,
      testType: test.testType,
      languages: test.languages,
      tags: test.tags,
      settings: test.settings,
      sections: test.sections,
      questions: test.questions,
      organizationId: test.organizationId,
      isGlobal: test.isGlobal,
      status: test.status,
      createdBy: test.createdBy,
      createdAt: test.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// Get a test (super org admins/instructors, org admins/instructors, or students with access)
const getTest = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;

    const test = await Test.findById(testId).populate(
      test.settings.useSections
        ? 'sections.questions.questionId'
        : 'questions.questionId',
      'title description type language options testCases difficulty'
    );
    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate access
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor) {
      if (test.isGlobal) {
        // Students can access global tests
        if (user.role !== 'student') {
          throw createError(403, 'Only students can access global tests');
        }
      } else if (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access this test');
      }
    }

    // Hide sensitive data for students
    if (user.role === 'student') {
      if (test.sections) {
        test.sections.forEach(section => {
          section.questions.forEach(q => {
            if (q.questionId) {
              q.questionId.correctAnswer = undefined;
              q.questionId.testCases = undefined;
            }
          });
        });
      } else if (test.questions) {
        test.questions.forEach(q => {
          if (q.questionId) {
            q.questionId.correctAnswer = undefined;
            q.questionId.testCases = undefined;
          }
        });
      }
    }

    res.json({
      id: test._id,
      title: test.title,
      description: test.description,
      testType: test.testType,
      languages: test.languages,
      tags: test.tags,
      settings: test.settings,
      sections: test.sections,
      questions: test.questions,
      organizationId: test.organizationId,
      isGlobal: test.isGlobal,
      status: test.status,
      createdBy: test.createdBy,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// List tests (super org admins/instructors, org admins/instructors, or students)
const getAllTests = async (req, res, next) => {
  try {
    const { user } = req;
    const { orgId, isGlobal, testType, language, tag, limit = 10, skip = 0 } = req.query;

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = { status: 'active' }; // Only active tests
    
    if (isSuperOrgAdminOrInstructor) {
      // Super org admins/instructors access all tests
      if (orgId) query.organizationId = orgId;
      if (isGlobal !== undefined) query.isGlobal = isGlobal === 'true';
    } else {
      // Org admins/instructors/students access global or their org's tests
      if (orgId && orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access tests for this organization');
      }
      query.$or = [
        { isGlobal: true },
        { organizationId: user.organizationId },
      ];
    }

    // Add filtering by new fields
    if (testType) query.testType = testType;
    if (language) query.languages = language;
    if (tag) query.tags = tag;

    const tests = await Test.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('title description testType languages tags settings organizationId isGlobal status createdAt');

    res.json(tests);
  } catch (error) {
    next(error);
  }
};

// Update a test (super org admins/instructors or org admins/instructors)
const updateTest = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;
    const { title, description, testType, languages, tags, settings, sections, questions, status } = req.body;

    // Validate input
    if (!title && !description && !testType && !languages && !tags && !settings && !sections && !questions && !status) {
      throw createError(400, 'At least one field is required');
    }
    if (settings && (!settings.timeLimit || !settings.attemptsAllowed)) {
      throw createError(400, 'Settings must include timeLimit and attemptsAllowed');
    }
    if (settings?.useSections && sections && (!Array.isArray(sections) || sections.length === 0)) {
      throw createError(400, 'Sections are required when useSections is true');
    }
    if (settings?.useSections === false && questions && (!Array.isArray(questions) || questions.length === 0)) {
      throw createError(400, 'Questions are required when useSections is false');
    }
    if (status && !['draft', 'active', 'archived'].includes(status)) {
      throw createError(400, 'Invalid status');
    }

    // Validate new fields
    if (testType && !['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'].includes(testType)) {
      throw createError(400, 'Invalid test type');
    }
    if (languages && !Array.isArray(languages)) {
      throw createError(400, 'Languages must be an array');
    }
    if (tags && !Array.isArray(tags)) {
      throw createError(400, 'Tags must be an array');
    }

    const test = await Test.findById(testId);
    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor && (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString())) {
      throw createError(403, 'Unauthorized to update this test');
    }

    // Validate questions if provided
    if (sections || questions) {
      const questionIds = settings?.useSections || test.settings.useSections
        ? sections?.flatMap(section => section.questions.map(q => q.questionId)) || test.sections.flatMap(section => section.questions.map(q => q.questionId))
        : questions?.map(q => q.questionId) || test.questions.map(q => q.questionId);
      const foundQuestions = await Question.find({ _id: { $in: questionIds } });
      if (foundQuestions.length !== questionIds.length) {
        throw createError(400, 'Some question IDs are invalid');
      }
    }

    // Prepare update
    const updateData = { updatedAt: Date.now() };
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (testType) updateData.testType = testType;
    if (languages) updateData.languages = languages;
    if (tags) updateData.tags = tags;
    if (settings) updateData.settings = settings;
    if (sections) updateData.sections = settings?.useSections ? sections : undefined;
    if (questions) updateData.questions = settings?.useSections === false ? questions : undefined;
    if (status) updateData.status = status;

    const updatedTest = await Test.findByIdAndUpdate(
      testId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      id: updatedTest._id,
      title: updatedTest.title,
      description: updatedTest.description,
      testType: updatedTest.testType,
      languages: updatedTest.languages,
      tags: updatedTest.tags,
      settings: updatedTest.settings,
      sections: updatedTest.sections,
      questions: updatedTest.questions,
      organizationId: updatedTest.organizationId,
      isGlobal: updatedTest.isGlobal,
      status: updatedTest.status,
      createdBy: updatedTest.createdBy,
      updatedAt: updatedTest.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a test (super org admins/instructors or org admins/instructors)
const deleteTest = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor && (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString())) {
      throw createError(403, 'Unauthorized to delete this test');
    }

    await Test.deleteOne({ _id: testId });

    res.json({ message: 'Test deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTest,
  getTest,
  getAllTests,
  updateTest,
  deleteTest,
};