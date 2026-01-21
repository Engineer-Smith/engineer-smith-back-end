// src/question/true-false/true-false.dto.ts
import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { BaseQuestionDto, BaseUpdateQuestionDto } from '../shared';

/**
 * DTO for creating a True/False question
 * Options are auto-generated as ['True', 'False']
 */
export class CreateTrueFalseDto extends BaseQuestionDto {
  // The correct answer: 0 = True, 1 = False
  @IsNumber()
  @Min(0)
  @Max(1, { message: 'Correct answer must be 0 (True) or 1 (False)' })
  correctAnswer: number;
}

/**
 * DTO for updating a True/False question
 */
export class UpdateTrueFalseDto extends BaseUpdateQuestionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  correctAnswer?: number;
}
