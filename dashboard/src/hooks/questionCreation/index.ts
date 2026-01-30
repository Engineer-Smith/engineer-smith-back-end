// src/hooks/questionCreation/index.ts
// Main export file for question creation hooks

// Main hook
export { useQuestionCreation } from './useQuestionCreation';

// Individual hooks (for advanced use cases)
export { useQuestionWizard } from './useQuestionWizard';
export { useQuestionBuilder } from './useQuestionBuilder';
export { useTestCaseManager } from './useTestCaseManager';
export { useDuplicateChecker } from './useDuplicateChecker';
export { useOrganizationContext } from './useOrganizationContext';
export { useCodeConfig } from './useCodeConfig'; 

// Types and utilities
export type {
  QuestionCreationState,
  QuestionCreationAction,
  WizardStep,
  DuplicateQuestion
} from './types';

export { 
  createInitialSteps, 
  createDuplicateCheckHash, 
  createTestCasePrompt,
  validateStepContent
} from './utils';

export { questionCreationReducer, initialState } from './reducer';