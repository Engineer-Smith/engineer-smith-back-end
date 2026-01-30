import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code, Play, ArrowRight, Trophy, Target } from 'lucide-react';
import { useCodeChallenge } from '../../../context/CodeChallengeContext';

const CodeLabDashboardWidget: React.FC = () => {
  const { dashboard, loading, loadDashboard } = useCodeChallenge();

  useEffect(() => {
    if (!dashboard) {
      loadDashboard();
    }
  }, [dashboard, loadDashboard]);

  if (loading.dashboard) {
    return (
      <div className="card">
        <div className="p-4 border-b border-[#2a2a2e]">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            <h3 className="font-mono font-semibold text-[#f5f5f4]">Code Lab</h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="spinner w-6 h-6 mx-auto" />
        </div>
      </div>
    );
  }

  const challengeStats = dashboard?.challengeStats;
  const trackStats = dashboard?.trackStats;

  return (
    <div className="card">
      <div className="p-4 border-b border-[#2a2a2e]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            <h3 className="font-mono font-semibold text-[#f5f5f4]">Code Lab</h3>
          </div>
          <Link
            to="/code-lab"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-[#0a0a0b] rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#6b6b70]">Solved</span>
            </div>
            <div className="text-xl font-bold text-[#f5f5f4]">
              {challengeStats?.totalSolved || 0}
            </div>
          </div>
          <div className="p-3 bg-[#0a0a0b] rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[#6b6b70]">Attempted</span>
            </div>
            <div className="text-xl font-bold text-[#f5f5f4]">
              {challengeStats?.totalAttempted || 0}
            </div>
          </div>
        </div>

        {/* Track Progress */}
        {trackStats && (trackStats.totalEnrolled > 0 || trackStats.totalInProgress > 0) && (
          <div className="mb-4">
            <div className="text-xs text-[#6b6b70] mb-2">Tracks</div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#a1a1aa]">
                <span className="text-green-400 font-medium">{trackStats.totalCompleted}</span> completed
              </span>
              <span className="text-[#a1a1aa]">
                <span className="text-blue-400 font-medium">{trackStats.totalInProgress}</span> in progress
              </span>
            </div>
          </div>
        )}

        {/* Language Progress */}
        {challengeStats && (
          <div className="space-y-2 mb-4">
            <div className="text-xs text-[#6b6b70] mb-2">By Language</div>
            {[
              { lang: 'JavaScript', count: challengeStats.javascriptSolved, color: 'bg-yellow-500' },
              { lang: 'Python', count: challengeStats.pythonSolved, color: 'bg-cyan-500' },
              { lang: 'Dart', count: challengeStats.dartSolved, color: 'bg-blue-500' }
            ].filter(item => item.count > 0).map((item) => (
              <div key={item.lang} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-sm text-[#a1a1aa] flex-1">{item.lang}</span>
                <span className="text-sm font-medium text-[#f5f5f4]">{item.count}</span>
              </div>
            ))}
            {challengeStats.totalSolved === 0 && (
              <p className="text-sm text-[#6b6b70]">No challenges solved yet</p>
            )}
          </div>
        )}

        {/* CTA Button */}
        <Link
          to="/code-lab"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Play size={16} />
          {(trackStats?.totalInProgress ?? 0) > 0 ? 'Continue Learning' : 'Start Coding'}
        </Link>
      </div>
    </div>
  );
};

export default CodeLabDashboardWidget;
