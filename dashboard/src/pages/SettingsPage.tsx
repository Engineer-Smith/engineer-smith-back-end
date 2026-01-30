// src/pages/SettingsPage.tsx
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  Code,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Moon,
  Palette,
  Save,
  Settings,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';

interface Preferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  testReminders: boolean;
  codeEditorFontSize: number;
  codeEditorTheme: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const defaultPreferences: Preferences = {
  theme: 'dark',
  emailNotifications: true,
  testReminders: true,
  codeEditorFontSize: 14,
  codeEditorTheme: 'vs-dark'
};

const editorThemes = [
  { value: 'vs-dark', label: 'Dark (VS Code)' },
  { value: 'vs', label: 'Light (VS Code)' },
  { value: 'hc-black', label: 'High Contrast Dark' },
  { value: 'hc-light', label: 'High Contrast Light' }
];

export default function SettingsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [originalPreferences, setOriginalPreferences] = useState<Preferences>(defaultPreferences);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await apiService.getUserPreferences();
      setPreferences(prefs);
      setOriginalPreferences(prefs);
    } catch (err: any) {
      console.error('Failed to fetch preferences:', err);
      // Use defaults if fetch fails
      setPreferences(defaultPreferences);
      setOriginalPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const hasPreferenceChanges = () => {
    return JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updated = await apiService.updateUserPreferences(preferences);
      setPreferences(updated);
      setOriginalPreferences(updated);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save preferences:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    try {
      setChangingPassword(true);

      await apiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password changed successfully');
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
            Settings
          </h1>
          <p className="text-[#a1a1aa]">
            Customize your experience
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

        {/* Appearance */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <Palette size={18} />
              Appearance
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium mb-3">Theme</label>
              <div className="flex gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Settings, label: 'System' }
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => handlePreferenceChange('theme', value as Preferences['theme'])}
                    className={`flex-1 p-3 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                      preferences.theme === value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-[#2a2a2e] hover:border-[#3a3a3f] text-[#a1a1aa]'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <Bell size={18} />
              Notifications
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-[#f5f5f4]">Email Notifications</p>
                <p className="text-sm text-[#6b6b70]">Receive important updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                className="w-5 h-5 rounded border-[#3a3a3e] bg-[#1c1c1f] text-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-[#f5f5f4]">Test Reminders</p>
                <p className="text-sm text-[#6b6b70]">Get reminded about upcoming tests</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.testReminders}
                onChange={(e) => handlePreferenceChange('testReminders', e.target.checked)}
                className="w-5 h-5 rounded border-[#3a3a3e] bg-[#1c1c1f] text-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Code Editor */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <Code size={18} />
              Code Editor
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={preferences.codeEditorFontSize}
                  onChange={(e) => handlePreferenceChange('codeEditorFontSize', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-[#f5f5f4] font-mono w-12 text-center">
                  {preferences.codeEditorFontSize}px
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Editor Theme</label>
              <select
                value={preferences.codeEditorTheme}
                onChange={(e) => handlePreferenceChange('codeEditorTheme', e.target.value)}
                className="select w-full"
              >
                {editorThemes.map(theme => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSavePreferences}
            disabled={saving || !hasPreferenceChanges()}
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

        {/* Change Password (only for non-SSO users) */}
        {!user?.isSSO && (
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h2 className="font-mono font-semibold flex items-center gap-2">
                <Key size={18} />
                Change Password
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-400">{passwordSuccess}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="input w-full pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b70] hover:text-[#a1a1aa]"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="input w-full pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b70] hover:text-[#a1a1aa]"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input w-full pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b70] hover:text-[#a1a1aa]"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="btn-secondary flex items-center gap-2"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key size={16} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
