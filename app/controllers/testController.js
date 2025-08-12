// app/controllers/testController.js
const Test = require('../models/Test');
const TestSession = require('../models/TestSession');
const Question = require('../models/Question');
const User = require('../models/User');

class TestController {
  
  // Create a new test (Admin/Instructor) - Enhanced for sections
  static async createTest(req, res) {
    try {
      const {
        title,
        description,
        skills, // Array of skills: ['html', 'css', 'javascript']
        testType,
        settings,
        questions, // Array of {questionId, points} - legacy support
        sections, // New: Array of section configurations
        autoGenerate,
        questionPool, // New: Global question pool
        category,
        tags
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      if (!skills || skills.length === 0) {
        return res.status(400).json({ error: 'At least one skill must be selected' });
      }

      // Enhanced settings with new options
      const testSettings = {
        timeLimit: settings?.timeLimit || 60,
        attemptsAllowed: settings?.attemptsAllowed || 1,
        shuffleQuestions: settings?.shuffleQuestions !== false,
        shuffleOptions: settings?.shuffleOptions !== false,
        showResults: settings?.showResults !== false,
        showCorrectAnswers: settings?.showCorrectAnswers || false,
        passingScore: settings?.passingScore || 70,
        availableFrom: settings?.availableFrom,
        availableUntil: settings?.availableUntil,
        instructions: settings?.instructions,
        // New settings
        useSections: settings?.useSections || false,
        useQuestionPool: settings?.useQuestionPool || false
      };

      const test = new Test({
        title,
        description,
        skills,
        testType: testType || (skills.length === 1 ? 'single_skill' : 'custom'),
        settings: testSettings,
        questions: questions || [], // Legacy support
        sections: sections || [], // New sections
        questionPool: questionPool || { enabled: false }, // New question pool
        autoGenerate: autoGenerate || { enabled: false },
        createdBy: req.user.userId,
        category,
        tags: tags || []
      });

      // Validate sections if using section-based test
      if (testSettings.useSections && sections && sections.length > 0) {
        const validation = test.validateSections();
        if (!validation.valid) {
          return res.status(400).json({ 
            error: 'Invalid section configuration',
            details: validation.errors,
            warnings: validation.warnings
          });
        }
      }

      // If auto-generate is enabled, generate questions
      if (autoGenerate?.enabled) {
        await test.generateQuestions();
      }

      await test.save();
      
      // Populate based on test structure
      if (testSettings.useSections) {
        await test.populate('sections.questions.questionId sections.questionPool.availableQuestions.questionId createdBy');
      } else {
        await test.populate('questions.questionId questionPool.availableQuestions.questionId createdBy');
      }

      res.status(201).json({
        success: true,
        message: 'Test created successfully',
        test,
        validation: testSettings.useSections ? test.validateSections() : null
      });

    } catch (error) {
      console.error('Create test error:', error);
      res.status(500).json({ error: 'Failed to create test' });
    }
  }

  // Enhanced get test templates with section support
  static async getTestTemplates(req, res) {
    try {
      const templates = Test.getTestTemplates();
      
      // For each template, get actual question counts available
      const templatesWithCounts = await Promise.all(templates.map(async (template) => {
        const skillCounts = {};
        
        for (const skill of template.skills) {
          const count = await Question.countDocuments({ 
            skill: skill, 
            status: 'active' 
          });
          skillCounts[skill] = count;
        }
        
        const totalAvailable = Object.values(skillCounts).reduce((sum, count) => sum + count, 0);
        
        // Enhanced template with section info
        return {
          ...template,
          availableQuestions: skillCounts,
          totalAvailable,
          canCreate: totalAvailable >= template.suggestedQuestions,
          // New: Section type info for templates that use sections
          sectionTypes: template.sections ? template.sections.map(section => ({
            name: section.name,
            type: section.sectionType,
            timeLimit: section.timeLimit,
            questionCount: section.questionPool?.totalQuestions || section.questions?.length || 0
          })) : null
        };
      }));

      res.json({
        templates: templatesWithCounts,
        customOption: {
          name: 'Custom Test',
          type: 'custom',
          description: 'Create your own combination of skills and question distribution',
          availableSkills: ['html', 'css', 'javascript', 'react', 'flutter', 'react_native', 'backend', 'python']
        },
        // New: Available section types
        sectionTypes: [
          { value: 'mixed', label: 'Mixed Questions', icon: '🔀', suggestedTime: 2 },
          { value: 'multiple_choice', label: 'Multiple Choice', icon: '📝', suggestedTime: 1.5 },
          { value: 'true_false', label: 'True/False', icon: '✅', suggestedTime: 1 },
          { value: 'coding', label: 'Coding Challenges', icon: '💻', suggestedTime: 8 },
          { value: 'debugging', label: 'Code Debugging', icon: '🐛', suggestedTime: 10 },
          { value: 'theory', label: 'Theory Questions', icon: '📚', suggestedTime: 1.5 },
          { value: 'practical', label: 'Practical Coding', icon: '⚡', suggestedTime: 12 },
          { value: 'custom', label: 'Custom Section', icon: '⚙️', suggestedTime: 3 }
        ]
      });

    } catch (error) {
      console.error('Get test templates error:', error);
      res.status(500).json({ error: 'Failed to retrieve test templates' });
    }
  }

  // Enhanced generate questions with section support
  static async generateTestQuestions(req, res) {
    try {
      const {
        skills,
        totalQuestions,
        distribution, // { html: 5, css: 5, javascript: 10 }
        difficulty,   // { beginner: 50, intermediate: 30, advanced: 20 }
        questionTypes, // { multiple_choice: 60, true_false: 20, code_challenge: 20 }
        sectionId,    // New: If generating for a specific section
        sectionType,  // New: Section type for filtering
        selectionStrategy // New: How to select questions
      } = req.body;

      if (!skills || skills.length === 0) {
        return res.status(400).json({ error: 'Skills are required' });
      }

      const generatedQuestions = [];
      const errors = [];

      // Build base query
      let questionQuery = {
        skill: { $in: skills },
        status: 'active'
      };

      // Filter by section type if specified
      if (sectionType && sectionType !== 'mixed') {
        switch (sectionType) {
          case 'multiple_choice':
            questionQuery.type = 'multiple_choice';
            break;
          case 'true_false':
            questionQuery.type = 'true_false';
            break;
          case 'coding':
            questionQuery.type = { $in: ['code_challenge', 'debug_fix'] };
            break;
          case 'debugging':
            questionQuery.type = 'debug_fix';
            break;
          case 'theory':
            questionQuery.type = { $in: ['multiple_choice', 'true_false'] };
            break;
          case 'practical':
            questionQuery.type = 'code_challenge';
            break;
        }
      }

      // Get available questions
      const availableQuestions = await Question.find(questionQuery);
      
      if (availableQuestions.length === 0) {
        return res.status(400).json({ 
          error: `No questions available for selected criteria`,
          criteria: { skills, sectionType, questionTypes }
        });
      }

      // Apply selection strategy
      let selectedQuestions = [];
      
      switch (selectionStrategy) {
        case 'progressive':
          // Sort by difficulty: beginner first, advanced last
          const sortedByDifficulty = availableQuestions.sort((a, b) => {
            const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          });
          selectedQuestions = sortedByDifficulty.slice(0, totalQuestions);
          break;
          
        case 'balanced':
          // Try to balance types and difficulties
          const balanced = this.balanceQuestions(availableQuestions, totalQuestions, difficulty, questionTypes);
          selectedQuestions = balanced;
          break;
          
        case 'weighted':
          // Use question weights (if available in future)
          selectedQuestions = availableQuestions
            .sort(() => 0.5 - Math.random())
            .slice(0, totalQuestions);
          break;
          
        default: // 'random'
          selectedQuestions = availableQuestions
            .sort(() => 0.5 - Math.random())
            .slice(0, totalQuestions);
      }

      // Format response
      const formattedQuestions = selectedQuestions.map(q => ({
        questionId: q._id,
        points: q.points,
        skill: q.skill,
        difficulty: q.difficulty,
        type: q.type,
        title: q.title,
        timeEstimate: q.timeEstimate
      }));

      res.json({
        success: true,
        questions: formattedQuestions,
        summary: {
          totalGenerated: formattedQuestions.length,
          targetTotal: totalQuestions,
          availableTotal: availableQuestions.length,
          sectionType,
          selectionStrategy,
          bySkill: skills.reduce((acc, skill) => {
            acc[skill] = formattedQuestions.filter(q => q.skill === skill).length;
            return acc;
          }, {}),
          byDifficulty: ['beginner', 'intermediate', 'advanced'].reduce((acc, diff) => {
            acc[diff] = formattedQuestions.filter(q => q.difficulty === diff).length;
            return acc;
          }, {}),
          byType: ['multiple_choice', 'true_false', 'code_challenge', 'debug_fix'].reduce((acc, type) => {
            acc[type] = formattedQuestions.filter(q => q.type === type).length;
            return acc;
          }, {}),
          estimatedTime: formattedQuestions.reduce((sum, q) => sum + (q.timeEstimate || 60), 0) / 60 // Convert to minutes
        },
        errors: errors.length > 0 ? errors : null
      });

    } catch (error) {
      console.error('Generate test questions error:', error);
      res.status(500).json({ error: 'Failed to generate test questions' });
    }
  }

  // Helper method for balanced question selection
  static balanceQuestions(availableQuestions, totalQuestions, difficultyTarget, typeTarget) {
    const selected = [];
    const remaining = [...availableQuestions];
    
    // First, try to meet difficulty targets
    if (difficultyTarget) {
      for (const [difficulty, percentage] of Object.entries(difficultyTarget)) {
        const targetCount = Math.round((percentage / 100) * totalQuestions);
        const difficultyQuestions = remaining
          .filter(q => q.difficulty === difficulty)
          .sort(() => 0.5 - Math.random())
          .slice(0, targetCount);
        
        selected.push(...difficultyQuestions);
        // Remove selected questions from remaining
        difficultyQuestions.forEach(q => {
          const index = remaining.findIndex(r => r._id.toString() === q._id.toString());
          if (index > -1) remaining.splice(index, 1);
        });
      }
    }
    
    // Then fill remaining slots randomly
    const stillNeeded = totalQuestions - selected.length;
    if (stillNeeded > 0) {
      const additionalQuestions = remaining
        .sort(() => 0.5 - Math.random())
        .slice(0, stillNeeded);
      selected.push(...additionalQuestions);
    }
    
    return selected.slice(0, totalQuestions);
  }

  // Enhanced get all tests with section info
  static async getAllTests(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      
      if (req.query.status) filter.status = req.query.status;
      if (req.query.category) filter.category = new RegExp(req.query.category, 'i');
      if (req.query.createdBy) filter.createdBy = req.query.createdBy;
      if (req.query.testType) filter.testType = req.query.testType;
      if (req.query.useSections) filter['settings.useSections'] = req.query.useSections === 'true';
      
      // Students only see published tests
      if (req.user.role === 'student') {
        filter.status = 'published';
        filter['settings.availableFrom'] = { $lte: new Date() };
        filter['settings.availableUntil'] = { $gte: new Date() };
      }

      const tests = await Test.find(filter)
        .populate('createdBy', 'profile.firstName profile.lastName email')
        .populate('questions.questionId', 'title type skill difficulty points')
        .populate('sections.questions.questionId', 'title type skill difficulty points')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Test.countDocuments(filter);

      // Enhanced test data with section info
      const enhancedTests = tests.map(test => {
        const testObj = test.toObject();
        
        // Add computed fields
        testObj.totalQuestions = test.settings.useSections ? 
          test.sections.reduce((sum, section) => {
            return sum + (section.questionPool.enabled ? 
              section.questionPool.totalQuestions : 
              section.questions.length);
          }, 0) : test.questions.length;
          
        testObj.totalTime = test.settings.useSections ?
          test.sections.reduce((sum, section) => sum + section.timeLimit, 0) :
          test.settings.timeLimit;
          
        testObj.sectionCount = test.settings.useSections ? test.sections.length : 0;
        
        return testObj;
      });

      // For students, also get their attempt history
      let testsWithAttempts = enhancedTests;
      if (req.user.role === 'student') {
        testsWithAttempts = await Promise.all(enhancedTests.map(async (test) => {
          const attempts = await TestSession.find({
            testId: test._id,
            userId: req.user.userId
          }).select('status score attemptNumber completedAt');

          return {
            ...test,
            userAttempts: attempts,
            canTakeTest: attempts.length < test.settings.attemptsAllowed && Test.findById(test._id).then(t => t.isAvailable())
          };
        }));
      }

      res.json({
        tests: testsWithAttempts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get tests error:', error);
      res.status(500).json({ error: 'Failed to retrieve tests' });
    }
  }

  // Enhanced get single test with section support
  static async getTestById(req, res) {
    try {
      const test = await Test.findById(req.params.id)
        .populate('createdBy', 'profile.firstName profile.lastName email')
        .populate('questions.questionId')
        .populate('sections.questions.questionId')
        .populate('sections.questionPool.availableQuestions.questionId');

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Check permissions
      const canView = req.user.role === 'admin' || 
                     req.user.role === 'instructor' ||
                     (req.user.role === 'student' && test.status === 'published');

      if (!canView) {
        return res.status(403).json({ error: 'Access denied' });
      }

      let responseData = test.toObject();

      // Add computed fields
      responseData.estimatedTime = test.estimateCompletionTime();
      responseData.validation = test.settings.useSections ? test.validateSections() : { valid: true };

      // For students, add attempt info and hide sensitive data
      if (req.user.role === 'student') {
        const attempts = await TestSession.find({
          testId: test._id,
          userId: req.user.userId
        }).select('status score attemptNumber completedAt timeSpent');

        // Hide correct answers and some question details for all questions
        const hideQuestionDetails = (questions) => {
          return questions.map(q => ({
            questionId: {
              _id: q.questionId._id,
              title: q.questionId.title,
              description: q.questionId.description,
              type: q.questionId.type,
              skill: q.questionId.skill,
              difficulty: q.questionId.difficulty,
              timeEstimate: q.questionId.timeEstimate,
              content: {
                options: q.questionId.content.options,
                codeSnippet: q.questionId.content.codeSnippet,
                starterCode: q.questionId.content.starterCode,
                brokenCode: q.questionId.content.brokenCode,
                bugHint: q.questionId.content.bugHint,
                language: q.questionId.content.language,
                hints: q.questionId.content.hints
                // Hide: correctAnswer, correctBoolean, testCases, etc.
              }
            },
            points: q.points,
            order: q.order
          }));
        };

        // Hide sensitive data in legacy questions
        if (responseData.questions) {
          responseData.questions = hideQuestionDetails(responseData.questions);
        }

        // Hide sensitive data in section questions
        if (responseData.sections) {
          responseData.sections = responseData.sections.map(section => ({
            ...section,
            questions: hideQuestionDetails(section.questions || []),
            questionPool: {
              ...section.questionPool,
              availableQuestions: section.questionPool.availableQuestions ? 
                hideQuestionDetails(section.questionPool.availableQuestions) : []
            }
          }));
        }

        responseData.userAttempts = attempts;
        responseData.canTakeTest = attempts.length < test.settings.attemptsAllowed && test.isAvailable();
      }

      res.json({ test: responseData });

    } catch (error) {
      console.error('Get test error:', error);
      res.status(500).json({ error: 'Failed to retrieve test' });
    }
  }

  // Update test (Admin/Instructor who created it) - Enhanced with sections
  static async updateTest(req, res) {
    try {
      const test = await Test.findById(req.params.id);

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Check permissions
      const canEdit = req.user.role === 'admin' || 
                     (req.user.role === 'instructor' && test.createdBy.toString() === req.user.userId);

      if (!canEdit) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Don't allow editing published tests that have been taken
      if (test.status === 'published' && test.stats.totalAttempts > 0) {
        return res.status(400).json({ 
          error: 'Cannot edit published test that has been taken by students' 
        });
      }

      // Update allowed fields (enhanced with new fields)
      const allowedUpdates = [
        'title', 'description', 'skills', 'testType', 'settings', 
        'questions', 'sections', 'questionPool', 'autoGenerate', 
        'category', 'tags', 'status'
      ];

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          test[field] = req.body[field];
        }
      });

      // Validate sections if using section-based test
      if (test.settings.useSections && test.sections && test.sections.length > 0) {
        const validation = test.validateSections();
        if (!validation.valid) {
          return res.status(400).json({ 
            error: 'Invalid section configuration',
            details: validation.errors,
            warnings: validation.warnings
          });
        }
      }

      await test.save();
      
      // Populate based on test structure
      if (test.settings.useSections) {
        await test.populate('sections.questions.questionId sections.questionPool.availableQuestions.questionId createdBy');
      } else {
        await test.populate('questions.questionId questionPool.availableQuestions.questionId createdBy');
      }

      res.json({
        success: true,
        message: 'Test updated successfully',
        test,
        validation: test.settings.useSections ? test.validateSections() : null
      });

    } catch (error) {
      console.error('Update test error:', error);
      res.status(500).json({ error: 'Failed to update test' });
    }
  }

  // Enhanced publish test with section validation
  static async publishTest(req, res) {
    try {
      const test = await Test.findById(req.params.id);

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Check permissions
      const canPublish = req.user.role === 'admin' || 
                        (req.user.role === 'instructor' && test.createdBy.toString() === req.user.userId);

      if (!canPublish) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Enhanced validation for sections
      if (test.settings.useSections) {
        const validation = test.validateSections();
        if (!validation.valid) {
          return res.status(400).json({ 
            error: 'Cannot publish test with invalid section configuration',
            details: validation.errors,
            warnings: validation.warnings
          });
        }
        
        // Check if sections have questions
        const hasQuestions = test.sections.some(section => 
          (section.questionPool.enabled && section.questionPool.totalQuestions > 0) ||
          (!section.questionPool.enabled && section.questions.length > 0)
        );
        
        if (!hasQuestions) {
          return res.status(400).json({ error: 'Cannot publish test without questions in sections' });
        }
      } else {
        // Legacy validation
        if (test.questions.length === 0 && !test.questionPool.enabled) {
          return res.status(400).json({ error: 'Cannot publish test without questions' });
        }
      }

      test.status = 'published';
      await test.save();

      res.json({
        success: true,
        message: 'Test published successfully',
        test: {
          id: test._id,
          title: test.title,
          status: test.status
        }
      });

    } catch (error) {
      console.error('Publish test error:', error);
      res.status(500).json({ error: 'Failed to publish test' });
    }
  }

  // Rest of the methods remain the same...
  // (deleteTest, startTestSession, submitAnswer, completeTestSession, getTestResults, getTestAnalytics)
  // These would need updates for section support in a production system, but for now they can remain as-is
  
  static async deleteTest(req, res) {
    try {
      const test = await Test.findById(req.params.id);

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Check permissions
      const canDelete = req.user.role === 'admin' || 
                       (req.user.role === 'instructor' && 
                        test.createdBy.toString() === req.user.userId &&
                        test.stats.totalAttempts === 0);

      if (!canDelete) {
        return res.status(403).json({ error: 'Cannot delete test with existing attempts' });
      }

      await Test.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Test deleted successfully'
      });

    } catch (error) {
      console.error('Delete test error:', error);
      res.status(500).json({ error: 'Failed to delete test' });
    }
  }

  // Start a test session (Students) - Would need enhancement for sections
  static async startTestSession(req, res) {
    try {
      const test = await Test.findById(req.params.id)
        .populate('questions.questionId')
        .populate('sections.questions.questionId');

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Check if test is available
      if (!test.isAvailable()) {
        return res.status(400).json({ error: 'Test is not currently available' });
      }

      // Check existing attempts
      const existingAttempts = await TestSession.find({
        testId: test._id,
        userId: req.user.userId
      });

      if (existingAttempts.length >= test.settings.attemptsAllowed) {
        return res.status(400).json({ 
          error: `Maximum attempts (${test.settings.attemptsAllowed}) reached` 
        });
      }

      // Check for active session
      const activeSession = existingAttempts.find(session => 
        session.status === 'in_progress' && !session.isExpired()
      );

      if (activeSession) {
        return res.status(400).json({ 
          error: 'You already have an active test session',
          sessionId: activeSession._id
        });
      }

      // Generate questions if using question pools
      if (test.settings.useSections || test.questionPool.enabled) {
        await test.generateQuestions();
        await test.save();
      }

      // Prepare questions for student (this would need enhancement for sections)
      let allQuestions = [];
      
      if (test.settings.useSections) {
        // Flatten all section questions
        test.sections.forEach((section, sectionIndex) => {
          section.questions.forEach((q, qIndex) => {
            allQuestions.push({
              questionId: q.questionId._id,
              sectionIndex,
              sectionName: section.name,
              order: allQuestions.length + 1,
              points: q.points,
              answer: null,
              isCorrect: null,
              pointsAwarded: 0,
              timeSpent: 0,
              hintsUsed: [],
              codeSubmissions: []
            });
          });
        });
      } else {
        allQuestions = test.questions.map((q, index) => ({
          questionId: q.questionId._id,
          order: index + 1,
          points: q.points,
          answer: null,
          isCorrect: null,
          pointsAwarded: 0,
          timeSpent: 0,
          hintsUsed: [],
          codeSubmissions: []
        }));
      }

      // Shuffle questions if enabled
      if (test.settings.shuffleQuestions) {
        allQuestions = allQuestions.sort(() => 0.5 - Math.random());
      }

      // Create test session
      const session = new TestSession({
        testId: test._id,
        userId: req.user.userId,
        attemptNumber: existingAttempts.length + 1,
        questions: allQuestions,
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          timezone: req.body.timezone
        }
      });

      await session.save();

      // Return test data for student (without answers)
      const studentTestData = {
        sessionId: session._id,
        testId: test._id,
        title: test.title,
        description: test.description,
        instructions: test.settings.instructions,
        timeLimit: test.settings.useSections ? null : test.settings.timeLimit, // Section timing handled separately
        useSections: test.settings.useSections,
        sections: test.settings.useSections ? test.sections.map(section => ({
          name: section.name,
          description: section.description,
          timeLimit: section.timeLimit,
          instructions: section.instructions,
          sectionType: section.sectionType
        })) : null,
        totalQuestions: allQuestions.length,
        totalPoints: allQuestions.reduce((sum, q) => sum + q.points, 0)
      };

      res.json({
        success: true,
        message: 'Test session started',
        session: studentTestData
      });

    } catch (error) {
      console.error('Start test session error:', error);
      res.status(500).json({ error: 'Failed to start test session' });
    }
  }

  // Placeholder methods - would need full implementation for sections
  static async submitAnswer(req, res) {
    // Implementation remains the same for now
    res.status(501).json({ error: 'Submit answer not fully implemented for sections yet' });
  }

  static async completeTestSession(req, res) {
    // Implementation remains the same for now
    res.status(501).json({ error: 'Complete test session not fully implemented for sections yet' });
  }

  static async getTestResults(req, res) {
    // Implementation remains the same for now
    res.status(501).json({ error: 'Get test results not fully implemented for sections yet' });
  }

  static async getTestAnalytics(req, res) {
    try {
      const test = await Test.findById(req.params.id);

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Check permissions
      const canView = req.user.role === 'admin' || 
                     (req.user.role === 'instructor' && test.createdBy.toString() === req.user.userId);

      if (!canView) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get all completed sessions
      const sessions = await TestSession.find({
        testId: test._id,
        status: 'completed'
      }).populate('userId', 'profile.firstName profile.lastName email');

      const analytics = {
        testInfo: {
          title: test.title,
          totalQuestions: test.settings.useSections ? 
            test.sections.reduce((sum, section) => {
              return sum + (section.questionPool.enabled ? 
                section.questionPool.totalQuestions : 
                section.questions.length);
            }, 0) : test.questions.length,
          skills: test.skills,
          testType: test.testType,
          useSections: test.settings.useSections,
          sectionCount: test.settings.useSections ? test.sections.length : 0
        },
        
        overview: {
          totalAttempts: sessions.length,
          uniqueStudents: new Set(sessions.map(s => s.userId._id.toString())).size,
          averageScore: sessions.reduce((sum, s) => sum + s.score.percentage, 0) / sessions.length || 0,
          passRate: (sessions.filter(s => s.score.passed).length / sessions.length) * 100 || 0,
          averageTime: sessions.reduce((sum, s) => sum + s.timeSpent, 0) / sessions.length || 0
        },

        scoreDistribution: {
          '90-100': sessions.filter(s => s.score.percentage >= 90).length,
          '80-89': sessions.filter(s => s.score.percentage >= 80 && s.score.percentage < 90).length,
          '70-79': sessions.filter(s => s.score.percentage >= 70 && s.score.percentage < 80).length,
          '60-69': sessions.filter(s => s.score.percentage >= 60 && s.score.percentage < 70).length,
          'Below 60': sessions.filter(s => s.score.percentage < 60).length
        },

        // Enhanced analytics for sections
        sectionAnalytics: test.settings.useSections ? test.sections.map((section, index) => {
          const sectionQuestions = sessions.map(s => 
            s.questions.filter(q => q.sectionIndex === index)
          ).flat();
          
          return {
            sectionName: section.name,
            sectionType: section.sectionType,
            timeLimit: section.timeLimit,
            questionCount: section.questionPool.enabled ? 
              section.questionPool.totalQuestions : 
              section.questions.length,
            averageScore: sectionQuestions.length > 0 ? 
              sectionQuestions.reduce((sum, q) => sum + (q.isCorrect ? 1 : 0), 0) / sectionQuestions.length * 100 : 0,
            averageTime: sectionQuestions.length > 0 ?
              sectionQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0) / sectionQuestions.length : 0
          };
        }) : null
      };

      res.json({ analytics });

    } catch (error) {
      console.error('Get test analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve test analytics' });
    }
  }

  // Submit answer to a question - Enhanced for sections
  static async submitAnswer(req, res) {
    try {
      const { sessionId } = req.params;
      const { questionId, answer, timeSpent, sectionIndex } = req.body;

      const session = await TestSession.findById(sessionId)
        .populate('testId')
        .populate('questions.questionId');

      if (!session) {
        return res.status(404).json({ error: 'Test session not found' });
      }

      // Check session belongs to user
      if (session.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check session is still active
      if (session.status !== 'in_progress' || session.isExpired()) {
        return res.status(400).json({ error: 'Test session is no longer active' });
      }

      // Find the question in the session
      const questionIndex = session.questions.findIndex(
        q => q.questionId._id.toString() === questionId
      );

      if (questionIndex === -1) {
        return res.status(404).json({ error: 'Question not found in session' });
      }

      const sessionQuestion = session.questions[questionIndex];
      const fullQuestion = await Question.findById(questionId);

      // Evaluate the answer
      let isCorrect = false;
      let pointsAwarded = 0;

      switch (fullQuestion.type) {
        case 'true_false':
          isCorrect = answer === fullQuestion.content.correctBoolean;
          pointsAwarded = isCorrect ? sessionQuestion.points : 0;
          break;

        case 'multiple_choice':
          isCorrect = parseInt(answer) === fullQuestion.content.correctAnswer;
          pointsAwarded = isCorrect ? sessionQuestion.points : 0;
          break;

        case 'code_challenge':
        case 'debug_fix':
          // For coding questions, we'd need a code execution engine
          // For now, just store the code and award points based on basic checks
          pointsAwarded = 0; // Will be graded separately
          break;
      }

      // Update the session
      session.questions[questionIndex] = {
        ...sessionQuestion.toObject(),
        answer,
        isCorrect,
        pointsAwarded,
        timeSpent: (sessionQuestion.timeSpent || 0) + (timeSpent || 0),
        sectionIndex: sectionIndex !== undefined ? sectionIndex : sessionQuestion.sectionIndex
      };

      await session.save();

      res.json({
        success: true,
        message: 'Answer submitted successfully',
        result: {
          isCorrect,
          pointsAwarded,
          correctAnswer: req.user.role === 'admin' ? fullQuestion.content.correctAnswer || fullQuestion.content.correctBoolean : undefined
        }
      });

    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  // Complete test session - Enhanced for sections
  static async completeTestSession(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await TestSession.findById(sessionId)
        .populate('testId');

      if (!session) {
        return res.status(404).json({ error: 'Test session not found' });
      }

      // Check session belongs to user
      if (session.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Mark as completed
      session.status = 'completed';
      session.completedAt = new Date();
      session.timeSpent = Math.floor((session.completedAt - session.startedAt) / 1000);

      // Calculate final score
      const score = session.calculateScore();
      
      await session.save();

      // Update test statistics
      const test = session.testId;
      test.stats.totalAttempts += 1;
      test.stats.completedAttempts += 1;
      
      // Recalculate averages (simple approach)
      const allSessions = await TestSession.find({ 
        testId: test._id, 
        status: 'completed' 
      });
      
      test.stats.averageScore = allSessions.reduce((sum, s) => sum + s.score.percentage, 0) / allSessions.length;
      test.stats.averageTime = allSessions.reduce((sum, s) => sum + s.timeSpent, 0) / allSessions.length;
      test.stats.passRate = (allSessions.filter(s => s.score.passed).length / allSessions.length) * 100;
      
      // Update section stats if using sections
      if (test.settings.useSections) {
        test.stats.sectionStats = test.sections.map((section, sectionIndex) => {
          const sectionQuestions = allSessions.map(s => 
            s.questions.filter(q => q.sectionIndex === sectionIndex)
          ).flat();
          
          return {
            sectionId: section._id?.toString() || `section-${sectionIndex}`,
            averageTime: sectionQuestions.length > 0 ?
              sectionQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0) / sectionQuestions.length : 0,
            averageScore: sectionQuestions.length > 0 ?
              sectionQuestions.reduce((sum, q) => sum + (q.isCorrect ? 1 : 0), 0) / sectionQuestions.length * 100 : 0,
            completionRate: sectionQuestions.length > 0 ?
              sectionQuestions.filter(q => q.answer !== null).length / sectionQuestions.length * 100 : 0
          };
        });
      }
      
      await test.save();

      // Update user's test history
      const user = await User.findById(req.user.userId);
      user.testHistory.push({
        testId: test._id,
        score: score.percentage,
        passed: score.passed,
        completedAt: session.completedAt,
        timeSpent: session.timeSpent,
        attempts: session.attemptNumber
      });
      await user.save();

      res.json({
        success: true,
        message: 'Test completed successfully',
        results: {
          sessionId: session._id,
          score: score,
          timeSpent: session.timeSpent,
          showResults: test.settings.showResults,
          showCorrectAnswers: test.settings.showCorrectAnswers
        }
      });

    } catch (error) {
      console.error('Complete test session error:', error);
      res.status(500).json({ error: 'Failed to complete test session' });
    }
  }

  // Get test results - Enhanced for sections
  static async getTestResults(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await TestSession.findById(sessionId)
        .populate('testId')
        .populate('questions.questionId');

      if (!session) {
        return res.status(404).json({ error: 'Test session not found' });
      }

      // Check permissions
      const canView = req.user.role === 'admin' ||
                     session.userId.toString() === req.user.userId ||
                     (req.user.role === 'instructor' && session.testId.createdBy.toString() === req.user.userId);

      if (!canView) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Group questions by section if using sections
      const questionsBySection = session.testId.settings.useSections ? 
        session.testId.sections.map((section, sectionIndex) => ({
          sectionName: section.name,
          sectionType: section.sectionType,
          timeLimit: section.timeLimit,
          questions: session.questions
            .filter(q => q.sectionIndex === sectionIndex)
            .map((q, index) => ({
              questionId: q.questionId._id,
              title: q.questionId.title,
              type: q.questionId.type,
              skill: q.questionId.skill,
              difficulty: q.questionId.difficulty,
              points: q.points,
              studentAnswer: q.answer,
              isCorrect: q.isCorrect,
              pointsAwarded: q.pointsAwarded,
              timeSpent: q.timeSpent,
              correctAnswer: session.testId.settings.showCorrectAnswers || req.user.role !== 'student' 
                ? q.questionId.content.correctAnswer || q.questionId.content.correctBoolean 
                : undefined
            }))
        })) : null;

      const results = {
        sessionId: session._id,
        testTitle: session.testId.title,
        studentId: session.userId,
        attemptNumber: session.attemptNumber,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        timeSpent: session.timeSpent,
        score: session.score,
        useSections: session.testId.settings.useSections,
        
        // Section-based results
        sectionResults: questionsBySection,
        
        // Legacy format for backward compatibility
        questions: session.questions.map((q, index) => ({
          questionId: q.questionId._id,
          title: q.questionId.title,
          type: q.questionId.type,
          skill: q.questionId.skill,
          difficulty: q.questionId.difficulty,
          points: q.points,
          studentAnswer: q.answer,
          isCorrect: q.isCorrect,
          pointsAwarded: q.pointsAwarded,
          timeSpent: q.timeSpent,
          sectionIndex: q.sectionIndex,
          correctAnswer: session.testId.settings.showCorrectAnswers || req.user.role !== 'student' 
            ? q.questionId.content.correctAnswer || q.questionId.content.correctBoolean 
            : undefined
        }))
      };

      res.json({ results });

    } catch (error) {
      console.error('Get test results error:', error);
      res.status(500).json({ error: 'Failed to retrieve test results' });
    }
  }
}

module.exports = TestController;