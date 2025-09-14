// /services/question/questionTestingService.js - Improved question testing and code execution
const createError = require('http-errors');

class QuestionTestingService {
  async testQuestion(questionData, testCode, user) {
    // Validate permissions
    this._validateTestingPermissions(user);

    // Validate input
    this._validateTestingInput(questionData, testCode);

    try {
      // Import the grading service dynamically to avoid circular dependencies
      const { runCodeTests, validateGradingConfig } = require('../grading');

      // Validate grading configuration before execution
      validateGradingConfig({
        runtime: questionData.codeConfig.runtime,
        language: questionData.language,
        testCases: questionData.testCases
      });

      const result = await runCodeTests({
        code: testCode,
        language: questionData.language,
        testCases: questionData.testCases,
        runtime: questionData.codeConfig.runtime,
        entryFunction: questionData.codeConfig.entryFunction,
        timeoutMs: questionData.codeConfig.timeoutMs || 3000
      });

      return this._formatTestResult(result, questionData);
    } catch (error) {
      console.error('Question testing error:', error);
      throw createError(500, `Test execution failed: ${error.message}`);
    }
  }

  // Test fill-in-the-blank questions
  async testFillInBlank(questionData, testAnswers, user) {
    // Validate permissions
    this._validateTestingPermissions(user);

    // Validate input for fill-in-blank
    this._validateFillInBlankInput(questionData, testAnswers);

    try {
      const { gradeFillInBlanks } = require('../grading');

      const result = gradeFillInBlanks(testAnswers, questionData.blanks);

      return {
        success: true,
        questionType: 'fillInTheBlank',
        language: questionData.language,
        gradingResult: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Fill-in-blank testing error:', error);
      throw createError(500, `Fill-in-blank test failed: ${error.message}`);
    }
  }

  // Private methods
  _validateTestingPermissions(user) {
    // Allow instructors and admins (original functionality for question creation)
    if (user.role === 'instructor' || user.role === 'admin' || user.isSuperOrgAdmin) {
      return;
    }

    // Allow students for code testing during sessions and practice
    if (user.role === 'student') {
      return;
    }

    // Reject any other roles
    throw createError(403, 'Only instructors, admins, and students can test questions');
  }

  _validateTestingInput(questionData, testCode) {
    if (!questionData || !testCode) {
      throw createError(400, 'questionData and testCode are required');
    }

    // Support both codeChallenge and codeDebugging for logic questions
    if (!['codeChallenge', 'codeDebugging', 'fillInTheBlank'].includes(questionData.type)) {
      throw createError(400, 'Testing only available for code challenge, debugging, and fill-in-blank questions');
    }

    if (questionData.category !== 'logic') {
      throw createError(400, 'Testing only available for logic questions');
    }

    if (!questionData.testCases || !Array.isArray(questionData.testCases)) {
      throw createError(400, 'Test cases are required');
    }

    if (questionData.testCases.length === 0) {
      throw createError(400, 'At least one test case is required');
    }

    if (questionData.language === 'sql') {
      if (!questionData.codeConfig?.runtime) {
        throw createError(400, 'Runtime is required for SQL questions');
      }
    } else {
      if (!questionData.codeConfig?.entryFunction) {
        throw createError(400, 'Entry function is required');
      }
      if (!questionData.codeConfig?.runtime) {
        throw createError(400, 'Runtime is required');
      }
    }

    // Validate test cases structure
    for (let i = 0; i < questionData.testCases.length; i++) {
      const testCase = questionData.testCases[i];
      if (!testCase.hasOwnProperty('args') || !testCase.hasOwnProperty('expected')) {
        throw createError(400, `Test case ${i + 1} must have 'args' and 'expected' properties`);
      }
    }
  }

  _validateFillInBlankInput(questionData, testAnswers) {
    if (!questionData || !testAnswers) {
      throw createError(400, 'questionData and testAnswers are required');
    }

    if (questionData.type !== 'fillInTheBlank') {
      throw createError(400, 'This method is only for fill-in-the-blank questions');
    }

    if (!questionData.blanks || !Array.isArray(questionData.blanks)) {
      throw createError(400, 'Blanks configuration is required');
    }

    if (questionData.blanks.length === 0) {
      throw createError(400, 'At least one blank is required');
    }

    if (typeof testAnswers !== 'object' || Array.isArray(testAnswers)) {
      throw createError(400, 'testAnswers must be an object');
    }
  }

  _formatTestResult(result, questionData) {
    return {
      success: result.success || false,
      questionType: questionData.type,
      language: questionData.language,
      category: questionData.category,
      entryFunction: questionData.codeConfig.entryFunction,
      runtime: questionData.codeConfig.runtime,
      testResults: result.testResults || [],
      overallPassed: result.overallPassed || false,
      totalTestsPassed: result.totalTestsPassed || 0,
      totalTests: result.totalTests || 0,
      consoleLogs: result.consoleLogs || [], // ADD THIS LINE
      executionError: result.executionError || null,
      compilationError: result.compilationError || null,
      timestamp: new Date().toISOString()
    };
  }

  // Get supported testing configurations
  getSupportedConfigurations() {
    return {
      supportedQuestionTypes: ['codeChallenge', 'codeDebugging', 'fillInTheBlank'],
      // FIXED: Include all supported languages from the Question schema
      supportedLanguages: [
        'javascript', 'typescript', 'python', 'sql', 'dart',
        'react', 'reactNative', 'flutter', 'express', 'html', 'css', 'json'
      ],
      supportedRuntimes: ['node', 'python', 'sql', 'dart'],
      supportedCategories: ['logic', 'ui', 'syntax'],
      languageRuntimeMap: {
        javascript: 'node',
        typescript: 'node',
        express: 'node',
        python: 'python',
        sql: 'sql',
        dart: 'dart'
        // No mappings for UI frameworks
      }
    };
  }
}

module.exports = new QuestionTestingService();