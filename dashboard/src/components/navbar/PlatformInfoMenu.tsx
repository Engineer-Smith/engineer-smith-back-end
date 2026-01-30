// src/components/navbar/PlatformInfoMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Info, ChevronDown, Settings, Code, Building, User, Home } from 'lucide-react';

interface PlatformInfoMenuProps {
  onNavigate: (path: string) => void;
}

const PlatformInfoMenu: React.FC<PlatformInfoMenuProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    onNavigate(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 px-3 py-2 text-[#a1a1aa] hover:text-[#f5f5f4] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Info size={16} />
        <span>Platform</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg shadow-lg z-50">
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#f5f5f4] hover:bg-[#2a2a2e] flex items-center gap-2 rounded-t-lg"
            onClick={() => handleNavigate('/features')}
          >
            <Settings size={14} />
            Features
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#f5f5f4] hover:bg-[#2a2a2e] flex items-center gap-2"
            onClick={() => handleNavigate('/languages')}
          >
            <Code size={14} />
            Languages
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#f5f5f4] hover:bg-[#2a2a2e] flex items-center gap-2"
            onClick={() => handleNavigate('/for-organizations')}
          >
            <Building size={14} />
            Organizations
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#f5f5f4] hover:bg-[#2a2a2e] flex items-center gap-2"
            onClick={() => handleNavigate('/for-individuals')}
          >
            <User size={14} />
            Individuals
          </button>
          <div className="border-t border-[#2a2a2e]" />
          <button
            className="w-full px-4 py-2 text-left text-sm text-[#f5f5f4] hover:bg-[#2a2a2e] flex items-center gap-2 rounded-b-lg"
            onClick={() => handleNavigate('/')}
          >
            <Home size={14} />
            Landing Page
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatformInfoMenu;
