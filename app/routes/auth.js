const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken, authRateLimit } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/sso', UserController.initiateSSO);
router.get('/callback', UserController.handleSSOCallback);
router.post('/login', authRateLimit, UserController.login);
router.post('/register', authRateLimit, UserController.register);
router.post('/refresh', UserController.refreshToken);

// Protected routes (authentication required)
router.get('/me', authenticateToken, UserController.getCurrentUser);
router.post('/logout', authenticateToken, UserController.logout);
router.put('/profile', authenticateToken, UserController.updateProfile);

module.exports = router;