// pages/ViewQuestionPage.tsx
import Editor from '@monaco-editor/react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bug,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Copy,
  Edit,
  Eye,
  Globe,
  Lightbulb,
  Play,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuestionAnalytics } from '../hooks/questions/useQuestionAnalytics';
import apiService from '../services/ApiService';
import type { Difficulty, Language, Question, QuestionType } from '../types';

const ViewQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [studentViewMode, setStudentViewMode] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);

  // Student answer simulation states
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [blankAnswers, setBlankAnswers] = useState<{ [key: string]: string }>({});
  const [studentCode, setStudentCode] = useState('');

  const {
    analytics: questionAnalytics,
    loading: analyticsLoading,
    error: analyticsError
  } = useQuestionAnalytics(questionId || '');

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    if (!questionId) return;

    try {
      setLoading(true);
      setError(null);

      const question = await apiService.getQuestion(questionId);

      if (!question || !question._id) {
        throw new Error('Failed to fetch question');
      }

      setQuestion(question);

      // Initialize student code based on question type
      if (question.type === 'codeChallenge') {
        setStudentCode(question.codeTemplate || '');
      } else if (question.type === 'codeDebugging') {
        setStudentCode(question.buggyCode || '');
      }

      // Initialize blank answers
      if (question.type === 'fillInTheBlank' && question.blanks) {
        const initialBlanks: { [key: string]: string } = {};
        question.blanks.forEach((blank: {
          id?: string;
          correctAnswers: string[];
          caseSensitive?: boolean;
          hint?: string;
          points?: number;
        }) => {
          if (blank.id) {
            initialBlanks[blank.id] = '';
          }
        });
        setBlankAnswers(initialBlanks);
      }

    } catch (error: any) {
      console.error('Error fetching question:', error);
      setError(error.message || 'Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/question-bank/edit/${questionId}`);
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!question || !questionId) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteQuestion(questionId);

      if (!response || !response.message) {
        throw new Error('Failed to delete question');
      }

      navigate('/admin/question-bank', {
        state: { message: 'Question deleted successfully' }
      });
    } catch (error: any) {
      alert('Error deleting question: ' + error.message);
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
  };

  const handleDuplicate = () => {
    if (!question) return;

    navigate('/admin/question-bank/add', {
      state: {
        duplicateFrom: {
          ...question,
          title: `Copy of ${question.title}`,
          _id: undefined,
          status: 'draft'
        }
      }
    });
  };

  const getMonacoLanguage = (language: Language | undefined): string => {
    switch (language) {
      case 'react':
      case 'reactNative':
      case 'express':
      case 'javascript':
        return 'javascript';
      case 'flutter':
      case 'dart':
        return 'dart';
      case 'typescript':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'sql':
        return 'sql';
      case 'python':
        return 'python';
      default:
        return 'plaintext';
    }
  };

  const getDifficultyClasses = (difficulty: Difficulty | undefined) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-400';
      case 'medium': return 'bg-amber-500/10 text-amber-400';
      case 'hard': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getTypeDisplay = (type: QuestionType | undefined) => {
    switch (type) {
      case 'multipleChoice': return 'Multiple Choice';
      case 'trueFalse': return 'True/False';
      case 'codeChallenge': return 'Code Challenge';
      case 'fillInTheBlank': return 'Fill in the Blank';
      case 'codeDebugging': return 'Code Debugging';
      default: return type || 'Unknown';
    }
  };

  const getCategoryDisplay = (category: string | undefined) => {
    switch (category) {
      case 'logic': return 'Logic';
      case 'ui': return 'UI/UX';
      case 'syntax': return 'Syntax';
      default: return category || '';
    }
  };

  const renderAnalyticsSection = () => {
    if (!question) return null;

    return (
      <div className="card mb-4">
        <div className="p-4 border-b border-[#2a2a2e]">
          <h6 className="font-mono font-semibold text-[#f5f5f4] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Question Analytics
            {analyticsLoading && <div className="spinner w-4 h-4" />}
          </h6>
        </div>
        <div className="p-4">
          {analyticsError && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
              <p className="text-sm text-amber-400">Unable to load analytics: {analyticsError}</p>
            </div>
          )}

          {!analyticsLoading && !questionAnalytics && !analyticsError && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-blue-400">No Usage Data Yet</p>
                  <p className="text-sm text-blue-400/70">This question hasn't been used in any tests yet.</p>
                </div>
              </div>
            </div>
          )}

          {questionAnalytics && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold text-[#f5f5f4]">{questionAnalytics.totalAttempts}</div>
                  <p className="text-xs text-[#6b6b70]">Total Attempts</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold text-[#f5f5f4]">
                    {Math.round(questionAnalytics.successRate)}%
                  </div>
                  <p className="text-xs text-[#6b6b70]">Success Rate</p>
                </div>
                <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold text-[#f5f5f4]">
                    {Math.round(questionAnalytics.averageTime / 60)}m
                  </div>
                  <p className="text-xs text-[#6b6b70]">Avg. Time</p>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[#1c1c1f] rounded-lg">
                  <h6 className="font-medium text-[#f5f5f4] mb-3">Performance Breakdown</h6>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b6b70]">Correct Answers:</span>
                      <span className="badge-green text-xs">{questionAnalytics.correctAttempts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b6b70]">Incorrect Answers:</span>
                      <span className="badge-red text-xs">
                        {questionAnalytics.totalAttempts - questionAnalytics.correctAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b6b70]">Average Points:</span>
                      <span className="badge-blue text-xs">{questionAnalytics.averagePoints.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[#1c1c1f] rounded-lg">
                  <h6 className="font-medium text-[#f5f5f4] mb-3">Question Details</h6>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b6b70]">Type:</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">{questionAnalytics.questionType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b6b70]">Language:</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">{questionAnalytics.language}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6b6b70]">Difficulty:</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyClasses(questionAnalytics.difficulty as any)}`}>
                        {questionAnalytics.difficulty}
                      </span>
                    </div>
                    {questionAnalytics.category && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6b6b70]">Category:</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400">{questionAnalytics.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Success Rate Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h6 className="font-medium text-[#f5f5f4]">Success Rate</h6>
                  <span className="font-mono font-bold text-[#f5f5f4]">{Math.round(questionAnalytics.successRate)}%</span>
                </div>
                <div className="h-2 bg-[#2a2a2e] rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full transition-all ${
                      questionAnalytics.successRate >= 70 ? 'bg-green-500' :
                      questionAnalytics.successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${questionAnalytics.successRate}%` }}
                  />
                </div>
                <p className="text-xs text-[#6b6b70]">
                  {questionAnalytics.correctAttempts} correct out of {questionAnalytics.totalAttempts} attempts
                </p>
              </div>

              {/* Recommendations */}
              {questionAnalytics.totalAttempts > 5 && (
                <div className="mt-6">
                  <h6 className="font-medium text-[#f5f5f4] mb-3">Recommendations</h6>
                  <div className="p-4 bg-[#1c1c1f] rounded-lg border-l-4 border-cyan-500">
                    {questionAnalytics.successRate < 30 ? (
                      <div className="flex items-start gap-3">
                        <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-400">Low Success Rate</p>
                          <p className="text-sm text-[#6b6b70]">
                            This question has a very low success rate ({Math.round(questionAnalytics.successRate)}%).
                            Consider reviewing the question difficulty, clarity, or providing additional learning materials.
                          </p>
                        </div>
                      </div>
                    ) : questionAnalytics.successRate > 90 ? (
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-400">High Success Rate</p>
                          <p className="text-sm text-[#6b6b70]">
                            This question has a very high success rate ({Math.round(questionAnalytics.successRate)}%).
                            It might be too easy for the intended difficulty level.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-400">Good Performance</p>
                          <p className="text-sm text-[#6b6b70]">
                            This question has a balanced success rate ({Math.round(questionAnalytics.successRate)}%)
                            and appears to be well-calibrated for its difficulty level.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Time Analysis */}
              {questionAnalytics.averageTime > 0 && (
                <div className="mt-6">
                  <h6 className="font-medium text-[#f5f5f4] mb-3">Time Analysis</h6>
                  <div className="p-4 bg-[#1c1c1f] rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                        <div className="font-mono font-bold text-[#f5f5f4]">{Math.round(questionAnalytics.averageTime)}s</div>
                        <p className="text-xs text-[#6b6b70]">Average Time</p>
                      </div>
                      <div className="text-center">
                        <Activity className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                        <div className="font-mono font-bold text-[#f5f5f4]">
                          {questionAnalytics.averageTime > 180 ? 'Slow' :
                            questionAnalytics.averageTime > 60 ? 'Moderate' : 'Quick'}
                        </div>
                        <p className="text-xs text-[#6b6b70]">Completion Speed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Fallback to existing usageStats if no analytics available */}
          {!questionAnalytics && !analyticsLoading && question.usageStats && (
            <>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mb-4">
                <p className="text-sm text-cyan-400">Showing basic usage statistics (detailed analytics not available)</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold text-[#f5f5f4]">{question.usageStats.timesUsed || 0}</div>
                  <p className="text-xs text-[#6b6b70]">Times Used in Tests</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold text-[#f5f5f4]">
                    {question.usageStats.totalAttempts ?
                      Math.round((question.usageStats.correctAttempts / question.usageStats.totalAttempts) * 100) : 0}%
                  </div>
                  <p className="text-xs text-[#6b6b70]">Success Rate</p>
                </div>
                <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="font-mono text-xl font-bold text-[#f5f5f4]">
                    {Math.round((question.usageStats.averageTime || 0) / 60)}m
                  </div>
                  <p className="text-xs text-[#6b6b70]">Avg. Completion Time</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderStudentView = () => {
    if (!question) return null;

    // Check if first option contains code (for multiple choice with code snippet)
    const hasCodeSnippet = question.type === 'multipleChoice' &&
      question.options?.[0] &&
      question.options[0].includes('\n');

    return (
      <div className="card mb-4 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2a2a2e] bg-[#141416]">
          <div className="flex items-center justify-between">
            <h5 className="font-mono font-semibold text-[#f5f5f4] flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Student View Preview
            </h5>
            <span className="badge-blue px-2 py-1 rounded text-xs flex items-center gap-1">
              <Eye size={12} />
              Preview Mode
            </span>
          </div>
        </div>

        {/* Split-pane layout matching TestTakingInterface */}
        <div className="grid grid-cols-2 min-h-[500px]">
          {/* Left Panel - Question */}
          <div className="flex flex-col border-r border-[#2a2a2e]">
            <div className="p-6 flex-1 overflow-auto">
              {/* Question Header */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-[#f5f5f4] font-semibold">{question.title}</h5>
                  <span className="badge-blue px-2 py-0.5 rounded text-xs">10 pts</span>
                </div>

                {/* Question Metadata */}
                <div className="flex gap-2 mb-3">
                  <span className="badge-gray px-2 py-0.5 rounded text-xs">
                    {getTypeDisplay(question.type)}
                  </span>
                  {question.difficulty && (
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyClasses(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  )}
                  {question.language && (
                    <span className="badge-blue px-2 py-0.5 rounded text-xs">{question.language}</span>
                  )}
                </div>
              </div>

              {/* Question Description */}
              <div className="mb-4">
                <p className="text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
                  {question.description}
                </p>
              </div>

              {/* Code Snippet for Multiple Choice (if present) */}
              {hasCodeSnippet && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Code:</h6>
                  <div className="border border-[#2a2a2e] rounded-lg overflow-hidden" style={{ height: '250px' }}>
                    <Editor
                      height="250px"
                      language={getMonacoLanguage(question.language)}
                      value={question.options![0]}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        padding: { top: 10 },
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Code Template for Fill in the Blank */}
              {question.type === 'fillInTheBlank' && question.codeTemplate && (
                <div className="mb-4">
                  <h6 className="text-[#f5f5f4] font-semibold mb-2">Code Template:</h6>
                  <div className="border border-[#2a2a2e] rounded-lg overflow-hidden" style={{ height: '250px' }}>
                    <Editor
                      height="250px"
                      language={getMonacoLanguage(question.language)}
                      value={question.codeTemplate}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        padding: { top: 10 },
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Answer Interface */}
          <div className="flex flex-col">
            <div className="p-6 flex-1 overflow-auto">
              <h6 className="text-[#f5f5f4] font-semibold mb-4">Your Answer:</h6>

              {/* Multiple Choice Options */}
              {question.type === 'multipleChoice' && question.options && (
                <div>
                  {question.options.slice(hasCodeSnippet ? 1 : 0).map((option, index) => (
                    <div key={index} className="mb-3">
                      <label
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAnswer === index
                            ? 'bg-blue-500/10 border-blue-500'
                            : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mcAnswer"
                          checked={selectedAnswer === index}
                          onChange={() => setSelectedAnswer(index)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-[#f5f5f4]">
                            {String.fromCharCode(65 + index)}. {option}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* True/False Options */}
              {question.type === 'trueFalse' && (
                <div>
                  <div className="mb-3">
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        trueFalseAnswer === true
                          ? 'bg-green-500/10 border-green-500'
                          : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={trueFalseAnswer === true}
                        onChange={() => setTrueFalseAnswer(true)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <CheckCircle size={20} className="mr-2 text-green-500" />
                        <span className="font-medium text-[#f5f5f4]">True</span>
                      </div>
                    </label>
                  </div>

                  <div className="mb-3">
                    <label
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        trueFalseAnswer === false
                          ? 'bg-red-500/10 border-red-500'
                          : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={trueFalseAnswer === false}
                        onChange={() => setTrueFalseAnswer(false)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <XCircle size={20} className="mr-2 text-red-500" />
                        <span className="font-medium text-[#f5f5f4]">False</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Fill in the Blank Inputs */}
              {question.type === 'fillInTheBlank' && question.blanks && (
                <div className="space-y-4">
                  {question.blanks.map((blank: {
                    id?: string;
                    correctAnswers: string[];
                    caseSensitive?: boolean;
                    hint?: string;
                    points?: number;
                  }, index: number) => (
                    <div key={blank.id || index}>
                      <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                        Blank {blank.id || (index + 1)}
                        {blank.hint && (
                          <span className="text-[#6b6b70] ml-2 text-xs">
                            <Lightbulb className="w-3 h-3 inline mr-1" />
                            Hint: {blank.hint}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={blankAnswers[blank.id || index] || ''}
                        onChange={(e) => setBlankAnswers(prev => ({
                          ...prev,
                          [blank.id || index]: e.target.value
                        }))}
                        placeholder="Enter your answer..."
                        className="input w-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Code Editor for Code Challenge */}
              {question.type === 'codeChallenge' && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h6 className="text-[#f5f5f4] font-semibold">Write your solution:</h6>
                  </div>
                  <div className="border border-[#2a2a2e] rounded-lg overflow-hidden" style={{ height: '350px' }}>
                    <Editor
                      height="350px"
                      language={getMonacoLanguage(question.language)}
                      value={studentCode}
                      onChange={(value) => setStudentCode(value || '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        padding: { top: 10 },
                        automaticLayout: true,
                      }}
                    />
                  </div>
                  {question.category === 'logic' && (
                    <button className="btn-primary flex items-center gap-2 mt-3">
                      <Play className="w-4 h-4" />
                      Run Tests
                    </button>
                  )}
                </div>
              )}

              {/* Code Editor for Code Debugging */}
              {question.type === 'codeDebugging' && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h6 className="text-[#f5f5f4] font-semibold">Fix the code:</h6>
                  </div>
                  <div className="border border-[#2a2a2e] rounded-lg overflow-hidden" style={{ height: '350px' }}>
                    <Editor
                      height="350px"
                      language={getMonacoLanguage(question.language)}
                      value={studentCode}
                      onChange={(value) => setStudentCode(value || '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        padding: { top: 10 },
                        automaticLayout: true,
                      }}
                    />
                  </div>
                  {question.category === 'logic' && (
                    <button className="btn-primary flex items-center gap-2 mt-3">
                      <Bug className="w-4 h-4" />
                      Test Fix
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Answer Status Footer */}
            <div className="p-3 border-t border-[#2a2a2e] bg-[#1a1a1e]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6b6b70] flex items-center gap-1">
                  <Eye size={14} />
                  Preview - answers are not saved
                </span>
                <button
                  className="btn-secondary text-sm text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  onClick={() => {
                    setSelectedAnswer(null);
                    setTrueFalseAnswer(null);
                    setBlankAnswers({});
                    if (question.type === 'codeChallenge') {
                      setStudentCode(question.codeTemplate || '');
                    } else if (question.type === 'codeDebugging') {
                      setStudentCode(question.buggyCode || '');
                    }
                  }}
                >
                  Clear Answer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminView = () => {
    if (!question) return null;

    return (
      <div className="card mb-4">
        <div className="p-4">
          <h5 className="font-mono font-semibold text-[#f5f5f4] flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-blue-400" />
            Admin View - Question Details & Answers
          </h5>

          {/* Question Description - The actual question */}
          <div className="mb-6 p-4 bg-cyan-500/10 rounded-lg border-l-4 border-cyan-500">
            <h6 className="text-cyan-400 font-medium mb-2">Question Asked:</h6>
            <p className="text-[#a1a1aa]">{question.description}</p>
          </div>

          {/* Multiple Choice Answers */}
          {question.type === 'multipleChoice' && question.options && (
            <div className="mb-6">
              {question.options[0] && question.options[0].includes('\n') && (
                <div className="mb-4">
                  <h6 className="font-medium text-[#f5f5f4] mb-2">Code Provided to Students:</h6>
                  <div className="border border-[#2a2a2e] rounded-lg overflow-hidden">
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.options[0]}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                      }}
                    />
                  </div>
                </div>
              )}

              <h6 className="font-medium text-[#f5f5f4] mb-3">All Options with Correct Answer:</h6>
              <div className="space-y-2">
                {question.options.slice(question.options[0].includes('\n') ? 1 : 0).map((option, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${question.correctAnswer === index ? 'bg-green-500/10 border border-green-500/30' : 'bg-[#1c1c1f]'}`}>
                    {question.correctAnswer === index ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#6b6b70]" />
                    )}
                    <span className="font-mono font-medium text-amber-400">
                      {String.fromCharCode(65 + index)}:
                    </span>
                    <span className={question.correctAnswer === index ? 'text-green-400 font-medium' : 'text-[#a1a1aa]'}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* True/False Answer */}
          {question.type === 'trueFalse' && (
            <div className="mb-6">
              <h6 className="font-medium text-[#f5f5f4] mb-3">Correct Answer:</h6>
              {question.correctAnswer ? (
                <span className="badge-green flex items-center gap-2 w-fit">
                  <CheckCircle className="w-4 h-4" />
                  True
                </span>
              ) : (
                <span className="badge-red flex items-center gap-2 w-fit">
                  <XCircle className="w-4 h-4" />
                  False
                </span>
              )}
            </div>
          )}

          {/* Fill in the Blank - Show Template and Answers */}
          {question.type === 'fillInTheBlank' && (
            <div className="mb-6">
              {question.codeTemplate && (
                <div className="mb-4">
                  <h6 className="font-medium text-[#f5f5f4] mb-2">Code Template (with blanks):</h6>
                  <div className="border border-[#2a2a2e] rounded-lg overflow-hidden">
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.codeTemplate}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                      }}
                    />
                  </div>
                </div>
              )}

              {question.blanks && (
                <div className="mb-4">
                  <h6 className="font-medium text-[#f5f5f4] mb-3">Blank Answers:</h6>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#2a2a2e]">
                          <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Blank ID</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Correct Answers</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Case Sensitive</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Points</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Hint</th>
                        </tr>
                      </thead>
                      <tbody>
                        {question.blanks.map((blank, index) => (
                          <tr key={index} className="border-b border-[#1c1c1f]">
                            <td className="py-2 px-3"><code className="text-amber-400">{blank.id || (index + 1)}</code></td>
                            <td className="py-2 px-3">
                              <div className="flex flex-wrap gap-1">
                                {blank.correctAnswers.map((answer, i) => (
                                  <span key={i} className="badge-green text-xs">{answer}</span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-xs ${blank.caseSensitive ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                {blank.caseSensitive ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[#a1a1aa]">{blank.points || 1}</td>
                            <td className="py-2 px-3 text-sm text-[#6b6b70]">{blank.hint || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Code Challenge - Show Template */}
          {question.type === 'codeChallenge' && question.codeTemplate && (
            <div className="mb-6">
              <h6 className="font-medium text-[#f5f5f4] mb-2">Starting Code Template:</h6>
              <div className="border border-[#2a2a2e] rounded-lg overflow-hidden">
                <Editor
                  height="200px"
                  language={getMonacoLanguage(question.language)}
                  value={question.codeTemplate}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                  }}
                />
              </div>
            </div>
          )}

          {/* Code Debugging - Show Buggy Code and Solution */}
          {question.type === 'codeDebugging' && (
            <div className="mb-6">
              {question.buggyCode && (
                <div className="mb-4">
                  <h6 className="font-medium text-[#f5f5f4] mb-2">Buggy Code (Given to Students):</h6>
                  <div className="border border-amber-500/30 rounded-lg overflow-hidden">
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.buggyCode}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                      }}
                    />
                  </div>
                </div>
              )}

              {question.solutionCode && (
                <div className="mb-4">
                  <h6 className="font-medium text-[#f5f5f4] mb-2">Solution Code (Correct Version):</h6>
                  <div className="border border-green-500/30 rounded-lg overflow-hidden">
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.solutionCode}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Code Configuration (for logic questions) */}
          {['codeChallenge', 'codeDebugging'].includes(question.type) && question.category === 'logic' && question.codeConfig && (
            <div className="mb-6">
              <h6 className="font-medium text-[#f5f5f4] mb-3">Code Execution Configuration:</h6>
              <div className="p-4 bg-[#1c1c1f] rounded-lg grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-[#6b6b70]">Runtime:</span>
                  <span className="ml-2 text-[#f5f5f4]">{question.codeConfig.runtime || 'node'}</span>
                </div>
                <div>
                  <span className="text-sm text-[#6b6b70]">Entry Function:</span>
                  <span className="ml-2 text-[#f5f5f4]">{question.codeConfig.entryFunction || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm text-[#6b6b70]">Timeout:</span>
                  <span className="ml-2 text-[#f5f5f4]">{question.codeConfig.timeoutMs || 5000}ms</span>
                </div>
                <div>
                  <span className="text-sm text-[#6b6b70]">Allow Preview:</span>
                  <span className="ml-2 text-[#f5f5f4]">{question.codeConfig.allowPreview ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Test Cases (for logic questions) */}
          {['codeChallenge', 'codeDebugging'].includes(question.type) && question.category === 'logic' && question.testCases && (
            <div className="mb-6">
              <h6 className="font-medium text-[#f5f5f4] mb-3">Test Cases:</h6>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a2e]">
                      <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Name</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Arguments</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Expected Output</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-[#6b6b70]">Visibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {question.testCases.map((testCase, index) => (
                      <tr key={index} className="border-b border-[#1c1c1f]">
                        <td className="py-2 px-3 text-[#a1a1aa]">{testCase.name || `Test ${index + 1}`}</td>
                        <td className="py-2 px-3">
                          <code className="text-xs text-amber-400 bg-[#1c1c1f] px-1 py-0.5 rounded">
                            {Array.isArray(testCase.args) ? JSON.stringify(testCase.args) : String(testCase.args)}
                          </code>
                        </td>
                        <td className="py-2 px-3">
                          <code className="text-xs text-green-400 bg-[#1c1c1f] px-1 py-0.5 rounded">
                            {JSON.stringify(testCase.expected)}
                          </code>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${testCase.hidden ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
                            {testCase.hidden ? 'Hidden' : 'Visible'}
                          </span>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading question details...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] py-8">
        <div className="container-section">
          <div className="max-w-xl mx-auto">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium mb-4">{error || 'Question not found'}</p>
              <button onClick={() => navigate('/admin/question-bank')} className="btn-primary">
                Back to Question Bank
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || user?.role === 'instructor';
  const canDelete = user?.role === 'admin' ||
    (user?.role === 'instructor' && question.createdBy === user._id);

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#2a2a2e]">
        <div className="container-section py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/question-bank')}
                className="p-2 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Eye className="w-6 h-6 text-blue-400" />
              <div>
                <h1 className="font-mono text-xl font-bold text-[#f5f5f4]">Question Details</h1>
                <p className="text-sm text-[#6b6b70]">View and manage question information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-[#a1a1aa] cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentViewMode}
                  onChange={(e) => setStudentViewMode(e.target.checked)}
                  className="accent-amber-500"
                />
                Student View
              </label>

              <button onClick={handleDuplicate} className="btn-secondary text-sm flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              {canEdit && (
                <button onClick={handleEdit} className="btn-primary text-sm flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-primary bg-red-500 hover:bg-red-600 text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-section py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Question Header */}
            <div className="card mb-4">
              <div className="p-4">
                <h2 className="text-xl font-semibold text-[#f5f5f4] mb-3">{question.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyClasses(question.difficulty)}`}>
                    {question.difficulty || 'Unknown'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/10 text-cyan-400">
                    {getTypeDisplay(question.type)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">
                    {question.language || 'Unknown'}
                  </span>
                  {question.category && (
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400">
                      {getCategoryDisplay(question.category)}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    question.status === 'active' ? 'bg-green-500/10 text-green-400' :
                    question.status === 'draft' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {question.status || 'Unknown'}
                  </span>
                  {question.isGlobal && (
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Global
                    </span>
                  )}
                </div>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-[#6b6b70] mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {question.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded text-xs bg-[#2a2a2e] text-[#a1a1aa]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Question Content - Toggle between student and admin view */}
            {studentViewMode ? renderStudentView() : renderAdminView()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Metadata */}
            <div className="card">
              <div className="p-4 border-b border-[#2a2a2e]">
                <h6 className="font-mono font-semibold text-[#f5f5f4] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Question Info
                </h6>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-[#6b6b70]" />
                    <span className="text-xs text-[#6b6b70]">Created by</span>
                  </div>
                  <p className="text-[#a1a1aa] ml-6">{question.createdBy || 'Unknown'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#6b6b70]" />
                    <span className="text-xs text-[#6b6b70]">Created</span>
                  </div>
                  <p className="text-[#a1a1aa] ml-6">{new Date(question.createdAt).toLocaleDateString()}</p>
                </div>

                {question.updatedAt && question.updatedAt !== question.createdAt && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-[#6b6b70]" />
                      <span className="text-xs text-[#6b6b70]">Updated</span>
                    </div>
                    <p className="text-[#a1a1aa] ml-6">{new Date(question.updatedAt).toLocaleDateString()}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-[#6b6b70]" />
                    <span className="text-xs text-[#6b6b70]">Scope</span>
                  </div>
                  <div className="ml-6">
                    {question.isGlobal ? (
                      <span className="badge-blue flex items-center gap-1 w-fit text-xs">
                        <Globe className="w-3 h-3" />
                        Global
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">Organization</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            {question.usageStats && (
              <div className="card">
                <div className="p-4 border-b border-[#2a2a2e]">
                  <h6 className="font-mono font-semibold text-[#f5f5f4] flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    Usage Statistics
                  </h6>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6b6b70]">Times Used</span>
                    <span className="badge-blue text-xs">{question.usageStats.timesUsed || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6b6b70]">Total Attempts</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">{question.usageStats.totalAttempts || 0}</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-[#6b6b70]">Success Rate</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        (question.usageStats.successRate || 0) >= 0.7 ? 'bg-green-500/10 text-green-400' :
                        (question.usageStats.successRate || 0) >= 0.5 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {((question.usageStats.successRate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#2a2a2e] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          (question.usageStats.successRate || 0) >= 0.7 ? 'bg-green-500' :
                          (question.usageStats.successRate || 0) >= 0.5 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(question.usageStats.successRate || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#6b6b70]">Avg. Time</span>
                    <div className="flex items-center gap-1 text-[#a1a1aa]">
                      <Clock className="w-3 h-3 text-[#6b6b70]" />
                      <span className="text-sm">{Math.round(question.usageStats.averageTime || 0)}s</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Question Analytics */}
            {renderAnalyticsSection()}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <div className="modal-content w-full max-w-md">
            <div className="p-4 border-b border-[#2a2a2e]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h5 className="font-mono font-semibold text-[#f5f5f4]">Delete Question</h5>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[#a1a1aa] mb-3">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="p-3 bg-[#1c1c1f] rounded-lg mb-4">
                <span className="font-medium text-[#f5f5f4]">"{question?.title}"</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-[#6b6b70]">
                  This will permanently remove the question from the question bank. Any tests using this question may be affected.
                </span>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-[#2a2a2e]">
              <button onClick={cancelDelete} disabled={deleting} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="btn-primary bg-red-500 hover:bg-red-600 flex-1 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="spinner w-4 h-4" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewQuestionPage;