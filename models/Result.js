// /models/Result.js - Updated with manual scoring support
const { Schema, model } = require('mongoose');

const resultSchema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'TestSession',
    required: true,
  },
  testId: {
    type: Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  attemptNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'expired', 'abandoned'],
    required: true,
  },
  completedAt: {
    type: Date,
    default: undefined,
  },
  timeSpent: {
    type: Number,
    default: 0, // Seconds
  },
  
  // SIMPLIFIED: Everything the frontend needs in one place per question
  questions: [{
    // IDs and basic info
    questionId: { type: Schema.Types.ObjectId, required: true },
    questionNumber: { type: Number, required: true }, // 1, 2, 3, etc.
    sectionIndex: { type: Number, default: null },
    sectionName: { type: String, default: null },
    
    // Question content
    title: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'], 
      required: true 
    },
    language: { type: String, required: true },
    category: { type: String }, // logic, ui, syntax
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'], 
      required: true 
    },
    
    // The core data: what they answered vs what was correct
    studentAnswer: { type: Schema.Types.Mixed, default: null },
    correctAnswer: { type: Schema.Types.Mixed, default: null },
    
    // Results
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, required: true },
    pointsPossible: { type: Number, required: true },
    
    // ✅ ADDED: Manual scoring fields
    manuallyGraded: { type: Boolean, default: false },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date },
    feedback: { type: String, trim: true },
    
    // Timing and engagement
    timeSpent: { type: Number, default: 0 }, // Seconds
    viewCount: { type: Number, default: 0 },
    
    // Type-specific details (only when needed)
    details: {
      // For fill-in-blank: per-blank breakdown
      blanks: [{
        id: { type: String },
        studentAnswer: { type: String },
        correctAnswers: [{ type: String }],
        isCorrect: { type: Boolean },
        hint: { type: String }
      }],
      
      // For code questions: execution results
      codeResults: {
        executed: { type: Boolean, default: false },
        passed: { type: Boolean, default: false },
        totalTests: { type: Number, default: 0 },
        passedTests: { type: Number, default: 0 },
        executionTime: { type: Number, default: 0 },
        error: { type: String, default: null }
      },
      
      // For multiple choice: show options and what they picked
      options: [{ type: String }],
      selectedOption: { type: Number }, // Index of what they selected
      correctOption: { type: Number }  // Index of correct answer
    }
  }],
  
  // Overall results
  score: {
    totalPoints: { type: Number, required: true },
    earnedPoints: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    passingThreshold: { type: Number, default: 70 },
    
    // Quick stats
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    unansweredQuestions: { type: Number, default: 0 }
  },
  
  // ✅ ADDED: Manual scoring tracking fields
  lastModified: { type: Date },
  modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  scoreOverridden: { type: Boolean, default: false },
  overrideReason: { type: String, trim: true },
  instructorFeedback: { type: String, trim: true },
  manualReviewRequired: { type: Boolean, default: false },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
resultSchema.index({ sessionId: 1 });
resultSchema.index({ testId: 1 });
resultSchema.index({ userId: 1 });
resultSchema.index({ organizationId: 1 });
resultSchema.index({ status: 1 });
resultSchema.index({ 'score.percentage': 1 });
resultSchema.index({ completedAt: 1 });
// ✅ ADDED: Index for manual grading queries
resultSchema.index({ manualReviewRequired: 1, status: 1 });
resultSchema.index({ 'questions.type': 1, 'questions.manuallyGraded': 1 });

// ✅ UPDATED: Auto-calculate percentage and stats with manual scoring support
resultSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
  // If scores were manually updated, recalculate totals
  if (this.questions && this.questions.length > 0) {
    // Recalculate earned points from all questions
    this.score.earnedPoints = this.questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);
    
    // Recalculate total possible points
    this.score.totalPoints = this.questions.reduce((sum, q) => sum + (q.pointsPossible || 0), 0);
  }
  
  // Calculate percentage
  if (this.score.totalPoints > 0) {
    this.score.percentage = Math.round((this.score.earnedPoints / this.score.totalPoints) * 100 * 100) / 100;
  }
  
  // Calculate pass/fail
  this.score.passed = this.score.percentage >= this.score.passingThreshold;
  
  // Update question counts
  this.score.totalQuestions = this.questions.length;
  this.score.correctAnswers = this.questions.filter(q => q.isCorrect).length;
  this.score.incorrectAnswers = this.questions.filter(q => !q.isCorrect && q.studentAnswer !== null).length;
  this.score.unansweredQuestions = this.questions.filter(q => q.studentAnswer === null).length;
  
  // ✅ ADDED: Auto-detect if manual review is needed
  this.manualReviewRequired = this.questions.some(q => 
    ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded
  );
  
  next();
});

// Virtual for easy frontend access
resultSchema.virtual('summary').get(function() {
  return {
    score: this.score.percentage,
    passed: this.score.passed,
    correct: this.score.correctAnswers,
    total: this.score.totalQuestions,
    timeSpent: this.timeSpent
  };
});

// Method to get question by number
resultSchema.methods.getQuestion = function(questionNumber) {
  return this.questions.find(q => q.questionNumber === questionNumber);
};

// ✅ ADDED: Methods for manual scoring
resultSchema.methods.updateQuestionScore = function(questionIndex, updates, graderId) {
  if (questionIndex < 0 || questionIndex >= this.questions.length) {
    throw new Error('Invalid question index');
  }
  
  const question = this.questions[questionIndex];
  const oldScore = question.pointsEarned;
  
  // Update question fields
  if (updates.pointsEarned !== undefined) question.pointsEarned = updates.pointsEarned;
  if (updates.isCorrect !== undefined) question.isCorrect = updates.isCorrect;
  if (updates.feedback !== undefined) question.feedback = updates.feedback;
  
  // Mark as manually graded
  question.manuallyGraded = true;
  question.gradedBy = graderId;
  question.gradedAt = new Date();
  
  // Update result metadata
  this.lastModified = new Date();
  this.modifiedBy = graderId;
  
  return {
    oldScore,
    newScore: question.pointsEarned,
    question: question
  };
};

resultSchema.methods.requiresManualGrading = function() {
  return this.questions.some(q => 
    ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded
  );
};

resultSchema.methods.getUngradedQuestions = function() {
  return this.questions.filter(q => 
    ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded
  );
};

// ✅ ADDED: Static method to find results needing manual grading
resultSchema.statics.findPendingManualGrading = function(organizationId, testId = null) {
  const query = {
    status: 'completed',
    organizationId: organizationId,
    $or: [
      { manualReviewRequired: true },
      { 'questions.type': { $in: ['essay', 'codeChallenge'] }, 'questions.manuallyGraded': false }
    ]
  };
  
  if (testId) {
    query.testId = testId;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('testId', 'title')
    .sort({ completedAt: -1 });
};

module.exports = model('Result', resultSchema);