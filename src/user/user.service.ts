// src/user/user.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { Organization, OrganizationDocument } from '../schemas/organization.schema';
import {
  GetUsersQueryDto,
  UpdateUserDto,
  CreateUserDto,
  UserResponseDto,
  UpdateProfileDto,
  UpdatePreferencesDto,
} from './dto/user.dto';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
  ) {}

  /**
   * Get a single user by ID
   */
  async getUser(userId: string, currentUser: RequestUser): Promise<UserResponseDto> {
    const targetUser = await this.userModel
      .findById(userId)
      .select('-hashedPassword -ssoToken')
      .lean();

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Validate access: super org admin, same org admin/instructor, or self
    if (
      !currentUser.isSuperOrgAdmin &&
      currentUser.organizationId !== targetUser.organizationId.toString() &&
      currentUser.userId !== userId
    ) {
      throw new ForbiddenException('Unauthorized to access this user');
    }

    return this.formatUserResponse(targetUser);
  }

  /**
   * Get all users with filters
   */
  async getAllUsers(
    filters: GetUsersQueryDto,
    currentUser: RequestUser,
  ): Promise<UserResponseDto[]> {
    const query = this.buildUserQuery(filters, currentUser);

    const users = await this.userModel
      .find(query)
      .skip(filters.skip || 0)
      .limit(filters.limit || 10)
      .select('-hashedPassword -ssoToken')
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    return users.map((user) => this.formatUserResponse(user));
  }

  /**
   * Get user count for pagination
   */
  async getUserCount(
    filters: GetUsersQueryDto,
    currentUser: RequestUser,
  ): Promise<number> {
    const query = this.buildUserQuery(filters, currentUser);
    return this.userModel.countDocuments(query);
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(
    dto: CreateUserDto,
    currentUser: RequestUser,
  ): Promise<UserResponseDto> {
    // Determine organization
    let organizationId = dto.organizationId;

    if (!currentUser.isSuperOrgAdmin) {
      // Non-super admins can only create users in their own org
      organizationId = currentUser.organizationId;
    } else if (!organizationId) {
      // Super admin must specify org or default to their own
      organizationId = currentUser.organizationId;
    }

    // Verify organization exists
    const organization = await this.organizationModel.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if loginId is unique
    const existingByLoginId = await this.userModel.findOne({
      loginId: dto.loginId.toLowerCase(),
    });
    if (existingByLoginId) {
      throw new ConflictException('loginId already exists');
    }

    // Check if email is unique (if provided)
    if (dto.email) {
      const existingByEmail = await this.userModel.findOne({
        email: dto.email.toLowerCase(),
      });
      if (existingByEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // Create user
    const user = new this.userModel({
      loginId: dto.loginId.toLowerCase(),
      email: dto.email ? dto.email.toLowerCase() : undefined,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      hashedPassword,
      organizationId,
      role: dto.role || 'student',
      isSSO: false,
    });

    await user.save();

    return this.formatUserResponse(user.toObject());
  }

  /**
   * Update a user
   */
  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    currentUser: RequestUser,
  ): Promise<UserResponseDto> {
    const targetUser = await this.userModel.findById(userId);

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Validate access: super org admin or same org admin
    if (
      !currentUser.isSuperOrgAdmin &&
      currentUser.organizationId !== targetUser.organizationId.toString()
    ) {
      throw new ForbiddenException('Unauthorized to update this user');
    }

    // Check if at least one field is being updated
    if (!dto.loginId && !dto.email && !dto.firstName && !dto.lastName && !dto.password && !dto.role) {
      throw new BadRequestException(
        'At least one field (loginId, email, firstName, lastName, password, role) is required',
      );
    }

    // Check loginId uniqueness if being changed
    if (dto.loginId && dto.loginId.toLowerCase() !== targetUser.loginId) {
      const existingUser = await this.userModel.findOne({
        loginId: dto.loginId.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new ConflictException('loginId already exists');
      }
    }

    // Check email uniqueness if being changed
    if (dto.email && dto.email.toLowerCase() !== targetUser.email) {
      const existingUser = await this.userModel.findOne({
        email: dto.email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Prepare update
    const updateData: any = {};
    if (dto.loginId) updateData.loginId = dto.loginId.toLowerCase();
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.firstName) updateData.firstName = dto.firstName.trim();
    if (dto.lastName) updateData.lastName = dto.lastName.trim();
    if (dto.password) updateData.hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    if (dto.role) updateData.role = dto.role;

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true })
      .select('-hashedPassword -ssoToken')
      .lean();

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return this.formatUserResponse(updatedUser);
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string, currentUser: RequestUser): Promise<{ message: string }> {
    const targetUser = await this.userModel.findById(userId);

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Validate access: super org admin or same org admin
    if (
      !currentUser.isSuperOrgAdmin &&
      currentUser.organizationId !== targetUser.organizationId.toString()
    ) {
      throw new ForbiddenException('Unauthorized to delete this user');
    }

    // Prevent self-deletion
    if (currentUser.userId === userId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    await this.userModel.deleteOne({ _id: userId });

    return { message: 'User deleted successfully' };
  }

  /**
   * Update own profile (user updating themselves)
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if being changed
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: dto.email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Prepare update
    const updateData: any = {};
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.firstName) updateData.firstName = dto.firstName.trim();
    if (dto.lastName) updateData.lastName = dto.lastName.trim();

    if (Object.keys(updateData).length === 0) {
      return this.formatUserResponse(user.toObject());
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true })
      .select('-hashedPassword -ssoToken')
      .lean();

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return this.formatUserResponse(updatedUser);
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .select('preferences')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.preferences || {
      theme: 'system',
      emailNotifications: true,
      testReminders: true,
      codeEditorFontSize: 14,
      codeEditorTheme: 'vs-dark',
    };
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<any> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Merge with existing preferences
    const currentPrefs = user.preferences || {};
    const newPrefs = {
      ...currentPrefs,
      ...Object.fromEntries(
        Object.entries(dto).filter(([_, v]) => v !== undefined)
      ),
    };

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { preferences: newPrefs } },
        { new: true, runValidators: true }
      )
      .select('preferences')
      .lean();

    return updatedUser?.preferences || newPrefs;
  }

  /**
   * Search users by name (for autocomplete/search features)
   */
  async searchUsers(
    searchTerm: string,
    currentUser: RequestUser,
    role?: string,
    limit = 10,
  ): Promise<UserResponseDto[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const regex = new RegExp(searchTerm, 'i');

    const query: any = {
      organizationId: currentUser.isSuperOrgAdmin ? { $exists: true } : currentUser.organizationId,
      $or: [{ firstName: regex }, { lastName: regex }, { loginId: regex }, { email: regex }],
    };

    if (role) {
      query.role = role;
    }

    const users = await this.userModel
      .find(query)
      .limit(limit)
      .select('-hashedPassword -ssoToken')
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    return users.map((user) => this.formatUserResponse(user));
  }

  // Private helper methods

  private buildUserQuery(filters: GetUsersQueryDto, currentUser: RequestUser): any {
    const query: any = {};

    if (!currentUser.isSuperOrgAdmin) {
      // Non-super admins: restrict to their org
      if (filters.orgId && filters.orgId !== currentUser.organizationId) {
        throw new ForbiddenException('Unauthorized to access users outside your organization');
      }
      query.organizationId = currentUser.organizationId;
    } else if (filters.orgId) {
      // Super org admins: optional orgId filter
      query.organizationId = filters.orgId;
    }

    // Role filter
    if (filters.role) {
      query.role = filters.role;
    }

    // Search filter
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { loginId: regex },
        { email: regex },
      ];
    }

    return query;
  }

  private formatUserResponse(user: any): UserResponseDto {
    return {
      _id: user._id.toString(),
      loginId: user.loginId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      organizationId: user.organizationId.toString(),
      role: user.role,
      isSSO: user.isSSO,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}