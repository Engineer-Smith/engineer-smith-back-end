import React from 'react';
import { ArrowLeft, Edit3, Code } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const QuickActionsCard: React.FC = () => {
  const { state, goToStep } = useQuestionCreation();
  const { selectedQuestionType, saving } = state;

  return (
    <div className="card mb-4">
      <div className="p-4">
        <h6 className="font-semibold text-[#f5f5f4] mb-3">Quick Actions</h6>
        <div className="flex flex-col gap-2">
          <button
            className="btn-secondary text-sm flex items-center justify-center"
            onClick={() => goToStep(1)}
            disabled={saving}
          >
            <ArrowLeft size={14} className="mr-1" />
            Edit Basics
          </button>
          <button
            className="btn-secondary text-sm flex items-center justify-center"
            onClick={() => goToStep(2)}
            disabled={saving}
          >
            <Edit3 size={14} className="mr-1" />
            Edit Content
          </button>
          {(selectedQuestionType === 'codeChallenge' || selectedQuestionType === 'codeDebugging') && (
            <button
              className="btn-secondary text-sm flex items-center justify-center"
              onClick={() => goToStep(3)}
              disabled={saving}
            >
              <Code size={14} className="mr-1" />
              Edit Test Cases
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCard;
