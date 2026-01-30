import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { DifficultyBadge, LanguageBadge } from '../shared';
import type { PublicTrack } from '../../../types/codeChallenge';

interface TrackCardProps {
  track: PublicTrack;
  userProgress?: {
    completedChallenges: number;
    totalChallenges: number;
    status: string;
  };
}

const TrackCard: React.FC<TrackCardProps> = ({
  track,
  userProgress
}) => {
  const isEnrolled = userProgress && userProgress.status !== 'not-started';
  const progressPercent = userProgress
    ? (userProgress.completedChallenges / userProgress.totalChallenges) * 100
    : 0;

  return (
    <Link
      to={`/code-lab/${track.language}/${track.slug}`}
      className="card group hover:border-[#3a3a3f] transition-all block"
    >
      {/* Card Header */}
      <div className="p-4 border-b border-[#2a2a2e]">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-mono font-semibold text-[#f5f5f4] group-hover:text-white transition-colors line-clamp-1">
            {track.title}
          </h3>
          {track.isFeatured && (
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <LanguageBadge language={track.language} size="sm" />
          <DifficultyBadge difficulty={track.difficulty} size="sm" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <p className="text-sm text-[#6b6b70] mb-4 line-clamp-2">
          {track.description}
        </p>

        {/* Stats Row */}
        <div className="flex justify-between text-sm text-[#6b6b70] mb-4">
          <div className="flex items-center gap-1">
            <Book className="w-4 h-4" />
            <span>{track.challenges.length} challenges</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{track.estimatedHours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{track.stats.totalEnrolled}</span>
          </div>
        </div>

        {/* Progress Section */}
        {isEnrolled ? (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#a1a1aa]">Progress</span>
              <span className="text-[#a1a1aa]">
                {userProgress.completedChallenges}/{userProgress.totalChallenges}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : track.stats.rating > 0 && (
          <div className="flex items-center gap-1 mb-4">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm text-[#a1a1aa]">
              {track.stats.rating.toFixed(1)} ({track.stats.totalRatings} reviews)
            </span>
          </div>
        )}

        {/* CTA Button */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${isEnrolled ? 'text-blue-400' : 'text-green-400'}`}>
            {isEnrolled ? 'Continue Learning' : 'Start Track'}
          </span>
          <ArrowRight className="w-4 h-4 text-[#6b6b70] group-hover:text-[#a1a1aa] group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};

export default TrackCard;
