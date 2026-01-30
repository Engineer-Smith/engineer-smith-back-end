import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { useCodeChallenge } from '../../../context/CodeChallengeContext';
import TracksList from '../../../components/code-challenges/TracksList';
import CreateTrackForm from '../../../components/code-challenges/CreateTrackForm';
import EditTrackForm from '../../../components/code-challenges/EditTrackForm';
import TrackChallengeAssignment from '../../../components/code-challenges/TrackChallengeAssignment';
import type { AdminTrack } from '../../../types/codeChallenge';

type ViewMode = 'list' | 'create' | 'edit' | 'assign';

const TrackManagementPage: React.FC = () => {
  const {
    adminTracks,
    loading,
    errors,
    loadAllTracksAdmin
  } = useCodeChallenge();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTrack, setSelectedTrack] = useState<AdminTrack | null>(null);

  useEffect(() => {
    loadAllTracksAdmin();
  }, []);

  // Sync selectedTrack with adminTracks when the context updates
  useEffect(() => {
    if (selectedTrack && adminTracks.length > 0) {
      const updatedTrack = adminTracks.find(
        t => t.language === selectedTrack.language && t.slug === selectedTrack.slug
      );
      if (updatedTrack) {
        setSelectedTrack(updatedTrack);
      }
    }
  }, [adminTracks]);

  const handleTrackCreated = () => {
    loadAllTracksAdmin();
    setViewMode('list');
  };

  const handleTrackUpdated = () => {
    loadAllTracksAdmin();
    setViewMode('list');
    setSelectedTrack(null);
  };

  const handleAssignChallenges = (track: AdminTrack) => {
    setSelectedTrack(track);
    setViewMode('assign');
  };

  const handleEditTrack = (track: AdminTrack) => {
    setSelectedTrack(track);
    setViewMode('edit');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedTrack(null);
  };

  // Error state
  if (errors.adminTracks) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
            Failed to Load Tracks
          </h2>
          <p className="text-[#a1a1aa] mb-4">
            {typeof errors.adminTracks === 'string' ? errors.adminTracks : 'Failed to load tracks'}
          </p>
          <button className="btn-primary" onClick={() => loadAllTracksAdmin()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="container-section py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {viewMode !== 'list' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-[#6b6b70] hover:text-[#a1a1aa] transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="text-sm">Back</span>
              </button>
            )}
            <div>
              <h1 className="font-mono text-2xl font-bold text-[#f5f5f4]">
                {viewMode === 'list' && 'Track Management'}
                {viewMode === 'create' && 'Create New Track'}
                {viewMode === 'edit' && 'Edit Track'}
                {viewMode === 'assign' && `Manage Challenges - ${selectedTrack?.title}`}
              </h1>
              <p className="text-sm text-[#6b6b70]">
                {viewMode === 'list' && 'Create and manage learning tracks'}
                {viewMode === 'create' && 'Define a new learning track'}
                {viewMode === 'edit' && 'Update track details'}
                {viewMode === 'assign' && 'Add or remove challenges from this track'}
              </p>
            </div>
          </div>

          {viewMode === 'list' && (
            <div className="flex items-center gap-3">
              <Link to="/admin/code-lab" className="btn-secondary">
                Dashboard
              </Link>
              <button
                onClick={() => setViewMode('create')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={16} />
                New Track
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === 'list' && (
          <TracksList
            tracks={adminTracks}
            loading={loading.adminTracks}
            onAssignChallenges={handleAssignChallenges}
            onEditTrack={handleEditTrack}
            onRefresh={() => loadAllTracksAdmin()}
          />
        )}

        {viewMode === 'create' && (
          <CreateTrackForm
            onTrackCreated={handleTrackCreated}
            onCancel={handleBack}
          />
        )}

        {viewMode === 'edit' && selectedTrack && (
          <EditTrackForm
            track={selectedTrack}
            onTrackUpdated={handleTrackUpdated}
            onCancel={handleBack}
          />
        )}

        {viewMode === 'assign' && selectedTrack && (
          <TrackChallengeAssignment
            track={selectedTrack}
            onComplete={handleBack}
            onCancel={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default TrackManagementPage;
