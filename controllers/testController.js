// /controllers/testController.js
const Test = require('../models/Test');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const createError = require('http-errors');

// Create a test (super org admins/instructors or org admins/instructors)
// Fixed createTest function in /controllers/testController.js

const createTest = async (req, res, next) => {
  try {
    const { user } = req; // From JWT middleware
    // ✅ FIXED: Added status to destructuring
    const { title, description, testType, languages, tags, settings, sections, questions, status } = req.body;
    const { orgId } = req.query;

    console.log('createTest: Received status from frontend:', status);

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

    // ✅ FIXED: Validate status if provided
    if (status && !['draft', 'active', 'archived'].includes(status)) {
      throw createError(400, 'Invalid status. Must be draft, active, or archived');
    }

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor) {
      throw createError(403, 'Only admins/instructors can create tests');
    }
    if (orgId && !user.isSuperOrgAdmin && user.organizationId.toString() !== orgId) {
      throw createError(403, 'Unauthorized to create tests for this organization');
    }

    // ✅ NEW LOGIC: Automatically determine isGlobal and organizationId based on user's org
    let organizationId = null;
    let isGlobal = false;

    // Fetch user's organization to check if it's a superOrg
    const userOrganization = await Organization.findById(user.organizationId);
    if (!userOrganization) {
      throw createError(404, 'User organization not found');
    }

    if (userOrganization.isSuperOrg) {
      // SuperOrg (EngineerSmith) creates global tests by default
      isGlobal = true;
      organizationId = null; // Global tests have null organizationId
    } else {
      // Regular organizations create org-specific tests
      isGlobal = false;
      organizationId = user.organizationId;
    }

    // If orgId is specified and user is superOrgAdmin, they can override the default behavior
    if (orgId && user.isSuperOrgAdmin) {
      const targetOrg = await Organization.findById(orgId);
      if (!targetOrg) {
        throw createError(404, 'Target organization not found');
      }

      if (targetOrg.isSuperOrg) {
        // Creating for superOrg = global test
        isGlobal = true;
        organizationId = null;
      } else {
        // Creating for regular org = org-specific test
        isGlobal = false;
        organizationId = targetOrg._id;
      }
    }

    // Validate questions
    const questionIds = settings.useSections
      ? sections.flatMap(section => section.questions.map(q => q.questionId))
      : questions.map(q => q.questionId);
    const foundQuestions = await Question.find({ _id: { $in: questionIds } });
    if (foundQuestions.length !== questionIds.length) {
      throw createError(400, 'Some question IDs are invalid');
    }

    // ✅ FIXED: Use status from request or default to 'draft'
    const testStatus = status || 'draft';
    console.log('createTest: Final status being saved:', testStatus);

    // Create test with automatically determined global/org settings
    const test = new Test({
      title,
      description,
      testType: testType || 'custom',
      languages: languages || [],
      tags: tags || [],
      settings,
      sections: settings.useSections ? sections : undefined,
      questions: settings.useSections ? undefined : questions,
      organizationId, // null for global, orgId for org-specific
      isGlobal, // true for superOrg, false for regular orgs
      status: testStatus, // ✅ FIXED: Use status from request
      createdBy: user.userId,
      stats: { totalAttempts: 0, averageScore: 0, passRate: 0 },
    });

    await test.save();

    console.log('createTest: Test saved with status:', test.status);

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
      status: test.status, // ✅ Return the actual status
      createdBy: test.createdBy,
      createdAt: test.createdAt,
    });
  } catch (error) {
    console.error('createTest: Error:', error);
    next(error);
  }
};

// Get a test (super org admins/instructors, org admins/instructors, or students with access)
const getTest = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;

    // ✅ ALTERNATIVE FIX: Populate both possible paths - Mongoose will ignore the ones that don't exist
    const test = await Test.findById(testId)
      .populate('sections.questions.questionId', 'title description type language options testCases difficulty')
      .populate('questions.questionId', 'title description type language options testCases difficulty');

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
    // ✅ Add 'status' to destructuring
    const { orgId, isGlobal, testType, language, tag, status, limit = 10, skip = 0 } = req.query;

    console.log('getAllTests: Query params:', { orgId, isGlobal, testType, language, tag, status, limit, skip });
    console.log('getAllTests: User role:', user.role);

    // Validate RBAC
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    // ✅ FIXED: Start with empty query - no hardcoded status filter
    let query = {};

    // ✅ FIXED: Only add status filter if specifically requested
    if (status && ['draft', 'active', 'archived'].includes(status)) {
      query.status = status;
      console.log('getAllTests: Filtering by status:', status);
    } else {
      console.log('getAllTests: No status filter - showing all statuses');
    }

    // ✅ IMPORTANT: Students should only see active tests (security requirement)
    if (user.role === 'student') {
      query.status = 'active';
      console.log('getAllTests: Student user - security filter applied (active only)');
    }

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

    // Add filtering by other fields
    if (testType) query.testType = testType;
    if (language) query.languages = language;
    if (tag) query.tags = tag;

    console.log('getAllTests: Final query:', JSON.stringify(query, null, 2));

    const tests = await Test.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('title description testType languages tags settings organizationId isGlobal status stats createdBy createdAt updatedAt')
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log('getAllTests: Found tests:', tests.length);
    console.log('getAllTests: Test statuses found:', [...new Set(tests.map(t => t.status))]);

    res.json(tests);
  } catch (error) {
    console.error('getAllTests: Error:', error);
    next(error);
  }
};

// Update a test (super org admins/instructors or org admins/instructors)
const updateTest = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;
    // ✅ REMOVED isGlobal from destructuring - cannot be changed after creation
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

    // Validate RBAC - users can only update tests they have access to
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor) {
      throw createError(403, 'Only admins/instructors can update tests');
    }

    // ✅ ENHANCED ACCESS CONTROL: Check if user can modify this specific test
    if (test.isGlobal) {
      // Global tests can only be modified by superOrg users
      const userOrganization = await Organization.findById(user.organizationId);
      if (!userOrganization || !userOrganization.isSuperOrg) {
        throw createError(403, 'Only superOrg users can modify global tests');
      }
    } else {
      // Org-specific tests can only be modified by users from that org (or superOrg admins)
      if (!user.isSuperOrgAdmin && (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString())) {
        throw createError(403, 'Unauthorized to update this test');
      }
    }

    // Validate questions if provided
    if (sections || questions) {
      const questionIds = settings?.useSections || test.settings.useSections
        ? (sections || test.sections).flatMap(section => section.questions.map(q => q.questionId))
        : (questions || test.questions).map(q => q.questionId);
      const foundQuestions = await Question.find({ _id: { $in: questionIds } });
      if (foundQuestions.length !== questionIds.length) {
        throw createError(400, 'Some question IDs are invalid');
      }
    }

    // Build update object (excluding isGlobal and organizationId - these cannot be changed)
    const updateData = { updatedAt: Date.now() };
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (testType) updateData.testType = testType;
    if (languages) updateData.languages = languages;
    if (tags) updateData.tags = tags;
    if (settings) updateData.settings = settings;
    if (sections) updateData.sections = sections;
    if (questions) updateData.questions = questions;
    if (status) updateData.status = status;

    // Update sections/questions based on useSections
    if (settings?.useSections !== undefined) {
      if (settings.useSections) {
        updateData.sections = sections || test.sections;
        updateData.$unset = { questions: 1 };
      } else {
        updateData.questions = questions || test.questions;
        updateData.$unset = { sections: 1 };
      }
    }

    const updatedTest = await Test.findByIdAndUpdate(testId, updateData, { new: true, runValidators: true });

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
      createdAt: updatedTest.createdAt,
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

const getTestWithQuestions = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;

    // First get the test with basic question refs
    const test = await Test.findById(testId);
    if (!test) {
      throw createError(404, 'Test not found');
    }

    // Validate access (same logic as getTest)
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    if (!isSuperOrgAdminOrInstructor) {
      if (test.isGlobal) {
        // Students can access global tests, but only if they're active
        if (user.role !== 'student' || test.status !== 'active') {
          throw createError(403, 'Only students can access active global tests');
        }
      } else if (!test.organizationId || test.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access this test');
      } else if (user.role === 'student' && test.status !== 'active') {
        throw createError(403, 'Students can only access active tests');
      }
    }

    // Collect all question IDs from test structure
    let questionIds = [];
    if (test.settings.useSections && test.sections) {
      questionIds = test.sections.flatMap(section =>
        section.questions.map(q => q.questionId)
      );
    } else if (test.questions) {
      questionIds = test.questions.map(q => q.questionId);
    }

    // Fetch all questions in one query
    const questions = await Question.find({
      _id: { $in: questionIds }
    }).select('title description type language options testCases difficulty createdAt updatedAt');

    // Create a map for quick lookup
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    // Build the response with populated questions
    let populatedTest = {
      id: test._id,
      title: test.title,
      description: test.description,
      testType: test.testType,
      languages: test.languages,
      tags: test.tags,
      settings: test.settings,
      organizationId: test.organizationId,
      isGlobal: test.isGlobal,
      status: test.status,
      createdBy: test.createdBy,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    };

    if (test.settings.useSections && test.sections) {
      // Populate questions in sections
      populatedTest.sections = test.sections.map(section => ({
        name: section.name,
        timeLimit: section.timeLimit,
        questions: section.questions.map(qRef => {
          const questionData = questionMap.get(qRef.questionId.toString());
          if (!questionData) {
            console.warn(`Question ${qRef.questionId} not found`);
            return null;
          }

          // Hide sensitive data for students
          if (user.role === 'student') {
            questionData.correctAnswer = undefined;
            questionData.testCases = undefined;
          }

          return {
            questionId: qRef.questionId,
            points: qRef.points,
            questionData: {
              id: questionData._id,
              title: questionData.title,
              description: questionData.description,
              type: questionData.type,
              language: questionData.language,
              options: questionData.options,
              difficulty: questionData.difficulty,
              // Only include testCases and correctAnswer for instructors/admins
              ...(user.role !== 'student' && {
                testCases: questionData.testCases,
                correctAnswer: questionData.correctAnswer
              })
            }
          };
        }).filter(q => q !== null) // Remove null entries for missing questions
      }));
    } else if (test.questions) {
      // Populate questions directly
      populatedTest.questions = test.questions.map(qRef => {
        const questionData = questionMap.get(qRef.questionId.toString());
        if (!questionData) {
          console.warn(`Question ${qRef.questionId} not found`);
          return null;
        }

        // Hide sensitive data for students
        if (user.role === 'student') {
          questionData.correctAnswer = undefined;
          questionData.testCases = undefined;
        }

        return {
          questionId: qRef.questionId,
          points: qRef.points,
          questionData: {
            id: questionData._id,
            title: questionData.title,
            description: questionData.description,
            type: questionData.type,
            language: questionData.language,
            options: questionData.options,
            difficulty: questionData.difficulty,
            // Only include testCases and correctAnswer for instructors/admins
            ...(user.role !== 'student' && {
              testCases: questionData.testCases,
              correctAnswer: questionData.correctAnswer
            })
          }
        };
      }).filter(q => q !== null); // Remove null entries for missing questions
    }

    res.json(populatedTest);
  } catch (error) {
    console.error('Error in getTestWithQuestions:', error);
    next(error);
  }
};

module.exports = {
  createTest,
  getTest,
  getAllTests,
  updateTest,
  deleteTest,
  getTestWithQuestions,
};