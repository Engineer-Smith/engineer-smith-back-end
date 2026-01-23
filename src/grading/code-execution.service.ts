import { Injectable, Logger } from '@nestjs/common';
import { GradingService } from './grading.service';
import { CodeScannerService, SecurityMetrics } from './security/code-scanner.service';
import { GradingResult, RunCodeTestsDto, Runtime } from './dto';

export type Priority = 'high' | 'normal';

export interface ExecuteCodeParams extends RunCodeTestsDto {
  priority?: Priority;
}

export interface ExecuteCodeResult extends GradingResult {
  queueTimeMs: number;
  queuePosition?: number;
}

interface QueuedJob {
  id: string;
  params: RunCodeTestsDto;
  priority: Priority;
  runtime: Runtime;
  queuedAt: number;
  resolve: (result: ExecuteCodeResult) => void;
  reject: (error: Error) => void;
}

export interface QueueMetrics {
  currentQueueDepth: number;
  currentRunning: number;
  runningByLanguage: Record<string, number>;
  totalJobsProcessed: number;
  totalJobsQueued: number;
  totalJobsImmediate: number;
  averageWaitTimeMs: number;
  maxWaitTimeMs: number;
  highPriorityProcessed: number;
  normalPriorityProcessed: number;
  totalTimeouts: number;
  totalErrors: number;
  lastJobProcessedAt: Date | null;
  serviceStartedAt: Date;
  security: SecurityMetrics;
}

export interface QueueStatus {
  queueDepth: number;
  running: number;
  avgWaitMs: number;
  healthy: boolean;
}

@Injectable()
export class CodeExecutionService {
  private readonly logger = new Logger(CodeExecutionService.name);

  // Queue configuration
  private readonly MAX_CONCURRENT_TOTAL = 8;
  private readonly MAX_CONCURRENT_PER_LANGUAGE = 3;
  private readonly UNHEALTHY_QUEUE_DEPTH = 20;
  private readonly UNHEALTHY_WAIT_TIME_MS = 10000;

  // State
  private readonly highPriorityQueue: QueuedJob[] = [];
  private readonly normalPriorityQueue: QueuedJob[] = [];
  private readonly runningByRuntime: Map<Runtime, number> = new Map();
  private runningTotal = 0;
  private jobCounter = 0;

  // Metrics
  private totalJobsProcessed = 0;
  private totalJobsQueued = 0;
  private totalJobsImmediate = 0;
  private highPriorityProcessed = 0;
  private normalPriorityProcessed = 0;
  private totalTimeouts = 0;
  private totalErrors = 0;
  private maxWaitTimeMs = 0;
  private lastJobProcessedAt: Date | null = null;
  private readonly serviceStartedAt = new Date();
  private readonly recentWaitTimes: number[] = [];
  private readonly MAX_RECENT_WAIT_TIMES = 100;

  constructor(
    private readonly gradingService: GradingService,
    private readonly codeScannerService: CodeScannerService,
  ) {
    // Initialize runtime counters
    Object.values(Runtime).forEach((runtime) => {
      this.runningByRuntime.set(runtime, 0);
    });
  }

  /**
   * Execute code with queue management
   */
  async executeCode(params: ExecuteCodeParams): Promise<ExecuteCodeResult> {
    const { priority = 'normal', ...runCodeParams } = params;
    const runtime = runCodeParams.runtime;

    // Security scan FIRST - before queueing
    const scanResult = this.codeScannerService.scan(
      runCodeParams.code,
      runCodeParams.language,
    );

    if (!scanResult.safe) {
      this.logger.warn(
        `Code rejected for ${runCodeParams.language}: ${scanResult.violations.join(', ')}`,
      );

      return {
        success: false,
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests: runCodeParams.testCases?.length || 0,
        consoleLogs: [],
        executionError: `Code contains prohibited patterns: ${scanResult.violations.join('; ')}`,
        compilationError: null,
        queueTimeMs: 0,
      };
    }

    // Check if we can execute immediately
    if (this.canExecuteImmediately(runtime)) {
      this.totalJobsImmediate++;
      return this.executeNow(runCodeParams, priority, 0);
    }

    // Queue the job
    this.totalJobsQueued++;
    const queuePosition = this.getQueuePosition(priority);

    if (queuePosition > 10) {
      this.logger.warn(
        `Queue depth warning: ${queuePosition} jobs waiting (priority: ${priority}, runtime: ${runtime})`,
      );
    }

    return new Promise<ExecuteCodeResult>((resolve, reject) => {
      const job: QueuedJob = {
        id: `job-${++this.jobCounter}`,
        params: runCodeParams,
        priority,
        runtime,
        queuedAt: Date.now(),
        resolve,
        reject,
      };

      if (priority === 'high') {
        this.highPriorityQueue.push(job);
      } else {
        this.normalPriorityQueue.push(job);
      }
    });
  }

  /**
   * Check if a job can execute immediately
   */
  private canExecuteImmediately(runtime: Runtime): boolean {
    const currentForRuntime = this.runningByRuntime.get(runtime) || 0;
    return (
      this.runningTotal < this.MAX_CONCURRENT_TOTAL &&
      currentForRuntime < this.MAX_CONCURRENT_PER_LANGUAGE
    );
  }

  /**
   * Get current queue position for a new job
   */
  private getQueuePosition(priority: Priority): number {
    if (priority === 'high') {
      return this.highPriorityQueue.length + 1;
    }
    return this.highPriorityQueue.length + this.normalPriorityQueue.length + 1;
  }

  /**
   * Execute a job immediately
   */
  private async executeNow(
    params: RunCodeTestsDto,
    priority: Priority,
    waitTimeMs: number,
  ): Promise<ExecuteCodeResult> {
    const runtime = params.runtime;

    // Acquire slot
    this.runningTotal++;
    this.runningByRuntime.set(
      runtime,
      (this.runningByRuntime.get(runtime) || 0) + 1,
    );

    try {
      const result = await this.gradingService.runCodeTests(params);

      // Record metrics
      this.totalJobsProcessed++;
      if (priority === 'high') {
        this.highPriorityProcessed++;
      } else {
        this.normalPriorityProcessed++;
      }
      this.lastJobProcessedAt = new Date();
      this.recordWaitTime(waitTimeMs);

      if (result.executionError?.includes('timed out')) {
        this.totalTimeouts++;
      }

      return {
        ...result,
        queueTimeMs: waitTimeMs,
      };
    } catch (error) {
      this.totalErrors++;
      throw error;
    } finally {
      // Release slot
      this.runningTotal--;
      this.runningByRuntime.set(
        runtime,
        (this.runningByRuntime.get(runtime) || 0) - 1,
      );

      // Process next job in queue
      this.processNextJob();
    }
  }

  /**
   * Process the next job in the queue
   */
  private processNextJob(): void {
    // Try high priority first
    let job = this.findExecutableJob(this.highPriorityQueue);

    // Then normal priority
    if (!job) {
      job = this.findExecutableJob(this.normalPriorityQueue);
    }

    if (job) {
      const waitTimeMs = Date.now() - job.queuedAt;
      if (waitTimeMs > this.maxWaitTimeMs) {
        this.maxWaitTimeMs = waitTimeMs;
      }

      this.executeNow(job.params, job.priority, waitTimeMs)
        .then(job.resolve)
        .catch(job.reject);
    }
  }

  /**
   * Find an executable job from the queue (respecting per-language limits)
   */
  private findExecutableJob(queue: QueuedJob[]): QueuedJob | null {
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i];
      if (this.canExecuteImmediately(job.runtime)) {
        queue.splice(i, 1);
        return job;
      }
    }
    return null;
  }

  /**
   * Record wait time for rolling average
   */
  private recordWaitTime(ms: number): void {
    this.recentWaitTimes.push(ms);
    if (this.recentWaitTimes.length > this.MAX_RECENT_WAIT_TIMES) {
      this.recentWaitTimes.shift();
    }
  }

  /**
   * Calculate average wait time from recent samples
   */
  private calculateAverageWaitTime(): number {
    if (this.recentWaitTimes.length === 0) return 0;
    const sum = this.recentWaitTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.recentWaitTimes.length);
  }

  /**
   * Get full metrics (for admin)
   */
  getMetrics(): QueueMetrics {
    const runningByLanguage: Record<string, number> = {};
    this.runningByRuntime.forEach((count, runtime) => {
      runningByLanguage[runtime] = count;
    });

    return {
      currentQueueDepth:
        this.highPriorityQueue.length + this.normalPriorityQueue.length,
      currentRunning: this.runningTotal,
      runningByLanguage,
      totalJobsProcessed: this.totalJobsProcessed,
      totalJobsQueued: this.totalJobsQueued,
      totalJobsImmediate: this.totalJobsImmediate,
      averageWaitTimeMs: this.calculateAverageWaitTime(),
      maxWaitTimeMs: this.maxWaitTimeMs,
      highPriorityProcessed: this.highPriorityProcessed,
      normalPriorityProcessed: this.normalPriorityProcessed,
      totalTimeouts: this.totalTimeouts,
      totalErrors: this.totalErrors,
      lastJobProcessedAt: this.lastJobProcessedAt,
      serviceStartedAt: this.serviceStartedAt,
      security: this.codeScannerService.getSecurityMetrics(),
    };
  }

  /**
   * Get lightweight status (for frequent polling)
   */
  getStatus(): QueueStatus {
    const queueDepth =
      this.highPriorityQueue.length + this.normalPriorityQueue.length;
    const avgWaitMs = this.calculateAverageWaitTime();

    return {
      queueDepth,
      running: this.runningTotal,
      avgWaitMs,
      healthy:
        queueDepth < this.UNHEALTHY_QUEUE_DEPTH &&
        avgWaitMs < this.UNHEALTHY_WAIT_TIME_MS,
    };
  }

  /**
   * Reset metrics (for admin)
   */
  resetMetrics(): { message: string } {
    this.totalJobsProcessed = 0;
    this.totalJobsQueued = 0;
    this.totalJobsImmediate = 0;
    this.highPriorityProcessed = 0;
    this.normalPriorityProcessed = 0;
    this.totalTimeouts = 0;
    this.totalErrors = 0;
    this.maxWaitTimeMs = 0;
    this.recentWaitTimes.length = 0;

    this.logger.log('Queue metrics reset');
    return { message: 'Metrics reset successfully' };
  }
}
