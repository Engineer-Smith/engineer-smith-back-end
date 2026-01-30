// src/pages/ProfilePage.tsx
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  Loader2,
  Mail,
  Save,
  Shield,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCurrentUserProfile();
      // Handle both direct user object and wrapped response
      const profile = (response as any).user || response;
      const data = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || ''
      };
      setFormData(data);
      setOriginalData(data);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return formData.firstName !== originalData.firstName ||
           formData.lastName !== originalData.lastName ||
           formData.email !== originalData.email;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await apiService.updateCurrentUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined
      });

      setOriginalData(formData);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
            Your Profile
          </h1>
          <p className="text-[#a1a1aa]">
            Manage your personal information
          </p>
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

        {/* Profile Card */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <User size={18} />
              Personal Information
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="input w-full"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="input w-full"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Email */}
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
                placeholder="Enter email address"
              />
              <p className="text-xs text-[#6b6b70] mt-1">
                Used for notifications and account recovery
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-[#2a2a2e]">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges()}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Account Info (Read-only) */}
        <div className="card">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <Shield size={18} />
              Account Information
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70]">Login ID</span>
              <span className="font-medium text-[#f5f5f4]">{user?.loginId}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70]">Role</span>
              <span className={`px-2 py-1 rounded text-xs ${
                user?.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                user?.role === 'instructor' ? 'bg-purple-500/10 text-purple-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {user?.role}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70] flex items-center gap-2">
                <Building2 size={14} />
                Organization
              </span>
              <span className="font-medium text-[#f5f5f4]">
                {user?.organization?.name || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70] flex items-center gap-2">
                <Calendar size={14} />
                Account Created
              </span>
              <span className="font-medium text-[#f5f5f4]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {user?.isSSO && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  This account is managed through Single Sign-On (SSO). Some features may be limited.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
