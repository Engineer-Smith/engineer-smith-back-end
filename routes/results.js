// /routes/results.js - UPDATED
const express = require('express');
const router = express.Router();
const { getResult, getAllResults, getResultAnalytics, getUserAnalytics, getSectionAnalytics } = require('../controllers/resultController');
const { verifyToken, validateOrgAdminOrInstructor, validateContentAccess } = require('../middleware/auth');

// Get specific result - students can view their own, admins/instructors can view all
router.get('/:resultId', verifyToken, validateContentAccess, getResult);

// Get all results - students see their own, admins/instructors see org results
router.get('/', verifyToken, validateContentAccess, getAllResults);

// Analytics routes - only admins and instructors
router.get('/analytics', verifyToken, validateOrgAdminOrInstructor, getResultAnalytics);
router.get('/user-analytics', verifyToken, validateOrgAdminOrInstructor, getUserAnalytics);
router.get('/section-analytics', verifyToken, validateOrgAdminOrInstructor, getSectionAnalytics);

module.exports = router;