// /services/grading/runners/pythonWorker.js - Enhanced Pyodide worker with console capture
const { parentPort, workerData } = require('worker_threads');
const { loadPyodide } = require('pyodide');

(async () => {
  try {
    const { code, entryFunction, testCases, timeoutMs } = workerData;
    
    // Load Pyodide
    const pyodide = await loadPyodide();
    
    // Set up console capture in Python
    const setupConsoleCapture = `
import sys
import json
from io import StringIO

# Console capture setup
_console_logs = []
_original_stdout = sys.stdout
_original_stderr = sys.stderr

class ConsoleCapture:
    def __init__(self, log_type):
        self.log_type = log_type
        self.buffer = StringIO()
    
    def write(self, text):
        if text.strip():  # Only capture non-empty output
            _console_logs.append({
                'type': self.log_type,
                'message': text.rstrip(),
                'timestamp': __import__('time').time() * 1000  # Convert to milliseconds
            })
        # Also write to original for debugging if needed
        if self.log_type == 'log':
            _original_stdout.write(text)
        else:
            _original_stderr.write(text)
    
    def flush(self):
        pass

# Override sys.stdout and sys.stderr
sys.stdout = ConsoleCapture('log')
sys.stderr = ConsoleCapture('error')

def get_console_logs():
    return _console_logs

def clear_console_logs():
    global _console_logs
    _console_logs = []

def get_recent_console_logs(start_index):
    return _console_logs[start_index:]
`;
    
    // Run the console capture setup
    pyodide.runPython(setupConsoleCapture);
    
    // Run user code
    pyodide.runPython(code);
    
    const results = [];
    let totalPassed = 0;
    
    // Test each case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();
      
      try {
        // Get current console log count before test
        const getLogCountCode = `len(get_console_logs())`;
        const logCountBefore = pyodide.runPython(getLogCountCode);
        
        // Call Python function and capture result
        const pythonCode = `
import json
result = ${entryFunction}(*${JSON.stringify(testCase.args || [])})
json.dumps(result)
        `;
        
        const resultJson = pyodide.runPython(pythonCode);
        const actualOutput = JSON.parse(resultJson);
        const executionTime = Date.now() - startTime;
        
        // Get console logs for this specific test
        const getTestLogsCode = `
import json
json.dumps(get_recent_console_logs(${logCountBefore}))
        `;
        const testLogsJson = pyodide.runPython(getTestLogsCode);
        const testConsoleLogs = JSON.parse(testLogsJson);
        
        const passed = JSON.stringify(actualOutput) === JSON.stringify(testCase.expected);
        if (passed) totalPassed++;
        
        results.push({
          testName: testCase.name || `Test case ${i + 1}`,
          testCaseIndex: i,
          passed,
          actualOutput: JSON.stringify(actualOutput),
          expectedOutput: JSON.stringify(testCase.expected),
          executionTime,
          consoleLogs: testConsoleLogs, // Console logs specific to this test
          error: null
        });
        
      } catch (error) {
        // Get console logs even for failed tests
        const getLogCountCode = `len(get_console_logs())`;
        const logCountBefore = pyodide.runPython(getLogCountCode) || 0;
        
        const getTestLogsCode = `
import json
json.dumps(get_recent_console_logs(${Math.max(0, logCountBefore - 10)}))  # Get recent logs on error
        `;
        let testConsoleLogs = [];
        try {
          const testLogsJson = pyodide.runPython(getTestLogsCode);
          testConsoleLogs = JSON.parse(testLogsJson);
        } catch (logError) {
          // If we can't get logs, continue with empty array
        }
        
        results.push({
          testName: testCase.name || `Test case ${i + 1}`,
          testCaseIndex: i,
          passed: false,
          actualOutput: null,
          expectedOutput: JSON.stringify(testCase.expected),
          executionTime: Date.now() - startTime,
          consoleLogs: testConsoleLogs,
          error: error.message
        });
      }
    }
    
    // Get all console logs from the entire execution
    const getAllLogsCode = `
import json
json.dumps(get_console_logs())
    `;
    let allConsoleLogs = [];
    try {
      const allLogsJson = pyodide.runPython(getAllLogsCode);
      allConsoleLogs = JSON.parse(allLogsJson);
    } catch (logError) {
      // If we can't get logs, continue with empty array
    }
    
    parentPort.postMessage({
      testResults: results,
      overallPassed: totalPassed === testCases.length && totalPassed > 0,
      totalTestsPassed: totalPassed,
      totalTests: testCases.length,
      consoleLogs: allConsoleLogs, // NEW: All console logs from the entire execution
      executionError: null,
      compilationError: null
    });
    
  } catch (error) {
    parentPort.postMessage({
      testResults: [],
      overallPassed: false,
      totalTestsPassed: 0,
      totalTests: workerData.testCases.length,
      consoleLogs: [], // NEW: Include empty console logs for error
      executionError: error.message
    });
  }
})();