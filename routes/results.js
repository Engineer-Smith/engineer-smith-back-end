// /routes/results.js - FIXED route ordering
const express = require('express');
const router = express.Router();
const { getResult, getAllResults, getResultAnalytics, getUserAnalytics, getSectionAnalytics, getQuestionAnalytics } = require('../controllers/resultController');
const { verifyToken, validateOrgAdminOrInstructor, validateContentAccess } = require('../middleware/auth');

// CRITICAL FIX: Put specific routes BEFORE parameterized routes
// Analytics routes - only admins and instructors (MOVED TO TOP)
router.get('/analytics/results', verifyToken, validateOrgAdminOrInstructor, getResultAnalytics);
router.get('/analytics/users', verifyToken, validateOrgAdminOrInstructor, getUserAnalytics);
router.get('/analytics/sections', verifyToken, validateOrgAdminOrInstructor, getSectionAnalytics);
router.get('/analytics/questions', verifyToken, validateOrgAdminOrInstructor, getQuestionAnalytics);

// Get all results - students see their own, admins/instructors see org results
// This should come before /:resultId to avoid conflict
router.get('/', verifyToken, validateContentAccess, getAllResults);

// Get specific result - students can view their own, admins/instructors can view all
// MOVED TO BOTTOM: Parameterized routes should always come last
router.get('/:resultId', verifyToken, validateContentAccess, getResult);

module.exports = router;