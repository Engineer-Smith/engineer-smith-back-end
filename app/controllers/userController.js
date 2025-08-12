const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { setAuthCookie } = require('../utils/setAuthCookie'); // ✅ use the new util

// JWT utility functions
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user._id.toString(), // Use _id instead of userId
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id.toString() }, // Use _id instead of userId
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
      res.status(500).json({ error: 'Failed to initiate SSO' });
    }
  }

  // SSO Callback Handler
  static async handleSSOCallback(req, res) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
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

      setAuthCookie(res, accessToken); // ✅ use util
      res.redirect('/dashboard');

    } catch (error) {
      console.error('SSO callback error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // Local Login Handler
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await User.findOne({ email, isActive: true });

      if (!user || !await user.comparePassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const { accessToken, refreshToken } = generateTokens(user);

      // Store refresh token
      user.refreshToken = refreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      user.lastLogin = new Date();
      await user.save();

      setAuthCookie(res, accessToken); // ✅ use util

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Registration Handler
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
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

      setAuthCookie(res, accessToken); // ✅ use util

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // Refresh Token Handler
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findOne({
        _id: decoded.userId,
        refreshToken,
        refreshTokenExpiry: { $gt: new Date() }
      });

      if (!user) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      user.refreshToken = newRefreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      setAuthCookie(res, accessToken); // ✅ use util

      res.json({
        success: true,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(403).json({ error: 'Token refresh failed' });
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
      res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Get Current User Info
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .select('-password -refreshToken'); // removed .populate for now

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          testHistory: user.testHistory, // still returns array, just no populated data
          lastLogin: user.lastLogin,
          ssoProvider: user.ssoProvider
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user info' });
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

      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  // Update User Profile
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, organization } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (firstName) user.profile.firstName = firstName;
      if (lastName) user.profile.lastName = lastName;
      if (organization) user.profile.organization = organization;

      await user.save();

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

module.exports = UserController;
