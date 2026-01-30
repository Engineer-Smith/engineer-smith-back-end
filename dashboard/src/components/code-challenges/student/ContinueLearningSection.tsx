import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { DifficultyBadge, LanguageBadge } from '../shared';
import type { PublicTrack } from '../../../types/codeChallenge';

interface TrackWithProgress extends PublicTrack {
  userProgress: {
    completedChallenges: number;
    totalChallenges: number;
    currentChallengeIndex: number;
    lastAccessedAt?: string;
  };
}

interface ContinueLearningSectionProps {
  tracks: TrackWithProgress[];
  maxDisplay?: number;
}

const ContinueLearningSection: React.FC<ContinueLearningSectionProps> = ({
  tracks,
  maxDisplay = 3
}) => {
  if (tracks.length === 0) return null;

  const displayedTracks = tracks.slice(0, maxDisplay);

  const formatLastAccessed = (dateString?: string) => {
    if (!dateString) return 'Recently';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-lg font-semibold text-[#f5f5f4]">
          Continue Learning
        </h2>
        {tracks.length > maxDisplay && (
          <Link
            to="/code-lab?enrolled=true"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTracks.map((track) => {
          const progressPercent = (track.userProgress.completedChallenges / track.userProgress.totalChallenges) * 100;

          return (
            <Link
              key={track._id}
              to={`/code-lab/${track.language}/${track.slug}`}
              className="card group hover:border-blue-500/30 transition-all"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#f5f5f4] truncate mb-1">
                      {track.title}
                    </h3>
                    <div className="flex gap-1.5">
                      <LanguageBadge language={track.language} size="sm" />
                      <DifficultyBadge difficulty={track.difficulty} size="sm" />
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Play className="w-4 h-4 text-blue-400" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#6b6b70]">Progress</span>
                    <span className="text-[#a1a1aa]">
                      {track.userProgress.completedChallenges}/{track.userProgress.totalChallenges} challenges
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-[#6b6b70]">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatLastAccessed(track.userProgress.lastAccessedAt)}</span>
                  </div>
                  {progressPercent === 100 ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle size={12} />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <span className="text-blue-400 group-hover:text-blue-300">
                      Continue
                      <ArrowRight size={12} className="inline ml-1" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueLearningSection;
