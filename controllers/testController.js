// /controllers/testController.js - REFACTORED to use service layer
const testService = require('../services/test/testService');
const createError = require('http-errors');

const createTest = async (req, res, next) => {
  try {
    const { user } = req;
    const testData = req.body;
    const { orgId } = req.query;

    console.log('createTest: Received status from frontend:', testData.status);

    const result = await testService.createTest(testData, user, orgId);
    
    console.log('createTest: Test saved with status:', result.status);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('createTest: Error:', error);
    next(error);
  }
};

const getTest = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;

    const result = await testService.getTest(testId, user);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAllTests = async (req, res, next) => {
  try {
    const { user } = req;
    const filters = {
      orgId: req.query.orgId,
      isGlobal: req.query.isGlobal,
      testType: req.query.testType,
      language: req.query.language,
      tag: req.query.tag,
      status: req.query.status,
      limit: req.query.limit || 10,
      skip: req.query.skip || 0
    };

    console.log('getAllTests: Query params:', filters);
    console.log('getAllTests: User role:', user.role);

    const tests = await testService.getAllTests(filters, user);
    
    console.log('getAllTests: Found tests:', tests.length);
    
    res.json(tests);
  } catch (error) {
    console.error('getAllTests: Error:', error);
    next(error);
  }
};

const updateTest = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;
    const updateData = req.body;

    // Check if at least one field is provided
    const hasUpdates = Object.values(updateData).some(value => value !== undefined);
    if (!hasUpdates) {
      throw createError(400, 'At least one field is required');
    }

    const result = await testService.updateTest(testId, updateData, user);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteTest = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;

    const result = await testService.deleteTest(testId, user);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTestWithQuestions = async (req, res, next) => {
  try {
    const { user } = req;
    const { testId } = req.params;

    const result = await testService.getTestWithQuestions(testId, user);
    
    res.json(result);
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