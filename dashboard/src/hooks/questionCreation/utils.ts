// src/hooks/questionCreation/utils.ts - FIXED VALIDATION
import type { WizardStep } from './types';
import type { CreateQuestionData, Language, QuestionCategory, QuestionType } from '../../types';

export const createInitialSteps = (): WizardStep[] => [
  {
    id: 1,
    name: 'basics',
    title: 'Question Basics',
    description: 'Language, category, and question type',
    isRequired: true,
    canSkip: false,
    isValid: false,
    isCompleted: false
  },
  {
    id: 2,
    name: 'content',
    title: 'Question Content',
    description: 'Title, description, and type-specific content',
    isRequired: true,
    canSkip: false,
    isValid: false,
    isCompleted: false
  },
  {
    id: 3,
    name: 'testcases',
    title: 'Test Cases',
    description: 'Create and validate test cases (code questions only)',
    isRequired: false,
    canSkip: true,
    isValid: true,
    isCompleted: false
  },
  {
    id: 4,
    name: 'review',
    title: 'Review & Save',
    description: 'Final review and save question',
    isRequired: true,
    canSkip: false,
    isValid: false,
    isCompleted: false
  }
];

export const createDuplicateCheckHash = (data: Partial<CreateQuestionData>): string => {
  return btoa(`${data.type}-${data.language}-${data.title}-${data.description}`);
};

export const createTestCasePrompt = (questionData: Partial<CreateQuestionData>): string => {
  const { language, type, title, description, codeConfig } = questionData;

  return `Create test cases for a ${language} ${type} question:

Title: ${title || 'Untitled Question'}
Description: ${description || 'No description provided'}
${codeConfig?.entryFunction ? `Function: ${codeConfig.entryFunction}` : ''}

Please provide test cases in this JSON format:
[
  {
    "name": "Basic test case",
    "args": [1, 2, 3],
    "expected": 6,
    "hidden": false
  }
]

Include:
- Basic functionality tests
- Edge cases (empty inputs, boundary conditions)  
- Error handling scenarios
- Hidden test cases for comprehensive validation`;
};

// ✅ FIXED: Updated validation function with proper parameter handling
export const validateStepContent = (
  step: number,
  selectedLanguage?: Language,
  selectedCategory?: QuestionCategory,
  selectedQuestionType?: QuestionType,
  questionData?: Partial<CreateQuestionData>,
  testCases?: any[],
  testValidation?: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  switch (step) {
    case 1: // ✅ FIXED: Step 1 validation - Basics
      
      if (!selectedLanguage) {
        errors.push('Language is required');
      }
      if (!selectedCategory) {
        errors.push('Category is required');
      }
      if (!selectedQuestionType) {
        errors.push('Question type is required');
      }

      break;

    case 2: // Content
      
      if (!questionData?.title?.trim()) {
        errors.push('Title is required');
      }
      if (!questionData?.description?.trim()) {
        errors.push('Description is required');
      }

      // Type-specific validation - only check if questionData exists
      if (questionData && selectedQuestionType) {
        switch (selectedQuestionType) {
          case 'multipleChoice':
            if (!questionData.options || questionData.options.length < 2) {
              errors.push('At least 2 options required');
            }
            if (typeof questionData.correctAnswer !== 'number') {
              errors.push('Correct answer is required');
            }
            break;
          case 'trueFalse':
            if (typeof questionData.correctAnswer !== 'boolean') {
              errors.push('True/False answer is required');
            }
            break;
          case 'fillInTheBlank':
            if (!questionData.codeTemplate?.trim()) {
              errors.push('Code template is required');
            }
            if (!questionData.blanks || questionData.blanks.length === 0) {
              errors.push('At least one blank is required');
            }
            break;
          case 'codeChallenge':
            if (selectedCategory === 'logic') {
              if (!questionData.codeConfig?.entryFunction) {
                errors.push('Entry function is required');
              }
            }
            break;
          case 'codeDebugging':
            if (!questionData.buggyCode?.trim()) {
              errors.push('Buggy code is required');
            }
            break;
        }
      }
      break;

    case 3: // Test Cases
      
      const requiresTestCases = selectedQuestionType === 'codeChallenge' && selectedCategory === 'logic';
      if (requiresTestCases) {
        if (!testCases || testCases.length === 0) {
          errors.push('At least one test case is required');
        } else {
          if (testCases.every(tc => tc.hidden)) {
            errors.push('At least one test case should be visible to students');
          }
          if (testValidation?.results?.length > 0 && !testValidation?.allPassed) {
            errors.push('Test cases must pass validation');
          }
        }
      }
      break;

    case 4: // Review - validation handled elsewhere
      // Review step validation is handled by getSaveValidationErrors
      break;
  }

  const result = {
    isValid: errors.length === 0,
    errors
  };

  return result;
};