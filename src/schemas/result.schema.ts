// src/schemas/result.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ResultDocument = Result & Document;

// Sub-schemas for question details
@Schema({ _id: false })
export class BlankDetail {
  @Prop({ type: String })
  id: string;

  @Prop({ type: String })
  studentAnswer: string;

  @Prop({ type: [String], default: [] })
  correctAnswers: string[];

  @Prop({ type: Boolean })
  isCorrect: boolean;

  @Prop({ type: String })
  hint: string;
}

export const BlankDetailSchema = SchemaFactory.createForClass(BlankDetail);

@Schema({ _id: false })
export class CodeResultDetail {
  @Prop({ type: Boolean, default: false })
  executed: boolean;

  @Prop({ type: Boolean, default: false })
  passed: boolean;

  @Prop({ type: Number, default: 0 })
  totalTests: number;

  @Prop({ type: Number, default: 0 })
  passedTests: number;

  @Prop({ type: Number, default: 0 })
  executionTime: number;

  @Prop({ type: String, default: null })
  error: string | null;
}

export const CodeResultDetailSchema = SchemaFactory.createForClass(CodeResultDetail);

@Schema({ _id: false })
export class QuestionDetails {
  @Prop({ type: [BlankDetailSchema], default: undefined })
  blanks?: BlankDetail[];

  @Prop({ type: CodeResultDetailSchema, default: undefined })
  codeResults?: CodeResultDetail;

  @Prop({ type: [String], default: undefined })
  options?: string[];

  @Prop({ type: Number, default: undefined })
  selectedOption?: number;

  @Prop({ type: Number, default: undefined })
  correctOption?: number;
}

export const QuestionDetailsSchema = SchemaFactory.createForClass(QuestionDetails);

@Schema({ _id: false })
export class ResultQuestion {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  questionId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  questionNumber: number;

  @Prop({ type: Number, default: null })
  sectionIndex: number | null;

  @Prop({ type: String, default: null })
  sectionName: string | null;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    type: String,
    enum: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'],
    required: true,
  })
  type: string;

  @Prop({ type: String, required: true })
  language: string;

  @Prop({ type: String })
  category: string;

  @Prop({
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  })
  difficulty: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  studentAnswer: any;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  correctAnswer: any;

  @Prop({ type: Boolean, required: true })
  isCorrect: boolean;

  @Prop({ type: Number, required: true })
  pointsEarned: number;

  @Prop({ type: Number, required: true })
  pointsPossible: number;

  // Manual scoring fields
  @Prop({ type: Boolean, default: false })
  manuallyGraded: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  gradedBy?: Types.ObjectId;

  @Prop({ type: Date })
  gradedAt?: Date;

  @Prop({ type: String, trim: true })
  feedback?: string;

  // Timing and engagement
  @Prop({ type: Number, default: 0 })
  timeSpent: number;

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @Prop({ type: QuestionDetailsSchema, default: undefined })
  details?: QuestionDetails;
}

export const ResultQuestionSchema = SchemaFactory.createForClass(ResultQuestion);

@Schema({ _id: false })
export class ResultScore {
  @Prop({ type: Number, required: true })
  totalPoints: number;

  @Prop({ type: Number, default: 0 })
  earnedPoints: number;

  @Prop({ type: Number, default: 0 })
  percentage: number;

  @Prop({ type: Boolean, default: false })
  passed: boolean;

  @Prop({ type: Number, default: 70 })
  passingThreshold: number;

  @Prop({ type: Number, required: true })
  totalQuestions: number;

  @Prop({ type: Number, default: 0 })
  correctAnswers: number;

  @Prop({ type: Number, default: 0 })
  incorrectAnswers: number;

  @Prop({ type: Number, default: 0 })
  unansweredQuestions: number;
}

export const ResultScoreSchema = SchemaFactory.createForClass(ResultScore);

// Main Result Schema
@Schema({
  timestamps: true,
  collection: 'results',
})
export class Result {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TestSession', required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Test', required: true })
  testId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  attemptNumber: number;

  @Prop({
    type: String,
    enum: ['completed', 'expired', 'abandoned'],
    required: true,
  })
  status: string;

  @Prop({ type: Date, default: undefined })
  completedAt?: Date;

  @Prop({ type: Number, default: 0 })
  timeSpent: number; // Seconds

  @Prop({ type: [ResultQuestionSchema], default: [] })
  questions: ResultQuestion[];

  @Prop({ type: ResultScoreSchema, required: true })
  score: ResultScore;

  // Manual scoring tracking fields
  @Prop({ type: Date })
  lastModified?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  modifiedBy?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  scoreOverridden: boolean;

  @Prop({ type: String, trim: true })
  overrideReason?: string;

  @Prop({ type: String, trim: true })
  instructorFeedback?: string;

  @Prop({ type: Boolean, default: false })
  manualReviewRequired: boolean;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const ResultSchema = SchemaFactory.createForClass(Result);

// Add indexes
ResultSchema.index({ sessionId: 1 });
ResultSchema.index({ testId: 1 });
ResultSchema.index({ userId: 1 });
ResultSchema.index({ organizationId: 1 });
ResultSchema.index({ status: 1 });
ResultSchema.index({ 'score.percentage': 1 });
ResultSchema.index({ completedAt: 1 });
ResultSchema.index({ manualReviewRequired: 1, status: 1 });
ResultSchema.index({ 'questions.type': 1, 'questions.manuallyGraded': 1 });

// Pre-save hook to recalculate scores
// Note: In NestJS/Mongoose, we don't use the next() callback pattern
ResultSchema.pre('save', function () {
  // Recalculate earned points from all questions
  if (this.questions && this.questions.length > 0) {
    this.score.earnedPoints = this.questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);
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
  this.score.correctAnswers = this.questions.filter((q) => q.isCorrect).length;
  this.score.incorrectAnswers = this.questions.filter((q) => !q.isCorrect && q.studentAnswer !== null).length;
  this.score.unansweredQuestions = this.questions.filter((q) => q.studentAnswer === null).length;

  // Auto-detect if manual review is needed
  this.manualReviewRequired = this.questions.some(
    (q) => ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded,
  );
});

// Instance methods
ResultSchema.methods.getQuestion = function (questionNumber: number) {
  return this.questions.find((q: ResultQuestion) => q.questionNumber === questionNumber);
};

ResultSchema.methods.updateQuestionScore = function (
  questionIndex: number,
  updates: { pointsEarned?: number; isCorrect?: boolean; feedback?: string },
  graderId: Types.ObjectId,
) {
  if (questionIndex < 0 || questionIndex >= this.questions.length) {
    throw new Error('Invalid question index');
  }

  const question = this.questions[questionIndex];
  const oldScore = question.pointsEarned;

  if (updates.pointsEarned !== undefined) question.pointsEarned = updates.pointsEarned;
  if (updates.isCorrect !== undefined) question.isCorrect = updates.isCorrect;
  if (updates.feedback !== undefined) question.feedback = updates.feedback;

  question.manuallyGraded = true;
  question.gradedBy = graderId;
  question.gradedAt = new Date();

  this.lastModified = new Date();
  this.modifiedBy = graderId;

  return {
    oldScore,
    newScore: question.pointsEarned,
    question,
  };
};

ResultSchema.methods.requiresManualGrading = function () {
  return this.questions.some(
    (q: ResultQuestion) => ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded,
  );
};

ResultSchema.methods.getUngradedQuestions = function () {
  return this.questions.filter(
    (q: ResultQuestion) => ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded,
  );
};

// Static methods
ResultSchema.statics.findPendingManualGrading = function (
  organizationId: Types.ObjectId,
  testId?: Types.ObjectId,
) {
  const query: any = {
    status: 'completed',
    organizationId,
    $or: [
      { manualReviewRequired: true },
      { 'questions.type': { $in: ['essay', 'codeChallenge'] }, 'questions.manuallyGraded': false },
    ],
  };

  if (testId) {
    query.testId = testId;
  }

  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('testId', 'title')
    .sort({ completedAt: -1 });
};