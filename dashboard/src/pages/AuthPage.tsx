import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthHeader from '../components/auth/AuthHeader';
import AuthTabs from '../components/auth/AuthTabs';
import AuthForm from '../components/auth/AuthForm';
import AuthFooter from '../components/auth/AuthFooter';
import AuthFeatures from '../components/auth/AuthFeatures';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage = ({ mode }: AuthPageProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(mode);

  const {
    login,
    register,
    validateInviteCode,
    loading,
    error: authError,
    clearError,
    isAuthenticated
  } = useAuth();

  // Update tab when mode prop changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const handleTabChange = (tab: 'login' | 'register') => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    clearError();

    const newPath = tab === 'register' ? '/register' : '/login';
    navigate(newPath, { replace: true });
  };

  // Show loading spinner during initial auth check
  if (loading && !authError) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay" />

      {/* Gradient glows */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <AuthHeader />

            <AuthTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            <AuthForm
              mode={activeTab}
              authError={authError}
              isAuthenticated={isAuthenticated}
              loading={loading}
              onLogin={login}
              onRegister={register}
              onValidateInviteCode={validateInviteCode}
              onClearError={clearError}
            />

            <AuthFooter
              activeTab={activeTab}
              onTabChange={handleTabChange}
              loading={loading}
            />

            <AuthFeatures />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
