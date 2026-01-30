import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface TrackFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const languages: { value: string; label: string }[] = [
  { value: 'all', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'dart', label: 'Dart' }
];

const difficulties: { value: string; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'easy', label: 'Beginner' },
  { value: 'medium', label: 'Intermediate' },
  { value: 'hard', label: 'Advanced' }
];

const categories: { value: string; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'data-structures', label: 'Data Structures' },
  { value: 'algorithms', label: 'Algorithms' },
  { value: 'dynamic-programming', label: 'Dynamic Programming' },
  { value: 'arrays', label: 'Arrays' },
  { value: 'strings', label: 'Strings' },
  { value: 'trees', label: 'Trees' },
  { value: 'graphs', label: 'Graphs' },
  { value: 'sorting-searching', label: 'Sorting & Searching' },
  { value: 'interview-prep', label: 'Interview Prep' }
];

const TrackFilters: React.FC<TrackFiltersProps> = ({
  searchTerm,
  onSearchChange,
  language,
  onLanguageChange,
  difficulty,
  onDifficultyChange,
  category,
  onCategoryChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="card mb-6">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Language Filter */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="select"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="select"
          >
            {difficulties.map((diff) => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="select"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2a2a2e]">
            <Filter className="w-4 h-4 text-[#6b6b70]" />
            <span className="text-sm text-[#6b6b70]">Active filters:</span>

            {searchTerm && (
              <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded flex items-center gap-1">
                "{searchTerm}"
                <button onClick={() => onSearchChange('')} className="hover:text-blue-300">
                  <X size={12} />
                </button>
              </span>
            )}
            {language !== 'all' && (
              <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 rounded flex items-center gap-1">
                {languages.find(l => l.value === language)?.label}
                <button onClick={() => onLanguageChange('all')} className="hover:text-yellow-300">
                  <X size={12} />
                </button>
              </span>
            )}
            {difficulty !== 'all' && (
              <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded flex items-center gap-1">
                {difficulties.find(d => d.value === difficulty)?.label}
                <button onClick={() => onDifficultyChange('all')} className="hover:text-green-300">
                  <X size={12} />
                </button>
              </span>
            )}
            {category !== 'all' && (
              <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 rounded flex items-center gap-1">
                {categories.find(c => c.value === category)?.label}
                <button onClick={() => onCategoryChange('all')} className="hover:text-purple-300">
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              onClick={onClearFilters}
              className="ml-auto text-sm text-[#a1a1aa] hover:text-[#f5f5f4] transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackFilters;
