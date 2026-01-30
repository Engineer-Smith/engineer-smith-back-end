// src/components/QuestionCreation/components/SolutionCodeModal.tsx
import React from 'react';
import { Lock, Play, HelpCircle, AlertTriangle, X } from 'lucide-react';

interface SolutionCodeModalProps {
  isOpen: boolean;
  onToggle: () => void;
  solutionCode: string;
  onSolutionCodeChange: (code: string) => void;
  onSaveAndRunTests: () => void;
  expectedResult?: any;
}

const SolutionCodeModal: React.FC<SolutionCodeModalProps> = ({
  isOpen,
  onToggle,
  solutionCode,
  onSolutionCodeChange,
  onSaveAndRunTests,
  expectedResult
}) => {
  const handleSaveAndRun = () => {
    onToggle();
    if (solutionCode.trim()) {
      onSaveAndRunTests();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onToggle}>
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
          <h5 className="font-semibold text-[#f5f5f4] flex items-center gap-2">
            <Lock size={20} className="text-blue-400" />
            Solution Code for Test Validation
          </h5>
          <button className="text-[#6b6b70] hover:text-[#f5f5f4]" onClick={onToggle}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg mb-4 flex items-start gap-2">
            <HelpCircle size={16} className="text-blue-400 mt-0.5" />
            <div className="text-blue-400 text-sm">
              <strong>Complete the function implementation</strong> below so we can test your test cases.
              The template is pre-filled based on your test cases. Just add your logic inside the function.
              This code is only used for validation and won't be saved with the question.
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[#a1a1aa] font-semibold mb-2">
              Complete the function implementation
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              rows={12}
              value={solutionCode}
              onChange={(e) => onSolutionCodeChange(e.target.value)}
              className="input w-full font-mono text-sm"
              style={{ lineHeight: '1.4' }}
            />
            <p className="text-[#6b6b70] text-sm mt-1">
              Complete the function so it returns the expected outputs for your test cases.
              {expectedResult && (
                <> For example, if your test expects {JSON.stringify(expectedResult)},
                make sure your function returns that value.</>
              )}
            </p>
          </div>

          {!solutionCode.trim() && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <span className="text-amber-400">Please complete the function implementation to validate your test cases.</span>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[#2a2a2e] flex justify-end gap-2">
          <button className="btn-secondary" onClick={onToggle}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSaveAndRun}
            disabled={!solutionCode.trim()}
          >
            <Play size={14} className="mr-1" />
            Save & Run Tests
          </button>
        </div>
      </div>
    </div>
  );
};

export default SolutionCodeModal;
