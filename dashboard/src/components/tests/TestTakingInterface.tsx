import Editor from '@monaco-editor/react';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Eye,
  FileText,
  Flag,
  RotateCcw,
  Square
} from 'lucide-react';
import React, { useState } from 'react';
import type { Language, Question, Test, TestSession } from '../../types';

// Monaco language mapping
const getMonacoLanguage = (language?: Language): string => {
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
    express: 'javascript'
  };
  return languageMap[language || 'javascript'] || 'javascript';
};

interface TestTakingInterfaceProps {
  testSession?: TestSession;
  test?: Test;
  mode?: 'taking' | 'preview';
  onBack?: () => void;
  title?: string;
}

interface FlattenedQuestion extends Question {
  points: number;
  sectionIndex?: number;
  sectionName?: string;
  questionIndex: number;
  sectionQuestionIndex?: number;
}

const TestTakingInterface: React.FC<TestTakingInterfaceProps> = ({
  test,
  mode = 'taking',
  onBack,
  title
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  const isPreviewMode = mode === 'preview';

  // Flatten questions with section information from the populated test object
  const flattenedQuestions: FlattenedQuestion[] = React.useMemo(() => {
    if (!test) return [];

    const flattened: FlattenedQuestion[] = [];
    let overallIndex = 0;

    if (test.settings?.useSections && test.sections) {
      test.sections.forEach((section, sectionIndex) => {
        section.questions?.forEach((questionRef, sectionQuestionIndex) => {
          const question = (questionRef as any).questionData;
          if (question) {
            flattened.push({
              ...question,
              _id: question._id,
              points: questionRef.points,
              sectionIndex,
              sectionName: section.name,
              questionIndex: overallIndex,
              sectionQuestionIndex
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
            points: questionRef.points,
            questionIndex: index
          });
        }
      });
    }

    return flattened;
  }, [test]);

  const currentQuestion = flattenedQuestions[currentQuestionIndex];
  const totalQuestions = flattenedQuestions.length;

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Answer handling
  const handleAnswerChange = (questionId: string, answer: any) => {
    if (!isPreviewMode) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    }
  };

  const handleCodeChange = (code: string) => {
    if (!isPreviewMode && currentQuestion) {
      handleAnswerChange(currentQuestion._id, code);
    }
  };

  const toggleFlag = (questionIndex: number) => {
    if (!isPreviewMode) {
      setFlaggedQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(questionIndex)) {
          newSet.delete(questionIndex);
        } else {
          newSet.add(questionIndex);
        }
        return newSet;
      });
    }
  };

  // Get current section info
  const getCurrentSectionInfo = () => {
    if (!currentQuestion || !test?.settings?.useSections) {
      return null;
    }

    const section = test.sections?.[currentQuestion.sectionIndex!];
    const sectionQuestions = flattenedQuestions.filter(q => q.sectionIndex === currentQuestion.sectionIndex);
    const currentInSection = sectionQuestions.findIndex(q => q.questionIndex === currentQuestionIndex);

    return {
      name: section?.name || 'Section',
      current: currentInSection + 1,
      total: sectionQuestions.length,
      timeLimit: section?.timeLimit || 0
    };
  };

  const sectionInfo = getCurrentSectionInfo();

  // Progress calculation
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  if (!test) {
    return (
      <div className="container-section py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="spinner w-8 h-8 mx-auto mb-3" />
          <p className="text-[#6b6b70]">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container-section py-12">
        <div className="max-w-md mx-auto text-center">
          <FileText size={48} className="text-[#6b6b70] mx-auto mb-3" />
          <h5 className="text-[#f5f5f4] font-semibold mb-2">No questions available</h5>
          <p className="text-[#6b6b70]">
            This test doesn't have any questions yet or the questions couldn't be loaded.
          </p>
          <div className="mt-4 text-sm text-[#6b6b70]">
            <div className="mb-1">Debug info:</div>
            <div>Test _id: {test._id}</div>
            <div>Use Sections: {test.settings?.useSections ? 'Yes' : 'No'}</div>
            <div>Sections Count: {test.sections?.length || 0}</div>
            <div>Questions Count: {test.questions?.length || 0}</div>
            <div>Flattened Questions: {flattenedQuestions.length}</div>
          </div>
          {onBack && (
            <button className="btn-secondary mt-4 flex items-center gap-2 mx-auto" onClick={onBack}>
              <ChevronLeft size={16} />
              Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#141416] border-b border-[#2a2a2e]">
        <div className="container-section py-3">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button className="btn-secondary text-sm" onClick={onBack}>
                  <ChevronLeft size={16} />
                </button>
              )}
              <div>
                <h6 className="text-[#f5f5f4] font-semibold mb-0">{title || test?.title || 'Test'}</h6>
                <small className="text-[#6b6b70]">
                  {isPreviewMode ? 'Preview Mode' : 'Taking Test'}
                </small>
              </div>
            </div>

            <div className="text-center">
              {/* Progress Bar */}
              <div className="mb-1">
                <small className="text-[#6b6b70]">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                  {sectionInfo && (
                    <> &bull; {sectionInfo.name} ({sectionInfo.current}/{sectionInfo.total})</>
                  )}
                </small>
              </div>
              <div className="progress-bar h-1.5 max-w-xs mx-auto">
                <div
                  className="progress-fill bg-blue-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="text-right">
              {!isPreviewMode && (
                <div className="flex items-center justify-end gap-2">
                  <button
                    className={`p-2 rounded ${flaggedQuestions.has(currentQuestionIndex) ? 'bg-amber-500 text-white' : 'btn-ghost'}`}
                    onClick={() => toggleFlag(currentQuestionIndex)}
                  >
                    <Flag size={16} />
                  </button>
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-[#6b6b70]" />
                    <span className="font-bold text-[#f5f5f4]">45:30</span>
                  </div>
                </div>
              )}
              {isPreviewMode && (
                <span className="badge-blue px-2 py-1 rounded flex items-center gap-1 inline-flex">
                  <Eye size={12} />
                  Preview
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-2">
          {/* Left Panel - Question */}
          <div className="flex flex-col border-r border-[#2a2a2e]">
            <div className="p-6 flex-1 overflow-auto">
              {/* Question Header */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-[#f5f5f4] font-semibold">{currentQuestion.title}</h5>
                  <span className="badge-blue px-2 py-0.5 rounded text-xs">{currentQuestion.points} pts</span>
                </div>

                {/* Question Metadata */}
                <div className="flex gap-2 mb-3">
                  <span className="badge-gray px-2 py-0.5 rounded text-xs">
                    {currentQuestion.type.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {currentQuestion.difficulty && (
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      currentQuestion.difficulty === 'easy' ? 'badge-green' :
                      currentQuestion.difficulty === 'medium' ? 'badge-amber' : 'badge-red'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  )}
                  {currentQuestion.language && (
                    <span className="badge-blue px-2 py-0.5 rounded text-xs">{currentQuestion.language}</span>
                  )}
                </div>
              </div>

              {/* Question Description */}
              <div className="mb-4">
                <p className="text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
                  {currentQuestion.description}
                </p>
              </div>

              {/* Code Snippet for Multiple Choice (if present) */}
              {currentQuestion.type === 'multipleChoice' && currentQuestion.options?.[0] && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Code:</h6>
                  <div className="border border-[#2a2a2e] rounded-lg overflow-hidden" style={{ height: '300px' }}>
                    <Editor
                      height="300px"
                      language={getMonacoLanguage(currentQuestion.language)}
                      value={currentQuestion.options[0]}
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        padding: { top: 10 },
                        automaticLayout: true,
                        theme: 'vs-dark'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-3 border-t border-[#2a2a2e] bg-[#1a1a1e]">
              <div className="flex justify-between items-center">
                <button
                  className="btn-secondary flex items-center gap-1"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="text-center">
                  <small className="text-[#6b6b70]">
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </small>
                </div>

                <button
                  className="btn-primary flex items-center gap-1"
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Answer Interface */}
          <div className="flex flex-col">
            <div className="p-6 flex-1 overflow-auto">
              <h6 className="text-[#f5f5f4] font-semibold mb-4">Your Answer:</h6>

              {/* Multiple Choice Options */}
              {currentQuestion.type === 'multipleChoice' && (
                <div>
                  {currentQuestion.options?.slice(1).map((option, index) => (
                    <div key={index} className="mb-3">
                      <label
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                          !isPreviewMode && answers[currentQuestion._id] === index + 1
                            ? 'bg-blue-500/10 border-blue-500'
                            : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={index + 1}
                          checked={!isPreviewMode ? answers[currentQuestion._id] === index + 1 : false}
                          onChange={() => handleAnswerChange(currentQuestion._id, index + 1)}
                          disabled={isPreviewMode}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-[#f5f5f4] mb-1">
                            {String.fromCharCode(65 + index)}. {option}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* True/False Options */}
              {currentQuestion.type === 'trueFalse' && (
                <div>
                  <div className="mb-3">
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        !isPreviewMode && answers[currentQuestion._id] === true
                          ? 'bg-green-500/10 border-green-500'
                          : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        checked={!isPreviewMode ? answers[currentQuestion._id] === true : false}
                        onChange={() => handleAnswerChange(currentQuestion._id, true)}
                        disabled={isPreviewMode}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <CheckCircle size={20} className="mr-2 text-green-500" />
                        <span className="font-medium text-[#f5f5f4]">True</span>
                      </div>
                    </label>
                  </div>

                  <div className="mb-3">
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        !isPreviewMode && answers[currentQuestion._id] === false
                          ? 'bg-red-500/10 border-red-500'
                          : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        checked={!isPreviewMode ? answers[currentQuestion._id] === false : false}
                        onChange={() => handleAnswerChange(currentQuestion._id, false)}
                        disabled={isPreviewMode}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <Square size={20} className="mr-2 text-red-500" />
                        <span className="font-medium text-[#f5f5f4]">False</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Code Editor for Code Questions */}
              {(currentQuestion.type === 'codeChallenge' || currentQuestion.type === 'codeDebugging') && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h6 className="text-[#f5f5f4] font-semibold">
                      {currentQuestion.type === 'codeDebugging' ? 'Fix the code:' : 'Write your solution:'}
                    </h6>
                    {!isPreviewMode && (
                      <button className="btn-secondary text-sm flex items-center gap-1" onClick={() => handleCodeChange('')}>
                        <RotateCcw size={14} />
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="border border-[#2a2a2e] rounded-lg overflow-hidden" style={{ height: '400px' }}>
                    <Editor
                      height="400px"
                      language={getMonacoLanguage(currentQuestion.language)}
                      value={
                        isPreviewMode
                          ? currentQuestion.options?.[0] || `// ${currentQuestion.type === 'codeDebugging' ? 'Fix this code' : 'Write your solution here'}`
                          : answers[currentQuestion._id] || currentQuestion.options?.[0] || ''
                      }
                      onChange={(value) => handleCodeChange(value || '')}
                      options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        padding: { top: 10 },
                        automaticLayout: true,
                        theme: 'vs-dark',
                        readOnly: isPreviewMode
                      }}
                    />
                  </div>

                  {isPreviewMode && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center gap-2 text-sm">
                      <Eye size={16} />
                      Preview mode - code editor is read-only
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Answer Status */}
            <div className="p-3 border-t border-[#2a2a2e] bg-[#1a1a1e]">
              <div className="flex justify-between items-center">
                <div>
                  {!isPreviewMode && (
                    <span className="text-sm">
                      {answers[currentQuestion._id] !== undefined ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle size={14} />
                          Answered
                        </span>
                      ) : (
                        <span className="text-[#6b6b70] flex items-center gap-1">
                          <Circle size={14} />
                          Not answered
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {!isPreviewMode && (
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary text-sm text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                      onClick={() => handleAnswerChange(currentQuestion._id, undefined)}
                    >
                      Clear Answer
                    </button>
                    {currentQuestionIndex === totalQuestions - 1 && (
                      <button className="btn-primary text-sm bg-green-500 hover:bg-green-600">
                        Submit Test
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTakingInterface;
