// src/components/QuestionCreation/QuestionCreationWizard.tsx - FINAL VERSION
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { useQuestionCreation } from '../../context/QuestionCreationContext';
import type { Question } from '../../types';

// Import step components
import QuestionBasicsStep from './steps/QuestionBasicsStep';
import QuestionContentStep from './steps/QuestionContentStep';
import ReviewStep from './steps/ReviewStep';
import TestCasesStep from './steps/TestCasesStep';

// Import duplicate detection components
import DuplicateWarningModal from './components/DuplicateWarningModal';
import PromptGenerationModal from './components/PromptGenerationModal';

interface QuestionCreationWizardProps {
  onCancel?: () => void;
  onComplete?: (questionId: string, question: Question) => void;
}

const QuestionCreationWizard: React.FC<QuestionCreationWizardProps> = ({
  onCancel,
  onComplete
}) => {
  const {
    state,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
    isStepAccessible,
    clearErrors,
    resetWizard,
    // Use new centralized save methods from context
    saveQuestionWithCallback,
    canSaveQuestion,
    getSaveValidationErrors,
    registerCompletionCallback,
    isCompleted,
    completedQuestion,
    isSaving
  } = useQuestionCreation();

  const {
    currentStep,
    steps,
    canNavigateBack,
    canNavigateForward,
    loading,
    error,
    testSuccess,
    creationSuccess,
    showDuplicateWarning,
    promptGeneration,
    selectedLanguage,
    selectedCategory,
    selectedQuestionType,
    questionData,
    testCases,
    testCaseValidation,
    stepErrors
  } = state;

  // Register completion callback once
  useEffect(() => {
    if (onComplete) {
      registerCompletionCallback(onComplete);
    }
    return () => {
      registerCompletionCallback(null);
    };
  }, [onComplete, registerCompletionCallback]);

  // Validate current step on relevant changes
  useEffect(() => {
    const timer = setTimeout(() => {
      validateCurrentStep();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    selectedLanguage,
    selectedCategory,
    selectedQuestionType,
    questionData.title,
    questionData.description,
    questionData.options,
    questionData.correctAnswer,
    questionData.codeTemplate,
    questionData.blanks,
    questionData.buggyCode,
    questionData.solutionCode,
    questionData.codeConfig,
    testCases.length,
    testCaseValidation.allPassed,
    currentStep,
    validateCurrentStep
  ]);

  const wizardSteps = steps;
  const currentStepData = wizardSteps.find(step => step.id === currentStep);
  const progressPercentage = Math.round(((currentStep - 1) / (wizardSteps.length - 1)) * 100);

  // Enhanced step status messages using centralized validation
  const getStepStatusMessage = (): string => {
    const currentStepErrors = stepErrors[currentStep];

    if (currentStepErrors && currentStepErrors.length > 0) {
      return currentStepErrors[0];
    }

    if (isCompleted) {
      return 'Question saved successfully!';
    }

    switch (currentStep) {
      case 1:
        if (!selectedLanguage) return 'Select a programming language';
        if (!selectedCategory) return 'Choose a question category';
        if (!selectedQuestionType) return 'Pick a question type';
        return 'All selections complete';

      case 2:
        if (!questionData.title) return 'Add a question title';
        if (!questionData.description) return 'Add a question description';

        switch (selectedQuestionType) {
          case 'multipleChoice':
            if (!questionData.options || questionData.options.length < 2) return 'Add answer options';
            if (typeof questionData.correctAnswer !== 'number') return 'Select correct answer';
            return 'Question content complete';
          case 'trueFalse':
            if (typeof questionData.correctAnswer !== 'boolean') return 'Select True or False';
            return 'Question content complete';
          case 'fillInTheBlank':
            if (!questionData.codeTemplate) return 'Add code template';
            if (!questionData.blanks || questionData.blanks.length === 0) return 'Configure blanks';
            return 'Question content complete';
          case 'codeChallenge':
            if (selectedCategory === 'logic' && !questionData.codeConfig?.entryFunction) {
              return 'Set entry function name';
            }
            return 'Question content complete';
          case 'codeDebugging':
            if (!questionData.buggyCode) return 'Add buggy code';
            if (!questionData.solutionCode) return 'Add solution code';
            return 'Question content complete';
        }
        return 'Complete question content';

      case 3:
        if (selectedQuestionType === 'codeChallenge' && selectedCategory === 'logic') {
          if (testCases.length === 0) return 'Add test cases';
          if (testCaseValidation.results.length === 0) return 'Run test validation';
          if (!testCaseValidation.allPassed) return 'Fix failing test cases';
          return 'Test cases validated';
        }
        return 'Test cases configured';

      case 4:
        if (isSaving) return 'Saving question...';
        if (creationSuccess) return 'Question saved successfully!';
        const saveErrors = getSaveValidationErrors();
        if (saveErrors.length > 0) return saveErrors[0];
        return 'Ready to save';

      default:
        return 'Required';
    }
  };

  const handleStepClick = useCallback((stepId: number) => {
    if (isStepAccessible(stepId)) {
      clearErrors();
      goToStep(stepId);
    }
  }, [clearErrors, goToStep, isStepAccessible]);

  // Use centralized save method
  const handleSaveQuestion = useCallback(async () => {
    try {
      await saveQuestionWithCallback();
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  }, [saveQuestionWithCallback]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      resetWizard();
    }
  }, [onCancel, resetWizard]);

  const renderCurrentStep = () => {
    if (loading) {
      return (
        <div className="text-center py-10">
          <Loader2 size={32} className="animate-spin text-amber-500 mx-auto" />
          <div className="mt-2 text-[#6b6b70]">Loading...</div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <QuestionBasicsStep />;
      case 2:
        return <QuestionContentStep />;
      case 3:
        return <TestCasesStep />;
      case 4:
        return <ReviewStep />;
      default:
        return <div>Step not found</div>;
    }
  };

  // Button configuration with centralized validation
  const getNextButtonConfig = () => {
    if (currentStep === wizardSteps.length) {
      const canSave = canSaveQuestion();
      return {
        text: isSaving ? 'Saving...' : 'Save Question',
        variant: 'success',
        icon: isSaving ? null : <CheckCircle size={16} className="ml-1" />,
        action: handleSaveQuestion,
        disabled: !canSave || isCompleted
      };
    } else {
      return {
        text: 'Next',
        variant: 'primary',
        icon: <ArrowRight size={16} className="ml-1" />,
        action: () => nextStep(),
        disabled: !canNavigateForward
      };
    }
  };

  const nextButtonConfig = getNextButtonConfig();

  return (
    <div className="question-creation-wizard">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 mb-4">
            <div className="card h-full bg-[#1a1a1d] border border-amber-500/30">
              <div className="p-4">
                <div className="mb-4">
                  <h6 className="mb-2 font-semibold text-amber-500">Question Creation</h6>
                  <small className="block text-[#a1a1aa]">Step {currentStep} of {wizardSteps.length}</small>
                  <small className="block text-[#a1a1aa]">{progressPercentage}% Complete</small>
                </div>

                <div className="steps-list">
                  {wizardSteps.map((step) => {
                    const isAccessible = isStepAccessible(step.id);
                    const isCurrent = step.id === currentStep;
                    const isStepCompleted = step.isCompleted;
                    const isValid = step.isValid;
                    const hasErrors = stepErrors[step.id] && stepErrors[step.id].length > 0;

                    return (
                      <div
                        key={step.id}
                        className={`step-item mb-3 p-2 rounded ${isCurrent ? 'bg-amber-500/20 border border-amber-500/40' : 'hover:bg-[#2a2a2e]'}`}
                        onClick={() => isAccessible && handleStepClick(step.id)}
                        style={{
                          cursor: isAccessible ? 'pointer' : 'default',
                          opacity: isAccessible || isCurrent ? 1 : 0.5
                        }}
                      >
                        <div className="flex items-center">
                          <div
                            className="step-number rounded-full flex items-center justify-center mr-2 text-sm font-bold"
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: isCurrent ? '#f59e0b' :
                                isStepCompleted ? '#22c55e' :
                                  isValid ? '#3b82f6' :
                                    hasErrors ? '#ef4444' : '#3a3a3e',
                              color: '#fff'
                            }}
                          >
                            {isStepCompleted ? '✓' : hasErrors ? '!' : isValid ? '●' : step.id}
                          </div>
                          <div>
                            <div className={`font-bold text-sm ${isCurrent ? 'text-amber-500' : 'text-[#e4e4e7]'}`}>{step.title}</div>
                            <div className="text-sm text-[#71717a]">{step.description}</div>
                            {isCurrent && hasErrors && (
                              <div className="text-sm text-red-400 mt-1">
                                {stepErrors[step.id][0]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-2 bg-[#2a2a2e] rounded">
                  <div className="font-bold text-sm mb-1 text-amber-500">Status</div>
                  <div className="text-sm text-[#a1a1aa]">{getStepStatusMessage()}</div>
                </div>

                {questionData.title && (
                  <div className="mt-3 p-2 bg-[#2a2a2e] rounded">
                    <div className="font-bold text-sm mb-1 text-amber-500">Progress</div>
                    <div className="text-sm text-[#a1a1aa]">
                      <div>Language: {selectedLanguage}</div>
                      {selectedCategory && <div>Category: {selectedCategory}</div>}
                      {selectedQuestionType && <div>Type: {selectedQuestionType}</div>}
                      {currentStep === 3 && selectedQuestionType === 'codeChallenge' && selectedCategory === 'logic' && (
                        <div className="mt-1">
                          <div>Test Cases: {testCases.length}</div>
                          {testCaseValidation.results.length > 0 && (
                            <div>Status: {testCaseValidation.allPassed ? '✓ Passed' : '✗ Failed'}</div>
                          )}
                        </div>
                      )}
                      {isCompleted && (
                        <div className="mt-1 text-green-400">
                          <CheckCircle size={12} className="mr-1 inline" />
                          Saved: {completedQuestion?.title}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="p-6">
                <div className="mb-4 pb-3 border-b border-[#2a2a2e]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="mb-1 text-amber-500 text-xl font-bold">{currentStepData?.title}</h3>
                      <p className="text-[#6b6b70] mb-0">{currentStepData?.description}</p>
                      {currentStepData?.isValid && (
                        <small className="text-green-400">
                          <CheckCircle size={14} className="mr-1 inline" />
                          Step completed
                        </small>
                      )}
                    </div>
                    <div className="text-right">
                      <small className="text-[#6b6b70]">Step {currentStep} of {wizardSteps.length}</small>
                      <div className="mt-1">
                        <small className={`px-2 py-1 rounded text-xs ${canNavigateForward || isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-[#2a2a2e] text-[#6b6b70]'}`}>
                          {isCompleted ? 'Question saved' :
                           canNavigateForward ? 'Can proceed' :
                           'Complete required fields'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-4 flex items-center">
                    <AlertCircle size={16} className="text-red-400 mr-2" />
                    <span className="text-red-400">
                      <strong>Error:</strong> {error}
                    </span>
                  </div>
                )}

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

                {stepErrors[currentStep] && stepErrors[currentStep].length > 0 && !isCompleted && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-lg mb-4 flex items-start">
                    <AlertCircle size={16} className="text-amber-400 mr-2 mt-0.5" />
                    <div className="text-amber-400">
                      <strong>Please complete the following:</strong>
                      <ul className="mb-0 mt-2 list-disc list-inside">
                        {stepErrors[currentStep].map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Step Content */}
                <div className="wizard-step-content">
                  {renderCurrentStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#2a2a2e]">
                  <div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {canNavigateBack && !isCompleted && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={prevStep}
                        disabled={loading || isSaving}
                      >
                        <ArrowLeft size={16} className="mr-1" />
                        Previous
                      </button>
                    )}

                    {!isCompleted && (
                      <button
                        type="button"
                        className={nextButtonConfig.variant === 'success' ? 'btn-primary bg-green-600 hover:bg-green-700' : 'btn-primary'}
                        onClick={nextButtonConfig.action}
                        disabled={nextButtonConfig.disabled || loading || isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={16} className="mr-1 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            {nextButtonConfig.text}
                            {nextButtonConfig.icon}
                          </>
                        )}
                      </button>
                    )}

                    {isCompleted && (
                      <div className="flex items-center text-green-400">
                        <CheckCircle size={16} className="mr-2" />
                        <span>Question saved successfully!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showDuplicateWarning && <DuplicateWarningModal />}
        {promptGeneration.showModal && <PromptGenerationModal />}
      </div>
    </div>
  );
};

export default QuestionCreationWizard;
