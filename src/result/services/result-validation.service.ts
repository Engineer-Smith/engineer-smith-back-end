// src/result/services/result-validation.service.ts
import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ResultDocument } from '../../schemas/result.schema';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

const VALID_QUESTION_TYPES = ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_STATUSES = ['completed', 'expired', 'abandoned', 'failed'];
const VALID_LANGUAGES = ['javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'];
const VALID_CATEGORIES = ['logic', 'ui', 'syntax'];

@Injectable()
export class ResultValidationService {
  /**
   * Validate user access to a result
   */
  async validateResultAccess(result: ResultDocument, user: RequestUser): Promise<boolean> {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    // Super org admins and instructors can access any result
    if (isSuperOrgAdminOrInstructor) {
      return true;
    }

    // Handle both populated and non-populated userId
    let resultUserId: string;
    if (result.userId && typeof result.userId === 'object' && (result.userId as any)._id) {
      resultUserId = (result.userId as any)._id.toString();
    } else {
      resultUserId = result.userId.toString();
    }

    // If user is not the owner of this result, check additional permissions
    if (resultUserId !== user.userId) {
      // Check if user is in same organization
      if (result.organizationId && result.organizationId.toString() !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access this result');
      }

      // Only admins can access other users' results within same organization
      if (user.role !== 'admin') {
        throw new ForbiddenException('Only admins or instructors can access other users results');
      }
    }

    return true;
  }

  /**
   * Validate user access to analytics
   */
  validateAnalyticsAccess(user: RequestUser, orgId?: string): boolean {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    if (!isSuperOrgAdminOrInstructor) {
      // Regular admins can only access their organization's analytics
      if (user.role !== 'admin' && user.role !== 'instructor') {
        throw new ForbiddenException('Only admins or instructors can access analytics');
      }

      if (orgId && orgId !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access analytics for this organization');
      }
    }

    return true;
  }

  /**
   * Validate user access to question analytics
   */
  validateQuestionAnalyticsAccess(user: RequestUser, orgId?: string): boolean {
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');

    if (!isSuperOrgAdminOrInstructor) {
      if (user.role !== 'admin') {
        throw new ForbiddenException('Only admins or instructors can access question analytics');
      }

      if (orgId && orgId !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access analytics for this organization');
      }
    }

    return true;
  }

  /**
   * Validate filter inputs
   */
  validateFilterInputs(filters: any): boolean {
    if (filters.questionType && !VALID_QUESTION_TYPES.includes(filters.questionType)) {
      throw new BadRequestException('Invalid question type');
    }

    if (filters.difficulty && !VALID_DIFFICULTIES.includes(filters.difficulty)) {
      throw new BadRequestException('Invalid difficulty');
    }

    if (filters.status && !VALID_STATUSES.includes(filters.status)) {
      throw new BadRequestException('Invalid status. Must be one of: completed, expired, abandoned, failed');
    }

    // Validate date formats
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Invalid start date format');
      }
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid end date format');
      }
    }

    // Validate pagination parameters
    if (filters.limit !== undefined) {
      const limit = parseInt(filters.limit, 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be a number between 1 and 100');
      }
    }

    if (filters.skip !== undefined) {
      const skip = parseInt(filters.skip, 10);
      if (isNaN(skip) || skip < 0) {
        throw new BadRequestException('Skip must be a non-negative number');
      }
    }

    // Validate score range filters
    if (filters.minScore !== undefined) {
      const minScore = parseFloat(filters.minScore);
      if (isNaN(minScore) || minScore < 0 || minScore > 100) {
        throw new BadRequestException('Minimum score must be a number between 0 and 100');
      }
    }

    if (filters.maxScore !== undefined) {
      const maxScore = parseFloat(filters.maxScore);
      if (isNaN(maxScore) || maxScore < 0 || maxScore > 100) {
        throw new BadRequestException('Maximum score must be a number between 0 and 100');
      }
    }

    if (filters.minScore !== undefined && filters.maxScore !== undefined) {
      if (parseFloat(filters.minScore) > parseFloat(filters.maxScore)) {
        throw new BadRequestException('Minimum score cannot be greater than maximum score');
      }
    }

    // Validate language filter
    if (filters.language && !VALID_LANGUAGES.includes(filters.language)) {
      throw new BadRequestException('Invalid language. Must be one of: ' + VALID_LANGUAGES.join(', '));
    }

    // Validate category filter
    if (filters.category && !VALID_CATEGORIES.includes(filters.category)) {
      throw new BadRequestException('Invalid category. Must be one of: ' + VALID_CATEGORIES.join(', '));
    }

    return true;
  }

  /**
   * Check if user can access question details
   */
  canAccessQuestionDetails(user: RequestUser): boolean {
    if (!user) return true;
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    return isSuperOrgAdminOrInstructor || user.role === 'admin' || user.role === 'instructor';
  }

  /**
   * Check if user can access answers
   */
  canAccessAnswers(user: RequestUser): boolean {
    if (!user) return true;
    const isSuperOrgAdminOrInstructor =
      user.isSuperOrgAdmin || (user.organizationId && user.role === 'instructor');
    return isSuperOrgAdminOrInstructor || user.role === 'admin' || user.role === 'instructor';
  }
}