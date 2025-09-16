// /middleware/auth.js - Enhanced with cookie-based authentication and tiered roles
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const Organization = require('../models/Organization');

// Enhanced token verification with cookie support
const verifyToken = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in multiple locations
    if (req.cookies && req.cookies.accessToken) {
      // Primary: Check for access token in cookies (most secure)
      token = req.cookies.accessToken;
    } else if (req.headers.authorization) {
      // Fallback: Check Authorization header for API clients
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      throw createError(401, 'Authentication token required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      // If access token is expired, try to refresh automatically
      if (jwtError.name === 'TokenExpiredError' && req.cookies.refreshToken) {
        return await handleTokenRefresh(req, res, next);
      }
      throw createError(401, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

// Automatic token refresh handler
const handleTokenRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw createError(401, 'Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Verify user still exists and is valid
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createError(401, 'Invalid refresh token - user not found');
    }

    // Generate new access token
    const payload = {
      userId: user._id,
      loginId: user.loginId,
      loginType: user.loginType,
      organizationId: user.organizationId,
      role: user.role,
    };
    
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' 
    });

    // Set new access token in cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set user data and continue
    req.user = payload;
    next();
  } catch (error) {
    // Clear invalid cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    next(createError(401, 'Invalid refresh token'));
  }
};

// Optional: API-only middleware for endpoints that should only accept header auth
const verifyApiToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Bearer token required for API access');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(createError(401, 'Invalid or expired API token'));
  }
};

// CSRF protection middleware for cookie-based auth
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API clients using Bearer tokens
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  // Require CSRF token for cookie-based auth
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionCsrf = req.cookies.csrfToken;

  if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
    return next(createError(403, 'Invalid CSRF token'));
  }

  next();
};

// Generate CSRF token
const generateCsrfToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Helper function to check if user is super org admin
const checkSuperOrgAdmin = async (user) => {
  if (!user.organizationId) return false;
  
  const org = await Organization.findById(user.organizationId);
  return org && org.isSuperOrg && user.role === 'admin';
};

// Super org admin only access (EngineerSmith admin)
const validateSuperOrgAdmin = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user.organizationId) {
      throw createError(403, 'No organization assigned');
    }

    const org = await Organization.findById(user.organizationId);
    if (!org || !org.isSuperOrg || user.role !== 'admin') {
      throw createError(403, 'Requires super org admin access');
    }

    req.user.isSuperOrgAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
};

// For endpoints that need admin or instructor access to manage their org's content
const validateOrgAdminOrInstructor = async (req, res, next) => {
  try {
    const { user } = req;
    
    if (!user.organizationId) {
      throw createError(403, 'No organization assigned');
    }

    // Check if user is super org admin first
    const isSuperOrgAdmin = await checkSuperOrgAdmin(user);
    if (isSuperOrgAdmin) {
      req.user.isSuperOrgAdmin = true;
      return next();
    }

    // Check if user has admin or instructor role
    if (user.role !== 'admin' && user.role !== 'instructor') {
      throw createError(403, 'Requires admin or instructor role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// For endpoints that need admin access only (no instructors)
const validateOrgAdminOnly = async (req, res, next) => {
  try {
    const { user } = req;
    
    if (!user.organizationId) {
      throw createError(403, 'No organization assigned');
    }

    // Check if user is super org admin first
    const isSuperOrgAdmin = await checkSuperOrgAdmin(user);
    if (isSuperOrgAdmin) {
      req.user.isSuperOrgAdmin = true;
      return next();
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      throw createError(403, 'Requires admin role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// For endpoints that need specific org access (with URL param)
const validateOrgAccess = async (req, res, next) => {
  try {
    const { user } = req;
    const { _id } = req.params; // Organization _id from URL

    if (!user.organizationId) {
      throw createError(403, 'No organization assigned');
    }

    // Check if user is super org admin
    const isSuperOrgAdmin = await checkSuperOrgAdmin(user);
    if (isSuperOrgAdmin) {
      req.user.isSuperOrgAdmin = true;
      return next();
    }

    // Check if user has access to the specific organization
    if (user.organizationId.toString() !== _id) {
      throw createError(403, 'Unauthorized to access this organization');
    }

    if (user.role !== 'admin' && user.role !== 'instructor') {
      throw createError(403, 'Requires admin or instructor role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Legacy middleware - kept for backward compatibility
const validateOrgAdmin = async (req, res, next) => {
  try {
    const { user } = req;
    const { _id } = req.params; // Organization _id from URL

    if (!user.organizationId) {
      throw createError(403, 'No organization assigned');
    }

    // Check if user is super org admin
    const isSuperOrgAdmin = await checkSuperOrgAdmin(user);
    if (isSuperOrgAdmin) {
      req.user.isSuperOrgAdmin = true;
      return next();
    }

    if (user.organizationId.toString() !== _id) {
      throw createError(403, 'Unauthorized to access this organization');
    }

    if (user.role !== 'admin' && user.role !== 'instructor') {
      throw createError(403, 'Requires admin or instructor role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// For content management (questions, tests) - instructors can create/edit, admins can do everything
const validateContentManagement = async (req, res, next) => {
  try {
    const { user } = req;
    
    if (!user.organizationId) {
      throw createError(403, 'No organization assigned');
    }

    // Check if user is super org admin first
    const isSuperOrgAdmin = await checkSuperOrgAdmin(user);
    if (isSuperOrgAdmin) {
      req.user.isSuperOrgAdmin = true;
      return next();
    }

    // Check if user has admin or instructor role
    if (user.role !== 'admin' && user.role !== 'instructor') {
      throw createError(403, 'Requires admin or instructor role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// For viewing content - admin, instructor, and students can view
const validateContentAccess = async (req, res, next) => {
  try {
    const { user } = req;
    
    if (!user.organizationId) {
      throw createError(403, 'No organization assigned');
    }

    // Check if user is super org admin first
    const isSuperOrgAdmin = await checkSuperOrgAdmin(user);
    if (isSuperOrgAdmin) {
      req.user.isSuperOrgAdmin = true;
      return next();
    }

    // All authenticated users can view content (students, instructors, admins)
    if (!['admin', 'instructor', 'student'].includes(user.role)) {
      throw createError(403, 'Invalid user role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  verifyApiToken,
  csrfProtection,
  generateCsrfToken,
  validateSuperOrgAdmin,
  validateOrgAdmin, // Legacy - kept for backward compatibility
  validateOrgAdminOrInstructor,
  validateOrgAdminOnly,
  validateOrgAccess,
  validateContentManagement,
  validateContentAccess,
};