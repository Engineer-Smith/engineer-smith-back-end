// src/pages/admin/code-challenges/StudentAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { useCodeChallenge } from '../../context/CodeChallengeContext';
import {
  Users,
  Search,
  TrendingUp,
  Clock,
  Trophy,
  Target,
  BarChart3,
  Activity,
  Download,
  User,
  Code,
  AlertCircle,
  Eye
} from 'lucide-react';

interface StudentProgress {
  userId: string;
  name: string;
  email: string;
  totalTracksEnrolled: number;
  totalTracksCompleted: number;
  totalChallengesAttempted: number;
  totalChallengesSolved: number;
  averageAttempts: number;
  averageTime: number;
  lastActivity: string;
  currentStreak: number;
  totalTimeSpent: number;
  skillLevels: {
    [language: string]: {
      level: 'beginner' | 'intermediate' | 'advanced';
      score: number;
      challengesSolved: number;
    };
  };
  recentActivity: Array<{
    challengeId: string;
    challengeTitle: string;
    trackId: string;
    trackTitle: string;
    status: 'completed' | 'attempted' | 'failed';
    timeSpent: number;
    attempts: number;
    submittedAt: string;
  }>;
}

interface TrackAnalytics {
  trackId: string;
  title: string;
  language: string;
  difficulty: string;
  totalEnrolled: number;
  totalCompleted: number;
  averageCompletionTime: number;
  completionRate: number;
  dropoffPoints: Array<{
    challengeId: string;
    challengeTitle: string;
    dropoffRate: number;
    position: number;
  }>;
  difficultyProgression: Array<{
    challengeId: string;
    challengeTitle: string;
    averageAttempts: number;
    successRate: number;
    averageTime: number;
  }>;
}

const StudentAnalytics: React.FC = () => {
  const { loadAnalytics } = useCodeChallenge();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Mock data - In real implementation, this would come from API
  const [studentsProgress, _setStudentsProgress] = useState<StudentProgress[]>([
    {
      userId: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      totalTracksEnrolled: 3,
      totalTracksCompleted: 1,
      totalChallengesAttempted: 25,
      totalChallengesSolved: 18,
      averageAttempts: 2.3,
      averageTime: 1245,
      lastActivity: '2024-01-15T10:30:00Z',
      currentStreak: 7,
      totalTimeSpent: 31230,
      skillLevels: {
        javascript: { level: 'intermediate', score: 785, challengesSolved: 12 },
        python: { level: 'beginner', score: 420, challengesSolved: 6 }
      },
      recentActivity: []
    },
    {
      userId: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      totalTracksEnrolled: 2,
      totalTracksCompleted: 0,
      totalChallengesAttempted: 15,
      totalChallengesSolved: 8,
      averageAttempts: 3.1,
      averageTime: 1890,
      lastActivity: '2024-01-14T15:22:00Z',
      currentStreak: 3,
      totalTimeSpent: 28350,
      skillLevels: {
        dart: { level: 'beginner', score: 320, challengesSolved: 8 }
      },
      recentActivity: []
    }
  ]);

  const [trackAnalytics, _setTrackAnalytics] = useState<TrackAnalytics[]>([
    {
      trackId: '1',
      title: 'JavaScript Fundamentals',
      language: 'javascript',
      difficulty: 'beginner',
      totalEnrolled: 145,
      totalCompleted: 89,
      averageCompletionTime: 18000,
      completionRate: 61.4,
      dropoffPoints: [
        { challengeId: '1', challengeTitle: 'Array Methods', dropoffRate: 15.2, position: 3 },
        { challengeId: '2', challengeTitle: 'Async/Await', dropoffRate: 23.1, position: 7 }
      ],
      difficultyProgression: []
    }
  ]);

  useEffect(() => {
    loadAnalytics(selectedTimeRange as '7d' | '30d' | '90d');
  }, [selectedTimeRange]);

  // Filter and sort functions
  const filteredStudents = studentsProgress
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = filterLanguage === 'all' || Object.keys(student.skillLevels).includes(filterLanguage);
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'progress':
          aValue = a.totalChallengesSolved / Math.max(a.totalChallengesAttempted, 1);
          bValue = b.totalChallengesSolved / Math.max(b.totalChallengesAttempted, 1);
          break;
        case 'streak':
          aValue = a.currentStreak;
          bValue = b.currentStreak;
          break;
        case 'lastActivity':
        default:
          aValue = new Date(a.lastActivity).getTime();
          bValue = new Date(b.lastActivity).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Utility functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 80) return 'badge-green';
    if (rate >= 60) return 'badge-amber';
    return 'badge-red';
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
      case 'beginner': return 'badge-green';
      case 'medium':
      case 'intermediate': return 'badge-amber';
      case 'hard':
      case 'advanced': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const getSkillLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return 'badge-blue';
      case 'intermediate': return 'badge-amber';
      case 'advanced': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  // Calculate overview stats
  const totalStudents = studentsProgress.length;
  const activeStudents = studentsProgress.filter(s => {
    const lastActivity = new Date(s.lastActivity);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastActivity > weekAgo;
  }).length;
  
  const averageProgress = studentsProgress.reduce((sum, student) => {
    return sum + (student.totalChallengesSolved / Math.max(student.totalChallengesAttempted, 1));
  }, 0) / Math.max(totalStudents, 1) * 100;

  const totalChallengesAttempted = studentsProgress.reduce((sum, s) => sum + s.totalChallengesAttempted, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'students', label: 'Student Progress', icon: Users },
    { id: 'tracks', label: 'Track Analytics', icon: Target },
    { id: 'challenges', label: 'Challenge Performance', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="flex items-center gap-3 font-mono text-2xl font-bold text-[#f5f5f4]">
              <BarChart3 className="w-6 h-6 text-amber-500" />
              Student Analytics
            </h1>
            <p className="text-[#6b6b70] mt-1">
              Track student progress and performance across code challenges
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="select"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 p-1 mb-6 bg-[#1c1c1f] rounded-lg border border-[#2a2a2e] overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#2a2a2e] text-[#f5f5f4]'
                    : 'text-[#6b6b70] hover:text-[#a1a1aa] hover:bg-[#2a2a2e]/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-6 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#f5f5f4] mb-1">{totalStudents}</div>
                <p className="text-sm text-[#6b6b70]">Total Students</p>
              </div>
              <div className="card p-6 text-center">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#f5f5f4] mb-1">{activeStudents}</div>
                <p className="text-sm text-[#6b6b70]">Active This Week</p>
              </div>
              <div className="card p-6 text-center">
                <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#f5f5f4] mb-1">{averageProgress.toFixed(1)}%</div>
                <p className="text-sm text-[#6b6b70]">Avg. Progress</p>
              </div>
              <div className="card p-6 text-center">
                <Code className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#f5f5f4] mb-1">{totalChallengesAttempted}</div>
                <p className="text-sm text-[#6b6b70]">Total Attempts</p>
              </div>
            </div>

            {/* Recent Activity & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="card">
                <div className="px-6 py-4 border-b border-[#2a2a2e]">
                  <h3 className="font-mono text-lg font-semibold text-[#f5f5f4]">Recent Activity</h3>
                </div>
                <div className="p-6 space-y-4">
                  {studentsProgress
                    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                    .slice(0, 5)
                    .map(student => (
                      <div key={student.userId} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#f5f5f4] truncate">{student.name}</div>
                          <p className="text-xs text-[#6b6b70]">
                            Solved {student.totalChallengesSolved} challenges • {formatTimeAgo(student.lastActivity)}
                          </p>
                        </div>
                        <span className={student.currentStreak > 5 ? 'badge-green' : 'badge-gray'}>
                          {student.currentStreak} day streak
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top Performers */}
              <div className="card">
                <div className="px-6 py-4 border-b border-[#2a2a2e]">
                  <h3 className="font-mono text-lg font-semibold text-[#f5f5f4]">Top Performers</h3>
                </div>
                <div className="p-6 space-y-4">
                  {studentsProgress
                    .sort((a, b) => b.totalChallengesSolved - a.totalChallengesSolved)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.userId} className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-500/20 text-amber-500' :
                          index === 1 ? 'bg-gray-500/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-[#2a2a2e] text-[#6b6b70]'
                        }`}>
                          #{index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#f5f5f4] truncate">{student.name}</div>
                          <p className="text-xs text-[#6b6b70]">
                            {student.totalChallengesSolved} solved • {((student.totalChallengesSolved / Math.max(student.totalChallengesAttempted, 1)) * 100).toFixed(1)}% success rate
                          </p>
                        </div>
                        <Trophy className="w-5 h-5 text-amber-500" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="select"
              >
                <option value="all">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="dart">Dart</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select"
              >
                <option value="lastActivity">Last Activity</option>
                <option value="name">Name</option>
                <option value="progress">Progress</option>
                <option value="streak">Streak</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Students Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a2e] bg-[#1c1c1f]">
                      <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Student</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Progress</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Success Rate</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Streak</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Time Spent</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Skills</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Last Activity</th>
                      <th className="text-right px-6 py-4 text-xs font-medium text-[#6b6b70] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2e]">
                    {filteredStudents.map((student) => {
                      const successRate = (student.totalChallengesSolved / Math.max(student.totalChallengesAttempted, 1)) * 100;
                      return (
                        <tr key={student.userId} className="hover:bg-[#1c1c1f]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-[#f5f5f4]">{student.name}</div>
                            <div className="text-xs text-[#6b6b70]">{student.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32">
                              <div className="flex justify-between text-xs text-[#a1a1aa] mb-1">
                                <span>{student.totalChallengesSolved}/{student.totalChallengesAttempted}</span>
                                <span>{successRate.toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-[#2a2a2e] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getSuccessRateColor(successRate)}`}
                                  style={{ width: `${successRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={getSuccessRateBadge(successRate)}>
                              {successRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-[#a1a1aa]">
                              <Trophy className="w-4 h-4 text-amber-500" />
                              {student.currentStreak} days
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-[#a1a1aa]">
                              <Clock className="w-4 h-4 text-[#6b6b70]" />
                              {formatTime(student.totalTimeSpent)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(student.skillLevels).map(([lang, skill]) => (
                                <span
                                  key={lang}
                                  className={getSkillLevelBadge(skill.level)}
                                  title={`${lang}: ${skill.challengesSolved} solved`}
                                >
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#6b6b70]">
                              {formatTimeAgo(student.lastActivity)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 rounded-lg text-[#6b6b70] hover:text-[#f5f5f4] hover:bg-[#2a2a2e] transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Track Analytics Tab */}
        {activeTab === 'tracks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trackAnalytics.map((track) => (
              <div key={track.trackId} className="card">
                <div className="px-6 py-4 border-b border-[#2a2a2e]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-mono font-semibold text-[#f5f5f4] mb-2">{track.title}</h3>
                      <div className="flex gap-2">
                        <span className="badge-blue">{track.language}</span>
                        <span className={getDifficultyBadge(track.difficulty)}>{track.difficulty}</span>
                      </div>
                    </div>
                    <span className="badge-purple text-lg">{track.completionRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Enrolled/Completed Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-[#1c1c1f]">
                      <div className="text-xl font-bold text-blue-500">{track.totalEnrolled}</div>
                      <div className="text-xs text-[#6b6b70]">Enrolled</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[#1c1c1f]">
                      <div className="text-xl font-bold text-green-500">{track.totalCompleted}</div>
                      <div className="text-xs text-[#6b6b70]">Completed</div>
                    </div>
                  </div>

                  {/* Completion Rate Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6b6b70]">Completion Rate</span>
                      <span className="text-[#a1a1aa]">{track.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-[#2a2a2e] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getSuccessRateColor(track.completionRate)}`}
                        style={{ width: `${track.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Average Completion Time */}
                  <div>
                    <div className="text-xs text-[#6b6b70] mb-1">Average completion time</div>
                    <div className="font-semibold text-[#f5f5f4]">{formatTime(track.averageCompletionTime)}</div>
                  </div>

                  {/* Dropoff Points */}
                  {track.dropoffPoints.length > 0 && (
                    <div>
                      <div className="text-xs text-[#6b6b70] mb-2">Main dropoff points</div>
                      <div className="space-y-2">
                        {track.dropoffPoints.slice(0, 2).map((point) => (
                          <div key={point.challengeId} className="flex items-center justify-between">
                            <span className="text-sm text-[#a1a1aa]">{point.challengeTitle}</span>
                            <span className="badge-amber">{point.dropoffRate.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Challenge Performance Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Info Alert */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>
                  Challenge performance analytics will be populated with real data from your seeding script and student submissions.
                </span>
              </div>
            </div>

            {/* Placeholder Card */}
            <div className="card">
              <div className="px-6 py-4 border-b border-[#2a2a2e]">
                <h3 className="font-mono text-lg font-semibold text-[#f5f5f4]">Challenge Performance Overview</h3>
              </div>
              <div className="p-6">
                <p className="text-[#6b6b70] mb-4">
                  This section will show detailed analytics for individual challenges including:
                </p>
                <ul className="space-y-2 text-[#6b6b70]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Success rates and average attempts per challenge
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Common error patterns and debugging insights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Time distribution analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Difficulty calibration recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Most problematic test cases
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnalytics;