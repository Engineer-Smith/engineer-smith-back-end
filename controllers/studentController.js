// Final Fixed /controllers/studentController.js
const User = require('../models/User');
const Test = require('../models/Test');
const TestSession = require('../models/TestSession');
const Result = require('../models/Result');
const AttemptRequest = require('../models/AttemptRequest');
const StudentOverride = require('../models/StudentTestOverride');
const mongoose = require('mongoose');

const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.userId);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

    const [
      // Tests with attempt calculations (including global tests)
      testsWithAttempts,
      // Performance statistics from Results collection
      performanceStats,
      // Recent activity from TestSessions
      recentSessions,
      // User's requests
      userRequests,
      // Active overrides
      activeOverrides
    ] = await Promise.all([
      // Tests with attempt data - Include global tests and org-specific tests
      Test.aggregate([
        {
          $match: {
            $and: [
              { status: 'active' },
              {
                $or: [
                  { organizationId: organizationId }, // Org-specific tests
                  { isGlobal: true }                   // Global tests
                ]
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'testsessions', // ✅ FIXED: Look in TestSession collection
            let: { testId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', studentId] },
                      { $in: ['$status', ['completed', 'expired', 'abandoned']] }, // ✅ FIXED: Proper session statuses
                      {
                        $or: [
                          { $eq: ['$testSnapshot.originalTestId', '$$testId'] }, // New format
                          { $eq: ['$testId', '$$testId'] }                       // Old format
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: 'completedSessions' // ✅ FIXED: Rename to reflect it's sessions
          }
        },
        {
          $lookup: {
            from: 'studenttestoverrides', // ✅ FIXED: Collection name should match your model
            let: { testId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$testId', '$$testId'] },
                      { $eq: ['$userId', studentId] }
                    ]
                  }
                }
              }
            ],
            as: 'overrides'
          }
        },
        {
          $addFields: {
            usedAttempts: { $size: '$completedSessions' }, // ✅ FIXED: Use sessions count
            extraAttempts: { $sum: '$overrides.extraAttempts' },
            baseAttempts: { $ifNull: ['$settings.attemptsAllowed', 3] }
          }
        },
        {
          $addFields: {
            totalAttempts: { $add: ['$baseAttempts', '$extraAttempts'] },
            remainingAttempts: {
              $max: [0, {
                $subtract: [
                  { $add: ['$baseAttempts', '$extraAttempts'] },
                  '$usedAttempts'
                ]
              }]
            }
          }
        },
        {
          $project: {
            title: 1,
            description: 1,
            testType: 1,
            isGlobal: 1,
            organizationId: 1,
            questionCount: {
              $sum: {
                $map: {
                  input: { $ifNull: ['$sections', []] },
                  as: 'section',
                  in: { $size: { $ifNull: ['$$section.questions', []] } }
                }
              }
            },
            timeLimit: '$settings.timeLimit',
            attemptsAllowed: '$settings.attemptsAllowed',
            shuffleQuestions: '$settings.shuffleQuestions',
            attempts: {
              total: '$totalAttempts',
              used: '$usedAttempts',
              remaining: '$remainingAttempts'
            },
            canTakeTest: { $gt: ['$remainingAttempts', 0] },
            hasOverride: { $gt: [{ $size: '$overrides' }, 0] }
          }
        }
      ]),

      // Performance stats from Results collection (matching your data structure)
      Result.aggregate([
        { $match: { userId: studentId } },
        {
          $group: {
            _id: null,
            totalCompleted: { $sum: 1 },
            averageScore: { $avg: '$score.percentage' }, // Your data has score.percentage
            passedTests: { $sum: { $cond: ['$score.passed', 1, 0] } }, // Your data has score.passed
            totalTimeSpent: { $sum: '$timeSpent' }
          }
        }
      ]),

      // Recent sessions - Updated to match your TestSession structure
      TestSession.find({ userId: studentId })
        .populate('testId', 'title')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean(),

      // User's attempt requests
      AttemptRequest.find({ userId: studentId })
        .populate('testId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Active overrides
      StudentOverride.find({ userId: studentId })
        .populate('testId', 'title')
        .lean()
    ]);

    const dashboard = {
      stats: {
        testsAvailable: testsWithAttempts.length,
        testsCompleted: performanceStats[0]?.totalCompleted || 0,
        averageScore: Math.round((performanceStats[0]?.averageScore || 0) * 10) / 10,
        passedTests: performanceStats[0]?.passedTests || 0,
        totalTimeSpent: performanceStats[0]?.totalTimeSpent || 0
      },

      tests: testsWithAttempts,

      recentActivity: recentSessions.map(session => ({
        id: session._id,
        testTitle: session.testId?.title || 'Unknown Test',
        status: session.status,
        // Look for score in different possible locations
        score: session.finalScore?.percentage || session.score?.percentage || session.finalScore,
        timestamp: session.updatedAt
      })),

      requests: userRequests.map(req => ({
        id: req._id,
        testTitle: req.testId?.title || 'Unknown Test',
        requestedAttempts: req.requestedAttempts,
        status: req.status,
        reason: req.reason,
        createdAt: req.createdAt
      })),

      overrides: activeOverrides.map(override => ({
        id: override._id,
        testTitle: override.testId?.title || 'Unknown Test',
        extraAttempts: override.extraAttempts,
        reason: override.reason,
        grantedAt: override.grantedAt
      }))
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    next(error);
  }
};

module.exports = {
  getStudentDashboard
};