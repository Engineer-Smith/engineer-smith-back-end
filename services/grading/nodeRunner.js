// /services/grading/runners/nodeRunner.js - Enhanced with console log capture
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const runNodeTests = async ({ code, entryFunction, testCases, timeoutMs, language }) => {

  let executionError = null;
  let compilationError = null;

  // Create unique execution ID
  const executionId = crypto.randomBytes(8).toString('hex');
  const tempDir = path.join('/tmp', `code-execution-${executionId}`);

  try {
    // Create temporary directory
    await fs.mkdir(tempDir, { recursive: true });

    // Handle TypeScript compilation if needed
    let processedCode = code;
    if (language === 'typescript') {
      processedCode = await compileTypeScript(code);
    }

    // Create the complete test script with console capture
    const testScript = createTestScriptWithConsoleCapture(processedCode, entryFunction, testCases);
    const scriptPath = path.join(tempDir, 'test.js');

    await fs.writeFile(scriptPath, testScript);

    // Execute in child process (full Node.js environment)
    const result = await executeInChildProcess(scriptPath, timeoutMs);

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
          consoleLogs: testResults.consoleLogs || [], // NEW: Include console logs
          executionError: null,
          compilationError: null
        };
      } catch (parseError) {
        executionError = `Failed to parse test results: ${parseError.message}`;
      }
    }

  } catch (error) {
    console.error('NodeRunner execution error:', error);
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
    consoleLogs: [], // NEW: Include empty array for failed executions
    executionError,
    compilationError
  };
};

// Create a complete Node.js script that runs the tests with console capture
const createTestScriptWithConsoleCapture = (userCode, entryFunction, testCases) => {
  return `
// Console log capture setup
const consoleLogs = [];
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Override console methods to capture output (but not debug logs)
console.log = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  consoleLogs.push({ type: 'log', message, timestamp: Date.now() });
  // Don't call original to avoid mixing with our result output
};

console.warn = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  consoleLogs.push({ type: 'warn', message, timestamp: Date.now() });
};

console.info = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  consoleLogs.push({ type: 'info', message, timestamp: Date.now() });
};

// Keep console.error for debug output (stderr)

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
  console.error('[DEBUG] callFunction invoked with:');
  console.error('[DEBUG] - Function name:', func.name);
  console.error('[DEBUG] - Function.length (expected params):', func.length);
  console.error('[DEBUG] - args:', JSON.stringify(args));
  console.error('[DEBUG] - args.length:', args ? args.length : 0);
  
  if (!args || args.length === 0) {
    console.error('[DEBUG] No args provided, calling function with no parameters');
    return func();
  }
  
  // If function expects 1 parameter and we have 1 argument, pass it directly
  // This handles cases like findMax([1,2,3,4]) and reverseString("hello")
  if (func.length === 1 && args.length === 1) {
    console.error('[DEBUG] Single parameter function detected');
    console.error('[DEBUG] - Passing first arg directly:', JSON.stringify(args[0]));
    console.error('[DEBUG] - Type of first arg:', typeof args[0]);
    console.error('[DEBUG] - Is array?:', Array.isArray(args[0]));
    return func(args[0]);
  }
  
  // For functions with multiple parameters or when args length doesn't match
  // spread the arguments normally
  console.error('[DEBUG] Multi-parameter function or mismatched args, spreading...');
  console.error('[DEBUG] - Will call with spread args:', args.map(arg => JSON.stringify(arg)).join(', '));
  return func.apply(null, args);
};

// Main execution
const results = [];
let totalPassed = 0;

try {
  // Check if function exists
  console.error('[DEBUG] Checking if function exists:', '${entryFunction}');
  console.error('[DEBUG] Function type:', typeof ${entryFunction});
  
  if (typeof ${entryFunction} !== 'function') {
    console.error('[DEBUG] ERROR: Function not found or not a function');
    originalConsoleLog(JSON.stringify({
      results: [],
      overallPassed: false,
      totalPassed: 0,
      consoleLogs: consoleLogs,
      error: 'Function "${entryFunction}" not found or is not a function'
    }));
    process.exit(1);
  }

  console.error('[DEBUG] Function found successfully');
  console.error('[DEBUG] Function.length (expected parameters):', ${entryFunction}.length);

  // Run test cases
  const testCases = ${JSON.stringify(testCases)};
  console.error('[DEBUG] Total test cases to run:', testCases.length);
  console.error('[DEBUG] Test cases data:', JSON.stringify(testCases, null, 2));

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.error('[DEBUG] Running test case', i);
    console.error('[DEBUG] - Test case data:', JSON.stringify(testCase, null, 2));
    
    const startTime = Date.now();
    const testStartLogs = consoleLogs.length; // Track console logs for this test
    
    try {
      // Use smart function calling instead of direct apply
      console.error('[DEBUG] About to call function with args:', JSON.stringify(testCase.args));
      const actualOutput = callFunction(${entryFunction}, testCase.args || []);
      console.error('[DEBUG] Function returned:', JSON.stringify(actualOutput));
      console.error('[DEBUG] Expected:', JSON.stringify(testCase.expected));
      
      const executionTime = Date.now() - startTime;
      const passed = deepEqual(actualOutput, testCase.expected);
      console.error('[DEBUG] Test passed?', passed);
      
      // Get console logs for this specific test case
      const testConsoleLogs = consoleLogs.slice(testStartLogs);
      
      if (passed) totalPassed++;
      
      results.push({
        testName: testCase.name || \`Test case \${i + 1}\`,
        testCaseIndex: i,
        passed,
        actualOutput: safeStringify(actualOutput),
        expectedOutput: safeStringify(testCase.expected),
        executionTime,
        consoleLogs: testConsoleLogs, // Console logs specific to this test
        error: null
      });
      
    } catch (error) {
      console.error('[DEBUG] Function threw error:', error.message);
      console.error('[DEBUG] Error stack:', error.stack);
      
      // Get console logs for this test even if it failed
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

  // Output results using original console.log to avoid capture
  originalConsoleLog(JSON.stringify({
    results: results,
    overallPassed: totalPassed === testCases.length && totalPassed > 0,
    totalPassed: totalPassed,
    consoleLogs: consoleLogs // All console logs from the entire execution
  }));

} catch (globalError) {
  originalConsoleLog(JSON.stringify({
    results: [],
    overallPassed: false,
    totalPassed: 0,
    consoleLogs: consoleLogs || [], // Include console logs even on error
    error: globalError.message
  }));
  process.exit(1);
}
`;
};

// Execute code in child process (full Node.js environment)
const executeInChildProcess = (scriptPath, timeoutMs) => {
  return new Promise((resolve) => {

    const child = spawn('node', [scriptPath], {
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
      } else if (code === 0) {
        resolve({
          error: null,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      } else {
        resolve({
          error: stderr.trim() || `Process exited with code ${code}`,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutHandle);
      resolve({
        error: `Child process failed: ${error.message}`,
        stdout: '',
        stderr: ''
      });
    });
  });
};

// Helper function for TypeScript compilation
const compileTypeScript = async (code) => {
  try {
    const ts = require('typescript');

    const result = ts.transpile(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2018,
        jsx: ts.JsxEmit.React,
        strict: false,
        noImplicitAny: false,
        skipLibCheck: true
      }
    });

    return result;
  } catch (error) {
    throw new Error(`TypeScript compilation failed: ${error.message}`);
  }
};

module.exports = { runNodeTests };