// /controllers/codeChallengeController.js - Controller for the code challenge platform
const CodeChallenge = require('../models/CodeChallenge');
const Track = require('../models/Track');
const UserChallengeProgress = require('../models/UserChallengeProgress');
const UserTrackProgress = require('../models/UserTrackProgress');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const { runCodeTests } = require('../services/grading/index');
const createError = require('http-errors');

class CodeChallengeController {
  // Get all tracks for browsing
  async getTracks(req, res, next) {
    try {
      const { language, category, difficulty, featured } = req.query;
      
      let query = { status: 'active' }; // FIXED: Use status instead of isActive
      
      if (language) query.language = language;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (featured === 'true') query.isFeatured = true;
      
      const tracks = await Track.find(query)
        .sort({ 
          isFeatured: -1, 
          'stats.rating': -1, 
          'stats.totalEnrolled': -1 
        })
        .populate('challenges.challengeId', 'title difficulty');
      
      res.json({
        success: true,
        tracks: tracks.map(track => ({
          ...track.toJSON(),
          // Don't expose full challenge details in track listing
          challenges: track.challenges.length
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  // Get specific track with challenges
  async getTrack(req, res, next) {
    try {
      const { language, trackSlug } = req.params;
      const userId = req.user?.userId;
      
      const track = await Track.findOne({ 
        language, 
        slug: trackSlug, 
        status: 'active' // FIXED: Use status instead of isActive
      }).populate('challenges.challengeId');
      
      if (!track) {
        throw createError(404, 'Track not found');
      }

      let userProgress = null;
      if (userId) {
        userProgress = await UserTrackProgress.findOne({ 
          userId, 
          trackId: track._id 
        });
      }

      res.json({
        success: true,
        track: {
          ...track.toJSON(),
          userProgress: userProgress || null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all challenges (with filtering)
  async getChallenges(req, res, next) {
    try {
      const { 
        language, 
        difficulty, 
        topic, 
        page = 1, 
        limit = 20,
        solved,
        sortBy = 'createdAt' // FIXED: Use createdAt instead of challengeNumber since that field doesn't exist in the model
      } = req.query;
      
      const userId = req.user?.userId;
      
      let query = { status: 'active' }; // FIXED: Use status: 'active' instead of isActive: true
      
      if (language) query.supportedLanguages = language;
      if (difficulty) query.difficulty = difficulty;
      if (topic) query.topics = topic;
      
      // Sorting options - FIXED: Updated to match actual model fields
      let sort = {};
      switch (sortBy) {
        case 'createdAt':
          sort = { createdAt: 1 };
          break;
        case 'difficulty':
          sort = { difficulty: 1, createdAt: 1 };
          break;
        case 'popular':
          sort = { 'usageStats.totalAttempts': -1 }; // FIXED: Use usageStats instead of stats
          break;
        case 'success-rate':
          sort = { 'usageStats.successRate': -1 }; // FIXED: Use usageStats instead of stats
          break;
        default:
          sort = { createdAt: 1 };
      }
      
      const skip = (page - 1) * limit;
      
      const [challenges, total] = await Promise.all([
        CodeChallenge.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .select('-testCases -solutionCode -editorial'), // Don't expose solutions and editorial
        CodeChallenge.countDocuments(query)
      ]);

      // Get user progress if authenticated
      let userProgressMap = {};
      if (userId && challenges.length > 0) {
        const challengeIds = challenges.map(c => c._id);
        const userProgress = await UserChallengeProgress.find({
          userId,
          challengeId: { $in: challengeIds }
        });
        
        userProgressMap = userProgress.reduce((map, progress) => {
          map[progress.challengeId.toString()] = progress;
          return map;
        }, {});
      }

      // Filter by solved status if requested
      let filteredChallenges = challenges;
      if (solved !== undefined && userId) {
        filteredChallenges = challenges.filter(challenge => {
          const progress = userProgressMap[challenge._id.toString()];
          const isSolved = progress?.status === 'solved';
          return solved === 'true' ? isSolved : !isSolved;
        });
      }

      res.json({
        success: true,
        challenges: filteredChallenges.map(challenge => ({
          ...challenge.toJSON(),
          userProgress: userProgressMap[challenge._id.toString()] || null
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get specific challenge
  async getChallenge(req, res, next) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.userId;
      
      // Use _id instead of slug for direct lookup
      const challenge = await CodeChallenge.findOne({ 
        _id: challengeId,
        status: 'active'
      });
      
      if (!challenge) {
        throw createError(404, 'Challenge not found');
      }

      let userProgress = null;
      let recentSubmissions = [];
      
      if (userId) {
        [userProgress, recentSubmissions] = await Promise.all([
          UserChallengeProgress.findOne({ 
            userId, 
            challengeId: challenge._id 
          }),
          ChallengeSubmission.find({ 
            userId, 
            challengeId: challenge._id 
          })
          .sort({ submittedAt: -1 })
          .limit(5)
          .select('language status submittedAt passedTests totalTests executionTime')
        ]);
      }

      // Only show sample test cases (non-hidden)
      const responseChallenge = {
        ...challenge.toJSON(),
        testCases: challenge.testCases?.filter(tc => !tc.hidden) || [], // Show only non-hidden test cases
        solutionCode: undefined, // Never expose solutions
        editorial: undefined // Never expose editorial
      };

      res.json({
        success: true,
        challenge: responseChallenge,
        userProgress: userProgress || null,
        recentSubmissions: recentSubmissions || []
      });
    } catch (error) {
      next(error);
    }
  }

  // Test code without submitting (run against sample test cases only)
  async testChallenge(req, res, next) {
    try {
      const { challengeId } = req.params;
      const { code, language } = req.body;
      const userId = req.user?.userId;
      
      if (!code || !language) {
        throw createError(400, 'Code and language are required');
      }

      // Use _id instead of slug for direct lookup
      const challenge = await CodeChallenge.findOne({ 
        _id: challengeId,
        status: 'active'
      });
      
      if (!challenge) {
        throw createError(404, 'Challenge not found');
      }

      if (!challenge.supportedLanguages.includes(language)) {
        throw createError(400, `Language ${language} not supported for this challenge`);
      }

      // Get only the sample test cases (non-hidden ones)
      const sampleTestCases = challenge.testCases?.filter(tc => !tc.hidden) || [];
      
      if (sampleTestCases.length === 0) {
        throw createError(400, 'No sample test cases available for testing');
      }

      try {
        // Run tests against sample test cases only
        const codeConfig = challenge.codeConfig?.[language];
        if (!codeConfig) {
          throw new Error(`No code configuration found for language: ${language}`);
        }

        const testResults = await runCodeTests({
          language,
          code,
          testCases: sampleTestCases, // Only sample test cases
          runtime: codeConfig.runtime,
          entryFunction: codeConfig.entryFunction,
          timeoutMs: codeConfig.timeoutMs || 3000
        });

        // Return test results (all test cases are visible since they're sample cases)
        res.json({
          success: true,
          results: {
            ...testResults,
            message: testResults.overallPassed 
              ? 'All sample test cases passed! You can now submit your solution.' 
              : 'Some test cases failed. Fix your code and try again.',
            testType: 'sample_tests',
            totalSampleTests: sampleTestCases.length,
            passedSampleTests: testResults.totalTestsPassed
          }
        });

      } catch (executionError) {
        res.json({
          success: false,
          error: executionError.message,
          results: {
            overallPassed: false,
            totalTests: sampleTestCases.length,
            totalTestsPassed: 0,
            testResults: [],
            executionError: executionError.message,
            testType: 'sample_tests',
            message: 'Code execution failed. Please check your syntax and try again.'
          }
        });
      }

    } catch (error) {
      next(error);
    }
  }

  // Submit code for final evaluation
  async submitChallenge(req, res, next) {
    try {
      const { challengeId } = req.params;
      const { code, language, trackId, hasTestedCode } = req.body; // trackId is optional, hasTestedCode indicates if user ran tests
      const userId = req.user.userId;
      
      if (!code || !language) {
        throw createError(400, 'Code and language are required');
      }

      // Use _id instead of slug for direct lookup
      const challenge = await CodeChallenge.findOne({ 
        _id: challengeId,
        status: 'active'
      });
      
      if (!challenge) {
        throw createError(404, 'Challenge not found');
      }

      if (!challenge.supportedLanguages.includes(language)) {
        throw createError(400, `Language ${language} not supported for this challenge`);
      }

      // Optional: Encourage testing before submission (remove this if you want to enforce it)
      if (!hasTestedCode) {
        return res.status(400).json({
          success: false,
          error: 'Please test your code first using the test endpoint before submitting',
          suggestion: 'Use POST /challenges/:challengeNumber/test to test your code against sample cases'
        });
      }

      // Get or create user progress (track-specific)
      let userProgress = await UserChallengeProgress.findOne({
        userId,
        challengeId: challenge._id,
        trackId: trackId || null // null for standalone challenges
      });

      if (!userProgress) {
        userProgress = new UserChallengeProgress({
          userId,
          challengeId: challenge._id,
          trackId: trackId || null
        });
        await userProgress.save();
      }

      // Get submission number for this user/challenge/language (across all tracks)
      const submissionCount = await ChallengeSubmission.countDocuments({
        userId,
        challengeId: challenge._id,
        language
      });

      // Create submission record
      const submission = new ChallengeSubmission({
        userId,
        challengeId: challenge._id,
        trackId: trackId || null,
        language,
        code,
        submissionNumber: submissionCount + 1
      });

      await submission.save();

      try {
        // Run tests - FIXED: Use the correct config structure for your CodeChallenge model
        const codeConfig = challenge.codeConfig?.[language];
        if (!codeConfig) {
          throw new Error(`No code configuration found for language: ${language}`);
        }

        const testResults = await runCodeTests({
          language,
          code,
          testCases: challenge.testCases,
          runtime: codeConfig.runtime,
          entryFunction: codeConfig.entryFunction,
          timeoutMs: codeConfig.timeoutMs || 3000
        });

        // Update submission with results
        await submission.updateResults(testResults);

        // Update user progress
        const timeSpent = Math.floor((Date.now() - submission.submittedAt) / 1000);
        await userProgress.recordAttempt(language, testResults.overallPassed, timeSpent);

        // Update challenge stats
        await challenge.updateStats({
          success: testResults.overallPassed
        });

        // Update track progress if part of a track
        if (trackId && testResults.overallPassed) {
          const trackProgress = await UserTrackProgress.findOne({
            userId,
            trackId
          });
          
          if (trackProgress) {
            await trackProgress.recordChallengeCompletion(
              challenge._id,
              language,
              userProgress.totalAttempts,
              timeSpent
            );
          }
        }

        // Return results (but hide hidden test case details)
        const publicResults = {
          ...testResults,
          testResults: testResults.testResults.map((result, index) => {
            const testCase = challenge.testCases[index];
            if (testCase && testCase.hidden) {
              return {
                ...result,
                actualOutput: result.passed ? result.actualOutput : 'Hidden',
                expectedOutput: 'Hidden',
                testName: result.testName || `Hidden Test Case ${index + 1}`
              };
            }
            return result;
          })
        };

        // Check if user has solved this challenge in other tracks (for insights)
        const crossTrackInsights = await UserChallengeProgress.getUserCrossTrackInsights(
          userId, 
          challenge._id
        );

        res.json({
          success: true,
          submissionId: submission._id,
          results: publicResults,
          userProgress: await UserChallengeProgress.findById(userProgress._id),
          crossTrackInsights: crossTrackInsights.length > 1 ? crossTrackInsights : null
        });

      } catch (executionError) {
        // Update submission with error
        await submission.updateResults({
          executionError: executionError.message,
          overallPassed: false,
          totalTests: challenge.testCases.length,
          totalTestsPassed: 0
        });

        res.json({
          success: false,
          submissionId: submission._id,
          error: executionError.message,
          results: {
            overallPassed: false,
            totalTests: challenge.testCases.length,
            totalTestsPassed: 0,
            testResults: [],
            executionError: executionError.message
          }
        });
      }

    } catch (error) {
      next(error);
    }
  }

  // Enroll in a track
  async enrollInTrack(req, res, next) {
    try {
      const { language, trackSlug } = req.params;
      const userId = req.user.userId;
      
      const track = await Track.findOne({ 
        language, 
        slug: trackSlug, 
        status: 'active' // FIXED: Use status instead of isActive
      });
      
      if (!track) {
        throw createError(404, 'Track not found');
      }

      // Check if already enrolled
      let userProgress = await UserTrackProgress.findOne({
        userId,
        trackId: track._id
      });

      if (userProgress) {
        return res.json({
          success: true,
          message: 'Already enrolled in this track',
          userProgress
        });
      }

      // Create new enrollment
      userProgress = new UserTrackProgress({
        userId,
        trackId: track._id,
        totalChallenges: track.challenges.length
      });

      await userProgress.save();

      // Update track stats
      await track.updateStats(true, false); // enrolled = true, completed = false

      res.json({
        success: true,
        message: 'Successfully enrolled in track',
        userProgress
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's track progress
  async getUserTrackProgress(req, res, next) {
    try {
      const { language, trackSlug } = req.params;
      const userId = req.user.userId;
      
      const track = await Track.findOne({ 
        language, 
        slug: trackSlug, 
        status: 'active' // FIXED: Use status instead of isActive
      }).populate('challenges.challengeId');
      
      if (!track) {
        throw createError(404, 'Track not found');
      }

      const userProgress = await UserTrackProgress.findOne({
        userId,
        trackId: track._id
      });

      if (!userProgress) {
        throw createError(404, 'Not enrolled in this track');
      }

      // Get challenge progress for all challenges in track
      const challengeIds = track.challenges.map(c => c.challengeId._id);
      const challengeProgress = await UserChallengeProgress.find({
        userId,
        challengeId: { $in: challengeIds }
      });

      const challengeProgressMap = challengeProgress.reduce((map, progress) => {
        map[progress.challengeId.toString()] = progress;
        return map;
      }, {});

      const enrichedTrack = {
        ...track.toJSON(),
        challenges: track.challenges.map((trackChallenge, index) => ({
          ...trackChallenge,
          challenge: trackChallenge.challengeId,
          userProgress: challengeProgressMap[trackChallenge.challengeId._id.toString()] || null,
          isUnlocked: userProgress.isChallengeUnlocked(index, track)
        }))
      };

      res.json({
        success: true,
        track: enrichedTrack,
        userProgress
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user dashboard/stats
  async getUserDashboard(req, res, next) {
    try {
      const userId = req.user.userId;
      
      const [
        userChallengeStats,
        userTrackStats,
        recentSubmissions,
        recentActivity
      ] = await Promise.all([
        // Challenge stats by language
        UserChallengeProgress.aggregate([
          { $match: { userId } },
          { $group: {
            _id: null,
            totalAttempted: { $sum: { $cond: [{ $ne: ['$status', 'not_attempted'] }, 1, 0] } },
            totalSolved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
            javascriptSolved: { $sum: { $cond: [{ $eq: ['$solutions.javascript.status', 'solved'] }, 1, 0] } },
            pythonSolved: { $sum: { $cond: [{ $eq: ['$solutions.python.status', 'solved'] }, 1, 0] } },
            dartSolved: { $sum: { $cond: [{ $eq: ['$solutions.dart.status', 'solved'] }, 1, 0] } }
          }}
        ]),
        
        // Track stats
        UserTrackProgress.aggregate([
          { $match: { userId } },
          { $group: {
            _id: null,
            totalEnrolled: { $sum: 1 },
            totalCompleted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalInProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } }
          }}
        ]),
        
        // Recent submissions
        ChallengeSubmission.find({ userId })
          .sort({ submittedAt: -1 })
          .limit(10)
          .populate('challengeId', 'title slug difficulty') // FIXED: Use slug instead of challengeNumber
          .select('challengeId language status submittedAt passedTests totalTests'),
        
        // Recent solved challenges
        UserChallengeProgress.find({ 
          userId, 
          status: 'solved' 
        })
          .sort({ 'lastAttemptAt': -1 })
          .limit(5)
          .populate('challengeId', 'title slug difficulty') // FIXED: Use slug instead of challengeNumber
      ]);

      const challengeStats = userChallengeStats[0] || {
        totalAttempted: 0,
        totalSolved: 0,
        javascriptSolved: 0,
        pythonSolved: 0,
        dartSolved: 0
      };

      const trackStats = userTrackStats[0] || {
        totalEnrolled: 0,
        totalCompleted: 0,
        totalInProgress: 0
      };

      res.json({
        success: true,
        dashboard: {
          challengeStats,
          trackStats,
          recentSubmissions,
          recentActivity,
          streaks: {
            // TODO: Calculate streaks from activity
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CodeChallengeController();