// /routes/auth.js - Updated with Simple SSO
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  ssoLogin,
  ssoCallback,
  simpleSSOLogin,  // Add this import
  refreshToken,
  getCurrentUser,
  validateInviteCode,
  testSSOToken,
  changePassword,
  getSocketToken
} = require('../controllers/authController');
const { verifyToken, csrfProtection } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/validate-invite', validateInviteCode);

// SSO routes
// router.get('/sso/login', simpleSSOLogin);  // Add this route for simple token-based SSO

router.get('/sso/login', (req, res, next) => {
  next();
}, simpleSSOLogin);


router.get('/login/sso', ssoLogin);        // OAuth2 SSO initiate
router.get('/callback', ssoCallback);      // OAuth2 SSO callback

// router.get('/test-sso', testSSOToken);

// Protected routes
router.post('/logout', verifyToken, csrfProtection, logout);
router.get('/me', verifyToken, getCurrentUser);
router.get('/socket-token', verifyToken, getSocketToken);  // Add this line
router.post('/change-password', verifyToken, csrfProtection, changePassword);

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