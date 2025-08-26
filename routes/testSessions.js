// /routes/testSessions.js - FIXED ROUTING
const express = require('express');
const router = express.Router();
const { 
  startTestSession, 
  getTestSession, 
  getAllTestSessions, 
  submitTestSession, 
  abandonTestSession, 
  submitSection,
  getSessionTimeSync
} = require('../controllers/testSessionController');
const { verifyToken, validateOrgAdminOrInstructor, validateContentAccess } = require('../middleware/auth');

// Start test session - students start tests, admins/instructors can also start for testing
router.post('/', verifyToken, validateContentAccess, startTestSession);

// Get specific test session - students see their own, admins/instructors see all
router.get('/:sessionId', verifyToken, validateContentAccess, getTestSession);

// Get all test sessions - students see their own, admins/instructors see org sessions
router.get('/', verifyToken, validateContentAccess, getAllTestSessions);

// Submit test session - students submit their tests
router.patch('/:sessionId', verifyToken, validateContentAccess, submitTestSession);

// Abandon test session - students can abandon their tests
router.patch('/:sessionId/abandon', verifyToken, validateContentAccess, abandonTestSession);

// FIXED: Submit section - remove the /api prefix since it's already mounted at /api/test-sessions
router.patch('/:sessionId/submit-section', verifyToken, validateContentAccess, submitSection);

router.get('/:sessionId/time-sync', verifyToken, getSessionTimeSync);

module.exports = router;