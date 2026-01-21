// src/code-challenge/code-challenge.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CodeChallenge, CodeChallengeDocument } from '../schemas/code-challenge.schema';
import { Track, TrackDocument } from '../schemas/track.schema';
import { ChallengeSubmission, ChallengeSubmissionDocument } from '../schemas/challenge-submission.schema';
import { UserChallengeProgress, UserChallengeProgressDocument } from '../schemas/user-challenge-progress.schema';
import { UserTrackProgress, UserTrackProgressDocument } from '../schemas/user-track-progress.schema';
import { GradingService } from '../grading/grading.service';
import {
  GetChallengesQueryDto,
  GetTracksQueryDto,
  RunCodeDto,
} from './dto/code-challenge.dto';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class CodeChallengeService {
  constructor(
    @InjectModel(CodeChallenge.name) private challengeModel: Model<CodeChallengeDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(ChallengeSubmission.name) private submissionModel: Model<ChallengeSubmissionDocument>,
    @InjectModel(UserChallengeProgress.name) private progressModel: Model<UserChallengeProgressDocument>,
    @InjectModel(UserTrackProgress.name) private trackProgressModel: Model<UserTrackProgressDocument>,
    private readonly gradingService: GradingService,
  ) {}

  // ==========================================
  // PUBLIC METHODS (Browse)
  // ==========================================

  /**
   * Get all tracks for browsing
   */
  async getTracks(filters: GetTracksQueryDto): Promise<any> {
    const query: any = { isActive: true };

    if (filters.language) query.language = filters.language;
    if (filters.category) query.category = filters.category;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.featured === 'true') query.isFeatured = true;

    const tracks = await this.trackModel
      .find(query)
      .sort({
        isFeatured: -1,
        'stats.rating': -1,
        'stats.totalEnrolled': -1,
      })
      .populate('challenges.challengeId', 'title difficulty')
      .lean();

    return {
      success: true,
      tracks: tracks.map((track) => ({
        ...track,
        challenges: (track.challenges as any[])?.length || 0,
      })),
    };
  }

  /**
   * Get specific track with challenges
   */
  async getTrack(language: string, trackSlug: string, user?: RequestUser): Promise<any> {
    const track = await this.trackModel
      .findOne({ language, slug: trackSlug, isActive: true })
      .populate('challenges.challengeId')
      .lean();

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    let userProgress: any = null;
    if (user?.userId) {
      userProgress = await this.trackProgressModel
        .findOne({
          userId: new Types.ObjectId(user.userId),
          trackId: track._id,
        })
        .lean();
    }

    return {
      success: true,
      track: {
        ...track,
        userProgress,
      },
    };
  }

  /**
   * Get all challenges with filtering
   */
  async getChallenges(filters: GetChallengesQueryDto, user?: RequestUser): Promise<any> {
    const query: any = { status: 'active' };

    if (filters.language) query.supportedLanguages = filters.language;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.topic) query.topics = filters.topic;

    // Sorting
    let sort: any = { createdAt: 1 };
    switch (filters.sortBy) {
      case 'difficulty':
        sort = { difficulty: 1, createdAt: 1 };
        break;
      case 'popular':
        sort = { 'usageStats.totalAttempts': -1 };
        break;
      case 'success-rate':
        sort = { 'usageStats.successRate': -1 };
        break;
    }

    const skip = ((filters.page || 1) - 1) * (filters.limit || 20);

    const [challenges, total] = await Promise.all([
      this.challengeModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(filters.limit || 20)
        .select('-testCases -solutionCode -editorial')
        .lean(),
      this.challengeModel.countDocuments(query),
    ]);

    // Get user progress if authenticated
    let userProgressMap: Record<string, any> = {};
    if (user?.userId && challenges.length > 0) {
      const challengeIds = challenges.map((c) => c._id);
      const userProgress = await this.progressModel.find({
        userId: new Types.ObjectId(user.userId),
        challengeId: { $in: challengeIds },
      } as any);

      userProgressMap = userProgress.reduce((map, progress) => {
        map[progress.challengeId.toString()] = progress;
        return map;
      }, {} as Record<string, any>);
    }

    // Filter by solved status if requested
    let filteredChallenges = challenges;
    if (filters.solved !== undefined && user?.userId) {
      filteredChallenges = challenges.filter((challenge) => {
        const progress = userProgressMap[challenge._id.toString()];
        const isSolved = progress?.status === 'solved';
        return filters.solved === 'true' ? isSolved : !isSolved;
      });
    }

    return {
      success: true,
      challenges: filteredChallenges.map((challenge) => ({
        ...challenge,
        userProgress: userProgressMap[challenge._id.toString()] || null,
      })),
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20)),
      },
    };
  }

  /**
   * Get specific challenge
   */
  async getChallenge(challengeId: string, user?: RequestUser): Promise<any> {
    const challenge = await this.challengeModel
      .findOne({ _id: challengeId, status: 'active' })
      .lean();

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    let userProgress: any = null;
    let recentSubmissions: any[] = [];

    if (user?.userId) {
      const userId = new Types.ObjectId(user.userId);
      const [progress, submissions] = await Promise.all([
        this.progressModel.findOne({ userId, challengeId: challenge._id } as any),
        this.submissionModel
          .find({ userId, challengeId: challenge._id } as any)
          .sort({ submittedAt: -1 })
          .limit(5)
          .select('language status submittedAt passedTests totalTests executionTime')
          .lean(),
      ]);
      userProgress = progress;
      recentSubmissions = submissions;
    }

    // Only show non-hidden test cases
    const responseChallenge = {
      ...challenge,
      testCases: (challenge.testCases as any[])?.filter((tc) => !tc.hidden) || [],
      solutionCode: undefined,
      editorial: undefined,
    };

    return {
      success: true,
      challenge: responseChallenge,
      userProgress,
      recentSubmissions,
    };
  }

  // ==========================================
  // AUTHENTICATED USER METHODS
  // ==========================================

  /**
   * Test code against sample test cases (no submission created)
   */
  async testChallenge(
    challengeId: string,
    dto: RunCodeDto,
    user: RequestUser,
  ): Promise<any> {
    const challenge = await this.challengeModel.findOne({
      _id: challengeId,
      status: 'active',
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (!challenge.supportedLanguages.includes(dto.language)) {
      throw new BadRequestException(`Language ${dto.language} not supported for this challenge`);
    }

    // Get only sample test cases (non-hidden)
    const sampleTestCases = (challenge.testCases as any[])?.filter((tc) => !tc.hidden) || [];

    if (sampleTestCases.length === 0) {
      throw new BadRequestException('No sample test cases available for testing');
    }

    const codeConfig = (challenge.codeConfig as any)?.[dto.language];
    if (!codeConfig) {
      throw new BadRequestException(`No code configuration found for language: ${dto.language}`);
    }

    try {
      const testResults = await this.gradingService.runCodeTests({
        code: dto.code,
        language: dto.language as any,
        runtime: codeConfig.runtime,
        entryFunction: codeConfig.entryFunction,
        testCases: sampleTestCases,
        timeoutMs: codeConfig.timeoutMs,
      });

      return {
        success: true,
        results: testResults,
        note: 'These are sample test cases only. Submit to test against all test cases.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        results: {
          overallPassed: false,
          totalTests: sampleTestCases.length,
          totalTestsPassed: 0,
          testResults: [],
          executionError: error.message,
        },
      };
    }
  }

  /**
   * Submit solution to challenge
   */
  async submitChallenge(
    challengeId: string,
    dto: RunCodeDto,
    user: RequestUser,
  ): Promise<any> {
    const challenge = await this.challengeModel.findOne({
      _id: challengeId,
      status: 'active',
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (!challenge.supportedLanguages.includes(dto.language)) {
      throw new BadRequestException(`Language ${dto.language} not supported`);
    }

    const codeConfig = (challenge.codeConfig as any)?.[dto.language];
    if (!codeConfig) {
      throw new BadRequestException(`No code configuration for language: ${dto.language}`);
    }

    const userId = new Types.ObjectId(user.userId);

    // Get submission count for this user/challenge/language
    const submissionCount = await this.submissionModel.countDocuments({
      userId,
      challengeId: challenge._id,
      language: dto.language,
    } as any);

    // Create submission record
    const submission = new this.submissionModel({
      userId,
      challengeId: challenge._id,
      language: dto.language,
      code: dto.code,
      status: 'running',
      submissionNumber: submissionCount + 1,
      submittedAt: new Date(),
      startedProcessingAt: new Date(),
    });
    await submission.save();

    // Get or create user progress
    let userProgress = await this.progressModel.findOne({
      userId,
      challengeId: challenge._id,
      trackId: null,
    } as any);

    if (!userProgress) {
      userProgress = new this.progressModel({
        userId,
        challengeId: challenge._id,
        trackId: null,
        status: 'not_attempted',
      });
    }

    try {
      // Run tests against ALL test cases
      const testResults = await this.gradingService.runCodeTests({
        code: dto.code,
        language: dto.language as any,
        runtime: codeConfig.runtime,
        entryFunction: codeConfig.entryFunction,
        testCases: challenge.testCases,
        timeoutMs: codeConfig.timeoutMs,
      });

      // Update submission
      submission.status = testResults.overallPassed ? 'passed' : 'failed';
      submission.testResults = testResults.testResults as any;
      submission.totalTests = testResults.totalTests;
      submission.passedTests = testResults.totalTestsPassed;
      submission.failedTests = testResults.totalTests - testResults.totalTestsPassed;
      submission.executionTime = (testResults as any).executionTime || 0;
      submission.completedProcessingAt = new Date();
      await submission.save();

      // Update user progress
      this.updateUserProgress(
        userProgress,
        dto.language,
        testResults.overallPassed,
        (testResults as any).executionTime || 0,
        submission._id as Types.ObjectId,
      );
      await userProgress.save();

      // Update challenge stats
      await this.updateChallengeStats(challenge, testResults.overallPassed);

      // Hide hidden test case details in response
      const publicResults = {
        ...testResults,
        testResults: testResults.testResults.map((result: any, index: number) => {
          const testCase = (challenge.testCases as any[])[index];
          if (testCase?.hidden) {
            return {
              ...result,
              actualOutput: result.passed ? result.actualOutput : 'Hidden',
              expectedOutput: 'Hidden',
              testName: result.testName || `Hidden Test Case ${index + 1}`,
            };
          }
          return result;
        }),
      };

      return {
        success: true,
        submissionId: submission._id,
        results: publicResults,
        userProgress: await this.progressModel.findById(userProgress._id),
      };
    } catch (error: any) {
      submission.status = 'error';
      submission.runtimeError = error.message;
      submission.completedProcessingAt = new Date();
      await submission.save();

      return {
        success: false,
        submissionId: submission._id,
        error: error.message,
        results: {
          overallPassed: false,
          totalTests: (challenge.testCases as any[]).length,
          totalTestsPassed: 0,
          testResults: [],
          executionError: error.message,
        },
      };
    }
  }

  /**
   * Enroll in a track
   */
  async enrollInTrack(
    language: string,
    trackSlug: string,
    user: RequestUser,
  ): Promise<any> {
    const track = await this.trackModel.findOne({
      language,
      slug: trackSlug,
      isActive: true,
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const userId = new Types.ObjectId(user.userId);

    // Check if already enrolled
    let userProgress = await this.trackProgressModel.findOne({
      userId,
      trackId: track._id,
    } as any);

    if (userProgress) {
      return {
        success: true,
        message: 'Already enrolled in this track',
        userProgress,
      };
    }

    // Create new enrollment
    userProgress = new this.trackProgressModel({
      userId,
      trackId: track._id,
      totalChallenges: (track.challenges as any[]).length,
    });
    await userProgress.save();

    // Update track stats
    track.stats.totalEnrolled = (track.stats.totalEnrolled || 0) + 1;
    await track.save();

    return {
      success: true,
      message: 'Successfully enrolled in track',
      userProgress,
    };
  }

  /**
   * Get user's track progress
   */
  async getUserTrackProgress(
    language: string,
    trackSlug: string,
    user: RequestUser,
  ): Promise<any> {
    const track = await this.trackModel
      .findOne({ language, slug: trackSlug, isActive: true })
      .populate('challenges.challengeId');

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const userId = new Types.ObjectId(user.userId);

    const userProgress = await this.trackProgressModel.findOne({
      userId,
      trackId: track._id,
    } as any);

    if (!userProgress) {
      throw new NotFoundException('Not enrolled in this track');
    }

    // Get challenge progress for all challenges in track
    const challengeIds = (track.challenges as any[]).map((c) => c.challengeId._id);
    const challengeProgress = await this.progressModel.find({
      userId,
      challengeId: { $in: challengeIds },
    } as any);

    const challengeProgressMap = challengeProgress.reduce((map, progress) => {
      map[progress.challengeId.toString()] = progress;
      return map;
    }, {} as Record<string, any>);

    const enrichedTrack = {
      ...track.toObject(),
      challenges: (track.challenges as any[]).map((trackChallenge, index) => ({
        ...trackChallenge,
        challenge: trackChallenge.challengeId,
        userProgress: challengeProgressMap[trackChallenge.challengeId._id.toString()] || null,
        isUnlocked: userProgress.completedChallenges >= trackChallenge.unlockAfter,
      })),
    };

    return {
      success: true,
      track: enrichedTrack,
      userProgress,
    };
  }

  /**
   * Get user dashboard/stats
   */
  async getUserDashboard(user: RequestUser): Promise<any> {
    const userId = new Types.ObjectId(user.userId);

    const [userChallengeStats, userTrackStats, recentSubmissions, recentActivity] =
      await Promise.all([
        this.progressModel.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: null,
              totalAttempted: {
                $sum: { $cond: [{ $ne: ['$status', 'not_attempted'] }, 1, 0] },
              },
              totalSolved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
              javascriptSolved: {
                $sum: { $cond: [{ $eq: ['$solutions.javascript.status', 'solved'] }, 1, 0] },
              },
              pythonSolved: {
                $sum: { $cond: [{ $eq: ['$solutions.python.status', 'solved'] }, 1, 0] },
              },
              dartSolved: {
                $sum: { $cond: [{ $eq: ['$solutions.dart.status', 'solved'] }, 1, 0] },
              },
            },
          },
        ]),

        this.trackProgressModel.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: null,
              totalEnrolled: { $sum: 1 },
              totalCompleted: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
              totalInProgress: {
                $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
              },
            },
          },
        ]),

        this.submissionModel
          .find({ userId } as any)
          .sort({ submittedAt: -1 })
          .limit(10)
          .populate('challengeId', 'title slug difficulty')
          .select('challengeId language status submittedAt passedTests totalTests')
          .lean(),

        this.progressModel
          .find({ userId, status: 'solved' } as any)
          .sort({ lastAttemptAt: -1 })
          .limit(5)
          .populate('challengeId', 'title slug difficulty')
          .lean(),
      ]);

    const challengeStats = userChallengeStats[0] || {
      totalAttempted: 0,
      totalSolved: 0,
      javascriptSolved: 0,
      pythonSolved: 0,
      dartSolved: 0,
    };

    const trackStats = userTrackStats[0] || {
      totalEnrolled: 0,
      totalCompleted: 0,
      totalInProgress: 0,
    };

    return {
      success: true,
      dashboard: {
        challengeStats,
        trackStats,
        recentSubmissions,
        recentActivity,
      },
    };
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private updateUserProgress(
    progress: UserChallengeProgressDocument,
    language: string,
    success: boolean,
    timeSpent: number,
    submissionId: Types.ObjectId,
  ): void {
    const solution = (progress.solutions as any)?.[language];
    if (!solution) return;

    solution.attempts = (solution.attempts || 0) + 1;
    solution.lastAttemptAt = new Date();

    if (success) {
      solution.status = 'solved';
      if (!solution.solvedAt) {
        solution.solvedAt = new Date();
      }
      solution.bestSubmissionId = submissionId;
      if (timeSpent && (!solution.bestTime || timeSpent < solution.bestTime)) {
        solution.bestTime = timeSpent;
      }
    } else if (solution.status === 'not_attempted') {
      solution.status = 'attempted';
    }

    progress.totalAttempts = (progress.totalAttempts || 0) + 1;
    progress.lastAttemptAt = new Date();

    if (!progress.firstAttemptAt) {
      progress.firstAttemptAt = new Date();
    }

    if (timeSpent) {
      progress.totalTimeSpent = (progress.totalTimeSpent || 0) + timeSpent;
    }
  }

  private async updateChallengeStats(
    challenge: CodeChallengeDocument,
    success: boolean,
  ): Promise<void> {
    challenge.usageStats.totalAttempts = (challenge.usageStats.totalAttempts || 0) + 1;
    if (success) {
      challenge.usageStats.successfulSolutions =
        (challenge.usageStats.successfulSolutions || 0) + 1;
    }
    challenge.usageStats.successRate =
      (challenge.usageStats.successfulSolutions / challenge.usageStats.totalAttempts) * 100;
    await challenge.save();
  }
}