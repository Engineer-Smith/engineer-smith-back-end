// src/components/QuestionCreation/components/FillInBlankEditor.tsx - CONTEXT INTEGRATED

import { AlertTriangle, CheckCircle, Eye, EyeOff, HelpCircle, Info, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { CreateQuestionData } from '../../../types';
import {
  createProperBlankStructure,
  validateFillInBlankStructure,
  validateTemplateFormat
} from '../../../utils/fillInBlankValidation';

interface FillInBlankEditorProps {
  questionData: Partial<CreateQuestionData>;
  onInputChange: (field: keyof CreateQuestionData, value: any) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  isFieldRequired?: (field: string) => boolean;
  getValidationWarnings?: () => string[];
}

const FillInBlankEditor: React.FC<FillInBlankEditorProps> = ({
  questionData,
  onInputChange,
  validation,
  isFieldRequired = () => false,
  getValidationWarnings = () => []
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [templateValidation, setTemplateValidation] = useState<{isValid: boolean, errors: string[], suggestions: string[]} | null>(null);

  const isTemplateRequired = isFieldRequired('codeTemplate');
  const isBlanksRequired = isFieldRequired('blanks');
  const contextWarnings = getValidationWarnings();

  useEffect(() => {
    if (questionData.codeTemplate) {
      const validationResult = validateTemplateFormat(questionData.codeTemplate);
      setTemplateValidation(validationResult);

      const templateBlankCount = (questionData.codeTemplate.match(/_____/g) || []).length;
      const currentBlanks = questionData.blanks || [];

      if (templateBlankCount !== currentBlanks.length && templateBlankCount > 0) {
        const adjustedBlanks = adjustBlanksToTemplate(currentBlanks, templateBlankCount);
        onInputChange('blanks', adjustedBlanks);
      }
    }
  }, [questionData.codeTemplate]);

  const adjustBlanksToTemplate = (currentBlanks: any[], templateBlankCount: number): any[] => {
    if (templateBlankCount === currentBlanks.length) return currentBlanks;

    if (templateBlankCount > currentBlanks.length) {
      const newBlanks = [...currentBlanks];
      for (let i = currentBlanks.length; i < templateBlankCount; i++) {
        newBlanks.push(createProperBlankStructure(`blank${i + 1}`, [''], false, '', 1));
      }
      return newBlanks;
    } else {
      return currentBlanks.slice(0, templateBlankCount);
    }
  };

  const addBlank = () => {
    const blanks = [...(questionData.blanks || [])];
    const newBlank = createProperBlankStructure(
      `blank${blanks.length + 1}`,
      [''],
      false,
      '',
      1
    );
    blanks.push(newBlank);
    onInputChange('blanks', blanks);
  };

  const removeBlank = (index: number) => {
    if ((questionData.blanks?.length || 0) <= 1) return;
    const blanks = questionData.blanks?.filter((_, i) => i !== index) || [];
    const reIndexedBlanks = blanks.map((blank, i) => ({
      ...blank,
      id: `blank${i + 1}`
    }));
    onInputChange('blanks', reIndexedBlanks);
  };

  const updateBlank = (index: number, field: string, value: any) => {
    const blanks = [...(questionData.blanks || [])];
    if (!blanks[index].id) {
      blanks[index].id = `blank${index + 1}`;
    }
    blanks[index] = { ...blanks[index], [field]: value };
    onInputChange('blanks', blanks);
  };

  const addAnswerToBlank = (blankIndex: number) => {
    const blanks = [...(questionData.blanks || [])];
    if (!blanks[blankIndex].correctAnswers) {
      blanks[blankIndex].correctAnswers = [];
    }
    blanks[blankIndex].correctAnswers.push('');
    onInputChange('blanks', blanks);
  };

  const removeAnswerFromBlank = (blankIndex: number, answerIndex: number) => {
    const blanks = [...(questionData.blanks || [])];
    if ((blanks[blankIndex]?.correctAnswers?.length || 0) <= 1) return;
    blanks[blankIndex].correctAnswers = blanks[blankIndex].correctAnswers.filter((_: string, i: number) => i !== answerIndex);
    onInputChange('blanks', blanks);
  };

  const updateBlankAnswer = (blankIndex: number, answerIndex: number, value: string) => {
    const blanks = [...(questionData.blanks || [])];
    blanks[blankIndex].correctAnswers[answerIndex] = value;
    onInputChange('blanks', blanks);
  };

  const getValidationStatus = () => {
    const localValidation = validateFillInBlankStructure(questionData);
    if (validation) {
      return {
        isValid: localValidation.isValid && validation.isValid,
        errors: [...localValidation.errors, ...validation.errors],
        warnings: [...localValidation.warnings, ...validation.warnings, ...contextWarnings]
      };
    }
    return {
      ...localValidation,
      warnings: [...localValidation.warnings, ...contextWarnings]
    };
  };

  const combinedValidation = getValidationStatus();

  const getFieldErrors = (fieldName: string): string[] => {
    if (!validation?.errors) return [];
    return validation.errors.filter(error =>
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const templateErrors = getFieldErrors('template');
  const blanksErrors = getFieldErrors('blank');

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
              {validation.isValid ? 'Form Validation Warnings' : 'Form Validation Errors'}
            </strong>
            <ul className="mb-0 mt-1 space-y-1 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={`context-error-${index}`} className="text-red-400">{error}</li>
              ))}
              {contextWarnings.map((warning, index) => (
                <li key={`context-warning-${index}`} className="text-amber-400">{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Template Section */}
      <div className="card mt-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h6 className="font-semibold text-[#f5f5f4] mb-0">Code Template</h6>
              {isTemplateRequired && (
                <span className="badge-amber ml-2 text-xs">Required Field</span>
              )}
            </div>
            <div className="flex gap-2">
              {combinedValidation.isValid && (
                <span className="badge-green flex items-center">
                  <CheckCircle size={12} className="mr-1" />
                  Valid Structure
                </span>
              )}
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="ml-1">{showPreview ? 'Hide Preview' : 'Preview'}</span>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[#a1a1aa] font-semibold mb-2">
              Template Code
              {isTemplateRequired && <span className="text-red-400 ml-1">*</span>}
              <span
                className="ml-1 text-[#6b6b70] cursor-help"
                title="Use exactly 5 underscores (_____) to mark blanks that students will fill in. Each _____ represents one blank that needs to be configured below."
              >
                <HelpCircle size={14} className="inline" />
              </span>
            </label>
            <textarea
              rows={8}
              placeholder={`// Example template:
// Declare a variable that can be reassigned
_____ age = 25;

// Declare a constant
_____ PI = 3.14159;

// Access array element
console.log(colors[_____]);`}
              value={questionData.codeTemplate || ''}
              onChange={(e) => onInputChange('codeTemplate', e.target.value)}
              className={`input w-full font-mono text-sm ${
                (templateValidation?.isValid === false || templateErrors.length > 0)
                  ? 'border-red-500'
                  : ''
              }`}
            />

            {/* Template Validation Feedback */}
            {((templateValidation && !templateValidation.isValid) || templateErrors.length > 0) && (
              <div className="text-red-400 text-sm mt-1">
                {templateValidation?.errors.map((error, index) => (
                  <div key={`local-${index}`}>{error}</div>
                ))}
                {templateErrors.map((error, index) => (
                  <div key={`context-${index}`}>{error}</div>
                ))}
              </div>
            )}

            {templateValidation?.suggestions && templateValidation.suggestions.length > 0 && (
              <div className="text-amber-400 text-sm mt-1 flex items-center">
                <AlertTriangle size={12} className="mr-1" />
                {templateValidation.suggestions.join(' ')}
              </div>
            )}

            <div className="text-[#6b6b70] text-sm mt-1">
              <strong>Tip:</strong> Each _____ (5 underscores) creates one blank. You'll configure the accepted answers for each blank below.
            </div>
          </div>

          {/* Template Preview */}
          {showPreview && questionData.codeTemplate && (
            <div className="card border-cyan-500/50 mt-3">
              <div className="p-3">
                <h6 className="text-sm text-cyan-400 mb-2">Preview (Student View)</h6>
                <pre className="bg-[#1a1a1e] p-3 rounded mb-0 text-sm text-[#f5f5f4] font-mono overflow-auto">
                  {questionData.codeTemplate.replace(/_____/g, '[INPUT_FIELD]')}
                </pre>
                <div className="text-sm text-[#6b6b70] mt-2">
                  Students will see input fields where [INPUT_FIELD] is shown.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Feedback */}
      {(!combinedValidation.isValid || combinedValidation.warnings.length > 0) && (
        <div className={`mt-3 p-3 rounded-lg border flex ${
          combinedValidation.isValid
            ? 'bg-amber-500/10 border-amber-500/25'
            : 'bg-red-500/10 border-red-500/25'
        }`}>
          <AlertTriangle size={16} className={`mr-2 mt-1 flex-shrink-0 ${
            combinedValidation.isValid ? 'text-amber-400' : 'text-red-400'
          }`} />
          <div>
            <strong className={combinedValidation.isValid ? 'text-amber-400' : 'text-red-400'}>
              {combinedValidation.isValid ? 'Validation Warnings' : 'Validation Errors'}
            </strong>
            <ul className="mb-0 mt-1 space-y-1 list-disc list-inside">
              {combinedValidation.errors.map((error, index) => (
                <li key={`error-${index}`} className="text-red-400">{error}</li>
              ))}
              {combinedValidation.warnings.map((warning, index) => (
                <li key={`warning-${index}`} className="text-amber-400">{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Blank Configurations Section */}
      <div className="card mt-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h6 className="font-semibold text-[#f5f5f4] mb-0">Blank Configurations</h6>
              <div className="flex items-center gap-2">
                <small className="text-[#6b6b70]">Configure each blank (_____ in your template)</small>
                {isBlanksRequired && (
                  <span className="badge-amber text-xs">Required</span>
                )}
              </div>
            </div>
            <button type="button" className="btn-secondary text-sm" onClick={addBlank}>
              <Plus size={16} className="mr-1" />
              Add Blank
            </button>
          </div>

          {/* Context validation errors for blanks */}
          {blanksErrors.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg mb-3 flex items-start">
              <AlertTriangle size={16} className="text-red-400 mr-1" />
              <div>
                <strong className="text-red-400">Blank Configuration Issues:</strong>
                <ul className="mb-0 mt-1 space-y-1 list-disc list-inside text-red-400">
                  {blanksErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {(!questionData.blanks || questionData.blanks.length === 0) && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg text-sm">
              <div className="flex items-start">
                <Info size={16} className="text-blue-400 mr-1" />
                <div className="text-blue-400">
                  Add blanks to match the _____ placeholders in your code template above.
                  {isBlanksRequired && (
                    <div className="mt-1 text-amber-400">
                      <AlertTriangle size={12} className="mr-1 inline" />
                      <strong>This field is required for question completion.</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {questionData.blanks?.map((blank, blankIndex) => (
            <div key={blank.id || blankIndex} className="card border-[#3a3a3e] mb-3">
              <div className="p-3">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="badge-blue">Blank {blankIndex + 1}</span>
                    <small className="text-[#6b6b70]">ID: {blank.id}</small>
                    {blank.correctAnswers?.some((a: string) => a.trim()) ? (
                      <span className="badge-green text-xs flex items-center">
                        <CheckCircle size={10} className="mr-1" />
                        Configured
                      </span>
                    ) : (
                      <span className="badge-amber text-xs flex items-center">
                        <AlertTriangle size={10} className="mr-1" />
                        Needs Setup
                      </span>
                    )}
                  </div>
                  {(questionData.blanks?.length || 0) > 1 && (
                    <button
                      type="button"
                      className="btn-danger text-sm p-1.5"
                      onClick={() => removeBlank(blankIndex)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Correct Answers */}
                <div className="mb-3">
                  <label className="text-sm font-semibold text-[#a1a1aa] mb-2 block">
                    Correct Answers
                    {(isBlanksRequired || isFieldRequired(`blanks.${blankIndex}.correctAnswers`)) && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                    <span className="badge-green ml-2 text-xs">
                      {blank.correctAnswers?.filter((a: string) => a.trim()).length || 0} answer{(blank.correctAnswers?.filter((a: string) => a.trim()).length || 0) !== 1 ? 's' : ''}
                    </span>
                  </label>
                  <div className="text-sm text-[#6b6b70] mb-2">
                    Add all acceptable answers for this blank. Students only need to match one of these answers.
                  </div>

                  {blank.correctAnswers?.map((answer: string, answerIndex: number) => (
                    <div key={answerIndex} className="flex gap-2 mb-2">
                      <div className="flex-shrink-0 flex items-center">
                        <span className="badge-gray text-xs">{answerIndex + 1}</span>
                      </div>
                      <input
                        type="text"
                        placeholder={answerIndex === 0 ? "Primary answer (required)" : "Alternative answer (optional)"}
                        value={answer}
                        onChange={(e) => updateBlankAnswer(blankIndex, answerIndex, e.target.value)}
                        className={`input flex-grow ${!answer.trim() && answerIndex === 0 ? 'border-red-500' : ''}`}
                      />
                      {blank.correctAnswers && blank.correctAnswers.length > 1 && (
                        <button
                          type="button"
                          className="btn-danger text-sm p-1.5"
                          onClick={() => removeAnswerFromBlank(blankIndex, answerIndex)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-secondary text-sm mt-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
                    onClick={() => addAnswerToBlank(blankIndex)}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Alternative Answer
                  </button>
                </div>

                {/* Optional Configuration Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-[#a1a1aa] mb-1 block">
                      Points
                      <span
                        className="ml-1 text-[#6b6b70] cursor-help"
                        title="Points awarded when student answers this blank correctly"
                      >
                        <HelpCircle size={12} className="inline" />
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={blank.points || 1}
                      onChange={(e) => updateBlank(blankIndex, 'points', parseInt(e.target.value) || 1)}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blank.caseSensitive || false}
                        onChange={(e) => updateBlank(blankIndex, 'caseSensitive', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-[#a1a1aa]">
                        Case Sensitive
                        <span
                          className="ml-1 text-[#6b6b70] cursor-help"
                          title='When enabled: "Let" ≠ "let". When disabled: "Let" = "let"'
                        >
                          <HelpCircle size={12} className="inline" />
                        </span>
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="text-sm text-[#a1a1aa] mb-1 block">
                      Hint (optional)
                      <span
                        className="ml-1 text-[#6b6b70] cursor-help"
                        title="Helpful hint shown to students when they're stuck"
                      >
                        <HelpCircle size={12} className="inline" />
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Think about variable keywords"
                      value={blank.hint || ''}
                      onChange={(e) => updateBlank(blankIndex, 'hint', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </div>

                {/* Individual Blank Validation */}
                {(!blank.correctAnswers || blank.correctAnswers.filter((a: string) => a.trim()).length === 0) && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-sm mt-3">
                    <div className="flex items-center text-red-400">
                      <AlertTriangle size={14} className="mr-1" />
                      <span>This blank needs at least one correct answer</span>
                    </div>
                    {isBlanksRequired && (
                      <div className="mt-1 text-red-400">
                        <strong>Required:</strong> Complete this blank to proceed.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Summary Card */}
          {questionData.blanks && questionData.blanks.length > 0 && (
            <div className="card bg-[#1a1a1e] border-0 mt-3">
              <div className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <small className="font-semibold text-[#6b6b70]">Summary:</small>
                    <div className="text-sm text-[#6b6b70]">
                      {questionData.blanks.length} blank{questionData.blanks.length !== 1 ? 's' : ''} • {' '}
                      {questionData.blanks.reduce((sum: number, blank: any) => sum + (blank.points || 1), 0)} total points
                    </div>
                    {validation && (
                      <div className="text-sm mt-1">
                        Context Status:
                        <span className={`ml-1 ${validation.isValid ? 'badge-green' : 'badge-red'} text-xs`}>
                          {validation.isValid ? 'Valid' : 'Issues Found'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={combinedValidation.isValid ? 'badge-green' : 'badge-amber'}>
                      {questionData.blanks.filter((b: any) => b.correctAnswers?.some((a: string) => a.trim())).length}/{questionData.blanks.length} configured
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FillInBlankEditor;
