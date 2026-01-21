// src/question/shared/base-question.dto.ts
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import {
  LANGUAGES,
  DIFFICULTIES,
  CATEGORIES,
  STATUSES,
} from './constants';
import type {
  Language,
  Difficulty,
  Category,
  QuestionStatus,
} from './constants';

/**
 * Base fields shared by ALL question types
 */
export class BaseQuestionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(LANGUAGES)
  language: Language;

  @IsEnum(DIFFICULTIES)
  difficulty: Difficulty;

  @IsOptional()
  @IsEnum(CATEGORIES)
  category?: Category;

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
}

/**
 * Base fields for updating any question type
 * All fields are optional
 */
export class BaseUpdateQuestionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(LANGUAGES)
  language?: Language;

  @IsOptional()
  @IsEnum(DIFFICULTIES)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(CATEGORIES)
  category?: Category;

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
}
