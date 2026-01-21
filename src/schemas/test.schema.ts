// src/schemas/test.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { VALID_TAGS } from '../constants/tags';

export type TestDocument = Test & Document;

// Sub-schemas
@Schema({ _id: false })
export class TestQuestionRef {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  points: number;
}

export const TestQuestionRefSchema = SchemaFactory.createForClass(TestQuestionRef);

@Schema({ _id: false })
export class TestSection {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: Number, required: true })
  timeLimit: number; // Minutes

  @Prop({ type: [TestQuestionRefSchema], default: [] })
  questions: TestQuestionRef[];
}

export const TestSectionSchema = SchemaFactory.createForClass(TestSection);

@Schema({ _id: false })
export class TestSettings {
  @Prop({ type: Number, required: true })
  timeLimit: number; // Minutes

  @Prop({ type: Number, required: true })
  attemptsAllowed: number;

  @Prop({ type: Boolean, default: false })
  shuffleQuestions: boolean;

  @Prop({ type: Boolean, default: false })
  useSections: boolean;
}

export const TestSettingsSchema = SchemaFactory.createForClass(TestSettings);

@Schema({ _id: false })
export class TestStats {
  @Prop({ type: Number, default: 0 })
  totalAttempts: number;

  @Prop({ type: Number, default: 0 })
  averageScore: number;

  @Prop({ type: Number, default: 0 })
  passRate: number;
}

export const TestStatsSchema = SchemaFactory.createForClass(TestStats);

// Main Test Schema
@Schema({
  timestamps: true,
  collection: 'tests',
})
export class Test {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop({
    type: String,
    enum: ['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'],
    default: 'custom',
  })
  testType: string;

  @Prop({
    type: [String],
    enum: ['javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'],
    default: [],
  })
  languages: string[];

  @Prop({
    type: [String],
    enum: VALID_TAGS,
    default: [],
  })
  tags: string[];

  @Prop({ type: TestSettingsSchema, required: true })
  settings: TestSettings;

  @Prop({ type: [TestSectionSchema], default: undefined })
  sections?: TestSection[];

  @Prop({ type: [TestQuestionRefSchema], default: undefined })
  questions?: TestQuestionRef[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', default: null })
  organizationId: Types.ObjectId | null;

  @Prop({ type: Boolean, default: false })
  isGlobal: boolean;

  @Prop({
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: TestStatsSchema, default: () => ({ totalAttempts: 0, averageScore: 0, passRate: 0 }) })
  stats: TestStats;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const TestSchema = SchemaFactory.createForClass(Test);

// Add indexes
TestSchema.index({ organizationId: 1 });
TestSchema.index({ isGlobal: 1 });
TestSchema.index({ status: 1 });
TestSchema.index({ createdBy: 1 });
TestSchema.index({ testType: 1 });
TestSchema.index({ languages: 1 });
TestSchema.index({ tags: 1 });