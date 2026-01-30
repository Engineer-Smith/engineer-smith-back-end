import {
  ArrowRight,
  Building,
  CheckCircle,
  Code,
  Eye,
  FileText,
  Globe,
  Server,
  Smartphone,
  Target,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Import types
import { useAuth } from '../../context/AuthContext';
import type { Language, Tags, TestStatus, TestType, WizardStepProps } from '../../types';

// Interface for language options
interface LanguageOption {
  value: Language;
  name: string;
  color: string;
  category: string;
}

// Interface for tag options
interface TagOption {
  value: Tags;
  name: string;
  category: string;
  color: string;
}

// Interface for grouped options
interface GroupedOptions<T> {
  [category: string]: T[];
}

// Test Template interface - matches the structure but uses React component references
interface TestTemplate {
  id: TestType;
  name: string;
  description: string;
  languages: Language[];
  tags: Tags[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  estimatedQuestions: string;
  difficulty: string;
}

// Color mapping for badges
const getBadgeClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    primary: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    secondary: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    light: 'bg-gray-300/20 text-gray-300 border border-gray-300/30',
    dark: 'bg-gray-700/20 text-gray-300 border border-gray-700/30'
  };
  return colorMap[color] || colorMap.secondary;
};

const getTemplateStyles = (color: string, isSelected: boolean): string => {
  if (!isSelected) return 'border-[#2a2a2e] hover:border-[#3a3a3e]';

  const colorMap: Record<string, string> = {
    primary: 'border-blue-500 bg-blue-500/10',
    info: 'border-cyan-500 bg-cyan-500/10',
    success: 'border-green-500 bg-green-500/10',
    warning: 'border-amber-500 bg-amber-500/10',
    danger: 'border-red-500 bg-red-500/10',
    secondary: 'border-gray-500 bg-gray-500/10'
  };
  return colorMap[color] || colorMap.secondary;
};

const getIconColorClass = (color: string, isSelected: boolean): string => {
  if (!isSelected) return 'text-[#6b6b70]';

  const colorMap: Record<string, string> = {
    primary: 'text-blue-500',
    info: 'text-cyan-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
    secondary: 'text-gray-500'
  };
  return colorMap[color] || colorMap.secondary;
};

const TestBasics: React.FC<WizardStepProps> = ({
  testData,
  setTestData,
  onNext,
  onCancel,
  setError
}) => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<TestType | null>(null);
  const [showCustomSelection, setShowCustomSelection] = useState<boolean>(false);

  // Determine test scope based on user's organization
  const isGlobalTest = user?.organization?.isSuperOrg ?? false;
  const testScopeText = user?.organization?.isSuperOrg
    ? 'Global Test (Available to all organizations)'
    : `Organization Test (Available to ${user?.organization?.name || 'your organization'} only)`;

  const TEST_TEMPLATES: TestTemplate[] = [
    {
      id: 'frontend_basics',
      name: 'Frontend Fundamentals',
      description: 'HTML, CSS, and JavaScript basics for web development',
      languages: ['html', 'css', 'javascript'],
      tags: ['html', 'css', 'javascript', 'dom', 'responsive-design', 'flexbox'],
      icon: Globe,
      color: 'primary',
      estimatedQuestions: '15-25',
      difficulty: 'Beginner to Intermediate'
    },
    {
      id: 'react_developer',
      name: 'React Developer',
      description: 'React components, hooks, state management, and modern JavaScript',
      languages: ['javascript', 'react', 'typescript'],
      tags: ['react', 'components', 'hooks', 'state-management', 'jsx', 'es6'],
      icon: Code,
      color: 'info',
      estimatedQuestions: '20-30',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'fullstack_js',
      name: 'Full Stack JavaScript',
      description: 'Frontend React and backend Express.js development',
      languages: ['javascript', 'react', 'express', 'typescript'],
      tags: ['react', 'express', 'nodejs', 'rest-api', 'components', 'routing'],
      icon: Server,
      color: 'success',
      estimatedQuestions: '25-40',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'mobile_development',
      name: 'Mobile Development',
      description: 'React Native and Flutter mobile app development',
      languages: ['reactNative', 'flutter', 'dart', 'javascript'],
      tags: ['react-native', 'flutter', 'mobile-development', 'native-components'],
      icon: Smartphone,
      color: 'warning',
      estimatedQuestions: '20-35',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'python_developer',
      name: 'Python Developer',
      description: 'Python programming, data structures, and backend development',
      languages: ['python'],
      tags: ['python', 'functions', 'classes', 'data-structures', 'algorithms'],
      icon: Target,
      color: 'danger',
      estimatedQuestions: '18-28',
      difficulty: 'Beginner to Advanced'
    },
    {
      id: 'custom',
      name: 'Custom Test',
      description: 'Choose your own combination of languages and topics',
      languages: [],
      tags: [],
      icon: FileText,
      color: 'secondary',
      estimatedQuestions: 'Variable',
      difficulty: 'Customizable'
    }
  ];

  const AVAILABLE_LANGUAGES: LanguageOption[] = [
    { value: 'html', name: 'HTML', color: 'danger', category: 'Frontend' },
    { value: 'css', name: 'CSS', color: 'info', category: 'Frontend' },
    { value: 'javascript', name: 'JavaScript', color: 'warning', category: 'Frontend' },
    { value: 'typescript', name: 'TypeScript', color: 'dark', category: 'Frontend' },
    { value: 'react', name: 'React', color: 'primary', category: 'Frontend' },
    { value: 'reactNative', name: 'React Native', color: 'primary', category: 'Mobile' },
    { value: 'flutter', name: 'Flutter', color: 'info', category: 'Mobile' },
    { value: 'dart', name: 'Dart', color: 'info', category: 'Mobile' },
    { value: 'swift', name: 'Swift', color: 'warning', category: 'Mobile' },
    { value: 'swiftui', name: 'SwiftUI', color: 'warning', category: 'Mobile' },
    { value: 'express', name: 'Express.js', color: 'success', category: 'Backend' },
    { value: 'python', name: 'Python', color: 'success', category: 'Backend' },
    { value: 'sql', name: 'SQL', color: 'warning', category: 'Database' },
    { value: 'json', name: 'JSON', color: 'light', category: 'Data' }
  ];

  const AVAILABLE_TAGS: TagOption[] = [
    // Frontend Core
    { value: 'html', name: 'HTML', category: 'Frontend Core', color: 'danger' },
    { value: 'css', name: 'CSS', category: 'Frontend Core', color: 'info' },
    { value: 'javascript', name: 'JavaScript', category: 'Frontend Core', color: 'warning' },
    { value: 'dom', name: 'DOM Manipulation', category: 'Frontend Core', color: 'warning' },
    { value: 'events', name: 'Event Handling', category: 'Frontend Core', color: 'warning' },

    // CSS Advanced
    { value: 'flexbox', name: 'Flexbox', category: 'CSS Advanced', color: 'info' },
    { value: 'grid', name: 'CSS Grid', category: 'CSS Advanced', color: 'info' },
    { value: 'responsive-design', name: 'Responsive Design', category: 'CSS Advanced', color: 'info' },

    // JavaScript Advanced
    { value: 'async-programming', name: 'Async Programming', category: 'JavaScript Advanced', color: 'warning' },
    { value: 'promises', name: 'Promises', category: 'JavaScript Advanced', color: 'warning' },
    { value: 'async-await', name: 'Async/Await', category: 'JavaScript Advanced', color: 'warning' },
    { value: 'es6', name: 'ES6+', category: 'JavaScript Advanced', color: 'warning' },
    { value: 'closures', name: 'Closures', category: 'JavaScript Advanced', color: 'warning' },

    // React
    { value: 'react', name: 'React', category: 'React', color: 'primary' },
    { value: 'components', name: 'Components', category: 'React', color: 'primary' },
    { value: 'hooks', name: 'Hooks', category: 'React', color: 'primary' },
    { value: 'state-management', name: 'State Management', category: 'React', color: 'primary' },
    { value: 'props', name: 'Props', category: 'React', color: 'primary' },
    { value: 'jsx', name: 'JSX', category: 'React', color: 'primary' },
    { value: 'context-api', name: 'Context API', category: 'React', color: 'primary' },
    { value: 'react-router', name: 'React Router', category: 'React', color: 'primary' },

    // Mobile
    { value: 'react-native', name: 'React Native', category: 'Mobile', color: 'primary' },
    { value: 'flutter', name: 'Flutter', category: 'Mobile', color: 'info' },
    { value: 'mobile-development', name: 'Mobile Development', category: 'Mobile', color: 'warning' },
    { value: 'native-components', name: 'Native Components', category: 'Mobile', color: 'primary' },
    { value: 'navigation', name: 'Navigation', category: 'Mobile', color: 'info' },

    // Backend
    { value: 'express', name: 'Express.js', category: 'Backend', color: 'success' },
    { value: 'nodejs', name: 'Node.js', category: 'Backend', color: 'success' },
    { value: 'rest-api', name: 'REST API', category: 'Backend', color: 'success' },
    { value: 'middleware', name: 'Middleware', category: 'Backend', color: 'success' },
    { value: 'routing', name: 'Routing', category: 'Backend', color: 'success' },
    { value: 'authentication', name: 'Authentication', category: 'Backend', color: 'success' },

    // Python
    { value: 'python', name: 'Python', category: 'Python', color: 'success' },
    { value: 'functions', name: 'Functions', category: 'Python', color: 'success' },
    { value: 'classes', name: 'Classes', category: 'Python', color: 'success' },
    { value: 'modules', name: 'Modules', category: 'Python', color: 'success' },

    // General Programming
    { value: 'algorithms', name: 'Algorithms', category: 'General Programming', color: 'secondary' },
    { value: 'data-structures', name: 'Data Structures', category: 'General Programming', color: 'secondary' },
    { value: 'testing', name: 'Testing', category: 'General Programming', color: 'secondary' },
    { value: 'error-handling', name: 'Error Handling', category: 'General Programming', color: 'secondary' }
  ];

  // Auto-detect template based on current selections (but don't auto-apply)
  useEffect(() => {
    if (!selectedTemplate && testData.languages?.length > 0) {
      const matchingTemplate = TEST_TEMPLATES.find(template =>
        template.languages.length === testData.languages?.length &&
        template.languages.every(lang => testData.languages?.includes(lang)) &&
        template.tags.length === testData.tags?.length &&
        template.tags.every(tag => testData.tags?.includes(tag))
      );

      if (matchingTemplate) {
        setSelectedTemplate(matchingTemplate.id);
      }
    }
  }, [testData.languages, testData.tags, selectedTemplate]);

  const handleTemplateSelect = (template: TestTemplate): void => {
    setSelectedTemplate(template.id);
    setShowCustomSelection(template.id === 'custom');

    if (template.id !== 'custom') {
      setTestData({
        ...testData,
        testType: template.id,
        languages: template.languages,
        tags: template.tags
      });
    } else {
      setTestData({
        ...testData,
        testType: 'custom',
        languages: [],
        tags: []
      });
    }
  };

  const handleLanguageToggle = (language: Language): void => {
    const newLanguages = testData.languages?.includes(language)
      ? testData.languages.filter(l => l !== language)
      : [...(testData.languages || []), language];

    setTestData({
      ...testData,
      languages: newLanguages
    });
  };

  const handleTagToggle = (tag: Tags): void => {
    const newTags = testData.tags?.includes(tag)
      ? testData.tags.filter(t => t !== tag)
      : [...(testData.tags || []), tag];

    setTestData({
      ...testData,
      tags: newTags
    });
  };

  // Helper function that doesn't set errors - for disabled state
  const isStepValid = (): boolean => {
    return !!(testData.title?.trim() &&
             testData.description?.trim() &&
             testData.languages?.length > 0);
  };

  // Keep the existing validateStep for onClick validation
  const validateStep = (): boolean => {

    if (!testData.title?.trim()) {
      setError?.('Test title is required');
      return false;
    }

    if (!testData.description?.trim()) {
      setError?.('Test description is required');
      return false;
    }

    if (!testData.languages?.length) {
      setError?.('Please select at least one programming language');
      return false;
    }
    setError?.(null);
    return true;
  };

  const handleNext = (): void => {
    if (validateStep()) {
      onNext?.();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTestData({ ...testData, title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setTestData({ ...testData, description: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setTestData({ ...testData, status: e.target.value as TestStatus });
  };

  const resetToTemplate = (): void => {
    setShowCustomSelection(false);
    const template = TEST_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      setTestData({
        ...testData,
        languages: template.languages,
        tags: template.tags
      });
    }
  };

  // Group languages and tags by category
  const groupedLanguages: GroupedOptions<LanguageOption> = AVAILABLE_LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.category]) acc[lang.category] = [];
    acc[lang.category].push(lang);
    return acc;
  }, {} as GroupedOptions<LanguageOption>);

  const groupedTags: GroupedOptions<TagOption> = AVAILABLE_TAGS.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as GroupedOptions<TagOption>);

  return (
    <div>
      {/* Basic Information */}
      <div className="card p-6 mb-4">
        <h6 className="flex items-center gap-2 mb-4 text-[#f5f5f4] font-semibold">
          <FileText size={20} className="text-blue-500" />
          Basic Information
        </h6>

        <div className="mb-4">
          <label htmlFor="testTitle" className="block text-sm font-semibold text-[#f5f5f4] mb-2">
            Test Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="testTitle"
            className="input w-full"
            value={testData.title || ''}
            onChange={handleTitleChange}
            placeholder="e.g., Frontend Developer Assessment"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label htmlFor="testDescription" className="block text-sm font-semibold text-[#f5f5f4] mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="testDescription"
              rows={3}
              className="input w-full resize-none"
              value={testData.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Describe what this test covers and what skills it evaluates..."
            />
          </div>
          <div>
            <label htmlFor="testStatus" className="block text-sm font-semibold text-[#f5f5f4] mb-2">
              Initial Status
            </label>
            <select
              id="testStatus"
              className="select w-full"
              value={testData.status || 'draft'}
              onChange={handleStatusChange}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
            <small className="text-[#6b6b70] mt-1 block">
              {testData.status === 'draft'
                ? 'Test will be saved but not visible to students'
                : 'Test will be immediately available to students'
              }
            </small>
          </div>
        </div>

        {/* Auto Test Scope Display */}
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isGlobalTest ? 'bg-blue-500/10 border border-blue-500/25' : 'bg-[#1a1a1e] border border-[#2a2a2e]'}`}>
          {isGlobalTest ? (
            <Globe size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          ) : (
            <Building size={20} className="text-[#6b6b70] mt-0.5 flex-shrink-0" />
          )}
          <div>
            <strong className="text-[#f5f5f4]">Test Scope: {testScopeText}</strong>
            <div className="text-sm text-[#6b6b70] mt-1">
              {isGlobalTest ? (
                <>
                  As a member of {user?.organization?.name}, your tests are automatically made available to all organizations and students globally.
                </>
              ) : (
                <>
                  This test will only be available to members of {user?.organization?.name}.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Templates */}
      <div className="card p-6 mb-4">
        <h6 className="flex items-center gap-2 mb-3 text-[#f5f5f4] font-semibold">
          <Target size={20} className="text-blue-500" />
          Choose a Template
        </h6>
        <p className="text-[#6b6b70] mb-4">
          Select a pre-configured template or create a custom test. Templates automatically configure languages and topics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEST_TEMPLATES.map((template) => {
            const IconComponent = template.icon;
            const isSelected = selectedTemplate === template.id;

            return (
              <div
                key={template.id}
                className={`card p-4 cursor-pointer transition-all border-2 ${getTemplateStyles(template.color, isSelected)}`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="text-center">
                  <div className="mb-3">
                    <IconComponent
                      size={32}
                      className={getIconColorClass(template.color, isSelected)}
                    />
                  </div>
                  <h6 className="mb-2 text-[#f5f5f4] font-semibold">{template.name}</h6>
                  <p className="text-[#6b6b70] text-sm mb-3">{template.description}</p>

                  {/* Template Stats */}
                  <div className="mb-3 text-sm">
                    <div className="flex justify-between text-[#6b6b70] mb-1">
                      <span>Questions:</span>
                      <span>{template.estimatedQuestions}</span>
                    </div>
                    <div className="flex justify-between text-[#6b6b70]">
                      <span>Level:</span>
                      <span>{template.difficulty}</span>
                    </div>
                  </div>

                  {template.languages.length > 0 && (
                    <div className="mb-3 flex flex-wrap justify-center gap-1">
                      {template.languages.slice(0, 3).map(lang => {
                        const langInfo = AVAILABLE_LANGUAGES.find(l => l.value === lang);
                        return langInfo ? (
                          <span key={lang} className={`px-2 py-0.5 rounded text-xs ${getBadgeClass(langInfo.color)}`}>
                            {langInfo.name}
                          </span>
                        ) : null;
                      })}
                      {template.languages.length > 3 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-[#2a2a2e] text-[#a1a1aa]">
                          +{template.languages.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {isSelected && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getBadgeClass(template.color)}`}>
                        <CheckCircle size={12} />
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedTemplate && selectedTemplate !== 'custom' && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <strong className="text-blue-400">Template Applied:</strong>{' '}
                <span className="text-[#f5f5f4]">{TEST_TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
                <div className="mt-1 text-sm text-[#a1a1aa]">
                  Languages and topics have been automatically selected. You can customize them below.
                </div>
              </div>
              <button
                className="btn-secondary text-sm"
                onClick={() => setShowCustomSelection(true)}
              >
                Customize
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Selection or Template Customization */}
      {(showCustomSelection || selectedTemplate === 'custom' || (selectedTemplate && testData.languages?.length > 0)) && (
        <div className="card p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h6 className="flex items-center gap-2 text-[#f5f5f4] font-semibold">
              <Code size={20} className="text-blue-500" />
              Programming Languages
            </h6>
            {showCustomSelection && selectedTemplate !== 'custom' && (
              <button
                className="btn-ghost text-sm flex items-center gap-1"
                onClick={resetToTemplate}
              >
                <X size={14} />
                Reset to Template
              </button>
            )}
          </div>

          <p className="text-[#6b6b70] mb-4">Select the programming languages for your test:</p>

          {Object.entries(groupedLanguages).map(([category, languages]) => (
            <div key={category} className="mb-4">
              <label className="block text-sm font-semibold text-[#f5f5f4] mb-2">{category}</label>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <label key={lang.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={testData.languages?.includes(lang.value) || false}
                      onChange={() => handleLanguageToggle(lang.value)}
                    />
                    <span className={`px-2 py-0.5 rounded text-xs ${getBadgeClass(lang.color)}`}>
                      {lang.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {testData.languages?.length > 0 && (
            <div className="pt-4 border-t border-[#2a2a2e]">
              <strong className="text-[#f5f5f4]">Selected Languages ({testData.languages.length}):</strong>
              <div className="mt-2 flex flex-wrap gap-2">
                {testData.languages.map(lang => {
                  const langInfo = AVAILABLE_LANGUAGES.find(l => l.value === lang);
                  return langInfo ? (
                    <span key={lang} className={`px-2 py-1 rounded text-xs ${getBadgeClass(langInfo.color)}`}>
                      {langInfo.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topics/Tags Selection */}
      {(showCustomSelection || selectedTemplate === 'custom' || (selectedTemplate && testData.tags?.length > 0)) && (
        <div className="card p-6 mb-4">
          <h6 className="flex items-center gap-2 mb-3 text-[#f5f5f4] font-semibold">
            <Target size={20} className="text-blue-500" />
            Topics & Skills
          </h6>

          <p className="text-[#6b6b70] mb-4">
            Select the specific topics and skills to assess. These help categorize questions and provide better filtering.
          </p>

          {Object.entries(groupedTags).map(([category, tags]) => (
            <div key={category} className="mb-4">
              <label className="block text-sm font-semibold text-[#f5f5f4] mb-2">{category}</label>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <label key={tag.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={testData.tags?.includes(tag.value) || false}
                      onChange={() => handleTagToggle(tag.value)}
                    />
                    <span className={`px-2 py-0.5 rounded text-xs ${getBadgeClass(tag.color)}`}>
                      {tag.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {testData.tags?.length > 0 && (
            <div className="pt-4 border-t border-[#2a2a2e]">
              <strong className="text-[#f5f5f4]">Selected Topics ({testData.tags.length}):</strong>
              <div className="mt-2 flex flex-wrap gap-2">
                {testData.tags.slice(0, 10).map(tag => {
                  const tagInfo = AVAILABLE_TAGS.find(t => t.value === tag);
                  return tagInfo ? (
                    <span key={tag} className={`px-2 py-1 rounded text-xs ${getBadgeClass(tagInfo.color)}`}>
                      {tagInfo.name}
                    </span>
                  ) : null;
                })}
                {testData.tags.length > 10 && (
                  <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                    +{testData.tags.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Card */}
      {(testData.languages?.length > 0 || testData.tags?.length > 0) && (
        <div className="card p-6 mb-4 bg-[#1a1a1e]">
          <h6 className="flex items-center gap-2 mb-4 text-[#f5f5f4] font-semibold">
            <Eye size={20} className="text-blue-500" />
            Test Configuration Summary
          </h6>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <strong className="text-[#f5f5f4]">Template:</strong>{' '}
                <span className="text-[#a1a1aa]">{TEST_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Custom'}</span>
              </div>
              <div className="mb-2">
                <strong className="text-[#f5f5f4]">Languages:</strong>{' '}
                <span className="text-[#a1a1aa]">{testData.languages?.length || 0} selected</span>
              </div>
              <div className="mb-2">
                <strong className="text-[#f5f5f4]">Topics:</strong>{' '}
                <span className="text-[#a1a1aa]">{testData.tags?.length || 0} selected</span>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <strong className="text-[#f5f5f4]">Scope:</strong>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${isGlobalTest ? 'badge-blue' : 'badge-gray'}`}>
                  {isGlobalTest ? "Global" : "Organization"}
                </span>
              </div>
              <div className="mb-2">
                <strong className="text-[#f5f5f4]">Status:</strong>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${testData.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                  {testData.status || 'draft'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          Next: Test Structure
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default TestBasics;
