// /models/TestSession.js
const { Schema, model } = require('mongoose');

const testSessionSchema = new Schema({
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
    enum: ['inProgress', 'completed', 'expired', 'abandoned'],
    default: 'inProgress',
  },
  startedAt: {
    type: Date,
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
  questions: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: Schema.Types.Mixed, default: undefined },
    isCorrect: { type: Boolean, default: undefined },
    pointsAwarded: { type: Number, default: undefined },
    timeSpent: { type: Number, default: 0 }, // Seconds
    sectionIndex: { type: Number, default: undefined },
    sectionName: { type: String, default: undefined },
    codeSubmissions: [{
      code: { type: String, required: true },
      submittedAt: { type: Date, required: true },
      passed: { type: Boolean, required: true },
      error: { type: String, default: undefined },
    }],
  }],
  score: {
    totalPoints: { type: Number, required: true },
    earnedPoints: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
  },
  completedSections: {
    type: [Number],
    default: [],
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
testSessionSchema.index({ testId: 1 });
testSessionSchema.index({ userId: 1 });
testSessionSchema.index({ organizationId: 1 });
testSessionSchema.index({ status: 1 });
testSessionSchema.index({ testId: 1, userId: 1, attemptNumber: 1 }, { unique: true });

// Update updatedAt on save
testSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model('TestSession', testSessionSchema);