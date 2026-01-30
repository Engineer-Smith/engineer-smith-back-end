// src/types/student.ts

export interface StudentDashboardStats {
  testsAvailable: number;
  testsCompleted: number;
  averageScore: number;
  passedTests: number;
  totalTimeSpent: number;
}

export interface TestAttempts {
  total: number | 'unlimited';
  used: number;
  remaining: number | 'unlimited';
  unlimited?: boolean;
}

export interface StudentTest {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  attempts: TestAttempts;
  canTakeTest: boolean;
  hasOverride: boolean;
}

export interface StudentActivity {
  id: string;
  testTitle: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  score?: number;
  timestamp: string;
}

export interface StudentAttemptRequest {
  id: string;
  testTitle: string;
  requestedAttempts: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface StudentOverride {
  id: string;
  testTitle: string;
  extraAttempts: number;
  reason: string;
  grantedAt: string;
}

export interface StudentDashboard {
  stats: StudentDashboardStats;
  tests: StudentTest[];
  recentActivity: StudentActivity[];
  requests: StudentAttemptRequest[];
  overrides: StudentOverride[];
}

// API Service method type
export interface StudentDashboardResponse {
  success: boolean;
  data: StudentDashboard;
}