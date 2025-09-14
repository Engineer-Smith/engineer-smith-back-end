// /controllers/resultController.js - REFACTORED to use service layer
const resultService = require('../services/result/resultService');
const { validateFilterInputs, validateAnalyticsAccess, validateQuestionAnalyticsAccess } = require('../services/result/resultValidation');
const createError = require('http-errors');

// Get a result (super org admins/instructors, org admins/instructors, or students)
const getResult = async (req, res, next) => {
  try {
    const { user } = req;
    const { resultId } = req.params;

    const result = await resultService.getResult(resultId, user);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// List results (super org admins/instructors, org admins/instructors, or students)
const getAllResults = async (req, res, next) => {
  try {
    const { user } = req;
    const filters = {
      userId: req.query.userId,
      testId: req.query.testId,
      orgId: req.query.orgId,
      limit: req.query.limit || 10,
      skip: req.query.skip || 0
    };

    // Validate filter inputs
    validateFilterInputs(filters);

    const results = await resultService.getAllResults(filters, user);
    
    res.json(results);
  } catch (error) {
    next(error);
  }
};

// Get result analytics (super org admins/instructors or org admins/instructors)
const getResultAnalytics = async (req, res, next) => {
  try {
    const { user } = req;
    const filters = {
      testId: req.query.testId,
      orgId: req.query.orgId,
      questionId: req.query.questionId,
      difficulty: req.query.difficulty,
      questionType: req.query.questionType,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // Validate permissions and filter inputs
    validateAnalyticsAccess(user, filters.orgId);
    validateFilterInputs(filters);

    const analytics = await resultService.getResultAnalytics(filters, user);
    
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// Get user analytics (super org admins/instructors or org admins/instructors)
const getUserAnalytics = async (req, res, next) => {
  try {
    const { user } = req;
    const filters = {
      userId: req.query.userId,
      testId: req.query.testId,
      orgId: req.query.orgId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // Validate permissions and filter inputs
    validateAnalyticsAccess(user, filters.orgId);
    validateFilterInputs(filters);

    const analytics = await resultService.getUserAnalytics(filters, user);
    
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// Get section analytics (super org admins/instructors or org admins/instructors)
const getSectionAnalytics = async (req, res, next) => {
  try {
    const { user } = req;
    const filters = {
      testId: req.query.testId,
      orgId: req.query.orgId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // Validate permissions and filter inputs
    validateAnalyticsAccess(user, filters.orgId);
    validateFilterInputs(filters);

    const analytics = await resultService.getSectionAnalytics(filters, user);
    
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// Get question performance analytics
const getQuestionAnalytics = async (req, res, next) => {
  try {
    const { user } = req;
    const filters = {
      testId: req.query.testId,
      questionId: req.query.questionId,
      orgId: req.query.orgId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit || 20,
      skip: req.query.skip || 0
    };

    // Validate permissions and filter inputs
    validateQuestionAnalyticsAccess(user, filters.orgId);
    validateFilterInputs(filters);

    const analytics = await resultService.getQuestionAnalytics(filters, user);
    
    res.json(analytics);
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
  getQuestionAnalytics
};