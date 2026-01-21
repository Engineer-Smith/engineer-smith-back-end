// src/student/dto/student.dto.ts

/**
 * Dashboard stats response
 */
export class DashboardStatsDto {
  testsAvailable: number;
  testsCompleted: number;
  averageScore: number;
  passedTests: number;
  totalTimeSpent: number;
}

/**
 * Test attempt info
 */
export class TestAttemptsDto {
  total: number;
  used: number;
  remaining: number;
}

/**
 * Test available for student
 */
export class AvailableTestDto {
  _id: string;
  title: string;
  description: string;
  testType: string;
  isGlobal: boolean;
  organizationId?: string;
  questionCount: number;
  timeLimit: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  attempts: TestAttemptsDto;
  canTakeTest: boolean;
  hasOverride: boolean;
}

/**
 * Recent activity item
 */
export class RecentActivityDto {
  id: string;
  testTitle: string;
  status: string;
  score?: number;
  timestamp: Date;
}

/**
 * Attempt request item
 */
export class AttemptRequestDto {
  id: string;
  testTitle: string;
  requestedAttempts: number;
  status: string;
  reason: string;
  createdAt: Date;
}

/**
 * Override item
 */
export class OverrideDto {
  id: string;
  testTitle: string;
  extraAttempts: number;
  reason?: string;
  grantedAt: Date;
}

/**
 * Complete dashboard response
 */
export class StudentDashboardDto {
  stats: DashboardStatsDto;
  tests: AvailableTestDto[];
  recentActivity: RecentActivityDto[];
  requests: AttemptRequestDto[];
  overrides: OverrideDto[];
}