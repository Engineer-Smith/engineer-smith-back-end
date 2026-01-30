// src/services/questionValidationService.ts - Complete validation with business rules

import type { CreateQuestionData, QuestionType } from '../types';
import {
  getRequiredFieldsForTypeCategory,
  validateQuestionTypeCategory
} from '../utils/questionBusinessRules';

import type { BusinessRuleViolation } from '../utils/questionBusinessRules';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  businessRuleViolations: BusinessRuleViolation[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

/**
 * ✅ Comprehensive question validation with business rules
 */
export const validateCreateQuestionData = (questionData: Partial<CreateQuestionData>): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const businessRuleViolations: BusinessRuleViolation[] = [];

  // ✅ 1. Basic required fields
  if (!questionData.title?.trim()) {
    errors.push({
      field: 'title',
      message: 'Question title is required',
      code: 'TITLE_REQUIRED',
      severity: 'error'
    });
  }

  if (!questionData.description?.trim()) {
    errors.push({
      field: 'description',
      message: 'Question description is required',
      code: 'DESCRIPTION_REQUIRED',
      severity: 'error'
    });
  }

  if (!questionData.type) {
    errors.push({
      field: 'type',
      message: 'Question type is required',
      code: 'TYPE_REQUIRED',
      severity: 'error'
    });
  }

  if (!questionData.language) {
    errors.push({
      field: 'language',
      message: 'Programming language is required',
      code: 'LANGUAGE_REQUIRED',
      severity: 'error'
    });
  }

  if (!questionData.difficulty) {
    errors.push({
      field: 'difficulty',
      message: 'Difficulty level is required',
      code: 'DIFFICULTY_REQUIRED',
      severity: 'error'
    });
  }

  // ✅ 2. Business rule validation (if we have type and category)
  if (questionData.type && questionData.category) {
    const violations = validateQuestionTypeCategory(questionData.type, questionData.category);
    businessRuleViolations.push(...violations);

    // Convert business rule violations to errors/warnings
    violations.forEach(violation => {
      if (violation.severity === 'error') {
        errors.push({
          field: violation.field,
          message: violation.message,
          code: violation.code,
          severity: 'error'
        });
      } else {
        warnings.push({
          field: violation.field,
          message: violation.message + (violation.suggestion ? `. ${violation.suggestion}` : ''),
          code: violation.code,
          severity: 'warning'
        });
      }
    });
  }

  // ✅ 3. Category validation for code questions
  const codeTypes: QuestionType[] = ['codeChallenge', 'fillInTheBlank', 'codeDebugging'];
  if (questionData.type && codeTypes.includes(questionData.type)) {
    if (!questionData.category) {
      errors.push({
        field: 'category',
        message: 'Category is required for code-related questions',
        code: 'CATEGORY_REQUIRED_FOR_CODE',
        severity: 'error'
      });
    }
  }

  // ✅ 4. Type-specific validation
  if (questionData.type) {
    const typeErrors = validateTypeSpecificFields(questionData);
    errors.push(...typeErrors);
  }

  // ✅ 5. Required fields validation based on type/category
  if (questionData.type && questionData.category) {
    const requiredFieldsErrors = validateRequiredFields(questionData);
    errors.push(...requiredFieldsErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    businessRuleViolations
  };
};

/**
 * ✅ Validate type-specific fields
 */
const validateTypeSpecificFields = (questionData: Partial<CreateQuestionData>): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { type } = questionData;

  switch (type) {
    case 'multipleChoice':
      if (!questionData.options || questionData.options.length < 2) {
        errors.push({
          field: 'options',
          message: 'At least two answer options are required for multiple choice questions',
          code: 'MC_OPTIONS_REQUIRED',
          severity: 'error'
        });
      }
      if (typeof questionData.correctAnswer !== 'number') {
        errors.push({
          field: 'correctAnswer',
          message: 'Valid correct answer index is required for multiple choice questions',
          code: 'MC_CORRECT_ANSWER_REQUIRED',
          severity: 'error'
        });
      } else if (questionData.options && questionData.correctAnswer >= questionData.options.length) {
        errors.push({
          field: 'correctAnswer',
          message: 'Correct answer index is out of range',
          code: 'MC_CORRECT_ANSWER_OUT_OF_RANGE',
          severity: 'error'
        });
      }
      break;

    case 'trueFalse':
      if (typeof questionData.correctAnswer !== 'number' ||
        questionData.correctAnswer < 0 ||
        questionData.correctAnswer > 1) {
        errors.push({
          field: 'correctAnswer',
          message: 'Correct answer selection is required for true/false questions',
          code: 'TF_CORRECT_ANSWER_REQUIRED',
          severity: 'error'
        });
      }
      break;

    case 'fillInTheBlank':
      if (!questionData.codeTemplate?.trim()) {
        errors.push({
          field: 'codeTemplate',
          message: 'Code template is required for fill-in-the-blank questions',
          code: 'FIB_TEMPLATE_REQUIRED',
          severity: 'error'
        });
      }
      if (!questionData.blanks || questionData.blanks.length === 0) {
        errors.push({
          field: 'blanks',
          message: 'At least one blank is required for fill-in-the-blank questions',
          code: 'FIB_BLANKS_REQUIRED',
          severity: 'error'
        });
      } else {
        // Validate each blank
        questionData.blanks.forEach((blank, index) => {
          if (!blank.id) {
            errors.push({
              field: `blanks[${index}].id`,
              message: `Blank ${index + 1} must have an ID`,
              code: 'FIB_BLANK_ID_REQUIRED',
              severity: 'error'
            });
          }
          if (!blank.correctAnswers || blank.correctAnswers.length === 0) {
            errors.push({
              field: `blanks[${index}].correctAnswers`,
              message: `Blank ${index + 1} must have at least one correct answer`,
              code: 'FIB_BLANK_ANSWERS_REQUIRED',
              severity: 'error'
            });
          }
        });
      }
      break;

    case 'codeChallenge':
      // Logic category requires entry function and test cases
      if (questionData.category === 'logic') {
        if (!questionData.codeConfig?.entryFunction) {
          errors.push({
            field: 'codeConfig.entryFunction',
            message: 'Entry function name is required for logic code challenges',
            code: 'CC_ENTRY_FUNCTION_REQUIRED',
            severity: 'error'
          });
        }
        if (!questionData.testCases || questionData.testCases.length === 0) {
          errors.push({
            field: 'testCases',
            message: 'At least one test case is required for logic code challenges',
            code: 'CC_TEST_CASES_REQUIRED',
            severity: 'error'
          });
        } else {
          // Validate test cases
          questionData.testCases.forEach((testCase, index) => {
            if (!testCase.hasOwnProperty('args')) {
              errors.push({
                field: `testCases[${index}].args`,
                message: `Test case ${index + 1} must have args property`,
                code: 'CC_TEST_CASE_ARGS_REQUIRED',
                severity: 'error'
              });
            }
            if (!testCase.hasOwnProperty('expected')) {
              errors.push({
                field: `testCases[${index}].expected`,
                message: `Test case ${index + 1} must have expected property`,
                code: 'CC_TEST_CASE_EXPECTED_REQUIRED',
                severity: 'error'
              });
            }
          });
        }
      }
      break;

    case 'codeDebugging':
      if (!questionData.buggyCode?.trim()) {
        errors.push({
          field: 'buggyCode',
          message: 'Buggy code is required for code debugging questions',
          code: 'CD_BUGGY_CODE_REQUIRED',
          severity: 'error'
        });
      }
      if (!questionData.solutionCode?.trim()) {
        errors.push({
          field: 'solutionCode',
          message: 'Solution code is required for code debugging questions',
          code: 'CD_SOLUTION_CODE_REQUIRED',
          severity: 'error'
        });
      }
      break;
  }

  return errors;
};

/**
 * ✅ Validate required fields based on type/category combination
 */
const validateRequiredFields = (questionData: Partial<CreateQuestionData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!questionData.type || !questionData.category) return errors;

  const fieldRequirements = getRequiredFieldsForTypeCategory(
    questionData.type,
    questionData.category
  );

  // Check required fields
  fieldRequirements.required.forEach(fieldPath => {
    if (!getNestedValue(questionData, fieldPath)) {
      errors.push({
        field: fieldPath,
        message: `${formatFieldName(fieldPath)} is required for ${questionData.type} questions`,
        code: 'REQUIRED_FIELD_MISSING',
        severity: 'error'
      });
    }
  });

  // Check forbidden fields (should not be present)
  fieldRequirements.forbidden.forEach(fieldPath => {
    if (getNestedValue(questionData, fieldPath)) {
      errors.push({
        field: fieldPath,
        message: `${formatFieldName(fieldPath)} should not be used for ${questionData.type} questions`,
        code: 'FORBIDDEN_FIELD_PRESENT',
        severity: 'error'
      });
    }
  });

  return errors;
};

/**
 * ✅ Helper to get nested object value by path
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * ✅ Helper to format field names for display
 */
const formatFieldName = (fieldPath: string): string => {
  const fieldNames: Record<string, string> = {
    'codeConfig.entryFunction': 'Entry function name',
    'codeConfig.runtime': 'Runtime environment',
    'codeConfig.timeoutMs': 'Timeout duration',
    'testCases': 'Test cases',
    'codeTemplate': 'Code template',
    'blanks': 'Fill-in-the-blank configuration',
    'buggyCode': 'Buggy code',
    'solutionCode': 'Solution code',
    'options': 'Answer options',
    'correctAnswer': 'Correct answer'
  };

  return fieldNames[fieldPath] || fieldPath.replace(/([A-Z])/g, ' $1').toLowerCase();
};

/**
 * ✅ Quick validation for step navigation
 */
export const validateQuestionStep = (
  questionData: Partial<CreateQuestionData>,
  step: 'basics' | 'content' | 'testCases'
): boolean => {
  switch (step) {
    case 'basics':
      return !!(questionData.language && questionData.category && questionData.type);

    case 'content':
      const result = validateCreateQuestionData(questionData);
      return result.isValid || result.errors.filter(e => e.severity === 'error').length === 0;

    case 'testCases':
      if (questionData.type === 'codeChallenge' && questionData.category === 'logic') {
        return !!(questionData.testCases && questionData.testCases.length > 0);
      }
      return true;

    default:
      return true;
  }
};