// src/code-challenge/dto/code-challenge.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsMongoId,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'javascript' | 'python' | 'dart' | 'sql' | 'swift';
export type ChallengeStatus = 'draft' | 'active' | 'archived';

// Sub-DTOs for challenge creation
class ExampleDto {
  @IsString()
  input: string;

  @IsString()
  output: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}

class LanguageCodeConfigDto {
  @IsOptional()
  @IsString()
  runtime?: string;

  @IsOptional()
  @IsString()
  entryFunction?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  timeoutMs?: number;
}

class CodeConfigDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageCodeConfigDto)
  javascript?: LanguageCodeConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageCodeConfigDto)
  python?: LanguageCodeConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageCodeConfigDto)
  dart?: LanguageCodeConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageCodeConfigDto)
  sql?: LanguageCodeConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageCodeConfigDto)
  swift?: LanguageCodeConfigDto;
}

class StartingCodeDto {
  @IsOptional()
  @IsString()
  javascript?: string;

  @IsOptional()
  @IsString()
  python?: string;

  @IsOptional()
  @IsString()
  dart?: string;

  @IsOptional()
  @IsString()
  sql?: string;

  @IsOptional()
  @IsString()
  swift?: string;
}

class TestCaseDto {
  @IsString()
  name: string;

  @IsArray()
  args: any[];

  // Note: expected can be any value including null (for functions that return null)
  // We use a simple presence check rather than @IsDefined() which rejects null
  expected: any;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}

/**
 * DTO for validating code without an existing challenge
 */
export class ValidateCodeDto {
  @IsEnum(['javascript', 'python', 'dart', 'sql', 'swift'])
  language: Language;

  @IsString()
  solutionCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageCodeConfigDto)
  codeConfig?: LanguageCodeConfigDto;
}

/**
 * DTO for creating a challenge
 */
export class CreateChallengeDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  description: string;

  @IsString()
  problemStatement: string;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: Difficulty;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(['javascript', 'python', 'dart', 'sql'], { each: true })
  supportedLanguages: Language[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companyTags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleDto)
  examples?: ExampleDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  constraints?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hints?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CodeConfigDto)
  codeConfig?: CodeConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StartingCodeDto)
  startingCode?: StartingCodeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StartingCodeDto)
  solutionCode?: StartingCodeDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases?: TestCaseDto[];

  @IsOptional()
  @IsString()
  editorial?: string;

  @IsOptional()
  @IsString()
  timeComplexity?: string;

  @IsOptional()
  @IsString()
  spaceComplexity?: string;
}

/**
 * DTO for updating a challenge
 */
export class UpdateChallengeDto extends CreateChallengeDto {
  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: ChallengeStatus;
}

/**
 * DTO for getting challenges with filters
 */
export class GetChallengesQueryDto {
  @IsOptional()
  @IsEnum(['javascript', 'python', 'dart', 'sql', 'swift'])
  language?: Language;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  solved?: string; // 'true' or 'false'

  @IsOptional()
  @IsEnum(['createdAt', 'difficulty', 'popular', 'success-rate'])
  sortBy?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

/**
 * DTO for testing/submitting code
 */
export class RunCodeDto {
  @IsString()
  code: string;

  @IsEnum(['javascript', 'python', 'dart', 'sql', 'swift'])
  language: Language;

  @IsOptional()
  @IsBoolean()
  hasTestedCode?: boolean;
}

/**
 * DTO for creating a track
 */
export class CreateTrackDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  description: string;

  @IsEnum(['javascript', 'python', 'dart', 'swift'])
  language: string;

  @IsString()
  category: string;

  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  estimatedHours: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  prerequisites?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningObjectives?: string[];

  @IsOptional()
  @IsArray()
  challenges?: any[];

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

/**
 * DTO for updating a track
 */
export class UpdateTrackDto extends CreateTrackDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for getting tracks with filters
 */
export class GetTracksQueryDto {
  @IsOptional()
  @IsEnum(['javascript', 'python', 'dart', 'swift'])
  language?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty?: string;

  @IsOptional()
  @IsString()
  featured?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

/**
 * DTO for adding challenge to track
 */
export class AddChallengeToTrackDto {
  @IsMongoId()
  challengeId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  order: number;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unlockAfter?: number;

  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean;
}

/**
 * DTO for admin challenge filters
 */
export class AdminChallengesQueryDto {
  @IsOptional()
  @IsEnum(['javascript', 'python', 'dart', 'sql', 'swift'])
  language?: Language;

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: ChallengeStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

/**
 * DTO for bulk creating challenges
 */
export class BulkCreateChallengesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateChallengeDto)
  challenges: CreateChallengeDto[];

  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @IsOptional()
  @IsEnum(['draft', 'active'])
  defaultStatus?: 'draft' | 'active';

  @IsOptional()
  @IsMongoId()
  addToTrackId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  startingOrder?: number;
}