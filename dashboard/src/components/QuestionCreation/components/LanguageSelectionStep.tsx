// src/components/QuestionCreation/components/LanguageSelectionStep.tsx
import React from 'react';
import {
  Code,
  Monitor,
  Smartphone,
  Database,
  Server,
  FileText
} from 'lucide-react';
import { getValidCategories } from '../../../types';
import type { Language } from '../../../types';

interface LanguageOption {
  value: Language;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  badgeClass: string;
  description: string;
  categoryCount: number;
}

interface LanguageSelectionStepProps {
  onLanguageSelect: (language: Language) => void;
}

const LanguageSelectionStep: React.FC<LanguageSelectionStepProps> = ({
  onLanguageSelect
}) => {

  const languageOptions: LanguageOption[] = [
    {
      value: 'javascript',
      label: 'JavaScript',
      icon: Code,
      colorClass: 'text-amber-400',
      badgeClass: 'badge-amber',
      description: 'Modern JavaScript ES6+ features and concepts',
      categoryCount: getValidCategories('javascript').length
    },
    {
      value: 'typescript',
      label: 'TypeScript',
      icon: Code,
      colorClass: 'text-cyan-400',
      badgeClass: 'badge-cyan',
      description: 'Type-safe JavaScript with advanced type system',
      categoryCount: getValidCategories('typescript').length
    },
    {
      value: 'react',
      label: 'React',
      icon: Monitor,
      colorClass: 'text-blue-400',
      badgeClass: 'badge-blue',
      description: 'React components, hooks, and state management',
      categoryCount: getValidCategories('react').length
    },
    {
      value: 'html',
      label: 'HTML',
      icon: FileText,
      colorClass: 'text-red-400',
      badgeClass: 'badge-red',
      description: 'HTML structure, semantics, and accessibility',
      categoryCount: getValidCategories('html').length
    },
    {
      value: 'css',
      label: 'CSS',
      icon: Monitor,
      colorClass: 'text-cyan-400',
      badgeClass: 'badge-cyan',
      description: 'CSS styling, layouts, and responsive design',
      categoryCount: getValidCategories('css').length
    },
    {
      value: 'python',
      label: 'Python',
      icon: Code,
      colorClass: 'text-green-400',
      badgeClass: 'badge-green',
      description: 'Python programming and data structures',
      categoryCount: getValidCategories('python').length
    },
    {
      value: 'sql',
      label: 'SQL',
      icon: Database,
      colorClass: 'text-[#a1a1aa]',
      badgeClass: 'badge-gray',
      description: 'Database queries and data manipulation',
      categoryCount: getValidCategories('sql').length
    },
    {
      value: 'reactNative',
      label: 'React Native',
      icon: Smartphone,
      colorClass: 'text-blue-400',
      badgeClass: 'badge-blue',
      description: 'Cross-platform mobile app development',
      categoryCount: getValidCategories('reactNative').length
    },
    {
      value: 'flutter',
      label: 'Flutter',
      icon: Smartphone,
      colorClass: 'text-cyan-400',
      badgeClass: 'badge-cyan',
      description: 'Flutter widgets and Dart programming',
      categoryCount: getValidCategories('flutter').length
    },
    {
      value: 'dart',
      label: 'Dart',
      icon: Code,
      colorClass: 'text-cyan-400',
      badgeClass: 'badge-cyan',
      description: 'Dart language fundamentals',
      categoryCount: getValidCategories('dart').length
    },
    {
      value: 'express',
      label: 'Express.js',
      icon: Server,
      colorClass: 'text-[#6b6b70]',
      badgeClass: 'badge-gray',
      description: 'Node.js web framework and API development',
      categoryCount: getValidCategories('express').length
    },
    {
      value: 'json',
      label: 'JSON',
      icon: FileText,
      colorClass: 'text-amber-400',
      badgeClass: 'badge-amber',
      description: 'JSON data format and structure',
      categoryCount: getValidCategories('json').length
    },
    {
      value: 'swift',
      label: 'Swift',
      icon: Code,
      colorClass: 'text-orange-400',
      badgeClass: 'badge-amber',
      description: 'Swift programming for iOS and macOS development',
      categoryCount: getValidCategories('swift').length
    },
    {
      value: 'swiftui',
      label: 'SwiftUI',
      icon: Smartphone,
      colorClass: 'text-orange-400',
      badgeClass: 'badge-amber',
      description: 'SwiftUI declarative UI framework',
      categoryCount: getValidCategories('swiftui').length
    }
  ];

  const handleLanguageClick = (language: Language) => {
    onLanguageSelect(language);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {languageOptions.map((lang) => (
        <div
          key={lang.value}
          className="card h-full cursor-pointer hover:border-[#5a5a5e] hover:-translate-y-0.5 transition-all duration-200"
          onClick={() => handleLanguageClick(lang.value)}
        >
          <div className="p-4 text-center">
            <lang.icon size={32} className={`${lang.colorClass} mb-2 mx-auto`} />
            <h6 className="font-semibold text-[#f5f5f4] mb-1">{lang.label}</h6>
            <small className="text-[#6b6b70] block mb-2">
              {lang.description}
            </small>
            <span className={`${lang.badgeClass} text-xs`}>
              {lang.categoryCount} categories available
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LanguageSelectionStep;
