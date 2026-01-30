import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Calendar, HelpCircle, Layers, List, AlertTriangle, Loader2 } from 'lucide-react';
import apiService from '../services/ApiService';
import type {
  Result,
  ResultQuestion,
  Test,
  TestSettings,
  SessionStatus
} from '../types';

import {
  formatDuration
} from '../types';

// Extended interfaces to handle MongoDB-specific fields and populated references
interface ExtendedResult extends Omit<Result, 'testId'> {
  testId: string | { _id: string; title: string; description: string };
}

interface ExtendedTest extends Test {
  settings: TestSettings & {
    useSections: boolean;
    timeLimit: number;
  };
}

interface SectionSummary {
  sectionIndex: number;
  sectionName: string;
  questions: ResultQuestion[];
  totalPoints: number;
  earnedPoints: number;
  correctAnswers: number;
  totalTime: number;
}

const ResultDetailsPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<ExtendedResult | null>(null);
  const [test, setTest] = useState<ExtendedTest | null>(null);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resultId) {
      fetchData();
    }
  }, [resultId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultData = await apiService.getResult(resultId!) as ExtendedResult;

      if (!resultData || !resultData._id) {
        throw new Error('Failed to fetch result');
      }

      const testId = typeof resultData.testId === 'object' ? resultData.testId._id : resultData.testId;
      const testData = await apiService.getTest(testId) as ExtendedTest;

      if (!testData || !testData._id) {
        throw new Error('Failed to fetch test');
      }

      setTest(testData);
      setResult(resultData);

      // Process sections if applicable
      if (testData.settings.useSections && resultData.questions.some(q => q.sectionName)) {
        processSections(resultData.questions);
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const processSections = (questions: ResultQuestion[]) => {
    const sectionMap = new Map<string, ResultQuestion[]>();

    // Group questions by section
    questions.forEach(question => {
      const sectionKey = question.sectionName || 'No Section';
      if (!sectionMap.has(sectionKey)) {
        sectionMap.set(sectionKey, []);
      }
      sectionMap.get(sectionKey)!.push(question);
    });

    // Create section summaries
    const sectionSummaries: SectionSummary[] = [];

    sectionMap.forEach((sectionQuestions, sectionName) => {
      const sectionIndex = sectionQuestions[0]?.sectionIndex ?? 0;
      const totalPoints = sectionQuestions.reduce((sum, q) => sum + (q.pointsPossible || 10), 0);
      const earnedPoints = sectionQuestions.reduce((sum, q) => sum + (getPointsEarned(q)), 0);
      const correctAnswers = sectionQuestions.filter(q => q.isCorrect === true).length;
      const totalTime = sectionQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

      sectionSummaries.push({
        sectionIndex,
        sectionName,
        questions: sectionQuestions,
        totalPoints,
        earnedPoints,
        correctAnswers,
        totalTime
      });
    });

    // Sort by section index
    sectionSummaries.sort((a, b) => a.sectionIndex - b.sectionIndex);
    setSections(sectionSummaries);
  };

  const formatTime = (seconds: number): string => {
    return formatDuration(seconds);
  };

  // Helper function to get points earned from either field
  const getPointsEarned = (question: ResultQuestion): number => {
    return question.pointsEarned ?? question.pointsAwarded ?? 0;
  };

  const getStatusBadgeClass = (status: SessionStatus, passed?: boolean): string => {
    if (status === 'completed') {
      return passed ? 'badge-green' : 'badge-red';
    }
    const classes: Record<SessionStatus, string> = {
      inProgress: 'badge-blue',
      expired: 'badge-amber',
      abandoned: 'badge-gray',
      completed: 'badge-green',
      paused: 'badge-purple',
      failed: 'badge-red'
    };
    return classes[status] || 'badge-gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] pt-20">
        <div className="container-section flex justify-center items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="mt-3 text-[#a1a1aa]">Loading result details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result || !test) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] pt-20">
        <div className="container-section">
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/25 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{error || 'Result not found'}</span>
            </div>
            <button
              className="btn-secondary text-sm flex items-center gap-2"
              onClick={() => navigate('/results')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </button>
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
              Test Result Details
            </h1>
            <p className="text-[#a1a1aa]">
              Detailed breakdown of your test performance
            </p>
          </div>
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => navigate('/results')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </button>
        </div>

        {/* Result Summary */}
        <div className="card mb-6">
          <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
            <h5 className="font-mono text-lg font-semibold flex items-center gap-2 mb-0">
              <Trophy className="w-5 h-5 text-amber-500" />
              {test.title} - Attempt #{result.attemptNumber}
            </h5>
            <span className={`${getStatusBadgeClass(result.status, result.score.passed)} px-3 py-1.5`}>
              {result.status === 'completed'
                ? (result.score.passed ? 'PASSED' : 'FAILED')
                : result.status.toUpperCase()
              }
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Score */}
              <div className="text-center">
                <div className="mb-2 progress-bar" style={{ height: '12px' }}>
                  <div
                    className={`progress-fill ${result.score.passed ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${result.score.percentage}%` }}
                  />
                </div>
                <h4 className="font-mono text-2xl font-bold mb-1">
                  {result.score.percentage.toFixed(1)}%
                </h4>
                <p className="text-[#6b6b70] text-sm">
                  {result.score.earnedPoints} / {result.score.totalPoints} points
                </p>
              </div>

              {/* Time Spent */}
              <div className="text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h5 className="font-mono text-lg font-semibold mb-1">{formatTime(result.timeSpent)}</h5>
                <p className="text-[#6b6b70] text-sm">Time Spent</p>
              </div>

              {/* Date */}
              <div className="text-center">
                <Calendar className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                <h6 className="font-mono font-semibold mb-1">{new Date(result.createdAt).toLocaleDateString()}</h6>
                <p className="text-[#6b6b70] text-sm">
                  {new Date(result.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Questions */}
              <div className="text-center">
                <HelpCircle className="w-8 h-8 text-[#6b6b70] mx-auto mb-2" />
                <h5 className="font-mono text-lg font-semibold mb-1">{result.questions.length}</h5>
                <p className="text-[#6b6b70] text-sm">Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Performance (if applicable) */}
        {sections.length > 0 && (
          <div className="card mb-6">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h5 className="font-mono text-lg font-semibold flex items-center gap-2 mb-0">
                <Layers className="w-5 h-5 text-blue-500" />
                Section Performance
              </h5>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section) => {
                  const percentage = (section.earnedPoints / section.totalPoints) * 100;
                  return (
                    <div key={section.sectionIndex} className="card p-4">
                      <h6 className="font-mono font-semibold mb-2">{section.sectionName}</h6>
                      <div className="mb-2 progress-bar">
                        <div
                          className={`progress-fill ${percentage >= 70 ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#a1a1aa]">{section.earnedPoints}/{section.totalPoints} pts</span>
                        <span className="text-[#a1a1aa]">{section.correctAnswers}/{section.questions.length} correct</span>
                      </div>
                      <small className="text-[#6b6b70]">
                        Time: {formatTime(section.totalTime)}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Question Summary Table */}
        <div className="card">
          <div className="p-4 border-b border-[#2a2a2e]">
            <h5 className="font-mono text-lg font-semibold flex items-center gap-2 mb-0">
              <List className="w-5 h-5 text-blue-500" />
              Question Summary
            </h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2e] bg-[#1a1a1e]">
                  <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Question</th>
                  <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Result</th>
                  <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-[#6b6b70] font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {result.questions.map((question, index) => {
                  const pointsEarned = getPointsEarned(question);
                  const pointsPossible = question.pointsPossible || 10;
                  const percentage = (pointsEarned / pointsPossible) * 100;

                  return (
                    <tr key={question.questionId} className="border-b border-[#2a2a2e] hover:bg-[#1a1a1e]">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-[#f5f5f4]">
                            Question {index + 1}
                          </div>
                          <div className="text-sm text-[#6b6b70]">
                            {question.title}
                          </div>
                          {question.sectionName && (
                            <div className="mt-1">
                              <span className="badge-purple text-xs">{question.sectionName}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            question.isCorrect === true ? 'badge-green' :
                            question.isCorrect === false ? 'badge-red' :
                            'badge-gray'
                          }
                        >
                          {question.isCorrect === true ? 'Correct' : question.isCorrect === false ? 'Incorrect' : 'Not Graded'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#f5f5f4]">{pointsEarned}</span>
                        <span className="text-[#6b6b70]"> / {pointsPossible}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[#6b6b70]">{formatTime(question.timeSpent || 0)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-20 progress-bar">
                          <div
                            className={`progress-fill ${
                              question.isCorrect === true ? 'bg-green-500' :
                              question.isCorrect === false ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailsPage;
