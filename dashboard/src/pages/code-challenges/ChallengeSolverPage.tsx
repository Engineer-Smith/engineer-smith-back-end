import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import {
  ChallengeProblemPane,
  ChallengeEditorPane,
  ChallengeTestResultsPane,
  ChallengeSuccessModal
} from '../../components/code-challenges/student';
import { LanguageBadge, DifficultyBadge } from '../../components/code-challenges/shared';
import type { ProgrammingLanguage } from '../../types/codeChallenge';

const ChallengeSolverPage: React.FC = () => {
  const { language: trackLanguage, trackSlug, challengeId } = useParams<{
    language: string;
    trackSlug: string;
    challengeId: string;
  }>();
  const navigate = useNavigate();

  const {
    currentChallenge,
    currentTrack,
    testResults,
    loading,
    errors,
    loadChallenge,
    loadTrack,
    testCode,
    submitCode
  } = useCodeChallenge();

  // Local state
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('javascript');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [hasTestedCode, setHasTestedCode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  const [localTestResults, setLocalTestResults] = useState<any>(null);

  // Panel resize state
  const [leftPanelWidth] = useState(25);
  const [rightPanelWidth] = useState(25);

  // Load challenge and track data
  useEffect(() => {
    if (challengeId) {
      loadChallenge(challengeId);
    }
    if (trackLanguage && trackSlug) {
      loadTrack(trackLanguage, trackSlug);
    }
  }, [challengeId, trackLanguage, trackSlug, loadChallenge, loadTrack]);

  // Initialize code when challenge loads
  useEffect(() => {
    if (currentChallenge) {
      // Set initial language based on track or supported languages
      const initialLang = (trackLanguage as ProgrammingLanguage) ||
        currentChallenge.supportedLanguages[0] ||
        'javascript';
      setSelectedLanguage(initialLang);

      // Check for saved solution first, then fall back to starting code
      const userProgress = (currentChallenge as any).userProgress;
      const savedSolution = userProgress?.solutions?.[initialLang]?.code;
      const startingCode = currentChallenge.startingCode?.[initialLang] || '';
      setCode(savedSolution || startingCode);

      // Reset test state
      setHasTestedCode(false);
      setLocalTestResults(null);
      setSubmissionAttempts(0);
    }
  }, [currentChallenge, trackLanguage]);

  // Helper to get challenge ID string (handles both string and populated object)
  const getChallengeIdStr = (challengeId: string | { _id: string } | undefined) => {
    if (!challengeId) return undefined;
    return typeof challengeId === 'string' ? challengeId : challengeId._id;
  };

  // Get track position info
  const getTrackPosition = useCallback(() => {
    if (!currentTrack || !challengeId) return { current: 0, total: 0, hasNext: false, hasPrev: false };

    const challenges = currentTrack.challenges || [];
    const sortedChallenges = [...challenges].sort((a: any, b: any) => a.order - b.order);
    const currentIndex = sortedChallenges.findIndex((c: any) => getChallengeIdStr(c.challengeId) === challengeId);

    return {
      current: currentIndex + 1,
      total: sortedChallenges.length,
      hasNext: currentIndex < sortedChallenges.length - 1,
      hasPrev: currentIndex > 0,
      nextChallengeId: getChallengeIdStr(sortedChallenges[currentIndex + 1]?.challengeId),
      prevChallengeId: getChallengeIdStr(sortedChallenges[currentIndex - 1]?.challengeId)
    };
  }, [currentTrack, challengeId]);

  const trackPosition = getTrackPosition();

  // Handle run tests
  const handleRunTests = async () => {
    if (!challengeId || !code) return;

    try {
      const results = await testCode(challengeId, selectedLanguage, code);
      setLocalTestResults(results);
      setHasTestedCode(true);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!challengeId || !code) return;

    try {
      setSubmissionAttempts(prev => prev + 1);
      const result = await submitCode(challengeId, selectedLanguage, code);

      setLocalTestResults(result.results);

      if (result.results?.overallPassed) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  // Handle hint reveal
  const handleRevealHint = () => {
    if (currentChallenge?.hints && hintsRevealed < currentChallenge.hints.length) {
      setHintsRevealed(prev => prev + 1);
    }
  };

  // Handle code reset
  const handleCodeReset = () => {
    setHasTestedCode(false);
    setLocalTestResults(null);
  };

  // Navigate to next challenge
  const handleNextChallenge = () => {
    if (trackPosition.nextChallengeId && trackLanguage && trackSlug) {
      navigate(`/code-lab/${trackLanguage}/${trackSlug}/${trackPosition.nextChallengeId}`);
      setShowSuccessModal(false);
    }
  };

  // Navigate back to track
  const handleBackToTrack = () => {
    if (trackLanguage && trackSlug) {
      navigate(`/code-lab/${trackLanguage}/${trackSlug}`);
    } else {
      navigate('/code-lab');
    }
    setShowSuccessModal(false);
  };

  // Loading state
  if (loading.challenge && !currentChallenge) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading challenge...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (errors.challenge) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
            Failed to Load Challenge
          </h2>
          <p className="text-[#a1a1aa] mb-4">
            {typeof errors.challenge === 'string' ? errors.challenge : 'Failed to load challenge'}
          </p>
          <button
            className="btn-primary"
            onClick={() => challengeId && loadChallenge(challengeId)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
            Challenge Not Found
          </h2>
          <p className="text-[#a1a1aa] mb-4">
            The challenge you're looking for doesn't exist.
          </p>
          <button className="btn-primary" onClick={() => navigate('/code-lab')}>
            Back to Code Lab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0a0a0b]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2e] bg-[#0a0a0b]">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <Link
            to={trackLanguage && trackSlug ? `/code-lab/${trackLanguage}/${trackSlug}` : '/code-lab'}
            className="flex items-center gap-1 text-[#6b6b70] hover:text-[#a1a1aa] transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm hidden sm:inline">Back to Track</span>
          </Link>

          {/* Challenge Title */}
          <div className="flex items-center gap-2">
            <h1 className="font-mono font-semibold text-[#f5f5f4] truncate max-w-[200px] md:max-w-none">
              {currentChallenge.title}
            </h1>
            <DifficultyBadge difficulty={currentChallenge.difficulty} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Track Progress */}
          {trackPosition.total > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => trackPosition.prevChallengeId && navigate(`/code-lab/${trackLanguage}/${trackSlug}/${trackPosition.prevChallengeId}`)}
                disabled={!trackPosition.hasPrev}
                className="p-1 text-[#6b6b70] hover:text-[#a1a1aa] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-[#a1a1aa]">
                {trackPosition.current} / {trackPosition.total}
              </span>
              <button
                onClick={() => trackPosition.nextChallengeId && navigate(`/code-lab/${trackLanguage}/${trackSlug}/${trackPosition.nextChallengeId}`)}
                disabled={!trackPosition.hasNext}
                className="p-1 text-[#6b6b70] hover:text-[#a1a1aa] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Language Badge */}
          <LanguageBadge language={selectedLanguage} size="sm" />
        </div>
      </div>

      {/* 3-Pane Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Pane - Problem */}
        <div
          className="border-r border-[#2a2a2e] bg-[#0f0f10] overflow-hidden"
          style={{ width: `${leftPanelWidth}%`, minWidth: '250px' }}
        >
          <ChallengeProblemPane
            challenge={currentChallenge}
            hintsRevealed={hintsRevealed}
            onRevealHint={handleRevealHint}
          />
        </div>

        {/* Center Pane - Editor */}
        <div
          className="flex-1 min-w-0 border-r border-[#2a2a2e] overflow-hidden"
          style={{ minWidth: '300px' }}
        >
          <ChallengeEditorPane
            code={code}
            language={selectedLanguage}
            supportedLanguages={currentChallenge.supportedLanguages}
            onCodeChange={setCode}
            onLanguageChange={(lang) => {
              setSelectedLanguage(lang);
              // Check for saved solution first, then fall back to starting code
              const userProgress = (currentChallenge as any).userProgress;
              const savedSolution = userProgress?.solutions?.[lang]?.code;
              const startingCode = currentChallenge.startingCode?.[lang] || '';
              setCode(savedSolution || startingCode);
            }}
            onReset={handleCodeReset}
            startingCode={currentChallenge.startingCode || {}}
            disabled={loading.testing || loading.submitting}
          />
        </div>

        {/* Right Pane - Test Results */}
        <div
          className="bg-[#0f0f10] overflow-hidden"
          style={{ width: `${rightPanelWidth}%`, minWidth: '250px' }}
        >
          <ChallengeTestResultsPane
            testResults={localTestResults || testResults}
            isRunning={loading.testing}
            isSubmitting={loading.submitting}
            onRunTests={handleRunTests}
            onSubmit={handleSubmit}
            hasTestedCode={hasTestedCode}
          />
        </div>
      </div>

      {/* Success Modal */}
      <ChallengeSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        challengeTitle={currentChallenge.title}
        trackTitle={currentTrack?.title}
        currentPosition={trackPosition.current}
        totalChallenges={trackPosition.total}
        attempts={submissionAttempts}
        onNextChallenge={handleNextChallenge}
        onBackToTrack={handleBackToTrack}
        hasNextChallenge={trackPosition.hasNext}
      />
    </div>
  );
};

export default ChallengeSolverPage;
