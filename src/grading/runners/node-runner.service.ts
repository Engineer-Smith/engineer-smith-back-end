import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { GradingResult, TestCaseDto } from '../dto';

@Injectable()
export class NodeRunnerService {
  private readonly logger = new Logger(NodeRunnerService.name);

  /**
   * Run test cases against Node.js/TypeScript code
   */
  async run(params: {
    code: string;
    entryFunction: string;
    testCases: TestCaseDto[];
    timeoutMs: number;
    language?: string;
  }): Promise<GradingResult> {
    const { code, entryFunction, testCases, timeoutMs, language } = params;

    let executionError: string | null = null;
    let compilationError: string | null = null;

    // Create unique execution ID
    const executionId = crypto.randomBytes(8).toString('hex');
    const tempDir = path.join('/tmp', `code-execution-${executionId}`);

    try {
      // Create temporary directory
      await fs.mkdir(tempDir, { recursive: true });

      // Handle TypeScript compilation if needed
      let processedCode = code;
      if (language === 'typescript') {
        processedCode = await this.compileTypeScript(code);
      }

      // Create the complete test script with console capture
      const testScript = this.createTestScript(
        processedCode,
        entryFunction,
        testCases,
      );
      const scriptPath = path.join(tempDir, 'test.js');

      await fs.writeFile(scriptPath, testScript);

      // Execute in child process
      const result = await this.executeInChildProcess(scriptPath, timeoutMs);

      if (result.error) {
        executionError = result.error;
      } else {
        try {
          const testResults = JSON.parse(result.stdout);
          return {
            success: true,
            testResults: testResults.results,
            overallPassed: testResults.overallPassed,
            totalTestsPassed: testResults.totalPassed,
            totalTests: testCases.length,
            consoleLogs: testResults.consoleLogs || [],
            executionError: null,
            compilationError: null,
          };
        } catch (parseError) {
          executionError = `Failed to parse test results: ${parseError.message}`;
        }
      }
    } catch (error) {
      this.logger.error('NodeRunner execution error:', error);
      executionError = error.message;
    } finally {
      // Cleanup temporary files
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        this.logger.warn(
          'Failed to cleanup temp directory:',
          cleanupError.message,
        );
      }
    }

    return {
      success: false,
      testResults: [],
      overallPassed: false,
      totalTestsPassed: 0,
      totalTests: testCases.length,
      consoleLogs: [],
      executionError,
      compilationError,
    };
  }

  /**
   * Create a complete Node.js script that runs the tests with console capture
   */
  private createTestScript(
    userCode: string,
    entryFunction: string,
    testCases: TestCaseDto[],
  ): string {
    return `
// Console log capture setup
const consoleLogs = [];
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Override console methods to capture output
console.log = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  consoleLogs.push({ type: 'log', message, timestamp: Date.now() });
};

console.warn = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  consoleLogs.push({ type: 'warn', message, timestamp: Date.now() });
};

console.info = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  consoleLogs.push({ type: 'info', message, timestamp: Date.now() });
};

// Student's code
${userCode}

// Test runner utilities
const deepEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
    return true;
  }
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  
  return false;
};

const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'undefined') return 'undefined';
      if (typeof value === 'function') return '[function]';
      if (typeof value === 'symbol') return '[symbol]';
      return value;
    });
  } catch (error) {
    return '[Unable to stringify]';
  }
};

// Smart function calling that handles different parameter patterns
const callFunction = (func, args) => {
  if (!args || args.length === 0) {
    return func();
  }
  
  // If function expects 1 parameter and we have 1 argument, pass it directly
  if (func.length === 1 && args.length === 1) {
    return func(args[0]);
  }
  
  // For functions with multiple parameters, spread the arguments
  return func.apply(null, args);
};

// Main execution
const results = [];
let totalPassed = 0;

try {
  if (typeof ${entryFunction} !== 'function') {
    originalConsoleLog(JSON.stringify({
      results: [],
      overallPassed: false,
      totalPassed: 0,
      consoleLogs: consoleLogs,
      error: 'Function "${entryFunction}" not found or is not a function'
    }));
    process.exit(1);
  }

  const testCases = ${JSON.stringify(testCases)};

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const startTime = Date.now();
    const testStartLogs = consoleLogs.length;
    
    try {
      const actualOutput = callFunction(${entryFunction}, testCase.args || []);
      const executionTime = Date.now() - startTime;
      const passed = deepEqual(actualOutput, testCase.expected);
      
      const testConsoleLogs = consoleLogs.slice(testStartLogs);
      
      if (passed) totalPassed++;
      
      results.push({
        testName: testCase.name || \`Test case \${i + 1}\`,
        testCaseIndex: i,
        passed,
        actualOutput: safeStringify(actualOutput),
        expectedOutput: safeStringify(testCase.expected),
        executionTime,
        consoleLogs: testConsoleLogs,
        error: null
      });
      
    } catch (error) {
      const testConsoleLogs = consoleLogs.slice(testStartLogs);
      
      results.push({
        testName: testCase.name || \`Test case \${i + 1}\`,
        testCaseIndex: i,
        passed: false,
        actualOutput: null,
        expectedOutput: safeStringify(testCase.expected),
        executionTime: Date.now() - startTime,
        consoleLogs: testConsoleLogs,
        error: error.message
      });
    }
  }

  originalConsoleLog(JSON.stringify({
    results: results,
    overallPassed: totalPassed === testCases.length && totalPassed > 0,
    totalPassed: totalPassed,
    consoleLogs: consoleLogs
  }));

} catch (globalError) {
  originalConsoleLog(JSON.stringify({
    results: [],
    overallPassed: false,
    totalPassed: 0,
    consoleLogs: consoleLogs || [],
    error: globalError.message
  }));
  process.exit(1);
}
`;
  }

  /**
   * Execute code in child process with memory limits
   */
  private executeInChildProcess(
    scriptPath: string,
    timeoutMs: number,
  ): Promise<{ error: string | null; stdout: string; stderr: string }> {
    const MAX_OUTPUT_SIZE = 1_000_000; // 1MB

    return new Promise((resolve) => {
      const child = spawn(
        'node',
        ['--max-old-space-size=128', scriptPath],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      let stdout = '';
      let stderr = '';
      let outputLimitReached = false;

      child.stdout.on('data', (data) => {
        if (stdout.length < MAX_OUTPUT_SIZE) {
          stdout += data.toString();
        } else if (!outputLimitReached) {
          outputLimitReached = true;
          this.logger.warn('Output limit reached, terminating process');
          child.kill('SIGTERM');
        }
      });

      child.stderr.on('data', (data) => {
        if (stderr.length < MAX_OUTPUT_SIZE) {
          stderr += data.toString();
        } else if (!outputLimitReached) {
          outputLimitReached = true;
          child.kill('SIGTERM');
        }
      });

      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 1000);
      }, timeoutMs);

      child.on('close', (code, signal) => {
        clearTimeout(timeoutHandle);

        if (outputLimitReached) {
          resolve({
            error: 'Output limit exceeded (1MB). Your code may have an infinite loop or excessive logging.',
            stdout: '',
            stderr: '',
          });
        } else if (signal === 'SIGTERM' || signal === 'SIGKILL') {
          resolve({
            error: `Execution timed out after ${timeoutMs}ms`,
            stdout: '',
            stderr: '',
          });
        } else if (code === 0) {
          resolve({
            error: null,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
          });
        } else {
          resolve({
            error: stderr.trim() || `Process exited with code ${code}`,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
          });
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutHandle);
        resolve({
          error: `Child process failed: ${error.message}`,
          stdout: '',
          stderr: '',
        });
      });
    });
  }

  /**
   * Compile TypeScript to JavaScript
   */
  private async compileTypeScript(code: string): Promise<string> {
    try {
      // Dynamic import to avoid requiring typescript if not used
      const ts = await import('typescript');

      const result = ts.transpile(code, {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2018,
        strict: false,
        noImplicitAny: false,
        skipLibCheck: true,
      });

      return result;
    } catch (error) {
      throw new Error(`TypeScript compilation failed: ${error.message}`);
    }
  }
}
