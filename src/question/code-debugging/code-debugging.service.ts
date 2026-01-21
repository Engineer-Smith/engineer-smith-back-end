// src/question/code-debugging/code-debugging.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument, LANGUAGE_RUNTIME_MAP } from '../../schemas/question.schema';
import { CreateCodeDebuggingDto, UpdateCodeDebuggingDto } from './code-debugging.dto';
import { QuestionFormatterService } from '../services/question-formatter.service';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';
import type { CreateQuestionResult, UpdateQuestionResult, ValidationResult } from '../shared';

@Injectable()
export class CodeDebuggingService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private formatterService: QuestionFormatterService,
  ) {}

  validate(data: Partial<CreateCodeDebuggingDto>, mode: 'create' | 'update'): ValidationResult {
    const errors: string[] = [];

    if (mode === 'create') {
      if (!data.title?.trim()) errors.push('title is required');
      if (!data.description?.trim()) errors.push('description is required');
      if (!data.language) errors.push('language is required');
      if (!data.difficulty) errors.push('difficulty is required');
      if (!data.buggyCode?.trim()) errors.push('buggyCode is required');
      if (!data.solutionCode?.trim()) errors.push('solutionCode is required');
      if (!data.codeConfig) errors.push('codeConfig is required');
      if (!data.testCases || data.testCases.length === 0) {
        errors.push('at least one test case is required');
      }
    }

    // SQL doesn't support debugging
    if (data.language === 'sql') {
      errors.push('SQL does not support code debugging questions');
    }

    // Validate codeConfig
    if (data.codeConfig && !data.codeConfig.entryFunction) {
      errors.push('entryFunction is required');
    }

    // Validate test cases
    if (data.testCases) {
      for (let i = 0; i < data.testCases.length; i++) {
        const tc = data.testCases[i];
        if (!tc.args) {
          errors.push(`Test case ${i + 1}: args are required`);
        }
        if (tc.expected === undefined) {
          errors.push(`Test case ${i + 1}: expected value is required`);
        }
      }
    }

    // Validate language supports code debugging
    const debugLanguages = ['javascript', 'typescript', 'python', 'dart', 'express'];
    if (data.language && !debugLanguages.includes(data.language)) {
      errors.push(`Language ${data.language} does not support code debugging`);
    }

    return { valid: errors.length === 0, errors };
  }

  async create(data: CreateCodeDebuggingDto, user: RequestUser): Promise<CreateQuestionResult> {
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
      type: 'codeDebugging',
      category: 'logic', // Code debugging is always logic
      codeConfig,
      createdBy: user.userId,
      organizationId: user.isSuperOrgAdmin ? null : user.organizationId,
      isGlobal: user.isSuperOrgAdmin ? (data.isGlobal ?? true) : false,
    });

    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'Code debugging question created successfully',
    };
  }

  async update(
    questionId: string,
    data: UpdateCodeDebuggingDto,
    user: RequestUser,
  ): Promise<UpdateQuestionResult> {
    const question = await this.questionModel.findById(questionId);

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    if (question.type !== 'codeDebugging') {
      throw new BadRequestException('Question is not a code debugging question');
    }

    this.checkUpdatePermissions(question, user);

    // Merge for validation
    const merged = {
      language: data.language ?? question.language,
      buggyCode: data.buggyCode ?? question.buggyCode,
      solutionCode: data.solutionCode ?? question.solutionCode,
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
    question.category = 'logic'; // Always logic for code debugging
    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'Code debugging question updated successfully',
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
