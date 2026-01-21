// src/schemas/track.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type TrackDocument = Track & Document;

@Schema({ _id: false })
class TrackChallenge {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CodeChallenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ required: true })
  order: number;

  @Prop({ default: false })
  isOptional: boolean;

  @Prop({ default: 0 })
  unlockAfter: number;
}

@Schema({ _id: false })
class TrackStats {
  @Prop({ default: 0 })
  totalEnrolled: number;

  @Prop({ default: 0 })
  totalCompleted: number;

  @Prop({ default: 0 })
  completionRate: number;

  @Prop({ default: 0 })
  averageCompletionTime: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalRatings: number;
}

@Schema({
  timestamps: true,
  collection: 'tracks',
})
export class Track {
  @Prop({ required: true, trim: true })
  title: string;

  // unique: true already creates an index, so we don't need TrackSchema.index({ slug: 1 })
  @Prop({ unique: true, lowercase: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['javascript', 'python', 'dart'] })
  language: string;

  @Prop({
    required: true,
    enum: [
      'beginner',
      'intermediate',
      'advanced',
      'data-structures',
      'algorithms',
      'dynamic-programming',
      'graphs',
      'trees',
      'arrays',
      'strings',
      'linked-lists',
      'stacks-queues',
      'sorting-searching',
      'math',
      'greedy',
      'backtracking',
      'bit-manipulation',
      'design',
      'interview-prep',
    ],
  })
  category: string;

  @Prop({ required: true, enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty: string;

  @Prop({ required: true })
  estimatedHours: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Track' }] })
  prerequisites: Types.ObjectId[];

  @Prop({ type: [String] })
  learningObjectives: string[];

  @Prop({ type: [TrackChallenge] })
  challenges: TrackChallenge[];

  @Prop({ type: TrackStats, default: () => ({}) })
  stats: TrackStats;

  @Prop()
  iconUrl?: string;

  @Prop()
  bannerUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  lastModifiedBy?: Types.ObjectId;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const TrackSchema = SchemaFactory.createForClass(Track);

// Pre-save hook: generate slug and sort challenges
TrackSchema.pre('save', function () {
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim();
  }

  // Fallback slug
  if (!this.slug) {
    this.slug = `track-${Date.now()}`;
  }

  // Sort challenges by order
  if (this.challenges && this.challenges.length > 0) {
    this.challenges.sort((a: any, b: any) => a.order - b.order);
  }
});

// Indexes
// NOTE: Removed TrackSchema.index({ slug: 1 }) - already indexed via unique: true in @Prop
TrackSchema.index({ language: 1, category: 1 });
TrackSchema.index({ difficulty: 1 });
TrackSchema.index({ isActive: 1, isFeatured: 1 });
TrackSchema.index({ 'stats.rating': -1 });
TrackSchema.index({ 'stats.totalEnrolled': -1 });
TrackSchema.index({ language: 1, difficulty: 1 });
TrackSchema.index({ isActive: 1, language: 1, category: 1 });

// Virtuals
TrackSchema.virtual('totalChallenges').get(function () {
  return this.challenges?.length || 0;
});

TrackSchema.virtual('requiredChallenges').get(function () {
  return this.challenges?.filter((c: any) => !c.isOptional).length || 0;
});

TrackSchema.virtual('path').get(function () {
  return `/tracks/${this.language}/${this.slug}`;
});

TrackSchema.set('toJSON', { virtuals: true });
TrackSchema.set('toObject', { virtuals: true });