interface AuthFooterProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
  loading: boolean;
}

const AuthFooter = ({ activeTab, onTabChange, loading }: AuthFooterProps) => {
  return (
    <div className="text-center mt-6">
      <p className="text-sm text-[#6b6b70]">
        {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => onTabChange(activeTab === 'login' ? 'register' : 'login')}
          disabled={loading}
          className="text-amber-500 hover:text-amber-400 font-medium transition-colors disabled:opacity-50"
        >
          {activeTab === 'login' ? 'Create one here' : 'Sign in here'}
        </button>
      </p>
    </div>
  );
};

export default AuthFooter;
