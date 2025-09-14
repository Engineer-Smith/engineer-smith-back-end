// /routes/results.js - UPDATED
const express = require('express');
const router = express.Router();
const { getResult, getAllResults, getResultAnalytics, getUserAnalytics, getSectionAnalytics, getQuestionAnalytics } = require('../controllers/resultController');
const { verifyToken, validateOrgAdminOrInstructor, validateContentAccess } = require('../middleware/auth');

// Get specific result - students can view their own, admins/instructors can view all
router.get('/:resultId', verifyToken, validateContentAccess, getResult);

// Get all results - students see their own, admins/instructors see org results
router.get('/', verifyToken, validateContentAccess, getAllResults);

// Analytics routes - only admins and instructors
router.get('/analytics/results', verifyToken, validateOrgAdminOrInstructor, getResultAnalytics);
router.get('/analytics/users', verifyToken, validateOrgAdminOrInstructor, getUserAnalytics);
router.get('/analytics/sections', verifyToken, validateOrgAdminOrInstructor, getSectionAnalytics);
router.get('/analytics/questions', verifyToken, validateOrgAdminOrInstructor, getQuestionAnalytics);

module.exports = router;