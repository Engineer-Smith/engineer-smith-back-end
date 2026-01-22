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
  BulkCreateChallengesDto,
  ValidateCodeDto,
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
   * Validate code against test cases (for challenge creation/editing)
   */
  async validateCode(dto: ValidateCodeDto): Promise<any> {
    if (!dto.testCases || dto.testCases.length === 0) {
      throw new BadRequestException('At least one test case is required');
    }

    if (!dto.solutionCode || dto.solutionCode.trim() === '') {
      throw new BadRequestException('Solution code is required');
    }

    // Map language to runtime (normalize node variants to 'node')
    const runtimeMap: Record<string, string> = {
      javascript: 'node',
      python: 'python',
      dart: 'dart',
      sql: 'sql',
    };
    let runtime = dto.codeConfig?.runtime || runtimeMap[dto.language] || 'node';
    // Normalize node variants (node18, node20, etc.) to 'node'
    if (runtime.startsWith('node')) {
      runtime = 'node';
    }

    try {
      const testResults = await this.gradingService.runCodeTests({
        code: dto.solutionCode,
        language: dto.language as any,
        runtime: runtime as any,
        entryFunction: dto.codeConfig?.entryFunction,
        testCases: dto.testCases as any,
        timeoutMs: dto.codeConfig?.timeoutMs || 5000,
      });

      return {
        success: true,
        results: {
          passed: testResults.overallPassed,
          totalTests: testResults.totalTests,
          passedTests: testResults.totalTestsPassed,
          failedTests: testResults.totalTests - testResults.totalTestsPassed,
          testResults: testResults.testResults.map((result: any, index: number) => ({
            name: dto.testCases[index]?.name || `Test ${index + 1}`,
            passed: result.passed,
            expected: result.expectedOutput,
            actual: result.actualOutput,
            runtime: result.executionTime,
            error: result.error,
          })),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        results: {
          passed: false,
          totalTests: dto.testCases.length,
          passedTests: 0,
          failedTests: dto.testCases.length,
          testResults: [],
          executionError: error.message,
        },
      };
    }
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
   * Add challenge to track (validates solution first)
   * Each challenge can only be assigned to ONE track per language
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

    // Check if challenge supports this language
    if (!challenge.supportedLanguages.includes(track.language)) {
      throw new BadRequestException(
        `Challenge does not support ${track.language}. Supported: ${challenge.supportedLanguages.join(', ')}`,
      );
    }

    // Check if this language slot is already claimed by another track
    const currentAssignment = (challenge.trackAssignments as any)?.[track.language];
    if (currentAssignment && currentAssignment.toString() !== track._id.toString()) {
      // Get the track name for a better error message
      const existingTrack = await this.trackModel.findById(currentAssignment).select('title slug language');
      throw new BadRequestException({
        message: `This challenge's ${track.language} slot is already assigned to another track`,
        existingTrack: existingTrack ? {
          title: existingTrack.title,
          slug: existingTrack.slug,
          language: existingTrack.language,
        } : { id: currentAssignment.toString() },
      });
    }

    // Validate solution before adding to track (unless skipped)
    let validationResults: { valid: boolean; errors: string[]; details?: any } = {
      valid: true,
      errors: [],
    };

    if (!dto.skipValidation) {
      validationResults = await this.validateChallengeForTrack(challenge, track.language);
      if (!validationResults.valid) {
        throw new BadRequestException({
          message: 'Challenge solution validation failed. Use skipValidation=true to bypass.',
          errors: validationResults.errors,
          details: validationResults.details,
        });
      }
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

      // Claim this language slot on the challenge
      await this.challengeModel.findByIdAndUpdate(
        challenge._id,
        { $set: { [`trackAssignments.${track.language}`]: track._id } },
      );
    }

    await track.save();

    return {
      success: true,
      message: 'Challenge added to track successfully',
      validation: validationResults,
      languageSlotClaimed: track.language,
    };
  }

  /**
   * Validate a challenge's solution for a track's language
   */
  private async validateChallengeForTrack(
    challenge: CodeChallengeDocument,
    trackLanguage: string,
  ): Promise<{ valid: boolean; errors: string[]; details?: any }> {
    const errors: string[] = [];

    // Check if challenge supports the track's language
    if (!challenge.supportedLanguages.includes(trackLanguage)) {
      errors.push(`Challenge does not support ${trackLanguage}`);
      return { valid: false, errors };
    }

    // Check for solution code
    const solutionCode = (challenge.solutionCode as any)?.[trackLanguage];
    if (!solutionCode) {
      errors.push(`No solution code for ${trackLanguage}`);
      return { valid: false, errors };
    }

    // Check for test cases
    if (!challenge.testCases || (challenge.testCases as any[]).length === 0) {
      errors.push('Challenge has no test cases');
      return { valid: false, errors };
    }

    // Check for code config
    const codeConfig = (challenge.codeConfig as any)?.[trackLanguage];
    if (!codeConfig?.entryFunction) {
      errors.push(`No entry function configured for ${trackLanguage}`);
      return { valid: false, errors };
    }

    // Run solution against test cases
    const runtimeMap: Record<string, string> = {
      javascript: 'node',
      python: 'python',
      dart: 'dart',
      sql: 'sql',
    };
    let runtime = codeConfig.runtime || runtimeMap[trackLanguage] || 'node';
    if (runtime.startsWith('node')) {
      runtime = 'node';
    }

    try {
      const testResults = await this.gradingService.runCodeTests({
        code: solutionCode,
        language: trackLanguage as any,
        runtime: runtime as any,
        entryFunction: codeConfig.entryFunction,
        testCases: challenge.testCases as any,
        timeoutMs: codeConfig.timeoutMs || 5000,
      });

      if (!testResults.overallPassed) {
        const failedTests = testResults.testResults
          .filter((t: any) => !t.passed)
          .map((t: any) => ({
            name: t.testName,
            expected: t.expectedOutput,
            actual: t.actualOutput,
            error: t.error,
          }));

        errors.push(`Solution failed ${testResults.totalTests - testResults.totalTestsPassed}/${testResults.totalTests} tests`);

        return {
          valid: false,
          errors,
          details: {
            passed: testResults.totalTestsPassed,
            total: testResults.totalTests,
            failedTests: failedTests.slice(0, 5), // Show first 5 failures
          },
        };
      }

      return {
        valid: true,
        errors: [],
        details: {
          passed: testResults.totalTestsPassed,
          total: testResults.totalTests,
        },
      };
    } catch (error: any) {
      errors.push(`Solution execution error: ${error.message}`);
      return { valid: false, errors };
    }
  }

  /**
   * Remove challenge from track (releases the language slot)
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

    // Check if challenge was in this track
    const wasInTrack = (track.challenges as any[]).some(
      (c) => c.challengeId.toString() === challengeId,
    );

    track.challenges = (track.challenges as any[]).filter(
      (c) => c.challengeId.toString() !== challengeId,
    ) as any;
    await track.save();

    // Release the language slot on the challenge
    if (wasInTrack) {
      const challenge = await this.challengeModel.findById(challengeId);
      if (challenge && challenge.trackAssignments) {
        const currentAssignment = (challenge.trackAssignments as any)[track.language];
        // Only clear if this track owns the slot
        if (currentAssignment && currentAssignment.toString() === track._id.toString()) {
          await this.challengeModel.findByIdAndUpdate(
            challengeId,
            { $set: { [`trackAssignments.${track.language}`]: null } },
          );
        }
      }
    }

    return {
      success: true,
      message: 'Challenge removed from track successfully',
      languageSlotReleased: wasInTrack ? track.language : null,
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

  /**
   * Get challenges available for a specific language track
   * Returns challenges that support the language AND have not been assigned to a track for that language
   */
  async getAvailableChallengesForLanguage(
    language: string,
    filters?: { difficulty?: string; status?: string; limit?: number; page?: number },
  ): Promise<any> {
    const query: any = {
      supportedLanguages: language,
      status: filters?.status || 'active',
      // Language slot is either null, undefined, or doesn't exist
      $or: [
        { [`trackAssignments.${language}`]: null },
        { [`trackAssignments.${language}`]: { $exists: false } },
        { trackAssignments: { $exists: false } },
      ],
    };

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }

    const skip = ((filters?.page || 1) - 1) * (filters?.limit || 50);

    const [challenges, total] = await Promise.all([
      this.challengeModel
        .find(query)
        .select('slug title difficulty supportedLanguages topics tags trackAssignments')
        .sort({ difficulty: 1, title: 1 })
        .skip(skip)
        .limit(filters?.limit || 50)
        .lean(),
      this.challengeModel.countDocuments(query),
    ]);

    // Enrich with available slots info
    const enrichedChallenges = challenges.map((challenge) => {
      const availableSlots = challenge.supportedLanguages.filter((lang: string) => {
        const assignment = (challenge.trackAssignments as any)?.[lang];
        return !assignment;
      });

      return {
        ...challenge,
        availableLanguageSlots: availableSlots,
        allSlotsClaimed: availableSlots.length === 0,
      };
    });

    return {
      success: true,
      language,
      challenges: enrichedChallenges,
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 50,
        total,
        pages: Math.ceil(total / (filters?.limit || 50)),
      },
    };
  }

  /**
   * Get track assignment status for all challenges
   * Shows which language slots are claimed and by which tracks
   */
  async getChallengeTrackAssignments(
    filters?: { language?: string; onlyAvailable?: boolean; limit?: number; page?: number },
  ): Promise<any> {
    const query: any = { status: 'active' };

    if (filters?.language) {
      query.supportedLanguages = filters.language;
    }

    if (filters?.onlyAvailable && filters?.language) {
      query.$or = [
        { [`trackAssignments.${filters.language}`]: null },
        { [`trackAssignments.${filters.language}`]: { $exists: false } },
        { trackAssignments: { $exists: false } },
      ];
    }

    const skip = ((filters?.page || 1) - 1) * (filters?.limit || 50);

    const [challenges, total] = await Promise.all([
      this.challengeModel
        .find(query)
        .select('slug title supportedLanguages trackAssignments')
        .sort({ title: 1 })
        .skip(skip)
        .limit(filters?.limit || 50)
        .populate('trackAssignments.javascript', 'slug title language')
        .populate('trackAssignments.python', 'slug title language')
        .populate('trackAssignments.dart', 'slug title language')
        .populate('trackAssignments.sql', 'slug title language')
        .lean(),
      this.challengeModel.countDocuments(query),
    ]);

    return {
      success: true,
      challenges,
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 50,
        total,
        pages: Math.ceil(total / (filters?.limit || 50)),
      },
    };
  }

  // ==========================================
  // BULK OPERATIONS
  // ==========================================

  /**
   * Bulk create challenges
   */
  async bulkCreateChallenges(
    dto: BulkCreateChallengesDto,
    user: RequestUser,
  ): Promise<any> {
    const results = {
      created: [] as any[],
      skipped: [] as any[],
      errors: [] as any[],
    };

    const userId = new Types.ObjectId(user.userId);
    const status = dto.defaultStatus || 'draft';

    // Get existing challenge titles/slugs to check for duplicates
    const existingChallenges = await this.challengeModel
      .find({}, { title: 1, slug: 1 })
      .lean();
    const existingTitles = new Set(
      existingChallenges.map((c) => c.title.toLowerCase()),
    );
    const existingSlugs = new Set(existingChallenges.map((c) => c.slug));

    // Process each challenge
    for (let i = 0; i < dto.challenges.length; i++) {
      const challengeData = dto.challenges[i];

      try {
        // Check for duplicate by title
        if (existingTitles.has(challengeData.title.toLowerCase())) {
          if (dto.skipDuplicates) {
            results.skipped.push({
              index: i,
              title: challengeData.title,
              reason: 'Duplicate title',
            });
            continue;
          } else {
            results.errors.push({
              index: i,
              title: challengeData.title,
              error: 'Challenge with this title already exists',
            });
            continue;
          }
        }

        // Create the challenge
        const challenge = new this.challengeModel({
          ...challengeData,
          createdBy: userId,
          status,
        });

        await challenge.save();

        // Track the new title/slug
        existingTitles.add(challengeData.title.toLowerCase());
        existingSlugs.add(challenge.slug);

        results.created.push({
          index: i,
          _id: challenge._id,
          title: challenge.title,
          slug: challenge.slug,
        });
      } catch (error: any) {
        results.errors.push({
          index: i,
          title: challengeData.title,
          error: error.message,
        });
      }
    }

    // Add to track if specified
    if (dto.addToTrackId && results.created.length > 0) {
      const track = await this.trackModel.findById(dto.addToTrackId);

      if (track) {
        const startingOrder = dto.startingOrder ?? (track.challenges as any[]).length;

        for (let i = 0; i < results.created.length; i++) {
          const created = results.created[i];
          (track.challenges as any[]).push({
            challengeId: new Types.ObjectId(created._id),
            order: startingOrder + i,
            isOptional: false,
            unlockAfter: 0,
          });
        }

        await track.save();
      }
    }

    return {
      success: true,
      summary: {
        total: dto.challenges.length,
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
        addedToTrack: dto.addToTrackId ? results.created.length : 0,
      },
      results,
    };
  }
}