// /models/ChallengeSubmission.js - Track all code challenge submissions
const { Schema, model } = require('mongoose');

const challengeSubmissionSchema = new Schema({
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

  // Submission details
  language: {
    type: String,
    enum: ['javascript', 'python', 'dart'],
    required: true
  },

  code: {
    type: String,
    required: true
  },

  // Execution results
  status: {
    type: String,
    enum: ['pending', 'running', 'passed', 'failed', 'error', 'timeout'],
    default: 'pending'
  },

  // Test results
  testResults: [{
    testCaseIndex: Number,
    testName: String,
    passed: Boolean,
    actualOutput: Schema.Types.Mixed,
    expectedOutput: Schema.Types.Mixed,
    executionTime: Number, // in milliseconds
    error: String
  }],

  // Summary stats
  totalTests: { type: Number, default: 0 },
  passedTests: { type: Number, default: 0 },
  failedTests: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },

  // Performance metrics
  executionTime: Number, // total execution time in ms
  memoryUsage: Number, // memory usage in MB (if available)
  
  // Console output (for debugging)
  consoleLogs: [{
    type: { type: String, enum: ['log', 'warn', 'error', 'info'] },
    message: String,
    timestamp: Number
  }],

  // Error details
  compilationError: String,
  runtimeError: String,
  timeoutError: Boolean,

  // Submission metadata
  submissionNumber: Number, // Which attempt this was for this user/challenge/language
  isFromTrack: Boolean, // Whether this was submitted as part of a track
  trackId: {
    type: Schema.Types.ObjectId,
    ref: 'Track'
  },

  // IP and user agent for security
  ipAddress: String,
  userAgent: String,

  submittedAt: {
    type: Date,
    default: Date.now
  },

  // Processing timestamps
  startedProcessingAt: Date,
  completedProcessingAt: Date,
  processingTimeMs: Number
});

// Indexes
challengeSubmissionSchema.index({ userId: 1, challengeId: 1, language: 1 });
challengeSubmissionSchema.index({ userId: 1, status: 1 });
challengeSubmissionSchema.index({ challengeId: 1, status: 1 });
challengeSubmissionSchema.index({ submittedAt: -1 });
challengeSubmissionSchema.index({ userId: 1, submittedAt: -1 });

// Compound indexes
challengeSubmissionSchema.index({ challengeId: 1, language: 1, status: 1 });
challengeSubmissionSchema.index({ userId: 1, trackId: 1, submittedAt: -1 });

// Pre-save middleware
challengeSubmissionSchema.pre('save', function(next) {
  // Calculate success rate
  if (this.totalTests > 0) {
    this.successRate = (this.passedTests / this.totalTests) * 100;
  }
  
  // Calculate processing time if both timestamps exist
  if (this.startedProcessingAt && this.completedProcessingAt) {
    this.processingTimeMs = this.completedProcessingAt - this.startedProcessingAt;
  }
  
  next();
});

// Instance methods
challengeSubmissionSchema.methods.updateResults = function(results) {
  this.startedProcessingAt = Date.now();
  
  // Update based on execution results
  if (results.executionError || results.compilationError) {
    this.status = 'error';
    this.runtimeError = results.executionError;
    this.compilationError = results.compilationError;
  } else if (results.timeoutError) {
    this.status = 'timeout';
    this.timeoutError = true;
  } else {
    this.status = results.overallPassed ? 'passed' : 'failed';
    
    // Update test results
    this.testResults = results.testResults || [];
    this.totalTests = results.totalTests || 0;
    this.passedTests = results.totalTestsPassed || 0;
    this.failedTests = this.totalTests - this.passedTests;
    
    // Update performance metrics
    this.executionTime = results.executionTime;
    this.memoryUsage = results.memoryUsage;
    
    // Update console logs
    this.consoleLogs = results.consoleLogs || [];
  }
  
  this.completedProcessingAt = Date.now();
  return this.save();
};

challengeSubmissionSchema.methods.markAsProcessing = function() {
  this.status = 'running';
  this.startedProcessingAt = Date.now();
  return this.save();
};

// Static methods
challengeSubmissionSchema.statics.getLatestSubmission = function(userId, challengeId, language) {
  return this.findOne({ userId, challengeId, language })
    .sort({ submittedAt: -1 });
};

challengeSubmissionSchema.statics.getPassedSubmissions = function(userId, challengeId, language) {
  return this.find({ userId, challengeId, language, status: 'passed' })
    .sort({ submittedAt: -1 });
};

challengeSubmissionSchema.statics.getBestSubmission = function(userId, challengeId, language) {
  return this.findOne({ 
    userId, 
    challengeId, 
    language, 
    status: 'passed' 
  }).sort({ 
    executionTime: 1, // Fastest first
    submittedAt: 1    // Earlier first as tiebreaker
  });
};

challengeSubmissionSchema.statics.getUserSubmissionHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ submittedAt: -1 })
    .limit(limit)
    .populate('challengeId', 'title challengeNumber difficulty')
    .populate('trackId', 'title');
};

challengeSubmissionSchema.statics.getChallengeStats = function(challengeId) {
  return this.aggregate([
    { $match: { challengeId } },
    {
      $group: {
        _id: {
          language: '$language',
          status: '$status'
        },
        count: { $sum: 1 },
        avgExecutionTime: { $avg: '$executionTime' },
        avgSuccessRate: { $avg: '$successRate' }
      }
    },
    {
      $group: {
        _id: '$_id.language',
        stats: {
          $push: {
            status: '$_id.status',
            count: '$count',
            avgExecutionTime: '$avgExecutionTime',
            avgSuccessRate: '$avgSuccessRate'
          }
        },
        totalSubmissions: { $sum: '$count' }
      }
    }
  ]);
};

challengeSubmissionSchema.statics.getRecentActivity = function(limit = 20) {
  return this.find({ status: 'passed' })
    .sort({ submittedAt: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName loginId')
    .populate('challengeId', 'title challengeNumber difficulty')
    .select('userId challengeId language submittedAt executionTime');
};

// Virtual for submission summary
challengeSubmissionSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    status: this.status,
    language: this.language,
    passedTests: this.passedTests,
    totalTests: this.totalTests,
    successRate: this.successRate,
    executionTime: this.executionTime,
    submittedAt: this.submittedAt,
    hasErrors: !!(this.compilationError || this.runtimeError || this.timeoutError)
  };
});

// Ensure virtuals are included in JSON output
challengeSubmissionSchema.set('toJSON', { virtuals: true });
challengeSubmissionSchema.set('toObject', { virtuals: true });

module.exports = model('ChallengeSubmission', challengeSubmissionSchema);