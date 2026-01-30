// src/types/test.ts - Test creation and management (core domain types)
import type {
  Language,
  Tags,
  TestType,
  TestStatus,
  BaseEntity,
  Timestamped,
  UserAudited,
  OrganizationScoped
} from './common';

// =====================
// TEST CONFIGURATION (matches backend Test.js settings)
// =====================

export interface TestSettings {
  timeLimit: number; // Minutes - required
  attemptsAllowed: number; // Required
  shuffleQuestions: boolean;
  useSections: boolean;
  
  // Additional settings (optional - not in current backend but commonly used)
  passingThreshold?: number; // Percentage (0-100) - default 70%
  showResultsImmediately?: boolean;
  allowReview?: boolean;
  preventCheating?: boolean;
  allowNavigateBack?: boolean;
  showQuestionNumbers?: boolean;
  randomizeAnswers?: boolean;
}

// =====================
// TEST CONTENT STRUCTURE (matches backend Test.js)
// =====================

export interface TestQuestionReference {
  questionId: string; // Required - ObjectId reference
  points: number; // Required - positive number
  order?: number; // Optional - for custom ordering (frontend only)
}

export interface TestSection {
  name: string; // Required - trim, non-empty
  timeLimit: number; // Required - positive number in minutes
  description?: string; // Optional
  questions: TestQuestionReference[]; // Required - at least one question
  order?: number; // Optional - for section ordering (frontend only)
}

// =====================
// TEST STATISTICS (matches backend Test.js stats)
// =====================

export interface TestStats {
  totalAttempts: number;
  averageScore: number; // Rounded to 2 decimal places
  passRate: number; // Rounded to 4 decimal places (percentage as decimal)
  
  // Extended stats (computed on frontend)
  averageTimeSpent?: number; // Minutes
  completionRate?: number; // Percentage
  mostMissedQuestions?: Array<{
    questionId: string;
    questionTitle: string;
    missRate: number; // Percentage
  }>;
  difficultyRating?: number; // 1-10 scale based on success rates
}

// =====================
// MAIN TEST MODEL (matches backend Test.js exactly)
// =====================

export interface Test extends BaseEntity, Timestamped, UserAudited, OrganizationScoped {
  title: string;
  description: string;
  testType: TestType;
  languages: Language[];
  tags: Tags[];
  settings: TestSettings;
  
  // Content structure - only one will be present based on settings.useSections
  sections?: TestSection[]; // When useSections = true
  questions?: TestQuestionReference[]; // When useSections = false
  
  status: TestStatus;
  stats: TestStats;
  
  // Additional backend fields that might be in responses
  isGlobal: boolean;
}

// =====================
// TEST CREATION TYPES (API requests)
// =====================

export interface CreateTestRequest {
  title: string;
  description: string;
  testType: TestType;
  languages: Language[];
  tags: Tags[];
  settings: TestSettings;
  
  // Content - include the appropriate one based on settings.useSections
  sections?: TestSection[];
  questions?: TestQuestionReference[];
  
  status?: TestStatus; // Optional - defaults to 'draft'
  
  // Note: isGlobal and organizationId determined by backend based on user permissions
}

export interface UpdateTestRequest {
  title?: string;
  description?: string;
  testType?: TestType;
  languages?: Language[];
  tags?: Tags[];
  settings?: Partial<TestSettings>; // Allow partial updates to settings
  sections?: TestSection[];
  questions?: TestQuestionReference[];
  status?: TestStatus;
}

// =====================
// TEST FILTERING (matches backend validation)
// =====================

export interface TestFilters {
  // Organization and access filters
  orgId?: string;
  isGlobal?: boolean | 'true' | 'false'; // String for query params
  
  // Content filters
  testType?: TestType;
  language?: Language; // Single language for backend compatibility
  tag?: Tags; // Single tag for backend compatibility
  status?: TestStatus;
  
  // Search and text filters
  search?: string; // Free text search across title/description
  
  // Pagination
  limit?: number; // 1-100, defaults to 10
  skip?: number; // Defaults to 0
  
  // Sorting (backend doesn't implement these yet, but common patterns)
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'stats.averageScore';
  sortOrder?: 'asc' | 'desc';
  
  // Additional filters for frontend
  createdBy?: string;
  difficulty?: 'easy' | 'medium' | 'hard'; // Computed filter
  hasQuestions?: boolean; // Has at least one question
  hasSections?: boolean; // Uses sections
}

export interface TestSearchResponse {
  tests: Test[];
  totalCount?: number; // Only if includeTotalCount=true
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// =====================
// TEST PREVIEW (for test selection/browsing)
// =====================

export interface TestPreview {
  _id: string;
  title: string;
  description: string;
  testType: TestType;
  languages: Language[];
  tags: Tags[];
  status: TestStatus;
  isGlobal: boolean;
  organizationId?: string;
  
  // Computed preview data
  totalQuestions: number;
  totalPoints: number;
  estimatedDuration: number; // Minutes
  difficulty: 'easy' | 'medium' | 'hard'; // Computed from questions
  
  // Essential settings for preview
  settings: {
    timeLimit: number;
    attemptsAllowed: number;
    useSections: boolean;
  };
  
  // Stats preview
  stats: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

// =====================
// TEST WITH POPULATED QUESTIONS (for taking tests)
// =====================

export interface TestWithQuestions extends Omit<Test, 'sections' | 'questions'> {
  sections?: TestSectionWithQuestions[];
  questions?: TestQuestionWithData[];
}

export interface TestSectionWithQuestions extends Omit<TestSection, 'questions'> {
  questions: TestQuestionWithData[];
}

export interface TestQuestionWithData extends TestQuestionReference {
  questionData: {
    _id: string;
    title: string;
    description: string;
    type: 'multipleChoice' | 'trueFalse' | 'codeChallenge' | 'fillInTheBlank' | 'codeDebugging';
    language: Language;
    category?: 'logic' | 'ui' | 'syntax';
    difficulty: 'easy' | 'medium' | 'hard';
    tags: Tags[];
    
    // Student-visible content (varies by question type)
    options?: string[];
    codeTemplate?: string;
    buggyCode?: string;
    testCases?: Array<{
      name: string;
      args: any[];
      expected: any;
      hidden: boolean;
    }>;
    blanks?: Array<{
      id: string;
      hint?: string;
      points: number;
    }>;
    
    // Instructor/admin only fields (not included for students)
    correctAnswer?: any;
    codeConfig?: any;
    solutionCode?: string;
  };
}

// =====================
// TEST TEMPLATES (base template interface)
// =====================

export interface TestTemplate {
  id: TestType;
  name: string;
  description: string;
  languages: Language[];
  tags: Tags[];
  defaultSettings: TestSettings;
  
  // Template metadata
  estimatedDuration: number; // Minutes
  suggestedQuestionCount: number;
  targetAudience: string; // e.g., "Beginner developers"
  prerequisites?: string[];
}

// =====================
// TEST ANALYTICS AND INSIGHTS
// =====================

export interface TestAnalytics {
  testId: string;
  testTitle: string;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  
  // Performance metrics
  totalAttempts: number;
  totalCompletions: number;
  completionRate: number; // Percentage
  averageScore: number;
  medianScore: number;
  passRate: number; // Percentage
  
  // Time metrics
  averageCompletionTime: number; // Minutes
  medianCompletionTime: number; // Minutes
  timeEfficiency: number; // Average % of time limit used
  
  // Question-level insights
  questionAnalytics: Array<{
    questionId: string;
    questionTitle: string;
    successRate: number;
    averageTime: number; // Seconds
    skipRate: number; // Percentage
    flagRate: number; // Percentage
  }>;
  
  // Section-level insights (for sectioned tests)
  sectionAnalytics?: Array<{
    sectionIndex: number;
    sectionName: string;
    averageScore: number;
    successRate: number;
    averageTime: number; // Minutes
    dropoffRate: number; // Percentage who didn't complete this section
  }>;
  
  // Performance distributions
  scoreDistribution: Array<{
    range: string; // e.g., "0-10", "11-20"
    count: number;
    percentage: number;
  }>;
  
  timeDistribution: Array<{
    range: string; // e.g., "0-15", "16-30" (minutes)
    count: number;
    percentage: number;
  }>;
  
  // Trends (if historical data available)
  trends?: {
    scoreTrend: 'improving' | 'declining' | 'stable';
    completionTrend: 'improving' | 'declining' | 'stable';
    participationTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

// =====================
// TEST VALIDATION
// =====================

export interface TestValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalQuestions: number;
    totalPoints: number;
    estimatedDuration: number;
    sectionsCount: number;
  };
}

// =====================
// UTILITY TYPES
// =====================

export interface TestDraft extends Partial<Test> {
  _id?: string; // Optional for new drafts
  title: string; // Required even for drafts
  status: 'draft';
}

// =====================
// API RESPONSE WRAPPERS
// =====================

export interface CreateTestResponse {
  success: boolean;
  test: Test;
  message?: string;
}

export interface UpdateTestResponse {
  success: boolean;
  test: Test;
  message?: string;
}

export interface DeleteTestResponse {
  success: boolean;
  message: string;
}

export interface TestValidationResponse {
  success: boolean;
  validation: TestValidationResult;
  test?: Test; // Included if validation passed and test was created
}

// =====================
// TYPE GUARDS
// =====================

/**
 * Check if test uses sections
 */
export const isUsingSections = (test: Test | CreateTestRequest): boolean => {
  return test.settings.useSections;
};

/**
 * Check if test has questions configured
 */
export const hasQuestions = (test: Test): boolean => {
  if (isUsingSections(test)) {
    return !!(test.sections?.length && test.sections.every(s => s.questions.length > 0));
  } else {
    return !!(test.questions?.length);
  }
};

/**
 * Check if test is ready for activation
 */
export const isReadyForActivation = (test: Test): boolean => {
  return hasQuestions(test) && 
         test.title.trim().length > 0 && 
         test.description.trim().length > 0 &&
         test.settings.timeLimit > 0 &&
         test.settings.attemptsAllowed > 0;
};

/**
 * Check if test is global
 */
export const isGlobalTest = (test: Test): boolean => {
  return test.isGlobal;
};

/**
 * Type guard for sectioned tests
 */
export const isSectionedTest = (test: Test): test is Test & { sections: TestSection[] } => {
  return isUsingSections(test) && !!test.sections;
};

/**
 * Type guard for non-sectioned tests
 */
export const isNonSectionedTest = (test: Test): test is Test & { questions: TestQuestionReference[] } => {
  return !isUsingSections(test) && !!test.questions;
};

// =====================
// UTILITY FUNCTIONS
// =====================

/**
 * Calculate total questions in test
 */
export const getTotalQuestions = (test: Test | CreateTestRequest): number => {
  if (isUsingSections(test)) {
    return test.sections?.reduce((total, section) => total + section.questions.length, 0) || 0;
  } else {
    return test.questions?.length || 0;
  }
};

/**
 * Calculate total points in test
 */
export const getTotalPoints = (test: Test | CreateTestRequest): number => {
  if (isUsingSections(test)) {
    return test.sections?.reduce((total, section) => 
      total + section.questions.reduce((sectionTotal, q) => sectionTotal + q.points, 0), 0
    ) || 0;
  } else {
    return test.questions?.reduce((total, q) => total + q.points, 0) || 0;
  }
};

/**
 * Estimate test duration based on questions and time limits
 */
export const estimateTestDuration = (test: Test): number => {
  const questionCount = getTotalQuestions(test);
  const timeLimit = test.settings.timeLimit;
  
  // Use the smaller of: time limit or estimated time based on questions
  const estimatedTime = Math.max(questionCount * 2, 15); // 2 min per question, min 15 min
  return Math.min(timeLimit, estimatedTime);
};

/**
 * Calculate difficulty rating based on stats
 */
export const getDifficultyRating = (stats: TestStats): 'easy' | 'medium' | 'hard' => {
  const passRate = stats.passRate * 100; // Convert decimal to percentage
  
  if (passRate >= 80) return 'easy';
  if (passRate >= 60) return 'medium';
  return 'hard';
};

/**
 * Format test for preview
 */
export const toTestPreview = (test: Test): TestPreview => ({
  _id: test._id,
  title: test.title,
  description: test.description,
  testType: test.testType,
  languages: test.languages,
  tags: test.tags,
  status: test.status,
  isGlobal: test.isGlobal,
  organizationId: test.organizationId,
  totalQuestions: getTotalQuestions(test),
  totalPoints: getTotalPoints(test),
  estimatedDuration: estimateTestDuration(test),
  difficulty: getDifficultyRating(test.stats),
  settings: {
    timeLimit: test.settings.timeLimit,
    attemptsAllowed: test.settings.attemptsAllowed,
    useSections: test.settings.useSections,
  },
  stats: {
    totalAttempts: test.stats.totalAttempts,
    averageScore: test.stats.averageScore,
    passRate: test.stats.passRate,
  },
  createdAt: test.createdAt,
  updatedAt: test.updatedAt,
});

/**
 * Validate test data before submission
 */
export const validateTest = (test: CreateTestRequest | UpdateTestRequest): TestValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  if ('title' in test && !test.title?.trim()) {
    errors.push('Test title is required');
  }
  
  if ('description' in test && !test.description?.trim()) {
    errors.push('Test description is required');
  }
  
  // Settings validation
  if (test.settings) {
    if (test.settings.timeLimit !== undefined && test.settings.timeLimit <= 0) {
      errors.push('Time limit must be greater than 0');
    }
    if (test.settings.attemptsAllowed !== undefined && test.settings.attemptsAllowed <= 0) {
      errors.push('Attempts allowed must be greater than 0');
    }
  }
  
  // Content validation
  let totalQuestions = 0;
  let totalPoints = 0;
  
  if (test.settings?.useSections) {
    if (!test.sections?.length) {
      errors.push('At least one section is required when using sections');
    } else {
      test.sections.forEach((section, index) => {
        if (!section.name?.trim()) {
          errors.push(`Section ${index + 1} name is required`);
        }
        if (section.timeLimit <= 0) {
          errors.push(`Section ${index + 1} time limit must be greater than 0`);
        }
        if (!section.questions?.length) {
          errors.push(`Section ${index + 1} must have at least one question`);
        } else {
          totalQuestions += section.questions.length;
          totalPoints += section.questions.reduce((sum, q) => sum + q.points, 0);
        }
      });
    }
  } else {
    if (!test.questions?.length) {
      errors.push('At least one question is required');
    } else {
      totalQuestions = test.questions.length;
      totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
    }
  }
  
  // Warnings
  if (totalQuestions < 5) {
    warnings.push('Consider adding more questions for a comprehensive assessment');
  }
  
  if (totalPoints === 0) {
    warnings.push('No points assigned to questions');
  }
  
  const estimatedDuration = Math.max(totalQuestions * 2, 15);
  if (test.settings && test.settings.timeLimit !== undefined && test.settings.timeLimit < estimatedDuration) {
    warnings.push(`Time limit may be insufficient. Consider at least ${estimatedDuration} minutes`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalQuestions,
      totalPoints,
      estimatedDuration,
      sectionsCount: test.settings?.useSections ? (test.sections?.length || 0) : 0,
    },
  };
};