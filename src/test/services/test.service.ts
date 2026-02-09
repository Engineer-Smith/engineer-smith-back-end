// src/test/services/test.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Test, TestDocument } from '../../schemas/test.schema';
import { Question, QuestionDocument } from '../../schemas/question.schema';
import { Organization, OrganizationDocument } from '../../schemas/organization.schema';
import { CreateTestDto, UpdateTestDto, TestFiltersDto } from '../dto/test.dto';
import { TestValidationService } from './test-validation.service';
import { TestFormatterService } from './test-formatter.service';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(Test.name) private testModel: Model<TestDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
    private validationService: TestValidationService,
    private formatterService: TestFormatterService,
  ) {}

  /**
   * Create a new test
   */
  async createTest(testData: CreateTestDto, user: RequestUser, orgId?: string) {
    // Validate input data
    await this.validationService.validateTestData(testData, 'create');

    // Validate permissions and determine organization settings
    const { organizationId, isGlobal } = await this.validationService.validateTestPermissions(
      user,
      orgId || null,
    );

    // Validate that all questions exist
    await this.validateQuestionsExist(testData, user);

    const test = new this.testModel({
      title: testData.title,
      description: testData.description,
      testType: testData.testType || 'custom',
      languages: testData.languages || [],
      tags: testData.tags || [],
      settings: testData.settings,
      sections: testData.settings.useSections ? testData.sections : undefined,
      questions: testData.settings.useSections ? undefined : testData.questions,
      organizationId,
      isGlobal,
      status: testData.status || 'draft',
      createdBy: user.userId,
      stats: { totalAttempts: 0, averageScore: 0, passRate: 0 },
    });

    await test.save();
    return this.formatterService.formatTestResponse(test);
  }

  /**
   * Get a single test by ID
   */
  async getTest(testId: string, user: RequestUser) {
    const test = await this.testModel
      .findById(testId)
      .populate(
        'sections.questions.questionId',
        'title description type language options testCases difficulty category codeConfig codeTemplate blanks dragOptions buggyCode solutionCode',
      )
      .populate(
        'questions.questionId',
        'title description type language options testCases difficulty category codeConfig codeTemplate blanks dragOptions buggyCode solutionCode',
      );

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Validate access permissions
    await this.validateTestAccess(test, user);

    return this.formatterService.formatTestResponse(test, user);
  }

  /**
   * Get all tests with filters
   */
  async getAllTests(filters: TestFiltersDto, user: RequestUser) {
    const query = this.buildTestQuery(filters, user);

    const tests = await this.testModel
      .find(query)
      .skip(filters.skip || 0)
      .limit(filters.limit || 10)
      .select(
        'title description testType languages tags settings organizationId isGlobal status stats createdBy createdAt updatedAt',
      )
      .sort({ createdAt: -1 });

    return tests.map((test) => ({
      _id: test._id,
      title: test.title,
      description: test.description,
      testType: test.testType,
      languages: test.languages,
      tags: test.tags,
      settings: test.settings,
      organizationId: test.organizationId,
      isGlobal: test.isGlobal,
      status: test.status,
      stats: test.stats,
      createdBy: test.createdBy,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    }));
  }

  /**
   * Update a test
   */
  async updateTest(testId: string, updateData: UpdateTestDto, user: RequestUser) {
    const test = await this.testModel.findById(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Validate permissions
    await this.validateTestUpdateAccess(test, user);

    // Validate update data
    await this.validationService.validateTestData(updateData, 'update');

    // Validate questions if provided
    if (updateData.sections || updateData.questions) {
      await this.validateQuestionsExist(
        {
          settings: updateData.settings || test.settings,
          sections: updateData.sections || test.sections,
          questions: updateData.questions || test.questions,
        } as any,
        user,
      );
    }

    // Build update object
    const finalUpdateData: any = { ...updateData, updatedAt: new Date() };

    // Handle sections/questions based on useSections setting
    if (updateData.settings?.useSections !== undefined) {
      if (updateData.settings.useSections) {
        finalUpdateData.sections = updateData.sections || test.sections;
        finalUpdateData.$unset = { questions: 1 };
      } else {
        finalUpdateData.questions = updateData.questions || test.questions;
        finalUpdateData.$unset = { sections: 1 };
      }
    }

    const updatedTest = await this.testModel.findByIdAndUpdate(testId, finalUpdateData, {
      new: true,
      runValidators: true,
    });

    return this.formatterService.formatTestResponse(updatedTest!);
  }

  /**
   * Delete a test
   */
  async deleteTest(testId: string, user: RequestUser) {
    const test = await this.testModel.findById(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Validate permissions
    await this.validateTestUpdateAccess(test, user);

    await this.testModel.deleteOne({ _id: testId });
    return { message: 'Test deleted' };
  }

  /**
   * Get test with fully populated question data
   */
  async getTestWithQuestions(testId: string, user: RequestUser) {
    const test = await this.testModel.findById(testId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Validate access permissions (stricter for students)
    await this.validateTestWithQuestionsAccess(test, user);

    // Collect question IDs
    const questionIds = this.collectQuestionIds(test);

    // Fetch questions
    const questions = await this.questionModel
      .find({ _id: { $in: questionIds } })
      .select(
        'title description type language category options correctAnswer testCases codeConfig codeTemplate blanks dragOptions buggyCode solutionCode difficulty tags createdAt updatedAt',
      );

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    return this.formatterService.formatTestWithQuestionsResponse(test, questionMap, user);
  }

  /**
   * Get test by ID (internal use - no permission checks)
   * Used by TestSession service
   */
  async getTestInternal(testId: string): Promise<TestDocument | null> {
    return this.testModel.findById(testId);
  }

  /**
   * Get populated test (internal use)
   * Used by TestSession service for creating snapshots
   */
  async getPopulatedTest(testId: string): Promise<TestDocument | null> {
    return this.testModel
      .findById(testId)
      .populate({
        path: 'sections.questions.questionId',
        model: 'Question',
      })
      .populate({
        path: 'questions.questionId',
        model: 'Question',
      });
  }

  /**
   * Get global tests (for global content management)
   */
  async getGlobalTests(filters: TestFiltersDto, user: RequestUser) {
    // Only super org admins can manage global content
    if (!user.isSuperOrgAdmin) {
      throw new ForbiddenException('Only super organization admins can access global content');
    }

    const query: any = { isGlobal: true };

    if (filters.testType) query.testType = filters.testType;
    if (filters.language) query.languages = filters.language;
    if (filters.tag) query.tags = filters.tag;
    if (filters.status) query.status = filters.status;

    const [tests, total] = await Promise.all([
      this.testModel
        .find(query)
        .skip(filters.skip || 0)
        .limit(filters.limit || 10)
        .select('title description testType languages tags settings status stats createdBy createdAt updatedAt')
        .sort({ createdAt: -1 }),
      this.testModel.countDocuments(query),
    ]);

    return {
      tests: tests.map((test) => ({
        _id: test._id,
        title: test.title,
        description: test.description,
        testType: test.testType,
        languages: test.languages,
        tags: test.tags,
        settings: test.settings,
        isGlobal: true,
        status: test.status,
        stats: test.stats,
        createdBy: test.createdBy,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
      })),
      pagination: {
        skip: filters.skip || 0,
        limit: filters.limit || 10,
        total,
        returned: tests.length,
      },
    };
  }

  // Private helper methods

  private async validateTestAccess(test: TestDocument, user: RequestUser): Promise<void> {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && (user.role === 'admin' || user.role === 'instructor'));

    if (!isSuperOrgAdminOrInstructor) {
      if (test.isGlobal) {
        if (user.role !== 'student') {
          throw new ForbiddenException('Only students can access global tests');
        }
      } else if (
        !test.organizationId ||
        test.organizationId.toString() !== user.organizationId
      ) {
        throw new ForbiddenException('Unauthorized to access this test');
      }
    }
  }

  private async validateTestUpdateAccess(test: TestDocument, user: RequestUser): Promise<void> {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && (user.role === 'admin' || user.role === 'instructor'));

    if (!isSuperOrgAdminOrInstructor) {
      throw new ForbiddenException('Only admins/instructors can modify tests');
    }

    // Enhanced access control for global tests
    if (test.isGlobal) {
      const userOrganization = await this.organizationModel.findById(user.organizationId);
      if (!userOrganization || !userOrganization.isSuperOrg) {
        throw new ForbiddenException('Only superOrg users can modify global tests');
      }
    } else {
      if (
        !user.isSuperOrgAdmin &&
        (!test.organizationId || test.organizationId.toString() !== user.organizationId)
      ) {
        throw new ForbiddenException('Unauthorized to update this test');
      }
    }
  }

  private async validateTestWithQuestionsAccess(
    test: TestDocument,
    user: RequestUser,
  ): Promise<void> {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && (user.role === 'admin' || user.role === 'instructor'));

    if (!isSuperOrgAdminOrInstructor) {
      if (test.isGlobal) {
        if (user.role !== 'student' || test.status !== 'active') {
          throw new ForbiddenException('Only students can access active global tests');
        }
      } else if (
        !test.organizationId ||
        test.organizationId.toString() !== user.organizationId
      ) {
        throw new ForbiddenException('Unauthorized to access this test');
      } else if (user.role === 'student' && test.status !== 'active') {
        throw new ForbiddenException('Students can only access active tests');
      }
    }
  }

  private async validateQuestionsExist(testData: any, user: RequestUser): Promise<void> {
    const questionIds: string[] = testData.settings?.useSections
      ? testData.sections?.flatMap((section: any) =>
          section.questions.map((q: any) => q.questionId?.toString()),
        ) || []
      : testData.questions?.map((q: any) => q.questionId?.toString()) || [];

    if (questionIds.length === 0) return;

    // Check for duplicate question IDs within the same test/section
    const uniqueIds = new Set(questionIds);
    if (uniqueIds.size !== questionIds.length) {
      throw new BadRequestException('Duplicate question IDs found. Each question can only appear once in a test.');
    }

    const foundQuestions = await this.questionModel.find({ _id: { $in: questionIds } });
    if (foundQuestions.length !== questionIds.length) {
      throw new BadRequestException('Some question IDs are invalid or no longer exist');
    }
  }

  private buildTestQuery(filters: TestFiltersDto, user: RequestUser): any {
    const { orgId, isGlobal, testType, language, tag, status } = filters;
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && (user.role === 'admin' || user.role === 'instructor'));

    let query: any = {};

    // Status filtering
    if (status && ['draft', 'active', 'archived'].includes(status)) {
      query.status = status;
    }

    // Students should only see active tests
    if (user.role === 'student') {
      query.status = 'active';
    }

    // Organization and global filtering
    if (isSuperOrgAdminOrInstructor) {
      if (orgId) query.organizationId = orgId;
      if (isGlobal !== undefined) query.isGlobal = isGlobal;
    } else {
      if (orgId && orgId !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access tests for this organization');
      }
      query.$or = [{ isGlobal: true }, { organizationId: user.organizationId }];
    }

    // Additional filters
    if (testType) query.testType = testType;
    if (language) query.languages = language;
    if (tag) query.tags = tag;

    return query;
  }

  private collectQuestionIds(test: TestDocument): Types.ObjectId[] {
    if (test.settings.useSections && test.sections) {
      return test.sections.flatMap((section) =>
        section.questions.map((q) => q.questionId),
      );
    } else if (test.questions) {
      return test.questions.map((q) => q.questionId);
    }
    return [];
  }
}