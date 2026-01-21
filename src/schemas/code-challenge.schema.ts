// src/schemas/code-challenge.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CodeChallengeDocument = CodeChallenge & Document;

// Sub-schemas
@Schema({ _id: false })
class Example {
  @Prop()
  input: string;

  @Prop()
  output: string;

  @Prop()
  explanation?: string;
}

@Schema({ _id: false })
class LanguageCodeConfig {
  @Prop({ default: 'node' })
  runtime: string;

  @Prop()
  entryFunction?: string;

  @Prop({ default: 3000 })
  timeoutMs: number;
}

@Schema({ _id: false })
class CodeConfig {
  @Prop({ type: LanguageCodeConfig })
  javascript?: LanguageCodeConfig;

  @Prop({ type: LanguageCodeConfig })
  python?: LanguageCodeConfig;

  @Prop({ type: LanguageCodeConfig })
  dart?: LanguageCodeConfig;

  @Prop({ type: LanguageCodeConfig })
  sql?: LanguageCodeConfig;
}

@Schema({ _id: false })
class StartingCode {
  @Prop()
  javascript?: string;

  @Prop()
  python?: string;

  @Prop()
  dart?: string;

  @Prop()
  sql?: string;
}

@Schema({ _id: false })
class SolutionCode {
  @Prop()
  javascript?: string;

  @Prop()
  python?: string;

  @Prop()
  dart?: string;

  @Prop()
  sql?: string;
}

@Schema({ _id: false })
class TestCase {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  args: any[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  expected: any;

  @Prop({ default: false })
  hidden: boolean;
}

@Schema({ _id: false })
class UsageStats {
  @Prop({ default: 0 })
  totalAttempts: number;

  @Prop({ default: 0 })
  successfulSolutions: number;

  @Prop({ default: 0 })
  averageAttempts: number;

  @Prop({ default: 0 })
  averageTime: number;

  @Prop({ default: 0 })
  successRate: number;
}

@Schema({
  timestamps: true,
  collection: 'codechallenges',
})
export class CodeChallenge {
  @Prop({ required: true, trim: true })
  title: string;

  // NOTE: Removed sparse: true from here - it's defined in the explicit index below
  // sparse in @Prop creates a duplicate index
  @Prop({ lowercase: true, trim: true })
  slug?: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  problemStatement: string;

  @Prop({ required: true, enum: ['easy', 'medium', 'hard'] })
  difficulty: string;

  @Prop({ type: [String], enum: ['javascript', 'python', 'dart', 'sql'], required: true })
  supportedLanguages: string[];

  @Prop({ type: [String] })
  topics: string[];

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: [String] })
  companyTags: string[];

  @Prop({ type: [Example] })
  examples: Example[];

  @Prop({ type: [String] })
  constraints: string[];

  @Prop({ type: CodeConfig })
  codeConfig: CodeConfig;

  @Prop({ type: StartingCode })
  startingCode: StartingCode;

  @Prop({ type: SolutionCode })
  solutionCode: SolutionCode;

  @Prop({ type: [TestCase] })
  testCases: TestCase[];

  @Prop()
  timeComplexity?: string;

  @Prop()
  spaceComplexity?: string;

  @Prop({ type: [String] })
  hints: string[];

  @Prop()
  editorial?: string;

  @Prop({ enum: ['draft', 'active', 'archived'], default: 'active' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId;

  @Prop({ default: true })
  isGlobal: boolean;

  @Prop({ type: UsageStats, default: () => ({}) })
  usageStats: UsageStats;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const CodeChallengeSchema = SchemaFactory.createForClass(CodeChallenge);

// Pre-save hook: generate slug from title
CodeChallengeSchema.pre('save', function () {
  if ((this.isModified('title') || this.isNew) && this.title) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `challenge-${this._id}`;
  }
});

// Indexes
CodeChallengeSchema.index({ slug: 1 }, { unique: true, sparse: true });
CodeChallengeSchema.index({ difficulty: 1 });
CodeChallengeSchema.index({ supportedLanguages: 1 });
CodeChallengeSchema.index({ topics: 1 });
CodeChallengeSchema.index({ tags: 1 });
CodeChallengeSchema.index({ status: 1 });
CodeChallengeSchema.index({ createdAt: -1 });
CodeChallengeSchema.index({ difficulty: 1, supportedLanguages: 1 });
CodeChallengeSchema.index({ status: 1, difficulty: 1 });
CodeChallengeSchema.index({ organizationId: 1, status: 1 });

// Virtuals
CodeChallengeSchema.virtual('url').get(function () {
  return `/challenges/${this.slug}`;
});

CodeChallengeSchema.virtual('difficultyColor').get(function () {
  const colors: Record<string, string> = {
    easy: 'green',
    medium: 'orange',
    hard: 'red',
  };
  return colors[this.difficulty] || 'gray';
});

CodeChallengeSchema.set('toJSON', { virtuals: true });
CodeChallengeSchema.set('toObject', { virtuals: true });