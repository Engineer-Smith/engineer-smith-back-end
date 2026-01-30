import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code,
  Book,
  Users,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { useCodeChallenge } from '../../../context/CodeChallengeContext';

const CodeLabDashboard: React.FC = () => {
  const {
    analytics,
    loading,
    errors,
    loadAnalytics,
    loadTracksOverview,
    loadChallengesOverview,
    tracksOverview,
    challengesOverview
  } = useCodeChallenge();

  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics(period);
    loadTracksOverview();
    loadChallengesOverview();
  }, [period]);

  if (loading.analytics && !analytics) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (errors.analytics) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-[#a1a1aa] mb-4">
            {typeof errors.analytics === 'string' ? errors.analytics : 'Failed to load analytics'}
          </p>
          <button className="btn-primary" onClick={() => loadAnalytics(period)}>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-1">
              Code Lab Dashboard
            </h1>
            <p className="text-[#6b6b70]">Manage tracks, challenges, and monitor user progress</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
              className="select"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Link to="/admin/code-lab/challenges/new" className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              New Challenge
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Book className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#f5f5f4]">
                  {analytics?.trackStats?.total || tracksOverview.length || 0}
                </div>
                <div className="text-xs text-[#6b6b70]">Total Tracks</div>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Code className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#f5f5f4]">
                  {analytics?.challengeStats?.total || challengesOverview.length || 0}
                </div>
                <div className="text-xs text-[#6b6b70]">Total Challenges</div>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#f5f5f4]">
                  {analytics?.userActivityStats?.activeUsers || 0}
                </div>
                <div className="text-xs text-[#6b6b70]">Active Users</div>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#f5f5f4]">
                  {analytics?.submissionStats?.totalSubmissions || 0}
                </div>
                <div className="text-xs text-[#6b6b70]">Submissions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/code-lab/tracks" className="card p-4 hover:border-[#3a3a3f] transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Book className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-[#f5f5f4]">Manage Tracks</h3>
                  <p className="text-sm text-[#6b6b70]">Create and edit learning tracks</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#6b6b70] group-hover:text-[#a1a1aa] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link to="/admin/code-lab/challenges" className="card p-4 hover:border-[#3a3a3f] transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Code className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-[#f5f5f4]">Manage Challenges</h3>
                  <p className="text-sm text-[#6b6b70]">Create and edit coding challenges</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#6b6b70] group-hover:text-[#a1a1aa] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link to="/admin/code-lab/challenges/new" className="card p-4 hover:border-[#3a3a3f] transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Plus className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-[#f5f5f4]">New Challenge</h3>
                  <p className="text-sm text-[#6b6b70]">Create a new coding challenge</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#6b6b70] group-hover:text-[#a1a1aa] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Popular Challenges */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h3 className="font-mono font-semibold text-[#f5f5f4]">Popular Challenges</h3>
              <Link to="/admin/code-lab/challenges" className="text-sm text-blue-400 hover:text-blue-300">
                View All
              </Link>
            </div>
            <div className="p-4">
              {analytics?.popularChallenges && analytics.popularChallenges.length > 0 ? (
                <div className="space-y-3">
                  {analytics.popularChallenges.slice(0, 5).map((challenge: any) => (
                    <div key={challenge._id} className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          challenge.difficulty === 'easy' ? 'bg-green-400' :
                          challenge.difficulty === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <h4 className="text-sm font-medium text-[#f5f5f4]">{challenge.title}</h4>
                          <p className="text-xs text-[#6b6b70]">
                            {challenge.usageStats?.totalAttempts || 0} attempts
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-green-400">
                        {(challenge.usageStats?.successRate || 0).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
                  <p className="text-[#6b6b70]">No challenge data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Difficult Challenges */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h3 className="font-mono font-semibold text-[#f5f5f4]">Most Difficult</h3>
              <span className="text-xs text-[#6b6b70]">Lowest success rate</span>
            </div>
            <div className="p-4">
              {analytics?.difficultChallenges && analytics.difficultChallenges.length > 0 ? (
                <div className="space-y-3">
                  {analytics.difficultChallenges.slice(0, 5).map((challenge: any) => (
                    <div key={challenge._id} className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          challenge.difficulty === 'easy' ? 'bg-green-400' :
                          challenge.difficulty === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <h4 className="text-sm font-medium text-[#f5f5f4]">{challenge.title}</h4>
                          <p className="text-xs text-[#6b6b70]">
                            {challenge.usageStats?.totalAttempts || 0} attempts
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-red-400">
                        {(challenge.usageStats?.successRate || 0).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
                  <p className="text-[#6b6b70]">No challenge data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracks Overview */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h3 className="font-mono font-semibold text-[#f5f5f4]">Tracks Overview</h3>
              <Link to="/admin/code-lab/tracks" className="text-sm text-blue-400 hover:text-blue-300">
                View All
              </Link>
            </div>
            <div className="p-4">
              {tracksOverview.length > 0 ? (
                <div className="space-y-3">
                  {tracksOverview.slice(0, 5).map((track: any) => (
                    <div key={track._id} className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-0.5 rounded text-xs ${
                          track.language === 'javascript' ? 'bg-yellow-500/10 text-yellow-400' :
                          track.language === 'python' ? 'bg-cyan-500/10 text-cyan-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {track.language}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[#f5f5f4]">{track.title}</h4>
                          <p className="text-xs text-[#6b6b70]">
                            {track.stats?.totalChallenges || track.challenges?.length || 0} challenges
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-[#a1a1aa]">
                        {track.stats?.uniqueUsers || 0} users
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Book className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
                  <p className="text-[#6b6b70]">No tracks created yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h3 className="font-mono font-semibold text-[#f5f5f4]">Challenge Distribution</h3>
            </div>
            <div className="p-4">
              {analytics?.challengeStats?.byDifficulty && analytics.challengeStats.byDifficulty.length > 0 ? (
                <div className="space-y-4">
                  {analytics.challengeStats.byDifficulty.map((item: any) => {
                    const total = analytics.challengeStats.total || 1;
                    const percentage = ((item.count / total) * 100).toFixed(0);
                    const color = item.difficulty === 'easy' ? 'bg-green-500' :
                                  item.difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500';

                    return (
                      <div key={item.difficulty}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#a1a1aa] capitalize">{item.difficulty}</span>
                          <span className="text-[#f5f5f4]">{item.count} ({percentage}%)</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
                  <p className="text-[#6b6b70]">No distribution data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeLabDashboard;
