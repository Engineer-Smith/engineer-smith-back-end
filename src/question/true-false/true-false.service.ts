// src/question/true-false/true-false.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../../schemas/question.schema';
import { CreateTrueFalseDto, UpdateTrueFalseDto } from './true-false.dto';
import { QuestionFormatterService } from '../services/question-formatter.service';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';
import type { CreateQuestionResult, UpdateQuestionResult, ValidationResult } from '../shared';

@Injectable()
export class TrueFalseService {
  // Standard True/False options
  private readonly TRUE_FALSE_OPTIONS = ['True', 'False'];

  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private formatterService: QuestionFormatterService,
  ) {}

  validate(data: Partial<CreateTrueFalseDto>, mode: 'create' | 'update'): ValidationResult {
    const errors: string[] = [];

    if (mode === 'create') {
      if (!data.title?.trim()) errors.push('title is required');
      if (!data.description?.trim()) errors.push('description is required');
      if (!data.language) errors.push('language is required');
      if (!data.difficulty) errors.push('difficulty is required');
      if (data.correctAnswer === undefined) {
        errors.push('correctAnswer is required (0 for True, 1 for False)');
      }
    }

    if (data.correctAnswer !== undefined && (data.correctAnswer < 0 || data.correctAnswer > 1)) {
      errors.push('correctAnswer must be 0 (True) or 1 (False)');
    }

    return { valid: errors.length === 0, errors };
  }

  async create(data: CreateTrueFalseDto, user: RequestUser): Promise<CreateQuestionResult> {
    const validation = this.validate(data, 'create');
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    const question = new this.questionModel({
      ...data,
      type: 'trueFalse',
      options: this.TRUE_FALSE_OPTIONS, // Always use standard options
      createdBy: user.userId,
      organizationId: user.isSuperOrgAdmin ? null : user.organizationId,
      isGlobal: user.isSuperOrgAdmin ? (data.isGlobal ?? true) : false,
    });

    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'True/False question created successfully',
    };
  }

  async update(
    questionId: string,
    data: UpdateTrueFalseDto,
    user: RequestUser,
  ): Promise<UpdateQuestionResult> {
    const question = await this.questionModel.findById(questionId);

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    if (question.type !== 'trueFalse') {
      throw new BadRequestException('Question is not a true/false question');
    }

    this.checkUpdatePermissions(question, user);

    const validation = this.validate(data as any, 'update');
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Apply updates (but never change options for T/F)
    const { ...updateData } = data;
    Object.assign(question, updateData);
    question.options = this.TRUE_FALSE_OPTIONS; // Ensure options stay correct
    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'True/False question updated successfully',
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
