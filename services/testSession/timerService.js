// /services/testSession/timerService.js
const TestSession = require('../../models/TestSession');

class TimerService {
  constructor() {
    // Active section timers: sessionId -> { timer, startedAt, timeRemaining, sectionIndex }
    this.activeTimers = new Map();
    
    // Periodic sync intervals: sessionId -> interval
    this.syncIntervals = new Map();
    
    // Grace period timers: sessionId -> timer
    this.graceTimers = new Map();
    
    console.log('TimerService initialized');
  }

  /**
   * Start a section timer for the given session
   * @param {string} sessionId - Session ID
   * @param {number} timeRemainingMs - Time remaining in milliseconds
   * @param {number} sectionIndex - Current section index
   * @param {function} onExpiration - Callback when timer expires
   * @param {function} onSync - Callback for periodic sync (optional)
   */
  async startSectionTimer(sessionId, timeRemainingMs, sectionIndex, onExpiration, onSync = null) {
    console.log(`Starting section timer for ${sessionId}: ${timeRemainingMs}ms remaining, section ${sectionIndex}`);
    
    // Clear any existing timer
    this.clearTimer(sessionId);
    
    if (timeRemainingMs <= 0) {
      // Already expired - call expiration immediately
      console.log(`Timer already expired for ${sessionId}, calling expiration handler`);
      setImmediate(() => onExpiration(sessionId));
      return;
    }
    
    // Set up the main expiration timer
    const timer = setTimeout(() => {
      console.log(`Section timer expired for ${sessionId}`);
      this.clearTimer(sessionId);
      onExpiration(sessionId);
    }, timeRemainingMs);
    
    // Store timer info
    this.activeTimers.set(sessionId, {
      timer,
      startedAt: Date.now(),
      timeRemaining: timeRemainingMs,
      sectionIndex,
      isPaused: false
    });
    
    // Start periodic sync if callback provided
    if (onSync) {
      this.startPeriodicSync(sessionId, onSync);
    }
    
    console.log(`Section timer started for ${sessionId}`);
  }

  /**
   * Pause the timer for disconnection grace period
   * @param {string} sessionId - Session ID
   * @returns {number} Time remaining when paused (ms)
   */
  pauseTimer(sessionId) {
    const timerInfo = this.activeTimers.get(sessionId);
    if (!timerInfo || timerInfo.isPaused) {
      console.log(`No active timer to pause for ${sessionId}`);
      return 0;
    }
    
    // Calculate remaining time
    const timeElapsed = Date.now() - timerInfo.startedAt;
    const timeRemaining = Math.max(0, timerInfo.timeRemaining - timeElapsed);
    
    // Clear the running timer
    clearTimeout(timerInfo.timer);
    
    // Update timer info to paused state
    this.activeTimers.set(sessionId, {
      ...timerInfo,
      timer: null,
      timeRemaining,
      isPaused: true,
      pausedAt: Date.now()
    });
    
    // Stop periodic sync
    this.stopPeriodicSync(sessionId);
    
    console.log(`Timer paused for ${sessionId}: ${Math.floor(timeRemaining / 1000)}s remaining`);
    return timeRemaining;
  }

  /**
   * Resume the timer after reconnection
   * @param {string} sessionId - Session ID  
   * @param {function} onExpiration - Callback when timer expires
   * @param {function} onSync - Callback for periodic sync (optional)
   * @returns {boolean} Success
   */
  resumeTimer(sessionId, onExpiration, onSync = null) {
    const timerInfo = this.activeTimers.get(sessionId);
    if (!timerInfo || !timerInfo.isPaused) {
      console.log(`No paused timer to resume for ${sessionId}`);
      return false;
    }
    
    const timeRemaining = timerInfo.timeRemaining;
    
    if (timeRemaining <= 0) {
      // Timer expired while paused
      console.log(`Timer expired while paused for ${sessionId}, calling expiration handler`);
      this.clearTimer(sessionId);
      setImmediate(() => onExpiration(sessionId));
      return true;
    }
    
    // Restart timer with remaining time
    const timer = setTimeout(() => {
      console.log(`Section timer expired for ${sessionId} (after resume)`);
      this.clearTimer(sessionId);
      onExpiration(sessionId);
    }, timeRemaining);
    
    // Update timer info
    this.activeTimers.set(sessionId, {
      ...timerInfo,
      timer,
      startedAt: Date.now(),
      timeRemaining,
      isPaused: false,
      pausedAt: null
    });
    
    // Restart periodic sync
    if (onSync) {
      this.startPeriodicSync(sessionId, onSync);
    }
    
    console.log(`Timer resumed for ${sessionId}: ${Math.floor(timeRemaining / 1000)}s remaining`);
    return true;
  }

  /**
   * Get current time remaining for a session
   * @param {string} sessionId - Session ID
   * @returns {number} Time remaining in seconds
   */
  getTimeRemaining(sessionId) {
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
   * Start periodic sync (every 30 seconds)
   * @param {string} sessionId - Session ID
   * @param {function} onSync - Callback for sync
   */
  startPeriodicSync(sessionId, onSync) {
    // Clear any existing sync
    this.stopPeriodicSync(sessionId);
    
    const syncInterval = setInterval(() => {
      const timerInfo = this.activeTimers.get(sessionId);
      if (!timerInfo || timerInfo.isPaused) {
        this.stopPeriodicSync(sessionId);
        return;
      }
      
      const timeRemaining = this.getTimeRemaining(sessionId);
      
      // Send sync update
      onSync(sessionId, timeRemaining);
      
      // Send warnings at 5 minutes and 1 minute
      if (timeRemaining === 300) { // 5 minutes
        onSync(sessionId, timeRemaining, 'warning', '5 minutes remaining in this section');
      } else if (timeRemaining === 60) { // 1 minute
        onSync(sessionId, timeRemaining, 'warning', '1 minute remaining in this section');
      }
      
    }, 30000); // 30 seconds
    
    this.syncIntervals.set(sessionId, syncInterval);
    console.log(`Started periodic sync for ${sessionId}`);
  }

  /**
   * Stop periodic sync
   * @param {string} sessionId - Session ID
   */
  stopPeriodicSync(sessionId) {
    const syncInterval = this.syncIntervals.get(sessionId);
    if (syncInterval) {
      clearInterval(syncInterval);
      this.syncIntervals.delete(sessionId);
      console.log(`Stopped periodic sync for ${sessionId}`);
    }
  }

  /**
   * Start grace period for disconnection
   * @param {string} sessionId - Session ID
   * @param {function} onGraceExpired - Callback when grace period expires
   * @param {number} gracePeriodMs - Grace period in ms (default 5 minutes)
   */
  startGracePeriod(sessionId, onGraceExpired, gracePeriodMs = 5 * 60 * 1000) {
    console.log(`Starting grace period for ${sessionId}: ${gracePeriodMs / 1000}s`);
    
    // Clear any existing grace timer
    this.clearGracePeriod(sessionId);
    
    const graceTimer = setTimeout(() => {
      console.log(`Grace period expired for ${sessionId}`);
      this.clearGracePeriod(sessionId);
      onGraceExpired(sessionId);
    }, gracePeriodMs);
    
    this.graceTimers.set(sessionId, graceTimer);
  }

  /**
   * Clear grace period (student reconnected)
   * @param {string} sessionId - Session ID
   */
  clearGracePeriod(sessionId) {
    const graceTimer = this.graceTimers.get(sessionId);
    if (graceTimer) {
      clearTimeout(graceTimer);
      this.graceTimers.delete(sessionId);
      console.log(`Cleared grace period for ${sessionId}`);
    }
  }

  /**
   * Clear all timers for a session
   * @param {string} sessionId - Session ID
   */
  clearTimer(sessionId) {
    // Clear main timer
    const timerInfo = this.activeTimers.get(sessionId);
    if (timerInfo && timerInfo.timer) {
      clearTimeout(timerInfo.timer);
    }
    this.activeTimers.delete(sessionId);
    
    // Clear sync interval
    this.stopPeriodicSync(sessionId);
    
    // Clear grace timer
    this.clearGracePeriod(sessionId);
    
    console.log(`Cleared all timers for ${sessionId}`);
  }

  /**
   * Get timer status for debugging
   * @param {string} sessionId - Session ID
   * @returns {object} Timer status
   */
  getTimerStatus(sessionId) {
    const timerInfo = this.activeTimers.get(sessionId);
    const hasSync = this.syncIntervals.has(sessionId);
    const hasGrace = this.graceTimers.has(sessionId);
    
    if (!timerInfo) {
      return {
        hasTimer: false,
        hasSync,
        hasGrace
      };
    }
    
    return {
      hasTimer: true,
      sectionIndex: timerInfo.sectionIndex,
      isPaused: timerInfo.isPaused,
      timeRemaining: this.getTimeRemaining(sessionId),
      hasSync,
      hasGrace
    };
  }

  /**
   * Cleanup all timers (for server shutdown)
   */
  cleanup() {
    console.log('Cleaning up TimerService...');
    
    // Clear all active timers
    for (const [sessionId, timerInfo] of this.activeTimers) {
      if (timerInfo.timer) {
        clearTimeout(timerInfo.timer);
      }
    }
    this.activeTimers.clear();
    
    // Clear all sync intervals
    for (const [sessionId, interval] of this.syncIntervals) {
      clearInterval(interval);
    }
    this.syncIntervals.clear();
    
    // Clear all grace timers
    for (const [sessionId, timer] of this.graceTimers) {
      clearTimeout(timer);
    }
    this.graceTimers.clear();
    
    console.log('TimerService cleanup complete');
  }

  /**
   * Get all active sessions (for monitoring)
   * @returns {Array} List of active session IDs
   */
  getActiveSessions() {
    return Array.from(this.activeTimers.keys());
  }

  /**
   * Force expire a timer (for testing/admin)
   * @param {string} sessionId - Session ID
   * @param {function} onExpiration - Expiration callback
   */
  forceExpire(sessionId, onExpiration) {
    console.log(`Force expiring timer for ${sessionId}`);
    this.clearTimer(sessionId);
    setImmediate(() => onExpiration(sessionId));
  }
}

// Export singleton instance
module.exports = new TimerService();