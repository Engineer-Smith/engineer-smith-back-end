// src/pages/admin/AddUserPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Save,
  Shield,
  User,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';

interface NewUserForm {
  loginId: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

export default function AddUserPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<NewUserForm>({
    loginId: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'student'
  });

  const handleChange = (field: keyof NewUserForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.loginId.trim()) {
      return 'Login ID is required';
    }
    if (formData.loginId.length < 3) {
      return 'Login ID must be at least 3 characters';
    }
    if (!formData.password) {
      return 'Password is required';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (!formData.firstName.trim()) {
      return 'First name is required';
    }
    if (!formData.lastName.trim()) {
      return 'Last name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Invalid email format';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await apiService.createUser({
        loginId: formData.loginId.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        role: formData.role
      });

      setSuccess('User created successfully');
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case 'admin': return 'badge-red';
      case 'instructor': return 'badge-amber';
      case 'student': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-secondary p-2"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-500" />
              Add New User
            </h1>
            <p className="text-[#a1a1aa]">
              Create a new user account for {currentUser?.organization?.name}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Credentials */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h2 className="font-mono font-semibold flex items-center gap-2">
                <Shield size={18} />
                Account Credentials
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Login ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.loginId}
                  onChange={(e) => handleChange('loginId', e.target.value)}
                  className="input w-full"
                  placeholder="Enter unique login ID"
                  autoComplete="off"
                />
                <p className="text-xs text-[#6b6b70] mt-1">
                  This will be used to log in. Must be unique.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="input w-full pr-10"
                      placeholder="Enter password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b70] hover:text-[#f5f5f4]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="input w-full"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h2 className="font-mono font-semibold flex items-center gap-2">
                <User size={18} />
                Personal Information
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="input w-full"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="input w-full"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail size={14} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input w-full"
                  placeholder="Enter email address (optional)"
                />
                <p className="text-xs text-[#6b6b70] mt-1">
                  Used for notifications and password recovery
                </p>
              </div>
            </div>
          </div>

          {/* Role Assignment */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h2 className="font-mono font-semibold flex items-center gap-2">
                <Shield size={18} />
                Role Assignment
              </h2>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium mb-3">
                User Role <span className="text-red-400">*</span>
              </label>
              <div className="space-y-3">
                {[
                  { value: 'student', label: 'Student', description: 'Can take tests and view results' },
                  { value: 'instructor', label: 'Instructor', description: 'Can create questions and tests, view student results' },
                  { value: 'admin', label: 'Admin', description: 'Full access to manage users, content, and settings' }
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                      formData.role === role.value
                        ? 'bg-blue-500/10 border border-blue-500'
                        : 'bg-[#1c1c1f] border border-[#2a2a2e] hover:border-[#3a3a3e]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => handleChange('role', e.target.value as any)}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#f5f5f4]">{role.label}</span>
                        <span className={getRoleBadgeClass(role.value)}>{role.value}</span>
                      </div>
                      <p className="text-sm text-[#6b6b70] mt-1">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
