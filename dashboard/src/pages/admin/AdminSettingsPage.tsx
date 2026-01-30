// src/pages/admin/AdminSettingsPage.tsx
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  FileText,
  Loader2,
  Mail,
  Save,
  Settings,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';

interface OrgSettings {
  allowSelfRegistration: boolean;
  defaultStudentAttemptsPerTest: number;
  testGracePeriodMinutes: number;
  requireEmailVerification: boolean;
  allowInstructorTestCreation: boolean;
  maxQuestionsPerTest: number;
  defaultTestTimeLimit: number;
}

const defaultSettings: OrgSettings = {
  allowSelfRegistration: true,
  defaultStudentAttemptsPerTest: 3,
  testGracePeriodMinutes: 5,
  requireEmailVerification: false,
  allowInstructorTestCreation: true,
  maxQuestionsPerTest: 100,
  defaultTestTimeLimit: 60
};

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState<OrgSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<OrgSettings>(defaultSettings);

  const orgId = user?.organization?._id;

  useEffect(() => {
    if (orgId) {
      fetchSettings();
    }
  }, [orgId]);

  const fetchSettings = async () => {
    if (!orgId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getOrganizationSettings(orgId);
      setSettings(data);
      setOriginalSettings(data);
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      // Use defaults if fetch fails
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = <K extends keyof OrgSettings>(
    key: K,
    value: OrgSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  const handleSave = async () => {
    if (!orgId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updated = await apiService.updateOrganizationSettings(orgId, settings);
      setSettings(updated);
      setOriginalSettings(updated);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" />
            Organization Settings
          </h1>
          <p className="text-[#a1a1aa]">
            Configure settings for {user?.organization?.name || 'your organization'}
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

        {/* Registration Settings */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <Users size={18} />
              Registration & Access
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-[#f5f5f4]">Allow Self Registration</p>
                <p className="text-sm text-[#6b6b70]">
                  Users can register with your organization's invite code
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSelfRegistration}
                onChange={(e) => handleChange('allowSelfRegistration', e.target.checked)}
                className="w-5 h-5 rounded border-[#3a3a3e] bg-[#1c1c1f] text-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-[#f5f5f4] flex items-center gap-2">
                  <Mail size={14} />
                  Require Email Verification
                </p>
                <p className="text-sm text-[#6b6b70]">
                  Users must verify their email before accessing content
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                className="w-5 h-5 rounded border-[#3a3a3e] bg-[#1c1c1f] text-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-[#f5f5f4] flex items-center gap-2">
                  <Shield size={14} />
                  Allow Instructor Test Creation
                </p>
                <p className="text-sm text-[#6b6b70]">
                  Instructors can create and manage tests (not just admins)
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowInstructorTestCreation}
                onChange={(e) => handleChange('allowInstructorTestCreation', e.target.checked)}
                className="w-5 h-5 rounded border-[#3a3a3e] bg-[#1c1c1f] text-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Test Settings */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <FileText size={18} />
              Test Defaults
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Student Attempts Per Test
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={settings.defaultStudentAttemptsPerTest}
                onChange={(e) => handleChange('defaultStudentAttemptsPerTest', parseInt(e.target.value) || 1)}
                className="input w-full max-w-xs"
              />
              <p className="text-xs text-[#6b6b70] mt-1">
                Number of attempts students get by default for each test
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock size={14} />
                Default Test Time Limit (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.defaultTestTimeLimit}
                onChange={(e) => handleChange('defaultTestTimeLimit', parseInt(e.target.value) || 60)}
                className="input w-full max-w-xs"
              />
              <p className="text-xs text-[#6b6b70] mt-1">
                Default time limit when creating new tests
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Test Grace Period (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={settings.testGracePeriodMinutes}
                onChange={(e) => handleChange('testGracePeriodMinutes', parseInt(e.target.value) || 0)}
                className="input w-full max-w-xs"
              />
              <p className="text-xs text-[#6b6b70] mt-1">
                Extra time allowed after timer ends before auto-submit
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Questions Per Test
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={settings.maxQuestionsPerTest}
                onChange={(e) => handleChange('maxQuestionsPerTest', parseInt(e.target.value) || 100)}
                className="input w-full max-w-xs"
              />
              <p className="text-xs text-[#6b6b70] mt-1">
                Maximum number of questions allowed in a single test
              </p>
            </div>
          </div>
        </div>

        {/* Organization Info (Read-only) */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <Building2 size={18} />
              Organization Info
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70]">Organization Name</span>
              <span className="font-medium text-[#f5f5f4]">{user?.organization?.name}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <span className="text-[#6b6b70]">Organization ID</span>
              <span className="font-mono text-sm text-[#a1a1aa]">{orgId}</span>
            </div>

            {user?.organization?.isSuperOrg && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-purple-400 flex items-center gap-2">
                  <Shield size={14} />
                  This is a Super Organization with elevated privileges
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
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
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
