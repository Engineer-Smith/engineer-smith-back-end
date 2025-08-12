// app/controllers/questionController.js
const Question = require('../models/Question');
const User = require('../models/User');

class QuestionController {
  
  // Create admin or instructor user (Admin only)
  static async createUserWithRole(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const { email, password, firstName, lastName, role } = req.body;
      
      // Validate required fields
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ 
          error: 'All fields are required',
          required: ['email', 'password', 'firstName', 'lastName', 'role']
        });
      }
      
      // Validate role
      if (!['student', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be student, instructor, or admin' });
      }
      
      // Check password strength
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      
      // Create user with specified role
      const user = new User({
        email,
        password,
        role,
        profile: { firstName, lastName }
      });
      
      await user.save();
      
      res.status(201).json({
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          createdAt: user.createdAt
        }
      });
      
    } catch (error) {
      console.error('Create user with role error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
  
  // Update user role (Admin only)
  static async updateUserRole(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const { role } = req.body;
      const userId = req.params.id;
      
      // Validate role
      if (!['student', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be student, instructor, or admin' });
      }
      
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Prevent admin from demoting themselves
      if (user._id.toString() === req.user.userId && role !== 'admin') {
        return res.status(400).json({ error: 'Cannot change your own admin role' });
      }
      
      const oldRole = user.role;
      user.role = role;
      await user.save();
      
      res.json({
        success: true,
        message: `User role updated from ${oldRole} to ${role}`,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      });
      
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }

  // Create question
  static async createQuestion(req, res) {
    try {
      const { title, description, type, skill, category, difficulty, content, points, timeEstimate, weight, tags } = req.body;
      
      // Validate required fields
      if (!title || !description || !type || !skill) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['title', 'description', 'type', 'skill']
        });
      }
      
      // Build question from UI data
      const questionData = {
        ...req.body,
        createdBy: req.user.userId,
        createdByRole: req.user.role
      };
      
      const question = Question.createFromUI(questionData);
      await question.save();
      
      const responseMessage = req.user.role === 'admin' 
        ? 'Question created and activated successfully'
        : 'Question submitted for review';
      
      res.status(201).json({
        success: true,
        message: responseMessage,
        question: {
          id: question._id,
          title: question.title,
          status: question.status,
          type: question.type,
          points: question.points
        }
      });
      
    } catch (error) {
      console.error('Create question error:', error);
      res.status(500).json({ error: 'Failed to create question' });
    }
  }
  
  // Get all questions with filtering and pagination
  static async getAllQuestions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Build filter query
      const filter = {};
      
      if (req.query.skill) filter.skill = req.query.skill;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.difficulty) filter.difficulty = req.query.difficulty;
      if (req.query.category) filter.category = new RegExp(req.query.category, 'i');
      if (req.query.status) filter.status = req.query.status;
      if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
      
      // Search in title/description
      if (req.query.search) {
        filter.$or = [
          { title: new RegExp(req.query.search, 'i') },
          { description: new RegExp(req.query.search, 'i') }
        ];
      }
      
      // Non-admins only see active questions (unless viewing their own)
      if (req.user.role !== 'admin') {
        if (req.query.myQuestions === 'true') {
          filter.createdBy = req.user.userId;
        } else {
          filter.status = 'active';
        }
      }
      
      // Sort options
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortBy]: sortOrder };
      
      const questions = await Question.find(filter)
        .populate('createdBy', 'profile.firstName profile.lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-content.testCases.brokenResult -usageStats.testCaseStats'); // Hide internal data
      
      const total = await Question.countDocuments(filter);
      
      res.json({
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          applied: filter,
          available: {
            skills: ['javascript', 'react', 'html', 'css', 'python'],
            types: ['multiple_choice', 'true_false', 'code_challenge', 'debug_fix'],
            difficulties: ['beginner', 'intermediate', 'advanced']
          }
        }
      });
      
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({ error: 'Failed to retrieve questions' });
    }
  }
  
  // Get single question by ID
  static async getQuestionById(req, res) {
    try {
      const question = await Question.findById(req.params.id)
        .populate('createdBy', 'profile.firstName profile.lastName email role')
        .populate('suggestion.reviewedBy', 'profile.firstName profile.lastName');
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      // Check permissions
      const canView = req.user.role === 'admin' || 
                     question.status === 'active' || 
                     question.createdBy._id.toString() === req.user.userId;
      
      if (!canView) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Include evaluation config for admins/creators
      let evaluationConfig = null;
      if (req.user.role === 'admin' || question.createdBy._id.toString() === req.user.userId) {
        evaluationConfig = question.getEvaluationConfig();
      }
      
      res.json({
        question: {
          ...question.toObject(),
          evaluationConfig
        }
      });
      
    } catch (error) {
      console.error('Get question error:', error);
      res.status(500).json({ error: 'Failed to retrieve question' });
    }
  }
  
  // Update question (Creator or Admin only)
  static async updateQuestion(req, res) {
    try {
      const question = await Question.findById(req.params.id);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      // Check permissions
      const canEdit = req.user.role === 'admin' || 
                     question.createdBy.toString() === req.user.userId;
      
      if (!canEdit) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // If instructor edits approved question, reset to pending
      if (req.user.role !== 'admin' && question.status === 'active') {
        req.body.status = 'pending_review';
      }
      
      // Update fields
      Object.keys(req.body).forEach(key => {
        if (key !== '_id' && key !== 'createdBy' && key !== 'createdByRole') {
          question[key] = req.body[key];
        }
      });
      
      question.lastModified = new Date();
      question.lastModifiedBy = req.user.userId;
      question.version += 1;
      
      await question.save();
      
      res.json({
        success: true,
        message: 'Question updated successfully',
        question: {
          id: question._id,
          title: question.title,
          status: question.status,
          version: question.version
        }
      });
      
    } catch (error) {
      console.error('Update question error:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  }
  
  // Delete question (Admin only, or creator if pending)
  static async deleteQuestion(req, res) {
    try {
      const question = await Question.findById(req.params.id);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      // Check permissions
      const canDelete = req.user.role === 'admin' || 
                       (question.createdBy.toString() === req.user.userId && 
                        question.status === 'pending_review');
      
      if (!canDelete) {
        return res.status(403).json({ error: 'Cannot delete this question' });
      }
      
      // Soft delete - mark as retired instead of removing
      if (question.usageStats.timesUsed > 0) {
        question.status = 'retired';
        await question.save();
        
        res.json({
          success: true,
          message: 'Question retired (has usage history)'
        });
      } else {
        await Question.findByIdAndDelete(req.params.id);
        
        res.json({
          success: true,
          message: 'Question deleted successfully'
        });
      }
      
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  }
  
  // Admin: Get pending questions for review
  static async getPendingQuestions(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const pendingQuestions = await Question.find({ status: 'pending_review' })
        .populate('createdBy', 'profile.firstName profile.lastName email')
        .sort({ createdAt: 1 }) // Oldest first
        .select('-usageStats'); // Don't need stats for pending questions
      
      // Group by creator for easier review
      const groupedByCreator = pendingQuestions.reduce((acc, question) => {
        const creatorId = question.createdBy._id.toString();
        if (!acc[creatorId]) {
          acc[creatorId] = {
            creator: question.createdBy,
            questions: []
          };
        }
        acc[creatorId].questions.push(question);
        return acc;
      }, {});
      
      res.json({
        pendingQuestions,
        groupedByCreator: Object.values(groupedByCreator),
        summary: {
          total: pendingQuestions.length,
          byType: pendingQuestions.reduce((acc, q) => {
            acc[q.type] = (acc[q.type] || 0) + 1;
            return acc;
          }, {}),
          bySkill: pendingQuestions.reduce((acc, q) => {
            acc[q.skill] = (acc[q.skill] || 0) + 1;
            return acc;
          }, {})
        }
      });
      
    } catch (error) {
      console.error('Get pending questions error:', error);
      res.status(500).json({ error: 'Failed to retrieve pending questions' });
    }
  }
  
  // Admin: Approve/Reject question
  static async reviewQuestion(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const { action, reviewNotes } = req.body; // action: 'approve' | 'reject'
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be approve or reject' });
      }
      
      const question = await Question.findById(req.params.id)
        .populate('createdBy', 'email profile.firstName profile.lastName');
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      if (question.status !== 'pending_review') {
        return res.status(400).json({ error: 'Question is not pending review' });
      }
      
      // Update question status and suggestion info
      question.status = action === 'approve' ? 'active' : 'rejected';
      question.suggestion = {
        submittedAt: question.createdAt,
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || '',
        approved: action === 'approve'
      };
      
      await question.save();
      
      // TODO: Send notification email to question creator
      
      res.json({
        success: true,
        message: `Question ${action}d successfully`,
        question: {
          id: question._id,
          title: question.title,
          status: question.status,
          creator: question.createdBy
        }
      });
      
    } catch (error) {
      console.error('Review question error:', error);
      res.status(500).json({ error: 'Failed to review question' });
    }
  }
  
  // Admin: Bulk approve/reject questions
  static async bulkReviewQuestions(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const { questionIds, action, reviewNotes } = req.body;
      
      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ error: 'Question IDs array required' });
      }
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }
      
      const questions = await Question.find({
        _id: { $in: questionIds },
        status: 'pending_review'
      });
      
      const updatePromises = questions.map(question => {
        question.status = action === 'approve' ? 'active' : 'rejected';
        question.suggestion = {
          submittedAt: question.createdAt,
          reviewedBy: req.user.userId,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || '',
          approved: action === 'approve'
        };
        return question.save();
      });
      
      await Promise.all(updatePromises);
      
      res.json({
        success: true,
        message: `${questions.length} questions ${action}d successfully`,
        processedCount: questions.length
      });
      
    } catch (error) {
      console.error('Bulk review error:', error);
      res.status(500).json({ error: 'Failed to bulk review questions' });
    }
  }
  
  // Get question analytics (Admin only)
  static async getQuestionAnalytics(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const questionId = req.params.id;
      const question = await Question.findById(questionId);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      // Calculate analytics
      const analytics = {
        basic: {
          timesUsed: question.usageStats.timesUsed,
          totalAttempts: question.usageStats.totalAttempts,
          successRate: question.usageStats.successRate,
          averageTime: question.usageStats.averageTime,
          lastUsed: question.usageStats.lastUsed
        },
        
        performance: {
          difficulty: question.usageStats.successRate < 0.3 ? 'too_hard' : 
                     question.usageStats.successRate > 0.9 ? 'too_easy' : 'appropriate',
          timeSpent: question.usageStats.averageTime > question.timeEstimate * 1.5 ? 'too_long' : 'appropriate',
          recommendation: this._generateRecommendation(question)
        },
        
        // Type-specific analytics
        typeSpecific: this._getTypeSpecificAnalytics(question)
      };
      
      res.json({ analytics });
      
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
  }
  
  // Helper: Generate recommendation based on analytics
  static _generateRecommendation(question) {
    const stats = question.usageStats;
    
    if (stats.totalAttempts < 10) {
      return 'Need more data for reliable recommendation';
    }
    
    if (stats.successRate < 0.3) {
      return 'Consider: reducing difficulty, adding hints, or reviewing question clarity';
    }
    
    if (stats.successRate > 0.9) {
      return 'Consider: increasing difficulty or adding edge cases';
    }
    
    if (stats.averageTime > question.timeEstimate * 2) {
      return 'Students taking longer than expected - consider simplifying or adding guidance';
    }
    
    return 'Question performing well';
  }
  
  // Helper: Get analytics specific to question type
  static _getTypeSpecificAnalytics(question) {
    switch(question.type) {
      case 'multiple_choice':
        return {
          optionDistribution: question.usageStats.optionStats,
          distractorEffectiveness: this._analyzeDistractors(question.usageStats.optionStats)
        };
        
      case 'true_false':
        return {
          trueVsFalse: question.usageStats.optionStats
        };
        
      case 'code_challenge':
      case 'debug_fix':
        return {
          testCasePerformance: question.usageStats.testCaseStats,
          commonFailures: this._analyzeTestCaseFailures(question.usageStats.testCaseStats)
        };
        
      default:
        return {};
    }
  }
  
  // Helper: Analyze distractor effectiveness for MC questions
  static _analyzeDistractors(optionStats) {
    if (!optionStats || optionStats.length === 0) return null;
    
    const total = optionStats.reduce((sum, count) => sum + count, 0);
    const percentages = optionStats.map(count => total > 0 ? (count / total) * 100 : 0);
    
    return {
      balanced: percentages.every(p => p >= 5), // No option selected less than 5%
      effectiveDistractors: percentages.filter((p, i) => i !== 0 && p > 10).length // Wrong options chosen >10%
    };
  }
  
  // Helper: Analyze test case failures
  static _analyzeTestCaseFailures(testCaseStats) {
    if (!testCaseStats || testCaseStats.length === 0) return null;
    
    return testCaseStats
      .filter(tc => tc.successRate < 0.5)
      .map(tc => ({
        testCase: tc.testCaseId,
        successRate: tc.successRate,
        suggestion: tc.successRate < 0.2 ? 'Consider removing or simplifying' : 'May need clarification'
      }));
  }
  
  // Bulk create questions (Admin only - for seeding database)
  static async addManyQuestions(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required for bulk operations' });
      }
      
      const { questions } = req.body;
      
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Questions array is required' });
      }
      
      if (questions.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 questions per batch' });
      }
      
      const results = {
        created: [],
        errors: [],
        summary: {
          total: questions.length,
          successful: 0,
          failed: 0
        }
      };
      
      // Process each question
      for (let i = 0; i < questions.length; i++) {
        try {
          const questionData = {
            ...questions[i],
            createdBy: req.user.userId,
            createdByRole: 'admin' // Admin creates directly active
          };
          
          const question = Question.createFromUI(questionData);
          await question.save();
          
          results.created.push({
            index: i,
            id: question._id,
            title: question.title,
            type: question.type,
            status: question.status
          });
          
          results.summary.successful++;
          
        } catch (error) {
          console.error(`Error creating question ${i}:`, error);
          results.errors.push({
            index: i,
            title: questions[i].title || 'Unknown',
            error: error.message
          });
          
          results.summary.failed++;
        }
      }
      
      const statusCode = results.summary.failed > 0 ? 207 : 201; // 207 = Multi-Status
      
      res.status(statusCode).json({
        success: results.summary.failed === 0,
        message: `Bulk import completed: ${results.summary.successful} created, ${results.summary.failed} failed`,
        results
      });
      
    } catch (error) {
      console.error('Bulk create error:', error);
      res.status(500).json({ error: 'Failed to process bulk import' });
    }
  }

  // Get question bank statistics (Admin only)
  static async getQuestionBankStats(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const stats = await Question.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            
            byType: {
              $push: {
                type: '$type',
                skill: '$skill',
                difficulty: '$difficulty',
                status: '$status'
              }
            }
          }
        }
      ]);
      
      if (stats.length === 0) {
        return res.json({ message: 'No questions in database yet' });
      }
      
      const summary = stats[0];
      
      // Calculate distributions
      const typeDistribution = summary.byType.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {});
      
      const skillDistribution = summary.byType.reduce((acc, q) => {
        acc[q.skill] = (acc[q.skill] || 0) + 1;
        return acc;
      }, {});
      
      const difficultyDistribution = summary.byType.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {});
      
      res.json({
        summary: {
          total: summary.total,
          active: summary.active,
          pending: summary.pending,
          rejected: summary.rejected,
          activePercentage: Math.round((summary.active / summary.total) * 100)
        },
        distributions: {
          byType: typeDistribution,
          bySkill: skillDistribution,
          byDifficulty: difficultyDistribution
        }
      });
      
    } catch (error) {
      console.error('Get question bank stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve statistics' });
    }
  }
}

module.exports = QuestionController;