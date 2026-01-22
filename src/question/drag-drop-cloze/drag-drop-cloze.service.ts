// src/question/drag-drop-cloze/drag-drop-cloze.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../../schemas/question.schema';
import { CreateDragDropClozeDto, UpdateDragDropClozeDto } from './drag-drop-cloze.dto';
import { QuestionFormatterService } from '../services/question-formatter.service';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';
import type { CreateQuestionResult, UpdateQuestionResult, ValidationResult } from '../shared';

@Injectable()
export class DragDropClozeService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private formatterService: QuestionFormatterService,
  ) {}

  validate(data: Partial<CreateDragDropClozeDto>, mode: 'create' | 'update'): ValidationResult {
    const errors: string[] = [];

    if (mode === 'create') {
      if (!data.title?.trim()) errors.push('title is required');
      if (!data.description?.trim()) errors.push('description is required');
      if (!data.language) errors.push('language is required');
      if (!data.difficulty) errors.push('difficulty is required');
      if (!data.codeTemplate?.trim()) errors.push('codeTemplate is required');
      if (!data.blanks || data.blanks.length === 0) {
        errors.push('at least one blank is required');
      }
      if (!data.dragOptions || data.dragOptions.length === 0) {
        errors.push('at least one drag option is required');
      }
    }

    // Validate dragOptions structure
    if (data.dragOptions) {
      const optionIds = new Set<string>();
      for (let i = 0; i < data.dragOptions.length; i++) {
        const option = data.dragOptions[i];
        if (!option.id) {
          errors.push(`Drag option ${i + 1}: id is required`);
        } else if (optionIds.has(option.id)) {
          errors.push(`Duplicate drag option id: ${option.id}`);
        } else {
          optionIds.add(option.id);
        }
        if (!option.text?.trim()) {
          errors.push(`Drag option "${option.id}": text is required`);
        }
      }

      // Validate blanks structure and correct answers reference valid options
      if (data.blanks) {
        const blankIds = new Set<string>();
        for (let i = 0; i < data.blanks.length; i++) {
          const blank = data.blanks[i];
          if (!blank.id) {
            errors.push(`Blank ${i + 1}: id is required`);
          } else if (blankIds.has(blank.id)) {
            errors.push(`Duplicate blank id: ${blank.id}`);
          } else {
            blankIds.add(blank.id);
          }

          if (!blank.correctAnswers || blank.correctAnswers.length === 0) {
            errors.push(`Blank "${blank.id}": correct answer is required`);
          } else {
            // Validate correct answer references a valid drag option
            for (const correctId of blank.correctAnswers) {
              if (!optionIds.has(correctId)) {
                errors.push(`Blank "${blank.id}": correctAnswer "${correctId}" does not match any drag option id`);
              }
            }
          }
        }

        // Validate all blanks exist in template
        if (data.codeTemplate) {
          for (const blank of data.blanks) {
            if (!data.codeTemplate.includes(`{{${blank.id}}}`)) {
              errors.push(`Blank "${blank.id}" not found in template (use {{${blank.id}}})`);
            }
          }
        }

        // Validate we have at least as many options as blanks (for distractors to make sense)
        if (data.dragOptions.length < data.blanks.length) {
          errors.push('Number of drag options should be at least equal to number of blanks');
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async create(data: CreateDragDropClozeDto, user: RequestUser): Promise<CreateQuestionResult> {
    const validation = this.validate(data, 'create');
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    const question = new this.questionModel({
      ...data,
      type: 'dragDropCloze',
      createdBy: user.userId,
      organizationId: user.isSuperOrgAdmin ? null : user.organizationId,
      isGlobal: user.isSuperOrgAdmin ? (data.isGlobal ?? true) : false,
    });

    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'Drag and drop cloze question created successfully',
    };
  }

  async update(
    questionId: string,
    data: UpdateDragDropClozeDto,
    user: RequestUser,
  ): Promise<UpdateQuestionResult> {
    const question = await this.questionModel.findById(questionId);

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    if (question.type !== 'dragDropCloze') {
      throw new BadRequestException('Question is not a drag-drop-cloze question');
    }

    this.checkUpdatePermissions(question, user);

    // Merge for validation
    const merged = {
      codeTemplate: data.codeTemplate ?? question.codeTemplate,
      blanks: data.blanks ?? question.blanks,
      dragOptions: data.dragOptions ?? question.dragOptions,
    };

    const validation = this.validate(merged as any, 'update');
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    Object.assign(question, data);
    await question.save();

    return {
      success: true,
      question: this.formatterService.formatQuestionResponse(question, user),
      message: 'Drag and drop cloze question updated successfully',
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
