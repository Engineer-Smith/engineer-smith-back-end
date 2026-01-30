import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Book, Clock, Users, Star, Play, CheckCircle } from 'lucide-react';
import { DifficultyBadge, LanguageBadge } from '../shared';
import type { PublicTrack } from '../../../types/codeChallenge';

interface TrackHeaderProps {
  track: PublicTrack;
  isEnrolled: boolean;
  userProgress?: {
    completedChallenges: number;
    totalChallenges: number;
    currentChallengeIndex: number;
  };
  onEnroll: () => void;
  onContinue: () => void;
  enrolling?: boolean;
}

const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  isEnrolled,
  userProgress,
  onEnroll,
  onContinue,
  enrolling = false
}) => {
  const progressPercent = userProgress
    ? (userProgress.completedChallenges / userProgress.totalChallenges) * 100
    : 0;
  const isCompleted = progressPercent === 100;

  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <Link
        to="/code-lab"
        className="inline-flex items-center gap-2 text-[#6b6b70] hover:text-[#a1a1aa] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Back to Code Lab</span>
      </Link>

      <div className="card">
        <div className="p-6">
          {/* Title and Badges */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <LanguageBadge language={track.language} size="md" />
                <DifficultyBadge difficulty={track.difficulty} size="md" />
                {track.isFeatured && (
                  <span className="px-2 py-1 text-xs rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Star size={12} className="fill-amber-400" />
                    Featured
                  </span>
                )}
              </div>
              <h1 className="font-mono text-2xl md:text-3xl font-bold text-[#f5f5f4] mb-2">
                {track.title}
              </h1>
              <p className="text-[#a1a1aa] max-w-2xl">
                {track.description}
              </p>
            </div>

            {/* Enroll/Continue Button */}
            <div className="flex-shrink-0">
              {isEnrolled ? (
                <button
                  onClick={onContinue}
                  className={`btn-primary flex items-center gap-2 ${isCompleted ? 'bg-green-600 hover:bg-green-500' : ''}`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle size={18} />
                      Review Track
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      Continue Learning
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={onEnroll}
                  disabled={enrolling}
                  className="btn-primary flex items-center gap-2"
                >
                  {enrolling ? (
                    <>
                      <div className="spinner w-4 h-4" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      Start Track
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <Book className="w-4 h-4 text-blue-400" />
              <span>{track.challenges.length} Challenges</span>
            </div>
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>{track.estimatedHours} Hours</span>
            </div>
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <Users className="w-4 h-4 text-green-400" />
              <span>{track.stats.totalEnrolled} Enrolled</span>
            </div>
            {track.stats.rating > 0 && (
              <div className="flex items-center gap-2 text-[#a1a1aa]">
                <Star className="w-4 h-4 text-amber-400" />
                <span>{track.stats.rating.toFixed(1)} ({track.stats.totalRatings} reviews)</span>
              </div>
            )}
          </div>

          {/* Progress Bar (if enrolled) */}
          {isEnrolled && userProgress && (
            <div className="mt-6 pt-6 border-t border-[#2a2a2e]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#a1a1aa]">Your Progress</span>
                <span className="text-[#f5f5f4] font-medium">
                  {userProgress.completedChallenges} / {userProgress.totalChallenges} completed
                </span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className={`progress-fill ${isCompleted ? 'bg-green-500' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {isCompleted && (
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle size={14} />
                  Congratulations! You've completed this track.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackHeader;
