// components/TestSessions/QuestionDetailsPane.tsx - ALIGNED with actual question structure
import React from 'react';

interface QuestionDetailsPaneProps {
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
  sectionInfo?: {
    name: string;
    current: number;
    total: number;
    timeLimit?: number;
  };
  showTestCases?: boolean;
}

const QuestionDetailsPane: React.FC<QuestionDetailsPaneProps> = ({
  question,
  sectionInfo,
  showTestCases = true
}) => {
  const formatTestCaseArgs = (args: any[]): string => {
    if (!args || args.length === 0) return '()';
    return `(${args.map(arg =>
      typeof arg === 'string' ? `"${arg}"` : JSON.stringify(arg)
    ).join(', ')})`;
  };

  const formatExpected = (expected: any): string => {
    if (typeof expected === 'string') return `"${expected}"`;
    return JSON.stringify(expected);
  };

  const getQuestionTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      'multipleChoice': 'Multiple Choice',
      'trueFalse': 'True/False',
      'codeChallenge': 'Code Challenge',
      'fillInTheBlank': 'Fill in the Blank',
      'codeDebugging': 'Code Debugging'
    };
    return typeLabels[type] || type.replace(/([A-Z])/g, ' $1').trim();
  };

  const getDifficultyBadgeClass = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'badge-green';
      case 'medium': return 'badge-amber';
      case 'hard': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a2e] bg-[#141416]">
        <div className="flex justify-between items-start mb-2">
          <h6 className="font-mono text-sm font-semibold mb-0">{question.questionData?.title || 'Question'}</h6>
          <span className="badge-blue">{question.questionData?.points ?? 0} pts</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="badge-gray">
            {getQuestionTypeLabel(question.questionData?.type || 'unknown')}
          </span>

          {question.questionData?.difficulty && (
            <span className={getDifficultyBadgeClass(question.questionData.difficulty)}>
              {question.questionData.difficulty}
            </span>
          )}

          {question.questionData?.language && (
            <span className="badge-purple">{question.questionData.language}</span>
          )}

          {question.questionData?.category && (
            <span className="px-2 py-0.5 text-xs font-medium border border-[#3a3a3e] rounded text-[#a1a1aa]">
              {question.questionData.category}
            </span>
          )}
        </div>

        {sectionInfo && (
          <div className="mt-2">
            <small className="text-[#6b6b70]">
              Section: <strong className="text-[#a1a1aa]">{sectionInfo.name}</strong> •{' '}
              Question {sectionInfo.current} of {sectionInfo.total}
            </small>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow p-3 overflow-auto">
        {/* Description */}
        <div className="mb-4">
          <p className="text-[#a1a1aa] leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
            {question.questionData?.description || 'No description available'}
          </p>
        </div>

        {/* Example Test Case for Code Questions */}
        {showTestCases && question.questionData?.testCases && question.questionData.testCases.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h6 className="font-mono text-sm font-semibold mb-0">Example Test Case</h6>
              <span className="badge-purple text-xs">
                {question.questionData.testCases.length} total test cases
              </span>
            </div>

            <div className="border border-[#2a2a2e] rounded p-3 bg-[#141416]">
              {(() => {
                const exampleTestCase = question.questionData.testCases[0];
                return (
                  <div className="p-3 rounded bg-[#1a1a1e] border border-[#2a2a2e]">
                    <div className="font-medium text-sm text-[#f5f5f4] mb-2">
                      {exampleTestCase.name || 'Example Test Case'}
                    </div>

                    <div className="font-mono text-sm">
                      <div className="mb-1">
                        <span className="text-[#6b6b70] font-medium">Input:</span>{' '}
                        <code className="bg-[#2a2a2e] px-2 py-1 rounded text-[#a1a1aa]">
                          {formatTestCaseArgs(exampleTestCase.args)}
                        </code>
                      </div>
                      <div>
                        <span className="text-[#6b6b70] font-medium">Expected:</span>{' '}
                        <code className="bg-green-500/10 px-2 py-1 rounded text-green-400">
                          {formatExpected(exampleTestCase.expected)}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-3 p-2 bg-cyan-500/10 border border-cyan-500/25 rounded">
                <small className="text-cyan-400 font-medium">
                  This is one example of {question.questionData.testCases.length} test cases. Your solution will be tested against all cases when you run or submit your code.
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Multiple Choice Options Preview */}
        {question.questionData?.type === 'multipleChoice' && question.questionData?.options && (
          <div className="mt-4">
            <h6 className="font-mono text-sm font-semibold mb-2">Answer Options</h6>
            <div className="bg-[#141416] p-3 rounded border border-[#2a2a2e]">
              {question.questionData.options.map((option: string, index: number) => (
                <div key={index} className="mb-2 text-[#a1a1aa]">
                  <span className="font-medium text-[#f5f5f4]">{String.fromCharCode(65 + index)}.</span> {option}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Instructions or Hints */}
        {question.questionData?.codeTemplate && question.questionData.type === 'codeDebugging' && (
          <div className="mt-4">
            <div className="bg-cyan-500/10 border border-cyan-500/25 rounded p-3">
              <strong className="text-cyan-400">Instructions:</strong>{' '}
              <span className="text-[#a1a1aa]">Fix the bugs in the provided code to make all test cases pass.</span>
            </div>
          </div>
        )}

        {question.questionData?.type === 'codeChallenge' && (
          <div className="mt-4">
            <div className="bg-blue-500/10 border border-blue-500/25 rounded p-3">
              <strong className="text-blue-400">Instructions:</strong>{' '}
              <span className="text-[#a1a1aa]">
                Implement a solution that passes all test cases.
                {question.questionData?.codeTemplate && (
                  <span> Use the provided template as a starting point.</span>
                )}
              </span>
            </div>
          </div>
        )}

        {question.questionData?.type === 'fillInTheBlank' && question.questionData?.blanks && (
          <div className="mt-4">
            <div className="bg-cyan-500/10 border border-cyan-500/25 rounded p-3">
              <strong className="text-cyan-400">Instructions:</strong>{' '}
              <span className="text-[#a1a1aa]">
                Fill in the blanks to complete the code.
                There are {question.questionData.blanks.length} blank(s) to complete.
              </span>
            </div>
          </div>
        )}

        {/* Language-specific information for code questions */}
        {(question.questionData?.type === 'codeChallenge' || question.questionData?.type === 'codeDebugging') &&
         question.questionData?.codeConfig && (
          <div className="mt-4">
            <div className="bg-[#1a1a1e] p-3 rounded border border-[#2a2a2e]">
              <small className="text-[#6b6b70]">
                <strong className="text-[#a1a1aa]">Runtime:</strong> {question.questionData.codeConfig.runtime}<br/>
                <strong className="text-[#a1a1aa]">Entry Function:</strong> {question.questionData.codeConfig.entryFunction}<br/>
                <strong className="text-[#a1a1aa]">Timeout:</strong> {question.questionData.codeConfig.timeoutMs}ms
              </small>
            </div>
          </div>
        )}

        {/* Tags */}
        {question.questionData?.tags && question.questionData.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1 items-center">
              <small className="text-[#6b6b70] mr-2">Tags:</small>
              {question.questionData.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs font-medium border border-[#3a3a3e] rounded text-[#a1a1aa]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailsPane;
