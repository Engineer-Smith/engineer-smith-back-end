import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { NodeRunnerService } from './runners/node-runner.service';
import { PythonRunnerService } from './runners/python-runner.service';
import { SqlRunnerService } from './runners/sql-runner.service';
import { DartRunnerService } from './runners/dart-runner.service';
import { FillInBlankGraderService } from './graders/fill-in-blank.grader';
import {
  RunCodeTestsDto,
  Runtime,
  Language,
  GradingResult,
  FillInBlankResult,
  BlankConfig,
} from './dto';

@Injectable()
export class GradingService {
  private readonly logger = new Logger(GradingService.name);

  constructor(
    private readonly nodeRunner: NodeRunnerService,
    private readonly pythonRunner: PythonRunnerService,
    private readonly sqlRunner: SqlRunnerService,
    private readonly dartRunner: DartRunnerService,
    private readonly fillInBlankGrader: FillInBlankGraderService,
  ) {}

  /**
   * Run code tests against the appropriate runtime
   */
  async runCodeTests(dto: RunCodeTestsDto): Promise<GradingResult> {
    const {
      code,
      language,
      runtime,
      testCases,
      entryFunction,
      timeoutMs = 3000,
    } = dto;

    try {
      // Validate required parameters
      if (!code || !runtime) {
        throw new BadRequestException('Code and runtime are required');
      }

      if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
        throw new BadRequestException('At least one test case is required');
      }

      // Validate runtime-specific requirements
      this.validateRuntimeRequirements(runtime, entryFunction, language);

      // Get the runner promise based on runtime
      let runnerPromise: Promise<GradingResult>;

      switch (runtime) {
        case Runtime.NODE:
          runnerPromise = this.nodeRunner.run({
            code,
            entryFunction: entryFunction!, // Already validated above
            testCases,
            timeoutMs,
            language,
          });
          break;

        case Runtime.PYTHON:
          runnerPromise = this.pythonRunner.run({
            code,
            entryFunction: entryFunction!, // Already validated above
            testCases,
            timeoutMs,
          });
          break;

        case Runtime.SQL:
          runnerPromise = this.sqlRunner.run({
            query: code,
            testCases,
            timeoutMs,
          });
          break;

        case Runtime.DART:
          runnerPromise = this.dartRunner.run({
            code,
            entryFunction: entryFunction!, // Already validated above
            testCases,
            timeoutMs,
          });
          break;

        default:
          throw new BadRequestException(
            `Unsupported runtime: ${runtime}. Supported runtimes: ${Object.values(Runtime).join(', ')}`,
          );
      }

      // Wrap with service-level timeout as safety net
      // Add buffer time (2x) for runner's internal timeout handling
      const serviceTimeout = timeoutMs * 2 + 1000;
      return await this.withTimeout(runnerPromise, serviceTimeout, testCases.length);
    } catch (error) {
      this.logger.error('Code testing error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests: testCases?.length || 0,
        consoleLogs: [],
        executionError: error.message,
        compilationError: null,
      };
    }
  }

  /**
   * Wrap a promise with a timeout as safety net
   */
  private async withTimeout(
    promise: Promise<GradingResult>,
    timeoutMs: number,
    totalTests: number,
  ): Promise<GradingResult> {
    const timeoutPromise = new Promise<GradingResult>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Code execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      this.logger.warn(`Code execution timeout: ${error.message}`);
      return {
        success: false,
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests,
        consoleLogs: [],
        executionError: `Execution timed out - code took too long to run`,
        compilationError: null,
      };
    }
  }

  /**
   * Grade fill-in-the-blank answers
   */
  gradeFillInBlanks(
    answers: Record<string, string>,
    blanks: BlankConfig[],
  ): FillInBlankResult {
    return this.fillInBlankGrader.grade(answers, blanks);
  }

  /**
   * Validate fill-in-blank configuration
   */
  validateFillInBlankConfig(blanks: BlankConfig[]): void {
    this.fillInBlankGrader.validateConfig(blanks);
  }

  /**
   * Validate grading configuration before execution
   */
  validateGradingConfig(config: {
    runtime: Runtime;
    language: Language;
    testCases: any[];
  }): void {
    const { runtime, language, testCases } = config;

    const validRuntimes = Object.values(Runtime);
    const validLanguages = Object.values(Language);

    if (!validRuntimes.includes(runtime)) {
      throw new BadRequestException(
        `Invalid runtime: ${runtime}. Must be one of: ${validRuntimes.join(', ')}`,
      );
    }

    if (!validLanguages.includes(language)) {
      throw new BadRequestException(
        `Invalid language: ${language}. Must be one of: ${validLanguages.join(', ')}`,
      );
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      throw new BadRequestException('At least one test case is required');
    }

    // Validate test case structure
    testCases.forEach((testCase, index) => {
      if (
        !testCase.hasOwnProperty('args') ||
        !testCase.hasOwnProperty('expected')
      ) {
        throw new BadRequestException(
          `Test case ${index + 1} must have 'args' and 'expected' properties`,
        );
      }
      if (testCase.hidden === undefined) {
        testCase.hidden = false;
      } else if (typeof testCase.hidden !== 'boolean') {
        throw new BadRequestException(
          `Test case ${index + 1} must have a boolean 'hidden' property`,
        );
      }
    });
  }

  /**
   * Get supported configurations for code testing
   */
  getSupportedConfigurations() {
    return {
      supportedRuntimes: Object.values(Runtime),
      supportedLanguages: Object.values(Language),
      languageRuntimeMap: {
        [Language.JAVASCRIPT]: Runtime.NODE,
        [Language.TYPESCRIPT]: Runtime.NODE,
        [Language.EXPRESS]: Runtime.NODE,
        [Language.PYTHON]: Runtime.PYTHON,
        [Language.SQL]: Runtime.SQL,
        [Language.DART]: Runtime.DART,
        // UI frameworks and Swift don't have direct runtime mapping (non-executable)
        [Language.SWIFT]: null,
        [Language.SWIFTUI]: null,
        [Language.REACT]: null,
        [Language.REACT_NATIVE]: null,
        [Language.FLUTTER]: null,
        [Language.HTML]: null,
        [Language.CSS]: null,
        [Language.JSON]: null,
      },
    };
  }

  /**
   * Validate runtime-specific requirements
   */
  private validateRuntimeRequirements(
    runtime: Runtime,
    entryFunction: string | undefined,
    language: string,
  ): void {
    // SQL doesn't require entryFunction
    if (runtime === Runtime.SQL) {
      return;
    }

    // All other runtimes require entryFunction
    if (!entryFunction) {
      throw new BadRequestException(
        `Entry function is required for ${runtime} runtime`,
      );
    }
  }
}