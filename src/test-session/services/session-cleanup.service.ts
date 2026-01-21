// src/test-session/services/session-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestSession, TestSessionDocument } from '../../schemas/test-session.schema';

/**
 * SessionCleanupService handles automated cleanup of stale test sessions
 * 
 * Requires @nestjs/schedule to be installed and configured:
 * 1. npm install @nestjs/schedule
 * 2. Add ScheduleModule.forRoot() to AppModule imports
 */
@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(
    @InjectModel(TestSession.name) private testSessionModel: Model<TestSessionDocument>,
  ) {}

  /**
   * Run every hour to clean up stale sessions
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStaleSessions(): Promise<void> {
    this.logger.log('Running stale session cleanup...');

    try {
      const results = await Promise.all([
        this.expireAbandonedSessions(),
        this.expireOldPausedSessions(),
        this.markTimedOutSessions(),
      ]);

      const [abandoned, paused, timedOut] = results;
      
      if (abandoned > 0 || paused > 0 || timedOut > 0) {
        this.logger.log(
          `Cleanup complete: ${abandoned} abandoned, ${paused} paused->abandoned, ${timedOut} timed out`,
        );
      }
    } catch (error) {
      this.logger.error('Error during session cleanup:', error.message);
    }
  }

  /**
   * Mark sessions that have been disconnected for more than 24 hours as abandoned
   */
  private async expireAbandonedSessions(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await this.testSessionModel.updateMany(
      {
        status: 'paused',
        disconnectedAt: { $lt: twentyFourHoursAgo },
        completedAt: null,
      },
      {
        $set: {
          status: 'abandoned',
          completedAt: new Date(),
        },
      },
    );

    return result.modifiedCount;
  }

  /**
   * Expire sessions where grace period has passed and they're still paused
   * (Backup for if grace period handler didn't run)
   */
  private async expireOldPausedSessions(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await this.testSessionModel.updateMany(
      {
        status: 'paused',
        disconnectedAt: { $lt: oneHourAgo },
        gracePeriodExpired: { $ne: true },
        completedAt: null,
      },
      {
        $set: {
          gracePeriodExpired: true,
          status: 'abandoned',
          completedAt: new Date(),
        },
      },
    );

    return result.modifiedCount;
  }

  /**
   * Mark sessions that should have timed out based on their time limits
   */
  private async markTimedOutSessions(): Promise<number> {
    // Find in-progress sessions and check if they've exceeded their time limit
    const activeSessions = await this.testSessionModel.find({
      status: 'inProgress',
      completedAt: null,
    });

    let expiredCount = 0;

    for (const session of activeSessions) {
      try {
        const timeRemaining = (session as any).calculateTimeRemaining?.() ?? 0;
        
        if (timeRemaining <= 0) {
          session.status = 'expired';
          session.completedAt = new Date();
          await session.save();
          expiredCount++;
          
          this.logger.debug(`Marked session ${session._id} as expired (time limit exceeded)`);
        }
      } catch (error) {
        this.logger.warn(`Error checking session ${session._id}:`, error.message);
      }
    }

    return expiredCount;
  }

  /**
   * Manual cleanup method (can be called from admin endpoint)
   */
  async runManualCleanup(): Promise<{
    abandoned: number;
    paused: number;
    timedOut: number;
  }> {
    const [abandoned, paused, timedOut] = await Promise.all([
      this.expireAbandonedSessions(),
      this.expireOldPausedSessions(),
      this.markTimedOutSessions(),
    ]);

    return { abandoned, paused, timedOut };
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<{
    inProgress: number;
    paused: number;
    pausedOver24h: number;
    completed: number;
    abandoned: number;
    expired: number;
  }> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [inProgress, paused, pausedOver24h, completed, abandoned, expired] =
      await Promise.all([
        this.testSessionModel.countDocuments({ status: 'inProgress' }),
        this.testSessionModel.countDocuments({ status: 'paused' }),
        this.testSessionModel.countDocuments({
          status: 'paused',
          disconnectedAt: { $lt: twentyFourHoursAgo },
        }),
        this.testSessionModel.countDocuments({ status: 'completed' }),
        this.testSessionModel.countDocuments({ status: 'abandoned' }),
        this.testSessionModel.countDocuments({ status: 'expired' }),
      ]);

    return {
      inProgress,
      paused,
      pausedOver24h,
      completed,
      abandoned,
      expired,
    };
  }
}