import React from 'react';
import { Trophy, Target, Clock, Flame } from 'lucide-react';

interface TrackProgressCardProps {
  completedChallenges: number;
  totalChallenges: number;
  timeSpent?: number; // in minutes
  currentStreak?: number;
}

const TrackProgressCard: React.FC<TrackProgressCardProps> = ({
  completedChallenges,
  totalChallenges,
  timeSpent = 0,
  currentStreak = 0
}) => {
  const progressPercent = (completedChallenges / totalChallenges) * 100;
  const isCompleted = progressPercent === 100;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-[#2a2a2e]">
        <h3 className="font-mono font-semibold text-[#f5f5f4]">Your Progress</h3>
      </div>
      <div className="p-4">
        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              className="stroke-[#2a2a2e]"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              className={isCompleted ? 'stroke-green-500' : 'stroke-blue-500'}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${progressPercent * 3.52} 352`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#f5f5f4]">
              {Math.round(progressPercent)}%
            </span>
            <span className="text-xs text-[#6b6b70]">Complete</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-[#a1a1aa]">Challenges</span>
            </div>
            <span className="text-sm font-medium text-[#f5f5f4]">
              {completedChallenges}/{totalChallenges}
            </span>
          </div>

          {timeSpent > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-[#a1a1aa]">Time Spent</span>
              </div>
              <span className="text-sm font-medium text-[#f5f5f4]">
                {formatTime(timeSpent)}
              </span>
            </div>
          )}

          {currentStreak > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-[#a1a1aa]">Current Streak</span>
              </div>
              <span className="text-sm font-medium text-[#f5f5f4]">
                {currentStreak} days
              </span>
            </div>
          )}
        </div>

        {/* Completion Badge */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              Track Completed!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackProgressCard;
