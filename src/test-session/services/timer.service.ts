// src/test-session/services/timer.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

interface TimerInfo {
  timer: NodeJS.Timeout | null;
  startedAt: number;
  timeRemaining: number;
  sectionIndex: number;
  isPaused: boolean;
  pausedAt: number | null;
}

interface WarningTimer {
  timeoutId: NodeJS.Timeout;
  secondsRemaining: number;
}

@Injectable()
export class TimerService implements OnModuleDestroy {
  private readonly logger = new Logger(TimerService.name);

  // Active section timers: sessionId -> TimerInfo
  private activeTimers: Map<string, TimerInfo> = new Map();

  // Periodic sync intervals: sessionId -> interval
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Grace period timers: sessionId -> timer
  private graceTimers: Map<string, NodeJS.Timeout> = new Map();

  // Warning timers: sessionId -> WarningTimer[]
  private warningTimers: Map<string, WarningTimer[]> = new Map();

  // Callbacks storage for reconnection scenarios
  private expirationCallbacks: Map<string, (sessionId: string) => void> = new Map();
  private syncCallbacks: Map<string, (sessionId: string, timeRemaining: number, type?: string, message?: string) => void> = new Map();
  private graceCallbacks: Map<string, (sessionId: string) => void> = new Map();

  /**
   * Clean up all timers on module destroy
   */
  onModuleDestroy() {
    this.cleanup();
  }

  /**
   * Start a section timer for the given session
   */
  startSectionTimer(
    sessionId: string,
    timeRemainingMs: number,
    sectionIndex: number,
    onExpiration: (sessionId: string) => void,
    onSync?: (sessionId: string, timeRemaining: number, type?: string, message?: string) => void,
  ): void {
    this.logger.debug(`Starting timer for session ${sessionId}, ${Math.floor(timeRemainingMs / 1000)}s remaining`);

    // Store callbacks for potential reconnection
    this.expirationCallbacks.set(sessionId, onExpiration);
    if (onSync) {
      this.syncCallbacks.set(sessionId, onSync);
    }

    // Clear any existing timer
    this.clearTimer(sessionId);

    if (timeRemainingMs <= 0) {
      // Already expired - call expiration immediately
      this.logger.debug(`Timer for session ${sessionId} already expired`);
      setImmediate(() => this.safeCallback(() => onExpiration(sessionId)));
      return;
    }

    // Set up the main expiration timer
    const timer = setTimeout(() => {
      this.logger.debug(`Timer expired for session ${sessionId}`);
      this.clearTimer(sessionId);
      this.safeCallback(() => onExpiration(sessionId));
    }, timeRemainingMs);

    // Store timer info
    this.activeTimers.set(sessionId, {
      timer,
      startedAt: Date.now(),
      timeRemaining: timeRemainingMs,
      sectionIndex,
      isPaused: false,
      pausedAt: null,
    });

    // Set up warning timers
    this.setupWarningTimers(sessionId, timeRemainingMs, onSync);

    // Start periodic sync if callback provided
    if (onSync) {
      this.startPeriodicSync(sessionId, onSync);
    }
  }

  /**
   * Set up warning timers at 5min, 1min, 30sec
   */
  private setupWarningTimers(
    sessionId: string,
    timeRemainingMs: number,
    onSync?: (sessionId: string, timeRemaining: number, type?: string, message?: string) => void,
  ): void {
    if (!onSync) return;

    const warnings: WarningTimer[] = [];
    const warningPoints = [
      { seconds: 300, message: '5 minutes remaining' },
      { seconds: 60, message: '1 minute remaining' },
      { seconds: 30, message: '30 seconds remaining' },
    ];

    for (const warning of warningPoints) {
      const warningMs = warning.seconds * 1000;
      const delayMs = timeRemainingMs - warningMs;

      if (delayMs > 0) {
        const timeoutId = setTimeout(() => {
          this.safeCallback(() => onSync(sessionId, warning.seconds, 'warning', warning.message));
        }, delayMs);

        warnings.push({ timeoutId, secondsRemaining: warning.seconds });
      }
    }

    this.warningTimers.set(sessionId, warnings);
  }

  /**
   * Clear warning timers
   */
  private clearWarningTimers(sessionId: string): void {
    const warnings = this.warningTimers.get(sessionId);
    if (warnings) {
      for (const warning of warnings) {
        clearTimeout(warning.timeoutId);
      }
      this.warningTimers.delete(sessionId);
    }
  }

  /**
   * Pause the timer for disconnection grace period
   */
  pauseTimer(sessionId: string): number {
    const timerInfo = this.activeTimers.get(sessionId);
    if (!timerInfo || timerInfo.isPaused) {
      return 0;
    }

    this.logger.debug(`Pausing timer for session ${sessionId}`);

    // Calculate remaining time
    const timeElapsed = Date.now() - timerInfo.startedAt;
    const timeRemaining = Math.max(0, timerInfo.timeRemaining - timeElapsed);

    // Clear the running timer
    if (timerInfo.timer) {
      clearTimeout(timerInfo.timer);
    }

    // Update timer info to paused state
    this.activeTimers.set(sessionId, {
      ...timerInfo,
      timer: null,
      timeRemaining,
      isPaused: true,
      pausedAt: Date.now(),
    });

    // Stop periodic sync and warnings
    this.stopPeriodicSync(sessionId);
    this.clearWarningTimers(sessionId);

    return timeRemaining;
  }

  /**
   * Resume the timer after reconnection
   */
  resumeTimer(
    sessionId: string,
    onExpiration?: (sessionId: string) => void,
    onSync?: (sessionId: string, timeRemaining: number, type?: string, message?: string) => void,
  ): boolean {
    const timerInfo = this.activeTimers.get(sessionId);
    if (!timerInfo || !timerInfo.isPaused) {
      return false;
    }

    // Use stored callbacks if not provided
    const expCallback = onExpiration || this.expirationCallbacks.get(sessionId);
    const syncCallback = onSync || this.syncCallbacks.get(sessionId);

    if (!expCallback) {
      this.logger.warn(`Cannot resume timer for ${sessionId} - no expiration callback`);
      return false;
    }

    this.logger.debug(`Resuming timer for session ${sessionId}, ${Math.floor(timerInfo.timeRemaining / 1000)}s remaining`);

    const timeRemaining = timerInfo.timeRemaining;

    if (timeRemaining <= 0) {
      // Timer expired while paused
      this.clearTimer(sessionId);
      setImmediate(() => this.safeCallback(() => expCallback(sessionId)));
      return true;
    }

    // Restart timer with remaining time
    const timer = setTimeout(() => {
      this.logger.debug(`Resumed timer expired for session ${sessionId}`);
      this.clearTimer(sessionId);
      this.safeCallback(() => expCallback(sessionId));
    }, timeRemaining);

    // Update timer info
    this.activeTimers.set(sessionId, {
      ...timerInfo,
      timer,
      startedAt: Date.now(),
      timeRemaining,
      isPaused: false,
      pausedAt: null,
    });

    // Restart warning timers
    this.setupWarningTimers(sessionId, timeRemaining, syncCallback);

    // Restart periodic sync
    if (syncCallback) {
      this.startPeriodicSync(sessionId, syncCallback);
    }

    return true;
  }

  /**
   * Get current time remaining for a session (in seconds)
   */
  getTimeRemaining(sessionId: string): number {
    const timerInfo = this.activeTimers.get(sessionId);
    if (!timerInfo) return 0;

    if (timerInfo.isPaused) {
      return Math.floor(timerInfo.timeRemaining / 1000);
    }

    const timeElapsed = Date.now() - timerInfo.startedAt;
    const timeRemaining = Math.max(0, timerInfo.timeRemaining - timeElapsed);

    return Math.floor(timeRemaining / 1000);
  }

  /**
   * Check if timer is paused
   */
  isTimerPaused(sessionId: string): boolean {
    const timerInfo = this.activeTimers.get(sessionId);
    return timerInfo?.isPaused || false;
  }

  /**
   * Check if session has an active timer
   */
  hasActiveTimer(sessionId: string): boolean {
    return this.activeTimers.has(sessionId);
  }

  /**
   * Start periodic sync (every 30 seconds)
   */
  private startPeriodicSync(
    sessionId: string,
    onSync: (sessionId: string, timeRemaining: number, type?: string, message?: string) => void,
  ): void {
    // Clear any existing sync
    this.stopPeriodicSync(sessionId);

    const syncInterval = setInterval(() => {
      const timerInfo = this.activeTimers.get(sessionId);
      if (!timerInfo || timerInfo.isPaused) {
        this.stopPeriodicSync(sessionId);
        return;
      }

      const timeRemaining = this.getTimeRemaining(sessionId);
      this.safeCallback(() => onSync(sessionId, timeRemaining));
    }, 30000); // 30 seconds

    this.syncIntervals.set(sessionId, syncInterval);
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(sessionId: string): void {
    const syncInterval = this.syncIntervals.get(sessionId);
    if (syncInterval) {
      clearInterval(syncInterval);
      this.syncIntervals.delete(sessionId);
    }
  }

  /**
   * Start grace period for disconnection
   */
  startGracePeriod(
    sessionId: string,
    onGraceExpired: (sessionId: string) => void,
    gracePeriodMs: number = 5 * 60 * 1000,
  ): void {
    this.logger.debug(`Starting grace period for session ${sessionId}, ${gracePeriodMs / 1000}s`);

    // Store callback
    this.graceCallbacks.set(sessionId, onGraceExpired);

    // Clear any existing grace timer
    this.clearGracePeriod(sessionId);

    const graceTimer = setTimeout(() => {
      this.logger.debug(`Grace period expired for session ${sessionId}`);
      this.clearGracePeriod(sessionId);
      this.safeCallback(() => onGraceExpired(sessionId));
    }, gracePeriodMs);

    this.graceTimers.set(sessionId, graceTimer);
  }

  /**
   * Clear grace period (student reconnected)
   */
  clearGracePeriod(sessionId: string): void {
    const graceTimer = this.graceTimers.get(sessionId);
    if (graceTimer) {
      clearTimeout(graceTimer);
      this.graceTimers.delete(sessionId);
    }
    this.graceCallbacks.delete(sessionId);
  }

  /**
   * Check if session is in grace period
   */
  isInGracePeriod(sessionId: string): boolean {
    return this.graceTimers.has(sessionId);
  }

  /**
   * Clear all timers for a session
   */
  clearTimer(sessionId: string): void {
    // Clear main timer
    const timerInfo = this.activeTimers.get(sessionId);
    if (timerInfo?.timer) {
      clearTimeout(timerInfo.timer);
    }
    this.activeTimers.delete(sessionId);

    // Clear callbacks
    this.expirationCallbacks.delete(sessionId);
    this.syncCallbacks.delete(sessionId);

    // Clear sync interval
    this.stopPeriodicSync(sessionId);

    // Clear warning timers
    this.clearWarningTimers(sessionId);

    // Clear grace timer
    this.clearGracePeriod(sessionId);
  }

  /**
   * Get timer status for debugging
   */
  getTimerStatus(sessionId: string): any {
    const timerInfo = this.activeTimers.get(sessionId);
    const hasSync = this.syncIntervals.has(sessionId);
    const hasGrace = this.graceTimers.has(sessionId);

    if (!timerInfo) {
      return {
        hasTimer: false,
        hasSync,
        hasGrace,
      };
    }

    return {
      hasTimer: true,
      sectionIndex: timerInfo.sectionIndex,
      isPaused: timerInfo.isPaused,
      timeRemaining: this.getTimeRemaining(sessionId),
      hasSync,
      hasGrace,
    };
  }

  /**
   * Get all active sessions (for monitoring)
   */
  getActiveSessions(): string[] {
    return Array.from(this.activeTimers.keys());
  }

  /**
   * Force expire a timer (for testing/admin)
   */
  forceExpire(sessionId: string): void {
    const callback = this.expirationCallbacks.get(sessionId);
    this.clearTimer(sessionId);
    if (callback) {
      setImmediate(() => this.safeCallback(() => callback(sessionId)));
    }
  }

  /**
   * Cleanup all timers (for server shutdown)
   */
  cleanup(): void {
    this.logger.log('Cleaning up all timers...');

    // Clear all active timers
    for (const [sessionId, timerInfo] of this.activeTimers) {
      if (timerInfo.timer) {
        clearTimeout(timerInfo.timer);
      }
    }
    this.activeTimers.clear();

    // Clear all sync intervals
    for (const interval of this.syncIntervals.values()) {
      clearInterval(interval);
    }
    this.syncIntervals.clear();

    // Clear all grace timers
    for (const timer of this.graceTimers.values()) {
      clearTimeout(timer);
    }
    this.graceTimers.clear();

    // Clear all warning timers
    for (const warnings of this.warningTimers.values()) {
      for (const warning of warnings) {
        clearTimeout(warning.timeoutId);
      }
    }
    this.warningTimers.clear();

    // Clear callbacks
    this.expirationCallbacks.clear();
    this.syncCallbacks.clear();
    this.graceCallbacks.clear();

    this.logger.log('Timer cleanup complete');
  }

  /**
   * Safely execute a callback, catching any errors
   */
  private safeCallback(callback: () => void): void {
    try {
      callback();
    } catch (error) {
      this.logger.error('Error in timer callback:', error);
    }
  }
}