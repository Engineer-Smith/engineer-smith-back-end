// components/TestSessions/ReviewModePane.tsx - Full-screen review mode interface
import React from 'react';
import {
  CheckCircle,
  Circle,
  AlertCircle,
  Send,
  ArrowLeft,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';
import type { SectionSummary, NavigationContext } from '../../types/session';

interface ReviewModePaneProps {
  sessionInfo: {
    title: string;
    description: string;
    totalQuestions: number;
    totalPoints: number;
    timeLimit: number;
    useSections: boolean;
    sectionCount?: number;
  };
  sectionSummary: SectionSummary | null;
  navigationContext: NavigationContext | null;
  currentQuestionIndex: number;
  onNavigateToQuestion: (index: number) => Promise<void>;
  onSubmitSection?: () => Promise<void>;
  onSubmitTest: () => Promise<void>;
  onContinueAnswering?: () => void;
  submitting: boolean;
  timerDisplay: string;
}

const ReviewModePane: React.FC<ReviewModePaneProps> = ({
  sessionInfo,
  sectionSummary,
  navigationContext,
  currentQuestionIndex,
  onNavigateToQuestion,
  onSubmitSection,
  onSubmitTest,
  onContinueAnswering,
  submitting,
  timerDisplay
}) => {
  // Determine if all sections are complete and we should submit the test
  const isLastSection = navigationContext?.isLastSection ?? false;
  const totalSections = navigationContext?.totalSections ?? sessionInfo.sectionCount ?? 1;
  const completedSectionsCount = navigationContext?.completedSections?.length ?? 0;
  const allSectionsComplete = !sessionInfo.useSections ||
    isLastSection ||
    (completedSectionsCount >= totalSections - 1);

  // Use submitTest when all sections are done, otherwise submitSection
  const shouldSubmitTest = !sessionInfo.useSections || allSectionsComplete;
  const onSubmit = shouldSubmitTest ? onSubmitTest : (onSubmitSection ?? onSubmitTest);
  // Calculate stats from section summary or navigation context
  const stats = React.useMemo(() => {
    if (sectionSummary) {
      return {
        total: sectionSummary.totalQuestions,
        answered: sectionSummary.answered,
        unanswered: sectionSummary.unanswered,
        skipped: sectionSummary.skipped,
        percentage: sectionSummary.totalQuestions > 0
          ? Math.round((sectionSummary.answered / sectionSummary.totalQuestions) * 100)
          : 0
      };
    }

    if (navigationContext) {
      const answered = navigationContext.answeredQuestions?.length ?? 0;
      const total = navigationContext.totalQuestionsInSection ?? navigationContext.totalQuestions ?? 0;
      const skipped = navigationContext.skippedQuestions?.length ?? 0;
      return {
        total,
        answered,
        unanswered: total - answered,
        skipped,
        percentage: total > 0 ? Math.round((answered / total) * 100) : 0
      };
    }

    return { total: 0, answered: 0, unanswered: 0, skipped: 0, percentage: 0 };
  }, [sectionSummary, navigationContext]);

  // Get question statuses for rendering the grid
  const questionStatuses = React.useMemo(() => {
    if (sectionSummary?.questionStatuses) {
      return sectionSummary.questionStatuses;
    }

    // Build from navigation context
    if (navigationContext) {
      const total = navigationContext.totalQuestionsInSection ?? navigationContext.totalQuestions ?? 0;
      const answeredSet = new Set(navigationContext.answeredQuestions || []);
      const skippedSet = new Set(navigationContext.skippedQuestions || []);

      return Array.from({ length: total }, (_, i) => ({
        index: i,
        status: answeredSet.has(i) ? 'answered' as const :
                skippedSet.has(i) ? 'skipped' as const : 'not_viewed' as const,
        hasAnswer: answeredSet.has(i)
      }));
    }

    return [];
  }, [sectionSummary, navigationContext]);

  const handleQuestionClick = async (index: number) => {
    await onNavigateToQuestion(index);
  };

  const handleSubmit = async () => {
    const confirmed = stats.unanswered > 0
      ? window.confirm(`You have ${stats.unanswered} unanswered question${stats.unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`)
      : window.confirm('Are you sure you want to submit your test? This action cannot be undone.');

    if (confirmed) {
      await onSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-[#141416] border-b border-[#2a2a2e] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-1">
                Review Your Answers
              </h1>
              <p className="text-[#6b6b70]">{sessionInfo.title}</p>
            </div>
            <div className="flex items-center gap-2 text-[#6b6b70]">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-bold text-[#f5f5f4]">{timerDisplay}</span>
              <span className="text-sm">remaining</span>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#1a1a1e] rounded-lg p-4 border border-[#2a2a2e]">
              <div className="flex items-center gap-2 text-[#6b6b70] mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Total Questions</span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#f5f5f4]">{stats.total}</div>
            </div>

            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Answered</span>
              </div>
              <div className="font-mono text-2xl font-bold text-green-400">{stats.answered}</div>
            </div>

            <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Circle className="w-4 h-4" />
                <span className="text-sm">Unanswered</span>
              </div>
              <div className="font-mono text-2xl font-bold text-amber-400">{stats.unanswered}</div>
            </div>

            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Completion</span>
              </div>
              <div className="font-mono text-2xl font-bold text-blue-400">{stats.percentage}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Question Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-mono text-lg font-semibold mb-4 text-[#a1a1aa]">
            Click any question to review or edit your answer
          </h2>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {questionStatuses.map((q, idx) => {
              const isCurrentQuestion = idx === currentQuestionIndex;
              const isAnswered = q.hasAnswer || q.status === 'answered';
              const isSkipped = q.status === 'skipped';

              let buttonClass = 'bg-[#1a1a1e] border-[#3a3a3e] text-[#6b6b70] hover:bg-[#2a2a2e] hover:border-[#4a4a4e]';
              if (isAnswered) {
                buttonClass = 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30';
              } else if (isSkipped) {
                buttonClass = 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30';
              }

              if (isCurrentQuestion) {
                buttonClass += ' ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0a0a0b]';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(idx)}
                  className={`
                    aspect-square rounded-lg border-2 font-mono font-bold text-lg
                    flex items-center justify-center transition-all
                    ${buttonClass}
                  `}
                  title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : isSkipped ? 'Skipped' : 'Not answered'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50" />
              <span className="text-[#a1a1aa]">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50" />
              <span className="text-[#a1a1aa]">Skipped</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#1a1a1e] border border-[#3a3a3e]" />
              <span className="text-[#a1a1aa]">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#1a1a1e] border border-[#3a3a3e] ring-2 ring-blue-500" />
              <span className="text-[#a1a1aa]">Current Question</span>
            </div>
          </div>

          {/* Warning for unanswered questions */}
          {stats.unanswered > 0 && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-400">
                    You have {stats.unanswered} unanswered question{stats.unanswered > 1 ? 's' : ''}
                  </p>
                  <p className="text-[#a1a1aa] text-sm mt-1">
                    Click on any unanswered question above to provide an answer before submitting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="bg-[#141416] border-t border-[#2a2a2e] p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {onContinueAnswering && (
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={onContinueAnswering}
              disabled={submitting}
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Answering
            </button>
          )}
          <div className="flex-1" />
          <button
            className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit {shouldSubmitTest ? 'Test' : 'Section'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModePane;
