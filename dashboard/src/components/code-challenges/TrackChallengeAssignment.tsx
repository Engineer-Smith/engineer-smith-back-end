// src/components/code-challenges/TrackChallengeAssignment.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  X,
  Code,
  GripVertical,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import ApiService from '../../services/ApiService';
import type { AdminTrack } from '../../types';

// Validation error types
interface ValidationDetails {
  passed: number;
  total: number;
  failedTests?: Array<{
    name: string;
    expected: any;
    actual: any;
    error: string | null;
  }>;
}

interface ValidationError {
  challengeId: string;
  challengeTitle: string;
  message: string;
  errors: string[];
  details: ValidationDetails | null;
}

// Slot conflict error types
interface SlotConflictError {
  challengeId: string;
  challengeTitle: string;
  message: string;
  existingTrack: {
    title: string;
    slug: string;
    language: string;
  };
}

// Available challenge type from API
interface AvailableChallenge {
  _id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  supportedLanguages: string[];
  topics: string[];
  tags: string[];
  trackAssignments: Record<string, string | null>;
  availableLanguageSlots: string[];
  allSlotsClaimed: boolean;
}

// Type for populated challenge object (when backend returns full challenge data)
interface PopulatedChallenge {
  _id: string;
  title?: string;
  description?: string;
  difficulty?: string;
  topics?: string[];
  slug?: string;
}

// Helper to extract challengeId string (handles both string and populated object)
const getChallengeIdStr = (challengeId: string | PopulatedChallenge): string => {
  if (!challengeId) return '';
  if (typeof challengeId === 'string') return challengeId;
  return challengeId._id || '';
};

// Helper to get populated challenge data if available
const getPopulatedChallenge = (challengeId: string | PopulatedChallenge): PopulatedChallenge | null => {
  if (typeof challengeId === 'object' && challengeId !== null) {
    return challengeId;
  }
  return null;
};

interface TrackChallengeAssignmentProps {
  track: AdminTrack;
  onComplete: () => void;
  onCancel: () => void;
}

const TrackChallengeAssignment: React.FC<TrackChallengeAssignmentProps> = ({
  track,
  onComplete,
  onCancel
}) => {
  const {
    adminChallenges,
    loadAllChallengesAdmin,
    loading,
    addChallengeToTrack,
    removeChallengeFromTrack
  } = useCodeChallenge();

  const [challengeSearchTerm, setChallengeSearchTerm] = useState('');
  const [assigningStates, setAssigningStates] = useState<Record<string, boolean>>({});
  const [removingStates, setRemovingStates] = useState<Record<string, boolean>>({});
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [slotConflictError, setSlotConflictError] = useState<SlotConflictError | null>(null);
  const [bypassingValidation, setBypassingValidation] = useState(false);

  // Available challenges state (fetched from new endpoint)
  const [availableChallenges, setAvailableChallenges] = useState<AvailableChallenge[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);

  // Load admin challenges on mount (needed to display current challenge details)
  useEffect(() => {
    if (adminChallenges.length === 0) {
      loadAllChallengesAdmin();
    }
  }, [adminChallenges.length, loadAllChallengesAdmin]);

  // Fetch available challenges for this track's language
  const fetchAvailableChallenges = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      const response = await ApiService.getAvailableChallengesForLanguage(track.language);
      if (response.success) {
        // Filter out challenges already in this track
        const trackChallengeIds = track.challenges.map(tc => getChallengeIdStr(tc.challengeId));
        const filtered = response.challenges.filter(c => !trackChallengeIds.includes(c._id));
        setAvailableChallenges(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch available challenges:', error);
    } finally {
      setLoadingAvailable(false);
    }
  }, [track.language, track.challenges]);

  // Fetch on mount and when track changes
  useEffect(() => {
    fetchAvailableChallenges();
  }, [fetchAvailableChallenges]);

  // Filter available challenges by search term
  const filteredChallenges = availableChallenges.filter(challenge =>
    challenge.title.toLowerCase().includes(challengeSearchTerm.toLowerCase()) ||
    challenge.description?.toLowerCase().includes(challengeSearchTerm.toLowerCase())
  );

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-400';
      case 'intermediate': return 'bg-amber-500/10 text-amber-400';
      case 'advanced': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const handleAssignChallenge = async (challengeId: string, skipValidation = false) => {
    setAssigningStates(prev => ({ ...prev, [challengeId]: true }));

    try {
      const nextOrder = track.challenges.length + 1;
      await addChallengeToTrack(track.language, track.slug, {
        challengeId,
        order: nextOrder,
        isOptional: false,
        skipValidation
      });
      // Clear any previous errors on success
      if (validationError?.challengeId === challengeId) {
        setValidationError(null);
      }
      if (slotConflictError?.challengeId === challengeId) {
        setSlotConflictError(null);
      }
      // Refresh available challenges list
      await fetchAvailableChallenges();
    } catch (error: any) {
      console.error('Error assigning challenge:', error);

      const errorData = error.response?.data;
      const challenge = availableChallenges.find(c => c._id === challengeId) ||
                        adminChallenges.find(c => c._id === challengeId);

      // Check if this is a slot conflict error (existingTrack in response)
      if (errorData?.existingTrack) {
        setSlotConflictError({
          challengeId,
          challengeTitle: challenge?.title || 'Unknown Challenge',
          message: errorData.message || 'This challenge is already assigned to another track',
          existingTrack: errorData.existingTrack
        });
      }
      // Check if this is a validation error (400 with errors array)
      else if (errorData?.statusCode === 400 && errorData?.errors) {
        setValidationError({
          challengeId,
          challengeTitle: challenge?.title || 'Unknown Challenge',
          message: errorData.message || 'Validation failed',
          errors: errorData.errors || [],
          details: errorData.details || null
        });
      }
    } finally {
      setAssigningStates(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const handleAddAnyway = async () => {
    if (!validationError) return;

    setBypassingValidation(true);
    try {
      await handleAssignChallenge(validationError.challengeId, true);
      setValidationError(null);
    } finally {
      setBypassingValidation(false);
    }
  };

  const closeValidationModal = () => {
    setValidationError(null);
  };

  const closeSlotConflictModal = () => {
    setSlotConflictError(null);
  };

  const handleRemoveChallenge = async (challengeId: string) => {
    setRemovingStates(prev => ({ ...prev, [challengeId]: true }));

    try {
      await removeChallengeFromTrack(track.language, track.slug, challengeId);
      // Refresh available challenges since the removed challenge's slot is now free
      await fetchAvailableChallenges();
    } catch (error) {
      console.error('Error removing challenge:', error);
    } finally {
      setRemovingStates(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  return (
    <div>
      {/* Header Card */}
      <div className="card mb-6">
        <div className="p-4 border-b border-[#2a2a2e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="p-2 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h5 className="font-mono font-semibold text-[#f5f5f4]">Manage Challenges</h5>
                <p className="text-sm text-[#6b6b70]">{track.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
              <button onClick={onComplete} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Challenges */}
        <div className="card">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h6 className="font-mono font-semibold text-[#f5f5f4]">
              Current Challenges ({track.challenges.length})
            </h6>
          </div>
          <div className="p-4">
            {loading.adminChallenges ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-[#6b6b70]">Loading challenge details...</p>
              </div>
            ) : track.challenges.length === 0 ? (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
                <h6 className="text-[#6b6b70] font-medium">No challenges assigned</h6>
                <p className="text-sm text-[#6b6b70]">
                  Start by assigning challenges from the available list.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {track.challenges
                  .sort((a, b) => a.order - b.order)
                  .map((challenge, index) => {
                    const challengeIdStr = getChallengeIdStr(challenge.challengeId as string | PopulatedChallenge);
                    const fullChallenge = adminChallenges.find(c => c._id === challengeIdStr);

                    // Get title from populated object if available, otherwise use ID
                    const populatedChallenge = getPopulatedChallenge(challenge.challengeId as string | PopulatedChallenge);
                    const displayTitle = fullChallenge?.title || populatedChallenge?.title || `Challenge ${challengeIdStr.slice(-6)}`;
                    const displayDifficulty = fullChallenge?.difficulty || populatedChallenge?.difficulty || 'unknown';
                    const displayTopics = fullChallenge?.topics || populatedChallenge?.topics || [];
                    const displayDescription = fullChallenge?.description || populatedChallenge?.description || '';

                    return (
                      <div key={challengeIdStr} className="p-3 bg-[#1c1c1f] rounded-lg border border-[#2a2a2e] hover:border-[#3a3a3f] transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="mt-1">
                              <GripVertical className="w-4 h-4 text-[#6b6b70] cursor-move" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-xs bg-[#2a2a2e] text-[#a1a1aa] font-mono">
                                  #{challenge.order}
                                </span>
                                <h6 className="font-medium text-[#f5f5f4] truncate">{displayTitle}</h6>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyClasses(displayDifficulty)}`}>
                                  {displayDifficulty}
                                </span>
                                <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/10 text-cyan-400">
                                  {displayTopics[0] || 'General'}
                                </span>
                                {challenge.isOptional && (
                                  <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">
                                    Optional
                                  </span>
                                )}
                              </div>
                              {displayDescription && (
                                <p className="text-sm text-[#6b6b70] line-clamp-2">
                                  {displayDescription}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              disabled={index === 0}
                              className="p-1 rounded border border-[#2a2a2e] text-[#6b6b70] hover:text-[#f5f5f4] hover:bg-[#2a2a2e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={index === track.challenges.length - 1}
                              className="p-1 rounded border border-[#2a2a2e] text-[#6b6b70] hover:text-[#f5f5f4] hover:bg-[#2a2a2e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveChallenge(challengeIdStr)}
                              disabled={removingStates[challengeIdStr]}
                              className="p-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                            >
                              {removingStates[challengeIdStr] ? (
                                <div className="spinner w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Available Challenges */}
        <div className="card">
          <div className="p-4 border-b border-[#2a2a2e]">
            <div className="flex items-center justify-between">
              <h6 className="font-mono font-semibold text-[#f5f5f4]">Available Challenges</h6>
              {!loadingAvailable && (
                <span className="text-xs text-[#6b6b70]">
                  {availableChallenges.length} available for {track.language}
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
              <input
                type="text"
                placeholder="Search available challenges..."
                value={challengeSearchTerm}
                onChange={(e) => setChallengeSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-3">
              {loadingAvailable ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-[#6b6b70]">Loading available challenges...</p>
                </div>
              ) : filteredChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
                  <h6 className="text-[#6b6b70] font-medium">No available challenges</h6>
                  <p className="text-sm text-[#6b6b70]">
                    {challengeSearchTerm
                      ? "No challenges match your search criteria."
                      : `No ${track.language} challenges with available slots. Create new challenges or remove existing assignments.`
                    }
                  </p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => (
                  <div key={challenge._id} className="p-3 bg-[#1c1c1f] rounded-lg border border-[#2a2a2e] hover:border-[#3a3a3f] transition-colors">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h6 className="font-medium text-[#f5f5f4] mb-2 truncate">{challenge.title}</h6>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyClasses(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/10 text-cyan-400">
                            {challenge.topics?.[0] || 'General'}
                          </span>
                        </div>
                        <p className="text-sm text-[#6b6b70] line-clamp-2">
                          {challenge.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignChallenge(challenge._id)}
                        disabled={assigningStates[challenge._id]}
                        className="btn-primary text-sm flex items-center gap-1 flex-shrink-0"
                      >
                        {assigningStates[challenge._id] ? (
                          <div className="spinner w-4 h-4" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Assign
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Error Modal */}
      {validationError && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-mono font-semibold text-[#f5f5f4]">
                  Challenge Validation Failed
                </h3>
                <p className="text-sm text-[#6b6b70]">
                  {validationError.challengeTitle}
                </p>
              </div>
              <button
                onClick={closeValidationModal}
                className="ml-auto p-1 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {/* Error Summary */}
              {validationError.details ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">
                      {validationError.details.passed}/{validationError.details.total} tests passed
                    </span>
                  </div>
                  <p className="text-sm text-[#a1a1aa]">
                    The solution for this challenge failed {validationError.details.total - validationError.details.passed} test case(s).
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  {validationError.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-red-400 text-sm mb-1">
                      <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Failed Tests List */}
              {validationError.details?.failedTests && validationError.details.failedTests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[#f5f5f4] mb-2">Failed Tests:</h4>
                  {validationError.details.failedTests.map((test, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 font-medium text-sm">{test.name}</span>
                      </div>
                      <div className="text-xs font-mono space-y-1">
                        <div className="flex gap-2">
                          <span className="text-[#6b6b70]">Expected:</span>
                          <span className="text-green-400">{JSON.stringify(test.expected)}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[#6b6b70]">Actual:</span>
                          <span className="text-red-400">{JSON.stringify(test.actual)}</span>
                        </div>
                        {test.error && (
                          <div className="flex gap-2">
                            <span className="text-[#6b6b70]">Error:</span>
                            <span className="text-red-400">{test.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning Message */}
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-400">
                  <strong>Warning:</strong> Students will not be able to solve this challenge correctly until the solution is fixed.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2a2a2e] flex justify-end gap-3">
              <button
                onClick={closeValidationModal}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAnyway}
                disabled={bypassingValidation}
                className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {bypassingValidation ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner w-4 h-4" />
                    Adding...
                  </span>
                ) : (
                  'Add Anyway (Not Recommended)'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Conflict Error Modal */}
      {slotConflictError && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#2a2a2e] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-mono font-semibold text-[#f5f5f4]">
                  Challenge Already Assigned
                </h3>
                <p className="text-sm text-[#6b6b70]">
                  {slotConflictError.challengeTitle}
                </p>
              </div>
              <button
                onClick={closeSlotConflictModal}
                className="p-1 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <p className="text-[#a1a1aa] mb-4">
                This challenge's <span className="text-amber-400 font-medium">{slotConflictError.existingTrack.language}</span> slot is already assigned to:
              </p>

              <div className="p-3 bg-[#0a0a0b] rounded-lg border border-[#2a2a2e] mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#f5f5f4]">{slotConflictError.existingTrack.title}</h4>
                    <p className="text-sm text-[#6b6b70]">{slotConflictError.existingTrack.language} track</p>
                  </div>
                  <a
                    href={`/admin/code-lab/tracks/${slotConflictError.existingTrack.language}/${slotConflictError.existingTrack.slug}`}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Track
                  </a>
                </div>
              </div>

              <p className="text-sm text-[#6b6b70]">
                Each challenge can only be assigned to one track per language. Remove it from "{slotConflictError.existingTrack.title}" first if you want to add it here.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2a2a2e] flex justify-end">
              <button
                onClick={closeSlotConflictModal}
                className="btn-primary"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackChallengeAssignment;