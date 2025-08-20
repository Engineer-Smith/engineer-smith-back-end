// /controllers/userController.js
const User = require('../models/User');
const Organization = require('../models/Organization');
const bcrypt = require('bcrypt');
const createError = require('http-errors');

const SALT_ROUNDS = 10;

// Register a new user (public)
const registerUser = async (req, res, next) => {
  try {
    const { loginId, loginType, password, inviteCode, role = 'student' } = req.body;

    // Validate input
    if (!loginId || !loginType || !inviteCode || (loginType !== 'username' && loginType !== 'email')) {
      throw createError(400, 'loginId, loginType (username/email), and inviteCode are required');
    }
    if (!password) {
      throw createError(400, 'Password is required for manual registration');
    }
    if (!['admin', 'instructor', 'student'].includes(role)) {
      throw createError(400, 'Invalid role');
    }

    // Validate inviteCode
    const organization = await Organization.findOne({ inviteCode });
    if (!organization) {
      throw createError(404, 'Invalid invite code');
    }

    // Check if loginId is unique
    const existingUser = await User.findOne({ loginId });
    if (existingUser) {
      throw createError(409, 'loginId already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = new User({
      loginId,
      loginType,
      hashedPassword,
      organizationId: organization._id,
      role,
      isSSO: false,
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      loginId: user.loginId,
      loginType: user.loginType,
      organizationId: user.organizationId,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

// Get user details (super org admins or org admins)
const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.user; // From JWT middleware

    // Validate access: super org admin or same org
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw createError(404, 'User not found');
    }
    if (!user.isSuperOrgAdmin && user.organizationId.toString() !== targetUser.organizationId.toString()) {
      throw createError(403, 'Unauthorized to access this user');
    }

    res.json({
      id: targetUser._id,
      loginId: targetUser.loginId,
      loginType: targetUser.loginType,
      organizationId: targetUser.organizationId,
      role: targetUser.role,
      isSSO: targetUser.isSSO,
    });
  } catch (error) {
    next(error);
  }
};

// List users (super org admins or org admins)
const getAllUsers = async (req, res, next) => {
  try {
    const { orgId, limit = 10, skip = 0 } = req.query;
    const user = req.user; // From JWT middleware

    let query = {};
    if (!user.isSuperOrgAdmin) {
      // Org admins: restrict to their org
      if (!orgId || orgId !== user.organizationId.toString()) {
        throw createError(403, 'Unauthorized to access users outside your organization');
      }
      query.organizationId = user.organizationId;
    } else if (orgId) {
      // Super org admins: optional orgId filter
      query.organizationId = orgId;
    }

    const users = await User.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('loginId loginType organizationId role isSSO');

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Update user details (super org admins or org admins)
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { loginId, loginType, password, role } = req.body;
    const user = req.user; // From JWT middleware

    // Validate access: super org admin or same org
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw createError(404, 'User not found');
    }
    if (!user.isSuperOrgAdmin && user.organizationId.toString() !== targetUser.organizationId.toString()) {
      throw createError(403, 'Unauthorized to update this user');
    }

    // Validate input
    if (!loginId && !loginType && !password && !role) {
      throw createError(400, 'At least one field (loginId, loginType, password, role) is required');
    }
    if (loginType && loginType !== 'username' && loginType !== 'email') {
      throw createError(400, 'Invalid loginType');
    }
    if (role && !['admin', 'instructor', 'student'].includes(role)) {
      throw createError(400, 'Invalid role');
    }

    // Check loginId uniqueness
    if (loginId) {
      const existingUser = await User.findOne({ loginId, _id: { $ne: userId } });
      if (existingUser) {
        throw createError(409, 'loginId already exists');
      }
    }

    // Prepare update
    const updateData = { updatedAt: Date.now() };
    if (loginId) updateData.loginId = loginId;
    if (loginType) updateData.loginType = loginType;
    if (password) updateData.hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      id: updatedUser._id,
      loginId: updatedUser.loginId,
      loginType: updatedUser.loginType,
      organizationId: updatedUser.organizationId,
      role: updatedUser.role,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a user (super org admins or org admins)
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.user; // From JWT middleware

    // Validate access
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw createError(404, 'User not found');
    }
    if (!user.isSuperOrgAdmin && user.organizationId.toString() !== targetUser.organizationId.toString()) {
      throw createError(403, 'Unauthorized to delete this user');
    }

    await User.deleteOne({ _id: userId });

    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
};