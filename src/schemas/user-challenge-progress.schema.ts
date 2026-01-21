// src/schemas/user-challenge-progress.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UserChallengeProgressDocument = UserChallengeProgress & Document;

@Schema({ _id: false })
class LanguageSolution {
  @Prop()
  code?: string;

  @Prop({ enum: ['not_attempted', 'attempted', 'solved'], default: 'not_attempted' })
  status: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ type: Date })
  lastAttemptAt?: Date;

  @Prop({ type: Date })
  solvedAt?: Date;

  @Prop()
  bestTime?: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChallengeSubmission' })
  bestSubmissionId?: Types.ObjectId;
}

@Schema({ _id: false })
class Solutions {
  @Prop({ type: LanguageSolution, default: () => ({ status: 'not_attempted', attempts: 0 }) })
  javascript: LanguageSolution;

  @Prop({ type: LanguageSolution, default: () => ({ status: 'not_attempted', attempts: 0 }) })
  python: LanguageSolution;

  @Prop({ type: LanguageSolution, default: () => ({ status: 'not_attempted', attempts: 0 }) })
  dart: LanguageSolution;
}

@Schema({ _id: false })
class HintUsed {
  @Prop()
  hintIndex: number;

  @Prop({ type: Date })
  unlockedAt: Date;
}

@Schema({
  timestamps: true,
  collection: 'userchallengeprogresss',
})
export class UserChallengeProgress {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CodeChallenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Track', default: null })
  trackId?: Types.ObjectId;

  @Prop({ enum: ['not_attempted', 'attempted', 'solved'], default: 'not_attempted' })
  status: string;

  @Prop({ type: Solutions, default: () => ({}) })
  solutions: Solutions;

  @Prop({ default: 0 })
  totalAttempts: number;

  @Prop({ type: Date })
  firstAttemptAt?: Date;

  @Prop({ type: Date })
  lastAttemptAt?: Date;

  @Prop({ type: Date })
  solvedAt?: Date;

  @Prop({ type: [HintUsed] })
  hintsUsed: HintUsed[];

  @Prop({ default: 0 })
  totalTimeSpent: number;

  @Prop()
  notes?: string;

  @Prop({ default: false })
  isBookmarked: boolean;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserChallengeProgressSchema = SchemaFactory.createForClass(UserChallengeProgress);

// Pre-save hook: update overall status based on language statuses
UserChallengeProgressSchema.pre('save', function () {
  const languageStatuses = [
    this.solutions?.javascript?.status,
    this.solutions?.python?.status,
    this.solutions?.dart?.status,
  ].filter(Boolean);

  if (languageStatuses.includes('solved')) {
    this.status = 'solved';
    if (!this.solvedAt) {
      this.solvedAt = new Date();
    }
  } else if (languageStatuses.includes('attempted')) {
    this.status = 'attempted';
  }
});

// Indexes
UserChallengeProgressSchema.index({ userId: 1, challengeId: 1, trackId: 1 }, { unique: true });
UserChallengeProgressSchema.index({ userId: 1, trackId: 1, status: 1 });
UserChallengeProgressSchema.index({ userId: 1, challengeId: 1 });
UserChallengeProgressSchema.index({ userId: 1, 'solutions.javascript.status': 1 });
UserChallengeProgressSchema.index({ userId: 1, 'solutions.python.status': 1 });
UserChallengeProgressSchema.index({ userId: 1, 'solutions.dart.status': 1 });
UserChallengeProgressSchema.index({ userId: 1, isBookmarked: 1 });
UserChallengeProgressSchema.index({ solvedAt: 1 });