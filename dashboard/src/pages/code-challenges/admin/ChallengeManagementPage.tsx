import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Code,
  AlertCircle,
  Play,
  Upload
} from 'lucide-react';
import { useCodeChallenge } from '../../../context/CodeChallengeContext';
import { DifficultyBadge, LanguageBadge } from '../../../components/code-challenges/shared';
import type { AdminChallengeOverview } from '../../../types/codeChallenge';

const ChallengeManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    challengesOverview,
    loading,
    errors,
    loadChallengesOverview,
    deleteCodeChallenge,
    testChallengeAdmin
  } = useCodeChallenge();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadChallengesOverview();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const filteredChallenges = challengesOverview.filter((challenge: AdminChallengeOverview) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || challenge.difficulty === difficultyFilter;
    const matchesLanguage = languageFilter === 'all' || challenge.supportedLanguages.includes(languageFilter as any);
    const matchesStatus = statusFilter === 'all' || challenge.status === statusFilter;

    return matchesSearch && matchesDifficulty && matchesLanguage && matchesStatus;
  });

  const handleDelete = async (challenge: AdminChallengeOverview) => {
    if (!window.confirm(`Are you sure you want to delete "${challenge.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCodeChallenge(challenge.slug);
      await loadChallengesOverview();
    } catch (error) {
      console.error('Failed to delete challenge:', error);
    }
  };

  const handleTest = async (challenge: AdminChallengeOverview) => {
    try {
      const result = await testChallengeAdmin(challenge.slug, {
        language: challenge.supportedLanguages[0]
      });
      alert(`Test completed! Passed: ${result.testResults?.overallPassed ? 'Yes' : 'No'}`);
    } catch (error) {
      console.error('Failed to test challenge:', error);
      alert('Test failed. Check console for details.');
    }
  };

  // Error state
  if (errors.challengesOverview) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
            Failed to Load Challenges
          </h2>
          <p className="text-[#a1a1aa] mb-4">
            {typeof errors.challengesOverview === 'string' ? errors.challengesOverview : 'Failed to load challenges'}
          </p>
          <button className="btn-primary" onClick={() => loadChallengesOverview()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="container-section py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4]">
              Challenge Management
            </h1>
            <p className="text-sm text-[#6b6b70]">
              Create and manage coding challenges
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/code-lab" className="btn-secondary">
              Dashboard
            </Link>
            <Link to="/admin/code-lab/challenges/import" className="btn-secondary flex items-center gap-2">
              <Upload size={16} />
              Import
            </Link>
            <Link to="/admin/code-lab/challenges/new" className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              New Challenge
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="select"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="select"
              >
                <option value="all">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="dart">Dart</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-[#6b6b70]">
            Showing {filteredChallenges.length} of {challengesOverview.length} challenges
          </span>
          <button
            onClick={() => loadChallengesOverview()}
            className="btn-secondary text-sm"
            disabled={loading.adminChallenges}
          >
            {loading.adminChallenges ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Challenges Table */}
        {loading.adminChallenges && challengesOverview.length === 0 ? (
          <div className="text-center py-12">
            <div className="spinner w-12 h-12 mx-auto mb-4" />
            <p className="text-[#a1a1aa]">Loading challenges...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="card text-center py-12">
            <Code className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
            <h3 className="font-mono text-lg font-semibold text-[#f5f5f4] mb-2">
              No Challenges Found
            </h3>
            <p className="text-[#6b6b70] mb-4">
              {challengesOverview.length === 0
                ? 'No challenges have been created yet.'
                : 'No challenges match your current filters.'}
            </p>
            {challengesOverview.length === 0 && (
              <Link to="/admin/code-lab/challenges/new" className="btn-primary">
                Create First Challenge
              </Link>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0b] border-b border-[#2a2a2e]">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[#6b6b70]">Challenge</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[#6b6b70]">Difficulty</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[#6b6b70]">Languages</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[#6b6b70]">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-[#6b6b70]">Stats</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-[#6b6b70]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1f]">
                  {filteredChallenges.map((challenge: AdminChallengeOverview) => (
                    <tr key={challenge._id} className="hover:bg-[#0a0a0b]/50">
                      <td className="px-4 py-3">
                        <div>
                          <h4 className="font-medium text-[#f5f5f4]">{challenge.title}</h4>
                          <p className="text-xs text-[#6b6b70]">{challenge.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {challenge.supportedLanguages.map((lang) => (
                            <LanguageBadge key={lang} language={lang} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          challenge.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : challenge.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {challenge.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span className="text-[#a1a1aa]">
                            {challenge.usageStats?.totalAttempts || 0} attempts
                          </span>
                          <span className="text-[#6b6b70] mx-1">·</span>
                          <span className={
                            (challenge.usageStats?.successRate || 0) >= 50
                              ? 'text-green-400'
                              : 'text-red-400'
                          }>
                            {(challenge.usageStats?.successRate || 0).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === challenge._id ? null : challenge._id);
                            }}
                            className="p-2 hover:bg-[#2a2a2e] rounded-lg transition-colors text-[#6b6b70] hover:text-[#f5f5f4]"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {openDropdown === challenge._id && (
                            <div className="absolute right-0 top-full mt-1 w-48 card py-1 shadow-xl z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  navigate(`/admin/code-lab/challenges/${challenge.slug}/edit`);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1c1c1f] flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Challenge
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleTest(challenge);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1c1c1f] flex items-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                Test Solution
                              </button>
                              <div className="border-t border-[#2a2a2e] my-1" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleDelete(challenge);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Challenge
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeManagementPage;
