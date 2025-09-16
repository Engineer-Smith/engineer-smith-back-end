// /controllers/questionController.js
const questionService = require('../services/question/questionService');
const questionTestingService = require('../services/question/questionTestingService');
const questionDuplicateService = require('../services/question/questionDuplicateService');
const createError = require('http-errors');

const createQuestion = async (req, res, next) => {
  try {
    const { user } = req;
    const questionData = req.body;

    const result = await questionService.createQuestion(questionData, user);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getQuestion = async (req, res, next) => {
  try {
    const { user } = req;
    const { questionId } = req.params;

    const result = await questionService.getQuestion(questionId, user);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAllQuestions = async (req, res, next) => {
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
      status: req.query.status,
      includeTotalCount: req.query.includeTotalCount
    };

    const result = await questionService.getAllQuestions(filters, user);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const checkDuplicates = async (req, res, next) => {
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

    // Validate required parameters
    questionDuplicateService.validateSearchParams(searchParams);

    const duplicates = await questionDuplicateService.findSimilarQuestions(searchParams, user);

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
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
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

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const { user } = req;
    const { questionId } = req.params;

    const result = await questionService.deleteQuestion(questionId, user);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const testQuestion = async (req, res, next) => {
  try {
    const { user } = req;
    const { questionData, testCode } = req.body;

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

    const result = await questionTestingService.testQuestion(questionData, testCode, user);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getQuestionStats = async (req, res, next) => {
  try {
    const { user } = req;

    const result = await questionService.getQuestionStats(user);

    res.json(result);
  } catch (error) {
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
  checkDuplicates
};