// src/question/code-challenge/code-challenge.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument, LANGUAGE_RUNTIME_MAP } from '../../schemas/question.schema';
import { CreateCodeChallengeDto, UpdateCodeChallengeDto } from './code-challenge.dto';
import { QuestionFormatterService } from '../services/question-formatter.service';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';
import type { CreateQuestionResult, UpdateQuestionResult, ValidationResult } from '../shared';

@Injectable()
export class CodeChallengeService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private formatterService: QuestionFormatterService,
  ) {}

  validate(data: Partial<CreateCodeChallengeDto>, mode: 'create' | 'update'): ValidationResult {
    const errors: string[] = [];

    if (mode === 'create') {
      if (!data.title?.trim()) errors.push('title is required');
      if (!data.description?.trim()) errors.push('description is required');
      if (!data.language) errors.push('language is required');
      if (!data.difficulty) errors.push('difficulty is required');
      if (!data.codeConfig) errors.push('codeConfig is required');
      if (!data.testCases || data.testCases.length === 0) {
        errors.push('at least one test case is required');
      }
    }

    // Validate codeConfig
    if (data.codeConfig) {
      // SQL doesn't require entryFunction
      if (data.language !== 'sql' && !data.codeConfig.entryFunction) {
        errors.push('entryFunction is required for non-SQL languages');
      }
    }

    // Validate test cases
    if (data.testCases) {
      for (let i = 0; i < data.testCases.length; i++) {
        const tc = data.testCases[i];

        if (data.language === 'sql') {
          // SQL test cases need schema/seed/expectedRows
          if (!tc.schemaSql && !tc.expectedRows) {
            errors.push(`Test case ${i + 1}: SQL requires schemaSql and expectedRows`);
          }
        } else {
          // Non-SQL test cases need args and expected
          if (!tc.args) {
            errors.push(`Test case ${i + 1}: args are required`);
          }
          if (tc.expected === undefined) {
            errors.push(`Test case ${i + 1}: expected value is required`);
          }
        }
      }
    }

    // Validate language supports code challenges
    const codeLanguages = ['javascript', 'typescript', 'python', 'dart', 'sql', 'express'];
    if (data.language && !codeLanguages.includes(data.language)) {
      errors.push(`Language ${data.language} does not support code challenges`);
    }

    return { valid: errors.length === 0, errors };
  }

  async create(data: CreateCodeChallengeDto, user: RequestUser): Promise<CreateQuestionResult> {
    const validation = this.validate(data, 'create');
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Auto-set runtime if not provided
    const codeConfig = { ...data.codeConfig };
    if (!codeConfig.runtime && data.language) {
      codeConfig.runtime = LANGUAGE_RUNTIME_MAP[data.language] ?? 'node';
    }

    const question = new this.questionModel({
      ...data,
      type: 'codeChallenge',
      category: 'logic', // Code challenges are always logic
      codeConfig,
      createdBy: user.userId,
      organizationId: user.isSuperOrgAdmin ? null : user.organizationId,
      isGlobal: user.isSuperOrgAdmin ? (data.isGlobal ?? true) : false,
    });

    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'Code challenge question created successfully',
    };
  }

  async update(
    questionId: string,
    data: UpdateCodeChallengeDto,
    user: RequestUser,
  ): Promise<UpdateQuestionResult> {
    const question = await this.questionModel.findById(questionId);

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    if (question.type !== 'codeChallenge') {
      throw new BadRequestException('Question is not a code challenge question');
    }

    this.checkUpdatePermissions(question, user);

    // Merge for validation
    const merged = {
      language: data.language ?? question.language,
      codeConfig: data.codeConfig ?? question.codeConfig,
      testCases: data.testCases ?? question.testCases,
    };

    const validation = this.validate(merged as any, 'update');
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Auto-update runtime if language changed
    if (data.language && data.language !== question.language) {
      if (!data.codeConfig) {
        data.codeConfig = { ...(question.codeConfig as any) };
      }
      (data.codeConfig as any).runtime = LANGUAGE_RUNTIME_MAP[data.language] ?? 'node';
    }

    Object.assign(question, data);
    question.category = 'logic'; // Always logic for code challenges
    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'Code challenge question updated successfully',
    };
  }

  private checkUpdatePermissions(question: QuestionDocument, user: RequestUser): void {
    if (user.isSuperOrgAdmin) return;
    if (question.organizationId?.toString() !== user.organizationId) {
      throw new BadRequestException('You do not have permission to update this question');
    }
    if (user.role !== 'admin' && user.role !== 'instructor') {
      throw new BadRequestException('Only admins and instructors can update questions');
    }
  }
}
