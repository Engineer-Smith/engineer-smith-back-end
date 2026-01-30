// src/components/QuestionCreation/components/SelectionCompleteStep.tsx
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import React from 'react';
import type { Language, QuestionCategory, QuestionType } from '../../../types';

interface SelectionCompleteStepProps {
  selectedLanguage: Language;
  languageLabel: string;
  selectedCategory: QuestionCategory;
  categoryLabel: string;
  selectedQuestionType: QuestionType;
  questionTypeLabel: string;
  onResetToQuestionType: () => void;
}

const SelectionCompleteStep: React.FC<SelectionCompleteStepProps> = ({
  languageLabel,
  categoryLabel,
  questionTypeLabel,
  onResetToQuestionType
}) => {

  return (
    <>
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-3 flex-wrap gap-2">
          <span className="badge-blue px-3 py-2 flex items-center">
            <CheckCircle size={14} className="mr-1" />
            {languageLabel}
          </span>
          <ArrowRight size={14} className="text-[#6b6b70]" />
          <span className="badge-green px-3 py-2 flex items-center">
            <CheckCircle size={14} className="mr-1" />
            {categoryLabel}
          </span>
          <ArrowRight size={14} className="text-[#6b6b70]" />
          <span className="badge-amber px-3 py-2 flex items-center">
            <CheckCircle size={14} className="mr-1" />
            {questionTypeLabel}
          </span>
        </div>

        <button
          className="btn-ghost text-sm text-[#6b6b70]"
          onClick={() => {
            onResetToQuestionType();
          }}
        >
          <ArrowLeft size={14} className="mr-1" />
          Make Changes
        </button>
      </div>

      <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-lg flex items-center">
        <CheckCircle size={16} className="text-green-400 mr-2" />
        <span className="text-green-400">
          <strong>Configuration Complete!</strong> Ready to create your question content.
        </span>
      </div>
    </>
  );
};

export default SelectionCompleteStep;
