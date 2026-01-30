// src/components/admin/dashboard/StatCard.tsx
import React from 'react';
import type { DashboardStatCardProps } from '../../../types';

const colorMap: Record<string, { bg: string; text: string }> = {
  primary: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  success: { bg: 'bg-green-500/10', text: 'text-green-500' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  danger: { bg: 'bg-red-500/10', text: 'text-red-500' },
  info: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
  secondary: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
};

const StatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  className,
  ...props
}) => {
  const colors = colorMap[color] || colorMap.primary;

  return (
    <div className={`card p-4 h-full ${className || ''}`} {...props}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#6b6b70] text-sm mb-1">{title}</p>
          <h3 className="font-mono text-2xl font-bold mb-0">{value}</h3>
          {subtitle && <small className="text-[#6b6b70]">{subtitle}</small>}
        </div>
        <div className={`p-2 rounded ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
