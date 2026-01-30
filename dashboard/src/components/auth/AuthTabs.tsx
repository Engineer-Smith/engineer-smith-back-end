import { LogIn, UserPlus } from 'lucide-react';

interface AuthTabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

const AuthTabs = ({ activeTab, onTabChange }: AuthTabsProps) => {
  return (
    <div className="flex border-b border-[#2a2a2e] mb-6">
      <button
        onClick={() => onTabChange('login')}
        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all border-b-2 -mb-px ${
          activeTab === 'login'
            ? 'border-amber-500 text-amber-500'
            : 'border-transparent text-[#6b6b70] hover:text-[#a1a1aa]'
        }`}
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </button>
      <button
        onClick={() => onTabChange('register')}
        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all border-b-2 -mb-px ${
          activeTab === 'register'
            ? 'border-amber-500 text-amber-500'
            : 'border-transparent text-[#6b6b70] hover:text-[#a1a1aa]'
        }`}
      >
        <UserPlus className="w-4 h-4" />
        Create Account
      </button>
    </div>
  );
};

export default AuthTabs;
