// src/question/question.controller.ts
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
import { QuestionService } from './services/question.service';
import { QuestionTestingService } from './services/question-testing.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFiltersDto,
  CheckDuplicatesDto,
  TestQuestionDto,
  ImportQuestionsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import { AdminOrInstructor, AnyRole } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

// Import type-specific services and DTOs
import { MultipleChoiceService, CreateMultipleChoiceDto, UpdateMultipleChoiceDto } from './multiple-choice';
import { TrueFalseService, CreateTrueFalseDto, UpdateTrueFalseDto } from './true-false';
import { FillInBlankService, CreateFillInBlankDto, UpdateFillInBlankDto } from './fill-in-blank';
import { CodeChallengeService, CreateCodeChallengeDto, UpdateCodeChallengeDto } from './code-challenge';
import { CodeDebuggingService, CreateCodeDebuggingDto, UpdateCodeDebuggingDto } from './code-debugging';
import { DragDropClozeService, CreateDragDropClozeDto, UpdateDragDropClozeDto } from './drag-drop-cloze';

@Controller('questions')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class QuestionController {
  constructor(
    private questionService: QuestionService,
    private questionTestingService: QuestionTestingService,
    // Type-specific services
    private multipleChoiceService: MultipleChoiceService,
    private trueFalseService: TrueFalseService,
    private fillInBlankService: FillInBlankService,
    private codeChallengeService: CodeChallengeService,
    private codeDebuggingService: CodeDebuggingService,
    private dragDropClozeService: DragDropClozeService,
  ) {}

  // ==========================================
  // TYPE-SPECIFIC ENDPOINTS (New simplified API)
  // ==========================================

  /**
   * POST /questions/multiple-choice
   * Create a multiple choice question
   */
  @Post('multiple-choice')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async createMultipleChoice(
    @Body() data: CreateMultipleChoiceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.multipleChoiceService.create(data, user);
  }

  /**
   * PATCH /questions/multiple-choice/:questionId
   * Update a multiple choice question
   */
  @Patch('multiple-choice/:questionId')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async updateMultipleChoice(
    @Param('questionId') questionId: string,
    @Body() data: UpdateMultipleChoiceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.multipleChoiceService.update(questionId, data, user);
  }

  /**
   * POST /questions/true-false
   * Create a true/false question
   */
  @Post('true-false')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async createTrueFalse(
    @Body() data: CreateTrueFalseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.trueFalseService.create(data, user);
  }

  /**
   * PATCH /questions/true-false/:questionId
   * Update a true/false question
   */
  @Patch('true-false/:questionId')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async updateTrueFalse(
    @Param('questionId') questionId: string,
    @Body() data: UpdateTrueFalseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.trueFalseService.update(questionId, data, user);
  }

  /**
   * POST /questions/fill-in-blank
   * Create a fill-in-the-blank question
   */
  @Post('fill-in-blank')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async createFillInBlank(
    @Body() data: CreateFillInBlankDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.fillInBlankService.create(data, user);
  }

  /**
   * PATCH /questions/fill-in-blank/:questionId
   * Update a fill-in-the-blank question
   */
  @Patch('fill-in-blank/:questionId')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async updateFillInBlank(
    @Param('questionId') questionId: string,
    @Body() data: UpdateFillInBlankDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.fillInBlankService.update(questionId, data, user);
  }

  /**
   * POST /questions/drag-drop-cloze
   * Create a drag-and-drop cloze question
   */
  @Post('drag-drop-cloze')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async createDragDropCloze(
    @Body() data: CreateDragDropClozeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.dragDropClozeService.create(data, user);
  }

  /**
   * PATCH /questions/drag-drop-cloze/:questionId
   * Update a drag-and-drop cloze question
   */
  @Patch('drag-drop-cloze/:questionId')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async updateDragDropCloze(
    @Param('questionId') questionId: string,
    @Body() data: UpdateDragDropClozeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.dragDropClozeService.update(questionId, data, user);
  }

  /**
   * POST /questions/code-challenge
   * Create a code challenge question
   */
  @Post('code-challenge')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async createCodeChallenge(
    @Body() data: CreateCodeChallengeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.codeChallengeService.create(data, user);
  }

  /**
   * PATCH /questions/code-challenge/:questionId
   * Update a code challenge question
   */
  @Patch('code-challenge/:questionId')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async updateCodeChallenge(
    @Param('questionId') questionId: string,
    @Body() data: UpdateCodeChallengeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.codeChallengeService.update(questionId, data, user);
  }

  /**
   * POST /questions/code-debugging
   * Create a code debugging question
   */
  @Post('code-debugging')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async createCodeDebugging(
    @Body() data: CreateCodeDebuggingDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.codeDebuggingService.create(data, user);
  }

  /**
   * PATCH /questions/code-debugging/:questionId
   * Update a code debugging question
   */
  @Patch('code-debugging/:questionId')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async updateCodeDebugging(
    @Param('questionId') questionId: string,
    @Body() data: UpdateCodeDebuggingDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.codeDebuggingService.update(questionId, data, user);
  }

  // ==========================================
  // GENERAL ENDPOINTS (Legacy + Shared)
  // ==========================================

  /**
   * GET /questions/stats
   * Get question statistics
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @AnyRole()
  async getQuestionStats(@CurrentUser() user: RequestUser) {
    return this.questionService.getQuestionStats(user);
  }

  /**
   * POST /questions/import
   * Import multiple questions in bulk
   * Access: Admin, Instructor
   */
  @Post('import')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  @HttpCode(HttpStatus.OK)
  async importQuestions(
    @Body() dto: ImportQuestionsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.importQuestions(dto, user);
  }

  /**
   * GET /questions/global
   * Get global questions (for global content management)
   * Access: Super org admins only
   */
  @Get('global')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async getGlobalQuestions(
    @Query() filters: QuestionFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.getGlobalQuestions(filters, user);
  }

  /**
   * GET /questions/check-duplicates
   * Check for duplicate questions
   */
  @Get('check-duplicates')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async checkDuplicates(
    @Query() searchParams: CheckDuplicatesDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.checkDuplicates(searchParams, user);
  }

  /**
   * GET /questions/supported-configs
   * Get supported configurations for code testing
   */
  @Get('supported-configs')
  @UseGuards(RolesGuard)
  @AnyRole()
  async getSupportedConfigurations() {
    return this.questionTestingService.getSupportedConfigurations();
  }

  /**
   * GET /questions
   * Get all questions with filters
   */
  @Get()
  @UseGuards(RolesGuard)
  @AnyRole()
  async getAllQuestions(
    @Query() filters: QuestionFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.getAllQuestions(filters, user);
  }

  /**
   * POST /questions
   * Create new question (legacy - accepts any type via 'type' field)
   */
  @Post()
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async createQuestion(
    @Body() questionData: CreateQuestionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.createQuestion(questionData, user);
  }

  /**
   * POST /questions/test
   * Test question (for validation during creation)
   */
  @Post('test')
  @UseGuards(RolesGuard)
  @AnyRole()
  @HttpCode(HttpStatus.OK)
  async testQuestion(
    @Body() body: TestQuestionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionTestingService.testQuestion(
      body.questionData,
      body.testCode,
      user,
    );
  }

  /**
   * GET /questions/:questionId
   * Get specific question by ID
   */
  @Get(':questionId')
  @UseGuards(RolesGuard)
  @AnyRole()
  async getQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.getQuestion(questionId, user);
  }

  /**
   * PATCH /questions/:questionId
   * Update specific question (legacy - accepts partial updates)
   */
  @Patch(':questionId')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateData: UpdateQuestionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.updateQuestion(questionId, updateData, user);
  }

  /**
   * DELETE /questions/:questionId
   * Delete specific question
   */
  @Delete(':questionId')
  @UseGuards(RolesGuard)
  @AdminOrInstructor()
  async deleteQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.questionService.deleteQuestion(questionId, user);
  }
}
