// src/types/codeChallenge.ts
// Note: Swift removed - no longer supports code execution (UI/syntax only like SwiftUI)
export type ProgrammingLanguage = 'javascript' | 'python' | 'dart';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type TrackDifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ChallengeStatus = 'draft' | 'active' | 'archived';

export type TrackCategory = 
  | 'data-structures'
  | 'algorithms'
  | 'dynamic-programming'
  | 'graphs'
  | 'trees'
  | 'arrays'
  | 'strings'
  | 'linked-lists'
  | 'stacks-queues'
  | 'sorting-searching'
  | 'math'
  | 'greedy'
  | 'backtracking'
  | 'bit-manipulation'
  | 'design'
  | 'interview-prep';

export type SubmissionStatus = 'pending' | 'running' | 'passed' | 'failed' | 'timeout' | 'error';

export type UserProgressStatus = 'not-started' | 'in-progress' | 'solved' | 'attempted';

// Base interfaces
export interface CodeConfig {
  runtime: string;
  entryFunction: string;
  timeoutMs: number;
  memoryLimitMb: number;
}

export interface TestCase {
  name: string;
  args: any[];
  expected: any;
  hidden: boolean;
  explanation?: string;
}

export interface ChallengeExample {
  input: any;
  output: any;
  explanation: string;
}

export interface UsageStats {
  totalAttempts: number;
  successfulSubmissions: number;
  successRate: number;
  averageAttempts: number;
  averageCompletionTime: number;
}

export interface TrackStats {
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
  averageCompletionTime: number;
  rating: number;
  totalRatings: number;
}

// Main Challenge Interface (Admin view)
export interface AdminChallenge {
  _id: string;
  slug: string;
  title: string;
  description: string;
  problemStatement: string;
  difficulty: DifficultyLevel;
  supportedLanguages: ProgrammingLanguage[];
  topics: string[];
  tags: string[];
  examples: ChallengeExample[];
  constraints: string[];
  hints: string[];
  codeConfig: Record<ProgrammingLanguage, CodeConfig>;
  startingCode: Record<ProgrammingLanguage, string>;
  testCases: TestCase[];
  solutionCode: Record<ProgrammingLanguage, string>;
  editorial: string;
  timeComplexity: string;
  spaceComplexity: string;
  companyTags: string[];
  usageStats: UsageStats;
  status: ChallengeStatus;
  createdBy: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Track Challenge Reference
export interface TrackChallenge {
  challengeId: string;
  order: number;
  isOptional: boolean;
  unlockAfter: number;
}

// Main Track Interface (Admin view)
export interface AdminTrack {
  _id: string;
  title: string;
  slug: string;
  description: string;
  language: ProgrammingLanguage;
  category: TrackCategory;
  difficulty: TrackDifficultyLevel;
  estimatedHours: number;
  prerequisites: string[];
  learningObjectives: string[];
  challenges: TrackChallenge[];
  stats: TrackStats;
  iconUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdBy: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Student/Public facing interfaces
export interface PublicChallenge {
  _id: string;
  slug: string;
  title: string;
  description: string;
  problemStatement: string;
  difficulty: DifficultyLevel;
  supportedLanguages: ProgrammingLanguage[];
  topics: string[];
  tags: string[];
  examples: ChallengeExample[];
  constraints: string[];
  hints: string[];
  codeConfig: Record<ProgrammingLanguage, CodeConfig>;
  startingCode: Record<ProgrammingLanguage, string>;
  timeComplexity: string;
  spaceComplexity: string;
  companyTags: string[];
  usageStats: Pick<UsageStats, 'totalAttempts' | 'successRate'>;
}

export interface PublicTrack {
  _id: string;
  title: string;
  slug: string;
  description: string;
  language: ProgrammingLanguage;
  category: TrackCategory;
  difficulty: TrackDifficultyLevel;
  estimatedHours: number;
  prerequisites: string[];
  learningObjectives: string[];
  challenges: Array<{
    challengeId: string;
    order: number;
    isOptional: boolean;
    unlockAfter: number;
  }>;
  stats: Pick<TrackStats, 'totalEnrolled' | 'rating' | 'totalRatings'>;
  iconUrl?: string;
  bannerUrl?: string;
  isFeatured: boolean;
}

// User Progress Tracking
export interface UserChallengeProgress {
  _id: string;
  userId: string;
  challengeId: string;
  status: UserProgressStatus;
  attempts: number;
  bestSubmissionId?: string;
  completedAt?: string;
  lastAttemptAt: string;
  timeSpent: number; // in minutes
  hintsUsed: number;
}

export interface UserTrackProgress {
  _id: string;
  userId: string;
  trackId: string;
  enrolledAt: string;
  completedAt?: string;
  currentChallengeIndex: number;
  challengesCompleted: number;
  totalChallenges: number;
  progressPercentage: number;
  timeSpent: number; // in minutes
  lastAccessedAt: string;
}

// Submission related interfaces
export interface ChallengeSubmission {
  _id: string;
  userId: string;
  challengeId: string;
  language: ProgrammingLanguage;
  code: string;
  status: SubmissionStatus;
  results?: {
    passed: number;
    total: number;
    testResults: Array<{
      testId: string;
      passed: boolean;
      input: any;
      expectedOutput: any;
      actualOutput: any;
      executionTime: number;
      error?: string;
    }>;
  };
  executionTime?: number;
  memoryUsed?: number;
  submittedAt: string;
  completedAt?: string;
  error?: string;
}

// Form data interfaces for components
export interface CreateTrackFormData {
  title: string;
  description: string;
  language: ProgrammingLanguage;
  category: TrackCategory;
  difficulty: TrackDifficultyLevel;
  estimatedHours: number;
  prerequisites: string[];
  learningObjectives: string[];
  isFeatured: boolean;
}

export interface CreateChallengeFormData {
  title: string;
  description: string;
  problemStatement: string;
  difficulty: DifficultyLevel;
  supportedLanguages: ProgrammingLanguage[];
  topics: string[];
  tags: string[];
  examples: ChallengeExample[];
  constraints: string[];
  hints: string[];
  codeConfig: Record<ProgrammingLanguage, CodeConfig>;
  startingCode: Record<ProgrammingLanguage, string>;
  testCases: TestCase[];
  solutionCode: Record<ProgrammingLanguage, string>;
  editorial: string;
  timeComplexity: string;
  spaceComplexity: string;
  companyTags: string[];
}

// API request/response interfaces
export interface AssignChallengeRequest {
  challengeId: string;
  order: number;
  isOptional: boolean;
  unlockAfter?: number;
  skipValidation?: boolean;
}

export interface SubmitCodeRequest {
  challengeId: string;
  language: ProgrammingLanguage;
  code: string;
}

export interface TestCodeRequest {
  challengeId: string;
  language: ProgrammingLanguage;
  code: string;
  testCases?: TestCase[];
}

// Analytics interfaces
export interface ChallengeAnalytics {
  challengeId: string;
  title: string;
  difficulty: DifficultyLevel;
  totalAttempts: number;
  successfulSubmissions: number;
  successRate: number;
  averageAttempts: number;
  averageCompletionTime: number;
  languageBreakdown: Record<ProgrammingLanguage, {
    attempts: number;
    successRate: number;
  }>;
}

export interface TrackAnalytics {
  trackId: string;
  title: string;
  language: ProgrammingLanguage;
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
  averageCompletionTime: number;
  dropOffPoints: Array<{
    challengeIndex: number;
    challengeTitle: string;
    dropOffRate: number;
  }>;
}

// Admin Dashboard Response Types
export interface AdminDashboardAnalytics {
  period: string;
  challengeStats: {
    total: number;
    active: number;
    byDifficulty: Array<{
      difficulty: DifficultyLevel;
      count: number;
    }>;
  };
  trackStats: {
    total: number;
    active: number;
    byLanguage: Array<{
      language: ProgrammingLanguage;
      count: number;
    }>;
  };
  submissionStats: {
    totalSubmissions: number;
    successfulSubmissions: number;
    byLanguage: Array<{
      language: ProgrammingLanguage;
      status: SubmissionStatus;
    }>;
  };
  userActivityStats: {
    activeUsers: number;
    totalSolved: number;
  };
  popularChallenges: Array<{
    _id: string;
    slug: string;
    title: string;
    difficulty: DifficultyLevel;
    usageStats: UsageStats;
  }>;
  difficultChallenges: Array<{
    _id: string;
    slug: string;
    title: string;
    difficulty: DifficultyLevel;
    usageStats: UsageStats;
  }>;
}

// Admin Track Detail with Stats
export interface AdminTrackDetail {
  _id: string;
  title: string;
  slug: string;
  description: string;
  language: ProgrammingLanguage;
  category: TrackCategory;
  difficulty: TrackDifficultyLevel;
  estimatedHours: number;
  prerequisites: string[];
  learningObjectives: string[];
  challenges: Array<{
    challengeId: {
      _id: string;
      slug: string;
      title: string;
      description: string;
      difficulty: DifficultyLevel;
      status: ChallengeStatus;
      topics: string[];
      tags: string[];
      usageStats: UsageStats;
    };
    order: number;
    isOptional: boolean;
    unlockAfter: number;
    stats: {
      totalSubmissions: number;
      passedSubmissions: number;
      successRate: string;
      uniqueUsers: number;
      totalUsers: number;
      solvedCount: number;
    };
  }>;
  stats: TrackStats;
  iconUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Challenge Detail with Stats
export interface AdminChallengeDetail {
  _id: string;
  slug: string;
  title: string;
  description: string;
  problemStatement: string;
  difficulty: DifficultyLevel;
  supportedLanguages: ProgrammingLanguage[];
  topics: string[];
  tags: string[];
  examples: ChallengeExample[];
  constraints: string[];
  hints: string[];
  codeConfig: Record<ProgrammingLanguage, CodeConfig>;
  startingCode: Record<ProgrammingLanguage, string>;
  testCases: TestCase[];
  solutionCode: Record<ProgrammingLanguage, string>;
  editorial: string;
  timeComplexity: string;
  spaceComplexity: string;
  companyTags: string[];
  usageStats: UsageStats;
  status: ChallengeStatus;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    submissions: Array<{
      _id: {
        language: ProgrammingLanguage;
        status: SubmissionStatus;
      };
      count: number;
      avgRuntime: number;
    }>;
    userProgress: Array<{
      _id: UserProgressStatus;
      count: number;
      avgAttempts: number;
    }>;
    recentSubmissions: Array<{
      _id: string;
      userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
      language: ProgrammingLanguage;
      status: SubmissionStatus;
      runtime: number;
      submittedAt: string;
    }>;
  };
}

// Admin Track Overview (for dashboard)
export interface AdminTrackOverview {
  _id: string;
  slug: string;
  title: string;
  language: ProgrammingLanguage;
  category: TrackCategory;
  difficulty: TrackDifficultyLevel;
  estimatedHours: number;
  isFeatured: boolean;
  challenges: Array<{
    challengeId: {
      _id: string;
      slug: string;
      title: string;
      difficulty: DifficultyLevel;
      status: ChallengeStatus;
    };
  }>;
  createdAt: string;
  stats: {
    totalChallenges: number;
    activeChallenges: number;
    totalSubmissions: number;
    uniqueUsers: number;
  };
}

// Admin Challenge Overview (for dashboard)
export interface AdminChallengeOverview {
  _id: string;
  slug: string;
  title: string;
  difficulty: DifficultyLevel;
  supportedLanguages: ProgrammingLanguage[];
  status: ChallengeStatus;
  topics: string[];
  usageStats: UsageStats;
  createdAt: string;
}

// Test Challenge Response
export interface ChallengeTestResult {
  testResults: {
    passed: number;
    total: number;
    testResults: Array<{
      testId: string;
      passed: boolean;
      input: any;
      expectedOutput: any;
      actualOutput: any;
      executionTime: number;
      error?: string;
    }>;
    executionTime: number;
    memoryUsed: number;
  };
}

// Filter interfaces for admin pages
export interface ChallengeFilters {
  difficulty?: DifficultyLevel;
  language?: ProgrammingLanguage;
  status?: ChallengeStatus;
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TrackFilters {
  language?: ProgrammingLanguage;
  category?: TrackCategory;
  difficulty?: TrackDifficultyLevel;
  status?: 'active' | 'inactive';
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Loading states interface for context
export interface CodeChallengeLoadingStates {
  dashboard: boolean;
  challenges: boolean;
  tracks: boolean;
  track: boolean;
  challenge: boolean;
  submission: boolean;
  adminChallenges: boolean;
  adminTracks: boolean;
  analytics: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  testing: boolean;
  submitting: boolean;
}

// Error interfaces
export interface CodeChallengeError {
  field?: string;
  message: string;
  code?: string;
}

export interface CodeChallengeErrors {
  general?: string;
  validation?: CodeChallengeError[];
  network?: string;
  permission?: string;
  [key: string]: string | CodeChallengeError[] | undefined; // Add index signature
}