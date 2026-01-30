// components/TestSessions/QuestionLayoutManager.tsx - Split pane layout with Tailwind CSS
import React from 'react';
import QuestionDetailsPane from './QuestionDetailsPane';
import CodeEditorPane from './CodeEditorPane';
import AnswerInputPane from './AnswerInputPane';
import TestResultsPane from './TestResultsPane';
import NavigationBar from './NavigationBar';

interface QuestionLayoutManagerProps {
  // Session ID for API calls
  sessionId: string;
  // Current question state from TestSessionContext
  currentQuestion: {
    questionIndex: number;
    questionData: {
      title: string;
      description: string;
      type: 'multipleChoice' | 'trueFalse' | 'codeChallenge' | 'fillInTheBlank' | 'codeDebugging' | 'dragDropCloze';
      language?: string;
      category?: 'logic' | 'ui' | 'syntax';
      difficulty: 'easy' | 'medium' | 'hard';
      tags?: string[];
      points: number;
      options?: string[];
      correctAnswer?: any;
      codeTemplate?: string;
      blanks?: Array<{
        id: string;
        hint?: string;
        points: number;
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
    };
    currentAnswer: any;
    status: string;
    timeSpent: number;
    viewCount: number;
    isReviewPhase?: boolean;
    skippedQuestionsRemaining?: number;
  };

  currentAnswer: any;
  updateAnswer: (answer: any) => void;

  // Section info from TestSessionPage
  sectionInfo?: {
    name: string;
    current: number;
    total: number;
    timeLimit?: number;
    status?: 'not_started' | 'in_progress' | 'reviewing' | 'submitted';
    isReviewing?: boolean;
  };

  // Navigation capabilities from NavigationContext
  canNavigateBackward: boolean;
  canNavigateForward: boolean;
  isNavigating: boolean;

  // Actions that match TestSessionPage handlers
  onSubmitAnswer?: () => Promise<void>;
  onSkip?: () => Promise<void>;
  onSubmitTest?: () => Promise<void>;
  onClearAnswer?: () => void;
  onNavigatePrevious?: () => Promise<void>;

  // Submission state
  submitting?: boolean;
}

const QuestionLayoutManager: React.FC<QuestionLayoutManagerProps> = ({
  sessionId,
  currentQuestion,
  currentAnswer,
  updateAnswer,
  sectionInfo,
  canNavigateBackward,
  canNavigateForward,
  isNavigating,
  onSubmitAnswer,
  onSkip,
  onSubmitTest,
  onClearAnswer,
  onNavigatePrevious,
  submitting = false,
}) => {
  const questionType = currentQuestion.questionData?.type;
  const isCodeQuestion = questionType === 'codeChallenge' || questionType === 'codeDebugging';
  const isFillInBlank = questionType === 'fillInTheBlank';
  const isDragDropCloze = questionType === 'dragDropCloze';

  // Handle code reset for code questions
  const handleResetCode = () => {
    if (currentQuestion.questionData) {
      const questionData = currentQuestion.questionData;
      let initialCode = '';

      if (questionData.type === 'codeDebugging' && questionData.buggyCode) {
        initialCode = questionData.buggyCode;
      } else if (questionData.type === 'codeChallenge' && questionData.codeTemplate) {
        initialCode = questionData.codeTemplate;
      }

      if (initialCode) {
        updateAnswer(initialCode);
      }
    }
  };

  // Common NavigationBar props
  const navigationBarProps = {
    currentQuestion,
    currentAnswer,
    sectionInfo,
    canNavigateBackward,
    canNavigateForward,
    isNavigating,
    onSubmitAnswer,
    onSkip,
    onSubmitTest,
    onClearAnswer,
    onNavigatePrevious,
    submitting,
  };

  // For code questions: 3-pane layout (Details | Editor | Results)
  // Editor gets 50% of space, question and results split the remaining 50%
  if (isCodeQuestion) {
    return (
      <div className="h-full flex flex-col">
        {/* 3-Pane Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Pane: Question Details - 25% */}
          <div className="w-1/4 min-w-[280px] border-r border-[#2a2a2e] overflow-hidden flex-shrink-0">
            <QuestionDetailsPane
              question={currentQuestion}
              sectionInfo={sectionInfo}
              showTestCases={true}
            />
          </div>

          {/* Middle Pane: Code Editor - 50% (flexible, takes remaining space) */}
          <div className="flex-1 min-w-[500px] border-r border-[#2a2a2e] overflow-hidden">
            <CodeEditorPane
              question={currentQuestion}
              currentAnswer={currentAnswer || ''}
              updateAnswer={updateAnswer}
              onReset={handleResetCode}
            />
          </div>

          {/* Right Pane: Test Results - 25% */}
          <div className="w-1/4 min-w-[280px] overflow-hidden flex-shrink-0">
            <TestResultsPane
              sessionId={sessionId}
              question={currentQuestion}
              studentCode={currentAnswer || ''}
            />
          </div>
        </div>

        {/* Navigation Bar */}
        <NavigationBar {...navigationBarProps} />
      </div>
    );
  }

  // For fill-in-blank: 2-pane layout (30/70 split)
  if (isFillInBlank) {
    return (
      <div className="h-full flex flex-col">
        {/* 2-Pane Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question Details (smaller) */}
          <div className="w-[30%] min-w-[250px] border-r border-[#2a2a2e] overflow-hidden">
            <QuestionDetailsPane
              question={currentQuestion}
              sectionInfo={sectionInfo}
              showTestCases={false}
            />
          </div>

          {/* Right: Fill-in-blank input (larger) */}
          <div className="w-[70%] min-w-[400px] overflow-hidden">
            <AnswerInputPane
              question={currentQuestion}
              currentAnswer={currentAnswer}
              updateAnswer={updateAnswer}
              onClearAnswer={onClearAnswer}
            />
          </div>
        </div>

        {/* Navigation Bar */}
        <NavigationBar {...navigationBarProps} />
      </div>
    );
  }

  // For drag-drop-cloze: 2-pane layout (25/75 split) - needs more space for drag-drop UI
  if (isDragDropCloze) {
    return (
      <div className="h-full flex flex-col">
        {/* 2-Pane Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question Details (smaller) */}
          <div className="w-[25%] min-w-[220px] border-r border-[#2a2a2e] overflow-hidden">
            <QuestionDetailsPane
              question={currentQuestion}
              sectionInfo={sectionInfo}
              showTestCases={false}
            />
          </div>

          {/* Right: Drag-drop cloze interface (larger) */}
          <div className="w-[75%] min-w-[500px] overflow-hidden">
            <AnswerInputPane
              question={currentQuestion}
              currentAnswer={currentAnswer}
              updateAnswer={updateAnswer}
              onClearAnswer={onClearAnswer}
            />
          </div>
        </div>

        {/* Navigation Bar */}
        <NavigationBar {...navigationBarProps} />
      </div>
    );
  }

  // For other questions (multiple choice, true/false): 2-pane layout (50/50 split)
  return (
    <div className="h-full flex flex-col">
      {/* 2-Pane Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Question Details */}
        <div className="w-1/2 min-w-[300px] border-r border-[#2a2a2e] overflow-hidden">
          <QuestionDetailsPane
            question={currentQuestion}
            sectionInfo={sectionInfo}
            showTestCases={false}
          />
        </div>

        {/* Right Pane: Answer Input */}
        <div className="w-1/2 min-w-[300px] overflow-hidden">
          <AnswerInputPane
            question={currentQuestion}
            currentAnswer={currentAnswer}
            updateAnswer={updateAnswer}
            onClearAnswer={onClearAnswer}
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <NavigationBar {...navigationBarProps} />
    </div>
  );
};

export default QuestionLayoutManager;