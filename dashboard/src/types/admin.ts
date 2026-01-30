// src/types/admin.ts - Complete admin dashboard type definitions
import type { 
  Role, 
  SessionStatus, 
  TestStatus, 
  QuestionType, 
  Language, 
  TestType, 
  Difficulty
} from "./common";

import type { BaseComponentProps } from "./ui";

// =====================
// DASHBOARD RESPONSE INTERFACES
// =====================

export interface UserManagementDashboard {
  overview: {
    totalUsers: number;
    roleDistribution: {
      admin: number;
      instructor: number;
      student: number;
    };
    accountTypes: {
      sso: number;
      regular: number;
    };
    performance: {
      totalTestsTaken: number;
      averageScore: number;
      passRate: number; // Percentage
      totalTimeSpent: number; // Seconds
    } | null;
  };

  recentActivity: {
    newUsersLast30Days: Array<{
      _id: string; // Date string YYYY-MM-DD
      count: number;
    }>;
    registrationTrend: number; // Total new users in last 30 days
  };

  users: {
    list: UserListItem[];
    pagination: {
      total: number;
      limit: number;
      skip: number;
      hasMore: boolean;
    };
  };

  content: {
    topQuestionCreators: Array<{
      creatorId: string;
      questionCount: number;
      creatorName: string;
      creatorRole: Role;
    }>;
    topTestCreators: Array<{
      creatorId: string;
      testCount: number;
      creatorName: string;
      creatorRole: Role;
    }>;
  };

  // Only present for super org admins
  organizations?: Array<{
    _id: string;
    name: string;
    isSuperOrg: boolean;
    userCount: number;
    adminCount: number;
    instructorCount: number;
    studentCount: number;
  }>;
}

export interface UserListItem {
  _id: string;
  loginId: string;
  fullName: string;
  email?: string;
  role: Role;
  isSSO: boolean;
  organizationName: string;
  createdAt: string;
}

export interface UserDashboardFilters {
  orgId?: string;
  role?: Role;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface UserDetailsDashboard {
  user: {
    _id: string;
    loginId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    role: Role;
    isSSO: boolean;
    organization: {
      _id: string;
      name: string;
      isSuperOrg: boolean;
    };
    createdAt: string;
  };

  performance: {
    overview: UserPerformanceOverview;
    trends: UserPerformanceTrends;
    breakdown: UserPerformanceBreakdown;
  };

  activity: {
    recent: RecentTestActivity[];
    sessions: SessionBreakdown;
  };

  // Only present for instructors/admins
  content?: {
    questions: CreatedQuestionSummary[];
    tests: CreatedTestSummary[];
  };
}

export interface UserPerformanceOverview {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  passRate: number; // Percentage
  totalTimeSpent: number; // Seconds
  efficiency: number; // Percentage of points earned vs possible
}

export interface UserPerformanceTrends {
  recentScores: number[]; // Last 5 test scores
  scoreChange: number; // Change from oldest to newest
  isImproving: boolean;
}

export interface UserPerformanceBreakdown {
  byType: Record<QuestionType, DetailedPerformanceMetric[]>;
  byDifficulty: Record<Difficulty, DetailedPerformanceMetric[]>;
  byLanguage: Record<Language, DetailedPerformanceMetric[]>;
}

export interface DetailedPerformanceMetric {
  type: QuestionType;
  difficulty: Difficulty;
  language: Language;
  totalQuestions: number;
  correctAnswers: number;
  successRate: number; // Percentage
  averageTime: number; // Seconds
  averagePoints: number;
}

export interface RecentTestActivity {
  testId: string;
  testTitle: string;
  testType: TestType;
  attemptNumber: number;
  score: {
    percentage: number;
    passed: boolean;
    earnedPoints: number;
    totalPoints: number;
  };
  status: SessionStatus;
  completedAt?: string;
  timeSpent: number; // Seconds
}

export interface SessionBreakdown {
  [status: string]: {
    count: number;
    averageTime: number; // Milliseconds
  };
}

export interface CreatedQuestionSummary {
  _id: string;
  title: string;
  type: QuestionType;
  language: Language;
  difficulty: Difficulty;
  status: TestStatus;
  timesUsed: number;
  successRate: number; // Percentage
  createdAt: string;
}

export interface CreatedTestSummary {
  _id: string;
  title: string;
  testType: TestType;
  status: TestStatus;
  totalAttempts: number;
  averageScore: number;
  createdAt: string;
}

// =====================
// API REQUEST/RESPONSE INTERFACES
// =====================

export interface GetUserDashboardParams {
  orgId?: string;
  role?: Role;
  search?: string;
  limit?: string;
  skip?: string;
}

export interface GetUserDetailsParams {
  userId: string; // Path parameter
}

// =====================
// CHART DATA INTERFACES
// =====================

export interface RegistrationTrendData {
  labels: string[]; // Dates
  datasets: [{
    label: 'New Registrations';
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }];
}

export interface RoleDistributionData {
  labels: ['Admin', 'Instructor', 'Student'];
  datasets: [{
    data: [number, number, number];
    backgroundColor: [string, string, string];
  }];
}

export interface PerformanceComparisonData {
  labels: string[]; // Question types, difficulties, or languages
  datasets: [{
    label: 'Success Rate';
    data: number[];
    backgroundColor: string;
  }];
}

export interface ScoreTrendData {
  labels: string[]; // Test attempt numbers or dates
  datasets: [{
    label: 'Score';
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }];
}

// =====================
// REACT HOOK INTERFACES
// =====================

export interface UseUserDashboard {
  data: UserManagementDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filters: UserDashboardFilters;
  setFilters: (filters: Partial<UserDashboardFilters>) => void;
}

export interface UseUserDetails {
  data: UserDetailsDashboard | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  userId: string;
}

// =====================
// COMPONENT PROP INTERFACES
// =====================

export interface UserManagementPageProps extends BaseComponentProps {
  initialFilters?: UserDashboardFilters;
  onUserSelect?: (userId: string) => void;
}

export interface UserDetailsPageProps extends BaseComponentProps {
  userId: string;
  onBack?: () => void;
  canEdit?: boolean;
}

export interface UserOverviewCardProps extends BaseComponentProps {
  overview: UserManagementDashboard['overview'];
  loading?: boolean;
}

export interface RecentActivityCardProps extends BaseComponentProps {
  activity: UserManagementDashboard['recentActivity'];
  loading?: boolean;
}

export interface UserListTableProps extends BaseComponentProps {
  users: UserListItem[];
  pagination: UserManagementDashboard['users']['pagination'];
  loading?: boolean;
  onUserClick?: (userId: string) => void;
  onPageChange?: (skip: number, limit: number) => void;
}

export interface ContentCreatorsCardProps extends BaseComponentProps {
  content: UserManagementDashboard['content'];
  loading?: boolean;
}

export interface OrganizationStatsCardProps extends BaseComponentProps {
  organizations: UserManagementDashboard['organizations'];
  loading?: boolean;
}

export interface UserProfileCardProps extends BaseComponentProps {
  user: UserDetailsDashboard['user'];
  canEdit?: boolean;
  onEdit?: () => void;
}

export interface PerformanceOverviewCardProps extends BaseComponentProps {
  performance: UserDetailsDashboard['performance'];
  loading?: boolean;
}

export interface ActivityTimelineProps extends BaseComponentProps {
  activity: UserDetailsDashboard['activity'];
  loading?: boolean;
}

export interface CreatedContentTabsProps extends BaseComponentProps {
  content: UserDetailsDashboard['content'];
  loading?: boolean;
}

// =====================
// FILTER AND SEARCH INTERFACES
// =====================

export interface UserSearchFilters {
  search: string;
  role: Role | 'all';
  accountType: 'all' | 'sso' | 'regular';
  organization: string | 'all'; // For super admins
  dateRange: {
    start?: string;
    end?: string;
  };
  sortBy: 'name' | 'role' | 'createdAt' | 'lastActivity';
  sortOrder: 'asc' | 'desc';
}

export interface PerformanceFilters {
  timeRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
  testType: TestType | 'all';
  difficulty: Difficulty | 'all';
  language: Language | 'all';
  minScore?: number;
  maxScore?: number;
}

export interface AdvancedUserFilters extends UserDashboardFilters {
  accountType?: 'all' | 'sso' | 'regular';
  dateRange?: {
    start: string;
    end: string;
  };
  performanceRange?: {
    minScore: number;
    maxScore: number;
  };
  activityRange?: {
    minTests: number;
    maxTests: number;
  };
  sortBy?: 'name' | 'role' | 'createdAt' | 'lastActivity' | 'averageScore';
  sortOrder?: 'asc' | 'desc';
}

// =====================
// ERROR HANDLING INTERFACES
// =====================

export interface DashboardError {
  type: 'permission' | 'network' | 'validation' | 'server';
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface DashboardLoadingState {
  overview: boolean;
  users: boolean;
  performance: boolean;
  content: boolean;
  organizations: boolean;
}

// =====================
// ACTION INTERFACES
// =====================

export interface UserAction {
  type: 'edit' | 'delete' | 'resetPassword' | 'toggleRole' | 'transferOrganization';
  userId: string;
  payload?: Record<string, any>;
}

export interface BulkUserAction {
  type: 'delete' | 'changeRole' | 'transferOrganization' | 'export';
  userIds: string[];
  payload?: Record<string, any>;
}

export interface AdminActionContext {
  canEdit: boolean;
  canDelete: boolean;
  canChangeRole: boolean;
  canTransferOrganization: boolean;
  canResetPassword: boolean;
  canViewSensitiveData: boolean;
  isSuperOrgAdmin: boolean;
}

// =====================
// ANALYTICS INTERFACES
// =====================

export interface UserAnalyticsData {
  performanceByPeriod: Array<{
    period: string;
    averageScore: number;
    testsCompleted: number;
    passRate: number;
  }>;
  skillProgression: Array<{
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    progress: number; // 0-100
    testsCount: number;
  }>;
  comparativeRanking: {
    organizationRank: number;
    organizationTotal: number;
    percentile: number;
  };
  learningPath: Array<{
    topic: string;
    mastered: boolean;
    recommendedNext: boolean;
    difficulty: Difficulty;
  }>;
}

export interface OrganizationAnalyticsData {
  userGrowth: Array<{
    month: string;
    newUsers: number;
    activeUsers: number;
    retentionRate: number;
  }>;
  performanceDistribution: Array<{
    scoreRange: string;
    userCount: number;
    percentage: number;
  }>;
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    testCompletionRate: number;
  };
  topPerformers: Array<{
    userId: string;
    userName: string;
    averageScore: number;
    testsCompleted: number;
    rank: number;
  }>;
}

// =====================
// EXPORT AND REPORTING
// =====================

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includePerformanceData: boolean;
  includeActivityLog: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  userIds?: string[];
}

export interface ReportRequest {
  type: 'user_summary' | 'performance_analysis' | 'activity_report' | 'organization_overview';
  parameters: ExportOptions;
  recipients?: string[]; // Email addresses
  scheduledDelivery?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}

// =====================
// API SERVICE INTERFACE
// =====================

export interface AdminApiService {
  // Dashboard endpoints
  getUserDashboard(params?: GetUserDashboardParams): Promise<UserManagementDashboard>;
  getUserDetailsDashboard(userId: string): Promise<UserDetailsDashboard>;
  
  // User management
  updateUserRole(userId: string, role: Role): Promise<void>;
  transferUserOrganization(userId: string, organizationId: string): Promise<void>;
  resetUserPassword(userId: string): Promise<{ tempPassword: string }>;
  deleteUser(userId: string): Promise<void>;
  
  // Bulk operations
  bulkUpdateUsers(action: BulkUserAction): Promise<{ success: number; failed: number }>;
  exportUsers(options: ExportOptions): Promise<{ downloadUrl: string }>;
  
  // Analytics
  getUserAnalytics(userId: string, timeRange?: string): Promise<UserAnalyticsData>;
  getOrganizationAnalytics(orgId?: string, timeRange?: string): Promise<OrganizationAnalyticsData>;
  
  // Reporting
  generateReport(request: ReportRequest): Promise<{ reportId: string }>;
}

// =====================
// UTILITY TYPES
// =====================

export type DashboardView = 'overview' | 'users' | 'analytics' | 'reports' | 'settings';

export type UserManagementTab = 'list' | 'analytics' | 'activity' | 'reports';

export type UserDetailsTab = 'profile' | 'performance' | 'activity' | 'content' | 'settings';

// =====================
// FORM INTERFACES
// =====================

export interface UserEditForm {
  firstName: string;
  lastName: string;
  email?: string;
  role: Role;
  organizationId?: string;
}

export interface BulkActionForm {
  action: BulkUserAction['type'];
  targetRole?: Role;
  targetOrganizationId?: string;
  confirmationText: string;
}

export interface FilterForm {
  search: string;
  role: Role | 'all';
  organization: string | 'all';
  accountType: 'all' | 'sso' | 'regular';
  dateRange: {
    start: string;
    end: string;
  } | null;
}

// =====================
// TYPE GUARDS
// =====================

export const isUserManagementDashboard = (data: any): data is UserManagementDashboard => {
  return data && 
    typeof data.overview === 'object' &&
    typeof data.recentActivity === 'object' &&
    typeof data.users === 'object' &&
    typeof data.content === 'object';
};

export const isUserDetailsDashboard = (data: any): data is UserDetailsDashboard => {
  return data &&
    typeof data.user === 'object' &&
    typeof data.performance === 'object' &&
    typeof data.activity === 'object';
};

export const hasSuperOrgData = (dashboard: UserManagementDashboard): dashboard is UserManagementDashboard & { organizations: NonNullable<UserManagementDashboard['organizations']> } => {
  return dashboard.organizations !== undefined && dashboard.organizations.length > 0;
};

export const hasContentData = (dashboard: UserDetailsDashboard): dashboard is UserDetailsDashboard & { content: NonNullable<UserDetailsDashboard['content']> } => {
  return dashboard.content !== undefined;
};

// =====================
// QUEUE STATUS INTERFACES
// =====================

export interface QueueStatus {
  queueDepth: number;
  running: number;
  avgWaitMs: number;
  healthy: boolean;
}

export interface QueueMetrics {
  currentQueueDepth: number;
  currentRunning: number;
  runningByLanguage: Record<string, number>;
  totalJobsProcessed: number;
  totalJobsQueued: number;
  totalJobsImmediate: number;
  averageWaitTimeMs: number;
  maxWaitTimeMs: number;
  highPriorityProcessed: number;
  normalPriorityProcessed: number;
  totalTimeouts: number;
  totalErrors: number;
  lastJobProcessedAt: string | null;
  serviceStartedAt: string;
  security: SecurityMetrics;
}

export interface SecurityMetrics {
  totalScans: number;
  totalRejections: number;
  rejectionRate: string;
  recentViolations: Array<{
    timestamp: string;
    language: string;
    violations: string[];
  }>;
}