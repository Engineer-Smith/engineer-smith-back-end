// /routes/questions.js - UPDATED
const express = require('express');
const router = express.Router();
const { createQuestion, getQuestion, getAllQuestions, updateQuestion, deleteQuestion, getQuestionStats } = require('../controllers/questionController');
const { verifyToken, validateContentManagement, validateContentAccess } = require('../middleware/auth');

// Get question statistics - all authenticated users can view stats
router.get('/stats', verifyToken, validateContentAccess, getQuestionStats);

// Create question - admins and instructors can create
router.post('/', verifyToken, validateContentManagement, createQuestion);

// Get specific question - all authenticated users can view
router.get('/:questionId', verifyToken, validateContentAccess, getQuestion);

// Get all questions - all authenticated users can view
router.get('/', verifyToken, validateContentAccess, getAllQuestions);

// Update question - admins and instructors can edit
router.patch('/:questionId', verifyToken, validateContentManagement, updateQuestion);

// Delete question - admins and instructors can delete
router.delete('/:questionId', verifyToken, validateContentManagement, deleteQuestion);

module.exports = router;