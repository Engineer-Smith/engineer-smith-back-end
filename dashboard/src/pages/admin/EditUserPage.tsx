// src/pages/admin/EditUserPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Check,
  Key,
  Loader2,
  Mail,
  Save,
  Shield,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';
import type { User as UserType } from '../../types';

interface OrgOption {
  _id: string;
  name: string;
  isSuperOrg?: boolean;
}

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  organizationId: string;
}

export default function EditUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [targetUser, setTargetUser] = useState<UserType | null>(null);
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [formData, setFormData] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    organizationId: ''
  });
  const [originalData, setOriginalData] = useState<EditFormData | null>(null);

  // Password reset state
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const isSuperOrgAdmin = currentUser?.organization?.isSuperOrg && currentUser?.role === 'admin';

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user details
      const dashboard = await apiService.getUserDetailsDashboard(userId);
      const userData = dashboard.user;

      setTargetUser(userData as unknown as UserType);

      const initialData: EditFormData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        role: userData.role as 'student' | 'instructor' | 'admin',
        organizationId: userData.organization._id
      };

      setFormData(initialData);
      setOriginalData(initialData);

      // If super admin, fetch organizations list
      if (isSuperOrgAdmin) {
        try {
          const orgsData = await apiService.getOrganizations();
          setOrganizations(orgsData || []);
        } catch (err) {
          console.error('Failed to fetch organizations:', err);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch user:', err);
      setError(err.response?.data?.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof EditFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.firstName !== originalData.firstName ||
      formData.lastName !== originalData.lastName ||
      formData.email !== originalData.email ||
      formData.role !== originalData.role ||
      formData.organizationId !== originalData.organizationId
    );
  };

  const handleSave = async () => {
    if (!userId || !originalData) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update basic info if changed
      if (
        formData.firstName !== originalData.firstName ||
        formData.lastName !== originalData.lastName ||
        formData.email !== originalData.email
      ) {
        await apiService.updateUser(userId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined
        });
      }

      // Update role if changed
      if (formData.role !== originalData.role) {
        await apiService.updateUserRole(userId, formData.role);
      }

      // Update organization if changed (super admin only)
      if (isSuperOrgAdmin && formData.organizationId !== originalData.organizationId) {
        await apiService.transferUserOrganization(userId, formData.organizationId);
      }

      setOriginalData(formData);
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userId) return;

    try {
      setResettingPassword(true);
      setError(null);

      const result = await apiService.resetUserPassword(userId);
      setNewPassword(result.tempPassword || 'Password reset email sent');
      setShowPasswordModal(true);
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading user...</p>
        </div>
      </div>
    );
  }

  if (error && !targetUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading User</h2>
            <p className="text-[#a1a1aa] mb-4">{error}</p>
            <button onClick={() => navigate('/admin/users')} className="btn-primary">
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/admin/users/${userId}`)}
            className="btn-secondary p-2"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4]">
              Edit User
            </h1>
            <p className="text-[#a1a1aa]">
              {targetUser?.firstName} {targetUser?.lastName} ({targetUser?.loginId})
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
            </div>
          </div>
        </div>

        {/* Role & Organization */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <Shield size={18} />
              Role & Organization
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">User Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="select w-full"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-[#6b6b70] mt-1">
                Current: <span className={getRoleBadgeClass(originalData?.role || 'student')}>{originalData?.role}</span>
              </p>
            </div>

            {isSuperOrgAdmin && organizations.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Building size={14} />
                  Organization
                </label>
                <select
                  value={formData.organizationId}
                  onChange={(e) => handleChange('organizationId', e.target.value)}
                  className="select w-full"
                >
                  {organizations.map(org => (
                    <option key={org._id} value={org._id}>
                      {org.name} {org.isSuperOrg ? '(Super)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#6b6b70] mt-1">
                  Only super organization admins can change user organizations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <Key size={18} />
              Account Actions
            </h2>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0b] rounded-lg">
              <div>
                <p className="font-medium text-[#f5f5f4]">Reset Password</p>
                <p className="text-sm text-[#6b6b70]">
                  Generate a new temporary password for this user
                </p>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resettingPassword}
                className="btn-secondary"
              >
                {resettingPassword ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Key size={16} className="mr-2" />
                    Reset Password
                  </>
                )}
              </button>
            </div>

            {targetUser?.isSSO && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  This account uses Single Sign-On (SSO). Password reset may not apply.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Account Info (Read-only) */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold">Account Info</h2>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70]">Login ID</span>
              <span className="font-medium text-[#f5f5f4]">{targetUser?.loginId}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70]">Account Type</span>
              <span className={targetUser?.isSSO ? 'badge-blue' : 'badge-gray'}>
                {targetUser?.isSSO ? 'SSO Account' : 'Regular Account'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70]">Created</span>
              <span className="font-medium text-[#f5f5f4]">
                {targetUser?.createdAt ? new Date(targetUser.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/admin/users/${userId}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
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

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
              <h5 className="font-semibold text-[#f5f5f4]">Password Reset</h5>
              <button
                className="text-[#6b6b70] hover:text-[#f5f5f4]"
                onClick={() => setShowPasswordModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[#a1a1aa] mb-4">
                The password has been reset successfully.
              </p>
              {newPassword && newPassword !== 'Password reset email sent' && (
                <div className="p-4 bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg">
                  <p className="text-sm text-[#6b6b70] mb-2">New Temporary Password:</p>
                  <code className="text-lg text-green-400 font-mono">{newPassword}</code>
                </div>
              )}
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg">
                <p className="text-sm text-amber-400">
                  Please share this password securely with the user. They will be required to change it on first login.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-[#2a2a2e] flex justify-end">
              <button className="btn-primary" onClick={() => setShowPasswordModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
