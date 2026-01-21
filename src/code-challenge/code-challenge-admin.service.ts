// src/code-challenge/code-challenge-admin.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
  CreateChallengeDto,
  UpdateChallengeDto,
  CreateTrackDto,
  UpdateTrackDto,
  AddChallengeToTrackDto,
  AdminChallengesQueryDto,
  GetTracksQueryDto,
  RunCodeDto,
} from './dto/code-challenge.dto';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class CodeChallengeAdminService {
  constructor(
    @InjectModel(CodeChallenge.name) private challengeModel: Model<CodeChallengeDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(ChallengeSubmission.name) private submissionModel: Model<ChallengeSubmissionDocument>,
    @InjectModel(UserChallengeProgress.name) private progressModel: Model<UserChallengeProgressDocument>,
    @InjectModel(UserTrackProgress.name) private trackProgressModel: Model<UserTrackProgressDocument>,
    private readonly gradingService: GradingService,
  ) {}

  // ==========================================
  // CHALLENGE MANAGEMENT
  // ==========================================

  /**
   * Create new challenge
   */
  async createChallenge(dto: CreateChallengeDto, user: RequestUser): Promise<any> {
    const challenge = new this.challengeModel({
      ...dto,
      createdBy: new Types.ObjectId(user.userId),
      status: 'active',
    });

    await challenge.save();

    return {
      success: true,
      message: 'Challenge created successfully',
      challenge,
    };
  }

  /**
   * Update existing challenge
   */
  async updateChallenge(
    challengeSlug: string,
    dto: UpdateChallengeDto,
    user: RequestUser,
  ): Promise<any> {
    const challenge = await this.challengeModel.findOneAndUpdate(
      { slug: challengeSlug },
      { ...dto },
      { new: true, runValidators: true },
    );

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return {
      success: true,
      message: 'Challenge updated successfully',
      challenge,
    };
  }

  /**
   * Delete (archive) challenge
   */
  async deleteChallenge(challengeSlug: string): Promise<any> {
    const challenge = await this.challengeModel.findOne({ slug: challengeSlug });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    challenge.status = 'archived';
    await challenge.save();

    return {
      success: true,
      message: 'Challenge archived successfully',
    };
  }

  /**
   * Test challenge with code
   */
  async testChallenge(
    challengeSlug: string,
    dto: RunCodeDto,
  ): Promise<any> {
    const challenge = await this.challengeModel.findOne({ slug: challengeSlug });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (!challenge.supportedLanguages.includes(dto.language)) {
      throw new BadRequestException(`Language ${dto.language} not supported`);
    }

    const codeConfig = (challenge.codeConfig as any)?.[dto.language];
    const codeToTest = dto.code || (challenge.solutionCode as any)?.[dto.language];

    if (!codeToTest) {
      throw new BadRequestException('No code provided and no solution code available');
    }

    const testResults = await this.gradingService.runCodeTests({
      code: codeToTest,
      language: dto.language as any,
      runtime: codeConfig?.runtime,
      entryFunction: codeConfig?.entryFunction,
      testCases: challenge.testCases,
      timeoutMs: codeConfig?.timeoutMs || 3000,
    });

    return {
      success: true,
      testResults,
    };
  }

  /**
   * Get all challenges (admin view with full details)
   */
  async getAllChallenges(filters: AdminChallengesQueryDto): Promise<any> {
    const query: any = {};

    if (filters.language) query.supportedLanguages = filters.language;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.status) query.status = filters.status;

    const skip = ((filters.page || 1) - 1) * (filters.limit || 20);

    const [challenges, total] = await Promise.all([
      this.challengeModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit || 20)
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      this.challengeModel.countDocuments(query),
    ]);

    return {
      success: true,
      challenges,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20)),
      },
    };
  }

  /**
   * Get single challenge with full details (admin view)
   */
  async getChallengeById(challengeSlug: string): Promise<any> {
    const challenge = await this.challengeModel
      .findOne({ slug: challengeSlug })
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const [submissionStats, userProgress, recentSubmissions] = await Promise.all([
      this.submissionModel.aggregate([
        { $match: { challengeId: challenge._id } },
        {
          $group: {
            _id: { language: '$language', status: '$status' },
            count: { $sum: 1 },
            avgRuntime: { $avg: '$executionTime' },
          },
        },
      ]),
      this.progressModel.aggregate([
        { $match: { challengeId: challenge._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgAttempts: { $avg: '$totalAttempts' },
          },
        },
      ]),
      this.submissionModel
        .find({ challengeId: challenge._id } as any)
        .populate('userId', 'firstName lastName email')
        .sort({ submittedAt: -1 })
        .limit(10)
        .select('userId language status executionTime submittedAt')
        .lean(),
    ]);

    return {
      success: true,
      challenge: {
        ...challenge,
        stats: {
          submissions: submissionStats,
          userProgress,
          recentSubmissions,
        },
      },
    };
  }

  // ==========================================
  // TRACK MANAGEMENT
  // ==========================================

  /**
   * Create new track
   */
  async createTrack(dto: CreateTrackDto, user: RequestUser): Promise<any> {
    const track = new this.trackModel({
      ...dto,
      createdBy: new Types.ObjectId(user.userId),
      isActive: true,
    });

    await track.save();

    return {
      success: true,
      message: 'Track created successfully',
      track,
    };
  }

  /**
   * Update track
   */
  async updateTrack(
    language: string,
    trackSlug: string,
    dto: UpdateTrackDto,
  ): Promise<any> {
    const track = await this.trackModel.findOneAndUpdate(
      { language, slug: trackSlug },
      { ...dto },
      { new: true, runValidators: true },
    );

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return {
      success: true,
      message: 'Track updated successfully',
      track,
    };
  }

  /**
   * Delete (deactivate) track
   */
  async deleteTrack(language: string, trackSlug: string): Promise<any> {
    const track = await this.trackModel.findOne({ language, slug: trackSlug });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    track.isActive = false;
    await track.save();

    return {
      success: true,
      message: 'Track archived successfully',
    };
  }

  /**
   * Add challenge to track
   */
  async addChallengeToTrack(
    language: string,
    trackSlug: string,
    dto: AddChallengeToTrackDto,
  ): Promise<any> {
    const track = await this.trackModel.findOne({ language, slug: trackSlug });
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const challenge = await this.challengeModel.findById(dto.challengeId);
    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Check if already in track
    const existingIndex = (track.challenges as any[]).findIndex(
      (c) => c.challengeId.toString() === dto.challengeId,
    );

    if (existingIndex !== -1) {
      // Update existing
      (track.challenges as any[])[existingIndex].order = dto.order;
      (track.challenges as any[])[existingIndex].isOptional = dto.isOptional || false;
      (track.challenges as any[])[existingIndex].unlockAfter = dto.unlockAfter || 0;
    } else {
      // Add new
      (track.challenges as any[]).push({
        challengeId: new Types.ObjectId(dto.challengeId),
        order: dto.order,
        isOptional: dto.isOptional || false,
        unlockAfter: dto.unlockAfter || 0,
      });
    }

    await track.save();

    return {
      success: true,
      message: 'Challenge added to track successfully',
    };
  }

  /**
   * Remove challenge from track
   */
  async removeChallengeFromTrack(
    language: string,
    trackSlug: string,
    challengeId: string,
  ): Promise<any> {
    const track = await this.trackModel.findOne({ language, slug: trackSlug });
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    track.challenges = (track.challenges as any[]).filter(
      (c) => c.challengeId.toString() !== challengeId,
    ) as any;
    await track.save();

    return {
      success: true,
      message: 'Challenge removed from track successfully',
    };
  }

  /**
   * Get all tracks (admin view)
   */
  async getAllTracks(filters: GetTracksQueryDto): Promise<any> {
    const query: any = {};

    if (filters.language) query.language = filters.language;
    if (filters.category) query.category = filters.category;
    if (filters.status) {
      query.isActive = filters.status === 'active';
    }

    const skip = ((filters.page || 1) - 1) * (filters.limit || 20);

    const [tracks, total] = await Promise.all([
      this.trackModel
        .find(query)
        .sort({ language: 1, category: 1 })
        .skip(skip)
        .limit(filters.limit || 20)
        .populate('createdBy', 'firstName lastName email')
        .populate('challenges.challengeId', 'slug title difficulty')
        .lean(),
      this.trackModel.countDocuments(query),
    ]);

    return {
      success: true,
      tracks,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20)),
      },
    };
  }

  /**
   * Get single track with full details (admin view)
   */
  async getTrackById(language: string, trackSlug: string): Promise<any> {
    const track = await this.trackModel
      .findOne({ language: language.toLowerCase(), slug: trackSlug })
      .populate('createdBy', 'firstName lastName email')
      .populate('challenges.challengeId', 'slug title description difficulty status topics tags usageStats');

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const challengeIds = (track.challenges as any[]).map((c) => c.challengeId._id);

    const [submissionStats, userProgress] = await Promise.all([
      this.submissionModel.aggregate([
        { $match: { challengeId: { $in: challengeIds } } },
        {
          $group: {
            _id: '$challengeId',
            totalSubmissions: { $sum: 1 },
            passedSubmissions: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
      ]),
      this.progressModel.aggregate([
        { $match: { challengeId: { $in: challengeIds } } },
        {
          $group: {
            _id: '$challengeId',
            totalUsers: { $sum: 1 },
            solvedCount: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const submissionMap = new Map<string, any>();
    const progressMap = new Map<string, any>();

    submissionStats.forEach((stat) => {
      submissionMap.set(stat._id.toString(), stat);
    });

    userProgress.forEach((progress) => {
      progressMap.set(progress._id.toString(), progress);
    });

    const enrichedTrack = {
      ...track.toObject(),
      challenges: (track.challenges as any[]).map((challenge) => {
        const submissionStat = submissionMap.get(challenge.challengeId._id.toString());
        const progressStat = progressMap.get(challenge.challengeId._id.toString());

        return {
          ...challenge,
          stats: {
            totalSubmissions: submissionStat?.totalSubmissions || 0,
            passedSubmissions: submissionStat?.passedSubmissions || 0,
            successRate:
              submissionStat?.totalSubmissions > 0
                ? ((submissionStat.passedSubmissions / submissionStat.totalSubmissions) * 100).toFixed(1)
                : 0,
            uniqueUsers: submissionStat?.uniqueUsers?.length || 0,
            totalUsers: progressStat?.totalUsers || 0,
            solvedCount: progressStat?.solvedCount || 0,
          },
        };
      }),
    };

    return {
      success: true,
      track: enrichedTrack,
    };
  }

  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================

  /**
   * Get tracks overview for admin dashboard
   */
  async getTracksOverview(language?: string): Promise<any> {
    const query: any = { isActive: true };
    if (language) {
      query.language = language.toLowerCase();
    }

    const tracks = await this.trackModel
      .find(query)
      .select('slug title language category difficulty estimatedHours isFeatured challenges createdAt')
      .populate('challenges.challengeId', 'slug title difficulty status')
      .sort({ language: 1, isFeatured: -1, difficulty: 1 })
      .lean();

    const trackStats = await Promise.all(
      tracks.map(async (track) => {
        const challengeIds = (track.challenges as any[]).map((c) => c.challengeId._id);

        const [submissions, users] = await Promise.all([
          this.submissionModel.countDocuments({ challengeId: { $in: challengeIds } } as any),
          this.progressModel.distinct('userId', { challengeId: { $in: challengeIds } } as any),
        ]);

        return {
          ...track,
          stats: {
            totalChallenges: (track.challenges as any[]).length,
            activeChallenges: (track.challenges as any[]).filter(
              (c) => (c.challengeId as any).status === 'active',
            ).length,
            totalSubmissions: submissions,
            uniqueUsers: users.length,
          },
        };
      }),
    );

    return {
      success: true,
      tracks: trackStats,
    };
  }

  /**
   * Get challenges overview for admin dashboard
   */
  async getChallengesOverview(filters: {
    difficulty?: string;
    language?: string;
    status?: string;
  }): Promise<any> {
    const query: any = {};
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.language) query.supportedLanguages = filters.language;
    if (filters.status) query.status = filters.status;

    const challenges = await this.challengeModel
      .find(query)
      .select('slug title difficulty supportedLanguages status topics usageStats createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      challenges,
    };
  }

  /**
   * Get platform analytics
   */
  async getAnalytics(): Promise<any> {
    const [
      totalChallenges,
      totalTracks,
      totalSubmissions,
      totalUsers,
      languageStats,
      difficultyStats,
    ] = await Promise.all([
      this.challengeModel.countDocuments({ status: 'active' }),
      this.trackModel.countDocuments({ isActive: true }),
      this.submissionModel.countDocuments(),
      this.progressModel.distinct('userId'),
      this.submissionModel.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } },
      ]),
      this.challengeModel.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      success: true,
      analytics: {
        totalChallenges,
        totalTracks,
        totalSubmissions,
        totalUsers: totalUsers.length,
        byLanguage: languageStats,
        byDifficulty: difficultyStats,
      },
    };
  }
}