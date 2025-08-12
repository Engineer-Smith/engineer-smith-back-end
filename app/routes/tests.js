// app/routes/tests.js - Updated to support enhanced Test model with sections
const express = require('express');
const TestController = require('../controllers/testController');
const { authenticateToken, requireAdmin, requireInstructor, apiRateLimit } = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to all test routes
router.use(apiRateLimit);

// All routes require authentication
router.use(authenticateToken);

// =============================================================================
// TEST TEMPLATES & HELPERS (Enhanced for sections)
// =============================================================================

// Get test templates for easy test creation (Enhanced with section support)
router.get('/templates', TestController.getTestTemplates);

// Generate questions for a test based on criteria (Enhanced for sections)
router.post('/generate-questions', requireInstructor, TestController.generateTestQuestions);

// NEW: Validate section configuration
router.post('/validate-sections', requireInstructor, async (req, res) => {
  try {
    const { sections } = req.body;
    const Test = require('../models/Test');
    
    // Create a temporary test for validation
    const tempTest = new Test({
      title: 'Validation Test',
      description: 'Temporary test for section validation',
      skills: ['javascript'], // Default skill
      sections,
      settings: { useSections: true },
      createdBy: req.user.userId
    });
    
    const validation = tempTest.validateSections();
    
    res.json({
      success: validation.valid,
      validation
    });
    
  } catch (error) {
    console.error('Section validation error:', error);
    res.status(500).json({ error: 'Failed to validate sections' });
  }
});

// NEW: Get section type information
router.get('/section-types', (req, res) => {
  const Test = require('../models/Test');
  const tempTest = new Test({});
  
  const sectionTypes = [
    'mixed', 'multiple_choice', 'true_false', 'coding', 
    'debugging', 'theory', 'practical', 'custom'
  ].map(type => ({
    value: type,
    ...tempTest.getSectionTypeInfo(type)
  }));
  
  res.json({ sectionTypes });
});

// =============================================================================
// TEST MANAGEMENT (Enhanced for sections)
// =============================================================================

// Get all tests (Enhanced with section filtering)
router.get('/', TestController.getAllTests);

// Create new test (Enhanced for sections)
router.post('/', requireInstructor, TestController.createTest);

// Get single test by ID (Enhanced with section data)
router.get('/:id', TestController.getTestById);

// Update test (Enhanced for sections)
router.put('/:id', requireInstructor, TestController.updateTest);

// Delete test (Creator or Admin only - validated in controller)
router.delete('/:id', requireInstructor, TestController.deleteTest);

// Publish test (Enhanced with section validation)
router.post('/:id/publish', requireInstructor, TestController.publishTest);

// NEW: Preview test structure (for instructors)
router.get('/:id/preview', requireInstructor, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const test = await Test.findById(req.params.id)
      .populate('questions.questionId', 'title type skill difficulty timeEstimate')
      .populate('sections.questions.questionId', 'title type skill difficulty timeEstimate');

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check permissions
    const canView = req.user.role === 'admin' || 
                   test.createdBy.toString() === req.user.userId;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const preview = {
      testInfo: {
        title: test.title,
        useSections: test.settings.useSections,
        totalTime: test.totalTime,
        totalQuestions: test.settings.useSections ? 
          test.sections.reduce((sum, s) => sum + (s.questionPool.enabled ? s.questionPool.totalQuestions : s.questions.length), 0) :
          test.questions.length
      },
      structure: test.settings.useSections ? 
        test.sections.map(section => ({
          name: section.name,
          sectionType: section.sectionType,
          timeLimit: section.timeLimit,
          questionCount: section.questionPool.enabled ? 
            section.questionPool.totalQuestions : 
            section.questions.length,
          questions: section.questions.map(q => q.questionId ? ({
            title: q.questionId.title,
            type: q.questionId.type,
            skill: q.questionId.skill,
            difficulty: q.questionId.difficulty,
            timeEstimate: q.questionId.timeEstimate,
            points: q.points
          }) : null).filter(Boolean)
        })) :
        [{
          name: 'Main Test',
          sectionType: 'mixed',
          timeLimit: test.settings.timeLimit,
          questionCount: test.questions.length,
          questions: test.questions.map(q => q.questionId ? ({
            title: q.questionId.title,
            type: q.questionId.type,
            skill: q.questionId.skill,
            difficulty: q.questionId.difficulty,
            timeEstimate: q.questionId.timeEstimate,
            points: q.points
          }) : null).filter(Boolean)
        }],
      validation: test.settings.useSections ? test.validateSections() : { valid: true }
    };

    res.json({ preview });

  } catch (error) {
    console.error('Test preview error:', error);
    res.status(500).json({ error: 'Failed to generate test preview' });
  }
});

// =============================================================================
// SECTION MANAGEMENT (NEW)
// =============================================================================

// Add section to test
router.post('/:id/sections', requireInstructor, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   test.createdBy.toString() === req.user.userId;

    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (test.status === 'published' && test.stats.totalAttempts > 0) {
      return res.status(400).json({ 
        error: 'Cannot modify published test with existing attempts' 
      });
    }

    const newSection = req.body;
    newSection.order = test.sections.length + 1;
    
    test.sections.push(newSection);
    test.settings.useSections = true;
    
    const validation = test.validateSections();
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid section configuration',
        details: validation.errors
      });
    }

    await test.save();

    res.json({
      success: true,
      message: 'Section added successfully',
      section: newSection,
      validation
    });

  } catch (error) {
    console.error('Add section error:', error);
    res.status(500).json({ error: 'Failed to add section' });
  }
});

// Update section in test
router.put('/:id/sections/:sectionIndex', requireInstructor, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const test = await Test.findById(req.params.id);
    const sectionIndex = parseInt(req.params.sectionIndex);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (sectionIndex < 0 || sectionIndex >= test.sections.length) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   test.createdBy.toString() === req.user.userId;

    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (test.status === 'published' && test.stats.totalAttempts > 0) {
      return res.status(400).json({ 
        error: 'Cannot modify published test with existing attempts' 
      });
    }

    // Update section
    Object.assign(test.sections[sectionIndex], req.body);
    
    const validation = test.validateSections();
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid section configuration',
        details: validation.errors
      });
    }

    await test.save();

    res.json({
      success: true,
      message: 'Section updated successfully',
      section: test.sections[sectionIndex],
      validation
    });

  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Remove section from test
router.delete('/:id/sections/:sectionIndex', requireInstructor, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const test = await Test.findById(req.params.id);
    const sectionIndex = parseInt(req.params.sectionIndex);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (sectionIndex < 0 || sectionIndex >= test.sections.length) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   test.createdBy.toString() === req.user.userId;

    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (test.status === 'published' && test.stats.totalAttempts > 0) {
      return res.status(400).json({ 
        error: 'Cannot modify published test with existing attempts' 
      });
    }

    // Remove section
    test.sections.splice(sectionIndex, 1);
    
    // Re-order remaining sections
    test.sections.forEach((section, index) => {
      section.order = index + 1;
    });

    // If no sections left, disable section mode
    if (test.sections.length === 0) {
      test.settings.useSections = false;
    }

    await test.save();

    res.json({
      success: true,
      message: 'Section removed successfully'
    });

  } catch (error) {
    console.error('Remove section error:', error);
    res.status(500).json({ error: 'Failed to remove section' });
  }
});

// =============================================================================
// TEST TAKING (Enhanced for sections)
// =============================================================================

// Start a test session (Enhanced for sections)
router.post('/:id/start', TestController.startTestSession);

// Submit an answer to a question (Enhanced for sections)
router.post('/sessions/:sessionId/answer', TestController.submitAnswer);

// NEW: Submit section completion
router.post('/sessions/:sessionId/complete-section/:sectionIndex', async (req, res) => {
  try {
    const TestSession = require('../models/TestSession');
    const { sessionId, sectionIndex } = req.params;

    const session = await TestSession.findById(sessionId)
      .populate('testId');

    if (!session) {
      return res.status(404).json({ error: 'Test session not found' });
    }

    if (session.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (session.status !== 'in_progress' || session.isExpired()) {
      return res.status(400).json({ error: 'Test session is no longer active' });
    }

    const sectionIdx = parseInt(sectionIndex);
    if (!session.testId.settings.useSections || 
        sectionIdx < 0 || 
        sectionIdx >= session.testId.sections.length) {
      return res.status(400).json({ error: 'Invalid section' });
    }

    // Mark section as completed in session metadata
    if (!session.metadata.completedSections) {
      session.metadata.completedSections = [];
    }

    if (!session.metadata.completedSections.includes(sectionIdx)) {
      session.metadata.completedSections.push(sectionIdx);
    }

    await session.save();

    const isLastSection = session.metadata.completedSections.length === session.testId.sections.length;

    res.json({
      success: true,
      message: 'Section completed',
      sectionIndex: sectionIdx,
      isLastSection,
      totalSections: session.testId.sections.length,
      completedSections: session.metadata.completedSections.length
    });

  } catch (error) {
    console.error('Complete section error:', error);
    res.status(500).json({ error: 'Failed to complete section' });
  }
});

// Complete test session (Enhanced for sections)
router.post('/sessions/:sessionId/complete', TestController.completeTestSession);

// =============================================================================
// RESULTS & ANALYTICS (Enhanced for sections)
// =============================================================================

// Get test session results (Enhanced with section breakdown)
router.get('/sessions/:sessionId/results', TestController.getTestResults);

// Get test analytics (Enhanced with section analytics)
router.get('/:id/analytics', requireInstructor, TestController.getTestAnalytics);

// NEW: Get section-specific analytics
router.get('/:id/analytics/sections', requireInstructor, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const TestSession = require('../models/TestSession');
    
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check permissions
    const canView = req.user.role === 'admin' || 
                   test.createdBy.toString() === req.user.userId;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!test.settings.useSections) {
      return res.status(400).json({ error: 'Test does not use sections' });
    }

    // Get completed sessions
    const sessions = await TestSession.find({
      testId: test._id,
      status: 'completed'
    });

    const sectionAnalytics = test.sections.map((section, sectionIndex) => {
      const sectionQuestions = sessions.map(session => 
        session.questions.filter(q => q.sectionIndex === sectionIndex)
      ).flat();

      const totalAttempts = sectionQuestions.length;
      const correctAnswers = sectionQuestions.filter(q => q.isCorrect).length;

      return {
        sectionIndex,
        name: section.name,
        sectionType: section.sectionType,
        timeLimit: section.timeLimit,
        questionCount: section.questionPool.enabled ? 
          section.questionPool.totalQuestions : 
          section.questions.length,
        
        performance: {
          totalAttempts,
          successRate: totalAttempts > 0 ? (correctAnswers / totalAttempts * 100) : 0,
          averageTime: totalAttempts > 0 ? 
            sectionQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0) / totalAttempts : 0,
          averageScore: totalAttempts > 0 ? 
            sectionQuestions.reduce((sum, q) => sum + (q.pointsAwarded || 0), 0) / totalAttempts : 0
        },

        completionRate: sessions.length > 0 ? 
          sessions.filter(s => s.metadata?.completedSections?.includes(sectionIndex)).length / sessions.length * 100 : 0
      };
    });

    res.json({
      testId: test._id,
      testTitle: test.title,
      totalSessions: sessions.length,
      sectionAnalytics
    });

  } catch (error) {
    console.error('Section analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve section analytics' });
  }
});

// =============================================================================
// EXISTING ADMIN ROUTES (Updated for sections)
// =============================================================================

// Get all test sessions for a test (Admin only)
router.get('/:id/sessions', requireAdmin, async (req, res) => {
  try {
    const TestSession = require('../models/TestSession');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { testId: req.params.id };
    
    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sessions = await TestSession.find(filter)
      .populate('userId', 'profile.firstName profile.lastName email')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TestSession.countDocuments(filter);

    res.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get test sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve test sessions' });
  }
});

// Archive/Unarchive test (Admin only)
router.patch('/:id/archive', requireAdmin, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    test.status = test.status === 'archived' ? 'draft' : 'archived';
    await test.save();

    res.json({
      success: true,
      message: `Test ${test.status === 'archived' ? 'archived' : 'unarchived'} successfully`,
      test: {
        id: test._id,
        title: test.title,
        status: test.status
      }
    });

  } catch (error) {
    console.error('Archive test error:', error);
    res.status(500).json({ error: 'Failed to archive test' });
  }
});

// Duplicate test (Instructor/Admin) - Enhanced for sections
router.post('/:id/duplicate', requireInstructor, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const originalTest = await Test.findById(req.params.id);

    if (!originalTest) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check permissions - can duplicate own tests or if admin
    const canDuplicate = req.user.role === 'admin' || 
                        originalTest.createdBy.toString() === req.user.userId;

    if (!canDuplicate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create duplicate
    const duplicateData = originalTest.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.__v;

    // Modify for duplicate
    duplicateData.title = `${originalTest.title} (Copy)`;
    duplicateData.status = 'draft';
    duplicateData.createdBy = req.user.userId;
    duplicateData.stats = {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      averageTime: 0,
      passRate: 0,
      sectionStats: [], // Reset section stats
      poolStats: { questionsUsed: [], questionFrequency: [] } // Reset pool stats
    };

    const duplicateTest = new Test(duplicateData);
    await duplicateTest.save();

    res.status(201).json({
      success: true,
      message: 'Test duplicated successfully',
      test: {
        id: duplicateTest._id,
        title: duplicateTest.title,
        status: duplicateTest.status,
        useSections: duplicateTest.settings.useSections,
        sectionCount: duplicateTest.sections.length
      }
    });

  } catch (error) {
    console.error('Duplicate test error:', error);
    res.status(500).json({ error: 'Failed to duplicate test' });
  }
});

// Bulk operations (Admin only) - Enhanced for sections
router.post('/bulk', requireAdmin, async (req, res) => {
  try {
    const { action, testIds } = req.body;

    if (!Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({ error: 'Test IDs array required' });
    }

    if (!['publish', 'archive', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const Test = require('../models/Test');
    const TestSession = require('../models/TestSession');
    const results = {
      successful: [],
      failed: [],
      summary: {
        total: testIds.length,
        successful: 0,
        failed: 0
      }
    };

    for (const testId of testIds) {
      try {
        const test = await Test.findById(testId);
        
        if (!test) {
          results.failed.push({ testId, error: 'Test not found' });
          continue;
        }

        switch (action) {
          case 'publish':
            // Enhanced validation for sections
            let hasQuestions = false;
            if (test.settings.useSections) {
              hasQuestions = test.sections.some(section => 
                (section.questionPool.enabled && section.questionPool.totalQuestions > 0) ||
                (!section.questionPool.enabled && section.questions.length > 0)
              );
            } else {
              hasQuestions = test.questions.length > 0 || test.questionPool.enabled;
            }
            
            if (!hasQuestions) {
              results.failed.push({ testId, error: 'Cannot publish test without questions' });
              continue;
            }
            
            // Validate sections if using them
            if (test.settings.useSections) {
              const validation = test.validateSections();
              if (!validation.valid) {
                results.failed.push({ testId, error: 'Invalid section configuration' });
                continue;
              }
            }
            
            test.status = 'published';
            await test.save();
            break;

          case 'archive':
            test.status = 'archived';
            await test.save();
            break;

          case 'delete':
            // Check if test has attempts
            const sessionCount = await TestSession.countDocuments({ testId: testId });
            if (sessionCount > 0) {
              results.failed.push({ testId, error: 'Cannot delete test with existing attempts' });
              continue;
            }
            await Test.findByIdAndDelete(testId);
            break;
        }

        results.successful.push({ testId, title: test.title });
        results.summary.successful++;

      } catch (error) {
        results.failed.push({ testId, error: error.message });
        results.summary.failed++;
      }
    }

    const statusCode = results.summary.failed > 0 ? 207 : 200; // 207 = Multi-Status

    res.status(statusCode).json({
      success: results.summary.failed === 0,
      message: `Bulk ${action} completed: ${results.summary.successful} successful, ${results.summary.failed} failed`,
      results
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ error: 'Failed to process bulk operation' });
  }
});

// =============================================================================
// STUDENT DASHBOARD ROUTES (Enhanced for sections)
// =============================================================================

// Get student's test history (Enhanced with section info)
router.get('/student/history', async (req, res) => {
  try {
    const TestSession = require('../models/TestSession');
    
    const sessions = await TestSession.find({ 
      userId: req.user.userId,
      status: 'completed'
    })
    .populate('testId', 'title skills testType settings.useSections sections.name')
    .sort({ completedAt: -1 });

    const history = sessions.map(session => ({
      sessionId: session._id,
      testId: session.testId._id,
      testTitle: session.testId.title,
      skills: session.testId.skills,
      testType: session.testId.testType,
      useSections: session.testId.settings.useSections,
      sectionCount: session.testId.sections ? session.testId.sections.length : 0,
      attemptNumber: session.attemptNumber,
      score: session.score,
      completedAt: session.completedAt,
      timeSpent: session.timeSpent
    }));

    res.json({ history });

  } catch (error) {
    console.error('Get student history error:', error);
    res.status(500).json({ error: 'Failed to retrieve test history' });
  }
});

// Get student's available tests (Enhanced with section info)
router.get('/student/available', async (req, res) => {
  try {
    const Test = require('../models/Test');
    const TestSession = require('../models/TestSession');
    
    // Get all published tests
    const tests = await Test.find({
      status: 'published',
      'settings.availableFrom': { $lte: new Date() },
      $or: [
        { 'settings.availableUntil': { $gte: new Date() } },
        { 'settings.availableUntil': null }
      ]
    })
    .select('title description skills testType settings stats sections')
    .sort({ createdAt: -1 });

    // For each test, check student's attempt status
    const testsWithStatus = await Promise.all(tests.map(async (test) => {
      const attempts = await TestSession.find({
        testId: test._id,
        userId: req.user.userId
      }).select('status score attemptNumber completedAt');

      const completedAttempts = attempts.filter(a => a.status === 'completed').length;
      const canTake = completedAttempts < test.settings.attemptsAllowed;
      const bestScore = attempts.length > 0 ? 
        Math.max(...attempts.map(a => a.score?.percentage || 0)) : null;

      const testObj = test.toObject();
      
      return {
        ...testObj,
        // Add computed fields for sections
        totalTime: test.settings.useSections ? 
          test.sections.reduce((sum, s) => sum + s.timeLimit, 0) : 
          test.settings.timeLimit,
        totalQuestions: test.settings.useSections ? 
          test.sections.reduce((sum, s) => sum + (s.questionPool.enabled ? s.questionPool.totalQuestions : s.questions.length), 0) :
          test.questions ? test.questions.length : 0,
        sectionCount: test.settings.useSections ? test.sections.length : 0,
        
        userStatus: {
          attempts: attempts.length,
          completedAttempts,
          canTake,
          bestScore,
          lastAttempt: attempts.length > 0 ? attempts[attempts.length - 1].completedAt : null
        }
      };
    }));

    res.json({ tests: testsWithStatus });

  } catch (error) {
    console.error('Get available tests error:', error);
    res.status(500).json({ error: 'Failed to retrieve available tests' });
  }
});

// =============================================================================
// INSTRUCTOR DASHBOARD ROUTES (Enhanced for sections)
// =============================================================================

// Get instructor's test summary (Enhanced with section info)
router.get('/instructor/summary', requireInstructor, async (req, res) => {
  try {
    const Test = require('../models/Test');
    const TestSession = require('../models/TestSession');
    
    // Get instructor's tests
    const tests = await Test.find({ createdBy: req.user.userId });
    
    // Get recent sessions across all instructor's tests
    const recentSessions = await TestSession.find({
      testId: { $in: tests.map(t => t._id) },
      status: 'completed'
    })
    .populate('testId', 'title settings.useSections')
    .populate('userId', 'profile.firstName profile.lastName email')
    .sort({ completedAt: -1 })
    .limit(10);

    const summary = {
      totalTests: tests.length,
      publishedTests: tests.filter(t => t.status === 'published').length,
      draftTests: tests.filter(t => t.status === 'draft').length,
      sectionBasedTests: tests.filter(t => t.settings.useSections).length,
      totalAttempts: tests.reduce((sum, t) => sum + t.stats.totalAttempts, 0),
      averagePassRate: tests.length > 0 ? 
        tests.reduce((sum, t) => sum + t.stats.passRate, 0) / tests.length : 0,
      recentSessions: recentSessions.map(session => ({
        sessionId: session._id,
        testTitle: session.testId.title,
        useSections: session.testId.settings.useSections,
        studentName: `${session.userId.profile.firstName} ${session.userId.profile.lastName}`,
        score: session.score,
        completedAt: session.completedAt
      }))
    };

    res.json({ summary });

  } catch (error) {
    console.error('Get instructor summary error:', error);
    res.status(500).json({ error: 'Failed to retrieve instructor summary' });
  }
});

module.exports = router;