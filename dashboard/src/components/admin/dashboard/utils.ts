// src/components/admin/dashboard/utils.ts
import { 
  Users, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Settings, 
  Activity, 
  Building, 
  Globe, 
  Monitor
} from 'lucide-react';
import type { User, DashboardFeature, DashboardStats } from '../../../types';

export const getDashboardFeatures = (
  user: User, 
  stats: DashboardStats | null
): DashboardFeature[] => {
  if (!user) return [];

  const isSuperOrgAdmin = user.organization?.isSuperOrg && user.role === 'admin';
  const isSuperOrgInstructor = user.organization?.isSuperOrg && user.role === 'instructor';
  
  const baseFeatures: DashboardFeature[] = [
    {
      title: "User Management",
      description: isSuperOrgAdmin 
        ? "Manage all users across organizations and independent students"
        : "View and manage users in your organization",
      path: "/admin/users",
      icon: Users,
      color: "primary",
      stats: stats ? `${stats.totalUsers} total users` : 'Loading...',
      access: ['admin', 'instructor']
    },
    {
      title: "Question Bank",
      description: isSuperOrgAdmin || isSuperOrgInstructor
        ? "Manage global and organization-specific questions"
        : "Review and manage your organization's questions",
      path: "/admin/question-bank",
      icon: BookOpen,
      color: "success",
      stats: stats ? `${stats.totalQuestions} questions` : 'Loading...',
      access: ['admin', 'instructor']
    },
    {
      title: "Manage Tests",
      description: isSuperOrgAdmin || isSuperOrgInstructor
        ? "Create global tests and manage all organization tests"
        : "Create and organize tests for your organization",
      path: "/admin/tests",
      icon: FileText,
      color: "info",
      stats: stats ? `${stats.activeTests} active tests` : 'Loading...',
      access: ['admin', 'instructor']
    },
    {
      title: "Test Sessions",
      description: "Monitor active test sessions and review results",
      path: "/admin/test-sessions",
      icon: Monitor,
      color: "warning",
      stats: stats ? `${stats.activeSessions} active sessions` : 'Loading...',
      access: ['admin', 'instructor']
    },
    {
      title: "Analytics",
      description: isSuperOrgAdmin
        ? "Platform-wide analytics and organization comparisons"
        : "Performance metrics for your organization",
      path: "/admin/analytics",
      icon: BarChart3,
      color: "secondary",
      stats: stats ? "View detailed reports" : 'Loading...',
      access: ['admin', 'instructor']
    }
  ];

  // Super org admin exclusive features
  if (isSuperOrgAdmin) {
    baseFeatures.push(
      {
        title: "Organization Management",
        description: "Create and manage organizations, invite codes, and permissions",
        path: "/admin/organizations",
        icon: Building,
        color: "danger",
        stats: stats ? `${stats.organizationsCount} organizations` : 'Loading...',
        access: ['admin']
      },
      {
        title: "Global Content",
        description: "Manage global questions and tests available to all users",
        path: "/admin/global-content",
        icon: Globe,
        color: "dark",
        stats: stats ? `${stats.globalQuestions} global questions` : 'Loading...',
        access: ['admin']
      }
    );
  }

  // Common features for admins and some for instructors
  if (user.role === 'admin') {
    baseFeatures.push(
      {
        title: "System Health",
        description: "Monitor server performance and system statistics",
        path: "/admin/system-health",
        icon: Activity,
        color: "success",
        stats: "Check status",
        access: ['admin']
      },
      {
        title: "Settings",
        description: isSuperOrgAdmin
          ? "Platform-wide configuration and permissions"
          : "Organization settings and preferences",
        path: "/admin/settings",
        icon: Settings,
        color: "secondary",
        stats: "Configuration",
        access: ['admin']
      }
    );
  }

  // Filter features based on user role
  return baseFeatures.filter(feature => feature.access.includes(user.role));
};

export const calculateStats = (
  users: any[], 
  questions: any[], 
  tests: any[], 
  sessions: any[],
  user: User
): DashboardStats => {
  const isSuperOrgAdmin = user.organization?.isSuperOrg && user.role === 'admin';
  
  const independentStudents = isSuperOrgAdmin 
    ? users.filter((u: any) => u.role === 'student').length 
    : 0;
  const orgAffiliatedUsers = isSuperOrgAdmin 
    ? users.filter((u: any) => u.organizationId !== user.organizationId).length 
    : users.length;
  const globalQuestions = questions.filter((q: any) => q.isGlobal).length;
  const orgSpecificQuestions = questions.filter((q: any) => !q.isGlobal).length;
  const activeSessions = sessions.filter((s: any) => s.status === 'inProgress').length;
  const completedSessions = sessions.filter((s: any) => s.status === 'completed').length; // FIX: Added this line
  const activeTests = tests.filter((t: any) => t.status === 'active').length;

  // Get organizations count if super admin
  let organizationsCount = 0;
  if (isSuperOrgAdmin) {
    organizationsCount = 2; // EngineerSmith + TestOrg (hardcoded for now)
  }

  return {
    totalUsers: users.length,
    independentStudents,
    orgAffiliatedUsers,
    globalQuestions,
    orgSpecificQuestions,
    totalQuestions: questions.length,
    activeTests,
    totalTests: tests.length,
    activeSessions,
    completedSessions, // FIX: Added this line
    organizationsCount,
  };
};