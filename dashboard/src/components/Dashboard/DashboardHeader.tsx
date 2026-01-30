// components/Dashboard/DashboardHeader.tsx
import React from 'react';
import { LogOut, GraduationCap } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="font-mono text-2xl font-bold mb-1">
          Welcome back, <span className="text-amber-500">{user?.fullName || `${user?.firstName} ${user?.lastName}` || user?.loginId}</span>!
        </h1>
        {(user?.fullName || (user?.firstName && user?.lastName)) && (
          <p className="text-[#6b6b70] text-sm mb-1">@{user?.loginId}</p>
        )}
        <p className="text-[#a1a1aa] mb-0">
          Ready to take some assessments today?
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="badge-blue flex items-center gap-2 px-3 py-2">
          <GraduationCap className="w-4 h-4" />
          Student
        </span>
        <button className="btn-secondary flex items-center gap-2" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
