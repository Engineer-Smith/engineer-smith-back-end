// src/organization/organization.controller.ts
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
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequireSuperOrg } from '../auth/decorators/super-org.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  GetOrganizationsQueryDto,
  ValidateInviteCodeDto,
} from './dto/organization.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * POST /organizations
   * Create a new organization
   * Access: Super Admin only
   */
  @Post()
  @RequireSuperOrg()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    return this.organizationService.createOrganization(dto);
  }

  /**
   * GET /organizations
   * Get all organizations with pagination
   * Access: Super Admin only
   */
  @Get()
  @RequireSuperOrg()
  async getAllOrganizations(@Query() filters: GetOrganizationsQueryDto) {
    return this.organizationService.getAllOrganizations(filters);
  }

  /**
   * POST /organizations/validate-invite
   * Validate an invite code (for registration)
   * Access: Public
   */
  @Post('validate-invite')
  @Public()
  @HttpCode(HttpStatus.OK)
  async validateInviteCode(@Body() dto: ValidateInviteCodeDto) {
    return this.organizationService.validateInviteCode(dto.inviteCode);
  }

  /**
   * GET /organizations/:id
   * Get a specific organization by ID
   * Access: Super Admin or Admin/Instructor of the org
   */
  @Get(':id')
  @Roles('admin', 'instructor')
  async getOrganization(
    @Param('id') orgId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.organizationService.getOrganization(orgId, user);
  }

  /**
   * PATCH /organizations/:id
   * Update an organization
   * Access: Super Admin or Admin of the org
   */
  @Patch(':id')
  @Roles('admin')
  async updateOrganization(
    @Param('id') orgId: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.organizationService.updateOrganization(orgId, dto, user);
  }

  /**
   * DELETE /organizations/:id
   * Delete an organization
   * Access: Super Admin only
   */
  @Delete(':id')
  @RequireSuperOrg()
  @HttpCode(HttpStatus.OK)
  async deleteOrganization(@Param('id') orgId: string) {
    return this.organizationService.deleteOrganization(orgId);
  }
}