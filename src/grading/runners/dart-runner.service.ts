import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { GradingResult, TestCaseDto } from '../dto';

@Injectable()
export class DartRunnerService {
  private readonly logger = new Logger(DartRunnerService.name);

  /**
   * Run test cases against Dart code
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
    const tempDir = path.join('/tmp', `dart-execution-${executionId}`);

    try {
      await fs.mkdir(tempDir, { recursive: true });

      const testScript = this.createDartTestScript(
        code,
        entryFunction,
        testCases,
      );
      const scriptPath = path.join(tempDir, 'test.dart');

      await fs.writeFile(scriptPath, testScript);

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
      this.logger.error('DartRunner execution error:', error);
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
   * Create a complete Dart script with console capture
   */
  private createDartTestScript(
    userCode: string,
    entryFunction: string,
    testCases: TestCaseDto[],
  ): string {
    return `
import 'dart:convert';
import 'dart:io';
import 'dart:async';

// Console capture setup
List<Map<String, dynamic>> _consoleLogs = [];

void capturedPrint(Object? object) {
  String message = object?.toString() ?? '';
  _consoleLogs.add({
    'type': 'log',
    'message': message,
    'timestamp': DateTime.now().millisecondsSinceEpoch
  });
  stderr.writeln('[PRINT] ' + message);
}

List<Map<String, dynamic>> getConsoleLogs() {
  return List.from(_consoleLogs);
}

List<Map<String, dynamic>> getRecentConsoleLogs(int startIndex) {
  if (startIndex >= _consoleLogs.length) return [];
  return _consoleLogs.sublist(startIndex);
}

// Student's code
${userCode}

// Test runner utilities
bool deepEqual(dynamic a, dynamic b) {
  if (identical(a, b)) return true;
  
  if ((a is int && b is double) || (a is double && b is int)) {
    return a.toDouble() == b.toDouble();
  }
  
  if (a.runtimeType != b.runtimeType) return false;
  
  if (a is List && b is List) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (a is Map && b is Map) {
    if (a.length != b.length) return false;
    for (var key in a.keys) {
      if (!b.containsKey(key) || !deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  
  return a == b;
}

String safeStringify(dynamic obj) {
  try {
    return jsonEncode(obj);
  } catch (error) {
    return obj.toString();
  }
}

dynamic callFunctionWithTypeConversion(Function func, List<dynamic> args) {
  try {
    return Function.apply(func, args);
  } catch (typeError) {
    // Attempt type conversions
    List<dynamic> convertedArgs = [];
    String errorStr = typeError.toString();
    
    for (int i = 0; i < args.length; i++) {
      dynamic arg = args[i];
      
      if (arg is int && errorStr.contains('double')) {
        convertedArgs.add(arg.toDouble());
      } else if (arg is List && errorStr.contains('List<int>')) {
        try {
          List<int> intList = arg.map((e) => e is int ? e : int.parse(e.toString())).toList();
          convertedArgs.add(intList);
        } catch (e) {
          convertedArgs.add(arg);
        }
      } else {
        convertedArgs.add(arg);
      }
    }
    
    return Function.apply(func, convertedArgs);
  }
}

void main() async {
  try {
    final testCases = ${JSON.stringify(testCases)};
    final results = <Map<String, dynamic>>[];
    int totalPassed = 0;
    
    for (int i = 0; i < testCases.length; i++) {
      final testCase = testCases[i];
      final startTime = DateTime.now().millisecondsSinceEpoch;
      final logCountBefore = _consoleLogs.length;
      
      try {
        final args = testCase['args'] as List<dynamic>? ?? [];
        final expected = testCase['expected'];
        
        dynamic actualOutput = callFunctionWithTypeConversion(${entryFunction}, args);
        
        if (actualOutput is Future) {
          actualOutput = await actualOutput;
        }
        
        final executionTime = DateTime.now().millisecondsSinceEpoch - startTime;
        final passed = deepEqual(actualOutput, expected);
        final testConsoleLogs = getRecentConsoleLogs(logCountBefore);
        
        if (passed) totalPassed++;
        
        results.add({
          'testName': testCase['name'] ?? 'Test case \${i + 1}',
          'testCaseIndex': i,
          'passed': passed,
          'actualOutput': safeStringify(actualOutput),
          'expectedOutput': safeStringify(expected),
          'executionTime': executionTime,
          'consoleLogs': testConsoleLogs,
          'error': null
        });
        
      } catch (error) {
        final testConsoleLogs = getRecentConsoleLogs(logCountBefore);
        
        results.add({
          'testName': testCase['name'] ?? 'Test case \${i + 1}',
          'testCaseIndex': i,
          'passed': false,
          'actualOutput': null,
          'expectedOutput': safeStringify(testCase['expected']),
          'executionTime': DateTime.now().millisecondsSinceEpoch - startTime,
          'consoleLogs': testConsoleLogs,
          'error': error.toString()
        });
      }
    }

    final output = {
      'results': results,
      'overallPassed': totalPassed == testCases.length && totalPassed > 0,
      'totalPassed': totalPassed,
      'consoleLogs': getConsoleLogs()
    };
    
    stderr.writeln('RESULT_JSON_START');
    stderr.write(jsonEncode(output));
    stderr.writeln('RESULT_JSON_END');

  } catch (globalError) {
    final errorOutput = {
      'results': [],
      'overallPassed': false,
      'totalPassed': 0,
      'consoleLogs': getConsoleLogs(),
      'error': globalError.toString()
    };
    
    stderr.writeln('RESULT_JSON_START');
    stderr.write(jsonEncode(errorOutput));
    stderr.writeln('RESULT_JSON_END');
    exit(1);
  }
}
`;
  }

  /**
   * Execute Dart code in child process
   */
  private executeInChildProcess(
    scriptPath: string,
    timeoutMs: number,
  ): Promise<{ error: string | null; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const child = spawn('dart', [scriptPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeoutHandle = setTimeout(() => {
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 1000);
      }, timeoutMs);

      child.on('close', (code, signal) => {
        clearTimeout(timeoutHandle);

        if (signal === 'SIGTERM' || signal === 'SIGKILL') {
          resolve({
            error: `Execution timed out after ${timeoutMs}ms`,
            stdout: '',
            stderr: '',
          });
        } else if (code !== 0) {
          resolve({
            error: stderr || `Process exited with code ${code}`,
            stdout,
            stderr,
          });
        } else {
          // Extract JSON from stderr
          try {
            const jsonStart = stderr.indexOf('RESULT_JSON_START');
            const jsonEnd = stderr.indexOf('RESULT_JSON_END');

            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonStr = stderr
                .substring(jsonStart + 'RESULT_JSON_START'.length, jsonEnd)
                .trim();
              resolve({
                error: null,
                stdout: jsonStr,
                stderr,
              });
            } else {
              resolve({
                error: null,
                stdout,
                stderr,
              });
            }
          } catch (parseError) {
            resolve({
              error: null,
              stdout,
              stderr,
            });
          }
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutHandle);
        resolve({
          error: `Failed to start Dart process: ${error.message}. Make sure Dart SDK is installed.`,
          stdout: '',
          stderr: '',
        });
      });
    });
  }
}
