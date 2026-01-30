// src/components/QuestionCreation/components/QuestionTypeSelectionStep.tsx - UPDATED

import React, { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  Square,
  List,
  CheckSquare,
  Code,
  AlertTriangle,
  GripVertical
} from 'lucide-react';
import {
  getAllowedQuestionTypes,
  isValidQuestionTypeForLanguageAndCategory
} from '../../../types';
import type { QuestionCategory, QuestionType, Language } from '../../../types';

interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  bgColor: string;
  difficulty: string;
  autoGradeable: boolean;
}

interface QuestionTypeSelectionStepProps {
  selectedLanguage: Language;
  languageLabel: string;
  selectedCategory: QuestionCategory;
  categoryLabel: string;
  onQuestionTypeSelect: (type: QuestionType) => void;
  onResetToCategory: () => void;
}

const QuestionTypeSelectionStep: React.FC<QuestionTypeSelectionStepProps> = ({
  selectedLanguage,
  languageLabel,
  selectedCategory,
  categoryLabel,
  onQuestionTypeSelect,
  onResetToCategory
}) => {

  const questionTypeOptions: QuestionTypeOption[] = [
    {
      value: 'multipleChoice' as QuestionType,
      label: 'Multiple Choice',
      description: 'Question with multiple options, one correct answer',
      icon: List,
      bgColor: 'bg-blue-500',
      difficulty: 'Easy to create',
      autoGradeable: true
    },
    {
      value: 'trueFalse' as QuestionType,
      label: 'True/False',
      description: 'Simple true or false question',
      icon: CheckSquare,
      bgColor: 'bg-green-500',
      difficulty: 'Very easy',
      autoGradeable: true
    },
    {
      value: 'fillInTheBlank' as QuestionType,
      label: 'Fill in the Blank',
      description: 'Complete missing parts of code or text',
      icon: Square,
      bgColor: 'bg-amber-500',
      difficulty: 'Moderate',
      autoGradeable: true
    },
    {
      value: 'dragDropCloze' as QuestionType,
      label: 'Drag & Drop Cloze',
      description: 'Drag options into blanks to complete code',
      icon: GripVertical,
      bgColor: 'bg-purple-500',
      difficulty: 'Moderate',
      autoGradeable: true
    },
    {
      value: 'codeChallenge' as QuestionType,
      label: 'Code Challenge',
      description: 'Write code to solve a programming problem',
      icon: Code,
      bgColor: 'bg-cyan-500',
      difficulty: 'Advanced',
      autoGradeable: true
    },
    {
      value: 'codeDebugging' as QuestionType,
      label: 'Code Debugging',
      description: 'Find and fix bugs in provided code',
      icon: Bug,
      bgColor: 'bg-red-500',
      difficulty: 'Advanced',
      autoGradeable: true
    }
  ];

  // Get allowed types using the new validation system
  const allowedTypes = useMemo(() => {
    return getAllowedQuestionTypes(selectedLanguage, selectedCategory);
  }, [selectedLanguage, selectedCategory]);

  // Get available options (those that are allowed)
  const availableOptions = useMemo(() => {
    return questionTypeOptions.filter(option =>
      allowedTypes.includes(option.value)
    );
  }, [allowedTypes]);

  // Get restricted options (those that are not allowed)
  const restrictedOptions = useMemo(() => {
    return questionTypeOptions.filter(option =>
      !allowedTypes.includes(option.value)
    );
  }, [allowedTypes]);

  // Get restriction reason based on language and category
  const getRestrictionReason = () => {
    if (selectedCategory === 'ui') {
      return `UI questions for ${languageLabel} should focus on visual components and layouts. Use Fill-in-the-Blank for code completion exercises.`;
    }
    if (selectedCategory === 'logic') {
      return `Logic questions for ${languageLabel} require algorithmic problem-solving. Use Code Challenge or Code Debugging for computational problems.`;
    }
    if (selectedCategory === 'syntax') {
      return `Syntax questions test language-specific knowledge. Multiple choice and Fill-in-the-Blank work well for syntax concepts.`;
    }
    return `Some question types are not suitable for ${languageLabel} ${categoryLabel} questions.`;
  };

  // Handle type selection with validation
  const handleTypeSelection = (type: QuestionType) => {
    // Double-check validation before selection
    if (!isValidQuestionTypeForLanguageAndCategory(type, selectedLanguage, selectedCategory)) {
      console.warn(`Invalid selection: ${type} not allowed for ${selectedLanguage} ${selectedCategory}`);
      return;
    }

    onQuestionTypeSelect(type);
  };

  return (
    <div>
      {/* Breadcrumb navigation */}
      <div className="mb-4">
        <div className="flex items-center text-[#6b6b70] text-sm mb-2">
          <span className="text-green-400 mr-2">{languageLabel}</span>
          <ArrowRight size={14} className="mr-2" />
          <span className="text-green-400 mr-2">{categoryLabel}</span>
          <ArrowRight size={14} className="mr-2" />
          <span>Question Type</span>
          <button
            className="btn-ghost text-sm ml-auto p-0 text-[#6b6b70] hover:text-[#f5f5f4]"
            onClick={onResetToCategory}
          >
            <ArrowLeft size={14} className="mr-1" />
            Change Category
          </button>
        </div>
      </div>

      {/* Available question types */}
      <h5 className="font-semibold text-[#f5f5f4] mb-3">Choose Question Type</h5>

      {availableOptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {availableOptions.map((option) => {
            const IconComponent = option.icon;

            return (
              <div
                key={option.value}
                className="card h-full cursor-pointer hover:border-[#5a5a5e] hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => handleTypeSelection(option.value)}
              >
                <div className="p-4 text-center">
                  <div
                    className={`w-[60px] h-[60px] ${option.bgColor} rounded-full mx-auto mb-3 flex items-center justify-center`}
                  >
                    <IconComponent size={28} className="text-white" />
                  </div>

                  <h6 className="font-semibold text-[#f5f5f4] mb-2">{option.label}</h6>
                  <p className="text-[#6b6b70] text-sm mb-3">{option.description}</p>

                  <div className="flex justify-between items-center">
                    <span className="badge-gray text-xs">
                      {option.difficulty}
                    </span>
                    <span className="badge-green text-xs">
                      Auto-gradeable
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-4 flex items-start">
          <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5" />
          <div>
            <strong className="text-red-400">No question types available</strong>
            <p className="text-red-400/80 mb-0">
              The combination of {languageLabel} and {categoryLabel} doesn't support any question types.
              Please select a different category.
            </p>
          </div>
        </div>
      )}

      {/* Restricted types info (if any) */}
      {restrictedOptions.length > 0 && availableOptions.length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mb-4">
          <div className="flex">
            <AlertTriangle size={16} className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
            <div>
              <strong className="text-blue-400">Not Available for {languageLabel} {categoryLabel} Questions</strong>
              <p className="text-blue-400/80 mb-2">{getRestrictionReason()}</p>

              <div className="flex flex-wrap gap-2">
                {restrictedOptions.map((option) => {
                  const IconComponent = option.icon;

                  return (
                    <span
                      key={option.value}
                      className="badge-gray flex items-center gap-1 px-2 py-1 opacity-70"
                    >
                      <IconComponent size={14} />
                      {option.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="text-[#6b6b70] text-sm">
        <p className="mb-0">
          Available types: <strong className="text-[#a1a1aa]">{allowedTypes.join(', ')}</strong>
        </p>
      </div>
    </div>
  );
};

export default QuestionTypeSelectionStep;
