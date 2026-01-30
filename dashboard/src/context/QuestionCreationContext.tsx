// src/context/QuestionCreationContext.tsx - ENHANCED WITH EDIT SUPPORT
import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { 
  Question, 
  CreateQuestionData, 
  Language, 
  QuestionCategory, 
  QuestionType, 
  TestCase 
} from '../types';
import { useQuestionCreation as useQuestionCreationHook } from '../hooks/questionCreation';

// Re-export types for backward compatibility
export type {
  QuestionCreationState,
  QuestionCreationAction,
  WizardStep,
  DuplicateQuestion
} from '../hooks/questionCreation/types';

import type { 
  QuestionCreationState,  // Import the full state type
  QuestionCreationAction
} from '../hooks/questionCreation/types';

// Enhanced context type with all methods including cancel and edit support
interface QuestionCreationContextType {
  // State properties - properly exposed
  state: QuestionCreationState
  dispatch: React.Dispatch<QuestionCreationAction>;
  
  // Edit mode properties
  isEditMode: boolean;
  isDuplicateMode: boolean;
  originalQuestionId?: string;
  mode: 'create' | 'edit' | 'duplicate';
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  validateCurrentStep: () => boolean;
  isStepAccessible: (stepNumber: number) => boolean;
  getStepStatus: (stepNumber: number) => 'active' | 'completed' | 'invalid' | 'disabled';
  
  // Question Building
  setLanguage: (language: Language) => void;
  setCategory: (category: QuestionCategory) => void;
  setQuestionType: (type: QuestionType) => void;
  updateQuestionData: (data: Partial<CreateQuestionData>) => void;
  resetQuestionData: () => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  toggleAdvanced: () => void;
  togglePreview: () => void;
  
  // Duplicate Detection
  checkForDuplicates: () => Promise<void>;
  dismissDuplicateWarning: () => void;
  clearDuplicates: () => void;
  shouldCheckForDuplicates: () => boolean;
  hasDuplicates: boolean;
  
  // Test Cases
  addTestCase: (testCase: TestCase) => void;
  updateTestCase: (index: number, testCase: TestCase) => void;
  removeTestCase: (index: number) => void;
  setTestCases: (testCases: TestCase[]) => void;
  validateTestCases: (solutionCode?: string) => Promise<void>;
  createEmptyTestCase: () => TestCase;
  duplicateTestCase: (index: number) => void;
  isValidating: boolean;
  allTestsPassed: boolean;
  
  // Save methods
  saveQuestion: () => Promise<Question>;
  saveQuestionWithCallback: (onComplete?: (questionId: string, question: Question) => void) => Promise<Question>;
  canSaveQuestion: () => boolean;
  getSaveValidationErrors: () => string[];
  registerCompletionCallback: (callback: ((questionId: string, question: Question) => void) | null) => void;
  
  // Dynamic validation methods
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    hasErrors: boolean;
    hasWarnings: boolean;
    requiredFields: string[];
    optionalFields: string[];
  };
  isFieldRequired: (field: string) => boolean;
  getValidationWarnings: () => string[];
  getStepValidationErrors: (step: number) => string[];
  getAvailableQuestionTypesForCategory: () => Array<{
    type: QuestionType;
    available: boolean;
    reason?: string;
  }>;
  
  // Test case management methods
  validateTestSuite: () => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    testCaseResults: any[];
    coverage: {
      basicCases: number;
      edgeCases: number;
      errorCases: number;
    };
  };
  generateTestCaseSuggestions: () => TestCase[];
  getTestCaseTemplates: (functionType: 'algorithm' | 'data-processing' | 'utility') => any[];
  formatTestCaseDisplay: (testCase: TestCase, index: number) => string;
  formatTestSuitePreview: () => string;
  
  // Code configuration methods
  getAvailableRuntimes: () => Array<{
    id: string;
    name: string;
    description: string;
    language: Language;
    defaultTimeout: number;
  }>;
  createDefaultCodeConfig: () => any | null;
  validateCodeConfig: () => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    config: any;
  };
  getFunctionSignatures: () => Array<{
    name: string;
    description: string;
    example?: string;
  }>;
  getPerformanceRecommendations: () => string[];
  getSecurityRecommendations: () => string[];
  getRecommendedTimeoutForLanguage: () => number;
  
  // Organization context
  initializeOrganizationContext: () => void;
  toggleGlobalQuestion: () => void;
  isSuperOrgUser: boolean;
  canCreateGlobal: boolean;
  organizationName?: string;
  
  // Other actions
  generatePrompt: () => Promise<void>;
  clearErrors: () => void;
  resetWizard: () => void;
  cancelCreation: () => void; // NEW: Cancel with navigation
  togglePromptModal: () => void;
  clearPrompt: () => void;
  
  // Computed properties
  isReady: boolean;
  hasValidContent: boolean;
  requiresTestCases: boolean;
  requiresRuntime: boolean;
  hasRuntimeOptions: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isTesting: boolean;
  isCompleted: boolean;
  completedQuestion: Question | null;
  hasFieldErrors: boolean;
  showAdvanced: boolean;
  previewMode: boolean;
}

const QuestionCreationContext = createContext<QuestionCreationContextType | undefined>(undefined);

// Updated provider component with edit support
interface QuestionCreationProviderProps {
  children: ReactNode;
  initialQuestion?: Partial<Question>;
  mode?: 'create' | 'edit' | 'duplicate';
}

export const QuestionCreationProvider: React.FC<QuestionCreationProviderProps> = ({ 
  children,
  initialQuestion,
  mode = 'create'
}) => {
  // Use the enhanced hook system with edit support
  const hookData = useQuestionCreationHook(initialQuestion, mode);

  // Context value with all methods including edit support
  const contextValue: QuestionCreationContextType = {
    // Core state and dispatch
    state: hookData.state,
    dispatch: hookData.dispatch,
    
    // Edit mode properties
    isEditMode: hookData.isEditMode,
    isDuplicateMode: hookData.isDuplicateMode,
    originalQuestionId: hookData.originalQuestionId,
    mode: hookData.mode,
    
    // Navigation methods
    nextStep: hookData.nextStep,
    prevStep: hookData.prevStep,
    goToStep: hookData.goToStep,
    validateCurrentStep: hookData.validateCurrentStep,
    isStepAccessible: hookData.isStepAccessible,
    getStepStatus: hookData.getStepStatus,
    
    // Question building methods
    setLanguage: hookData.setLanguage,
    setCategory: hookData.setCategory,
    setQuestionType: hookData.setQuestionType,
    updateQuestionData: hookData.updateQuestionData,
    resetQuestionData: hookData.resetQuestionData,
    setFieldError: hookData.setFieldError,
    clearFieldError: hookData.clearFieldError,
    toggleAdvanced: hookData.toggleAdvanced,
    togglePreview: hookData.togglePreview,
    
    // Duplicate detection methods
    checkForDuplicates: hookData.checkForDuplicates,
    dismissDuplicateWarning: hookData.dismissDuplicateWarning,
    clearDuplicates: hookData.clearDuplicates,
    shouldCheckForDuplicates: hookData.shouldCheckForDuplicates,
    hasDuplicates: hookData.hasDuplicates,
    
    // Test case methods
    addTestCase: hookData.addTestCase,
    updateTestCase: hookData.updateTestCase,
    removeTestCase: hookData.removeTestCase,
    setTestCases: hookData.setTestCases,
    validateTestCases: hookData.validateTestCases,
    createEmptyTestCase: hookData.createEmptyTestCase,
    duplicateTestCase: hookData.duplicateTestCase,
    isValidating: hookData.isValidating,
    allTestsPassed: hookData.allTestsPassed,
    
    // Save methods
    saveQuestion: hookData.saveQuestion,
    saveQuestionWithCallback: hookData.saveQuestionWithCallback,
    canSaveQuestion: hookData.canSaveQuestion,
    getSaveValidationErrors: hookData.getSaveValidationErrors,
    registerCompletionCallback: hookData.registerCompletionCallback,
    
    // Dynamic validation methods
    validation: hookData.validation,
    isFieldRequired: hookData.isFieldRequired,
    getValidationWarnings: hookData.getValidationWarnings,
    getStepValidationErrors: hookData.getStepValidationErrors,
    getAvailableQuestionTypesForCategory: hookData.getAvailableQuestionTypesForCategory,
    
    // Test case management methods
    validateTestSuite: hookData.validateTestSuite,
    generateTestCaseSuggestions: hookData.generateTestCaseSuggestions,
    getTestCaseTemplates: hookData.getTestCaseTemplates,
    formatTestCaseDisplay: hookData.formatTestCaseDisplay,
    formatTestSuitePreview: hookData.formatTestSuitePreview,
    
    // Code configuration methods
    getAvailableRuntimes: hookData.getAvailableRuntimes,
    createDefaultCodeConfig: hookData.createDefaultCodeConfig,
    validateCodeConfig: hookData.validateCodeConfig,
    getFunctionSignatures: hookData.getFunctionSignatures,
    getPerformanceRecommendations: hookData.getPerformanceRecommendations,
    getSecurityRecommendations: hookData.getSecurityRecommendations,
    getRecommendedTimeoutForLanguage: hookData.getRecommendedTimeoutForLanguage,
    
    // Organization context methods
    initializeOrganizationContext: hookData.initializeOrganizationContext,
    toggleGlobalQuestion: hookData.toggleGlobalQuestion,
    isSuperOrgUser: hookData.isSuperOrgUser,
    canCreateGlobal: hookData.canCreateGlobal,
    organizationName: hookData.organizationName,
    
    // Other action methods
    generatePrompt: hookData.generatePrompt,
    clearErrors: hookData.clearErrors,
    resetWizard: hookData.resetWizard,
    cancelCreation: hookData.cancelCreation, // NEW: Cancel with navigation
    togglePromptModal: hookData.togglePromptModal,
    clearPrompt: hookData.clearPrompt,
    
    // Computed properties
    isReady: Boolean(hookData.isReady),
    hasValidContent: Boolean(hookData.hasValidContent),
    requiresTestCases: Boolean(hookData.requiresTestCases),
    requiresRuntime: Boolean(hookData.requiresRuntime),
    hasRuntimeOptions: Boolean(hookData.hasRuntimeOptions),
    isLoading: Boolean(hookData.isLoading),
    isSaving: Boolean(hookData.isSaving),
    isTesting: Boolean(hookData.isTesting),
    isCompleted: Boolean(hookData.isCompleted),
    completedQuestion: hookData.completedQuestion || null,
    hasFieldErrors: Boolean(hookData.hasFieldErrors),
    showAdvanced: Boolean(hookData.showAdvanced),
    previewMode: Boolean(hookData.previewMode)
  };

  return (
    <QuestionCreationContext.Provider value={contextValue}>
      {children}
    </QuestionCreationContext.Provider>
  );
};

// Hook for consuming the context
export const useQuestionCreation = (): QuestionCreationContextType => {
  const context = useContext(QuestionCreationContext);
  if (!context) {
    throw new Error(
      'useQuestionCreation must be used within a QuestionCreationProvider. ' +
      'Make sure your component is wrapped with <QuestionCreationProvider>.'
    );
  }
  return context;
};

// Additional hooks for specific concerns
export const useQuestionCreationState = () => {
  const { state } = useQuestionCreation();
  return state;
};

export const useQuestionCreationActions = () => {
  const context = useQuestionCreation();
  const {
    state,
    dispatch,
    isCompleted,
    completedQuestion,
    ...actions
  } = context;
  return actions;
};

export const useQuestionCreationSave = () => {
  const {
    saveQuestion,
    saveQuestionWithCallback,
    canSaveQuestion,
    getSaveValidationErrors,
    registerCompletionCallback,
    isSaving,
    isCompleted,
    completedQuestion
  } = useQuestionCreation();
  
  return {
    saveQuestion,
    saveQuestionWithCallback,
    canSaveQuestion,
    getSaveValidationErrors,
    registerCompletionCallback,
    isSaving,
    isCompleted,
    completedQuestion
  };
};

// New hook for edit-specific functionality
export const useQuestionCreationEdit = () => {
  const {
    isEditMode,
    isDuplicateMode,
    originalQuestionId,
    mode,
    isCompleted,
    completedQuestion
  } = useQuestionCreation();
  
  return {
    isEditMode,
    isDuplicateMode,
    originalQuestionId,
    mode,
    isCompleted,
    completedQuestion
  };
};

export default QuestionCreationContext;