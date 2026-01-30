import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthFormProps {
  mode: 'login' | 'register';
  authError: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  onLogin: (loginCredential: string, password: string) => Promise<void>;
  onRegister: (username: string, firstName: string, lastName: string, email?: string, password?: string, inviteCode?: string, role?: string) => Promise<void>;
  onValidateInviteCode: (inviteCode: string) => Promise<{ valid: boolean; organizationName?: string }>;
  onClearError: () => void;
}

const AuthForm = ({
  mode,
  authError,
  isAuthenticated,
  loading,
  onLogin,
  onRegister,
  onValidateInviteCode,
  onClearError
}: AuthFormProps) => {
  return (
    <>
      {/* Global Error Alert */}
      {authError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 text-sm">{authError}</p>
          </div>
          <button
            onClick={onClearError}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success message for debugging */}
      {isAuthenticated && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-400 text-sm">
            Authentication successful! Redirecting...
          </p>
        </div>
      )}

      {/* Render appropriate form based on mode */}
      {mode === 'login' ? (
        <LoginForm
          loading={loading}
          onSubmit={onLogin}
          onClearError={onClearError}
        />
      ) : (
        <RegisterForm
          loading={loading}
          onSubmit={onRegister}
          onValidateInviteCode={onValidateInviteCode}
          onClearError={onClearError}
        />
      )}
    </>
  );
};

export default AuthForm;
