// /models/UserChallengeProgress.js - Track user progress on challenges (with track context)
const { Schema, model } = require('mongoose');

const userChallengeProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  challengeId: {
    type: Schema.Types.ObjectId,
    ref: 'CodeChallenge',
    required: true
  },

  // OPTIONAL: Track context (null = standalone challenge)
  trackId: {
    type: Schema.Types.ObjectId,
    ref: 'Track',
    default: null
  },

  // Overall status for this challenge-track combination
  status: {
    type: String,
    enum: ['not_attempted', 'attempted', 'solved'],
    default: 'not_attempted'
  },

  // Progress per language for this specific challenge-track combo
  solutions: {
    javascript: {
      code: String,
      status: { type: String, enum: ['not_attempted', 'attempted', 'solved'], default: 'not_attempted' },
      attempts: { type: Number, default: 0 },
      lastAttemptAt: Date,
      solvedAt: Date,
      bestTime: Number, // execution time in ms
      bestSubmissionId: { type: Schema.Types.ObjectId, ref: 'ChallengeSubmission' }
    },
    python: {
      code: String,
      status: { type: String, enum: ['not_attempted', 'attempted', 'solved'], default: 'not_attempted' },
      attempts: { type: Number, default: 0 },
      lastAttemptAt: Date,
      solvedAt: Date,
      bestTime: Number,
      bestSubmissionId: { type: Schema.Types.ObjectId, ref: 'ChallengeSubmission' }
    },
    dart: {
      code: String,
      status: { type: String, enum: ['not_attempted', 'attempted', 'solved'], default: 'not_attempted' },
      attempts: { type: Number, default: 0 },
      lastAttemptAt: Date,
      solvedAt: Date,
      bestTime: Number,
      bestSubmissionId: { type: Schema.Types.ObjectId, ref: 'ChallengeSubmission' }
    }
  },

  // Aggregate stats for this challenge-track combination
  totalAttempts: { type: Number, default: 0 },
  firstAttemptAt: Date,
  lastAttemptAt: Date,
  solvedAt: Date, // First time solved in any language for this track
  
  // Track-specific hints used (hints might be different per track)
  hintsUsed: [{ 
    hintIndex: Number, 
    unlockedAt: Date 
  }],

  // Time tracking for this track context
  totalTimeSpent: { type: Number, default: 0 }, // in seconds
  
  // Track-specific notes
  notes: String,

  // Bookmarked in this track context
  isBookmarked: { type: Boolean, default: false },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// UPDATED: Compound unique index - one progress record per user per challenge per track
userChallengeProgressSchema.index({ userId: 1, challengeId: 1, trackId: 1 }, { unique: true });

// Other indexes
userChallengeProgressSchema.index({ userId: 1, trackId: 1, status: 1 });
userChallengeProgressSchema.index({ userId: 1, challengeId: 1 }); // For cross-track queries
userChallengeProgressSchema.index({ userId: 1, 'solutions.javascript.status': 1 });
userChallengeProgressSchema.index({ userId: 1, 'solutions.python.status': 1 });
userChallengeProgressSchema.index({ userId: 1, 'solutions.dart.status': 1 });
userChallengeProgressSchema.index({ userId: 1, isBookmarked: 1 });
userChallengeProgressSchema.index({ solvedAt: 1 });

// Pre-save middleware
userChallengeProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update overall status based on language-specific statuses
  const languageStatuses = Object.values(this.solutions).map(solution => solution.status);
  
  if (languageStatuses.includes('solved')) {
    this.status = 'solved';
    // Set solvedAt if not already set
    if (!this.solvedAt) {
      this.solvedAt = Date.now();
    }
  } else if (languageStatuses.includes('attempted')) {
    this.status = 'attempted';
  }
  
  next();
});

// Instance methods
userChallengeProgressSchema.methods.recordAttempt = function(language, success, timeSpent, submissionId) {
  const solution = this.solutions[language];
  
  if (!solution) {
    throw new Error(`Language ${language} not supported`);
  }
  
  // Update language-specific stats
  solution.attempts++;
  solution.lastAttemptAt = Date.now();
  
  if (success) {
    solution.status = 'solved';
    if (!solution.solvedAt) {
      solution.solvedAt = Date.now();
    }
    if (submissionId) {
      solution.bestSubmissionId = submissionId;
    }
    if (timeSpent && (!solution.bestTime || timeSpent < solution.bestTime)) {
      solution.bestTime = timeSpent;
    }
  } else if (solution.status === 'not_attempted') {
    solution.status = 'attempted';
  }
  
  // Update aggregate stats
  this.totalAttempts++;
  this.lastAttemptAt = Date.now();
  
  if (!this.firstAttemptAt) {
    this.firstAttemptAt = Date.now();
  }
  
  if (timeSpent) {
    this.totalTimeSpent += timeSpent;
  }
  
  return this.save();
};

// Static methods for track-specific queries
userChallengeProgressSchema.statics.getUserProgressInTrack = function(userId, trackId) {
  return this.find({ userId, trackId })
    .populate('challengeId', 'challengeNumber title difficulty')
    .sort({ updatedAt: -1 });
};

userChallengeProgressSchema.statics.getUserProgressForChallenge = function(userId, challengeId) {
  // Get progress across ALL tracks for this challenge
  return this.find({ userId, challengeId })
    .populate('trackId', 'title language')
    .sort({ updatedAt: -1 });
};

userChallengeProgressSchema.statics.getUserProgressInTrackForChallenge = function(userId, challengeId, trackId) {
  // Get progress for specific challenge in specific track
  return this.findOne({ userId, challengeId, trackId });
};

userChallengeProgressSchema.statics.getUserStandaloneProgress = function(userId, challengeId) {
  // Get progress for challenge solved outside any track
  return this.findOne({ userId, challengeId, trackId: null });
};

userChallengeProgressSchema.statics.getUserSolvedInTrack = function(userId, trackId, language = null) {
  let query = { userId, trackId, status: 'solved' };
  
  if (language) {
    query[`solutions.${language}.status`] = 'solved';
  }
  
  return this.find(query)
    .populate('challengeId', 'challengeNumber title difficulty')
    .sort({ solvedAt: -1 });
};

userChallengeProgressSchema.statics.getUserOverallStats = function(userId) {
  // Aggregate stats across ALL tracks and standalone challenges
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalAttempted: { $sum: { $cond: [{ $ne: ['$status', 'not_attempted'] }, 1, 0] } },
        totalSolved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
        uniqueChallengesSolved: { $addToSet: { $cond: [{ $eq: ['$status', 'solved'] }, '$challengeId', null] } },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        totalAttempts: { $sum: '$totalAttempts' }
      }
    },
    {
      $project: {
        totalAttempted: 1,
        totalSolved: 1,
        uniqueChallengesSolved: { $size: { $filter: { input: '$uniqueChallengesSolved', cond: { $ne: ['$$this', null] } } } },
        totalTimeSpent: 1,
        totalAttempts: 1
      }
    }
  ]);
};

userChallengeProgressSchema.statics.hasUserSolvedChallengeAnywhere = function(userId, challengeId) {
  // Check if user has solved this challenge in ANY track or standalone
  return this.findOne({ 
    userId, 
    challengeId, 
    status: 'solved' 
  });
};

// Method to help with "smart suggestions"
userChallengeProgressSchema.statics.getUserCrossTrackInsights = function(userId, challengeId) {
  // Show user their progress on this challenge across different tracks
  return this.find({ userId, challengeId })
    .populate('trackId', 'title language category')
    .select('trackId status solutions.javascript.status solutions.python.status solutions.dart.status solvedAt');
};

module.exports = model('UserChallengeProgress', userChallengeProgressSchema);