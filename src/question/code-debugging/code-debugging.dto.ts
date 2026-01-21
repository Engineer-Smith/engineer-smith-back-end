// src/question/code-debugging/code-debugging.dto.ts
import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQuestionDto, BaseUpdateQuestionDto } from '../shared';
import { TestCaseDto, CodeConfigDto } from '../code-challenge/code-challenge.dto';

// Re-export for convenience
export { TestCaseDto, CodeConfigDto };

/**
 * DTO for creating a Code Debugging question
 * Has all code challenge fields PLUS buggyCode and solutionCode
 */
export class CreateCodeDebuggingDto extends BaseQuestionDto {
  // The buggy code that students need to fix - REQUIRED
  @IsString()
  buggyCode: string;

  // The correct solution code - REQUIRED
  @IsString()
  solutionCode: string;

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
 * DTO for updating a Code Debugging question
 */
export class UpdateCodeDebuggingDto extends BaseUpdateQuestionDto {
  @IsOptional()
  @IsString()
  buggyCode?: string;

  @IsOptional()
  @IsString()
  solutionCode?: string;

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
