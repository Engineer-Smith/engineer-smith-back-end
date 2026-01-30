// src/components/admin/dashboard/DashboardHeader.tsx
import React from 'react';
import { Globe } from 'lucide-react';
import type { User } from '../../../types';

interface DashboardHeaderProps {
  user: User;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => (
  <div className="bg-[#141416] border-b border-[#2a2a2e]">
    <div className="container-section">
      <div className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold">EngineerSmith Admin</h1>
            {user.organization?.isSuperOrg && (
              <span className="badge-blue flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Super Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="bg-blue-500 rounded-full flex items-center justify-center"
              style={{ width: '32px', height: '32px' }}
            >
              <span className="text-white text-sm font-bold">
                {user.loginId?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[#f5f5f4] mb-0">
                {user.loginId || 'Admin User'}
              </p>
              <small className="text-[#6b6b70]">{user.organization?.name}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardHeader;
