// src/question/true-false/true-false.builder.ts
import { BadRequestException } from '@nestjs/common';
import { CreateTrueFalseDto } from './true-false.dto';
import type { Language, Difficulty, Category, QuestionStatus } from '../shared';

/**
 * Builder for creating True/False questions
 */
export class TrueFalseBuilder {
  private dto: Partial<CreateTrueFalseDto> = {};

  title(title: string): this {
    this.dto.title = title;
    return this;
  }

  description(description: string): this {
    this.dto.description = description;
    return this;
  }

  language(language: Language): this {
    this.dto.language = language;
    return this;
  }

  difficulty(difficulty: Difficulty): this {
    this.dto.difficulty = difficulty;
    return this;
  }

  category(category: Category): this {
    this.dto.category = category;
    return this;
  }

  /**
   * Set answer to True (index 0)
   */
  answerTrue(): this {
    this.dto.correctAnswer = 0;
    return this;
  }

  /**
   * Set answer to False (index 1)
   */
  answerFalse(): this {
    this.dto.correctAnswer = 1;
    return this;
  }

  /**
   * Set correct answer by boolean
   */
  correctAnswer(isTrue: boolean): this {
    this.dto.correctAnswer = isTrue ? 0 : 1;
    return this;
  }

  tags(tags: string[]): this {
    this.dto.tags = tags;
    return this;
  }

  status(status: QuestionStatus): this {
    this.dto.status = status;
    return this;
  }

  isGlobal(isGlobal: boolean): this {
    this.dto.isGlobal = isGlobal;
    return this;
  }

  build(): CreateTrueFalseDto {
    const errors: string[] = [];

    if (!this.dto.title) errors.push('title is required');
    if (!this.dto.description) errors.push('description is required');
    if (!this.dto.language) errors.push('language is required');
    if (!this.dto.difficulty) errors.push('difficulty is required');
    if (this.dto.correctAnswer === undefined) {
      errors.push('correctAnswer is required (use answerTrue() or answerFalse())');
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid true/false question: ${errors.join(', ')}`);
    }

    return this.dto as CreateTrueFalseDto;
  }

  getPartial(): Partial<CreateTrueFalseDto> {
    return { ...this.dto };
  }

  reset(): this {
    this.dto = {};
    return this;
  }
}

export function trueFalse(): TrueFalseBuilder {
  return new TrueFalseBuilder();
}
