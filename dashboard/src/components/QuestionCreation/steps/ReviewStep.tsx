// src/components/QuestionCreation/steps/ReviewStep.tsx - FIXED PROPS
import React from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

// Import the new components
import QuestionStatusCard from '../components/QuestionStatusCard';
import DuplicateCheckCard from '../components/DuplicateCheckCard';
import QuestionSummaryCard from '../components/QuestionSummaryCard';
import SaveActionCard from '../components/SaveActionCard';
import QuickActionsCard from '../components/QuickActionsCard';
import VisibilitySettingsCard from '../components/VisibilitySettingsCard';

const ReviewStep: React.FC = () => {
  const {
    state,
    getSaveValidationErrors,
    canSaveQuestion,
    isCompleted,
    completedQuestion,
    isSaving
  } = useQuestionCreation();

  const {
    error,
    testSuccess,
    creationSuccess
  } = state;

  // Use centralized validation
  const finalValidation = getSaveValidationErrors();
  const canSave = canSaveQuestion();

  return (
    <div className="review-step">
      {/* Validation Errors */}
      {finalValidation.length > 0 && !isCompleted && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-4 flex items-start">
          <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5" />
          <div className="text-red-400">
            <strong>Please fix the following issues before saving:</strong>
            <ul className="mb-0 mt-2 list-disc list-inside">
              {finalValidation.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* API Errors */}
      {error && !isCompleted && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-4 flex items-center">
          <AlertTriangle size={16} className="text-red-400 mr-2" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Success Messages */}
      {testSuccess && !creationSuccess && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mb-4 flex items-center">
          <CheckCircle size={16} className="text-blue-400 mr-2" />
          <span className="text-blue-400">
            <strong>Test Validation:</strong> {testSuccess}
          </span>
        </div>
      )}

      {creationSuccess && (
        <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-lg mb-4 flex items-center">
          <CheckCircle size={16} className="text-green-400 mr-2" />
          <span className="text-green-400">
            <strong>Success:</strong> {creationSuccess}
          </span>
        </div>
      )}

      {/* Completion Status */}
      {isCompleted && completedQuestion && (
        <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-lg mb-4">
          <div className="flex items-center text-green-400">
            <CheckCircle size={16} className="mr-2" />
            <strong>Question Saved:</strong> "{completedQuestion.title}" has been successfully created!
          </div>
          <div className="mt-2 text-sm text-green-400">
            <strong>Question ID:</strong> {completedQuestion._id}
          </div>
        </div>
      )}

      {/* Save in progress indicator */}
      {isSaving && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mb-4">
          <div className="flex items-center text-blue-400">
            <Loader2 size={16} className="mr-2 animate-spin" />
            <strong>Saving question...</strong> Please wait while we create your question.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Main Question Summary */}
          <QuestionSummaryCard />
        </div>

        <div className="lg:col-span-1 space-y-4">
          {/* Question Status Card - only pass finalValidation */}
          <QuestionStatusCard
            finalValidation={finalValidation}
          />

          {/* Duplicate Check */}
          <DuplicateCheckCard />

          {/* Save Action Card - pass the props it expects */}
          <SaveActionCard
            finalValidation={finalValidation}
            canSave={canSave}
            isCompleted={isCompleted}
            isSaving={isSaving}
          />

          {/* Quick Actions */}
          <QuickActionsCard />

          {/* Visibility Settings */}
          <VisibilitySettingsCard />

          {/* Completion Summary */}
          {isCompleted && completedQuestion && (
            <div className="card border-green-500/50">
              <div className="p-4">
                <h6 className="font-semibold text-green-400 flex items-center mb-3">
                  <CheckCircle size={16} className="mr-2" />
                  Question Created Successfully
                </h6>
                <div className="text-sm space-y-1 text-[#a1a1aa]">
                  <div><strong className="text-[#f5f5f4]">ID:</strong> {completedQuestion._id}</div>
                  <div><strong className="text-[#f5f5f4]">Title:</strong> {completedQuestion.title}</div>
                  <div><strong className="text-[#f5f5f4]">Type:</strong> {completedQuestion.type}</div>
                  <div><strong className="text-[#f5f5f4]">Language:</strong> {completedQuestion.language}</div>
                  <div><strong className="text-[#f5f5f4]">Scope:</strong> {completedQuestion.isGlobal ? 'Global' : 'Organization'}</div>
                  <div><strong className="text-[#f5f5f4]">Status:</strong> {completedQuestion.status}</div>
                  {completedQuestion.testCases && (
                    <div><strong className="text-[#f5f5f4]">Test Cases:</strong> {completedQuestion.testCases.length}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
