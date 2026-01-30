// src/components/admin/dashboard/WelcomeSection.tsx
import React from 'react';
import type { User } from '../../../types';

interface WelcomeSectionProps {
  user: User;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user }) => (
  <div className="mb-6">
    <h2 className="font-mono text-2xl font-bold mb-2">
      Welcome back, <span className="text-amber-500">{user.loginId || 'Admin'}</span>!
    </h2>
    <p className="text-[#a1a1aa]">
      {user.organization?.isSuperOrg
        ? "Manage the entire EngineerSmith platform, including all organizations and independent students."
        : `Manage your ${user.organization?.name} organization and access global platform features.`
      }
    </p>
  </div>
);

export default WelcomeSection;
