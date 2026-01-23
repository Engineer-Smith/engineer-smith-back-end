// src/result/services/result.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Result, ResultDocument } from '../../schemas/result.schema';
import { ResultFiltersDto, AnalyticsFiltersDto } from '../dto/result.dto';
import { ResultValidationService } from './result-validation.service';
import { ResultFormatterService } from './result-formatter.service';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ResultService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    private validationService: ResultValidationService,
    private formatterService: ResultFormatterService,
  ) {}

  /**
   * Get a single result by ID
   */
  async getResult(resultId: string, user: RequestUser): Promise<any> {
    const result = await this.resultModel
      .findById(resultId)
      .populate('userId', 'firstName lastName email')
      .populate('testId', 'title')
      .lean();

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    // Validate access permissions
    await this.validationService.validateResultAccess(result as ResultDocument, user);

    // Filter sensitive data for students
    if (user.role === 'student') {
      (result as any).questions = (result as any).questions.map((q: any) =>
        this.formatterService.filterSensitiveDataForStudent(q),
      );
    }

    return result;
  }

  /**
   * Get all results with filters and pagination
   */
  async getAllResults(filters: ResultFiltersDto, user: RequestUser): Promise<{
    data: any[];
    pagination: {
      total: number;
      limit: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const query = this.buildResultQuery(filters, user);
    const sortOption = this.parseSortOption(filters.sort);
    const limit = filters.limit || 10;
    // Support both page-based and skip-based pagination
    const page = filters.page || 1;
    const skip = filters.skip ?? (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.resultModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'userId',
          select: 'loginId firstName lastName fullName email',
          model: 'User',
        })
        .populate({
          path: 'organizationId',
          select: 'name',
          model: 'Organization',
        })
        .populate({
          path: 'testId',
          select: 'title description',
          model: 'Test',
        })
        .select(
          'sessionId testId userId organizationId attemptNumber status completedAt timeSpent score createdAt',
        )
        .sort(sortOption)
        .lean(),
      this.resultModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: results,
      pagination: {
        total,
        limit,
        page,
        totalPages,
        hasMore: skip + results.length < total,
      },
    };
  }

  /**
   * Parse sort string into MongoDB sort object
   * Format: "-field" for descending, "field" for ascending
   * Example: "-completedAt" => { completedAt: -1 }
   */
  private parseSortOption(sort?: string): Record<string, 1 | -1> {
    if (!sort) {
      return { createdAt: -1 }; // Default sort
    }

    // Whitelist of allowed sort fields
    const allowedFields = ['createdAt', 'completedAt', 'timeSpent', 'score.percentage', 'attemptNumber'];

    const isDescending = sort.startsWith('-');
    const field = isDescending ? sort.slice(1) : sort;

    if (!allowedFields.includes(field)) {
      return { createdAt: -1 }; // Fallback to default for invalid fields
    }

    return { [field]: isDescending ? -1 : 1 };
  }

  /**
   * Get result analytics
   */
  async getResultAnalytics(filters: AnalyticsFiltersDto, user: RequestUser): Promise<any[]> {
    const query = this.buildAnalyticsQuery(filters, user);
    const pipeline = this.buildResultAnalyticsPipeline(query, filters);
    const analytics = await this.resultModel.aggregate(pipeline);
    return this.formatterService.formatAnalyticsResponse(analytics);
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(filters: AnalyticsFiltersDto, user: RequestUser): Promise<any[]> {
    const query = this.buildUserAnalyticsQuery(filters, user);

    const pipeline: PipelineStage[] = [
      { $match: query },
      {
        $group: {
          _id: { userId: '$userId', organizationId: '$organizationId' },
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$score.earnedPoints' },
          passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
          averageTime: { $avg: '$timeSpent' },
          totalTimeSpent: { $sum: '$timeSpent' },
          tests: {
            $push: {
              testId: '$testId',
              attemptNumber: '$attemptNumber',
              score: '$score.earnedPoints',
              totalPoints: '$score.totalPoints',
              percentage: '$score.percentage',
              passed: '$score.passed',
              timeSpent: '$timeSpent',
              completedAt: '$completedAt',
            },
          },
        },
      },
      {
        $project: {
          userId: '$_id.userId',
          organizationId: '$_id.organizationId',
          totalTests: 1,
          averageScore: { $round: ['$averageScore', 2] },
          passRate: { $round: [{ $multiply: ['$passRate', 100] }, 2] },
          averageTime: { $round: ['$averageTime'] },
          totalTimeSpent: 1,
          tests: 1,
          _id: 0,
        },
      },
    ];

    return this.resultModel.aggregate(pipeline);
  }

  /**
   * Get section analytics
   */
  async getSectionAnalytics(filters: AnalyticsFiltersDto, user: RequestUser): Promise<any[]> {
    const query = this.buildSectionAnalyticsQuery(filters, user);

    const pipeline: PipelineStage[] = [
      { $match: query },
      { $unwind: '$questions' },
      {
        $group: {
          _id: {
            testId: '$testId',
            sectionIndex: '$questions.sectionIndex',
            sectionName: '$questions.sectionName',
          },
          totalQuestions: { $sum: 1 },
          averageScore: { $avg: '$questions.pointsEarned' },
          successRate: { $avg: { $cond: ['$questions.isCorrect', 1, 0] } },
          averageTime: { $avg: '$questions.timeSpent' },
          totalAttempts: { $sum: 1 },
          correctAttempts: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } },
        },
      },
      {
        $project: {
          testId: '$_id.testId',
          sectionIndex: '$_id.sectionIndex',
          sectionName: '$_id.sectionName',
          totalQuestions: 1,
          averageScore: { $round: ['$averageScore', 2] },
          successRate: { $round: [{ $multiply: ['$successRate', 100] }, 2] },
          averageTime: { $round: ['$averageTime'] },
          totalAttempts: 1,
          correctAttempts: 1,
          _id: 0,
        },
      },
      { $sort: { testId: 1, sectionIndex: 1 } },
    ];

    return this.resultModel.aggregate(pipeline);
  }

  /**
   * Get question analytics
   */
  async getQuestionAnalytics(filters: AnalyticsFiltersDto, user: RequestUser): Promise<any[]> {
    const query = this.buildQuestionAnalyticsQuery(filters, user);

    const pipeline: PipelineStage[] = [
      { $match: query },
      { $unwind: '$questions' },
    ];

    // Add question-specific filters
    if (filters.questionId) {
      pipeline.push({
        $match: {
          'questions.questionId': new Types.ObjectId(filters.questionId),
        },
      });
    }

    if (filters.questionType) {
      pipeline.push({ $match: { 'questions.type': filters.questionType } });
    }

    if (filters.difficulty) {
      pipeline.push({ $match: { 'questions.difficulty': filters.difficulty } });
    }

    pipeline.push(
      {
        $group: {
          _id: '$questions.questionId',
          questionTitle: { $first: '$questions.title' },
          questionType: { $first: '$questions.type' },
          language: { $first: '$questions.language' },
          category: { $first: '$questions.category' },
          difficulty: { $first: '$questions.difficulty' },
          totalAttempts: { $sum: 1 },
          correctAttempts: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } },
          averageTime: { $avg: '$questions.timeSpent' },
          averagePoints: { $avg: '$questions.pointsEarned' },
          successRate: { $avg: { $cond: ['$questions.isCorrect', 1, 0] } },
        },
      },
      {
        $project: {
          questionId: { $toString: '$_id' },
          questionTitle: 1,
          questionType: 1,
          language: 1,
          category: 1,
          difficulty: 1,
          totalAttempts: 1,
          correctAttempts: 1,
          successRate: { $round: [{ $multiply: ['$successRate', 100] }, 2] },
          averageTime: { $round: ['$averageTime'] },
          averagePoints: { $round: ['$averagePoints', 2] },
          _id: 0,
        },
      },
      { $sort: { totalAttempts: -1 } },
      { $skip: filters.skip || 0 },
      { $limit: filters.limit || 20 },
    );

    return this.resultModel.aggregate(pipeline);
  }

  /**
   * Get score breakdown for a result
   */
  async getScoreBreakdown(resultId: string, user: RequestUser): Promise<any> {
    const result = await this.resultModel.findById(resultId);
    
    if (!result) {
      throw new NotFoundException('Result not found');
    }

    await this.validationService.validateResultAccess(result, user);
    
    return this.formatterService.formatScoreBreakdownResponse(result);
  }

  // Private helper methods

  private buildResultQuery(filters: ResultFiltersDto, user: RequestUser): any {
    const { userId, testId, orgId, status } = filters;
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    const query: any = {};

    if (isSuperOrgAdminOrInstructor) {
      // Super admins and instructors can see all results, with optional filters
      if (userId) query.userId = userId;
      if (testId) query.testId = testId;
      if (orgId) query.organizationId = orgId;
    } else if (user.role === 'admin') {
      // Admins see only their organization's results
      if (orgId && orgId !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access results for this organization');
      }
      query.organizationId = user.organizationId;
      if (userId) query.userId = userId;
      if (testId) query.testId = testId;
    } else {
      // Students can only see their own results
      query.userId = user.userId;
      if (testId) query.testId = testId;
    }

    // Apply status filter if provided
    if (status) {
      query.status = status;
    }

    return query;
  }

  private buildAnalyticsQuery(filters: AnalyticsFiltersDto, user: RequestUser): any {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    const query: any = {};

    if (!isSuperOrgAdminOrInstructor) {
      if (filters.orgId && filters.orgId !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }

    if (filters.testId) query.testId = filters.testId;
    if (filters.orgId) query.organizationId = filters.orgId;

    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) query.completedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.completedAt.$lte = new Date(filters.endDate);
    }

    return query;
  }

  private buildUserAnalyticsQuery(filters: AnalyticsFiltersDto, user: RequestUser): any {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    const query: any = { status: 'completed' };

    if (!isSuperOrgAdminOrInstructor) {
      if (filters.orgId && filters.orgId !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }

    if (filters.userId) query.userId = filters.userId;
    if (filters.testId) query.testId = filters.testId;
    if (filters.orgId) query.organizationId = filters.orgId;

    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) query.completedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.completedAt.$lte = new Date(filters.endDate);
    }

    return query;
  }

  private buildSectionAnalyticsQuery(filters: AnalyticsFiltersDto, user: RequestUser): any {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    const query: any = { status: 'completed' };

    if (!isSuperOrgAdminOrInstructor) {
      if (filters.orgId && filters.orgId !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access analytics for this organization');
      }
      query.organizationId = user.organizationId;
    }

    if (filters.testId) query.testId = filters.testId;
    if (filters.orgId) query.organizationId = filters.orgId;

    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) query.completedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.completedAt.$lte = new Date(filters.endDate);
    }

    return query;
  }

  private buildQuestionAnalyticsQuery(filters: AnalyticsFiltersDto, user: RequestUser): any {
    const query: any = { status: 'completed' };

    // Organization filtering
    if (!user.isSuperOrgAdmin) {
      query.organizationId = new Types.ObjectId(user.organizationId);
    } else if (filters.orgId) {
      query.organizationId = new Types.ObjectId(filters.orgId);
    }

    // Test filtering
    if (filters.testId) {
      query.testId = new Types.ObjectId(filters.testId);
    }

    // Date filtering
    if (filters.startDate || filters.endDate) {
      query.completedAt = {};
      if (filters.startDate) query.completedAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.completedAt.$lte = new Date(filters.endDate);
    }

    return query;
  }

  private buildResultAnalyticsPipeline(query: any, filters: AnalyticsFiltersDto): PipelineStage[] {
    const pipeline: PipelineStage[] = [{ $match: { ...query, status: 'completed' } }];

    // Add question filtering if needed
    if (filters.questionType || filters.difficulty) {
      pipeline.push({ $unwind: '$questions' });

      if (filters.questionType) {
        pipeline.push({ $match: { 'questions.type': filters.questionType } });
      }
      if (filters.difficulty) {
        pipeline.push({ $match: { 'questions.difficulty': filters.difficulty } });
      }

      pipeline.push({
        $group: {
          _id: '$_id',
          testId: { $first: '$testId' },
          organizationId: { $first: '$organizationId' },
          score: { $first: '$score' },
          timeSpent: { $first: '$timeSpent' },
          questions: { $push: '$questions' },
        },
      });
    }

    pipeline.push({
      $group: {
        _id: { testId: '$testId', organizationId: '$organizationId' },
        totalResults: { $sum: 1 },
        averageScore: { $avg: '$score.earnedPoints' },
        passRate: { $avg: { $cond: ['$score.passed', 1, 0] } },
        averageTime: { $avg: '$timeSpent' },
      },
    });

    return pipeline;
  }
}