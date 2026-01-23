// src/test-session/test-session.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { TestSessionService } from './test-session.service';
import { SessionManagerService } from './services/session-manager.service';
import { QuestionHandlerService } from './services/question-handler.service';
import { TimerService } from './services/timer.service';
import { GradingService } from '../grading/grading.service';
import { CodeExecutionService } from '../grading/code-execution.service';
import {
  StartTestSessionDto,
  SubmitAnswerDto,
  SubmitTestDto,
  TestSessionFiltersDto,
} from './dto/test-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';

/**
 * TestSessionController - HTTP endpoints for test sessions
 * 
 * Provides full HTTP-based functionality as a fallback when WebSocket
 * is not available (e.g., due to firewall restrictions).
 */
@Controller('test-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestSessionController {
  private readonly logger = new Logger(TestSessionController.name);

  constructor(
    private readonly testSessionService: TestSessionService,
    private readonly sessionManagerService: SessionManagerService,
    private readonly questionHandlerService: QuestionHandlerService,
    private readonly timerService: TimerService,
    private readonly gradingService: GradingService,
    private readonly codeExecutionService: CodeExecutionService,
  ) {}

  // ==========================================
  // SESSION LIFECYCLE ENDPOINTS
  // ==========================================

  /**
   * Check for existing active session
   * GET /test-sessions/check-existing
   */
  @Get('check-existing')
  async checkExistingSession(@CurrentUser() user: RequestUser) {
    return this.sessionManagerService.checkRejoinSession(user);
  }

  /**
   * Start a new test session
   * POST /test-sessions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async startTestSession(
    @Body() startDto: StartTestSessionDto,
    @CurrentUser() user: RequestUser,
  ) {
    const sessionData = await this.sessionManagerService.createSession(startDto, user);
    const sessionId = sessionData.sessionId.toString();

    // Start server-side timer (works even without WebSocket)
    this.startServerTimer(sessionId, sessionData.timeRemaining);

    // Get first question
    const questionData = await this.questionHandlerService.getCurrentQuestion(sessionId);

    return {
      success: true,
      session: sessionData,
      question: questionData,
      message: 'Test session started successfully',
    };
  }

  /**
   * Rejoin existing session
   * POST /test-sessions/:sessionId/rejoin
   */
  @Post(':sessionId/rejoin')
  async rejoinTestSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const sessionData = await this.sessionManagerService.rejoinSession(
      sessionId,
      user.userId,
    );

    // Clear any grace period and resume/start timer
    this.timerService.clearGracePeriod(sessionId);

    if (this.timerService.isTimerPaused(sessionId)) {
      this.timerService.resumeTimer(sessionId);
    } else if (!this.timerService.hasActiveTimer(sessionId)) {
      this.startServerTimer(sessionId, sessionData.timeRemaining);
    }

    const questionData = await this.questionHandlerService.getCurrentQuestion(sessionId);

    return {
      success: true,
      session: sessionData,
      question: questionData,
      wasReconnection: true,
      message: 'Successfully rejoined test session',
    };
  }

  /**
   * Abandon test session
   * POST /test-sessions/:sessionId/abandon
   */
  @Post(':sessionId/abandon')
  async abandonTestSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    this.timerService.clearTimer(sessionId);
    return this.sessionManagerService.abandonSession(sessionId, user.userId);
  }

  /**
   * Submit final test session
   * POST /test-sessions/:sessionId/submit
   */
  @Post(':sessionId/submit')
  async submitTestSession(
    @Param('sessionId') sessionId: string,
    @Body() submitDto: SubmitTestDto,
    @CurrentUser() user: RequestUser,
  ) {
    this.timerService.clearTimer(sessionId);
    return this.testSessionService.submitTestSession(sessionId, submitDto, user);
  }

  // ==========================================
  // QUESTION HANDLING ENDPOINTS
  // ==========================================

  /**
   * Get current question
   * GET /test-sessions/:sessionId/current-question
   */
  @Get(':sessionId/current-question')
  async getCurrentQuestion(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.sessionManagerService.getSession(sessionId, user);
    return this.questionHandlerService.getCurrentQuestion(sessionId);
  }

  /**
   * Submit answer
   * POST /test-sessions/:sessionId/submit-answer
   */
  @Post(':sessionId/submit-answer')
  async submitAnswer(
    @Param('sessionId') sessionId: string,
    @Body() answerDto: SubmitAnswerDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.sessionManagerService.getSession(sessionId, user);
    const result = await this.questionHandlerService.submitAnswer(sessionId, answerDto);

    if (result.action === 'test_complete' || result.action === 'time_expired') {
      this.timerService.clearTimer(sessionId);
    }

    return { success: true, ...result };
  }

  /**
   * Navigate to specific question
   * POST /test-sessions/:sessionId/navigate
   */
  @Post(':sessionId/navigate')
  async navigateToQuestion(
    @Param('sessionId') sessionId: string,
    @Body() body: { questionIndex: number },
    @CurrentUser() user: RequestUser,
  ) {
    await this.sessionManagerService.getSession(sessionId, user);
    const result = await this.questionHandlerService.navigateToQuestion(sessionId, body.questionIndex);
    return { success: true, ...result };
  }

  /**
   * Skip current question
   * POST /test-sessions/:sessionId/skip
   */
  @Post(':sessionId/skip')
  async skipQuestion(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.sessionManagerService.getSession(sessionId, user);
    const result = await this.questionHandlerService.skipQuestion(sessionId);
    return { success: true, ...result };
  }

  /**
   * Run code against test cases (for code challenges during test)
   * POST /test-sessions/:sessionId/run-code
   * Like CodeSignal - students can run their code to check against visible test cases
   */
  @Post(':sessionId/run-code')
  @HttpCode(HttpStatus.OK)
  async runCode(
    @Param('sessionId') sessionId: string,
    @Body() body: { code: string; questionIndex?: number },
    @CurrentUser() user: RequestUser,
  ) {
    const session = await this.sessionManagerService.getSession(sessionId, user);

    // Get the question (current or specified index)
    const questionIndex = body.questionIndex ?? session.currentQuestionIndex;
    const question = this.getQuestionFromSession(session, questionIndex);

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    // Only allow for code-based questions
    const codeTypes = ['codeChallenge', 'codeDebugging'];
    if (!codeTypes.includes(question.questionData?.type)) {
      throw new BadRequestException('Run code is only available for code challenges');
    }

    const { questionData } = question;
    const { testCases, codeConfig } = questionData;

    if (!testCases || testCases.length === 0) {
      throw new BadRequestException('No test cases available for this question');
    }

    // Only run against VISIBLE test cases (not hidden ones)
    const visibleTestCases = testCases.filter((tc: any) => !tc.hidden);

    if (visibleTestCases.length === 0) {
      return {
        success: true,
        message: 'All test cases are hidden. Submit your answer to see results.',
        testResults: [],
        visiblePassed: 0,
        visibleTotal: 0,
        hasHiddenTests: true,
      };
    }

    try {
      // Preview uses normal priority (not a timed submission)
      const result = await this.codeExecutionService.executeCode({
        code: body.code,
        language: questionData.language,
        testCases: visibleTestCases,
        runtime: codeConfig?.runtime || 'node',
        entryFunction: codeConfig?.entryFunction,
        timeoutMs: codeConfig?.timeoutMs || 3000,
        priority: 'normal',
      });

      return {
        success: true,
        testResults: result.testResults.map((tr: any) => ({
          testName: tr.testName,
          passed: tr.passed,
          input: visibleTestCases[tr.testCaseIndex]?.args,
          expected: tr.expectedOutput,
          actual: tr.actualOutput,
          error: tr.error,
          executionTime: tr.executionTime,
        })),
        visiblePassed: result.totalTestsPassed,
        visibleTotal: result.totalTests,
        hasHiddenTests: testCases.some((tc: any) => tc.hidden),
        consoleLogs: result.consoleLogs,
        executionError: result.executionError,
        compilationError: result.compilationError,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Code execution failed',
        testResults: [],
        visiblePassed: 0,
        visibleTotal: visibleTestCases.length,
      };
    }
  }

  /**
   * Helper to get question from session by index
   */
  private getQuestionFromSession(session: any, questionIndex: number): any {
    if (session.testSnapshot?.settings?.useSections) {
      const section = session.testSnapshot.sections?.[session.currentSectionIndex];
      return section?.questions?.[questionIndex];
    }
    return session.testSnapshot?.questions?.[questionIndex];
  }

  /**
   * Start review phase (legacy - redirects to start-section-review)
   * POST /test-sessions/:sessionId/start-review
   */
  @Post(':sessionId/start-review')
  async startReviewPhase(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    // Use the new startSectionReview method
    return this.startSectionReview(sessionId, user);
  }

  /**
   * Submit current section (marks as complete and moves to next)
   * POST /test-sessions/:sessionId/submit-section
   */
  @Post(':sessionId/submit-section')
  async submitSection(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.sessionManagerService.getSession(sessionId, user);
    const result = await this.questionHandlerService.submitSection(sessionId);

    // Start timer for next section if applicable
    if (result.action === 'next_section' && result.timeRemaining) {
      this.startServerTimer(sessionId, result.timeRemaining);
    }

    return { success: true, ...result };
  }

  /**
   * Start section review mode
   * POST /test-sessions/:sessionId/start-section-review
   */
  @Post(':sessionId/start-section-review')
  async startSectionReview(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.sessionManagerService.getSession(sessionId, user);
    const result = await this.questionHandlerService.startSectionReview(sessionId);
    return { success: true, ...result };
  }

  /**
   * Complete section (legacy - redirects to submit-section)
   * POST /test-sessions/:sessionId/complete-section
   */
  @Post(':sessionId/complete-section')
  async completeSection(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    // Use the new submitSection method
    return this.submitSection(sessionId, user);
  }

  // ==========================================
  // TIMER ENDPOINTS (Critical for non-WebSocket)
  // ==========================================

  /**
   * Time synchronization - clients should poll every 30s
   * GET /test-sessions/:sessionId/time-sync
   */
  @Get(':sessionId/time-sync')
  async getSessionTimeSync(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const serverTimeRemaining = this.timerService.getTimeRemaining(sessionId);
    const dbSync = await this.sessionManagerService.getTimeSync(sessionId, user);

    return {
      ...dbSync,
      serverTimeRemaining,
      timerActive: this.timerService.hasActiveTimer(sessionId),
      timerPaused: this.timerService.isTimerPaused(sessionId),
      serverTime: Date.now(),
    };
  }

  /**
   * Heartbeat - keeps session alive without WebSocket
   * POST /test-sessions/:sessionId/heartbeat
   * 
   * Clients without WebSocket should call this every 30 seconds
   */
  @Post(':sessionId/heartbeat')
  async sessionHeartbeat(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const session = await this.sessionManagerService.getSession(sessionId, user);

    // If session was paused (disconnected), heartbeat means they're back
    if (session.status === 'paused') {
      await this.sessionManagerService.markSessionConnected(sessionId);
      this.timerService.clearGracePeriod(sessionId);

      if (this.timerService.isTimerPaused(sessionId)) {
        this.timerService.resumeTimer(sessionId);
      }
    }

    const timeRemaining =
      this.timerService.getTimeRemaining(sessionId) ||
      (session as any).calculateTimeRemaining?.() ||
      0;

    if (timeRemaining <= 0) {
      return {
        success: false,
        expired: true,
        message: 'Session time has expired',
        timeRemaining: 0,
      };
    }

    return {
      success: true,
      timeRemaining,
      serverTime: Date.now(),
      status: session.status,
    };
  }

  // ==========================================
  // LIST / QUERY ENDPOINTS
  // ==========================================

  /**
   * Get all test sessions
   * GET /test-sessions
   */
  @Get()
  async getAllTestSessions(
    @Query() filters: TestSessionFiltersDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.sessionManagerService.listSessions(filters, user);
  }

  /**
   * Get class analytics (admin/instructor)
   * GET /test-sessions/analytics/class
   */
  @Get('analytics/class')
  @Roles('admin', 'instructor')
  async getClassAnalytics(
    @Query('testId') testId?: string,
    @Query('orgId') orgId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @CurrentUser() user?: RequestUser,
  ) {
    return this.testSessionService.getClassAnalytics(
      { testId, orgId, userId, status, limit },
      user!,
    );
  }

  /**
   * Get test analytics
   * GET /test-sessions/tests/:testId/analytics
   */
  @Get('tests/:testId/analytics')
  @Roles('admin', 'instructor')
  async getTestAnalytics(
    @Param('testId') testId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.testSessionService.getTestAnalytics(testId, user);
  }

  // ==========================================
  // INDIVIDUAL SESSION ENDPOINTS
  // ==========================================

  /**
   * Get session overview (admin/instructor)
   * GET /test-sessions/:sessionId/overview
   */
  @Get(':sessionId/overview')
  @Roles('admin', 'instructor')
  async getSessionOverview(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.sessionManagerService.getSessionForAdmin(sessionId, user);
  }

  /**
   * Get session analytics (admin/instructor)
   * GET /test-sessions/:sessionId/analytics
   */
  @Get(':sessionId/analytics')
  @Roles('admin', 'instructor')
  async getSessionAnalytics(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.testSessionService.getSessionAnalytics(sessionId, user);
  }

  /**
   * Get specific test session - MUST come last due to :sessionId param
   * GET /test-sessions/:sessionId
   */
  @Get(':sessionId')
  async getTestSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (user.role === 'student') {
      return this.sessionManagerService.getSession(sessionId, user);
    }
    return this.sessionManagerService.getSessionForAdmin(sessionId, user);
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  /**
   * Start server-side timer with auto-submit on expiration
   */
  private startServerTimer(sessionId: string, timeRemainingSec?: number): void {
    if (!timeRemainingSec || timeRemainingSec <= 0) return;

    this.timerService.startSectionTimer(
      sessionId,
      timeRemainingSec * 1000,
      0,
      async (sid) => {
        this.logger.log(`Timer expired for session ${sid} - auto-submitting`);

        try {
          const session = await this.testSessionService.getSessionInternal(sid);

          if (session && session.status === 'inProgress') {
            await this.testSessionService.submitTestSession(
              sid,
              { forceSubmit: true },
              {
                userId: session.userId.toString(),
                organizationId: session.organizationId.toString(),
                role: 'student',
              } as any,
            );
            this.logger.log(`Session ${sid} auto-submitted successfully`);
          }
        } catch (error) {
          this.logger.error(`Error auto-submitting session ${sid}:`, error);

          // Mark as expired at minimum
          try {
            const session = await this.testSessionService.getSessionInternal(sid);
            if (session && session.status === 'inProgress') {
              session.status = 'expired';
              session.completedAt = new Date();
              await session.save();
              this.logger.log(`Session ${sid} marked as expired`);
            }
          } catch (saveError) {
            this.logger.error(`Failed to mark session ${sid} as expired:`, saveError);
          }
        }
      },
    );
  }
}