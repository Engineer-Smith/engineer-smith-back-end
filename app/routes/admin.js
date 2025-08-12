// app/routes/admin.js - Add these pieces to your existing file

const express = require('express');
const QuestionController = require('../controllers/questionController');
const UserController = require('../controllers/userController');
const apiResponse = require('../middleware/apiResponse'); // ✅ ADD THIS LINE
const { authenticateToken, requireAdmin, apiRateLimit } = require('../middleware/auth');

const adminRouter = express.Router();

// All admin routes require authentication and admin role
adminRouter.use(authenticateToken);
adminRouter.use(requireAdmin);
adminRouter.use(apiRateLimit);

// Dashboard overview - KEEP AS IS
adminRouter.get('/dashboard', async (req, res) => {
  try {
    // Get quick stats for dashboard
    const [questionStats, userStats] = await Promise.all([
      QuestionController.getQuestionBankStats(req, res),
      UserController.getAllUsers(req, res)
    ]);
    
    // This would normally aggregate the data, but for now return basic info
    res.json({
      message: 'Admin dashboard data',
      timestamp: new Date().toISOString(),
      sections: [
        'question-bank-stats',
        'pending-questions', 
        'user-management',
        'test-sessions',
        'analytics'
      ]
    });
    
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Question management endpoints - KEEP AS IS
adminRouter.get('/questions/pending', QuestionController.getPendingQuestions);
adminRouter.get('/questions/stats', QuestionController.getQuestionBankStats);
adminRouter.post('/questions/:id/review', QuestionController.reviewQuestion);
adminRouter.post('/questions/bulk-review', QuestionController.bulkReviewQuestions);

// User management endpoints
adminRouter.get('/users', UserController.getAllUsers); // KEEP AS IS

// ✅ ADD THIS NEW ENDPOINT - Create user
adminRouter.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return apiResponse.error(res, 'All fields are required', 400);
    }
    
    // Validate role
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return apiResponse.error(res, 'Invalid role. Must be student, instructor, or admin', 400);
    }
    
    // Check password strength
    if (password.length < 8) {
      return apiResponse.error(res, 'Password must be at least 8 characters', 400);
    }
    
    // Check if user already exists
    const User = require('../models/User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiResponse.error(res, 'User with this email already exists', 409);
    }
    
    // Create user with specified role
    const user = new User({
      email,
      password,
      role,
      profile: { firstName, lastName }
    });
    
    await user.save();
    
    return apiResponse.success(res, {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt
      }
    }, `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`, 201);
    
  } catch (error) {
    console.error('Create user error:', error);
    return apiResponse.error(res, 'Failed to create user', 500);
  }
});

// ✅ UPDATE THIS EXISTING ENDPOINT - Fix user role update
adminRouter.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return apiResponse.error(res, 'Invalid role', 400);
    }
    
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return apiResponse.error(res, 'User not found', 404);
    }
    
    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user.userId && role !== 'admin') {
      return apiResponse.error(res, 'Cannot change your own admin role', 400);
    }
    
    const oldRole = user.role;
    user.role = role;
    await user.save();
    
    return apiResponse.success(res, {
      user: {
        _id: user._id, // ✅ Use _id instead of id
        email: user.email,
        role: user.role
      }
    }, `User role updated from ${oldRole} to ${role}`);
    
  } catch (error) {
    console.error('Update user role error:', error);
    return apiResponse.error(res, 'Failed to update user role', 500);
  }
});

// System health and monitoring - ✅ UPDATE TO USE STANDARDIZED RESPONSE
adminRouter.get('/system/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Basic system info
    const systemInfo = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      memory: {
        used: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heap: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    };
    
    return apiResponse.success(res, systemInfo, 'System health check completed');
    
  } catch (error) {
    console.error('System health check error:', error);
    return apiResponse.error(res, 'System health check failed', 500);
  }
});

module.exports = adminRouter;