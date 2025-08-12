// app/routes/questions.js
const express = require('express');
const QuestionController = require('../controllers/questionController');
const { authenticateToken, requireAdmin, apiRateLimit } = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to all question routes
router.use(apiRateLimit);

// All routes require authentication
router.use(authenticateToken);

// Public question routes (all authenticated users)
router.get('/', QuestionController.getAllQuestions);
router.get('/:id', QuestionController.getQuestionById);

// Question creation and editing
router.post('/', QuestionController.createQuestion);
router.post('/bulk', requireAdmin, QuestionController.addManyQuestions); // NEW bulk import
router.put('/:id', QuestionController.updateQuestion);
router.delete('/:id', QuestionController.deleteQuestion);

// Admin-only routes
router.get('/admin/pending', requireAdmin, QuestionController.getPendingQuestions);
router.post('/:id/review', requireAdmin, QuestionController.reviewQuestion);
router.post('/admin/bulk-review', requireAdmin, QuestionController.bulkReviewQuestions);
router.get('/:id/analytics', requireAdmin, QuestionController.getQuestionAnalytics);
router.get('/admin/stats', requireAdmin, QuestionController.getQuestionBankStats);

// User management routes (Admin only)
router.post('/admin/create-user', requireAdmin, QuestionController.createUserWithRole);
router.put('/admin/users/:id/role', requireAdmin, QuestionController.updateUserRole);

module.exports = router;