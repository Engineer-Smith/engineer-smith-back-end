// app/routes/admin.js - Dedicated admin routes for dashboard
const express = require('express');
const QuestionController = require('../controllers/questionController');
const UserController = require('../controllers/userController');
const { authenticateToken, requireAdmin, apiRateLimit } = require('../middleware/auth');

const adminRouter = express.Router();

// All admin routes require authentication and admin role
adminRouter.use(authenticateToken);
adminRouter.use(requireAdmin);
adminRouter.use(apiRateLimit);

// Dashboard overview
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

// Question management endpoints
adminRouter.get('/questions/pending', QuestionController.getPendingQuestions);
adminRouter.get('/questions/stats', QuestionController.getQuestionBankStats);
adminRouter.post('/questions/:id/review', QuestionController.reviewQuestion);
adminRouter.post('/questions/bulk-review', QuestionController.bulkReviewQuestions);

// User management endpoints (extend existing user routes)
adminRouter.get('/users', UserController.getAllUsers);
adminRouter.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// System health and monitoring
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
    
    res.json(systemInfo);
    
  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({ 
      status: 'Error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = adminRouter;