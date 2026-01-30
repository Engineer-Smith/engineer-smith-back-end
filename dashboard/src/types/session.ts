// src/types/session.ts - CORRECTED to match ACTUAL backend implementation
import type {
  SessionStatus,
  QuestionStatus,
  Language,
  TestType,
  Tags,
  BaseEntity,
  Timestamped
} from './common';

// =====================
// CORE SESSION MODEL (matches actual TestSession.js)
// =====================

export interface TestSession extends BaseEntity, Timestamped {
  testId: string;
  userId: string;
  organizationId: string;
  attemptNumber: number;
  status: SessionStatus;
  startedAt: string;
  completedAt?: string;

  // Current position (server-controlled)
  currentQuestionIndex: number;
  currentSectionIndex: number;
  currentSectionStartedAt?: string;

  // Progress tracking
  completedSections: number[];
  answeredQuestions: number[];
  skippedQuestions?: number[]; // NEW: Server tracks skipped questions

  // NEW: Review phase support
  reviewPhase?: boolean;

  // Connection state (server-managed)
  isConnected: boolean;
  disconnectedAt?: string;
  lastConnectedAt?: string;

  // Complete test snapshot
  testSnapshot: TestSnapshot;
  finalScore?: SessionFinalScore;
}

// =====================
// SERVER ACTION RESPONSE (matches questionHandler.js actual returns)
// =====================

export interface ServerActionResponse {
  success: boolean;
  action: 'next_question' | 'answer_saved' | 'section_review' | 'confirm_submit' |
          'test_complete' | 'time_expired' | 'next_section' | 'review_started' |
          'section_transition' | 'test_completed_confirmation' | 'test_completed_with_error' |
          'stay' | string;  // string fallback for any new actions
  message?: string;

  // Question and navigation state (returned by most actions)
  questionState?: {
    questionIndex: number;           // Section-relative index
    questionId?: string;
    questionData: QuestionData;
    currentAnswer?: any;
    studentAnswer?: any;            // Backend may use either name
    status: QuestionStatus;
    timeSpent: number;
    points?: number;
    viewCount?: number;
    isReviewPhase?: boolean;
    skippedQuestionsRemaining?: number;
  };
  navigationContext?: NavigationContext;

  // Section review response
  sectionSummary?: SectionSummary;

  // Section transition response
  sectionIndex?: number;
  sectionName?: string;
  newSection?: {
    index: number;
    name: string;
    timeLimit: number;
    questionsCount: number;
  };
  nextSectionIndex?: number;

  // Time remaining (for section transitions)
  timeRemaining?: number;

  // Test completion response
  submissionResult?: {
    finalScore: SessionFinalScore;
    completedAt: Date;
    sessionId: string;
    resultId: string;
    status: string;
    message: string;
  };
  finalScore?: SessionFinalScore;
  completedAt?: Date;
  completedSections?: number[];
  showConfirmation?: boolean;
  confirmationData?: {
    totalQuestions: number;
    answeredQuestions: number;
    skippedQuestions: number;
    timeSpent: number;
    score: number;
    passed: boolean;
  };
  
  // test_completed_with_error response:
  error?: string;
  sessionId?: string;
  requiresManualSubmission?: boolean;
}

// =====================
// ANSWER SUBMISSION (matches actual submitAnswer endpoint)
// =====================

export interface SubmitAnswerRequest {
  answer?: any; // Optional for skips
  timeSpent?: number;
  action: 'submit' | 'skip'; // Server determines next action based on this
  skipReason?: string; // For analytics
}

// =====================
// NAVIGATION CONTEXT (matches buildNavigationContext in questionHandler)
// =====================

// UPDATED: NavigationContext for section-relative indexing
export interface NavigationContext {
  // Current position (SECTION-RELATIVE)
  currentQuestionIndex: number;      // 0-based within current section
  totalQuestionsInSection: number;

  // Navigation flags
  canGoBack: boolean;
  canGoForward: boolean;
  isLastQuestion: boolean;
  isReviewing: boolean;

  // Timing
  timeRemaining: number;             // seconds

  // Section info (only for sectioned tests)
  currentSection?: {
    index: number;
    name: string;
    status: 'not_started' | 'in_progress' | 'reviewing' | 'submitted';
    questionCount: number;
  };
  totalSections?: number;
  isLastSection?: boolean;
  completedSections?: number[];

  // Legacy fields for backward compatibility
  answeredQuestions?: number[];
  skippedQuestions?: number[];
  totalQuestions?: number;          // Global total (deprecated, use totalQuestionsInSection)
  reviewPhase?: boolean;            // Deprecated, use isReviewing
}

// Section summary for review mode
export interface SectionSummary {
  totalQuestions: number;
  answered: number;
  skipped: number;
  viewed: number;
  notViewed: number;
  unanswered: number;
  questionStatuses: Array<{
    index: number;
    status: 'not_viewed' | 'viewed' | 'answered' | 'skipped';
    hasAnswer: boolean;
  }>;
}

// =====================
// API RESPONSES (matching ACTUAL server controller returns)
// =====================

// CORRECTED: sessionManager.createSession actual return
export interface StartSessionResponse {
  success: boolean;
  session: {
    sessionId: string;
    isResuming: boolean;
    testInfo: {
      title: string;
      description: string;
      totalQuestions: number;
      totalPoints: number;
      timeLimit: number;
      useSections: boolean;
      sectionCount: number;
    };
    startedAt: string;
    attemptNumber: number;
    timeRemaining: number; // This is actually returned
    sectionInfo?: {
      currentSectionIndex: number;
      currentSectionTimeRemaining: number;
      sectionsCompleted: number;
      totalSections: number;
      currentSectionName: string;
    } | null;
  };
  question: CurrentQuestionResponse; // Use existing interface
  message: string;
}

// CORRECTED: sessionManager.rejoinSession actual return
export interface RejoinSessionResponse {
  success: boolean;
  session: {
    sessionId: string;
    testTitle: string;
    testDescription: string;
    totalQuestions: number;
    totalPoints: number;
    timeRemaining: number;
    currentQuestionIndex: number;
    currentSectionIndex: number;
    answeredQuestions: number;
    useSections: boolean;
    status: string;
    attemptNumber: number;
    isResuming?: boolean;
    sectionInfo?: {
      currentSectionIndex: number;
      timeRemaining: number;
      name?: string;
    } | null;
  };
  question: {
    questionState: {
      questionIndex: number;
      questionId?: string;
      questionData: QuestionData;
      currentAnswer: any;
      status: QuestionStatus;
      timeSpent: number;
      viewCount?: number;
      points?: number;
      isReviewPhase?: boolean;
      skippedQuestionsRemaining?: number;
    };
    navigationContext: NavigationContext;
    // sessionInfo may or may not be present depending on backend version
    sessionInfo?: {
      title: string;
      description: string;
      totalQuestions: number;
      totalPoints: number;
      timeLimit: number;
      useSections: boolean;
      sectionCount: number;
    };
    timeRemaining?: number;
  };
  wasReconnection?: boolean;
  message: string;
}

// CORRECTED: questionHandler.getCurrentQuestion actual return
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
    questionData: QuestionData;
    currentAnswer: any;
    status: QuestionStatus;
    timeSpent: number;
    viewCount: number;
    isReviewPhase?: boolean;
    skippedQuestionsRemaining?: number;
  };
  navigationContext: NavigationContext;
  timeRemaining: number;
}

// CORRECTED: sessionManager.checkRejoinSession actual return - UPDATED with new properties
export interface CheckExistingSessionResponse {
  success: boolean;
  canRejoin: boolean;
  message: string;
  sessionId?: string;
  timeRemaining?: number;
  testInfo?: {
    title: string;
    description: string;
    totalQuestions: number;
    totalPoints: number;
    useSections: boolean;
    currentQuestionIndex: number;
    answeredQuestions: number;
    completedSections: number;
  };
  // ADDED: New properties for enhanced session status handling
  recentlyCompleted?: boolean; // Session was completed in last 10 minutes
  wasExpired?: boolean; // Session was expired and auto-submitted
  wasRecoveryFailed?: boolean; // Session could not be recovered due to technical issues (doesn't count against attempts)
}

// =====================
// CONFLICT HANDLING (matches sessionManager.createSession 409 error)
// =====================

export interface StartSessionConflictResponse {
  success: false;
  error: string;
  code: 'EXISTING_SESSION_FOUND';
  existingSession: {
    sessionId: string;
    testTitle: string;
    timeRemaining: number;
    questionProgress: string;
    sectionProgress?: string | null;
  };
}

export interface SessionConflictState {
  show: boolean;
  existingSession?: {
    sessionId: string;
    testTitle: string;
    timeRemaining: number;
    questionProgress: string;
    sectionProgress?: string;
  };
  loading: boolean;
  action: 'checking' | 'rejoining' | 'abandoning' | null;
}

// =====================
// TEST SNAPSHOT & QUESTION DATA (matches snapshotService structure)
// =====================

export interface TestSnapshot {
  originalTestId: string;
  title: string;
  description: string;
  testType: TestType;
  languages: Language[];
  tags: Tags[];
  settings: {
    timeLimit: number;
    attemptsAllowed: number;
    shuffleQuestions: boolean;
    useSections: boolean;
  };
  randomizationSeed: string;
  wasShuffled: boolean;
  totalQuestions: number;
  totalPoints: number;
  sections?: TestSessionSection[];
  questions?: TestSessionQuestion[];
}

export interface TestSessionQuestion {
  questionId: string;
  questionData: QuestionData;
  points: number;
  originalOrder: number;
  finalOrder: number;
  studentAnswer: any;
  status: QuestionStatus;
  timeSpentOnQuestion: number;
  viewCount: number;
  firstViewedAt?: string;
  lastViewedAt?: string;
  isCorrect?: boolean;
  pointsEarned?: number;
}

export interface QuestionData {
  title: string;
  description: string;
  type: 'multipleChoice' | 'trueFalse' | 'codeChallenge' | 'fillInTheBlank' | 'codeDebugging';
  language: Language;
  category?: 'logic' | 'ui' | 'syntax';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: Tags[];
  points: number;
  options?: string[];
  correctAnswer?: any;
  codeTemplate?: string;
  blanks?: Array<{
    id: string;
    hint?: string;
    points: number;
  }>;
  buggyCode?: string;
  testCases?: Array<{
    name?: string;
    args: any[];
    expected: any;
    hidden?: boolean;
  }>;
  codeConfig?: {
    runtime: string;
    entryFunction: string;
    timeoutMs: number;
  };
}

export interface TestSessionSection {
  name: string;
  timeLimit: number;
  originalSectionIndex: number;
  questions: TestSessionQuestion[];
}

export interface SessionFinalScore {
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
  passingThreshold: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  totalTimeUsed: number;
}

// =====================
// REQUEST TYPES (simplified)
// =====================

export interface StartSessionRequest {
  testId: string;
  forceNew?: boolean;
}

export interface SubmitSessionRequest {
  forceSubmit?: boolean;
}

// =====================
// TYPE GUARDS (updated for actual backend responses)
// =====================

export const isSessionInProgress = (session: TestSession): boolean => {
  return session.status === 'inProgress';
};

export const isSessionCompleted = (session: TestSession): session is TestSession & {
  completedAt: string;
  finalScore: SessionFinalScore
} => {
  return session.status === 'completed' && !!session.completedAt && !!session.finalScore;
};

export const isUsingSections = (session: TestSession): boolean => {
  return session?.testSnapshot?.settings?.useSections || false;
};

export const isConflictResponse = (error: any): error is { type: 'EXISTING_SESSION_CONFLICT'; data: StartSessionConflictResponse } => {
  return error?.type === 'EXISTING_SESSION_CONFLICT' && error?.data?.existingSession;
};

export const hasExistingSession = (checkResult: CheckExistingSessionResponse): checkResult is CheckExistingSessionResponse & {
  sessionId: string;
  timeRemaining: number;
  testInfo: NonNullable<CheckExistingSessionResponse['testInfo']>;
} => {
  return checkResult.canRejoin &&
    !!checkResult.sessionId &&
    typeof checkResult.timeRemaining === 'number' &&
    !!checkResult.testInfo;
};

// NEW: Type guards for enhanced session status
export const wasRecentlyCompleted = (checkResult: CheckExistingSessionResponse): boolean => {
  return checkResult.recentlyCompleted === true;
};

export const wasExpiredAndSubmitted = (checkResult: CheckExistingSessionResponse): boolean => {
  return checkResult.wasExpired === true;
};

export const wasRecoveryFailed = (checkResult: CheckExistingSessionResponse): boolean => {
  return checkResult.wasRecoveryFailed === true;
};

export const shouldShowRejoinModal = (checkResult: CheckExistingSessionResponse): boolean => {
  return checkResult.success && checkResult.canRejoin && !!checkResult.sessionId &&
    !checkResult.recentlyCompleted && !checkResult.wasExpired && !checkResult.wasRecoveryFailed;
};

// =====================
// UTILITY FUNCTIONS
// =====================

export const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatProgress = (answered: number, total: number): string => {
  return `${answered}/${total}`;
};

export const calculateProgressPercentage = (answered: number, total: number): number => {
  return total > 0 ? Math.round((answered / total) * 100) : 0;
};

export const canRejoinSession = (timeRemaining: number): boolean => {
  return timeRemaining > 0;
};

export const shouldShowRejoinOption = (checkResult: CheckExistingSessionResponse): boolean => {
  return shouldShowRejoinModal(checkResult);
};

// =====================
// COMPONENT INTERFACES
// =====================

export interface UseSessionRejoinOptions {
  onRejoinSuccess?: (sessionId: string) => void;
  onRejoinError?: (error: Error) => void;
  onConflictDetected?: (conflict: SessionConflictState['existingSession']) => void;
}

export interface UseSessionRejoinReturn {
  checkExistingSession: () => Promise<CheckExistingSessionResponse>;
  rejoinSession: (sessionId: string) => Promise<RejoinSessionResponse>;
  startSessionWithConflictHandling: (request: StartSessionRequest) => Promise<StartSessionResponse>;
  conflictState: SessionConflictState;
  isLoading: boolean;
  error: string | null;
}

export interface RejoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSession: CheckExistingSessionResponse;
  onRejoin: (sessionId: string) => Promise<void>;
  onAbandon: () => Promise<void>;
  loading: boolean;
}

export interface StartTestButtonProps {
  testId: string;
  onSessionStarted: (sessionId: string) => void;
  onConflict: (conflict: SessionConflictState['existingSession']) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}