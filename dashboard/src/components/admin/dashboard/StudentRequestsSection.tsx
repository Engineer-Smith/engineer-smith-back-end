// src/components/admin/dashboard/StudentRequestsSection.tsx
import React from 'react';
import { ClipboardCheck, UserCheck, Clock } from 'lucide-react';
import FeatureSection from './FeatureSection';
import type { DashboardFeature, DashboardStats } from '../../../types';
import type { NotificationType, Notification } from '../../../types/notifications';

interface StudentRequestsSectionProps {
  stats: DashboardStats;
  notifications: Notification[];
  onNavigate: (path: string) => void;
}

const StudentRequestsSection: React.FC<StudentRequestsSectionProps> = ({
  notifications,
  onNavigate
}) => {
  // Helper function to count pending requests from notifications
  const getPendingRequestCount = (): number => {
    return notifications.filter(n =>
      n.type === ('attempt_request_pending_review' as NotificationType) && !n.isRead
    ).length;
  };

  const pendingCount = getPendingRequestCount();

  const studentRequestFeatures: DashboardFeature[] = [
    {
      title: 'Pending Requests',
      description: 'Review student requests for additional test attempts',
      path: '/admin/attempt-requests',
      icon: ClipboardCheck,
      color: 'warning',
      stats: `${pendingCount} requests pending`,
      access: ['admin', 'instructor']
    },
    {
      title: 'Grant Attempts',
      description: 'Directly grant additional attempts to students',
      path: '/admin/grant-attempts',
      icon: UserCheck,
      color: 'info',
      stats: 'Direct approval tool',
      access: ['admin', 'instructor']
    },
    {
      title: 'Request History',
      description: 'View all attempt requests and approval history',
      path: '/admin/attempt-history',
      icon: Clock,
      color: 'secondary',
      stats: 'Complete audit trail',
      access: ['admin', 'instructor']
    }
  ];

  const badge = pendingCount > 0 ? (
    <span className="badge-amber ml-2">
      {pendingCount} pending
    </span>
  ) : undefined;

  return (
    <FeatureSection
      title="Student Requests & Approvals"
      subtitle="Manage student attempt requests and grant additional test attempts"
      features={studentRequestFeatures}
      onNavigate={onNavigate}
      sectionKey="requests"
      badge={badge}
    />
  );
};

export default StudentRequestsSection;
