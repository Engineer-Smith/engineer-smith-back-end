// src/types/api.ts - Built from scratch to match actual backend responses
import type {
  Organization,
  QuestionStatus,
  User
} from './common';
import type { Question, QuestionStatsResponse, QuestionTestResult } from './question';
import type { Test } from './test';

// =====================
// CRITICAL: BACKEND RETURNS DATA DIRECTLY
// No ApiResponse<T> wrapper is used - controllers return objects directly
// =====================

// =====================
// AUTHENTICATION APIs
// =====================

export interface LoginRequest {
  loginCredential: string; // Can be username or email
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  csrfToken: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
  inviteCode?: string;
  role?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  csrfToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  csrfToken: string;
}

export interface ValidateInviteRequest {
  inviteCode: string;
}

export interface ValidateInviteResponse {
  success: boolean;
  organization: {
    _id: string;
    name: string;
  };
}

export interface GetCurrentUserResponse {
  success: boolean;
  user: {
    _id: string;
    loginId: string;
    email?: string;
    role: string;
    isSSO: boolean;
    organization: Organization; // Populated organization object
    organizationId: string; // Also included as separate field
    createdAt: string;
  };
}

export interface AuthStatusResponse {
  success: boolean;
  authenticated: boolean;
  user?: {
    _id: string;
    role: string;
    organizationId: string;
  };
}

// =====================
// QUESTION APIs - DIRECT RESPONSES
// =====================

export interface CreateQuestionRequest {
  title: string;
  description: string;
  type: string;
  language: string;
  difficulty: string;
  category?: string;
  status?: string;
  tags?: string[];
  isGlobal?: boolean;
  
  // Type-specific fields
  options?: string[];
  correctAnswer?: any;
  codeTemplate?: string;
  blanks?: Array<{
    correctAnswers: string[];
    caseSensitive?: boolean;
    hint?: string;
    points?: number;
  }>;
  testCases?: Array<{
    name?: string;
    args: any[];
    expected: any;
    hidden?: boolean;
  }>;
  codeConfig?: {
    entryFunction?: string;
    runtime?: string;
    timeoutMs?: number;
    allowPreview?: boolean;
  };
  buggyCode?: string;
  solutionCode?: string;
}

// Backend returns Question object directly
export type CreateQuestionResponse = Question;
export type GetQuestionResponse = Question;
export type UpdateQuestionResponse = Question;

export interface DeleteQuestionResponse {
  message: string;
}

export interface TestQuestionRequest {
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

// Backend returns QuestionTestResult directly
export type TestQuestionResponse = QuestionTestResult;

// Backend returns QuestionStatsResponse directly
export type GetQuestionStatsResponse = QuestionStatsResponse;

// Backend returns EITHER Question[] OR paginated object based on includeTotalCount
export type GetAllQuestionsResponse = Question[] | {
  questions: Question[];
  totalCount: number;
  totalPages: number;
};

// =====================
// TEST APIs - DIRECT RESPONSES
// =====================

export interface CreateTestRequest {
  title: string;
  description: string;
  testType?: string;
  languages?: string[];
  tags?: string[];
  settings: {
    timeLimit: number;
    attemptsAllowed: number;
    shuffleQuestions?: boolean;
    useSections?: boolean;
  };
  status?: string;
  
  // Either sections OR questions based on useSections
  sections?: Array<{
    name: string;
    timeLimit: number;
    questions: Array<{
      questionId: string;
      points: number;
    }>;
  }>;
  questions?: Array<{
    questionId: string;
    points: number;
  }>;
}

// Backend returns Test object directly
export type CreateTestResponse = Test;
export type GetTestResponse = Test;
export type UpdateTestResponse = Test;

export interface DeleteTestResponse {
  message: string;
}

// =====================
// TEST SESSION APIs - MATCH BACKEND EXACTLY
// =====================

export interface SessionStartRequest {
  testId: string;
}

export interface SessionStartResponse {
  success: boolean;
  sessionId: string;
  testInfo: {
    title: string;
    description: string;
    totalQuestions: number;
    totalPoints: number;
    timeLimit: number;
    useSections: boolean;
    sectionCount: number;
  };
  navigation: {
    currentQuestionIndex: number;
    currentSectionIndex: number;
    canNavigateForward: boolean;
    canNavigateBackward: boolean;
  };
  progress: {
    questionsCompleted: number;
    questionsRemaining: number;
    sectionsCompleted: number;
    sectionsRemaining: number;
    timeRemainingMinutes: number;
    timeUsedMinutes: number;
    averageTimePerQuestion: number;
    currentScore: number;
    possibleScore: number;
    hasUnansweredQuestions: boolean;
    hasFlaggedQuestions: boolean;
    isReadyForSubmission: boolean;
  };
  startedAt: string;
  attemptNumber: number;
}

export interface CurrentQuestionResponse {
  success: boolean;
  sessionId: string;
  sessionInfo: {
    title: string;
    description: string;
    totalQuestions: number;
    totalPoints: number;
    timeLimit: number;
    useSections: boolean;
    sectionCount: number;
  };
  questionState: {
    questionIndex: number;
    questionData: Question; // Student-filtered question data
    currentAnswer: any;
    status: QuestionStatus;
    timeSpent: number;
    viewCount: number;
    flaggedForReview: boolean;
    reviewNotes: string;
    codeSubmissions: Array<{
      code: string;
      language: string;
      submittedAt: string;
      testResults: Array<{
        testName?: string;
        testCaseIndex: number;
        passed: boolean;
        actualOutput?: string;
        expectedOutput?: string;
        executionTime?: number;
        error?: string;
      }>;
      overallPassed: boolean;
      totalTestsPassed: number;
      totalTests: number;
      executionError?: string;
      compilationError?: string;
    }>;
    fillInBlankAnswers: Array<{
      blankId: string;
      answer: string;
      isCorrect: boolean;
      pointsEarned: number;
    }>;
  };
  navigationContext: {
    currentIndex: number;
    totalQuestions: number;
    canNavigateForward: boolean;
    canNavigateBackward: boolean;
    currentSection: {
      index: number;
      name: string;
      questionsInSection: number;
      currentQuestionInSection: number;
      isCompleted: boolean;
      timeLimit: number;
    } | null;
    questionsInCurrentSection: number[];
    completedSections: number[];
    questionsViewed: number[];
    questionsAnswered: number[];
    questionsSkipped: number[];
    questionsFlagged: number[];
  };
  progress: {
    questionsCompleted: number;
    questionsRemaining: number;
    sectionsCompleted: number;
    sectionsRemaining: number;
    timeRemainingMinutes: number;
    timeUsedMinutes: number;
    averageTimePerQuestion: number;
    currentScore: number;
    possibleScore: number;
    hasUnansweredQuestions: boolean;
    hasFlaggedQuestions: boolean;
    isReadyForSubmission: boolean;
  };
  timeRemaining: number;
}

export interface NavigationRequest {
  targetIndex: number;
  action: 'next' | 'previous' | 'skip' | 'jump';
  timeSpentOnCurrent?: number;
}

export interface NavigationResponse {
  success: boolean;
  newQuestionIndex: number;
  canNavigateForward: boolean;
  canNavigateBackward: boolean;
  currentSection: {
    index: number;
    name: string;
    questionsInSection: number;
    currentQuestionInSection: number;
    isCompleted: boolean;
    timeLimit: number;
  } | null;
}

export interface SaveAnswerRequest {
  answer: any;
  timeSpent?: number;
  questionIndex?: number;
  codeSubmission?: {
    code: string;
    language: string;
    submittedAt?: string;
  };
  reviewNotes?: string;
  source?: 'manual_entry' | 'auto_save' | 'navigation_save';
}

export interface SaveAnswerResponse {
  success: boolean;
  autoSaved: boolean;
  timestamp: string;
  questionIndex: number;
  answerStatus: string;
  isCorrect?: boolean | null;
  pointsEarned?: number;
  progress: {
    questionsCompleted: number;
    questionsRemaining: number;
    sectionsCompleted: number;
    sectionsRemaining: number;
    timeRemainingMinutes: number;
    timeUsedMinutes: number;
    averageTimePerQuestion: number;
    currentScore: number;
    possibleScore: number;
    hasUnansweredQuestions: boolean;
    hasFlaggedQuestions: boolean;
    isReadyForSubmission: boolean;
  };
  gradingDetails?: {
    fillInBlankResults: Array<{
      blankId: string;
      answer: string;
      isCorrect: boolean;
      pointsEarned: number;
    }>;
  };
}

export interface ToggleFlagRequest {
  questionIndex?: number;
  reviewNotes?: string;
}

export interface ToggleFlagResponse {
  success: boolean;
  questionIndex: number;
  flagged: boolean;
  totalFlagged: number;
}

export interface SessionOverviewResponse {
  success: boolean;
  sessionId: string;
  questionOverview: Array<{
    sectionName: string | null;
    sectionIndex: number;
    isCompleted: boolean;
    questions: Array<{
      globalIndex: number;
      localIndex?: number;
      status: string;
      hasAnswer: boolean;
      flagged: boolean;
      timeSpent: number;
      points: number;
      isCorrect?: boolean;
      pointsEarned?: number;
    }>;
  }>;
  navigation: {
    currentQuestionIndex: number;
    currentSectionIndex: number;
    questionsViewed: number[];
    questionsAnswered: number[];
    questionsSkipped: number[];
    questionsFlagged: number[];
    sectionsCompleted: number[];
  };
  progress: {
    questionsCompleted: number;
    questionsRemaining: number;
    sectionsCompleted: number;
    sectionsRemaining: number;
    timeRemainingMinutes: number;
    timeUsedMinutes: number;
    averageTimePerQuestion: number;
    currentScore: number;
    possibleScore: number;
    hasUnansweredQuestions: boolean;
    hasFlaggedQuestions: boolean;
    isReadyForSubmission: boolean;
  };
  timeRemaining: number;
}

export interface CompleteSectionRequest {
  sectionIndex?: number;
  reviewQuestions?: number[];
}

export interface CompleteSectionResponse {
  success: boolean;
  sectionCompleted: number;
  completedSections: number[];
  allSectionsCompleted: boolean;
  nextSectionIndex: number | null;
  currentQuestionIndex: number;
  isReadyForFinalSubmission: boolean;
  progress: {
    questionsCompleted: number;
    questionsRemaining: number;
    sectionsCompleted: number;
    sectionsRemaining: number;
    timeRemainingMinutes: number;
    timeUsedMinutes: number;
    averageTimePerQuestion: number;
    currentScore: number;
    possibleScore: number;
    hasUnansweredQuestions: boolean;
    hasFlaggedQuestions: boolean;
    isReadyForSubmission: boolean;
  };
  warning?: string;
  unansweredQuestions?: number[];
  totalQuestionsInSection?: number;
  answeredQuestionsInSection?: number;
}

export interface SubmitSessionRequest {
  finalCheck?: boolean;
  forceSubmit?: boolean;
}

export interface SubmitSessionResponse {
  success: boolean;
  sessionId: string;
  status: string;
  finalScore: {
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
    passed: boolean;
    passingThreshold: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
    totalTimeUsed: number;
    timeEfficiency: number;
  };
  resultId: string;
  completedAt: string;
  message: string;
}

export interface AbandonSessionResponse {
  success: boolean;
  message: string;
  sessionId: string;
  timeSpent: number;
}

export interface TimeSyncResponse {
  success: boolean;
  serverTime: number;
  startTime: number;
  elapsedSeconds: number;
  timeRemainingSeconds: number;
  timeLimitMinutes: number;
  sessionStatus: string;
}

// =====================
// RESULT/ANALYTICS APIs
// =====================

export interface QuestionAnalyticsResponse {
  questionId: string;
  questionTitle: string;
  questionType: string;
  language: string;
  category?: string;
  difficulty: string;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  averageTime: number;
  averagePoints: number;
}

// =====================
// UTILITY TYPES
// =====================

export interface ApiParams {
  [key: string]: string | number | boolean | undefined;
}

// Common response patterns
export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  error: boolean;
  status: number;
  message: string;
}