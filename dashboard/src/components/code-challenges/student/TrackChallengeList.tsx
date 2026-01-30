import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, Lock, Play, ArrowRight } from 'lucide-react';
import { DifficultyBadge } from '../shared';

interface ChallengeItem {
  challengeId: string | {
    _id: string;
    title: string;
    difficulty: string;
    description?: string;
  };
  order: number;
  isOptional: boolean;
  unlockAfter: number;
  challenge?: {
    _id: string;
    title: string;
    difficulty: string;
    description?: string;
  };
  userProgress?: {
    status: string;
    solved?: boolean; // Legacy support
    solutions?: Record<string, { code?: string; status?: string; attempts?: number }>;
  };
  isUnlocked: boolean;
}

// Helper to extract challenge data (handles both string ID and populated object)
const getChallengeData = (item: ChallengeItem) => {
  // If challengeId is a populated object with challenge details
  if (typeof item.challengeId === 'object' && item.challengeId !== null) {
    return {
      _id: item.challengeId._id,
      title: item.challengeId.title,
      difficulty: item.challengeId.difficulty,
      description: item.challengeId.description
    };
  }
  // Otherwise use the separate challenge field
  return item.challenge;
};

// Helper to get the challenge ID string
const getChallengeIdStr = (challengeId: string | { _id: string }): string => {
  if (typeof challengeId === 'string') return challengeId;
  return challengeId._id;
};

interface TrackChallengeListProps {
  challenges: ChallengeItem[];
  language: string;
  trackSlug: string;
  isEnrolled: boolean;
  currentChallengeIndex?: number;
}

const TrackChallengeList: React.FC<TrackChallengeListProps> = ({
  challenges,
  language,
  trackSlug,
  isEnrolled,
  currentChallengeIndex = 0
}) => {
  // Helper to check if a challenge is solved
  const isSolved = (challenge: ChallengeItem) => {
    if (challenge.userProgress?.solved) return true; // Legacy support
    if (challenge.userProgress?.status === 'solved') return true;
    return false;
  };

  const getStatusIcon = (challenge: ChallengeItem, index: number) => {
    if (!isEnrolled) {
      return <Circle className="w-5 h-5 text-gray-500" />;
    }

    if (isSolved(challenge)) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }

    if (!challenge.isUnlocked) {
      return <Lock className="w-5 h-5 text-gray-500" />;
    }

    if (index === currentChallengeIndex) {
      return (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <Play className="w-3 h-3 text-white" />
        </div>
      );
    }

    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (challenge: ChallengeItem, index: number) => {
    if (!isEnrolled) {
      return { text: 'Enroll to start', color: 'text-gray-500' };
    }

    if (isSolved(challenge)) {
      return { text: 'Completed', color: 'text-green-400' };
    }

    if (!challenge.isUnlocked) {
      const prereqCount = challenge.unlockAfter;
      return { text: `Complete ${prereqCount} challenge${prereqCount > 1 ? 's' : ''} to unlock`, color: 'text-gray-500' };
    }

    if (challenge.userProgress?.status === 'attempted' || challenge.userProgress?.status === 'in_progress') {
      return { text: 'In Progress', color: 'text-amber-400' };
    }

    if (index === currentChallengeIndex) {
      return { text: 'Start Now', color: 'text-blue-400' };
    }

    return { text: 'Not Started', color: 'text-gray-400' };
  };

  return (
    <div className="space-y-3">
      {challenges.map((item, index) => {
        const challenge = getChallengeData(item);
        if (!challenge) return null;

        const challengeIdStr = getChallengeIdStr(item.challengeId);
        const statusInfo = getStatusText(item, index);
        const isClickable = isEnrolled && item.isUnlocked;
        const isCurrent = index === currentChallengeIndex && isEnrolled && !isSolved(item);

        const content = (
          <div
            className={`
              card p-4 transition-all
              ${isClickable ? 'hover:border-[#3a3a3f] cursor-pointer' : 'opacity-75'}
              ${isCurrent ? 'border-blue-500/30 bg-blue-500/5' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Order Number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1c1c1f] border border-[#2a2a2e] flex items-center justify-center">
                <span className="text-sm font-mono text-[#6b6b70]">{item.order}</span>
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(item, index)}
              </div>

              {/* Challenge Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium truncate ${isClickable ? 'text-[#f5f5f4]' : 'text-[#6b6b70]'}`}>
                    {challenge.title}
                  </h4>
                  {item.isOptional && (
                    <span className="px-1.5 py-0.5 text-xs rounded bg-[#1c1c1f] text-[#6b6b70] border border-[#2a2a2e]">
                      Optional
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                  <span className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
                </div>
              </div>

              {/* Arrow */}
              {isClickable && (
                <ArrowRight className="w-4 h-4 text-[#6b6b70]" />
              )}
            </div>
          </div>
        );

        if (isClickable) {
          return (
            <Link
              key={challengeIdStr}
              to={`/code-lab/${language}/${trackSlug}/${challengeIdStr}`}
            >
              {content}
            </Link>
          );
        }

        return <div key={challengeIdStr}>{content}</div>;
      })}
    </div>
  );
};

export default TrackChallengeList;
