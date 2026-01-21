// src/test/dto/test.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateNested,
  IsMongoId,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Sub-DTOs
export class TestQuestionRefDto {
  @IsMongoId()
  questionId: string;

  @IsNumber()
  @Min(1)
  points: number;
}

export class TestSectionDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  timeLimit: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestQuestionRefDto)
  @ArrayMinSize(1)
  questions: TestQuestionRefDto[];
}

export class TestSettingsDto {
  @IsNumber()
  @Min(1)
  timeLimit: number;

  @IsNumber()
  @Min(1)
  attemptsAllowed: number;

  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  useSections?: boolean;
}

// Create Test DTO
export class CreateTestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'])
  testType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ValidateNested()
  @Type(() => TestSettingsDto)
  settings: TestSettingsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestSectionDto)
  sections?: TestSectionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestQuestionRefDto)
  questions?: TestQuestionRefDto[];

  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: string;
}

// Update Test DTO
export class UpdateTestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'])
  testType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TestSettingsDto)
  settings?: TestSettingsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestSectionDto)
  sections?: TestSectionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestQuestionRefDto)
  questions?: TestQuestionRefDto[];

  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: string;
}

// Test Filters DTO
export class TestFiltersDto {
  @IsOptional()
  @IsMongoId()
  orgId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsString()
  testType?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
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
export class TestResponseDto {
  _id: string;
  title: string;
  description: string;
  testType: string;
  languages: string[];
  tags: string[];
  settings: TestSettingsDto;
  sections?: TestSectionDto[];
  questions?: TestQuestionRefDto[];
  organizationId: string | null;
  isGlobal: boolean;
  status: string;
  createdBy: string;
  stats?: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class TestWithQuestionsResponseDto {
  _id: string;
  title: string;
  description: string;
  testType: string;
  languages: string[];
  tags: string[];
  settings: TestSettingsDto;
  organizationId: string | null;
  isGlobal: boolean;
  status: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sections?: Array<{
    name: string;
    timeLimit: number;
    questions: Array<{
      questionId: string;
      points: number;
      questionData: any;
    }>;
  }>;
  questions?: Array<{
    questionId: string;
    points: number;
    questionData: any;
  }>;
}