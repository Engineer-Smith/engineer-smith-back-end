import { Injectable } from '@nestjs/common';
import { QuestionDocument } from '../../schemas/question.schema';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class QuestionFormatterService {
  /**
   * Format question response based on user role
   * Students don't see correct answers, test cases marked as hidden, etc.
   */
  formatQuestionResponse(
    question: QuestionDocument | any,
    user: RequestUser,
    options: { includeAnswers?: boolean } = {},
  ): any {
    const isStudent = user.role === 'student';
    const includeAnswers = options.includeAnswers ?? !isStudent;

    const baseResponse: any = {
      _id: question._id,
      title: question.title,
      description: question.description,
      type: question.type,
      language: question.language,
      category: question.category,
      difficulty: question.difficulty,
      status: question.status,
      tags: question.tags || [],
      organizationId: question.organizationId,
      isGlobal: question.isGlobal,
      createdBy: question.createdBy,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    // Always include code-related fields
    if (question.codeTemplate) {
      baseResponse.codeTemplate = question.codeTemplate;
    }
    if (question.buggyCode) {
      baseResponse.buggyCode = question.buggyCode;
    }
    if (question.codeConfig) {
      baseResponse.codeConfig = question.codeConfig;
    }

    // Type-specific fields
    switch (question.type) {
      case 'multipleChoice':
      case 'trueFalse':
        baseResponse.options = question.options;
        if (includeAnswers) {
          baseResponse.correctAnswer = question.correctAnswer;
        }
        break;

      case 'fillInTheBlank':
        baseResponse.codeTemplate = question.codeTemplate;
        if (includeAnswers) {
          baseResponse.blanks = question.blanks;
        } else {
          // For students, include blanks but without correct answers
          baseResponse.blanks = question.blanks?.map((blank: any) => ({
            id: blank.id,
            hint: blank.hint,
            points: blank.points,
            caseSensitive: blank.caseSensitive,
            // Omit correctAnswers for students
          }));
        }
        break;

      case 'codeChallenge':
      case 'codeDebugging':
        if (includeAnswers) {
          baseResponse.testCases = question.testCases;
          if (question.solutionCode) {
            baseResponse.solutionCode = question.solutionCode;
          }
        } else {
          // For students, only show visible test cases
          baseResponse.testCases = question.testCases
            ?.filter((tc: any) => !tc.hidden)
            .map((tc: any) => ({
              name: tc.name,
              args: tc.args,
              expected: tc.expected,
              hidden: tc.hidden,
            }));
        }
        break;
    }

    // Include usage stats for instructors/admins
    if (!isStudent && question.usageStats) {
      baseResponse.usageStats = question.usageStats;
    }

    return baseResponse;
  }

  /**
   * Format multiple questions
   */
  formatQuestionsResponse(
    questions: QuestionDocument[],
    user: RequestUser,
    options: { includeAnswers?: boolean } = {},
  ): any[] {
    return questions.map((q) => this.formatQuestionResponse(q, user, options));
  }
}
