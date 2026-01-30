import React from 'react';
import { Trophy, ArrowRight, RotateCcw, X, Star, Clock } from 'lucide-react';

interface ChallengeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  trackTitle?: string;
  currentPosition: number;
  totalChallenges: number;
  executionTime?: number;
  attempts: number;
  onNextChallenge: () => void;
  onBackToTrack: () => void;
  hasNextChallenge: boolean;
}

const ChallengeSuccessModal: React.FC<ChallengeSuccessModalProps> = ({
  isOpen,
  onClose,
  challengeTitle,
  trackTitle,
  currentPosition,
  totalChallenges,
  executionTime,
  attempts,
  onNextChallenge,
  onBackToTrack,
  hasNextChallenge
}) => {
  if (!isOpen) return null;

  const isTrackComplete = currentPosition === totalChallenges;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md card animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          {/* Trophy Animation */}
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isTrackComplete
              ? 'bg-gradient-to-br from-amber-500 to-yellow-500'
              : 'bg-gradient-to-br from-green-500 to-emerald-500'
          }`}>
            {isTrackComplete ? (
              <Star className="w-10 h-10 text-white fill-white" />
            ) : (
              <Trophy className="w-10 h-10 text-white" />
            )}
          </div>

          {/* Title */}
          <h2 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
            {isTrackComplete ? 'Track Complete!' : 'Challenge Solved!'}
          </h2>

          <p className="text-[#a1a1aa] mb-4">
            {isTrackComplete
              ? `Congratulations! You've completed all challenges in ${trackTitle}!`
              : `You've solved "${challengeTitle}"`}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f5f5f4]">
                {currentPosition}/{totalChallenges}
              </div>
              <div className="text-xs text-[#6b6b70]">Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f5f5f4]">
                {attempts}
              </div>
              <div className="text-xs text-[#6b6b70]">Attempts</div>
            </div>
            {executionTime !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-[#f5f5f4] flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-[#6b6b70]" />
                  {executionTime}ms
                </div>
                <div className="text-xs text-[#6b6b70]">Runtime</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[#6b6b70] mb-1">
              <span>Track Progress</span>
              <span>{Math.round((currentPosition / totalChallenges) * 100)}%</span>
            </div>
            <div className="progress-bar h-2">
              <div
                className={`progress-fill ${isTrackComplete ? 'bg-amber-500' : ''}`}
                style={{ width: `${(currentPosition / totalChallenges) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {hasNextChallenge && !isTrackComplete && (
              <button
                onClick={onNextChallenge}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Next Challenge
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onBackToTrack}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Back to Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeSuccessModal;
