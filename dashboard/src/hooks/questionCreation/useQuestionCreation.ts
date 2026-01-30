// src/hooks/questionCreation/useQuestionCreation.ts - UPDATED WITH EDIT SUPPORT
import { useReducer, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Question, CreateQuestionData } from '../../types';
import { questionCreationReducer, initialState } from './reducer';
import { useQuestionWizard } from './useQuestionWizard';
import { useQuestionBuilder } from './useQuestionBuilder';
import { useTestCaseManager } from './useTestCaseManager';
import { useDuplicateChecker } from './useDuplicateChecker';
import { useOrganizationContext } from './useOrganizationContext';
import { useCodeConfig } from './useCodeConfig';
import { createTestCasePrompt } from './utils';
import ApiService from '../../services/ApiService';

// Import alignment utilities
import {
    createSubmissionReadyQuestion
} from '../../services/questionSubmissionService';

import {
    useDynamicValidation,
    getAvailableQuestionTypes
} from '../../utils/dynamicFormValidation';

import {
    useTestCaseBuilder,
    formatTestCaseForDisplay,
    formatTestSuiteForPreview
} from '../../utils/testCasesStructure';

// Callback type for handling completion
type CompletionCallback = (questionId: string, question: Question) => void;

export const useQuestionCreation = (initialQuestion?: Partial<Question>, mode: 'create' | 'edit' | 'duplicate' = 'create') => {
    const [state, dispatch] = useReducer(questionCreationReducer, initialState);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Track completion callback and prevent double-saves
    const completionCallbackRef = useRef<CompletionCallback | null>(null);
    const saveInProgressRef = useRef(false);
    const completedQuestionRef = useRef<Question | null>(null);

    // Track initialization and edit mode
    const initializedRef = useRef(false);
    const isEditMode = mode === 'edit';
    const isDuplicateMode = mode === 'duplicate';
    const originalQuestionId = useRef<string | undefined>(initialQuestion?._id);

    // Initialize with existing question data
    useEffect(() => {
        if (initialQuestion && (mode === 'edit' || mode === 'duplicate') && !initializedRef.current) {

            dispatch({
                type: 'INITIALIZE_FROM_QUESTION',
                payload: { question: initialQuestion, mode }
            });
            initializedRef.current = true;
        }
    }, [initialQuestion, mode]);

    // Initialize existing sub-hooks
    const wizard = useQuestionWizard(state, dispatch);
    const builder = useQuestionBuilder(dispatch);
    const testManager = useTestCaseManager(state, dispatch);
    const duplicateChecker = useDuplicateChecker(state, dispatch);
    const orgContext = useOrganizationContext(dispatch);

    // Initialize utility hooks
    const testCaseBuilder = useTestCaseBuilder(state.testCases);

    // Code config hook (only initialize if we have language and category)
    const codeConfig = useCodeConfig(
        state.selectedLanguage || 'javascript',
        state.selectedCategory || 'logic'
    );

    // Dynamic validation for current question data
    const currentQuestionData = {
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
        dragOptions: state.questionData.dragOptions,
        codeConfig: state.questionData.codeConfig,
        testCases: state.testCases,
        buggyCode: state.questionData.buggyCode,
        solutionCode: state.questionData.solutionCode,
    };

    const dynamicValidation = useDynamicValidation(currentQuestionData);

    // Initialize organization context when user is available
    const orgInitialized = useRef(false);
    useEffect(() => {
        if (user && user.organization && !orgInitialized.current) {
            orgContext.initializeOrganizationContext();
            orgInitialized.current = true;
        }
    }, [user, orgContext]);

    // Register completion callback
    const registerCompletionCallback = useCallback((callback: CompletionCallback | null) => {
        completionCallbackRef.current = callback;
    }, []);

    // Auto-trigger completion callback when question is successfully created
    useEffect(() => {
        if (state.creationSuccess && completedQuestionRef.current && completionCallbackRef.current && !saveInProgressRef.current) {
            const questionId = completedQuestionRef.current._id || 'unknown';
            completionCallbackRef.current(questionId, completedQuestionRef.current);
            completionCallbackRef.current = null;
        }
    }, [state.creationSuccess]);

    // Main save function using submission service - UPDATED FOR EDIT SUPPORT
    const saveQuestion = useCallback(async (): Promise<Question> => {
        if (saveInProgressRef.current || state.saving) {
            throw new Error('Save operation already in progress');
        }

        if (completedQuestionRef.current && state.creationSuccess) {
            return completedQuestionRef.current;
        }

        saveInProgressRef.current = true;

        try {
            dispatch({ type: 'SET_SAVING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });

            // Build raw question data from current state
            const rawQuestionData: Partial<CreateQuestionData> = {
                title: state.questionData.title,
                description: state.questionData.description,
                type: state.selectedQuestionType,
                language: state.selectedLanguage,
                difficulty: state.questionData.difficulty,
                status: state.questionData.status,
                tags: state.questionData.tags,
                isGlobal: state.isGlobalQuestion,
                category: state.selectedCategory,
                options: state.questionData.options,
                correctAnswer: state.questionData.correctAnswer,
                codeTemplate: state.questionData.codeTemplate,
                blanks: state.questionData.blanks,
                dragOptions: state.questionData.dragOptions,
                codeConfig: state.questionData.codeConfig,
                testCases: state.testCases,
                buggyCode: state.questionData.buggyCode,
                solutionCode: state.questionData.solutionCode,
            };

            // Use submission service for final validation and cleaning
            const submissionResult = createSubmissionReadyQuestion(rawQuestionData);

            if (!submissionResult.success) {
                throw new Error(`Validation failed: ${submissionResult.errors.join(', ')}`);
            }

            const cleanedQuestionData = submissionResult.data!;

            // Choose API method based on mode
            let response;
            if (isEditMode && originalQuestionId.current) {
                response = await ApiService.updateQuestion(originalQuestionId.current, cleanedQuestionData);
            } else {
                response = await ApiService.createQuestion(cleanedQuestionData);
            }

            const questionResult = extractQuestionFromResponse(response);

            if (!questionResult || !questionResult._id) {
                throw new Error(`Question was ${isEditMode ? 'updated' : 'created'} but response is invalid`);
            }

            completedQuestionRef.current = questionResult;

            const actionText = isEditMode ? 'updated' : isDuplicateMode ? 'duplicated' : 'created';
            const scopeMessage = state.isSuperOrgUser ?
                'globally (available to all organizations)' :
                `for ${state.organizationName}`;

            dispatch({
                type: 'SET_CREATION_SUCCESS',
                payload: `Question "${questionResult.title}" has been ${actionText} ${scopeMessage}!`
            });

            return questionResult;

        } catch (error: any) {
            console.error('❌ SAVE QUESTION ERROR:', error);

            const actionText = isEditMode ? 'update' : 'save';
            const errorMessage = error.message || error.response?.data?.message || `Failed to ${actionText} question`;
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw new Error(errorMessage);
        } finally {
            dispatch({ type: 'SET_SAVING', payload: false });
            saveInProgressRef.current = false;
        }
    }, [state, dispatch, isEditMode, isDuplicateMode]);

    // Save with callback registration
    const saveQuestionWithCallback = useCallback(async (onComplete?: CompletionCallback): Promise<Question> => {
        if (onComplete) {
            registerCompletionCallback(onComplete);
        }
        return await saveQuestion();
    }, [saveQuestion, registerCompletionCallback]);

    // Validation methods using dynamic validation system
    const canSaveQuestion = useCallback((): boolean => {
        if (state.saving || saveInProgressRef.current) {
            return false;
        }
        return dynamicValidation.isValid;
    }, [state.saving, dynamicValidation.isValid]);

    const getSaveValidationErrors = useCallback((): string[] => {
        return dynamicValidation.errors;
    }, [dynamicValidation.errors]);

    const getValidationWarnings = useCallback((): string[] => {
        return dynamicValidation.warnings;
    }, [dynamicValidation.warnings]);

    const getRequiredFields = useCallback((): string[] => {
        return dynamicValidation.requiredFields;
    }, [dynamicValidation.requiredFields]);

    const isFieldRequired = useCallback((fieldName: string): boolean => {
        return dynamicValidation.isFieldRequired(fieldName);
    }, [dynamicValidation]);

    const validateCurrentStep = useCallback((): boolean => {
        const validationResult = dynamicValidation.validateStep(state.currentStep);
        const isValid = validationResult.isValid;

        // Dispatch the validation result to update step state
        dispatch({
            type: 'UPDATE_STEP_VALIDATION',
            payload: {
                step: state.currentStep,
                isValid,
                errors: validationResult.errors
            }
        });

        return isValid;
    }, [dynamicValidation, state.currentStep, dispatch]);

    const getStepValidationErrors = useCallback((step: number): string[] => {
        return dynamicValidation.validateStep(step).errors;
    }, [dynamicValidation]);

    // Test case utility methods using testCaseBuilder
    const validateTestSuite = useCallback(() => {
        if (state.selectedLanguage && state.questionData.codeConfig) {
            return testCaseBuilder.validateTestSuite(
                state.testCases,
                state.questionData.codeConfig,
                state.selectedLanguage
            );
        }
        return {
            isValid: false,
            errors: ['Language and code config required'],
            warnings: [],
            testCaseResults: [],
            coverage: { basicCases: 0, edgeCases: 0, errorCases: 0 }
        };
    }, [testCaseBuilder, state.testCases, state.questionData.codeConfig, state.selectedLanguage]);

    const generateTestCaseSuggestions = useCallback(() => {
        if (state.selectedLanguage && state.questionData.codeConfig) {
            return testCaseBuilder.generateSuggestions(
                state.questionData.codeConfig,
                state.selectedLanguage
            );
        }
        return [];
    }, [testCaseBuilder, state.questionData.codeConfig, state.selectedLanguage]);

    const getTestCaseTemplates = useCallback((functionType: 'algorithm' | 'data-processing' | 'utility') => {
        if (state.selectedLanguage) {
            return testCaseBuilder.getTemplates(state.selectedLanguage, functionType);
        }
        return [];
    }, [testCaseBuilder, state.selectedLanguage]);

    const formatTestCaseDisplay = useCallback((testCase: any, index: number) => {
        return formatTestCaseForDisplay(testCase, index);
    }, []);

    const formatTestSuitePreview = useCallback(() => {
        return formatTestSuiteForPreview(state.testCases);
    }, [state.testCases]);

    // Code configuration methods using the hook
    const getAvailableRuntimes = useCallback(() => {
        return codeConfig.getAvailableRuntimes();
    }, [codeConfig]);

    const createDefaultCodeConfig = useCallback(() => {
        return codeConfig.createDefaultCodeConfig();
    }, [codeConfig]);

    const validateCodeConfig = useCallback((config?: any) => {
        const configToValidate = config || state.questionData.codeConfig;
        if (!configToValidate) {
            return {
                isValid: false,
                errors: ['Code configuration is required'],
                warnings: [],
                config: null
            };
        }
        return codeConfig.validateCodeConfig(configToValidate);
    }, [codeConfig, state.questionData.codeConfig]);

    const getFunctionSignatures = useCallback(() => {
        return codeConfig.getFunctionSignatures();
    }, [codeConfig]);

    const getPerformanceRecommendations = useCallback(() => {
        return codeConfig.getPerformanceRecommendations();
    }, [codeConfig]);

    const getSecurityRecommendations = useCallback(() => {
        return codeConfig.getSecurityRecommendations();
    }, [codeConfig]);

    const getRecommendedTimeoutForLanguage = useCallback(() => {
        return codeConfig.getRecommendedTimeoutForLanguage();
    }, [codeConfig]);

    // Question type availability
    const getAvailableQuestionTypesForCategory = useCallback(() => {
        return getAvailableQuestionTypes(state.selectedLanguage, state.selectedCategory);
    }, [state.selectedLanguage, state.selectedCategory]);

    // Keep existing validation status for backward compatibility
    const getValidationStatus = useCallback(() => {
        return {
            isValid: dynamicValidation.isValid,
            errors: dynamicValidation.errors,
            cleanedData: null,
            hasData: true
        };
    }, [dynamicValidation]);

    // Generate prompt for AI assistance
    const generatePrompt = useCallback(async () => {
        dispatch({ type: 'START_PROMPT_GENERATION' });

        try {
            const prompt = createTestCasePrompt(state.questionData);
            dispatch({ type: 'SET_GENERATED_PROMPT', payload: prompt });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to generate prompt' });
            dispatch({ type: 'CLEAR_PROMPT' });
        }
    }, [state.questionData, dispatch]);

    // Clear all errors and success messages
    const clearErrors = useCallback(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
        dispatch({ type: 'SET_SUCCESS', payload: null });
        dispatch({ type: 'SET_TEST_SUCCESS', payload: null });
        dispatch({ type: 'SET_CREATION_SUCCESS', payload: null });
    }, [dispatch]);

    // Reset with proper cleanup
    const resetWizard = useCallback(() => {
        completionCallbackRef.current = null;
        saveInProgressRef.current = false;
        completedQuestionRef.current = null;
        initializedRef.current = false;
        originalQuestionId.current = undefined;
        dispatch({ type: 'RESET_WIZARD' });
    }, [dispatch]);

    // Cancel creation and navigate to question bank
    const cancelCreation = useCallback(() => {
        // Reset all wizard state
        resetWizard();

        // Navigate back appropriately based on mode
        if (isEditMode && originalQuestionId.current) {
            navigate(`/admin/question-bank/view/${originalQuestionId.current}`);
        } else {
            navigate('/admin/question-bank');
        }
    }, [resetWizard, navigate, isEditMode]);

    // Toggle prompt modal
    const togglePromptModal = useCallback(() => {
        dispatch({ type: 'TOGGLE_PROMPT_MODAL' });
    }, [dispatch]);

    const clearPrompt = useCallback(() => {
        dispatch({ type: 'CLEAR_PROMPT' });
    }, [dispatch]);

    return {
        // State
        state,
        dispatch,

        // Mode tracking
        isEditMode,
        isDuplicateMode,
        originalQuestionId: originalQuestionId.current,
        mode,

        // Wizard navigation
        ...wizard,

        // Question building
        ...builder,

        // Test case management - USE DEDICATED HOOK
        addTestCase: testManager.addTestCase,
        updateTestCase: testManager.updateTestCase,
        removeTestCase: testManager.removeTestCase,
        setTestCases: testManager.setTestCases,
        validateTestCases: testManager.validateTestCases,
        createEmptyTestCase: testManager.createEmptyTestCase,
        duplicateTestCase: testManager.duplicateTestCase,
        isValidating: testManager.isValidating,
        allTestsPassed: testManager.allTestsPassed,

        // Duplicate checking
        ...duplicateChecker,

        // Organization context
        ...orgContext,

        // Save methods
        saveQuestion,
        saveQuestionWithCallback,
        canSaveQuestion,
        getSaveValidationErrors,
        getValidationStatus,
        registerCompletionCallback,

        // Dynamic validation methods
        getValidationWarnings,
        getRequiredFields,
        isFieldRequired,
        validateCurrentStep,
        getStepValidationErrors,
        getAvailableQuestionTypesForCategory,

        // Test case utility methods (from testCaseBuilder)
        validateTestSuite,
        generateTestCaseSuggestions,
        getTestCaseTemplates,
        formatTestCaseDisplay,
        formatTestSuitePreview,

        // Code configuration methods
        getAvailableRuntimes,
        createDefaultCodeConfig,
        validateCodeConfig,
        getFunctionSignatures,
        getPerformanceRecommendations,
        getSecurityRecommendations,
        getRecommendedTimeoutForLanguage,

        // Other actions
        generatePrompt,
        clearErrors,
        resetWizard,
        cancelCreation,

        // Prompt management
        togglePromptModal,
        clearPrompt,
        promptGeneration: state.promptGeneration,

        // Computed properties
        isReady: state.selectedLanguage && state.selectedCategory && state.selectedQuestionType,
        hasValidContent: !!(state.questionData.title && state.questionData.description),
        requiresTestCases: state.selectedQuestionType === 'codeChallenge' && state.selectedCategory === 'logic',
        requiresRuntime: codeConfig.requiresRuntime,
        hasRuntimeOptions: codeConfig.hasRuntimeOptions,

        // Save state tracking
        isLoading: state.loading,
        isSaving: state.saving || saveInProgressRef.current,
        isTesting: testManager.isValidating, // Use testManager's testing state
        isCompleted: !!completedQuestionRef.current && !!state.creationSuccess,
        completedQuestion: completedQuestionRef.current,

        // Messages
        error: state.error,
        success: state.success,
        testSuccess: state.testSuccess,
        creationSuccess: state.creationSuccess,

        // UI state
        showAdvanced: state.showAdvanced,
        previewMode: state.previewMode,

        // Field errors
        fieldErrors: state.fieldErrors,
        hasFieldErrors: Object.keys(state.fieldErrors).length > 0,

        // Validation object - direct access to validation state
        validation: {
            isValid: dynamicValidation.isValid,
            errors: dynamicValidation.errors,
            warnings: dynamicValidation.warnings,
            hasErrors: dynamicValidation.hasErrors,
            hasWarnings: dynamicValidation.hasWarnings,
            requiredFields: dynamicValidation.requiredFields,
            optionalFields: dynamicValidation.optionalFields
        }
    };
};

// Helper function to extract question from various response formats
function extractQuestionFromResponse(response: any): Question | null {
    if (!response || typeof response !== 'object') {
        return null;
    }

    // Direct question object
    if ('_id' in response && 'title' in response) {
        return response as Question;
    }

    // Response with data property
    if ('data' in response && response.data) {
        if ('_id' in response.data && 'title' in response.data) {
            return response.data as Question;
        }
    }

    // Response with question property
    if ('question' in response && response.question) {
        if ('_id' in response.question && 'title' in response.question) {
            return response.question as Question;
        }
    }

    // Response with success flag
    if ('success' in response && response.success) {
        const { success, ...questionData } = response;
        if ('_id' in questionData && 'title' in questionData) {
            return questionData as Question;
        }

        if ('data' in response && response.data) {
            return response.data as Question;
        }

        if ('question' in response && response.question) {
            return response.question as Question;
        }
    }

    return null;
}