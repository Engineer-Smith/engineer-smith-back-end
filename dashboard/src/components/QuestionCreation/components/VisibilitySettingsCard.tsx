import React from 'react';
import { Settings, HelpCircle } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const VisibilitySettingsCard: React.FC = () => {
  const { state, updateQuestionData } = useQuestionCreation();
  const { isGlobalQuestion, canCreateGlobal, saving } = state;

  if (!canCreateGlobal) {
    return null;
  }

  return (
    <div className="card border-cyan-500/50">
      <div className="p-4">
        <h6 className="text-cyan-400 font-semibold mb-3 flex items-center">
          <Settings size={16} className="mr-1" />
          Question Visibility
        </h6>
        <div className="mb-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isGlobalQuestion}
                onChange={(e) => updateQuestionData({ isGlobal: e.target.checked })}
                disabled={saving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2a2a2e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </div>
            <span className="ml-3 text-[#f5f5f4]">
              Make this a global question
              <span
                className="ml-1 text-[#6b6b70] cursor-help"
                title="Global questions can be used by all organizations. Organization questions are only visible to your organization."
              >
                <HelpCircle size={14} className="inline" />
              </span>
            </span>
          </label>
        </div>
        <div className="text-sm text-[#6b6b70]">
          {isGlobalQuestion
            ? 'This question will be available to all users across all organizations.'
            : 'This question will only be available to users in your organization.'
          }
        </div>
      </div>
    </div>
  );
};

export default VisibilitySettingsCard;
