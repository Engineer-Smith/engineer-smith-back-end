// src/types/question.ts - Built from scratch to match backend Question model
import type {
  Language,
  QuestionCategory,
  QuestionType,
  Difficulty,
  TestStatus,
  Tags,
  BaseEntity,
  Timestamped,
  UserAudited,
  OrganizationScoped,
  ConsoleLog
} from './common';

// =====================
// MAIN QUESTION INTERFACE - EXACT BACKEND MODEL
// =====================

export interface Question extends BaseEntity, Timestamped, UserAudited, OrganizationScoped {
  title: string;
  description: string;
  type: QuestionType;
  language: Language;
  difficulty: Difficulty;
  status: TestStatus;
  tags: Tags[];

  // Category is required for code questions: codeChallenge, fillInTheBlank, codeDebugging
  category?: QuestionCategory;

  // Multiple Choice / True False fields
  options?: string[];
  correctAnswer?: any; // Mixed type in backend - number for MC, boolean for TF

  // Fill-in-the-blank template and blanks
  codeTemplate?: string;
  blanks?: Array<{
    id?: string; // Backend uses 'id', not '_id'
    correctAnswers: string[];
    caseSensitive?: boolean;
    hint?: string;
    points?: number;
  }>;

  // Drag-drop cloze fields
  dragOptions?: Array<{
    id: string;
    text: string;
  }>;

  // Code execution config (for logic code questions)
  // Note: Swift no longer supports code execution - only node, python, sql, dart
  codeConfig?: {
    runtime?: 'node' | 'python' | 'sql' | 'dart';
    entryFunction?: string;
    timeoutMs?: number;
    allowPreview?: boolean;
  };

  // Test cases (for logic code questions)
  testCases?: Array<{
    name?: string;
    args: any[];
    expected: any;
    hidden?: boolean;
  }>;

  // Code challenge fields
  starterCode?: string;

  // Code debugging fields
  buggyCode?: string;
  solutionCode?: string;
  hints?: string[];

  // Usage statistics (always present in backend responses)
  usageStats?: {
    timesUsed: number;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime: number;
  };
}

// =====================
// CREATE QUESTION REQUEST - WHAT FRONTEND SENDS
// =====================

export interface CreateQuestionData {
  title: string;
  description: string;
  type: QuestionType;
  language: Language;
  difficulty: Difficulty;
  status?: TestStatus;
  tags?: Tags[];
  isGlobal?: boolean;

  // Category for code questions
  category?: QuestionCategory;

  // Multiple choice/True false
  options?: string[];
  correctAnswer?: any;

  // Fill-in-the-blank
  codeTemplate?: string;
  blanks?: Array<{
    id?: string
    correctAnswers: string[];
    caseSensitive?: boolean;
    hint?: string;
    points?: number;
  }>;

  // Drag-drop cloze fields
  dragOptions?: Array<{
    id: string;
    text: string;
  }>;

  // Code execution
  codeConfig?: {
    entryFunction?: string;
    runtime?: 'node' | 'python' | 'sql' | 'dart';
    timeoutMs?: number;
    allowPreview?: boolean;
  };

  testCases?: Array<{
    name?: string;
    args: any[];
    expected: any;
    hidden?: boolean;
  }>;

  // Code challenge
  starterCode?: string;

  // Debugging
  buggyCode?: string;
  solutionCode?: string;
  hints?: string[];
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> { }

// =====================
// QUESTION TEST REQUEST/RESPONSE - EXACT BACKEND MATCH
// =====================

export interface QuestionTestRequest {
  questionData: {
    type: string;
    language: string;
    category?: string;
    testCases?: Array<{
      name?: string;
      args: any[];
      expected: any;
      hidden?: boolean;
    }>;
    codeConfig?: {
      runtime: string;
      entryFunction: string;
      timeoutMs?: number;
    };
  };
  testCode: string;
}

// Update your existing QuestionTestResult interface to include console logs
export interface QuestionTestResult {
  success: boolean;
  questionType: string;
  language: string;
  category?: string;
  entryFunction?: string;
  runtime?: string;
  testResults: Array<{
    testName?: string;
    testCaseIndex: number;
    passed: boolean;
    actualOutput?: string;
    expectedOutput?: string;
    executionTime?: number;
    consoleLogs?: ConsoleLog[]; // NEW: Console logs specific to this test case
    error?: string;
  }>;
  overallPassed: boolean;
  totalTestsPassed: number;
  totalTests: number;
  consoleLogs?: ConsoleLog[]; // NEW: All console logs from entire execution
  executionError?: string;
  compilationError?: string;
  timestamp: string;
}

// =====================
// QUESTION STATS RESPONSE - EXACT BACKEND MATCH
// =====================

export interface QuestionStatsResponse {
  byLanguage: Array<{
    language: string;
    count: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
    typeBreakdown: {
      multipleChoice: number;
      trueFalse: number;
      codeChallenge: number;
      fillInTheBlank: number;
      codeDebugging: number;
      dragDropCloze: number;
    };
    categoryBreakdown: {
      logic: number;
      ui: number;
      syntax: number;
    };
  }>;
  totals: {
    totalQuestions: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
    typeBreakdown: {
      multipleChoice: number;
      trueFalse: number;
      codeChallenge: number;
      fillInTheBlank: number;
      codeDebugging: number;
      dragDropCloze: number;
    };
    categoryBreakdown: {
      logic: number;
      ui: number;
      syntax: number;
    };
  };
}

// In testCasesStructure.ts, update your local type definitions:
export type TestCase = {
  name?: string;
  args: any[];
  expected: any;
  hidden?: boolean;
  // Remove: description, isExample
};

// Note: Swift removed from runtime options - no longer executable
export type CodeConfig = {
  runtime?: 'node' | 'python' | 'sql' | 'dart';
  entryFunction?: string;
  timeoutMs?: number;
  allowPreview?: boolean;
  // Remove: memoryLimitMB, allowedImports, restrictedKeywords
};

// =====================
// QUESTION LISTS - BACKEND RETURNS DIFFERENT SHAPES
// =====================

// Backend returns either Question[] or paginated object based on includeTotalCount
export type QuestionListResponse = Question[] | {
  questions: Question[];
  totalCount: number;
  totalPages: number;
};

export interface QuestionListItem {
  _id: string;
  title: string;
  description: string;
  type: QuestionType;
  language: Language;
  category?: QuestionCategory;
  difficulty: Difficulty;
  status: TestStatus;
  tags: Tags[];
  organizationId?: string;
  isGlobal?: boolean;
  createdAt: string;
}

// =====================
// QUESTION FILTERING
// =====================

export interface QuestionFilters {
  organizationId?: string;
  isGlobal?: string; // Backend expects string 'true'/'false'
  language?: string; // Comma-separated in backend
  category?: string; // Comma-separated in backend
  type?: string;
  difficulty?: string;
  tag?: string; // Comma-separated in backend
  status?: string;
  limit?: number;
  skip?: number;
  includeTotalCount?: string; // 'true' to get paginated response
}

// =====================
// VALIDATION UTILITIES
// =====================

export const validateQuestionBasics = (question: Partial<CreateQuestionData>): string[] => {
  const errors: string[] = [];

  if (!question.title?.trim()) errors.push('Title is required');
  if (!question.description?.trim()) errors.push('Description is required');
  if (!question.type) errors.push('Question type is required');
  if (!question.language) errors.push('Language is required');
  if (!question.difficulty) errors.push('Difficulty is required');

  return errors;
};

export const validateQuestionContent = (question: CreateQuestionData): string[] => {
  const errors: string[] = [];

  // Category validation for code questions
  const codeTypes: QuestionType[] = ['codeChallenge', 'fillInTheBlank', 'codeDebugging'];
  if (codeTypes.includes(question.type) && !question.category) {
    errors.push('Category is required for code questions');
  }

  switch (question.type) {
    case 'multipleChoice':
      if (!question.options || question.options.length < 2) {
        errors.push('At least 2 options required for multiple choice');
      }
      if (typeof question.correctAnswer !== 'number') {
        errors.push('Correct answer index required for multiple choice');
      }
      break;

    case 'trueFalse':
      if (typeof question.correctAnswer !== 'number' || ![0, 1].includes(question.correctAnswer)) {
        errors.push('Correct answer must be 0 (True) or 1 (False) for true/false questions');
      }
      break;

    case 'fillInTheBlank':
      if (!question.codeTemplate) {
        errors.push('Code template required for fill-in-the-blank');
      }
      if (!question.blanks || question.blanks.length === 0) {
        errors.push('At least one blank required for fill-in-the-blank');
      }
      break;

    case 'codeChallenge':
      if (question.category === 'logic') {
        if (!question.testCases || question.testCases.length === 0) {
          errors.push('Test cases required for logic code challenges');
        }
        if (!question.codeConfig?.entryFunction) {
          errors.push('Entry function required for logic code challenges');
        }
      }
      break;

    case 'codeDebugging':
      if (!question.buggyCode) errors.push('Buggy code required for debugging questions');
      if (!question.solutionCode) errors.push('Solution code required for debugging questions');
      if (question.category === 'logic') {
        if (!question.testCases || question.testCases.length === 0) {
          errors.push('Test cases required for logic debugging questions');
        }
        if (!question.codeConfig?.entryFunction) {
          errors.push('Entry function required for logic debugging questions');
        }
      }
      break;
  }

  return errors;
};

export const validateQuestionData = (question: CreateQuestionData): string[] => {
  return [
    ...validateQuestionBasics(question),
    ...validateQuestionContent(question)
  ];
};

export const isQuestionValid = (question: CreateQuestionData): boolean => {
  return validateQuestionData(question).length === 0;
};

// =====================
// QUESTION TYPE CONFIG - FOR UI
// =====================

export interface QuestionTypeConfig {
  type: QuestionType;
  name: string;
  description: string;
  icon: string;
  autoGradeable: boolean;
  supportedCategories: QuestionCategory[];
  requiredFields: string[];
}

export const getQuestionTypeConfig = (type: QuestionType): QuestionTypeConfig => {
  const configs: Record<QuestionType, QuestionTypeConfig> = {
    multipleChoice: {
      type: 'multipleChoice',
      name: 'Multiple Choice',
      description: 'Question with multiple options, one correct answer',
      icon: 'list',
      autoGradeable: true,
      supportedCategories: [],
      requiredFields: ['options', 'correctAnswer']
    },
    trueFalse: {
      type: 'trueFalse',
      name: 'True/False',
      description: 'Question with true or false answer',
      icon: 'check-x',
      autoGradeable: true,
      supportedCategories: [],
      requiredFields: ['correctAnswer']
    },
    codeChallenge: {
      type: 'codeChallenge',
      name: 'Code Challenge',
      description: 'Write code to solve a programming problem',
      icon: 'code',
      autoGradeable: true,
      supportedCategories: ['syntax', 'logic', 'debugging', 'concept', 'best-practice'],
      requiredFields: ['codeConfig', 'testCases']
    },
    fillInTheBlank: {
      type: 'fillInTheBlank',
      name: 'Fill in the Blank',
      description: 'Complete missing parts of code',
      icon: 'square-dashed',
      autoGradeable: true,
      supportedCategories: ['syntax', 'logic', 'debugging', 'concept', 'best-practice', 'ui'],
      requiredFields: ['codeTemplate', 'blanks']
    },
    codeDebugging: {
      type: 'codeDebugging',
      name: 'Code Debugging',
      description: 'Fix bugs in provided code',
      icon: 'bug',
      autoGradeable: true,
      supportedCategories: ['syntax', 'logic', 'debugging', 'concept', 'best-practice'],
      requiredFields: ['buggyCode', 'solutionCode', 'codeConfig', 'testCases']
    },
    dragDropCloze: {
      type: 'dragDropCloze',
      name: 'Drag & Drop Cloze',
      description: 'Drag options into blanks to complete code',
      icon: 'grip-vertical',
      autoGradeable: true,
      supportedCategories: ['syntax', 'logic', 'ui'],
      requiredFields: ['codeTemplate', 'blanks', 'dragOptions']
    }
  };

  return configs[type];
};