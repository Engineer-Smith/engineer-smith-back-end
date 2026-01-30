// components/Dashboard/StatsCards.tsx
import React from 'react';
import { ClipboardList, CheckCircle, Trophy, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalTests: number;
    completedTests: number;
    passedTests: number;
    averageScore: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statItems = [
    {
      value: stats.totalTests,
      label: 'Available Tests',
      icon: ClipboardList,
      bgClass: 'bg-gradient-to-br from-purple-500 to-indigo-600'
    },
    {
      value: stats.completedTests,
      label: 'Completed',
      icon: CheckCircle,
      bgClass: 'bg-gradient-to-br from-cyan-500 to-blue-500'
    },
    {
      value: stats.passedTests,
      label: 'Passed',
      icon: Trophy,
      bgClass: 'bg-gradient-to-br from-amber-500 to-orange-500'
    },
    {
      value: stats.averageScore,
      label: 'Avg Score',
      icon: TrendingUp,
      bgClass: 'bg-gradient-to-br from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="card p-6 text-center">
            <div
              className={`mx-auto mb-3 p-3 rounded-full inline-flex items-center justify-center ${item.bgClass}`}
              style={{ width: '60px', height: '60px' }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-mono text-2xl font-bold mb-1">{item.value}</h4>
            <p className="text-[#6b6b70] text-sm mb-0">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
};
