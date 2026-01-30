// src/utils/fillInBlankValidation.ts - Ensure frontend structure matches backend exactly

import type { CreateQuestionData } from '../types';

export interface FillInBlankValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BlankStructureError {
  blankIndex: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * ✅ Validate fill-in-blank structure matches backend requirements EXACTLY
 */
export const validateFillInBlankStructure = (questionData: Partial<CreateQuestionData>): FillInBlankValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (questionData.type !== 'fillInTheBlank') {
    return { isValid: true, errors: [], warnings: [] };
  }

  // ✅ 1. Code template is required
  if (!questionData.codeTemplate?.trim()) {
    errors.push('Code template is required for fill-in-the-blank questions');
  }

  // ✅ 2. Blanks array is required
  if (!questionData.blanks || !Array.isArray(questionData.blanks)) {
    errors.push('Blanks array is required for fill-in-the-blank questions');
    return { isValid: false, errors, warnings };
  }

  // ✅ 3. At least one blank is required
  if (questionData.blanks.length === 0) {
    errors.push('At least one blank is required for fill-in-the-blank questions');
    return { isValid: false, errors, warnings };
  }

  // ✅ 4. Validate each blank structure
  questionData.blanks.forEach((blank, index) => {
    const blankErrors = validateIndividualBlankStructure(blank, index);
    errors.push(...blankErrors.errors);
    warnings.push(...blankErrors.warnings);
  });

  // ✅ 5. Check for blank count vs template placeholders
  const templateBlankCount = countTemplateBlankPlaceholders(questionData.codeTemplate || '');
  if (templateBlankCount !== questionData.blanks.length) {
    if (templateBlankCount > questionData.blanks.length) {
      errors.push(`Template has ${templateBlankCount} blank placeholders but only ${questionData.blanks.length} blanks configured`);
    } else {
      warnings.push(`Template has ${templateBlankCount} blank placeholders but ${questionData.blanks.length} blanks configured. Extra blanks will be ignored.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * ✅ Validate individual blank structure matches backend requirements
 */
const validateIndividualBlankStructure = (blank: any, index: number): { errors: string[], warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✅ Backend requirement: 'id' field is required
  if (!blank.id) {
    errors.push(`Blank ${index + 1}: 'id' field is required`);
  }

  // ✅ Backend requirement: 'correctAnswers' must be array with at least one answer
  if (!blank.correctAnswers || !Array.isArray(blank.correctAnswers)) {
    errors.push(`Blank ${index + 1}: 'correctAnswers' must be an array`);
  } else if (blank.correctAnswers.length === 0) {
    errors.push(`Blank ${index + 1}: At least one correct answer is required`);
  } else {
    // Check for empty answers
    const nonEmptyAnswers = blank.correctAnswers.filter((answer: string) => answer && answer.trim() !== '');
    if (nonEmptyAnswers.length === 0) {
      errors.push(`Blank ${index + 1}: At least one non-empty correct answer is required`);
    }
    if (nonEmptyAnswers.length < blank.correctAnswers.length) {
      warnings.push(`Blank ${index + 1}: Some correct answers are empty and will be ignored`);
    }
  }

  // ✅ Optional fields validation (these are optional in backend but should be proper types if provided)
  if (blank.caseSensitive !== undefined && typeof blank.caseSensitive !== 'boolean') {
    errors.push(`Blank ${index + 1}: 'caseSensitive' must be a boolean if provided`);
  }

  if (blank.points !== undefined) {
    if (typeof blank.points !== 'number' || blank.points < 0) {
      errors.push(`Blank ${index + 1}: 'points' must be a positive number if provided`);
    }
  }

  if (blank.hint !== undefined && typeof blank.hint !== 'string') {
    errors.push(`Blank ${index + 1}: 'hint' must be a string if provided`);
  }

  return { errors, warnings };
};

/**
 * ✅ Count blank placeholders in template (_____)
 */
const countTemplateBlankPlaceholders = (template: string): number => {
  const matches = template.match(/_____/g);
  return matches ? matches.length : 0;
};

/**
 * ✅ Clean blank structure before sending to backend
 */
export const cleanFillInBlankStructure = (questionData: CreateQuestionData): CreateQuestionData => {
  if (questionData.type !== 'fillInTheBlank' || !questionData.blanks) {
    return questionData;
  }

  return {
    ...questionData,
    blanks: questionData.blanks.map(blank => {
      // ✅ Clean the blank structure to match backend expectations exactly
      const cleanedBlank: any = {
        id: blank.id || `blank_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        correctAnswers: blank.correctAnswers
          .filter(answer => answer && answer.trim() !== '') // Remove empty answers
          .map(answer => answer.trim()) // Trim whitespace
      };

      // ✅ Only include optional fields if they have meaningful values
      if (typeof blank.caseSensitive === 'boolean') {
        cleanedBlank.caseSensitive = blank.caseSensitive;
      }

      if (blank.hint && blank.hint.trim()) {
        cleanedBlank.hint = blank.hint.trim();
      }

      if (typeof blank.points === 'number' && blank.points > 0) {
        cleanedBlank.points = blank.points;
      }

      return cleanedBlank;
    })
  };
};

/**
 * ✅ Generate blank IDs if missing
 */
export const ensureBlankIds = (blanks: any[]): any[] => {
  return blanks.map((blank, index) => ({
    ...blank,
    id: blank.id || `blank${index + 1}` // Use simple naming: blank1, blank2, etc.
  }));
};

/**
 * ✅ Validate template has proper blank placeholders
 */
export const validateTemplateFormat = (template: string): { isValid: boolean, errors: string[], suggestions: string[] } => {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (!template || !template.trim()) {
    errors.push('Code template cannot be empty');
    return { isValid: false, errors, suggestions };
  }

  const blankCount = countTemplateBlankPlaceholders(template);
  
  if (blankCount === 0) {
    errors.push('Template must contain at least one blank placeholder (_____)');
    suggestions.push('Use exactly 5 underscores (____) to mark where students should fill in answers');
  }

  // Check for common mistakes
  const underscorePatterns = template.match(/_+/g) || [];
  const invalidPatterns = underscorePatterns.filter(pattern => pattern !== '_____');
  
  if (invalidPatterns.length > 0) {
    suggestions.push('Use exactly 5 underscores (____) for blanks. Found patterns with different lengths.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
};

/**
 * ✅ Helper to create a properly structured blank
 */
export const createProperBlankStructure = (
  id?: string, 
  correctAnswers: string[] = [''], 
  caseSensitive: boolean = false,
  hint?: string,
  points: number = 1
) => {
  const blank: any = {
    id: id || `blank_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    correctAnswers: correctAnswers.filter(answer => answer.trim() !== ''),
    caseSensitive
  };

  if (hint && hint.trim()) {
    blank.hint = hint.trim();
  }

  if (points > 0) {
    blank.points = points;
  }

  return blank;
};