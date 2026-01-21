// src/test-session/test-session.service.ts
import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { SessionManagerService } from './services/session-manager.service';
import { QuestionHandlerService } from './services/question-handler.service';
import { SnapshotService } from './services/snapshot.service';
import { GradingService } from '../grading/grading.service';
import { StartTestSessionDto, SubmitAnswerDto, TestSessionFiltersDto, SubmitTestDto } from './dto/test-session.dto';
import type { RequestUser } from '../auth/interfaces/jwt-payload.interface';
import { TestSession, TestSessionDocument } from '../schemas/test-session.schema';
import { Result, ResultDocument } from '../schemas/result.schema';
import { Test, TestDocument } from '../schemas/test.schema';

/**
 * TestSessionService - Facade service that coordinates all test session operations
 * This is the main entry point used by the gateway and controllers
 */
@Injectable()
export class TestSessionService {
  private readonly logger = new Logger(TestSessionService.name);

  constructor(
    @InjectModel(TestSession.name) private testSessionModel: Model<TestSessionDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Test.name) private testModel: Model<TestDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly sessionManager: SessionManagerService,
    private readonly questionHandler: QuestionHandlerService,
    private readonly snapshotService: SnapshotService,
    private readonly gradingService: GradingService,
  ) {}

  // ==========================================
  // INTERNAL METHODS (for gateway/socket use)
  // ==========================================

  /**
   * Get session without auth check (internal server use only)
   */
  async getSessionInternal(sessionId: string) {
    return this.sessionManager.getSessionInternal(sessionId);
  }

  /**
   * Handle socket join event
   */
  async handleSocketJoin(
    sessionId: string,
    userId: string,
    socketId: string,
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const session = await this.sessionManager.getSessionInternal(sessionId);

      // Verify user owns this session
      if (session.userId.toString() !== userId) {
        return {
          success: false,
          message: 'Unauthorized to join this session',
        };
      }

      // Check session status
      if (!['inProgress', 'paused'].includes(session.status)) {
        return {
          success: false,
          message: `Cannot join session with status: ${session.status}`,
        };
      }

      // Mark session as connected
      await this.sessionManager.markSessionConnected(sessionId);

      // Get current question state
      const { questionState, navigationContext } =
        await this.questionHandler.getCurrentQuestion(sessionId);

      return {
        success: true,
        data: {
          sessionId,
          status: session.status,
          questionState,
          navigationContext,
          testInfo: {
            title: session.testSnapshot.title,
            totalQuestions: session.testSnapshot.totalQuestions,
            totalPoints: session.testSnapshot.totalPoints,
            useSections: session.testSnapshot.settings.useSections,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error in handleSocketJoin: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Failed to join session',
      };
    }
  }

  /**
   * Handle socket rejoin event (reconnection)
   */
  async handleSocketRejoin(
    sessionId: string,
    userId: string,
    socketId: string,
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const session = await this.sessionManager.getSessionInternal(sessionId);

      // Verify user owns this session
      if (session.userId.toString() !== userId) {
        return {
          success: false,
          message: 'Unauthorized to rejoin this session',
        };
      }

      // Check if session can be rejoined
      if (!['inProgress', 'paused'].includes(session.status)) {
        return {
          success: false,
          message: `Cannot rejoin session with status: ${session.status}`,
        };
      }

      // Check if time has expired
      const timeRemaining = (session as any).calculateTimeRemaining();
      if (timeRemaining <= 0) {
        // Mark as expired
        session.status = 'expired';
        session.completedAt = new Date();
        await session.save();

        return {
          success: false,
          message: 'Session has expired',
        };
      }

      // Mark session as connected (clears grace period)
      await this.sessionManager.markSessionConnected(sessionId);

      // Get current question state
      const { questionState, navigationContext } =
        await this.questionHandler.getCurrentQuestion(sessionId);

      return {
        success: true,
        data: {
          sessionId,
          status: 'inProgress',
          wasReconnection: true,
          questionState,
          navigationContext,
          timeRemaining,
          testInfo: {
            title: session.testSnapshot.title,
            totalQuestions: session.testSnapshot.totalQuestions,
            totalPoints: session.testSnapshot.totalPoints,
            useSections: session.testSnapshot.settings.useSections,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error in handleSocketRejoin: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Failed to rejoin session',
      };
    }
  }

  /**
   * Handle answer submission from socket
   */
  async handleAnswerSubmit(
    sessionId: string,
    userId: string,
    answerData: SubmitAnswerDto,
  ): Promise<{
    success: boolean;
    message?: string;
    action?: string;
    data?: any;
  }> {
    try {
      const session = await this.sessionManager.getSessionInternal(sessionId);

      // Verify user owns this session
      if (session.userId.toString() !== userId) {
        return {
          success: false,
          message: 'Unauthorized to submit answer for this session',
        };
      }

      // Submit answer and get next action
      const result = await this.questionHandler.submitAnswer(sessionId, answerData);

      // Map result to gateway-expected format
      switch (result.action) {
        case 'next_question':
          return {
            success: true,
            action: 'next_question',
            data: {
              questionState: result.questionState,
              navigationContext: result.navigationContext,
            },
          };

        case 'section_complete':
          return {
            success: true,
            action: 'section_transition',
            data: {
              message: result.message,
              nextSectionIndex: result.nextSectionIndex,
            },
          };

        case 'test_complete':
        case 'confirm_submit':
          return {
            success: true,
            action: 'test_completion',
            data: {
              message: result.message,
              skippedCount: result.skippedCount,
              unansweredCount: result.unansweredCount,
            },
          };

        case 'time_expired':
          return {
            success: false,
            action: 'time_expired',
            message: result.message,
          };

        default:
          return {
            success: true,
            action: result.action || 'stay',
            data: {
              questionState: result.questionState,
              navigationContext: result.navigationContext,
            },
          };
      }
    } catch (error) {
      this.logger.error(`Error in handleAnswerSubmit: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Failed to process answer',
      };
    }
  }

  /**
   * Handle socket disconnection
   */
  async handleSocketDisconnection(
    sessionId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    try {
      const session = await this.sessionManager.getSessionInternal(sessionId);

      // Only process if session is still active
      if (!['inProgress', 'paused'].includes(session.status)) {
        return;
      }

      // Verify user owns this session
      if (session.userId.toString() !== userId) {
        return;
      }

      // Mark session as disconnected (starts grace period)
      await this.sessionManager.markSessionDisconnected(sessionId);

      this.logger.log(
        `Session ${sessionId} marked as disconnected. Reason: ${reason}`,
      );
    } catch (error) {
      this.logger.error(`Error in handleSocketDisconnection: ${error.message}`);
    }
  }

  /**
   * Get timer sync data
   */
  async getTimerSync(sessionId: string): Promise<any> {
    try {
      const status = await this.sessionManager.getSessionStatus(sessionId);

      return {
        timeRemaining: status.timeRemaining,
        serverTime: Date.now(),
        sessionStatus: status.status,
        sectionIndex: status.currentSectionIndex,
        isConnected: status.isConnected,
      };
    } catch (error) {
      this.logger.error(`Error in getTimerSync: ${error.message}`);
      return {
        timeRemaining: 0,
        serverTime: Date.now(),
        sessionStatus: 'unknown',
      };
    }
  }

  // ==========================================
  // PUBLIC API METHODS (for controller use)
  // ==========================================

  /**
   * Check if user has existing session to rejoin
   */
  async checkRejoinSession(user: RequestUser) {
    return this.sessionManager.checkRejoinSession(user);
  }

  /**
   * Create a new test session
   */
  async createSession(requestData: StartTestSessionDto, user: RequestUser) {
    return this.sessionManager.createSession(requestData, user);
  }

  /**
   * Get session with authorization check
   */
  async getSession(sessionId: string, user: RequestUser) {
    return this.sessionManager.getSession(sessionId, user);
  }

  /**
   * Get session for admin view
   */
  async getSessionForAdmin(sessionId: string, user: RequestUser) {
    return this.sessionManager.getSessionForAdmin(sessionId, user);
  }

  /**
   * List sessions with filters
   */
  async listSessions(filters: TestSessionFiltersDto, user: RequestUser) {
    return this.sessionManager.listSessions(filters, user);
  }

  /**
   * Get time sync data
   */
  async getTimeSync(sessionId: string, user: RequestUser) {
    return this.sessionManager.getTimeSync(sessionId, user);
  }

  /**
   * Navigate to a specific question
   */
  async navigateToQuestion(
    sessionId: string,
    questionIndex: number,
    user: RequestUser,
  ) {
    // Verify access first
    await this.sessionManager.getSession(sessionId, user);
    return this.questionHandler.navigateToQuestion(sessionId, questionIndex);
  }

  /**
   * Skip current question
   */
  async skipQuestion(sessionId: string, user: RequestUser) {
    // Verify access first
    await this.sessionManager.getSession(sessionId, user);
    return this.questionHandler.skipQuestion(sessionId);
  }

  /**
   * Start review phase for current section
   */
  async startReviewPhase(sessionId: string, user: RequestUser) {
    // Verify access first
    await this.sessionManager.getSession(sessionId, user);
    return this.questionHandler.startSectionReview(sessionId);
  }

  /**
   * Handle section completion - marks current section complete and moves to next
   * Uses atomic findOneAndUpdate to prevent race conditions
   */
  async handleSectionComplete(sessionId: string, userId: string): Promise<any> {
    try {
      // First, get session to validate and calculate next state
      const session = await this.testSessionModel.findById(sessionId);
      if (!session) {
        throw new NotFoundException('Test session not found');
      }

      // Verify ownership
      if (session.userId.toString() !== userId) {
        throw new ForbiddenException('Access denied');
      }

      // Verify session is active
      if (!['inProgress', 'paused'].includes(session.status)) {
        throw new BadRequestException('Session is not active');
      }

      // Verify this is a sectioned test
      if (!session.testSnapshot.settings.useSections) {
        throw new BadRequestException('This test does not use sections');
      }

      const currentSectionIndex = session.currentSectionIndex || 0;
      const totalSections = session.testSnapshot.sections.length;

      // Verify we're not already at the last section
      if (currentSectionIndex >= totalSections - 1) {
        throw new BadRequestException('Already at the last section');
      }

      // Calculate the first question index for the new section
      const nextSectionIndex = currentSectionIndex + 1;
      let firstQuestionIndex = 0;
      for (let i = 0; i < nextSectionIndex; i++) {
        firstQuestionIndex += session.testSnapshot.sections[i].questions.length;
      }

      // Atomic update - only succeeds if currentSectionIndex hasn't changed
      // This prevents race conditions from concurrent section completion requests
      const updatedSession = await this.testSessionModel.findOneAndUpdate(
        {
          _id: sessionId,
          userId: userId,
          currentSectionIndex: currentSectionIndex, // Only update if still on same section
          status: { $in: ['inProgress', 'paused'] },
        },
        {
          $addToSet: { completedSections: currentSectionIndex },
          $set: {
            currentSectionIndex: nextSectionIndex,
            currentQuestionIndex: firstQuestionIndex,
            lastServerAction: 'section_completed',
            lastServerActionAt: new Date(),
          },
        },
        { new: true },
      );

      if (!updatedSession) {
        // Another request already completed this section or state changed
        throw new BadRequestException('Section already completed or session state changed');
      }

      // Get the new section info
      const nextSection = updatedSession.testSnapshot.sections[nextSectionIndex];
      const timeRemaining = (updatedSession as any).calculateTimeRemaining?.() || null;

      return {
        success: true,
        data: {
          sectionIndex: nextSectionIndex,
          sectionName: nextSection.name || `Section ${nextSectionIndex + 1}`,
          totalQuestions: nextSection.questions.length,
          currentQuestionIndex: firstQuestionIndex,
          timeRemaining,
          completedSections: updatedSession.completedSections,
        },
      };
    } catch (error) {
      this.logger.error(`Error in handleSectionComplete: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      return {
        success: false,
        message: error.message || 'Failed to complete section',
      };
    }
  }

  /**
   * Check and handle expired sessions (for scheduled task)
   */
  async checkAndHandleExpiredSessions() {
    return this.sessionManager.checkAndHandleExpiredSessions();
  }

  // ==========================================
  // TEST SUBMISSION & GRADING
  // ==========================================

  /**
   * Submit test session for grading
   */
  async submitTestSession(
    sessionId: string,
    submitDto: SubmitTestDto,
    user: RequestUser,
  ): Promise<any> {
    const mongoSession = await this.connection.startSession();
    let transactionCommitted = false;

    try {
      mongoSession.startTransaction();

      const session = await this.testSessionModel.findById(sessionId).session(mongoSession);
      if (!session) {
        throw new NotFoundException('Test session not found');
      }

      // Validate access
      if (session.userId.toString() !== user.userId) {
        throw new ForbiddenException('Unauthorized to submit this test session');
      }

      if (session.status !== 'inProgress') {
        throw new BadRequestException('Test session is not in progress');
      }

      // Check section completion for sectioned tests
      if (session.testSnapshot.settings.useSections && !submitDto.forceSubmit) {
        const totalSections = session.testSnapshot.sections.length;
        const completedSectionsArray = session.completedSections || [];
        const currentSectionIndex = session.currentSectionIndex || 0;

        // Check if all sections are complete
        // The last section won't be in completedSections array (no "next" to move to)
        // So we check: all previous sections are complete AND user is on the last section
        const isOnLastSection = currentSectionIndex === totalSections - 1;
        const allPreviousSectionsComplete = completedSectionsArray.length === totalSections - 1;

        // Valid submission scenarios:
        // 1. All sections explicitly in completedSections (shouldn't happen but handle it)
        // 2. User is on last section and all previous sections are complete
        const canSubmit = completedSectionsArray.length >= totalSections ||
                         (isOnLastSection && allPreviousSectionsComplete);

        if (!canSubmit) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();

          return {
            success: false,
            error: 'All sections must be completed before final submission',
            completedSections: session.completedSections,
            totalSections,
            currentSectionIndex,
          };
        }

        // If we're on the last section and it's not in completedSections, add it
        if (isOnLastSection && !completedSectionsArray.includes(currentSectionIndex)) {
          session.completedSections = [...completedSectionsArray, currentSectionIndex];
        }
      }

      // Grade all questions
      const gradingResults = await this.gradeAllQuestions(session);

      // Update session with final results
      session.finalScore = gradingResults.finalScore;
      session.status = 'completed';
      session.completedAt = new Date();

      await session.save({ session: mongoSession });

      // Create Result document
      const result = await this.createResultDocument(session, gradingResults, mongoSession);

      // Update Test statistics
      await this.updateTestStatistics(session, gradingResults.finalScore, mongoSession);

      // Commit transaction
      await mongoSession.commitTransaction();
      transactionCommitted = true;

      return {
        success: true,
        sessionId: session._id,
        status: session.status,
        finalScore: session.finalScore,
        resultId: result._id,
        completedAt: session.completedAt,
        message: gradingResults.finalScore.passed
          ? 'Congratulations! You passed the test.'
          : 'Test completed. Better luck next time!',
      };
    } catch (error) {
      this.logger.error(`Error in submitTestSession for session ${sessionId}:`, error);

      if (!transactionCommitted) {
        try {
          await mongoSession.abortTransaction();
        } catch (abortError) {
          this.logger.error('Error aborting transaction:', abortError);
        }
      }
      throw error;
    } finally {
      mongoSession.endSession();
    }
  }

  /**
   * Grade all questions in the session
   */
  private async gradeAllQuestions(session: TestSessionDocument): Promise<any> {
    let totalEarnedPoints = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unansweredQuestions = 0;

    const gradeQuestion = async (question: any) => {
      // Check if question has been answered
      if (
        question.studentAnswer === null ||
        question.studentAnswer === undefined ||
        question.studentAnswer === ''
      ) {
        unansweredQuestions++;
        question.isCorrect = false;
        question.pointsEarned = 0;
        return;
      }

      let isCorrect = false;
      let pointsEarned = 0;

      switch (question.questionData.type) {
        case 'multipleChoice':
          isCorrect = this.gradeMultipleChoice(question);
          pointsEarned = isCorrect ? question.points : 0;
          break;

        case 'trueFalse':
          isCorrect = this.gradeTrueFalse(question);
          pointsEarned = isCorrect ? question.points : 0;
          break;

        case 'fillInTheBlank':
          const fibResult = await this.gradeFillInBlank(question);
          isCorrect = fibResult.isCorrect;
          pointsEarned = fibResult.pointsEarned;
          break;

        case 'codeChallenge':
        case 'codeDebugging':
          if (question.questionData.category === 'logic') {
            const codeResult = await this.gradeCodeQuestion(question);
            isCorrect = codeResult.isCorrect;
            pointsEarned = codeResult.pointsEarned;
          } else {
            isCorrect = false;
            pointsEarned = 0;
          }
          break;

        default:
          this.logger.warn(`Unknown question type: ${question.questionData.type}`);
          isCorrect = false;
          pointsEarned = 0;
      }

      question.isCorrect = isCorrect;
      question.pointsEarned = pointsEarned;

      totalEarnedPoints += pointsEarned;

      if (isCorrect) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    };

    // Grade all questions
    if (session.testSnapshot.settings.useSections) {
      for (const section of session.testSnapshot.sections) {
        for (const question of section.questions) {
          await gradeQuestion(question);
        }
      }
    } else {
      for (const question of session.testSnapshot.questions) {
        await gradeQuestion(question);
      }
    }

    // Calculate final score
    const totalPoints = session.testSnapshot.totalPoints;
    const percentage = totalPoints > 0 ? (totalEarnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= 70;

    const finalScore = {
      totalPoints,
      earnedPoints: totalEarnedPoints,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      passingThreshold: 70,
      totalQuestions: session.testSnapshot.totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
      totalTimeUsed: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    };

    return {
      finalScore,
      totalEarnedPoints,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
    };
  }

  private gradeMultipleChoice(question: any): boolean {
    const userAnswer = question.studentAnswer;
    const correctAnswer = question.questionData.correctAnswer;

    // Handle both numeric indices (0, 1, 2) and string answers ("A", "B", "C")
    const normalizeAnswer = (answer: any): string | number | null => {
      if (answer === null || answer === undefined) return null;
      if (typeof answer === 'number') return answer;
      if (typeof answer === 'string') {
        const trimmed = answer.trim();
        // Try parsing as number first
        const parsed = parseInt(trimmed, 10);
        if (!isNaN(parsed)) return parsed;
        // Return string (for "A", "B", "C" style answers) - case insensitive
        return trimmed.toUpperCase();
      }
      return null;
    };

    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);

    return normalizedUser !== null && normalizedCorrect !== null && normalizedUser === normalizedCorrect;
  }

  private gradeTrueFalse(question: any): boolean {
    const userAnswer = question.studentAnswer;
    const correctAnswer = question.questionData.correctAnswer;

    // True/False questions use options ['True', 'False']
    // correctAnswer is stored as index: 0 = True, 1 = False
    // Student answer can be: index (0/1), string index ('0'/'1'), or boolean/string boolean

    const normalizeToIndex = (answer: any): number | null => {
      if (answer === null || answer === undefined) return null;

      // Already a number (index)
      if (typeof answer === 'number') {
        return answer === 0 || answer === 1 ? answer : null;
      }

      // String - could be index or boolean word
      if (typeof answer === 'string') {
        const lower = answer.toLowerCase().trim();

        // Check for index strings first
        if (lower === '0') return 0;
        if (lower === '1') return 1;

        // Check for boolean words - map to indices
        // 'true' means they selected the True option (index 0)
        // 'false' means they selected the False option (index 1)
        if (['true', 'yes'].includes(lower)) return 0;
        if (['false', 'no'].includes(lower)) return 1;
      }

      // Boolean - map to index
      if (typeof answer === 'boolean') {
        return answer ? 0 : 1; // true → index 0, false → index 1
      }

      return null;
    };

    const normalizedUser = normalizeToIndex(userAnswer);
    const normalizedCorrect = normalizeToIndex(correctAnswer);

    return normalizedUser !== null && normalizedCorrect !== null && normalizedUser === normalizedCorrect;
  }

  private async gradeFillInBlank(question: any): Promise<{ isCorrect: boolean; pointsEarned: number; details?: any }> {
    if (!question.questionData.blanks || !question.studentAnswer) {
      return { isCorrect: false, pointsEarned: 0 };
    }

    try {
      const result = this.gradingService.gradeFillInBlanks(
        question.studentAnswer,
        question.questionData.blanks,
      );

      // Calculate partial credit based on correct blanks
      // Scale the earned points to the question's total points
      const partialCredit = result.totalPossiblePoints > 0
        ? (result.totalPoints / result.totalPossiblePoints) * question.points
        : 0;

      return {
        isCorrect: result.allCorrect,
        pointsEarned: Math.round(partialCredit * 100) / 100, // Round to 2 decimal places
        details: {
          blanks: result.results,
          correctCount: result.results.filter((r: any) => r.isCorrect).length,
          totalCount: result.results.length,
        },
      };
    } catch (error) {
      this.logger.error('Fill-in-blank grading error:', error);
      return { isCorrect: false, pointsEarned: 0 };
    }
  }

  private async gradeCodeQuestion(question: any): Promise<{ isCorrect: boolean; pointsEarned: number }> {
    if (!question.questionData.codeConfig || !question.questionData.testCases) {
      return { isCorrect: false, pointsEarned: 0 };
    }

    try {
      const result = await this.gradingService.runCodeTests({
        code: question.studentAnswer,
        language: question.questionData.language,
        testCases: question.questionData.testCases,
        runtime: question.questionData.codeConfig.runtime,
        entryFunction: question.questionData.codeConfig.entryFunction,
        timeoutMs: question.questionData.codeConfig.timeoutMs || 3000,
      });

      const isCorrect = result.success && result.overallPassed;
      return {
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      };
    } catch (error) {
      this.logger.error(`Error grading code question ${question.questionId}:`, error);
      return { isCorrect: false, pointsEarned: 0 };
    }
  }

  private async createResultDocument(session: any, gradingResults: any, mongoSession: any): Promise<any> {
    let questionNumber = 1;

    const questions = session.testSnapshot.settings.useSections
      ? session.testSnapshot.sections.flatMap((section: any, sectionIndex: number) =>
          section.questions.map((question: any) => ({
            questionId: question.questionId,
            questionNumber: questionNumber++,
            sectionIndex,
            sectionName: section.name || `Section ${sectionIndex + 1}`,
            title: question.questionData.title || '',
            type: question.questionData.type || '',
            language: question.questionData.language || '',
            category: question.questionData.category || '',
            difficulty: question.questionData.difficulty || 'medium',
            answer: question.studentAnswer,
            studentAnswer: question.studentAnswer,
            isCorrect: question.isCorrect || false,
            pointsAwarded: question.pointsEarned || 0,
            pointsEarned: question.pointsEarned || 0,
            pointsPossible: question.points || 0,
            timeSpent: question.timeSpentOnQuestion || 0,
          })),
        )
      : session.testSnapshot.questions.map((question: any) => ({
          questionId: question.questionId,
          questionNumber: questionNumber++,
          sectionIndex: 0,
          title: question.questionData.title || '',
          type: question.questionData.type || '',
          language: question.questionData.language || '',
          category: question.questionData.category || '',
          difficulty: question.questionData.difficulty || 'medium',
          answer: question.studentAnswer,
          studentAnswer: question.studentAnswer,
          isCorrect: question.isCorrect || false,
          pointsAwarded: question.pointsEarned || 0,
          pointsEarned: question.pointsEarned || 0,
          pointsPossible: question.points || 0,
          timeSpent: question.timeSpentOnQuestion || 0,
        }));

    const resultData = {
      sessionId: session._id,
      testId: session.testSnapshot.originalTestId || session.testId,
      userId: session.userId,
      organizationId: session.organizationId,
      attemptNumber: session.attemptNumber,
      status: 'completed',
      score: gradingResults.finalScore,
      questions,
      timeSpent: gradingResults.finalScore.totalTimeUsed,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    };

    const result = new this.resultModel(resultData);
    await result.save({ session: mongoSession });
    return result;
  }

  private async updateTestStatistics(session: any, finalScore: any, mongoSession: any): Promise<void> {
    try {
      const testId = session.testSnapshot.originalTestId || session.testId;
      
      await this.testModel.findByIdAndUpdate(
        testId,
        {
          $inc: {
            'stats.totalAttempts': 1,
            'stats.totalCompleted': 1,
          },
          $push: {
            'stats.scores': {
              $each: [finalScore.percentage],
              $slice: -100, // Keep last 100 scores
            },
          },
        },
        { session: mongoSession },
      );
    } catch (error) {
      this.logger.warn('Error updating test statistics:', error);
      // Don't throw - stats update is not critical
    }
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId: string, user: RequestUser): Promise<any> {
    const sessionData = await this.sessionManager.getSessionForAdmin(sessionId, user);

    if (!sessionData.success) {
      throw new NotFoundException('Session not found');
    }

    const session = sessionData.session;

    // Build question analytics
    const questionAnalytics = this.buildQuestionAnalytics(session);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(session);

    // Calculate engagement metrics
    const engagementMetrics = this.calculateEngagementMetrics(session);

    return {
      success: true,
      sessionInfo: {
        sessionId: session.id,
        testId: session.testId,
        testTitle: session.testTitle,
        userId: session.userId,
        organizationId: session.organizationId,
        attemptNumber: session.attemptNumber,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        timeSpent: this.calculateTimeSpent(session),
      },
      questionAnalytics,
      performanceMetrics,
      engagementMetrics,
      sectionAnalytics: session.testSnapshot?.settings?.useSections
        ? this.buildSectionAnalytics(session)
        : null,
      scoringAnalytics: session.finalScore || null,
    };
  }

  /**
   * Get class analytics
   */
  async getClassAnalytics(
    filters: { testId?: string; orgId?: string; userId?: string; status?: string; limit?: number },
    user: RequestUser,
  ): Promise<any> {
    const { testId, orgId, status, limit = 100 } = filters;

    const query: any = {};

    // Apply organization filter
    if (!user.isSuperOrgAdmin) {
      query.organizationId = user.organizationId;
    } else if (orgId) {
      query.organizationId = orgId;
    }

    if (testId) query['testSnapshot.originalTestId'] = testId;
    if (status) query.status = status;

    const sessions = await this.testSessionModel
      .find(query)
      .sort({ completedAt: -1 })
      .limit(limit)
      .lean();

    // Calculate class-level metrics
    const completedSessions = sessions.filter((s) => s.status === 'completed');

    const scores = completedSessions
      .filter((s: any) => s.finalScore?.percentage !== undefined)
      .map((s: any) => s.finalScore.percentage);

    return {
      success: true,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      inProgressSessions: sessions.filter((s) => s.status === 'inProgress').length,
      metrics: {
        averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
        passRate:
          completedSessions.length > 0
            ? (completedSessions.filter((s: any) => s.finalScore?.passed).length / completedSessions.length) * 100
            : 0,
      },
      sessions: sessions.slice(0, 20).map((s: any) => ({
        sessionId: s._id,
        userId: s.userId,
        status: s.status,
        score: s.finalScore?.percentage,
        passed: s.finalScore?.passed,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      })),
    };
  }

  /**
   * Get test analytics
   */
  async getTestAnalytics(testId: string, user: RequestUser): Promise<any> {
    const query: any = {
      'testSnapshot.originalTestId': testId,
      status: 'completed',
    };

    if (!user.isSuperOrgAdmin) {
      query.organizationId = user.organizationId;
    }

    const sessions = await this.testSessionModel.find(query).lean();

    if (sessions.length === 0) {
      return {
        success: true,
        testId,
        totalAttempts: 0,
        metrics: null,
        message: 'No completed sessions found for this test',
      };
    }

    const scores = sessions
      .filter((s: any) => s.finalScore?.percentage !== undefined)
      .map((s: any) => s.finalScore.percentage);

    const timesSpent = sessions
      .filter((s: any) => s.finalScore?.totalTimeUsed !== undefined)
      .map((s: any) => s.finalScore.totalTimeUsed);

    return {
      success: true,
      testId,
      totalAttempts: sessions.length,
      metrics: {
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        medianScore: this.calculateMedian(scores),
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
        standardDeviation: this.calculateStandardDeviation(scores),
        passRate:
          (sessions.filter((s: any) => s.finalScore?.passed).length / sessions.length) * 100,
        averageTimeSpent:
          timesSpent.length > 0 ? timesSpent.reduce((a, b) => a + b, 0) / timesSpent.length : 0,
      },
      distribution: this.calculateScoreDistribution(scores),
    };
  }

  // Analytics helper methods
  private buildQuestionAnalytics(session: any): any[] {
    const questions = session.testSnapshot?.settings?.useSections
      ? session.testSnapshot.sections.flatMap((s: any) => s.questions)
      : session.testSnapshot?.questions || [];

    return questions.map((q: any, index: number) => ({
      questionIndex: index,
      questionId: q.questionId,
      type: q.questionData?.type,
      answered: q.studentAnswer !== null && q.studentAnswer !== undefined,
      isCorrect: q.isCorrect,
      pointsEarned: q.pointsEarned || 0,
      pointsPossible: q.points || 0,
      timeSpent: q.timeSpentOnQuestion || 0,
      viewCount: q.viewCount || 0,
    }));
  }

  private calculatePerformanceMetrics(session: any): any {
    const questions = session.testSnapshot?.settings?.useSections
      ? session.testSnapshot.sections.flatMap((s: any) => s.questions)
      : session.testSnapshot?.questions || [];

    const answered = questions.filter((q: any) => q.studentAnswer !== null && q.studentAnswer !== undefined);
    const correct = questions.filter((q: any) => q.isCorrect);

    return {
      totalQuestions: questions.length,
      answeredQuestions: answered.length,
      correctAnswers: correct.length,
      accuracy: questions.length > 0 ? (correct.length / questions.length) * 100 : 0,
      completionRate: questions.length > 0 ? (answered.length / questions.length) * 100 : 0,
    };
  }

  private calculateEngagementMetrics(session: any): any {
    const questions = session.testSnapshot?.settings?.useSections
      ? session.testSnapshot.sections.flatMap((s: any) => s.questions)
      : session.testSnapshot?.questions || [];

    const timeSpents = questions.map((q: any) => q.timeSpentOnQuestion || 0);
    const viewCounts = questions.map((q: any) => q.viewCount || 0);

    return {
      totalTimeSpent: timeSpents.reduce((a: number, b: number) => a + b, 0),
      averageTimePerQuestion: questions.length > 0 ? timeSpents.reduce((a: number, b: number) => a + b, 0) / questions.length : 0,
      totalViews: viewCounts.reduce((a: number, b: number) => a + b, 0),
      averageViewsPerQuestion: questions.length > 0 ? viewCounts.reduce((a: number, b: number) => a + b, 0) / questions.length : 0,
    };
  }

  private buildSectionAnalytics(session: any): any[] {
    return (session.testSnapshot?.sections || []).map((section: any, index: number) => ({
      sectionIndex: index,
      sectionName: section.name,
      totalQuestions: section.questions?.length || 0,
      answeredQuestions: section.questions?.filter((q: any) => q.studentAnswer !== null && q.studentAnswer !== undefined).length || 0,
      correctAnswers: section.questions?.filter((q: any) => q.isCorrect).length || 0,
      isCompleted: session.completedSections?.includes(index),
    }));
  }

  private calculateTimeSpent(session: any): number {
    if (!session.startedAt) return 0;
    const endTime = session.completedAt || new Date();
    return Math.floor((endTime.getTime() - session.startedAt.getTime()) / 1000);
  }

  private calculateMedian(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateStandardDeviation(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squaredDiffs = arr.map((x) => Math.pow(x - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / arr.length);
  }

  private calculateScoreDistribution(scores: number[]): any {
    const ranges = [
      { label: '0-59', min: 0, max: 59, count: 0 },
      { label: '60-69', min: 60, max: 69, count: 0 },
      { label: '70-79', min: 70, max: 79, count: 0 },
      { label: '80-89', min: 80, max: 89, count: 0 },
      { label: '90-100', min: 90, max: 100, count: 0 },
    ];

    scores.forEach((score) => {
      const range = ranges.find((r) => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }
}