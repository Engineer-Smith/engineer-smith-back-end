// src/hooks/questionCreation/useDuplicateChecker.ts - FIXED to handle direct API responses
import { useCallback } from 'react';
import type { QuestionCreationState, QuestionCreationAction, DuplicateQuestion } from './types';
import { createDuplicateCheckHash } from './utils';
import ApiService from '../../services/ApiService';
import type { QuestionType } from '../../types';

export const useDuplicateChecker = (
  state: QuestionCreationState,
  dispatch: React.Dispatch<QuestionCreationAction>
) => {
  const checkForDuplicates = useCallback(async (forceCheck = false) => {
    const { questionData } = state;

    if (!questionData.type || !questionData.language) {
      console.warn('Cannot check duplicates: missing type or language');
      return;
    }

    if (!questionData.title?.trim() && !questionData.description?.trim()) {
      console.warn('Cannot check duplicates: no title or description');
      return;
    }

    // Check if we need to perform duplicate check
    const checkHash = createDuplicateCheckHash(questionData);
    if (!forceCheck && state.lastDuplicateCheck === checkHash) {
      return;
    }

    dispatch({ type: 'START_DUPLICATE_CHECK' });

    try {
      const searchParams = {
        title: questionData.title?.trim(),
        description: questionData.description?.trim(),
        type: questionData.type,
        language: questionData.language,
        category: questionData.category,
        entryFunction: questionData.codeConfig?.entryFunction,
        codeTemplate: questionData.codeTemplate
      };


      // API now returns data directly
      const response = await ApiService.checkDuplicates(searchParams);


      // Response is now the direct data, not wrapped
      const rawDuplicates = response.duplicates || [];
      
      // Convert the API response to match our frontend DuplicateQuestion type
      const duplicates: DuplicateQuestion[] = rawDuplicates.map(duplicate => ({
        ...duplicate,
        // Ensure type is properly typed as QuestionType
        type: duplicate.type as QuestionType,
        // Handle organizationId - provide fallback for undefined
        organizationId: duplicate.organizationId || '',
        // Ensure other required fields are properly typed
        _id: duplicate._id,
        title: duplicate.title,
        description: duplicate.description,
        language: duplicate.language,
        category: duplicate.category,
        difficulty: duplicate.difficulty,
        isGlobal: duplicate.isGlobal,
        createdBy: duplicate.createdBy,
        createdAt: duplicate.createdAt,
        similarity: duplicate.similarity,
        exactMatch: duplicate.exactMatch,
        source: duplicate.source,
        matchReason: duplicate.matchReason
      }));

      dispatch({
        type: 'SET_DUPLICATES',
        payload: {
          duplicates,
          checkHash
        }
      });


    } catch (error) {
      console.error('Duplicate check failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to check for duplicates' });
      dispatch({ type: 'SET_DUPLICATES', payload: { duplicates: [], checkHash } });
    }
  }, [state.questionData, state.lastDuplicateCheck, dispatch]);

  const forceCheckForDuplicates = useCallback(async () => {
    await checkForDuplicates(true);
  }, [checkForDuplicates]);

  const dismissDuplicateWarning = useCallback(() => {
    dispatch({ type: 'DISMISS_DUPLICATE_WARNING' });
  }, [dispatch]);

  const clearDuplicates = useCallback(() => {
    dispatch({ type: 'CLEAR_DUPLICATES' });
  }, [dispatch]);

  const shouldCheckForDuplicates = useCallback((): boolean => {
    const { questionData, lastDuplicateCheck } = state;
    
    if (!questionData.type || !questionData.language || !questionData.title) {
      return false;
    }

    const currentHash = createDuplicateCheckHash(questionData);
    return lastDuplicateCheck !== currentHash;
  }, [state]);

  return {
    checkForDuplicates,
    forceCheckForDuplicates,
    dismissDuplicateWarning,
    clearDuplicates,
    shouldCheckForDuplicates,
    duplicateChecking: state.duplicateChecking,
    duplicatesFound: state.duplicatesFound,
    showDuplicateWarning: state.showDuplicateWarning,
    duplicateCheckPerformed: state.duplicateCheckPerformed,
    hasDuplicates: state.duplicatesFound.length > 0
  };
};