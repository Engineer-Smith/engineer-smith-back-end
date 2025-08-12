const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is instructor or admin
const requireInstructor = (req, res, next) => {
  if (!['instructor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Instructor access required' });
  }
  next();
};

// Rate limiting middleware for auth routes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for SSO callback and refresh routes
    return req.path.includes('/callback') || req.path.includes('/refresh');
  }
});

// Rate limiting for general API routes
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many API requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authenticateToken,
  requireAdmin,
  requireInstructor,
  authRateLimit,
  apiRateLimit
};