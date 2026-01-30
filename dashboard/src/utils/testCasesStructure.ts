// src/utils/testCasesStructure.ts - Fixed to match backend schema exactly

import type { CodeConfig, Language, TestCase } from '../types';

export interface TestCaseTemplate {
  id: string;
  name: string;
  description: string;
  language: Language;
  args: any;
  expected: any;
  explanation?: string;
}

export interface TestCaseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  testCase: TestCase;
}

export interface TestSuiteValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  testCaseResults: TestCaseValidationResult[];
  coverage: {
    basicCases: number;
    edgeCases: number;
    errorCases: number;
  };
}

/**
 * TEST CASE BUILDER: Creates and validates test cases for logic questions
 */
export class TestCaseBuilder {
  
  /**
   * Create a new empty test case (backend compatible)
   */
  static createEmptyTestCase(): TestCase {
    return {
      name: 'Test case',
      args: [],
      expected: undefined,
      hidden: false
    };
  }

  /**
   * Create test case from template (backend compatible)
   */
  static createFromTemplate(template: TestCaseTemplate): TestCase {
    return {
      name: template.name,
      args: Array.isArray(template.args) ? [...template.args] : [template.args],
      expected: template.expected,
      hidden: false
    };
  }

  /**
   * VALIDATE: Single test case validation
   */
  static validateTestCase(
    testCase: TestCase, 
    index: number,
    language: Language,
    _entryFunction?: string
  ): TestCaseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // REQUIRED: args and expected properties
    if (!testCase.hasOwnProperty('args')) {
      errors.push(`Test case ${index + 1}: Missing 'args' property`);
    }

    if (!testCase.hasOwnProperty('expected')) {
      errors.push(`Test case ${index + 1}: Missing 'expected' property`);
    }

    // ARGS VALIDATION: Must be an array
    if (testCase.args !== undefined && !Array.isArray(testCase.args)) {
      errors.push(`Test case ${index + 1}: 'args' must be an array`);
    }

    // EXPECTED VALIDATION: Cannot be undefined for valid test
    if (testCase.expected === undefined && testCase.args !== undefined) {
      errors.push(`Test case ${index + 1}: 'expected' value is required`);
    }

    // TYPE CONSISTENCY: Check argument types
    if (Array.isArray(testCase.args) && testCase.args.length > 0) {
      const argTypes = testCase.args.map((arg: any) => typeof arg);
      const mixedTypes = [...new Set(argTypes)];
      
      if (mixedTypes.length > 2) { // Allow null/undefined as secondary type
        warnings.push(`Test case ${index + 1}: Mixed argument types may cause confusion`);
      }
    }

    // LANGUAGE-SPECIFIC: Validation based on language
    this.addLanguageSpecificValidation(testCase, index, language, errors, warnings);

    // EDGE CASES: Detect common test case patterns
    this.detectTestCasePatterns(testCase, index, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      testCase
    };
  }

  /**
   * VALIDATE: Complete test suite validation
   */
  static validateTestSuite(
    testCases: TestCase[],
    codeConfig: CodeConfig,
    language: Language
  ): TestSuiteValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const testCaseResults: TestCaseValidationResult[] = [];

    // MINIMUM REQUIREMENTS: At least one test case
    if (!testCases || testCases.length === 0) {
      errors.push('At least one test case is required for logic questions');
      return {
        isValid: false,
        errors,
        warnings,
        testCaseResults: [],
        coverage: { basicCases: 0, edgeCases: 0, errorCases: 0 }
      };
    }

    // ENTRY FUNCTION: Required for logic questions (except SQL)
    if (language !== 'sql' && !codeConfig.entryFunction) {
      errors.push('Entry function name is required for logic questions');
    }

    // RUNTIME: Required configuration
    if (!codeConfig.runtime) {
      errors.push('Runtime environment is required for logic questions');
    }

    // VALIDATE: Each individual test case
    let basicCases = 0;
    let edgeCases = 0;
    let errorCases = 0;

    for (let i = 0; i < testCases.length; i++) {
      const result = this.validateTestCase(testCases[i], i, language, codeConfig.entryFunction);
      testCaseResults.push(result);

      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }
      if (result.warnings.length > 0) {
        warnings.push(...result.warnings);
      }

      // CATEGORIZE: Test case types
      const category = this.categorizeTestCase(testCases[i]);
      switch (category) {
        case 'basic': basicCases++; break;
        case 'edge': edgeCases++; break;
        case 'error': errorCases++; break;
      }
    }

    // COVERAGE: Check test case coverage
    this.validateTestCoverage(basicCases, edgeCases, errorCases, warnings);

    // DUPLICATES: Check for duplicate test cases
    this.checkForDuplicateTests(testCases, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      testCaseResults,
      coverage: { basicCases, edgeCases, errorCases }
    };
  }

  /**
   * Language-specific validation rules
   */
  private static addLanguageSpecificValidation(
    testCase: TestCase,
    index: number,
    language: Language,
    _errors: string[],
    warnings: string[]
  ): void {
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        // JS/TS specific validations
        if (Array.isArray(testCase.args)) {
          testCase.args.forEach((arg: any, argIndex: number) => {
            if (typeof arg === 'function') {
              warnings.push(`Test case ${index + 1}, arg ${argIndex + 1}: Function arguments may not serialize properly`);
            }
          });
        }
        break;

      case 'python':
        // Python specific validations
        if (Array.isArray(testCase.args)) {
          testCase.args.forEach((arg: any, argIndex: number) => {
            if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
              // Check for dict-like structures
              const keys = Object.keys(arg);
              if (keys.length === 0) {
                warnings.push(`Test case ${index + 1}, arg ${argIndex + 1}: Empty objects may not behave as expected in Python`);
              }
            }
          });
        }
        break;

      case 'sql':
        // SQL specific validations
        warnings.push(`Test case ${index + 1}: SQL test cases require careful query result validation`);
        break;
    }
  }

  /**
   * Detect common test case patterns and provide warnings
   */
  private static detectTestCasePatterns(
    testCase: TestCase,
    index: number,
    warnings: string[]
  ): void {
    
    // EMPTY ARGS: Detect potential issues
    if (Array.isArray(testCase.args) && testCase.args.length === 0) {
      warnings.push(`Test case ${index + 1}: No arguments provided - ensure this is intended for the function`);
    }

    // LARGE NUMBERS: Performance considerations
    if (Array.isArray(testCase.args)) {
      const hasLargeNumbers = testCase.args.some((arg: any) => 
        typeof arg === 'number' && Math.abs(arg) > 1000000
      );
      if (hasLargeNumbers) {
        warnings.push(`Test case ${index + 1}: Large numbers may cause performance issues or timeout`);
      }
    }

    // COMPLEX OBJECTS: Serialization warnings
    if (Array.isArray(testCase.args)) {
      const hasComplexObjects = testCase.args.some((arg: any) => 
        typeof arg === 'object' && arg !== null && !Array.isArray(arg)
      );
      if (hasComplexObjects) {
        warnings.push(`Test case ${index + 1}: Complex objects should have consistent property ordering`);
      }
    }
  }

  /**
   * Categorize test case type
   */
  private static categorizeTestCase(testCase: TestCase): 'basic' | 'edge' | 'error' {
    if (!Array.isArray(testCase.args)) return 'basic';

    // EDGE CASES: Detect edge case patterns
    const hasNullUndefined = testCase.args.some((arg: any) => arg === null || arg === undefined);
    const hasEmptyCollections = testCase.args.some((arg: any) => 
      (Array.isArray(arg) && arg.length === 0) ||
      (typeof arg === 'string' && arg.length === 0) ||
      (typeof arg === 'object' && arg !== null && !Array.isArray(arg) && Object.keys(arg).length === 0)
    );
    const hasExtremeValues = testCase.args.some((arg: any) =>
      typeof arg === 'number' && (Math.abs(arg) > 10000 || arg === 0)
    );

    if (hasNullUndefined || hasEmptyCollections || hasExtremeValues) {
      return 'edge';
    }

    // ERROR CASES: Detect error-inducing patterns
    const hasInvalidTypes = testCase.args.some((arg: any) =>
      typeof arg === 'object' && arg !== null && arg.constructor === Object && Object.keys(arg).length === 0
    );

    if (hasInvalidTypes) {
      return 'error';
    }

    return 'basic';
  }

  /**
   * Validate test coverage and provide recommendations
   */
  private static validateTestCoverage(
    basicCases: number,
    edgeCases: number,
    errorCases: number,
    warnings: string[]
  ): void {
    
    const totalCases = basicCases + edgeCases + errorCases;

    // MINIMUM COVERAGE: Basic requirements
    if (basicCases === 0) {
      warnings.push('Consider adding basic test cases with typical inputs');
    }

    if (edgeCases === 0 && totalCases > 2) {
      warnings.push('Consider adding edge cases (empty inputs, boundary values, null/undefined)');
    }

    // BALANCE: Recommend balanced test suite
    if (totalCases >= 5) {
      const basicRatio = basicCases / totalCases;
      if (basicRatio < 0.3) {
        warnings.push('Consider adding more basic test cases to ensure core functionality works');
      }
      if (basicRatio > 0.8) {
        warnings.push('Consider adding more edge cases to test boundary conditions');
      }
    }

    // TOO MANY: Performance warning
    if (totalCases > 10) {
      warnings.push('Large number of test cases may slow down question testing - consider reducing to 5-8 key cases');
    }
  }

  /**
   * Check for duplicate test cases
   */
  private static checkForDuplicateTests(testCases: TestCase[], warnings: string[]): void {
    const seen = new Set<string>();
    const duplicates: number[] = [];

    testCases.forEach((testCase, index) => {
      const signature = JSON.stringify({ args: testCase.args, expected: testCase.expected });
      if (seen.has(signature)) {
        duplicates.push(index + 1);
      }
      seen.add(signature);
    });

    if (duplicates.length > 0) {
      warnings.push(`Duplicate test cases found at positions: ${duplicates.join(', ')}`);
    }
  }

  /**
   * TEMPLATES: Get common test case patterns for different languages
   */
  static getTestCaseTemplates(language: Language, functionType: 'algorithm' | 'data-processing' | 'utility'): TestCaseTemplate[] {
    const templates: TestCaseTemplate[] = [];

    switch (functionType) {
      case 'algorithm':
        templates.push(
          {
            id: 'basic-case',
            name: 'Basic Case',
            description: 'Standard input with expected output',
            language,
            args: [5],
            expected: 25,
            explanation: 'Basic functionality test'
          },
          {
            id: 'edge-zero',
            name: 'Zero Input',
            description: 'Test with zero as input',
            language,
            args: [0],
            expected: 0,
            explanation: 'Edge case: zero input'
          },
          {
            id: 'edge-negative',
            name: 'Negative Input',
            description: 'Test with negative input',
            language,
            args: [-3],
            expected: 9,
            explanation: 'Edge case: negative input'
          }
        );
        break;

      case 'data-processing':
        templates.push(
          {
            id: 'normal-array',
            name: 'Normal Array',
            description: 'Array with typical data',
            language,
            args: [[1, 2, 3, 4, 5]],
            expected: 15,
            explanation: 'Process normal array'
          },
          {
            id: 'empty-array',
            name: 'Empty Array',
            description: 'Empty array input',
            language,
            args: [[]],
            expected: 0,
            explanation: 'Edge case: empty array'
          },
          {
            id: 'single-element',
            name: 'Single Element',
            description: 'Array with one element',
            language,
            args: [[42]],
            expected: 42,
            explanation: 'Edge case: single element'
          }
        );
        break;

      case 'utility':
        templates.push(
          {
            id: 'valid-input',
            name: 'Valid Input',
            description: 'Standard valid input',
            language,
            args: ['hello'],
            expected: true,
            explanation: 'Normal case'
          },
          {
            id: 'invalid-input',
            name: 'Invalid Input',
            description: 'Invalid input test',
            language,
            args: [''],
            expected: false,
            explanation: 'Edge case: empty string'
          }
        );
        break;
    }

    return templates;
  }

  /**
   * GENERATOR: Auto-generate test cases based on function analysis
   */
  static generateSuggestedTestCases(
    _codeConfig: CodeConfig,
    language: Language,
    _functionHint?: string
  ): TestCase[] {
    const suggestions: TestCase[] = [];

    // BASIC: Always include basic positive case
    suggestions.push({
      name: 'Basic positive case',
      args: [1],
      expected: undefined, // User needs to fill this
      hidden: false
    });

    // EDGE: Zero/empty cases
    suggestions.push({
      name: 'Zero input edge case',
      args: [0],
      expected: undefined,
      hidden: false
    });

    // EDGE: Negative cases
    if (language !== 'sql') { // SQL typically doesn't handle negative indices
      suggestions.push({
        name: 'Negative input edge case',
        args: [-1],
        expected: undefined,
        hidden: false
      });
    }

    return suggestions;
  }
}

/**
 * REACT HOOK: For test case management in components
 */
export const useTestCaseBuilder = (_initialTestCases: TestCase[] = []) => {
  const addTestCase = () => TestCaseBuilder.createEmptyTestCase();
  
  const validateTestSuite = (testCases: TestCase[], codeConfig: CodeConfig, language: Language) => 
    TestCaseBuilder.validateTestSuite(testCases, codeConfig, language);
  
  const validateSingleTestCase = (testCase: TestCase, index: number, language: Language) =>
    TestCaseBuilder.validateTestCase(testCase, index, language);
  
  const getTemplates = (language: Language, type: 'algorithm' | 'data-processing' | 'utility') =>
    TestCaseBuilder.getTestCaseTemplates(language, type);
  
  const generateSuggestions = (codeConfig: CodeConfig, language: Language) =>
    TestCaseBuilder.generateSuggestedTestCases(codeConfig, language);

  return {
    addTestCase,
    validateTestSuite,
    validateSingleTestCase,
    getTemplates,
    generateSuggestions,
    createFromTemplate: TestCaseBuilder.createFromTemplate,
  };
};

/**
 * UTILITY: Test case formatting helpers
 */
export const formatTestCaseForDisplay = (testCase: TestCase, index: number): string => {
  const args = Array.isArray(testCase.args) 
    ? testCase.args.map((arg: any) => JSON.stringify(arg)).join(', ')
    : JSON.stringify(testCase.args);
  
  const expected = JSON.stringify(testCase.expected);
  
  return `Test ${index + 1}: f(${args}) → ${expected}`;
};

export const formatTestSuiteForPreview = (testCases: TestCase[]): string => {
  return testCases
    .map((testCase, index) => formatTestCaseForDisplay(testCase, index))
    .join('\n');
};