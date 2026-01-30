import React from 'react';

interface DifficultyOption {
  value: string;
  label: string;
  color: string;
}

interface DifficultySelectorProps {
  selectedDifficulty?: string;
  onDifficultyChange: (difficulty: string) => void;
  options: DifficultyOption[];
}

const getColorClass = (color: string, isSelected: boolean): string => {
  if (!isSelected) {
    return 'bg-transparent border border-[#3a3a3e] text-[#6b6b70] hover:border-[#5a5a5e]';
  }

  const colorMap: Record<string, string> = {
    success: 'bg-green-500 text-white border-transparent',
    warning: 'bg-amber-500 text-white border-transparent',
    danger: 'bg-red-500 text-white border-transparent',
    primary: 'bg-blue-500 text-white border-transparent',
    info: 'bg-cyan-500 text-white border-transparent',
    secondary: 'bg-[#3a3a3e] text-[#f5f5f4] border-transparent'
  };

  return colorMap[color] || colorMap.secondary;
};

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultyChange,
  options
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => {
        const isSelected = selectedDifficulty === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onDifficultyChange(option.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${getColorClass(option.color, isSelected)}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default DifficultySelector;
