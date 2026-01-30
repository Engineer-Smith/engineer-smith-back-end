// src/types/type-aliases.ts - Type alias utilities with rejoin support - FIXED IMPORTS
// Import directly from source files to avoid circular dependencies
import type {
  AsyncState,
  Difficulty,
  Language,
  Organization,
  PaginatedResponse,
  QuestionStatus,
  QuestionType,
  Role,
  SessionStatus,
  TestStatus,
  User
} from './common';

import type {
  CreateQuestionData,
  Question
} from './question';

import type {
  Test,
  TestQuestionReference,
  TestSection,
  TestSettings,
  TestStats
} from './test';

import type {
  SessionConflictState,
  SessionFinalScore,
  StartSessionRequest,
  TestSession,
  TestSessionQuestion
} from './session';

import type {
  Result
} from './result';

import type {
  AuthState
} from './auth';

import type {
  CreateTestData
} from './createTest';

// REMOVED IMPORTS that don't exist:
// - SessionRestorationState (doesn't exist in simplified backend)
// - CodeSubmission (removed from simplified backend)  
// - FillInBlankAnswer (removed from simplified backend)
// - SessionProgress (doesn't exist in simplified backend)

// =====================
// CORE TYPE ALIASES
// =====================

/**
 * Question with guaranteed usage statistics
 */
export type QuestionWithStats = Question & {
  usageStats: NonNullable<Question['usageStats']>;
};

/**
 * Test session that has been completed with final results
 */
export type CompletedTestSession = TestSession & {
  completedAt: string;
  finalScore: SessionFinalScore;
};

/**
 * Test that properly enforces either sections OR questions structure
 */
export type TestWithContent = Test & (
  | { sections: TestSection[]; questions?: never }
  | { questions: TestQuestionReference[]; sections?: never }
);

/**
 * User with populated organization data
 */
export type PopulatedUser = User & {
  organization: Organization;
};

// =====================
// USER ALIASES
// =====================

/**
 * User with guaranteed email field
 */
export type UserWithEmail = User & {
  email: string;
};

/**
 * User with both email and populated organization
 */
export type FullUser = User & {
  email: string;
  organization: Organization;
};

/**
 * User profile for display purposes
 */
export type UserProfile = Pick<User, '_id' | 'loginId' | 'firstName' | 'lastName' | 'role' | 'createdAt'> & {
  displayName: string;
  fullName: string;
  organizationName?: string;
};

// =====================
// QUESTION ALIASES
// =====================

/**
 * Question with minimal data for listing
 */
export type QuestionSummary = Pick<Question, '_id' | 'title' | 'type' | 'language' | 'difficulty' | 'status' | 'tags' | 'createdAt'> & {
  createdBy?: string;
  usageCount?: number;
};

/**
 * Question for student view (without answers)
 */
export type StudentQuestion = Omit<Question, 'correctAnswer' | 'solutionCode'> & {
  hasHints?: boolean;
  pointValue?: number;
};

/**
 * Question with creation metadata
 */
export type QuestionWithMetadata = Question & {
  createdByName?: string;
  organizationName?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
};

/**
 * Code question specifically
 */
export type CodeQuestion = Question & {
  category: 'logic' | 'ui' | 'syntax';
  codeTemplate?: string;
  testCases?: Array<{
    name?: string;
    args: any[];
    expected: any;
    hidden?: boolean;
  }>;
};

/**
 * Multiple choice question specifically
 */
export type MultipleChoiceQuestion = Question & {
  type: 'multipleChoice';
  options: string[];
  correctAnswer: number;
};

/**
 * Fill in the blank question specifically
 */
export type FillInBlankQuestion = Question & {
  type: 'fillInTheBlank';
  codeTemplate: string;
  blanks: Array<{
    id?: string;
    correctAnswers: string[];
    caseSensitive?: boolean;
    hint?: string;
    points?: number;
  }>;
};

// =====================
// TEST ALIASES
// =====================

/**
 * Test with guaranteed sections structure
 */
export type SectionedTest = Test & {
  settings: TestSettings & { useSections: true };
  sections: TestSection[];
  questions?: never;
};

/**
 * Test with guaranteed questions structure
 */
export type LinearTest = Test & {
  settings: TestSettings & { useSections: false };
  questions: TestQuestionReference[];
  sections?: never;
};

/**
 * Test summary for listing
 */
export type TestSummary = Pick<Test, '_id' | 'title' | 'testType' | 'languages' | 'status' | 'isGlobal' | 'createdAt'> & {
  questionCount: number;
  totalPoints: number;
  estimatedDuration: number;
  createdByName?: string;
  organizationName?: string;
  stats: Pick<TestStats, 'totalAttempts' | 'averageScore' | 'passRate'>;
};

/**
 * Test with populated question data for taking
 */
export type TestForTaking = Test & {
  sections?: Array<TestSection & {
    questions: Array<TestQuestionReference & {
      questionData: StudentQuestion;
    }>;
  }>;
  questions?: Array<TestQuestionReference & {
    questionData: StudentQuestion;
  }>;
};

// =====================
// SESSION ALIASES
// =====================

/**
 * Session in progress
 */
export type ActiveTestSession = TestSession & {
  status: 'inProgress';
  currentQuestion: TestSessionQuestion;
};

/**
 * Test session that can be rejoined
 */
export type RejoinableTestSession = TestSession & {
  status: 'inProgress';
  canRejoin: true;
};

/**
 * Session overview for navigation - SIMPLIFIED
 */
export type SessionOverview = Pick<TestSession, '_id' | 'testId' | 'status' | 'startedAt'> & {
  testTitle: string;
  questionOverview: Array<{
    questionIndex: number;
    status: QuestionStatus;
    hasAnswer: boolean;
    timeSpent: number;
    sectionIndex?: number;
  }>;
  progressPercentage: number;
};

/**
 * Session with student-safe data only
 */
export type StudentSession = Omit<TestSession, 'finalScore'> & {
  canSubmit: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
};

// =====================
// REJOIN-SPECIFIC ALIASES
// =====================

/**
 * Session conflict data for modal display
 */
export type SessionConflictData = {
  sessionId: string;
  testTitle: string;
  timeRemaining: number;
  questionProgress: string; // "5/20" format
  sectionProgress?: string; // "2/4" format for sectioned tests
  progressPercentage: number;
  timeRemainingFormatted: string; // "15:30" format
};

/**
 * Session restoration flow state - SIMPLIFIED
 */
export type SessionRestorationFlow = {
  state: 'checking' | 'can_rejoin' | 'cannot_rejoin' | 'rejoining' | 'error';
  existingSession?: SessionConflictData;
  error?: string;
  currentSessionId?: string;
  lastCheckTime?: string;
};

/**
 * Rejoin modal component data
 */
export type RejoinModalData = {
  isOpen: boolean;
  sessionData: SessionConflictData;
  loading: boolean;
  action: SessionConflictState['action'];
};

/**
 * Start test action configuration
 */
export type StartTestAction = StartSessionRequest & {
  onConflict?: (conflict: SessionConflictData) => void;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
};

// =====================
// RESULT ALIASES
// =====================

/**
 * Result with detailed scoring
 */
export type DetailedResult = Result & {
  testTitle: string;
  userName: string;
  organizationName: string;
  questionResults: Array<{
    questionId: string;
    questionTitle: string;
    questionType: string;
    answer: any;
    isCorrect: boolean;
    pointsAwarded: number;
    timeSpent: number;
  }>;
  performanceAnalysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
};

/**
 * Result summary for listings
 */
export type ResultSummary = Pick<Result, '_id' | 'testId' | 'userId' | 'status' | 'timeSpent' | 'completedAt'> & {
  testTitle: string;
  userName: string;
  scorePercentage: number;
  passed: boolean;
  attemptNumber: number;
};

// =====================
// FORM DATA ALIASES
// =====================

/**
 * Question form data for creation/editing
 */
export type QuestionFormData = CreateQuestionData & {
  isEditMode?: boolean;
  originalQuestionId?: string;
  validationErrors?: Record<string, string>;
};

/**
 * Test form data for creation/editing
 */
export type TestFormData = CreateTestData & {
  isEditMode?: boolean;
  originalTestId?: string;
  wizardStep?: number;
  validationErrors?: Record<string, string>;
};

/**
 * User registration form data
 */
export type UserRegistrationData = {
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
  role?: Role;
  agreeToTerms: boolean;
};

// =====================
// API RESPONSE ALIASES
// =====================

/**
 * Paginated question list response
 */
export type PaginatedQuestions = PaginatedResponse<Question> & {
  filters?: {
    language?: Language;
    difficulty?: Difficulty;
    type?: QuestionType;
    category?: string;
  };
};

/**
 * Paginated test list response
 */
export type PaginatedTests = PaginatedResponse<TestSummary> & {
  filters?: {
    testType?: string;
    language?: Language;
    status?: TestStatus;
  };
};

/**
 * Paginated user list response
 */
export type PaginatedUsers = PaginatedResponse<UserProfile> & {
  filters?: {
    role?: Role;
    organizationId?: string;
  };
};

/**
 * Paginated results response
 */
export type PaginatedResults = PaginatedResponse<ResultSummary> & {
  filters?: {
    testId?: string;
    userId?: string;
    status?: SessionStatus;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
  };
};

// =====================
// UI STATE ALIASES
// =====================

/**
 * Authentication state with user data
 */
export type AuthenticatedState = AuthState & {
  isAuthenticated: true;
  user: PopulatedUser;
  permissions: {
    canCreateQuestions: boolean;
    canManageUsers: boolean;
    canAccessAnalytics: boolean;
    canCreateGlobalContent: boolean;
    canTakeTests: boolean;
    canManageOrganization: boolean;
    isSuperOrgAdmin: boolean;
  };
};

/**
 * Loading state for async operations
 */
export type AsyncOperation<T> = AsyncState<T> & {
  operationType: 'create' | 'read' | 'update' | 'delete';
  progress?: number; // 0-100 for operations with progress
};

/**
 * Form state with validation
 */
export type ValidatedFormState<T> = {
  data: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  submitCount: number;
};

// =====================
// UTILITY ALIASES
// =====================

/**
 * Deep partial type for update operations
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required fields helper
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Optional fields helper
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Nullable fields
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Non-nullable fields
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Formatted time display
 */
export type FormattedTime = {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string; // "HH:MM:SS" or "MM:SS"
  isLessThanMinute: boolean;
  isLessThanHour: boolean;
};

/**
 * Session validation result
 */
export type SessionValidation = {
  isValid: boolean;
  canRejoin: boolean;
  timeRemaining: number;
  reasons: string[];
  actions: Array<{
    type: 'rejoin' | 'abandon' | 'start_new';
    label: string;
    recommended: boolean;
  }>;
};

// =====================
// EVENT HANDLER ALIASES
// =====================

/**
 * Form event handlers
 */
export type FormEventHandlers<T> = {
  onChange: (field: keyof T, value: T[keyof T]) => void;
  onBlur: (field: keyof T) => void;
  onSubmit: (data: T) => void | Promise<void>;
  onReset: () => void;
  onValidate: (data: Partial<T>) => Record<string, string>;
};

/**
 * Table event handlers
 */
export type TableEventHandlers<T> = {
  onSort: (field: keyof T, direction: 'asc' | 'desc') => void;
  onFilter: (filters: Partial<T>) => void;
  onSelect: (selectedItems: T[]) => void;
  onRowClick: (item: T) => void;
  onPageChange: (page: number, pageSize?: number) => void;
};

/**
 * Modal event handlers
 */
export type ModalEventHandlers = {
  onOpen: () => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

// =====================
// ERROR HANDLING ALIASES
// =====================

/**
 * Rejoin-specific error types
 */
export type RejoinError = {
  type: 'session_not_found' | 'session_expired' | 'unauthorized' | 'network_error' | 'unknown';
  message: string;
  sessionId?: string;
  canRetry: boolean;
  suggestedAction: 'retry' | 'start_new' | 'contact_support';
};

/**
 * Socket error with rejoin context
 */
export type SocketRejoinError = {
  type: 'connection_failed' | 'rejoin_failed' | 'timeout' | 'invalid_session';
  message: string;
  sessionId?: string;
  canAutoRetry: boolean;
  retryCount: number;
  maxRetries: number;
};