// /models/Result.js - Simplified for frontend ease of use
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

// Auto-calculate percentage and stats
resultSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
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

module.exports = model('Result', resultSchema);