// components/TestSessions/QuestionOverviewModal.tsx - ALIGNED with actual NavigationContext
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { X, Loader2, CheckCircle, Circle, SkipForward, ChevronDown, ChevronUp } from 'lucide-react';
import type { NavigationContext } from '../../types/session';

// Simplified types aligned with actual backend structure
type SectionQuestion = {
  globalIndex: number;
  localIndex?: number;
  status?: string;
  hasAnswer?: boolean;
  flagged?: boolean;
  timeSpent?: number;
  points?: number;
};

type SectionOverview = {
  sectionName: string | null;
  sectionIndex: number;
  isCompleted: boolean;
  questions: SectionQuestion[];
};

// Question summary for quick review
export type QuestionSummary = {
  index: number;
  title: string;
  type: string;
  answer?: string | null;
  isCorrect?: boolean;
};

interface QuestionOverviewModalProps {
  isOpen: boolean;
  toggle: () => void;
  // ALIGNED: Use actual NavigationContext type
  navigation: NavigationContext | null;
  // REMOVED: progress prop since we derive everything from navigation
  navigateToQuestion?: (index: number) => Promise<void>;

  /** If provided, only render questions for the current section */
  sectionOnly?: number | 'current';

  /** Optional primary CTA (e.g., "Submit Section") */
  primaryActionLabel?: string;
  onPrimaryAction?: () => Promise<void> | void;
  primaryActionLoading?: boolean;

  /** Optional lazy loader for grouped overview */
  fetchOverview?: () => Promise<{ questionOverview: SectionOverview[] } | any>;

  /** Optional question summaries for quick review */
  questionSummaries?: QuestionSummary[];
}

const QuestionOverviewModal: React.FC<QuestionOverviewModalProps> = ({
  isOpen,
  toggle,
  navigation,
  navigateToQuestion,
  sectionOnly,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionLoading = false,
  fetchOverview,
  questionSummaries,
}) => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<SectionOverview[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const showSectionOnly = sectionOnly !== undefined && sectionOnly !== null;

  // Load grouped overview for sectioned tests when NOT in sectionOnly mode
  useEffect(() => {
    let cancelled = false;

    const maybeLoad = async () => {
      if (!isOpen) return;
      if (!navigation) return;
      if (showSectionOnly || !fetchOverview) {
        setOverview(null);
        setLoading(false);
        setLoadError(null);
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetchOverview();
        if (cancelled) return;
        const data = (res?.questionOverview || res) as SectionOverview[] | undefined;
        if (Array.isArray(data)) {
          setOverview(data);
        } else {
          setOverview(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setLoadError(e?.message || 'Failed to load overview');
          setOverview(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    maybeLoad();
    return () => {
      cancelled = true;
    };
  }, [isOpen, navigation, showSectionOnly, fetchOverview]);

  // Use section-relative indexing from new NavigationContext
  const sectionIndices: number[] | null = useMemo(() => {
    if (!showSectionOnly || !navigation?.currentSection) return null;

    const section = navigation.currentSection;
    // Use new questionCount field, fallback to totalQuestionsInSection
    const questionsInSection = section.questionCount ?? navigation.totalQuestionsInSection ?? 0;

    // In section-relative mode, indices are 0 to N-1 within the section
    return Array.from({ length: questionsInSection }, (_, i) => i);
  }, [showSectionOnly, navigation?.currentSection, navigation?.totalQuestionsInSection]);

  // ALIGNED: Use actual NavigationContext arrays
  const scopedFromIndices = useCallback(
    (indices: number[]) => {
      const answeredQuestions = navigation?.answeredQuestions || [];
      const skippedQuestions = navigation?.skippedQuestions || [];

      const answered = indices.filter((i) => answeredQuestions.includes(i)).length;
      const skipped = indices.filter((i) => skippedQuestions.includes(i)).length;
      const total = indices.length;
      const completed = answered;
      const remaining = Math.max(0, total - completed);

      return { answered, skipped, flagged: 0, total, completed, remaining };
    },
    [navigation?.answeredQuestions, navigation?.skippedQuestions]
  );

  // Section header using new NavigationContext
  const sectionHeader = useMemo(() => {
    if (!showSectionOnly || !navigation?.currentSection) return null;

    const section = navigation.currentSection;
    const current = (navigation.currentQuestionIndex ?? 0) + 1;
    const total = section.questionCount ?? navigation.totalQuestionsInSection ?? 0;

    return `${section.name} • ${current} / ${total}`;
  }, [showSectionOnly, navigation?.currentSection, navigation?.currentQuestionIndex, navigation?.totalQuestionsInSection]);

  // Flat fallback indices (entire test or current section)
  const flatIndices: number[] = useMemo(() => {
    // For section-based tests, use totalQuestionsInSection; otherwise use totalQuestions
    const n = navigation?.totalQuestionsInSection ?? navigation?.totalQuestions ?? 0;
    return Array.from({ length: n }, (_, i) => i);
  }, [navigation?.totalQuestionsInSection, navigation?.totalQuestions]);

  // Derive global scoped counts across all questions rendered in grouped mode
  // NOTE: Must be before early returns to satisfy React hooks rules
  const renderGrouped = Array.isArray(overview) && overview.length > 0;
  const groupedScoped = useMemo(() => {
    if (!renderGrouped) return null;
    const all = overview!.flatMap((s) => s.questions.map((q) => q.globalIndex));
    return scopedFromIndices(all);
  }, [renderGrouped, overview, scopedFromIndices]);

  // Derive progress from NavigationContext
  const globalProgress = useMemo(() => {
    const answered = navigation?.answeredQuestions?.length ?? 0;
    const skipped = navigation?.skippedQuestions?.length ?? 0;
    const total = navigation?.totalQuestionsInSection ?? navigation?.totalQuestions ?? 0;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { answered, total, skipped, percentage };
  }, [navigation?.answeredQuestions, navigation?.skippedQuestions, navigation?.totalQuestionsInSection, navigation?.totalQuestions]);

  // Legend component
  const Legend = () => (
    <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
        <span className="text-[#a1a1aa]">Answered</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
        <span className="text-[#a1a1aa]">Skipped</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded border border-[#3a3a3e]" />
        <span className="text-[#a1a1aa]">Not answered</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded border border-[#3a3a3e] ring-2 ring-blue-500" />
        <span className="text-[#a1a1aa]">Current</span>
      </div>
    </div>
  );

  // Get summary for a question
  const getSummary = (index: number): QuestionSummary | undefined => {
    return questionSummaries?.find(q => q.index === index);
  };

  // Question item component - shows pill or expanded details
  const QuestionItem: React.FC<{ index: number }> = ({ index }) => {
    const answeredQuestions = navigation?.answeredQuestions || [];
    const skippedQuestions = navigation?.skippedQuestions || [];
    const isAnswered = answeredQuestions.includes(index);
    const isSkipped = skippedQuestions.includes(index);
    const isCurrent = navigation?.currentQuestionIndex === index;
    const isExpanded = expandedQuestion === index;
    const summary = getSummary(index);

    let pillClass = 'border border-[#3a3a3e] text-[#a1a1aa] hover:border-[#6b6b70]';
    let statusIcon = <Circle size={12} className="text-[#6b6b70]" />;
    let statusText = 'Not answered';

    if (isAnswered) {
      pillClass = 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30';
      statusIcon = <CheckCircle size={12} className="text-green-400" />;
      statusText = 'Answered';
    } else if (isSkipped) {
      pillClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30';
      statusIcon = <SkipForward size={12} className="text-amber-400" />;
      statusText = 'Skipped';
    }

    if (isCurrent) {
      pillClass += ' ring-2 ring-blue-500';
    }

    // If we have summaries and question is answered, show expandable item
    if (summary && isAnswered) {
      return (
        <div className="mb-2 mr-2">
          <button
            onClick={() => setExpandedQuestion(isExpanded ? null : index)}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${pillClass}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono">{index + 1}.</span>
                <span className="truncate max-w-[200px]">{summary.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {statusIcon}
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>
          </button>
          {isExpanded && (
            <div className="mt-1 ml-6 p-3 bg-[#1a1a1c] rounded border border-[#2a2a2e] text-sm">
              <div className="text-[#6b6b70] mb-1">Your answer:</div>
              <div className="text-[#f5f5f4] font-mono text-xs bg-[#0a0a0b] p-2 rounded overflow-x-auto">
                {typeof summary.answer === 'string'
                  ? summary.answer
                  : summary.answer
                    ? JSON.stringify(summary.answer, null, 2)
                    : <span className="text-[#6b6b70] italic">No answer recorded</span>
                }
              </div>
              {navigateToQuestion && (
                <button
                  onClick={async () => {
                    await navigateToQuestion(index);
                    toggle();
                  }}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-xs"
                >
                  Go to question →
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    // Simple pill for non-answered or when no summaries
    return (
      <button
        key={index}
        onClick={async () => {
          if (navigateToQuestion) {
            await navigateToQuestion(index);
            toggle();
          }
        }}
        disabled={!navigateToQuestion}
        title={`Question ${index + 1} - ${statusText}`}
        aria-label={`Navigate to question ${index + 1}`}
        className={`mr-2 mb-2 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pillClass}`}
      >
        {index + 1}
      </button>
    );
  };

  // Keep old QuestionPill for backward compatibility in section-only view
  const QuestionPill: React.FC<{ index: number }> = ({ index }) => {
    const answeredQuestions = navigation?.answeredQuestions || [];
    const skippedQuestions = navigation?.skippedQuestions || [];

    let pillClass = 'border border-[#3a3a3e] text-[#a1a1aa] hover:border-[#6b6b70]';
    if (answeredQuestions.includes(index)) {
      pillClass = 'bg-green-500/20 text-green-400 border border-green-500/30';
    } else if (skippedQuestions.includes(index)) {
      pillClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    }

    const isCurrent = navigation?.currentQuestionIndex === index;
    if (isCurrent) {
      pillClass += ' ring-2 ring-blue-500';
    }

    return (
      <button
        key={index}
        onClick={async () => {
          if (navigateToQuestion) {
            await navigateToQuestion(index);
            toggle();
          }
        }}
        disabled={!navigateToQuestion}
        aria-label={`Navigate to question ${index + 1}`}
        className={`mr-2 mb-2 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pillClass}`}
      >
        {index + 1}
      </button>
    );
  };

  if (!isOpen) return null;

  // Loading state if navigation is missing
  if (!navigation) {
    return (
      <div className="modal-backdrop" onClick={toggle}>
        <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
            <h3 className="font-mono text-lg font-semibold">Question Overview</h3>
            <button onClick={toggle} className="text-[#6b6b70] hover:text-[#f5f5f4] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-[#a1a1aa]">Loading question overview...</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t border-[#2a2a2e]">
            <button className="btn-secondary" onClick={toggle}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SECTION-ONLY VIEW (current section pills + CTA)
  if (showSectionOnly && sectionIndices) {
    const scoped = scopedFromIndices(sectionIndices);

    return (
      <div className="modal-backdrop" onClick={toggle}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
            <h3 className="font-mono text-lg font-semibold">
              {sectionHeader ? `Review Section: ${sectionHeader}` : 'Review Section'}
            </h3>
            <button onClick={toggle} className="text-[#6b6b70] hover:text-[#f5f5f4] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-[#a1a1aa]">
                <strong className="text-[#f5f5f4]">{scoped.completed}</strong> answered
              </span>
              <span className="text-[#a1a1aa]">
                <strong className="text-[#f5f5f4]">{scoped.remaining}</strong> remaining
              </span>
              {scoped.skipped > 0 && (
                <span className="text-[#a1a1aa]">
                  <strong className="text-[#f5f5f4]">{scoped.skipped}</strong> skipped
                </span>
              )}
            </div>

            <div className="flex flex-wrap">
              {sectionIndices.map((idx) => (
                <QuestionPill key={idx} index={idx} />
              ))}
            </div>

            {scoped.remaining > 0 && (
              <p className="text-amber-400 mt-4">
                You have {scoped.remaining} unanswered question{scoped.remaining === 1 ? '' : 's'} in this section.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 p-4 border-t border-[#2a2a2e]">
            {primaryActionLabel && onPrimaryAction && (
              <button
                className="btn-primary flex items-center gap-2"
                onClick={onPrimaryAction}
                disabled={primaryActionLoading}
              >
                {primaryActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {primaryActionLabel}
              </button>
            )}
            <button className="btn-secondary" onClick={toggle}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FULL OVERVIEW
  return (
    <div className="modal-backdrop" onClick={toggle}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
          <h3 className="font-mono text-lg font-semibold">Question Overview</h3>
          <button onClick={toggle} className="text-[#6b6b70] hover:text-[#f5f5f4] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {/* Loading state for grouped fetch */}
          {loading && (
            <div className="text-center mb-4">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-[#a1a1aa]">Loading sections...</p>
            </div>
          )}
          {loadError && (
            <p className="text-red-400 mb-4">
              {loadError} — showing flat overview instead.
            </p>
          )}

          {/* Legend */}
          <Legend />

          {renderGrouped ? (
            <>
              {/* Global counters across all sections */}
              {groupedScoped && (
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="text-[#a1a1aa]">
                    <strong className="text-[#f5f5f4]">{groupedScoped.completed}</strong> answered
                  </span>
                  <span className="text-[#a1a1aa]">
                    <strong className="text-[#f5f5f4]">{groupedScoped.remaining}</strong> remaining
                  </span>
                  {groupedScoped.skipped > 0 && (
                    <span className="text-[#a1a1aa]">
                      <strong className="text-[#f5f5f4]">{groupedScoped.skipped}</strong> skipped
                    </span>
                  )}
                </div>
              )}

              {/* Sections */}
              {overview!.map((section) => {
                const indices = section.questions.map((q) => q.globalIndex);
                const sScoped = scopedFromIndices(indices);
                return (
                  <div key={section.sectionIndex} className="mb-6">
                    <h6 className="font-mono text-sm font-semibold mb-3">
                      {section.sectionName ?? `Section ${section.sectionIndex + 1}`}{' '}
                      {section.isCompleted ? (
                        <span className="text-green-400">(completed)</span>
                      ) : (
                        <span className="text-[#6b6b70]">
                          ({sScoped.completed}/{sScoped.total} answered)
                        </span>
                      )}
                    </h6>
                    <div className="flex flex-wrap">
                      {section.questions.map((q) => (
                        <QuestionItem key={q.globalIndex} index={q.globalIndex} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            // Flat fallback using actual NavigationContext
            <>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="text-[#a1a1aa]">
                  <strong className="text-[#f5f5f4]">{globalProgress.answered}</strong> answered
                </span>
                <span className="text-[#a1a1aa]">
                  <strong className="text-[#f5f5f4]">{globalProgress.total - globalProgress.answered}</strong> remaining
                </span>
                {globalProgress.skipped > 0 && (
                  <span className="text-[#a1a1aa]">
                    <strong className="text-[#f5f5f4]">{globalProgress.skipped}</strong> skipped
                  </span>
                )}
                <span className="text-[#6b6b70]">
                  {globalProgress.percentage}% complete
                </span>
              </div>

              {/* Show list view if we have summaries, otherwise pills */}
              {questionSummaries && questionSummaries.length > 0 ? (
                <div className="space-y-1">
                  {flatIndices.map((i) => (
                    <QuestionItem key={i} index={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap">
                  {flatIndices.map((i) => (
                    <QuestionPill key={i} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-[#2a2a2e]">
          <button className="btn-secondary" onClick={toggle}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionOverviewModal;
