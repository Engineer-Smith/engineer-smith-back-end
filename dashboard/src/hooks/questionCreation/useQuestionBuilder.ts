// src/hooks/questionCreation/useQuestionBuilder.ts
import { useCallback } from 'react';
import type { Language, QuestionCategory, QuestionType, CreateQuestionData } from '../../types';
import type { QuestionCreationAction } from './types';

export const useQuestionBuilder = (
  dispatch: React.Dispatch<QuestionCreationAction>
) => {
  const setLanguage = useCallback((language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  }, [dispatch]);

  const setCategory = useCallback((category: QuestionCategory) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  }, [dispatch]);

  const setQuestionType = useCallback((type: QuestionType) => {
    dispatch({ type: 'SET_QUESTION_TYPE', payload: type });
  }, [dispatch]);

  const updateQuestionData = useCallback((data: Partial<CreateQuestionData>) => {
    dispatch({ type: 'UPDATE_QUESTION_DATA', payload: data });
  }, [dispatch]);

  const resetQuestionData = useCallback(() => {
    dispatch({ type: 'RESET_QUESTION_DATA' });
  }, [dispatch]);

  const setFieldError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_FIELD_ERROR', payload: { field, error } });
  }, [dispatch]);

  const clearFieldError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_FIELD_ERROR', payload: field });
  }, [dispatch]);

  const toggleAdvanced = useCallback(() => {
    dispatch({ type: 'TOGGLE_ADVANCED' });
  }, [dispatch]);

  const togglePreview = useCallback(() => {
    dispatch({ type: 'TOGGLE_PREVIEW' });
  }, [dispatch]);

  return {
    setLanguage,
    setCategory,
    setQuestionType,
    updateQuestionData,
    resetQuestionData,
    setFieldError,
    clearFieldError,
    toggleAdvanced,
    togglePreview
  };
};