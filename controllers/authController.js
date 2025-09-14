// /controllers/authController.js - Enhanced with firstName/lastName support
const User = require('../models/User');
const Organization = require('../models/Organization');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const passport = require('passport');
const { generateCsrfToken } = require('../middleware/auth');

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

// Helper function to set auth cookies
const setAuthCookies = (res, accessToken, refreshToken, csrfToken = null) => {
  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Set CSRF token cookie (not httpOnly so frontend can read it)
  if (csrfToken) {
    res.cookie('csrfToken', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

// Helper function to clear auth cookies
const clearAuthCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('csrfToken');
};

// Register a new user (public)
const register = async (req, res, next) => {
  try {
    const { username, email, password, inviteCode, role, firstName, lastName } = req.body;

    // Validate input - UPDATED with firstName/lastName validation
    if (!username || !password) {
      throw createError(400, 'Username and password are required');
    }
    if (!firstName || !lastName) {
      throw createError(400, 'First name and last name are required');
    }
    if (firstName.length < 1 || firstName.length > 50) {
      throw createError(400, 'First name must be 1-50 characters');
    }
    if (lastName.length < 1 || lastName.length > 50) {
      throw createError(400, 'Last name must be 1-50 characters');
    }
    if (username.length < 3) {
      throw createError(400, 'Username must be at least 3 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw createError(400, 'Username can only contain letters, numbers, underscores, and hyphens');
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      throw createError(400, 'Please enter a valid email address');
    }
    if (role && !['admin', 'instructor', 'student'].includes(role)) {
      throw createError(400, 'Invalid role');
    }

    let organization;
    let finalRole = role || 'student';

    // Assign organization based on inviteCode
    if (inviteCode) {
      organization = await Organization.findOne({ inviteCode });
      if (!organization) {
        throw createError(404, 'Invalid invite code');
      }
    } else {
      // Default to EngineerSmith super org for students
      organization = await Organization.findOne({ isSuperOrg: true });
      if (!organization) {
        throw createError(500, 'EngineerSmith super org not found');
      }
      finalRole = 'student'; // Force student role for no inviteCode
    }

    // Check if username is unique
    const existingUserByUsername = await User.findOne({ loginId: username.toLowerCase() });
    if (existingUserByUsername) {
      throw createError(409, 'Username already exists');
    }

    // Check if email is unique (if provided)
    if (email) {
      const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingUserByEmail) {
        throw createError(409, 'Email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user - UPDATED with firstName/lastName
    const user = new User({
      loginId: username.toLowerCase(),
      email: email ? email.toLowerCase() : undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      hashedPassword,
      organizationId: organization._id,
      role: finalRole,
      isSSO: false,
    });

    await user.save();

    // Auto-login after registration
    const payload = {
      userId: user._id,
      loginId: user.loginId,
      organizationId: user.organizationId,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    const csrfToken = generateCsrfToken();

    setAuthCookies(res, accessToken, refreshToken, csrfToken);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        loginId: user.loginId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName, // Virtual field
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
      },
      csrfToken, // Send CSRF token to frontend
    });
  } catch (error) {
    next(error);
  }
};

// Manual login (public) - accepts username or email
const login = async (req, res, next) => {
  try {
    const { loginCredential, password } = req.body;

    if (!loginCredential || !password) {
      throw createError(400, 'Username/email and password are required');
    }

    // Find user by username or email
    const user = await User.findByLoginCredential(loginCredential);
    if (!user) {
      throw createError(401, 'Invalid username/email or password');
    }

    // Check if user uses SSO
    if (user.isSSO) {
      throw createError(401, 'Please use SSO to login');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      throw createError(401, 'Invalid username/email or password');
    }

    // Generate JWTs
    const payload = {
      userId: user._id,
      loginId: user.loginId,
      organizationId: user.organizationId,
      role: user.role,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    const csrfToken = generateCsrfToken();

    setAuthCookies(res, accessToken, refreshToken, csrfToken);

    res.json({
      success: true,
      user: {
        _id: user._id,
        loginId: user.loginId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName, // Virtual field
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
      },
      csrfToken, // Send CSRF token to frontend
    });
  } catch (error) {
    next(error);
  }
};

// SSO login (public)
const ssoLogin = passport.authenticate('oauth2', {
  session: false,
  failureRedirect: '/auth/login/failed',
});

// SSO callback (public)
const ssoCallback = async (req, res, next) => {
  passport.authenticate('oauth2', { session: false }, async (err, user, info) => {
    try {
      if (err || !user) {
        throw createError(401, info?.message || 'SSO authentication failed');
      }

      // Generate JWTs
      const payload = {
        userId: user._id,
        loginId: user.loginId,
        organizationId: user.organizationId,
        role: user.role,
      };
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
      const csrfToken = generateCsrfToken();

      setAuthCookies(res, accessToken, refreshToken, csrfToken);

      // Redirect to frontend with success
      const redirectUrl = process.env.NODE_ENV === 'production' 
        ? 'https://engineersmith.com/auth/callback?success=true'
        : 'http://localhost:5173/auth/callback?success=true';
      
      res.redirect(redirectUrl);
    } catch (error) {
      const redirectUrl = process.env.NODE_ENV === 'production' 
        ? 'https://engineersmith.com/auth/callback?error=sso_failed'
        : 'http://localhost:5173/auth/callback?error=sso_failed';
      
      res.redirect(redirectUrl);
    }
  })(req, res, next);
};

// Refresh token (public)
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw createError(401, 'Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createError(401, 'Invalid refresh token');
    }

    const payload = {
      userId: user._id,
      loginId: user.loginId,
      organizationId: user.organizationId,
      role: user.role,
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    const csrfToken = generateCsrfToken();

    setAuthCookies(res, accessToken, newRefreshToken, csrfToken);

    res.json({ 
      success: true,
      csrfToken,
    });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

// Logout (authenticated)
const logout = async (req, res, next) => {
  try {
    clearAuthCookies(res);
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Get current user info (authenticated) - UPDATED with firstName/lastName
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('organizationId', 'name inviteCode isSuperOrg')
      .select('-hashedPassword -ssoToken');
    
    if (!user) {
      throw createError(404, 'User not found');
    }

    console.log('getCurrentUser Debug:', {
      userId: user._id,
      organizationId: user.organizationId,
      isPopulated: typeof user.organizationId === 'object'
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        loginId: user.loginId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName, // Virtual field
        displayName: user.displayName, // Virtual field
        email: user.email,
        role: user.role,
        isSSO: user.isSSO,
        organization: user.organizationId, // This should be the populated object
        organizationId: user.organizationId?._id, // Also include just the _id
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validate invite code for registration (public)
const validateInviteCode = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      throw createError(400, 'Invite code is required');
    }

    const organization = await Organization.findOne({ inviteCode });
    if (!organization) {
      throw createError(404, 'Invalid invite code');
    }

    res.json({
      success: true,
      organization: {
        _id: organization._id,
        name: organization.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSocketToken = async (req, res, next) => {
  try {
    // User is already authenticated via middleware
    const socketToken = jwt.sign(
      {
        userId: req.user.userId,
        loginId: req.user.loginId,
        type: 'socket'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      socketToken
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  ssoLogin,
  ssoCallback,
  refreshToken,
  getCurrentUser,
  validateInviteCode,
  getSocketToken
};