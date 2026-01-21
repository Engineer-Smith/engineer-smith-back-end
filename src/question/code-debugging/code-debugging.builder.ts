// src/question/code-debugging/code-debugging.builder.ts
import { BadRequestException } from '@nestjs/common';
import { CreateCodeDebuggingDto, CodeConfigDto } from './code-debugging.dto';
import { TestCaseBuilder } from '../code-challenge/code-challenge.builder';
import type { Language, Difficulty, QuestionStatus, Runtime } from '../shared';

// Re-export TestCaseBuilder for convenience
export { TestCaseBuilder };

/**
 * Builder for Code Debugging questions
 */
export class CodeDebuggingBuilder {
  private dto: Partial<CreateCodeDebuggingDto> = {
    category: 'logic', // Code debugging is always logic
  };
  private codeConfig: Partial<CodeConfigDto> = {
    timeoutMs: 3000,
    allowPreview: true,
  };
  private testCaseBuilders: TestCaseBuilder[] = [];

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

  /**
   * Set the buggy code that students need to fix
   */
  buggyCode(code: string): this {
    this.dto.buggyCode = code;
    return this;
  }

  /**
   * Set the correct solution code
   */
  solutionCode(code: string): this {
    this.dto.solutionCode = code;
    return this;
  }

  /**
   * Set the entry function name (required)
   */
  entryFunction(name: string): this {
    this.codeConfig.entryFunction = name;
    return this;
  }

  /**
   * Set runtime (auto-detected from language if not set)
   */
  runtime(runtime: Runtime): this {
    this.codeConfig.runtime = runtime;
    return this;
  }

  /**
   * Set execution timeout in milliseconds (default: 3000)
   */
  timeout(ms: number): this {
    this.codeConfig.timeoutMs = ms;
    return this;
  }

  /**
   * Allow code preview before submission
   */
  allowPreview(allow: boolean): this {
    this.codeConfig.allowPreview = allow;
    return this;
  }

  /**
   * Add a test case
   */
  testCase(name?: string): TestCaseBuilder {
    const builder = new TestCaseBuilder(name);
    this.testCaseBuilders.push(builder);
    return builder;
  }

  /**
   * Add a simple test case with args and expected value
   */
  addTest(args: any[], expected: any, hidden = false): this {
    const builder = new TestCaseBuilder()
      .args(...args)
      .expects(expected);
    if (hidden) builder.hidden();
    this.testCaseBuilders.push(builder);
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

  build(): CreateCodeDebuggingDto {
    const errors: string[] = [];

    if (!this.dto.title) errors.push('title is required');
    if (!this.dto.description) errors.push('description is required');
    if (!this.dto.language) errors.push('language is required');
    if (!this.dto.difficulty) errors.push('difficulty is required');
    if (!this.dto.buggyCode) errors.push('buggyCode is required');
    if (!this.dto.solutionCode) errors.push('solutionCode is required');
    if (!this.codeConfig.entryFunction) errors.push('entryFunction is required');

    if (this.testCaseBuilders.length === 0) {
      errors.push('at least one test case is required');
    }

    // SQL doesn't support debugging
    if (this.dto.language === 'sql') {
      errors.push('SQL does not support code debugging questions');
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid code debugging question: ${errors.join(', ')}`);
    }

    // Build test cases
    this.dto.testCases = this.testCaseBuilders.map(b => b.build());
    this.dto.codeConfig = this.codeConfig as CodeConfigDto;

    return this.dto as CreateCodeDebuggingDto;
  }

  getPartial(): Partial<CreateCodeDebuggingDto> {
    return { ...this.dto };
  }

  reset(): this {
    this.dto = { category: 'logic' };
    this.codeConfig = { timeoutMs: 3000, allowPreview: true };
    this.testCaseBuilders = [];
    return this;
  }
}

export function codeDebugging(): CodeDebuggingBuilder {
  return new CodeDebuggingBuilder();
}
