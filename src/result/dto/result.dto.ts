// src/result/dto/result.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsMongoId,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Result Filters DTO
export class ResultFiltersDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  testId?: string;

  @IsOptional()
  @IsMongoId()
  orgId?: string;

  @IsOptional()
  @IsEnum(['completed', 'expired', 'abandoned'])
  status?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number; // Page number (1-indexed)

  @IsOptional()
  @IsString()
  sort?: string; // e.g., "-completedAt" for descending, "completedAt" for ascending
}

// Analytics Filters DTO
export class AnalyticsFiltersDto {
  @IsOptional()
  @IsMongoId()
  testId?: string;

  @IsOptional()
  @IsMongoId()
  orgId?: string;

  @IsOptional()
  @IsMongoId()
  questionId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsEnum(['multipleChoice', 'trueFalse', 'fillInTheBlank', 'codeChallenge', 'codeDebugging'])
  questionType?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(['logic', 'ui', 'syntax'])
  category?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  passed?: boolean;
}

// Response DTOs
export class QuestionDetailDto {
  questionId: string;
  questionNumber: number;
  sectionIndex?: number;
  sectionName?: string;
  title: string;
  description?: string;
  type: string;
  language: string;
  category?: string;
  difficulty: string;
  studentAnswer?: any;
  correctAnswer?: any;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
  manuallyGraded?: boolean;
  feedback?: string;
  timeSpent: number;
  viewCount: number;
  details?: {
    blanks?: Array<{
      id: string;
      studentAnswer: string;
      correctAnswers?: string[];
      isCorrect: boolean;
      hint?: string;
    }>;
    codeResults?: {
      executed: boolean;
      passed: boolean;
      totalTests: number;
      passedTests: number;
      executionTime: number;
      error?: string;
    };
    options?: string[];
    selectedOption?: number;
    correctOption?: number;
  };
}

export class ScoreDto {
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
  passingThreshold: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
}

export class ResultResponseDto {
  _id: string;
  sessionId: string;
  testId: string;
  userId: string;
  organizationId: string;
  attemptNumber: number;
  status: string;
  completedAt?: Date;
  timeSpent: number;
  score: ScoreDto;
  questions?: QuestionDetailDto[];
  questionSummary?: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
  };
  summary: {
    score: number;
    passed: boolean;
    correct: number;
    total: number;
    timeSpent: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ResultListItemDto {
  _id: string;
  sessionId: string;
  testId: any;
  userId: any;
  organizationId: any;
  attemptNumber: number;
  status: string;
  completedAt?: Date;
  timeSpent: number;
  score: {
    percentage: number;
    passed: boolean;
    totalPoints: number;
    earnedPoints: number;
    correctAnswers: number;
    totalQuestions: number;
  };
  createdAt: Date;
}

export class ResultAnalyticsDto {
  testId: string;
  organizationId: string;
  totalResults: number;
  averageScore: number;
  passRate: number;
  averageTime: number;
}

export class UserAnalyticsDto {
  userId: string;
  organizationId: string;
  totalTests: number;
  averageScore: number;
  passRate: number;
  averageTime: number;
  totalTimeSpent: number;
  tests: Array<{
    testId: string;
    attemptNumber: number;
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    completedAt: Date;
  }>;
}

export class SectionAnalyticsDto {
  testId: string;
  sectionIndex: number;
  sectionName: string;
  totalQuestions: number;
  averageScore: number;
  successRate: number;
  averageTime: number;
  totalAttempts: number;
  correctAttempts: number;
}

export class QuestionAnalyticsDto {
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

export class ScoreBreakdownDto {
  overall: {
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
    passed: boolean;
    passingThreshold: number;
  };
  questionBreakdown: {
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
  };
  timeBreakdown: {
    totalTimeSpent: number;
    averageTimePerQuestion: number;
  };
  sectionBreakdown?: Array<{
    sectionIndex: number;
    sectionName: string;
    totalQuestions: number;
    correctAnswers: number;
    totalPoints: number;
    earnedPoints: number;
    totalTime: number;
    percentage: number;
    successRate: number;
    averageTime: number;
  }>;
}