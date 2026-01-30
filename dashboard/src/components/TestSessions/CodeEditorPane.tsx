// components/TestSessions/CodeEditorPane.tsx - ALIGNED with actual types
import React from 'react';
import { RotateCcw } from 'lucide-react';
import SafeMonacoEditor from '../SafeMonacoEditor';

interface CodeEditorPaneProps {
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
  currentAnswer: string;
  updateAnswer: (answer: string) => void;
  onReset?: () => void;
}

const getMonacoLanguage = (language?: string): string => {
  if (!language) return 'javascript';

  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    python: 'python',
    sql: 'sql',
    dart: 'dart',
    react: 'javascript',
    reactNative: 'javascript',
    flutter: 'dart',
    express: 'javascript',
  };

  return languageMap[language.toLowerCase()] || 'javascript';
};

const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  question,
  currentAnswer,
  updateAnswer,
  onReset
}) => {
  // Get initial code template
  const getInitialCode = (): string => {
    if (question.questionData?.type === 'codeDebugging' && question.questionData?.buggyCode) {
      return question.questionData.buggyCode;
    }
    if (question.questionData?.type === 'codeChallenge' && question.questionData?.codeTemplate) {
      return question.questionData.codeTemplate;
    }
    return '';
  };

  // Initialize with template if current answer is empty
  React.useEffect(() => {
    const isCodeQuestion = question.questionData?.type === 'codeChallenge' ||
                          question.questionData?.type === 'codeDebugging';

    if (isCodeQuestion && (!currentAnswer || currentAnswer.trim() === '')) {
      const initialCode = getInitialCode();
      if (initialCode) {
        updateAnswer(initialCode);
      }
    }
  }, [question.questionData?.type, currentAnswer, updateAnswer]);

  // Use current answer or fall back to initial code
  const editorValue = currentAnswer || getInitialCode();

  const getPlaceholderText = (): string => {
    switch (question.questionData?.type) {
      case 'codeDebugging':
        return 'Fix the buggy code...';
      case 'codeChallenge':
        return 'Write your solution...';
      default:
        return 'Write your code here...';
    }
  };

  const getPaneTitle = (): string => {
    switch (question.questionData?.type) {
      case 'codeDebugging':
        return 'Fix the Code';
      case 'codeChallenge':
        return 'Your Solution';
      case 'fillInTheBlank':
        return 'Complete the Code';
      default:
        return 'Code Editor';
    }
  };

  const shouldShowReset = (): boolean => {
    // Show reset if we have a template or buggy code to reset to
    return !!(question.questionData?.codeTemplate || question.questionData?.buggyCode);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2a2a2e] bg-[#141416] flex justify-between items-center">
        <div>
          <h6 className="font-mono text-sm font-semibold mb-0">{getPaneTitle()}</h6>
          {question.questionData?.language && (
            <small className="text-[#6b6b70]">{question.questionData.language}</small>
          )}
        </div>

        <div className="flex gap-2">
          {shouldShowReset() && onReset && (
            <button
              className="btn-secondary text-sm flex items-center gap-1"
              onClick={onReset}
              aria-label="Reset code to starting template"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-grow" style={{ minHeight: '300px' }}>
        <SafeMonacoEditor
          height="100%"
          language={getMonacoLanguage(question.questionData?.language)}
          value={editorValue}
          onChange={(value) => updateAnswer(value || '')}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            padding: { top: 10 },
            automaticLayout: true,
            theme: 'vs-dark',
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            mouseWheelZoom: true,
          }}
          placeholder={getPlaceholderText()}
        />
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t border-[#2a2a2e] bg-[#141416]">
        <div className="flex justify-between items-center">
          <small className="text-[#6b6b70]">
            {question.questionData?.language?.toUpperCase()} •{' '}
            {currentAnswer?.length || 0} characters
          </small>

          <div className="flex items-center gap-2">
            {question.questionData?.type === 'codeDebugging' && (
              <small className="text-cyan-400">
                Debug mode: Find and fix the errors
              </small>
            )}

            {question.questionData?.type === 'codeChallenge' && (
              <small className="text-blue-400">
                Challenge mode: Implement the solution
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPane;
