// src/question/code-challenge/code-challenge.builder.ts
import { BadRequestException } from '@nestjs/common';
import { CreateCodeChallengeDto, TestCaseDto, CodeConfigDto } from './code-challenge.dto';
import type { Language, Difficulty, Category, QuestionStatus, Runtime } from '../shared';

/**
 * Builder for test cases
 */
export class TestCaseBuilder {
  private testCase: Partial<TestCaseDto> = { hidden: false };

  constructor(name?: string) {
    if (name) this.testCase.name = name;
  }

  /**
   * Set input arguments
   */
  args(...args: any[]): this {
    this.testCase.args = args;
    return this;
  }

  /**
   * Set expected output
   */
  expects(expected: any): this {
    this.testCase.expected = expected;
    return this;
  }

  /**
   * Mark as hidden (not shown to student)
   */
  hidden(): this {
    this.testCase.hidden = true;
    return this;
  }

  /**
   * Mark as visible (shown to student) - default
   */
  visible(): this {
    this.testCase.hidden = false;
    return this;
  }

  // SQL-specific methods
  schemaSql(sql: string): this {
    this.testCase.schemaSql = sql;
    return this;
  }

  seedSql(sql: string): this {
    this.testCase.seedSql = sql;
    return this;
  }

  expectedRows(rows: any[]): this {
    this.testCase.expectedRows = rows;
    return this;
  }

  orderMatters(matters: boolean): this {
    this.testCase.orderMatters = matters;
    return this;
  }

  build(): TestCaseDto {
    if (!this.testCase.args) {
      throw new BadRequestException('Test case args are required');
    }
    if (this.testCase.expected === undefined && !this.testCase.expectedRows) {
      throw new BadRequestException('Test case expected value is required');
    }
    return this.testCase as TestCaseDto;
  }
}

/**
 * Builder for Code Challenge questions
 */
export class CodeChallengeBuilder {
  private dto: Partial<CreateCodeChallengeDto> = {
    category: 'logic', // Code challenges are always logic
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

  build(): CreateCodeChallengeDto {
    const errors: string[] = [];

    if (!this.dto.title) errors.push('title is required');
    if (!this.dto.description) errors.push('description is required');
    if (!this.dto.language) errors.push('language is required');
    if (!this.dto.difficulty) errors.push('difficulty is required');

    // SQL doesn't require entryFunction
    if (this.dto.language !== 'sql' && !this.codeConfig.entryFunction) {
      errors.push('entryFunction is required');
    }

    if (this.testCaseBuilders.length === 0) {
      errors.push('at least one test case is required');
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid code challenge: ${errors.join(', ')}`);
    }

    // Build test cases
    this.dto.testCases = this.testCaseBuilders.map(b => b.build());
    this.dto.codeConfig = this.codeConfig as CodeConfigDto;

    return this.dto as CreateCodeChallengeDto;
  }

  getPartial(): Partial<CreateCodeChallengeDto> {
    return { ...this.dto };
  }

  reset(): this {
    this.dto = { category: 'logic' };
    this.codeConfig = { timeoutMs: 3000, allowPreview: true };
    this.testCaseBuilders = [];
    return this;
  }
}

export function codeChallenge(): CodeChallengeBuilder {
  return new CodeChallengeBuilder();
}
