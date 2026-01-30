import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Edit3,
    RotateCcw,
    Save,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ApiService from '../services/ApiService';

interface QuestionScore {
    questionIndex: number;
    pointsEarned: number;
    pointsPossible: number;
    isCorrect: boolean;
    feedback?: string;
}

interface DetailedResultScoringProps {
    resultId: string;
    onBack?: () => void;
}

const DetailedResultScoringPage: React.FC<DetailedResultScoringProps> = ({ resultId, onBack }) => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editedScores, setEditedScores] = useState<Map<number, QuestionScore>>(new Map());
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [generalFeedback, setGeneralFeedback] = useState('');

    useEffect(() => {
        if (resultId) {
            fetchResultDetails();
        }
    }, [resultId]);

    const fetchResultDetails = async () => {
        try {
            setLoading(true);
            const resultData = await ApiService.getResult(resultId);
            setResult(resultData);
            setGeneralFeedback(resultData.instructorFeedback || '');
        } catch (error) {
            setError('Failed to load test result details');
            console.error('Error fetching result:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (questionIndex: number, field: keyof QuestionScore, value: any) => {
        if (!result) return;

        const question = result.questions[questionIndex];
        if (!question) return;

        const currentEdit = editedScores.get(questionIndex) || {
            questionIndex,
            pointsEarned: question.pointsEarned,
            pointsPossible: question.pointsPossible,
            isCorrect: question.isCorrect,
            feedback: question.feedback || ''
        };

        const updatedScore = { ...currentEdit, [field]: value };

        // Auto-determine correctness based on points
        if (field === 'pointsEarned') {
            updatedScore.isCorrect = value > 0;
        }

        setEditedScores(new Map(editedScores.set(questionIndex, updatedScore)));
        setHasUnsavedChanges(true);
    };

    const calculateNewTotalScore = () => {
        if (!result) return result?.score;

        let totalEarned = 0;
        let totalPossible = 0;

        result.questions.forEach((question: any, index: number) => {
            const editedScore = editedScores.get(index);
            if (editedScore) {
                totalEarned += editedScore.pointsEarned;
                totalPossible += editedScore.pointsPossible;
            } else {
                totalEarned += question.pointsEarned;
                totalPossible += question.pointsPossible;
            }
        });

        const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
        const passed = percentage >= (result.score.passingThreshold || 70);

        return {
            ...result.score,
            earnedPoints: totalEarned,
            totalPoints: totalPossible,
            percentage,
            passed,
            correctAnswers: result.questions.filter((q: any, i: number) => {
                const edited = editedScores.get(i);
                return edited ? edited.isCorrect : q.isCorrect;
            }).length
        };
    };

    const handleSaveChanges = async () => {
        if (!result || editedScores.size === 0) return;

        try {
            setSaving(true);

            const updates = Array.from(editedScores.values()).map(score => ({
                questionIndex: score.questionIndex,
                pointsEarned: score.pointsEarned,
                isCorrect: score.isCorrect,
                feedback: score.feedback
            }));

            await ApiService.bulkUpdateQuestionScores(result._id, {
                updates,
                feedback: generalFeedback
            });

            await fetchResultDetails();
            setEditedScores(new Map());
            setHasUnsavedChanges(false);
            setShowSaveModal(false);

        } catch (error) {
            setError('Failed to save score changes');
            console.error('Error saving scores:', error);
        } finally {
            setSaving(false);
        }
    };

    const resetChanges = () => {
        setEditedScores(new Map());
        setHasUnsavedChanges(false);
        setGeneralFeedback(result?.instructorFeedback || '');
    };

    const getQuestionTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            multipleChoice: 'bg-blue-500/10 text-blue-400',
            trueFalse: 'bg-cyan-500/10 text-cyan-400',
            fillInTheBlank: 'bg-amber-500/10 text-amber-400',
            essay: 'bg-red-500/10 text-red-400',
            codeChallenge: 'bg-purple-500/10 text-purple-400',
            codeDebugging: 'bg-gray-500/10 text-gray-400'
        };
        return colors[type] || 'bg-gray-500/10 text-gray-400';
    };

    const formatStudentAnswer = (question: any) => {
        if (!question.studentAnswer && question.studentAnswer !== 0 && question.studentAnswer !== false) {
            return 'No answer provided';
        }

        switch (question.type) {
            case 'multipleChoice':
                if (question.details?.options && typeof question.studentAnswer === 'number') {
                    const selectedIndex = question.studentAnswer;
                    const selectedText = question.details.options[selectedIndex];
                    return selectedText ? `${selectedIndex}: ${selectedText}` : `Option ${selectedIndex}`;
                }
                return question.studentAnswer?.toString() || 'No answer';

            case 'trueFalse':
                if (typeof question.studentAnswer === 'boolean') {
                    return question.studentAnswer ? 'True' : 'False';
                }
                return question.studentAnswer?.toString() || 'No answer';

            case 'fillInTheBlank':
                if (typeof question.studentAnswer === 'object' && question.studentAnswer !== null) {
                    return Object.entries(question.studentAnswer)
                        .map(([key, value]) => `${key}: "${value}"`)
                        .join('\n');
                }
                return question.studentAnswer?.toString() || 'No answer';

            case 'codeChallenge':
            case 'codeDebugging':
                return question.studentAnswer?.toString() || 'No code provided';

            default:
                if (typeof question.studentAnswer === 'object') {
                    return JSON.stringify(question.studentAnswer, null, 2);
                }
                return question.studentAnswer?.toString() || 'No answer';
        }
    };

    const formatCorrectAnswer = (question: any) => {
        if (!question.correctAnswer && question.correctAnswer !== 0 && question.correctAnswer !== false) {
            switch (question.type) {
                case 'multipleChoice':
                    if (question.details?.options && typeof question.details?.correctOption === 'number') {
                        const correctIndex = question.details.correctOption;
                        const correctText = question.details.options[correctIndex];
                        return correctText ? `${correctIndex}: ${correctText}` : `Option ${correctIndex}`;
                    }
                    break;
                case 'fillInTheBlank':
                    if (question.details?.blanks) {
                        return question.details.blanks
                            .map((blank: any) => `${blank.id}: ${blank.correctAnswers?.join(' OR ') || 'N/A'}`)
                            .join('\n');
                    }
                    break;
            }
            return 'Not specified';
        }

        switch (question.type) {
            case 'multipleChoice':
                if (question.details?.options && typeof question.correctAnswer === 'number') {
                    const correctIndex = question.correctAnswer;
                    const correctText = question.details.options[correctIndex];
                    return correctText ? `${correctIndex}: ${correctText}` : `Option ${correctIndex}`;
                }
                return question.correctAnswer?.toString() || 'Not specified';

            case 'trueFalse':
                if (typeof question.correctAnswer === 'boolean') {
                    return question.correctAnswer ? 'True' : 'False';
                }
                if (question.correctAnswer === 1) return 'True';
                if (question.correctAnswer === 0) return 'False';
                return question.correctAnswer?.toString() || 'Not specified';

            case 'fillInTheBlank':
                if (Array.isArray(question.correctAnswer)) {
                    return question.correctAnswer
                        .map((answer: any) => `${answer.id}: ${answer.correctAnswers?.join(' OR ') || 'N/A'}`)
                        .join('\n');
                }
                break;

            case 'codeChallenge':
            case 'codeDebugging':
                return question.correctAnswer?.toString() || 'Various solutions possible';

            default:
                if (typeof question.correctAnswer === 'object') {
                    return JSON.stringify(question.correctAnswer, null, 2);
                }
                return question.correctAnswer?.toString() || 'Not specified';
        }
    };

    const newTotalScore = calculateNewTotalScore();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mb-4 mx-auto" />
                    <p className="text-[#a1a1aa]">Loading test result...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] py-8">
                <div className="container-section">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">Test result not found</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] py-8">
            <div className="container-section">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <button
                            onClick={onBack}
                            className="btn-ghost text-sm mb-3 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Results
                        </button>
                        <h2 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-1">Manual Score Review</h2>
                        <p className="text-[#6b6b70]">
                            {result.userId?.firstName} {result.userId?.lastName} • {result.testId?.title}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="mb-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                hasUnsavedChanges 
                                    ? (newTotalScore?.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')
                                    : (result.score.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')
                            }`}>
                                {hasUnsavedChanges ? newTotalScore?.percentage : result.score.percentage}%
                                {hasUnsavedChanges && ' (New)'}
                            </span>
                        </div>
                        {hasUnsavedChanges && (
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={resetChanges}
                                    disabled={saving}
                                    className="btn-secondary text-sm flex items-center gap-1"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowSaveModal(true)}
                                    disabled={saving}
                                    className="btn-primary text-sm flex items-center gap-1"
                                >
                                    <Save className="w-4 h-4" />
                                    Save ({editedScores.size})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 mb-6">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">{error}</span>
                    </div>
                )}

                {/* Questions */}
                <div className="space-y-4">
                    {result.questions.map((question: any, index: number) => {
                        const editedScore = editedScores.get(index);
                        const currentScore = editedScore || {
                            pointsEarned: question.pointsEarned,
                            pointsPossible: question.pointsPossible,
                            isCorrect: question.isCorrect,
                            feedback: question.feedback || ''
                        };

                        return (
                            <div key={index} className={`card ${editedScore ? 'ring-1 ring-amber-500/50' : ''}`}>
                                {/* Question Header */}
                                <div className="p-4 border-b border-[#2a2a2e]">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h6 className="font-medium text-[#f5f5f4]">
                                                    Question {index + 1}: {question.title}
                                                </h6>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getQuestionTypeColor(question.type)}`}>
                                                    {question.type}
                                                </span>
                                                {editedScore && (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 flex items-center gap-1">
                                                        <Edit3 className="w-3 h-3" />
                                                        Modified
                                                    </span>
                                                )}
                                            </div>
                                            {question.description && (
                                                <p className="text-sm text-[#6b6b70]">{question.description}</p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                            currentScore.isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {currentScore.pointsEarned} / {question.pointsPossible} pts
                                        </span>
                                    </div>
                                </div>

                                {/* Question Body */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Answers Section */}
                                        <div className="lg:col-span-2 space-y-4">
                                            {/* Student Answer */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Student Answer:</label>
                                                <div className="p-3 bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg">
                                                    <pre className="text-sm text-[#a1a1aa] whitespace-pre-wrap font-mono">
                                                        {formatStudentAnswer(question)}
                                                    </pre>
                                                </div>
                                            </div>

                                            {/* Correct Answer */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Expected Answer:</label>
                                                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                                                    <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                                                        {formatCorrectAnswer(question)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scoring Section */}
                                        <div className="bg-[#1c1c1f] rounded-lg p-4">
                                            <h6 className="font-medium text-[#f5f5f4] mb-4">Scoring</h6>

                                            {/* Points Earned */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Points</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={question.pointsPossible}
                                                        step="0.5"
                                                        value={currentScore.pointsEarned}
                                                        onChange={(e) => handleScoreChange(index, 'pointsEarned', parseFloat(e.target.value) || 0)}
                                                        className="input w-20"
                                                    />
                                                    <span className="text-[#6b6b70]">/ {question.pointsPossible}</span>
                                                </div>
                                            </div>

                                            {/* Correct/Incorrect */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Status</label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${index}`}
                                                            checked={currentScore.isCorrect}
                                                            onChange={() => handleScoreChange(index, 'isCorrect', true)}
                                                            className="accent-green-500"
                                                        />
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                        <span className="text-sm text-[#a1a1aa]">Correct</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${index}`}
                                                            checked={!currentScore.isCorrect}
                                                            onChange={() => handleScoreChange(index, 'isCorrect', false)}
                                                            className="accent-red-500"
                                                        />
                                                        <XCircle className="w-4 h-4 text-red-400" />
                                                        <span className="text-sm text-[#a1a1aa]">Incorrect</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Feedback */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#6b6b70] mb-2">Feedback</label>
                                                <textarea
                                                    rows={3}
                                                    value={currentScore.feedback}
                                                    onChange={(e) => handleScoreChange(index, 'feedback', e.target.value)}
                                                    placeholder="Optional feedback..."
                                                    className="input resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* General Feedback */}
                {hasUnsavedChanges && (
                    <div className="card mt-6">
                        <div className="p-4">
                            <h6 className="font-medium text-[#f5f5f4] mb-3">General Feedback</h6>
                            <textarea
                                rows={3}
                                value={generalFeedback}
                                onChange={(e) => setGeneralFeedback(e.target.value)}
                                placeholder="Optional general feedback for this test attempt..."
                                className="input resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Save Modal */}
                {showSaveModal && (
                    <div className="modal-backdrop flex items-center justify-center p-4">
                        <div className="modal-content w-full max-w-md">
                            <div className="p-4 border-b border-[#2a2a2e]">
                                <h3 className="font-mono font-semibold text-[#f5f5f4]">Save Score Changes</h3>
                            </div>
                            <div className="p-4">
                                <p className="text-[#a1a1aa] mb-4">
                                    You are about to save changes to <strong className="text-[#f5f5f4]">{editedScores.size}</strong> question(s).
                                </p>
                                {newTotalScore && (
                                    <div className="bg-[#1c1c1f] p-4 rounded-lg">
                                        <h6 className="font-medium text-[#f5f5f4] mb-3">Score Summary:</h6>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6b6b70]">Total Score:</span>
                                                <span className="font-medium text-[#f5f5f4]">
                                                    {result.score.percentage}% → {newTotalScore.percentage}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6b6b70]">Status:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                                        result.score.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {result.score.passed ? 'Pass' : 'Fail'}
                                                    </span>
                                                    <span className="text-[#6b6b70]">→</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                                        newTotalScore.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {newTotalScore.passed ? 'Pass' : 'Fail'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 p-4 border-t border-[#2a2a2e]">
                                <button
                                    className="btn-secondary flex-1"
                                    onClick={() => setShowSaveModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    onClick={handleSaveChanges}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="spinner w-4 h-4" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailedResultScoringPage;