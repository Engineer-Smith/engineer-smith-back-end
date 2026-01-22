import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../../schemas/question.schema';
import { Organization, OrganizationDocument } from '../../schemas/organization.schema';
import { CreateQuestionDto, UpdateQuestionDto, QuestionFiltersDto } from '../dto';
import { QuestionValidationService } from './question-validation.service';
import { QuestionFormatterService } from './question-formatter.service';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
    private validationService: QuestionValidationService,
    private formatterService: QuestionFormatterService,
  ) {}

  /**
   * Create a new question
   */
  async createQuestion(questionData: CreateQuestionDto, user: RequestUser) {
    // Validate input data
    await this.validationService.validateQuestionData(questionData, 'create');

    // Check permissions and determine organization/global settings
    const { organizationId, isGlobal } = await this.validationService.validateQuestionPermissions(
      user,
      questionData.isGlobal,
    );

    // Create question
    const question = new this.questionModel({
      ...questionData,
      organizationId,
      isGlobal,
      status: questionData.status || 'draft',
      createdBy: user.userId,
      usageStats: {
        timesUsed: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: 0,
        averageTime: 0,
      },
    });

    await question.save();
    return this.formatterService.formatQuestionResponse(question, user);
  }

  /**
   * Get a single question by ID
   */
  async getQuestion(questionId: string, user: RequestUser) {
    const question = await this.questionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check access permissions
    await this.validateQuestionAccess(question, user);

    return this.formatterService.formatQuestionResponse(question, user);
  }

  /**
   * Get all questions with filters
   */
  async getAllQuestions(filters: QuestionFiltersDto, user: RequestUser) {
    const query = this.buildQuery(filters, user);

    let totalCount: number | null = null;
    if (filters.includeTotalCount) {
      totalCount = await this.questionModel.countDocuments(query);
    }

    const questions = await this.questionModel
      .find(query)
      .skip(filters.skip || 0)
      .limit(filters.limit || 10)
      .lean();

    const formattedQuestions = questions.map((question) =>
      this.formatterService.formatQuestionResponse(question as QuestionDocument, user),
    );

    const result: any = {
      questions: formattedQuestions,
      pagination: {
        skip: filters.skip || 0,
        limit: filters.limit || 10,
        total: totalCount ?? formattedQuestions.length,
        returned: formattedQuestions.length,
      },
    };

    if (totalCount !== null) {
      result.pagination.totalCount = totalCount;
    }

    return result;
  }

  /**
   * Update a question
   */
  async updateQuestion(questionId: string, updateData: UpdateQuestionDto, user: RequestUser) {
    const question = await this.questionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Validate permissions
    await this.validateQuestionUpdateAccess(question, user);

    // Validate update data
    await this.validationService.validateQuestionData(updateData, 'update');

    // Remove undefined fields
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined),
    );

    const updatedQuestion = await this.questionModel.findByIdAndUpdate(
      questionId,
      { $set: filteredUpdateData },
      { new: true, runValidators: true },
    );

    return this.formatterService.formatQuestionResponse(updatedQuestion!, user);
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: string, user: RequestUser) {
    const question = await this.questionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Validate permissions
    await this.validateQuestionUpdateAccess(question, user);

    await this.questionModel.deleteOne({ _id: questionId });
    return { message: 'Question deleted successfully' };
  }

  /**
   * Get question statistics
   */
  async getQuestionStats(user: RequestUser) {
    const matchQuery = this.buildStatsQuery(user);

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          difficulties: { $push: '$difficulty' },
          types: { $push: '$type' },
          categories: { $push: '$category' },
        },
      },
      {
        $project: {
          language: '$_id',
          count: 1,
          difficultyBreakdown: {
            easy: {
              $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'easy'] } } },
            },
            medium: {
              $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'medium'] } } },
            },
            hard: {
              $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'hard'] } } },
            },
          },
          typeBreakdown: {
            multipleChoice: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'multipleChoice'] } } },
            },
            trueFalse: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'trueFalse'] } } },
            },
            codeChallenge: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'codeChallenge'] } } },
            },
            fillInTheBlank: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'fillInTheBlank'] } } },
            },
            codeDebugging: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'codeDebugging'] } } },
            },
          },
          categoryBreakdown: {
            logic: {
              $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'logic'] } } },
            },
            ui: {
              $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'ui'] } } },
            },
            syntax: {
              $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'syntax'] } } },
            },
          },
          _id: 0,
        },
      },
      { $sort: { language: 1 as const } },
    ];

    const stats = await this.questionModel.aggregate(pipeline);
    const totalStats = await this.getTotalStats(matchQuery);

    return {
      byLanguage: stats,
      totals: totalStats,
    };
  }

  // Private helper methods

  private async validateQuestionAccess(question: QuestionDocument, user: RequestUser) {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    if (!isSuperOrgAdminOrInstructor) {
      if (!question.isGlobal) {
        if (
          !question.organizationId ||
          question.organizationId.toString() !== user.organizationId
        ) {
          throw new ForbiddenException('Unauthorized to access this question');
        }
      }
    }
  }

  private async validateQuestionUpdateAccess(question: QuestionDocument, user: RequestUser) {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    // Check if user is super org admin
    const org = await this.organizationModel.findById(user.organizationId);
    const isSuperOrgAdmin = user.isSuperOrgAdmin || (org?.isSuperOrg && user.role === 'admin');

    if (!isSuperOrgAdminOrInstructor) {
      if (
        !question.organizationId ||
        question.organizationId.toString() !== user.organizationId
      ) {
        throw new ForbiddenException('Unauthorized to update this question');
      }
      if (question.isGlobal && !isSuperOrgAdmin) {
        throw new ForbiddenException('Only super organization admins can update global questions');
      }
    }
  }

  private buildQuery(filters: QuestionFiltersDto, user: RequestUser): any {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    let query: any = {};

    // Base visibility rules
    if (isSuperOrgAdminOrInstructor) {
      if (filters.organizationId) {
        query.$or = [{ organizationId: filters.organizationId }, { isGlobal: true }];
      } else if (user.organizationId) {
        query.$or = [{ organizationId: user.organizationId }, { isGlobal: true }];
      }
    } else {
      query.$or = [{ isGlobal: true }];
      if (user.organizationId) {
        query.$or.push({ organizationId: user.organizationId });
      }
    }

    // Apply additional filters
    if (filters.isGlobal !== undefined) {
      query.isGlobal = filters.isGlobal;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    // Language and tag use OR logic (match language OR has tag)
    if (filters.language && filters.tag) {
      // Both provided - use OR
      const languageCondition = filters.language.includes(',')
        ? { language: { $in: filters.language.split(',').map((l) => l.trim()) } }
        : { language: filters.language };
      const tagCondition = { tags: { $in: [filters.tag] } };

      // Need to combine with existing $or using $and
      const visibilityOr = query.$or;
      delete query.$or;
      query.$and = [{ $or: visibilityOr }, { $or: [languageCondition, tagCondition] }];
    } else if (filters.language) {
      // Only language
      if (filters.language.includes(',')) {
        const languages = filters.language.split(',').map((lang) => lang.trim());
        query.language = { $in: languages };
      } else {
        query.language = filters.language;
      }
    } else if (filters.tag) {
      // Only tag
      query.tags = { $in: [filters.tag] };
    }

    return query;
  }

  private buildStatsQuery(user: RequestUser): any {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    let query: any = {};

    if (isSuperOrgAdminOrInstructor) {
      if (user.organizationId) {
        query.$or = [{ organizationId: user.organizationId }, { isGlobal: true }];
      }
    } else {
      query.$or = [{ isGlobal: true }];
      if (user.organizationId) {
        query.$or.push({ organizationId: user.organizationId });
      }
    }

    return query;
  }

  private async getTotalStats(matchQuery: any) {
    const totalStats = await this.questionModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          difficulties: { $push: '$difficulty' },
          types: { $push: '$type' },
          categories: { $push: '$category' },
        },
      },
      {
        $project: {
          totalQuestions: 1,
          difficultyBreakdown: {
            easy: {
              $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'easy'] } } },
            },
            medium: {
              $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'medium'] } } },
            },
            hard: {
              $size: { $filter: { input: '$difficulties', cond: { $eq: ['$$this', 'hard'] } } },
            },
          },
          typeBreakdown: {
            multipleChoice: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'multipleChoice'] } } },
            },
            trueFalse: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'trueFalse'] } } },
            },
            codeChallenge: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'codeChallenge'] } } },
            },
            fillInTheBlank: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'fillInTheBlank'] } } },
            },
            codeDebugging: {
              $size: { $filter: { input: '$types', cond: { $eq: ['$$this', 'codeDebugging'] } } },
            },
          },
          categoryBreakdown: {
            logic: {
              $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'logic'] } } },
            },
            ui: {
              $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'ui'] } } },
            },
            syntax: {
              $size: { $filter: { input: '$categories', cond: { $eq: ['$$this', 'syntax'] } } },
            },
          },
          _id: 0,
        },
      },
    ]);

    return (
      totalStats[0] || {
        totalQuestions: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        typeBreakdown: {
          multipleChoice: 0,
          trueFalse: 0,
          codeChallenge: 0,
          fillInTheBlank: 0,
          codeDebugging: 0,
        },
        categoryBreakdown: { logic: 0, ui: 0, syntax: 0 },
      }
    );
  }
}
