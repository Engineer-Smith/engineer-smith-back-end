// src/pages/AvailableTestsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  BookOpen,
  Clock,
  Filter,
  Play,
  RotateCcw,
  Search,
  X
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import ApiService from '../services/ApiService';

// Types
interface TestAttempts {
  total: number | 'unlimited';
  used: number;
  remaining: number | 'unlimited';
  unlimited?: boolean;
}

interface StudentTest {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  attempts: TestAttempts;
  canTakeTest: boolean;
  hasOverride: boolean;
}

// Difficulty badge colors
const difficultyColors: Record<string, string> = {
  easy: 'badge-green',
  medium: 'badge-amber',
  hard: 'badge-red'
};

type SortOption = 'title' | 'difficulty' | 'questions' | 'time';
type FilterDifficulty = 'all' | 'easy' | 'medium' | 'hard';

export default function AvailableTestsPage() {
  const navigate = useNavigate();
  const { submitAttemptRequest } = useNotifications();

  // Data state
  const [tests, setTests] = useState<StudentTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [showFilters, setShowFilters] = useState(false);

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<StudentTest | null>(null);
  const [requestForm, setRequestForm] = useState({ attempts: 1, reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ApiService.getStudentDashboard();
      setTests(data.tests || []);
    } catch (err) {
      console.error('Failed to fetch tests:', err);
      setError('Failed to load available tests');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort tests
  const filteredTests = tests
    .filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = filterDifficulty === 'all' || test.difficulty === filterDifficulty;
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        case 'questions':
          return b.questionCount - a.questionCount;
        case 'time':
          return a.timeLimit - b.timeLimit;
        default:
          return 0;
      }
    });

  const handleRequestAttempts = async () => {
    if (!selectedTest || !requestForm.reason.trim()) return;

    setSubmitting(true);
    try {
      await submitAttemptRequest({
        testId: selectedTest._id,
        requestedAttempts: requestForm.attempts,
        reason: requestForm.reason
      });
      setShowRequestModal(false);
      setRequestForm({ attempts: 1, reason: '' });
      setSelectedTest(null);
    } catch (err) {
      console.error('Failed to submit request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading tests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Tests</h2>
          <p className="text-[#a1a1aa] mb-4">{error}</p>
          <button onClick={fetchTests} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">Available Tests</h1>
          <p className="text-[#a1a1aa]">
            Browse and take assessments assigned to you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary md:hidden flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </button>

              {/* Desktop Filters */}
              <div className="hidden md:flex gap-3">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as FilterDifficulty)}
                  className="select"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="select"
                >
                  <option value="title">Sort by Name</option>
                  <option value="difficulty">Sort by Difficulty</option>
                  <option value="questions">Sort by Questions</option>
                  <option value="time">Sort by Time</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters (Collapsible) */}
            {showFilters && (
              <div className="md:hidden mt-4 pt-4 border-t border-[#2a2a2e] grid grid-cols-2 gap-3">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as FilterDifficulty)}
                  className="select"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="select"
                >
                  <option value="title">Sort by Name</option>
                  <option value="difficulty">Sort by Difficulty</option>
                  <option value="questions">Sort by Questions</option>
                  <option value="time">Sort by Time</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-[#6b6b70]">
          Showing {filteredTests.length} of {tests.length} tests
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen className="w-16 h-16 text-[#3a3a3f] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#f5f5f4] mb-2">
              {tests.length === 0 ? 'No Tests Available' : 'No Matching Tests'}
            </h3>
            <p className="text-[#6b6b70]">
              {tests.length === 0
                ? 'Check back later for new assessments'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map(test => {
              const isUnlimited = test.attempts.unlimited === true ||
                test.attempts.total === 'unlimited' ||
                test.attempts.remaining === 'unlimited';
              const hasRemainingAttempts = isUnlimited ||
                (typeof test.attempts.remaining === 'number' && test.attempts.remaining > 0);
              const progressPercent = isUnlimited
                ? 0
                : (test.attempts.used / (test.attempts.total as number)) * 100;

              return (
                <div key={test._id} className="card hover:border-[#3a3a3f] transition-all">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-[#f5f5f4] pr-2 line-clamp-1">
                        {test.title}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <span className={difficultyColors[test.difficulty]}>
                          {test.difficulty}
                        </span>
                        {test.hasOverride && (
                          <span className="badge-amber">Override</span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[#6b6b70] text-sm mb-4 line-clamp-2">
                      {test.description || 'No description available'}
                    </p>

                    {/* Meta Info */}
                    <div className="flex justify-between text-sm text-[#a1a1aa] mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {test.questionCount} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {test.timeLimit} min
                      </span>
                    </div>

                    {/* Attempt Information */}
                    <div className="flex justify-between text-sm mb-3">
                      <span className={hasRemainingAttempts ? 'text-green-400' : 'text-red-400'}>
                        Attempts: {test.attempts.used}/{isUnlimited ? '∞' : test.attempts.total}
                      </span>
                      <span className="text-[#6b6b70]">
                        {isUnlimited
                          ? 'Unlimited'
                          : hasRemainingAttempts
                            ? `${test.attempts.remaining} remaining`
                            : 'No attempts left'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {!isUnlimited ? (
                      <div className="progress-bar mb-4">
                        <div
                          className={`progress-fill ${hasRemainingAttempts ? '' : 'bg-red-500'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    ) : (
                      <div className="mb-4 text-xs text-green-400 flex items-center gap-1">
                        <Award size={12} />
                        Unlimited attempts available
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {(isUnlimited || hasRemainingAttempts) && (isUnlimited || test.canTakeTest) ? (
                        <button
                          className="btn-primary flex-1 flex items-center justify-center gap-2"
                          onClick={() => navigate(`/test-details/${test._id}`)}
                        >
                          <Play size={16} />
                          Start Test
                        </button>
                      ) : (
                        <button
                          className="btn-secondary flex-1 opacity-50 cursor-not-allowed"
                          disabled
                        >
                          No Attempts Left
                        </button>
                      )}

                      <button
                        className="btn-secondary px-3"
                        onClick={() => {
                          setSelectedTest(test);
                          setShowRequestModal(true);
                        }}
                        title="Request additional attempts"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>

                    {/* Exhausted Badge */}
                    {!hasRemainingAttempts && (
                      <div className="mt-3">
                        <span className="badge-red flex items-center gap-1 w-fit">
                          <AlertCircle size={12} />
                          Exhausted
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Attempts Modal */}
      {showRequestModal && selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
              <h3 className="font-mono font-semibold">Request Additional Attempts</h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedTest(null);
                  setRequestForm({ attempts: 1, reason: '' });
                }}
                className="p-1 hover:bg-[#2a2a2e] rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[#a1a1aa] mb-4">
                Request more attempts for <strong className="text-[#f5f5f4]">{selectedTest.title}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Number of Attempts</label>
                <select
                  value={requestForm.attempts}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, attempts: parseInt(e.target.value) }))}
                  className="select w-full"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} attempt{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason for Request</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please explain why you need additional attempts..."
                  className="input w-full h-24 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedTest(null);
                    setRequestForm({ attempts: 1, reason: '' });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAttempts}
                  disabled={!requestForm.reason.trim() || submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
