// /routes/testSessions.js - Updated for Server-Driven Architecture
const express = require('express');
const router = express.Router();
const testSessionController = require('../controllers/testSessionController');
const { verifyToken, validateContentAccess } = require('../middleware/auth');

// Check for existing active session - MUST come before other routes
router.get('/check-existing', verifyToken, validateContentAccess, testSessionController.checkExistingSession);

// Class analytics endpoint (before parameterized routes)  
router.get('/analytics/class', verifyToken, validateContentAccess, testSessionController.getClassAnalytics);

// Start test session - SERVER-DRIVEN (creates session + gets first question + starts timer)
router.post('/', verifyToken, validateContentAccess, testSessionController.startTestSession);

// Get all test sessions
router.get('/', verifyToken, validateContentAccess, testSessionController.getAllTestSessions);

// Rejoin existing session - SERVER-DRIVEN 
router.post('/:sessionId/rejoin', verifyToken, validateContentAccess, testSessionController.rejoinTestSession);

// Submit answer - SERVER-DRIVEN (processes answer + auto-advances)
router.post('/:sessionId/submit-answer', verifyToken, validateContentAccess, testSessionController.submitAnswer);

// Get session overview (admin/instructor use)
router.get('/:sessionId/overview', verifyToken, validateContentAccess, testSessionController.getSessionOverview);

// Get current question (for manual refresh)
router.get('/:sessionId/current-question', verifyToken, validateContentAccess, testSessionController.getCurrentQuestion);

// Time synchronization endpoint
router.get('/:sessionId/time-sync', verifyToken, validateContentAccess, testSessionController.getSessionTimeSync);

// Session analytics endpoint (admin/instructor)
router.get('/:sessionId/analytics', verifyToken, validateContentAccess, testSessionController.getSessionAnalytics);

// Submit final test session
router.post('/:sessionId/submit', verifyToken, validateContentAccess, testSessionController.submitTestSession);

// Abandon test session
router.post('/:sessionId/abandon', verifyToken, validateContentAccess, testSessionController.abandonTestSession);

// Test analytics endpoint
router.get('/tests/:testId/analytics', verifyToken, validateContentAccess, testSessionController.getTestAnalytics);

// Get specific test session (admin view) - MUST come last to avoid conflicts
router.get('/:sessionId', verifyToken, validateContentAccess, testSessionController.getTestSession);

module.exports = router;