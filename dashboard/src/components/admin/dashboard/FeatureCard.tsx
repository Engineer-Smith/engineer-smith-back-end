// src/components/admin/dashboard/FeatureCard.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { DashboardFeatureCardProps } from '../../../types';

const colorMap: Record<string, { bg: string; text: string }> = {
  primary: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  success: { bg: 'bg-green-500/10', text: 'text-green-500' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  danger: { bg: 'bg-red-500/10', text: 'text-red-500' },
  info: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
  secondary: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
};

const FeatureCard: React.FC<DashboardFeatureCardProps> = ({
  feature,
  onClick,
  className,
  ...props
}) => {
  const colors = colorMap[feature.color] || colorMap.primary;

  return (
    <div
      className={`card p-4 h-full cursor-pointer hover:border-[#3a3a3e] transition-colors flex flex-col ${className || ''}`}
      onClick={() => onClick(feature.path)}
      {...props}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-3 rounded ${colors.bg}`}>
          <feature.icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <ChevronRight className="w-5 h-5 text-[#6b6b70]" />
      </div>

      <div className="flex-grow">
        <h5 className="font-mono text-lg font-semibold mb-2">
          {feature.title}
        </h5>
        <p className="text-[#a1a1aa] text-sm mb-3">
          {feature.description}
        </p>
      </div>

      <div className="mt-auto">
        <small className="text-[#6b6b70] font-medium">{feature.stats}</small>
      </div>
    </div>
  );
};

export default FeatureCard;
