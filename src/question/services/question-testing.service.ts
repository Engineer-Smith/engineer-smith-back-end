import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { GradingService } from '../../grading/grading.service';
import { CodeExecutionService } from '../../grading/code-execution.service';
import { CreateQuestionDto } from '../dto';
import { Runtime } from '../../grading/dto';
import type { RequestUser } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class QuestionTestingService {
  constructor(
    private gradingService: GradingService,
    private codeExecutionService: CodeExecutionService,
  ) {}

  /**
   * Test a question's code/answers before saving
   * Used by instructors to validate their questions work correctly
   */
  async testQuestion(
    questionData: CreateQuestionDto,
    testCode: string,
    user: RequestUser,
  ) {
    // Validate user can test questions
    if (user.role === 'student') {
      throw new ForbiddenException('Students cannot test questions');
    }

    const { type, category, language, codeConfig, testCases, blanks } = questionData;

    // Route to appropriate testing method
    if (type === 'fillInTheBlank') {
      return this.testFillInBlank(questionData, testCode);
    }

    if (type === 'codeChallenge' || type === 'codeDebugging') {
      if (category !== 'logic') {
        throw new BadRequestException(
          'Only logic category questions can be tested with code execution',
        );
      }
      return this.testCodeQuestion(questionData, testCode);
    }

    throw new BadRequestException(
      `Question type '${type}' does not support testing`,
    );
  }

  /**
   * Test fill-in-the-blank question
   */
  private async testFillInBlank(questionData: CreateQuestionDto, testAnswers: string) {
    const { blanks } = questionData;

    if (!blanks || blanks.length === 0) {
      throw new BadRequestException('No blanks defined for fill-in-the-blank question');
    }

    // Parse test answers - expect JSON object mapping blank IDs to answers
    let answers: Record<string, string>;
    try {
      answers = JSON.parse(testAnswers);
    } catch (e) {
      throw new BadRequestException(
        'Test answers must be a JSON object mapping blank IDs to answers',
      );
    }

    // Grade the fill-in-blank
    const result = this.gradingService.gradeFillInBlanks(answers, blanks);

    return {
      success: true,
      type: 'fillInTheBlank',
      result: {
        allCorrect: result.allCorrect,
        totalPoints: result.totalPoints,
        totalPossiblePoints: result.totalPossiblePoints,
        results: result.results,
      },
    };
  }

  /**
   * Test code challenge or debugging question
   */
  private async testCodeQuestion(questionData: CreateQuestionDto, testCode: string) {
    const { language, codeConfig, testCases } = questionData;

    if (!testCases || testCases.length === 0) {
      throw new BadRequestException('No test cases defined');
    }

    if (!codeConfig) {
      throw new BadRequestException('Code config is required');
    }

    // Map language to runtime (Swift is not executable - UI/syntax only)
    const runtimeMap: Record<string, Runtime> = {
      javascript: Runtime.NODE,
      typescript: Runtime.NODE,
      react: Runtime.NODE,
      reactNative: Runtime.NODE,
      express: Runtime.NODE,
      python: Runtime.PYTHON,
      sql: Runtime.SQL,
      dart: Runtime.DART,
    };

    const runtime = runtimeMap[language];
    if (!runtime) {
      throw new BadRequestException(`Language '${language}' does not support code testing`);
    }

    // Run the code tests
    const result = await this.codeExecutionService.executeCode({
      code: testCode,
      language: language as any,
      runtime,
      testCases: testCases.map((tc) => ({
        args: tc.args,
        expected: tc.expected,
        hidden: tc.hidden ?? false,
        name: tc.name,
        schemaSql: tc.schemaSql,
        seedSql: tc.seedSql,
        expectedRows: tc.expectedRows,
        orderMatters: tc.orderMatters,
      })),
      entryFunction: codeConfig.entryFunction,
      timeoutMs: codeConfig.timeoutMs || 3000,
      priority: 'normal',
    });

    return {
      success: result.success,
      type: 'codeExecution',
      result: {
        overallPassed: result.overallPassed,
        totalTestsPassed: result.totalTestsPassed,
        totalTests: result.totalTests,
        testResults: result.testResults,
        consoleLogs: result.consoleLogs,
        executionError: result.executionError,
        compilationError: result.compilationError,
      },
    };
  }

  /**
   * Get supported configurations for testing
   */
  getSupportedConfigurations() {
    return this.gradingService.getSupportedConfigurations();
  }
}
