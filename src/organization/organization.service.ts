// src/organization/organization.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from '../schemas/organization.schema';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  GetOrganizationsQueryDto,
  OrganizationResponseDto,
  InviteCodeValidationResponseDto,
  UpdateOrganizationSettingsDto,
} from './dto/organization.dto';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
  ) {}

  /**
   * Create a new organization (super admin only)
   */
  async createOrganization(dto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    // Check if invite code already exists
    const existingOrg = await this.organizationModel.findOne({ inviteCode: dto.inviteCode });
    if (existingOrg) {
      throw new ConflictException('Invite code already exists');
    }

    const organization = new this.organizationModel({
      name: dto.name.trim(),
      inviteCode: dto.inviteCode.trim(),
      isSuperOrg: false,
    });

    await organization.save();

    return this.formatOrganizationResponse(organization);
  }

  /**
   * Get organization by ID
   */
  async getOrganization(
    orgId: string,
    currentUser: RequestUser,
  ): Promise<OrganizationResponseDto> {
    // Validate access: super org admin or user in requested org
    if (!currentUser.isSuperOrgAdmin && currentUser.organizationId !== orgId) {
      throw new ForbiddenException('Unauthorized to access this organization');
    }

    const organization = await this.organizationModel.findById(orgId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.formatOrganizationResponse(organization);
  }

  /**
   * Get all organizations (super admin only)
   */
  async getAllOrganizations(
    filters: GetOrganizationsQueryDto,
  ): Promise<{ organizations: OrganizationResponseDto[]; total: number }> {
    const query: any = {};

    // Search filter
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ name: regex }, { inviteCode: regex }];
    }

    const [organizations, total] = await Promise.all([
      this.organizationModel
        .find(query)
        .skip(filters.skip || 0)
        .limit(filters.limit || 10)
        .sort({ createdAt: -1 })
        .lean(),
      this.organizationModel.countDocuments(query),
    ]);

    return {
      organizations: organizations.map((org) => this.formatOrganizationResponse(org)),
      total,
    };
  }

  /**
   * Update organization
   */
  async updateOrganization(
    orgId: string,
    dto: UpdateOrganizationDto,
    currentUser: RequestUser,
  ): Promise<OrganizationResponseDto> {
    // Validate access: super org admin or org admin of same org
    if (!currentUser.isSuperOrgAdmin && currentUser.organizationId !== orgId) {
      throw new ForbiddenException('Unauthorized to update this organization');
    }

    // Validate input
    if (!dto.name && !dto.inviteCode) {
      throw new BadRequestException('At least one field (name or inviteCode) is required');
    }

    // Check invite code uniqueness if being changed
    if (dto.inviteCode) {
      const existingOrg = await this.organizationModel.findOne({
        inviteCode: dto.inviteCode,
        _id: { $ne: orgId },
      });
      if (existingOrg) {
        throw new ConflictException('Invite code already exists');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name.trim();
    if (dto.inviteCode) updateData.inviteCode = dto.inviteCode.trim();

    const organization = await this.organizationModel.findByIdAndUpdate(
      orgId,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.formatOrganizationResponse(organization);
  }

  /**
   * Delete organization (super admin only)
   */
  async deleteOrganization(orgId: string): Promise<{ message: string }> {
    const organization = await this.organizationModel.findById(orgId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Prevent deleting super org or Public Org
    if (organization.isSuperOrg || organization.name === 'Public Org') {
      throw new ForbiddenException('Cannot delete super org or Public Org');
    }

    await this.organizationModel.deleteOne({ _id: orgId });

    // Note: Cascade deletion of Users, Questions, Tests, etc., should be implemented
    // Consider using a transaction or background job for cleanup

    return { message: 'Organization deleted successfully' };
  }

  /**
   * Validate invite code (public endpoint for registration)
   */
  async validateInviteCode(inviteCode: string): Promise<InviteCodeValidationResponseDto> {
    const organization = await this.organizationModel.findOne({ inviteCode });

    if (!organization) {
      throw new NotFoundException('Invalid invite code');
    }

    return {
      _id: organization._id.toString(),
      name: organization.name,
    };
  }

  /**
   * Get organization by invite code (internal use)
   */
  async getByInviteCode(inviteCode: string): Promise<OrganizationDocument | null> {
    return this.organizationModel.findOne({ inviteCode });
  }

  /**
   * Get super organization (internal use)
   */
  async getSuperOrganization(): Promise<OrganizationDocument | null> {
    return this.organizationModel.findOne({ isSuperOrg: true });
  }

  /**
   * Get organization settings
   */
  async getSettings(orgId: string, currentUser: RequestUser): Promise<any> {
    // Validate access: super org admin or admin of same org
    if (
      !currentUser.isSuperOrgAdmin &&
      (currentUser.organizationId !== orgId || currentUser.role !== 'admin')
    ) {
      throw new ForbiddenException('Only admins can access organization settings');
    }

    const organization = await this.organizationModel.findById(orgId).select('settings');
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Return settings with defaults
    return {
      allowSelfRegistration: organization.settings?.allowSelfRegistration ?? true,
      defaultStudentAttemptsPerTest: organization.settings?.defaultStudentAttemptsPerTest ?? 1,
      testGracePeriodMinutes: organization.settings?.testGracePeriodMinutes ?? 5,
      requireEmailVerification: organization.settings?.requireEmailVerification ?? false,
      allowInstructorTestCreation: organization.settings?.allowInstructorTestCreation ?? true,
      maxQuestionsPerTest: organization.settings?.maxQuestionsPerTest ?? 100,
      defaultTestTimeLimit: organization.settings?.defaultTestTimeLimit ?? 60,
    };
  }

  /**
   * Update organization settings
   */
  async updateSettings(
    orgId: string,
    dto: UpdateOrganizationSettingsDto,
    currentUser: RequestUser,
  ): Promise<any> {
    // Validate access: super org admin or admin of same org
    if (
      !currentUser.isSuperOrgAdmin &&
      (currentUser.organizationId !== orgId || currentUser.role !== 'admin')
    ) {
      throw new ForbiddenException('Only admins can update organization settings');
    }

    const organization = await this.organizationModel.findById(orgId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Merge with existing settings
    const currentSettings = organization.settings || {};
    const newSettings = {
      ...currentSettings,
      ...Object.fromEntries(
        Object.entries(dto).filter(([_, v]) => v !== undefined)
      ),
    };

    const updated = await this.organizationModel
      .findByIdAndUpdate(
        orgId,
        { $set: { settings: newSettings } },
        { new: true, runValidators: true }
      )
      .select('settings');

    return updated?.settings || newSettings;
  }

  // Private helper methods

  private formatOrganizationResponse(org: any): OrganizationResponseDto {
    return {
      _id: org._id.toString(),
      name: org.name,
      inviteCode: org.inviteCode,
      isSuperOrg: org.isSuperOrg || false,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}