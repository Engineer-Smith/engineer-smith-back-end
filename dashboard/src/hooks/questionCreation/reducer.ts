// src/hooks/questionCreation/reducer.ts - FIXED NAVIGATION LOGIC WITH EDIT SUPPORT
import { getValidCategories, getAllowedQuestionTypes } from '../../types';
import type { QuestionCreationState, QuestionCreationAction } from './types';
import { createInitialSteps } from './utils';

export const initialState: QuestionCreationState = {
  currentStep: 1,
  totalSteps: 4,
  steps: createInitialSteps(),
  canNavigateBack: false,
  canNavigateForward: false,

  selectedLanguage: undefined,
  selectedCategory: undefined,
  selectedQuestionType: undefined,
  availableCategories: [],
  availableQuestionTypes: [],

  questionData: {
    title: '',
    description: '',
    difficulty: 'medium',
    status: 'draft',
    tags: [],
    isGlobal: false
  },

  duplicateChecking: false,
  duplicatesFound: [],
  showDuplicateWarning: false,
  duplicateCheckPerformed: false,
  lastDuplicateCheck: null,

  testCases: [],
  testCaseValidation: {
    isRunning: false,
    allPassed: false,
    results: []
  },

  stepErrors: {},
  fieldErrors: {},

  loading: false,
  saving: false,
  testing: false,
  error: null,
  testSuccess: null,
  creationSuccess: null,
  success: null,
  showAdvanced: false,
  previewMode: false,

  // Organization Context - Enhanced
  isGlobalQuestion: false,
  canCreateGlobal: false,
  organizationId: undefined,
  isSuperOrgUser: false,
  organizationName: undefined,

  promptGeneration: {
    isGenerating: false,
    generatedPrompt: null,
    showModal: false
  }
};

export function questionCreationReducer(
  state: QuestionCreationState,
  action: QuestionCreationAction
): QuestionCreationState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        canNavigateBack: action.payload > 1,
        canNavigateForward: state.steps[action.payload - 1]?.isValid || false
      };

    case 'NEXT_STEP': {
      const nextStep = Math.min(state.currentStep + 1, state.totalSteps);
      const updatedSteps = state.steps.map(step =>
        step.id === state.currentStep ? { ...step, isCompleted: true } : step
      );

      return {
        ...state,
        currentStep: nextStep,
        steps: updatedSteps,
        canNavigateBack: nextStep > 1,
        canNavigateForward: state.steps[nextStep - 1]?.isValid || false
      };
    }

    case 'PREV_STEP':
      const prevStep = Math.max(state.currentStep - 1, 1);
      return {
        ...state,
        currentStep: prevStep,
        canNavigateBack: prevStep > 1,
        canNavigateForward: true
      };

    // Fixed: Navigation logic in validation update
    case 'UPDATE_STEP_VALIDATION': {
      const updatedSteps = state.steps.map(step =>
        step.id === action.payload.step
          ? { ...step, isValid: action.payload.isValid }
          : step
      );

      const updatedStepErrors = { ...state.stepErrors };
      if (action.payload.errors && action.payload.errors.length > 0) {
        updatedStepErrors[action.payload.step] = action.payload.errors;
      } else {
        delete updatedStepErrors[action.payload.step];
      }

      // Check if the CURRENT step is valid for navigation
      const currentStepData = updatedSteps.find(step => step.id === state.currentStep);
      const canNavigateForward = currentStepData?.isValid || false;

      return {
        ...state,
        steps: updatedSteps,
        stepErrors: updatedStepErrors,
        canNavigateForward
      };
    }

    // NEW: Initialize from existing question for edit/duplicate
    case 'INITIALIZE_FROM_QUESTION': {
      const { question, mode } = action.payload;

      // Determine step accessibility and completion for edit mode
      const isEditMode = mode === 'edit';
      const isDuplicateMode = mode === 'duplicate';

      const updatedSteps = state.steps.map(step => ({
        ...step,
        isAccessible: isEditMode ? true : step.id === 1,
        isCompleted: isEditMode,
        isValid: isEditMode
      }));

      // ✅ FIXED: Use language+category validation instead of category-only
      const availableQuestionTypes = question.language && question.category
        ? getAllowedQuestionTypes(question.language, question.category)
        : [];

      return {
        ...state,
        // Navigation state
        currentStep: 1,
        steps: updatedSteps,
        canNavigateBack: false,
        canNavigateForward: isEditMode ? true : false,

        // Question selections
        selectedLanguage: question.language,
        selectedCategory: question.category,
        selectedQuestionType: question.type,
        availableCategories: question.language ? getValidCategories(question.language) : [],
        availableQuestionTypes, // ✅ Now uses language+category rules

        // ... rest of the case remains the same
        questionData: {
          title: isDuplicateMode ? `Copy of ${question.title}` : question.title || '',
          description: question.description || '',
          difficulty: question.difficulty || 'medium',
          status: isDuplicateMode ? 'draft' : question.status || 'draft',
          tags: question.tags || [],
          isGlobal: isDuplicateMode ? false : question.isGlobal || false,
          options: question.options || [],
          correctAnswer: question.correctAnswer,
          codeTemplate: question.codeTemplate || '',
          blanks: question.blanks || [],
          dragOptions: question.dragOptions || [],
          codeConfig: question.codeConfig || undefined,
          buggyCode: question.buggyCode || '',
          solutionCode: question.solutionCode || '',
        },

        // Test cases
        testCases: question.testCases || [],
        testCaseValidation: {
          isRunning: false,
          allPassed: question.testCases ? question.testCases.length > 0 : false,
          results: question.testCases ? question.testCases.map((_, index) => ({
            index: index,
            passed: true,
            error: undefined
          })) : []
        },

        // Global question settings
        isGlobalQuestion: isDuplicateMode ? false : question.isGlobal || false,

        // Clear any existing errors/states
        stepErrors: {},
        fieldErrors: {},
        error: null,
        duplicateCheckPerformed: false,
        lastDuplicateCheck: null,
        duplicatesFound: [],
        showDuplicateWarning: false
      };
    }

    // ✅ ENHANCED: Auto-validate Step 1 when all selections are made
    case 'SET_LANGUAGE': {
      const availableCategories = getValidCategories(action.payload);
      const updatedQuestionData = {
        ...state.questionData,
        language: action.payload,
        category: undefined,
        type: undefined
      };

      return {
        ...state,
        selectedLanguage: action.payload,
        selectedCategory: undefined,
        selectedQuestionType: undefined,
        availableCategories,
        availableQuestionTypes: ['multipleChoice', 'trueFalse'],
        questionData: updatedQuestionData,
        duplicateCheckPerformed: false,
        lastDuplicateCheck: null
      };
    }

    case 'SET_CATEGORY': {
      // Use the new language+category validation
      const availableTypes = getAllowedQuestionTypes(state.selectedLanguage!, action.payload);
      const updatedQuestionData = {
        ...state.questionData,
        category: action.payload,
        type: undefined
      };

      return {
        ...state,
        selectedCategory: action.payload,
        selectedQuestionType: undefined,
        availableQuestionTypes: availableTypes, // Now uses language+category rules
        questionData: updatedQuestionData,
        duplicateCheckPerformed: false,
        lastDuplicateCheck: null
      };
    }

    // Enhanced: Auto-validate Step 1 when question type is set
    case 'SET_QUESTION_TYPE': {
      const updatedQuestionData = {
        ...state.questionData,
        type: action.payload
      };

      // Auto-set required fields for specific question types
      if (action.payload === 'trueFalse') {
        updatedQuestionData.options = ['True', 'False'];
        // Keep existing correctAnswer if it's valid (0 or 1), otherwise reset
        if (updatedQuestionData.correctAnswer !== 0 && updatedQuestionData.correctAnswer !== 1) {
          updatedQuestionData.correctAnswer = undefined;
        }
      } else if (action.payload === 'multipleChoice') {
        // Ensure options array exists for multiple choice
        if (!updatedQuestionData.options || !Array.isArray(updatedQuestionData.options)) {
          updatedQuestionData.options = ['', '', '', ''];
          updatedQuestionData.correctAnswer = undefined;
        }
      } else {
        // Clear options and correctAnswer for other question types
        delete updatedQuestionData.options;
        delete updatedQuestionData.correctAnswer;
      }

      // Auto-validate Step 1 when all selections are complete
      const hasAllSelections = !!(state.selectedLanguage && state.selectedCategory && action.payload);

      let updatedSteps = state.steps;
      let canNavigateForward = state.canNavigateForward;
      let stepErrors = state.stepErrors;

      if (hasAllSelections && state.currentStep === 1) {
        // Auto-validate Step 1
        updatedSteps = state.steps.map(step =>
          step.id === 1 ? { ...step, isValid: true } : step
        );
        canNavigateForward = true;

        // Clear step 1 errors
        const { 1: removed, ...remainingErrors } = state.stepErrors;
        stepErrors = remainingErrors;
      }

      return {
        ...state,
        selectedQuestionType: action.payload,
        questionData: updatedQuestionData,
        duplicateCheckPerformed: false,
        lastDuplicateCheck: null,
        steps: updatedSteps,
        canNavigateForward,
        stepErrors
      };
    }

    case 'UPDATE_QUESTION_DATA':
      return {
        ...state,
        questionData: {
          ...state.questionData,
          ...action.payload
        },
        duplicateCheckPerformed: false,
        lastDuplicateCheck: null
      };

    case 'RESET_QUESTION_DATA':
      return {
        ...state,
        questionData: {
          title: '',
          description: '',
          difficulty: 'medium',
          status: 'draft',
          tags: [],
          isGlobal: state.isGlobalQuestion // Preserve current global setting
        }
      };

    // NEW: Enhanced organization context handling
    case 'SET_USER_ORG_INFO': {
      const isGlobal = action.payload.isSuperOrg; // Auto-set global for super org users
      return {
        ...state,
        organizationId: action.payload.organizationId,
        organizationName: action.payload.organizationName,
        isSuperOrgUser: action.payload.isSuperOrg,
        canCreateGlobal: action.payload.canCreateGlobal,
        isGlobalQuestion: isGlobal,
        questionData: {
          ...state.questionData,
          isGlobal: isGlobal
        }
      };
    }

    case 'TOGGLE_GLOBAL_QUESTION':
      // Only allow toggling if user can create global questions
      if (!state.canCreateGlobal) {
        return state;
      }
      return {
        ...state,
        isGlobalQuestion: !state.isGlobalQuestion,
        questionData: {
          ...state.questionData,
          isGlobal: !state.isGlobalQuestion
        }
      };

    case 'START_DUPLICATE_CHECK':
      return {
        ...state,
        duplicateChecking: true,
        error: null
      };

    case 'SET_DUPLICATES':
      return {
        ...state,
        duplicateChecking: false,
        duplicatesFound: action.payload.duplicates,
        showDuplicateWarning: action.payload.duplicates.length > 0,
        duplicateCheckPerformed: true,
        lastDuplicateCheck: action.payload.checkHash
      };

    case 'DISMISS_DUPLICATE_WARNING':
      return {
        ...state,
        showDuplicateWarning: false
      };

    case 'CLEAR_DUPLICATES':
      return {
        ...state,
        duplicatesFound: [],
        showDuplicateWarning: false,
        duplicateCheckPerformed: false,
        lastDuplicateCheck: null
      };

    case 'SET_TEST_CASES':
      return {
        ...state,
        testCases: action.payload
      };

    case 'ADD_TEST_CASE':
      return {
        ...state,
        testCases: [...state.testCases, action.payload]
      };

    case 'UPDATE_TEST_CASE': {
      const updatedTestCases = [...state.testCases];
      updatedTestCases[action.payload.index] = action.payload.testCase;
      return {
        ...state,
        testCases: updatedTestCases
      };
    }

    case 'REMOVE_TEST_CASE':
      return {
        ...state,
        testCases: state.testCases.filter((_, index) => index !== action.payload)
      };

    case 'START_TEST_VALIDATION':
      return {
        ...state,
        testCaseValidation: {
          ...state.testCaseValidation,
          isRunning: true
        },
        testing: true
      };

    case 'SET_TEST_RESULTS':
      return {
        ...state,
        testCaseValidation: {
          isRunning: false,
          allPassed: action.payload.allPassed,
          results: action.payload.results
        },
        testing: false
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_SAVING':
      return { ...state, saving: action.payload };

    case 'SET_TESTING':
      return { ...state, testing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_TEST_SUCCESS':
      return {
        ...state,
        testSuccess: action.payload,
        success: action.payload
      };

    case 'SET_CREATION_SUCCESS':
      return {
        ...state,
        creationSuccess: action.payload,
        success: action.payload
      };

    case 'SET_SUCCESS':
      return { ...state, success: action.payload };

    case 'TOGGLE_ADVANCED':
      return { ...state, showAdvanced: !state.showAdvanced };

    case 'TOGGLE_PREVIEW':
      return { ...state, previewMode: !state.previewMode };

    case 'SET_FIELD_ERROR':
      return {
        ...state,
        fieldErrors: {
          ...state.fieldErrors,
          [action.payload.field]: action.payload.error
        }
      };

    case 'CLEAR_FIELD_ERROR': {
      const { [action.payload]: removed, ...remainingErrors } = state.fieldErrors;
      return {
        ...state,
        fieldErrors: remainingErrors
      };
    }

    case 'START_PROMPT_GENERATION':
      return {
        ...state,
        promptGeneration: {
          ...state.promptGeneration,
          isGenerating: true
        }
      };

    case 'SET_GENERATED_PROMPT':
      return {
        ...state,
        promptGeneration: {
          ...state.promptGeneration,
          isGenerating: false,
          generatedPrompt: action.payload,
          showModal: true
        }
      };

    case 'TOGGLE_PROMPT_MODAL':
      return {
        ...state,
        promptGeneration: {
          ...state.promptGeneration,
          showModal: !state.promptGeneration.showModal
        }
      };

    case 'CLEAR_PROMPT':
      return {
        ...state,
        promptGeneration: {
          isGenerating: false,
          generatedPrompt: null,
          showModal: false
        }
      };

    case 'RESET_WIZARD':
      return {
        ...initialState,
        // Preserve user permissions and org context
        canCreateGlobal: state.canCreateGlobal,
        organizationId: state.organizationId,
        organizationName: state.organizationName,
        isSuperOrgUser: state.isSuperOrgUser,
        isGlobalQuestion: state.isSuperOrgUser, // Reset to default based on org type
        questionData: {
          ...initialState.questionData,
          isGlobal: state.isSuperOrgUser
        }
      };

    case 'SHOW_DUPLICATE_WARNING':
      return {
        ...state,
        showDuplicateWarning: true
      };

    default:
      return state;
  }
}