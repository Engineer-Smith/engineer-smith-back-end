import React from 'react';
import type { DifficultyLevel } from '../../../types/codeChallenge';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  size = 'md',
  className = ''
}) => {
  const getColorClasses = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-1.5 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  const getLabel = () => {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'medium':
        return 'Medium';
      case 'hard':
        return 'Hard';
      default:
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center rounded border font-medium
        ${getColorClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {getLabel()}
    </span>
  );
};

export default DifficultyBadge;
