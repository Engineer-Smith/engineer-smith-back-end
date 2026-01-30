// src/components/QuestionCreation/steps/QuestionContentStep.tsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';
import type { CreateQuestionData } from '../../../types';

// Import question type editor components
import QuestionBasicFields from '../components/QuestionBasicFields';
import MultipleChoiceEditor from '../components/MultipleChoiceEditor';
import TrueFalseEditor from '../components/TrueFalseEditor';
import FillInBlankEditor from '../components/FillInBlankEditor';
import DragDropClozeEditor from '../components/DragDropClozeEditor';
import CodeChallengeEditor from '../components/CodeChallengeEditor';
import CodeDebuggingEditor from '../components/CodeDebuggingEditor';

const QuestionContentStep: React.FC = () => {
  const {
    state,
    updateQuestionData,
    validation,
    isFieldRequired,
    getStepValidationErrors,
    createDefaultCodeConfig,
    getAvailableRuntimes,
    validateCodeConfig,
    getFunctionSignatures,
    getPerformanceRecommendations,
    getSecurityRecommendations
  } = useQuestionCreation();

  const {
    questionData,
    selectedLanguage,
    selectedCategory,
    selectedQuestionType
  } = state;

  // Auto-create default code configuration for code-based questions
  useEffect(() => {
    if ((selectedQuestionType === 'codeChallenge' || selectedQuestionType === 'codeDebugging') && selectedCategory === 'logic') {
      if (!questionData.codeConfig) {
        const defaultConfig = createDefaultCodeConfig ? createDefaultCodeConfig() : null;
        if (defaultConfig) {
          updateQuestionData({ codeConfig: defaultConfig });
        }
      }
    }
  }, [selectedQuestionType, selectedCategory, questionData.codeConfig, createDefaultCodeConfig, updateQuestionData]);

  const handleInputChange = (field: keyof CreateQuestionData, value: any) => {
    updateQuestionData({ [field]: value });
  };

  // Only show validation errors that come from step validation attempts (not continuous validation)
  const stepValidationErrors = getStepValidationErrors ? getStepValidationErrors(2) : [];
  const shouldShowValidationErrors = stepValidationErrors.length > 0;

  // Create a modified validation object that only shows errors when step validation has been attempted
  const stepAwareValidation = shouldShowValidationErrors ? validation : {
    ...validation,
    isValid: true,
    errors: [],
    hasErrors: false
  };

  // Render the appropriate editor component based on question type
  const renderTypeSpecificContent = () => {
    const commonValidationProps = {
      validation: stepAwareValidation, // Use step-aware validation
      isFieldRequired: isFieldRequired || (() => false),
      getValidationWarnings: () => [] // Don't show warnings until validation attempt
    };

    switch (selectedQuestionType) {
      case 'multipleChoice':
        return (
          <MultipleChoiceEditor
            questionData={questionData}
            onInputChange={handleInputChange}
            {...commonValidationProps}
          />
        );

      case 'trueFalse':
        return (
          <TrueFalseEditor
            questionData={questionData}
            onInputChange={handleInputChange}
            {...commonValidationProps}
          />
        );

      case 'fillInTheBlank':
        return (
          <FillInBlankEditor
            questionData={questionData}
            onInputChange={handleInputChange}
            {...commonValidationProps}
          />
        );

      case 'dragDropCloze':
        return (
          <DragDropClozeEditor
            questionData={questionData}
            onInputChange={handleInputChange}
            {...commonValidationProps}
          />
        );

      case 'codeChallenge':
        return (
          <CodeChallengeEditor
            questionData={questionData}
            onInputChange={handleInputChange}
            {...commonValidationProps}
            availableRuntimes={getAvailableRuntimes ? getAvailableRuntimes() : []}
            functionSignatures={getFunctionSignatures ? getFunctionSignatures() : []}
            performanceRecommendations={getPerformanceRecommendations ? getPerformanceRecommendations() : []}
            selectedLanguage={selectedLanguage!}
            selectedCategory={selectedCategory!}
          />
        );

      case 'codeDebugging':
        return (
          <CodeDebuggingEditor
            questionData={questionData}
            onInputChange={handleInputChange}
            {...commonValidationProps}
            availableRuntimes={getAvailableRuntimes ? getAvailableRuntimes() : []}
            functionSignatures={getFunctionSignatures ? getFunctionSignatures() : []}
            securityRecommendations={getSecurityRecommendations ? getSecurityRecommendations() : []}
            selectedLanguage={selectedLanguage!}
            selectedCategory={selectedCategory!}
          />
        );

      default:
        return null;
    }
  };

  // Helper function to get nested field values for progress calculation
  const getNestedFieldValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Calculate completion progress based on required fields
  const getProgressPercentage = (): number => {
    if (!validation || !validation.requiredFields) return 0;

    const requiredFields = validation.requiredFields;
    const totalFields = requiredFields.length;

    if (totalFields === 0) return 100;

    let completedFields = 0;

    requiredFields.forEach(field => {
      const fieldValue = getNestedFieldValue(questionData, field);

      // Check if field is completed based on its type
      if (Array.isArray(fieldValue)) {
        if (fieldValue.length > 0) completedFields++;
      } else if (typeof fieldValue === 'string') {
        if (fieldValue.trim()) completedFields++;
      } else if (typeof fieldValue === 'number') {
        if (fieldValue >= 0) completedFields++;
      } else if (typeof fieldValue === 'boolean') {
        completedFields++;
      } else if (fieldValue !== null && fieldValue !== undefined) {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  };

  const isContentComplete = (): boolean => {
    return validation ? validation.isValid : false;
  };

  // Get code configuration validation for code-based questions
  const codeConfigValidation = selectedQuestionType && ['codeChallenge', 'codeDebugging'].includes(selectedQuestionType) && validateCodeConfig
    ? validateCodeConfig()
    : null;

  const progressPercentage = getProgressPercentage();

  return (
    <div className="question-content-step">
      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <small className="text-[#6b6b70]">Content Completion</small>
          <small className="text-[#6b6b70]">{progressPercentage}%</small>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-bar-fill ${progressPercentage === 100 ? 'bg-green-500' : ''}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Required Fields Info */}
        {validation && validation.requiredFields && validation.requiredFields.length > 0 && (
          <small className="text-[#6b6b70] mt-1 block">
            <Info size={12} className="mr-1 inline" />
            Required: {validation.requiredFields.join(', ')}
          </small>
        )}
      </div>

      {/* Step Validation Errors - Only show when validation has been attempted */}
      {shouldShowValidationErrors && stepValidationErrors.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-4 flex items-start">
          <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5" />
          <div className="text-red-400">
            <strong>Please fix the following issues to continue:</strong>
            <ul className="mb-0 mt-2 list-disc list-inside">
              {stepValidationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Code Configuration Errors - Only show when validation attempted */}
      {shouldShowValidationErrors && codeConfigValidation && !codeConfigValidation.isValid && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-4 flex items-start">
          <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5" />
          <div className="text-red-400">
            <strong>Code Configuration Issues:</strong>
            <ul className="mb-0 mt-2 list-disc list-inside">
              {codeConfigValidation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form>
        {/* Basic Fields Component */}
        <QuestionBasicFields
          questionData={questionData}
          selectedLanguage={selectedLanguage!}
          onInputChange={handleInputChange}
          validation={stepAwareValidation} // Use step-aware validation
          isFieldRequired={isFieldRequired || (() => false)}
          getValidationWarnings={() => []} // Don't show warnings until validation attempt
        />

        {/* Type-Specific Content Components */}
        {renderTypeSpecificContent()}
      </form>

      {/* Completion Status - Only show if content is actually complete */}
      {isContentComplete() && stepValidationErrors.length === 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-lg mt-4 flex items-center">
          <CheckCircle size={16} className="text-green-400 mr-2" />
          <span className="text-green-400">
            Question content is complete and ready for the next step!
          </span>
        </div>
      )}

      {/* Next Step Preview for Code Questions */}
      {selectedQuestionType === 'codeChallenge' && selectedCategory === 'logic' && isContentComplete() && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mt-4 flex items-center">
          <Info size={16} className="text-blue-400 mr-2" />
          <span className="text-blue-400">
            Next: Add test cases to validate solutions for this logic question.
          </span>
        </div>
      )}

      {/* Next Step Preview for Debugging Questions */}
      {selectedQuestionType === 'codeDebugging' && selectedCategory === 'logic' && isContentComplete() && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mt-4 flex items-center">
          <Info size={16} className="text-blue-400 mr-2" />
          <span className="text-blue-400">
            Next: Add test cases to verify that fixes work correctly for this debugging question.
          </span>
        </div>
      )}
    </div>
  );
};

export default QuestionContentStep
