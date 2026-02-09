import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
  Min,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

import {
  QUESTION_TYPES,
  LANGUAGES,
  DIFFICULTIES,
  CATEGORIES,
  STATUSES,
  RUNTIMES,
} from '../../schemas/question.schema';

// Import types separately
import type {
  QuestionType,
  Language,
  Difficulty,
  Category,
  QuestionStatus,
  Runtime,
} from '../../schemas/question.schema';

// Sub-DTOs
export class TestCaseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  args: any[];

  // Expected can be any type - optional for codeDebugging (computed from solution)
  @IsOptional()
  expected?: any;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  // SQL-specific
  @IsOptional()
  @IsString()
  schemaSql?: string;

  @IsOptional()
  @IsString()
  seedSql?: string;

  @IsOptional()
  @IsArray()
  expectedRows?: any[];

  @IsOptional()
  @IsBoolean()
  orderMatters?: boolean;
}

export class BlankDto {
  @IsOptional()
  @IsString()
  _id?: string; // MongoDB subdocument id

  @IsString()
  id: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  correctAnswers: string[];

  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;
}

export class DragOptionDto {
  @IsOptional()
  @IsString()
  _id?: string; // MongoDB subdocument id

  @IsString()
  id: string;

  @IsString()
  text: string;
}

export class CodeConfigDto {
  @IsOptional()
  @IsEnum(RUNTIMES)
  runtime?: Runtime;

  @IsOptional()
  @IsString()
  entryFunction?: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeoutMs?: number;

  @IsOptional()
  @IsBoolean()
  allowPreview?: boolean;
}

// Main Create DTO
export class CreateQuestionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(QUESTION_TYPES)
  type: QuestionType;

  @IsEnum(LANGUAGES)
  language: Language;

  @IsOptional()
  @IsEnum(CATEGORIES)
  category?: Category;

  @IsEnum(DIFFICULTIES)
  difficulty: Difficulty;

  @IsOptional()
  @IsEnum(STATUSES)
  status?: QuestionStatus;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Multiple Choice / True False
  @ValidateIf((o) => o.type === 'multipleChoice' || o.type === 'trueFalse')
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options?: string[];

  @ValidateIf((o) => o.type === 'multipleChoice' || o.type === 'trueFalse')
  @IsNumber()
  @Min(0)
  correctAnswer?: number;

  // Code Challenge / Code Debugging
  @ValidateIf((o) => o.type === 'codeChallenge' || o.type === 'codeDebugging')
  @ValidateNested()
  @Type(() => CodeConfigDto)
  codeConfig?: CodeConfigDto;

  @ValidateIf((o) => o.type === 'codeChallenge' || o.type === 'codeDebugging')
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases?: TestCaseDto[];

  // Fill in the Blank / Drag Drop Cloze
  @ValidateIf((o) => o.type === 'fillInTheBlank' || o.type === 'dragDropCloze')
  @IsString()
  codeTemplate?: string;

  @ValidateIf((o) => o.type === 'fillInTheBlank' || o.type === 'dragDropCloze')
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BlankDto)
  blanks?: BlankDto[];

  // Drag Drop Cloze specific
  @ValidateIf((o) => o.type === 'dragDropCloze')
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DragOptionDto)
  dragOptions?: DragOptionDto[];

  // Code Debugging specific
  @ValidateIf((o) => o.type === 'codeDebugging')
  @IsString()
  buggyCode?: string;

  @ValidateIf((o) => o.type === 'codeDebugging')
  @IsString()
  solutionCode?: string;
}

// Update DTO - all fields optional
export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(QUESTION_TYPES)
  type?: QuestionType;

  @IsOptional()
  @IsEnum(LANGUAGES)
  language?: Language;

  @IsOptional()
  @IsEnum(CATEGORIES)
  category?: Category;

  @IsOptional()
  @IsEnum(DIFFICULTIES)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(STATUSES)
  status?: QuestionStatus;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  correctAnswer?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CodeConfigDto)
  codeConfig?: CodeConfigDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases?: TestCaseDto[];

  @IsOptional()
  @IsString()
  codeTemplate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlankDto)
  blanks?: BlankDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DragOptionDto)
  dragOptions?: DragOptionDto[];

  @IsOptional()
  @IsString()
  buggyCode?: string;

  @IsOptional()
  @IsString()
  solutionCode?: string;
}

// Query filters DTO
export class QuestionFiltersDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsString()
  language?: string; // Can be comma-separated

  @IsOptional()
  @IsEnum(CATEGORIES)
  category?: Category;

  @IsOptional()
  @IsEnum(DIFFICULTIES)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(QUESTION_TYPES)
  type?: QuestionType;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsEnum(STATUSES)
  status?: QuestionStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeTotalCount?: boolean;
}

// Duplicate check DTO
export class CheckDuplicatesDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(QUESTION_TYPES)
  type?: QuestionType;

  @IsOptional()
  @IsEnum(LANGUAGES)
  language?: Language;

  @IsOptional()
  @IsEnum(CATEGORIES)
  category?: Category;

  @IsOptional()
  @IsString()
  entryFunction?: string;

  @IsOptional()
  @IsString()
  codeTemplate?: string;
}

// Test question DTO
export class TestQuestionDto {
  @ValidateNested()
  @Type(() => CreateQuestionDto)
  questionData: CreateQuestionDto;

  @IsString()
  testCode: string;
}

// Import questions DTO
export class ImportQuestionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];

  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean;
}

// Import result
export class ImportResultDto {
  imported: number;
  skipped: number;
  errors: Array<{
    index: number;
    title: string;
    error: string;
  }>;
}
