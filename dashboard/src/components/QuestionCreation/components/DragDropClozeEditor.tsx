// src/components/QuestionCreation/components/DragDropClozeEditor.tsx

import { AlertTriangle, CheckCircle, Eye, EyeOff, GripVertical, HelpCircle, Info, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { CreateQuestionData } from '../../../types';

interface DragDropClozeEditorProps {
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

interface DragOption {
  id: string;
  text: string;
}

interface Blank {
  id: string;
  correctAnswers: string[];
  hint?: string;
  points?: number;
}

const DragDropClozeEditor: React.FC<DragDropClozeEditorProps> = ({
  questionData,
  onInputChange,
  validation,
  isFieldRequired = () => false,
  getValidationWarnings = () => []
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [templateValidation, setTemplateValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  const isTemplateRequired = isFieldRequired('codeTemplate');
  const isBlanksRequired = isFieldRequired('blanks');
  const isDragOptionsRequired = isFieldRequired('dragOptions');
  const contextWarnings = getValidationWarnings();

  // Parse template for {{blankId}} placeholders
  const parseTemplateBlanks = (template: string): string[] => {
    const matches = template.match(/\{\{(\w+)\}\}/g) || [];
    return matches.map(match => match.replace(/\{\{|\}\}/g, ''));
  };

  // Validate template and sync blanks
  useEffect(() => {
    if (questionData.codeTemplate) {
      const templateBlanks = parseTemplateBlanks(questionData.codeTemplate);
      const errors: string[] = [];

      // Check for duplicate blank IDs in template
      const uniqueBlanks = [...new Set(templateBlanks)];
      if (uniqueBlanks.length !== templateBlanks.length) {
        errors.push('Template contains duplicate blank IDs');
      }

      setTemplateValidation({
        isValid: errors.length === 0,
        errors
      });

      // Auto-sync blanks with template
      const currentBlanks = questionData.blanks || [];
      const currentBlankIds = currentBlanks.map(b => b.id);

      // Add missing blanks
      const newBlanks = [...currentBlanks];
      for (const blankId of uniqueBlanks) {
        if (!currentBlankIds.includes(blankId)) {
          newBlanks.push({
            id: blankId,
            correctAnswers: [],
            points: 1
          });
        }
      }

      // Remove blanks not in template
      const filteredBlanks = newBlanks.filter(b => uniqueBlanks.includes(b.id || ''));

      if (JSON.stringify(filteredBlanks) !== JSON.stringify(currentBlanks)) {
        onInputChange('blanks', filteredBlanks);
      }
    }
  }, [questionData.codeTemplate]);

  // Drag Options Management
  const addDragOption = () => {
    const options = [...(questionData.dragOptions || [])];
    const newId = `opt${options.length + 1}`;
    options.push({ id: newId, text: '' });
    onInputChange('dragOptions', options);
  };

  const removeDragOption = (index: number) => {
    const options = (questionData.dragOptions || []).filter((_, i) => i !== index);
    // Re-index IDs
    const reIndexed = options.map((opt, i) => ({ ...opt, id: `opt${i + 1}` }));
    onInputChange('dragOptions', reIndexed);

    // Remove references from blanks
    const blanks = (questionData.blanks || []).map(blank => ({
      ...blank,
      correctAnswers: blank.correctAnswers.filter(ans => reIndexed.some(opt => opt.id === ans))
    }));
    onInputChange('blanks', blanks);
  };

  const updateDragOption = (index: number, field: keyof DragOption, value: string) => {
    const options = [...(questionData.dragOptions || [])];
    options[index] = { ...options[index], [field]: value };
    onInputChange('dragOptions', options);
  };

  // Blank Management
  const updateBlank = (blankId: string, field: keyof Blank, value: any) => {
    const blanks = [...(questionData.blanks || [])];
    const index = blanks.findIndex(b => b.id === blankId);
    if (index >= 0) {
      blanks[index] = { ...blanks[index], [field]: value };
      onInputChange('blanks', blanks);
    }
  };

  const toggleCorrectAnswer = (blankId: string, optionId: string) => {
    const blanks = [...(questionData.blanks || [])];
    const index = blanks.findIndex(b => b.id === blankId);
    if (index >= 0) {
      const currentAnswers = blanks[index].correctAnswers || [];
      if (currentAnswers.includes(optionId)) {
        blanks[index].correctAnswers = currentAnswers.filter(a => a !== optionId);
      } else {
        blanks[index].correctAnswers = [...currentAnswers, optionId];
      }
      onInputChange('blanks', blanks);
    }
  };

  // Get validation status
  const getValidationStatus = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!questionData.codeTemplate?.trim()) {
      errors.push('Code template is required');
    }

    const templateBlanks = parseTemplateBlanks(questionData.codeTemplate || '');
    if (templateBlanks.length === 0) {
      errors.push('Template must contain at least one blank (use {{blankId}} syntax)');
    }

    if (!questionData.dragOptions || questionData.dragOptions.length === 0) {
      errors.push('At least one drag option is required');
    } else {
      const emptyOptions = questionData.dragOptions.filter(opt => !opt.text?.trim());
      if (emptyOptions.length > 0) {
        errors.push(`${emptyOptions.length} drag option(s) have empty text`);
      }
    }

    // Check blanks have correct answers
    const blanks = questionData.blanks || [];
    for (const blank of blanks) {
      if (!blank.correctAnswers || blank.correctAnswers.length === 0) {
        errors.push(`Blank "${blank.id}" has no correct answer selected`);
      }
    }

    // Validate correctAnswers reference valid dragOptions
    const optionIds = (questionData.dragOptions || []).map(o => o.id);
    for (const blank of blanks) {
      for (const ans of blank.correctAnswers || []) {
        if (!optionIds.includes(ans)) {
          errors.push(`Blank "${blank.id}" references invalid option "${ans}"`);
        }
      }
    }

    // Warnings
    if ((questionData.dragOptions?.length || 0) < templateBlanks.length) {
      warnings.push('You have fewer drag options than blanks. Consider adding distractors.');
    }

    return {
      isValid: errors.length === 0,
      errors: [...errors, ...(validation?.errors || [])],
      warnings: [...warnings, ...(validation?.warnings || []), ...contextWarnings]
    };
  };

  const combinedValidation = getValidationStatus();

  // Render preview
  const renderPreview = () => {
    if (!questionData.codeTemplate) return null;

    let preview = questionData.codeTemplate;
    const blanks = questionData.blanks || [];

    for (const blank of blanks) {
      const correctOpt = (questionData.dragOptions || []).find(o => blank.correctAnswers?.includes(o.id));
      const displayText = correctOpt ? `[${correctOpt.text}]` : '[_______]';
      preview = preview.replace(`{{${blank.id}}}`, displayText);
    }

    return preview;
  };

  return (
    <>
      {/* Context Validation Summary */}
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
                title="Use {{blankId}} syntax to mark blanks. Example: {{blank1}}, {{blank2}}"
              >
                <HelpCircle size={14} className="inline" />
              </span>
            </label>
            <textarea
              rows={8}
              placeholder={`// Example template:
function greet(name) {
  {{blank1}} "Hello, " + {{blank2}};
}

// Use {{blankId}} to create drop zones where students drag options`}
              value={questionData.codeTemplate || ''}
              onChange={(e) => onInputChange('codeTemplate', e.target.value)}
              className={`input w-full font-mono text-sm ${
                templateValidation?.isValid === false ? 'border-red-500' : ''
              }`}
            />

            {templateValidation && !templateValidation.isValid && (
              <div className="text-red-400 text-sm mt-1">
                {templateValidation.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}

            <div className="text-[#6b6b70] text-sm mt-1">
              <strong>Tip:</strong> Use {'{{blankId}}'} syntax (e.g., {'{{blank1}}'}, {'{{blank2}}'}) to create drop zones.
              Blanks will be auto-detected and listed below.
            </div>
          </div>

          {/* Template Preview */}
          {showPreview && questionData.codeTemplate && (
            <div className="card border-cyan-500/50 mt-3">
              <div className="p-3">
                <h6 className="text-sm text-cyan-400 mb-2">Preview (Student View)</h6>
                <pre className="bg-[#1a1a1e] p-3 rounded mb-0 text-sm text-[#f5f5f4] font-mono overflow-auto whitespace-pre-wrap">
                  {renderPreview()}
                </pre>
                <div className="text-sm text-[#6b6b70] mt-2">
                  Students will drag options into the [_______] zones.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag Options Section */}
      <div className="card mt-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h6 className="font-semibold text-[#f5f5f4] mb-0">Drag Options</h6>
              <small className="text-[#6b6b70]">
                Add the options students will drag (correct answers + distractors)
              </small>
              {isDragOptionsRequired && (
                <span className="badge-amber ml-2 text-xs">Required</span>
              )}
            </div>
            <button type="button" className="btn-secondary text-sm" onClick={addDragOption}>
              <Plus size={16} className="mr-1" />
              Add Option
            </button>
          </div>

          {(!questionData.dragOptions || questionData.dragOptions.length === 0) && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg text-sm">
              <div className="flex items-start">
                <Info size={16} className="text-blue-400 mr-1" />
                <div className="text-blue-400">
                  Add drag options that students will choose from. Include both correct answers and distractors.
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {questionData.dragOptions?.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 p-2 bg-[#1c1c1f] rounded-lg border border-[#2a2a2e]">
                <GripVertical size={16} className="text-[#6b6b70] flex-shrink-0" />
                <span className="badge-blue text-xs flex-shrink-0">{option.id}</span>
                <input
                  type="text"
                  placeholder="Option text (e.g., 'return', 'const', 'name')"
                  value={option.text}
                  onChange={(e) => updateDragOption(index, 'text', e.target.value)}
                  className={`input flex-grow ${!option.text?.trim() ? 'border-amber-500' : ''}`}
                />
                <button
                  type="button"
                  className="btn-danger text-sm p-1.5"
                  onClick={() => removeDragOption(index)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {questionData.dragOptions && questionData.dragOptions.length > 0 && (
            <div className="text-sm text-[#6b6b70] mt-2">
              {questionData.dragOptions.length} option{questionData.dragOptions.length !== 1 ? 's' : ''} •
              Include more options than blanks to add difficulty
            </div>
          )}
        </div>
      </div>

      {/* Blank Configurations Section */}
      <div className="card mt-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h6 className="font-semibold text-[#f5f5f4] mb-0">Blank Configurations</h6>
              <small className="text-[#6b6b70]">
                Select the correct option(s) for each blank
              </small>
              {isBlanksRequired && (
                <span className="badge-amber ml-2 text-xs">Required</span>
              )}
            </div>
          </div>

          {(!questionData.blanks || questionData.blanks.length === 0) && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg text-sm">
              <div className="flex items-start">
                <Info size={16} className="text-blue-400 mr-1" />
                <div className="text-blue-400">
                  Blanks will appear here once you add {'{{blankId}}'} placeholders in your template.
                </div>
              </div>
            </div>
          )}

          {questionData.blanks?.map((blank) => (
            <div key={blank.id} className="card border-[#3a3a3e] mb-3">
              <div className="p-3">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="badge-purple">{`{{${blank.id}}}`}</span>
                    {blank.correctAnswers && blank.correctAnswers.length > 0 ? (
                      <span className="badge-green text-xs flex items-center">
                        <CheckCircle size={10} className="mr-1" />
                        {blank.correctAnswers.length} answer{blank.correctAnswers.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="badge-amber text-xs flex items-center">
                        <AlertTriangle size={10} className="mr-1" />
                        Select correct option
                      </span>
                    )}
                  </div>
                </div>

                {/* Correct Answer Selection */}
                <div className="mb-3">
                  <label className="text-sm font-semibold text-[#a1a1aa] mb-2 block">
                    Correct Answer(s)
                    <span className="text-red-400 ml-1">*</span>
                    <span
                      className="ml-1 text-[#6b6b70] cursor-help"
                      title="Click to select which option(s) are correct for this blank"
                    >
                      <HelpCircle size={12} className="inline" />
                    </span>
                  </label>

                  {(!questionData.dragOptions || questionData.dragOptions.length === 0) ? (
                    <div className="text-sm text-[#6b6b70] italic">
                      Add drag options above first
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {questionData.dragOptions.map((option) => {
                        const isSelected = blank.correctAnswers?.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleCorrectAnswer(blank.id || '', option.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                                : 'bg-[#1c1c1f] border border-[#3a3a3e] text-[#a1a1aa] hover:border-[#4a4a4e]'
                            }`}
                          >
                            {isSelected && <CheckCircle size={12} className="inline mr-1" />}
                            {option.text || `(${option.id})`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Optional Configuration Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      onChange={(e) => updateBlank(blank.id || '', 'points', parseInt(e.target.value) || 1)}
                      className="input w-full"
                    />
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
                      placeholder="e.g., This keyword returns a value"
                      value={blank.hint || ''}
                      onChange={(e) => updateBlank(blank.id || '', 'hint', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </div>

                {/* Individual Blank Validation */}
                {(!blank.correctAnswers || blank.correctAnswers.length === 0) && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-sm mt-3">
                    <div className="flex items-center text-red-400">
                      <AlertTriangle size={14} className="mr-1" />
                      <span>Select at least one correct option for this blank</span>
                    </div>
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
                      {questionData.blanks.length} blank{questionData.blanks.length !== 1 ? 's' : ''} •{' '}
                      {questionData.dragOptions?.length || 0} drag option{(questionData.dragOptions?.length || 0) !== 1 ? 's' : ''} •{' '}
                      {questionData.blanks.reduce((sum, blank) => sum + (blank.points || 1), 0)} total points
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={combinedValidation.isValid ? 'badge-green' : 'badge-amber'}>
                      {questionData.blanks.filter(b => b.correctAnswers?.length > 0).length}/{questionData.blanks.length} configured
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

export default DragDropClozeEditor;
