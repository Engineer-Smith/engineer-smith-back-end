// src/components/QuestionCreation/components/TrueFalseEditor.tsx - CONTEXT INTEGRATED

import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { CreateQuestionData } from '../../../types';

interface TrueFalseEditorProps {
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

const TrueFalseEditor: React.FC<TrueFalseEditorProps> = ({
  questionData,
  onInputChange,
  validation,
  isFieldRequired = () => false,
  getValidationWarnings = () => []
}) => {
  const isCorrectAnswerRequired = isFieldRequired('correctAnswer');
  const contextWarnings = getValidationWarnings();

  const getFieldErrors = (fieldName: string): string[] => {
    if (!validation?.errors) return [];
    return validation.errors.filter(error =>
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const correctAnswerErrors = getFieldErrors('correct') || getFieldErrors('answer');

  const hasCorrectAnswer = (questionData.correctAnswer === 0 || questionData.correctAnswer === 1);
  const needsSelection = questionData.title && questionData.description && !hasCorrectAnswer;

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
              {validation.isValid ? 'True/False Warnings' : 'True/False Validation Errors'}
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
              <h6 className="font-semibold text-[#f5f5f4] mb-0">Correct Answer</h6>
              {isCorrectAnswerRequired && (
                <span className="badge-blue text-xs">Required</span>
              )}
              {(questionData.correctAnswer === 0 || questionData.correctAnswer === 1) ? (
                <span className="badge-green text-xs flex items-center">
                  <CheckCircle size={10} className="mr-1" />
                  Selected: {questionData.correctAnswer === 0 ? 'True' : 'False'}
                </span>
              ) : (
                <span className="badge-amber text-xs flex items-center">
                  <AlertTriangle size={10} className="mr-1" />
                  Not Selected
                </span>
              )}
            </div>
          </div>

          {/* Field-specific validation errors */}
          {correctAnswerErrors.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg mb-3 flex items-start">
              <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5" />
              <div>
                <strong className="text-red-400">Answer Selection Issues:</strong>
                <ul className="mb-0 mt-1 space-y-1 list-disc list-inside text-red-400">
                  {correctAnswerErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Guidance for incomplete questions */}
          {!questionData.title && !questionData.description && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg mb-3 flex items-start">
              <Info size={16} className="text-blue-400 mr-2 mt-0.5" />
              <span className="text-blue-400">
                <strong>Getting Started:</strong> Complete the question title and description above, then select the correct answer below.
              </span>
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="trueFalse"
                checked={questionData.correctAnswer === 0}
                onChange={() => onInputChange('correctAnswer', 0)}
                className="mr-2"
              />
              <span className="font-bold text-green-400">True</span>
              {questionData.correctAnswer === 0 && (
                <CheckCircle size={16} className="ml-2 text-green-400" />
              )}
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="trueFalse"
                checked={questionData.correctAnswer === 1}
                onChange={() => onInputChange('correctAnswer', 1)}
                className="mr-2"
              />
              <span className="font-bold text-red-400">False</span>
              {questionData.correctAnswer === 1 && (
                <CheckCircle size={16} className="ml-2 text-green-400" />
              )}
            </label>
          </div>

          {/* Enhanced validation message */}
          {needsSelection && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-sm mt-3 flex items-start">
              <AlertTriangle size={16} className="text-amber-400 mr-2 mt-0.5" />
              <div className="text-amber-400">
                Please select True or False as the correct answer.
                {isCorrectAnswerRequired && (
                  <div className="mt-1">
                    <strong>Required:</strong> You must select an answer to proceed.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced completion status */}
          {hasCorrectAnswer && (
            <div className="p-3 bg-green-500/10 border border-green-500/25 rounded-lg text-sm mt-3 flex items-center">
              <CheckCircle size={16} className="text-green-400 mr-2" />
              <span className="text-green-400">
                Correct answer selected: <strong>{questionData.correctAnswer === 0 ? 'True' : 'False'}</strong>
              </span>
            </div>
          )}

          {/* Best practices tip */}
          <div className="p-3 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg text-sm mt-3 flex items-start">
            <Info size={14} className="text-[#6b6b70] mr-2 mt-0.5" />
            <span className="text-[#6b6b70]">
              <strong className="text-[#a1a1aa]">Tip:</strong> Make sure your question statement is clear and unambiguous so students can definitively determine if it's true or false.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrueFalseEditor;
