// components/TestSessions/TestResultsPane.tsx - ALIGNED with actual question structure
import React from 'react';
import CodeTestingComponent from './CodeTestingComponent';

interface TestResultsPaneProps {
  sessionId: string;
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
        expected?: any;
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
  studentCode: string;
}

const TestResultsPane: React.FC<TestResultsPaneProps> = ({
  sessionId,
  question,
  studentCode,
}) => {
  // Only show for code questions
  const isCodeQuestion = question.questionData?.type === 'codeChallenge' || 
                        question.questionData?.type === 'codeDebugging';

  if (!isCodeQuestion) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-[#2a2a2e] bg-[#1c1c1f]">
          <h6 className="font-mono text-sm font-medium text-[#f5f5f4] mb-0">Test Results</h6>
          <p className="text-xs text-[#6b6b70] mt-1">
            Test results are only available for code questions
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#6b6b70] text-center">
            This question type does not support automated testing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a2a2e] bg-[#1c1c1f]">
        <h6 className="font-mono text-sm font-medium text-[#f5f5f4] mb-0">Test Results</h6>
        <p className="text-xs text-[#6b6b70] mt-1">
          Run tests to validate your solution
        </p>
      </div>

      {/* CodeTestingComponent Content */}
      <div className="flex-1 overflow-auto">
        <CodeTestingComponent
          sessionId={sessionId}
          question={question}
          studentCode={studentCode}
        />
      </div>
    </div>
  );
};

export default TestResultsPane;