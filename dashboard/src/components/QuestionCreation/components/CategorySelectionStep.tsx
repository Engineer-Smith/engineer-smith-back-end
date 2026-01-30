// src/components/QuestionCreation/components/CategorySelectionStep.tsx
import React from 'react';
import { CheckCircle, ArrowLeft, Target, Monitor, Code } from 'lucide-react';
import type { QuestionCategory, Language } from '../../../types';

interface CategoryOption {
  value: QuestionCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  examples: string[];
}

interface CategorySelectionStepProps {
  selectedLanguage: Language;
  languageLabel: string;
  availableCategories: QuestionCategory[];
  onCategorySelect: (category: QuestionCategory) => void;
  onResetToLanguage: () => void;
}

const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
  languageLabel,
  availableCategories,
  onCategorySelect,
  onResetToLanguage
}) => {

  const categoryOptions: CategoryOption[] = [
    {
      value: 'logic',
      label: 'Logic & Algorithms',
      description: 'Problem-solving, algorithms, and computational thinking',
      icon: Target,
      colorClass: 'text-green-400',
      examples: ['Array manipulation', 'Sorting algorithms', 'Data processing']
    },
    {
      value: 'ui',
      label: 'User Interface',
      description: 'Visual components, layouts, and user interactions',
      icon: Monitor,
      colorClass: 'text-blue-400',
      examples: ['Component structure', 'Layout design', 'Styling patterns']
    },
    {
      value: 'syntax',
      label: 'Syntax & Features',
      description: 'Language syntax, keywords, and built-in features',
      icon: Code,
      colorClass: 'text-cyan-400',
      examples: ['Language features', 'Syntax rules', 'Built-in methods']
    }
  ];

  const getAvailableCategories = (): CategoryOption[] => {
    return categoryOptions.filter(option =>
      availableCategories.includes(option.value)
    );
  };

  const handleCategoryClick = (category: QuestionCategory) => {
    onCategorySelect(category);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="badge-blue mr-2 px-3 py-1.5 flex items-center">
            <CheckCircle size={14} className="mr-1" />
            {languageLabel}
          </span>
        </div>
        <button
          className="btn-ghost text-sm text-[#6b6b70] hover:text-[#f5f5f4]"
          onClick={() => {
            onResetToLanguage();
          }}
        >
          <ArrowLeft size={14} className="mr-1" />
          Change Language
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {getAvailableCategories().map((category) => (
          <div
            key={category.value}
            className="card h-full cursor-pointer hover:border-[#5a5a5e] hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => handleCategoryClick(category.value)}
          >
            <div className="p-4">
              <div className="flex items-center mb-3">
                <category.icon size={24} className={`${category.colorClass} mr-2`} />
                <h6 className="font-semibold text-[#f5f5f4] mb-0">{category.label}</h6>
              </div>
              <p className="text-[#6b6b70] text-sm mb-3">
                {category.description}
              </p>
              <div className="mb-2">
                <strong className="text-sm text-[#a1a1aa]">Examples:</strong>
                <ul className="text-sm text-[#6b6b70] mb-0 mt-1 list-disc list-inside">
                  {category.examples.map((example, idx) => (
                    <li key={idx}>{example}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CategorySelectionStep;
