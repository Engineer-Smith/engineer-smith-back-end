import { Injectable, Logger } from '@nestjs/common';
import { GradingResult, ConsoleLog, TestCaseDto, TestResult } from '../dto';

@Injectable()
export class SqlRunnerService {
  private readonly logger = new Logger(SqlRunnerService.name);

  /**
   * Run SQL test cases against a query
   */
  async run(params: {
    query: string;
    testCases: TestCaseDto[];
    timeoutMs: number;
  }): Promise<GradingResult> {
    const { query, testCases, timeoutMs } = params;
    const results: TestResult[] = [];
    let totalPassed = 0;
    const consoleLogs: ConsoleLog[] = [];

    // Helper function to add console logs
    const addConsoleLog = (type: ConsoleLog['type'], message: string) => {
      consoleLogs.push({
        type,
        message,
        timestamp: Date.now(),
      });
    };

    // Input validation
    if (!query || typeof query !== 'string') {
      return {
        success: false,
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests: testCases?.length || 0,
        consoleLogs: [],
        executionError: 'Query is required and must be a string',
        compilationError: null,
      };
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return {
        success: false,
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests: 0,
        consoleLogs: [],
        executionError: 'At least one test case is required',
        compilationError: null,
      };
    }

    // Validate single statement
    try {
      this.validateSingleStatement(query);
    } catch (validationError: any) {
      return {
        success: false,
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests: testCases.length,
        consoleLogs: [],
        executionError: validationError.message,
        compilationError: null,
      };
    }

    try {
      // Dynamic import sql.js
      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs();
      addConsoleLog('log', 'SQL.js initialized successfully');

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const startTime = Date.now();
        const testStartLogs = consoleLogs.length;
        let db: any;

        try {
          addConsoleLog(
            'log',
            `Starting test case ${i + 1}: ${testCase.name || `SQL test ${i + 1}`}`,
          );

          // Create new database for each test
          db = new SQL.Database();
          addConsoleLog('log', 'Database created for test case');

          // Set up schema and seed data
          if (testCase.schemaSql) {
            addConsoleLog(
              'log',
              `Executing schema SQL: ${testCase.schemaSql.substring(0, 100)}...`,
            );
            db.exec(testCase.schemaSql);
            addConsoleLog('log', 'Schema SQL executed successfully');
          }

          if (testCase.seedSql) {
            addConsoleLog(
              'log',
              `Executing seed SQL: ${testCase.seedSql.substring(0, 100)}...`,
            );
            db.exec(testCase.seedSql);
            addConsoleLog('log', 'Seed SQL executed successfully');
          }

          // Execute user query with timeout protection
          addConsoleLog(
            'log',
            `Executing user query: ${query.substring(0, 200)}...`,
          );
          const queryStartTime = Date.now();
          const stmt = db.prepare(query);

          // Simple timeout check
          if (Date.now() - queryStartTime > timeoutMs) {
            throw new Error('Query execution timed out');
          }

          const MAX_ROWS = 1000;
          const rows: any[] = [];
          let rowCount = 0;

          while (stmt.step()) {
            rowCount++;

            if (rowCount > MAX_ROWS) {
              stmt.free();
              throw new Error(
                `Query returned too many rows (limit: ${MAX_ROWS}). Check for cartesian joins.`,
              );
            }

            if (Date.now() - queryStartTime > timeoutMs) {
              stmt.free();
              throw new Error('Query execution timed out');
            }

            rows.push(stmt.getAsObject());
          }
          stmt.free();

          addConsoleLog(
            'log',
            `Query executed successfully, returned ${rowCount} rows`,
          );

          const executionTime = Date.now() - startTime;

          // Compare results
          const expectedRows = testCase.expectedRows || [];
          const passed = this.compareQueryResults(
            rows,
            expectedRows,
            testCase.orderMatters ?? true,
          );

          if (passed) {
            totalPassed++;
            addConsoleLog('log', `Test case ${i + 1} PASSED`);
          } else {
            addConsoleLog(
              'warn',
              `Test case ${i + 1} FAILED - Results don't match`,
            );
          }

          const testConsoleLogs = consoleLogs.slice(testStartLogs);

          results.push({
            testName: testCase.name || `SQL test ${i + 1}`,
            testCaseIndex: i,
            passed,
            actualOutput: JSON.stringify(rows),
            expectedOutput: JSON.stringify(expectedRows),
            executionTime,
            consoleLogs: testConsoleLogs,
            error: null,
          });
        } catch (error: any) {
          addConsoleLog(
            'error',
            `Test case ${i + 1} failed with error: ${error.message}`,
          );

          const testConsoleLogs = consoleLogs.slice(testStartLogs);

          results.push({
            testName: testCase.name || `SQL test ${i + 1}`,
            testCaseIndex: i,
            passed: false,
            actualOutput: null,
            expectedOutput: JSON.stringify(testCase.expectedRows || []),
            executionTime: Date.now() - startTime,
            consoleLogs: testConsoleLogs,
            error: error.message,
          });
        } finally {
          if (db) {
            try {
              db.close();
            } catch (closeError) {
              this.logger.warn('Failed to close SQL database:', closeError);
            }
          }
        }
      }
    } catch (error: any) {
      addConsoleLog('error', `SQL initialization failed: ${error.message}`);
      this.logger.error('SQL initialization error:', error);
      return {
        success: false,
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests: testCases.length,
        consoleLogs,
        executionError: `SQL initialization failed: ${error.message}`,
        compilationError: null,
      };
    }

    return {
      success: true,
      testResults: results,
      overallPassed: totalPassed === testCases.length && totalPassed > 0,
      totalTestsPassed: totalPassed,
      totalTests: testCases.length,
      consoleLogs,
      executionError: null,
      compilationError: null,
    };
  }

  /**
   * Compare query results with expected results
   */
  private compareQueryResults(
    actual: any[],
    expected: any[],
    orderMatters: boolean = true,
  ): boolean {
    if (!actual && !expected) return true;
    if (!actual || !expected) return false;
    if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
    if (actual.length !== expected.length) return false;

    let actualCopy = [...actual];
    let expectedCopy = [...expected];

    if (!orderMatters) {
      actualCopy = actualCopy.sort((a, b) =>
        JSON.stringify(a).localeCompare(JSON.stringify(b)),
      );
      expectedCopy = expectedCopy.sort((a, b) =>
        JSON.stringify(a).localeCompare(JSON.stringify(b)),
      );
    }

    for (let i = 0; i < actualCopy.length; i++) {
      if (JSON.stringify(actualCopy[i]) !== JSON.stringify(expectedCopy[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate that query contains only a single statement
   */
  private validateSingleStatement(query: string): void {
    // Remove comments and string literals to avoid false positives
    const withoutStrings = query
      .replace(/--[^\n]*/g, '')           // Remove -- line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove /* block comments */
      .replace(/'[^']*'/g, '')
      .replace(/"[^"]*"/g, '');

    const semicolons = (withoutStrings.match(/;/g) || []).length;
    const trimmed = withoutStrings.trim();

    if (semicolons > 1 || (semicolons === 1 && !trimmed.endsWith(';'))) {
      throw new Error(
        'Multiple statements not allowed. Submit one query at a time.',
      );
    }
  }
}