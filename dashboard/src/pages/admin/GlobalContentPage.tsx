// src/pages/admin/GlobalContentPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  Eye,
  FileText,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';
import type { Question, Test } from '../../types';

type ViewTab = 'questions' | 'tests';

const difficultyColors: Record<string, string> = {
  easy: 'badge-green',
  medium: 'badge-amber',
  hard: 'badge-red'
};

const typeColors: Record<string, string> = {
  multipleChoice: 'bg-blue-500/10 text-blue-400',
  trueFalse: 'bg-purple-500/10 text-purple-400',
  codeChallenge: 'bg-amber-500/10 text-amber-400',
  codeDebugging: 'bg-red-500/10 text-red-400',
  fillInTheBlank: 'bg-cyan-500/10 text-cyan-400',
  dragDropCloze: 'bg-green-500/10 text-green-400'
};

export default function GlobalContentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ViewTab>('questions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is super org admin
  const isSuperOrgAdmin = user?.organization?.isSuperOrg && user?.role === 'admin';

  useEffect(() => {
    if (!isSuperOrgAdmin) {
      navigate('/admin');
      return;
    }
    fetchContent();
  }, [isSuperOrgAdmin, navigate]);

  const fetchContent = async () => {
    try {
      setError(null);
      const [questionsData, testsData] = await Promise.all([
        apiService.getGlobalQuestions(),
        apiService.getGlobalTests()
      ]);
      setQuestions(questionsData);
      setTests(testsData);
    } catch (err: any) {
      console.error('Failed to fetch global content:', err);
      setError(err.response?.data?.message || 'Failed to load global content');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchContent();
  };

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTests = tests.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isSuperOrgAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-[#a1a1aa] mb-4">
            Only super organization administrators can access global content.
          </p>
          <button onClick={() => navigate('/admin')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading global content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-500" />
              Global Content
            </h1>
            <p className="text-[#a1a1aa]">
              Questions and tests shared across all organizations
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 text-center">
            <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{questions.length}</p>
            <p className="text-xs text-[#6b6b70]">Global Questions</p>
          </div>
          <div className="card p-4 text-center">
            <BookOpen className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{tests.length}</p>
            <p className="text-xs text-[#6b6b70]">Global Tests</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 bg-[#1c1c1f] rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'questions'
                ? 'bg-blue-500 text-white'
                : 'text-[#a1a1aa] hover:text-[#f5f5f4]'
            }`}
          >
            <FileText size={16} />
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tests'
                ? 'bg-blue-500 text-white'
                : 'text-[#a1a1aa] hover:text-[#f5f5f4]'
            }`}
          >
            <BookOpen size={16} />
            Tests ({tests.length})
          </button>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
          </div>
        </div>

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h2 className="font-mono font-semibold">Global Questions</h2>
              <span className="text-sm text-[#6b6b70]">{filteredQuestions.length} questions</span>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
                <p className="text-[#6b6b70]">
                  {searchQuery ? 'No questions match your search' : 'No global questions found'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2e]">
                {filteredQuestions.map(question => (
                  <div
                    key={question._id}
                    className="p-4 hover:bg-[#1c1c1f]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="font-medium text-[#f5f5f4] mb-1">{question.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs ${typeColors[question.type] || 'bg-gray-500/10 text-gray-400'}`}>
                            {question.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[question.difficulty]}`}>
                            {question.difficulty}
                          </span>
                          {question.language && (
                            <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400">
                              {question.language}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/question-bank/view/${question._id}`)}
                        className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h2 className="font-mono font-semibold">Global Tests</h2>
              <span className="text-sm text-[#6b6b70]">{filteredTests.length} tests</span>
            </div>

            {filteredTests.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
                <p className="text-[#6b6b70]">
                  {searchQuery ? 'No tests match your search' : 'No global tests found'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2e]">
                {filteredTests.map(test => (
                  <div
                    key={test._id}
                    className="p-4 hover:bg-[#1c1c1f]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="font-medium text-[#f5f5f4] mb-1">{test.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs ${test.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                            {test.status}
                          </span>
                          {test.testType && (
                            <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400">
                              {test.testType}
                            </span>
                          )}
                          <span className="text-xs text-[#6b6b70]">
                            {test.settings?.timeLimit} min
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/tests/view/${test._id}`)}
                        className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
