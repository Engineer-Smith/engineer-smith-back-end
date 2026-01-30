import React, { useState } from 'react';
import { Eye, Globe, Building } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const QuestionSummaryCard: React.FC = () => {
  const { state } = useQuestionCreation();
  const [previewMode, setPreviewMode] = useState(false);

  const {
    selectedLanguage,
    selectedCategory,
    selectedQuestionType,
    questionData,
    testCases,
    isGlobalQuestion
  } = state;

  const getQuestionTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True/False',
      fillInTheBlank: 'Fill in the Blank',
      codeChallenge: 'Code Challenge',
      codeDebugging: 'Code Debugging'
    };
    return typeLabels[type] || type;
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
      logic: 'Logic & Algorithms',
      ui: 'User Interface',
      syntax: 'Syntax & Features'
    };
    return categoryLabels[category] || category;
  };

  const getDifficultyBadge = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'badge-green';
      case 'medium': return 'badge-amber';
      case 'hard': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const getTotalPoints = (): number => {
    switch (selectedQuestionType) {
      case 'fillInTheBlank':
        return questionData.blanks?.reduce((sum, blank) => sum + (blank.points || 1), 0) || 1;
      case 'codeChallenge':
      case 'codeDebugging':
        return testCases.length || 1;
      case 'multipleChoice':
      case 'trueFalse':
        return 1;
      default:
        return 1;
    }
  };

  const renderQuestionPreview = () => {
    switch (selectedQuestionType) {
      case 'multipleChoice':
        return (
          <div className="card border-[#3a3a3e] mt-3">
            <div className="p-4">
              <h6 className="font-semibold text-[#f5f5f4] mb-3">Multiple Choice Question</h6>
              <p className="text-[#a1a1aa] mb-3">{questionData.description}</p>
              {questionData.options?.map((option, index) => (
                <div key={index} className="mb-2">
                  <div className={`p-2 rounded ${questionData.correctAnswer === index ? 'bg-green-500/10 border border-green-500/50' : 'bg-[#1a1a1e]'}`}>
                    <strong className="text-[#f5f5f4]">{String.fromCharCode(65 + index)}.</strong>{' '}
                    <span className="text-[#a1a1aa]">{option}</span>
                    {questionData.correctAnswer === index && (
                      <span className="badge-green ml-2">Correct</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'trueFalse':
        return (
          <div className="card border-[#3a3a3e] mt-3">
            <div className="p-4">
              <h6 className="font-semibold text-[#f5f5f4] mb-3">True/False Question</h6>
              <p className="text-[#a1a1aa] mb-3">{questionData.description}</p>
              <div className="flex gap-3">
                <div className={`p-2 rounded ${questionData.correctAnswer === true ? 'bg-green-500/10 border border-green-500/50' : 'bg-[#1a1a1e]'}`}>
                  <strong className="text-[#f5f5f4]">True</strong>
                  {questionData.correctAnswer === true && (
                    <span className="badge-green ml-2">Correct</span>
                  )}
                </div>
                <div className={`p-2 rounded ${questionData.correctAnswer === false ? 'bg-green-500/10 border border-green-500/50' : 'bg-[#1a1a1e]'}`}>
                  <strong className="text-[#f5f5f4]">False</strong>
                  {questionData.correctAnswer === false && (
                    <span className="badge-green ml-2">Correct</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'fillInTheBlank':
        return (
          <div className="card border-[#3a3a3e] mt-3">
            <div className="p-4">
              <h6 className="font-semibold text-[#f5f5f4] mb-3">Fill in the Blank Question</h6>
              <p className="text-[#a1a1aa] mb-3">{questionData.description}</p>
              <div className="mb-3">
                <label className="text-sm font-semibold text-[#a1a1aa]">Code Template:</label>
                <pre className="bg-[#1a1a1e] p-3 rounded mt-1 text-[#f5f5f4] overflow-auto">
                  {questionData.codeTemplate}
                </pre>
              </div>
              {questionData.blanks && questionData.blanks.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-[#a1a1aa]">Blank Configurations:</label>
                  {questionData.blanks.map((blank, index) => (
                    <div key={index} className="mb-2 p-2 bg-[#1a1a1e] rounded">
                      <div className="text-[#f5f5f4]"><strong>Blank {index + 1}:</strong> {blank.correctAnswers.join(', ')}</div>
                      <div className="text-sm text-[#6b6b70]">
                        {blank.caseSensitive ? 'Case sensitive' : 'Case insensitive'} • {blank.points} point{blank.points !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'codeChallenge':
        return (
          <div className="card border-[#3a3a3e] mt-3">
            <div className="p-4">
              <h6 className="font-semibold text-[#f5f5f4] mb-3">Code Challenge Question</h6>
              <p className="text-[#a1a1aa] mb-3">{questionData.description}</p>
              <div className="mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionData.codeConfig?.entryFunction && (
                    <div>
                      <label className="text-sm font-semibold text-[#a1a1aa]">Entry Function:</label>
                      <div><code className="text-[#f5f5f4]">{questionData.codeConfig.entryFunction}</code></div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-[#a1a1aa]">Runtime:</label>
                    <div className="text-[#f5f5f4]">{questionData.codeConfig?.runtime || 'node'}</div>
                  </div>
                </div>
              </div>
              {testCases.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-[#a1a1aa]">Test Cases ({testCases.length}):</label>
                  <div className="text-sm text-[#6b6b70]">
                    {testCases.filter(tc => !tc.hidden).length} visible, {testCases.filter(tc => tc.hidden).length} hidden
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'codeDebugging':
        return (
          <div className="card border-[#3a3a3e] mt-3">
            <div className="p-4">
              <h6 className="font-semibold text-[#f5f5f4] mb-3">Code Debugging Question</h6>
              <p className="text-[#a1a1aa] mb-3">{questionData.description}</p>
              <div className="mb-3">
                <label className="text-sm font-semibold text-[#a1a1aa]">Buggy Code:</label>
                <pre className="bg-[#1a1a1e] p-3 rounded mt-1 text-[#f5f5f4] max-h-[200px] overflow-auto">
                  {questionData.buggyCode}
                </pre>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#a1a1aa]">Solution Code:</label>
                <pre className="bg-[#1a1a1e] p-3 rounded mt-1 text-[#f5f5f4] max-h-[200px] overflow-auto">
                  {questionData.solutionCode}
                </pre>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-semibold text-blue-400 mb-0">Question Summary</h5>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye size={14} className="mr-1" />
              {previewMode ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex">
            <div className="w-36 text-[#a1a1aa] font-semibold">Title:</div>
            <div className="flex-1 text-[#f5f5f4]">{questionData.title}</div>
          </div>
          <div className="flex">
            <div className="w-36 text-[#a1a1aa] font-semibold">Description:</div>
            <div className="flex-1 text-[#f5f5f4] max-h-[100px] overflow-auto">
              {questionData.description}
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-36 text-[#a1a1aa] font-semibold">Type:</div>
            <div className="flex-1 flex gap-2 flex-wrap">
              <span className="badge-blue">
                {getQuestionTypeLabel(selectedQuestionType || '')}
              </span>
              <span className="badge-cyan">
                {selectedLanguage}
              </span>
              <span className="badge-gray">
                {getCategoryLabel(selectedCategory || '')}
              </span>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-36 text-[#a1a1aa] font-semibold">Status:</div>
            <div className="flex-1">
              <span className={(questionData.status || 'draft') === 'active' ? 'badge-green' : 'badge-gray'}>
                {(questionData.status || 'draft').charAt(0).toUpperCase() + (questionData.status || 'draft').slice(1)}
              </span>
              <div className="text-sm text-[#6b6b70] mt-1">
                {(questionData.status || 'draft') === 'active'
                  ? 'Available for use in tests'
                  : 'Saved as draft - requires activation'
                }
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-36 text-[#a1a1aa] font-semibold">Difficulty:</div>
            <div className="flex-1">
              <span className={getDifficultyBadge(questionData.difficulty || 'medium')}>
                {(questionData.difficulty || 'medium').charAt(0).toUpperCase() + (questionData.difficulty || 'medium').slice(1)}
              </span>
            </div>
          </div>
          {questionData.tags && questionData.tags.length > 0 && (
            <div className="flex items-center">
              <div className="w-36 text-[#a1a1aa] font-semibold">Tags:</div>
              <div className="flex-1 flex gap-1 flex-wrap">
                {questionData.tags.map((tag, index) => (
                  <span key={index} className="badge-gray text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center">
            <div className="w-36 text-[#a1a1aa] font-semibold">Total Points:</div>
            <div className="flex-1">
              <span className="badge-green">{getTotalPoints()}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-36 text-[#a1a1aa] font-semibold">Visibility:</div>
            <div className="flex-1">
              <span className={isGlobalQuestion ? "badge-cyan" : "badge-gray"}>
                {isGlobalQuestion ? (
                  <>
                    <Globe size={12} className="mr-1 inline" />
                    Global Question
                  </>
                ) : (
                  <>
                    <Building size={12} className="mr-1 inline" />
                    Organization Only
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Question Preview */}
        {previewMode && (
          <div className="mb-0">
            <h6 className="text-blue-400 font-semibold mb-3 mt-4">Question Preview</h6>
            {renderQuestionPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSummaryCard;
