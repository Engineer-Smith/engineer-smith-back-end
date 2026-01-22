// src/test/services/test-validation.service.ts
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from '../../schemas/organization.schema';
import { CreateTestDto, UpdateTestDto } from '../dto/test.dto';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

const VALID_TEST_TYPES = ['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'];
const VALID_STATUSES = ['draft', 'active', 'archived'];

@Injectable()
export class TestValidationService {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
  ) {}

  /**
   * Validate test data for create or update operations
   */
  async validateTestData(testData: CreateTestDto | UpdateTestDto, mode: 'create' | 'update'): Promise<void> {
    if (mode === 'create') {
      await this.validateRequiredFields(testData as CreateTestDto);
    }

    await this.validateOptionalFields(testData);
    await this.validateTestStructure(testData);
  }

  /**
   * Validate user permissions to create tests and determine organization settings
   */
  async validateTestPermissions(
    user: RequestUser,
    orgId: string | null = null,
  ): Promise<{ organizationId: string | null; isGlobal: boolean }> {
    // Validate user has permission to create tests
    const isAdminOrInstructor =
      user.isSuperOrgAdmin ||
      (user.organizationId && (user.role === 'admin' || user.role === 'instructor'));

    if (!isAdminOrInstructor) {
      throw new ForbiddenException('Only admins/instructors can create tests');
    }

    // Validate organization access if orgId is specified
    if (orgId && !user.isSuperOrgAdmin && user.organizationId !== orgId) {
      throw new ForbiddenException('Unauthorized to create tests for this organization');
    }

    // Determine organization settings
    return this.determineOrganizationSettings(user, orgId);
  }

  // Private validation methods

  private async validateRequiredFields(testData: CreateTestDto): Promise<void> {
    const { title, description, settings } = testData;

    if (!title || !description || !settings || !settings.timeLimit || !settings.attemptsAllowed) {
      throw new BadRequestException('Title, description, and settings (timeLimit, attemptsAllowed) are required');
    }

    // Validate structure based on useSections setting
    if (settings.useSections) {
      if (!testData.sections || !Array.isArray(testData.sections) || testData.sections.length === 0) {
        throw new BadRequestException('Sections are required when useSections is true');
      }
    } else {
      if (!testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
        throw new BadRequestException('Questions are required when useSections is false');
      }
    }
  }

  private async validateOptionalFields(testData: CreateTestDto | UpdateTestDto): Promise<void> {
    const { testType, languages, tags, status } = testData as any;

    if (testType && !VALID_TEST_TYPES.includes(testType)) {
      throw new BadRequestException(`Invalid test type. Must be one of: ${VALID_TEST_TYPES.join(', ')}`);
    }

    if (languages && !Array.isArray(languages)) {
      throw new BadRequestException('Languages must be an array');
    }

    if (tags && !Array.isArray(tags)) {
      throw new BadRequestException('Tags must be an array');
    }

    if (status && !VALID_STATUSES.includes(status)) {
      throw new BadRequestException('Invalid status. Must be draft, active, or archived');
    }
  }

  private async validateTestStructure(testData: CreateTestDto | UpdateTestDto): Promise<void> {
    const { settings, sections, questions } = testData as any;

    if (!settings) return;

    // Validate time limits
    if (settings.timeLimit !== undefined && (typeof settings.timeLimit !== 'number' || settings.timeLimit <= 0)) {
      throw new BadRequestException('Time limit must be a positive number');
    }

    if (settings.attemptsAllowed !== undefined && (typeof settings.attemptsAllowed !== 'number' || settings.attemptsAllowed <= 0)) {
      throw new BadRequestException('Attempts allowed must be a positive number');
    }

    // Validate sections structure if using sections
    if (settings.useSections && sections) {
      await this.validateSections(sections);
    }

    // Validate questions structure if not using sections
    if (!settings.useSections && questions) {
      await this.validateQuestions(questions);
    }
  }

  private async validateSections(sections: any[]): Promise<void> {
    for (const section of sections) {
      if (!section.name || typeof section.name !== 'string' || section.name.trim().length === 0) {
        throw new BadRequestException('Each section must have a non-empty name');
      }

      if (!section.timeLimit || typeof section.timeLimit !== 'number' || section.timeLimit <= 0) {
        throw new BadRequestException('Each section must have a positive time limit');
      }

      if (!section.questions || !Array.isArray(section.questions) || section.questions.length === 0) {
        throw new BadRequestException('Each section must have at least one question');
      }

      await this.validateQuestions(section.questions);
    }
  }

  private async validateQuestions(questions: any[]): Promise<void> {
    for (const question of questions) {
      if (!question.questionId || typeof question.questionId !== 'string') {
        throw new BadRequestException('Each question must have a valid questionId');
      }

      if (!question.points || typeof question.points !== 'number' || question.points <= 0) {
        throw new BadRequestException('Each question must have positive points');
      }
    }
  }

  private async determineOrganizationSettings(
    user: RequestUser,
    orgId: string | null,
  ): Promise<{ organizationId: string | null; isGlobal: boolean }> {
    // Get user's organization
    const userOrganization = await this.organizationModel.findById(user.organizationId);
    if (!userOrganization) {
      throw new NotFoundException('User organization not found');
    }

    let organizationId: string | null = null;
    let isGlobal = false;

    // Default behavior based on user's organization
    if (userOrganization.isSuperOrg) {
      isGlobal = true;
      organizationId = null;
    } else {
      isGlobal = false;
      organizationId = user.organizationId;
    }

    // Override behavior if orgId is specified and user is superOrgAdmin
    if (orgId && user.isSuperOrgAdmin) {
      const targetOrg = await this.organizationModel.findById(orgId);
      if (!targetOrg) {
        throw new NotFoundException('Target organization not found');
      }

      if (targetOrg.isSuperOrg) {
        isGlobal = true;
        organizationId = null;
      } else {
        isGlobal = false;
        organizationId = targetOrg._id.toString();
      }
    }

    return { organizationId, isGlobal };
  }
}