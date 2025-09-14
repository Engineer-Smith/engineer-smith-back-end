// /services/grading/index.js - Updated with Dart runtime support
const { runNodeTests } = require('./nodeRunner');
const { runPythonTests } = require('./pythonRunner');
const { runSqlTests } = require('./sqlRunner');
const { runDartTests } = require('./dartRunner'); // Add Dart runner
const { gradeFillInBlanks } = require('./fillInBlankGrader');

const runCodeTests = async ({ code, language, testCases, runtime, entryFunction, timeoutMs = 3000 }) => {
  try {
    // Validate required parameters
    if (!code || !runtime) {
      throw new Error('Code and runtime are required');
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      throw new Error('At least one test case is required');
    }

    let result;
    
    switch (runtime) {
      case 'node':
        if (!entryFunction) {
          throw new Error('Entry function is required for Node.js runtime');
        }
        result = await runNodeTests({
          code,
          entryFunction,
          testCases,
          timeoutMs,
          language // for TypeScript compilation
        });
        break;
        
      case 'python':
        if (!entryFunction) {
          throw new Error('Entry function is required for Python runtime');
        }
        result = await runPythonTests({
          code,
          entryFunction,
          testCases,
          timeoutMs
        });
        break;
        
      case 'sql':
        result = await runSqlTests({
          query: code,
          testCases,
          timeoutMs
        });
        break;
        
      case 'dart':
        if (!entryFunction) {
          throw new Error('Entry function is required for Dart runtime');
        }
        result = await runDartTests({
          code,
          entryFunction,
          testCases,
          timeoutMs
        });
        break;
        
      default:
        throw new Error(`Unsupported runtime: ${runtime}. Supported runtimes: node, python, sql, dart`);
    }
    
    return {
      success: true,
      ...result
    };
    
  } catch (error) {
    console.error('Code testing error:', error);
    return {
      success: false,
      error: error.message,
      testResults: [],
      overallPassed: false,
      totalTestsPassed: 0,
      totalTests: testCases?.length || 0
    };
  }
};

// Test a single code submission (used by question testing service)
const testCodeSubmission = async (submissionData) => {
  const { 
    code, 
    language, 
    testCases, 
    runtime, 
    entryFunction, 
    timeoutMs = 3000 
  } = submissionData;

  return await runCodeTests({
    code,
    language,
    testCases,
    runtime,
    entryFunction,
    timeoutMs
  });
};

// Validate grading configuration
const validateGradingConfig = (config) => {
  const { runtime, language, testCases } = config;
  
  const validRuntimes = ['node', 'python', 'sql', 'dart']; // Add dart to valid runtimes
  // FIXED: Include all supported languages from the Question schema
  const validLanguages = [
    'javascript', 'typescript', 'python', 'sql', 'dart',
    'react', 'reactNative', 'flutter', 'express', 'html', 'css', 'json'
  ];
  
  if (!validRuntimes.includes(runtime)) {
    throw new Error(`Invalid runtime: ${runtime}. Must be one of: ${validRuntimes.join(', ')}`);
  }
  
  if (!validLanguages.includes(language)) {
    throw new Error(`Invalid language: ${language}. Must be one of: ${validLanguages.join(', ')}`);
  }
  
  if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
    throw new Error('At least one test case is required');
  }

  // Validate test case structure
  testCases.forEach((testCase, index) => {
    if (!testCase.hasOwnProperty('args') || !testCase.hasOwnProperty('expected')) {
      throw new Error(`Test case ${index + 1} must have 'args' and 'expected' properties`);
    }
    if (typeof testCase.hidden !== 'boolean') {
      throw new Error(`Test case ${index + 1} must have a boolean 'hidden' property`);
    }
  });
};

// Export all grading functions
module.exports = {
  runCodeTests,
  testCodeSubmission,
  validateGradingConfig,
  gradeFillInBlanks
};