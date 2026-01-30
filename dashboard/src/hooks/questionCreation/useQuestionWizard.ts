// src/hooks/questionCreation/useQuestionWizard.ts - VALIDATE ONLY ON NAVIGATION ATTEMPT
import { useCallback, useMemo } from 'react';
import type { QuestionCreationState, QuestionCreationAction } from './types';
import { DynamicFormValidator } from '../../utils/dynamicFormValidation';

export const useQuestionWizard = (
  state: QuestionCreationState,
  dispatch: React.Dispatch<QuestionCreationAction>
) => {
  // Create complete question data for dynamic validation
  const currentQuestionData = useMemo(() => ({
    title: state.questionData.title,
    description: state.questionData.description,
    type: state.selectedQuestionType,
    language: state.selectedLanguage,
    difficulty: state.questionData.difficulty,
    category: state.selectedCategory,
    options: state.questionData.options,
    correctAnswer: state.questionData.correctAnswer,
    codeTemplate: state.questionData.codeTemplate,
    blanks: state.questionData.blanks,
    codeConfig: state.questionData.codeConfig,
    testCases: state.testCases,
    buggyCode: state.questionData.buggyCode,
    solutionCode: state.questionData.solutionCode,
    tags: state.questionData.tags,
    status: state.questionData.status,
  }), [
    state.questionData.title,
    state.questionData.description,
    state.selectedQuestionType,
    state.selectedLanguage,
    state.questionData.difficulty,
    state.selectedCategory,
    state.questionData.options,
    state.questionData.correctAnswer,
    state.questionData.codeTemplate,
    state.questionData.blanks,
    state.questionData.codeConfig,
    state.testCases,
    state.questionData.buggyCode,
    state.questionData.solutionCode,
    state.questionData.tags,
    state.questionData.status,
  ]);

  // Memoize steps validation state
  const stepsValidationState = useMemo(() => 
    state.steps.map(step => ({ id: step.id, isValid: step.isValid }))
  , [state.steps.map(s => `${s.id}-${s.isValid}`).join(',')]);

  // UPDATED: Validate only when attempting to navigate forward
  const nextStep = useCallback(() => {
    // Validate current step before proceeding
    const validation = DynamicFormValidator.validateStep(state.currentStep, currentQuestionData);
    
    if (!validation.isValid) {
      // Show validation errors only when they try to navigate
      dispatch({
        type: 'UPDATE_STEP_VALIDATION',
        payload: {
          step: state.currentStep,
          isValid: false,
          errors: validation.errors
        }
      });
      return; // Don't proceed if validation fails
    }
    
    // Clear any existing errors and proceed
    dispatch({
      type: 'UPDATE_STEP_VALIDATION',
      payload: {
        step: state.currentStep,
        isValid: true,
        errors: []
      }
    });
    
    dispatch({ type: 'NEXT_STEP' });
  }, [state.currentStep, currentQuestionData, dispatch]);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, [dispatch]);

  const goToStep = useCallback((step: number) => {
    // Only validate if moving forward
    if (step > state.currentStep) {
      // Validate current step before jumping forward
      const validation = DynamicFormValidator.validateStep(state.currentStep, currentQuestionData);
      
      if (!validation.isValid) {
        // Show validation errors for current step
        dispatch({
          type: 'UPDATE_STEP_VALIDATION',
          payload: {
            step: state.currentStep,
            isValid: false,
            errors: validation.errors
          }
        });
        return; // Don't proceed if validation fails
      }
      
      // Clear errors for current step
      dispatch({
        type: 'UPDATE_STEP_VALIDATION',
        payload: {
          step: state.currentStep,
          isValid: true,
          errors: []
        }
      });
    }
    
    dispatch({ type: 'SET_STEP', payload: step });
  }, [state.currentStep, currentQuestionData, dispatch]);

  // UPDATED: Silent validation check (doesn't show errors)
  const validateCurrentStepSilently = useCallback((): boolean => {
    const validation = DynamicFormValidator.validateStep(state.currentStep, currentQuestionData);
    return validation.isValid;
  }, [state.currentStep, currentQuestionData]);

  // UPDATED: Validate with error display (for navigation attempts)
  const validateCurrentStep = useCallback((): boolean => {
    const validation = DynamicFormValidator.validateStep(state.currentStep, currentQuestionData);

    // Special case for review step - check if all previous steps are valid
    if (state.currentStep === 4) {
      const allStepsValid = stepsValidationState.slice(0, 3).every(step => step.isValid);
      if (!allStepsValid) {
        validation.errors.push('Please complete all required steps');
        validation.isValid = false;
      }
    }

    // Update step validation in state with errors
    dispatch({
      type: 'UPDATE_STEP_VALIDATION',
      payload: { 
        step: state.currentStep, 
        isValid: validation.isValid, 
        errors: validation.errors 
      }
    });

    return validation.isValid;
  }, [state.currentStep, currentQuestionData, stepsValidationState, dispatch]);

  // Validate any specific step (silent by default)
  const validateSpecificStep = useCallback((stepNumber: number, showErrors = false): boolean => {
    const validation = DynamicFormValidator.validateStep(stepNumber, currentQuestionData);
    
    if (showErrors) {
      dispatch({
        type: 'UPDATE_STEP_VALIDATION',
        payload: { 
          step: stepNumber, 
          isValid: validation.isValid, 
          errors: validation.errors 
        }
      });
    }

    return validation.isValid;
  }, [currentQuestionData, dispatch]);

  // Get validation errors for any step (without showing them)
  const getStepValidationErrors = useCallback((stepNumber: number): string[] => {
    const validation = DynamicFormValidator.validateStep(stepNumber, currentQuestionData);
    return validation.errors;
  }, [currentQuestionData]);

  // Get validation warnings for any step
  const getStepValidationWarnings = useCallback((stepNumber: number): string[] => {
    const validation = DynamicFormValidator.validateStep(stepNumber, currentQuestionData);
    return validation.warnings;
  }, [currentQuestionData]);

  // Check if we can progress to next step (silent check)
  const canProgressToNextStep = useCallback((): boolean => {
    const currentStepValid = validateCurrentStepSilently();
    const nextStep = state.currentStep + 1;
    
    // Can't progress beyond total steps
    if (nextStep > state.totalSteps) return false;
    
    // Current step must be valid to progress
    return currentStepValid;
  }, [validateCurrentStepSilently, state.currentStep, state.totalSteps]);

  // Check step accessibility with better logic
  const isStepAccessible = useCallback((stepNumber: number): boolean => {
    // Step 1 is always accessible
    if (stepNumber === 1) return true;
    
    // For other steps, all previous steps must be valid
    return stepsValidationState.slice(0, stepNumber - 1).every(step => step.isValid);
  }, [stepsValidationState]);

  // Get step status with better logic
  const getStepStatus = useCallback((stepNumber: number): 'active' | 'completed' | 'invalid' | 'disabled' => {
    const step = state.steps.find(s => s.id === stepNumber);
    if (!step) return 'disabled';

    if (stepNumber === state.currentStep) return 'active';
    if (step.isCompleted && step.isValid) return 'completed';
    if (!isStepAccessible(stepNumber)) return 'disabled';
    return 'invalid';
  }, [state.currentStep, state.steps, isStepAccessible]);

  // Get completion percentage
  const getCompletionPercentage = useCallback((): number => {
    const validSteps = stepsValidationState.filter(step => step.isValid).length;
    return Math.round((validSteps / state.totalSteps) * 100);
  }, [stepsValidationState, state.totalSteps]);

  // Check if wizard is complete
  const isWizardComplete = useCallback((): boolean => {
    return stepsValidationState.every(step => step.isValid);
  }, [stepsValidationState]);

  // Get next invalid step
  const getNextInvalidStep = useCallback((): number | null => {
    for (let i = 0; i < stepsValidationState.length; i++) {
      if (!stepsValidationState[i].isValid) {
        return i + 1; // Steps are 1-indexed
      }
    }
    return null;
  }, [stepsValidationState]);

  // Force validate all steps (with error display)
  const validateAllSteps = useCallback(() => {
    for (let stepNumber = 1; stepNumber <= state.totalSteps; stepNumber++) {
      validateSpecificStep(stepNumber, true);
    }
  }, [validateSpecificStep, state.totalSteps]);

  // NEW: Clear validation errors for current step
  const clearCurrentStepErrors = useCallback(() => {
    dispatch({
      type: 'UPDATE_STEP_VALIDATION',
      payload: {
        step: state.currentStep,
        isValid: true,
        errors: []
      }
    });
  }, [state.currentStep, dispatch]);

  return {
    // Navigation - now with validation-on-attempt
    nextStep,
    prevStep,
    goToStep,
    
    // Validation methods
    validateCurrentStep, // Shows errors
    validateCurrentStepSilently, // No errors shown
    validateSpecificStep,
    validateAllSteps,
    clearCurrentStepErrors, // NEW
    
    // Validation info
    getStepValidationErrors,
    getStepValidationWarnings,
    canProgressToNextStep,
    
    // Step accessibility and status
    isStepAccessible,
    getStepStatus,
    
    // Progress tracking
    getCompletionPercentage,
    isWizardComplete,
    getNextInvalidStep,

    // State properties
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    steps: state.steps,
    canNavigateBack: state.canNavigateBack,
    canNavigateForward: canProgressToNextStep(), // Use silent validation
    stepErrors: state.stepErrors,

    // Computed properties
    completionPercentage: getCompletionPercentage(),
    isComplete: isWizardComplete(),
    nextInvalidStep: getNextInvalidStep(),
  };
};