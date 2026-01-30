import React from 'react';
import { CheckCircle, Circle, Lock, Play } from 'lucide-react';
import type { UserProgressStatus } from '../../../types/codeChallenge';

interface ProgressIndicatorProps {
  status: UserProgressStatus | 'locked' | 'unlocked' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'solved':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          label: 'Solved'
        };
      case 'attempted':
      case 'in-progress':
        return {
          icon: Play,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          label: 'In Progress'
        };
      case 'locked':
        return {
          icon: Lock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          label: 'Locked'
        };
      case 'not-started':
      case 'unlocked':
      default:
        return {
          icon: Circle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          label: 'Not Started'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const iconSize = getIconSize();

  if (showLabel) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className={`p-1 rounded ${config.bgColor}`}>
          <Icon size={iconSize} className={config.color} />
        </div>
        <span className={`text-sm ${config.color}`}>{config.label}</span>
      </div>
    );
  }

  return (
    <Icon
      size={iconSize}
      className={`${config.color} ${className}`}
    />
  );
};

export default ProgressIndicator;
