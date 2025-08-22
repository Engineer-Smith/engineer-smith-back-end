// /routes/tests.js - CORRECTED
const express = require('express');
const router = express.Router();
const { 
  createTest, 
  getTest, 
  getTestWithQuestions, // Add this to the import
  getAllTests, 
  updateTest, 
  deleteTest 
} = require('../controllers/testController');
const { verifyToken, validateContentManagement, validateContentAccess } = require('../middleware/auth');

// Create test - admins and instructors can create
router.post('/', verifyToken, validateContentManagement, createTest);

// IMPORTANT: Put specific routes BEFORE parameterized routes
// Get test with questions - for preview/taking (specific route first)
router.get('/:testId/with-questions', verifyToken, validateContentAccess, getTestWithQuestions);

// Get specific test - all authenticated users can view
router.get('/:testId', verifyToken, validateContentAccess, getTest);

// Get all tests - all authenticated users can view
router.get('/', verifyToken, validateContentAccess, getAllTests);

// Update test - admins and instructors can edit
router.patch('/:testId', verifyToken, validateContentManagement, updateTest);

// Delete test - admins and instructors can delete
router.delete('/:testId', verifyToken, validateContentManagement, deleteTest);

module.exports = router;