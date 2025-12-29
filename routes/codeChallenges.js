// /routes/codeChallenges.js - Routes for the code challenge platform
const express = require('express');
const router = express.Router();
const codeChallengeController = require('../controllers/codeChallengeController');
const codeChallengeAdminController = require('../controllers/codeChallengeAdminController');
const { verifyToken, validateSuperOrgAdmin } = require('../middleware/auth');

// ==========================================
// PUBLIC ROUTES (no authentication required)
// ==========================================

// Browse tracks
router.get('/tracks', codeChallengeController.getTracks);

// Get specific track
router.get('/tracks/:language/:trackSlug', codeChallengeController.getTrack);

// Browse challenges
router.get('/challenges', codeChallengeController.getChallenges);

// Get specific challenge
router.get('/challenges/:challengeId', codeChallengeController.getChallenge);

// Test code against sample test cases (no submission created)
router.post('/challenges/:challengeId/test', verifyToken, codeChallengeController.testChallenge);

// ==========================================
// AUTHENTICATED USER ROUTES
// ==========================================

// User dashboard
router.get('/dashboard', verifyToken, codeChallengeController.getUserDashboard);

// Submit solution to challenge
router.post('/challenges/:challengeId/submit', verifyToken, codeChallengeController.submitChallenge);

// Enroll in track
router.post('/tracks/:language/:trackSlug/enroll', verifyToken, codeChallengeController.enrollInTrack);

// Get user's track progress
router.get('/tracks/:language/:trackSlug/progress', verifyToken, codeChallengeController.getUserTrackProgress);

// ==========================================
// ADMIN ROUTES (admin/superadmin only)
// ==========================================

// Challenge management
router.post('/admin/challenges', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.createChallenge);
router.get('/admin/challenges', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.getAllChallenges);
router.put('/admin/challenges/:challengeNumber', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.updateChallenge);
router.delete('/admin/challenges/:challengeNumber', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.deleteChallenge);

// Test challenge with solution code
router.post('/admin/challenges/:challengeNumber/test', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.testChallenge);

// Track management
router.post('/admin/tracks', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.createTrack);
router.get('/admin/tracks', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.getAllTracks);
router.put('/admin/tracks/:language/:trackSlug', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.updateTrack);
router.delete('/admin/tracks/:language/:trackSlug', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.deleteTrack);

// Track-challenge management
router.post('/admin/tracks/:language/:trackSlug/challenges', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.addChallengeToTrack);
router.delete('/admin/tracks/:language/:trackSlug/challenges/:challengeId', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.removeChallengeFromTrack);

// Analytics
router.get('/admin/analytics', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.getAnalytics);

// ==========================================
// ADMIN DASHBOARD UI ROUTES
// ==========================================

// Dashboard overviews
router.get('/admin/dashboard/tracks', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.getTracksOverview);
router.get('/admin/dashboard/challenges', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.getChallengesOverview);

// Detailed views
router.get('/admin/tracks/:language/:trackSlug', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.getTrackById);
router.get('/admin/challenges/:challengeNumber', verifyToken, validateSuperOrgAdmin, codeChallengeAdminController.getChallengeById);

module.exports = router;