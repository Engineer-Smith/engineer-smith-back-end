// src/types/index.ts - CORRECTED to align with actual backend implementation

// =====================
// CORE TYPES - Export these first to avoid conflicts
// =====================

// Export all common types and enums first
export type {
  Role,
  Language,
  QuestionType,
  QuestionCategory,
  Difficulty,
  TestStatus,
  SessionStatus,
  QuestionStatus,
  TestType,
  Tags,
  BaseEntity,
  Timestamped,
  UserAudited,
  OrganizationScoped,
  PaginationParams,
  PaginatedResponse,
  SortParams,
  FilterParams,
  User,
  Organization,
  TimeSpan,
  AppError,
  ValidationError,
  AuthenticationError,
  BusinessLogicError,
  UIPreferences,
  ThemeMode,
  LoadingState,
  AsyncState,
  ConsoleLog
} from './common';

// Export validation utilities
export {
  VALID_COMBINATIONS,
  QUESTION_TYPE_LANGUAGE_RULES,
  QUESTION_TYPE_CATEGORY_RULES,
  isValidRole,
  isValidLanguage,
  isValidQuestionType,
  isValidQuestionCategory,
  isValidDifficulty,
  isValidTestStatus,
  isValidSessionStatus,
  isValidTestType,
  isValidQuestionStatus,
  getValidCategories,
  isValidLanguageCategoryCombo,
  isValidQuestionTypeForCategory,
  getAllowedQuestionTypes,
  getAllowedQuestionTypesForCategory,
  isLanguageCategoryCombinationValid,
  getSupportedCategoriesForLanguage,
  isValidQuestionTypeForLanguageAndCategory,
  getAllValidTags,
  getTagsByCategory,
  formatTimeSpan,
  formatDuration,
  formatTimeRemaining,
  hasHigherRole,
  ROLE_HIERARCHY,
  DEFAULT_PAGINATION,
  MAX_PAGINATION_LIMIT
} from './common';

// =====================
// AUTHENTICATION - Export with prefixes to avoid conflicts
// =====================

export type {
  AuthState,
  AuthContext,
  LoginCredentials,
  RegisterData,
  SSOData,
  AuthResult,
  AuthError,
  SessionInfo,
  RefreshTokenData,
  InviteCodeValidation,
  Permission,
  RolePermissions,
  AccessControl,
  AuthenticatedUser,
  LoginFormData,
  RegisterFormData,
  FormErrors,
  FormValidationResult,
  PasswordResetRequest,
  PasswordResetData,
  PasswordChangeData,
  ProfileUpdateData,
  ProfileValidation,
  SSOProvider,
  SSOCallback,
  SSOUser,
  SecurityEvent,
  AuditLog,
  ProtectedRouteProps,
  RoleCheck,
  ApiToken,
  CreateApiTokenRequest,
  ApiTokenResponse
} from './auth';

export type {
  ResourceType,
  ActionType
} from './auth';

export {
  getRolePermissions,
  canAccessOrganizationContent
} from './auth';

// =====================
// QUESTION TYPES
// =====================

export type {
  Question,
  CreateQuestionData,
  UpdateQuestionData,
  QuestionTestRequest,
  QuestionTestResult,
  QuestionStatsResponse,
  QuestionListResponse,
  QuestionListItem,
  QuestionFilters,
  TestCase,
  CodeConfig,
  QuestionTypeConfig
} from './question';

export {
  validateQuestionBasics,
  validateQuestionContent,
  validateQuestionData,
  isQuestionValid,
  getQuestionTypeConfig
} from './question';

// =====================
// TEST TYPES
// =====================

export type {
  TestSettings,
  TestQuestionReference,
  TestSection,
  TestStats,
  Test,
  CreateTestRequest,
  UpdateTestRequest,
  TestFilters,
  TestSearchResponse,
  TestPreview,
  TestWithQuestions,
  TestSectionWithQuestions,
  TestQuestionWithData,
  TestTemplate,
  TestAnalytics,
  TestValidationResult,
  TestDraft,
  CreateTestResponse,
  UpdateTestResponse,
  DeleteTestResponse,
  TestValidationResponse
} from './test';

export {
  isUsingSections as isTestUsingSections, // RENAMED to avoid conflict
  hasQuestions,
  isReadyForActivation,
  isGlobalTest,
  isSectionedTest,
  isNonSectionedTest,
  getTotalQuestions,
  getTotalPoints,
  estimateTestDuration,
  getDifficultyRating,
  toTestPreview,
  validateTest
} from './test';

// =====================
// SESSION TYPES (CORRECTED - Updated with actual backend structure)
// =====================

export type {
  // Core session types
  TestSession,
  TestSnapshot,
  TestSessionQuestion,
  TestSessionSection,
  QuestionData,
  SessionFinalScore,

  // Server action response (CORRECTED - includes all actual response types)
  ServerActionResponse,
  SubmitAnswerRequest,

  // Navigation context (CORRECTED - matches buildNavigationContext)
  NavigationContext,
  SectionSummary,

  // API response types (CORRECTED - matches actual controller returns)
  StartSessionResponse,
  CurrentQuestionResponse,
  CheckExistingSessionResponse,
  RejoinSessionResponse,

  // Conflict handling (CORRECTED - matches actual error handling)
  StartSessionConflictResponse,
  SessionConflictState,

  // Request types
  StartSessionRequest,
  SubmitSessionRequest,

  // Hook interfaces
  UseSessionRejoinOptions,
  UseSessionRejoinReturn,

  // Component props
  RejoinModalProps,
  StartTestButtonProps
} from './session';

export {
  // Type guards
  isSessionInProgress,
  isSessionCompleted,
  isUsingSections as isSessionUsingSections,
  isConflictResponse,
  hasExistingSession,

  // Utility functions
  formatTimeRemaining as formatSessionTime,
  formatProgress,
  calculateProgressPercentage,
  canRejoinSession,
  shouldShowRejoinOption
} from './session';

// =====================
// SOCKET TYPES (CORRECTED - Updated with actual backend events)
// =====================

export type {
  // Base socket types
  BaseSocketEvent,
  SocketConnectionState,
  SocketConnectionInfo,
  SocketServiceConfig,
  SocketServiceCallbacks,
  ISocketService,
  
  // Session lifecycle events (CORRECTED - matches actual socketService.js)
  SessionJoinedEvent,
  SessionRejoinedEvent,          // ADDED - backend sends this
  SessionPausedEvent,            // ADDED - backend sends this
  SessionResumedEvent,           // ADDED - backend sends this
  SessionErrorEvent,
  
  // Timer events (CORRECTED - matches actual timerService.js)
  TimerSyncEvent,               // RENAMED from TimerUpdateEvent
  TimerWarningEvent,            // ADDED - backend sends this
  
  // Test progress events
  SectionExpiredEvent,
  TestCompletedEvent,
  
  // Answer flow events (ADDED - backend supports socket-based submission)
  AnswerProcessedEvent,
  AnswerErrorEvent,
  
  // Request types (CORRECTED - matches actual backend expectations)
  JoinTestSessionRequest,
  LeaveTestSessionRequest,
  RejoinSessionRequest,
  SubmitAnswerRequest as SocketSubmitAnswerRequest,  // RENAMED to avoid conflict
  TimerSyncRequest,             // ADDED - backend supports this
  
  // Hook types
  UseSocketOptions,
  UseSocketReturn,
  UseTimerOptions,
  UseTimerReturn,
  
  // Utility types
  SocketHealth,
  SocketEventName,
  
  // Event aggregation types (CORRECTED)
  SessionLifecycleEvent,
  TimerEvent,
  TestProgressEvent,
  AnswerFlowEvent,              // ADDED
  AllSessionEvents,
  
} from './socket';

export {
  SOCKET_EVENTS,
  // Type guards (CORRECTED - updated names)
  isSessionEvent,
  isTimerSyncEvent,             // RENAMED from isTimerUpdateEvent
  isTimerWarningEvent,          // ADDED
  isSectionExpiredEvent,
  isTestCompletedEvent,
  isSessionErrorEvent,
  isSessionPausedEvent,         // ADDED
  isSessionResumedEvent,        // ADDED
  
  // Legacy compatibility
  isTimerSyncEvent as isTimerUpdateEvent  // DEPRECATED alias
} from './socket';

// =====================
// RESULT AND ANALYTICS TYPES
// =====================

export type {
  Result,
  ResultQuestion,
  ResultScore,
  ResultAnalytics,
  UserAnalytics,
  UserTestResult,
  SectionAnalytics,
  QuestionAnalytics,
  ExtendedResultAnalytics,
  PerformanceMetric,
  ExtendedUserAnalytics,
  LanguagePerformance,
  ScoreProgressionPoint,
  ActivityPattern,
  AnalyticsFilters,
  PaginatedAnalyticsResponse,
  OrganizationSummary,
  TestSummary,
  ExportableAnalytics,
  PopulatedResult
} from './result';

export {
  isCompletedResult,
  isPassedResult,
  isPaginatedResponse,
  calculateSuccessRate,
  formatDuration as formatResultDuration,
  getPerformanceGrade,
  getTrendDirection,
  groupResultsByPeriod
} from './result';

// =====================
// API TYPES (CORRECTED - Updated with actual backend endpoints)
// =====================

export type {
  // Authentication
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  ValidateInviteRequest,
  ValidateInviteResponse,
  GetCurrentUserResponse,
  AuthStatusResponse,

  // Questions
  CreateQuestionRequest,
  CreateQuestionResponse,
  GetQuestionResponse,
  UpdateQuestionResponse,
  DeleteQuestionResponse,
  TestQuestionRequest as ApiTestQuestionRequest,
  TestQuestionResponse as ApiTestQuestionResponse,
  GetQuestionStatsResponse,
  GetAllQuestionsResponse,

  // Tests
  CreateTestResponse as ApiCreateTestResponse,
  GetTestResponse,
  UpdateTestResponse as ApiUpdateTestResponse,
  DeleteTestResponse as ApiDeleteTestResponse,

  // Test Sessions (CORRECTED - updated with actual backend structure)
  SessionStartRequest,          // CORRECTED - includes forceNew flag
  SessionStartResponse as ApiSessionStartResponse,
  CurrentQuestionResponse as ApiCurrentQuestionResponse,
  NavigationRequest as ApiNavigationRequest,
  NavigationResponse,
  SaveAnswerRequest as ApiSaveAnswerRequest,
  SaveAnswerResponse as ApiSaveAnswerResponse,
  SessionOverviewResponse as ApiSessionOverviewResponse,
  SubmitSessionRequest as ApiSubmitSessionRequest,
  SubmitSessionResponse as ApiSubmitSessionResponse,
  AbandonSessionResponse,
  TimeSyncResponse as ApiTimeSyncResponse,

  // Analytics (CORRECTED - matches adminService.js)
  QuestionAnalyticsResponse,

  // General API types
  ApiParams,
  SuccessResponse,
  ErrorResponse
} from './api';

// =====================
// UI COMPONENT TYPES
// =====================

export type {
  FormState,
  ValidationResult,
  FontSize,
  ColorBlindMode,
  SelectOption,
  LanguageOption,
  QuestionTypeOption,
  CategoryOption,
  DifficultyOption,
  TagOption,
  TableColumn,
  TableProps,
  PaginationProps,
  ModalProps,
  ConfirmDialogProps,
  NotificationType,
  Notification,
  CodeEditorProps,
  StatCard,
  ChartData,
  SearchState,
  SearchProps,
  UIWizardStep,
  UIWizardState,
  StepperProps,
  ButtonProps,
  InputProps,
  SelectProps,
  TableAction,
  BulkAction,
  FilterOption,
  FilterGroup,
  FilterState,
  ActiveFilter,
  NavigationItem,
  BreadcrumbItem,
  TabItem,
  DashboardStats,
  DashboardFeature,
  DashboardStatCardProps,
  DashboardFeatureCardProps,
  QuickActionsProps,
  QuickActionType
} from './ui';

// =====================
// CREATE TEST WIZARD TYPES
// =====================

export type {
  CreateTestData,
  WizardStepProps,
  WizardTestTemplate,
  WizardState,
  WizardStep,
  WizardConfig
} from './createTest';

export {
  createTestPayload,
  createEmptyTestData,
  createTestFromTemplate,
  validateWizardTestData,
  isStepValid,
  getWizardProgress,
  hasUnsavedChanges,
  createInitialWizardState,
  updateWizardState,
  getWizardTestTemplates,
  getTestScopeText,
  canCreateGlobalTests,
  getTotalQuestionCount,
  isUsingSection
} from './createTest';

// =====================
// ADMIN DASHBOARD TYPES
// =====================

export type {
  // Dashboard response interfaces
  UserManagementDashboard,
  UserDetailsDashboard,
  UserListItem,
  UserPerformanceOverview,
  UserPerformanceTrends,
  UserPerformanceBreakdown,
  DetailedPerformanceMetric,
  RecentTestActivity,
  SessionBreakdown,
  CreatedQuestionSummary,
  CreatedTestSummary,

  // API interfaces
  UserDashboardFilters,
  GetUserDashboardParams,
  GetUserDetailsParams,

  // Chart data interfaces
  RegistrationTrendData,
  RoleDistributionData,
  PerformanceComparisonData,
  ScoreTrendData,

  // React hook interfaces
  UseUserDashboard,
  UseUserDetails,

  // Component prop interfaces
  UserManagementPageProps,
  UserDetailsPageProps,
  UserOverviewCardProps,
  RecentActivityCardProps,
  UserListTableProps,
  ContentCreatorsCardProps,
  OrganizationStatsCardProps,
  UserProfileCardProps,
  PerformanceOverviewCardProps,
  ActivityTimelineProps,
  CreatedContentTabsProps,

  // Filter and search interfaces
  UserSearchFilters,
  PerformanceFilters,
  AdvancedUserFilters,

  // Error and state interfaces
  DashboardError,
  DashboardLoadingState,

  // Action interfaces
  UserAction,
  BulkUserAction,
  AdminActionContext,

  // Analytics interfaces
  UserAnalyticsData,
  OrganizationAnalyticsData,

  // Export and reporting
  ExportOptions,
  ReportRequest,

  // API service interface
  AdminApiService,

  // Utility types
  DashboardView,
  UserManagementTab,
  UserDetailsTab,

  // Form interfaces
  UserEditForm,
  BulkActionForm,
  FilterForm
} from './admin';

export {
  // Type guards
  isUserManagementDashboard,
  isUserDetailsDashboard,
  hasSuperOrgData,
  hasContentData
} from './admin';

// =====================
// UTILITY TYPE HELPERS (Generic helpers only)
// =====================

// Helper to make certain fields required
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Helper to make certain fields optional
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Helper for API responses
export type ApiResponse<T> = {
  data?: T;
  error?: boolean;
  status?: number;
  message?: string;
};

// Helper for paginated API responses
export type PaginatedApiResponse<T> = ApiResponse<{
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}>;

// =====================
// LEGACY COMPATIBILITY (CORRECTED - Only types that exist)
// =====================

// CORRECTED: Only use types that actually exist in session.ts
export type { SessionFinalScore as TestSessionScore } from './session';

// CORRECTED: Define simplified types that match actual backend capability
export type CodeExecutionResult = {
  success: boolean;
  output?: string;
  error?: string;
  testResults?: Array<{
    passed: boolean;
    input?: any;
    expected?: any;
    actual?: any;
    error?: string;
  }>;
  executionTime?: number;
};

export type BlankAnswer = {
  blankId: string;
  value: string;
  isCorrect?: boolean;
};

// =====================
// BACKWARD COMPATIBILITY ALIASES (CORRECTED)
// =====================

// Socket event aliases for backward compatibility
export type { TimerSyncEvent as TimerUpdateEvent } from './socket';

// Session response aliases
export type { StartSessionResponse as SessionStartResponse } from './session';
export type { CheckExistingSessionResponse as ExistingSessionCheckResponse } from './session';
export type { RejoinSessionResponse as SessionRejoinResponse } from './session';

// Common action result type
export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// =====================
// CONVENIENCE ALIASES (No re-exports to avoid conflicts)
// =====================

// Simple success/error response type
export type SimpleResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export type {
  // Core types and enums
  ProgrammingLanguage,
  DifficultyLevel,
  TrackDifficultyLevel,
  ChallengeStatus,
  TrackCategory,
  SubmissionStatus,
  UserProgressStatus,

  // Base interfaces
  CodeConfig as ChallengeCodeConfig,  // Renamed to avoid conflict with question CodeConfig
  TestCase as ChallengeTestCase,      // Renamed to avoid conflict with question TestCase
  ChallengeExample,
  UsageStats as ChallengeUsageStats,
  TrackStats,

  // Main interfaces
  AdminChallenge,
  AdminTrack,
  PublicChallenge,
  PublicTrack,
  TrackChallenge,

  // User progress
  UserChallengeProgress,
  UserTrackProgress,

  // Submissions
  ChallengeSubmission,

  // Form data
  CreateTrackFormData,
  CreateChallengeFormData,

  // API interfaces
  AssignChallengeRequest,
  SubmitCodeRequest,
  TestCodeRequest,

  // Analytics
  ChallengeAnalytics,
  TrackAnalytics,

  // Filters
  ChallengeFilters,
  TrackFilters,

  // Loading states
  CodeChallengeLoadingStates,

  // Errors
  CodeChallengeError,
  CodeChallengeErrors
} from './codeChallenge';

// Convenience aliases for commonly used types
export type {
  AdminTrack as Track,
  AdminChallenge as Challenge,
  PublicTrack as StudentTrack,
  PublicChallenge as StudentChallenge
} from './codeChallenge';