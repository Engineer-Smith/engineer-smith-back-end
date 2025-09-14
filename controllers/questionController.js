// /controllers/questionController.js - UPDATED with duplicate detection and fixed testQuestion
const questionService = require('../services/question/questionService');
const questionTestingService = require('../services/question/questionTestingService');
const questionDuplicateService = require('../services/question/questionDuplicateService');
const createError = require('http-errors');

const generateRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createQuestion = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const questionData = req.body;

    console.log(`createQuestion [${requestId}]: Creating ${questionData.type} question with category: ${questionData.category}`);

    const result = await questionService.createQuestion(questionData, user);

    console.log(`createQuestion [${requestId}]: Question saved with _id:`, result._id);

    res.status(201).json(result);
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

    const result = await questionService.getQuestion(questionId, user);

    res.json(result);
  } catch (error) {
    console.error(`getQuestion [${requestId}]: Error:`, error);
    next(error);
  }
};

const getAllQuestions = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const filters = {
      organizationId: req.query.organizationId,
      isGlobal: req.query.isGlobal,
      limit: req.query.limit || 10,
      skip: req.query.skip || 0,
      language: req.query.language,
      category: req.query.category,
      difficulty: req.query.difficulty,
      type: req.query.type,
      tag: req.query.tag,
      status: req.query.status, // ADD THIS LINE
      includeTotalCount: req.query.includeTotalCount
    };

    console.log(`getAllQuestions [${requestId}]: Processing with filters:`, filters);

    const result = await questionService.getAllQuestions(filters, user);

    res.json(result);
  } catch (error) {
    console.error(`getAllQuestions [${requestId}]: Error:`, error);
    next(error);
  }
};

// NEW: Check for duplicate questions
const checkDuplicates = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const searchParams = {
      title: req.query.title,
      description: req.query.description,
      type: req.query.type,
      language: req.query.language,
      category: req.query.category,
      entryFunction: req.query.entryFunction,
      codeTemplate: req.query.codeTemplate
    };

    console.log(`checkDuplicates [${requestId}]: Checking for duplicates:`, {
      type: searchParams.type,
      language: searchParams.language,
      titleLength: searchParams.title?.length || 0,
      descriptionLength: searchParams.description?.length || 0
    });

    // Validate required parameters
    questionDuplicateService.validateSearchParams(searchParams);

    const duplicates = await questionDuplicateService.findSimilarQuestions(searchParams, user);

    console.log(`checkDuplicates [${requestId}]: Found ${duplicates.length} potential duplicates`);

    res.json({
      found: duplicates.length > 0,
      count: duplicates.length,
      duplicates: duplicates,
      searchParams: {
        type: searchParams.type,
        language: searchParams.language,
        category: searchParams.category
      }
    });
  } catch (error) {
    console.error(`checkDuplicates [${requestId}]: Error:`, error);
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const { questionId } = req.params;
    const updateData = req.body;

    // Check if at least one field is provided
    const hasUpdates = Object.values(updateData).some(value => value !== undefined);
    if (!hasUpdates) {
      throw createError(400, 'At least one field is required for update');
    }

    const result = await questionService.updateQuestion(questionId, updateData, user);

    console.log(`updateQuestion [${requestId}]: Question updated`);

    res.json(result);
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

    const result = await questionService.deleteQuestion(questionId, user);

    console.log(`deleteQuestion [${requestId}]: Question deleted`);

    res.json(result);
  } catch (error) {
    console.error(`deleteQuestion [${requestId}]: Error:`, error);
    next(error);
  }
};

const testQuestion = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;
    const { questionData, testCode } = req.body; // Properly destructure the request body

    console.log(`testQuestion [${requestId}]: Testing ${questionData?.type} question`);
    console.log(`testQuestion [${requestId}]: User:`, {
      userId: user?.userId,
      role: user?.role,
      organizationId: user?.organizationId,
      isSuperOrgAdmin: user?.isSuperOrgAdmin
    });

    // Validate that user exists and has required properties
    if (!user) {
      throw createError(401, 'User not authenticated');
    }

    if (!user.role) {
      throw createError(400, 'User role not found');
    }

    if (!user.userId) {
      throw createError(400, 'User ID not found');
    }

    // Pass parameters in correct order: questionData, testCode, user
    const result = await questionTestingService.testQuestion(questionData, testCode, user);

    console.log(`testQuestion [${requestId}]: Test completed successfully`);
    console.log(result)
    res.json(result);
  } catch (error) {
    console.error(`testQuestion [${requestId}]: Error:`, error);
    next(error);
  }
};

const getQuestionStats = async (req, res, next) => {
  const requestId = generateRequestId();
  try {
    const { user } = req;

    console.log(`getQuestionStats [${requestId}]: Getting question statistics`);

    const result = await questionService.getQuestionStats(user);

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
  testQuestion,
  getQuestionStats,
  checkDuplicates // NEW: Export the duplicate checking function
};