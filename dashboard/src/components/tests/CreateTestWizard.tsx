// src/components/tests/CreateTestWizard.tsx - FIXED VERSION with proper validation
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Import stage components
import TestBasics from './TestBasics';
import TestStructure from './TestStructure';
import SectionConfig from './SectionConfig';
import QuestionAssignment from './QuestionAssignment';
import ReviewPublish from './ReviewPublish';

// Import types
import type { CreateTestData, WizardStepProps } from '../../types';

interface WizardStep {
  id: number;
  name: string;
  title: string;
  description: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    name: 'basics',
    title: 'Test Basics',
    description: 'Title, description, and settings'
  },
  {
    id: 2,
    name: 'structure',
    title: 'Test Structure',
    description: 'Configure sections and timing'
  },
  {
    id: 3,
    name: 'sections',
    title: 'Section Setup',
    description: 'Define section details'
  },
  {
    id: 4,
    name: 'questions',
    title: 'Question Assignment',
    description: 'Add and assign questions'
  },
  {
    id: 5,
    name: 'review',
    title: 'Review & Publish',
    description: 'Final review and publish'
  }
];

interface CreateTestWizardProps {
  onCancel?: () => void;
  onComplete?: () => void;
}

const CreateTestWizard: React.FC<CreateTestWizardProps> = ({
  onCancel,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize test data with backend-aligned structure - UPDATED with 0 defaults
  const [testData, setTestData] = useState<CreateTestData>(() => {
    const initialData: CreateTestData = {
      // Required backend fields
      title: '',
      description: '',
      testType: 'custom',
      languages: [], // Backend expects array of Language enum values
      tags: [], // Backend expects array of Tags enum values

      // Settings object - UPDATED: Default to 0 for required validation
      settings: {
        timeLimit: 0, // CHANGED: Default to 0 so user must set it
        attemptsAllowed: 0, // CHANGED: Default to 0 so user must set it
        shuffleQuestions: false, // Default false
        useSections: false, // Default false - but this will be explicitly set by user
      },

      // Questions/sections - used based on useSections setting
      questions: [], // Array of {questionId, points} - now always initialized
      sections: [], // Array of sections with questions - now always initialized

      // Backend flags
      status: 'draft', // Default to draft

      // Frontend-only helper fields (will be stripped before API call)
      instructions: '', // Not sent to backend
    };

    return initialData;
  });

  const currentStepData = WIZARD_STEPS.find(step => step.id === currentStep);
  const progressPercentage = (currentStep / WIZARD_STEPS.length) * 100;

  // Determine which steps should be shown based on test configuration
  const getValidSteps = (): number[] => {
    const steps = [1, 2]; // Always show basics and structure

    if (testData.settings.useSections) {
      steps.push(3); // Show section config if using sections
    }

    steps.push(4, 5); // Always show questions and review
    return steps;
  };

  const getNextValidStep = (currentStep: number): number => {
    const validSteps = getValidSteps();
    const currentIndex = validSteps.indexOf(currentStep);
    return currentIndex < validSteps.length - 1 ? validSteps[currentIndex + 1] : currentStep;
  };

  const getPreviousValidStep = (currentStep: number): number => {
    const validSteps = getValidSteps();
    const currentIndex = validSteps.indexOf(currentStep);
    return currentIndex > 0 ? validSteps[currentIndex - 1] : currentStep;
  };

  const handleNext = (): void => {
    setError(null);
    const nextStep = getNextValidStep(currentStep);
    if (nextStep !== currentStep) {
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = (): void => {
    setError(null);
    const prevStep = getPreviousValidStep(currentStep);
    if (prevStep !== currentStep) {
      setCurrentStep(prevStep);
    }
  };

  const handleStepClick = (stepId: number): void => {
    const validSteps = getValidSteps();

    // Only allow clicking on valid steps that are accessible
    if (validSteps.includes(stepId) && isStepAccessible(stepId)) {
      setCurrentStep(stepId);
      setError(null);
    }
  };

  const handleCancel = (): void => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      onCancel?.();
    }
  };

  // UPDATED: Step completion validation with proper 0 checking
  const isStepCompleted = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        // TestBasics: title, description, and at least one language
        return !!(testData.title?.trim() &&
          testData.description?.trim() &&
          testData.languages.length > 0);
      case 2:
        // TestStructure: structure choice, time limit > 0, attempts > 0
        return !!(testData.settings.useSections !== undefined && // Must explicitly choose structure
          testData.settings.timeLimit > 0 && // Must be greater than 0
          testData.settings.attemptsAllowed > 0); // Must be greater than 0
      case 3:
        // SectionConfig: only needed if using sections, must have at least one section
        return testData.settings.useSections === false ||
          Boolean(testData.sections && testData.sections.length > 0);
      case 4:
        // QuestionAssignment: must have questions assigned
        if (testData.settings.useSections) {
          return testData.sections ?
            testData.sections.every(section => section.questions.length > 0) : false;
        }
        return testData.questions ? testData.questions.length > 0 : false;
      case 5:
        // Review step is never "completed" until published
        return false;
      default:
        return false;
    }
  };

  const isStepAccessible = (stepId: number): boolean => {
    const validSteps = getValidSteps();
    if (!validSteps.includes(stepId)) return false;

    // Can access current step or any completed steps
    if (stepId <= currentStep) return true;

    // Can only access the next step if the current step is completed
    if (stepId === currentStep + 1) {
      return isStepCompleted(currentStep);
    }

    return false;
  };

  const renderCurrentStep = (): React.ReactNode => {
    const commonProps: WizardStepProps = {
      testData,
      setTestData,
      onNext: handleNext,
      onPrevious: handlePrevious,
      onCancel: handleCancel,
      setError,
      setLoading
    };

    switch (currentStep) {
      case 1:
        return (
          <TestBasics
            {...commonProps}
          />
        );
      case 2:
        return (
          <TestStructure
            {...commonProps}
          />
        );
      case 3:
        return (
          <SectionConfig
            {...commonProps}
          />
        );
      case 4:
        return (
          <QuestionAssignment
            {...commonProps}
          />
        );
      case 5:
        return (
          <ReviewPublish
            {...commonProps}
            onComplete={onComplete}
          />
        );
      default:
        return (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400">Unknown step. Please refresh and try again.</span>
          </div>
        );
    }
  };

  const validSteps = getValidSteps();

  // Helper function to safely get array length
  const getQuestionsCount = (): number => {
    if (testData.settings.useSections === true) {
      return testData.sections ? testData.sections.length : 0;
    }
    return testData.questions ? testData.questions.length : 0;
  };

  const getQuestionsLabel = (): string => {
    if (testData.settings.useSections === true) {
      return 'Sections';
    }
    return 'Questions';
  };

  return (
    <div className="container-section py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-5">
            <h5 className="font-mono text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-blue-500" />
              Create Test
            </h5>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#a1a1aa]">Progress</span>
                <span className="font-bold text-[#f5f5f4]">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="progress-bar mb-3">
                <div
                  className="progress-fill bg-blue-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Step List */}
            <div className="space-y-2">
              {WIZARD_STEPS.map((step) => {
                const isValid = validSteps.includes(step.id);
                const isCompleted = isStepCompleted(step.id);
                const isAccessible = isStepAccessible(step.id);
                const isCurrent = step.id === currentStep;

                if (!isValid) return null;

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                      isCurrent
                        ? 'bg-blue-500 text-white border-blue-400'
                        : isCompleted
                        ? 'bg-green-500 text-white border-green-400'
                        : isAccessible
                        ? 'bg-[#1a1a1e] text-[#a1a1aa] border-transparent hover:border-[#3a3a3e]'
                        : 'bg-[#141416] text-[#6b6b70] border-transparent opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold"
                      >
                        {isCompleted ? '✓' : step.id}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{step.title}</div>
                        <div className="text-xs opacity-90">{step.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Step Info */}
            <div className="mt-4 p-3 bg-[#1a1a1e] rounded-lg border border-[#2a2a2e]">
              <div className="font-semibold text-blue-400 mb-1">
                {currentStepData?.title}
              </div>
              <div className="text-[#6b6b70] text-sm">
                {currentStepData?.description}
              </div>

              {/* Step completion status */}
              <div className="mt-2">
                {isStepCompleted(currentStep) ? (
                  <small className="text-green-400 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Step completed
                  </small>
                ) : (
                  <small className="text-amber-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    In progress
                  </small>
                )}
              </div>
            </div>

            {/* Test Summary - UPDATED to handle 0 values */}
            {testData.title && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/25">
                <div className="font-semibold text-blue-400 mb-1">Test Summary</div>
                <div className="text-sm text-[#a1a1aa]">
                  <div className="mb-1">
                    <strong className="text-[#f5f5f4]">Title:</strong> {testData.title}
                  </div>
                  <div className="mb-1">
                    <strong className="text-[#f5f5f4]">{getQuestionsLabel()}:</strong> {getQuestionsCount()}
                  </div>
                  <div>
                    <strong className="text-[#f5f5f4]">Time Limit:</strong> {testData.settings.timeLimit > 0 ? `${testData.settings.timeLimit} min` : 'Not set'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            {/* Step Header */}
            <div className="mb-6 pb-4 border-b border-[#2a2a2e]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-mono text-xl font-bold text-blue-400 mb-1">
                    Step {currentStep}: {currentStepData?.title}
                  </h3>
                  <p className="text-[#a1a1aa]">{currentStepData?.description}</p>
                </div>
                <div className="text-right">
                  <small className="text-[#6b6b70]">
                    Step {validSteps.indexOf(currentStep) + 1} of {validSteps.length}
                  </small>
                </div>
              </div>
            </div>

            {/* Current Step Component */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                <p className="mt-3 text-[#a1a1aa]">Creating test...</p>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTestWizard;
