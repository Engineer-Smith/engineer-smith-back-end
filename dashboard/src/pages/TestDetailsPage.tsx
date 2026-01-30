// src/pages/TestDetailsPage.tsx - CORRECTED to handle session conflicts properly
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Clock,
  FileText,
  Info,
  Play,
  RotateCcw,
  Target,
  X
} from 'lucide-react';
import apiService from '../services/ApiService';
import type { Language, Test, TestType } from '../types';

const TestDetailsPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);

  // Session conflict handling
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [existingSession, setExistingSession] = useState<any>(null);
  const [conflictLoading, setConflictLoading] = useState(false);

  useEffect(() => {
    if (testId) {
      fetchTestDetails();
    } else {
      setError('No test ID provided');
      setLoading(false);
    }
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const test = await apiService.getTest(testId!);

      if (!test || !test._id) {
        throw new Error('Invalid test data received');
      }

      setTest(test);
    } catch (err: any) {
      console.error('Error fetching test details:', err);
      setError(err.message || 'Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (forceNew = false) => {
    if (!testId) {
      setError('No test ID available');
      return;
    }

    try {
      setStarting(true);
      setError(null);

      const response = await apiService.startTestSession({
        testId,
        forceNew
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to start test session');
      }

      navigate(`/test-session/${testId}`);
    } catch (err: any) {
      console.error('Failed to start test session:', err);

      if (err.type === 'EXISTING_SESSION_CONFLICT' && err.data?.existingSession) {
        setExistingSession(err.data.existingSession);
        setShowConflictModal(true);
        setShowStartModal(false);
      } else {
        setError(err.message || err.data?.message || 'Failed to start test session');
        setShowStartModal(false);
      }
      setStarting(false);
    }
  };

  const handleRejoinSession = async () => {
    if (!existingSession?.sessionId || !testId) return;

    try {
      setConflictLoading(true);
      navigate(`/test-session/${testId}`);
    } catch (err: any) {
      console.error('Failed to rejoin session:', err);
      setError(err.message || 'Failed to rejoin session');
    } finally {
      setConflictLoading(false);
      setShowConflictModal(false);
    }
  };

  const handleAbandonAndStartNew = async () => {
    try {
      setConflictLoading(true);
      setShowConflictModal(false);
      setShowStartModal(false);
      await handleStartTest(true);
    } catch (err: any) {
      console.error('Failed to start new session:', err);
      setError(err.message || 'Failed to start new session');
      setConflictLoading(false);
    }
  };

  // Helper functions
  const getTestTypeIcon = (testType: TestType) => {
    const icons = {
      frontend_basics: '🌐',
      react_developer: '⚛️',
      fullstack_js: '🔧',
      mobile_development: '📱',
      python_developer: '🐍',
      custom: '📝'
    };
    return icons[testType] || '📝';
  };

  const getTestTypeBadge = (testType: TestType): string => {
    const badges: Record<string, string> = {
      frontend_basics: 'badge-blue',
      react_developer: 'badge-purple',
      fullstack_js: 'badge-green',
      mobile_development: 'badge-amber',
      python_developer: 'badge-gray',
      custom: 'badge-gray'
    };
    return badges[testType] || 'badge-gray';
  };

  const formatLanguages = (languages: Language[]): string => {
    return languages && languages.length > 0 ? languages.join(', ') : 'General';
  };

  const formatDuration = (minutes: number): string => {
    if (typeof minutes !== 'number' || isNaN(minutes)) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const calculateTotalQuestions = (test: Test): number => {
    if (!test) return 0;
    if (test.settings?.useSections && test.sections && Array.isArray(test.sections)) {
      return test.sections.reduce((total, section) => {
        return total + (section?.questions?.length || 0);
      }, 0);
    }
    return test.questions?.length || 0;
  };

  const calculateTotalPoints = (test: Test): number => {
    if (!test) return 0;
    if (test.settings?.useSections && test.sections && Array.isArray(test.sections)) {
      return test.sections.reduce((total, section) => {
        if (!section?.questions || !Array.isArray(section.questions)) return total;
        return total + section.questions.reduce((sectionTotal, q) => {
          return sectionTotal + (typeof q?.points === 'number' ? q.points : 0);
        }, 0);
      }, 0);
    }
    if (!test.questions || !Array.isArray(test.questions)) return 0;
    return test.questions.reduce((total, q) => {
      return total + (typeof q?.points === 'number' ? q.points : 0);
    }, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto w-8 h-8" />
          <p className="text-[#a1a1aa]">Loading test details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !test) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="card p-6 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="text-[#a1a1aa] mb-4">{error || 'Test not found'}</p>
          <button
            className="btn-secondary flex items-center gap-2 mx-auto"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="container-section py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              className="p-2 rounded-lg border border-[#2a2a2e] hover:bg-[#1c1c1f] transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5 text-[#a1a1aa]" />
            </button>
            <div>
              <h1 className="font-mono text-2xl font-bold">Test Details</h1>
              <p className="text-[#6b6b70] text-sm">Review the test information before starting</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Test Overview Card */}
          <div className="card mb-6">
            <div className="p-6 border-b border-[#2a2a2e]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-mono text-xl font-semibold mb-2 flex items-center gap-2">
                    <span>{getTestTypeIcon(test.testType)}</span>
                    {test.title}
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                    <span className={getTestTypeBadge(test.testType)}>
                      {test.testType.replace('_', ' ')}
                    </span>
                    <span className="badge-gray">
                      {test.isGlobal ? 'Global Test' : 'Organization Test'}
                    </span>
                  </div>
                </div>
                <span className={test.status === 'active' ? 'badge-green' : 'badge-gray'}>
                  {test.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <p className="text-[#a1a1aa] mb-6">{test.description}</p>

              {/* Test Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-[#0a0a0b] rounded-lg">
                  <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold">{calculateTotalQuestions(test)}</div>
                  <div className="text-xs text-[#6b6b70]">Questions</div>
                </div>
                <div className="text-center p-4 bg-[#0a0a0b] rounded-lg">
                  <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold">{formatDuration(test.settings?.timeLimit || 0)}</div>
                  <div className="text-xs text-[#6b6b70]">Time Limit</div>
                </div>
                <div className="text-center p-4 bg-[#0a0a0b] rounded-lg">
                  <RotateCcw className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold">{test.settings?.attemptsAllowed || 0}</div>
                  <div className="text-xs text-[#6b6b70]">Attempts</div>
                </div>
                <div className="text-center p-4 bg-[#0a0a0b] rounded-lg">
                  <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold">{calculateTotalPoints(test)}</div>
                  <div className="text-xs text-[#6b6b70]">Total Points</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-[#a1a1aa] mb-1">Languages/Technologies</h4>
                  <p className="text-[#6b6b70]">{formatLanguages(test.languages)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#a1a1aa] mb-1">Question Shuffling</h4>
                  <p className="text-[#6b6b70]">
                    {test.settings?.shuffleQuestions ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              {/* Section Breakdown */}
              {test.settings?.useSections && test.sections && Array.isArray(test.sections) && (
                <div>
                  <h4 className="text-sm font-medium text-[#a1a1aa] mb-3">Test Sections</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {test.sections.map((section, index) => (
                      <div key={index} className="border border-[#2a2a2e] rounded-lg p-4 bg-[#0a0a0b]">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{section?.name || `Section ${index + 1}`}</div>
                            <div className="text-xs text-[#6b6b70]">
                              {section?.questions?.length || 0} questions • {formatDuration(section?.timeLimit || 0)}
                            </div>
                          </div>
                          <span className="badge-blue">
                            {section?.questions?.reduce((sum, q) => sum + (q?.points || 0), 0) || 0} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Start Test Section */}
          <div className="card p-8 text-center">
            <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-mono text-lg font-semibold mb-2">Ready to Start?</h3>
            <p className="text-[#6b6b70] mb-6">
              Click below to begin your test session. The timer will start immediately.
            </p>
            <button
              className="btn-primary flex items-center gap-2 mx-auto px-6 py-3"
              onClick={() => setShowStartModal(true)}
              disabled={starting || test.status !== 'active'}
            >
              {starting ? (
                <div className="spinner w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start Test
            </button>
          </div>
        </div>
      </div>

      {/* Start Confirmation Modal */}
      {showStartModal && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <div className="modal-content w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2e]">
              <h3 className="font-mono text-lg font-semibold">Start Test Confirmation</h3>
              <button
                onClick={() => !starting && setShowStartModal(false)}
                className="text-[#6b6b70] hover:text-[#a1a1aa]"
                disabled={starting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              </div>
              <p className="mb-4"><strong>Important:</strong> Once you start this test, the timer will begin immediately.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <span className="text-green-500">✓</span>
                  You have <strong>{formatDuration(test.settings?.timeLimit || 0)}</strong> to complete the test
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <span className="text-green-500">✓</span>
                  Your progress will be auto-saved
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <span className="text-green-500">✓</span>
                  You can navigate between questions
                </li>
                <li className="flex items-center gap-2 text-[#a1a1aa]">
                  <span className="text-green-500">✓</span>
                  Make sure you have a stable internet connection
                </li>
              </ul>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-[#a1a1aa] text-sm">
                  This test has {test.settings?.attemptsAllowed || 0} attempt(s) allowed.
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-[#2a2a2e]">
              <button
                className="btn-secondary"
                onClick={() => setShowStartModal(false)}
                disabled={starting}
              >
                Cancel
              </button>
              <button
                className="btn-primary flex items-center gap-2"
                onClick={() => handleStartTest(false)}
                disabled={starting}
              >
                {starting ? (
                  <div className="spinner w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {starting ? 'Starting...' : 'Start Test Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Conflict Modal */}
      {showConflictModal && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <div className="modal-content w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2e]">
              <h3 className="font-mono text-lg font-semibold">Existing Session Found</h3>
              <button
                onClick={() => !conflictLoading && setShowConflictModal(false)}
                className="text-[#6b6b70] hover:text-[#a1a1aa]"
                disabled={conflictLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <Clock className="w-12 h-12 text-purple-500 mx-auto" />
              </div>
              <p className="font-medium mb-4">You have an active test session in progress.</p>

              {existingSession && (
                <div className="bg-[#0a0a0b] p-4 rounded-lg mb-4 space-y-2">
                  <div>
                    <div className="text-xs text-[#6b6b70]">Test:</div>
                    <div className="font-medium">{existingSession.testTitle}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6b6b70]">Progress:</div>
                    <div>{existingSession.questionProgress}</div>
                  </div>
                  {existingSession.timeRemaining > 0 && (
                    <div>
                      <div className="text-xs text-[#6b6b70]">Time Remaining:</div>
                      <div className="text-amber-400 font-medium">{formatTimeRemaining(existingSession.timeRemaining)}</div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[#a1a1aa] text-sm">
                You can either continue your existing session or start a new one (which will abandon your current progress).
              </p>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-[#2a2a2e]">
              <button
                className="btn-secondary"
                onClick={() => setShowConflictModal(false)}
                disabled={conflictLoading}
              >
                Cancel
              </button>
              <button
                className="btn-secondary flex items-center gap-2 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                onClick={handleAbandonAndStartNew}
                disabled={conflictLoading}
              >
                {conflictLoading && <div className="spinner w-4 h-4" />}
                Start Fresh
              </button>
              <button
                className="btn-primary flex items-center gap-2"
                onClick={handleRejoinSession}
                disabled={conflictLoading}
              >
                {conflictLoading && <div className="spinner w-4 h-4" />}
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDetailsPage;
