// src/components/QuestionCreation/components/DuplicateWarningModal.tsx
import React, { useState } from 'react';
import {
  AlertTriangle,
  Eye,
  Globe,
  Building,
  CheckCircle,
  X,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';
import type { DuplicateQuestion } from '../../../context/QuestionCreationContext';

const DuplicateWarningModal: React.FC = () => {
  const {
    state,
    dismissDuplicateWarning,
    cancelCreation
  } = useQuestionCreation();

  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateQuestion | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { duplicatesFound, showDuplicateWarning } = state;

  const handleClose = () => {
    dismissDuplicateWarning();
    setSelectedDuplicate(null);
    setShowDetails(false);
  };

  const handleContinueAnyway = () => {
    handleClose();
  };

  const handleCancelCreation = () => {
    cancelCreation();
  };

  const handleViewDetails = (duplicate: DuplicateQuestion) => {
    setSelectedDuplicate(duplicate);
    setShowDetails(true);
  };

  const getSimilarityBadgeClass = (similarity: number): string => {
    if (similarity >= 90) return 'badge-red';
    if (similarity >= 70) return 'badge-amber';
    return 'badge-blue';
  };

  const getSimilarityLabel = (similarity: number): string => {
    if (similarity >= 90) return 'Exact';
    if (similarity >= 70) return 'High';
    if (similarity >= 50) return 'Medium';
    return 'Low';
  };

  const getSimilarityProgressColor = (similarity: number): string => {
    if (similarity >= 90) return 'bg-red-500';
    if (similarity >= 70) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  // Render question as student would see it
  const renderQuestionPreview = (duplicate: DuplicateQuestion) => {
    return (
      <div className="bg-[#1a1a1e] p-6 rounded-lg max-w-3xl mx-auto">
        <div className="mb-4">
          <h5 className="mb-3 text-[#f5f5f4] font-semibold">{duplicate.title}</h5>
          <p className="text-[#a1a1aa] mb-4">{duplicate.description}</p>
        </div>

        {duplicate.type === 'multipleChoice' && duplicate.options && (
          <div className="space-y-3">
            {duplicate.options.map((option: string, index: number) => (
              <div
                key={index}
                className={`flex items-center p-3 rounded border ${
                  duplicate.correctAnswer === index
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-[#141416] border-[#2a2a2e] text-[#a1a1aa]'
                }`}
              >
                <div className={`font-bold mr-3 min-w-[24px] ${
                  duplicate.correctAnswer === index ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-grow">{option}</span>
                {duplicate.correctAnswer === index && (
                  <Check size={18} className="text-green-400 ml-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {duplicate.type === 'trueFalse' && typeof duplicate.correctAnswer === 'number' && (
          <div className="space-y-3">
            <div className={`flex items-center p-3 rounded border ${
              duplicate.correctAnswer === 0
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-[#141416] border-[#2a2a2e] text-[#a1a1aa]'
            }`}>
              <div className={`font-bold mr-3 min-w-[24px] ${
                duplicate.correctAnswer === 0 ? 'text-green-400' : 'text-blue-400'
              }`}>A</div>
              <span className="flex-grow">True</span>
              {duplicate.correctAnswer === 0 && (
                <Check size={18} className="text-green-400 ml-2" />
              )}
            </div>
            <div className={`flex items-center p-3 rounded border ${
              duplicate.correctAnswer === 1
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-[#141416] border-[#2a2a2e] text-[#a1a1aa]'
            }`}>
              <div className={`font-bold mr-3 min-w-[24px] ${
                duplicate.correctAnswer === 1 ? 'text-green-400' : 'text-blue-400'
              }`}>B</div>
              <span className="flex-grow">False</span>
              {duplicate.correctAnswer === 1 && (
                <Check size={18} className="text-green-400 ml-2" />
              )}
            </div>
          </div>
        )}

        {duplicate.type === 'fillInTheBlank' && (
          <div className="bg-[#0a0a0b] text-[#f5f5f4] p-4 rounded-lg">
            <pre className="mb-0 text-sm leading-relaxed">
              <code>{duplicate.codeTemplate || 'Code template not available'}</code>
            </pre>
          </div>
        )}

        {(duplicate.type === 'codeChallenge' || duplicate.type === 'codeDebugging') && (
          <div className="bg-blue-500/10 border border-blue-500/25 p-3 rounded-lg">
            <div className="text-blue-400 font-semibold mb-2">
              {duplicate.type === 'codeChallenge' ? 'Code Challenge' : 'Code Debugging'} Question
            </div>
            {duplicate.codeConfig?.entryFunction && (
              <div className="text-sm text-[#a1a1aa]">
                <strong>Function:</strong> <code className="bg-[#1a1a1e] px-2 py-1 rounded">{duplicate.codeConfig.entryFunction}</code>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const exactMatches = duplicatesFound.filter(d => d.exactMatch);

  if (!showDuplicateWarning) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-5xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-[#2a2a2e] bg-[#1a1a1e] flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-amber-400 mr-2" />
            <span className="font-semibold text-[#f5f5f4]">Potential Duplicate Questions Found</span>
            <span className="badge-gray ml-3">
              {duplicatesFound.length} Similar Question{duplicatesFound.length > 1 ? 's' : ''}
            </span>
          </div>
          <button className="text-[#6b6b70] hover:text-[#f5f5f4]" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!showDetails ? (
            <div>
              {exactMatches.length > 0 && (
                <div className="m-4 mb-3 p-3 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center">
                  <AlertTriangle size={16} className="text-red-400 mr-2" />
                  <span className="text-red-400">
                    <strong>Exact matches found!</strong> These questions appear identical to yours.
                  </span>
                </div>
              )}

              <div className="p-4 pt-3">
                <p className="text-[#6b6b70] mb-4">
                  We found {duplicatesFound.length} existing question{duplicatesFound.length > 1 ? 's' : ''} similar to yours.
                  Review them below to avoid creating duplicates.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {duplicatesFound.map((duplicate) => (
                    <div
                      key={duplicate._id}
                      className={`card h-full ${duplicate.exactMatch ? 'border-red-500/50' : 'border-amber-500/50'}`}
                    >
                      {/* Card Header */}
                      <div className="p-3 border-b border-[#2a2a2e] bg-[#1a1a1e]">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {duplicate.exactMatch && (
                                <span className="badge-red text-xs">Exact Match</span>
                              )}
                              <span className={`${getSimilarityBadgeClass(duplicate.similarity)} text-xs`}>
                                {duplicate.similarity}% {getSimilarityLabel(duplicate.similarity)}
                              </span>
                              <span className={`${duplicate.source === 'Global' ? 'badge-blue' : 'badge-gray'} text-xs`}>
                                {duplicate.source === 'Global' ? (
                                  <>
                                    <Globe size={10} className="mr-1 inline" />
                                    Global
                                  </>
                                ) : (
                                  <>
                                    <Building size={10} className="mr-1 inline" />
                                    Org
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              <span className="badge-blue text-xs">{duplicate.type}</span>
                              <span className="badge-cyan text-xs">{duplicate.language}</span>
                              <span className="badge-gray text-xs">{duplicate.difficulty}</span>
                            </div>
                          </div>
                        </div>
                        <div className="progress-bar h-1 mb-2">
                          <div
                            className={`h-full ${getSimilarityProgressColor(duplicate.similarity)}`}
                            style={{ width: `${duplicate.similarity}%` }}
                          />
                        </div>
                      </div>

                      {/* Question Preview */}
                      <div className="p-3">
                        <div>
                          <h6 className="mb-2 truncate text-[#f5f5f4] font-semibold">{duplicate.title}</h6>
                          <p className="text-[#a1a1aa] text-sm mb-3 line-clamp-2">
                            {duplicate.description}
                          </p>

                          {/* Mini answer preview */}
                          {duplicate.type === 'multipleChoice' && duplicate.options && Array.isArray(duplicate.options) && (
                            <div className="space-y-1">
                              {duplicate.options.slice(0, 2).map((option: string, idx: number) => (
                                <div
                                  key={idx}
                                  className={`text-sm p-2 rounded border ${
                                    duplicate.correctAnswer === idx
                                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                      : 'bg-[#1a1a1e] border-[#2a2a2e] text-[#a1a1aa]'
                                  }`}
                                >
                                  <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                                  {option.length > 25 ? option.substring(0, 25) + '...' : option}
                                  {duplicate.correctAnswer === idx && <Check size={12} className="ml-1 inline" />}
                                </div>
                              ))}
                              {duplicate.options.length > 2 && (
                                <div className="text-sm text-[#6b6b70] mt-1">
                                  +{duplicate.options.length - 2} more option{duplicate.options.length > 3 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}

                          {duplicate.type === 'trueFalse' && typeof duplicate.correctAnswer === 'number' && (
                            <div className="space-y-1">
                              <div className={`text-sm p-2 rounded border ${
                                duplicate.correctAnswer === 0
                                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                  : 'bg-[#1a1a1e] border-[#2a2a2e] text-[#a1a1aa]'
                              }`}>
                                <span className="font-bold mr-2">A.</span> True {duplicate.correctAnswer === 0 && <Check size={12} className="ml-1 inline" />}
                              </div>
                              <div className={`text-sm p-2 rounded border ${
                                duplicate.correctAnswer === 1
                                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                  : 'bg-[#1a1a1e] border-[#2a2a2e] text-[#a1a1aa]'
                              }`}>
                                <span className="font-bold mr-2">B.</span> False {duplicate.correctAnswer === 1 && <Check size={12} className="ml-1 inline" />}
                              </div>
                            </div>
                          )}

                          {/* Fallback for other question types or missing data */}
                          {(duplicate.type === 'fillInTheBlank' || duplicate.type === 'codeChallenge' || duplicate.type === 'codeDebugging' ||
                            (duplicate.type === 'multipleChoice' && !duplicate.options)) && (
                            <div>
                              <div className="text-sm p-2 bg-blue-500/10 text-blue-400 rounded border border-blue-500/25">
                                <strong>
                                  {duplicate.type === 'fillInTheBlank' ? 'Fill in the Blank' :
                                   duplicate.type === 'codeChallenge' ? 'Code Challenge' :
                                   duplicate.type === 'codeDebugging' ? 'Code Debugging' :
                                   'Multiple Choice'}
                                </strong> question
                                {duplicate.codeConfig?.entryFunction && (
                                  <div className="mt-1">
                                    Function: <code className="text-xs">{duplicate.codeConfig.entryFunction}</code>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-3 pt-0">
                        <button
                          className="btn-primary w-full text-sm"
                          onClick={() => handleViewDetails(duplicate)}
                        >
                          <Eye size={14} className="mr-1" />
                          View Full Question
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            selectedDuplicate && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => setShowDetails(false)}
                  >
                    <ArrowLeft size={14} className="mr-1" />
                    Back to List
                  </button>
                  <div className="flex gap-2 flex-wrap">
                    {selectedDuplicate.exactMatch && (
                      <span className="badge-red">Exact Match</span>
                    )}
                    <span className={getSimilarityBadgeClass(selectedDuplicate.similarity)}>
                      {selectedDuplicate.similarity}% {getSimilarityLabel(selectedDuplicate.similarity)}
                    </span>
                    <span className={selectedDuplicate.source === 'Global' ? 'badge-blue' : 'badge-gray'}>
                      {selectedDuplicate.source === 'Global' ? (
                        <>
                          <Globe size={12} className="mr-1 inline" />
                          Global Question
                        </>
                      ) : (
                        <>
                          <Building size={12} className="mr-1 inline" />
                          Your Organization
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {renderQuestionPreview(selectedDuplicate)}

                <div className="mt-4">
                  <div className={`p-3 rounded-lg border ${
                    selectedDuplicate.exactMatch
                      ? 'bg-red-500/10 border-red-500/25 text-red-400'
                      : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                  }`}>
                    {selectedDuplicate.exactMatch ? (
                      <>
                        <strong>Exact Match:</strong> This question appears identical to yours.
                        Consider using the existing question instead.
                      </>
                    ) : (
                      <>
                        <strong>Similar Content:</strong> This question has similar content.
                        Review carefully before proceeding.
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a2e] bg-[#1a1a1e]">
          <div className="flex justify-between items-center">
            <div className="text-sm text-[#6b6b70]">
              {exactMatches.length > 0 ? (
                <span className="text-red-400 flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  Exact matches found - review recommended
                </span>
              ) : (
                <span>
                  Similar questions found - review for overlap
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                onClick={handleCancelCreation}
              >
                <X size={14} className="mr-1" />
                Cancel Creation
              </button>
              <button
                className={exactMatches.length > 0 ? "btn-danger" : "btn-primary"}
                onClick={handleContinueAnyway}
              >
                <CheckCircle size={14} className="mr-1" />
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningModal;
