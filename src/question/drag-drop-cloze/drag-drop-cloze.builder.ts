// src/question/drag-drop-cloze/drag-drop-cloze.builder.ts
import { BadRequestException } from '@nestjs/common';
import { CreateDragDropClozeDto, DragDropBlankDto, DragOptionDto } from './drag-drop-cloze.dto';
import type { Language, Difficulty, Category, QuestionStatus } from '../shared';

/**
 * Builder for Drag Drop Cloze blanks
 */
export class DragDropBlankBuilder {
  private blank: Partial<DragDropBlankDto> = {};

  constructor(id: string) {
    this.blank.id = id;
    this.blank.points = 1; // default
  }

  /**
   * Set the correct option ID for this blank
   */
  correctOption(optionId: string): this {
    this.blank.correctAnswers = [optionId];
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

  build(): DragDropBlankDto {
    if (!this.blank.id) throw new BadRequestException('Blank id is required');
    if (!this.blank.correctAnswers?.length) {
      throw new BadRequestException('Correct option is required');
    }
    return this.blank as DragDropBlankDto;
  }
}

/**
 * Builder for creating Drag and Drop Cloze questions
 */
export class DragDropClozeBuilder {
  private dto: Partial<CreateDragDropClozeDto> = {};
  private blankBuilders: DragDropBlankBuilder[] = [];
  private dragOptionsList: DragOptionDto[] = [];

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
   * Use {{blank_id}} for blanks, e.g., "const x = {{blank1}};"
   */
  template(codeTemplate: string): this {
    this.dto.codeTemplate = codeTemplate;
    return this;
  }

  /**
   * Add a drag option (correct answer or distractor)
   */
  option(id: string, text: string): this {
    this.dragOptionsList.push({ id, text });
    return this;
  }

  /**
   * Add multiple options at once
   */
  options(opts: Array<{ id: string; text: string }>): this {
    this.dragOptionsList.push(...opts);
    return this;
  }

  /**
   * Add a blank configuration
   * Returns a DragDropBlankBuilder for fluent configuration
   */
  blank(id: string): DragDropBlankBuilder {
    const builder = new DragDropBlankBuilder(id);
    this.blankBuilders.push(builder);
    return builder;
  }

  /**
   * Add a simple blank with the correct option ID
   */
  addBlank(id: string, correctOptionId: string, points: number = 1): this {
    const builder = new DragDropBlankBuilder(id)
      .correctOption(correctOptionId)
      .points(points);
    this.blankBuilders.push(builder);
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

  build(): CreateDragDropClozeDto {
    const errors: string[] = [];

    if (!this.dto.title) errors.push('title is required');
    if (!this.dto.description) errors.push('description is required');
    if (!this.dto.language) errors.push('language is required');
    if (!this.dto.difficulty) errors.push('difficulty is required');
    if (!this.dto.codeTemplate) errors.push('codeTemplate is required');
    if (this.blankBuilders.length === 0) errors.push('at least one blank is required');
    if (this.dragOptionsList.length === 0) errors.push('at least one drag option is required');

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid drag-drop-cloze question: ${errors.join(', ')}`);
    }

    // Build all blanks
    this.dto.blanks = this.blankBuilders.map(b => b.build());
    this.dto.dragOptions = this.dragOptionsList;

    // Validate all blank IDs exist in template
    for (const blank of this.dto.blanks) {
      if (!this.dto.codeTemplate!.includes(`{{${blank.id}}}`)) {
        errors.push(`Blank "${blank.id}" not found in template`);
      }
    }

    // Validate all correct answers reference valid options
    const optionIds = new Set(this.dragOptionsList.map(o => o.id));
    for (const blank of this.dto.blanks) {
      for (const correctId of blank.correctAnswers) {
        if (!optionIds.has(correctId)) {
          errors.push(`Blank "${blank.id}": correctOption "${correctId}" not found in options`);
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid drag-drop-cloze question: ${errors.join(', ')}`);
    }

    return this.dto as CreateDragDropClozeDto;
  }

  getPartial(): Partial<CreateDragDropClozeDto> {
    return { ...this.dto };
  }

  reset(): this {
    this.dto = {};
    this.blankBuilders = [];
    this.dragOptionsList = [];
    return this;
  }
}

export function dragDropCloze(): DragDropClozeBuilder {
  return new DragDropClozeBuilder();
}
