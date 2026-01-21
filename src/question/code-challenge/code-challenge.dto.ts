// src/question/code-challenge/code-challenge.dto.ts
import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQuestionDto, BaseUpdateQuestionDto, RUNTIMES } from '../shared';
import type { Runtime } from '../shared';

/**
 * Test case for code execution
 */
export class TestCaseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  args: any[];

  // Expected result (any type)
  expected: any;

  @IsBoolean()
  hidden: boolean;

  // SQL-specific fields
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

/**
 * Code execution configuration
 */
export class CodeConfigDto {
  @IsOptional()
  @IsEnum(RUNTIMES)
  runtime?: Runtime;

  @IsString()
  entryFunction: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeoutMs?: number;

  @IsOptional()
  @IsBoolean()
  allowPreview?: boolean;
}

/**
 * DTO for creating a Code Challenge question
 * Category is required and must be 'logic'
 */
export class CreateCodeChallengeDto extends BaseQuestionDto {
  // Code configuration - REQUIRED
  @ValidateNested()
  @Type(() => CodeConfigDto)
  codeConfig: CodeConfigDto;

  // Test cases - REQUIRED (at least 1)
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one test case is required' })
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];
}

/**
 * DTO for updating a Code Challenge question
 */
export class UpdateCodeChallengeDto extends BaseUpdateQuestionDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CodeConfigDto)
  codeConfig?: CodeConfigDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases?: TestCaseDto[];
}
