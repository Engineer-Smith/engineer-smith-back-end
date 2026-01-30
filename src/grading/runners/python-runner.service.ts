import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { GradingResult, TestCaseDto } from '../dto';

@Injectable()
export class PythonRunnerService {
  private readonly logger = new Logger(PythonRunnerService.name);

  /**
   * Run test cases against Python code
   */
  async run(params: {
    code: string;
    entryFunction: string;
    testCases: TestCaseDto[];
    timeoutMs: number;
  }): Promise<GradingResult> {
    const { code, entryFunction, testCases, timeoutMs } = params;

    let executionError: string | null = null;
    let compilationError: string | null = null;

    const executionId = crypto.randomBytes(8).toString('hex');
    const tempDir = path.join('/tmp', `python-execution-${executionId}`);

    try {
      await fs.mkdir(tempDir, { recursive: true });

      const testScript = this.createPythonTestScript(
        code,
        entryFunction,
        testCases,
      );
      const scriptPath = path.join(tempDir, 'test.py');

      await fs.writeFile(scriptPath, testScript);

      const result = await this.executeInChildProcess(scriptPath, timeoutMs);

      if (result.error) {
        // Check if it's a syntax/compilation error
        if (
          result.error.includes('SyntaxError') ||
          result.error.includes('IndentationError')
        ) {
          compilationError = result.error;
        } else {
          executionError = result.error;
        }
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
      this.logger.error('PythonRunner execution error:', error);
      executionError = error.message;
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        this.logger.warn('Failed to cleanup temp directory:', cleanupError);
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
   * Create a complete Python script with console capture and test runner
   */
  private createPythonTestScript(
    userCode: string,
    entryFunction: string,
    testCases: TestCaseDto[],
  ): string {
    return `
import sys
import json
import time
import resource

# Set memory limit (~128MB)
try:
    soft, hard = resource.getrlimit(resource.RLIMIT_AS)
    resource.setrlimit(resource.RLIMIT_AS, (128 * 1024 * 1024, hard))
except Exception:
    pass  # May not be available on all systems

# Console capture setup
_console_logs = []
_original_print = print

def _captured_print(*args, **kwargs):
    message = ' '.join(str(arg) for arg in args)
    _console_logs.append({
        'type': 'log',
        'message': message,
        'timestamp': int(time.time() * 1000)
    })
    # Don't write to stdout to avoid mixing with JSON result

# Override print globally
print = _captured_print

def get_console_logs():
    return list(_console_logs)

def get_recent_console_logs(start_index):
    return _console_logs[start_index:]

# Deep equality comparison
def deep_equal(a, b):
    if a is b:
        return True
    if type(a) != type(b):
        # Handle int/float comparison
        if isinstance(a, (int, float)) and isinstance(b, (int, float)):
            return a == b
        return False
    if isinstance(a, list):
        if len(a) != len(b):
            return False
        for i in range(len(a)):
            if not deep_equal(a[i], b[i]):
                return False
        return True
    if isinstance(a, dict):
        if len(a) != len(b):
            return False
        for key in a:
            if key not in b or not deep_equal(a[key], b[key]):
                return False
        return True
    return a == b

def safe_stringify(obj):
    try:
        return json.dumps(obj)
    except Exception:
        return str(obj)

# Student's code
${userCode}

# Main execution
def run_tests():
    results = []
    total_passed = 0

    try:
        # Check if function exists
        if '${entryFunction}' not in dir():
            return {
                'results': [],
                'overallPassed': False,
                'totalPassed': 0,
                'consoleLogs': get_console_logs(),
                'error': 'Function "${entryFunction}" not found'
            }

        func = globals()['${entryFunction}']
        if not callable(func):
            return {
                'results': [],
                'overallPassed': False,
                'totalPassed': 0,
                'consoleLogs': get_console_logs(),
                'error': '"${entryFunction}" is not a function'
            }

        test_cases = ${JSON.stringify(testCases)}

        for i, test_case in enumerate(test_cases):
            start_time = int(time.time() * 1000)
            log_count_before = len(_console_logs)

            try:
                args = test_case.get('args', [])
                expected = test_case.get('expected')

                actual_output = func(*args)

                execution_time = int(time.time() * 1000) - start_time
                passed = deep_equal(actual_output, expected)
                test_console_logs = get_recent_console_logs(log_count_before)

                if passed:
                    total_passed += 1

                results.append({
                    'testName': test_case.get('name', f'Test case {i + 1}'),
                    'testCaseIndex': i,
                    'passed': passed,
                    'actualOutput': safe_stringify(actual_output),
                    'expectedOutput': safe_stringify(expected),
                    'executionTime': execution_time,
                    'consoleLogs': test_console_logs,
                    'error': None
                })

            except Exception as e:
                test_console_logs = get_recent_console_logs(log_count_before)

                results.append({
                    'testName': test_case.get('name', f'Test case {i + 1}'),
                    'testCaseIndex': i,
                    'passed': False,
                    'actualOutput': None,
                    'expectedOutput': safe_stringify(test_case.get('expected')),
                    'executionTime': int(time.time() * 1000) - start_time,
                    'consoleLogs': test_console_logs,
                    'error': str(e)
                })

        return {
            'results': results,
            'overallPassed': total_passed == len(test_cases) and total_passed > 0,
            'totalPassed': total_passed,
            'consoleLogs': get_console_logs()
        }

    except Exception as e:
        return {
            'results': [],
            'overallPassed': False,
            'totalPassed': 0,
            'consoleLogs': get_console_logs(),
            'error': str(e)
        }

if __name__ == '__main__':
    result = run_tests()
    # Write JSON to stdout for parsing
    sys.stdout.write(json.dumps(result))
    sys.stdout.flush()
`;
  }

  /**
   * Execute Python code in child process with memory limits
   */
  private executeInChildProcess(
    scriptPath: string,
    timeoutMs: number,
  ): Promise<{ error: string | null; stdout: string; stderr: string }> {
    const MAX_OUTPUT_SIZE = 1_000_000; // 1MB

    return new Promise((resolve) => {
      const child = spawn('python3', [scriptPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

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
          error: `Failed to start Python process: ${error.message}. Make sure Python 3 is installed.`,
          stdout: '',
          stderr: '',
        });
      });
    });
  }
}
