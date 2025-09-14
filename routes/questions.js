// /routes/questions.js - UPDATED with duplicate detection route
const express = require('express');
const router = express.Router();
const { 
  createQuestion, 
  getQuestion, 
  getAllQuestions, 
  updateQuestion, 
  deleteQuestion, 
  testQuestion, 
  getQuestionStats,
  checkDuplicates  // NEW: Import duplicate checking function
} = require('../controllers/questionController');
const { verifyToken, validateContentManagement, validateContentAccess } = require('../middleware/auth');

// Get question statistics - must come before /:questionId route
router.get('/stats', verifyToken, validateContentAccess, getQuestionStats);

// NEW: Check for duplicate questions - must come before /:questionId route
router.get('/check-duplicates', verifyToken, validateContentManagement, checkDuplicates);

// Get all questions with filters
router.get('/', verifyToken, validateContentAccess, getAllQuestions);

// Create new question
router.post('/', verifyToken, validateContentManagement, createQuestion);

// Test question (for validation during creation)
router.post('/test', verifyToken, validateContentAccess, testQuestion);

// Get specific question by ID
router.get('/:questionId', verifyToken, validateContentAccess, getQuestion);

// Update specific question
router.patch('/:questionId', verifyToken, validateContentManagement, updateQuestion);

// Delete specific question
router.delete('/:questionId', verifyToken, validateContentManagement, deleteQuestion);

module.exports = router;