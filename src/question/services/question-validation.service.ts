import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuestionDto, UpdateQuestionDto } from '../dto';
import {
  Question,
  QuestionDocument,
  VALID_COMBINATIONS,
  VALID_TYPE_COMBINATIONS,
  QUESTION_TYPES,
  LANGUAGES,
  DIFFICULTIES,
  CATEGORIES,
} from '../../schemas/question.schema';
import { Organization, OrganizationDocument } from '../../schemas/organization.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class QuestionValidationService {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Validate question data for create/update
   */
  async validateQuestionData(
    questionData: CreateQuestionDto | UpdateQuestionDto,
    mode: 'create' | 'update' = 'create',
  ): Promise<void> {
    if (mode === 'create') {
      await this.validateBasicFields(questionData as CreateQuestionDto);
    } else {
      await this.validateUpdatedFields(questionData as UpdateQuestionDto);
    }

    await this.validateTypeSpecificFields(questionData);
  }

  /**
   * Validate permissions and determine organization/global settings
   */
  async validateQuestionPermissions(
    user: RequestUser,
    isGlobal?: boolean,
  ): Promise<{ organizationId: string | null; isGlobal: boolean }> {
    if (!user.userId) {
      throw new BadRequestException('User ID is required');
    }

    const userDoc = await this.userModel.findById(user.userId);
    if (!userDoc) {
      throw new BadRequestException('Invalid user');
    }

    const userOrganization = await this.organizationModel.findById(user.organizationId);
    if (!userOrganization) {
      throw new NotFoundException('User organization not found');
    }

    const isSuperOrgAdmin =
      user.isSuperOrgAdmin || (userOrganization.isSuperOrg && user.role === 'admin');
    const isSuperOrgUser = userOrganization.isSuperOrg;

    let finalOrganizationId: string | null = user.organizationId;
    let finalIsGlobal = false;

    if (isSuperOrgAdmin || isSuperOrgUser) {
      // Default to global for super org users, but allow override
      if (isGlobal !== undefined) {
        finalIsGlobal = isGlobal;
      } else {
        finalIsGlobal = true;
      }

      finalOrganizationId = finalIsGlobal ? null : user.organizationId;
    } else if (user.role === 'admin' || user.role === 'instructor') {
      // Regular org users can only create org-specific questions
      if (isGlobal) {
        throw new ForbiddenException('Only super organization admins can create global questions');
      }
      finalOrganizationId = user.organizationId;
      finalIsGlobal = false;
    } else {
      throw new ForbiddenException('Insufficient permissions to create questions');
    }

    // Validate organization exists (only if not global)
    if (!finalIsGlobal && !finalOrganizationId) {
      throw new BadRequestException('User must belong to an organization to create questions');
    }

    if (!finalIsGlobal && finalOrganizationId) {
      const org = await this.organizationModel.findById(finalOrganizationId);
      if (!org) {
        throw new BadRequestException('Invalid organization');
      }
    }

    return { organizationId: finalOrganizationId, isGlobal: finalIsGlobal };
  }

  /**
   * Validate basic required fields for create
   */
  private async validateBasicFields(questionData: CreateQuestionDto): Promise<void> {
    const { title, description, type, language, difficulty, status, category } = questionData;

    if (!title || !description || !type || !language || !difficulty) {
      throw new BadRequestException(
        'Title, description, type, language, and difficulty are required',
      );
    }

    if (!QUESTION_TYPES.includes(type)) {
      throw new BadRequestException(
        `Invalid question type. Must be one of: ${QUESTION_TYPES.join(', ')}`,
      );
    }

    if (!LANGUAGES.includes(language)) {
      throw new BadRequestException(`Invalid language. Must be one of: ${LANGUAGES.join(', ')}`);
    }

    if (!DIFFICULTIES.includes(difficulty)) {
      throw new BadRequestException(
        `Invalid difficulty. Must be one of: ${DIFFICULTIES.join(', ')}`,
      );
    }

    if (status && !['draft', 'active', 'archived'].includes(status)) {
      throw new BadRequestException('Invalid status. Must be draft, active, or archived');
    }

    // Category validation for code-related questions
    if (['codeChallenge', 'fillInTheBlank', 'dragDropCloze', 'codeDebugging'].includes(type)) {
      if (!category) {
        throw new BadRequestException('Category is required for code-related questions');
      }
      if (!CATEGORIES.includes(category)) {
        throw new BadRequestException(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
      }

      // UI questions must use fillInTheBlank or dragDropCloze
      if (category === 'ui' && !['fillInTheBlank', 'dragDropCloze'].includes(type)) {
        throw new BadRequestException(
          'UI questions must use fillInTheBlank or dragDropCloze type, not codeChallenge or codeDebugging',
        );
      }

      // Validate language-category combination
      const validCategories = VALID_COMBINATIONS[language];
      if (!validCategories?.includes(category)) {
        throw new BadRequestException(
          `Invalid category '${category}' for language '${language}'. Valid categories: ${validCategories?.join(', ') || 'none'}`,
        );
      }
    }
  }

  /**
   * Validate fields for update operation
   */
  private async validateUpdatedFields(questionData: UpdateQuestionDto): Promise<void> {
    const { type, language, category, difficulty, status } = questionData;

    if (type && !QUESTION_TYPES.includes(type)) {
      throw new BadRequestException(
        `Invalid type. Must be one of: ${QUESTION_TYPES.join(', ')}`,
      );
    }
    if (language && !LANGUAGES.includes(language)) {
      throw new BadRequestException(`Invalid language. Must be one of: ${LANGUAGES.join(', ')}`);
    }
    if (category && !CATEGORIES.includes(category)) {
      throw new BadRequestException(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
    }
    if (difficulty && !DIFFICULTIES.includes(difficulty)) {
      throw new BadRequestException(
        `Invalid difficulty. Must be one of: ${DIFFICULTIES.join(', ')}`,
      );
    }
    if (status && !['draft', 'active', 'archived'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    // Validate UI/Logic question type combinations
    if (category === 'ui' && type && !['fillInTheBlank', 'dragDropCloze'].includes(type)) {
      throw new BadRequestException('UI questions must use fillInTheBlank or dragDropCloze type');
    }

    // Validate language-category combination for updates
    if (category && language) {
      const validCategories = VALID_COMBINATIONS[language];
      if (!validCategories?.includes(category)) {
        throw new BadRequestException(
          `Invalid category '${category}' for language '${language}'`,
        );
      }
    }
  }

  /**
   * Validate type-specific fields
   */
  private async validateTypeSpecificFields(
    questionData: CreateQuestionDto | UpdateQuestionDto,
  ): Promise<void> {
    const {
      type,
      options,
      correctAnswer,
      testCases,
      codeConfig,
      codeTemplate,
      blanks,
      buggyCode,
      solutionCode,
      category,
      language,
    } = questionData;

    if (!type) return; // Skip for partial updates without type

    if (type === 'multipleChoice') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        throw new BadRequestException(
          'At least two answer options are required for multipleChoice questions',
        );
      }
      if (
        correctAnswer === undefined ||
        typeof correctAnswer !== 'number' ||
        correctAnswer < 0 ||
        correctAnswer >= options.length
      ) {
        throw new BadRequestException(
          'Valid correct answer index is required for multipleChoice questions',
        );
      }
    }

    if (type === 'trueFalse') {
      if (!options || !Array.isArray(options) || options.length !== 2) {
        throw new BadRequestException('True/False questions require exactly 2 options');
      }
      if (
        correctAnswer === undefined ||
        typeof correctAnswer !== 'number' ||
        correctAnswer < 0 ||
        correctAnswer >= options.length
      ) {
        throw new BadRequestException(
          'Valid correct answer index (0 or 1) is required for trueFalse questions',
        );
      }
    }

    if (type === 'fillInTheBlank') {
      if (!codeTemplate) {
        throw new BadRequestException('codeTemplate is required for fillInTheBlank questions');
      }
      if (!blanks || !Array.isArray(blanks) || blanks.length === 0) {
        throw new BadRequestException(
          'At least one blank is required for fillInTheBlank questions',
        );
      }

      for (const blank of blanks) {
        if (
          !blank.id ||
          !blank.correctAnswers ||
          !Array.isArray(blank.correctAnswers) ||
          blank.correctAnswers.length === 0
        ) {
          throw new BadRequestException(
            'Each blank must have an id and at least one correct answer',
          );
        }
      }
    }

    if (type === 'dragDropCloze') {
      const dragOptions = (questionData as any).dragOptions;

      // For updates, only validate fields that are provided
      // For creates (via type-specific service), all fields are validated there
      if (codeTemplate !== undefined && !codeTemplate) {
        throw new BadRequestException('codeTemplate cannot be empty for dragDropCloze questions');
      }

      if (blanks !== undefined) {
        if (!Array.isArray(blanks) || blanks.length === 0) {
          throw new BadRequestException(
            'At least one blank is required for dragDropCloze questions',
          );
        }

        for (const blank of blanks) {
          if (
            !blank.id ||
            !blank.correctAnswers ||
            !Array.isArray(blank.correctAnswers) ||
            blank.correctAnswers.length === 0
          ) {
            throw new BadRequestException(
              'Each blank must have an id and at least one correct answer',
            );
          }
        }
      }

      if (dragOptions !== undefined) {
        if (!Array.isArray(dragOptions) || dragOptions.length === 0) {
          throw new BadRequestException(
            'At least one drag option is required for dragDropCloze questions',
          );
        }

        // Validate drag options have id and text
        const optionIds = new Set<string>();
        for (const option of dragOptions) {
          if (!option.id || !option.text) {
            throw new BadRequestException('Each drag option must have an id and text');
          }
          if (optionIds.has(option.id)) {
            throw new BadRequestException(`Duplicate drag option id: ${option.id}`);
          }
          optionIds.add(option.id);
        }

        // Validate blanks reference valid option ids (only if both are provided)
        if (blanks) {
          for (const blank of blanks) {
            for (const correctId of blank.correctAnswers) {
              if (!optionIds.has(correctId)) {
                throw new BadRequestException(
                  `Blank "${blank.id}": correctAnswer "${correctId}" does not match any drag option id`,
                );
              }
            }
          }
        }
      }
    }

    if (type === 'codeChallenge') {
      if (category !== 'logic') {
        throw new BadRequestException(
          'codeChallenge questions can only have logic category. Use fillInTheBlank for UI questions.',
        );
      }

      if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
        throw new BadRequestException(
          'At least one test case is required for logic code challenges',
        );
      }

      if (language === 'sql') {
        if (!codeConfig?.runtime) {
          throw new BadRequestException('runtime is required for SQL code challenges');
        }
      } else {
        if (!codeConfig?.entryFunction) {
          throw new BadRequestException('entryFunction is required for logic code challenges');
        }
        if (!codeConfig?.runtime) {
          throw new BadRequestException('runtime is required for logic code challenges');
        }
      }

      for (const testCase of testCases) {
        if (!testCase.hasOwnProperty('args') || !testCase.hasOwnProperty('expected')) {
          throw new BadRequestException('Test cases must have args and expected properties');
        }
      }
    }

    if (type === 'codeDebugging') {
      if (category !== 'logic') {
        throw new BadRequestException(
          'codeDebugging questions can only have logic category. Use fillInTheBlank for UI questions.',
        );
      }

      if (!buggyCode || !solutionCode) {
        throw new BadRequestException(
          'Both buggyCode and solutionCode are required for debugging questions',
        );
      }

      if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
        throw new BadRequestException(
          'At least one test case is required for logic debugging questions',
        );
      }

      if (language === 'sql') {
        if (!codeConfig?.runtime) {
          throw new BadRequestException('runtime is required for SQL debugging questions');
        }
      } else {
        if (!codeConfig?.entryFunction) {
          throw new BadRequestException('entryFunction is required for logic debugging questions');
        }
      }
    }
  }
}
