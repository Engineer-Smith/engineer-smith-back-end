// src/test/test.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TestService } from './services/test.service';
import { CreateTestDto, UpdateTestDto, TestFiltersDto } from './dto/test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

@Controller('tests')
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  /**
   * Create a new test
   * POST /tests
   */
  @Post()
  @Roles('admin', 'instructor')
  @HttpCode(HttpStatus.CREATED)
  async createTest(
    @Body() createTestDto: CreateTestDto,
    @CurrentUser() user: RequestUser,
    @Query('orgId') orgId?: string,
  ) {
    return this.testService.createTest(createTestDto, user, orgId);
  }

  /**
   * Get global tests (for global content management)
   * GET /tests/global
   * Note: This route must be defined BEFORE the generic :testId route
   */
  @Get('global')
  @Roles('admin')
  async getGlobalTests(
    @Query() filters: TestFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.testService.getGlobalTests(filters, user);
  }

  /**
   * Get test with full question data (for preview/taking)
   * GET /tests/:testId/with-questions
   * Note: This route must be defined BEFORE the generic :testId route
   */
  @Get(':testId/with-questions')
  async getTestWithQuestions(
    @Param('testId') testId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.testService.getTestWithQuestions(testId, user);
  }

  /**
   * Get a specific test by ID
   * GET /tests/:testId
   */
  @Get(':testId')
  async getTest(
    @Param('testId') testId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.testService.getTest(testId, user);
  }

  /**
   * Get all tests with optional filters
   * GET /tests
   */
  @Get()
  async getAllTests(
    @Query() filters: TestFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.testService.getAllTests(filters, user);
  }

  /**
   * Update a test
   * PATCH /tests/:testId
   */
  @Patch(':testId')
  @Roles('admin', 'instructor')
  async updateTest(
    @Param('testId') testId: string,
    @Body() updateTestDto: UpdateTestDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.testService.updateTest(testId, updateTestDto, user);
  }

  /**
   * Delete a test
   * DELETE /tests/:testId
   */
  @Delete(':testId')
  @Roles('admin', 'instructor')
  async deleteTest(
    @Param('testId') testId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.testService.deleteTest(testId, user);
  }
}