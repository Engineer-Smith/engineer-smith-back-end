// TestPreviewPage.tsx - Preview tests using the same UI as actual test sessions
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import QuestionDetailsPane from '../components/TestSessions/QuestionDetailsPane';
import CodeEditorPane from '../components/TestSessions/CodeEditorPane';
import AnswerInputPane from '../components/TestSessions/AnswerInputPane';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import type { Test } from '../types';

interface FlattenedQuestion {
  _id: string;
  title: string;
  description: string;
  type: 'multipleChoice' | 'trueFalse' | 'codeChallenge' | 'fillInTheBlank' | 'codeDebugging' | 'dragDropCloze';
  language?: string;
  category?: 'logic' | 'ui' | 'syntax';
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  points: number;
  options?: string[];
  codeTemplate?: string;
  blanks?: Array<{
    id: string;
    hint?: string;
    points: number;
    correctAnswers?: string[];
  }>;
  dragOptions?: Array<{
    id: string;
    text: string;
  }>;
  buggyCode?: string;
  testCases?: Array<{
    name?: string;
    args: any[];
    expected: any;
    hidden?: boolean;
  }>;
  codeConfig?: {
    runtime: string;
    entryFunction: string;
    timeoutMs: number;
  };
  questionIndex: number;
  sectionIndex?: number;
  sectionName?: string;
}

const TestPreviewPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    if (testId) {
      fetchTestWithQuestions();
    }
  }, [testId]);

  const fetchTestWithQuestions = async () => {
    if (!testId) return;

    try {
      setLoading(true);
      setError(null);

      const testData = await apiService.getTestWithQuestions(testId);

      if (!testData || !testData._id) {
        throw new Error('No test data received');
      }

      setTest(testData);
    } catch (err: any) {
      console.error('TestPreviewPage: Error fetching test:', err);
      setError(err.message || 'Failed to load test preview');
    } finally {
      setLoading(false);
    }
  };

  // Flatten questions from test structure
  const flattenedQuestions: FlattenedQuestion[] = useMemo(() => {
    if (!test) return [];

    const flattened: FlattenedQuestion[] = [];
    let overallIndex = 0;

    if (test.settings?.useSections && test.sections) {
      test.sections.forEach((section, sectionIndex) => {
        section.questions?.forEach((questionRef) => {
          const question = (questionRef as any).questionData;
          if (question) {
            flattened.push({
              ...question,
              _id: question._id,
              points: questionRef.points || 10,
              questionIndex: overallIndex,
              sectionIndex,
              sectionName: section.name
            });
            overallIndex++;
          }
        });
      });
    } else if (test.questions) {
      test.questions.forEach((questionRef, index) => {
        const question = (questionRef as any).questionData;
        if (question) {
          flattened.push({
            ...question,
            _id: question._id,
            points: questionRef.points || 10,
            questionIndex: index
          });
        }
      });
    }

    return flattened;
  }, [test]);

  const currentQuestion = flattenedQuestions[currentQuestionIndex];
  const totalQuestions = flattenedQuestions.length;

  // Build question state for components (matching TestSessionContext format)
  const questionState = useMemo(() => {
    if (!currentQuestion) return null;

    return {
      questionIndex: currentQuestionIndex,
      questionData: {
        title: currentQuestion.title,
        description: currentQuestion.description,
        type: currentQuestion.type,
        language: currentQuestion.language,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        tags: currentQuestion.tags,
        points: currentQuestion.points,
        options: currentQuestion.options,
        codeTemplate: currentQuestion.codeTemplate,
        blanks: currentQuestion.blanks,
        dragOptions: currentQuestion.dragOptions,
        buggyCode: currentQuestion.buggyCode,
        testCases: currentQuestion.testCases?.filter(tc => !tc.hidden),
        codeConfig: currentQuestion.codeConfig
      },
      currentAnswer: answers[currentQuestion._id] ?? null,
      status: 'not_answered',
      timeSpent: 0,
      viewCount: 1
    };
  }, [currentQuestion, currentQuestionIndex, answers]);

  // Navigation
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const navigateToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
      setShowOverview(false);
    }
  }, [totalQuestions]);

  // Answer handling (for preview interactivity)
  const updateAnswer = useCallback((answer: any) => {
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion._id]: answer
      }));
    }
  }, [currentQuestion]);

  const clearAnswer = useCallback(() => {
    if (currentQuestion) {
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion._id];
        return newAnswers;
      });
    }
  }, [currentQuestion]);

  // Reset code for code questions
  const handleResetCode = useCallback(() => {
    if (!currentQuestion) return;

    let initialCode = '';
    if (currentQuestion.type === 'codeDebugging' && currentQuestion.buggyCode) {
      initialCode = currentQuestion.buggyCode;
    } else if (currentQuestion.type === 'codeChallenge' && currentQuestion.codeTemplate) {
      initialCode = currentQuestion.codeTemplate;
    }

    if (initialCode) {
      updateAnswer(initialCode);
    }
  }, [currentQuestion, updateAnswer]);

  const handleBack = () => {
    navigate('/admin/tests');
  };

  // Section info
  const sectionInfo = useMemo(() => {
    if (!currentQuestion || !test?.settings?.useSections) return undefined;

    const sectionQuestions = flattenedQuestions.filter(
      q => q.sectionIndex === currentQuestion.sectionIndex
    );
    const currentInSection = sectionQuestions.findIndex(
      q => q.questionIndex === currentQuestionIndex
    );

    return {
      name: currentQuestion.sectionName || 'Section',
      current: currentInSection + 1,
      total: sectionQuestions.length
    };
  }, [currentQuestion, test?.settings?.useSections, flattenedQuestions, currentQuestionIndex]);

  // Progress calculation
  const progressPercentage = totalQuestions > 0
    ? ((currentQuestionIndex + 1) / totalQuestions) * 100
    : 0;

  // Check authorization
  if (!isAuthenticated || !user || !['admin', 'instructor'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-6 border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <strong className="text-red-400">Access Denied</strong>
            </div>
            <p className="text-[#a1a1aa]">
              Only administrators and instructors can preview tests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#6b6b70]">Loading test preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card p-6 border-red-500/30 bg-red-500/5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <strong className="text-red-400">Error Loading Test</strong>
            </div>
            <p className="text-[#a1a1aa]">{error}</p>
          </div>
          <button className="btn-secondary flex items-center gap-2" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (!test || !currentQuestion || !questionState) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-12 h-12 text-[#6b6b70] mx-auto mb-3" />
          <h5 className="text-[#f5f5f4] font-semibold mb-2">No Questions Available</h5>
          <p className="text-[#6b6b70] mb-4">
            This test doesn't have any questions yet or they couldn't be loaded.
          </p>
          <button className="btn-secondary flex items-center gap-2 mx-auto" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const questionType = currentQuestion.type;
  const isCodeQuestion = questionType === 'codeChallenge' || questionType === 'codeDebugging';
  const isFillInBlank = questionType === 'fillInTheBlank';
  const isDragDropCloze = questionType === 'dragDropCloze';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-[#141416] border-b border-[#2a2a2e]">
        <div className="container-section py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="btn-secondary text-sm py-1.5 flex items-center gap-1"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Preview
              </button>
              <div>
                <h2 className="font-mono font-semibold flex items-center gap-2">
                  {test.title}
                  <span className="badge-blue text-xs flex items-center gap-1">
                    <Eye size={12} />
                    Preview
                  </span>
                </h2>
                <p className="text-xs text-[#6b6b70]">
                  Admin preview - answers are not saved
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="text-center mb-2">
                <span className="text-sm text-[#6b6b70]">
                  {sectionInfo ? (
                    <>Section: <strong className="text-[#a1a1aa]">{sectionInfo.name}</strong> • Question {sectionInfo.current} of {sectionInfo.total}</>
                  ) : (
                    <>Question {currentQuestionIndex + 1} of {totalQuestions}</>
                  )}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill bg-blue-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="btn-secondary text-sm py-1.5 flex items-center gap-2"
                onClick={() => setShowOverview(true)}
              >
                <Menu className="w-4 h-4" />
                <span className="hidden md:inline">Overview</span>
              </button>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6b6b70]" />
                  <span className="font-mono font-bold text-lg text-[#6b6b70]">
                    --:--
                  </span>
                </div>
                <p className="text-xs text-[#6b6b70]">Preview mode</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showOverview ? (
          /* Question Overview Panel */
          <div className="h-full flex flex-col bg-[#0a0a0b]">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h3 className="font-mono font-semibold">Question Overview</h3>
              <button
                className="btn-secondary text-sm"
                onClick={() => setShowOverview(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {flattenedQuestions.map((q, index) => {
                  const isAnswered = answers[q._id] !== undefined;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={q._id}
                      onClick={() => navigateToQuestion(index)}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center font-mono text-sm
                        transition-all border
                        ${isCurrent
                          ? 'bg-blue-500 text-white border-blue-500'
                          : isAnswered
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-[#1c1c1f] text-[#a1a1aa] border-[#2a2a2e] hover:border-[#3a3a3e]'
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-[#6b6b70]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#1c1c1f] border border-[#2a2a2e]" />
                  <span>Not Answered</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Question View */
          <div className="h-full flex flex-col">
            <div className="flex flex-1 overflow-hidden">
              {/* Layout based on question type - matching QuestionLayoutManager */}
              {isCodeQuestion ? (
                /* 3-pane layout for code questions (25% | 50% | 25%) */
                <>
                  {/* Left: Question Details */}
                  <div className="w-1/4 min-w-[280px] border-r border-[#2a2a2e] overflow-hidden flex-shrink-0">
                    <QuestionDetailsPane
                      question={questionState}
                      sectionInfo={sectionInfo}
                      showTestCases={true}
                    />
                  </div>

                  {/* Middle: Code Editor */}
                  <div className="flex-1 min-w-[500px] border-r border-[#2a2a2e] overflow-hidden">
                    <CodeEditorPane
                      question={questionState}
                      currentAnswer={answers[currentQuestion._id] || ''}
                      updateAnswer={updateAnswer}
                      onReset={handleResetCode}
                    />
                  </div>

                  {/* Right: Preview notice (no actual test results in preview) */}
                  <div className="w-1/4 min-w-[280px] overflow-hidden flex-shrink-0 bg-[#0f0f11]">
                    <div className="h-full flex flex-col">
                      <div className="p-4 border-b border-[#2a2a2e]">
                        <h3 className="font-mono font-semibold text-sm flex items-center gap-2">
                          <Eye size={16} className="text-blue-400" />
                          Test Results
                        </h3>
                      </div>
                      <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                            <Eye className="w-6 h-6 text-blue-400" />
                          </div>
                          <p className="text-[#6b6b70] text-sm">
                            Code execution is disabled in preview mode.
                          </p>
                          <p className="text-[#6b6b70] text-xs mt-2">
                            Students will see test results here when taking the actual test.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : isFillInBlank ? (
                /* 2-pane layout for fill-in-blank (30/70 split) */
                <>
                  <div className="w-[30%] min-w-[250px] border-r border-[#2a2a2e] overflow-hidden">
                    <QuestionDetailsPane
                      question={questionState}
                      sectionInfo={sectionInfo}
                      showTestCases={false}
                    />
                  </div>
                  <div className="w-[70%] min-w-[400px] overflow-hidden">
                    <AnswerInputPane
                      question={questionState}
                      currentAnswer={answers[currentQuestion._id]}
                      updateAnswer={updateAnswer}
                      onClearAnswer={clearAnswer}
                    />
                  </div>
                </>
              ) : isDragDropCloze ? (
                /* 2-pane layout for drag-drop-cloze (25/75 split) */
                <>
                  <div className="w-[25%] min-w-[220px] border-r border-[#2a2a2e] overflow-hidden">
                    <QuestionDetailsPane
                      question={questionState}
                      sectionInfo={sectionInfo}
                      showTestCases={false}
                    />
                  </div>
                  <div className="w-[75%] min-w-[500px] overflow-hidden">
                    <AnswerInputPane
                      question={questionState}
                      currentAnswer={answers[currentQuestion._id]}
                      updateAnswer={updateAnswer}
                      onClearAnswer={clearAnswer}
                    />
                  </div>
                </>
              ) : (
                /* 2-pane layout for MC/TF (50/50 split) */
                <>
                  <div className="w-1/2 min-w-[300px] border-r border-[#2a2a2e] overflow-hidden">
                    <QuestionDetailsPane
                      question={questionState}
                      sectionInfo={sectionInfo}
                      showTestCases={false}
                    />
                  </div>
                  <div className="w-1/2 min-w-[300px] overflow-hidden">
                    <AnswerInputPane
                      question={questionState}
                      currentAnswer={answers[currentQuestion._id]}
                      updateAnswer={updateAnswer}
                      onClearAnswer={clearAnswer}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Navigation Bar */}
            <div className="border-t border-[#2a2a2e] bg-[#141416] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="btn-secondary text-sm flex items-center gap-1"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#6b6b70]">
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </span>
                  {answers[currentQuestion._id] !== undefined && (
                    <span className="badge-green text-xs">Answered</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="btn-secondary text-sm"
                    onClick={clearAnswer}
                    disabled={answers[currentQuestion._id] === undefined}
                  >
                    Clear
                  </button>
                  <button
                    className="btn-primary text-sm flex items-center gap-1"
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPreviewPage;
