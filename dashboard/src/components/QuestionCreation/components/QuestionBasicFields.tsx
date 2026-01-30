// src/components/QuestionCreation/components/QuestionBasicFields.tsx - SIMPLIFIED UI

import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTags } from '../../../hooks/useTags';
import type { CreateQuestionData, Language, Tags } from '../../../types';

interface QuestionBasicFieldsProps {
  questionData: Partial<CreateQuestionData>;
  selectedLanguage: Language;
  onInputChange: (field: keyof CreateQuestionData, value: any) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    hasErrors: boolean;
    hasWarnings: boolean;
    requiredFields: string[];
    optionalFields: string[];
  };
  isFieldRequired?: (field: string) => boolean;
  getValidationWarnings?: () => string[];
}

const QuestionBasicFields: React.FC<QuestionBasicFieldsProps> = ({
  questionData,
  selectedLanguage,
  onInputChange,
  validation,
  isFieldRequired = () => false,
}) => {
  const [showTagSelector, setShowTagSelector] = useState(false);

  const {
    tags,
    tagMetadata,
    loading: tagsLoading,
    error: tagsError,
    refetch: refetchTags
  } = useTags({
    languages: [selectedLanguage],
    autoFetch: true
  });

  const isTitleRequired = isFieldRequired('title');
  const isDescriptionRequired = isFieldRequired('description');
  const isDifficultyRequired = isFieldRequired('difficulty');
  const isTagsRequired = isFieldRequired('tags');

  const getFieldErrors = (fieldName: string): string[] => {
    if (!validation?.errors) return [];
    return validation.errors.filter(error =>
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const titleErrors = getFieldErrors('title');
  const descriptionErrors = getFieldErrors('description');
  const difficultyErrors = getFieldErrors('difficulty');
  const tagsErrors = getFieldErrors('tag');

  const hasFieldIssues = (fieldName: string): boolean => {
    return getFieldErrors(fieldName).length > 0;
  };

  const getLanguageDisplayName = (language: Language): string => {
    const languageNames: Record<Language, string> = {
      javascript: 'JavaScript', typescript: 'TypeScript', react: 'React',
      html: 'HTML', css: 'CSS', python: 'Python', sql: 'SQL',
      reactNative: 'React Native', flutter: 'Flutter', dart: 'Dart',
      express: 'Express.js', json: 'JSON', swift: 'Swift', swiftui: 'SwiftUI'
    };
    return languageNames[language] || language;
  };

  const formatTagLabel = (tag: string): string => {
    return tag.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTagDisplayInfo = (tag: string) => {
    const metadata = tagMetadata[tag];
    return {
      label: metadata?.label || formatTagLabel(tag),
      description: metadata?.description || `${tag} related concepts`
    };
  };

  const handleTagToggle = (tag: Tags) => {
    const currentTags = questionData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onInputChange('tags', newTags);
  };

  const clearAllTags = () => onInputChange('tags', []);

  return (
    <>
      {/* Show validation errors only if there are actual errors */}
      {validation && validation.hasErrors && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-4 flex items-start">
          <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5" />
          <div className="text-red-400">
            <strong>Please fix the following issues:</strong>
            <ul className="mb-0 mt-2 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Title Field */}
      <div className="mb-4">
        <label htmlFor="question-title" className="block text-[#a1a1aa] font-semibold mb-2">
          Question Title {isTitleRequired && <span className="text-red-400">*</span>}
        </label>
        <input
          id="question-title"
          type="text"
          placeholder="Brief summary (e.g., 'Create a React Component', 'Write a SQL Query')"
          value={questionData.title || ''}
          onChange={(e) => onInputChange('title', e.target.value)}
          className={`input w-full ${hasFieldIssues('title') ? 'border-red-500' : ''}`}
        />
        {titleErrors.length > 0 && (
          <div className="text-red-400 text-sm mt-1">
            {titleErrors.join(', ')}
          </div>
        )}
        <small className="text-[#6b6b70]">
          A short title that summarizes what the question asks students to do
        </small>
      </div>

      {/* Main Question Content */}
      <div className="mb-4">
        <label htmlFor="question-description" className="block text-[#a1a1aa] font-semibold mb-2">
          <strong>Question Content</strong> {isDescriptionRequired && <span className="text-red-400">*</span>}
        </label>
        <textarea
          id="question-description"
          rows={5}
          placeholder="Write the actual question here. Be specific about what you want students to create, solve, or explain. Include any requirements, constraints, or examples that will help students understand the task."
          value={questionData.description || ''}
          onChange={(e) => onInputChange('description', e.target.value)}
          className={`input w-full ${hasFieldIssues('description') ? 'border-red-500' : ''}`}
        />
        {descriptionErrors.length > 0 && (
          <div className="text-red-400 text-sm mt-1">
            {descriptionErrors.join(', ')}
          </div>
        )}
        <small className="text-[#6b6b70]">
          This is the main question that students will see and respond to
        </small>
      </div>

      {/* Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="difficulty" className="block text-[#a1a1aa] font-semibold mb-2">
            Difficulty Level {isDifficultyRequired && <span className="text-red-400">*</span>}
          </label>
          <select
            id="difficulty"
            value={questionData.difficulty || 'medium'}
            onChange={(e) => onInputChange('difficulty', e.target.value)}
            className={`select w-full ${hasFieldIssues('difficulty') ? 'border-red-500' : ''}`}
          >
            <option value="easy">Easy - Basic concepts</option>
            <option value="medium">Medium - Intermediate skills</option>
            <option value="hard">Hard - Advanced knowledge</option>
          </select>
          {difficultyErrors.length > 0 && (
            <div className="text-red-400 text-sm mt-1">
              {difficultyErrors.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-[#a1a1aa] font-semibold">
            Tags & Topics {isTagsRequired ? <span className="text-red-400">*</span> : <span className="text-[#6b6b70]">(optional)</span>}
          </label>
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => setShowTagSelector(!showTagSelector)}
            disabled={tagsLoading}
          >
            {tagsLoading && <Loader2 size={14} className="mr-1 animate-spin" />}
            {showTagSelector ? 'Hide Tags' : 'Select Tags'}
          </button>
        </div>

        {/* Show tag errors if any */}
        {tagsErrors.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg mb-2 text-red-400">
            {tagsErrors.join(', ')}
          </div>
        )}

        {/* Selected Tags */}
        {questionData.tags && questionData.tags.length > 0 ? (
          <div className="mb-2 flex flex-wrap items-center gap-1">
            {questionData.tags.map((tag, index) => {
              const tagInfo = getTagDisplayInfo(tag);
              return (
                <span
                  key={index}
                  className="badge-blue cursor-pointer hover:opacity-80"
                  onClick={() => handleTagToggle(tag)}
                  title={`${tagInfo.label} - Click to remove`}
                >
                  {tagInfo.label} ×
                </span>
              );
            })}
            <button type="button" className="btn-ghost text-sm text-[#6b6b70] ml-2" onClick={clearAllTags}>
              Clear all
            </button>
          </div>
        ) : (
          <div className="mb-2 text-[#6b6b70] text-sm">
            No tags selected
            {isTagsRequired && <span className="text-amber-400 ml-2">(at least one required)</span>}
          </div>
        )}

        {/* Tag Selector */}
        {showTagSelector && (
          <div className="card mt-2">
            <div className="p-4">
              {tagsLoading && (
                <div className="text-center py-3">
                  <Loader2 size={24} className="animate-spin mx-auto text-[#a1a1aa]" />
                  <p className="mt-2 mb-0 text-[#6b6b70]">Loading tags...</p>
                </div>
              )}

              {tagsError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center">
                  <span className="text-amber-400">
                    <strong>Unable to load tags:</strong> {tagsError}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary text-sm ml-2"
                    onClick={refetchTags}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!tagsLoading && !tagsError && (
                <div>
                  {tags.length === 0 ? (
                    <div className="text-center text-[#6b6b70] py-3">
                      <p>No tags available for {getLanguageDisplayName(selectedLanguage)}</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-[#6b6b70] text-sm">
                        Select relevant topics for {getLanguageDisplayName(selectedLanguage)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const tagInfo = getTagDisplayInfo(tag);
                          const isSelected = questionData.tags?.includes(tag as Tags);

                          return (
                            <span
                              key={tag}
                              className={`${isSelected ? 'badge-blue' : 'badge-gray'} cursor-pointer hover:opacity-80 flex items-center`}
                              onClick={() => handleTagToggle(tag as Tags)}
                              title={tagInfo.description}
                            >
                              {tagInfo.label}
                              {isSelected && <CheckCircle size={12} className="ml-1" />}
                            </span>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <small className="text-[#6b6b70]">
          Help categorize and organize questions by selecting relevant topics
        </small>
      </div>
    </>
  );
};

export default QuestionBasicFields;
