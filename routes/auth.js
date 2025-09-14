// /routes/auth.js - FIXED
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout,
  ssoLogin, 
  ssoCallback, 
  refreshToken, 
  getCurrentUser,
  validateInviteCode  // Import from authController since it exists there
} = require('../controllers/authController');
const { verifyToken, csrfProtection } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/validate-invite', validateInviteCode);

// SSO routes
router.get('/login/sso', ssoLogin);
router.get('/callback', ssoCallback);

// Protected routes
router.post('/logout', verifyToken, csrfProtection, logout);
router.get('/me', verifyToken, getCurrentUser);

// Health check for auth status
router.get('/status', verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    authenticated: true,
    user: {
      _id: req.user.userId,
      role: req.user.role,
      organizationId: req.user.organizationId,
    }
  });
});

module.exports = router;