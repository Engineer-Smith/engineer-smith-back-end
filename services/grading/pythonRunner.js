// /services/grading/runners/pythonRunner.js - Enhanced to include console logs
const { Worker } = require('worker_threads');
const path = require('path');

const runPythonTests = async ({ code, entryFunction, testCases, timeoutMs }) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'pythonWorker.js'), {
      workerData: { code, entryFunction, testCases, timeoutMs }
    });

    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests: testCases.length,
        consoleLogs: [], // NEW: Include empty console logs for timeout
        executionError: 'Execution timed out'
      });
    }, timeoutMs + 1000);

    worker.on('message', (result) => {
      clearTimeout(timeout);
      resolve(result);
    });

    worker.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        testResults: [],
        overallPassed: false,
        totalTestsPassed: 0,
        totalTests: testCases.length,
        consoleLogs: [], // NEW: Include empty console logs for error
        executionError: error.message
      });
    });
  });
};

module.exports = { runPythonTests };