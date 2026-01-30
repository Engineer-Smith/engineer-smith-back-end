import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

interface TagsSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedLanguage?: string;
  selectedCategory?: string;
}

const TagsSelector: React.FC<TagsSelectorProps> = ({
  selectedTags,
  availableTags,
  onTagsChange,
  selectedLanguage,
  selectedCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tags based on language and category context
  const relevantTags = useMemo(() => {
    let filtered = [...availableTags];

    // Filter based on language
    if (selectedLanguage) {
      const languageRelevantTags = new Set([
        selectedLanguage,
        // Add language-specific tags
        ...(selectedLanguage === 'javascript' ? ['dom', 'events', 'async-programming', 'promises', 'async-await', 'es6', 'closures', 'scope', 'hoisting'] : []),
        ...(selectedLanguage === 'css' ? ['flexbox', 'grid', 'responsive-design'] : []),
        ...(selectedLanguage === 'html' ? ['dom', 'events'] : []),
        ...(selectedLanguage === 'react' ? ['components', 'hooks', 'state-management', 'props', 'context-api', 'redux', 'react-router', 'jsx', 'virtual-dom'] : []),
        ...(selectedLanguage === 'reactNative' ? ['native-components', 'navigation', 'mobile-development'] : []),
        ...(selectedLanguage === 'flutter' ? ['widgets', 'state-management-flutter', 'navigation-flutter', 'ui-components', 'mobile-development'] : []),
        ...(selectedLanguage === 'express' ? ['nodejs', 'rest-api', 'middleware', 'routing', 'authentication', 'authorization', 'jwt', 'express-middleware'] : []),
        ...(selectedLanguage === 'sql' ? ['queries', 'joins', 'indexes', 'transactions', 'database-design', 'normalization'] : []),
        ...(selectedLanguage === 'python' ? ['functions', 'classes', 'modules', 'list-comprehensions', 'decorators', 'generators', 'python-data-structures'] : []),
        ...(selectedLanguage === 'typescript' ? ['typescript'] : []),
        ...(selectedLanguage === 'dart' ? ['dart'] : []),
        // General programming tags
        'variables', 'arrays', 'objects', 'loops', 'conditionals', 'algorithms', 'data-structures', 'error-handling', 'testing'
      ]);

      filtered = filtered.filter(tag => languageRelevantTags.has(tag));
    }

    // Filter based on category
    if (selectedCategory) {
      if (selectedCategory === 'ui') {
        const uiTags = ['flexbox', 'grid', 'responsive-design', 'components', 'widgets', 'ui-components', 'native-components', 'virtual-dom'];
        filtered = filtered.filter(tag => uiTags.includes(tag) || !['algorithms', 'data-structures', 'queries', 'joins'].includes(tag));
      } else if (selectedCategory === 'logic') {
        const logicTags = ['algorithms', 'data-structures', 'functions', 'loops', 'conditionals', 'variables', 'arrays', 'objects'];
        filtered = [...new Set([...filtered.filter(tag => logicTags.includes(tag)), ...filtered])];
      } else if (selectedCategory === 'syntax') {
        const syntaxTags = ['variables', 'functions', 'classes', 'modules', 'error-handling', 'testing'];
        filtered = [...new Set([...filtered.filter(tag => syntaxTags.includes(tag)), ...filtered])];
      }
    }

    return filtered.sort();
  }, [availableTags, selectedLanguage, selectedCategory]);

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    if (!searchTerm) return relevantTags;
    return relevantTags.filter(tag =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [relevantTags, searchTerm]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tags-selector">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <small className="text-[#6b6b70] block mb-2">Selected Tags:</small>
          <div className="flex gap-2 flex-wrap">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="badge-blue flex items-center gap-1"
              >
                {tag}
                <X
                  size={12}
                  className="cursor-pointer hover:text-blue-200"
                  onClick={() => handleTagRemove(tag)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6b6b70]" />
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full pl-8"
        />
      </div>

      {/* Available Tags */}
      <div className="available-tags max-h-[200px] overflow-y-auto">
        <div className="flex gap-2 flex-wrap">
          {filteredTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-2.5 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white border-transparent'
                  : 'bg-transparent border border-[#3a3a3e] text-[#6b6b70] hover:border-[#5a5a5e]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[#6b6b70] text-sm mt-2">
        Tags help categorize your question and make it easier to find.
        {selectedLanguage && ` Showing tags relevant to ${selectedLanguage}.`}
      </p>
    </div>
  );
};

export default TagsSelector;
