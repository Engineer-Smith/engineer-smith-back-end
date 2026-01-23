// src/result/result.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResultService } from './services/result.service';
import { ResultValidationService } from './services/result-validation.service';
import { ResultFiltersDto, AnalyticsFiltersDto } from './dto/result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('results')
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
export class ResultController {
  constructor(
    private readonly resultService: ResultService,
    private readonly validationService: ResultValidationService,
  ) {}

  /**
   * Get result analytics - admins and instructors only
   * GET /results/analytics/results
   * Note: Must come before parameterized routes
   */
  @Get('analytics/results')
  @Roles('admin', 'instructor')
  async getResultAnalytics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    this.validationService.validateAnalyticsAccess(user, filters.orgId);
    this.validationService.validateFilterInputs(filters);
    return this.resultService.getResultAnalytics(filters, user);
  }

  /**
   * Get user analytics - admins and instructors only
   * GET /results/analytics/users
   */
  @Get('analytics/users')
  @Roles('admin', 'instructor')
  async getUserAnalytics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    this.validationService.validateAnalyticsAccess(user, filters.orgId);
    this.validationService.validateFilterInputs(filters);
    return this.resultService.getUserAnalytics(filters, user);
  }

  /**
   * Get section analytics - admins and instructors only
   * GET /results/analytics/sections
   */
  @Get('analytics/sections')
  @Roles('admin', 'instructor')
  async getSectionAnalytics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    this.validationService.validateAnalyticsAccess(user, filters.orgId);
    this.validationService.validateFilterInputs(filters);
    return this.resultService.getSectionAnalytics(filters, user);
  }

  /**
   * Get question analytics - admins and instructors only
   * GET /results/analytics/questions
   */
  @Get('analytics/questions')
  @Roles('admin', 'instructor')
  async getQuestionAnalytics(
    @Query() filters: AnalyticsFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    this.validationService.validateQuestionAnalyticsAccess(user, filters.orgId);
    this.validationService.validateFilterInputs(filters);
    return this.resultService.getQuestionAnalytics(filters, user);
  }

  /**
   * Get all results with filters
   * GET /results
   * Students see their own, admins/instructors see org results
   */
  @Get()
  async getAllResults(
    @Query() filters: ResultFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    this.validationService.validateFilterInputs(filters);
    return this.resultService.getAllResults(filters, user);
  }

  /**
   * Get score breakdown for a result
   * GET /results/:resultId/breakdown
   */
  @Get(':resultId/breakdown')
  async getScoreBreakdown(
    @Param('resultId') resultId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.resultService.getScoreBreakdown(resultId, user);
  }

  /**
   * Get specific result by ID
   * GET /results/:resultId
   * Note: Must come last to avoid conflicts with other routes
   */
  @Get(':resultId')
  async getResult(
    @Param('resultId') resultId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.resultService.getResult(resultId, user);
  }
}