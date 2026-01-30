// src/types/createTest.ts - Test creation wizard types (wizard-specific only)
import type {
  Organization,
  TestStatus,
  TestType
} from './common';
import type {
  TestTemplate as BaseTestTemplate,
  CreateTestRequest,
  TestSection
} from './test';
import {
  isUsingSections
} from './test';

// =====================
// WIZARD-SPECIFIC DATA (extends core test creation)
// =====================

export interface CreateTestData extends Omit<CreateTestRequest, 'status'> {
  status: TestStatus; // Make status required for wizard state
  
  // Backend fields that might be included in edit mode
  _id?: string;
  organizationId?: string;
  isGlobal?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
  
  // Wizard-only fields (not sent to backend)
  instructions?: string; // Display-only instructions for wizard
  currentStep?: number; // Current wizard step
  isTemplate?: boolean; // Whether this was created from a template
  templateId?: TestType; // Original template used
}

// =====================
// WIZARD COMPONENT PROPS
// =====================

export interface WizardStepProps {
  testData: CreateTestData;
  setTestData: (data: CreateTestData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  setError: (error: string | null) => void;
  setLoading?: (loading: boolean) => void;
  // Additional wizard context
  isEditing?: boolean;
  canSkipStep?: boolean;
}

// =====================
// WIZARD TEST TEMPLATE (extends base template)
// =====================

export interface WizardTestTemplate extends BaseTestTemplate {
  // Wizard-specific template properties
  icon: string; // Icon name for UI
  color: string; // Color theme for UI
  estimatedQuestions: string; // e.g., "15-25" (display string)
  difficulty: string; // e.g., "Beginner to Intermediate" (display string)
  
  // Wizard flow configuration
  wizardSteps?: string[]; // Custom step order for this template
  skipSteps?: string[]; // Steps to skip for this template
  prefilledSections?: TestSection[]; // Pre-configured sections
}

// =====================
// WIZARD STATE MANAGEMENT
// =====================

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  error: string | null;
  canProgress: boolean;
  canGoBack: boolean;
  hasUnsavedChanges: boolean;
  completedSteps: number[]; // Track which steps are complete
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isValid: (testData: CreateTestData) => boolean;
  component: React.ComponentType<WizardStepProps>;
  canSkip?: boolean;
  dependsOn?: string[]; // Step IDs this step depends on
}

export interface WizardConfig {
  steps: WizardStep[];
  allowBackNavigation: boolean;
  saveProgressAutomatically: boolean;
  showProgressIndicator: boolean;
  exitConfirmation: boolean;
}

// =====================
// WIZARD UTILITY FUNCTIONS
// =====================

/**
 * Converts CreateTestData to backend API payload
 * Removes wizard-only fields and ensures correct structure
 */
export const createTestPayload = (testData: CreateTestData): CreateTestRequest => {
  const { 
    instructions, 
    currentStep,
    isTemplate,
    templateId,
    _id, 
    organizationId, 
    isGlobal, 
    createdBy, 
    createdAt, 
    updatedAt, 
    stats,
    ...backendPayload 
  } = testData;
  
  // Only include the structure that's being used
  const payload: CreateTestRequest = {
    title: backendPayload.title,
    description: backendPayload.description,
    testType: backendPayload.testType,
    languages: backendPayload.languages,
    tags: backendPayload.tags,
    settings: backendPayload.settings,
    status: backendPayload.status,
    // Include either sections OR questions, never both
    ...(backendPayload.settings.useSections 
      ? { sections: backendPayload.sections }
      : { questions: backendPayload.questions }
    ),
  };
  
  return payload;
};

/**
 * Creates empty test data with sensible defaults for wizard
 */
export const createEmptyTestData = (): CreateTestData => ({
  title: '',
  description: '',
  testType: 'custom',
  languages: [],
  tags: [],
  settings: {
    timeLimit: 60, // 1 hour default
    attemptsAllowed: 1,
    shuffleQuestions: false,
    useSections: false,
  },
  questions: [],
  sections: [],
  status: 'draft',
  currentStep: 0,
});

/**
 * Creates test data from template with wizard-specific setup
 */
export const createTestFromTemplate = (
  template: WizardTestTemplate,
  customizations: Partial<CreateTestData> = {}
): CreateTestData => ({
  ...createEmptyTestData(),
  testType: template.id,
  languages: template.languages,
  tags: template.tags,
  settings: { ...template.defaultSettings },
  isTemplate: true,
  templateId: template.id,
  sections: template.prefilledSections,
  ...customizations,
});

/**
 * Validates wizard-specific test data
 */
export const validateWizardTestData = (testData: CreateTestData): string[] => {
  const errors: string[] = [];
  
  // Basic validation
  if (!testData.title?.trim()) {
    errors.push('Test title is required');
  }
  
  if (!testData.description?.trim()) {
    errors.push('Test description is required');
  }
  
  // Settings validation
  if (testData.settings.timeLimit && testData.settings.timeLimit <= 0) {
    errors.push('Time limit must be greater than 0');
  }
  
  if (testData.settings.attemptsAllowed && testData.settings.attemptsAllowed <= 0) {
    errors.push('Attempts allowed must be greater than 0');
  }
  
  // Content structure validation
  if (testData.settings.useSections) {
    if (!testData.sections?.length) {
      errors.push('At least one section is required when using sections');
    } else {
      testData.sections.forEach((section, index) => {
        if (!section.name?.trim()) {
          errors.push(`Section ${index + 1} name is required`);
        }
        if (section.timeLimit <= 0) {
          errors.push(`Section ${index + 1} time limit must be greater than 0`);
        }
        if (!section.questions?.length) {
          errors.push(`Section ${index + 1} must have at least one question`);
        }
        // Validate each question in section
        section.questions.forEach((q, qIndex) => {
          if (!q.questionId || typeof q.questionId !== 'string') {
            errors.push(`Section ${index + 1}, Question ${qIndex + 1} must have a valid questionId`);
          }
          if (!q.points || q.points <= 0) {
            errors.push(`Section ${index + 1}, Question ${qIndex + 1} must have positive points`);
          }
        });
      });
    }
  } else {
    if (!testData.questions?.length) {
      errors.push('At least one question is required');
    } else {
      // Validate each question
      testData.questions.forEach((q, index) => {
        if (!q.questionId || typeof q.questionId !== 'string') {
          errors.push(`Question ${index + 1} must have a valid questionId`);
        }
        if (!q.points || q.points <= 0) {
          errors.push(`Question ${index + 1} must have positive points`);
        }
      });
    }
  }
  
  return errors;
};

/**
 * Checks if wizard step is valid
 */
export const isStepValid = (stepId: string, testData: CreateTestData): boolean => {
  switch (stepId) {
    case 'basic_info':
      return !!(testData.title?.trim() && testData.description?.trim());
    case 'template_selection':
      return !!testData.testType;
    case 'settings':
      return testData.settings.timeLimit > 0 && testData.settings.attemptsAllowed > 0;
    case 'content':
      return isUsingSections(testData) 
        ? !!(testData.sections?.length && testData.sections.every(s => s.questions.length > 0))
        : !!(testData.questions?.length);
    case 'review':
      return validateWizardTestData(testData).length === 0;
    default:
      return true;
  }
};

/**
 * Gets completion percentage for progress indicator
 */
export const getWizardProgress = (testData: CreateTestData, totalSteps: number): number => {
  const currentStep = testData.currentStep || 0;
  return Math.round(((currentStep + 1) / totalSteps) * 100);
};

/**
 * Check if wizard has unsaved changes
 */
export const hasUnsavedChanges = (testData: CreateTestData, originalData?: CreateTestData): boolean => {
  if (!originalData) return false;
  
  // Compare key fields that indicate changes
  return (
    testData.title !== originalData.title ||
    testData.description !== originalData.description ||
    JSON.stringify(testData.settings) !== JSON.stringify(originalData.settings) ||
    JSON.stringify(testData.sections) !== JSON.stringify(originalData.sections) ||
    JSON.stringify(testData.questions) !== JSON.stringify(originalData.questions)
  );
};

// =====================
// WIZARD STATE HELPERS
// =====================

export const createInitialWizardState = (): WizardState => ({
  currentStep: 0,
  totalSteps: 0,
  isLoading: false,
  error: null,
  canProgress: false,
  canGoBack: false,
  hasUnsavedChanges: false,
  completedSteps: [],
});

export const updateWizardState = (
  state: WizardState,
  testData: CreateTestData,
  config: WizardConfig
): WizardState => ({
  ...state,
  canProgress: isStepValid(config.steps[state.currentStep]?.id, testData),
  canGoBack: state.currentStep > 0 && config.allowBackNavigation,
  completedSteps: config.steps
    .slice(0, state.currentStep + 1)
    .map((_, index) => index)
    .filter(index => isStepValid(config.steps[index]?.id, testData)),
});

// =====================
// PREDEFINED WIZARD TEMPLATES
// =====================

export const getWizardTestTemplates = (): WizardTestTemplate[] => [
  {
    id: 'frontend_basics',
    name: 'Frontend Fundamentals',
    description: 'HTML, CSS, and JavaScript basics for web development',
    languages: ['html', 'css', 'javascript'],
    tags: ['html', 'css', 'javascript', 'dom', 'responsive-design', 'flexbox'],
    defaultSettings: {
      timeLimit: 45,
      attemptsAllowed: 2,
      shuffleQuestions: true,
      useSections: true,
    },
    // Base template fields
    estimatedDuration: 45,
    suggestedQuestionCount: 20,
    targetAudience: 'Beginner to intermediate web developers',
    prerequisites: ['Basic HTML knowledge', 'CSS fundamentals'],
    // Wizard-specific fields
    icon: 'globe',
    color: 'primary',
    estimatedQuestions: '15-25',
    difficulty: 'Beginner to Intermediate',
    skipSteps: ['template_selection'],
  },
  {
    id: 'react_developer',
    name: 'React Developer',
    description: 'React components, hooks, state management, and modern JavaScript',
    languages: ['javascript', 'react', 'typescript'],
    tags: ['react', 'components', 'hooks', 'state-management', 'jsx', 'es6'],
    defaultSettings: {
      timeLimit: 90,
      attemptsAllowed: 1,
      shuffleQuestions: false,
      useSections: true,
    },
    // Base template fields
    estimatedDuration: 90,
    suggestedQuestionCount: 25,
    targetAudience: 'Intermediate to advanced React developers',
    prerequisites: ['JavaScript ES6+', 'Basic React knowledge', 'Component lifecycle understanding'],
    // Wizard-specific fields
    icon: 'code',
    color: 'info',
    estimatedQuestions: '20-30',
    difficulty: 'Intermediate to Advanced',
    skipSteps: ['template_selection'],
  },
  {
    id: 'fullstack_js',
    name: 'Full Stack JavaScript',
    description: 'Frontend React and backend Express.js development',
    languages: ['javascript', 'react', 'express', 'typescript'],
    tags: ['react', 'express', 'nodejs', 'rest-api', 'components', 'routing'],
    defaultSettings: {
      timeLimit: 120,
      attemptsAllowed: 1,
      shuffleQuestions: false,
      useSections: true,
    },
    // Base template fields
    estimatedDuration: 120,
    suggestedQuestionCount: 35,
    targetAudience: 'Full-stack JavaScript developers',
    prerequisites: ['React proficiency', 'Node.js basics', 'REST API concepts', 'Database fundamentals'],
    // Wizard-specific fields
    icon: 'server',
    color: 'success',
    estimatedQuestions: '25-40',
    difficulty: 'Intermediate to Advanced',
    skipSteps: ['template_selection'],
  },
  {
    id: 'mobile_development',
    name: 'Mobile Development',
    description: 'React Native and Flutter mobile app development',
    languages: ['reactNative', 'flutter', 'dart', 'javascript'],
    tags: ['react-native', 'flutter', 'mobile-development', 'native-components'],
    defaultSettings: {
      timeLimit: 105,
      attemptsAllowed: 1,
      shuffleQuestions: false,
      useSections: true,
    },
    // Base template fields
    estimatedDuration: 105,
    suggestedQuestionCount: 28,
    targetAudience: 'Mobile app developers',
    prerequisites: ['React or Flutter basics', 'Mobile development concepts', 'Platform-specific knowledge'],
    // Wizard-specific fields
    icon: 'smartphone',
    color: 'warning',
    estimatedQuestions: '20-35',
    difficulty: 'Intermediate to Advanced',
    skipSteps: ['template_selection'],
  },
  {
    id: 'python_developer',
    name: 'Python Developer',
    description: 'Python programming, data structures, and backend development',
    languages: ['python'],
    tags: ['python', 'functions', 'classes', 'data-structures', 'algorithms'],
    defaultSettings: {
      timeLimit: 75,
      attemptsAllowed: 2,
      shuffleQuestions: true,
      useSections: false,
    },
    // Base template fields
    estimatedDuration: 75,
    suggestedQuestionCount: 23,
    targetAudience: 'Python developers of all levels',
    prerequisites: ['Basic programming concepts'],
    // Wizard-specific fields
    icon: 'target',
    color: 'danger',
    estimatedQuestions: '18-28',
    difficulty: 'Beginner to Advanced',
    skipSteps: ['template_selection'],
  },
  {
    id: 'custom',
    name: 'Custom Test',
    description: 'Choose your own combination of languages and topics',
    languages: [],
    tags: [],
    defaultSettings: {
      timeLimit: 60,
      attemptsAllowed: 1,
      shuffleQuestions: false,
      useSections: false,
    },
    // Base template fields
    estimatedDuration: 60,
    suggestedQuestionCount: 15,
    targetAudience: 'Customizable for any audience',
    prerequisites: [],
    // Wizard-specific fields
    icon: 'file-text',
    color: 'secondary',
    estimatedQuestions: 'Variable',
    difficulty: 'Customizable',
    // Custom template shows all steps - no skipSteps
  },
];

// =====================
// ORGANIZATION UTILITIES (wizard-specific)
// =====================

/**
 * Gets display text for test scope in wizard context
 */
export const getTestScopeText = (userOrganization?: Organization): string => {
  if (!userOrganization) return 'Organization Test';
  
  return userOrganization.isSuperOrg 
    ? 'Global Test (Available to all organizations)'
    : `Organization Test (Available to ${userOrganization.name} only)`;
};

/**
 * Checks if user can create global tests
 */
export const canCreateGlobalTests = (userOrganization?: Organization): boolean => {
  return userOrganization?.isSuperOrg ?? false;
};

// =====================
// RE-EXPORTS FROM CORE TEST TYPES
// =====================

// Re-export utility functions from test.ts to avoid duplication
export {
  getTotalPoints, getTotalQuestions as getTotalQuestionCount, isUsingSections as isUsingSection
} from './test';

// Re-export core types for convenience
export type {
  CreateTestRequest, Test, TestQuestionReference, TestSection, TestSettings
} from './test';
