// /controllers/codeChallengeAdminController.js - Admin management for code challenges
const CodeChallenge = require('../models/CodeChallenge');
const Track = require('../models/Track');
const UserChallengeProgress = require('../models/UserChallengeProgress');
const UserTrackProgress = require('../models/UserTrackProgress');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const { runCodeTests } = require('../services/grading/index');
const createError = require('http-errors');

class CodeChallengeAdminController {
  // Create new challenge (admin only)
  async createChallenge(req, res, next) {
    try {
      const {
        title,
        description,
        problemStatement,
        difficulty,
        supportedLanguages,
        topics,
        tags,
        examples,
        constraints,
        hints,
        codeConfig,
        startingCode,
        testCases,
        solutionCode,
        editorial,
        timeComplexity,
        spaceComplexity,
        companyTags
      } = req.body;

      const challenge = new CodeChallenge({
        title,
        description,
        problemStatement,
        difficulty,
        supportedLanguages,
        topics,
        tags,
        examples,
        constraints,
        hints,
        codeConfig,
        startingCode,
        testCases,
        solutionCode,
        editorial,
        timeComplexity,
        spaceComplexity,
        companyTags,
        createdBy: req.user.userId,
        status: 'active'
      });

      await challenge.save();

      res.status(201).json({
        success: true,
        message: 'Challenge created successfully',
        challenge
      });
    } catch (error) {
      next(error);
    }
  }

  // Update existing challenge (admin only)
  async updateChallenge(req, res, next) {
    try {
      const { challengeNumber } = req.params;
      const updateData = { ...req.body };
      
      const challenge = await CodeChallenge.findOneAndUpdate(
        { slug: challengeNumber },
        updateData,
        { new: true, runValidators: true }
      );

      if (!challenge) {
        throw createError(404, 'Challenge not found');
      }

      res.json({
        success: true,
        message: 'Challenge updated successfully',
        challenge
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete challenge (admin only)
  async deleteChallenge(req, res, next) {
    try {
      const { challengeNumber } = req.params;
      
      const challenge = await CodeChallenge.findOne({ 
        slug: challengeNumber
      });

      if (!challenge) {
        throw createError(404, 'Challenge not found');
      }

      challenge.status = 'archived';
      await challenge.save();

      res.json({
        success: true,
        message: 'Challenge archived successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Test challenge with sample code (admin only)
  async testChallenge(req, res, next) {
    try {
      const { challengeNumber } = req.params;
      const { language, code } = req.body;

      const challenge = await CodeChallenge.findOne({ 
        slug: challengeNumber
      });

      if (!challenge) {
        throw createError(404, 'Challenge not found');
      }

      if (!challenge.supportedLanguages.includes(language)) {
        throw createError(400, `Language ${language} not supported`);
      }

      const codeConfig = challenge.codeConfig[language];
      const testResults = await runCodeTests({
        code: code || challenge.solutionCode[language],
        language,
        runtime: codeConfig.runtime,
        entryFunction: codeConfig.entryFunction,
        testCases: challenge.testCases,
        timeoutMs: codeConfig.timeoutMs
      });

      res.json({
        success: true,
        testResults
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new track (admin only) - FIXED: Use isActive instead of status
  async createTrack(req, res, next) {
    try {
      const {
        title,
        description,
        language,
        category,
        difficulty,
        estimatedHours,
        prerequisites,
        learningObjectives,
        challenges,
        iconUrl,
        bannerUrl,
        isFeatured,
      } = req.body;

      const track = new Track({
        title,
        description,
        language,
        category,
        difficulty,
        estimatedHours,
        prerequisites,
        learningObjectives,
        challenges,
        iconUrl,
        bannerUrl,
        isFeatured,
        createdBy: req.user.userId,
        isActive: true // FIXED: Use isActive instead of status
      });

      await track.save();

      res.status(201).json({
        success: true,
        message: 'Track created successfully',
        track
      });
    } catch (error) {
      next(error);
    }
  }

  // Update track (admin only)
  async updateTrack(req, res, next) {
    try {
      const { language, trackSlug } = req.params;
      const updateData = { ...req.body };

      const track = await Track.findOneAndUpdate(
        { language, slug: trackSlug },
        updateData,
        { new: true, runValidators: true }
      );

      if (!track) {
        throw createError(404, 'Track not found');
      }

      res.json({
        success: true,
        message: 'Track updated successfully',
        track
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete track (admin only) - FIXED: Use isActive instead of status
  async deleteTrack(req, res, next) {
    try {
      const { language, trackSlug } = req.params;
      
      const track = await Track.findOne({ language, slug: trackSlug });

      if (!track) {
        throw createError(404, 'Track not found');
      }

      track.isActive = false; // FIXED: Use isActive instead of status
      await track.save();

      res.json({
        success: true,
        message: 'Track archived successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Add challenge to track (admin only)
  async addChallengeToTrack(req, res, next) {
    try {
      const { language, trackSlug } = req.params;
      const { challengeId, order, isOptional, unlockAfter } = req.body;

      const track = await Track.findOne({ language, slug: trackSlug });
      if (!track) {
        throw createError(404, 'Track not found');
      }

      const challenge = await CodeChallenge.findById(challengeId);
      if (!challenge) {
        throw createError(404, 'Challenge not found');
      }

      await track.addChallenge(challengeId, order, isOptional, unlockAfter);

      res.json({
        success: true,
        message: 'Challenge added to track successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove challenge from track (admin only)
  async removeChallengeFromTrack(req, res, next) {
    try {
      const { language, trackSlug, challengeId } = req.params;

      const track = await Track.findOne({ language, slug: trackSlug });
      if (!track) {
        throw createError(404, 'Track not found');
      }

      await track.removeChallenge(challengeId);

      res.json({
        success: true,
        message: 'Challenge removed from track successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get admin analytics - FIXED: Updated to use proper field names
  async getAnalytics(req, res, next) {
    try {
      const { period = '30d' } = req.query;
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      const [
        challengeStats,
        trackStats,
        submissionStats,
        userActivityStats,
        popularChallenges,
        difficultChallenges
      ] = await Promise.all([
        // Challenge overview
        CodeChallenge.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
              byDifficulty: {
                $push: {
                  difficulty: '$difficulty',
                  count: 1
                }
              }
            }
          }
        ]),

        // Track overview - FIXED: Use isActive
        Track.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
              byLanguage: {
                $push: {
                  language: '$language',
                  count: 1
                }
              }
            }
          }
        ]),

        // Submission stats
        ChallengeSubmission.aggregate([
          {
            $match: {
              submittedAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              totalSubmissions: { $sum: 1 },
              successfulSubmissions: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
              byLanguage: {
                $push: {
                  language: '$language',
                  status: '$status'
                }
              }
            }
          }
        ]),

        // User activity
        UserChallengeProgress.aggregate([
          {
            $match: {
              lastAttemptAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              activeUsers: { $addToSet: '$userId' },
              totalSolved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } }
            }
          }
        ]),

        // Most popular challenges
        CodeChallenge.find({ status: 'active' })
          .sort({ 'usageStats.totalAttempts': -1 })
          .limit(10)
          .select('slug title difficulty usageStats'),

        // Most difficult challenges (lowest success rate)
        CodeChallenge.find({ 
          status: 'active',
          'usageStats.totalAttempts': { $gte: 10 }
        })
          .sort({ 'usageStats.successRate': 1 })
          .limit(10)
          .select('slug title difficulty usageStats')
      ]);

      res.json({
        success: true,
        analytics: {
          period,
          challengeStats: challengeStats[0] || {},
          trackStats: trackStats[0] || {},
          submissionStats: submissionStats[0] || {},
          userActivityStats: {
            activeUsers: userActivityStats[0]?.activeUsers?.length || 0,
            totalSolved: userActivityStats[0]?.totalSolved || 0
          },
          popularChallenges,
          difficultChallenges
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all challenges with full details (admin only)
  async getAllChallenges(req, res, next) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      
      let query = {};
      if (filters.difficulty) query.difficulty = filters.difficulty;
      if (filters.language) query.supportedLanguages = filters.language;
      if (filters.status) query.status = filters.status;
      
      const skip = (page - 1) * limit;
      
      const [challenges, total] = await Promise.all([
        CodeChallenge.find(query)
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'firstName lastName email'),
        CodeChallenge.countDocuments(query)
      ]);

      res.json({
        success: true,
        challenges,
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

  // Get all tracks with full details (admin only) - FIXED: Use isActive
  async getAllTracks(req, res, next) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      
      let query = {};
      if (filters.language) query.language = filters.language;
      if (filters.category) query.category = filters.category;
      if (filters.status) {
        // Convert status filter to isActive
        query.isActive = filters.status === 'active';
      }
      
      const skip = (page - 1) * limit;
      
      const [tracks, total] = await Promise.all([
        Track.find(query)
          .sort({ language: 1, category: 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('createdBy', 'firstName lastName email')
          .populate('challenges.challengeId', 'slug title difficulty'),
        Track.countDocuments(query)
      ]);

      res.json({
        success: true,
        tracks,
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

  // Get single track with full details (admin view)
  async getTrackById(req, res, next) {
    try {
      const { language, trackSlug } = req.params;

      const track = await Track.findOne({ 
        language: language.toLowerCase(), 
        slug: trackSlug 
      })
      .populate('createdBy', 'firstName lastName email')
      .populate('challenges.challengeId', 'slug title description difficulty status topics tags usageStats');

      if (!track) {
        throw createError(404, 'Track not found');
      }

      // Get submission stats for this track
      const challengeIds = track.challenges.map(c => c.challengeId._id);
      const [submissionStats, userProgress] = await Promise.all([
        ChallengeSubmission.aggregate([
          {
            $match: { challengeId: { $in: challengeIds } }
          },
          {
            $group: {
              _id: '$challengeId',
              totalSubmissions: { $sum: 1 },
              passedSubmissions: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
              uniqueUsers: { $addToSet: '$userId' }
            }
          }
        ]),
        UserChallengeProgress.aggregate([
          {
            $match: { challengeId: { $in: challengeIds } }
          },
          {
            $group: {
              _id: '$challengeId',
              totalUsers: { $sum: 1 },
              solvedCount: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } }
            }
          }
        ])
      ]);

      // Merge stats with challenges
      const submissionMap = new Map();
      const progressMap = new Map();
      
      submissionStats.forEach(stat => {
        submissionMap.set(stat._id.toString(), stat);
      });
      
      userProgress.forEach(progress => {
        progressMap.set(progress._id.toString(), progress);
      });

      const enrichedTrack = {
        ...track.toObject(),
        challenges: track.challenges.map(challenge => {
          const submissionStat = submissionMap.get(challenge.challengeId._id.toString());
          const progressStat = progressMap.get(challenge.challengeId._id.toString());
          
          return {
            ...challenge.toObject(),
            stats: {
              totalSubmissions: submissionStat?.totalSubmissions || 0,
              passedSubmissions: submissionStat?.passedSubmissions || 0,
              successRate: submissionStat?.totalSubmissions > 0 
                ? ((submissionStat.passedSubmissions / submissionStat.totalSubmissions) * 100).toFixed(1)
                : 0,
              uniqueUsers: submissionStat?.uniqueUsers?.length || 0,
              totalUsers: progressStat?.totalUsers || 0,
              solvedCount: progressStat?.solvedCount || 0
            }
          };
        })
      };

      res.json({
        success: true,
        track: enrichedTrack
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single challenge with full details (admin view)
  async getChallengeById(req, res, next) {
    try {
      const { challengeNumber } = req.params;

      const challenge = await CodeChallenge.findOne({ 
        slug: challengeNumber 
      }).populate('createdBy', 'firstName lastName email');

      if (!challenge) {
        throw createError(404, 'Challenge not found');
      }

      // Get detailed stats for this challenge
      const [submissionStats, userProgress, recentSubmissions] = await Promise.all([
        ChallengeSubmission.aggregate([
          {
            $match: { challengeId: challenge._id }
          },
          {
            $group: {
              _id: {
                language: '$language',
                status: '$status'
              },
              count: { $sum: 1 },
              avgRuntime: { $avg: '$runtime' }
            }
          }
        ]),
        UserChallengeProgress.aggregate([
          {
            $match: { challengeId: challenge._id }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              avgAttempts: { $avg: '$attempts' }
            }
          }
        ]),
        ChallengeSubmission.find({ challengeId: challenge._id })
          .populate('userId', 'firstName lastName email')
          .sort({ submittedAt: -1 })
          .limit(10)
          .select('userId language status runtime submittedAt')
      ]);

      res.json({
        success: true,
        challenge: {
          ...challenge.toObject(),
          stats: {
            submissions: submissionStats,
            userProgress: userProgress,
            recentSubmissions: recentSubmissions
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get tracks overview for dashboard
  async getTracksOverview(req, res, next) {
    try {
      const { language } = req.query;
      
      let query = { isActive: true };
      if (language) {
        query.language = language.toLowerCase();
      }

      const tracks = await Track.find(query)
        .select('slug title language category difficulty estimatedHours isFeatured challenges createdAt')
        .populate('challenges.challengeId', 'slug title difficulty status')
        .sort({ language: 1, isFeatured: -1, difficulty: 1 });

      // Get basic stats for each track
      const trackStats = await Promise.all(
        tracks.map(async (track) => {
          const challengeIds = track.challenges.map(c => c.challengeId._id);
          
          const [submissions, users] = await Promise.all([
            ChallengeSubmission.countDocuments({ challengeId: { $in: challengeIds } }),
            UserChallengeProgress.distinct('userId', { challengeId: { $in: challengeIds } })
          ]);

          return {
            ...track.toObject(),
            stats: {
              totalChallenges: track.challenges.length,
              activeChallenges: track.challenges.filter(c => c.challengeId.status === 'active').length,
              totalSubmissions: submissions,
              uniqueUsers: users.length
            }
          };
        })
      );

      res.json({
        success: true,
        tracks: trackStats
      });
    } catch (error) {
      next(error);
    }
  }

  // Get challenges overview for dashboard
  async getChallengesOverview(req, res, next) {
    try {
      const { difficulty, language, status } = req.query;
      
      let query = {};
      if (difficulty) query.difficulty = difficulty;
      if (language) query.supportedLanguages = language;
      if (status) query.status = status;

      const challenges = await CodeChallenge.find(query)
        .select('slug title difficulty supportedLanguages status topics usageStats createdAt')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        challenges
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CodeChallengeAdminController();