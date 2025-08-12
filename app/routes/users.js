const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken, requireAdmin, apiRateLimit } = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to all user routes
router.use(apiRateLimit);

// All routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.get('/', requireAdmin, UserController.getAllUsers);

module.exports = router;