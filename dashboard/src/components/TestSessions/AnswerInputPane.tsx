// components/TestSessions/AnswerInputPane.tsx - ALIGNED with actual question structure
import React, { useState, useCallback } from 'react';
import { CheckCircle, Square, X, GripVertical, RotateCcw } from 'lucide-react';

interface AnswerInputPaneProps {
  // ALIGNED: Using actual question structure from context
  question: {
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
    [key: string]: any;
  };
  currentAnswer: any;
  updateAnswer: (answer: any) => void;
  onClearAnswer?: () => void;
}

const AnswerInputPane: React.FC<AnswerInputPaneProps> = ({
  question,
  currentAnswer,
  updateAnswer,
  onClearAnswer
}) => {
  const hasAnswer = currentAnswer !== null && currentAnswer !== undefined;
  const [draggedOption, setDraggedOption] = useState<string | null>(null);
  const [dragOverBlank, setDragOverBlank] = useState<string | null>(null);

  // Drag-and-drop handlers
  const handleDragStart = useCallback((optionId: string) => {
    setDraggedOption(optionId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedOption(null);
    setDragOverBlank(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, blankId: string) => {
    e.preventDefault();
    setDragOverBlank(blankId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverBlank(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, blankId: string) => {
    e.preventDefault();
    if (!draggedOption) return;

    const placements = currentAnswer || {};
    const newPlacements: Record<string, string | null> = { ...placements };

    // If dropping from pool, check if option was in another blank
    for (const [bid, oid] of Object.entries(newPlacements)) {
      if (oid === draggedOption && bid !== blankId) {
        newPlacements[bid] = null;
      }
    }

    // Place option in the blank
    newPlacements[blankId] = draggedOption;

    updateAnswer(newPlacements);
    setDraggedOption(null);
    setDragOverBlank(null);
  }, [draggedOption, currentAnswer, updateAnswer]);

  const handleRemoveFromBlank = useCallback((blankId: string) => {
    const placements = currentAnswer || {};
    const newPlacements = { ...placements };
    newPlacements[blankId] = null;
    updateAnswer(newPlacements);
  }, [currentAnswer, updateAnswer]);

  const handleOptionClick = useCallback((optionId: string, blankId?: string) => {
    const placements = currentAnswer || {};
    const blanks = question.questionData?.blanks || [];

    if (blankId) {
      // If clicking on a placed option, remove it
      handleRemoveFromBlank(blankId);
    } else {
      // If clicking on an option in pool, place it in the first empty blank
      const emptyBlank = blanks.find(b => !placements[b.id]);
      if (emptyBlank) {
        const newPlacements = { ...placements };
        newPlacements[emptyBlank.id] = optionId;
        updateAnswer(newPlacements);
      }
    }
  }, [currentAnswer, question.questionData?.blanks, updateAnswer, handleRemoveFromBlank]);

  // Get available options (not placed in any blank)
  const getAvailableOptions = useCallback(() => {
    const dragOptions = question.questionData?.dragOptions || [];
    const placements = currentAnswer || {};
    const placedOptionIds = Object.values(placements).filter(Boolean) as string[];
    return dragOptions.filter(opt => !placedOptionIds.includes(opt.id));
  }, [question.questionData?.dragOptions, currentAnswer]);

  // Helper function to render drag-drop cloze template
  const renderDragDropClozeTemplate = () => {
    if (!question.questionData?.codeTemplate || !question.questionData?.blanks) {
      return <div className="text-[#6b6b70]">No template available</div>;
    }

    const template = question.questionData.codeTemplate;
    const blanks = question.questionData.blanks;
    const dragOptions = question.questionData.dragOptions || [];
    const placements = currentAnswer || {};

    // Parse template for {{blankId}} placeholders
    const blankPattern = /\{\{(\w+)\}\}/g;
    const elements: React.ReactElement[] = [];
    let lastIndex = 0;
    let match;

    while ((match = blankPattern.exec(template)) !== null) {
      // Add text before the blank
      if (match.index > lastIndex) {
        const textBefore = template.substring(lastIndex, match.index);
        elements.push(
          <span key={`text-${match.index}`} style={{ whiteSpace: 'pre' }}>
            {textBefore}
          </span>
        );
      }

      const blankId = match[1];
      const blank = blanks.find(b => b.id === blankId);
      const placedOptionId = placements[blankId];
      const placedOption = dragOptions.find(o => o.id === placedOptionId);
      const isOver = dragOverBlank === blankId;

      elements.push(
        <span
          key={`blank-${blankId}`}
          onDragOver={(e) => handleDragOver(e, blankId)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, blankId)}
          className={`inline-flex items-center justify-center min-w-[80px] mx-1 px-2 py-1 rounded border-2 transition-all ${
            placedOption
              ? 'bg-green-500/20 border-green-500 cursor-pointer'
              : isOver
                ? 'bg-blue-500/30 border-blue-500 border-dashed'
                : 'bg-[#1a1a1e] border-[#3a3a3e] border-dashed'
          }`}
          onClick={() => placedOption && handleOptionClick(placedOption.id, blankId)}
          title={placedOption ? 'Click to remove' : blank?.hint || 'Drop an option here'}
        >
          {placedOption ? (
            <span className="font-mono text-sm text-green-400 flex items-center gap-1">
              {placedOption.text}
              <X size={12} className="opacity-50 hover:opacity-100" />
            </span>
          ) : (
            <span className="text-[#6b6b70] text-sm">
              {isOver ? 'Drop here' : '_______'}
            </span>
          )}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last blank
    if (lastIndex < template.length) {
      const textAfter = template.substring(lastIndex);
      elements.push(
        <span key="text-after" style={{ whiteSpace: 'pre' }}>
          {textAfter}
        </span>
      );
    }

    return (
      <div
        className="border border-[#2a2a2e] rounded p-4 font-mono text-base leading-relaxed bg-[#141416] overflow-x-auto"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {elements}
      </div>
    );
  };

  // Helper function to render fill-in-blank template with input fields
  const renderFillInBlankTemplate = () => {
    if (!question.questionData?.codeTemplate || !question.questionData?.blanks) {
      return <div className="text-[#6b6b70]">No template available</div>;
    }

    const template = question.questionData.codeTemplate;
    const blanks = question.questionData.blanks;
    const answers = currentAnswer || {};

    const blankPattern = /___\w*\d*___/g;
    const elements: React.ReactElement[] = [];
    let lastIndex = 0;
    let blankIndex = 0;
    let match;

    while ((match = blankPattern.exec(template)) !== null && blankIndex < blanks.length) {
      if (match.index > lastIndex) {
        const textBefore = template.substring(lastIndex, match.index);
        elements.push(
          <span key={`text-${blankIndex}-before`} style={{ whiteSpace: 'pre' }}>
            {textBefore}
          </span>
        );
      }

      const blank = blanks[blankIndex];
      const blankId = blank.id || `blank-${blankIndex}`;
      const value = answers[blankId] || '';

      elements.push(
        <input
          key={`blank-${blankIndex}`}
          type="text"
          value={value}
          onChange={(e) => {
            const newAnswers = { ...answers };
            newAnswers[blankId] = e.target.value;
            updateAnswer(newAnswers);
          }}
          placeholder=""
          className="inline-block mx-1 px-2 py-1 font-mono text-sm border-2 border-blue-500 rounded bg-[#1a1a1e] text-[#f5f5f4] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          style={{
            width: `${Math.max(80, Math.min(200, (value.length + 2) * 8 + 20))}px`,
            minWidth: '80px',
            maxWidth: '200px',
          }}
          aria-label={`Blank ${blankIndex + 1}: ${blank.hint || 'Fill in the blank'}`}
        />
      );

      lastIndex = match.index + match[0].length;
      blankIndex++;
    }

    if (lastIndex < template.length) {
      const textAfter = template.substring(lastIndex);
      elements.push(
        <span key={`text-after`} style={{ whiteSpace: 'pre' }}>
          {textAfter}
        </span>
      );
    }

    return (
      <div
        className="border border-[#2a2a2e] rounded p-4 font-mono text-base leading-relaxed bg-[#141416] overflow-x-auto"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {elements}
      </div>
    );
  };

  const renderAnswerContent = () => {
    switch (question.questionData?.type) {
      case 'multipleChoice':
        return (
          <form role="form" aria-labelledby="question-title">
            {question.questionData.options?.map((option: string, index: number) => (
              <div key={index} className="mb-3">
                <label
                  className={`flex items-start p-3 border rounded cursor-pointer transition-colors ${
                    currentAnswer === index
                      ? 'bg-blue-500/10 border-blue-500'
                      : 'border-[#2a2a2e] hover:bg-[#1a1a1e]'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    id={`option-${index}`}
                    value={index}
                    checked={currentAnswer === index}
                    onChange={(e) => updateAnswer(parseInt(e.target.value))}
                    aria-label={`Radio option ${index + 1}: ${option}`}
                    className="mr-3 mt-1 accent-blue-500"
                  />
                  <div>
                    <div className="font-medium mb-1">
                      {String.fromCharCode(65 + index)}. {option}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </form>
        );

      case 'trueFalse':
        return (
          <form role="form" aria-labelledby="question-title">
            <div className="mb-3">
              <label
                className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                  currentAnswer === true
                    ? 'bg-green-500/10 border-green-500'
                    : 'border-[#2a2a2e] hover:bg-[#1a1a1e]'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  id="true"
                  checked={currentAnswer === true}
                  onChange={() => updateAnswer(true)}
                  className="mr-3 accent-green-500"
                  aria-label="True"
                />
                <div className="flex items-center">
                  <CheckCircle size={20} className="mr-2 text-green-500" />
                  <span className="font-medium">True</span>
                </div>
              </label>
            </div>
            <div className="mb-3">
              <label
                className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                  currentAnswer === false
                    ? 'bg-red-500/10 border-red-500'
                    : 'border-[#2a2a2e] hover:bg-[#1a1a1e]'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  id="false"
                  checked={currentAnswer === false}
                  onChange={() => updateAnswer(false)}
                  className="mr-3 accent-red-500"
                  aria-label="False"
                />
                <div className="flex items-center">
                  <Square size={20} className="mr-2 text-red-500" />
                  <span className="font-medium">False</span>
                </div>
              </label>
            </div>
          </form>
        );

      case 'fillInTheBlank':
        return (
          <div>
            <h6 className="font-mono text-sm font-semibold mb-3">Complete the code by filling in the blanks:</h6>

            {renderFillInBlankTemplate()}

            {/* Blank Information Panel */}
            {question.questionData?.blanks && question.questionData.blanks.length > 0 && (
              <div className="mt-4">
                <div className="bg-cyan-500/10 border border-cyan-500/25 rounded p-3">
                  <h6 className="text-cyan-400 font-mono text-sm font-semibold mb-3">
                    Blank Information
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.questionData.blanks.map((blank, index: number) => {
                      const blankId = blank.id || `blank-${index}`;
                      const currentValue = (currentAnswer && currentAnswer[blankId]) || '';

                      return (
                        <div key={blankId} className="card p-3">
                          <div className="flex justify-between items-start mb-2">
                            <strong className="text-blue-400">Blank {index + 1}</strong>
                            {blank.points && (
                              <span className="badge-green">{blank.points} pts</span>
                            )}
                          </div>
                          {blank.hint && (
                            <p className="text-[#6b6b70] text-sm mb-2">
                              Hint: {blank.hint}
                            </p>
                          )}
                          <div className="text-sm">
                            <span className="text-[#6b6b70]">Current: </span>
                            <code className="bg-[#1a1a1e] px-2 py-1 rounded text-[#f5f5f4]">
                              {currentValue || '<empty>'}
                            </code>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center mt-3">
                    <small className="text-[#6b6b70]">
                      {question.questionData.blanks.filter((_, index: number) => {
                        const blankId = question.questionData?.blanks![index].id || `blank-${index}`;
                        return currentAnswer && currentAnswer[blankId] && currentAnswer[blankId].trim();
                      }).length} of {question.questionData.blanks.length} blanks filled
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'dragDropCloze':
        const availableOptions = getAvailableOptions();
        const allBlanks = question.questionData?.blanks || [];
        const placements = currentAnswer || {};
        const filledCount = Object.values(placements).filter(Boolean).length;

        return (
          <div>
            <h6 className="font-mono text-sm font-semibold mb-3">
              Drag the options into the blanks to complete the code:
            </h6>

            {/* Code Template with Drop Zones */}
            {renderDragDropClozeTemplate()}

            {/* Drag Options Pool */}
            <div className="mt-4">
              <div className="bg-purple-500/10 border border-purple-500/25 rounded p-3">
                <div className="flex justify-between items-center mb-3">
                  <h6 className="text-purple-400 font-mono text-sm font-semibold">
                    Available Options
                  </h6>
                  {filledCount > 0 && (
                    <button
                      className="text-xs text-[#6b6b70] hover:text-[#f5f5f4] flex items-center gap-1"
                      onClick={() => updateAnswer({})}
                    >
                      <RotateCcw size={12} />
                      Reset All
                    </button>
                  )}
                </div>

                {availableOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableOptions.map((option) => (
                      <div
                        key={option.id}
                        draggable
                        onDragStart={() => handleDragStart(option.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOptionClick(option.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                          draggedOption === option.id
                            ? 'bg-purple-500/30 border-2 border-purple-500 opacity-50'
                            : 'bg-[#1c1c1f] border border-[#3a3a3e] hover:border-purple-500/50 hover:bg-purple-500/10'
                        }`}
                      >
                        <GripVertical size={14} className="text-[#6b6b70]" />
                        <span className="font-mono text-sm text-[#f5f5f4]">{option.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[#6b6b70]">
                    <CheckCircle size={20} className="mx-auto mb-2 text-green-400" />
                    <p className="text-sm">All options have been placed!</p>
                  </div>
                )}

                <div className="text-center mt-3 text-xs text-[#6b6b70]">
                  Drag options to the blanks above, or click to place in the next empty blank
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="mt-3 flex justify-between items-center text-sm">
              <span className="text-[#6b6b70]">
                Progress: {filledCount} / {allBlanks.length} blanks filled
              </span>
              {allBlanks.length > 0 && (
                <div className="w-32 h-2 bg-[#1c1c1f] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${(filledCount / allBlanks.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'codeChallenge':
      case 'codeDebugging':
        return (
          <div className="text-center text-[#6b6b70] py-8">
            <p>Code editor is in a separate pane for this question type.</p>
          </div>
        );

      default:
        return (
          <div className="text-center text-[#6b6b70] py-8">
            <p>Unsupported question type: {question.questionData?.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a2e] bg-[#141416] flex justify-between items-center">
        <h6 className="font-mono text-sm font-semibold mb-0">Your Answer</h6>
        {hasAnswer && onClearAnswer && (
          <button
            className="btn-danger text-sm flex items-center gap-1"
            onClick={onClearAnswer}
            aria-label="Clear answer"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Answer Input Content */}
      <div className="flex-grow p-3 overflow-auto">
        {renderAnswerContent()}
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-[#2a2a2e] bg-[#141416]">
        <div className="flex justify-between items-center">
          <span className="text-sm">
            {hasAnswer ? (
              <span className="text-green-400 flex items-center">
                <CheckCircle size={14} className="mr-1" />
                Answered
              </span>
            ) : (
              <span className="text-[#6b6b70] flex items-center">
                <Square size={14} className="mr-1" />
                Not answered
              </span>
            )}
          </span>

          {/* Question-specific footer info */}
          <small className="text-[#6b6b70]">
            {question.questionData?.type === 'fillInTheBlank' && question.questionData?.blanks && (
              <>
                {Object.keys(currentAnswer || {}).filter(key =>
                  currentAnswer[key] && currentAnswer[key].trim()
                ).length} / {question.questionData.blanks.length} completed
              </>
            )}
            {question.questionData?.type === 'dragDropCloze' && question.questionData?.blanks && (
              <>
                {Object.values(currentAnswer || {}).filter(Boolean).length} / {question.questionData.blanks.length} placed
              </>
            )}
          </small>
        </div>
      </div>
    </div>
  );
};

export default AnswerInputPane;
