// src/components/navbar/QuickLoginForm.tsx
import React from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';

interface LoginData {
  loginId: string;
  password: string;
}

interface QuickLoginFormProps {
  loginData: LoginData;
  authLoading: boolean;
  authError: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogin: (e: React.FormEvent) => void;
  onNavigate: (path: string) => void;
  onClearError: () => void;
}

const QuickLoginForm: React.FC<QuickLoginFormProps> = ({
  loginData,
  authLoading,
  authError,
  onInputChange,
  onLogin,
  onNavigate,
  onClearError
}) => {
  return (
    <div className="w-full mt-3 transition-all duration-300 ease-in-out">
      {/* Error Message Row */}
      {authError && (
        <div className="mb-2">
          <div className="p-2 bg-red-500/10 border border-red-500/25 rounded-lg text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={14} />
              {authError}
            </div>
            <button
              className="text-red-400 hover:text-red-300 p-1"
              onClick={onClearError}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3">
          <label htmlFor="inline-login-id" className="block text-xs text-[#6b6b70] mb-1">
            Email or Username
          </label>
          <input
            type="text"
            name="loginId"
            id="inline-login-id"
            placeholder="Enter email or username"
            value={loginData.loginId}
            onChange={onInputChange}
            disabled={authLoading}
            className="input w-full text-sm py-1.5"
          />
        </div>
        <div className="md:col-span-3">
          <label htmlFor="inline-password" className="block text-xs text-[#6b6b70] mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="inline-password"
            placeholder="Enter password"
            value={loginData.password}
            onChange={onInputChange}
            disabled={authLoading}
            className="input w-full text-sm py-1.5"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onLogin(e as any);
              }
            }}
          />
        </div>
        <div className="md:col-span-2">
          <button
            className="btn-primary w-full text-sm py-1.5"
            disabled={authLoading || !loginData.loginId || !loginData.password}
            onClick={onLogin}
          >
            {authLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </div>
        <div className="md:col-span-4">
          <div className="flex gap-2">
            <button
              className="text-xs text-[#6b6b70] hover:text-[#f5f5f4] transition-colors p-1"
              onClick={() => onNavigate('/login')}
            >
              Full Login
            </button>
            <button
              className="text-xs text-[#6b6b70] hover:text-[#f5f5f4] transition-colors p-1"
              onClick={() => onNavigate('/register')}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLoginForm;
