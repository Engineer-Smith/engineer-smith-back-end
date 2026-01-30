import {
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  Eye,
  Search,
  TrendingUp,
  X,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import apiService from '../services/ApiService';
import type { PopulatedResult } from '../types/result';
import DetailedResultScoringPage from './DetailedResultScoringPage';

interface ResultWithTestInfo extends PopulatedResult {
  testTitle: string;
  userName: string;
  userEmail: string;
  organizationName: string;
}

const TestResultsDashboard: React.FC = () => {
  const [results, setResults] = useState<ResultWithTestInfo[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultWithTestInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ResultWithTestInfo | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // State for routing to scoring page
  const [currentView, setCurrentView] = useState<'dashboard' | 'scoring'>('dashboard');
  const [selectedResultForScoring, setSelectedResultForScoring] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [testFilter, setTestFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, organizationFilter, testFilter, dateRange, results]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all results with pagination (backend max is 100)
      let allResults: PopulatedResult[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await apiService.getAllResultsPaginated({
          limit: 100,
          page,
          sort: '-completedAt'
        });

        allResults = [...allResults, ...response.data];
        hasMore = response.pagination.hasMore;
        page++;

        // Safety limit to prevent infinite loops
        if (page > 50) break;
      }

      const resultsWithInfo: ResultWithTestInfo[] = allResults.map((result) => {
        const testTitle = result.testId?.title || `Test ${result.testId?._id?.slice(-6) || 'Unknown'}`;

        const userName = result.userId ?
          `${result.userId.firstName || ''} ${result.userId.lastName || ''}`.trim() ||
          result.userId.loginId ||
          `User ${result.userId._id?.slice(-6) || 'Unknown'}`
          : 'Unknown User';

        const userEmail = result.userId?.email || `user-${result.userId?._id?.slice(-6) || 'unknown'}@example.com`;

        const organizationName = result.organizationId?.name ||
          (result.organizationId?._id ? `Org ${result.organizationId._id.slice(-6)}` : 'Independent');

        return {
          ...result,
          testTitle,
          userName,
          userEmail,
          organizationName
        };
      });

      setResults(resultsWithInfo);
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setError('Failed to fetch test results');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(result => 
        statusFilter === 'passed' ? result.score.passed : !result.score.passed
      );
    }

    if (organizationFilter !== 'all') {
      filtered = filtered.filter(result => result.organizationId?._id === organizationFilter);
    }

    if (testFilter !== 'all') {
      filtered = filtered.filter(result => result.testId?._id === testFilter);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(result => 
          result.completedAt && new Date(result.completedAt) >= filterDate
        );
      }
    }

    setFilteredResults(filtered);
  };

  const handleViewResult = (result: ResultWithTestInfo) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  const handleManualScoring = (resultId: string) => {
    setSelectedResultForScoring(resultId);
    setCurrentView('scoring');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedResultForScoring(null);
    fetchResults();
  };

  const needsManualGrading = (result: ResultWithTestInfo) => {
    return result.manualReviewRequired || 
           result.questions?.some(q => ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreBadge = (score: any) => {
    if (score.passed) {
      return (
        <span className="badge-green flex items-center gap-1 w-fit">
          <CheckCircle className="w-3.5 h-3.5" />
          Passed
        </span>
      );
    }
    return (
      <span className="badge-red flex items-center gap-1 w-fit">
        <XCircle className="w-3.5 h-3.5" />
        Failed
      </span>
    );
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const handleExportResults = () => {
    const headers = ['Student Name', 'User ID', 'Test', 'Organization', 'Score %', 'Status', 'Completed At', 'Time Spent'];
    const csvData = [
      headers,
      ...filteredResults.map(result => [
        result.userName,
        result.userId?._id || 'N/A',
        result.testTitle,
        result.organizationName,
        result.score.percentage,
        result.score.passed ? 'Passed' : 'Failed',
        result.completedAt ? new Date(result.completedAt).toLocaleString() : 'N/A',
        formatDuration(result.timeSpent)
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats
  const totalResults = filteredResults.length;
  const passedResults = filteredResults.filter(r => r.score.passed).length;
  const failedResults = totalResults - passedResults;
  const averageScore = totalResults > 0 
    ? Math.round(filteredResults.reduce((sum, r) => sum + r.score.percentage, 0) / totalResults)
    : 0;

  const uniqueOrganizations = [...new Map(
    results
      .filter(r => r.organizationId?._id)
      .map(r => [r.organizationId._id, {
        id: r.organizationId._id,
        name: r.organizationName
      }])
  ).values()];

  const uniqueTests = [...new Map(
    results
      .filter(r => r.testId?._id)
      .map(r => [r.testId._id, {
        id: r.testId._id,
        title: r.testTitle
      }])
  ).values()];

  // Conditional rendering based on current view
  if (currentView === 'scoring' && selectedResultForScoring) {
    return (
      <DetailedResultScoringPage 
        resultId={selectedResultForScoring}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-8">
      <div className="container-section">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-1">Test Results Dashboard</h2>
            <p className="text-[#6b6b70]">View and analyze completed test results</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportResults}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={fetchResults}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading && <div className="spinner w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-mono text-2xl font-bold text-[#f5f5f4]">{totalResults}</h4>
                <p className="text-sm text-[#6b6b70]">Total Results</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="font-mono text-2xl font-bold text-[#f5f5f4]">{passedResults}</h4>
                <p className="text-sm text-[#6b6b70]">Passed Tests</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/10">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h4 className="font-mono text-2xl font-bold text-[#f5f5f4]">{failedResults}</h4>
                <p className="text-sm text-[#6b6b70]">Failed Tests</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-cyan-500/10">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-mono text-2xl font-bold text-[#f5f5f4]">{averageScore}%</h4>
                <p className="text-sm text-[#6b6b70]">Average Score</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 mb-6">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                  <input
                    type="text"
                    placeholder="Search students, tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select"
                >
                  <option value="all">All</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Organization</label>
                <select
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                  className="select"
                >
                  <option value="all">All Organizations</option>
                  {uniqueOrganizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              {/* Test */}
              <div>
                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Test</label>
                <select
                  value={testFilter}
                  onChange={(e) => setTestFilter(e.target.value)}
                  className="select"
                >
                  <option value="all">All Tests</option>
                  {uniqueTests.map(test => (
                    <option key={test.id} value={test.id}>{test.title}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="select"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="card">
          <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
            <h5 className="font-mono font-semibold text-[#f5f5f4]">Test Results ({filteredResults.length})</h5>
          </div>
          <div className="p-4">
            {loading && results.length === 0 ? (
              <div className="text-center py-12">
                <div className="spinner mb-4 mx-auto" />
                <p className="text-[#6b6b70]">Loading results...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
                <h6 className="text-[#6b6b70] font-medium">No Results Found</h6>
                <p className="text-[#6b6b70] text-sm">No test results match your current filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a2e]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Test</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Organization</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Questions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Time Spent</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Completed</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6b6b70]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => (
                      <tr key={result._id} className="border-b border-[#1c1c1f] hover:bg-[#1c1c1f]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-[#f5f5f4]">{result.userName}</div>
                            <div className="text-sm text-[#6b6b70] font-mono">{result.userId?._id || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#f5f5f4]">{result.testTitle}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#6b6b70]">Attempt #{result.attemptNumber}</span>
                            {needsManualGrading(result) && (
                              <span className="badge-amber text-xs flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                Manual Review
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#6b6b70]">{result.organizationName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#2a2a2e] rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getScoreColor(result.score.percentage)} transition-all`}
                                style={{ width: `${result.score.percentage}%` }}
                              />
                            </div>
                            <span className="font-medium text-[#f5f5f4]">{result.score.percentage}%</span>
                          </div>
                          <div className="text-sm text-[#6b6b70]">
                            {result.score.earnedPoints}/{result.score.totalPoints} points
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getScoreBadge(result.score)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="text-green-400">{result.score.correctAnswers}</span>
                            <span className="text-[#6b6b70]">/</span>
                            <span className="text-red-400">{result.score.incorrectAnswers}</span>
                            <span className="text-[#6b6b70]">/</span>
                            <span className="text-[#6b6b70]">{result.score.unansweredQuestions}</span>
                          </div>
                          <div className="text-xs text-[#6b6b70]">C / I / U</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#a1a1aa]">{formatDuration(result.timeSpent)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-[#a1a1aa]">{result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'N/A'}</div>
                          <div className="text-sm text-[#6b6b70]">{result.completedAt ? new Date(result.completedAt).toLocaleTimeString() : ''}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewResult(result)}
                              className="p-2 hover:bg-[#2a2a2e] rounded-lg transition-colors text-blue-400"
                              title="View Summary"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleManualScoring(result._id)}
                              className="p-2 hover:bg-[#2a2a2e] rounded-lg transition-colors text-[#6b6b70] hover:text-[#f5f5f4]"
                              title="Manual Scoring"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Result Detail Modal */}
        {showResultModal && selectedResult && (
          <div className="modal-backdrop flex items-center justify-center p-4">
            <div className="modal-content w-full max-w-2xl">
              <div className="flex items-center justify-between p-4 border-b border-[#2a2a2e]">
                <h3 className="font-mono font-semibold text-[#f5f5f4]">Test Result Details</h3>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="text-[#6b6b70] hover:text-[#f5f5f4] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Student:</span>
                      <p className="text-[#f5f5f4]">{selectedResult.userName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Test:</span>
                      <p className="text-[#f5f5f4]">{selectedResult.testTitle}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Completed:</span>
                      <p className="text-[#f5f5f4]">{selectedResult.completedAt ? new Date(selectedResult.completedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Score:</span>
                      <p className="text-[#f5f5f4]">{selectedResult.score.percentage}% ({selectedResult.score.earnedPoints}/{selectedResult.score.totalPoints} points)</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Attempt Number:</span>
                      <p className="text-[#f5f5f4]">#{selectedResult.attemptNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">User ID:</span>
                      <p className="text-[#f5f5f4] font-mono text-sm">{selectedResult.userId?._id || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Organization:</span>
                      <p className="text-[#f5f5f4]">{selectedResult.organizationName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Time Spent:</span>
                      <p className="text-[#f5f5f4]">{formatDuration(selectedResult.timeSpent)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Status:</span>
                      <div className="mt-1">{getScoreBadge(selectedResult.score)}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#6b6b70]">Passing Threshold:</span>
                      <p className="text-[#f5f5f4]">{selectedResult.score.passingThreshold}%</p>
                    </div>
                  </div>
                </div>

                {/* Questions breakdown */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#2a2a2e]">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Correct:</span>
                    <span>{selectedResult.score.correctAnswers}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Incorrect:</span>
                    <span>{selectedResult.score.incorrectAnswers}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6b6b70]">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Unanswered:</span>
                    <span>{selectedResult.score.unansweredQuestions}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-[#2a2a2e]">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => setShowResultModal(false)}
                >
                  Close
                </button>
                <button
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  onClick={() => {
                    setShowResultModal(false);
                    handleManualScoring(selectedResult._id);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  Manual Scoring
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultsDashboard;