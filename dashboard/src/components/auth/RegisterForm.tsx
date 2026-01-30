import { useState, type FormEvent, type ChangeEvent } from 'react';
import { User, Lock, Mail, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Ticket } from 'lucide-react';

interface RegisterFormProps {
  loading: boolean;
  onSubmit: (username: string, firstName: string, lastName: string, email?: string, password?: string, inviteCode?: string, role?: string) => Promise<void>;
  onValidateInviteCode: (inviteCode: string) => Promise<{ valid: boolean; organizationName?: string }>;
  onClearError: () => void;
}

const RegisterForm = ({
  loading,
  onSubmit,
  onValidateInviteCode,
  onClearError
}: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    role: 'student' as 'student' | 'instructor' | 'admin'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [inviteValidation, setInviteValidation] = useState<{
    valid: boolean;
    organizationName?: string;
    loading: boolean;
  }>({ valid: false, loading: false });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }

    // Email validation (optional)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Invite code validation (if provided)
    if (formData.inviteCode && !inviteValidation.valid) {
      errors.inviteCode = 'Please validate the invite code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleValidateInvite = async () => {
    if (!formData.inviteCode.trim()) {
      setFormErrors(prev => ({ ...prev, inviteCode: 'Please enter an invite code' }));
      return;
    }

    setInviteValidation({ valid: false, loading: true });

    try {
      const result = await onValidateInviteCode(formData.inviteCode);
      setInviteValidation({
        valid: result.valid,
        organizationName: result.organizationName,
        loading: false
      });

      if (!result.valid) {
        setFormErrors(prev => ({ ...prev, inviteCode: 'Invalid invite code' }));
      } else {
        setFormErrors(prev => ({ ...prev, inviteCode: '' }));
      }
    } catch {
      setInviteValidation({ valid: false, loading: false });
      setFormErrors(prev => ({ ...prev, inviteCode: 'Failed to validate invite code' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(
        formData.username,
        formData.firstName,
        formData.lastName,
        formData.email || undefined,
        formData.password,
        formData.inviteCode || undefined,
        formData.role
      );
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) score += 12.5;

    if (score < 25) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score < 50) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score < 75) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-[#f5f5f4] mb-2">
          Username <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="w-5 h-5 text-[#6b6b70]" />
          </div>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Choose a unique username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="username"
            className={`input pl-10 ${formErrors.username ? 'input-error' : ''}`}
          />
        </div>
        {formErrors.username ? (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.username}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[#6b6b70]">
            Letters, numbers, underscores, and hyphens only
          </p>
        )}
      </div>

      {/* First Name & Last Name - Side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-[#f5f5f4] mb-2">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="given-name"
            className={`input ${formErrors.firstName ? 'input-error' : ''}`}
          />
          {formErrors.firstName && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formErrors.firstName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-[#f5f5f4] mb-2">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="family-name"
            className={`input ${formErrors.lastName ? 'input-error' : ''}`}
          />
          {formErrors.lastName && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formErrors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Email Field (Optional) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#f5f5f4] mb-2">
          Email Address <span className="text-[#6b6b70] text-xs font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="w-5 h-5 text-[#6b6b70]" />
          </div>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="email"
            className={`input pl-10 ${formErrors.email ? 'input-error' : ''}`}
          />
        </div>
        {formErrors.email ? (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.email}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[#6b6b70]">
            Optional - some environments may not have email access
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#f5f5f4] mb-2">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-[#6b6b70]" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            placeholder="Create a secure password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="new-password"
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

        {/* Password Strength Indicator */}
        {formData.password && passwordStrength && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#6b6b70]">Password Strength:</span>
              <span className={`text-xs font-medium ${
                passwordStrength.label === 'Strong' ? 'text-green-400' :
                passwordStrength.label === 'Good' ? 'text-blue-400' :
                passwordStrength.label === 'Fair' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="h-1 bg-[#1c1c1f] rounded-full overflow-hidden">
              <div
                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                style={{ width: `${passwordStrength.score}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#f5f5f4] mb-2">
          Confirm Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-[#6b6b70]" />
          </div>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="new-password"
            className={`input pl-10 ${formErrors.confirmPassword ? 'input-error' : ''}`}
          />
        </div>
        {formErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Invite Code (Optional) */}
      <div>
        <label htmlFor="inviteCode" className="block text-sm font-medium text-[#f5f5f4] mb-2">
          Organization Invite Code <span className="text-[#6b6b70] text-xs font-normal">(Optional)</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Ticket className="w-5 h-5 text-[#6b6b70]" />
            </div>
            <input
              type="text"
              name="inviteCode"
              id="inviteCode"
              placeholder="Enter invite code to join an organization"
              value={formData.inviteCode}
              onChange={handleInputChange}
              disabled={loading || inviteValidation.loading}
              className={`input pl-10 ${formErrors.inviteCode ? 'input-error' : ''}`}
            />
          </div>
          <button
            type="button"
            onClick={handleValidateInvite}
            disabled={!formData.inviteCode.trim() || loading || inviteValidation.loading}
            className="btn-secondary px-4"
          >
            {inviteValidation.loading ? (
              <div className="spinner w-4 h-4" />
            ) : (
              'Validate'
            )}
          </button>
        </div>

        {formErrors.inviteCode && (
          <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.inviteCode}
          </p>
        )}

        {inviteValidation.valid && inviteValidation.organizationName && (
          <p className="mt-1 text-sm text-green-400 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Valid! Joining: <strong>{inviteValidation.organizationName}</strong>
          </p>
        )}

        {!formErrors.inviteCode && !inviteValidation.valid && (
          <p className="mt-1 text-xs text-[#6b6b70]">
            Leave empty to access global assessments only
          </p>
        )}
      </div>

      {/* Role Selection (when invite code is valid) */}
      {inviteValidation.valid && (
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[#f5f5f4] mb-2">
            Role
          </label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleInputChange}
            disabled={loading}
            className="select"
          >
            <option value="student">Student - Take assessments and view results</option>
            <option value="instructor">Instructor - Create content and view analytics</option>
            <option value="admin">Admin - Full organizational management</option>
          </select>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-6"
      >
        {loading ? (
          <>
            <div className="spinner" />
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            Create Account
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
