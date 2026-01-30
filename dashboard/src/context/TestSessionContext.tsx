// src/context/TestSessionContext.tsx - FIXED for hybrid timer approach
import React, { createContext, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSocket } from './SocketContext';
import { useTestSessionTimers } from '../hooks/testSession/useTestSessionTimers';
import apiService from '../services/ApiService';
import socketService from '../services/SocketService';
import type {
  ServerActionResponse,
  NavigationContext,
  SectionSummary,
  SessionFinalScore,
  StartSessionResponse,
  StartSessionConflictResponse,
  CurrentQuestionResponse,
  CheckExistingSessionResponse,
  RejoinSessionResponse,
  SubmitAnswerRequest,
  QuestionData,
  QuestionStatus
} from '../types';

interface TestSessionState {
  sessionId: string | null;
  initialized: boolean;
  questionState: {
    questionIndex: number;
    questionData: QuestionData;
    currentAnswer: any;
    status: QuestionStatus;
    timeSpent: number;
    viewCount: number;
    isReviewPhase?: boolean;
    skippedQuestionsRemaining?: number;
  } | null;
  navigationContext: NavigationContext | null;
  sessionInfo: {
    title: string;
    description: string;
    totalQuestions: number;
    totalPoints: number;
    timeLimit: number;
    useSections: boolean;
    sectionCount: number;
  } | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  currentAnswer: any;
  hasUnsavedChanges: boolean;
  questionStartTime: number | null;
  finalScore: SessionFinalScore | null;
  isCompleted: boolean;
  sectionSummary: SectionSummary | null;  // For review mode
  isReviewing: boolean;                    // Currently in section review
}

interface TestSessionContextValue {
  state: TestSessionState;
  checkExistingSession: () => Promise<CheckExistingSessionResponse>;
  startSession: (testId: string, forceNew?: boolean) => Promise<void>;
  rejoinSession: (sessionId: string) => Promise<void>;
  updateAnswer: (answer: any) => void;
  submitAnswer: () => Promise<void>;
  skipQuestion: (reason?: string) => Promise<void>;
  submitTest: (forceSubmit?: boolean) => Promise<void>;
  abandonTest: () => Promise<void>;
  submitSection: () => Promise<void>;
  startSectionReview: () => Promise<void>;
  navigateToQuestion: (questionIndex: number) => Promise<void>;
  resetSession: () => void;
  refreshQuestion: () => Promise<void>;
  requestTimerSync: () => Promise<void>;
  formatTimeRemaining: () => string;
  timerDisplay: ReturnType<typeof useTestSessionTimers>;
  networkStatus: ReturnType<typeof useSocket>['networkStatus'];
  connectionStatus: ReturnType<typeof useSocket>['connectionStatus'];
}

const TestSessionContext = createContext<TestSessionContextValue | null>(null);

export const useTestSession = () => {
  const context = useContext(TestSessionContext);
  if (!context) {
    throw new Error('useTestSession must be used within a TestSessionProvider');
  }
  return context;
};

export const TestSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { networkStatus, connectionStatus, registerEventHandlers, joinSession, leaveSession } = useSocket();

  // Track initial timer value for hybrid hook
  const [initialTimerValue, setInitialTimerValue] = React.useState<number | null>(null);

  const [state, setState] = React.useState<TestSessionState>({
    sessionId: null,
    initialized: false,
    questionState: null,
    navigationContext: null,
    sessionInfo: null,
    loading: false,
    error: null,
    submitting: false,
    currentAnswer: null,
    hasUnsavedChanges: false,
    questionStartTime: null,
    finalScore: null,
    isCompleted: false,
    sectionSummary: null,
    isReviewing: false,
  });

  const questionStartTimeRef = useRef<number | null>(null);
  const socketCleanupRef = useRef<(() => void) | null>(null);

  // FIXED: Timer hook now gets initial value from API responses
  const timerDisplay = useTestSessionTimers(initialTimerValue);

  // SIMPLIFIED: Timer formatting comes from hybrid hook
  const formatTimeRemaining = useCallback((): string => {
    return timerDisplay.formatTimeRemaining();
  }, [timerDisplay]);

  // Navigation helper
  const navigateToResults = useCallback((sessionId: string, finalScore?: SessionFinalScore, options?: any) => {
    navigate('/results', {
      state: {
        sessionId,
        finalScore,
        completedAt: new Date().toISOString(),
        ...options
      }
    });
  }, [navigate]);

  // UTILITIES
  const refreshQuestion = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      const response: CurrentQuestionResponse = await apiService.getCurrentQuestion(state.sessionId);

      if (!response.success) {
        throw new Error('Failed to refresh question');
      }

      setState(prev => ({
        ...prev,
        questionState: response.questionState,
        navigationContext: response.navigationContext,
        sessionInfo: response.sessionInfo,
        currentAnswer: response.questionState.currentAnswer,
        hasUnsavedChanges: false,
      }));

      // FIXED: Set initial timer value for hybrid hook
      if (response.timeRemaining !== undefined) {
        setInitialTimerValue(response.timeRemaining);
      }

      questionStartTimeRef.current = Date.now();

    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [state.sessionId]);

  // Timer sync request
  const requestTimerSync = useCallback(async () => {
    if (!state.sessionId || !socketService.isConnected()) return;

    try {
      await socketService.requestTimerSync(state.sessionId);
    } catch (error: any) {
      console.warn('Failed to request timer sync:', error);
    }
  }, [state.sessionId]);

  const resetSessionState = useCallback(() => {
    setState(prev => ({
      ...prev,
      sessionId: null,
      initialized: false,
      questionState: null,
      navigationContext: null,
      sessionInfo: null,
      currentAnswer: null,
      hasUnsavedChanges: false,
      loading: false,
      submitting: false,
      error: null
    }));

    setInitialTimerValue(null);
    questionStartTimeRef.current = null;
  }, []);

  // SERVER RESPONSE HANDLER WITH NAVIGATION
  const handleServerResponse = useCallback(async (response: any) => {
    // Always reset submitting state first
    setState(prev => ({ ...prev, submitting: false }));

    // Debug logging for intermittent issues
    const actionType = response.action || response.type;
    console.debug('[TestSession] handleServerResponse:', {
      action: actionType,
      success: response.success,
      hasQuestionState: !!(response.questionState ?? response.question?.questionState),
      hasNavigationContext: !!(response.navigationContext ?? response.question?.navigationContext),
      message: response.message
    });

    if (!response.success) {
      const errorMessage = response.message || 'Server action failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      console.error('[TestSession] Server action failed:', response);
      return;
    }

    // Clear any previous errors on success
    setState(prev => prev.error ? { ...prev, error: null } : prev);

    // Handle both flat structure and nested under 'question'
    const questionState = response.questionState ?? response.question?.questionState;
    const navigationContext = response.navigationContext ?? response.question?.navigationContext;

    switch (actionType) {
      // =====================================================
      // ANSWER SUBMISSION ACTIONS
      // =====================================================

      case 'next_question':
        // Auto-advanced to next question
        if (questionState && navigationContext) {
          setState(prev => ({
            ...prev,
            questionState: questionState,
            navigationContext: navigationContext,
            currentAnswer: questionState.studentAnswer ?? questionState.currentAnswer ?? null,
            hasUnsavedChanges: false,
            isReviewing: false,
            sectionSummary: null,
            error: null,
          }));
          questionStartTimeRef.current = Date.now();
        } else {
          // Missing question data in response - this is a bug, attempt recovery
          console.error('[TestSession] next_question response missing data:', {
            hasQuestionState: !!questionState,
            hasNavigationContext: !!navigationContext,
            response: JSON.stringify(response).substring(0, 500)
          });
          toast.warning('Loading next question...');
          // Attempt to recover by fetching current question from server
          try {
            const currentQuestion = await apiService.getCurrentQuestion(state.sessionId!);
            if (currentQuestion.success && currentQuestion.questionState && currentQuestion.navigationContext) {
              setState(prev => ({
                ...prev,
                questionState: currentQuestion.questionState,
                navigationContext: currentQuestion.navigationContext,
                currentAnswer: currentQuestion.questionState.currentAnswer ?? null,
                hasUnsavedChanges: false,
                isReviewing: false,
                sectionSummary: null,
                error: null,
              }));
              questionStartTimeRef.current = Date.now();
            } else {
              toast.error('Failed to load next question. Please try refreshing.');
            }
          } catch (recoveryError) {
            console.error('[TestSession] Recovery failed:', recoveryError);
            toast.error('Failed to load next question. Please try refreshing.');
          }
        }
        break;

      case 'answer_saved':
        // In review mode - answer saved, stay on current question
        if (questionState && navigationContext) {
          setState(prev => ({
            ...prev,
            questionState: questionState,
            navigationContext: navigationContext,
            currentAnswer: questionState.studentAnswer ?? questionState.currentAnswer,
            hasUnsavedChanges: false,
            error: null,
          }));
          toast.success('Answer saved');
        }
        break;

      case 'section_review':
        // Reached end of section, enter review mode
        setState(prev => ({
          ...prev,
          questionState: questionState ?? prev.questionState,
          navigationContext: navigationContext ?? prev.navigationContext,
          sectionSummary: response.sectionSummary ?? null,
          isReviewing: true,
          hasUnsavedChanges: false,
          error: null,
        }));
        toast.info(response.message || 'Section complete! Review your answers before submitting.');
        break;

      case 'confirm_submit':
        // Non-sectioned test with unanswered questions - prompt to review
        setState(prev => ({
          ...prev,
          questionState: questionState ?? prev.questionState,
          navigationContext: navigationContext ?? prev.navigationContext,
          sectionSummary: response.sectionSummary ?? null,
          isReviewing: true,
          hasUnsavedChanges: false,
          error: null,
        }));
        toast.warning(response.message || 'You have unanswered questions. Review before submitting.');
        break;

      // =====================================================
      // SECTION MANAGEMENT ACTIONS
      // =====================================================

      case 'next_section':
      case 'section_transition':
        // Moving to next section
        if (questionState && navigationContext) {
          // Update timer with new section time
          if (response.timeRemaining !== undefined) {
            setInitialTimerValue(response.timeRemaining);
          }

          setState(prev => ({
            ...prev,
            questionState: questionState,
            navigationContext: navigationContext,
            currentAnswer: questionState.studentAnswer ?? questionState.currentAnswer ?? null,
            hasUnsavedChanges: false,
            isReviewing: false,
            sectionSummary: null,
            error: null,
          }));
          questionStartTimeRef.current = Date.now();

          const sectionName = response.sectionName || response.newSection?.name || navigationContext.currentSection?.name;
          toast.success(response.message || `Starting ${sectionName}`);
        } else {
          // Missing question data for section transition - attempt recovery
          console.error('[TestSession] Section transition response missing data:', {
            action: actionType,
            hasQuestionState: !!questionState,
            hasNavigationContext: !!navigationContext
          });
          toast.warning('Loading next section...');
          try {
            const currentQuestion = await apiService.getCurrentQuestion(state.sessionId!);
            if (currentQuestion.success && currentQuestion.questionState && currentQuestion.navigationContext) {
              if (response.timeRemaining !== undefined) {
                setInitialTimerValue(response.timeRemaining);
              }
              setState(prev => ({
                ...prev,
                questionState: currentQuestion.questionState,
                navigationContext: currentQuestion.navigationContext,
                currentAnswer: currentQuestion.questionState.currentAnswer ?? null,
                hasUnsavedChanges: false,
                isReviewing: false,
                sectionSummary: null,
                error: null,
              }));
              questionStartTimeRef.current = Date.now();
              toast.success('Section loaded');
            } else {
              toast.error('Failed to load next section. Please try refreshing.');
            }
          } catch (recoveryError) {
            console.error('[TestSession] Section transition recovery failed:', recoveryError);
            toast.error('Failed to load next section. Please try refreshing.');
          }
        }
        break;

      case 'review_started':
        // Manually entered review mode
        setState(prev => ({
          ...prev,
          questionState: questionState ?? prev.questionState,
          navigationContext: navigationContext ?? prev.navigationContext,
          sectionSummary: response.sectionSummary ?? null,
          isReviewing: true,
          error: null,
        }));
        toast.info(response.message || 'Review mode started');
        break;

      // =====================================================
      // TEST COMPLETION ACTIONS
      // =====================================================

      case 'test_complete':
        // All sections/questions done - ready to submit
        setState(prev => ({
          ...prev,
          questionState: questionState ?? prev.questionState,
          navigationContext: navigationContext ?? prev.navigationContext,
          sectionSummary: response.sectionSummary ?? null,
          isReviewing: true,
          error: null,
        }));
        toast.success(response.message || 'Test complete! Ready to submit.');
        break;

      case 'test_completed_confirmation':
      case 'test_completion':
        const finalScore = response.finalScore || response.submissionResult?.finalScore;

        if (finalScore) {
          setState(prev => ({
            ...prev,
            finalScore: finalScore,
            isCompleted: true,
            error: null,
          }));

          const currentSessionId = state.sessionId;

          if (currentSessionId) {
            leaveSession(currentSessionId);

            setTimeout(() => {
              resetSessionState();
              navigateToResults(currentSessionId, finalScore, {
                confirmationData: response.confirmationData
              });
            }, 2000);
          }

          toast.success(response.message || 'Test completed successfully! Redirecting to results...', {
            autoClose: 2000
          });
        }
        break;

      case 'test_completed_with_error':
        setState(prev => ({
          ...prev,
          error: response.message || response.error || 'Test completed with errors',
          isCompleted: true,
        }));

        const errorSessionId = state.sessionId;

        if (errorSessionId) {
          leaveSession(errorSessionId);

          setTimeout(() => {
            resetSessionState();
            navigateToResults(errorSessionId, undefined, {
              error: response.message || response.error,
              requiresManualSubmission: response.requiresManualSubmission
            });
          }, 3000);
        }

        toast.error(response.message || 'Test completed but submission failed. Redirecting to results...', {
          autoClose: 3000
        });
        break;

      case 'time_expired':
        // Time ran out
        toast.error(response.message || 'Time expired!');
        // Server will handle auto-submission
        break;

      // =====================================================
      // LEGACY/FALLBACK ACTIONS
      // =====================================================

      case 'stay':
        // Legacy: Answer saved, stay on current question
        if (questionState && navigationContext) {
          setState(prev => ({
            ...prev,
            questionState: questionState,
            navigationContext: navigationContext,
            currentAnswer: questionState.studentAnswer ?? questionState.currentAnswer,
            hasUnsavedChanges: false,
            error: null,
          }));
          toast.success('Answer saved');
        }
        break;

      // =====================================================
      // NAVIGATION ACTIONS (for review mode navigation)
      // =====================================================

      case 'navigate':
      case 'navigated':
      case 'question_navigated':
      case 'question_loaded':
        // Navigation to a different question during review
        // Set isReviewing to false so user can see and edit the question
        // They can use "Review & Submit" button to go back to review summary
        if (questionState && navigationContext) {
          setState(prev => ({
            ...prev,
            questionState: questionState,
            navigationContext: navigationContext,
            currentAnswer: questionState.studentAnswer ?? questionState.currentAnswer ?? null,
            hasUnsavedChanges: false,
            isReviewing: false,
            sectionSummary: null,
            error: null,
          }));
          questionStartTimeRef.current = Date.now();
        } else {
          // Missing question data - attempt recovery
          console.error('[TestSession] Navigation response missing data:', {
            action: actionType,
            hasQuestionState: !!questionState,
            hasNavigationContext: !!navigationContext
          });
          toast.warning('Loading question...');
          try {
            const currentQuestion = await apiService.getCurrentQuestion(state.sessionId!);
            if (currentQuestion.success && currentQuestion.questionState && currentQuestion.navigationContext) {
              setState(prev => ({
                ...prev,
                questionState: currentQuestion.questionState,
                navigationContext: currentQuestion.navigationContext,
                currentAnswer: currentQuestion.questionState.currentAnswer ?? null,
                hasUnsavedChanges: false,
                isReviewing: false,
                sectionSummary: null,
                error: null,
              }));
              questionStartTimeRef.current = Date.now();
            } else {
              toast.error('Failed to load question. Please try refreshing.');
            }
          } catch (recoveryError) {
            console.error('[TestSession] Navigation recovery failed:', recoveryError);
            toast.error('Failed to load question. Please try refreshing.');
          }
        }
        break;

      default:
        // Try to handle any response that has question data
        if (questionState && navigationContext) {
          setState(prev => ({
            ...prev,
            questionState: questionState,
            navigationContext: navigationContext,
            currentAnswer: questionState.studentAnswer ?? questionState.currentAnswer ?? null,
            hasUnsavedChanges: false,
            isReviewing: false, // Exit review mode when navigating to a question
            sectionSummary: null,
            error: null,
          }));
          questionStartTimeRef.current = Date.now();
          // Don't show toast for silent updates - only log for debugging
          console.debug('Handled server action:', actionType);
        } else if (actionType) {
          // Only show error if there was an action type but no question data
          console.warn('Unknown server response:', actionType, response);
          toast.warning(response.message || 'Unexpected server response');
        }
        break;
    }
  }, [state.sessionId, leaveSession, resetSessionState, navigateToResults]);

  // SOCKET EVENT HANDLERS - SIMPLIFIED (timer handled by socket context)
  useEffect(() => {
    if (!state.sessionId) return;

    const cleanup = registerEventHandlers({
      // REMOVED: onTimerSync - socket context handles timer countdown

      onSectionExpired: (data) => {
        toast.info(data.message);
      },

      onTestCompleted: (data) => {
        const finalScore = data.result?.finalScore || data.result;
        const currentSessionId = state.sessionId;

        setState(prev => ({
          ...prev,
          finalScore: finalScore,
          isCompleted: true,
          submitting: false,
        }));

        if (currentSessionId) {
          leaveSession(currentSessionId);

          setTimeout(() => {
            resetSessionState();
            if (finalScore) {
              navigateToResults(currentSessionId, finalScore, { socketCompleted: true });
            } else {
              navigateToResults(currentSessionId, undefined, { socketCompleted: true });
            }
          }, 2000);
        }

        toast.success(data.message + ' Redirecting to results...', {
          autoClose: 2000
        });
      },

      onSessionError: (data) => {
        setState(prev => ({ ...prev, error: data.message }));
        toast.error(data.message);
      },
    });

    socketCleanupRef.current = cleanup;
    return cleanup;
  }, [state.sessionId, registerEventHandlers, leaveSession, resetSessionState, navigateToResults]);

  // SESSION MANAGEMENT
  const checkExistingSession = useCallback(async (): Promise<CheckExistingSessionResponse> => {
    const response: CheckExistingSessionResponse = await apiService.checkExistingSession();

    if (!response.success) {
      throw new Error(response.message || 'Failed to check existing session');
    }

    return response;
  }, []);

  const startSession = useCallback(async (testId: string, forceNew = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response: StartSessionResponse = await apiService.startTestSession({ testId, forceNew });

      if (!response.success) {
        throw new Error(response.message || 'Failed to start test session');
      }

      // FIXED: Set initial timer value from session or navigation context
      const session = response.session as any; // Backend response may differ from types
      const timeRemaining = response.question.navigationContext?.timeRemaining
        ?? session.timeRemaining
        ?? 0;
      setInitialTimerValue(timeRemaining);

      // Construct sessionInfo from response.session (handle both backend formats)
      const sessionInfo = {
        title: session.testTitle ?? session.testInfo?.title ?? '',
        description: session.testDescription ?? session.testInfo?.description ?? '',
        totalQuestions: session.totalQuestions ?? session.testInfo?.totalQuestions ?? 0,
        totalPoints: session.totalPoints ?? session.testInfo?.totalPoints ?? 0,
        timeLimit: session.timeRemaining ?? session.testInfo?.timeLimit ?? 0,
        useSections: session.useSections ?? session.testInfo?.useSections ?? false,
        sectionCount: session.sectionCount ?? session.testInfo?.sectionCount ?? response.question.navigationContext?.totalSections ?? 1,
      };

      setState(prev => ({
        ...prev,
        sessionId: session.sessionId,
        initialized: true,
        questionState: response.question.questionState,
        navigationContext: response.question.navigationContext,
        sessionInfo,
        currentAnswer: response.question.questionState.currentAnswer ?? null,
        loading: false,
      }));

      questionStartTimeRef.current = Date.now();

      await joinSession(response.session.sessionId);

      toast.success(response.message || 'Test session started successfully');

    } catch (error: any) {
      if (error.code === 'EXISTING_SESSION_FOUND' && error.existingSession) {
        setState(prev => ({ ...prev, loading: false }));
        const conflictError = {
          type: 'EXISTING_SESSION_CONFLICT',
          data: {
            success: false as const,
            error: error.error,
            code: error.code as 'EXISTING_SESSION_FOUND',
            existingSession: error.existingSession
          } as StartSessionConflictResponse
        };
        throw conflictError;
      }

      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  }, [joinSession]);

  // FIXED: Rejoin session with initial timer value
  const rejoinSession = useCallback(async (sessionId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response: RejoinSessionResponse = await apiService.rejoinTestSession(sessionId);

      if (!response.success) {
        throw new Error(response.message || 'Failed to rejoin session');
      }

      // FIXED: Set initial timer value for hybrid hook
      const timeRemaining = response.question.navigationContext?.timeRemaining
        ?? response.session.timeRemaining
        ?? 0;
      setInitialTimerValue(timeRemaining);

      // Construct sessionInfo from response.session (rejoin response has different structure)
      const session = response.session as any; // Backend response may differ from types
      const sessionInfo = response.question.sessionInfo ?? {
        title: session.testTitle ?? session.testInfo?.title ?? '',
        description: session.testDescription ?? session.testInfo?.description ?? '',
        totalQuestions: session.totalQuestions ?? session.testInfo?.totalQuestions ?? 0,
        totalPoints: session.totalPoints ?? session.testInfo?.totalPoints ?? 0,
        timeLimit: session.timeRemaining ?? session.testInfo?.timeLimit ?? 0,
        useSections: session.useSections ?? session.testInfo?.useSections ?? false,
        sectionCount: session.sectionCount ?? session.testInfo?.sectionCount ?? response.question.navigationContext?.totalSections ?? 1,
      };

      // Ensure questionState has required fields
      const questionState = {
        ...response.question.questionState,
        viewCount: response.question.questionState.viewCount ?? 1,
      };

      setState(prev => ({
        ...prev,
        sessionId: session.sessionId,
        initialized: true,
        questionState,
        navigationContext: response.question.navigationContext,
        sessionInfo,
        currentAnswer: response.question.questionState.currentAnswer ?? null,
        loading: false,
      }));

      questionStartTimeRef.current = Date.now();

      await joinSession(response.session.sessionId);

      // Request additional timer sync for accuracy
      setTimeout(() => {
        requestTimerSync();
      }, 1000);

      toast.success(response.message || 'Successfully rejoined test session');

    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  }, [joinSession, requestTimerSync]);

  // ANSWER MANAGEMENT
  const updateAnswer = useCallback((answer: any) => {
    setState(prev => ({
      ...prev,
      currentAnswer: answer,
      hasUnsavedChanges: true,
    }));
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!state.sessionId || state.submitting) return;

    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      const timeSpent = questionStartTimeRef.current
        ? Math.floor((Date.now() - questionStartTimeRef.current) / 1000)
        : 0;

      const submitRequest: SubmitAnswerRequest = {
        answer: state.currentAnswer,
        timeSpent,
        action: 'submit',
      };

      const response: ServerActionResponse = await apiService.submitAnswer(state.sessionId, submitRequest);

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit answer');
      }

      await handleServerResponse(response);

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        submitting: false,
        error: error.message
      }));

      toast.error('Failed to submit answer');
    }
  }, [state.sessionId, state.submitting, state.currentAnswer, handleServerResponse]);

  const skipQuestion = useCallback(async (reason?: string) => {
    if (!state.sessionId || state.submitting) return;

    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      const timeSpent = questionStartTimeRef.current
        ? Math.floor((Date.now() - questionStartTimeRef.current) / 1000)
        : 0;

      const skipRequest: SubmitAnswerRequest = {
        answer: null,
        timeSpent,
        action: 'skip',
        skipReason: reason,
      };

      const response: ServerActionResponse = await apiService.submitAnswer(state.sessionId, skipRequest);

      if (!response.success) {
        throw new Error(response.message || 'Failed to skip question');
      }

      await handleServerResponse(response);

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        submitting: false,
        error: error.message
      }));

      toast.error('Failed to skip question');
    }
  }, [state.sessionId, state.submitting, handleServerResponse]);

  // Manual test submission with navigation
  const submitTest = useCallback(async (forceSubmit = false) => {
    if (!state.sessionId || state.submitting) return;

    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      const result = await apiService.submitTestSession(state.sessionId, { forceSubmit });

      const finalScore: SessionFinalScore = result.finalScore || result;
      const currentSessionId = state.sessionId;

      // Immediately disconnect from the session since test is completed
      if (currentSessionId) {
        leaveSession(currentSessionId);
      }

      setState(prev => ({
        ...prev,
        finalScore,
        isCompleted: true,
        submitting: false,
      }));

      setTimeout(() => {
        resetSessionState();
        navigateToResults(currentSessionId, finalScore, { manualSubmission: true });
      }, 2000);

      toast.success('Test submitted successfully! Redirecting to results...', {
        autoClose: 2000
      });

    } catch (error: any) {
      setState(prev => ({ ...prev, submitting: false, error: error.message }));
      toast.error('Failed to submit test');
    }
  }, [state.sessionId, state.submitting, leaveSession, resetSessionState, navigateToResults]);

  const abandonTest = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      await apiService.abandonTestSession(state.sessionId);

      if (state.sessionId) {
        leaveSession(state.sessionId);
      }

      setState(prev => ({
        ...prev,
        sessionId: null,
        initialized: false,
        isCompleted: true,
      }));

      navigate('/dashboard');
      toast.info('Test abandoned');

    } catch (error: any) {
      toast.error('Failed to abandon test');
    }
  }, [state.sessionId, leaveSession, navigate]);

  // =====================================================
  // SECTION-BASED NAVIGATION (NEW)
  // =====================================================

  // Submit current section and move to next
  const submitSection = useCallback(async () => {
    if (!state.sessionId) {
      toast.error('No active session');
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true }));
      const response = await apiService.submitSection(state.sessionId);
      await handleServerResponse(response);
    } catch (error: any) {
      setState(prev => ({ ...prev, submitting: false }));
      toast.error(error.message || 'Failed to submit section');
    }
  }, [state.sessionId, handleServerResponse]);

  // Enter review mode for current section
  const startSectionReview = useCallback(async () => {
    if (!state.sessionId) {
      toast.error('No active session');
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true }));
      const response = await apiService.startSectionReview(state.sessionId);
      await handleServerResponse(response);
    } catch (error: any) {
      setState(prev => ({ ...prev, submitting: false }));
      toast.error(error.message || 'Failed to start review');
    }
  }, [state.sessionId, handleServerResponse]);

  // Navigate to specific question (section-relative index) - only during review
  const navigateToQuestion = useCallback(async (questionIndex: number) => {
    if (!state.sessionId) {
      toast.error('No active session');
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true }));
      const response = await apiService.navigateToQuestion(state.sessionId, questionIndex);
      await handleServerResponse(response);
    } catch (error: any) {
      setState(prev => ({ ...prev, submitting: false }));
      toast.error(error.message || 'Failed to navigate to question');
    }
  }, [state.sessionId, handleServerResponse]);

  const resetSession = useCallback(() => {
    if (state.sessionId) {
      leaveSession(state.sessionId);
    }

    if (socketCleanupRef.current) {
      socketCleanupRef.current();
      socketCleanupRef.current = null;
    }

    setState({
      sessionId: null,
      initialized: false,
      questionState: null,
      navigationContext: null,
      sessionInfo: null,
      loading: false,
      error: null,
      submitting: false,
      currentAnswer: null,
      hasUnsavedChanges: false,
      questionStartTime: null,
      finalScore: null,
      isCompleted: false,
      sectionSummary: null,
      isReviewing: false,
    });

    setInitialTimerValue(null);
    questionStartTimeRef.current = null;
  }, [state.sessionId, leaveSession]);

  const contextValue = useMemo<TestSessionContextValue>(() => ({
    state,
    checkExistingSession,
    startSession,
    rejoinSession,
    updateAnswer,
    submitAnswer,
    skipQuestion,
    submitTest,
    abandonTest,
    submitSection,
    startSectionReview,
    navigateToQuestion,
    resetSession,
    refreshQuestion,
    requestTimerSync,
    formatTimeRemaining,
    timerDisplay,
    networkStatus,
    connectionStatus,
  }), [
    state,
    checkExistingSession,
    startSession,
    rejoinSession,
    updateAnswer,
    submitAnswer,
    skipQuestion,
    submitTest,
    abandonTest,
    submitSection,
    startSectionReview,
    navigateToQuestion,
    resetSession,
    refreshQuestion,
    requestTimerSync,
    formatTimeRemaining,
    timerDisplay,
    networkStatus,
    connectionStatus,
  ]);

  return (
    <TestSessionContext.Provider value={contextValue}>
      {children}
    </TestSessionContext.Provider>
  );
};