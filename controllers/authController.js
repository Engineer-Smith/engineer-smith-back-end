// /controllers/authController.js - Enhanced with firstName/lastName support and Simple SSO
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

// Helper function to validate token with external site (for simple SSO)
const validateSSOToken = async (token) => {
  try {
    // Decode JWT with shared secret
    const decoded = jwt.verify(token, process.env.SSO_SHARED_SECRET);

    return {
      valid: true,
      user: {
        id: decoded.user_id,
        email: decoded.email,
        firstName: decoded.first_name,
        lastName: decoded.last_name,
        username: decoded.username,
        organization_code: decoded.organization_code,  // Add this line
        role: decoded.role                             // Add this line
      }
    };
  } catch (error) {
    console.error('SSO JWT validation failed:', error.message);
    return { valid: false };
  }
};

// Helper function to determine organization from user data (for simple SSO)
const determineUserOrganization = async (userData) => {
  // If the external site provides an organization identifier
  if (userData.organizationCode) {
    const org = await Organization.findOne({ inviteCode: userData.organizationCode });
    if (org) return org;
  }

  // If they provide an email domain mapping
  if (userData.email) {
    const domain = userData.email.split('@')[1];
    // You could have domain-based org assignment logic here
    // const org = await Organization.findOne({ allowedDomains: domain });
  }

  // Default to super org
  return await Organization.findOne({ isSuperOrg: true });
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

// Simple SSO login endpoint - this is what the external site links to directly
const simpleSSOLogin = async (req, res, next) => {
  try {
    const { token, redirect } = req.query;

    if (!token) {
      const errorUrl = `${process.env.FRONTEND_URL}/auth/login?error=missing_token`;
      return res.redirect(errorUrl);
    }

    // Validate token with external site
    const userData = await validateSSOToken(token);

    if (!userData || !userData.valid) {
      const errorUrl = `${process.env.FRONTEND_URL}/auth/login?error=invalid_token`;
      return res.redirect(errorUrl);
    }

    // Extract user information
    const {
      id: ssoId,
      email,
      firstName,
      lastName,
      username,
      role: suggestedRole,
      organization_code: organizationCode
    } = userData.user;

    // Updated validation: email is optional, but we need ssoId, firstName, lastName
    // and either email or username for creating loginId
    if (!ssoId || !firstName || !lastName || (!email && !username)) {
      const errorUrl = `${process.env.FRONTEND_URL}/auth/login?error=incomplete_user_data`;
      return res.redirect(errorUrl);
    }

    // Check if user already exists - search by ssoId first, then by email if available
    let searchQuery = { ssoId: ssoId };
    if (email && email.trim()) {
      searchQuery = {
        $or: [
          { ssoId: ssoId },
          { email: email.toLowerCase() }
        ]
      };
    }

    let user = await User.findOne(searchQuery);
    let isNewUser = false;

    if (user) {
      // Update existing user
      user.ssoId = ssoId;
      // Only update email if it's provided
      if (email && email.trim()) {
        user.email = email.toLowerCase();
      }
      user.firstName = firstName.trim();
      user.lastName = lastName.trim();
      user.isSSO = true;

      // Update organization if provided and different
      if (organizationCode) {
        const newOrg = await Organization.findOne({ inviteCode: organizationCode });
        if (newOrg && newOrg._id.toString() !== user.organizationId.toString()) {
          user.organizationId = newOrg._id;
        }
      }

      await user.save();
    } else {
      // Create new user
      isNewUser = true;

      // Determine organization
      const organization = await determineUserOrganization(userData.user);

      if (!organization) {
        const errorUrl = `${process.env.FRONTEND_URL}/auth/login?error=no_organization`;
        return res.redirect(errorUrl);
      }

      // Generate unique loginId - use email if available, otherwise use username
      let loginId;
      if (email && email.trim()) {
        loginId = email.split('@')[0];
      } else if (username) {
        loginId = username;
      } else {
        // Fallback: use first part of firstName + lastName
        loginId = `${firstName}${lastName}`.toLowerCase();
      }

      loginId = loginId.toLowerCase().replace(/[^a-z0-9_-]/g, '');

      // Ensure loginId is unique
      let counter = 1;
      let originalLoginId = loginId;
      while (await User.findOne({ loginId })) {
        loginId = `${originalLoginId}${counter}`;
        counter++;
      }

      // Determine role
      let userRole = 'student'; // default
      if (suggestedRole && ['admin', 'instructor', 'student'].includes(suggestedRole)) {
        userRole = suggestedRole;
      }

      // Create user object - only include email if it's provided
      const userObj = {
        loginId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ssoId,
        organizationId: organization._id,
        role: userRole,
        isSSO: true,
      };

      // Only add email if it's provided and not empty
      if (email && email.trim()) {
        userObj.email = email.toLowerCase();
      }

      user = new User(userObj);
      await user.save();
    }

    // Generate JWT tokens
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

    // Redirect to success page or dashboard
    let redirectUrl;
    if (redirect && redirect.startsWith('/')) {
      // Allow relative redirects only for security
      redirectUrl = `${process.env.FRONTEND_URL}${redirect}`;
    } else {
      redirectUrl = `${process.env.FRONTEND_URL}/dashboard${isNewUser ? '?welcome=true' : ''}`;
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('SSO Login Error:', error);
    const errorUrl = `${process.env.FRONTEND_URL}/auth/login?error=sso_failed`;
    return res.redirect(errorUrl);
  }
};

// OAuth2 SSO login (public) - initiates OAuth2 flow
const ssoLogin = passport.authenticate('oauth2', {
  session: false,
  failureRedirect: '/auth/login/failed',
});

// OAuth2 SSO callback (public) - handles OAuth2 callback
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
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?success=true`;
      res.redirect(redirectUrl);
    } catch (error) {
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?error=sso_failed`;
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

const testSSOToken = async (req, res, next) => {
  try {
    const token = jwt.sign({
      user_id: 'test123',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      exp: Math.floor(Date.now() / 1000) + (10 * 60) // 10 minutes
    }, process.env.SSO_SHARED_SECRET, { algorithm: 'HS256' });

    res.redirect(`/auth/sso/login?token=${token}`);
  } catch (error) {
    console.error('Test SSO token generation failed:', error);
    res.status(500).json({ error: 'Failed to generate test token' });
  }
};

module.exports = {
  register,
  login,
  logout,
  ssoLogin,        // OAuth2 SSO (for future Google/GitHub integration)
  ssoCallback,     // OAuth2 SSO callback
  simpleSSOLogin,  // Simple token-based SSO (for simplycoding.org)
  refreshToken,
  getCurrentUser,
  validateInviteCode,
  getSocketToken,
  testSSOToken
};