// src/schemas/test-session.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type TestSessionDocument = TestSession & Document;

// Sub-schemas for test snapshot
@Schema({ _id: false })
export class SnapshotQuestion {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  questionId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  questionData: any;

  @Prop({ type: Number, required: true })
  points: number;

  @Prop({ type: Number, required: true })
  originalOrder: number;

  @Prop({ type: Number, required: true })
  finalOrder: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  studentAnswer: any;

  @Prop({
    type: String,
    enum: ['not_viewed', 'viewed', 'answered', 'skipped'],
    default: 'not_viewed',
  })
  status: string;

  @Prop({ type: Number, default: 0 })
  timeSpentOnQuestion: number; // seconds

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @Prop({ type: Date, default: null })
  firstViewedAt: Date | null;

  @Prop({ type: Date, default: null })
  lastViewedAt: Date | null;

  @Prop({ type: Boolean, default: null })
  isCorrect: boolean | null;

  @Prop({ type: Number, default: 0 })
  pointsEarned: number;
}

export const SnapshotQuestionSchema = SchemaFactory.createForClass(SnapshotQuestion);

@Schema({ _id: false })
export class SnapshotSection {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  timeLimit: number; // minutes

  @Prop({ type: [SnapshotQuestionSchema], default: [] })
  questions: SnapshotQuestion[];

  @Prop({
    type: String,
    enum: ['not_started', 'in_progress', 'reviewing', 'submitted'],
    default: 'not_started',
  })
  status: string;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  submittedAt: Date | null;
}

export const SnapshotSectionSchema = SchemaFactory.createForClass(SnapshotSection);

@Schema({ _id: false })
export class SnapshotSettings {
  @Prop({ type: Number, required: true })
  timeLimit: number; // minutes

  @Prop({ type: Number, required: true })
  attemptsAllowed: number;

  @Prop({ type: Boolean, default: false })
  shuffleQuestions: boolean;

  @Prop({ type: Boolean, default: false })
  useSections: boolean;
}

export const SnapshotSettingsSchema = SchemaFactory.createForClass(SnapshotSettings);

@Schema({ _id: false })
export class TestSnapshot {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  originalTestId: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true })
  totalQuestions: number;

  @Prop({ type: Number, required: true })
  totalPoints: number;

  @Prop({ type: SnapshotSettingsSchema, required: true })
  settings: SnapshotSettings;

  @Prop({ type: [SnapshotSectionSchema], default: [] })
  sections: SnapshotSection[];

  @Prop({ type: [SnapshotQuestionSchema], default: [] })
  questions: SnapshotQuestion[];
}

export const TestSnapshotSchema = SchemaFactory.createForClass(TestSnapshot);

@Schema({ _id: false })
export class FinalScore {
  @Prop({ type: Number, default: 0 })
  totalPoints: number;

  @Prop({ type: Number, default: 0 })
  earnedPoints: number;

  @Prop({ type: Number, default: 0 })
  percentage: number;

  @Prop({ type: Boolean, default: false })
  passed: boolean;

  @Prop({ type: Number, default: 70 })
  passingThreshold: number;

  @Prop({ type: Number, default: 0 })
  correctAnswers: number;

  @Prop({ type: Number, default: 0 })
  incorrectAnswers: number;

  @Prop({ type: Number, default: 0 })
  unansweredQuestions: number;

  @Prop({ type: Number, default: 0 })
  totalTimeUsed: number;
}

export const FinalScoreSchema = SchemaFactory.createForClass(FinalScore);

// Main TestSession Schema
@Schema({
  timestamps: true,
  collection: 'testsessions',
})
export class TestSession {
  // Core identification
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Test', required: true })
  testId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  attemptNumber: number;

  // Status and timing
  @Prop({
    type: String,
    enum: ['inProgress', 'paused', 'completed', 'expired', 'abandoned'],
    default: 'inProgress',
  })
  status: string;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date, default: undefined })
  completedAt?: Date;

  // Connection tracking
  @Prop({ type: Boolean, default: true })
  isConnected: boolean;

  @Prop({ type: Date, default: null })
  disconnectedAt: Date | null;

  @Prop({ type: Date, default: null })
  lastConnectedAt: Date | null;

  @Prop({ type: String, default: null })
  graceTimerId: string | null;

  @Prop({ type: Boolean, default: false })
  gracePeriodExpired: boolean;

  // Section timing
  @Prop({ type: Number, default: 0 })
  currentSectionIndex: number;

  @Prop({ type: Date, default: null })
  currentSectionStartedAt: Date | null;

  @Prop({ type: [Number], default: [] })
  completedSections: number[];

  @Prop({ type: [Date], default: [] })
  sectionStartTimes: Date[];

  @Prop({ type: [Number], default: [] })
  sectionTimeUsed: number[]; // seconds

  // Navigation - currentQuestionIndex is SECTION-RELATIVE (0-based within current section)
  @Prop({ type: Number, default: 0 })
  currentQuestionIndex: number;

  // answeredQuestions stores global indices for backward compatibility
  @Prop({ type: [Number], default: [] })
  answeredQuestions: number[];

  // Server state tracking
  @Prop({
    type: String,
    enum: ['question', 'section_transition', 'test_completed'],
    default: 'question',
  })
  sessionPhase: string;

  @Prop({ type: String, default: null })
  lastServerAction: string | null;

  @Prop({ type: Date, default: null })
  lastServerActionAt: Date | null;

  // Test snapshot
  @Prop({ type: TestSnapshotSchema, required: true })
  testSnapshot: TestSnapshot;

  // Final score
  @Prop({ type: FinalScoreSchema, default: () => ({}) })
  finalScore: FinalScore;

  // Additional fields
  @Prop({ type: [Number], default: [] })
  skippedQuestions: number[];

  @Prop({ type: Boolean, default: false })
  reviewPhase: boolean;

  @Prop({ type: Date, default: null })
  reviewStartedAt: Date | null;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const TestSessionSchema = SchemaFactory.createForClass(TestSession);

// Add indexes
TestSessionSchema.index({ userId: 1, status: 1 });
TestSessionSchema.index({ 'testSnapshot.originalTestId': 1, userId: 1 });
TestSessionSchema.index({ status: 1, isConnected: 1 });
TestSessionSchema.index({ disconnectedAt: 1 });

// Add instance methods
TestSessionSchema.methods.markConnected = function () {
  this.isConnected = true;
  this.lastConnectedAt = new Date();
  this.disconnectedAt = null;
  this.graceTimerId = null;
};

TestSessionSchema.methods.markDisconnected = function () {
  this.isConnected = false;
  this.disconnectedAt = new Date();
};

TestSessionSchema.methods.isInGracePeriod = function (): boolean {
  if (!this.disconnectedAt || this.isConnected) return false;
  const gracePeriodMs = 5 * 60 * 1000; // 5 minutes
  const gracePeriodExpiry = new Date(this.disconnectedAt.getTime() + gracePeriodMs);
  return Date.now() < gracePeriodExpiry.getTime();
};

// Get starting global index for a section (for backward compatibility with answeredQuestions)
TestSessionSchema.methods.getSectionStartIndex = function (sectionIndex: number): number {
  if (!this.testSnapshot.settings.useSections) return 0;
  let startIndex = 0;
  for (let i = 0; i < sectionIndex; i++) {
    startIndex += this.testSnapshot.sections[i].questions.length;
  }
  return startIndex;
};

TestSessionSchema.methods.calculateTimeRemaining = function (): number {
  // Guard against corrupted sessions with missing testSnapshot
  if (!this.testSnapshot?.settings) {
    return 0;
  }
  if (this.testSnapshot.settings.useSections) {
    return this.calculateSectionTimeRemaining();
  }
  return this.calculateOverallTimeRemaining();
};

TestSessionSchema.methods.calculateSectionTimeRemaining = function (): number {
  const section = this.testSnapshot.sections[this.currentSectionIndex];
  if (!section) return 0;

  // Use section's startedAt if available, otherwise use currentSectionStartedAt for backward compat
  const sectionStartTime = section.startedAt || this.currentSectionStartedAt;
  if (!sectionStartTime) return section.timeLimit * 60; // Return full time if not started

  const timeLimitMs = section.timeLimit * 60 * 1000;
  const storedTimeSeconds = (this.sectionTimeUsed && this.sectionTimeUsed[this.currentSectionIndex]) || 0;
  let timeUsed = 0;

  if (this.status === 'inProgress' && this.isConnected) {
    const currentSessionTimeMs = Date.now() - new Date(sectionStartTime).getTime();
    const currentSessionTimeSeconds = Math.floor(currentSessionTimeMs / 1000);
    timeUsed = (storedTimeSeconds + currentSessionTimeSeconds) * 1000;
  } else {
    timeUsed = storedTimeSeconds * 1000;
  }

  const remainingMs = Math.max(0, timeLimitMs - timeUsed);
  return Math.floor(remainingMs / 1000);
};

TestSessionSchema.methods.calculateOverallTimeRemaining = function (): number {
  const timeLimitMs = this.testSnapshot.settings.timeLimit * 60 * 1000;
  let timeUsed = 0;

  if (this.isConnected && this.status === 'inProgress') {
    timeUsed = Date.now() - this.startedAt.getTime();
  } else if (this.status === 'paused' && this.disconnectedAt) {
    timeUsed = this.disconnectedAt.getTime() - this.startedAt.getTime();
  } else if (this.completedAt) {
    timeUsed = this.completedAt.getTime() - this.startedAt.getTime();
  }

  const remainingMs = Math.max(0, timeLimitMs - timeUsed);
  return Math.floor(remainingMs / 1000);
};

// currentQuestionIndex is now section-relative, so just return it
TestSessionSchema.methods.getCurrentQuestionInSection = function (): number {
  return this.currentQuestionIndex;
};

// Check if at last question in current section (using section-relative index)
TestSessionSchema.methods.isLastQuestionInSection = function (): boolean {
  if (!this.testSnapshot.settings.useSections) {
    return this.currentQuestionIndex >= this.testSnapshot.questions.length - 1;
  }
  const section = this.testSnapshot.sections[this.currentSectionIndex];
  if (!section) return true;
  return this.currentQuestionIndex >= section.questions.length - 1;
};

TestSessionSchema.methods.isLastSection = function (): boolean {
  if (!this.testSnapshot.settings.useSections) return true;
  return this.currentSectionIndex >= this.testSnapshot.sections.length - 1;
};

TestSessionSchema.methods.isExpired = function (): boolean {
  return this.calculateTimeRemaining() <= 0;
};

// Get current question directly (section-relative access)
TestSessionSchema.methods.getCurrentQuestion = function (): any {
  if (this.testSnapshot.settings.useSections) {
    const section = this.testSnapshot.sections[this.currentSectionIndex];
    if (!section || !section.questions) return null;
    return section.questions[this.currentQuestionIndex] || null;
  }
  return this.testSnapshot.questions?.[this.currentQuestionIndex] || null;
};

// Get current section
TestSessionSchema.methods.getCurrentSection = function (): any {
  if (!this.testSnapshot.settings.useSections) return null;
  return this.testSnapshot.sections[this.currentSectionIndex] || null;
};

// Convert section-relative index to global index
TestSessionSchema.methods.toGlobalIndex = function (sectionIndex: number, questionIndexInSection: number): number {
  let globalIndex = 0;
  for (let i = 0; i < sectionIndex; i++) {
    globalIndex += this.testSnapshot.sections[i]?.questions?.length || 0;
  }
  return globalIndex + questionIndexInSection;
};