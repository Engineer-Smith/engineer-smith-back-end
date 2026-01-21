// src/schemas/challenge-submission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ChallengeSubmissionDocument = ChallengeSubmission & Document;

@Schema({ _id: false })
class TestResult {
  @Prop()
  testCaseIndex: number;

  @Prop()
  testName?: string;

  @Prop()
  passed: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed })
  actualOutput: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  expectedOutput: any;

  @Prop()
  executionTime?: number;

  @Prop()
  error?: string;
}

@Schema({ _id: false })
class ConsoleLog {
  @Prop({ enum: ['log', 'warn', 'error', 'info'] })
  type: string;

  @Prop()
  message: string;

  @Prop()
  timestamp?: number;
}

@Schema({
  timestamps: true,
  collection: 'challengesubmissions',
})
export class ChallengeSubmission {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CodeChallenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ required: true, enum: ['javascript', 'python', 'dart'] })
  language: string;

  @Prop({ required: true })
  code: string;

  @Prop({
    enum: ['pending', 'running', 'passed', 'failed', 'error', 'timeout'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: [TestResult] })
  testResults: TestResult[];

  @Prop({ default: 0 })
  totalTests: number;

  @Prop({ default: 0 })
  passedTests: number;

  @Prop({ default: 0 })
  failedTests: number;

  @Prop({ default: 0 })
  successRate: number;

  @Prop()
  executionTime?: number;

  @Prop()
  memoryUsage?: number;

  @Prop({ type: [ConsoleLog] })
  consoleLogs: ConsoleLog[];

  @Prop()
  compilationError?: string;

  @Prop()
  runtimeError?: string;

  @Prop({ default: false })
  timeoutError: boolean;

  @Prop()
  submissionNumber?: number;

  @Prop({ default: false })
  isFromTrack: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Track' })
  trackId?: Types.ObjectId;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({ type: Date })
  startedProcessingAt?: Date;

  @Prop({ type: Date })
  completedProcessingAt?: Date;

  @Prop()
  processingTimeMs?: number;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const ChallengeSubmissionSchema = SchemaFactory.createForClass(ChallengeSubmission);

// Pre-save hook
ChallengeSubmissionSchema.pre('save', function () {
  // Calculate success rate
  if (this.totalTests > 0) {
    this.successRate = (this.passedTests / this.totalTests) * 100;
  }

  // Calculate processing time
  if (this.startedProcessingAt && this.completedProcessingAt) {
    this.processingTimeMs =
      this.completedProcessingAt.getTime() - this.startedProcessingAt.getTime();
  }
});

// Indexes
ChallengeSubmissionSchema.index({ userId: 1, challengeId: 1, language: 1 });
ChallengeSubmissionSchema.index({ userId: 1, status: 1 });
ChallengeSubmissionSchema.index({ challengeId: 1, status: 1 });
ChallengeSubmissionSchema.index({ submittedAt: -1 });
ChallengeSubmissionSchema.index({ userId: 1, submittedAt: -1 });
ChallengeSubmissionSchema.index({ challengeId: 1, language: 1, status: 1 });
ChallengeSubmissionSchema.index({ userId: 1, trackId: 1, submittedAt: -1 });

// Virtuals
ChallengeSubmissionSchema.virtual('summary').get(function () {
  return {
    id: this._id,
    status: this.status,
    language: this.language,
    passedTests: this.passedTests,
    totalTests: this.totalTests,
    successRate: this.successRate,
    executionTime: this.executionTime,
    submittedAt: this.submittedAt,
    hasErrors: !!(this.compilationError || this.runtimeError || this.timeoutError),
  };
});

ChallengeSubmissionSchema.set('toJSON', { virtuals: true });
ChallengeSubmissionSchema.set('toObject', { virtuals: true });