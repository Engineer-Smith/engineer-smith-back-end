// src/test-session/services/session-manager.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TestSession, TestSessionDocument } from '../../schemas/test-session.schema';
import { Test, TestDocument } from '../../schemas/test.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Organization, OrganizationDocument } from '../../schemas/organization.schema';
import { SnapshotService } from './snapshot.service';
import { StartTestSessionDto, TestSessionFiltersDto } from '../dto/test-session.dto';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class SessionManagerService {
  private readonly logger = new Logger(SessionManagerService.name);

  constructor(
    @InjectModel(TestSession.name) private testSessionModel: Model<TestSessionDocument>,
    @InjectModel(Test.name) private testModel: Model<TestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
    private snapshotService: SnapshotService,
  ) {}

  /**
   * Internal methods (no auth) - for server use only
   */

  async getSessionInternal(sessionId: string): Promise<TestSessionDocument> {
    const session = await this.testSessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Test session not found');
    }
    return session;
  }

  async markSessionConnected(sessionId: string): Promise<TestSessionDocument> {
    const session = await this.getSessionInternal(sessionId);
    (session as any).markConnected();
    await session.save();
    return session;
  }

  async markSessionDisconnected(sessionId: string): Promise<TestSessionDocument> {
    const session = await this.getSessionInternal(sessionId);
    (session as any).markDisconnected();
    await session.save();
    return session;
  }

  async updateConnectionState(
    sessionId: string,
    isConnected: boolean,
    graceTimerId: string | null = null,
  ): Promise<TestSessionDocument> {
    const session = await this.getSessionInternal(sessionId);

    if (isConnected) {
      (session as any).markConnected();
    } else {
      (session as any).markDisconnected();
      if (graceTimerId) {
        session.graceTimerId = graceTimerId;
      }
    }

    await session.save();
    return session;
  }

  async getSessionStatus(sessionId: string): Promise<any> {
    const session = await this.getSessionInternal(sessionId);

    return {
      sessionId: session._id,
      status: session.status,
      isConnected: session.isConnected,
      currentSectionIndex: session.currentSectionIndex,
      currentQuestionIndex: session.currentQuestionIndex,
      timeRemaining: (session as any).calculateTimeRemaining(),
      useSections: session.testSnapshot.settings.useSections,
      isLastQuestion: (session as any).isLastQuestionInSection(),
      isLastSection: (session as any).isLastSection(),
    };
  }

  /**
   * Attempt to recover a corrupted session by rebuilding its testSnapshot
   * Returns true if recovery succeeded, false otherwise
   */
  private async attemptSessionRecovery(
    session: TestSessionDocument,
    userId: string,
  ): Promise<boolean> {
    try {
      // Check if we have a testId to recover from
      if (!session.testId) {
        this.logger.error(`Cannot recover session ${session._id}: no testId found`);
        return false;
      }

      // Fetch the original test with populated questions
      const test = await this.testModel
        .findById(session.testId)
        .populate({
          path: 'sections.questions.questionId',
          model: 'Question',
        })
        .populate({
          path: 'questions.questionId',
          model: 'Question',
        });

      if (!test) {
        this.logger.error(
          `Cannot recover session ${session._id}: test ${session.testId} no longer exists`,
        );
        return false;
      }

      // Rebuild the test snapshot
      const testSnapshot = await this.snapshotService.createTestSnapshot(test, userId);

      // Initialize section statuses for sectioned tests
      if (test.settings.useSections && testSnapshot.sections) {
        testSnapshot.sections.forEach((section: any, index: number) => {
          // Preserve progress: mark sections up to current as in_progress or completed
          if (index < session.currentSectionIndex) {
            section.status = 'submitted';
            section.startedAt = session.startedAt;
            section.submittedAt = new Date();
          } else if (index === session.currentSectionIndex) {
            section.status = 'in_progress';
            section.startedAt = session.currentSectionStartedAt || session.startedAt;
            section.submittedAt = null;
          } else {
            section.status = 'not_started';
            section.startedAt = null;
            section.submittedAt = null;
          }
        });
      }

      // Update the session with the recovered snapshot
      session.testSnapshot = testSnapshot;

      // Reset the question index to 0 for the current section since question order may have changed
      // This is safer than assuming the old index is valid
      session.currentQuestionIndex = 0;

      await session.save();

      this.logger.log(
        `Successfully recovered session ${session._id} for user ${userId}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to recover session ${session._id}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Public API methods (with auth) - for controller use
   */

  async checkRejoinSession(user: RequestUser): Promise<any> {
    const existingSession = await this.testSessionModel.findOne({
      userId: user.userId,
      status: { $in: ['inProgress', 'paused'] },
    });

    if (!existingSession) {
      return {
        success: true,
        canRejoin: false,
        message: 'No active session found',
      };
    }

    // Check if session is actually completed despite paused status
    if (existingSession.completedAt) {
      return {
        success: true,
        canRejoin: false,
        message: 'Previous session was completed',
      };
    }

    // Check for corrupted session (missing testSnapshot or settings)
    if (!existingSession.testSnapshot || !existingSession.testSnapshot.settings) {
      this.logger.warn(
        `Corrupted session found for user ${user.userId}, attempting recovery: ${existingSession._id}`,
      );

      // Attempt to recover the session by rebuilding the snapshot
      const recovered = await this.attemptSessionRecovery(existingSession, user.userId);

      if (!recovered) {
        // Recovery failed - mark as 'failed' (doesn't count against attempts)
        existingSession.status = 'failed';
        existingSession.completedAt = new Date();
        await existingSession.save();

        return {
          success: true,
          canRejoin: false,
          message: 'Previous session could not be recovered due to a technical issue. This will not count against your attempts.',
        };
      }

      // Recovery succeeded - reload the session to get fresh data
      const refreshedSession = await this.testSessionModel.findById(existingSession._id);
      if (!refreshedSession) {
        return {
          success: true,
          canRejoin: false,
          message: 'Session recovery failed unexpectedly',
        };
      }

      // Continue with the recovered session
      Object.assign(existingSession, refreshedSession.toObject());
    }

    const timeRemaining = (existingSession as any).calculateTimeRemaining();

    if (timeRemaining <= 0) {
      // Session expired - mark as expired
      existingSession.status = 'expired';
      existingSession.completedAt = new Date();
      await existingSession.save();

      return {
        success: true,
        canRejoin: false,
        message: 'Previous session expired and was auto-submitted',
      };
    }

    // Session is still active and can be rejoined
    return {
      success: true,
      canRejoin: true,
      sessionId: existingSession._id,
      timeRemaining,
      testInfo: {
        title: existingSession.testSnapshot?.title || 'Unknown Test',
        description: existingSession.testSnapshot?.description || '',
        totalQuestions: existingSession.testSnapshot?.totalQuestions || 0,
        totalPoints: existingSession.testSnapshot?.totalPoints || 0,
        useSections: existingSession.testSnapshot?.settings?.useSections || false,
        currentQuestionIndex: existingSession.currentQuestionIndex,
        answeredQuestions: existingSession.answeredQuestions?.length || 0,
        completedSections: existingSession.completedSections?.length || 0,
      },
      message: 'Active session found - you can rejoin or abandon it',
    };
  }

  async createSession(requestData: StartTestSessionDto, user: RequestUser): Promise<any> {
    const { testId, forceNew = false } = requestData;

    if (!testId) {
      throw new BadRequestException('Test ID is required');
    }

    // Check for existing session first (unless forcing new)
    if (!forceNew) {
      const existingCheck = await this.checkRejoinSession(user);

      if (existingCheck.canRejoin) {
        throw new ConflictException({
          message: 'You have an active test session. Please rejoin or abandon it first.',
          code: 'EXISTING_SESSION_FOUND',
          existingSession: {
            sessionId: existingCheck.sessionId,
            testTitle: existingCheck.testInfo.title,
            timeRemaining: existingCheck.timeRemaining,
            questionProgress: `${existingCheck.testInfo.answeredQuestions}/${existingCheck.testInfo.totalQuestions}`,
          },
        });
      }
    }

    // If forceNew is true, handle existing session
    if (forceNew) {
      const existingSession = await this.testSessionModel.findOne({
        userId: user.userId,
        status: { $in: ['inProgress', 'paused'] },
      });

      if (existingSession) {
        existingSession.status = 'abandoned';
        existingSession.completedAt = new Date();
        await existingSession.save();
      }
    }

    // Get populated test
    const test = await this.testModel
      .findById(testId)
      .populate({
        path: 'sections.questions.questionId',
        model: 'Question',
      })
      .populate({
        path: 'questions.questionId',
        model: 'Question',
      });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Validate user can start this test
    this.snapshotService.validateTestAccess(test, user);

    // Check if user has unlimited attempts (e.g., demo accounts)
    const userDoc = await this.userModel.findById(user.userId).select('unlimitedAttempts');
    const hasUnlimitedAttempts = userDoc?.unlimitedAttempts === true;

    // Check attempt limit (only count completed, abandoned, expired - not failed)
    // Skip this check for users with unlimited attempts
    if (!hasUnlimitedAttempts) {
      const countedAttempts = await this.testSessionModel.countDocuments({
        $or: [{ 'testSnapshot.originalTestId': testId }, { testId: testId }],
        userId: user.userId,
        status: { $in: ['completed', 'abandoned', 'expired'] },
      });

      if (countedAttempts >= test.settings.attemptsAllowed) {
        throw new ForbiddenException('Maximum attempts reached');
      }
    }

    // Find the highest attempt number for this user/test (regardless of status)
    // This prevents duplicate key errors when failed sessions exist
    const lastSession = await this.testSessionModel
      .findOne({
        $or: [{ 'testSnapshot.originalTestId': testId }, { testId: testId }],
        userId: user.userId,
      })
      .sort({ attemptNumber: -1 })
      .select('attemptNumber');

    const nextAttemptNumber = (lastSession?.attemptNumber || 0) + 1;

    // Create test snapshot with randomization
    const testSnapshot = await this.snapshotService.createTestSnapshot(test, user.userId);

    // Initialize section statuses for sectioned tests
    if (test.settings.useSections && testSnapshot.sections) {
      testSnapshot.sections.forEach((section: any, index: number) => {
        section.status = index === 0 ? 'in_progress' : 'not_started';
        section.startedAt = index === 0 ? new Date() : null;
        section.submittedAt = null;
      });
    }

    // Create session
    const now = new Date();
    const session = new this.testSessionModel({
      testId: test._id,
      userId: user.userId,
      organizationId: user.organizationId,
      attemptNumber: nextAttemptNumber,
      status: 'inProgress',
      startedAt: now,
      isConnected: true,
      lastConnectedAt: now,
      currentSectionIndex: 0,
      currentSectionStartedAt: test.settings.useSections ? now : null,
      currentQuestionIndex: 0,
      answeredQuestions: [],
      completedSections: [],
      sectionStartTimes: test.settings.useSections ? [now] : [],
      sectionTimeUsed: test.settings.useSections ? [0] : [],
      sessionPhase: 'question',
      lastServerAction: 'session_created',
      lastServerActionAt: now,
      testSnapshot,
      finalScore: {
        totalPoints: testSnapshot.totalPoints,
        earnedPoints: 0,
        percentage: 0,
        passed: false,
        passingThreshold: 70,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unansweredQuestions: testSnapshot.totalQuestions,
        totalTimeUsed: 0,
      },
    });

    await session.save();

    // Return session info
    return {
      sessionId: session._id,
      testTitle: testSnapshot.title,
      testDescription: testSnapshot.description,
      totalQuestions: testSnapshot.totalQuestions,
      totalPoints: testSnapshot.totalPoints,
      timeRemaining: (session as any).calculateTimeRemaining(),
      currentQuestionIndex: 0,
      currentSectionIndex: test.settings.useSections ? 0 : undefined,
      answeredQuestions: 0,
      useSections: test.settings.useSections,
      status: 'inProgress',
      attemptNumber: session.attemptNumber,
      attemptsAllowed: test.settings.attemptsAllowed,
    };
  }

  async rejoinSession(sessionId: string, userId: string): Promise<any> {
    const session = await this.getSessionInternal(sessionId);

    // Verify ownership
    if (session.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized to access this session');
    }

    // Check if session can be rejoined
    if (!['inProgress', 'paused'].includes(session.status)) {
      throw new BadRequestException(`Cannot rejoin session with status: ${session.status}`);
    }

    const timeRemaining = (session as any).calculateTimeRemaining();

    if (timeRemaining <= 0) {
      session.status = 'expired';
      session.completedAt = new Date();
      await session.save();
      throw new BadRequestException('Session has expired');
    }

    // Mark as connected
    (session as any).markConnected();
    session.status = 'inProgress';
    await session.save();

    return {
      sessionId: session._id,
      testTitle: session.testSnapshot.title,
      testDescription: session.testSnapshot.description,
      totalQuestions: session.testSnapshot.totalQuestions,
      totalPoints: session.testSnapshot.totalPoints,
      timeRemaining,
      currentQuestionIndex: session.currentQuestionIndex,
      currentSectionIndex: session.testSnapshot.settings.useSections
        ? session.currentSectionIndex
        : undefined,
      answeredQuestions: session.answeredQuestions?.length || 0,
      useSections: session.testSnapshot.settings.useSections,
      status: session.status,
      attemptNumber: session.attemptNumber,
    };
  }

  async abandonSession(sessionId: string, userId: string): Promise<any> {
    const session = await this.getSessionInternal(sessionId);

    // Verify ownership
    if (session.userId.toString() !== userId) {
      throw new ForbiddenException('Unauthorized to access this session');
    }

    // Check if session can be abandoned
    if (!['inProgress', 'paused'].includes(session.status)) {
      throw new BadRequestException(`Cannot abandon session with status: ${session.status}`);
    }

    session.status = 'abandoned';
    session.completedAt = new Date();
    await session.save();

    return {
      success: true,
      message: 'Session abandoned successfully',
      sessionId: session._id,
    };
  }

  async getSession(sessionId: string, user: RequestUser): Promise<TestSessionDocument> {
    const session = await this.getSessionInternal(sessionId);

    // Students can only access their own sessions
    if (user.role === 'student' && session.userId.toString() !== user.userId) {
      throw new ForbiddenException('Unauthorized to access this session');
    }

    // Non-superOrg admins can only access sessions in their organization
    if (
      !user.isSuperOrgAdmin &&
      user.role !== 'student' &&
      session.organizationId.toString() !== user.organizationId
    ) {
      throw new ForbiddenException('Unauthorized to access this session');
    }

    return session;
  }

  async getSessionForAdmin(sessionId: string, user: RequestUser): Promise<any> {
    const session = await this.getSession(sessionId, user);

    // Return limited data for students viewing their own sessions
    if (user.role === 'student' && session.userId.toString() === user.userId) {
      return {
        success: true,
        sessionId: session._id,
        testTitle: session.testSnapshot.title,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        attemptNumber: session.attemptNumber,
        finalScore: session.finalScore,
      };
    }

    // Return full data for instructors/admins
    return {
      success: true,
      session: {
        id: session._id,
        testId: session.testSnapshot.originalTestId,
        testTitle: session.testSnapshot.title,
        userId: session.userId,
        organizationId: session.organizationId,
        attemptNumber: session.attemptNumber,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        testSnapshot: session.testSnapshot,
        currentSectionIndex: session.currentSectionIndex,
        completedSections: session.completedSections,
        currentQuestionIndex: session.currentQuestionIndex,
        answeredQuestions: session.answeredQuestions,
        finalScore: session.finalScore,
        isConnected: session.isConnected,
        sessionPhase: session.sessionPhase,
        lastServerAction: session.lastServerAction,
      },
    };
  }

  async listSessions(filters: TestSessionFiltersDto, user: RequestUser): Promise<any[]> {
    const { userId, testId, orgId, status, limit = 10, skip = 0 } = filters;

    let query: any = {};

    if (user.isSuperOrgAdmin) {
      // Super org admins can access any organization's sessions
      if (userId) query.userId = userId;
      if (testId) query['testSnapshot.originalTestId'] = testId;
      if (orgId) query.organizationId = orgId;
      if (status) query.status = status;
    } else if (user.role === 'admin' || user.role === 'instructor') {
      // Admins and instructors can only access sessions in their own organization
      if (orgId && orgId !== user.organizationId) {
        throw new ForbiddenException('Unauthorized to access sessions for this organization');
      }
      query.organizationId = user.organizationId;
      if (userId) query.userId = userId;
      if (testId) query['testSnapshot.originalTestId'] = testId;
      if (status) query.status = status;
    } else {
      // Students can only see their own sessions
      query.userId = user.userId;
      if (testId) query['testSnapshot.originalTestId'] = testId;
      if (status) query.status = status;
    }

    const sessions = await this.testSessionModel
      .find(query)
      .populate({
        path: 'userId',
        select: 'loginId firstName lastName email',
        model: 'User',
      })
      .populate({
        path: 'organizationId',
        select: 'name',
        model: 'Organization',
      })
      .skip(skip)
      .limit(limit)
      .select(
        'testSnapshot userId organizationId attemptNumber status startedAt completedAt finalScore isConnected lastConnectedAt currentQuestionIndex answeredQuestions completedSections currentSectionIndex',
      )
      .sort({ startedAt: -1 });

    return sessions.map((session) => {
      let userName: string, userEmail: string, userIdValue: any;
      let organizationName: string, organizationIdValue: any;

      const sessionUserId = session.userId as any;
      const sessionOrgId = session.organizationId as any;

      if (typeof sessionUserId === 'object' && sessionUserId !== null && sessionUserId._id) {
        userIdValue = sessionUserId._id;
        userName =
          sessionUserId.fullName ||
          `${sessionUserId.firstName || ''} ${sessionUserId.lastName || ''}`.trim() ||
          sessionUserId.loginId ||
          `User ${sessionUserId._id?.toString().slice(-6) || 'Unknown'}`;
        userEmail = sessionUserId.email || `${sessionUserId.loginId || 'unknown'}@example.com`;
      } else {
        userIdValue = sessionUserId;
        userName = `User ${sessionUserId?.toString().slice(-6) || 'Unknown'}`;
        userEmail = `user-${sessionUserId?.toString().slice(-6) || 'unknown'}@example.com`;
      }

      if (typeof sessionOrgId === 'object' && sessionOrgId !== null && sessionOrgId._id) {
        organizationIdValue = sessionOrgId._id;
        organizationName = sessionOrgId.name || 'Unknown Organization';
      } else {
        organizationIdValue = sessionOrgId;
        organizationName = sessionOrgId
          ? `Org ${sessionOrgId.toString().slice(-6)}`
          : 'Independent';
      }

      return {
        _id: session._id,
        testId: session.testSnapshot.originalTestId,
        testTitle: session.testSnapshot.title,
        userId: userIdValue,
        userName,
        userEmail,
        organizationId: organizationIdValue,
        organizationName,
        attemptNumber: session.attemptNumber,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        finalScore: session.finalScore,
        isConnected: session.isConnected,
        lastConnectedAt: session.lastConnectedAt,
        currentQuestionIndex: session.currentQuestionIndex,
        answeredQuestions: session.answeredQuestions,
        completedSections: session.completedSections,
        currentSectionIndex: session.currentSectionIndex,
        testSnapshot: session.testSnapshot,
      };
    });
  }

  async getTimeSync(sessionId: string, user: RequestUser): Promise<any> {
    if (!sessionId || sessionId === 'undefined' || typeof sessionId !== 'string') {
      throw new BadRequestException('Valid session ID is required');
    }

    if (sessionId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(sessionId)) {
      throw new BadRequestException('Invalid session ID format');
    }

    const session = await this.getSession(sessionId, user);

    const serverTime = Date.now();
    const startTime = new Date(session.startedAt).getTime();
    const elapsedSeconds = Math.floor((serverTime - startTime) / 1000);
    const timeRemainingSeconds = (session as any).calculateTimeRemaining();

    const response: any = {
      success: true,
      serverTime,
      startTime,
      elapsedSeconds,
      timeRemainingSeconds,
      timeLimitMinutes: session.testSnapshot.settings.timeLimit,
      sessionStatus: session.status,
      isConnected: session.isConnected,
    };

    // Add section timing info for sectioned tests
    if (session.testSnapshot.settings.useSections) {
      response.sectionInfo = {
        currentSectionIndex: session.currentSectionIndex,
        sectionTimeRemaining: timeRemainingSeconds,
        currentSectionName: session.testSnapshot.sections[session.currentSectionIndex]?.name,
        sectionsCompleted: session.completedSections.length,
        totalSections: session.testSnapshot.sections.length,
      };
    }

    return response;
  }

  async checkAndHandleExpiredSessions(): Promise<any> {
    try {
      const inProgressSessions = await this.testSessionModel.find({
        status: { $in: ['inProgress', 'paused'] },
      });

      let expiredCount = 0;

      for (const session of inProgressSessions) {
        const timeRemaining = (session as any).calculateTimeRemaining();

        if (timeRemaining <= 0) {
          session.status = 'expired';
          session.completedAt = new Date();
          await session.save();
          expiredCount++;
        }
      }

      return {
        success: true,
        expiredSessionsHandled: expiredCount,
      };
    } catch (error) {
      console.error('Error checking for expired sessions:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}