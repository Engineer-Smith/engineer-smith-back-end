// /controllers/adminController.js
const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');
const TestSession = require('../models/TestSession');
const Result = require('../models/Result');
const Organization = require('../models/Organization');
const createError = require('http-errors');
const { validateResultAccess } = require('../services/result/resultValidation');

// User Management Dashboard
const getUserDashboard = async (req, res, next) => {
  try {
    const { user } = req;
    const { orgId, role, search, limit = 20, skip = 0 } = req.query;

    // Build organization scope
    let organizationScope = {};
    if (user.isSuperOrgAdmin) {
      if (orgId) organizationScope.organizationId = orgId;
    } else {
      organizationScope.organizationId = user.organizationId;
    }

    // Build user query
    let userQuery = { ...organizationScope };
    if (role) userQuery.role = role;

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { loginId: searchRegex },
        { email: searchRegex }
      ];
    }

    // Parallel aggregations for dashboard data
    const [
      // User statistics
      userStats,
      // Recent users
      recentUsers,
      // User list with pagination
      userList,
      totalUsers,
      // Organization stats (if super admin)
      organizationStats,
      // Performance overview
      performanceOverview,
      // Content creation stats
      contentStats
    ] = await Promise.all([
      // User statistics aggregation
      User.aggregate([
        { $match: organizationScope },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            adminCount: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            instructorCount: { $sum: { $cond: [{ $eq: ['$role', 'instructor'] }, 1, 0] } },
            studentCount: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
            ssoUsers: { $sum: { $cond: ['$isSSO', 1, 0] } },
            regularUsers: { $sum: { $cond: [{ $not: '$isSSO' }, 1, 0] } }
          }
        }
      ]),

      // Recent users (last 30 days)
      User.aggregate([
        { 
          $match: { 
            ...organizationScope,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // User list with populated organization
      User.find(userQuery)
        .populate('organizationId', 'name isSuperOrg')
        .select('loginId firstName lastName email role isSSO createdAt')
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .lean(),

      // Total user count for pagination
      User.countDocuments(userQuery),

      // Organization stats (only for super admins)
      user.isSuperOrgAdmin ? Organization.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'organizationId',
            as: 'users'
          }
        },
        {
          $project: {
            name: 1,
            isSuperOrg: 1,
            userCount: { $size: '$users' },
            adminCount: {
              $size: {
                $filter: {
                  input: '$users',
                  cond: { $eq: ['$$this.role', 'admin'] }
                }
              }
            },
            instructorCount: {
              $size: {
                $filter: {
                  input: '$users',
                  cond: { $eq: ['$$this.role', 'instructor'] }
                }
              }
            },
            studentCount: {
              $size: {
                $filter: {
                  input: '$users',
                  cond: { $eq: ['$$this.role', 'student'] }
                }
              }
            }
          }
        },
        { $sort: { userCount: -1 } }
      ]) : Promise.resolve([]),

      // Performance overview
      Result.aggregate([
        { $match: { ...organizationScope, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            averageScore: { $avg: '$score.percentage' },
            passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
            totalTimeSpent: { $sum: '$timeSpent' }
          }
        }
      ]),

      // Content creation stats
      Promise.all([
        Question.aggregate([
          { $match: organizationScope },
          {
            $group: {
              _id: '$createdBy',
              questionCount: { $sum: 1 },
              userInfo: { $first: '$$ROOT' }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'creator'
            }
          },
          { $unwind: '$creator' },
          {
            $project: {
              creatorId: '$_id',
              questionCount: 1,
              creatorName: '$creator.fullName',
              creatorRole: '$creator.role'
            }
          },
          { $sort: { questionCount: -1 } },
          { $limit: 10 }
        ]),
        Test.aggregate([
          { $match: organizationScope },
          {
            $group: {
              _id: '$createdBy',
              testCount: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'creator'
            }
          },
          { $unwind: '$creator' },
          {
            $project: {
              creatorId: '$_id',
              testCount: 1,
              creatorName: '$creator.fullName',
              creatorRole: '$creator.role'
            }
          },
          { $sort: { testCount: -1 } },
          { $limit: 10 }
        ])
      ])
    ]);

    // Format response
    const dashboard = {
      overview: {
        totalUsers: userStats[0]?.totalUsers || 0,
        roleDistribution: {
          admin: userStats[0]?.adminCount || 0,
          instructor: userStats[0]?.instructorCount || 0,
          student: userStats[0]?.studentCount || 0
        },
        accountTypes: {
          sso: userStats[0]?.ssoUsers || 0,
          regular: userStats[0]?.regularUsers || 0
        },
        performance: performanceOverview[0] ? {
          totalTestsTaken: performanceOverview[0].totalTests,
          averageScore: Math.round(performanceOverview[0].averageScore * 100) / 100,
          passRate: Math.round(performanceOverview[0].passRate * 100),
          totalTimeSpent: performanceOverview[0].totalTimeSpent
        } : null
      },
      
      recentActivity: {
        newUsersLast30Days: recentUsers,
        registrationTrend: recentUsers.reduce((sum, day) => sum + day.count, 0)
      },

      users: {
        list: userList.map(u => ({
          _id: u._id,
          loginId: u.loginId,
          fullName: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.role,
          isSSO: u.isSSO,
          organizationName: u.organizationId?.name,
          createdAt: u.createdAt
        })),
        pagination: {
          total: totalUsers,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + parseInt(limit) < totalUsers
        }
      },

      content: {
        topQuestionCreators: contentStats[0] || [],
        topTestCreators: contentStats[1] || []
      },

      ...(user.isSuperOrgAdmin && {
        organizations: organizationStats
      })
    };

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

// Individual User Details Dashboard
const getUserDetailsDashboard = async (req, res, next) => {
  try {
    const { user } = req;
    const { userId } = req.params;

    // Validate access to target user
    const targetUser = await User.findById(userId).populate('organizationId', 'name isSuperOrg');
    if (!targetUser) {
      throw createError(404, 'User not found');
    }

    // Check permissions
    if (!user.isSuperOrgAdmin && targetUser.organizationId._id.toString() !== user.organizationId.toString()) {
      throw createError(403, 'Unauthorized to access this user');
    }

    // Parallel aggregations for user details
    const [
      // Test performance analytics
      testPerformance,
      // Recent test activity
      recentActivity,
      // Content created (if instructor/admin)
      createdContent,
      // Detailed performance by type/difficulty
      detailedPerformance,
      // Session analytics
      sessionAnalytics
    ] = await Promise.all([
      // Test performance summary
      Result.aggregate([
        { $match: { userId: targetUser._id } },
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            completedTests: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            averageScore: { $avg: '$score.percentage' },
            passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
            totalTimeSpent: { $sum: '$timeSpent' },
            totalPointsEarned: { $sum: '$score.earnedPoints' },
            totalPointsPossible: { $sum: '$score.totalPoints' }
          }
        }
      ]),

      // Recent test activity (last 10 attempts)
      Result.find({ userId: targetUser._id })
        .populate('testId', 'title testType')
        .select('testId attemptNumber score status completedAt timeSpent')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Content created by user (questions and tests)
      targetUser.role !== 'student' ? Promise.all([
        Question.find({ createdBy: targetUser._id })
          .select('title type language difficulty status usageStats createdAt')
          .sort({ createdAt: -1 })
          .lean(),
        Test.find({ createdBy: targetUser._id })
          .select('title testType status stats createdAt')
          .sort({ createdAt: -1 })
          .lean()
      ]) : [[], []],

      // Performance breakdown by question type and difficulty
      Result.aggregate([
        { $match: { userId: targetUser._id, status: 'completed' } },
        { $unwind: '$questions' },
        {
          $group: {
            _id: {
              type: '$questions.type',
              difficulty: '$questions.difficulty',
              language: '$questions.language'
            },
            totalQuestions: { $sum: 1 },
            correctAnswers: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } },
            averageTime: { $avg: '$questions.timeSpent' },
            averagePoints: { $avg: '$questions.pointsEarned' }
          }
        },
        {
          $project: {
            type: '$_id.type',
            difficulty: '$_id.difficulty',
            language: '$_id.language',
            totalQuestions: 1,
            correctAnswers: 1,
            successRate: { 
              $round: [{ 
                $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] 
              }, 2] 
            },
            averageTime: { $round: ['$averageTime'] },
            averagePoints: { $round: ['$averagePoints', 2] },
            _id: 0
          }
        }
      ]),

      // Session analytics
      TestSession.aggregate([
        { $match: { userId: targetUser._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            averageTime: { $avg: { $subtract: ['$completedAt', '$startedAt'] } }
          }
        }
      ])
    ]);

    // Calculate trends and insights
    const performanceData = testPerformance[0] || {};
    const recentScores = recentActivity.slice(0, 5).map(r => r.score.percentage);
    const scoreTrend = recentScores.length > 1 ? 
      (recentScores[0] - recentScores[recentScores.length - 1]) : 0;

    const dashboard = {
      user: {
        _id: targetUser._id,
        loginId: targetUser.loginId,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: targetUser.role,
        isSSO: targetUser.isSSO,
        organization: {
          _id: targetUser.organizationId._id,
          name: targetUser.organizationId.name,
          isSuperOrg: targetUser.organizationId.isSuperOrg
        },
        createdAt: targetUser.createdAt
      },

      performance: {
        overview: {
          totalTests: performanceData.totalTests || 0,
          completedTests: performanceData.completedTests || 0,
          averageScore: Math.round((performanceData.averageScore || 0) * 100) / 100,
          passRate: Math.round((performanceData.passRate || 0) * 100),
          totalTimeSpent: performanceData.totalTimeSpent || 0,
          efficiency: performanceData.totalPointsPossible > 0 ? 
            Math.round((performanceData.totalPointsEarned / performanceData.totalPointsPossible) * 100) : 0
        },
        trends: {
          recentScores: recentScores,
          scoreChange: Math.round(scoreTrend * 100) / 100,
          isImproving: scoreTrend > 0
        },
        breakdown: {
          byType: detailedPerformance.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
          }, {}),
          byDifficulty: detailedPerformance.reduce((acc, item) => {
            if (!acc[item.difficulty]) acc[item.difficulty] = [];
            acc[item.difficulty].push(item);
            return acc;
          }, {}),
          byLanguage: detailedPerformance.reduce((acc, item) => {
            if (!acc[item.language]) acc[item.language] = [];
            acc[item.language].push(item);
            return acc;
          }, {})
        }
      },

      activity: {
        recent: recentActivity.map(activity => ({
          testId: activity.testId._id,
          testTitle: activity.testId.title,
          testType: activity.testId.testType,
          attemptNumber: activity.attemptNumber,
          score: activity.score,
          status: activity.status,
          completedAt: activity.completedAt,
          timeSpent: activity.timeSpent
        })),
        sessions: sessionAnalytics.reduce((acc, session) => {
          acc[session._id] = {
            count: session.count,
            averageTime: session.averageTime
          };
          return acc;
        }, {})
      },

      ...(targetUser.role !== 'student' && {
        content: {
          questions: createdContent[0].map(q => ({
            _id: q._id,
            title: q.title,
            type: q.type,
            language: q.language,
            difficulty: q.difficulty,
            status: q.status,
            timesUsed: q.usageStats?.timesUsed || 0,
            successRate: q.usageStats?.successRate || 0,
            createdAt: q.createdAt
          })),
          tests: createdContent[1].map(t => ({
            _id: t._id,
            title: t.title,
            testType: t.testType,
            status: t.status,
            totalAttempts: t.stats?.totalAttempts || 0,
            averageScore: t.stats?.averageScore || 0,
            createdAt: t.createdAt
          }))
        }
      })
    };

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserDashboard,
  getUserDetailsDashboard
};