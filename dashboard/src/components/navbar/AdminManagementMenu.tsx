// src/components/navbar/AdminManagementMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Users,
  HelpCircle,
  ClipboardList,
  Monitor,
  BarChart3,
  Building,
  Globe,
  Activity,
  Crown,
  ChevronDown
} from 'lucide-react';

interface AdminManagementMenuProps {
  onNavigate: (path: string) => void;
  isSuperOrgAdmin: boolean;
}

const AdminManagementMenu: React.FC<AdminManagementMenuProps> = ({
  onNavigate,
  isSuperOrgAdmin
}) => {
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

  const handleItemClick = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-[#a1a1aa] hover:text-[#f5f5f4] transition-colors rounded hover:bg-[#1a1a1e]"
      >
        <Settings size={18} />
        <span className="text-sm">Manage</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-[#141416] border border-[#2a2a2e] rounded-lg shadow-xl z-50">
          {/* Standard Admin Items */}
          <div className="py-1">
            <button
              onClick={() => handleItemClick('/admin/users')}
              className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
            >
              <Users size={16} />
              Users
            </button>
            <button
              onClick={() => handleItemClick('/admin/question-bank')}
              className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
            >
              <HelpCircle size={16} />
              Questions
            </button>
            <button
              onClick={() => handleItemClick('/admin/tests')}
              className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
            >
              <ClipboardList size={16} />
              Tests
            </button>
            <button
              onClick={() => handleItemClick('/admin/test-sessions')}
              className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
            >
              <Monitor size={16} />
              Test Sessions
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-[#2a2a2e]"></div>

          {/* Analytics */}
          <div className="py-1">
            <button
              onClick={() => handleItemClick('/admin/analytics')}
              className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
            >
              <BarChart3 size={16} />
              Analytics
            </button>
          </div>

          {/* Super Admin Only Items */}
          {isSuperOrgAdmin && (
            <>
              <div className="border-t border-[#2a2a2e]"></div>

              {/* Super Admin Header */}
              <div className="px-3 py-2">
                <span className="text-blue-400 text-xs font-semibold flex items-center gap-1">
                  <Crown size={12} />
                  Super Admin
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => handleItemClick('/admin/organizations')}
                  className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
                >
                  <Building size={16} />
                  Organizations
                </button>
                <button
                  onClick={() => handleItemClick('/admin/global-content')}
                  className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
                >
                  <Globe size={16} />
                  Global Content
                </button>
                <button
                  onClick={() => handleItemClick('/admin/system-health')}
                  className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1a1a1e] transition-colors flex items-center gap-2"
                >
                  <Activity size={16} />
                  System Health
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminManagementMenu;
