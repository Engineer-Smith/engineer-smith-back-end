// app/models/TestSession.js
const mongoose = require('mongoose')


const testSessionSchema = new mongoose.Schema({
  // Test and User Info
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },

  // Session Status
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'expired', 'abandoned'],
    default: 'in_progress'
  },
  
  // Timing
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  timeSpent: Number, // seconds
  
  // Questions and Answers
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    order: Number,
    points: Number,
    
    // Student's answer
    answer: mongoose.Schema.Types.Mixed, // Could be boolean, number, string (code), etc.
    isCorrect: Boolean,
    pointsAwarded: {
      type: Number,
      default: 0
    },
    timeSpent: Number, // seconds on this question
    hintsUsed: [String],
    
    // For coding questions
    codeSubmissions: [{
      code: String,
      submittedAt: Date,
      testResults: [{
        testCaseId: String,
        passed: Boolean,
        expected: String,
        actual: String,
        error: String
      }]
    }]
  }],

  // Scoring
  score: {
    totalPoints: {
      type: Number,
      default: 0
    },
    earnedPoints: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    }
  },

  // Browser/Environment Info (for security)
  metadata: {
    userAgent: String,
    ipAddress: String,
    screenResolution: String,
    timezone: String
  }
}, {
  timestamps: true
});

// Index for finding user's attempts
testSessionSchema.index({ userId: 1, testId: 1 });
testSessionSchema.index({ testId: 1, status: 1 });

// Method to calculate score
testSessionSchema.methods.calculateScore = function() {
  const totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = this.questions.reduce((sum, q) => sum + (q.pointsAwarded || 0), 0);
  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  
  this.score = {
    totalPoints,
    earnedPoints,
    percentage,
    passed: percentage >= (this.testId?.settings?.passingScore || 70)
  };
  
  return this.score;
};

// Method to check if session has expired
testSessionSchema.methods.isExpired = function() {
  if (this.status === 'completed') return false;
  
  const now = new Date();
  const timeLimit = this.testId?.settings?.timeLimit || 60; // minutes
  const expirationTime = new Date(this.startedAt.getTime() + (timeLimit * 60 * 1000));
  
  return now > expirationTime;
};

// Auto-expire sessions
testSessionSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'in_progress') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('TestSession', testSessionSchema);