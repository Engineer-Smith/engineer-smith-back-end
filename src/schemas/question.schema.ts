import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type QuestionDocument = Question & Document;

// Valid enums
export const QUESTION_TYPES = [
  'multipleChoice',
  'trueFalse',
  'codeChallenge',
  'fillInTheBlank',
  'dragDropCloze',
  'codeDebugging',
] as const;

export const LANGUAGES = [
  'javascript',
  'css',
  'html',
  'sql',
  'dart',
  'react',
  'reactNative',
  'flutter',
  'express',
  'python',
  'typescript',
  'json',
  'swift',
  'swiftui',
] as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const CATEGORIES = ['logic', 'ui', 'syntax'] as const;
export const STATUSES = ['draft', 'active', 'archived'] as const;
export const RUNTIMES = ['node', 'python', 'sql', 'dart'] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];
export type Language = (typeof LANGUAGES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type Category = (typeof CATEGORIES)[number];
export type QuestionStatus = (typeof STATUSES)[number];
export type Runtime = (typeof RUNTIMES)[number];

// Valid language-category combinations
export const VALID_COMBINATIONS: Record<string, string[]> = {
  html: ['ui', 'syntax'],
  css: ['ui', 'syntax'],
  react: ['ui', 'syntax'],
  flutter: ['ui', 'syntax'],
  reactNative: ['ui', 'syntax'],
  swiftui: ['ui', 'syntax'],
  javascript: ['logic', 'syntax'],
  typescript: ['logic', 'syntax'],
  python: ['logic', 'syntax'],
  sql: ['logic', 'syntax'],
  dart: ['logic', 'syntax'],
  swift: ['ui', 'syntax'],
  express: ['logic', 'syntax'],
  json: ['syntax'],
};

// Valid language+category+type combinations
export const VALID_TYPE_COMBINATIONS: Record<string, Record<string, string[]>> = {
  html: {
    ui: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  css: {
    ui: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  react: {
    ui: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  flutter: {
    ui: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  reactNative: {
    ui: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  javascript: {
    logic: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze', 'codeChallenge', 'codeDebugging'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  typescript: {
    logic: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze', 'codeChallenge', 'codeDebugging'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  python: {
    logic: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze', 'codeChallenge', 'codeDebugging'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  sql: {
    logic: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze', 'codeChallenge'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  dart: {
    logic: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze', 'codeChallenge', 'codeDebugging'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  express: {
    logic: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze', 'codeChallenge', 'codeDebugging'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  json: {
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  swift: {
    ui: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
  swiftui: {
    ui: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
    syntax: ['multipleChoice', 'trueFalse', 'fillInTheBlank', 'dragDropCloze'],
  },
};

// Runtime map for auto-setting
export const LANGUAGE_RUNTIME_MAP: Partial<Record<Language, Runtime>> = {
  javascript: 'node',
  typescript: 'node',
  react: 'node',
  reactNative: 'node',
  express: 'node',
  python: 'python',
  sql: 'sql',
  dart: 'dart',
};

@Schema({
  timestamps: true,
  collection: 'questions',
})
export class Question {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, enum: QUESTION_TYPES })
  type: QuestionType;

  @Prop({ required: true, enum: LANGUAGES })
  language: Language;

  @Prop({ enum: CATEGORIES })
  category?: Category;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', default: null })
  organizationId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isGlobal: boolean;

  // Multiple Choice / True False fields
  @Prop({ type: [String] })
  options?: string[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  correctAnswer?: number;

  // Code config for logic codeChallenge and codeDebugging
  @Prop({
    type: {
      runtime: { type: String, enum: RUNTIMES },
      entryFunction: { type: String },
      timeoutMs: { type: Number, default: 3000 },
      allowPreview: { type: Boolean, default: true },
    },
  })
  codeConfig?: {
    runtime?: Runtime;
    entryFunction?: string;
    timeoutMs?: number;
    allowPreview?: boolean;
  };

  // Test cases for logic codeChallenge and codeDebugging
  @Prop({
    type: [
      {
        name: { type: String, default: 'Test case' },
        args: [MongooseSchema.Types.Mixed],
        expected: MongooseSchema.Types.Mixed,
        hidden: { type: Boolean, default: false },
        // SQL-specific
        schemaSql: { type: String },
        seedSql: { type: String },
        expectedRows: [MongooseSchema.Types.Mixed],
        orderMatters: { type: Boolean },
      },
    ],
  })
  testCases?: Array<{
    name?: string;
    args: any[];
    expected: any;
    hidden: boolean;
    schemaSql?: string;
    seedSql?: string;
    expectedRows?: any[];
    orderMatters?: boolean;
  }>;

  // Template for fill-in-the-blank questions
  @Prop()
  codeTemplate?: string;

  // Blanks configuration for fill-in-the-blank and dragDropCloze
  // For fillInTheBlank: correctAnswers contains acceptable text answers
  // For dragDropCloze: correctAnswers contains the correct dragOptions.id
  @Prop({
    type: [
      {
        id: { type: String, required: true },
        correctAnswers: { type: [String], required: true },
        caseSensitive: { type: Boolean, default: true },
        hint: { type: String },
        points: { type: Number, default: 1 },
      },
    ],
  })
  blanks?: Array<{
    id: string;
    correctAnswers: string[];
    caseSensitive?: boolean;
    hint?: string;
    points?: number;
  }>;

  // Draggable options for dragDropCloze questions (includes distractors)
  // Options are not reusable - once dragged to a blank, removed from pool
  @Prop({
    type: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
  })
  dragOptions?: Array<{
    id: string;
    text: string;
  }>;

  // Buggy code for debugging questions
  @Prop()
  buggyCode?: string;

  // Solution code for debugging questions
  @Prop()
  solutionCode?: string;

  @Prop({ required: true, enum: DIFFICULTIES })
  difficulty: Difficulty;

  @Prop({ enum: STATUSES, default: 'draft' })
  status: QuestionStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: {
      timesUsed: { type: Number, default: 0 },
      totalAttempts: { type: Number, default: 0 },
      correctAttempts: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
    },
    default: {
      timesUsed: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      successRate: 0,
      averageTime: 0,
    },
  })
  usageStats: {
    timesUsed: number;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime: number;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Indexes
QuestionSchema.index({ organizationId: 1 });
QuestionSchema.index({ isGlobal: 1 });
QuestionSchema.index({ type: 1 });
QuestionSchema.index({ language: 1 });
QuestionSchema.index({ category: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ status: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ language: 1, category: 1 });
QuestionSchema.index({ type: 1, category: 1 });
QuestionSchema.index({ language: 1, category: 1, type: 1 });

// Pre-save hook to auto-set runtime (Mongoose 7+ style - no next callback)
QuestionSchema.pre('save', function () {
  if (
    (this.type === 'codeChallenge' || this.type === 'codeDebugging') &&
    this.category === 'logic' &&
    !this.codeConfig?.runtime
  ) {
    if (!this.codeConfig) {
      this.codeConfig = {};
    }
    this.codeConfig.runtime = LANGUAGE_RUNTIME_MAP[this.language] ?? 'node';
  }
});
