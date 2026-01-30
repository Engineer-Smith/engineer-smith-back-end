// TestSessionPage.tsx - Complete implementation with proper abandon functionality
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  AlertTriangle,
  Clock,
  Menu,
  Send,
  WifiOff,
  X
} from 'lucide-react';
import QuestionLayoutManager from '../components/TestSessions/QuestionLayoutManager';
import QuestionOverviewPanel from '../components/TestSessions/QuestionOverviewPanel';
import ReviewModePane from '../components/TestSessions/ReviewModePane';
import { useAuth } from '../context/AuthContext';
import { useTestSession } from '../context/TestSessionContext';

// Browser navigation protection hook
const useTestSessionNavigation = (sessionId: string | null, hasUnsavedChanges: boolean = false) => {
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isLeavingRef.current) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    const handleUnload = () => {
      if (!isLeavingRef.current) {
        isLeavingRef.current = true;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload, { passive: false });
    window.addEventListener('unload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [sessionId, hasUnsavedChanges]);

  const manualLeave = useCallback(() => {
    if (sessionId && !isLeavingRef.current) {
      isLeavingRef.current = true;
    }
  }, [sessionId]);

  return { manualLeave };
};

// Connection status alert component
const ConnectionStatus = ({ isOnline }: { isOnline: boolean }) => {
  if (isOnline) return null;

  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 flex items-center gap-3 mb-4">
      <WifiOff className="w-5 h-5 text-red-500" />
      <div>
        <strong className="text-red-400">No Internet Connection:</strong>
        <span className="text-[#a1a1aa] ml-2">You are offline. Your session will be paused until you reconnect.</span>
      </div>
    </div>
  );
};

// Session restoration alert component
const SessionRestorationAlert = ({
  show,
  onRejoin,
  onNewSession,
  loading = false,
  sessionData
}: {
  show: boolean;
  onRejoin: () => void;
  onNewSession: () => void;
  loading?: boolean;
  sessionData?: any;
}) => {
  if (!show) return null;

  return (
    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium mb-2">
            <strong>Existing Session Found:</strong> You have an active test session that can be resumed.
          </p>
          {sessionData && (
            <div className="text-sm text-[#6b6b70] mb-3">
              Test: {sessionData.testTitle} • Progress: {sessionData.currentQuestionIndex + 1} of {sessionData.totalQuestions}
            </div>
          )}
          <div className="flex gap-3">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={onRejoin}
              disabled={loading}
            >
              {loading && <div className="spinner w-4 h-4" />}
              Resume Session
            </button>
            <button
              className="btn-secondary"
              onClick={onNewSession}
              disabled={loading}
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recovery failure alert component - shown when session couldn't be recovered due to technical issues
const RecoveryFailureAlert = ({
  show,
  message,
  onStartFresh,
  loading = false
}: {
  show: boolean;
  message: string;
  onStartFresh: () => void;
  loading?: boolean;
}) => {
  if (!show) return null;

  return (
    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-purple-400 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium mb-2 text-purple-300">
            <strong>Technical Issue</strong>
          </p>
          <p className="text-[#a1a1aa] mb-3">
            {message}
          </p>
          <div className="text-sm text-[#6b6b70] mb-3">
            This incident has been logged and will not affect your attempt limit.
          </div>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={onStartFresh}
            disabled={loading}
          >
            {loading && <div className="spinner w-4 h-4" />}
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
};

const TestSessionContent = memo(() => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    state,
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
    timerDisplay,
    networkStatus,
    connectionStatus
  } = useTestSession();

  // Local UI state
  const [initializationState, setInitializationState] = useState<'idle' | 'starting' | 'completed' | 'error'>('idle');
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [showRestorationAlert, setShowRestorationAlert] = useState(false);
  const [restorationLoading, setRestorationLoading] = useState(false);
  const [existingSessionData, setExistingSessionData] = useState<any>(null);
  const [showRecoveryFailure, setShowRecoveryFailure] = useState(false);
  const [recoveryFailureMessage, setRecoveryFailureMessage] = useState('');

  // Refs
  const initializationAttempted = useRef(false);
  const mountedRef = useRef(true);

  const { manualLeave } = useTestSessionNavigation(
    state.sessionId,
    state.hasUnsavedChanges
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Main initialization effect
  useEffect(() => {
    if (!testId || !user || user.role !== 'student') return;
    if (initializationState !== 'idle' || initializationAttempted.current) return;

    initializationAttempted.current = true;
    setInitializationState('starting');

    const performInitialization = async () => {
      try {
        await startSession(testId);
        if (mountedRef.current) {
          setInitializationState('completed');
        }
      } catch (error: any) {
        // Check for recovery failure (technical issue that doesn't count against attempts)
        const errorMessage = error.message || error.data?.message || '';
        if (errorMessage.includes('technical issue') || error.data?.wasRecoveryFailed) {
          if (mountedRef.current) {
            setRecoveryFailureMessage(errorMessage || 'Previous session could not be recovered due to a technical issue. This will not count against your attempts.');
            setShowRecoveryFailure(true);
            setInitializationState('completed');
          }
          return;
        }

        if (error.type === 'EXISTING_SESSION_CONFLICT' && error.data?.existingSession) {
          try {
            const sessionId = error.data.existingSession.sessionId;
            await rejoinSession(sessionId);
            if (mountedRef.current) {
              setInitializationState('completed');
            }
            return;
          } catch {
            setExistingSessionData(error.data.existingSession);
            setShowRestorationAlert(true);
            setInitializationState('completed');
            return;
          }
        }
        if (mountedRef.current) {
          setInitializationState('error');
        }
      }
    };

    const timeoutId = setTimeout(performInitialization, 0);
    return () => clearTimeout(timeoutId);
  }, [testId, user?.role, startSession, rejoinSession]);

  const handleRejoinSession = useCallback(async () => {
    if (!existingSessionData?.sessionId) return;
    setRestorationLoading(true);
    try {
      await rejoinSession(existingSessionData.sessionId);
      setShowRestorationAlert(false);
      setInitializationState('completed');
      toast.success('Successfully rejoined your test session!');
    } catch {
      toast.error('Failed to rejoin session. Please try starting fresh.');
      setInitializationState('error');
    } finally {
      setRestorationLoading(false);
    }
  }, [existingSessionData?.sessionId, rejoinSession]);

  const handleNewSession = useCallback(async () => {
    if (!testId) return;
    setRestorationLoading(true);
    try {
      setShowRestorationAlert(false);
      await startSession(testId, true);
      setInitializationState('completed');
      toast.info('Started fresh test session');
    } catch {
      toast.error('Failed to start new session');
      setInitializationState('error');
    } finally {
      setRestorationLoading(false);
    }
  }, [testId, startSession]);

  const handleStartFreshFromRecoveryFailure = useCallback(async () => {
    if (!testId) return;
    setRestorationLoading(true);
    try {
      setShowRecoveryFailure(false);
      await startSession(testId, true);
      setInitializationState('completed');
      toast.success('New test session started successfully');
    } catch {
      toast.error('Failed to start new session');
      setInitializationState('error');
    } finally {
      setRestorationLoading(false);
    }
  }, [testId, startSession]);

  const handleAbandonTest = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to abandon this test? Your progress will be lost and you cannot continue this attempt.'
    );
    if (!confirmed) return;
    try {
      manualLeave();
      await abandonTest();
    } catch (error: any) {
      toast.error(error.message || 'Failed to abandon test');
    }
  }, [abandonTest, manualLeave]);

  const handleSafeNavigate = useCallback(() => {
    manualLeave();
    navigate('/dashboard');
  }, [navigate, manualLeave]);

  const handleRetry = useCallback(() => {
    initializationAttempted.current = false;
    setInitializationState('idle');
    setShowRestorationAlert(false);
    setExistingSessionData(null);
  }, []);

  const handleSubmitAnswer = useCallback(async () => {
    try {
      await submitAnswer();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    }
  }, [submitAnswer]);

  const handleSkipQuestion = useCallback(async () => {
    try {
      await skipQuestion();
    } catch (error: any) {
      toast.error(error.message || 'Failed to skip question');
    }
  }, [skipQuestion]);

  const handleSubmitTest = useCallback(async () => {
    try {
      await submitTest();
      toast.success('Test submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit test');
    }
  }, [submitTest]);

  const handleSubmitSection = useCallback(async () => {
    try {
      await submitSection();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit section');
    }
  }, [submitSection]);

  const handleStartReview = useCallback(async () => {
    try {
      await startSectionReview();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start review');
    }
  }, [startSectionReview]);

  const handleNavigateToQuestion = useCallback(async (questionIndex: number) => {
    try {
      await navigateToQuestion(questionIndex);
    } catch (error: any) {
      toast.error(error.message || 'Failed to navigate to question');
    }
  }, [navigateToQuestion]);

  const handleNavigatePrevious = useCallback(async () => {
    const currentIndex = state.questionState?.questionIndex ?? 0;
    if (currentIndex > 0) {
      try {
        await navigateToQuestion(currentIndex - 1);
      } catch (error: any) {
        toast.error(error.message || 'Failed to navigate to previous question');
      }
    }
  }, [state.questionState?.questionIndex, navigateToQuestion]);

  // Computed values
  const overallProgressPercentage = state.sessionInfo?.totalQuestions
    ? (((state.questionState?.questionIndex ?? 0) + 1) / state.sessionInfo.totalQuestions) * 100
    : 0;
  const displayProgress = Math.round(overallProgressPercentage);

  const sectionInfo = useMemo(() => {
    const currentSection = state.navigationContext?.currentSection;
    if (!state.sessionInfo?.useSections || !currentSection) return null;
    return {
      name: currentSection.name || `Section ${currentSection.index + 1}`,
      current: (state.navigationContext?.currentQuestionIndex ?? 0) + 1,
      total: currentSection.questionCount ?? state.navigationContext?.totalQuestionsInSection ?? 0,
      status: currentSection.status,
      isReviewing: state.isReviewing,
    };
  }, [state.navigationContext, state.sessionInfo?.useSections, state.isReviewing]);

  const isLoading = initializationState === 'starting' || state.loading;
  // Only show error screen for initialization errors, not runtime errors
  // Runtime errors (like navigation failures) are shown via toast notifications
  const hasInitializationError = initializationState === 'error';
  const isInitialized = initializationState === 'completed' && state.initialized;

  // LOADING STATE
  if (isLoading && !showRestorationAlert && !showRecoveryFailure) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="text-center">
          <div className="spinner w-10 h-10 mb-4 mx-auto" />
          <h2 className="font-mono text-xl font-semibold mb-2">
            {initializationState === 'starting' && 'Starting test session...'}
            {state.loading && 'Loading test session...'}
          </h2>
          <p className="text-[#6b6b70]">Please wait while we prepare your test.</p>
          <p className="text-xs text-[#6b6b70] mt-2">Test ID: {testId}</p>
        </div>
      </div>
    );
  }

  // RECOVERY FAILURE STATE - Technical issue that doesn't count against attempts
  if (showRecoveryFailure) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-lg w-full">
          <RecoveryFailureAlert
            show={showRecoveryFailure}
            message={recoveryFailureMessage}
            onStartFresh={handleStartFreshFromRecoveryFailure}
            loading={restorationLoading}
          />
          <div className="text-center">
            <button className="btn-secondary flex items-center gap-2 mx-auto" onClick={handleSafeNavigate}>
              <X className="w-4 h-4" />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE - Only for initialization errors
  if (hasInitializationError && !showRestorationAlert) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-lg w-full">
          <div className="card p-6 border-red-500/30 bg-red-500/5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <strong className="text-red-400">Error Loading Session</strong>
            </div>
            <p className="text-[#a1a1aa]">{state.error || 'Failed to initialize session'}</p>
          </div>
          <p className="text-[#6b6b70] text-sm mb-4">Test ID: <code className="bg-[#2a2a2e] px-2 py-0.5 rounded">{testId}</code></p>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={handleRetry}>Retry</button>
            <button className="btn-danger flex items-center gap-2" onClick={handleAbandonTest}>
              <X className="w-4 h-4" />
              Cancel & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SESSION RESTORATION STATE
  if (showRestorationAlert) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-lg w-full">
          <SessionRestorationAlert
            show={showRestorationAlert}
            onRejoin={handleRejoinSession}
            onNewSession={handleNewSession}
            loading={restorationLoading}
            sessionData={existingSessionData}
          />
          <div className="text-center">
            <button className="btn-danger flex items-center gap-2 mx-auto" onClick={handleAbandonTest}>
              <X className="w-4 h-4" />
              Cancel & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN TEST INTERFACE
  if (isInitialized && state.sessionInfo && state.questionState) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col bg-[#0a0a0b]">
        <ToastContainer position="top-right" autoClose={3000} />

        <ConnectionStatus isOnline={networkStatus.isOnline} />

        {/* Header - Always visible */}
        <div className="bg-[#141416] border-b border-[#2a2a2e]">
          <div className="container-section py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="btn-danger text-sm py-1.5 flex items-center gap-1"
                  onClick={handleAbandonTest}
                  title="Abandon test and return to dashboard"
                >
                  <X className="w-4 h-4" />
                  Abandon Test
                </button>
                <div>
                  <h2 className="font-mono font-semibold">{state.sessionInfo.title}</h2>
                  <p className="text-xs text-[#6b6b70]">
                    {state.isReviewing ? 'Reviewing Answers' : 'Taking Test'}
                  </p>
                </div>
              </div>

              <div className="flex-1 max-w-md mx-8">
                <div className="text-center mb-2">
                  <span className="text-sm text-[#6b6b70]">
                    {state.sessionInfo.useSections && sectionInfo ? (
                      <>Section: <strong className="text-[#a1a1aa]">{sectionInfo.name}</strong> • Question {sectionInfo.current} of {sectionInfo.total}</>
                    ) : (
                      <>Question {(state.questionState.questionIndex ?? 0) + 1} of {state.sessionInfo.totalQuestions}</>
                    )}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${displayProgress}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  className="btn-secondary text-sm py-1.5 flex items-center gap-2"
                  onClick={() => setIsOverviewOpen(true)}
                  disabled={!state.navigationContext}
                  title="View question overview and progress"
                >
                  <Menu className="w-4 h-4" />
                  <span className="hidden md:inline">Overview</span>
                </button>
                {/* Review & Submit button - only show when NOT in review mode */}
                {!state.isReviewing && (
                  <button
                    className="btn-primary text-sm py-1.5 flex items-center gap-2"
                    onClick={handleStartReview}
                    disabled={state.submitting}
                    title="Review your answers and submit the test"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden md:inline">Review & Submit</span>
                  </button>
                )}
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#6b6b70]" />
                    <span className="font-mono font-bold text-lg">
                      {timerDisplay.formatTimeRemaining()}
                    </span>
                    {!networkStatus.isOnline && (
                      <span className="badge-amber text-xs">Offline</span>
                    )}
                    {!connectionStatus.isConnected && (
                      <span className="badge-red text-xs">Disconnected</span>
                    )}
                  </div>
                  <p className="text-xs text-[#6b6b70]">
                    {state.sessionInfo.useSections ? 'Section time' : 'Test time'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {isOverviewOpen && state.navigationContext ? (
            /* Inline Question Overview Panel */
            <QuestionOverviewPanel
              navigation={state.navigationContext}
              onNavigateToQuestion={handleNavigateToQuestion}
              onClose={() => setIsOverviewOpen(false)}
              submitting={state.submitting}
            />
          ) : state.isReviewing ? (
            /* Full Review Mode Pane */
            <ReviewModePane
              sessionInfo={state.sessionInfo}
              sectionSummary={state.sectionSummary}
              navigationContext={state.navigationContext}
              currentQuestionIndex={state.questionState?.questionIndex ?? 0}
              onNavigateToQuestion={handleNavigateToQuestion}
              onSubmitSection={handleSubmitSection}
              onSubmitTest={handleSubmitTest}
              submitting={state.submitting}
              timerDisplay={timerDisplay.formatTimeRemaining()}
            />
          ) : (
            /* Regular Question View */
            <div className="h-full px-4 py-2">
              <QuestionLayoutManager
                sessionId={state.sessionId || ''}
                currentQuestion={state.questionState}
                currentAnswer={state.currentAnswer}
                updateAnswer={updateAnswer}
                sectionInfo={sectionInfo || undefined}
                canNavigateBackward={state.navigationContext?.canGoBack ?? false}
                canNavigateForward={state.navigationContext?.canGoForward ?? false}
                isNavigating={state.submitting}
                onSubmitAnswer={handleSubmitAnswer}
                onSkip={handleSkipQuestion}
                onSubmitTest={handleSubmitTest}
                submitting={state.submitting}
                onClearAnswer={() => updateAnswer(null)}
                onNavigatePrevious={handleNavigatePrevious}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // FALLBACK STATE
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-lg w-full">
        <div className="card p-6 border-amber-500/30 bg-amber-500/5 mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <div>
              <strong className="text-amber-400">Session Not Ready</strong>
              <p className="text-[#a1a1aa] text-sm mt-1">The test session is not yet available.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary" onClick={handleRetry}>Try Again</button>
          <button className="btn-secondary flex items-center gap-2" onClick={handleSafeNavigate}>
            <X className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
});

const TestSessionPage = () => {
  return <TestSessionContent />;
};

export default TestSessionPage;
