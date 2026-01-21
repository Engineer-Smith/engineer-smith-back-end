// src/schemas/user-track-progress.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type UserTrackProgressDocument = UserTrackProgress & Document;

@Schema({ _id: false })
class ChallengeCompletion {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CodeChallenge' })
  challengeId: Types.ObjectId;

  @Prop({ type: Date })
  completedAt: Date;

  @Prop()
  language?: string;

  @Prop()
  attempts?: number;

  @Prop()
  timeSpent?: number;
}

@Schema({ _id: false })
class Achievement {
  @Prop()
  type: string;

  @Prop({ type: Date })
  unlockedAt: Date;
}

@Schema({
  timestamps: true,
  collection: 'usertrackprogresss',
})
export class UserTrackProgress {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Track', required: true })
  trackId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  enrolledAt: Date;

  @Prop({ enum: ['enrolled', 'in_progress', 'completed', 'paused'], default: 'enrolled' })
  status: string;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: [ChallengeCompletion] })
  challengesCompleted: ChallengeCompletion[];

  @Prop({ default: 0 })
  currentChallengeIndex: number;

  @Prop({ default: 0 })
  totalChallenges: number;

  @Prop({ default: 0 })
  completedChallenges: number;

  @Prop({ default: 0 })
  progressPercentage: number;

  @Prop({ default: 0 })
  totalTimeSpent: number;

  @Prop({ default: 0 })
  estimatedTimeRemaining: number;

  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop()
  review?: string;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: [Achievement] })
  achievements: Achievement[];

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ type: Date })
  lastActivityAt?: Date;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserTrackProgressSchema = SchemaFactory.createForClass(UserTrackProgress);

// Pre-save hook: update progress and status
UserTrackProgressSchema.pre('save', function () {
  // Update progress percentage
  if (this.totalChallenges > 0) {
    this.progressPercentage = Math.round((this.completedChallenges / this.totalChallenges) * 100);
  }

  // Update status based on progress
  if (this.progressPercentage === 100 && this.status !== 'completed') {
    this.status = 'completed';
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else if (this.progressPercentage > 0 && this.status === 'enrolled') {
    this.status = 'in_progress';
  }
});

// Indexes
UserTrackProgressSchema.index({ userId: 1, trackId: 1 }, { unique: true });
UserTrackProgressSchema.index({ userId: 1, status: 1 });
UserTrackProgressSchema.index({ userId: 1, progressPercentage: -1 });
UserTrackProgressSchema.index({ trackId: 1, status: 1 });
UserTrackProgressSchema.index({ completedAt: 1 });

// Virtuals
UserTrackProgressSchema.virtual('estimatedCompletionDate').get(function () {
  if (this.progressPercentage === 100) return this.completedAt;

  if (this.totalTimeSpent > 0 && this.completedChallenges > 0) {
    const avgTimePerChallenge = this.totalTimeSpent / this.completedChallenges;
    const remainingChallenges = this.totalChallenges - this.completedChallenges;
    const estimatedRemainingTime = remainingChallenges * avgTimePerChallenge;

    return new Date(Date.now() + estimatedRemainingTime * 1000);
  }

  return null;
});

UserTrackProgressSchema.set('toJSON', { virtuals: true });
UserTrackProgressSchema.set('toObject', { virtuals: true });