// src/components/admin/dashboard/StatsSection.tsx
import React from 'react';
import { Users, BookOpen, FileText, Monitor } from 'lucide-react';
import StatCard from './StatCard';
import type { User, DashboardStats } from '../../../types';

interface StatsSectionProps {
  user: User;
  stats: DashboardStats;
  onNavigate: (path: string) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({ user, stats, onNavigate }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div onClick={() => onNavigate('/admin/users')} className="cursor-pointer">
      <StatCard
        title="Total Users"
        value={stats.totalUsers || 0}
        subtitle={user.organization?.isSuperOrg ? `${stats.independentStudents || 0} independent students` : undefined}
        icon={Users}
        color="primary"
      />
    </div>
    <div onClick={() => onNavigate('/admin/question-bank')} className="cursor-pointer">
      <StatCard
        title="Question Bank"
        value={stats.totalQuestions || 0}
        subtitle={
          user.organization?.isSuperOrg
            ? `Global questions available`
            : `Available to your organization`
        }
        icon={BookOpen}
        color="success"
      />
    </div>
    <div onClick={() => onNavigate('/admin/tests')} className="cursor-pointer">
      <StatCard
        title="Active Tests"
        value={stats.activeTests || 0}
        subtitle={`${stats.totalTests || 0} total tests`}
        icon={FileText}
        color="info"
      />
    </div>
    <div onClick={() => onNavigate('/admin/sessions/active')} className="cursor-pointer">
      <StatCard
        title="Active Sessions"
        value={stats.activeSessions || 0}
        subtitle="Users taking tests now"
        icon={Monitor}
        color="warning"
      />
    </div>
  </div>
);

export default StatsSection;
