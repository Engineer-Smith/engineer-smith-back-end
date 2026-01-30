// src/components/tests/QuestionBrowser.tsx - Built from scratch
import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  Users,
  Target,
  Eye,
  X
} from 'lucide-react';
import type {
  Question,
  QuestionType,
  Difficulty,
  Language,
  Tags,
  QuestionCategory,
  CreateTestData
} from '../../types';

interface QuestionBrowserProps {
  loading: boolean;
  questions: Question[];
  filteredQuestions: Question[];
  testData: CreateTestData;
  selectedSectionIndex: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: QuestionType | '';
  setFilterType: (type: QuestionType | '') => void;
  filterDifficulty: Difficulty | '';
  setFilterDifficulty: (difficulty: Difficulty | '') => void;
  filterLanguage: Language | '';
  setFilterLanguage: (language: Language | '') => void;
  filterCategory: QuestionCategory | '';
  setFilterCategory: (category: QuestionCategory | '') => void;
  filterTag: Tags | '';
  setFilterTag: (tag: Tags | '') => void;
  setSelectedSectionIndex: (index: number) => void;
  onToggleQuestion: (questionId: string) => void;
  onAssignAll: () => void;
  onClear: () => void;
}

const QuestionBrowser: React.FC<QuestionBrowserProps> = ({
  loading,
  filteredQuestions,
  testData,
  selectedSectionIndex,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterDifficulty,
  setFilterDifficulty,
  filterLanguage,
  setFilterLanguage,
  filterCategory,
  setFilterCategory,
  setSelectedSectionIndex,
  onToggleQuestion,
  onAssignAll,
  onClear
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showModal, setShowModal] = useState(false);

  const isQuestionSelected = (questionId: string): boolean => {
    if (testData.settings.useSections && testData.sections) {
      const section = testData.sections[selectedSectionIndex];
      return section?.questions?.some(q => q.questionId === questionId) || false;
    }
    return testData.questions?.some(q => q.questionId === questionId) || false;
  };

  const getDifficultyClass = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'easy': return 'badge-green';
      case 'medium': return 'badge-amber';
      case 'hard': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const getQuestionTypeIcon = (type: QuestionType): string => {
    switch (type) {
      case 'multipleChoice': return '📋';
      case 'trueFalse': return '✓✗';
      case 'codeChallenge': return '💻';
      case 'fillInTheBlank': return '📝';
      case 'codeDebugging': return '🐛';
      case 'dragDropCloze': return '🎯';
      default: return '';
    }
  };

  const getQuestionTypeDisplayName = (type: QuestionType): string => {
    switch (type) {
      case 'multipleChoice': return 'Multiple Choice';
      case 'trueFalse': return 'True/False';
      case 'codeChallenge': return 'Code Challenge';
      case 'fillInTheBlank': return 'Fill in the Blank';
      case 'codeDebugging': return 'Code Debugging';
      case 'dragDropCloze': return 'Drag & Drop';
      default: return 'Unknown';
    }
  };

  const handleViewQuestion = (question: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedQuestion(question);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQuestion(null);
  };

  return (
    <div>
      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b70]">
                <Search size={16} />
              </div>
              <input
                type="text"
                className="input w-full pl-10"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="select w-full"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as QuestionType | '')}
            >
              <option value="">All Types</option>
              <option value="multipleChoice">Multiple Choice</option>
              <option value="trueFalse">True/False</option>
              <option value="fillInTheBlank">Fill in Blank</option>
              <option value="dragDropCloze">Drag & Drop</option>
              <option value="codeChallenge">Code Challenge</option>
              <option value="codeDebugging">Code Debugging</option>
            </select>
          </div>
          <div>
            <select
              className="select w-full"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as QuestionCategory | '')}
            >
              <option value="">All Categories</option>
              <option value="logic">Logic</option>
              <option value="ui">UI</option>
              <option value="syntax">Syntax</option>
            </select>
          </div>
          <div>
            <select
              className="select w-full"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | '')}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <select
              className="select w-full"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value as Language | '')}
            >
              <option value="">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="react">React</option>
              <option value="sql">SQL</option>
              <option value="dart">Dart</option>
              <option value="flutter">Flutter</option>
              <option value="reactNative">React Native</option>
              <option value="swift">Swift</option>
              <option value="swiftui">SwiftUI</option>
              <option value="express">Express</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm flex items-center gap-1"
              onClick={onAssignAll}
              disabled={filteredQuestions.length === 0}
            >
              <CheckSquare size={14} />
              Select All Visible
            </button>
            <button
              className="btn-secondary text-sm"
              onClick={onClear}
            >
              Clear Selection
            </button>
          </div>
          <div className="text-[#6b6b70] text-sm">
            {filteredQuestions.length} questions found
          </div>
        </div>
      </div>

      {/* Section Selection */}
      {testData.settings.useSections && testData.sections && (
        <div className="card p-4 mb-4">
          <h6 className="mb-3 flex items-center gap-2 text-[#f5f5f4] font-semibold">
            <Target size={16} />
            Assign to Section
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {testData.sections.map((section, index) => (
              <button
                key={index}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedSectionIndex === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#1a1a1e] text-[#a1a1aa] hover:bg-[#2a2a2e]'
                }`}
                onClick={() => setSelectedSectionIndex(index)}
              >
                {section.name}
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                  selectedSectionIndex === index
                    ? 'bg-white/20 text-white'
                    : 'bg-[#2a2a2e] text-[#6b6b70]'
                }`}>
                  {section.questions.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card p-12 text-center">
          <div className="spinner w-8 h-8 mx-auto mb-3" />
          <p className="text-[#6b6b70]">Loading questions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredQuestions.length === 0 && (
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center gap-2">
          <Filter size={16} />
          No questions found matching your filters. Try adjusting your search criteria.
        </div>
      )}

      {/* Questions Grid */}
      {!loading && filteredQuestions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredQuestions.map((question) => {
            const isSelected = isQuestionSelected(question._id);

            return (
              <div
                key={question._id}
                className={`card p-4 cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-transparent hover:border-[#3a3a3e]'
                }`}
                onClick={() => onToggleQuestion(question._id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <CheckSquare size={18} className="text-blue-500" />
                    ) : (
                      <Square size={18} className="text-[#6b6b70]" />
                    )}
                    <span className="mr-1">{getQuestionTypeIcon(question.type)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyClass(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs border border-[#3a3a3e] text-[#a1a1aa]">
                      {question.language}
                    </span>
                    <button
                      className="btn-ghost p-1"
                      onClick={(e) => handleViewQuestion(question, e)}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                <h6 className="text-[#f5f5f4] font-semibold mb-2">{question.title}</h6>
                <p className="text-[#6b6b70] text-sm mb-3 line-clamp-2">
                  {question.description.length > 100
                    ? question.description.substring(0, 100) + '...'
                    : question.description
                  }
                </p>

                <div className="flex justify-between items-center text-[#6b6b70] text-sm">
                  <div className="flex items-center gap-2">
                    {question.category && (
                      <span className="px-2 py-0.5 rounded text-xs badge-blue">
                        {question.category}
                      </span>
                    )}
                    {question.isGlobal ? (
                      <span className="text-xs">Global</span>
                    ) : (
                      <span className="text-xs">Org</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    {question.usageStats?.timesUsed || 0}
                  </div>
                </div>

                {question.tags && question.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {question.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded text-xs badge-blue"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="px-2 py-0.5 rounded text-xs badge-blue">
                        +{question.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Question Preview Modal */}
      {showModal && selectedQuestion && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content max-w-4xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-[#f5f5f4] font-semibold">Question Preview</h5>
              <button className="btn-ghost p-1" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <div>
              <div className="mb-4">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="text-[#f5f5f4] font-semibold">{selectedQuestion.title}</h5>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyClass(selectedQuestion.difficulty)}`}>
                      {selectedQuestion.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs border border-[#3a3a3e] text-[#a1a1aa]">
                      {selectedQuestion.language}
                    </span>
                    {selectedQuestion.category && (
                      <span className="px-2 py-0.5 rounded text-xs badge-blue">
                        {selectedQuestion.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#6b6b70] text-sm mb-3">
                  <span className="flex items-center gap-1">
                    <span>{getQuestionTypeIcon(selectedQuestion.type)}</span>
                    {getQuestionTypeDisplayName(selectedQuestion.type)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    Used {selectedQuestion.usageStats?.timesUsed || 0} times
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-[#f5f5f4] font-semibold mb-2">Description</h6>
                <p className="text-[#a1a1aa]">{selectedQuestion.description}</p>
              </div>

              {/* Multiple Choice Options */}
              {selectedQuestion.type === 'multipleChoice' && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Answer Options</h6>
                  {selectedQuestion.options && selectedQuestion.options.length > 0 ? (
                    <div className="space-y-2">
                      {selectedQuestion.options.map((option, index) => {
                        const isCorrect = selectedQuestion.correctAnswer === index;
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg flex items-center gap-2 ${
                              isCorrect ? 'bg-green-500/10 border border-green-500/25' : 'bg-[#1a1a1e]'
                            }`}
                          >
                            <span className="px-2 py-0.5 rounded text-xs badge-gray">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className={isCorrect ? 'text-green-400 font-medium' : 'text-[#a1a1aa]'}>
                              {option}
                            </span>
                            {isCorrect && (
                              <CheckSquare size={16} className="ml-auto text-green-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm">
                      No answer options available for this question.
                    </div>
                  )}
                </div>
              )}

              {/* True/False Options */}
              {selectedQuestion.type === 'trueFalse' && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Answer Options</h6>
                  {selectedQuestion.options && selectedQuestion.options.length > 0 ? (
                    <div className="space-y-2">
                      {selectedQuestion.options.map((option, index) => {
                        const isCorrect = selectedQuestion.correctAnswer === index;
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg flex items-center gap-2 ${
                              isCorrect ? 'bg-green-500/10 border border-green-500/25' : 'bg-[#1a1a1e]'
                            }`}
                          >
                            <span className="px-2 py-0.5 rounded text-xs badge-gray">
                              {option === 'true' || option === 'True' ? 'T' : 'F'}
                            </span>
                            <span className={isCorrect ? 'text-green-400 font-medium' : 'text-[#a1a1aa]'}>
                              {option}
                            </span>
                            {isCorrect && (
                              <CheckSquare size={16} className="ml-auto text-green-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm">
                      No answer options available for this question.
                    </div>
                  )}
                </div>
              )}

              {/* Fill in the Blank */}
              {selectedQuestion.type === 'fillInTheBlank' && selectedQuestion.codeTemplate && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Code Template</h6>
                  <pre className="p-3 rounded-lg bg-[#1a1a1e] border border-[#2a2a2e] text-[#a1a1aa] overflow-x-auto">
                    <code>{selectedQuestion.codeTemplate}</code>
                  </pre>

                  {selectedQuestion.blanks && selectedQuestion.blanks.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-[#f5f5f4] font-semibold mb-2">Expected Answers</h6>
                      {selectedQuestion.blanks.map((blank, index) => (
                        <div key={blank.id || index} className="mb-2">
                          <span className="px-2 py-0.5 rounded text-xs badge-blue mr-2">
                            Blank {index + 1}
                          </span>
                          <span className="text-[#a1a1aa]">
                            Accepts: {blank.correctAnswers.join(', ')}
                          </span>
                          {blank.hint && (
                            <div className="text-[#6b6b70] text-sm mt-1">
                              Hint: {blank.hint}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Drag & Drop Cloze */}
              {selectedQuestion.type === 'dragDropCloze' && selectedQuestion.codeTemplate && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Code Template</h6>
                  <pre className="p-3 rounded-lg bg-[#1a1a1e] border border-[#2a2a2e] text-[#a1a1aa] overflow-x-auto">
                    <code>{selectedQuestion.codeTemplate}</code>
                  </pre>

                  {selectedQuestion.dragOptions && selectedQuestion.dragOptions.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-[#f5f5f4] font-semibold mb-2">Drag Options</h6>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.dragOptions.map((option) => (
                          <span
                            key={option.id}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-400 text-sm"
                          >
                            {option.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedQuestion.blanks && selectedQuestion.blanks.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-[#f5f5f4] font-semibold mb-2">Blanks & Answers</h6>
                      {selectedQuestion.blanks.map((blank, index) => (
                        <div key={blank.id || index} className="mb-2 p-2 rounded bg-[#1a1a1e]">
                          <span className="px-2 py-0.5 rounded text-xs badge-purple mr-2">
                            {blank.id || `Blank ${index + 1}`}
                          </span>
                          <span className="text-[#a1a1aa]">
                            Correct: {blank.correctAnswers.map(answerId => {
                              const option = selectedQuestion.dragOptions?.find(o => o.id === answerId);
                              return option ? option.text : answerId;
                            }).join(', ')}
                          </span>
                          {blank.hint && (
                            <div className="text-[#6b6b70] text-sm mt-1">
                              Hint: {blank.hint}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Code Challenge Test Cases */}
              {selectedQuestion.type === 'codeChallenge' && selectedQuestion.testCases && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Test Cases</h6>
                  <div className="space-y-2">
                    {selectedQuestion.testCases.map((testCase, index) => (
                      <div key={index} className="p-3 rounded-lg bg-[#1a1a1e]">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <strong className="text-[#f5f5f4]">Test {index + 1}</strong>
                            {testCase.name && <span className="text-[#6b6b70] ml-2">({testCase.name})</span>}
                          </div>
                          {testCase.hidden && (
                            <span className="badge-gray px-2 py-0.5 rounded text-xs">Hidden</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <small className="text-[#6b6b70]">Input:</small>
                          <code className="block p-1 rounded bg-[#0a0a0b] text-[#a1a1aa] mt-1">
                            {JSON.stringify(testCase.args)}
                          </code>
                        </div>
                        <div className="mt-1">
                          <small className="text-[#6b6b70]">Expected:</small>
                          <code className="block p-1 rounded bg-[#0a0a0b] text-[#a1a1aa] mt-1">
                            {JSON.stringify(testCase.expected)}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Debugging */}
              {selectedQuestion.type === 'codeDebugging' && (
                <div className="mb-4">
                  {selectedQuestion.buggyCode && (
                    <div className="mb-3">
                      <h6 className="text-[#f5f5f4] font-semibold mb-2">Buggy Code</h6>
                      <pre className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-[#a1a1aa] overflow-x-auto">
                        <code>{selectedQuestion.buggyCode}</code>
                      </pre>
                    </div>
                  )}

                  {selectedQuestion.solutionCode && (
                    <div className="mb-3">
                      <h6 className="text-[#f5f5f4] font-semibold mb-2">Solution Code</h6>
                      <pre className="p-3 rounded-lg bg-green-500/10 border border-green-500/25 text-[#a1a1aa] overflow-x-auto">
                        <code>{selectedQuestion.solutionCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Tags</h6>
                  <div className="flex flex-wrap gap-1">
                    {selectedQuestion.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 rounded text-xs badge-blue">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[#2a2a2e] pt-3 text-[#6b6b70] text-sm">
                <div className="flex justify-between">
                  <span>Created: {new Date(selectedQuestion.createdAt).toLocaleDateString()}</span>
                  {selectedQuestion.updatedAt && (
                    <span>Updated: {new Date(selectedQuestion.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#2a2a2e]">
              <button className="btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  onToggleQuestion(selectedQuestion._id);
                  handleCloseModal();
                }}
              >
                {isQuestionSelected(selectedQuestion._id) ? 'Remove from Test' : 'Add to Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBrowser;
