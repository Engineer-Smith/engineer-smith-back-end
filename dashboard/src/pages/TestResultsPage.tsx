import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Trophy,
  Percent,
  List,
  Search,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Crown,
  AlertTriangle,
  RotateCcw,
  Play,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { PopulatedResult } from '../types';

interface ResultsStats {
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  bestScore: number;
}

interface TestGroup {
  testId: string;
  testTitle: string;
  results: PopulatedResult[];
  bestScore: number;
  bestAttempt: PopulatedResult;
  totalAttempts: number;
  passedAttempts: number;
}

const TestResultsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<PopulatedResult[]>([]);
  const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<ResultsStats>({
    totalAttempts: 0,
    passedAttempts: 0,
    averageScore: 0,
    bestScore: 0
  });

  const isRequestInProgress = useRef(false);

  useEffect(() => {
    if (!isRequestInProgress.current) {
      fetchResults();
    }
  }, []);

  useEffect(() => {
    groupResultsByTest();
  }, [results, searchTerm, statusFilter]);

  const fetchResults = async () => {
    if (isRequestInProgress.current) return;

    isRequestInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      // Backend returns populated results directly - filter by current user
      const fetchedResults = await apiService.getAllResults({
        userId: user?._id
      }) as PopulatedResult[];

      // Validate that we got an array
      if (!Array.isArray(fetchedResults)) {
        throw new Error('Invalid results format received');
      }

      // Filter to only show current user's results (extra safety)
      const userResults = fetchedResults.filter(result =>
        result.userId._id === user?._id
      );

      setResults(userResults);
      calculateStats(userResults);

    } catch (err) {
      console.error('Results fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;
    }
  };

  const calculateStats = (results: PopulatedResult[]) => {
    if (results.length === 0) {
      setStats({
        totalAttempts: 0,
        passedAttempts: 0,
        averageScore: 0,
        bestScore: 0
      });
      return;
    }

    const completedResults = results.filter(r => r.status === 'completed');
    const passedResults = completedResults.filter(r => r.score.passed);
    const scores = completedResults.map(r => (r.score.earnedPoints / r.score.totalPoints) * 100);

    setStats({
      totalAttempts: results.length,
      passedAttempts: passedResults.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestScore: scores.length > 0 ? Math.round(Math.max(...scores)) : 0
    });
  };

  const groupResultsByTest = () => {
    // Group results by testId (using populated object ID)
    const groupedResults = results.reduce((acc, result) => {
      const testId = result.testId._id;
      if (!acc[testId]) {
        acc[testId] = [];
      }
      acc[testId].push(result);
      return acc;
    }, {} as Record<string, PopulatedResult[]>);

    // Create test groups with metadata
    const groups: TestGroup[] = Object.entries(groupedResults).map(([testId, testResults]) => {
      const completedResults = testResults.filter(r => r.status === 'completed');
      const passedResults = completedResults.filter(r => r.score.passed);
      const scores = completedResults.map(r => (r.score.earnedPoints / r.score.totalPoints) * 100);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const bestAttempt = completedResults.find(r =>
        (r.score.earnedPoints / r.score.totalPoints) * 100 === bestScore
      ) || testResults[0];

      return {
        testId,
        testTitle: testResults[0].testId.title || `Test ${testId.slice(-6)}`,
        results: testResults.sort((a, b) => b.attemptNumber - a.attemptNumber), // Latest first
        bestScore: Math.round(bestScore),
        bestAttempt,
        totalAttempts: testResults.length,
        passedAttempts: passedResults.length
      };
    });

    // Apply filters
    let filteredGroups = groups;

    if (searchTerm) {
      filteredGroups = groups.filter(group =>
        group.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.testId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'passed') {
        filteredGroups = filteredGroups.filter(group => group.passedAttempts > 0);
      } else if (statusFilter === 'failed') {
        filteredGroups = filteredGroups.filter(group =>
          group.totalAttempts > 0 && group.passedAttempts === 0
        );
      } else {
        filteredGroups = filteredGroups.filter(group =>
          group.results.some(r => r.status === statusFilter)
        );
      }
    }

    // Sort by most recent attempt
    filteredGroups.sort((a, b) => {
      const aLatest = new Date(a.results[0]?.createdAt || 0).getTime();
      const bLatest = new Date(b.results[0]?.createdAt || 0).getTime();
      return bLatest - aLatest;
    });

    setTestGroups(filteredGroups);
  };

  const toggleTestExpansion = (testId: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  const handleViewDetails = (resultId: string) => {
    navigate(`/result-details/${resultId}`);
  };

  const getStatusBadgeClass = (status: string, passed?: boolean): string => {
    if (status === 'completed') {
      return passed ? 'badge-green' : 'badge-red';
    }
    const classes: Record<string, string> = {
      expired: 'badge-amber',
      abandoned: 'badge-gray'
    };
    return classes[status] || 'badge-gray';
  };

  const getStatusText = (result: PopulatedResult): string => {
    if (result.status === 'completed') {
      return result.score.passed ? 'Passed' : 'Failed';
    }
    return result.status.charAt(0).toUpperCase() + result.status.slice(1);
  };

  const formatScore = (result: PopulatedResult): string => {
    const percentage = ((result.score.earnedPoints / result.score.totalPoints) * 100).toFixed(1);
    return `${result.score.earnedPoints}/${result.score.totalPoints} (${percentage}%)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] pt-20">
        <div className="container-section flex justify-center items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="mt-3 text-[#a1a1aa]">Loading your test results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-20">
      <div className="container-section">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-mono text-2xl font-bold mb-1 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              My Test Results
            </h1>
            <p className="text-[#a1a1aa]">
              View your assessment history organized by test
            </p>
          </div>
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/25 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button className="btn-danger text-sm flex items-center gap-2" onClick={fetchResults}>
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-6 text-center">
            <div
              className="mx-auto mb-3 p-3 rounded-full inline-flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600"
              style={{ width: '60px', height: '60px' }}
            >
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-mono text-2xl font-bold mb-1">{stats.totalAttempts}</h4>
            <p className="text-[#6b6b70] text-sm">Total Attempts</p>
          </div>

          <div className="card p-6 text-center">
            <div
              className="mx-auto mb-3 p-3 rounded-full inline-flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500"
              style={{ width: '60px', height: '60px' }}
            >
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-mono text-2xl font-bold mb-1">{stats.passedAttempts}</h4>
            <p className="text-[#6b6b70] text-sm">Passed</p>
          </div>

          <div className="card p-6 text-center">
            <div
              className="mx-auto mb-3 p-3 rounded-full inline-flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500"
              style={{ width: '60px', height: '60px' }}
            >
              <Percent className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-mono text-2xl font-bold mb-1">{stats.bestScore}%</h4>
            <p className="text-[#6b6b70] text-sm">Best Score</p>
          </div>

          <div className="card p-6 text-center">
            <div
              className="mx-auto mb-3 p-3 rounded-full inline-flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500"
              style={{ width: '60px', height: '60px' }}
            >
              <List className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-mono text-2xl font-bold mb-1">{testGroups.length}</h4>
            <p className="text-[#6b6b70] text-sm">Tests Taken</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select"
            >
              <option value="all">All Results</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
              <option value="abandoned">Abandoned</option>
            </select>
            <div className="text-[#6b6b70] text-sm flex items-center">
              Showing {testGroups.length} tests
            </div>
          </div>
        </div>

        {/* Test Groups */}
        {testGroups.length === 0 ? (
          <div className="card p-8 text-center">
            <Trophy className="w-12 h-12 text-[#6b6b70] mx-auto mb-3" />
            <h5 className="font-mono text-lg font-semibold mb-2">No Results Found</h5>
            <p className="text-[#a1a1aa] mb-4">
              {results.length === 0
                ? "You haven't taken any tests yet"
                : "No results match your current filters"
              }
            </p>
            {results.length === 0 && (
              <button className="btn-primary flex items-center gap-2 mx-auto" onClick={() => navigate('/dashboard')}>
                <Play className="w-4 h-4" />
                Take Your First Test
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {testGroups.map((group) => (
              <div key={group.testId} className="card">
                {/* Collapsible Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-[#1a1a1e] transition-colors"
                  onClick={() => toggleTestExpansion(group.testId)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {expandedTests.has(group.testId) ? (
                        <ChevronDown className="w-5 h-5 text-[#6b6b70]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#6b6b70]" />
                      )}
                      <div>
                        <h5 className="font-mono text-lg font-semibold mb-1">{group.testTitle}</h5>
                        <div className="flex gap-2 flex-wrap">
                          <span className="badge-purple text-xs">
                            {group.totalAttempts} attempt{group.totalAttempts !== 1 ? 's' : ''}
                          </span>
                          {group.passedAttempts > 0 && (
                            <span className="badge-green text-xs">
                              {group.passedAttempts} passed
                            </span>
                          )}
                          <span className="badge-amber text-xs">
                            Best: {group.bestScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-24 progress-bar mb-1">
                        <div
                          className={`progress-fill ${group.passedAttempts > 0 ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${group.bestScore}%` }}
                        />
                      </div>
                      <small className="text-[#6b6b70]">
                        Latest: {new Date(group.results[0].createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTests.has(group.testId) && (
                  <div className="border-t border-[#2a2a2e]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#2a2a2e] bg-[#1a1a1e]">
                            <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Attempt</th>
                            <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Score</th>
                            <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Result</th>
                            <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Date</th>
                            <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.results.map((result) => {
                            const percentage = (result.score.earnedPoints / result.score.totalPoints) * 100;
                            return (
                              <tr key={result._id} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1e]">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <strong className="text-[#f5f5f4]">#{result.attemptNumber}</strong>
                                    {result._id === group.bestAttempt._id && (
                                      <span className="badge-amber text-xs flex items-center gap-1">
                                        <Crown className="w-3 h-3" />
                                        Best
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-20 progress-bar">
                                        <div
                                          className={`progress-fill ${result.score.passed ? 'bg-green-500' : 'bg-red-500'}`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                      <small className="font-bold text-[#f5f5f4]">
                                        {percentage.toFixed(1)}%
                                      </small>
                                    </div>
                                    <small className="text-[#6b6b70]">
                                      {formatScore(result)}
                                    </small>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={getStatusBadgeClass(result.status, result.score.passed)}>
                                    {getStatusText(result)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div>
                                    <small className="text-[#a1a1aa] block">
                                      {new Date(result.createdAt).toLocaleDateString()}
                                    </small>
                                    <small className="text-[#6b6b70]">
                                      {new Date(result.createdAt).toLocaleTimeString()}
                                    </small>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    className="btn-secondary text-xs flex items-center gap-1"
                                    onClick={() => handleViewDetails(result._id)}
                                  >
                                    <Eye className="w-3 h-3" />
                                    Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultsPage;
