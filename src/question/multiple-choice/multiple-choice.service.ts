// src/question/multiple-choice/multiple-choice.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../../schemas/question.schema';
import { CreateMultipleChoiceDto, UpdateMultipleChoiceDto } from './multiple-choice.dto';
import { QuestionFormatterService } from '../services/question-formatter.service';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';
import type { CreateQuestionResult, UpdateQuestionResult, ValidationResult } from '../shared';

@Injectable()
export class MultipleChoiceService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private formatterService: QuestionFormatterService,
  ) {}

  /**
   * Validate multiple choice question data
   */
  validate(data: Partial<CreateMultipleChoiceDto>, mode: 'create' | 'update'): ValidationResult {
    const errors: string[] = [];

    if (mode === 'create') {
      // Required fields for create
      if (!data.title?.trim()) errors.push('title is required');
      if (!data.description?.trim()) errors.push('description is required');
      if (!data.language) errors.push('language is required');
      if (!data.difficulty) errors.push('difficulty is required');
      if (!data.options || data.options.length < 2) {
        errors.push('at least 2 options are required');
      }
      if (data.correctAnswer === undefined) {
        errors.push('correctAnswer is required');
      }
    }

    // Validate correctAnswer is within bounds (for both create and update)
    if (data.correctAnswer !== undefined && data.options) {
      if (data.correctAnswer < 0 || data.correctAnswer >= data.options.length) {
        errors.push(`correctAnswer must be between 0 and ${data.options.length - 1}`);
      }
    }

    // Check for duplicate options
    if (data.options) {
      const uniqueOptions = new Set(data.options.map(o => o.toLowerCase().trim()));
      if (uniqueOptions.size !== data.options.length) {
        errors.push('options must be unique');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a new multiple choice question
   */
  async create(data: CreateMultipleChoiceDto, user: RequestUser): Promise<CreateQuestionResult> {
    // Validate
    const validation = this.validate(data, 'create');
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Create the question
    const question = new this.questionModel({
      ...data,
      type: 'multipleChoice',
      createdBy: user.userId,
      organizationId: user.isSuperOrgAdmin ? null : user.organizationId,
      isGlobal: user.isSuperOrgAdmin ? (data.isGlobal ?? true) : false,
    });

    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'Multiple choice question created successfully',
    };
  }

  /**
   * Update an existing multiple choice question
   */
  async update(
    questionId: string,
    data: UpdateMultipleChoiceDto,
    user: RequestUser,
  ): Promise<UpdateQuestionResult> {
    const question = await this.questionModel.findById(questionId);

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    if (question.type !== 'multipleChoice') {
      throw new BadRequestException('Question is not a multiple choice question');
    }

    // Check permissions
    this.checkUpdatePermissions(question, user);

    // Merge for validation
    const merged = {
      options: data.options ?? question.options,
      correctAnswer: data.correctAnswer ?? question.correctAnswer,
    };

    // Validate the merged data
    const validation = this.validate(merged as any, 'update');
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Apply updates
    Object.assign(question, data);
    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'Multiple choice question updated successfully',
    };
  }

  /**
   * Check if user can update this question
   */
  private checkUpdatePermissions(question: QuestionDocument, user: RequestUser): void {
    // Super org admins can update anything
    if (user.isSuperOrgAdmin) return;

    // Check organization match
    if (question.organizationId?.toString() !== user.organizationId) {
      throw new BadRequestException('You do not have permission to update this question');
    }

    // Only admins and instructors can update
    if (user.role !== 'admin' && user.role !== 'instructor') {
      throw new BadRequestException('Only admins and instructors can update questions');
    }
  }
}
