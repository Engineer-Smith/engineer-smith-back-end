import { useState, type FormEvent, type ChangeEvent } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  loading: boolean;
  onSubmit: (loginCredential: string, password: string) => Promise<void>;
  onClearError: () => void;
}

const LoginForm = ({ loading, onSubmit, onClearError }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    loginCredential: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear auth errors when user starts typing
    onClearError();
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.loginCredential.trim()) {
      errors.loginCredential = 'Username or email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData.loginCredential, formData.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Login Credential Field */}
      <div>
        <label htmlFor="loginCredential" className="block text-sm font-medium text-[#f5f5f4] mb-2">
          Username or Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="w-5 h-5 text-[#6b6b70]" />
          </div>
          <input
            type="text"
            name="loginCredential"
            id="loginCredential"
            placeholder="Enter your username or email"
            value={formData.loginCredential}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="username"
            className={`input pl-10 ${formErrors.loginCredential ? 'input-error' : ''}`}
          />
        </div>
        {formErrors.loginCredential && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.loginCredential}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#f5f5f4] mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-[#6b6b70]" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="current-password"
            className={`input pl-10 pr-12 ${formErrors.password ? 'input-error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6b6b70] hover:text-[#a1a1aa] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {formErrors.password && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="spinner" />
            Signing In...
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
