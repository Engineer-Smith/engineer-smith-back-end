// src/services/questionSubmissionService.ts - Clean question data before sending to backend

import type { CreateQuestionData } from '../types';
import { cleanFillInBlankStructure } from '../utils/fillInBlankValidation';

/**
 * Clean and prepare question data for backend submission
 * Ensures data structure matches backend expectations exactly
 */
export const prepareQuestionForSubmission = (questionData: Partial<CreateQuestionData>): CreateQuestionData => {
  // Start with a clean copy
  let cleanedData = { ...questionData } as CreateQuestionData;

  // 1. Fill-in-blank specific cleanup
  if (cleanedData.type === 'fillInTheBlank') {
    cleanedData = cleanFillInBlankStructure(cleanedData);
  }

  // 2. Remove empty/undefined fields to match backend expectations
  cleanedData = removeEmptyFields(cleanedData);

  // 3. Type-specific cleanup
  cleanedData = cleanTypeSpecificFields(cleanedData);

  // 4. Ensure required fields have proper defaults
  cleanedData = ensureRequiredDefaults(cleanedData);

  return cleanedData;
};

/**
 * Remove empty/undefined fields that shouldn't be sent to backend
 */
const removeEmptyFields = (data: CreateQuestionData): CreateQuestionData => {
  const cleaned = { ...data };

  // Remove empty arrays and undefined values, but preserve empty strings for code fields
  Object.keys(cleaned).forEach(key => {
    const value = (cleaned as any)[key];

    if (value === undefined || value === null) {
      delete (cleaned as any)[key];
    } else if (Array.isArray(value) && value.length === 0) {
      // Don't delete empty arrays for code fields that might need them
      const codeFields = ['testCases', 'blanks', 'options', 'dragOptions'];
      if (!codeFields.includes(key)) {
        delete (cleaned as any)[key];
      }
    } else if (typeof value === 'string' && value.trim() === '') {
      // Don't delete empty strings for code template fields
      const preserveEmptyString = ['codeTemplate', 'buggyCode', 'solutionCode'];
      if (!preserveEmptyString.includes(key)) {
        delete (cleaned as any)[key];
      }
    }
  });

  return cleaned;
};

/**
 * Clean type-specific fields based on question type
 */
const cleanTypeSpecificFields = (data: CreateQuestionData): CreateQuestionData => {
  const cleaned = { ...data };

  switch (data.type) {
    case 'multipleChoice':
      // Keep only relevant fields for multiple choice
      delete cleaned.codeTemplate;
      delete cleaned.blanks;
      delete cleaned.testCases;
      delete cleaned.codeConfig;
      delete cleaned.buggyCode;
      delete cleaned.solutionCode;
      delete cleaned.dragOptions;

      // Ensure options is an array of non-empty strings
      if (cleaned.options) {
        cleaned.options = cleaned.options
          .map(option => option.trim())
          .filter(option => option.length > 0);
      }
      break;

    case 'trueFalse':
      // Keep options for true/false questions (they need ['True', 'False'])
      delete cleaned.codeTemplate;
      delete cleaned.blanks;
      delete cleaned.testCases;
      delete cleaned.codeConfig;
      delete cleaned.buggyCode;
      delete cleaned.solutionCode;
      delete cleaned.dragOptions;

      // Ensure options is set to ['True', 'False'] if not already
      if (!cleaned.options) {
        cleaned.options = ['True', 'False'];
      }
      break;

    case 'fillInTheBlank':
      // Keep only relevant fields for fill-in-blank
      delete cleaned.options;
      delete cleaned.testCases;
      delete cleaned.buggyCode;
      delete cleaned.solutionCode;
      delete cleaned.dragOptions;

      // Ensure codeTemplate is preserved (even if empty)
      if (cleaned.codeTemplate !== undefined) {
        cleaned.codeTemplate = cleaned.codeTemplate; // Keep as-is, don't trim aggressively
      }
      break;

    case 'dragDropCloze':
      // Keep only relevant fields for drag-drop cloze
      delete cleaned.options;
      delete cleaned.testCases;
      delete cleaned.codeConfig;
      delete cleaned.buggyCode;
      delete cleaned.solutionCode;

      // Keep: codeTemplate, blanks, dragOptions, category
      break;

    case 'codeChallenge':
      // FIXED: Don't delete codeTemplate! Code challenges need templates
      delete cleaned.options;
      delete cleaned.blanks;
      delete cleaned.dragOptions;
      // Keep: codeTemplate, testCases, codeConfig
      // Don't need: buggyCode, solutionCode (those are for debugging)
      delete cleaned.buggyCode;
      delete cleaned.solutionCode;

      // Clean test cases but keep them
      if (cleaned.testCases) {
        cleaned.testCases = cleaned.testCases.filter(testCase =>
          testCase.args !== undefined && testCase.expected !== undefined
        );
      }
      break;

    case 'codeDebugging':
      // Keep only relevant fields for code debugging
      delete cleaned.options;
      delete cleaned.blanks;
      delete cleaned.dragOptions;
      // Don't delete codeTemplate - debugging questions might need it too

      // Only delete test cases if NOT a logic question
      if (cleaned.category !== 'logic') {
        delete cleaned.testCases;
      } else {
        // Clean test cases for logic debugging questions
        if (cleaned.testCases) {
          cleaned.testCases = cleaned.testCases.filter(testCase =>
            testCase.args !== undefined && testCase.expected !== undefined
          );
        }
      }

      // Preserve buggy code and solution code (even if empty strings)
      break;
  }

  return cleaned;
};

/**
 * Ensure required fields have proper defaults
 */
const ensureRequiredDefaults = (data: CreateQuestionData): CreateQuestionData => {
  const cleaned = { ...data };

  // Default status to 'draft' if not specified
  if (!cleaned.status) {
    cleaned.status = 'draft';
  }

  // Ensure tags is an array
  if (!cleaned.tags) {
    cleaned.tags = [];
  } else {
    // Remove empty tags
    cleaned.tags = cleaned.tags.filter(tag => tag && tag.trim() !== '');
  }

  return cleaned;
};

/**
 * Validate required fields before submission
 */
export const validateRequiredFieldsForSubmission = (data: CreateQuestionData): {
  isValid: boolean;
  missingFields: string[]
} => {
  const missingFields: string[] = [];

  // Universal required fields
  if (!data.title?.trim()) missingFields.push('title');
  if (!data.description?.trim()) missingFields.push('description');
  if (!data.type) missingFields.push('type');
  if (!data.language) missingFields.push('language');
  if (!data.difficulty) missingFields.push('difficulty');

  // Category required for code questions
  const codeTypes = ['codeChallenge', 'fillInTheBlank', 'codeDebugging'];
  if (codeTypes.includes(data.type) && !data.category) {
    missingFields.push('category');
  }

  // Type-specific required fields
  switch (data.type) {
    case 'multipleChoice':
      if (!data.options || data.options.length < 2) missingFields.push('options (at least 2)');
      if (typeof data.correctAnswer !== 'number') missingFields.push('correctAnswer');
      break;

    case 'trueFalse':
      // For true/false, correctAnswer should be 0 (True) or 1 (False)
      if (typeof data.correctAnswer !== 'number' || (data.correctAnswer !== 0 && data.correctAnswer !== 1)) {
        missingFields.push('correctAnswer');
      }
      // Ensure options is ['True', 'False']
      if (!data.options || !Array.isArray(data.options) || data.options.length !== 2) {
        missingFields.push('options');
      }
      break;

    case 'fillInTheBlank':
      if (!data.codeTemplate?.trim()) missingFields.push('codeTemplate');
      if (!data.blanks || data.blanks.length === 0) missingFields.push('blanks');
      break;

    case 'codeChallenge':
      // FIXED: codeTemplate is typically required for code challenges
      if (!data.codeTemplate?.trim()) missingFields.push('codeTemplate');
      if (data.category === 'logic') {
        if (!data.codeConfig?.entryFunction) missingFields.push('codeConfig.entryFunction');
        if (!data.testCases || data.testCases.length === 0) missingFields.push('testCases');
      }
      break;

    case 'codeDebugging':
      if (!data.buggyCode?.trim()) missingFields.push('buggyCode');
      if (!data.solutionCode?.trim()) missingFields.push('solutionCode');
      break;
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Helper to create submission-ready question data
 */
export const createSubmissionReadyQuestion = (
  rawQuestionData: Partial<CreateQuestionData>
): {
  success: boolean;
  data?: CreateQuestionData;
  errors: string[]
} => {
  try {
    // Clean and prepare the data
    const cleanedData = prepareQuestionForSubmission(rawQuestionData);

    // Validate required fields
    const validation = validateRequiredFieldsForSubmission(cleanedData);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.missingFields.map(field => `Missing required field: ${field}`)
      };
    }

    return {
      success: true,
      data: cleanedData,
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error during data preparation']
    };
  }
};