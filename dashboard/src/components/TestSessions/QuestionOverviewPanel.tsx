// components/TestSessions/QuestionOverviewPanel.tsx - Inline overview panel with question details
import React from 'react';
import { CheckCircle, Circle, SkipForward, ArrowLeft, Code, FileText } from 'lucide-react';
import type { NavigationContext } from '../../types/session';

// Question summary from server
interface QuestionSummary {
  index: number;
  question: string;
  type: string;
  options?: string[];
  studentAnswer: any;
  status: 'answered' | 'skipped' | 'viewed' | 'not_viewed';
}

interface QuestionOverviewPanelProps {
  navigation: NavigationContext & {
    questionSummaries?: QuestionSummary[];
  };
  onNavigateToQuestion: (index: number) => Promise<void>;
  onClose: () => void;
  submitting?: boolean;
}

const QuestionOverviewPanel: React.FC<QuestionOverviewPanelProps> = ({
  navigation,
  onNavigateToQuestion,
  onClose,
  submitting = false,
}) => {
  const questionSummaries = (navigation as any)?.questionSummaries ?? [];
  const answeredQuestions = navigation?.answeredQuestions ?? [];
  const skippedQuestions = navigation?.skippedQuestions ?? [];
  const totalQuestions = navigation?.totalQuestionsInSection ?? navigation?.totalQuestions ?? questionSummaries.length;
  const currentIndex = navigation?.currentQuestionIndex ?? 0;

  const answeredCount = answeredQuestions.length;
  const skippedCount = skippedQuestions.length;
  const remainingCount = totalQuestions - answeredCount;

  const handleQuestionClick = async (index: number) => {
    if (!submitting) {
      await onNavigateToQuestion(index);
      onClose();
    }
  };

  // Format the student's answer for display
  const formatAnswer = (summary: QuestionSummary): string | React.ReactNode => {
    if (summary.studentAnswer === null || summary.studentAnswer === undefined) {
      return <span className="text-[#6b6b70] italic">No answer</span>;
    }

    const { type, options, studentAnswer } = summary;

    // Multiple choice - show the selected option text
    if ((type === 'multipleChoice' || type === 'trueFalse') && options) {
      if (typeof studentAnswer === 'number' && options[studentAnswer]) {
        return options[studentAnswer];
      }
      // If answer is already the text
      if (typeof studentAnswer === 'string') {
        return studentAnswer;
      }
    }

    // Code answers - show truncated code
    if (type === 'codeChallenge' || type === 'codeDebugging') {
      const code = String(studentAnswer);
      const truncated = code.length > 100 ? code.substring(0, 100) + '...' : code;
      return (
        <code className="text-xs bg-[#1a1a1c] px-2 py-1 rounded font-mono">
          {truncated}
        </code>
      );
    }

    // Fill in the blank - show as object or string
    if (type === 'fillInTheBlank') {
      if (typeof studentAnswer === 'object') {
        const blanks = Object.entries(studentAnswer);
        return blanks.map(([key, val]) => `${key}: ${val}`).join(', ');
      }
    }

    // Default - stringify if object, otherwise show as is
    if (typeof studentAnswer === 'object') {
      return JSON.stringify(studentAnswer);
    }

    return String(studentAnswer);
  };

  // Get icon for question type
  const getTypeIcon = (type: string) => {
    if (type === 'codeChallenge' || type === 'codeDebugging') {
      return <Code size={14} className="text-[#6b6b70]" />;
    }
    return <FileText size={14} className="text-[#6b6b70]" />;
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Question
          </button>
          <h2 className="font-mono text-lg font-semibold">Question Overview</h2>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-[#2a2a2e] bg-[#141416]">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-[#a1a1aa]">
            <strong className="text-[#f5f5f4]">{answeredCount}</strong> answered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SkipForward size={16} className="text-amber-400" />
          <span className="text-[#a1a1aa]">
            <strong className="text-[#f5f5f4]">{skippedCount}</strong> skipped
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Circle size={16} className="text-[#6b6b70]" />
          <span className="text-[#a1a1aa]">
            <strong className="text-[#f5f5f4]">{remainingCount}</strong> remaining
          </span>
        </div>
        <div className="ml-auto text-[#6b6b70]">
          {totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}% complete
        </div>
      </div>

      {/* Question List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {questionSummaries.map((summary: QuestionSummary) => {
            const isAnswered = summary.status === 'answered' || answeredQuestions.includes(summary.index);
            const isSkipped = summary.status === 'skipped' || skippedQuestions.includes(summary.index);
            const isCurrent = currentIndex === summary.index;

            let borderClass = 'border-[#2a2a2e]';
            let bgClass = 'bg-[#141416]';
            let statusIcon = <Circle size={18} className="text-[#6b6b70]" />;
            let statusBadge = null;

            if (isAnswered) {
              borderClass = 'border-green-500/30';
              bgClass = 'bg-green-500/5';
              statusIcon = <CheckCircle size={18} className="text-green-400" />;
              statusBadge = <span className="text-xs text-green-400">Answered</span>;
            } else if (isSkipped) {
              borderClass = 'border-amber-500/30';
              bgClass = 'bg-amber-500/5';
              statusIcon = <SkipForward size={18} className="text-amber-400" />;
              statusBadge = <span className="text-xs text-amber-400">Skipped</span>;
            } else {
              statusBadge = <span className="text-xs text-[#6b6b70]">Not answered</span>;
            }

            return (
              <div
                key={summary.index}
                className={`rounded-lg border ${borderClass} ${bgClass} overflow-hidden`}
              >
                {/* Question Header - Clickable */}
                <button
                  onClick={() => handleQuestionClick(summary.index)}
                  disabled={submitting}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="font-mono text-lg font-bold text-[#6b6b70] w-8 shrink-0">
                        {summary.index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(summary.type)}
                          <span className="text-xs text-[#6b6b70] capitalize">
                            {summary.type.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                        <h3 className="font-medium text-[#f5f5f4] line-clamp-2">
                          {summary.question}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent && (
                        <span className="badge-blue text-xs">Current</span>
                      )}
                      {statusBadge}
                      {statusIcon}
                    </div>
                  </div>
                </button>

                {/* Answer Section - Show for answered questions */}
                {isAnswered && summary.studentAnswer !== null && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="ml-11 p-3 bg-[#0a0a0b] rounded border border-[#2a2a2e]">
                      <div className="text-xs text-[#6b6b70] mb-1">Your answer:</div>
                      <div className="text-sm text-[#f5f5f4]">
                        {formatAnswer(summary)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Fallback if no summaries */}
          {questionSummaries.length === 0 && (
            <div className="text-center text-[#6b6b70] py-8">
              <p>No question data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#2a2a2e] bg-[#141416]">
        <div className="flex flex-wrap items-center gap-6 text-xs text-[#6b6b70]">
          <span>Click any question to navigate to it</span>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
              <span>Skipped</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border border-[#3a3a3e]" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionOverviewPanel;
