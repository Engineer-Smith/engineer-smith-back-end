import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

interface QuestionStatusCardProps {
  finalValidation: string[];
}

const QuestionStatusCard: React.FC<QuestionStatusCardProps> = ({ finalValidation }) => {
  const { state, updateQuestionData } = useQuestionCreation();
  const { questionData, saving } = state;

  const hasValidationErrors = finalValidation.length > 0;

  return (
    <div className="card mb-4 border-blue-500/50">
      <div className="p-4">
        <h6 className="text-blue-400 font-semibold mb-3 flex items-center gap-1">
          <FileText size={16} />
          Question Status
        </h6>
        <div>
          <label className="block text-[#a1a1aa] text-sm mb-2">Save as:</label>
          <div className="mt-2 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="questionStatus"
                value="draft"
                checked={(questionData.status || 'draft') === 'draft'}
                onChange={(e) => updateQuestionData({ status: e.target.value as 'draft' | 'active' })}
                disabled={saving}
                className="mt-1"
              />
              <div>
                <span className="font-semibold text-[#f5f5f4]">Draft</span>
                <div className="text-sm text-[#6b6b70]">
                  Save for later editing. Question won't appear in tests until activated.
                </div>
              </div>
            </label>
            <label className={`flex items-start gap-3 ${hasValidationErrors ? 'opacity-50' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name="questionStatus"
                value="active"
                checked={(questionData.status || 'draft') === 'active'}
                onChange={(e) => updateQuestionData({ status: e.target.value as 'draft' | 'active' })}
                disabled={saving || hasValidationErrors}
                className="mt-1"
              />
              <div>
                <span className="font-semibold text-[#f5f5f4]">Active</span>
                <div className="text-sm text-[#6b6b70]">
                  Make immediately available for use in tests.
                </div>
              </div>
            </label>
          </div>

          {hasValidationErrors && (
            <div className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg mt-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-sm text-amber-400">Fix validation errors to enable "Active" status</span>
            </div>
          )}

          <div className="mt-3 p-3 bg-[#1a1a1e] rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <strong className="text-[#a1a1aa]">Current status:</strong>
              <span className={(questionData.status || 'draft') === 'active' ? 'badge-green' : 'badge-gray'}>
                {(questionData.status || 'draft').charAt(0).toUpperCase() + (questionData.status || 'draft').slice(1)}
              </span>
            </div>
            <div className="text-[#6b6b70] text-sm mt-2">
              {(questionData.status || 'draft') === 'active'
                ? 'Question will be immediately available for instructors to add to tests.'
                : 'Question will be saved as a draft. You can activate it later from the question bank.'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionStatusCard;
