// src/question/multiple-choice/multiple-choice.dto.ts
import {
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { BaseQuestionDto, BaseUpdateQuestionDto } from '../shared';

/**
 * DTO for creating a Multiple Choice question
 * All required fields are clearly marked - no confusion
 */
export class CreateMultipleChoiceDto extends BaseQuestionDto {
  // Multiple choice specific - REQUIRED
  @IsArray()
  @ArrayMinSize(2, { message: 'Multiple choice questions must have at least 2 options' })
  @IsString({ each: true })
  options: string[];

  @IsNumber()
  @Min(0, { message: 'Correct answer must be a valid option index (0 or greater)' })
  correctAnswer: number;
}

/**
 * DTO for updating a Multiple Choice question
 */
export class UpdateMultipleChoiceDto extends BaseUpdateQuestionDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2, { message: 'Multiple choice questions must have at least 2 options' })
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  correctAnswer?: number;
}
