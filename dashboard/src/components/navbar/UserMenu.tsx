// src/components/navbar/UserMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface UserData {
  _id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  loginId?: string;
  role?: string;
  organization?: {
    name?: string;
    isSuperOrg?: boolean;
  };
}

interface UserMenuProps {
  user: UserData | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserDisplayName = () => {
    if (user?.fullName) {
      return user.fullName;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.loginId || 'User';
  };

  const hasUserName = () => {
    return user?.fullName || (user?.firstName && user?.lastName);
  };

  const getRoleBadgeClass = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-red-500';
      case 'instructor':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const handleItemClick = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 text-[#a1a1aa] hover:text-[#f5f5f4] transition-colors rounded hover:bg-[#1a1a1e]"
      >
        <div className="text-right mr-1">
          <div className="font-medium text-sm leading-tight text-[#f5f5f4]">
            {getUserDisplayName()}
          </div>
          {hasUserName() && (
            <small className="text-[#6b6b70] text-xs">
              @{user?.loginId}
            </small>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`text-white text-xs font-bold uppercase px-1.5 py-0.5 rounded ${getRoleBadgeClass()}`}
            style={{ fontSize: '0.65rem' }}
          >
            {user?.role}
          </span>
          {user?.organization?.isSuperOrg && (
            <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded" style={{ fontSize: '0.6rem' }}>
              SUPER
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#141416] border border-[#2a2a2e] rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="px-3 py-2 border-b border-[#2a2a2e]">
            <div className="font-medium text-[#f5f5f4] text-sm">{getUserDisplayName()}</div>
            <small className="text-[#6b6b70]">@{user?.loginId}</small>
            <div className="mt-1">
              <small className="text-[#6b6b70] block">
                ID: {user?._id?.slice(0, 8)}...
              </small>
              <small className="text-[#6b6b70] block">
                Org: {user?.organization?.name}
              </small>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleItemClick('/profile')}
              className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => handleItemClick('/settings')}
              className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2a2a2e]"></div>

          {/* Logout */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
