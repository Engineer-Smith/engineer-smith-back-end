// src/pages/admin/ViewTestPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Loader2,
  Target,
  Users,
  XCircle
} from 'lucide-react';
import apiService from '../../services/ApiService';

interface QuestionData {
  _id: string;
  title: string;
  description?: string;
  type: string;
  difficulty: string;
  language?: string;
  category?: string;
}

interface TestQuestion {
  questionId: string;
  points: number;
  questionData?: QuestionData;
}

interface TestSection {
  name: string;
  timeLimit?: number;
  questions: TestQuestion[];
}

// API response type for test with questions - matches actual backend response
interface TestWithQuestionsResponse {
  _id: string;
  title: string;
  description: string;
  testType: string;
  status: string;
  difficulty?: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  showAnswers?: boolean;
  settings?: {
    timeLimit: number;
    attemptsAllowed: number;
    passingThreshold?: number;
    shuffleQuestions?: boolean;
    showResultsImmediately?: boolean;
    allowReview?: boolean;
    useSections?: boolean;
  };
  questions?: TestQuestion[];  // Both sectioned and non-sectioned use this format
  sections?: TestSection[];    // Only present when useSections is true
  createdAt: string;
  updatedAt?: string;
}

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

const formatQuestionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    multipleChoice: 'Multiple Choice',
    trueFalse: 'True/False',
    codeChallenge: 'Code Challenge',
    codeDebugging: 'Code Debugging',
    fillInTheBlank: 'Fill in Blank',
    dragDropCloze: 'Drag & Drop'
  };
  return typeMap[type] || type;
};

export default function ViewTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<TestWithQuestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const fetchTest = async () => {
    if (!testId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTestWithQuestions(testId);
      setTest(data as unknown as TestWithQuestionsResponse);
    } catch (err: any) {
      console.error('Failed to fetch test:', err);
      setError(err.response?.data?.message || 'Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Test</h2>
          <p className="text-[#a1a1aa] mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              Go Back
            </button>
            <button onClick={fetchTest} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total points and question count based on sections or flat questions
  const usesSections = test.settings?.useSections && test.sections?.length;

  const totalQuestions = usesSections
    ? test.sections!.reduce((sum, section) => sum + (section.questions?.length || 0), 0)
    : (test.questions?.length || 0);

  const totalPoints = usesSections
    ? test.sections!.reduce((sum, section) =>
        sum + section.questions.reduce((sectionSum, q) => sectionSum + (q.points || 0), 0), 0)
    : (test.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0);

  // Helper to render a question item (used for both sectioned and non-sectioned)
  const renderQuestionItem = (q: TestQuestion, index: number) => {
    const question = q.questionData;
    if (!question) return null;
    return (
      <div key={q.questionId} className="p-4 hover:bg-[#1c1c1f]/50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#2a2a2e] flex items-center justify-center text-sm font-medium text-[#6b6b70]">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[#f5f5f4] mb-1">{question.title}</h3>
              {question.description && (
                <p className="text-sm text-[#a1a1aa] mb-2 line-clamp-2">{question.description}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-xs ${typeColors[question.type] || 'bg-gray-500/10 text-gray-400'}`}>
                  {formatQuestionType(question.type)}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[question.difficulty] || 'badge-gray'}`}>
                  {question.difficulty}
                </span>
                {question.language && (
                  <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400">
                    {question.language}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-[#f5f5f4]">{q.points} pts</p>
          </div>
        </div>
      </div>
    );
  };

  // Helper to get settings with fallback to top-level or nested settings
  const timeLimit = test.timeLimit ?? test.settings?.timeLimit;
  const maxAttempts = test.maxAttempts ?? test.settings?.attemptsAllowed;
  const passingScore = test.passingScore ?? test.settings?.passingThreshold ?? 70;
  const shuffleQuestions = test.shuffleQuestions ?? test.settings?.shuffleQuestions ?? false;
  const showResults = test.showResults ?? test.settings?.showResultsImmediately ?? true;
  const showAnswers = test.showAnswers ?? test.settings?.allowReview ?? false;
  const difficulty = test.difficulty || 'medium';

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Tests
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
                {test.title}
              </h1>
              <div className="flex items-center gap-3">
                <span className={`${difficultyColors[difficulty] || 'badge-gray'}`}>
                  {difficulty}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${test.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {test.status}
                </span>
                {test.testType && (
                  <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400">
                    {test.testType}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/tests/preview/${testId}`)}
                className="btn-secondary flex items-center gap-2"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => navigate(`/admin/tests/edit/${testId}`)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Test
              </button>
            </div>
          </div>
        </div>

        {/* Test Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{totalQuestions}</p>
            <p className="text-xs text-[#6b6b70]">Questions</p>
          </div>
          <div className="card p-4 text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{totalPoints}</p>
            <p className="text-xs text-[#6b6b70]">Total Points</p>
          </div>
          <div className="card p-4 text-center">
            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{timeLimit || 'No limit'}</p>
            <p className="text-xs text-[#6b6b70]">{timeLimit ? 'Minutes' : ''}</p>
          </div>
          <div className="card p-4 text-center">
            <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{maxAttempts === -1 ? '∞' : (maxAttempts || '∞')}</p>
            <p className="text-xs text-[#6b6b70]">Max Attempts</p>
          </div>
        </div>

        {/* Description */}
        {test.description && (
          <div className="card mb-6">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h2 className="font-mono font-semibold flex items-center gap-2">
                <FileText size={18} />
                Description
              </h2>
            </div>
            <div className="p-4">
              <p className="text-[#a1a1aa] whitespace-pre-wrap">{test.description}</p>
            </div>
          </div>
        )}

        {/* Test Settings */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold">Test Settings</h2>
          </div>
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Passing Score</span>
                <span className="font-medium">{passingScore}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Shuffle Questions</span>
                <span className={shuffleQuestions ? 'text-green-400' : 'text-[#6b6b70]'}>
                  {shuffleQuestions ? <CheckCircle size={18} /> : <XCircle size={18} />}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Show Results</span>
                <span className={showResults ? 'text-green-400' : 'text-[#6b6b70]'}>
                  {showResults ? <CheckCircle size={18} /> : <XCircle size={18} />}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg">
                <span className="text-[#6b6b70]">Show Answers</span>
                <span className={showAnswers ? 'text-green-400' : 'text-[#6b6b70]'}>
                  {showAnswers ? <CheckCircle size={18} /> : <XCircle size={18} />}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="card">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <BookOpen size={18} />
              Questions ({totalQuestions})
              {usesSections && (
                <span className="text-xs text-[#6b6b70] font-normal ml-2">
                  ({test.sections!.length} sections)
                </span>
              )}
            </h2>
          </div>

          {totalQuestions === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
              <p className="text-[#6b6b70]">No questions added to this test yet</p>
            </div>
          ) : usesSections ? (
            // Render sections with questions
            <div className="divide-y divide-[#2a2a2e]">
              {test.sections!.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <div className="p-4 bg-[#1c1c1f]/30 border-b border-[#2a2a2e]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[#f5f5f4]">{section.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-[#6b6b70]">
                        <span>{section.questions.length} questions</span>
                        {section.timeLimit && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {section.timeLimit} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-[#1c1c1f]">
                    {section.questions.map((q, qIndex) => renderQuestionItem(q, qIndex))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Render flat questions list (same nested structure)
            <div className="divide-y divide-[#2a2a2e]">
              {test.questions?.map((q, index) => renderQuestionItem(q, index))}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-6 text-xs text-[#6b6b70] flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Created: {new Date(test.createdAt).toLocaleDateString()}
          </span>
          {test.updatedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Updated: {new Date(test.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
