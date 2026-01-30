// src/pages/code-challenges/admin/AdminTrackDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Check,
  Clock,
  Code,
  Edit,
  Eye,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useCodeChallenge } from '../../../context/CodeChallengeContext';

export default function AdminTrackDetailPage() {
  const { language, trackSlug } = useParams<{ language: string; trackSlug: string }>();
  const navigate = useNavigate();
  const { trackDetail, loading, loadTrackById } = useCodeChallenge();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    estimatedHours: 0
  });

  useEffect(() => {
    if (language && trackSlug) {
      loadTrackById(language, trackSlug);
    }
  }, [language, trackSlug]);

  useEffect(() => {
    if (trackDetail) {
      setFormData({
        title: trackDetail.title || '',
        description: trackDetail.description || '',
        difficulty: trackDetail.difficulty || 'beginner',
        estimatedHours: trackDetail.estimatedHours || 0
      });
    }
  }, [trackDetail]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Track updated successfully');
      setEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save track');
    } finally {
      setSaving(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'badge-green';
      case 'intermediate': return 'badge-amber';
      case 'advanced': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading track...</p>
        </div>
      </div>
    );
  }

  if (!trackDetail) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Track Not Found</h2>
            <p className="text-[#a1a1aa] mb-4">
              The requested track could not be found.
            </p>
            <button onClick={() => navigate('/admin/code-lab/tracks')} className="btn-primary">
              Back to Tracks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/admin/code-lab/tracks')}
              className="btn-secondary p-2 mt-1"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
                {trackDetail.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="badge-blue">{trackDetail.language}</span>
                <span className={getDifficultyBadge(trackDetail.difficulty)}>
                  {trackDetail.difficulty}
                </span>
                <span className="badge-green">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/code-lab/${language}/${trackSlug}`)}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye size={16} />
              Preview
            </button>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Track
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            )}
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <Code className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{trackDetail.challenges?.length || 0}</p>
            <p className="text-xs text-[#6b6b70]">Challenges</p>
          </div>
          <div className="card p-4 text-center">
            <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">0</p>
            <p className="text-xs text-[#6b6b70]">Enrolled</p>
          </div>
          <div className="card p-4 text-center">
            <BarChart3 className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">0%</p>
            <p className="text-xs text-[#6b6b70]">Completion Rate</p>
          </div>
          <div className="card p-4 text-center">
            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{trackDetail.estimatedHours || 0}h</p>
            <p className="text-xs text-[#6b6b70]">Est. Duration</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Track Details */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
                <h2 className="font-mono font-semibold flex items-center gap-2">
                  <BookOpen size={18} />
                  Track Details
                </h2>
                {editing && (
                  <button onClick={() => setEditing(false)} className="text-[#6b6b70] hover:text-[#f5f5f4]">
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4">
                {editing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="input w-full resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Difficulty</label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="select w-full"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                        <input
                          type="number"
                          value={formData.estimatedHours}
                          onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                          className="input w-full"
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm text-[#6b6b70] mb-1">Description</h3>
                      <p className="text-[#a1a1aa]">{trackDetail.description}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm text-[#6b6b70] mb-1">Created</h3>
                        <p className="text-[#f5f5f4]">
                          {trackDetail.createdAt ? new Date(trackDetail.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm text-[#6b6b70] mb-1">Last Updated</h3>
                        <p className="text-[#f5f5f4]">
                          {trackDetail.updatedAt ? new Date(trackDetail.updatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Challenges List */}
            <div className="card">
              <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
                <h2 className="font-mono font-semibold flex items-center gap-2">
                  <Code size={18} />
                  Challenges ({trackDetail.challenges?.length || 0})
                </h2>
                <button
                  onClick={() => navigate('/admin/code-lab/challenges/new')}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Challenge
                </button>
              </div>

              {!trackDetail.challenges?.length ? (
                <div className="p-12 text-center">
                  <Code className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
                  <p className="text-[#6b6b70]">No challenges in this track yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#2a2a2e]">
                  {trackDetail.challenges.map((challenge: any, index: number) => (
                    <div
                      key={challenge._id || index}
                      className="p-4 hover:bg-[#1c1c1f]/50 transition-colors flex items-center gap-4"
                    >
                      <GripVertical size={16} className="text-[#6b6b70] cursor-grab" />
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#f5f5f4] truncate">{challenge.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={getDifficultyBadge(challenge.difficulty)}>
                            {challenge.difficulty}
                          </span>
                          <span className="text-xs text-[#6b6b70]">
                            {challenge.points || 0} points
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/code-lab/challenges/${challenge._id || challenge.slug}/edit`)}
                          className="btn-secondary p-2"
                        >
                          <Edit size={14} />
                        </button>
                        <button className="btn-secondary p-2 text-red-400 hover:bg-red-500/10">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-4">
              <h3 className="font-mono font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/admin/code-lab/challenges/new')}
                  className="btn-secondary w-full flex items-center gap-2 justify-center"
                >
                  <Plus size={16} />
                  Add Challenge
                </button>
                <button className="btn-secondary w-full flex items-center gap-2 justify-center">
                  <BarChart3 size={16} />
                  View Analytics
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card p-4 border-red-500/20">
              <h3 className="font-mono font-semibold text-red-400 mb-4">Danger Zone</h3>
              <button className="btn-secondary w-full text-red-400 border-red-500/30 hover:bg-red-500/10 flex items-center gap-2 justify-center">
                <Trash2 size={16} />
                Delete Track
              </button>
              <p className="text-xs text-[#6b6b70] mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
