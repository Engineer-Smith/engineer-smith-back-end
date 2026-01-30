// src/pages/admin/AddOrganizationPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Crown,
  Loader2,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';

interface OrganizationFormData {
  name: string;
  isSuperOrg: boolean;
}

export default function AddOrganizationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    isSuperOrg: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user is super org admin
  const isSuperOrgAdmin = user?.organization?.isSuperOrg && user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Note: You'll need to add this endpoint to your API service
      // For now, we'll show the success flow
      await apiService.createOrganization({
        name: formData.name.trim(),
        isSuperOrg: formData.isSuperOrg
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/organizations');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create organization:', err);
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSuperOrgAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-[#a1a1aa] mb-4">
            Only super organization administrators can create new organizations.
          </p>
          <button onClick={() => navigate('/admin')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Organization Created!</h2>
          <p className="text-[#a1a1aa]">
            Redirecting to organizations list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/organizations')}
            className="flex items-center gap-2 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Organizations
          </button>

          <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
            Add Organization
          </h1>
          <p className="text-[#a1a1aa]">
            Create a new organization for users to join
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h2 className="font-mono font-semibold flex items-center gap-2">
                <Building2 size={18} />
                Organization Details
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  placeholder="Enter organization name"
                  maxLength={100}
                />
                <p className="text-xs text-[#6b6b70] mt-1">
                  This will be displayed to users during registration
                </p>
              </div>

              {/* Super Org Toggle */}
              <div>
                <label className="flex items-start gap-4 p-4 bg-[#0a0a0b] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSuperOrg}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSuperOrg: e.target.checked }))}
                    className="w-5 h-5 mt-0.5 rounded border-[#3a3a3e] bg-[#1c1c1f] text-purple-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-[#f5f5f4]">Super Organization</span>
                    </div>
                    <p className="text-sm text-[#6b6b70] mt-1">
                      Super organizations have elevated privileges including the ability to manage other organizations,
                      view global content, and access system-wide analytics.
                    </p>
                  </div>
                </label>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">What happens next?</h4>
                <ul className="text-sm text-[#a1a1aa] space-y-1">
                  <li>• An invite code will be generated for this organization</li>
                  <li>• Users can join using the invite code during registration</li>
                  <li>• You can add administrators to manage the organization</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[#2a2a2e] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/organizations')}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.name.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 size={16} />
                    Create Organization
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
