// /services/grading/runners/dartRunner.js - Fixed console capture issue
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const runDartTests = async ({ code, entryFunction, testCases, timeoutMs }) => {

  let executionError = null;
  let compilationError = null;

  // Create unique execution ID
  const executionId = crypto.randomBytes(8).toString('hex');
  const tempDir = path.join('/tmp', `dart-execution-${executionId}`);

  try {
    // Create temporary directory
    await fs.mkdir(tempDir, { recursive: true });

    // Create the complete test script with console capture
    const testScript = createDartTestScriptWithConsoleCapture(code, entryFunction, testCases);
    const scriptPath = path.join(tempDir, 'test.dart');

    await fs.writeFile(scriptPath, testScript);

    console.log('DartRunner: Executing in child process...');

    // Execute in child process
    const result = await executeInChildProcess(scriptPath, timeoutMs);

    console.log('DartRunner: Child process result:', {
      hasError: !!result.error,
      stdoutLength: result.stdout?.length || 0,
      stderrLength: result.stderr?.length || 0,
      errorMessage: result.error
    });

    if (result.error) {
      executionError = result.error;
    } else {
      try {
        const testResults = JSON.parse(result.stdout);
        return {
          testResults: testResults.results,
          overallPassed: testResults.overallPassed,
          totalTestsPassed: testResults.totalPassed,
          totalTests: testCases.length,
          consoleLogs: testResults.consoleLogs || [],
          executionError: null,
          compilationError: null
        };
      } catch (parseError) {
        executionError = `Failed to parse test results: ${parseError.message}`;
      }
    }

  } catch (error) {
    console.error('DartRunner execution error:', error);
    executionError = error.message;
  } finally {
    // Cleanup temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp directory:', cleanupError.message);
    }
  }

  return {
    testResults: [],
    overallPassed: false,
    totalTestsPassed: 0,
    totalTests: testCases.length,
    consoleLogs: [],
    executionError,
    compilationError
  };
};

// Create a complete Dart script - FIXED console capture
const createDartTestScriptWithConsoleCapture = (userCode, entryFunction, testCases) => {
  return `
import 'dart:convert';
import 'dart:io';
import 'dart:async';

// Console capture setup - FIXED VERSION
List<Map<String, dynamic>> _consoleLogs = [];

void capturedPrint(Object? object) {
  String message = object?.toString() ?? '';
  _consoleLogs.add({
    'type': 'log',
    'message': message,
    'timestamp': DateTime.now().millisecondsSinceEpoch
  });
  // Also call original print for debugging (goes to stderr in our setup)
  stderr.writeln('[PRINT] ' + message);
}

void setupConsoleCapture() {
  // Console capture is handled by using capturedPrint() instead of print()
  // No need to override the global print function
}

List<Map<String, dynamic>> getConsoleLogs() {
  return List.from(_consoleLogs);
}

List<Map<String, dynamic>> getRecentConsoleLogs(int startIndex) {
  if (startIndex >= _consoleLogs.length) return [];
  return _consoleLogs.sublist(startIndex);
}

void clearConsoleLogs() {
  _consoleLogs.clear();
}

// Student's code
${userCode}

// Test runner utilities
bool deepEqual(dynamic a, dynamic b) {
  if (identical(a, b)) return true;
  
  // Handle int/double comparison (5 == 5.0)
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

// Enhanced Function.apply with type conversion
dynamic callFunctionWithTypeConversion(Function func, List<dynamic> args) {
  stderr.writeln('DEBUG: callFunctionWithTypeConversion called');
  stderr.writeln('DEBUG: - Function: \$func');
  stderr.writeln('DEBUG: - Original args: \$args');
  
  try {
    // Try direct call first
    return Function.apply(func, args);
  } catch (typeError) {
    stderr.writeln('DEBUG: Direct call failed with type error: \$typeError');
    
    // Attempt common type conversions for known patterns
    List<dynamic> convertedArgs = [];
    String errorStr = typeError.toString();
    
    for (int i = 0; i < args.length; i++) {
      dynamic arg = args[i];
      stderr.writeln('DEBUG: Processing arg \$i: \$arg (type: \${arg.runtimeType})');
      
      // Convert integers to doubles if function expects double
      if (arg is int && errorStr.contains('double')) {
        stderr.writeln('DEBUG: Converting int \$arg to double');
        convertedArgs.add(arg.toDouble());
      }
      // Convert List<dynamic> to List<int>
      else if (arg is List && errorStr.contains('List<int>')) {
        stderr.writeln('DEBUG: Converting List to List<int>');
        try {
          List<int> intList = arg.map((e) => e is int ? e : int.parse(e.toString())).toList();
          convertedArgs.add(intList);
        } catch (conversionError) {
          stderr.writeln('DEBUG: Failed to convert to List<int>, using original');
          convertedArgs.add(arg);
        }
      }
      // Convert List<dynamic> to List<double>
      else if (arg is List && errorStr.contains('List<double>')) {
        stderr.writeln('DEBUG: Converting List to List<double>');
        try {
          List<double> doubleList = arg.map((e) {
            if (e is double) return e;
            if (e is int) return e.toDouble();
            return double.parse(e.toString());
          }).toList();
          convertedArgs.add(doubleList);
        } catch (conversionError) {
          stderr.writeln('DEBUG: Failed to convert to List<double>, using original');
          convertedArgs.add(arg);
        }
      }
      // Convert Map<dynamic, dynamic> to Map<String, String>
      else if (arg is Map && errorStr.contains('Map<String, String>')) {
        stderr.writeln('DEBUG: Converting Map to Map<String, String>');
        try {
          Map<String, String> stringMap = {};
          arg.forEach((k, v) {
            stringMap[k.toString()] = v.toString();
          });
          convertedArgs.add(stringMap);
        } catch (conversionError) {
          stderr.writeln('DEBUG: Failed to convert to Map<String, String>, using original');
          convertedArgs.add(arg);
        }
      }
      // Convert string to int if needed
      else if (arg is String && errorStr.contains('int')) {
        stderr.writeln('DEBUG: Converting String to int');
        try {
          convertedArgs.add(int.parse(arg));
        } catch (conversionError) {
          stderr.writeln('DEBUG: Failed to convert string to int, using original');
          convertedArgs.add(arg);
        }
      }
      // Convert string to double if needed
      else if (arg is String && errorStr.contains('double')) {
        stderr.writeln('DEBUG: Converting String to double');
        try {
          convertedArgs.add(double.parse(arg));
        } catch (conversionError) {
          stderr.writeln('DEBUG: Failed to convert string to double, using original');
          convertedArgs.add(arg);
        }
      }
      else {
        convertedArgs.add(arg);
      }
    }
    
    stderr.writeln('DEBUG: Trying with converted args: \$convertedArgs');
    
    try {
      return Function.apply(func, convertedArgs);
    } catch (secondError) {
      stderr.writeln('DEBUG: Second attempt also failed: \$secondError');
      
      // Last resort: try with even more aggressive type conversion
      List<dynamic> lastResortArgs = [];
      String secondErrorStr = secondError.toString();
      
      for (int i = 0; i < args.length; i++) {
        dynamic arg = args[i];
        
        // For empty lists, try creating typed empty lists
        if (arg is List && arg.isEmpty) {
          if (secondErrorStr.contains('List<int>')) {
            lastResortArgs.add(<int>[]);
          } else if (secondErrorStr.contains('List<double>')) {
            lastResortArgs.add(<double>[]);
          } else if (secondErrorStr.contains('List<String>')) {
            lastResortArgs.add(<String>[]);
          } else {
            lastResortArgs.add(arg);
          }
        }
        // For empty maps, try creating typed empty maps
        else if (arg is Map && arg.isEmpty) {
          if (secondErrorStr.contains('Map<String, String>')) {
            lastResortArgs.add(<String, String>{});
          } else if (secondErrorStr.contains('Map<String, int>')) {
            lastResortArgs.add(<String, int>{});
          } else {
            lastResortArgs.add(arg);
          }
        }
        else {
          lastResortArgs.add(convertedArgs.length > i ? convertedArgs[i] : arg);
        }
      }
      
      stderr.writeln('DEBUG: Last resort attempt with args: \$lastResortArgs');
      
      try {
        return Function.apply(func, lastResortArgs);
      } catch (finalError) {
        stderr.writeln('DEBUG: All conversion attempts failed: \$finalError');
        rethrow;
      }
    }
  }
}

void main() async {
  try {
    // Set up console capture
    setupConsoleCapture();
    
    stderr.writeln('DEBUG: Starting Dart test execution for function: ${entryFunction}');
    
    final testCases = ${JSON.stringify(testCases)};
    final results = <Map<String, dynamic>>[];
    int totalPassed = 0;
    
    stderr.writeln('DEBUG: Processing \${testCases.length} test cases');
    
    for (int i = 0; i < testCases.length; i++) {
      final testCase = testCases[i];
      final startTime = DateTime.now().millisecondsSinceEpoch;
      
      // Track console logs for this test
      final logCountBefore = _consoleLogs.length;
      
      stderr.writeln('DEBUG: Running test case \$i: \$testCase');
      
      try {
        final args = testCase['args'] as List<dynamic>? ?? [];
        final expected = testCase['expected'];
        
        stderr.writeln('DEBUG: Calling ${entryFunction} with args: \$args');
        
        dynamic actualOutput;
        
        // Use enhanced function calling with type conversion
        actualOutput = callFunctionWithTypeConversion(${entryFunction}, args);
        
        // Handle async functions
        if (actualOutput is Future) {
          actualOutput = await actualOutput;
        }
        
        final executionTime = DateTime.now().millisecondsSinceEpoch - startTime;
        final passed = deepEqual(actualOutput, expected);
        
        // Get console logs for this specific test case
        final testConsoleLogs = getRecentConsoleLogs(logCountBefore);
        
        stderr.writeln('DEBUG: Test \$i result - Expected: \$expected, Actual: \$actualOutput, Passed: \$passed');
        
        if (passed) totalPassed++;
        
        results.add({
          'testName': testCase['name'] ?? 'Test case \${i + 1}',
          'testCaseIndex': i,
          'passed': passed,
          'actualOutput': safeStringify(actualOutput),
          'expectedOutput': safeStringify(expected),
          'executionTime': executionTime,
          'consoleLogs': testConsoleLogs, // Console logs specific to this test
          'error': null
        });
        
      } catch (error) {
        stderr.writeln('DEBUG: Test \$i failed with error: \$error');
        
        // Get console logs even for failed tests
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

    // Output results with all console logs
    final output = {
      'results': results,
      'overallPassed': totalPassed == testCases.length && totalPassed > 0,
      'totalPassed': totalPassed,
      'consoleLogs': getConsoleLogs() // All console logs from the entire execution
    };
    
    stderr.writeln('DEBUG: Final results: \$output');
    
    // Use stderr for the final JSON output to avoid mixing with captured print statements
    stderr.writeln('RESULT_JSON_START');
    stderr.write(jsonEncode(output));
    stderr.writeln('RESULT_JSON_END');

  } catch (globalError) {
    stderr.writeln('DEBUG: Global error: \$globalError');
    
    final errorOutput = {
      'results': [],
      'overallPassed': false,
      'totalPassed': 0,
      'consoleLogs': getConsoleLogs() ?? [], // Include console logs even on error
      'error': globalError.toString()
    };
    
    stderr.writeln('RESULT_JSON_START');
    stderr.write(jsonEncode(errorOutput));
    stderr.writeln('RESULT_JSON_END');
    exit(1);
  }
}
`;
};

// Execute Dart code in child process
const executeInChildProcess = (scriptPath, timeoutMs) => {
  return new Promise((resolve) => {

    // Try 'dart' first, then fall back to 'dart run'
    const child = spawn('dart', [scriptPath], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Set up timeout
    const timeoutHandle = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1000); // Force kill after 1s
    }, timeoutMs);

    child.on('close', (code, signal) => {
      clearTimeout(timeoutHandle);

      if (signal === 'SIGTERM' || signal === 'SIGKILL') {
        resolve({
          error: `Execution timed out after ${timeoutMs}ms`,
          stdout: '',
          stderr: ''
        });
      } else if (code !== 0) {
        resolve({
          error: stderr || `Process exited with code ${code}`,
          stdout: stdout,
          stderr: stderr
        });
      } else {
        // Extract JSON from stderr instead of stdout for Dart
        try {
          const jsonStart = stderr.indexOf('RESULT_JSON_START');
          const jsonEnd = stderr.indexOf('RESULT_JSON_END');

          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = stderr.substring(jsonStart + 'RESULT_JSON_START'.length, jsonEnd).trim();
            resolve({
              error: null,
              stdout: jsonStr, // Return the extracted JSON as stdout
              stderr: stderr
            });
          } else {
            // Fallback to original behavior
            resolve({
              error: null,
              stdout: stdout,
              stderr: stderr
            });
          }
        } catch (parseError) {
          resolve({
            error: null,
            stdout: stdout,
            stderr: stderr
          });
        }
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutHandle);
      console.error('DartRunner: Child process error:', error);
      resolve({
        error: `Failed to start Dart process: ${error.message}. Make sure Dart SDK is installed.`,
        stdout: '',
        stderr: ''
      });
    });
  });
};

module.exports = { runDartTests };