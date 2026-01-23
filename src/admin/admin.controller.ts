// src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import {
  UserDashboardQueryDto,
  GrantAttemptsDto,
  UpdateOverrideDto,
  OverrideQueryDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/users/dashboard
   * Get comprehensive user management dashboard
   * Access: Admin, Instructor
   */
  @Get('users/dashboard')
  @Roles('admin', 'instructor')
  async getUserDashboard(
    @Query() filters: UserDashboardQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.getUserDashboard(filters, user);
  }

  /**
   * GET /admin/users/:userId/dashboard
   * Get individual user details dashboard
   * Access: Admin, Instructor
   */
  @Get('users/:userId/dashboard')
  @Roles('admin', 'instructor')
  async getUserDetailsDashboard(
    @Param('userId') userId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.getUserDetailsDashboard(userId, user);
  }

  /**
   * POST /admin/grant-attempts
   * Grant additional attempts to a student
   * Access: Admin, Instructor
   */
  @Post('grant-attempts')
  @Roles('admin', 'instructor')
  @HttpCode(HttpStatus.OK)
  async grantAttempts(
    @Body() dto: GrantAttemptsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.grantAttempts(dto, user);
  }

  /**
   * GET /admin/overrides
   * Get all attempt overrides
   * Access: Admin, Instructor
   */
  @Get('overrides')
  @Roles('admin', 'instructor')
  async getOverrides(
    @Query() filters: OverrideQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.getOverrides(filters, user);
  }

  /**
   * PATCH /admin/overrides/:overrideId
   * Update an override
   * Access: Admin, Instructor
   */
  @Patch('overrides/:overrideId')
  @Roles('admin', 'instructor')
  async updateOverride(
    @Param('overrideId') overrideId: string,
    @Body() dto: UpdateOverrideDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.updateOverride(overrideId, dto, user);
  }

  /**
   * DELETE /admin/overrides/:overrideId
   * Delete an override
   * Access: Admin, Instructor
   */
  @Delete('overrides/:overrideId')
  @Roles('admin', 'instructor')
  @HttpCode(HttpStatus.OK)
  async deleteOverride(
    @Param('overrideId') overrideId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.deleteOverride(overrideId, user);
  }

  /**
   * GET /admin/status/:testId/:userId
   * Get student's attempt status for a test
   * Access: Admin, Instructor
   */
  @Get('status/:testId/:userId')
  @Roles('admin', 'instructor')
  async getAttemptStatus(
    @Param('testId') testId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.getAttemptStatus(testId, userId, user);
  }
}