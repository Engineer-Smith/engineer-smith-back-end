// components/TestSessions/NavigationBar.tsx - FIXED to always use server-driven flow
import React from 'react';
import { ChevronLeft, ChevronRight, Circle, CheckCircle, Loader2 } from 'lucide-react';

interface NavigationBarProps {
    currentQuestion: {
        questionIndex: number;
        questionData: {
            title: string;
            description: string;
            type: string;
            points: number;
            [key: string]: any;
        };
        [key: string]: any;
    };
    currentAnswer: any;
    sectionInfo?: {
        name: string;
        current: number;
        total: number;
        timeLimit?: number;
    };
    canNavigateBackward: boolean;
    canNavigateForward: boolean;
    isNavigating: boolean;
    onSubmitAnswer?: () => Promise<void>;
    onSkip?: () => Promise<void>;
    onSubmitTest?: () => Promise<void>; // Only used when server explicitly requests it
    onClearAnswer?: () => void;
    onNavigatePrevious?: () => Promise<void>;
    submitting?: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
    currentQuestion,
    currentAnswer,
    sectionInfo,
    canNavigateBackward,
    isNavigating,
    onSubmitAnswer,
    onSkip,
    onClearAnswer,
    onNavigatePrevious,
    submitting = false,
}) => {
    const hasAnswer = currentAnswer !== null && currentAnswer !== undefined && currentAnswer !== '';

    const getAnswerStatus = () => {
        if (hasAnswer) {
            return (
                <span className="text-green-400 flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    Answered
                </span>
            );
        }
        return (
            <span className="text-[#6b6b70] flex items-center">
                <Circle size={14} className="mr-1" />
                Not answered
            </span>
        );
    };

    const getProgressText = () => {
        if (sectionInfo) {
            return `${sectionInfo.current} / ${sectionInfo.total}`;
        }
        return `Question ${(currentQuestion.questionIndex ?? 0) + 1}`;
    };

    // FIXED: Always show "Submit Answer" button - let server decide what happens next
    const getPrimaryActionButton = () => {
        // Always show submit answer button - the server will handle test completion
        if (onSubmitAnswer) {
            return (
                <button
                    className="btn-primary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onSubmitAnswer}
                    disabled={!hasAnswer || isNavigating || submitting}
                    aria-label="Submit answer"
                >
                    {isNavigating || submitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin mr-1" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Answer <ChevronRight size={16} className="ml-1" />
                        </>
                    )}
                </button>
            );
        }

        return null;
    };

    return (
        <div className="border-t border-[#2a2a2e] bg-[#141416]">
            <div className="p-3">
                <div className="flex justify-between items-center">
                    {/* Left: Previous Button */}
                    <div>
                        <button
                            className={`btn-secondary flex items-center ${!canNavigateBackward || !onNavigatePrevious ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!canNavigateBackward || !onNavigatePrevious || isNavigating || submitting}
                            onClick={onNavigatePrevious}
                            aria-label={canNavigateBackward ? "Go to previous question" : "Previous question (not available)"}
                        >
                            <ChevronLeft size={16} className="mr-1" /> Previous
                        </button>
                    </div>

                    {/* Center: Question Info and Status */}
                    <div className="text-center">
                        <div className="flex items-center gap-3 mb-1 justify-center">
                            <div>
                                <h6 className="font-mono text-sm font-semibold mb-0">{currentQuestion.questionData?.title || 'Question'}</h6>
                                {sectionInfo && (
                                    <small className="text-[#6b6b70]">
                                        Section: {sectionInfo.name}
                                    </small>
                                )}
                            </div>
                            <span className="badge-blue">{currentQuestion.questionData?.points ?? 0} pts</span>
                        </div>
                        <div className="flex justify-center items-center gap-3">
                            <small className="text-[#6b6b70]">
                                {getProgressText()}
                            </small>
                            <small>
                                {getAnswerStatus()}
                            </small>
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex gap-2 items-center">
                        {/* Clear Answer Button */}
                        {hasAnswer && onClearAnswer && (
                            <button
                                className="px-3 py-1.5 text-sm border border-amber-500/30 text-amber-400 rounded hover:bg-amber-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={onClearAnswer}
                                disabled={isNavigating || submitting}
                                aria-label="Clear answer"
                            >
                                Clear Answer
                            </button>
                        )}

                        {/* Skip Button - Always available */}
                        {onSkip && (
                            <button
                                className="px-3 py-1.5 text-sm border border-amber-500/30 text-amber-400 rounded hover:bg-amber-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                onClick={onSkip}
                                disabled={isNavigating || submitting}
                                aria-label="Skip question"
                            >
                                {isNavigating || submitting ? <Loader2 size={14} className="animate-spin" /> : 'Skip'}
                            </button>
                        )}

                        {/* Primary Action Button - Always "Submit Answer" */}
                        {getPrimaryActionButton()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavigationBar;
