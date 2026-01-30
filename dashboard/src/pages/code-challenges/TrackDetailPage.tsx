import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import {
  TrackHeader,
  TrackChallengeList,
  TrackProgressCard,
  TrackInfoCard
} from '../../components/code-challenges/student';

const TrackDetailPage: React.FC = () => {
  const { language, trackSlug } = useParams<{ language: string; trackSlug: string }>();
  const navigate = useNavigate();

  const {
    currentTrack,
    loading,
    errors,
    loadTrack,
    enrollInTrack
  } = useCodeChallenge();

  const [enrolling, setEnrolling] = useState(false);

  // Load track on mount
  useEffect(() => {
    if (language && trackSlug) {
      loadTrack(language, trackSlug);
    }
  }, [language, trackSlug, loadTrack]);

  const handleEnroll = async () => {
    if (!language || !trackSlug) return;

    try {
      setEnrolling(true);
      await enrollInTrack(language, trackSlug);
      // Navigate to first challenge after enrolling
      if (currentTrack?.challenges && currentTrack.challenges.length > 0) {
        const firstChallenge = currentTrack.challenges.find((c: any) => c.order === 1) || currentTrack.challenges[0];
        // challengeId can be a string or a populated object with _id
        const cId = (firstChallenge as any).challengeId;
        const challengeIdStr = typeof cId === 'string' ? cId : cId._id;
        navigate(`/code-lab/${language}/${trackSlug}/${challengeIdStr}`);
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleContinue = () => {
    if (!currentTrack || !language || !trackSlug) return;

    // Find the next unsolved challenge
    const userProgress = (currentTrack as any).userProgress;
    const currentIndex = userProgress?.currentChallengeIndex || 0;

    // Helper to check if challenge is solved
    const isSolved = (c: any) => c.userProgress?.solved || c.userProgress?.status === 'solved';

    // Find next challenge to work on
    const sortedChallenges = [...currentTrack.challenges].sort((a: any, b: any) => a.order - b.order);
    const nextChallenge = sortedChallenges.find((c: any, idx: number) => {
      if (idx < currentIndex) return false;
      return !isSolved(c) && c.isUnlocked;
    }) || sortedChallenges[currentIndex];

    if (nextChallenge) {
      // challengeId can be a string or a populated object with _id
      const cId = (nextChallenge as any).challengeId;
      const challengeIdStr = typeof cId === 'string' ? cId : cId._id;
      navigate(`/code-lab/${language}/${trackSlug}/${challengeIdStr}`);
    }
  };

  // Loading state
  if (loading.track && !currentTrack) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading track...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.track) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
            Failed to Load Track
          </h2>
          <p className="text-[#a1a1aa] mb-4">
            {typeof errors.track === 'string' ? errors.track : 'Failed to load track'}
          </p>
          <button
            className="btn-primary"
            onClick={() => language && trackSlug && loadTrack(language, trackSlug)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No track found
  if (!currentTrack) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
            Track Not Found
          </h2>
          <p className="text-[#a1a1aa] mb-4">
            The track you're looking for doesn't exist or has been removed.
          </p>
          <button className="btn-primary" onClick={() => navigate('/code-lab')}>
            Back to Code Lab
          </button>
        </div>
      </div>
    );
  }

  const userProgress = (currentTrack as any).userProgress;
  // Check enrollment - support both hyphenated and underscored status values
  const isEnrolled = userProgress?.status &&
    userProgress.status !== 'not-started' &&
    userProgress.status !== 'not_started';

  // Helper to check if a challenge is solved (same logic as TrackChallengeList)
  const isSolved = (c: any) => {
    if (c.userProgress?.solved) return true;
    if (c.userProgress?.status === 'solved') return true;
    return false;
  };

  // Calculate progress by counting solved challenges from the array
  // (more reliable than backend's completedChallenges which may not be updated)
  const totalChallenges = currentTrack.challenges.length;
  const completedChallenges = currentTrack.challenges.filter(isSolved).length;
  const currentChallengeIndex = userProgress?.currentChallengeIndex || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="container-section py-8">
        {/* Track Header */}
        <TrackHeader
          track={currentTrack}
          isEnrolled={isEnrolled}
          userProgress={
            isEnrolled
              ? {
                  completedChallenges,
                  totalChallenges,
                  currentChallengeIndex
                }
              : undefined
          }
          onEnroll={handleEnroll}
          onContinue={handleContinue}
          enrolling={enrolling}
        />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Challenge List (2/3) */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-4 border-b border-[#2a2a2e]">
                <h2 className="font-mono font-semibold text-[#f5f5f4]">
                  Challenges ({totalChallenges})
                </h2>
              </div>
              <div className="p-4">
                <TrackChallengeList
                  challenges={currentTrack.challenges.map((c: any) => ({
                    ...c,
                    isUnlocked: isEnrolled ? c.isUnlocked : false
                  }))}
                  language={language!}
                  trackSlug={trackSlug!}
                  isEnrolled={isEnrolled}
                  currentChallengeIndex={currentChallengeIndex}
                />
              </div>
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Progress Card (if enrolled) */}
            {isEnrolled && (
              <TrackProgressCard
                completedChallenges={completedChallenges}
                totalChallenges={totalChallenges}
                timeSpent={userProgress?.timeSpent}
              />
            )}

            {/* Track Info Card */}
            <TrackInfoCard
              learningObjectives={currentTrack.learningObjectives || []}
              prerequisites={currentTrack.prerequisites || []}
              estimatedHours={currentTrack.estimatedHours}
              category={currentTrack.category}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackDetailPage;
