// utils/seedValidator.js - Enhanced with fill-in-blank auto-grading validation
const Question = require('../models/Question');
const { runCodeTests, validateGradingConfig } = require('../services/grading');
const { gradeFillInBlanks, validateFillInBlankConfig } = require('../services/grading/fillInBlankGrader');
const QuestionTemplateGenerator = require('./questionTemplate');

class QuestionSeedValidator {
  constructor() {
    this.validationStats = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
  }

  /**
   * Validates a single question before seeding
   */
  async validateQuestion(questionData, options = {}) {
    this.validationStats.total++;

    const result = {
      success: false,
      errors: [],
      warnings: [],
      questionTitle: questionData.title || 'Unknown'
    };

    try {
      // 1. Schema validation
      const schemaValidation = this.validateSchema(questionData);
      if (!schemaValidation.success) {
        result.errors.push(...schemaValidation.errors);
      }

      // 2. Type-specific validation
      const typeValidation = this.validateQuestionType(questionData);
      if (!typeValidation.success) {
        result.errors.push(...typeValidation.errors);
      }

      // 3. Auto-grading validation (if applicable and enabled)
      if (options.testAutoGrading !== false && this.requiresAutoGrading(questionData)) {
        const gradingValidation = await this.validateAutoGrading(questionData);
        if (!gradingValidation.success) {
          result.errors.push(...gradingValidation.errors);
        }
        result.warnings.push(...gradingValidation.warnings);
      }

      // ✅ NEW: 4. Fill-in-blank grading validation
      if (options.testAutoGrading !== false && this.requiresFillInBlankGrading(questionData)) {
        const fillInBlankValidation = await this.validateFillInBlankGrading(questionData);
        if (!fillInBlankValidation.success) {
          result.errors.push(...fillInBlankValidation.errors);
        }
        result.warnings.push(...fillInBlankValidation.warnings);
      }

      // 5. Data consistency checks
      const consistencyValidation = this.validateDataConsistency(questionData);
      if (!consistencyValidation.success) {
        result.errors.push(...consistencyValidation.errors);
      }
      result.warnings.push(...consistencyValidation.warnings);

      result.success = result.errors.length === 0;

      if (result.success) {
        this.validationStats.passed++;
      } else {
        this.validationStats.failed++;
        this.validationStats.errors.push({
          title: questionData.title,
          errors: result.errors
        });
      }

      if (result.warnings.length > 0) {
        this.validationStats.warnings++;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Validation error: ${error.message}`);
      this.validationStats.failed++;
    }

    return result;
  }

  /**
   * Checks if question requires auto-grading validation (code execution)
   */
  requiresAutoGrading(questionData) {
    return (questionData.type === 'codeChallenge' || questionData.type === 'codeDebugging') &&
      questionData.category === 'logic' &&
      questionData.testCases &&
      questionData.testCases.length > 0;
  }

  /**
   * ✅ NEW: Checks if question requires fill-in-blank grading validation
   */
  requiresFillInBlankGrading(questionData) {
    return questionData.type === 'fillInTheBlank' &&
      questionData.blanks &&
      Array.isArray(questionData.blanks) &&
      questionData.blanks.length > 0;
  }

  /**
   * ✅ NEW: Validates fill-in-blank grading functionality
   */
  async validateFillInBlankGrading(questionData) {
    const errors = [];
    const warnings = [];

    if (!this.requiresFillInBlankGrading(questionData)) {
      return { success: true, errors, warnings };
    }

    try {
      console.log(`    🧪 Testing fill-in-blank grading for "${questionData.title}"...`);

      // 1. Validate blanks configuration structure
      try {
        validateFillInBlankConfig(questionData.blanks);
        console.log(`    ✅ Blanks configuration valid`);
      } catch (configError) {
        errors.push(`Fill-in-blank configuration error: ${configError.message}`);
        console.log(`    ❌ Configuration invalid: ${configError.message}`);
        return { success: false, errors, warnings };
      }

      // 2. Test with correct answers
      const correctAnswers = this.generateCorrectAnswers(questionData.blanks);
      const correctResult = gradeFillInBlanks(correctAnswers, questionData.blanks);

      console.log(`    📊 Correct Answers Test:`);
      console.log(`      Points: ${correctResult.totalPoints}/${correctResult.totalPossiblePoints}`);
      console.log(`      All Correct: ${correctResult.allCorrect}`);

      if (!correctResult.allCorrect) {
        errors.push('Correct answers test failed - grading logic may be broken');
        console.log(`    ❌ Correct answers should pass but didn't`);
      } else {
        console.log(`    ✅ Correct answers passed`);
      }

      // 3. Test with incorrect answers
      const incorrectAnswers = this.generateIncorrectAnswers(questionData.blanks);
      const incorrectResult = gradeFillInBlanks(incorrectAnswers, questionData.blanks);

      console.log(`    📊 Incorrect Answers Test:`);
      console.log(`      Points: ${incorrectResult.totalPoints}/${incorrectResult.totalPossiblePoints}`);
      console.log(`      All Correct: ${incorrectResult.allCorrect}`);

      if (incorrectResult.allCorrect) {
        warnings.push('Incorrect answers test passed - check if correct answers are too permissive');
        console.log(`    ⚠️ Incorrect answers unexpectedly passed`);
      } else {
        console.log(`    ✅ Incorrect answers correctly failed`);
      }

      // 4. Test with empty answers
      const emptyResult = gradeFillInBlanks({}, questionData.blanks);
      if (emptyResult.allCorrect || emptyResult.totalPoints > 0) {
        warnings.push('Empty answers received points - check blank configuration');
        console.log(`    ⚠️ Empty answers got ${emptyResult.totalPoints} points`);
      } else {
        console.log(`    ✅ Empty answers correctly scored 0`);
      }

      // 5. Test case sensitivity if applicable
      this.testCaseSensitivity(questionData.blanks, warnings);

      // 6. Validate point distribution
      this.validatePointDistribution(questionData.blanks, warnings);

    } catch (error) {
      errors.push(`Fill-in-blank grading test error: ${error.message}`);
      console.log(`    ❌ Grading test failed: ${error.message}`);
    }

    return { success: errors.length === 0, errors, warnings };
  }

  /**
   * ✅ NEW: Generate correct answers for testing
   */
  generateCorrectAnswers(blanks) {
    const answers = {};
    blanks.forEach(blank => {
      if (blank.correctAnswers && blank.correctAnswers.length > 0) {
        // Use the first correct answer for testing
        answers[blank.id] = blank.correctAnswers[0];
      }
    });
    return answers;
  }

  /**
   * ✅ NEW: Generate incorrect answers for testing
   */
  generateIncorrectAnswers(blanks) {
    const answers = {};
    blanks.forEach(blank => {
      // Use obviously wrong answers
      answers[blank.id] = 'WRONG_ANSWER_TEST_' + Math.random();
    });
    return answers;
  }

  /**
   * ✅ NEW: Test case sensitivity settings
   */
  testCaseSensitivity(blanks, warnings) {
    blanks.forEach(blank => {
      if (blank.caseSensitive !== false && blank.correctAnswers) {
        // Check if answers have mixed case but case sensitivity is on
        const hasLowercase = blank.correctAnswers.some(ans =>
          typeof ans === 'string' && ans !== ans.toUpperCase()
        );
        const hasUppercase = blank.correctAnswers.some(ans =>
          typeof ans === 'string' && ans !== ans.toLowerCase()
        );

        if (hasLowercase && hasUppercase) {
          warnings.push(`Blank "${blank.id}" has mixed case answers but case sensitivity is enabled`);
        }
      }
    });
  }

  /**
   * ✅ NEW: Validate point distribution makes sense
   */
  validatePointDistribution(blanks, warnings) {
    const totalPoints = blanks.reduce((sum, blank) => sum + (blank.points || 1), 0);
    const avgPoints = totalPoints / blanks.length;

    if (avgPoints < 1) {
      warnings.push(`Average points per blank is ${avgPoints.toFixed(2)} - consider increasing point values`);
    }

    // Check for uneven point distribution
    const pointValues = blanks.map(blank => blank.points || 1);
    const maxPoints = Math.max(...pointValues);
    const minPoints = Math.min(...pointValues);

    if (maxPoints > minPoints * 3) {
      warnings.push(`Large point variation detected (${minPoints}-${maxPoints}) - ensure this is intentional`);
    }
  }

  /**
   * Validates auto-grading functionality for logic questions
   */
  async validateAutoGrading(questionData) {
    const errors = [];
    const warnings = [];

    if (!this.requiresAutoGrading(questionData)) {
      return { success: true, errors, warnings };
    }

    try {
      // Validate grading configuration
      validateGradingConfig({
        runtime: questionData.codeConfig.runtime,
        language: questionData.language,
        testCases: questionData.testCases
      });

      // Test with solution code (for debugging questions)
      if (questionData.type === 'codeDebugging' && questionData.solutionCode) {
        console.log(`    🧪 Testing solution code for "${questionData.title}"...`);

        const testResult = await runCodeTests({
          code: questionData.solutionCode,
          language: questionData.language,
          testCases: questionData.testCases,
          runtime: questionData.codeConfig.runtime,
          entryFunction: questionData.codeConfig.entryFunction,
          timeoutMs: questionData.codeConfig.timeoutMs || 3000
        });

        // Check for complete failure
        if (!testResult.success) {
          const errorMsg = testResult.error || testResult.executionError || 'Unknown test execution error';
          errors.push(`Auto-grading execution failed: ${errorMsg}`);
          console.log(`    ❌ Execution failed: ${errorMsg}`);
        }
        // Check if overall test suite passed
        else if (!testResult.overallPassed) {
          errors.push(`Solution code does not pass all test cases (${testResult.totalTestsPassed}/${testResult.totalTests} passed)`);
          console.log(`    ❌ Tests failed: ${testResult.totalTestsPassed}/${testResult.totalTests} passed`);
        } else {
          console.log(`    ✅ All tests passed: ${testResult.totalTestsPassed}/${testResult.totalTests}`);
        }
      }

      // For code challenges, validate test case structure
      if (questionData.type === 'codeChallenge') {
        try {
          QuestionTemplateGenerator.validateAndConvertTestCases(questionData.testCases);
          console.log(`    ✅ Test case structure valid for "${questionData.title}"`);
        } catch (error) {
          errors.push(`Test case validation failed: ${error.message}`);
          console.log(`    ❌ Test case structure invalid: ${error.message}`);
        }
      }

    } catch (error) {
      errors.push(`Auto-grading setup error: ${error.message}`);
      console.log(`    ❌ Setup error: ${error.message}`);
    }

    return { success: errors.length === 0, errors, warnings };
  }

  /**
   * Validates basic schema requirements
   */
  validateSchema(questionData) {
    const errors = [];

    // Required fields
    const requiredFields = ['title', 'description', 'type', 'language', 'difficulty'];
    for (const field of requiredFields) {
      if (!questionData[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Enum validations
    const validTypes = ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];
    if (questionData.type && !validTypes.includes(questionData.type)) {
      errors.push(`Invalid type: ${questionData.type}`);
    }

    const validLanguages = ['javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'];
    if (questionData.language && !validLanguages.includes(questionData.language)) {
      errors.push(`Invalid language: ${questionData.language}`);
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (questionData.difficulty && !validDifficulties.includes(questionData.difficulty)) {
      errors.push(`Invalid difficulty: ${questionData.difficulty}`);
    }

    // Category validation for code questions
    if (['codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(questionData.type)) {
      if (!questionData.category) {
        errors.push('Category is required for code questions');
      } else {
        const validCombinations = QuestionTemplateGenerator.getValidCombinations();
        const validCategories = validCombinations[questionData.language] || [];
        if (!validCategories.includes(questionData.category)) {
          errors.push(`Invalid category '${questionData.category}' for language '${questionData.language}'`);
        }
      }
    }

    // Tags validation
    if (questionData.tags && questionData.tags.length > 0) {
      try {
        QuestionTemplateGenerator.validateTags(questionData.tags);
      } catch (error) {
        errors.push(`Tag validation error: ${error.message}`);
      }
    }

    return { success: errors.length === 0, errors };
  }

  /**
   * Validates type-specific requirements
   */
  validateQuestionType(questionData) {
    const errors = [];
    const { type } = questionData;

    switch (type) {
      case 'multipleChoice':
        if (!questionData.options || !Array.isArray(questionData.options) || questionData.options.length < 2) {
          errors.push('Multiple choice questions need at least 2 options');
        }
        if (typeof questionData.correctAnswer !== 'number' || questionData.correctAnswer < 0) {
          errors.push('Multiple choice questions need a valid correctAnswer index');
        }
        if (questionData.correctAnswer >= (questionData.options?.length || 0)) {
          errors.push('correctAnswer index is out of bounds for options array');
        }
        break;

      case 'trueFalse':
        if (!questionData.options || questionData.options.length !== 2) {
          errors.push('True/false questions need exactly 2 options');
        }
        if (![0, 1].includes(questionData.correctAnswer)) {
          errors.push('True/false questions need correctAnswer to be 0 or 1');
        }
        break;

      case 'fillInTheBlank':
        if (!questionData.codeTemplate) {
          errors.push('Fill-in-blank questions need a codeTemplate');
        }
        if (!questionData.blanks || !Array.isArray(questionData.blanks) || questionData.blanks.length === 0) {
          errors.push('Fill-in-blank questions need blanks array');
        }
        // Enhanced blanks structure validation
        if (questionData.blanks) {
          questionData.blanks.forEach((blank, index) => {
            if (!blank.id || typeof blank.id !== 'string') {
              errors.push(`Blank at index ${index} needs a valid string id`);
            }
            if (!blank.correctAnswers || !Array.isArray(blank.correctAnswers) || blank.correctAnswers.length === 0) {
              errors.push(`Blank at index ${index} needs correctAnswers array with at least one answer`);
            }
            // Validate correct answers are strings
            if (blank.correctAnswers) {
              blank.correctAnswers.forEach((answer, answerIndex) => {
                if (typeof answer !== 'string') {
                  errors.push(`Blank "${blank.id}" correct answer ${answerIndex + 1} must be a string`);
                }
              });
            }
            // Validate points if specified
            if (blank.points !== undefined && (typeof blank.points !== 'number' || blank.points < 0)) {
              errors.push(`Blank "${blank.id}" points must be a non-negative number`);
            }
          });
        }
        break;

      case 'codeChallenge':
        if (questionData.category === 'logic') {
          if (!questionData.testCases || !Array.isArray(questionData.testCases) || questionData.testCases.length === 0) {
            errors.push('Logic code challenges need test cases');
          }

          // **NEW: SQL doesn't need entryFunction**
          if (questionData.language === 'sql') {
            if (!questionData.codeConfig || !questionData.codeConfig.runtime) {
              errors.push('SQL code challenges need codeConfig with runtime');
            }
          } else {
            if (!questionData.codeConfig || !questionData.codeConfig.entryFunction) {
              errors.push('Logic code challenges need codeConfig with entryFunction');
            }
          }
        }
        break;

      case 'codeDebugging':
        if (!questionData.buggyCode) {
          errors.push('Code debugging questions need buggyCode');
        }
        if (!questionData.solutionCode) {
          errors.push('Code debugging questions need solutionCode');
        }
        if (questionData.category === 'logic') {
          if (!questionData.testCases || !Array.isArray(questionData.testCases) || questionData.testCases.length === 0) {
            errors.push('Logic debugging questions need test cases');
          }
          if (questionData.language === 'sql') {
            if (!questionData.codeConfig || !questionData.codeConfig.runtime) {
              errors.push('SQL debugging questions need codeConfig with runtime');
            }
          } else {
            if (!questionData.codeConfig || !questionData.codeConfig.entryFunction) {
              errors.push('Logic debugging questions need codeConfig with entryFunction');
            }
          }
        }
        break;
    }

    return { success: errors.length === 0, errors };
  }

  /**
   * Validates data consistency and relationships
   */
  validateDataConsistency(questionData) {
    const errors = [];
    const warnings = [];

    // Check for reasonable content lengths
    if (questionData.title && questionData.title.length > 200) {
      warnings.push('Title is very long (>200 characters)');
    }

    if (questionData.description && questionData.description.length > 2000) {
      warnings.push('Description is very long (>2000 characters)');
    }

    // Check test case visibility (at least one should be visible)
    if (questionData.testCases && Array.isArray(questionData.testCases)) {
      const visibleTestCases = questionData.testCases.filter(tc => !tc.hidden);
      if (visibleTestCases.length === 0) {
        warnings.push('All test cases are hidden - consider making at least one visible for students');
      }
    }

    // Check for appropriate difficulty vs complexity
    if (questionData.type === 'codeChallenge' && questionData.difficulty === 'easy' &&
      questionData.testCases && questionData.testCases.length > 5) {
      warnings.push('Easy questions typically have fewer test cases');
    }

    return { success: errors.length === 0, errors, warnings };
  }

  /**
   * Validates a batch of questions
   */
  async validateBatch(questions, options = {}) {
    const results = [];
    const validQuestions = [];
    const invalidQuestions = [];

    console.log(`🔍 Validating ${questions.length} questions...`);
    console.log(`   Auto-grading enabled: ${options.testAutoGrading !== false}`);

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n📋 Question ${i + 1}/${questions.length}: "${question.title}"`);
      console.log(`   Type: ${question.type}, Language: ${question.language}${question.category ? `, Category: ${question.category}` : ''}`);

      const result = await this.validateQuestion(question, options);
      results.push(result);

      if (result.success) {
        validQuestions.push(question);
        console.log(`   ✅ Validation passed`);
      } else {
        invalidQuestions.push({ question, result });
        console.log(`   ❌ Validation failed: ${result.errors.join(', ')}`);
      }

      if (result.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${result.warnings.join(', ')}`);
      }
    }

    return {
      results,
      validQuestions,
      invalidQuestions,
      summary: {
        total: questions.length,
        valid: validQuestions.length,
        invalid: invalidQuestions.length,
        warnings: results.filter(r => r.warnings.length > 0).length
      }
    };
  }

  /**
   * Print validation summary
   */
  printValidationSummary() {
    console.log('\n📊 Validation Summary:');
    console.log(`   Total Questions: ${this.validationStats.total}`);
    console.log(`   ✅ Passed: ${this.validationStats.passed}`);
    console.log(`   ❌ Failed: ${this.validationStats.failed}`);
    console.log(`   ⚠️  With Warnings: ${this.validationStats.warnings}`);

    if (this.validationStats.errors.length > 0) {
      console.log('\n❌ Failed Questions:');
      this.validationStats.errors.forEach(error => {
        console.log(`   - ${error.title}: ${error.errors.join(', ')}`);
      });
    }
  }

  /**
   * Reset validation statistics
   */
  resetStats() {
    this.validationStats = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
  }
}

module.exports = QuestionSeedValidator;