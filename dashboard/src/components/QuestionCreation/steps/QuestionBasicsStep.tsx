// src/components/QuestionCreation/steps/QuestionBasicsStep.tsx - PRODUCTION READY
import React from 'react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';
import type { Language, QuestionCategory, QuestionType } from '../../../types';

// Import the modular components
import LanguageSelectionStep from '../components/LanguageSelectionStep';
import CategorySelectionStep from '../components/CategorySelectionStep';
import QuestionTypeSelectionStep from '../components/QuestionTypeSelectionStep';
import SelectionCompleteStep from '../components/SelectionCompleteStep';

type SelectionStep = 'language' | 'category' | 'questionType' | 'complete';

const QuestionBasicsStep: React.FC = () => {
  const {
    state,
    dispatch,
    setLanguage,
    setCategory,
    setQuestionType
  } = useQuestionCreation();

  const {
    selectedLanguage,
    selectedCategory,
    selectedQuestionType,
    availableCategories
  } = state;

  // Determine which sub-step to show
  const getCurrentSubStep = (): SelectionStep => {
    if (!selectedLanguage) return 'language';
    if (!selectedCategory) return 'category';
    if (!selectedQuestionType) return 'questionType';
    return 'complete';
  };

  const currentSubStep = getCurrentSubStep();

  // Helper functions to get display labels
  const getLanguageLabel = (): string => {
    const languageLabels: Record<Language, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'react': 'React',
      'html': 'HTML',
      'css': 'CSS',
      'python': 'Python',
      'sql': 'SQL',
      'reactNative': 'React Native',
      'flutter': 'Flutter',
      'dart': 'Dart',
      'express': 'Express.js',
      'json': 'JSON',
      'swift': 'Swift',
      'swiftui': 'SwiftUI'
    };
    return selectedLanguage ? languageLabels[selectedLanguage] : '';
  };

  const getCategoryLabel = (): string => {
    const categoryLabels: Record<QuestionCategory, string> = {
      'logic': 'Logic & Algorithms',
      'ui': 'User Interface',
      'syntax': 'Syntax & Features',
      'debugging': 'Debugging',
      'concept': 'Concepts',
      'best-practice': 'Best Practices'
    };
    return selectedCategory ? categoryLabels[selectedCategory] : '';
  };

  const getQuestionTypeLabel = (): string => {
    const typeLabels: Record<QuestionType, string> = {
      'multipleChoice': 'Multiple Choice',
      'trueFalse': 'True/False',
      'fillInTheBlank': 'Fill in the Blank',
      'dragDropCloze': 'Drag & Drop Cloze',
      'codeChallenge': 'Code Challenge',
      'codeDebugging': 'Code Debugging'
    };
    return selectedQuestionType ? typeLabels[selectedQuestionType] : '';
  };

  // Selection handlers - reducer handles validation automatically
  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
  };

  const handleCategorySelect = (category: QuestionCategory) => {
    setCategory(category);
  };

  const handleQuestionTypeSelect = (type: QuestionType) => {
    setQuestionType(type);
  };

  // Reset handlers
  const handleResetToLanguage = () => {
    dispatch({ type: 'RESET_WIZARD' });
  };

  const handleResetToCategory = () => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage);
    }
  };

  const handleResetToQuestionType = () => {
    if (selectedCategory) {
      setCategory(selectedCategory);
    }
  };

  // Get step info for display
  const getStepInfo = () => {
    switch (currentSubStep) {
      case 'language': 
        return { 
          number: 1, 
          title: 'Choose Programming Language',
          description: 'Select the programming language or technology for your question.'
        };
      case 'category': 
        return { 
          number: 2, 
          title: 'Choose Question Category',
          description: `What aspect of ${getLanguageLabel()} do you want to test?`
        };
      case 'questionType': 
        return { 
          number: 3, 
          title: 'Choose Question Type',
          description: 'Select the format that best fits your question content.'
        };
      case 'complete': 
        return { 
          number: 3, 
          title: 'Selection Complete',
          description: 'Your question basics are configured. Review or proceed to content creation.'
        };
    }
  };

  const stepInfo = getStepInfo();

  const renderCurrentSubStep = () => {
    switch (currentSubStep) {
      case 'language':
        return <LanguageSelectionStep onLanguageSelect={handleLanguageSelect} />;
        
      case 'category':
        return (
          <CategorySelectionStep
            selectedLanguage={selectedLanguage!}
            languageLabel={getLanguageLabel()}
            availableCategories={availableCategories}
            onCategorySelect={handleCategorySelect}
            onResetToLanguage={handleResetToLanguage}
          />
        );
        
      case 'questionType':
        return (
          <QuestionTypeSelectionStep
            selectedLanguage={selectedLanguage!}
            languageLabel={getLanguageLabel()}
            selectedCategory={selectedCategory!}
            categoryLabel={getCategoryLabel()}
            onQuestionTypeSelect={handleQuestionTypeSelect}
            onResetToCategory={handleResetToCategory}
          />
        );
        
      case 'complete':
        return (
          <SelectionCompleteStep
            selectedLanguage={selectedLanguage!}
            languageLabel={getLanguageLabel()}
            selectedCategory={selectedCategory!}
            categoryLabel={getCategoryLabel()}
            selectedQuestionType={selectedQuestionType!}
            questionTypeLabel={getQuestionTypeLabel()}
            onResetToQuestionType={handleResetToQuestionType}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="question-basics-step">
      {/* Step Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0 text-primary">
            <span className="badge bg-primary rounded-pill me-2">{stepInfo.number}</span>
            {stepInfo.title}
          </h5>
        </div>
        <p className="text-muted mb-0">
          {stepInfo.description}
        </p>
      </div>

      {/* Current Sub-Step Content */}
      {renderCurrentSubStep()}
    </div>
  );
};

export default QuestionBasicsStep;