// src/question/multiple-choice/multiple-choice.builder.ts
import { BadRequestException } from '@nestjs/common';
import { CreateMultipleChoiceDto } from './multiple-choice.dto';
import type { Language, Difficulty, Category, QuestionStatus } from '../shared';

/**
 * Builder for creating Multiple Choice questions
 * Provides a fluent API that enforces required fields
 */
export class MultipleChoiceBuilder {
  private dto: Partial<CreateMultipleChoiceDto> = {};

  /**
   * Set the question title
   */
  title(title: string): this {
    this.dto.title = title;
    return this;
  }

  /**
   * Set the question description
   */
  description(description: string): this {
    this.dto.description = description;
    return this;
  }

  /**
   * Set the programming language
   */
  language(language: Language): this {
    this.dto.language = language;
    return this;
  }

  /**
   * Set the difficulty level
   */
  difficulty(difficulty: Difficulty): this {
    this.dto.difficulty = difficulty;
    return this;
  }

  /**
   * Set the category (optional)
   */
  category(category: Category): this {
    this.dto.category = category;
    return this;
  }

  /**
   * Set the answer options
   */
  options(options: string[]): this {
    this.dto.options = options;
    return this;
  }

  /**
   * Set the correct answer index (0-based)
   */
  correctAnswer(index: number): this {
    this.dto.correctAnswer = index;
    return this;
  }

  /**
   * Set tags (optional)
   */
  tags(tags: string[]): this {
    this.dto.tags = tags;
    return this;
  }

  /**
   * Set status (optional, defaults to 'draft')
   */
  status(status: QuestionStatus): this {
    this.dto.status = status;
    return this;
  }

  /**
   * Set whether question is global (optional)
   */
  isGlobal(isGlobal: boolean): this {
    this.dto.isGlobal = isGlobal;
    return this;
  }

  /**
   * Build and validate the DTO
   * @throws BadRequestException if required fields are missing
   */
  build(): CreateMultipleChoiceDto {
    const errors: string[] = [];

    if (!this.dto.title) errors.push('title is required');
    if (!this.dto.description) errors.push('description is required');
    if (!this.dto.language) errors.push('language is required');
    if (!this.dto.difficulty) errors.push('difficulty is required');
    if (!this.dto.options || this.dto.options.length < 2) {
      errors.push('at least 2 options are required');
    }
    if (this.dto.correctAnswer === undefined) {
      errors.push('correctAnswer is required');
    }

    // Validate correctAnswer is within bounds
    if (
      this.dto.correctAnswer !== undefined &&
      this.dto.options &&
      this.dto.correctAnswer >= this.dto.options.length
    ) {
      errors.push(`correctAnswer (${this.dto.correctAnswer}) must be less than options length (${this.dto.options.length})`);
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid multiple choice question: ${errors.join(', ')}`);
    }

    return this.dto as CreateMultipleChoiceDto;
  }

  /**
   * Get the current state without validation
   */
  getPartial(): Partial<CreateMultipleChoiceDto> {
    return { ...this.dto };
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.dto = {};
    return this;
  }
}

/**
 * Factory function for creating a new builder
 */
export function multipleChoice(): MultipleChoiceBuilder {
  return new MultipleChoiceBuilder();
}
