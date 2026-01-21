// src/question/shared/interfaces.ts
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';
import type { QuestionDocument } from '../../schemas/question.schema';

/**
 * Result of creating a question
 */
export interface CreateQuestionResult {
  success: boolean;
  question: FormattedQuestion;
  message: string;
}

/**
 * Result of updating a question
 */
export interface UpdateQuestionResult {
  success: boolean;
  question: FormattedQuestion;
  message: string;
}

/**
 * Formatted question for API response
 */
export interface FormattedQuestion {
  id: string;
  title: string;
  description: string;
  type: string;
  language: string;
  category?: string;
  difficulty: string;
  status: string;
  tags: string[];
  isGlobal: boolean;
  organizationId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageStats: {
    timesUsed: number;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime: number;
  };
  // Type-specific fields (only present for relevant types)
  options?: string[];
  correctAnswer?: number;
  codeConfig?: {
    runtime?: string;
    entryFunction?: string;
    timeoutMs?: number;
    allowPreview?: boolean;
  };
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
  codeTemplate?: string;
  blanks?: Array<{
    id: string;
    correctAnswers: string[];
    caseSensitive?: boolean;
    hint?: string;
    points?: number;
  }>;
  buggyCode?: string;
  solutionCode?: string;
}

/**
 * Interface for type-specific question services
 */
export interface QuestionTypeService {
  create(data: any, user: RequestUser): Promise<CreateQuestionResult>;
  update(questionId: string, data: any, user: RequestUser): Promise<UpdateQuestionResult>;
  validate(data: any, mode: 'create' | 'update'): ValidationResult;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Test case for code questions
 */
export interface TestCase {
  name?: string;
  args: any[];
  expected: any;
  hidden: boolean;
  // SQL-specific
  schemaSql?: string;
  seedSql?: string;
  expectedRows?: any[];
  orderMatters?: boolean;
}

/**
 * Code configuration
 */
export interface CodeConfig {
  runtime?: string;
  entryFunction?: string;
  timeoutMs?: number;
  allowPreview?: boolean;
}

/**
 * Blank for fill-in-the-blank questions
 */
export interface Blank {
  id: string;
  correctAnswers: string[];
  caseSensitive?: boolean;
  hint?: string;
  points?: number;
}
