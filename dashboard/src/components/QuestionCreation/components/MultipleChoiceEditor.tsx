// src/components/QuestionCreation/components/MultipleChoiceEditor.tsx - CONTEXT INTEGRATED

import { AlertTriangle, CheckCircle, Info, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import type { CreateQuestionData } from '../../../types';

interface MultipleChoiceEditorProps {
  questionData: Partial<CreateQuestionData>;
  onInputChange: (field: keyof CreateQuestionData, value: any) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    hasErrors: boolean;
    hasWarnings: boolean;
  };
  isFieldRequired?: (field: string) => boolean;
  getValidationWarnings?: () => string[];
}

const MultipleChoiceEditor: React.FC<MultipleChoiceEditorProps> = ({
  questionData,
  onInputChange,
  validation,
  isFieldRequired = () => false,
  getValidationWarnings = () => []
}) => {
  const isOptionsRequired = isFieldRequired('options');
  const isCorrectAnswerRequired = isFieldRequired('correctAnswer');
  const contextWarnings = getValidationWarnings();

  const getFieldErrors = (fieldName: string): string[] => {
    if (!validation?.errors) return [];
    return validation.errors.filter(error =>
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const optionsErrors = getFieldErrors('option');
  const correctAnswerErrors = getFieldErrors('correct') || getFieldErrors('answer');

  const hasValidOptions = questionData.options && questionData.options.length >= 2 &&
                         questionData.options.every(opt => opt.trim().length > 0);
  const hasCorrectAnswer = typeof questionData.correctAnswer === 'number';
  const isFormValid = hasValidOptions && hasCorrectAnswer;

  const addOption = () => {
    const options = [...(questionData.options || []), ''];
    onInputChange('options', options);
  };

  const updateOption = (index: number, value: string) => {
    const options = [...(questionData.options || [])];
    options[index] = value;
    onInputChange('options', options);
  };

  const removeOption = (index: number) => {
    if ((questionData.options?.length || 0) <= 2) return;
    const options = questionData.options?.filter((_, i) => i !== index) || [];
    onInputChange('options', options);

    if (questionData.correctAnswer === index) {
      onInputChange('correctAnswer', undefined);
    } else if (typeof questionData.correctAnswer === 'number' && questionData.correctAnswer > index) {
      onInputChange('correctAnswer', questionData.correctAnswer - 1);
    }
  };

  const isOptionEmpty = (option: string): boolean => {
    return !option || option.trim().length === 0;
  };

  const getValidationStatus = (): 'valid' | 'invalid' | 'warning' => {
    if (validation && !validation.isValid) return 'invalid';
    if (!isFormValid) return 'warning';
    return 'valid';
  };

  const validationStatus = getValidationStatus();

  return (
    <>
      {/* Context Validation Summary */}
      {validation && (!validation.isValid || contextWarnings.length > 0) && (
        <div className={`mt-3 p-3 rounded-lg border flex ${
          validation.isValid
            ? 'bg-amber-500/10 border-amber-500/25'
            : 'bg-red-500/10 border-red-500/25'
        }`}>
          <AlertTriangle size={16} className={`mr-2 mt-1 flex-shrink-0 ${
            validation.isValid ? 'text-amber-400' : 'text-red-400'
          }`} />
          <div>
            <strong className={validation.isValid ? 'text-amber-400' : 'text-red-400'}>
              {validation.isValid ? 'Multiple Choice Warnings' : 'Multiple Choice Validation Errors'}
            </strong>
            {validation.errors.length > 0 && (
              <ul className="mb-1 mt-1 space-y-1 list-disc list-inside">
                {validation.errors.map((error, index) => (
                  <li key={`error-${index}`} className="text-red-400">{error}</li>
                ))}
              </ul>
            )}
            {contextWarnings.length > 0 && (
              <ul className="mb-0 mt-1 space-y-1 list-disc list-inside">
                {contextWarnings.map((warning, index) => (
                  <li key={`warning-${index}`} className="text-amber-400">{warning}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h6 className="font-semibold text-[#f5f5f4] mb-0">Answer Options</h6>
              {isOptionsRequired && (
                <span className="badge-blue text-xs">Required</span>
              )}
              {validationStatus === 'valid' && (
                <span className="badge-green text-xs flex items-center">
                  <CheckCircle size={10} className="mr-1" />
                  Valid
                </span>
              )}
              {validationStatus === 'warning' && (
                <span className="badge-amber text-xs flex items-center">
                  <AlertTriangle size={10} className="mr-1" />
                  Incomplete
                </span>
              )}
              {validationStatus === 'invalid' && (
                <span className="badge-red text-xs flex items-center">
                  <AlertTriangle size={10} className="mr-1" />
                  Issues Found
                </span>
              )}
            </div>
            <button type="button" className="btn-secondary text-sm" onClick={addOption}>
              <Plus size={16} className="mr-1" />
              Add Option
            </button>
          </div>

          {/* Field-specific validation errors */}
          {optionsErrors.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg mb-3 flex items-start">
              <AlertTriangle size={16} className="text-red-400 mr-1" />
              <div>
                <strong className="text-red-400">Options Issues:</strong>
                <ul className="mb-0 mt-1 space-y-1 list-disc list-inside text-red-400">
                  {optionsErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Requirement guidance */}
          {(!questionData.options || questionData.options.length === 0) && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg mb-3 flex items-start">
              <Info size={16} className="text-blue-400 mr-1" />
              <div className="text-blue-400">
                <strong>Getting Started:</strong> Add at least 2 answer options for your multiple choice question.
                {isOptionsRequired && (
                  <div className="mt-1 text-amber-400">
                    <AlertTriangle size={12} className="mr-1 inline" />
                    Answer options are required for this question type.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          {questionData.options?.map((option, index) => (
            <div key={index} className="mb-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={questionData.correctAnswer === index}
                    onChange={() => onInputChange('correctAnswer', index)}
                    className="mr-2"
                  />
                  <span className="font-bold text-[#f5f5f4]">
                    {String.fromCharCode(65 + index)}
                  </span>
                </label>

                <input
                  type="text"
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className={`input flex-grow ${isOptionEmpty(option) ? 'border-amber-500' : ''}`}
                />

                {/* Option status indicators */}
                <div className="flex items-center gap-1">
                  {questionData.correctAnswer === index && (
                    <span className="badge-green text-xs flex items-center">
                      <CheckCircle size={10} className="mr-1" />
                      Correct
                    </span>
                  )}
                  {isOptionEmpty(option) && (
                    <span className="badge-amber text-xs flex items-center">
                      <AlertTriangle size={10} className="mr-1" />
                      Empty
                    </span>
                  )}

                  {(questionData.options?.length || 0) > 2 && (
                    <button
                      type="button"
                      className="btn-danger text-sm p-1.5"
                      onClick={() => removeOption(index)}
                      title="Remove this option"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Individual option validation */}
              {isOptionEmpty(option) && (
                <div className="text-sm text-amber-400 mt-1 ml-8 flex items-center">
                  <AlertTriangle size={12} className="mr-1" />
                  This option needs text content
                </div>
              )}
            </div>
          ))}

          {/* Correct Answer Validation */}
          {questionData.options && questionData.options.length >= 2 && (
            <div className="mt-3 pt-3 border-t border-[#2a2a2e]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-[#a1a1aa]">
                  Correct Answer Selection
                  {isCorrectAnswerRequired && <span className="text-red-400 ml-1">*</span>}
                </label>
                <div className="flex gap-1">
                  {hasCorrectAnswer ? (
                    <span className="badge-green flex items-center">
                      <CheckCircle size={10} className="mr-1" />
                      Answer: {String.fromCharCode(65 + (questionData.correctAnswer as number))}
                    </span>
                  ) : (
                    <span className="badge-amber flex items-center">
                      <AlertTriangle size={10} className="mr-1" />
                      Not Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Correct answer validation errors */}
              {correctAnswerErrors.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-sm mb-2">
                  <div className="flex items-center text-red-400">
                    <AlertTriangle size={16} className="mr-1" />
                    <strong>Correct Answer Issues:</strong>
                  </div>
                  <ul className="mb-0 mt-1 space-y-1 list-disc list-inside text-red-400">
                    {correctAnswerErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!hasCorrectAnswer && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-sm">
                  <div className="flex items-center text-amber-400">
                    <AlertTriangle size={16} className="mr-1" />
                    <span>Please select the correct answer by clicking a radio button next to the right option.</span>
                  </div>
                  {isCorrectAnswerRequired && (
                    <div className="mt-1 text-amber-400">
                      <strong>Required:</strong> You must select a correct answer to proceed.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Progress Summary */}
          <div className="mt-3 pt-3 border-t border-[#2a2a2e]">
            <div className="flex justify-between items-center">
              <div className="text-sm text-[#6b6b70]">
                <strong>Progress:</strong> {questionData.options?.length || 0} options,
                {hasCorrectAnswer ? ' correct answer selected' : ' no correct answer'}
              </div>
              <div className="flex gap-2">
                <span className={hasValidOptions ? 'badge-green' : 'badge-gray'}>
                  Options: {hasValidOptions ? 'Complete' : 'Incomplete'}
                </span>
                <span className={hasCorrectAnswer ? 'badge-green' : 'badge-gray'}>
                  Answer: {hasCorrectAnswer ? 'Selected' : 'Not Set'}
                </span>
                {validation && (
                  <span className={validation.isValid ? 'badge-green' : 'badge-red'}>
                    Validation: {validation.isValid ? 'Passed' : 'Failed'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Best Practices Guidance */}
          <div className="mt-3 p-3 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg text-sm">
            <div className="flex items-start">
              <Info size={14} className="text-[#6b6b70] mr-2 mt-0.5" />
              <div className="text-[#6b6b70]">
                <strong className="text-[#a1a1aa]">Best Practices:</strong>
                <ul className="mb-0 mt-1 list-disc list-inside">
                  <li>Use 3-4 options for optimal difficulty (currently: {questionData.options?.length || 0})</li>
                  <li>Make incorrect options plausible but clearly wrong</li>
                  <li>Keep option length similar to avoid giving hints</li>
                  <li>Avoid "all of the above" or "none of the above" unless necessary</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultipleChoiceEditor;
