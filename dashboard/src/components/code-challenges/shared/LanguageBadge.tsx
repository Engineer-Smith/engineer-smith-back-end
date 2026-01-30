import React from 'react';
import type { ProgrammingLanguage } from '../../../types/codeChallenge';

interface LanguageBadgeProps {
  language: ProgrammingLanguage | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const LanguageBadge: React.FC<LanguageBadgeProps> = ({
  language,
  size = 'md',
  showIcon = false,
  className = ''
}) => {
  const getColorClasses = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'python':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'dart':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'swift':
      case 'swiftui':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
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

  const getIcon = () => {
    if (!showIcon) return null;

    switch (language.toLowerCase()) {
      case 'javascript':
        return <span className="mr-1">JS</span>;
      case 'python':
        return <span className="mr-1">PY</span>;
      case 'dart':
        return <span className="mr-1">DT</span>;
      case 'swift':
        return <span className="mr-1">SW</span>;
      case 'swiftui':
        return <span className="mr-1">UI</span>;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
        return 'JavaScript';
      case 'python':
        return 'Python';
      case 'dart':
        return 'Dart';
      case 'swift':
        return 'Swift';
      case 'swiftui':
        return 'SwiftUI';
      default:
        return language.charAt(0).toUpperCase() + language.slice(1);
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
      {getIcon()}
      {getLabel()}
    </span>
  );
};

export default LanguageBadge;
