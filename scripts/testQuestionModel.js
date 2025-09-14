#!/usr/bin/env node

// /scripts/testQuestionModel.js - Comprehensive test script for all Question model test case options
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const { runCodeTests, gradeFillInBlanks } = require('../services/grading');

// Create a dummy ObjectId for createdBy field
const DUMMY_USER_ID = new mongoose.Types.ObjectId();

// Test data matching the exact Question model structure
const TEST_CASES = {
  // Multiple Choice Question
  multipleChoice: {
    type: 'multipleChoice',
    language: 'javascript',
    title: 'JavaScript Variable Declaration',
    description: 'Which keyword is used to declare a variable in JavaScript?',
    difficulty: 'easy',
    options: ['var', 'let', 'const', 'All of the above'],
    correctAnswer: 3, // Index of "All of the above"
    createdBy: DUMMY_USER_ID,
    tags: ['javascript', 'variables']
  },

  // True/False Question
  trueFalse: {
    type: 'trueFalse',
    language: 'css',
    title: 'CSS Box Model',
    description: 'The CSS box model includes margin, border, padding, and content.',
    difficulty: 'easy',
    options: ['True', 'False'],
    correctAnswer: true,
    createdBy: DUMMY_USER_ID,
    tags: ['css'] // Removed invalid 'box-model' tag
  },

  // Fill in the Blank - UI Question
  fillInBlankUI: {
    type: 'fillInTheBlank',
    language: 'html',
    category: 'ui',
    title: 'HTML Form Structure',
    description: 'Complete the HTML form with the correct attributes',
    difficulty: 'medium',
    createdBy: DUMMY_USER_ID,
    codeTemplate: `<form action="{{blank1}}" method="{{blank2}}">
  <input type="text" name="username" {{blank3}}>
  <input type="password" name="password">
  <button type="{{blank4}}">Submit</button>
</form>`,
    blanks: [
      {
        id: 'blank1',
        correctAnswers: ['/submit', '/login', '/process'],
        caseSensitive: false,
        hint: 'The URL where form data is sent',
        points: 2
      },
      {
        id: 'blank2',
        correctAnswers: ['POST', 'post'],
        caseSensitive: false,
        hint: 'HTTP method for sending form data securely',
        points: 2
      },
      {
        id: 'blank3',
        correctAnswers: ['required', 'required="true"', 'required=""'],
        caseSensitive: false,
        hint: 'Attribute to make field mandatory',
        points: 1
      },
      {
        id: 'blank4',
        correctAnswers: ['submit'],
        caseSensitive: false,
        hint: 'Button type for form submission',
        points: 1
      }
    ],
    tags: ['html'] // Removed invalid 'forms', 'ui-components' tags
  },

  // Fill in the Blank - CSS
  fillInBlankCSS: {
    type: 'fillInTheBlank',
    language: 'css',
    category: 'syntax',
    title: 'CSS Flexbox Layout',
    description: 'Complete the CSS flexbox properties',
    difficulty: 'medium',
    createdBy: DUMMY_USER_ID,
    codeTemplate: `.container {
  display: {{blank1}};
  justify-content: {{blank2}};
  align-items: {{blank3}};
  flex-direction: {{blank4}};
}`,
    blanks: [
      {
        id: 'blank1',
        correctAnswers: ['flex'],
        caseSensitive: false,
        points: 1
      },
      {
        id: 'blank2',
        correctAnswers: ['center', 'space-between', 'space-around', 'flex-start', 'flex-end'],
        caseSensitive: false,
        points: 1
      },
      {
        id: 'blank3',
        correctAnswers: ['center', 'flex-start', 'flex-end', 'stretch'],
        caseSensitive: false,
        points: 1
      },
      {
        id: 'blank4',
        correctAnswers: ['row', 'column', 'row-reverse', 'column-reverse'],
        caseSensitive: false,
        points: 1
      }
    ],
    tags: ['css', 'flexbox'] // Removed invalid 'layout' tag
  },

  // Code Challenge - JavaScript Logic
  codeChallenge: {
    type: 'codeChallenge',
    language: 'javascript',
    category: 'logic',
    title: 'Sum Two Numbers',
    description: 'Write a function that adds two numbers and returns the result',
    difficulty: 'easy',
    createdBy: DUMMY_USER_ID,
    codeConfig: {
      runtime: 'node',
      entryFunction: 'addNumbers',
      timeoutMs: 3000,
      allowPreview: true
    },
    testCases: [
      { name: 'Basic addition', args: [2, 3], expected: 5, hidden: false },
      { name: 'Negative numbers', args: [-1, 1], expected: 0, hidden: false },
      { name: 'Zero case', args: [0, 0], expected: 0, hidden: false },
      { name: 'Large numbers', args: [1000, 2000], expected: 3000, hidden: true },
      { name: 'Decimal numbers', args: [1.5, 2.5], expected: 4, hidden: true }
    ],
    tags: ['javascript', 'functions', 'algorithms']
  },

  // Code Challenge - Python Logic
  pythonCodeChallenge: {
    type: 'codeChallenge',
    language: 'python',
    category: 'logic',
    title: 'Find Maximum in List',
    description: 'Write a function that finds the maximum number in a list',
    difficulty: 'medium',
    createdBy: DUMMY_USER_ID,
    codeConfig: {
      runtime: 'python',
      entryFunction: 'find_max',
      timeoutMs: 3000,
      allowPreview: true
    },
    testCases: [
      { name: 'Positive numbers', args: [[1, 5, 3, 9, 2]], expected: 9, hidden: false },
      { name: 'Negative numbers', args: [[-1, -5, -3, -2]], expected: -1, hidden: false },
      { name: 'Mixed numbers', args: [[-10, 5, 0, -3, 8]], expected: 8, hidden: false },
      { name: 'Single element', args: [[42]], expected: 42, hidden: true },
      { name: 'Complex case', args: [[100, 50, 200, 75, 150]], expected: 200, hidden: true }
    ],
    tags: ['python', 'functions', 'algorithms', 'data-structures']
  },

  // SQL Code Challenge
  sqlCodeChallenge: {
    type: 'codeChallenge',
    language: 'sql',
    category: 'logic',
    title: 'Select Users by Age',
    description: 'Write a SQL query to select all users older than 25, ordered by age',
    difficulty: 'easy',
    createdBy: DUMMY_USER_ID,
    codeConfig: {
      runtime: 'sql',
      timeoutMs: 3000
    },
    testCases: [
      {
        name: 'Basic age filter',
        args: [], // SQL doesn't use args the same way
        schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT, age INTEGER);
          INSERT INTO users VALUES (1, 'Alice', 30);
          INSERT INTO users VALUES (2, 'Bob', 22);
          INSERT INTO users VALUES (3, 'Charlie', 28);
          INSERT INTO users VALUES (4, 'Diana', 35);
        `,
        expectedRows: [
          { id: 1, name: 'Alice', age: 30 },
          { id: 3, name: 'Charlie', age: 28 },
          { id: 4, name: 'Diana', age: 35 }
        ],
        expected: null, // For SQL, we use expectedRows
        hidden: false,
        orderMatters: false
      }
    ],
    tags: ['sql', 'queries', 'database-design']
  },

  // Code Debugging - JavaScript
  codeDebugging: {
    type: 'codeDebugging',
    language: 'javascript',
    category: 'logic',
    title: 'Fix Array Sum Function',
    description: 'The following function should sum all numbers in an array, but it has a bug. Fix it.',
    difficulty: 'medium',
    createdBy: DUMMY_USER_ID,
    buggyCode: `function sumArray(numbers) {
  let sum = 0;
  for (let i = 0; i <= numbers.length; i++) { // Bug: should be < not <=
    sum += numbers[i];
  }
  return sum;
}`,
    solutionCode: `function sumArray(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}`,
    codeConfig: {
      runtime: 'node',
      entryFunction: 'sumArray',
      timeoutMs: 3000,
      allowPreview: true
    },
    testCases: [
      { name: 'Simple array', args: [[1, 2, 3]], expected: 6, hidden: false },
      { name: 'Empty array', args: [[]], expected: 0, hidden: false },
      { name: 'Single element', args: [[5]], expected: 5, hidden: false },
      { name: 'Negative numbers', args: [[-1, -2, 3]], expected: 0, hidden: true },
      { name: 'Large array', args: [[10, 20, 30, 40]], expected: 100, hidden: true }
    ],
    tags: ['javascript', 'arrays', 'loops'] // Removed invalid 'debugging' tag
  },

  // TypeScript Code Challenge
  typescriptCodeChallenge: {
    type: 'codeChallenge',
    language: 'typescript',
    category: 'logic',
    title: 'Calculate Circle Area',
    description: 'Write a TypeScript function that calculates the area of a circle',
    difficulty: 'easy',
    createdBy: DUMMY_USER_ID,
    codeConfig: {
      runtime: 'node', // TypeScript compiles to Node
      entryFunction: 'calculateCircleArea',
      timeoutMs: 3000,
      allowPreview: true
    },
    testCases: [
      { name: 'Unit circle', args: [1], expected: Math.PI, hidden: false },
      { name: 'Radius 2', args: [2], expected: Math.PI * 4, hidden: false },
      { name: 'Radius 5', args: [5], expected: Math.PI * 25, hidden: true }
    ],
    tags: ['typescript', 'functions', 'algorithms']
  }
};

// Test code samples - both correct and incorrect versions
const TEST_CODE_SAMPLES = {
  // Correct implementations
  correct: {
    addNumbers: `function addNumbers(a, b) {
  return a + b;
}`,
    
    find_max: `def find_max(numbers):
    return max(numbers)`,
    
    sqlQuery: `SELECT * FROM users WHERE age > 25 ORDER BY age;`,
    
    sumArray: `function sumArray(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}`,
    
    calculateCircleArea: `function calculateCircleArea(radius) {
  return Math.PI * radius * radius;
}`
  },

  // Incorrect implementations for testing
  incorrect: {
    addNumbers: `function addNumbers(a, b) {
  return a - b; // Wrong operation
}`,
    
    find_max: `def find_max(numbers):
    return min(numbers) # Returns minimum instead`,
    
    sumArray: `function sumArray(numbers) {
  let sum = 0;
  for (let i = 0; i <= numbers.length; i++) { // Bug: <= instead of <
    sum += numbers[i];
  }
  return sum;
}`,
    
    calculateCircleArea: `function calculateCircleArea(radius) {
  return 2 * Math.PI * radius; // Calculates circumference instead
}`
  },

  // Fill-in-blank answers
  fillInBlankAnswers: {
    correct: {
      blank1: '/submit',
      blank2: 'POST',
      blank3: 'required',
      blank4: 'submit'
    },
    incorrect: {
      blank1: 'wrong',
      blank2: 'GET',
      blank3: 'optional',
      blank4: 'button'
    }
  },

  cssFlexboxAnswers: {
    correct: {
      blank1: 'flex',
      blank2: 'center',
      blank3: 'center',
      blank4: 'row'
    },
    incorrect: {
      blank1: 'block',
      blank2: 'left',
      blank3: 'top',
      blank4: 'horizontal'
    }
  }
};

class QuestionModelTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async connectDB() {
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err);
      throw err;
    }
  }

  async disconnectDB() {
    await mongoose.connection.close();
    console.log('📤 Disconnected from MongoDB');
  }

  logTest(testName, passed, message = '') {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${testName}: ${message}`);
    
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
      this.results.errors.push(`${testName}: ${message}`);
    }
  }

  async testQuestionValidation(questionData, testName) {
    try {
      // Create question instance to validate schema
      const question = new Question(questionData);
      
      // Validate the question
      await question.validate();
      
      this.logTest(`${testName} - Schema Validation`, true, 'Valid question structure');
      return true;
    } catch (error) {
      this.logTest(`${testName} - Schema Validation`, false, `Validation error: ${error.message}`);
      return false;
    }
  }

  async testCodeExecution(questionData, testCode, testName) {
    try {
      if (!questionData.codeConfig || !questionData.testCases) {
        this.logTest(`${testName} - Code Execution`, false, 'Missing code config or test cases');
        return false;
      }

      console.log(`   🔍 Testing with code:\n${testCode.substring(0, 100)}...`);

      const result = await runCodeTests({
        code: testCode,
        language: questionData.language,
        testCases: questionData.testCases,
        runtime: questionData.codeConfig.runtime,
        entryFunction: questionData.codeConfig.entryFunction,
        timeoutMs: questionData.codeConfig.timeoutMs || 3000
      });

      console.log(`   📊 Test Results: ${result.totalTestsPassed}/${result.totalTests} passed`);
      console.log(`   🔍 Response Structure Validation:`);
      
      // VALIDATE RESPONSE STRUCTURE
      const structureIssues = this.validateTestResponse(result, questionData.testCases);
      if (structureIssues.length > 0) {
        console.log(`   ❌ Structure Issues Found:`);
        structureIssues.forEach(issue => console.log(`     • ${issue}`));
        this.logTest(`${testName} - Code Execution`, false, `Structure validation failed: ${structureIssues.join(', ')}`);
        return false;
      } else {
        console.log(`   ✅ Response structure is valid`);
      }

      // VALIDATE INDIVIDUAL TEST RESULTS
      if (result.testResults && result.testResults.length > 0) {
        let detailedValidationPassed = true;
        
        result.testResults.forEach((testResult, index) => {
          const icon = testResult.passed ? '✅' : '❌';
          console.log(`     ${icon} ${testResult.testName}: ${testResult.passed ? 'PASS' : 'FAIL'}`);
          
          // Validate individual test result structure
          const testValidation = this.validateIndividualTestResult(testResult, questionData.testCases[index], index);
          if (!testValidation.isValid) {
            console.log(`       ⚠️  Test validation issues: ${testValidation.issues.join(', ')}`);
            detailedValidationPassed = false;
          }
          
          if (!testResult.passed && testResult.error) {
            console.log(`       Error: ${testResult.error}`);
          }
          
          // For passed tests, validate the actual vs expected output makes sense
          if (testResult.passed) {
            const outputValidation = this.validateOutputLogic(testResult, questionData.testCases[index]);
            if (!outputValidation.isValid) {
              console.log(`       ⚠️  Output validation failed: ${outputValidation.reason}`);
              detailedValidationPassed = false;
            }
          }
        });

        if (!detailedValidationPassed) {
          this.logTest(`${testName} - Code Execution`, false, 'Detailed test validation failed');
          return false;
        }
      }

      // VALIDATE OVERALL RESULTS
      const overallValidation = this.validateOverallResults(result);
      if (!overallValidation.isValid) {
        console.log(`   ❌ Overall validation failed: ${overallValidation.issues.join(', ')}`);
        this.logTest(`${testName} - Code Execution`, false, `Overall validation failed: ${overallValidation.issues.join(', ')}`);
        return false;
      }

      if (result.success && result.overallPassed) {
        this.logTest(`${testName} - Code Execution`, true, `Passed ${result.totalTestsPassed}/${result.totalTests} test cases`);
        return true;
      } else {
        this.logTest(`${testName} - Code Execution`, false, 
          `Failed: ${result.executionError || 'Some test cases failed'}`);
        if (result.executionError) console.log(`   ❌ Execution Error: ${result.executionError}`);
        if (result.compilationError) console.log(`   ❌ Compilation Error: ${result.compilationError}`);
        return false;
      }
    } catch (error) {
      this.logTest(`${testName} - Code Execution`, false, `Execution error: ${error.message}`);
      return false;
    }
  }

  // Validate the overall response structure
  validateTestResponse(result, originalTestCases) {
    const issues = [];

    // Check required top-level properties
    const requiredProps = ['success', 'testResults', 'overallPassed', 'totalTestsPassed', 'totalTests'];
    requiredProps.forEach(prop => {
      if (!(prop in result)) {
        issues.push(`Missing required property: ${prop}`);
      }
    });

    // Validate types
    if (typeof result.success !== 'boolean') {
      issues.push(`'success' should be boolean, got ${typeof result.success}`);
    }

    if (typeof result.overallPassed !== 'boolean') {
      issues.push(`'overallPassed' should be boolean, got ${typeof result.overallPassed}`);
    }

    if (typeof result.totalTestsPassed !== 'number') {
      issues.push(`'totalTestsPassed' should be number, got ${typeof result.totalTestsPassed}`);
    }

    if (typeof result.totalTests !== 'number') {
      issues.push(`'totalTests' should be number, got ${typeof result.totalTests}`);
    }

    // Validate test results array
    if (!Array.isArray(result.testResults)) {
      issues.push(`'testResults' should be array, got ${typeof result.testResults}`);
    } else {
      if (result.testResults.length !== originalTestCases.length) {
        issues.push(`Expected ${originalTestCases.length} test results, got ${result.testResults.length}`);
      }
    }

    // Validate counts are consistent
    if (result.totalTests !== originalTestCases.length) {
      issues.push(`totalTests (${result.totalTests}) doesn't match original test cases (${originalTestCases.length})`);
    }

    // Validate totalTestsPassed matches actual passed tests
    if (result.testResults && Array.isArray(result.testResults)) {
      const actualPassedCount = result.testResults.filter(test => test.passed).length;
      if (result.totalTestsPassed !== actualPassedCount) {
        issues.push(`totalTestsPassed (${result.totalTestsPassed}) doesn't match actual passed tests (${actualPassedCount})`);
      }
    }

    return issues;
  }

  // Validate individual test result structure
  validateIndividualTestResult(testResult, originalTestCase, index) {
    const issues = [];

    // Check required properties for each test result
    const requiredProps = ['testName', 'testCaseIndex', 'passed', 'actualOutput', 'expectedOutput'];
    requiredProps.forEach(prop => {
      if (!(prop in testResult)) {
        issues.push(`Test ${index}: Missing required property '${prop}'`);
      }
    });

    // Validate types
    if (typeof testResult.passed !== 'boolean') {
      issues.push(`Test ${index}: 'passed' should be boolean, got ${typeof testResult.passed}`);
    }

    if (typeof testResult.testCaseIndex !== 'number') {
      issues.push(`Test ${index}: 'testCaseIndex' should be number, got ${typeof testResult.testCaseIndex}`);
    }

    // Validate test case index matches
    if (testResult.testCaseIndex !== index) {
      issues.push(`Test ${index}: testCaseIndex (${testResult.testCaseIndex}) doesn't match expected index (${index})`);
    }

    // Validate test name exists
    if (!testResult.testName || typeof testResult.testName !== 'string') {
      issues.push(`Test ${index}: testName should be non-empty string`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Validate that output logic makes sense
  validateOutputLogic(testResult, originalTestCase) {
    try {
      // Parse the outputs for comparison
      let actualValue, expectedValue;
      
      try {
        actualValue = JSON.parse(testResult.actualOutput);
        expectedValue = JSON.parse(testResult.expectedOutput);
      } catch (parseError) {
        // If JSON parsing fails, compare as strings
        actualValue = testResult.actualOutput;
        expectedValue = testResult.expectedOutput;
      }

      // For passed tests, actual should equal expected
      if (testResult.passed) {
        // Deep equality check
        const isEqual = JSON.stringify(actualValue) === JSON.stringify(expectedValue);
        if (!isEqual) {
          return {
            isValid: false,
            reason: `Test marked as passed but outputs don't match: actual=${JSON.stringify(actualValue)}, expected=${JSON.stringify(expectedValue)}`
          };
        }

        // Also verify it matches the original test case
        const matchesOriginal = JSON.stringify(expectedValue) === JSON.stringify(originalTestCase.expected);
        if (!matchesOriginal) {
          return {
            isValid: false,
            reason: `Expected output doesn't match original test case: got=${JSON.stringify(expectedValue)}, original=${JSON.stringify(originalTestCase.expected)}`
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        reason: `Output validation error: ${error.message}`
      };
    }
  }

  // Validate overall results consistency
  validateOverallResults(result) {
    const issues = [];

    // Check if overallPassed is consistent with individual test results
    if (result.testResults && Array.isArray(result.testResults)) {
      const allPassed = result.testResults.every(test => test.passed);
      const anyPassed = result.testResults.some(test => test.passed);
      
      // overallPassed should be true only if ALL tests passed
      if (result.overallPassed && !allPassed) {
        issues.push(`overallPassed is true but not all tests passed`);
      }
      
      // If no tests passed, overallPassed should definitely be false
      if (!anyPassed && result.overallPassed) {
        issues.push(`overallPassed is true but no tests actually passed`);
      }
    }

    // Check for logical inconsistencies
    if (result.totalTestsPassed > result.totalTests) {
      issues.push(`totalTestsPassed (${result.totalTestsPassed}) exceeds totalTests (${result.totalTests})`);
    }

    if (result.totalTestsPassed < 0) {
      issues.push(`totalTestsPassed cannot be negative: ${result.totalTestsPassed}`);
    }

    if (result.totalTests < 0) {
      issues.push(`totalTests cannot be negative: ${result.totalTests}`);
    }

    // If success is false, there should be an error message
    if (!result.success && !result.executionError && !result.compilationError) {
      issues.push(`success is false but no error message provided`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  async testQuestionWithBadCode(questionData, badTestCode, testName) {
    try {
      if (!questionData.codeConfig || !questionData.testCases) {
        this.logTest(`${testName} - Bad Code Test`, false, 'Missing code config or test cases');
        return false;
      }

      console.log(`   🔍 Testing with intentionally bad code:\n${badTestCode.substring(0, 100)}...`);

      const result = await runCodeTests({
        code: badTestCode,
        language: questionData.language,
        testCases: questionData.testCases,
        runtime: questionData.codeConfig.runtime,
        entryFunction: questionData.codeConfig.entryFunction,
        timeoutMs: questionData.codeConfig.timeoutMs || 3000
      });

      console.log(`   📊 Bad Code Test Results: ${result.totalTestsPassed}/${result.totalTests} passed (should be low)`);

      // For bad code, we expect it to fail most test cases
      const shouldFail = !result.overallPassed;
      if (shouldFail) {
        this.logTest(`${testName} - Bad Code Test`, true, `Correctly failed with bad code (${result.totalTestsPassed}/${result.totalTests})`);
        return true;
      } else {
        this.logTest(`${testName} - Bad Code Test`, false, 'Bad code unexpectedly passed all tests');
        return false;
      }
    } catch (error) {
      // For truly bad code, we might expect execution errors - this is actually good
      this.logTest(`${testName} - Bad Code Test`, true, `Bad code correctly caused execution error: ${error.message}`);
      return true;
    }
  }

  async testFillInBlankGrading(questionData, answers, testName) {
    try {
      if (!questionData.blanks) {
        this.logTest(`${testName} - Fill-in-Blank Grading`, false, 'No blanks configuration');
        return false;
      }

      console.log(`   🔍 Testing with answers:`, JSON.stringify(answers, null, 2));

      const result = gradeFillInBlanks(answers, questionData.blanks);
      
      console.log(`   📊 Grading Results:`);
      console.log(`     Total Points: ${result.totalPoints}/${result.totalPossiblePoints}`);
      console.log(`     All Correct: ${result.allCorrect}`);
      
      if (result.results && result.results.length > 0) {
        result.results.forEach((blankResult) => {
          const icon = blankResult.isCorrect ? '✅' : '❌';
          console.log(`     ${icon} ${blankResult.blankId}: "${blankResult.answer}" (${blankResult.pointsEarned}/${blankResult.possiblePoints} pts)`);
        });
      }

      // For correct answers, we expect high scores; for incorrect, we expect low scores
      const isCorrectAnswerTest = testName.includes('Correct');
      const expectedPass = isCorrectAnswerTest ? result.allCorrect : !result.allCorrect;
      
      this.logTest(testName, expectedPass, 
        `Scored ${result.totalPoints}/${result.totalPossiblePoints} points (${result.allCorrect ? 'All Correct' : 'Some Incorrect'})`);
      
      return expectedPass;
    } catch (error) {
      this.logTest(`${testName} - Fill-in-Blank Grading`, false, `Grading error: ${error.message}`);
      return false;
    }
  }

  async testLanguageCategoryValidation() {
    console.log('\n🔍 Testing Language-Category Combinations...');
    
    const validCombinations = Question.getValidCombinations();
    let validationTests = 0;
    let validationPassed = 0;

    for (const [language, categories] of Object.entries(validCombinations)) {
      for (const category of categories) {
        validationTests++;
        
        const testQuestion = {
          type: 'codeChallenge',
          language,
          category,
          title: `Test ${language} ${category}`,
          description: 'Test question',
          difficulty: 'easy',
          codeConfig: {
            runtime: 'node',
            entryFunction: 'test'
          },
          testCases: [{ name: 'test', args: [], expected: true }]
        };

        const question = new Question(testQuestion);
        const isValid = question.isValidCombination();
        
        if (isValid) {
          validationPassed++;
        }
        
        this.logTest(`Language-Category: ${language}-${category}`, isValid);
      }
    }

    console.log(`\n📊 Language-Category Validation: ${validationPassed}/${validationTests} combinations valid`);
  }

  async runAllTests() {
    console.log('🚀 Starting Question Model Test Suite...\n');

    try {
      await this.connectDB();

      // Test 1: Multiple Choice
      console.log('📝 Testing Multiple Choice Questions...');
      await this.testQuestionValidation(TEST_CASES.multipleChoice, 'Multiple Choice');

      // Test 2: True/False
      console.log('\n📝 Testing True/False Questions...');
      await this.testQuestionValidation(TEST_CASES.trueFalse, 'True/False');

      // Test 3: Fill in the Blank - UI
      console.log('\n📝 Testing Fill-in-the-Blank (UI) Questions...');
      await this.testQuestionValidation(TEST_CASES.fillInBlankUI, 'Fill-in-Blank UI');
      await this.testFillInBlankGrading(
        TEST_CASES.fillInBlankUI, 
        TEST_CODE_SAMPLES.fillInBlankAnswers.correct, 
        'Fill-in-Blank UI - Correct'
      );
      await this.testFillInBlankGrading(
        TEST_CASES.fillInBlankUI, 
        TEST_CODE_SAMPLES.fillInBlankAnswers.incorrect, 
        'Fill-in-Blank UI - Incorrect'
      );

      // Test 4: Fill in the Blank - CSS
      console.log('\n📝 Testing Fill-in-the-Blank (CSS) Questions...');
      await this.testQuestionValidation(TEST_CASES.fillInBlankCSS, 'Fill-in-Blank CSS');
      await this.testFillInBlankGrading(
        TEST_CASES.fillInBlankCSS, 
        TEST_CODE_SAMPLES.cssFlexboxAnswers.correct, 
        'Fill-in-Blank CSS - Correct'
      );
      await this.testFillInBlankGrading(
        TEST_CASES.fillInBlankCSS, 
        TEST_CODE_SAMPLES.cssFlexboxAnswers.incorrect, 
        'Fill-in-Blank CSS - Incorrect'
      );

      // Test 5: JavaScript Code Challenge
      console.log('\n📝 Testing JavaScript Code Challenge...');
      await this.testQuestionValidation(TEST_CASES.codeChallenge, 'JavaScript Code Challenge');
      await this.testCodeExecution(
        TEST_CASES.codeChallenge, 
        TEST_CODE_SAMPLES.correct.addNumbers, 
        'JavaScript Code Challenge'
      );
      await this.testQuestionWithBadCode(
        TEST_CASES.codeChallenge, 
        TEST_CODE_SAMPLES.incorrect.addNumbers, 
        'JavaScript Code Challenge'
      );

      // Test 6: Python Code Challenge
      console.log('\n📝 Testing Python Code Challenge...');
      await this.testQuestionValidation(TEST_CASES.pythonCodeChallenge, 'Python Code Challenge');
      await this.testCodeExecution(
        TEST_CASES.pythonCodeChallenge, 
        TEST_CODE_SAMPLES.correct.find_max, 
        'Python Code Challenge'
      );
      await this.testQuestionWithBadCode(
        TEST_CASES.pythonCodeChallenge, 
        TEST_CODE_SAMPLES.incorrect.find_max, 
        'Python Code Challenge'
      );

      // Test 7: Code Debugging
      console.log('\n📝 Testing Code Debugging Questions...');
      await this.testQuestionValidation(TEST_CASES.codeDebugging, 'Code Debugging');
      // Test with the correct solution
      await this.testCodeExecution(
        TEST_CASES.codeDebugging, 
        TEST_CODE_SAMPLES.correct.sumArray, 
        'Code Debugging'
      );
      // Test with the buggy code (should fail)
      await this.testQuestionWithBadCode(
        TEST_CASES.codeDebugging, 
        TEST_CASES.codeDebugging.buggyCode, 
        'Code Debugging'
      );

      // Test 8: TypeScript Code Challenge
      console.log('\n📝 Testing TypeScript Code Challenge...');
      await this.testQuestionValidation(TEST_CASES.typescriptCodeChallenge, 'TypeScript Code Challenge');
      await this.testCodeExecution(
        TEST_CASES.typescriptCodeChallenge, 
        TEST_CODE_SAMPLES.correct.calculateCircleArea, 
        'TypeScript Code Challenge'
      );
      await this.testQuestionWithBadCode(
        TEST_CASES.typescriptCodeChallenge, 
        TEST_CODE_SAMPLES.incorrect.calculateCircleArea, 
        'TypeScript Code Challenge'
      );

      // Test 9: Language-Category Combinations
      await this.testLanguageCategoryValidation();

      // Final Results
      console.log('\n' + '='.repeat(50));
      console.log('📊 TEST RESULTS SUMMARY');
      console.log('='.repeat(50));
      console.log(`✅ Passed: ${this.results.passed}`);
      console.log(`❌ Failed: ${this.results.failed}`);
      console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

      if (this.results.errors.length > 0) {
        console.log('\n❌ Failed Tests:');
        this.results.errors.forEach(error => console.log(`   • ${error}`));
      }

      console.log('\n🎉 Question Model Test Suite Complete!');

    } catch (error) {
      console.error('💥 Test suite failed:', error);
    } finally {
      await this.disconnectDB();
    }
  }
}

// Run the test suite
if (require.main === module) {
  const tester = new QuestionModelTester();
  tester.runAllTests().catch(console.error);
}

module.exports = QuestionModelTester;