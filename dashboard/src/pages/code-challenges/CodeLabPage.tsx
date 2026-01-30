import React, { useEffect, useState, useMemo } from 'react';
import { Code, AlertCircle, Star, TrendingUp } from 'lucide-react';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import {
  TrackCard,
  TrackFilters,
  ContinueLearningSection
} from '../../components/code-challenges/student';
import type { PublicTrack } from '../../types/codeChallenge';

const CodeLabPage: React.FC = () => {
  const {
    tracks,
    dashboard,
    loading,
    errors,
    loadTracks,
    loadDashboard
  } = useCodeChallenge();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load data on mount
  useEffect(() => {
    loadTracks();
    loadDashboard();
  }, []);

  // Get enrolled tracks with progress
  const enrolledTracks = useMemo(() => {
    // This would come from the dashboard data or a separate API call
    // For now, we'll filter tracks that the user has progress on
    return tracks.filter((track: any) => track.userProgress?.status && track.userProgress.status !== 'not-started');
  }, [tracks]);

  // Get featured tracks
  const featuredTracks = useMemo(() => {
    return tracks.filter((track: PublicTrack) => track.isFeatured);
  }, [tracks]);

  // Filter tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter((track: PublicTrack) => {
      const matchesSearch =
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || track.language === languageFilter;
      const matchesDifficulty = difficultyFilter === 'all' || track.difficulty === difficultyFilter;
      const matchesCategory = categoryFilter === 'all' || track.category === categoryFilter;

      return matchesSearch && matchesLanguage && matchesDifficulty && matchesCategory;
    });
  }, [tracks, searchTerm, languageFilter, difficultyFilter, categoryFilter]);

  const hasActiveFilters =
    searchTerm !== '' ||
    languageFilter !== 'all' ||
    difficultyFilter !== 'all' ||
    categoryFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setLanguageFilter('all');
    setDifficultyFilter('all');
    setCategoryFilter('all');
  };

  // Loading state
  if (loading.tracks && tracks.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading tracks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.tracks) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
            Failed to Load Tracks
          </h2>
          <p className="text-[#a1a1aa] mb-4">
            {typeof errors.tracks === 'string' ? errors.tracks : 'Failed to load tracks'}
          </p>
          <button className="btn-primary" onClick={() => loadTracks()}>
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-4">
            <Code className="w-4 h-4" />
            Code Lab
          </div>
          <h1 className="font-mono text-3xl md:text-4xl font-bold mb-3">
            Master Coding Through
            <span className="text-gradient"> Practice</span>
          </h1>
          <p className="text-[#a1a1aa] max-w-2xl mx-auto">
            Structured learning tracks designed to help you build strong coding foundations.
            Progress through challenges, track your improvement, and level up your skills.
          </p>
        </div>

        {/* Stats Summary */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-[#f5f5f4]">
                {dashboard.challengeStats?.totalSolved || 0}
              </div>
              <div className="text-xs text-[#6b6b70]">Challenges Solved</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-[#f5f5f4]">
                {dashboard.trackStats?.totalEnrolled || 0}
              </div>
              <div className="text-xs text-[#6b6b70]">Tracks Enrolled</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-[#f5f5f4]">
                {dashboard.trackStats?.totalCompleted || 0}
              </div>
              <div className="text-xs text-[#6b6b70]">Tracks Completed</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-[#f5f5f4]">
                {tracks.length}
              </div>
              <div className="text-xs text-[#6b6b70]">Available Tracks</div>
            </div>
          </div>
        )}

        {/* Continue Learning Section */}
        {enrolledTracks.length > 0 && (
          <ContinueLearningSection
            tracks={enrolledTracks.map((track: any) => ({
              ...track,
              userProgress: {
                completedChallenges: track.userProgress?.completedChallenges || 0,
                totalChallenges: track.challenges.length,
                currentChallengeIndex: track.userProgress?.currentChallengeIndex || 0,
                lastAccessedAt: track.userProgress?.lastAccessedAt
              }
            }))}
            maxDisplay={3}
          />
        )}

        {/* Featured Tracks */}
        {featuredTracks.length > 0 && !hasActiveFilters && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="font-mono text-lg font-semibold text-[#f5f5f4]">
                Featured Tracks
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTracks.slice(0, 3).map((track) => (
                <TrackCard
                  key={track._id}
                  track={track}
                  userProgress={(track as any).userProgress}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <TrackFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          language={languageFilter}
          onLanguageChange={setLanguageFilter}
          difficulty={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* All Tracks Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h2 className="font-mono text-lg font-semibold text-[#f5f5f4]">
              {hasActiveFilters ? 'Filtered Tracks' : 'All Tracks'}
            </h2>
          </div>
          <span className="text-sm text-[#6b6b70]">
            {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tracks Grid */}
        {filteredTracks.length === 0 ? (
          <div className="card text-center py-12">
            <Code className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
            <h3 className="font-mono text-lg font-semibold text-[#f5f5f4] mb-2">
              No Tracks Found
            </h3>
            <p className="text-[#6b6b70] mb-4">
              {hasActiveFilters
                ? 'No tracks match your current filters. Try adjusting your search.'
                : 'No tracks are available at the moment.'}
            </p>
            {hasActiveFilters && (
              <button className="btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track._id}
                track={track}
                userProgress={(track as any).userProgress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeLabPage;
