// Individual test result from a single test case
export interface TestResult {
  testName: string;
  testCaseIndex: number;
  passed: boolean;
  actualOutput: string | null;
  expectedOutput: string;
  executionTime: number;
  consoleLogs: ConsoleLog[];
  error: string | null;
}

// Console log captured during execution
export interface ConsoleLog {
  type: 'log' | 'warn' | 'info' | 'error';
  message: string;
  timestamp: number;
}

// Complete result from running code tests
export interface GradingResult {
  success: boolean;
  testResults: TestResult[];
  overallPassed: boolean;
  totalTestsPassed: number;
  totalTests: number;
  consoleLogs: ConsoleLog[];
  executionError: string | null;
  compilationError: string | null;
}

// Fill-in-blank specific results
export interface BlankResult {
  blankId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
  possiblePoints: number;
}

export interface FillInBlankResult {
  results: BlankResult[];
  totalPoints: number;
  allCorrect: boolean;
  totalPossiblePoints: number;
  individualBlankPoints: number;
}

// Blank configuration for fill-in-blank questions
export interface BlankConfig {
  id: string;
  correctAnswers: string[];
  caseSensitive?: boolean;
  hint?: string;
  points?: number;
}
