// src/question/drag-drop-cloze/drag-drop-cloze.dto.ts
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
 * A draggable option (includes distractors)
 */
export class DragOptionDto {
  @IsOptional()
  @IsString()
  _id?: string; // MongoDB subdocument id

  @IsString()
  id: string;

  @IsString()
  text: string;
}

/**
 * A blank in the code template for drag-drop-cloze
 * correctAnswers contains the ID of the correct dragOption
 */
export class DragDropBlankDto {
  @IsOptional()
  @IsString()
  _id?: string; // MongoDB subdocument id

  @IsString()
  id: string;

  // Contains the correct dragOption.id (single element array for consistency with fillInBlank)
  @IsArray()
  @ArrayMinSize(1, { message: 'Each blank must have a correct answer' })
  @IsString({ each: true })
  correctAnswers: string[];

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;
}

/**
 * DTO for creating a Drag and Drop Cloze question
 */
export class CreateDragDropClozeDto extends BaseQuestionDto {
  // The code template with placeholders like {{blank_1}}
  @IsString()
  codeTemplate: string;

  // Configuration for each blank
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one blank is required' })
  @ValidateNested({ each: true })
  @Type(() => DragDropBlankDto)
  blanks: DragDropBlankDto[];

  // Draggable options (includes correct answers and distractors)
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one drag option is required' })
  @ValidateNested({ each: true })
  @Type(() => DragOptionDto)
  dragOptions: DragOptionDto[];
}

/**
 * DTO for updating a Drag and Drop Cloze question
 */
export class UpdateDragDropClozeDto extends BaseUpdateQuestionDto {
  @IsOptional()
  @IsString()
  codeTemplate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DragDropBlankDto)
  blanks?: DragDropBlankDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DragOptionDto)
  dragOptions?: DragOptionDto[];
}
