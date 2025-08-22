const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
const createError = require('http-errors');

const validQuestionTypes = ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'];
const validLanguages = [
  'javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json',
];
const validDifficulties = ['easy', 'medium', 'hard'];

// Define valid tags directly to avoid schema enumValues issues
const validTags = [
  'html', 'css', 'javascript', 'dom', 'events', 'async-programming', 'promises', 'async-await', 'es6', 'closures',
  'scope', 'hoisting', 'flexbox', 'grid', 'responsive-design', 'react', 'react-native', 'components', 'hooks',
  'state-management', 'props', 'context-api', 'redux', 'react-router', 'jsx', 'virtual-dom', 'native-components',
  'navigation', 'flutter', 'widgets', 'state-management-flutter', 'dart', 'navigation-flutter', 'ui-components',
  'express', 'nodejs', 'rest-api', 'middleware', 'routing', 'authentication', 'authorization', 'jwt', 'express-middleware',
  'sql', 'queries', 'joins', 'indexes', 'transactions', 'database-design', 'normalization', 'python', 'functions',
  'classes', 'modules', 'list-comprehensions', 'decorators', 'generators', 'python-data-structures', 'variables',
  'arrays', 'objects', 'loops', 'conditionals', 'algorithms', 'data-structures', 'error-handling', 'testing'
];

// Generate a simple request ID using timestamp and random suffix
const generateRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createQuestion = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    // ✅ REMOVED organizationId from destructuring - backend will determine it
    const { title, description, type, language, options, correctAnswer, testCases, difficulty, tags, isGlobal, status } = req.body;

    console.log(`createQuestion [${requestId}]: Received data:`, { title, description, type, language, options, correctAnswer, testCases, difficulty, tags, isGlobal, status });
    console.log(`createQuestion [${requestId}]: User:`, user);

    // Validate input
    if (!title || !description || !type || !language || !difficulty) {
      throw createError(400, 'Title, description, type, language, and difficulty are required');
    }
    if (!validQuestionTypes.includes(type)) {
      throw createError(400, `Invalid question type. Must be one of: ${validQuestionTypes.join(', ')}`);
    }
    if (!validLanguages.includes(language)) {
      throw createError(400, `Invalid language. Must be one of: ${validLanguages.join(', ')}`);
    }
    if (!validDifficulties.includes(difficulty)) {
      throw createError(400, `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
    }
    if (status && !['draft', 'active', 'archived'].includes(status)) {
      throw createError(400, 'Invalid status. Must be draft, active, or archived');
    }
    if (type === 'multipleChoice') {
      if (!options || !Array.isArray(options) || options.slice(1).length < 2) {
        throw createError(400, 'At least two answer options are required for multipleChoice questions');
      }
      if (correctAnswer === undefined || typeof correctAnswer !== 'number' || correctAnswer < 1 || correctAnswer > options.slice(1).length) {
        throw createError(400, 'Valid correct answer index is required for multipleChoice questions');
      }
    }
    if (type === 'trueFalse') {
      if (correctAnswer === undefined || typeof correctAnswer !== 'boolean') {
        throw createError(400, 'Correct answer must be a boolean for trueFalse questions');
      }
    }
    if ((type === 'codeChallenge' || type === 'codeDebugging') && (!testCases || !Array.isArray(testCases) || testCases.length === 0)) {
      throw createError(400, 'At least one test case is required for code questions');
    }
    if (options && !Array.isArray(options)) {
      throw createError(400, 'Options must be an array');
    }

    // Validate tags using our predefined list
    const validatedTags = tags && Array.isArray(tags) ? tags : [];
    if (validatedTags.length > 0 && validatedTags.some((tag) => !validTags.includes(tag))) {
      throw createError(400, `Invalid tags. Must be one of: ${validTags.join(', ')}`);
    }

    if (!user.userId) {
      throw createError(400, 'User ID is required');
    }

    // Validate user existence
    const userDoc = await User.findById(user.userId);
    if (!userDoc) {
      throw createError(400, 'Invalid createdBy user');
    }

    // ✅ FIXED: Always set organizationId, even for global questions
    const isSuperOrgAdmin = user.isSuperOrgAdmin || (user.organization?.isSuperOrg && user.role === 'admin');
    let finalOrganizationId = user.organizationId; // ✅ ALWAYS use user's organizationId
    let finalIsGlobal = false;

    console.log(`createQuestion [${requestId}]: isSuperOrgAdmin:`, isSuperOrgAdmin);
    console.log(`createQuestion [${requestId}]: user.organizationId:`, user.organizationId);

    if (isSuperOrgAdmin) {
      // Super admins can create global questions, but they still belong to the super org
      finalIsGlobal = isGlobal || false;
      finalOrganizationId = user.organizationId; // ✅ Global questions belong to super org
      console.log(`createQuestion [${requestId}]: Super admin creating ${finalIsGlobal ? 'GLOBAL' : 'ORG-SPECIFIC'} question for super org:`, finalOrganizationId);
    } else if (user.role === 'admin' || user.role === 'instructor') {
      // Regular org admins/instructors can only create for their own organization
      if (isGlobal) {
        throw createError(403, 'Only super organization admins can create global questions');
      }
      finalOrganizationId = user.organizationId;
      finalIsGlobal = false;
      console.log(`createQuestion [${requestId}]: Regular admin creating ORG-SPECIFIC question for org:`, finalOrganizationId);
    } else {
      throw createError(403, 'Insufficient permissions to create questions');
    }

    // ✅ ALWAYS validate that organizationId exists
    if (!finalOrganizationId) {
      throw createError(400, 'User must belong to an organization to create questions');
    }

    const org = await Organization.findById(finalOrganizationId);
    if (!org) {
      throw createError(400, 'Invalid organization');
    }

    console.log(`createQuestion [${requestId}]: Final values - organizationId:`, finalOrganizationId, 'isGlobal:', finalIsGlobal);
    console.log(`createQuestion [${requestId}]: Organization details:`, { name: org.name, isSuperOrg: org.isSuperOrg });

    // Create question with BOTH organizationId AND isGlobal set
    const question = new Question({
      title,
      description,
      type,
      language,
      organizationId: finalOrganizationId, // ✅ Always set - super org ID for global questions
      isGlobal: finalIsGlobal, // ✅ true for global questions, false for org-specific
      options: type === 'multipleChoice' || type === 'codeDebugging' ? options :
        type === 'trueFalse' ? ['true', 'false'] : undefined,
      correctAnswer: type === 'multipleChoice' || type === 'trueFalse' ? correctAnswer : undefined,
      testCases: type === 'codeChallenge' || type === 'codeDebugging' ? testCases : undefined,
      difficulty,
      status: status || 'draft',
      createdBy: user.userId,
      tags: validatedTags,
      usageStats: { timesUsed: 0, totalAttempts: 0, correctAttempts: 0, successRate: 0, averageTime: 0 },
    });

    await question.save();

    console.log(`createQuestion [${requestId}]: Question saved with ID:`, question._id);
    console.log(`createQuestion [${requestId}]: Question organizationId:`, question.organizationId);
    console.log(`createQuestion [${requestId}]: Question isGlobal:`, question.isGlobal);

    // Return question data directly
    res.status(201).json({
      id: question._id,
      title: question.title,
      description: question.description,
      type: question.type,
      language: question.language,
      organizationId: question.organizationId,
      isGlobal: question.isGlobal,
      options: question.options,
      correctAnswer: question.correctAnswer,
      testCases: question.testCases,
      difficulty: question.difficulty,
      status: question.status,
      createdBy: question.createdBy,
      tags: question.tags,
      createdAt: question.createdAt,
    });
  } catch (error) {
    console.error(`createQuestion [${requestId}]: Error:`, error);
    next(error);
  }
};

const getQuestion = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const { questionId } = req.params;

    console.log(`getQuestion [${requestId}]: User:`, user);
    console.log(`getQuestion [${requestId}]: Question ID:`, questionId);

    const question = await Question.findById(questionId);
    if (!question) {
      throw createError(404, 'Question not found');
    }

    // ✅ CONSISTENT: Support for site-wide instructors
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    // ✅ UPDATED: Access control logic for new organizationId approach
    if (!isSuperOrgAdminOrInstructor) {
      if (question.isGlobal) {
        // Global questions are accessible to all users (students, admins)
        // No additional check needed since global questions are meant to be accessible
      } else {
        // Non-global questions: only accessible to users from the same organization
        if (!question.organizationId || question.organizationId.toString() !== user.organizationId.toString()) {
          throw createError(403, 'Unauthorized to access this question');
        }
      }
    }
    // Super org admins and site-wide instructors can access any question

    console.log(`getQuestion [${requestId}]: Access granted for question:`, {
      isGlobal: question.isGlobal,
      questionOrgId: question.organizationId,
      userOrgId: user.organizationId,
      isSuperOrgAdminOrInstructor
    });

    // Return question data directly
    res.json({
      id: question._id,
      title: question.title,
      description: question.description,
      type: question.type,
      language: question.language,
      organizationId: question.organizationId,
      isGlobal: question.isGlobal,
      options: question.options,
      correctAnswer: user.role === 'student' ? undefined : question.correctAnswer,
      testCases: user.role === 'student' ? undefined : question.testCases,
      difficulty: question.difficulty,
      status: question.status,
      createdBy: question.createdBy,
      tags: question.tags,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    });
  } catch (error) {
    console.error(`getQuestion [${requestId}]: Error:`, error);
    next(error);
  }
};

const getAllQuestions = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const { organizationId, isGlobal, limit = 10, skip = 0, language, difficulty, type, includeTotalCount = false } = req.query;

    console.log(`getAllQuestions [${requestId}]: User:`, user);
    console.log(`getAllQuestions [${requestId}]: Query params:`, { organizationId, isGlobal, limit, skip, language, difficulty, type, includeTotalCount });

    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let query = { status: 'active' };

    if (isSuperOrgAdminOrInstructor) {
      if (organizationId) {
        query.organizationId = organizationId;
      }
      if (isGlobal !== undefined) {
        query.isGlobal = isGlobal === 'true';
      }
      if (language) {
        const languages = language.split(',').map(l => l.trim());
        query.language = { $in: languages };
      }

      // And for tags:
      if (req.query.tag) {
        const tags = req.query.tag.split(',').map(t => t.trim());
        query.tags = { $in: tags };
      }
      if (difficulty) query.difficulty = difficulty;
      if (type) query.type = type;

      console.log(`getAllQuestions [${requestId}]: Super admin/instructor query:`, query);
    } else {
      if (organizationId && organizationId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access questions for this organization');
      }

      query.$or = [
        { isGlobal: true },
        { organizationId: user.organizationId, isGlobal: false },
      ];

      if (language) {
        const languages = language.split(',').map(l => l.trim());
        query.language = { $in: languages };
      }

      // ✅ FIX: Add tag support for regular users
      if (req.query.tag) {
        const tags = req.query.tag.split(',').map(t => t.trim());
        query.tags = { $in: tags };
      }
      if (difficulty) query.difficulty = difficulty;
      if (type) query.type = type;

      console.log(`getAllQuestions [${requestId}]: Regular user query:`, query);
    }

    // Get total count if requested (for pagination)
    let totalCount = null;
    if (includeTotalCount === 'true') {
      totalCount = await Question.countDocuments(query);
      console.log(`getAllQuestions [${requestId}]: Total count:`, totalCount);
    }

    const questions = await Question.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('title description type language organizationId isGlobal difficulty status tags createdAt')
      .lean();

    console.log(`getAllQuestions [${requestId}]: Found ${questions.length} questions`);

    const response = {
      questions: questions.map(q => ({
        id: q._id,
        title: q.title,
        description: q.description,
        type: q.type,
        language: q.language,
        organizationId: q.organizationId,
        isGlobal: q.isGlobal,
        difficulty: q.difficulty,
        status: q.status,
        tags: q.tags,
        createdAt: q.createdAt,
      })),
      ...(totalCount !== null && { totalCount, totalPages: Math.ceil(totalCount / parseInt(limit)) })
    };

    // For backward compatibility, if includeTotalCount is not requested, return just the array
    res.json(includeTotalCount === 'true' ? response : response.questions);
  } catch (error) {
    console.error(`getAllQuestions [${requestId}]: Error:`, error);
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const { questionId } = req.params;
    const { title, description, type, language, options, correctAnswer, testCases, difficulty, status, tags } = req.body;

    console.log(`updateQuestion [${requestId}]: Received data:`, { title, description, type, language, options, correctAnswer, testCases, difficulty, status, tags });
    console.log(`updateQuestion [${requestId}]: User:`, user);

    if (!title && !description && !type && !language && !options && correctAnswer === undefined && !testCases && !difficulty && !status && !tags) {
      throw createError(400, 'At least one field is required');
    }
    if (type && !validQuestionTypes.includes(type)) {
      throw createError(400, `Invalid type. Must be one of: ${validQuestionTypes.join(', ')}`);
    }
    if (language && !validLanguages.includes(language)) {
      throw createError(400, `Invalid language. Must be one of: ${validLanguages.join(', ')}`);
    }
    if (difficulty && !validDifficulties.includes(difficulty)) {
      throw createError(400, `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
    }
    if (status && !['draft', 'active', 'archived'].includes(status)) {
      throw createError(400, 'Invalid status');
    }

    const question = await Question.findById(questionId);
    if (!question) {
      throw createError(404, 'Question not found');
    }

    // ✅ CONSISTENT: Support for site-wide instructors
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    const isSuperOrgAdmin = user.isSuperOrgAdmin || (user.organization?.isSuperOrg && user.role === 'admin');

    if (!isSuperOrgAdminOrInstructor) {
      // Non-super admins/instructors can only update questions from their own organization
      if (!question.organizationId || question.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to update this question');
      }

      // Regular users cannot edit global questions (even if from their org)
      if (question.isGlobal && !isSuperOrgAdmin) {
        throw createError(403, 'Only super organization admins can update global questions');
      }
    }

    // Validate type-specific requirements
    const questionType = type || question.type;
    if (questionType === 'multipleChoice' && options && (!Array.isArray(options) || options.slice(1).length < 2)) {
      throw createError(400, 'At least two answer options are required for multipleChoice questions');
    }
    if (questionType === 'trueFalse' && correctAnswer !== undefined && typeof correctAnswer !== 'boolean') {
      throw createError(400, 'Correct answer must be a boolean for trueFalse questions');
    }
    if (questionType === 'multipleChoice' && correctAnswer !== undefined && (typeof correctAnswer !== 'number' || correctAnswer < 1 || correctAnswer > (options ? options.slice(1).length : question.options.slice(1).length))) {
      throw createError(400, 'Valid correct answer index is required for multipleChoice questions');
    }
    if ((questionType === 'codeChallenge' || questionType === 'codeDebugging') && testCases && (!Array.isArray(testCases) || testCases.length === 0)) {
      throw createError(400, 'At least one test case is required for code questions');
    }

    // Validate tags using our predefined list
    const validatedTags = tags && Array.isArray(tags) ? tags : question.tags;
    if (validatedTags.length > 0 && validatedTags.some((tag) => !validTags.includes(tag))) {
      throw createError(400, `Invalid tags. Must be one of: ${validTags.join(', ')}`);
    }

    const updateData = { updatedAt: Date.now() };
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (language) updateData.language = language;
    if (options !== undefined) {
      updateData.options = questionType === 'multipleChoice' || questionType === 'codeDebugging' ? options :
        questionType === 'trueFalse' ? ['true', 'false'] : undefined;
    }
    if (correctAnswer !== undefined) {
      updateData.correctAnswer = questionType === 'multipleChoice' || questionType === 'trueFalse' ? correctAnswer : undefined;
    }
    if (testCases) {
      updateData.testCases = questionType === 'codeChallenge' || questionType === 'codeDebugging' ? testCases : undefined;
    }
    if (difficulty) updateData.difficulty = difficulty;
    if (status) updateData.status = status;
    if (tags !== undefined) updateData.tags = validatedTags;

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log(`updateQuestion [${requestId}]: Question updated with ID:`, updatedQuestion._id);

    // Return updated question data directly
    res.json({
      id: updatedQuestion._id,
      title: updatedQuestion.title,
      description: updatedQuestion.description,
      type: updatedQuestion.type,
      language: updatedQuestion.language,
      organizationId: updatedQuestion.organizationId,
      isGlobal: updatedQuestion.isGlobal,
      options: updatedQuestion.options,
      correctAnswer: user.role === 'student' ? undefined : updatedQuestion.correctAnswer,
      testCases: user.role === 'student' ? undefined : updatedQuestion.testCases,
      difficulty: updatedQuestion.difficulty,
      status: updatedQuestion.status,
      createdBy: updatedQuestion.createdBy,
      tags: updatedQuestion.tags,
      updatedAt: updatedQuestion.updatedAt,
    });
  } catch (error) {
    console.error(`updateQuestion [${requestId}]: Error:`, error);
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const { questionId } = req.params;

    console.log(`deleteQuestion [${requestId}]: User:`, user);
    console.log(`deleteQuestion [${requestId}]: Question ID:`, questionId);

    const question = await Question.findById(questionId);
    if (!question) {
      throw createError(404, 'Question not found');
    }

    // ✅ CONSISTENT: Support for site-wide instructors
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    const isSuperOrgAdmin = user.isSuperOrgAdmin || (user.organization?.isSuperOrg && user.role === 'admin');

    if (!isSuperOrgAdminOrInstructor) {
      // Non-super admins/instructors can only delete questions from their own organization
      if (!question.organizationId || question.organizationId.toString() !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to delete this question');
      }

      // Regular users cannot delete global questions (even if from their org)
      if (question.isGlobal && !isSuperOrgAdmin) {
        throw createError(403, 'Only super organization admins can delete global questions');
      }
    }

    await Question.deleteOne({ _id: questionId });

    console.log(`deleteQuestion [${requestId}]: Question deleted`);

    // Return simple success message
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(`deleteQuestion [${requestId}]: Error:`, error);
    next(error);
  }
};


const getQuestionStats = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;

    console.log(`getQuestionStats [${requestId}]: User:`, user);

    // ✅ CONSISTENT: Site-wide instructors get broader access
    const isSuperOrgAdminOrInstructor = user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    let matchQuery = { status: 'active' };

    if (isSuperOrgAdminOrInstructor) {
      // Super org admins and site-wide instructors can see all questions
      // No additional filtering needed
    } else {
      // Regular users (students, regular org admins) can access:
      // 1. Global questions (isGlobal: true) from ANY organization (super orgs)
      // 2. Their own organization's questions (isGlobal: false)
      matchQuery.$or = [
        { isGlobal: true }, // ✅ Global questions (regardless of which super org created them)
        { organizationId: user.organizationId, isGlobal: false }, // ✅ Own org's questions
      ];
    }

    console.log(`getQuestionStats [${requestId}]: Match query:`, matchQuery);

    // Aggregate questions by language
    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          difficulties: {
            $push: '$difficulty'
          }
        }
      },
      {
        $project: {
          language: '$_id',
          count: 1,
          difficultyBreakdown: {
            easy: {
              $size: {
                $filter: {
                  input: '$difficulties',
                  cond: { $eq: ['$$this', 'easy'] }
                }
              }
            },
            medium: {
              $size: {
                $filter: {
                  input: '$difficulties',
                  cond: { $eq: ['$$this', 'medium'] }
                }
              }
            },
            hard: {
              $size: {
                $filter: {
                  input: '$difficulties',
                  cond: { $eq: ['$$this', 'hard'] }
                }
              }
            }
          },
          _id: 0
        }
      },
      { $sort: { language: 1 } }
    ];

    const stats = await Question.aggregate(pipeline);

    console.log(`getQuestionStats [${requestId}]: Found stats for ${stats.length} languages`);

    // Also get total counts
    const totalStats = await Question.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          totalByDifficulty: {
            $push: '$difficulty'
          },
          totalByType: {
            $push: '$type'
          }
        }
      },
      {
        $project: {
          totalQuestions: 1,
          difficultyBreakdown: {
            easy: {
              $size: {
                $filter: {
                  input: '$totalByDifficulty',
                  cond: { $eq: ['$$this', 'easy'] }
                }
              }
            },
            medium: {
              $size: {
                $filter: {
                  input: '$totalByDifficulty',
                  cond: { $eq: ['$$this', 'medium'] }
                }
              }
            },
            hard: {
              $size: {
                $filter: {
                  input: '$totalByDifficulty',
                  cond: { $eq: ['$$this', 'hard'] }
                }
              }
            }
          },
          typeBreakdown: {
            multipleChoice: {
              $size: {
                $filter: {
                  input: '$totalByType',
                  cond: { $eq: ['$$this', 'multipleChoice'] }
                }
              }
            },
            trueFalse: {
              $size: {
                $filter: {
                  input: '$totalByType',
                  cond: { $eq: ['$$this', 'trueFalse'] }
                }
              }
            },
            codeChallenge: {
              $size: {
                $filter: {
                  input: '$totalByType',
                  cond: { $eq: ['$$this', 'codeChallenge'] }
                }
              }
            },
            codeDebugging: {
              $size: {
                $filter: {
                  input: '$totalByType',
                  cond: { $eq: ['$$this', 'codeDebugging'] }
                }
              }
            }
          },
          _id: 0
        }
      }
    ]);

    const result = {
      byLanguage: stats,
      totals: totalStats[0] || {
        totalQuestions: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        typeBreakdown: { multipleChoice: 0, trueFalse: 0, codeChallenge: 0, codeDebugging: 0 }
      }
    };

    console.log(`getQuestionStats [${requestId}]: Returning stats:`, result);

    res.json(result);
  } catch (error) {
    console.error(`getQuestionStats [${requestId}]: Error:`, error);
    next(error);
  }
};

module.exports = {
  createQuestion,
  getQuestion,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionStats
};