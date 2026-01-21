// src/question/fill-in-blank/fill-in-blank.dto.ts
import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQuestionDto, BaseUpdateQuestionDto } from '../shared';

/**
 * A single blank in the code template
 */
export class BlankDto {
  @IsString()
  id: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Each blank must have at least one correct answer' })
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

/**
 * DTO for creating a Fill in the Blank question
 */
export class CreateFillInBlankDto extends BaseQuestionDto {
  // The code template with placeholders like {{blank_1}}
  @IsString()
  codeTemplate: string;

  // Configuration for each blank
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one blank is required' })
  @ValidateNested({ each: true })
  @Type(() => BlankDto)
  blanks: BlankDto[];
}

/**
 * DTO for updating a Fill in the Blank question
 */
export class UpdateFillInBlankDto extends BaseUpdateQuestionDto {
  @IsOptional()
  @IsString()
  codeTemplate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlankDto)
  blanks?: BlankDto[];
}
