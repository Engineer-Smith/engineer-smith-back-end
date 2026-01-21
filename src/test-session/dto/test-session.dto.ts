// src/test-session/dto/test-session.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsMongoId,
  IsEnum,
  IsObject,
  Min,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Custom validator to limit answer payload size (prevents DoS via large payloads)
@ValidatorConstraint({ name: 'answerSizeLimit', async: false })
class AnswerSizeLimitConstraint implements ValidatorConstraintInterface {
  private readonly MAX_ANSWER_SIZE = 1024 * 100; // 100KB max

  validate(answer: any): boolean {
    if (answer === undefined || answer === null) return true;
    try {
      const serialized = JSON.stringify(answer);
      return serialized.length <= this.MAX_ANSWER_SIZE;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Answer payload is too large (max 100KB)';
  }
}

// Start Session DTO
export class StartTestSessionDto {
  @IsMongoId()
  testId: string;

  @IsOptional()
  @IsBoolean()
  forceNew?: boolean;
}

// Submit Answer DTO
export class SubmitAnswerDto {
  @IsOptional()
  @Validate(AnswerSizeLimitConstraint)
  answer?: any; // Can be various types depending on question type

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @IsOptional()
  @IsString()
  action?: string; // 'next', 'previous', 'skip', etc.
}

// Submit Test DTO
export class SubmitTestDto {
  @IsOptional()
  @IsBoolean()
  forceSubmit?: boolean;
}

// Session Filters DTO
export class TestSessionFiltersDto {
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
  @IsEnum(['inProgress', 'paused', 'completed', 'expired', 'abandoned'])
  status?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  skip?: number;
}

// Response DTOs
export class SessionInfoDto {
  sessionId: string;
  testTitle: string;
  testDescription: string;
  totalQuestions: number;
  totalPoints: number;
  timeRemaining: number;
  currentQuestionIndex: number;
  currentSectionIndex?: number;
  answeredQuestions: number;
  useSections: boolean;
  status: string;
}

export class QuestionStateDto {
  questionIndex: number;
  questionId: string;
  questionData: any;
  points: number;
  status: string;
  studentAnswer?: any;
  timeSpent: number;
}

export class NavigationContextDto {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: number[];
  skippedQuestions: number[];
  currentSection?: {
    index: number;
    name: string;
    questionCount: number;
    timeRemaining: number;
  };
  canGoBack: boolean;
  canGoForward: boolean;
  isLastQuestion: boolean;
  isLastSection: boolean;
}

export class StartSessionResponseDto {
  success: boolean;
  session: SessionInfoDto;
  question: {
    questionState: QuestionStateDto;
    navigationContext: NavigationContextDto;
  };
  message: string;
}

export class CheckExistingSessionResponseDto {
  success: boolean;
  canRejoin: boolean;
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
    completedSections?: number;
  };
  message: string;
}

export class SubmitAnswerResponseDto {
  success: boolean;
  action: string;
  questionState?: QuestionStateDto;
  navigationContext?: NavigationContextDto;
  result?: any;
  message?: string;
}

export class FinalScoreDto {
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

export class SubmitTestResponseDto {
  success: boolean;
  message: string;
  sessionId: string;
  finalScore: FinalScoreDto;
}

export class TimeSyncResponseDto {
  success: boolean;
  serverTime: number;
  startTime: number;
  elapsedSeconds: number;
  timeRemainingSeconds: number;
  timeLimitMinutes: number;
  sessionStatus: string;
  isConnected: boolean;
  sectionInfo?: {
    currentSectionIndex: number;
    sectionTimeRemaining: number;
    currentSectionName: string;
    sectionsCompleted: number;
    totalSections: number;
  };
}

export class SessionListItemDto {
  _id: string;
  testId: string;
  testTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  attemptNumber: number;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  finalScore: FinalScoreDto;
  isConnected: boolean;
  lastConnectedAt?: Date;
  currentQuestionIndex: number;
  answeredQuestions: number[];
  completedSections?: number[];
  currentSectionIndex?: number;
}