// src/question/fill-in-blank/fill-in-blank.builder.ts
import { BadRequestException } from '@nestjs/common';
import { CreateFillInBlankDto, BlankDto } from './fill-in-blank.dto';
import type { Language, Difficulty, Category, QuestionStatus } from '../shared';

/**
 * Builder for Fill in the Blank blanks
 */
export class BlankBuilder {
  private blank: Partial<BlankDto> = {};

  constructor(id: string) {
    this.blank.id = id;
    this.blank.caseSensitive = true; // default
    this.blank.points = 1; // default
  }

  /**
   * Add acceptable answers for this blank
   */
  answers(...answers: string[]): this {
    this.blank.correctAnswers = answers;
    return this;
  }

  /**
   * Set case sensitivity (default: true)
   */
  caseSensitive(sensitive: boolean): this {
    this.blank.caseSensitive = sensitive;
    return this;
  }

  /**
   * Add a hint for this blank
   */
  hint(hint: string): this {
    this.blank.hint = hint;
    return this;
  }

  /**
   * Set points for this blank (default: 1)
   */
  points(points: number): this {
    this.blank.points = points;
    return this;
  }

  build(): BlankDto {
    if (!this.blank.id) throw new BadRequestException('Blank id is required');
    if (!this.blank.correctAnswers?.length) {
      throw new BadRequestException('At least one correct answer is required');
    }
    return this.blank as BlankDto;
  }
}

/**
 * Builder for creating Fill in the Blank questions
 */
export class FillInBlankBuilder {
  private dto: Partial<CreateFillInBlankDto> = {};
  private blankBuilders: BlankBuilder[] = [];

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
   * Set the code template with placeholders
   * Use {{blank_id}} for blanks, e.g., "const x = {{answer1}};"
   */
  template(codeTemplate: string): this {
    this.dto.codeTemplate = codeTemplate;
    return this;
  }

  /**
   * Add a blank configuration
   * Returns a BlankBuilder for fluent configuration
   */
  blank(id: string): BlankBuilder {
    const builder = new BlankBuilder(id);
    this.blankBuilders.push(builder);
    return builder;
  }

  /**
   * Add a simple blank with just answers
   */
  addBlank(id: string, ...correctAnswers: string[]): this {
    this.blankBuilders.push(
      new BlankBuilder(id).answers(...correctAnswers) as any
    );
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

  build(): CreateFillInBlankDto {
    const errors: string[] = [];

    if (!this.dto.title) errors.push('title is required');
    if (!this.dto.description) errors.push('description is required');
    if (!this.dto.language) errors.push('language is required');
    if (!this.dto.difficulty) errors.push('difficulty is required');
    if (!this.dto.codeTemplate) errors.push('codeTemplate is required');
    if (this.blankBuilders.length === 0) errors.push('at least one blank is required');

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid fill-in-blank question: ${errors.join(', ')}`);
    }

    // Build all blanks
    this.dto.blanks = this.blankBuilders.map(b => b.build());

    // Validate all blank IDs exist in template
    for (const blank of this.dto.blanks) {
      if (!this.dto.codeTemplate!.includes(`{{${blank.id}}}`)) {
        errors.push(`Blank "${blank.id}" not found in template`);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid fill-in-blank question: ${errors.join(', ')}`);
    }

    return this.dto as CreateFillInBlankDto;
  }

  getPartial(): Partial<CreateFillInBlankDto> {
    return { ...this.dto };
  }

  reset(): this {
    this.dto = {};
    this.blankBuilders = [];
    return this;
  }
}

export function fillInBlank(): FillInBlankBuilder {
  return new FillInBlankBuilder();
}
