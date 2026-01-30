// src/components/QuestionCreation/components/SaveActionCard.tsx - CENTRALIZED SAVE
import React from 'react';
import { Save, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

interface SaveActionCardProps {
  finalValidation: string[];
  canSave: boolean;
  isCompleted: boolean;
  isSaving: boolean;
}

const SaveActionCard: React.FC<SaveActionCardProps> = ({
  finalValidation,
  canSave,
  isCompleted,
  isSaving
}) => {
  const {
    saveQuestionWithCallback,
    state
  } = useQuestionCreation();

  const { creationSuccess, error } = state;

  const handleSave = async () => {
    try {
      await saveQuestionWithCallback();
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  // Don't show card if already completed
  if (isCompleted) {
    return (
      <div className="card mb-3 border-green-500/50">
        <div className="p-4 text-center">
          <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
          <h6 className="text-green-400 font-semibold mb-1">Question Saved!</h6>
          <p className="text-[#6b6b70] text-sm mb-0">
            Your question has been successfully created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-3">
      <div className="p-4">
        <h6 className="font-semibold text-[#f5f5f4] mb-3">Save Question</h6>

        {/* Save Status */}
        {finalValidation.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <small className="text-amber-400">
                <strong>{finalValidation.length} issue{finalValidation.length > 1 ? 's' : ''} remaining</strong>
              </small>
            </div>
          </div>
        )}

        {canSave && finalValidation.length === 0 && (
          <div className="p-3 bg-green-500/10 border border-green-500/25 rounded-lg mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <small className="text-green-400">
                <strong>Ready to save!</strong>
              </small>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          className="btn-primary w-full flex items-center justify-center"
          onClick={handleSave}
          disabled={!canSave || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Question
            </>
          )}
        </button>

        {/* Validation Summary */}
        {finalValidation.length > 0 && (
          <div className="mt-3">
            <small className="text-[#6b6b70]">
              <strong>Remaining items:</strong>
            </small>
            <ul className="mt-1 space-y-1">
              {finalValidation.slice(0, 3).map((error, index) => (
                <li key={index} className="text-sm text-[#6b6b70]">
                  {error}
                </li>
              ))}
              {finalValidation.length > 3 && (
                <li className="text-sm text-[#6b6b70]">
                  ... and {finalValidation.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg mt-3">
            <small className="text-red-400">
              <strong>Error:</strong> {error}
            </small>
          </div>
        )}

        {/* Success Display */}
        {creationSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/25 rounded-lg mt-3">
            <small className="text-green-400">
              <strong>Success:</strong> {creationSuccess}
            </small>
          </div>
        )}

        {/* Save Info */}
        <div className="mt-3 pt-3 border-t border-[#2a2a2e]">
          <small className="text-[#6b6b70]">
            Questions are automatically saved as <strong className="text-[#a1a1aa]">drafts</strong> and can be edited later.
          </small>
        </div>
      </div>
    </div>
  );
};

export default SaveActionCard;
