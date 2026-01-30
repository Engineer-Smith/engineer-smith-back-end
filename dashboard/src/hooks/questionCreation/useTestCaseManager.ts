// src/hooks/questionCreation/useTestCaseManager.ts - FIXED to handle direct API responses
import { useCallback } from 'react';
import type { TestCase } from '../../types';
import type { QuestionCreationState, QuestionCreationAction } from './types';
import ApiService from '../../services/ApiService';

export const useTestCaseManager = (
  state: QuestionCreationState,
  dispatch: React.Dispatch<QuestionCreationAction>
) => {
  const addTestCase = useCallback((testCase: TestCase) => {
    dispatch({ type: 'ADD_TEST_CASE', payload: testCase });
  }, [dispatch]);

  const updateTestCase = useCallback((index: number, testCase: TestCase) => {
    dispatch({ type: 'UPDATE_TEST_CASE', payload: { index, testCase } });
  }, [dispatch]);

  const removeTestCase = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_TEST_CASE', payload: index });
  }, [dispatch]);

  const setTestCases = useCallback((testCases: TestCase[]) => {
    dispatch({ type: 'SET_TEST_CASES', payload: testCases });
  }, [dispatch]);

  const validateTestCases = useCallback(async (solutionCode?: string) => {
    if (state.testCases.length === 0) {
      // If no test cases, validate based on requirements
      const requiresTestCases = state.selectedQuestionType === 'codeChallenge' &&
        state.selectedCategory === 'logic';

      dispatch({
        type: 'UPDATE_STEP_VALIDATION',
        payload: {
          step: 3,
          isValid: !requiresTestCases,
          errors: requiresTestCases ? ['At least one test case is required'] : []
        }
      });
      return;
    }

    dispatch({ type: 'START_TEST_VALIDATION' });

    try {
      // Use provided solutionCode or fall back to existing code
      const code = solutionCode || 
        state.questionData.codeTemplate || 
        state.questionData.solutionCode || 
        '';

      // Prepare the API payload
      const testData = {
        questionData: {
          type: state.selectedQuestionType!,
          language: state.selectedLanguage!,
          category: state.selectedCategory!,
          testCases: state.testCases,
          codeConfig: {
            runtime: state.questionData.codeConfig?.runtime || 'node',
            entryFunction: state.questionData.codeConfig?.entryFunction || 'solution',
            timeoutMs: state.questionData.codeConfig?.timeoutMs || 3000
          }
        },
        testCode: code
      };

      // API now returns data directly (QuestionTestResult)
      const response = await ApiService.testQuestion(testData);

      // Response is now the direct QuestionTestResult, not wrapped
      const testResults = response.testResults?.map((result: any, index: number) => ({
        index,
        passed: result.passed,
        error: result.error,
        actualOutput: result.actualOutput,
        expectedOutput: result.expectedOutput,
        executionTime: result.executionTime
      })) || [];

      const allPassed = response.overallPassed || false;

      dispatch({
        type: 'SET_TEST_RESULTS',
        payload: {
          allPassed,
          results: testResults
        }
      });

      // Update step validation
      const stepErrors: string[] = [];
      const requiresTestCases = state.selectedQuestionType === 'codeChallenge' &&
        state.selectedCategory === 'logic';

      if (requiresTestCases && state.testCases.length === 0) {
        stepErrors.push('At least one test case is required');
      }

      if (state.testCases.length > 0 && state.testCases.every(tc => tc.hidden)) {
        stepErrors.push('At least one test case should be visible to students');
      }

      const isStepValid = stepErrors.length === 0 && (allPassed || !requiresTestCases);

      dispatch({
        type: 'UPDATE_STEP_VALIDATION',
        payload: {
          step: 3,
          isValid: isStepValid,
          errors: stepErrors
        }
      });

      if (allPassed) {
        dispatch({ 
          type: 'SET_TEST_SUCCESS', 
          payload: `All ${testResults.length} test cases passed!` 
        });
      } else {
        const failedCount = testResults.filter((r: any) => !r.passed).length;
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `${failedCount} out of ${testResults.length} test case(s) failed` 
        });
      }

    } catch (error) {
      console.error('Test case validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Test case validation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({
        type: 'SET_TEST_RESULTS',
        payload: { allPassed: false, results: [] }
      });

      dispatch({
        type: 'UPDATE_STEP_VALIDATION',
        payload: {
          step: 3,
          isValid: false,
          errors: ['Test validation failed']
        }
      });
    }
  }, [
    state.testCases, 
    state.selectedQuestionType, 
    state.selectedLanguage, 
    state.selectedCategory, 
    state.questionData, 
    dispatch
  ]);

  const createEmptyTestCase = useCallback((): TestCase => ({
    name: `Test case ${state.testCases.length + 1}`,
    args: [],
    expected: '',
    hidden: false
  }), [state.testCases.length]);

  const duplicateTestCase = useCallback((index: number) => {
    if (index >= 0 && index < state.testCases.length) {
      const original = state.testCases[index];
      const duplicate: TestCase = {
        ...original,
        name: `${original.name} (copy)`
      };
      dispatch({ type: 'ADD_TEST_CASE', payload: duplicate });
    }
  }, [state.testCases, dispatch]);

  return {
    testCases: state.testCases,
    testCaseValidation: state.testCaseValidation,
    addTestCase,
    updateTestCase,
    removeTestCase,
    setTestCases,
    validateTestCases,
    createEmptyTestCase,
    duplicateTestCase,
    isValidating: state.testCaseValidation.isRunning,
    allTestsPassed: state.testCaseValidation.allPassed
  };
};