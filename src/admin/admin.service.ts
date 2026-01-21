// src/admin/admin.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Organization, OrganizationDocument } from '../schemas/organization.schema';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { Test, TestDocument } from '../schemas/test.schema';
import { TestSession, TestSessionDocument } from '../schemas/test-session.schema';
import { Result, ResultDocument } from '../schemas/result.schema';
import {
  StudentTestOverride,
  StudentTestOverrideDocument,
} from '../schemas/student-test-override.schema';
import {
  UserDashboardQueryDto,
  GrantAttemptsDto,
  UpdateOverrideDto,
  OverrideQueryDto,
} from './dto/admin.dto';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Test.name) private testModel: Model<TestDocument>,
    @InjectModel(TestSession.name) private testSessionModel: Model<TestSessionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(StudentTestOverride.name)
    private overrideModel: Model<StudentTestOverrideDocument>,
  ) {}

  /**
   * Get comprehensive user management dashboard
   */
  async getUserDashboard(filters: UserDashboardQueryDto, user: RequestUser): Promise<any> {
    // Build organization scope
    const organizationScope: any = {};
    if (user.isSuperOrgAdmin) {
      if (filters.orgId) organizationScope.organizationId = new Types.ObjectId(filters.orgId);
    } else {
      organizationScope.organizationId = new Types.ObjectId(user.organizationId);
    }

    // Build user query
    const userQuery: any = { ...organizationScope };
    if (filters.role) userQuery.role = filters.role;
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      userQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { loginId: searchRegex },
        { email: searchRegex },
      ];
    }

    const [
      userStats,
      recentUsers,
      userList,
      totalUsers,
      organizationStats,
      performanceOverview,
      contentStats,
    ] = await Promise.all([
      this.getUserStatistics(organizationScope),
      this.getRecentUsers(organizationScope),
      this.getUserList(userQuery, filters),
      this.userModel.countDocuments(userQuery),
      user.isSuperOrgAdmin ? this.getOrganizationStats() : Promise.resolve([]),
      this.getPerformanceOverview(organizationScope),
      this.getContentStats(organizationScope),
    ]);

    return {
      overview: {
        totalUsers: userStats?.totalUsers || 0,
        roleDistribution: {
          admin: userStats?.adminCount || 0,
          instructor: userStats?.instructorCount || 0,
          student: userStats?.studentCount || 0,
        },
        accountTypes: {
          sso: userStats?.ssoUsers || 0,
          regular: userStats?.regularUsers || 0,
        },
        performance: performanceOverview
          ? {
              totalTestsTaken: performanceOverview.totalTests,
              averageScore: Math.round(performanceOverview.averageScore * 100) / 100,
              passRate: Math.round(performanceOverview.passRate * 100),
              totalTimeSpent: performanceOverview.totalTimeSpent,
            }
          : null,
      },
      recentActivity: {
        newUsersLast30Days: recentUsers,
        registrationTrend: recentUsers.reduce((sum: number, day: any) => sum + day.count, 0),
      },
      users: {
        list: userList.map((u: any) => ({
          _id: u._id,
          loginId: u.loginId,
          fullName: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.role,
          isSSO: u.isSSO,
          organizationName: u.organizationId?.name,
          createdAt: u.createdAt,
        })),
        pagination: {
          total: totalUsers,
          limit: filters.limit || 20,
          skip: filters.skip || 0,
          hasMore: (filters.skip || 0) + (filters.limit || 20) < totalUsers,
        },
      },
      content: {
        topQuestionCreators: contentStats[0] || [],
        topTestCreators: contentStats[1] || [],
      },
      ...(user.isSuperOrgAdmin && { organizations: organizationStats }),
    };
  }

  /**
   * Get individual user details dashboard
   */
  async getUserDetailsDashboard(userId: string, currentUser: RequestUser): Promise<any> {
    const targetUser = await this.userModel
      .findById(userId)
      .populate('organizationId', 'name isSuperOrg');

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    const targetOrgId = (targetUser.organizationId as any)._id.toString();
    if (!currentUser.isSuperOrgAdmin && targetOrgId !== currentUser.organizationId) {
      throw new ForbiddenException('Unauthorized to access this user');
    }

    const targetUserId = new Types.ObjectId(userId);

    const [testPerformance, recentActivity, createdContent, detailedPerformance, sessionAnalytics] =
      await Promise.all([
        this.getTestPerformance(targetUserId),
        this.getRecentTestActivity(targetUserId),
        targetUser.role !== 'student'
          ? this.getCreatedContent(targetUserId)
          : Promise.resolve([[], []]),
        this.getDetailedPerformance(targetUserId),
        this.getSessionAnalytics(targetUserId),
      ]);

    const performanceData = testPerformance || {};
    const recentScores = recentActivity.slice(0, 5).map((r: any) => r.score?.percentage || 0);
    const scoreTrend =
      recentScores.length > 1 ? recentScores[0] - recentScores[recentScores.length - 1] : 0;

    return {
      user: {
        _id: targetUser._id,
        loginId: targetUser.loginId,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        fullName: `${targetUser.firstName} ${targetUser.lastName}`,
        email: targetUser.email,
        role: targetUser.role,
        isSSO: targetUser.isSSO,
        organization: {
          _id: (targetUser.organizationId as any)._id,
          name: (targetUser.organizationId as any).name,
          isSuperOrg: (targetUser.organizationId as any).isSuperOrg,
        },
        createdAt: targetUser.createdAt,
      },
      performance: {
        overview: {
          totalTests: performanceData.totalTests || 0,
          completedTests: performanceData.completedTests || 0,
          averageScore: Math.round((performanceData.averageScore || 0) * 100) / 100,
          passRate: Math.round((performanceData.passRate || 0) * 100),
          totalTimeSpent: performanceData.totalTimeSpent || 0,
          efficiency:
            performanceData.totalPointsPossible > 0
              ? Math.round(
                  (performanceData.totalPointsEarned / performanceData.totalPointsPossible) * 100,
                )
              : 0,
        },
        trends: {
          recentScores,
          scoreChange: Math.round(scoreTrend * 100) / 100,
          isImproving: scoreTrend > 0,
        },
        breakdown: this.buildPerformanceBreakdown(detailedPerformance),
      },
      activity: {
        recent: recentActivity.map((activity: any) => ({
          testId: activity.testId?._id,
          testTitle: activity.testId?.title,
          testType: activity.testId?.testType,
          attemptNumber: activity.attemptNumber,
          score: activity.score,
          status: activity.status,
          completedAt: activity.completedAt,
          timeSpent: activity.timeSpent,
        })),
        sessions: sessionAnalytics.reduce((acc: any, session: any) => {
          acc[session._id] = {
            count: session.count,
            averageTime: session.averageTime,
          };
          return acc;
        }, {}),
      },
      ...(targetUser.role !== 'student' && {
        content: {
          questions: (createdContent[0] || []).map((q: any) => ({
            _id: q._id,
            title: q.title,
            type: q.type,
            language: q.language,
            difficulty: q.difficulty,
            status: q.status,
            timesUsed: q.usageStats?.timesUsed || 0,
            successRate: q.usageStats?.successRate || 0,
            createdAt: q.createdAt,
          })),
          tests: (createdContent[1] || []).map((t: any) => ({
            _id: t._id,
            title: t.title,
            testType: t.testType,
            status: t.status,
            totalAttempts: t.stats?.totalAttempts || 0,
            averageScore: t.stats?.averageScore || 0,
            createdAt: t.createdAt,
          })),
        },
      }),
    };
  }

  /**
   * Grant additional attempts to a student
   */
  async grantAttempts(dto: GrantAttemptsDto, currentUser: RequestUser): Promise<any> {
    const { userId, testId, extraAttempts, reason } = dto;

    // Validate test exists
    const test = await this.testModel.findById(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Check permissions for test
    if (
      !currentUser.isSuperOrgAdmin &&
      test.organizationId &&
      test.organizationId.toString() !== currentUser.organizationId
    ) {
      throw new ForbiddenException('Cannot grant attempts for tests outside your organization');
    }

    // Validate student exists
    const student = await this.userModel.findById(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check permissions for student
    if (
      !currentUser.isSuperOrgAdmin &&
      student.organizationId.toString() !== currentUser.organizationId
    ) {
      throw new ForbiddenException('Cannot grant attempts for students outside your organization');
    }

    // Create or update override
    const override = await this.overrideModel.findOneAndUpdate(
      { userId, testId },
      {
        $inc: { extraAttempts },
        $set: {
          organizationId: currentUser.organizationId,
          reason,
          grantedBy: currentUser.userId,
          grantedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    return {
      success: true,
      message: `Granted ${extraAttempts} additional attempt(s) to ${student.firstName} ${student.lastName}`,
      override,
    };
  }

  /**
   * Get all overrides with filters
   */
  async getOverrides(filters: OverrideQueryDto, currentUser: RequestUser): Promise<any[]> {
    const query: any = {};

    if (!currentUser.isSuperOrgAdmin) {
      query.organizationId = currentUser.organizationId;
    }

    if (filters.testId) query.testId = filters.testId;
    if (filters.userId) query.userId = filters.userId;

    return this.overrideModel
      .find(query)
      .populate('userId', 'firstName lastName email')
      .populate('testId', 'title')
      .populate('grantedBy', 'firstName lastName')
      .sort({ grantedAt: -1 })
      .lean();
  }

  /**
   * Update an override
   */
  async updateOverride(
    overrideId: string,
    dto: UpdateOverrideDto,
    currentUser: RequestUser,
  ): Promise<any> {
    const override = await this.overrideModel.findById(overrideId);

    if (!override) {
      throw new NotFoundException('Override not found');
    }

    if (
      !currentUser.isSuperOrgAdmin &&
      override.organizationId.toString() !== currentUser.organizationId
    ) {
      throw new ForbiddenException('Access denied');
    }

    override.extraAttempts = dto.extraAttempts;
    override.reason = dto.reason;
    override.grantedBy = new Types.ObjectId(currentUser.userId);
    override.grantedAt = new Date();

    await override.save();

    return {
      success: true,
      message: 'Override updated successfully',
      override,
    };
  }

  /**
   * Delete an override
   */
  async deleteOverride(overrideId: string, currentUser: RequestUser): Promise<any> {
    const override = await this.overrideModel.findById(overrideId);

    if (!override) {
      throw new NotFoundException('Override not found');
    }

    if (
      !currentUser.isSuperOrgAdmin &&
      override.organizationId.toString() !== currentUser.organizationId
    ) {
      throw new ForbiddenException('Access denied');
    }

    await this.overrideModel.findByIdAndDelete(overrideId);

    return {
      success: true,
      message: 'Override removed successfully',
    };
  }

  /**
   * Get attempt status for a student on a test
   */
  async getAttemptStatus(
    testId: string,
    userId: string,
    currentUser: RequestUser,
  ): Promise<any> {
    const test = await this.testModel.findById(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const student = await this.userModel.findById(userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check permissions
    if (!currentUser.isSuperOrgAdmin) {
      if (
        test.organizationId &&
        test.organizationId.toString() !== currentUser.organizationId
      ) {
        throw new ForbiddenException('Access denied');
      }
      if (student.organizationId.toString() !== currentUser.organizationId) {
        throw new ForbiddenException('Access denied');
      }
    }

    // Count used attempts
    const usedAttempts = await this.testSessionModel.countDocuments({
      userId: new Types.ObjectId(userId),
      $or: [
        { 'testSnapshot.originalTestId': new Types.ObjectId(testId) },
        { testId: new Types.ObjectId(testId) },
      ],
      status: { $in: ['completed', 'expired', 'abandoned'] },
    });

    // Get override
    const override = await this.overrideModel
      .findOne({ userId, testId })
      .populate('grantedBy', 'firstName lastName');

    const baseAttempts = test.settings?.attemptsAllowed || 3;
    const extraAttempts = override?.extraAttempts || 0;
    const totalAllowed = baseAttempts + extraAttempts;
    const hasUnlimitedAttempts = (student as any).unlimitedAttempts === true;
    const remaining = hasUnlimitedAttempts ? Infinity : Math.max(0, totalAllowed - usedAttempts);

    return {
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        unlimitedAttempts: hasUnlimitedAttempts,
      },
      test: {
        id: test._id,
        title: test.title,
        baseAttempts,
      },
      attempts: {
        total: hasUnlimitedAttempts ? 'unlimited' : totalAllowed,
        used: usedAttempts,
        remaining: hasUnlimitedAttempts ? 'unlimited' : remaining,
        unlimited: hasUnlimitedAttempts,
      },
      override: override
        ? {
            extraAttempts: override.extraAttempts,
            reason: override.reason,
            grantedBy: override.grantedBy
              ? `${(override.grantedBy as any).firstName} ${(override.grantedBy as any).lastName}`
              : null,
            grantedAt: override.grantedAt,
          }
        : null,
    };
  }

  // Private helper methods

  private async getUserStatistics(organizationScope: any): Promise<any> {
    const stats = await this.userModel.aggregate([
      { $match: organizationScope },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          adminCount: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          instructorCount: { $sum: { $cond: [{ $eq: ['$role', 'instructor'] }, 1, 0] } },
          studentCount: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          ssoUsers: { $sum: { $cond: ['$isSSO', 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $not: '$isSSO' }, 1, 0] } },
        },
      },
    ]);
    return stats[0] || null;
  }

  private async getRecentUsers(organizationScope: any): Promise<any[]> {
    return this.userModel.aggregate([
      {
        $match: {
          ...organizationScope,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getUserList(userQuery: any, filters: UserDashboardQueryDto): Promise<any[]> {
    return this.userModel
      .find(userQuery)
      .populate('organizationId', 'name isSuperOrg')
      .select('loginId firstName lastName email role isSSO createdAt')
      .sort({ createdAt: -1 })
      .skip(filters.skip || 0)
      .limit(filters.limit || 20)
      .lean();
  }

  private async getOrganizationStats(): Promise<any[]> {
    return this.organizationModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'organizationId',
          as: 'users',
        },
      },
      {
        $project: {
          name: 1,
          isSuperOrg: 1,
          userCount: { $size: '$users' },
          adminCount: {
            $size: {
              $filter: { input: '$users', cond: { $eq: ['$$this.role', 'admin'] } },
            },
          },
          instructorCount: {
            $size: {
              $filter: { input: '$users', cond: { $eq: ['$$this.role', 'instructor'] } },
            },
          },
          studentCount: {
            $size: {
              $filter: { input: '$users', cond: { $eq: ['$$this.role', 'student'] } },
            },
          },
        },
      },
      { $sort: { userCount: -1 } },
    ]);
  }

  private async getPerformanceOverview(organizationScope: any): Promise<any> {
    const stats = await this.resultModel.aggregate([
      { $match: { ...organizationScope, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$score.percentage' },
          passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
          totalTimeSpent: { $sum: '$timeSpent' },
        },
      },
    ]);
    return stats[0] || null;
  }

  private async getContentStats(organizationScope: any): Promise<any[]> {
    const questionCreators = this.questionModel.aggregate([
      { $match: organizationScope },
      { $group: { _id: '$createdBy', questionCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      {
        $project: {
          creatorId: '$_id',
          questionCount: 1,
          creatorName: {
            $concat: ['$creator.firstName', ' ', '$creator.lastName'],
          },
          creatorRole: '$creator.role',
        },
      },
      { $sort: { questionCount: -1 } },
      { $limit: 10 },
    ]);

    const testCreators = this.testModel.aggregate([
      { $match: organizationScope },
      { $group: { _id: '$createdBy', testCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      {
        $project: {
          creatorId: '$_id',
          testCount: 1,
          creatorName: {
            $concat: ['$creator.firstName', ' ', '$creator.lastName'],
          },
          creatorRole: '$creator.role',
        },
      },
      { $sort: { testCount: -1 } },
      { $limit: 10 },
    ]);

    return Promise.all([questionCreators, testCreators]);
  }

  private async getTestPerformance(userId: Types.ObjectId): Promise<any> {
    const stats = await this.resultModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          completedTests: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          averageScore: { $avg: '$score.percentage' },
          passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
          totalTimeSpent: { $sum: '$timeSpent' },
          totalPointsEarned: { $sum: '$score.earnedPoints' },
          totalPointsPossible: { $sum: '$score.totalPoints' },
        },
      },
    ]);
    return stats[0] || null;
  }

  private async getRecentTestActivity(userId: Types.ObjectId): Promise<any[]> {
    return this.resultModel
      .find({ userId })
      .populate('testId', 'title testType')
      .select('testId attemptNumber score status completedAt timeSpent')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }

  private async getCreatedContent(userId: Types.ObjectId): Promise<any[]> {
    const questions = this.questionModel
      .find({ createdBy: userId } as any)
      .select('title type language difficulty status usageStats createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const tests = this.testModel
      .find({ createdBy: userId } as any)
      .select('title testType status stats createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return Promise.all([questions, tests]);
  }

  private async getDetailedPerformance(userId: Types.ObjectId): Promise<any[]> {
    return this.resultModel.aggregate([
      { $match: { userId, status: 'completed' } },
      { $unwind: '$questions' },
      {
        $group: {
          _id: {
            type: '$questions.type',
            difficulty: '$questions.difficulty',
            language: '$questions.language',
          },
          totalQuestions: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } },
          averageTime: { $avg: '$questions.timeSpent' },
          averagePoints: { $avg: '$questions.pointsEarned' },
        },
      },
      {
        $project: {
          type: '$_id.type',
          difficulty: '$_id.difficulty',
          language: '$_id.language',
          totalQuestions: 1,
          correctAnswers: 1,
          successRate: {
            $round: [{ $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }, 2],
          },
          averageTime: { $round: ['$averageTime'] },
          averagePoints: { $round: ['$averagePoints', 2] },
          _id: 0,
        },
      },
    ]);
  }

  private async getSessionAnalytics(userId: Types.ObjectId): Promise<any[]> {
    return this.testSessionModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageTime: { $avg: { $subtract: ['$completedAt', '$startedAt'] } },
        },
      },
    ]);
  }

  private buildPerformanceBreakdown(detailedPerformance: any[]): any {
    const byType: any = {};
    const byDifficulty: any = {};
    const byLanguage: any = {};

    detailedPerformance.forEach((item) => {
      if (item.type) {
        if (!byType[item.type]) byType[item.type] = [];
        byType[item.type].push(item);
      }
      if (item.difficulty) {
        if (!byDifficulty[item.difficulty]) byDifficulty[item.difficulty] = [];
        byDifficulty[item.difficulty].push(item);
      }
      if (item.language) {
        if (!byLanguage[item.language]) byLanguage[item.language] = [];
        byLanguage[item.language].push(item);
      }
    });

    return { byType, byDifficulty, byLanguage };
  }
}