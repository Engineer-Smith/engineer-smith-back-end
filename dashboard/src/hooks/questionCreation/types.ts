// src/hooks/questionCreation/types.ts
import type {
  CreateQuestionData,
  Language,
  Question,
  QuestionCategory,
  QuestionType,
  TestCase
} from '../../types';


export interface DuplicateQuestion {
  _id: string;
  title: string;
  description: string;
  type: 'multipleChoice' | 'trueFalse' | 'fillInTheBlank' | 'dragDropCloze' | 'codeChallenge' | 'codeDebugging';
  language: string;
  category?: string;
  difficulty: string;
  organizationId: string;
  isGlobal: boolean;
  createdBy: string;
  createdAt: string;

  // Code-specific properties
  codeConfig?: {
    entryFunction: string;
  };
  codeTemplate?: string;

  // Answer properties (now included from backend)
  correctAnswer?: number;
  options?: string[];

  // Similarity analysis properties (added by duplicate service)
  similarity: number;
  exactMatch: boolean;
  source: 'Global' | 'Your Organization';
  matchReason: string;
}

export interface WizardStep {
  id: number;
  name: string;
  title: string;
  description: string;
  isRequired: boolean;
  canSkip: boolean;
  isValid: boolean;
  isCompleted: boolean;
}

export interface QuestionCreationState {
  // Step Management
  currentStep: number;
  totalSteps: number;
  steps: WizardStep[];
  canNavigateBack: boolean;
  canNavigateForward: boolean;

  // Question Building
  selectedLanguage: Language | undefined;
  selectedCategory: QuestionCategory | undefined;
  selectedQuestionType: QuestionType | undefined;
  availableCategories: QuestionCategory[];
  availableQuestionTypes: QuestionType[];

  // Question Data
  questionData: Partial<CreateQuestionData>;

  // Duplicate Detection
  duplicateChecking: boolean;
  duplicatesFound: DuplicateQuestion[];
  showDuplicateWarning: boolean;
  duplicateCheckPerformed: boolean;
  lastDuplicateCheck: string | null;

  // Test Cases & Validation
  testCases: TestCase[];
  testCaseValidation: {
    isRunning: boolean;
    allPassed: boolean;
    results: Array<{
      index: number;
      passed: boolean;
      error?: string;
    }>;
  };

  // Step Validation
  stepErrors: Record<number, string[]>;
  fieldErrors: Record<string, string>;

  // UI State
  loading: boolean;
  saving: boolean;
  testing: boolean;
  error: string | null;
  testSuccess: string | null;
  creationSuccess: string | null;
  success: string | null;
  showAdvanced: boolean;
  previewMode: boolean;

  // Organization Context - Enhanced for super org logic
  isGlobalQuestion: boolean;
  canCreateGlobal: boolean;
  organizationId?: string;
  isSuperOrgUser: boolean;
  organizationName?: string;

  // Prompt Generation State
  promptGeneration: {
    isGenerating: boolean;
    generatedPrompt: string | null;
    showModal: boolean;
  };
}

export type QuestionCreationAction =
  // Navigation
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_STEP_VALIDATION'; payload: { step: number; isValid: boolean; errors?: string[] } }

  // Question Building
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_CATEGORY'; payload: QuestionCategory }
  | { type: 'SET_QUESTION_TYPE'; payload: QuestionType }
  | { type: 'UPDATE_QUESTION_DATA'; payload: Partial<CreateQuestionData> }
  | { type: 'RESET_QUESTION_DATA' }

  // Organization Context - Enhanced for super org
  | {
    type: 'SET_USER_ORG_INFO'; payload: {
      organizationId: string;
      organizationName: string;
      isSuperOrg: boolean;
      canCreateGlobal: boolean;
    }
  }
  | { type: 'TOGGLE_GLOBAL_QUESTION' }

  // Duplicate Detection
  | { type: 'START_DUPLICATE_CHECK' }
  | { type: 'SET_DUPLICATES'; payload: { duplicates: DuplicateQuestion[]; checkHash: string | null } }
  | { type: 'DISMISS_DUPLICATE_WARNING' }
  | { type: 'CLEAR_DUPLICATES' }

  // Test Cases
  | { type: 'SET_TEST_CASES'; payload: TestCase[] }
  | { type: 'ADD_TEST_CASE'; payload: TestCase }
  | { type: 'UPDATE_TEST_CASE'; payload: { index: number; testCase: TestCase } }
  | { type: 'REMOVE_TEST_CASE'; payload: number }
  | { type: 'START_TEST_VALIDATION' }
  | { type: 'SET_TEST_RESULTS'; payload: { allPassed: boolean; results: any[] } }

  // UI State
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_TESTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TEST_SUCCESS'; payload: string | null }
  | { type: 'SET_CREATION_SUCCESS'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'TOGGLE_ADVANCED' }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; error: string } }
  | { type: 'CLEAR_FIELD_ERROR'; payload: string }

  // Prompt Generation
  | { type: 'START_PROMPT_GENERATION' }
  | { type: 'SET_GENERATED_PROMPT'; payload: string }
  | { type: 'TOGGLE_PROMPT_MODAL' }
  | { type: 'CLEAR_PROMPT' }

  // Reset
  | { type: 'RESET_WIZARD' }
  | { type: 'SHOW_DUPLICATE_WARNING' }
  | { type: 'INITIALIZE_FROM_QUESTION'; payload: { question: Partial<Question>; mode: 'edit' | 'duplicate' | 'create' } };