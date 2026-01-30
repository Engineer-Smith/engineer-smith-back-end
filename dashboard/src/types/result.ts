// src/types/result.ts - CORRECTED to match actual backend Result.js model
import type {
  BaseEntity,
  Language,
  QuestionType,
  SessionStatus,
  Timestamped
} from './common';

// =====================
// CORE RESULT TYPES - CORRECTED TO MATCH BACKEND
// =====================

/**
 * Main Result document - matches backend Result.js model exactly
 */
export interface Result extends BaseEntity, Timestamped {
  sessionId: string;
  testId: string;
  userId: string;
  organizationId: string;
  attemptNumber: number;
  status: SessionStatus; // 'completed' | 'expired' | 'abandoned'
  completedAt?: string; // Optional - only set for completed results
  timeSpent: number; // Seconds
  questions: ResultQuestion[];
  score: ResultScore;

  // ✅ ADDED: Manual scoring tracking fields (from your updated MongoDB model)
  lastModified?: string; // Date
  modifiedBy?: string; // ObjectId reference to User
  scoreOverridden?: boolean;
  overrideReason?: string;
  instructorFeedback?: string; // This is the field causing your error
  manualReviewRequired?: boolean;
}

/**
 * Populated Result - when backend returns populated testId, userId, organizationId
 */
export interface PopulatedResult extends Omit<Result, 'testId' | 'userId' | 'organizationId'> {
  testId: {
    _id: string;
    title: string;
    description: string;
  };
  userId: {
    _id: string;
    loginId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  organizationId: {
    _id: string;
    name: string;
  };
}

/**
 * Individual question result within a Result - CORRECTED to match backend structure
 */
export interface ResultQuestion {
  // IDs and basic info
  questionId: string; // ObjectId reference
  questionNumber: number; // 1, 2, 3, etc.
  sectionIndex?: number; // null for non-sectioned tests
  sectionName?: string; // null for non-sectioned tests

  // Question content (copied from snapshot)
  title: string;
  type: QuestionType; // 'multipleChoice' | 'trueFalse' | 'fillInTheBlank' | 'codeChallenge' | 'codeDebugging'
  language: Language;
  category?: 'logic' | 'ui' | 'syntax'; // Optional
  difficulty: 'easy' | 'medium' | 'hard';

  // FIXED: Both answer fields that exist in your MongoDB document
  answer?: any; // What the student actually submitted (used by frontend)
  studentAnswer?: any; // Alias field (also in MongoDB document)
  correctAnswer?: any; // The correct answer from the question

  // Results
  isCorrect?: boolean; // Whether the answer was correct
  pointsEarned?: number; // Points they actually earned (backend field name)
  pointsAwarded?: number; // Alias for pointsEarned (what frontend expects)
  pointsPossible?: number; // Maximum points available for this question

  // Timing and engagement
  timeSpent?: number; // Seconds spent on this question
  viewCount?: number; // How many times they viewed this question

  manuallyGraded?: boolean;
  gradedBy?: string; // ObjectId reference to User
  gradedAt?: string; // Date
  feedback?: string; // Individual question feedback

  // Type-specific details - MATCHES your MongoDB structure exactly
  details?: {
    // For multiple choice: show options and what they picked
    options?: string[]; // Array of option strings
    selectedOption?: number; // Index of what they selected
    correctOption?: number; // Index of correct answer

    // For fill-in-blank: per-blank breakdown
    blanks?: Array<{
      id: string;
      studentAnswer: string;
      correctAnswers: string[];
      isCorrect: boolean;
      hint?: string;
      _id?: string; // MongoDB adds this
    }>;

    // For code questions: execution results
    codeResults?: {
      executed: boolean;
      passed: boolean;
      totalTests: number;
      passedTests: number;
      executionTime: number; // ms
      error?: string | null;
      codeLength?: number;
    };
  };

  // Code submissions (if they exist)
  codeSubmissions?: Array<{
    submittedAt: string;
    passed: boolean;
    error?: string;
    _id?: string;
  }>;

  // MongoDB document ID
  _id?: string;
}

/**
 * Result scoring information - CORRECTED to match backend structure
 */
export interface ResultScore {
  totalPoints: number;
  earnedPoints: number;
  percentage: number; // Calculated percentage score
  passed: boolean;
  passingThreshold: number; // Usually 70

  // Quick stats
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
}

// =====================
// REMOVED: CodeSubmission interface (not in backend model)
// Backend stores code execution results in details.codeResults instead
// =====================

// =====================
// ANALYTICS TYPES (Backend Service Responses) - UNCHANGED
// =====================

/**
 * Result analytics from resultService.getResultAnalytics()
 */
export interface ResultAnalytics {
  testId: string;
  questionId?: string; // Optional - when filtering by specific question
  totalResults: number;
  averageScore: number; // Rounded to 2 decimal places
  passRate: number; // Percentage (0-100)
  averageTime: number; // Rounded seconds
  questionSuccessRate: number; // Percentage (0-100)
  questionAverageTime: number; // Rounded seconds
  questionTotalAttempts: number;
  correctAttempts: number;
}

/**
 * User analytics from resultService.getUserAnalytics()
 */
export interface UserAnalytics {
  userId: string;
  organizationId: string;
  totalTests: number;
  averageScore: number; // Rounded to 2 decimal places
  passRate: number; // Percentage (0-100)
  averageTime: number; // Rounded seconds
  totalTimeSpent: number; // Total seconds across all tests
  tests: UserTestResult[];
}

/**
 * Individual test result within user analytics
 */
export interface UserTestResult {
  testId: string;
  attemptNumber: number;
  score: number; // Points earned
  totalPoints: number;
  percentage: number; // Rounded to 2 decimal places
  passed: boolean;
  timeSpent: number; // Seconds
  completedAt: string;
}

/**
 * Section analytics from resultService.getSectionAnalytics()
 */
export interface SectionAnalytics {
  testId: string;
  sectionIndex: number;
  sectionName: string;
  totalQuestions: number;
  averageScore: number; // Rounded to 2 decimal places
  successRate: number; // Percentage (0-100)
  averageTime: number; // Rounded seconds
  totalAttempts: number;
  correctAttempts: number;
}

/**
 * Question analytics from resultService.getQuestionAnalytics() - CORRECTED field names
 */
export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  language: Language;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalAttempts: number;
  correctAttempts: number;
  successRate: number; // Percentage (0-100), rounded to 2 decimal places
  averageTime: number; // Rounded seconds
  averagePoints: number; // Rounded to 2 decimal places
}

// =====================
// ENHANCED ANALYTICS (Frontend Computed) - UNCHANGED
// =====================

/**
 * Extended result analytics with additional computed metrics
 * These are computed on the frontend from basic analytics
 */
export interface ExtendedResultAnalytics extends ResultAnalytics {
  // Time efficiency metrics
  timeEfficiency: number; // Percentage of time limit used
  averageTimePerQuestion: number;

  // Performance breakdowns
  difficultyBreakdown: {
    easy: PerformanceMetric;
    medium: PerformanceMetric;
    hard: PerformanceMetric;
  };

  typeBreakdown: {
    multipleChoice: PerformanceMetric;
    trueFalse: PerformanceMetric;
    codeChallenge: PerformanceMetric;
    fillInTheBlank: PerformanceMetric;
    codeDebugging: PerformanceMetric;
    dragDropCloze: PerformanceMetric;
  };

  // REMOVED: Navigation metrics (not applicable to server-driven architecture)
}

/**
 * Performance metric for breakdowns
 */
export interface PerformanceMetric {
  attempted: number;
  correct: number;
  successRate: number; // Percentage (0-100)
  averageTime: number;
  averagePoints: number;
}

/**
 * Extended user analytics with additional computed metrics
 */
export interface ExtendedUserAnalytics extends UserAnalytics {
  // Performance trends
  performanceTrend: 'improving' | 'declining' | 'stable';
  recentPerformance: number; // Average score of last 3 tests

  // Comparative metrics
  rankInOrganization?: number;
  percentileInOrganization?: number;

  // Language proficiency
  languageBreakdown: LanguagePerformance[];

  // Temporal analysis
  scoreProgression: ScoreProgressionPoint[];
  activityPattern: ActivityPattern;
}

/**
 * Language-specific performance metrics
 */
export interface LanguagePerformance {
  language: Language;
  testsAttempted: number;
  testsCompleted: number;
  successRate: number;
  averageScore: number;
  averageTime: number;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  lastTestDate?: string;
}

/**
 * Score progression over time
 */
export interface ScoreProgressionPoint {
  date: string; // ISO date string
  averageScore: number;
  testsCompleted: number;
  cumulativeScore: number;
}

/**
 * User activity patterns
 */
export interface ActivityPattern {
  mostActiveTimeOfDay: string; // e.g., "14:00-15:00"
  averageSessionDuration: number; // Minutes
  testFrequency: number; // Tests per week
  preferredQuestionTypes: QuestionType[];
  strugglingAreas: string[]; // Languages or topics with low success rates
}

// =====================
// FILTER TYPES - UNCHANGED
// =====================

/**
 * Filters for analytics queries
 */
export interface AnalyticsFilters {
  // Entity filters
  userId?: string;
  testId?: string;
  questionId?: string;
  orgId?: string;

  // Content filters
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: QuestionType;
  language?: Language;

  // Time filters
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string

  // Pagination
  limit?: number;
  skip?: number;

  // Additional flags
  includeTotalCount?: boolean;
}

/**
 * Response wrapper for paginated analytics
 */
export interface PaginatedAnalyticsResponse<T> {
  data: T[];
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// =====================
// SUMMARY TYPES - UNCHANGED
// =====================

/**
 * Organization-wide analytics summary
 */
export interface OrganizationSummary {
  organizationId: string;
  organizationName: string;
  totalUsers: number;
  totalTests: number;
  totalAttempts: number;
  overallPassRate: number;
  averageScore: number;
  averageCompletionTime: number;
  mostPopularLanguages: Language[];
  topPerformingUsers: Array<{
    userId: string;
    loginId: string;
    averageScore: number;
    testsCompleted: number;
  }>;
  strugglingAreas: Array<{
    area: string; // Language or topic
    successRate: number;
    attemptsCount: number;
  }>;
  updatedAt: string;
}

/**
 * Test performance summary
 */
export interface TestSummary {
  testId: string;
  testTitle: string;
  totalAttempts: number;
  totalCompletions: number;
  completionRate: number;
  averageScore: number;
  passRate: number;
  averageCompletionTime: number;
  difficultyRating: number; // 1-10 based on success rates
  topPerformers: Array<{
    userId: string;
    loginId: string;
    score: number;
    completedAt: string;
  }>;
  commonFailurePoints: Array<{
    questionId: string;
    questionTitle: string;
    failureRate: number;
  }>;
  updatedAt: string;
}

// =====================
// EXPORT UTILITIES - UNCHANGED
// =====================

/**
 * Export format for analytics data
 */
export interface ExportableAnalytics {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  data: any[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    totalRecords: number;
    filters?: AnalyticsFilters;
  };
}

// =====================
// TYPE GUARDS - UNCHANGED
// =====================

/**
 * Type guard to check if result is completed
 */
export const isCompletedResult = (result: Result): result is Result & { completedAt: string } => {
  return result.status === 'completed' && !!result.completedAt;
};

/**
 * Type guard to check if result is passed
 */
export const isPassedResult = (result: Result): boolean => {
  return result.score.passed;
};

/**
 * Type guard to check if analytics response is paginated
 */
export const isPaginatedResponse = <T>(
  response: T[] | PaginatedAnalyticsResponse<T>
): response is PaginatedAnalyticsResponse<T> => {
  return typeof response === 'object' && 'data' in response;
};

/**
 * Type guard to check if result is populated
 */
export const isPopulatedResult = (result: Result | PopulatedResult): result is PopulatedResult => {
  return typeof (result as PopulatedResult).testId === 'object';
};

// =====================
// UTILITY FUNCTIONS - UNCHANGED
// =====================

/**
 * Calculate success rate percentage
 */
export const calculateSuccessRate = (correct: number, total: number): number => {
  return total === 0 ? 0 : Math.round((correct / total) * 100 * 100) / 100; // Round to 2 decimal places
};

/**
 * Format time duration in seconds to human readable string
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Calculate performance grade based on percentage
 */
export const getPerformanceGrade = (percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

/**
 * Get trend direction from score progression
 */
export const getTrendDirection = (progression: ScoreProgressionPoint[]): 'improving' | 'declining' | 'stable' => {
  if (progression.length < 2) return 'stable';

  const recent = progression.slice(-3);
  const older = progression.slice(-6, -3);

  if (recent.length === 0 || older.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, p) => sum + p.averageScore, 0) / recent.length;
  const olderAvg = older.reduce((sum, p) => sum + p.averageScore, 0) / older.length;

  const difference = recentAvg - olderAvg;
  const threshold = 5; // 5 point threshold for trend detection

  if (difference > threshold) return 'improving';
  if (difference < -threshold) return 'declining';
  return 'stable';
};

/**
 * Group results by time period
 */
export const groupResultsByPeriod = (
  results: Result[],
  period: 'day' | 'week' | 'month'
): Record<string, Result[]> => {
  return results.reduce((groups, result) => {
    if (!result.completedAt) return groups;

    const date = new Date(result.completedAt);
    let key: string;

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(result);

    return groups;
  }, {} as Record<string, Result[]>);
};