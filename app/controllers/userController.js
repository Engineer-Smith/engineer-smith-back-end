const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { setAuthCookie } = require('../utils/setAuthCookie');
const apiResponse = require('../middleware/apiResponse'); // ✅ Only this line should exist

// JWT utility functions
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

class UserController {

  // SSO Login Handler
  static async initiateSSO(req, res) {
    try {
      const ssoUrl = `https://simplycodingcourses.com/auth/authorize?` +
        `client_id=${process.env.SSO_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent('https://engineersmith.com/auth/callback')}&` +
        `response_type=code&` +
        `scope=email profile`;

      res.redirect(ssoUrl);
    } catch (error) {
      console.error('SSO initiation error:', error);
      return apiResponse.error(res, 'Failed to initiate SSO', 500);
    }
  }

  // SSO Callback Handler
  static async handleSSOCallback(req, res) {
    try {
      const { code } = req.query;

      if (!code) {
        return apiResponse.error(res, 'Authorization code missing', 400);
      }

      // In production, exchange code for user info with SSO provider
      // For demo purposes, we'll mock this
      const mockUserData = {
        id: 'sso_user_123',
        email: 'student@simplycodingcourses.com',
        firstName: 'Demo',
        lastName: 'Student'
      };

      // Find or create user
      let user = await User.findOne({
        $or: [
          { ssoId: mockUserData.id },
          { email: mockUserData.email }
        ]
      });

      if (!user) {
        user = new User({
          email: mockUserData.email,
          ssoProvider: 'simplycoding',
          ssoId: mockUserData.id,
          profile: {
            firstName: mockUserData.firstName,
            lastName: mockUserData.lastName
          }
        });
      } else {
        // Update existing user
        user.lastLogin = new Date();
        user.ssoId = mockUserData.id;
        user.ssoProvider = 'simplycoding';
      }

      const { accessToken, refreshToken } = generateTokens(user);

      // Store refresh token
      user.refreshToken = refreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      setAuthCookie(res, accessToken);
      res.redirect('/dashboard');

    } catch (error) {
      console.error('SSO callback error:', error);
      return apiResponse.error(res, 'Authentication failed', 500);
    }
  }

  // Local Login Handler
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return apiResponse.error(res, 'Email and password required', 400);
      }

      const user = await User.findOne({ email, isActive: true });

      if (!user || !await user.comparePassword(password)) {
        return apiResponse.error(res, 'Invalid credentials', 401);
      }

      const { accessToken, refreshToken } = generateTokens(user);

      // Store refresh token
      user.refreshToken = refreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      user.lastLogin = new Date();
      await user.save();

      setAuthCookie(res, accessToken);

      return apiResponse.success(res, {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      return apiResponse.error(res, 'Login failed', 500);
    }
  }

  // Registration Handler
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return apiResponse.error(res, 'All fields are required', 400);
      }

      if (password.length < 8) {
        return apiResponse.error(res, 'Password must be at least 8 characters', 400);
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return apiResponse.error(res, 'User already exists', 409);
      }

      const user = new User({
        email,
        password,
        profile: { firstName, lastName }
      });

      await user.save();

      const { accessToken, refreshToken } = generateTokens(user);

      user.refreshToken = refreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      setAuthCookie(res, accessToken);

      return apiResponse.success(res, {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      }, 'Registration successful', 201);

    } catch (error) {
      console.error('Registration error:', error);
      return apiResponse.error(res, 'Registration failed', 500);
    }
  }

  // Refresh Token Handler
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return apiResponse.error(res, 'Refresh token required', 401);
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findOne({
        _id: decoded.userId,
        refreshToken,
        refreshTokenExpiry: { $gt: new Date() }
      });

      if (!user) {
        return apiResponse.error(res, 'Invalid refresh token', 403);
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      user.refreshToken = newRefreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      setAuthCookie(res, accessToken);

      return apiResponse.success(res, {
        refreshToken: newRefreshToken
      }, 'Token refreshed successfully');

    } catch (error) {
      console.error('Token refresh error:', error);
      return apiResponse.error(res, 'Token refresh failed', 403);
    }
  }

  // Logout Handler
  static async logout(req, res) {
    try {
      await User.updateOne(
        { _id: req.user.userId },
        { $unset: { refreshToken: 1, refreshTokenExpiry: 1 } }
      );

      res.clearCookie('token');
      return apiResponse.success(res, null, 'Logged out successfully');

    } catch (error) {
      console.error('Logout error:', error);
      return apiResponse.error(res, 'Logout failed', 500);
    }
  }

  // Get Current User Info
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .select('-password -refreshToken');

      if (!user) {
        return apiResponse.error(res, 'User not found', 404);
      }

      return apiResponse.success(res, {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          testHistory: user.testHistory,
          lastLogin: user.lastLogin,
          ssoProvider: user.ssoProvider
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      return apiResponse.error(res, 'Failed to get user info', 500);
    }
  }

  // Get All Users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const users = await User.find({ isActive: true })
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments({ isActive: true });

      const formattedUsers = users.map(user => ({
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        lastLogin: user.lastLogin,
        ssoProvider: user.ssoProvider,
        createdAt: user.createdAt
      }));

      return apiResponse.paginated(res, formattedUsers, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      });

    } catch (error) {
      console.error('Get all users error:', error);
      return apiResponse.error(res, 'Failed to get users', 500);
    }
  }

  // Update User Profile
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, organization } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return apiResponse.error(res, 'User not found', 404);
      }

      if (firstName) user.profile.firstName = firstName;
      if (lastName) user.profile.lastName = lastName;
      if (organization) user.profile.organization = organization;

      await user.save();

      return apiResponse.success(res, {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      }, 'Profile updated successfully');

    } catch (error) {
      console.error('Profile update error:', error);
      return apiResponse.error(res, 'Failed to update profile', 500);
    }
  }
}

module.exports = UserController;