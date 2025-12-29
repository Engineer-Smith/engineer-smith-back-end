// /models/UserTrackProgress.js - Track user progress through learning tracks
const { Schema, model } = require('mongoose');

const userTrackProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  trackId: {
    type: Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },

  // Enrollment and completion
  enrolledAt: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: ['enrolled', 'in_progress', 'completed', 'paused'],
    default: 'enrolled'
  },

  completedAt: Date,
  
  // Progress tracking
  challengesCompleted: [{
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'CodeChallenge'
    },
    completedAt: Date,
    language: String, // Which language they solved it in
    attempts: Number,
    timeSpent: Number // in seconds
  }],

  currentChallengeIndex: {
    type: Number,
    default: 0
  },

  // Statistics
  totalChallenges: { type: Number, default: 0 },
  completedChallenges: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 },
  
  totalTimeSpent: { type: Number, default: 0 }, // in seconds
  estimatedTimeRemaining: { type: Number, default: 0 }, // in seconds

  // User feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  reviewedAt: Date,

  // Achievements/milestones
  achievements: [{
    type: String,
    unlockedAt: Date
  }],

  // Learning streak
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index - one progress record per user per track
userTrackProgressSchema.index({ userId: 1, trackId: 1 }, { unique: true });

// Other indexes
userTrackProgressSchema.index({ userId: 1, status: 1 });
userTrackProgressSchema.index({ userId: 1, progressPercentage: -1 });
userTrackProgressSchema.index({ trackId: 1, status: 1 });
userTrackProgressSchema.index({ completedAt: 1 });

// Pre-save middleware
userTrackProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update progress percentage
  if (this.totalChallenges > 0) {
    this.progressPercentage = Math.round((this.completedChallenges / this.totalChallenges) * 100);
  }
  
  // Update status based on progress
  if (this.progressPercentage === 100 && this.status !== 'completed') {
    this.status = 'completed';
    if (!this.completedAt) {
      this.completedAt = Date.now();
    }
  } else if (this.progressPercentage > 0 && this.status === 'enrolled') {
    this.status = 'in_progress';
  }
  
  next();
});

// Instance methods
userTrackProgressSchema.methods.recordChallengeCompletion = function(challengeId, language, attempts, timeSpent) {
  // Check if already completed
  const existingCompletion = this.challengesCompleted.find(
    c => c.challengeId.toString() === challengeId.toString()
  );
  
  if (!existingCompletion) {
    this.challengesCompleted.push({
      challengeId,
      completedAt: Date.now(),
      language,
      attempts,
      timeSpent
    });
    
    this.completedChallenges++;
    this.currentChallengeIndex++;
  }
  
  if (timeSpent) {
    this.totalTimeSpent += timeSpent;
  }
  
  // Update activity streak
  this.updateStreak();
  
  return this.save();
};

userTrackProgressSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.lastActivityAt;
  
  if (!lastActivity) {
    // First activity
    this.currentStreak = 1;
    this.longestStreak = 1;
  } else {
    const timeDiff = now - lastActivity;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.currentStreak++;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.currentStreak = 1;
    }
    // If daysDiff === 0, it's the same day, so no change to streak
  }
  
  this.lastActivityAt = now;
};

userTrackProgressSchema.methods.addAchievement = function(achievementType) {
  const existing = this.achievements.find(a => a.type === achievementType);
  if (!existing) {
    this.achievements.push({
      type: achievementType,
      unlockedAt: Date.now()
    });
  }
  return this.save();
};

userTrackProgressSchema.methods.addReview = function(rating, review) {
  this.rating = rating;
  this.review = review;
  this.reviewedAt = Date.now();
  return this.save();
};

userTrackProgressSchema.methods.getNextChallenge = function(track) {
  if (!track || !track.challenges) return null;
  
  const nextChallenge = track.challenges[this.currentChallengeIndex];
  if (!nextChallenge) return null;
  
  // Check if challenge is unlocked
  const requiredCompletions = nextChallenge.unlockAfter;
  if (this.completedChallenges >= requiredCompletions) {
    return nextChallenge;
  }
  
  return null;
};

userTrackProgressSchema.methods.isChallengeUnlocked = function(challengeIndex, track) {
  if (!track || !track.challenges || challengeIndex >= track.challenges.length) {
    return false;
  }
  
  const challenge = track.challenges[challengeIndex];
  return this.completedChallenges >= challenge.unlockAfter;
};

// Static methods
userTrackProgressSchema.statics.getUserTrackProgress = function(userId, trackId) {
  return this.findOne({ userId, trackId })
    .populate('trackId')
    .populate('challengesCompleted.challengeId');
};

userTrackProgressSchema.statics.getUserActiveTracksCount = function(userId) {
  return this.countDocuments({ 
    userId, 
    status: { $in: ['enrolled', 'in_progress'] } 
  });
};

userTrackProgressSchema.statics.getUserCompletedTracksCount = function(userId) {
  return this.countDocuments({ userId, status: 'completed' });
};

userTrackProgressSchema.statics.getLeaderboard = function(trackId, limit = 10) {
  return this.find({ trackId, status: 'completed' })
    .sort({ completedAt: 1, totalTimeSpent: 1 })
    .limit(limit)
    .populate('userId', 'firstName lastName loginId');
};

// Virtual for estimated completion time
userTrackProgressSchema.virtual('estimatedCompletionDate').get(function() {
  if (this.progressPercentage === 100) return this.completedAt;
  
  if (this.totalTimeSpent > 0 && this.completedChallenges > 0) {
    const avgTimePerChallenge = this.totalTimeSpent / this.completedChallenges;
    const remainingChallenges = this.totalChallenges - this.completedChallenges;
    const estimatedRemainingTime = remainingChallenges * avgTimePerChallenge;
    
    return new Date(Date.now() + (estimatedRemainingTime * 1000));
  }
  
  return null;
});

// Ensure virtuals are included in JSON output
userTrackProgressSchema.set('toJSON', { virtuals: true });
userTrackProgressSchema.set('toObject', { virtuals: true });

module.exports = model('UserTrackProgress', userTrackProgressSchema);