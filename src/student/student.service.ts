// src/student/student.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Test, TestDocument } from '../schemas/test.schema';
import { TestSession, TestSessionDocument } from '../schemas/test-session.schema';
import { Result, ResultDocument } from '../schemas/result.schema';
import { AttemptRequest, AttemptRequestDocument } from '../schemas/attempt-request.schema';
import {
  StudentTestOverride,
  StudentTestOverrideDocument,
} from '../schemas/student-test-override.schema';
import { User, UserDocument } from '../schemas/user.schema';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import { StudentDashboardDto } from './dto/student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Test.name) private testModel: Model<TestDocument>,
    @InjectModel(TestSession.name) private testSessionModel: Model<TestSessionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(AttemptRequest.name) private attemptRequestModel: Model<AttemptRequestDocument>,
    @InjectModel(StudentTestOverride.name)
    private studentOverrideModel: Model<StudentTestOverrideDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Get student dashboard with all relevant data
   */
  async getDashboard(user: RequestUser): Promise<StudentDashboardDto> {
    const studentId = new Types.ObjectId(user.userId);
    const organizationId = new Types.ObjectId(user.organizationId);

    const [testsWithAttempts, performanceStats, recentSessions, userRequests, activeOverrides, userDoc] =
      await Promise.all([
        this.getAvailableTests(studentId, organizationId),
        this.getPerformanceStats(studentId),
        this.getRecentSessions(studentId),
        this.getUserRequests(studentId),
        this.getActiveOverrides(studentId),
        this.userModel.findById(studentId).select('unlimitedAttempts').lean(),
      ]);

    const hasUnlimitedAttempts = (userDoc as any)?.unlimitedAttempts === true;

    // If user has unlimited attempts, modify the test attempts info
    const tests = hasUnlimitedAttempts
      ? testsWithAttempts.map((test: any) => ({
          ...test,
          attempts: {
            total: 'unlimited',
            used: test.attempts.used,
            remaining: 'unlimited',
            unlimited: true,
          },
          canTakeTest: true, // Always can take test with unlimited attempts
        }))
      : testsWithAttempts.map((test: any) => ({
          ...test,
          attempts: {
            ...test.attempts,
            unlimited: false,
          },
        }));

    return {
      stats: {
        testsAvailable: tests.length,
        testsCompleted: performanceStats?.totalCompleted || 0,
        averageScore: Math.round((performanceStats?.averageScore || 0) * 10) / 10,
        passedTests: performanceStats?.passedTests || 0,
        totalTimeSpent: performanceStats?.totalTimeSpent || 0,
      },

      tests,

      recentActivity: recentSessions.map((session: any) => ({
        id: session._id.toString(),
        testTitle: session.testId?.title || 'Unknown Test',
        status: session.status,
        score: session.finalScore?.percentage || session.score?.percentage || null,
        timestamp: session.updatedAt,
      })),

      requests: userRequests.map((req: any) => ({
        id: req._id.toString(),
        testTitle: req.testId?.title || 'Unknown Test',
        requestedAttempts: req.requestedAttempts,
        status: req.status,
        reason: req.reason,
        createdAt: req.createdAt,
      })),

      overrides: activeOverrides.map((override: any) => ({
        id: override._id.toString(),
        testTitle: override.testId?.title || 'Unknown Test',
        extraAttempts: override.extraAttempts,
        reason: override.reason,
        grantedAt: override.grantedAt,
      })),
    };
  }

  /**
   * Get available tests with attempt calculations
   */
  private async getAvailableTests(
    studentId: Types.ObjectId,
    organizationId: Types.ObjectId,
  ): Promise<any[]> {
    return this.testModel.aggregate([
      {
        $match: {
          $and: [
            { status: 'active' },
            {
              $or: [
                { organizationId: organizationId }, // Org-specific tests
                { isGlobal: true }, // Global tests
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'testsessions',
          let: { testId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', studentId] },
                    { $in: ['$status', ['completed', 'expired', 'abandoned']] },
                    {
                      $or: [
                        { $eq: ['$testSnapshot.originalTestId', '$$testId'] }, // New format
                        { $eq: ['$testId', '$$testId'] }, // Old format
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'completedSessions',
        },
      },
      {
        $lookup: {
          from: 'studenttestoverrides',
          let: { testId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$testId', '$$testId'] }, { $eq: ['$userId', studentId] }],
                },
              },
            },
          ],
          as: 'overrides',
        },
      },
      {
        $addFields: {
          usedAttempts: { $size: '$completedSessions' },
          extraAttempts: { $sum: '$overrides.extraAttempts' },
          baseAttempts: { $ifNull: ['$settings.attemptsAllowed', 3] },
        },
      },
      {
        $addFields: {
          totalAttempts: { $add: ['$baseAttempts', '$extraAttempts'] },
          remainingAttempts: {
            $max: [
              0,
              {
                $subtract: [{ $add: ['$baseAttempts', '$extraAttempts'] }, '$usedAttempts'],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          testType: 1,
          isGlobal: 1,
          organizationId: 1,
          questionCount: {
            $cond: {
              if: '$settings.useSections',
              then: {
                $sum: {
                  $map: {
                    input: { $ifNull: ['$sections', []] },
                    as: 'section',
                    in: { $size: { $ifNull: ['$$section.questions', []] } },
                  },
                },
              },
              else: { $size: { $ifNull: ['$questions', []] } },
            },
          },
          timeLimit: '$settings.timeLimit',
          attemptsAllowed: '$settings.attemptsAllowed',
          shuffleQuestions: '$settings.shuffleQuestions',
          attempts: {
            total: '$totalAttempts',
            used: '$usedAttempts',
            remaining: '$remainingAttempts',
          },
          canTakeTest: { $gt: ['$remainingAttempts', 0] },
          hasOverride: { $gt: [{ $size: '$overrides' }, 0] },
        },
      },
    ]);
  }

  /**
   * Get performance statistics from Results collection
   */
  private async getPerformanceStats(studentId: Types.ObjectId): Promise<any> {
    const stats = await this.resultModel.aggregate([
      { $match: { userId: studentId } },
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: 1 },
          averageScore: { $avg: '$score.percentage' },
          passedTests: { $sum: { $cond: ['$score.passed', 1, 0] } },
          totalTimeSpent: { $sum: '$timeSpent' },
        },
      },
    ]);

    return stats[0] || null;
  }

  /**
   * Get recent test sessions
   */
  private async getRecentSessions(studentId: Types.ObjectId): Promise<any[]> {
    return this.testSessionModel
      .find({ userId: studentId })
      .populate('testId', 'title')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
  }

  /**
   * Get user's attempt requests
   */
  private async getUserRequests(studentId: Types.ObjectId): Promise<any[]> {
    return this.attemptRequestModel
      .find({ userId: studentId })
      .populate('testId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  /**
   * Get active overrides for user
   */
  private async getActiveOverrides(studentId: Types.ObjectId): Promise<any[]> {
    return this.studentOverrideModel
      .find({ userId: studentId })
      .populate('testId', 'title')
      .lean();
  }
}