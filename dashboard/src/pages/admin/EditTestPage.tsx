// src/pages/admin/EditTestPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';
import apiService from '../../services/ApiService';
import type { Question } from '../../types';

interface TestQuestion {
  _id: string;
  title: string;
  description?: string;
  type: string;
  difficulty: string;
  points: number;
  language?: string;
  category?: string;
}

interface TestFormData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'active' | 'archived';
  testType: string;
  timeLimit: number | null;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  showAnswers: boolean;
  questions: string[];
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

export default function EditTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<TestFormData>({
    title: '',
    description: '',
    difficulty: 'medium',
    status: 'draft',
    testType: 'practice',
    timeLimit: null,
    passingScore: 70,
    maxAttempts: -1,
    shuffleQuestions: false,
    showResults: true,
    showAnswers: false,
    questions: []
  });

  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Collapsible sections
  const [sectionsOpen, setSectionsOpen] = useState({
    basic: true,
    settings: true,
    questions: true
  });

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
      const data = await apiService.getTestWithQuestions(testId) as any;

      // Read settings from the nested structure (matching backend schema)
      const timeLimit = data.settings?.timeLimit ?? null;
      const maxAttempts = data.settings?.attemptsAllowed >= 999 ? -1 : (data.settings?.attemptsAllowed ?? -1);
      const passingScore = 70; // Not stored in backend, use default
      const shuffleQuestions = data.settings?.shuffleQuestions ?? false;
      const showResults = true; // Not stored in backend, use default
      const showAnswers = false; // Not stored in backend, use default
      const difficulty = 'medium'; // Not stored in backend, use default

      // Handle sectioned vs flat questions - both use same nested structure
      let questions: TestQuestion[] = [];
      let questionIds: string[] = [];

      if (data.settings?.useSections && data.sections?.length) {
        // Extract questions from sections
        data.sections.forEach((section: any) => {
          section.questions?.forEach((q: any) => {
            if (q.questionData) {
              questions.push({
                ...q.questionData,
                points: q.points || 10
              });
              questionIds.push(q.questionId || q.questionData._id);
            }
          });
        });
      } else if (data.questions) {
        // Flat questions array - also has nested questionData structure
        data.questions.forEach((q: any) => {
          if (q.questionData) {
            questions.push({
              ...q.questionData,
              points: q.points || 10
            });
            questionIds.push(q.questionId || q.questionData._id);
          } else {
            // Fallback for truly flat questions (legacy format)
            questions.push(q);
            questionIds.push(q._id);
          }
        });
      }

      setFormData({
        title: data.title || '',
        description: data.description || '',
        difficulty: difficulty,
        status: data.status || 'draft',
        testType: data.testType || 'practice',
        timeLimit: timeLimit,
        passingScore: passingScore,
        maxAttempts: maxAttempts,
        shuffleQuestions: shuffleQuestions,
        showResults: showResults,
        showAnswers: showAnswers,
        questions: questionIds
      });

      setTestQuestions(questions);
    } catch (err: any) {
      console.error('Failed to fetch test:', err);
      setError(err.response?.data?.message || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableQuestions = async (search?: string, type?: string) => {
    try {
      setLoadingQuestions(true);
      const params: Record<string, any> = { limit: 200 };
      if (search) params.search = search;
      if (type) params.type = type;
      const response = await apiService.getAllQuestions(params);
      const questions = response.questions || [];
      // Filter out questions already in the test
      const filtered = questions.filter((q: Question) => !formData.questions.includes(q._id));
      setAvailableQuestions(filtered);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleInputChange = (field: keyof TestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!testId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Build the update payload matching backend UpdateTestDto structure
      const updatePayload: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        settings: {
          timeLimit: formData.timeLimit || 30,
          attemptsAllowed: formData.maxAttempts <= 0 ? 999 : formData.maxAttempts,
          shuffleQuestions: formData.shuffleQuestions,
        },
        questions: formData.questions.map(qId => ({ questionId: qId, points: 10 }))
      };

      // Only include testType if it's a valid backend enum value
      const validTestTypes = ['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'];
      if (validTestTypes.includes(formData.testType)) {
        updatePayload.testType = formData.testType;
      }

      await apiService.updateTest(testId, updatePayload as any);

      setSuccessMessage('Test saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to save test:', err);
      setError(err.response?.data?.message || 'Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (question: Question) => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, question._id]
    }));
    setTestQuestions(prev => [...prev, question as unknown as TestQuestion]);
    setAvailableQuestions(prev => prev.filter(q => q._id !== question._id));
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(id => id !== questionId)
    }));
    const removed = testQuestions.find(q => q._id === questionId);
    setTestQuestions(prev => prev.filter(q => q._id !== questionId));
    if (removed) {
      setAvailableQuestions(prev => [...prev, removed as unknown as Question]);
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= testQuestions.length) return;

    const newQuestions = [...testQuestions];
    const newIds = [...formData.questions];

    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];

    setTestQuestions(newQuestions);
    setFormData(prev => ({ ...prev, questions: newIds }));
  };

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch questions when modal opens, and debounce filter changes
  useEffect(() => {
    if (!showQuestionModal) return;
    const timer = setTimeout(() => {
      fetchAvailableQuestions(searchQuery, typeFilter);
    }, searchQuery || typeFilter ? 300 : 0);
    return () => clearTimeout(timer);
  }, [showQuestionModal, searchQuery, typeFilter]);

  const filteredAvailableQuestions = availableQuestions;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex items-center justify-between">
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4]">
              Edit Test
            </h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X size={18} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Basic Information Section */}
        <div className="card mb-6">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full p-4 flex items-center justify-between border-b border-[#2a2a2e]"
          >
            <h2 className="font-mono font-semibold">Basic Information</h2>
            {sectionsOpen.basic ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sectionsOpen.basic && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="input w-full"
                  placeholder="Enter test title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input w-full h-24 resize-none"
                  placeholder="Enter test description"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="select w-full"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="select w-full"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Test Type</label>
                  <select
                    value={formData.testType}
                    onChange={(e) => handleInputChange('testType', e.target.value)}
                    className="select w-full"
                  >
                    <option value="custom">Custom</option>
                    <option value="frontend_basics">Frontend Basics</option>
                    <option value="react_developer">React Developer</option>
                    <option value="fullstack_js">Full Stack JS</option>
                    <option value="mobile_development">Mobile Development</option>
                    <option value="python_developer">Python Developer</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="card mb-6">
          <button
            onClick={() => toggleSection('settings')}
            className="w-full p-4 flex items-center justify-between border-b border-[#2a2a2e]"
          >
            <h2 className="font-mono font-semibold">Test Settings</h2>
            {sectionsOpen.settings ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sectionsOpen.settings && (
            <div className="p-4 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={formData.timeLimit || ''}
                    onChange={(e) => handleInputChange('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                    className="input w-full"
                    placeholder="No limit"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value) || 0)}
                    className="input w-full"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Attempts</label>
                  <input
                    type="number"
                    value={formData.maxAttempts === -1 ? '' : formData.maxAttempts}
                    onChange={(e) => handleInputChange('maxAttempts', e.target.value ? parseInt(e.target.value) : -1)}
                    className="input w-full"
                    placeholder="Unlimited (-1)"
                    min="-1"
                  />
                  <p className="text-xs text-[#6b6b70] mt-1">Leave empty or -1 for unlimited</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3 bg-[#0a0a0b] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shuffleQuestions}
                    onChange={(e) => handleInputChange('shuffleQuestions', e.target.checked)}
                    className="w-4 h-4 rounded border-[#3a3a3e] bg-[#1c1c1f] text-blue-500"
                  />
                  <span className="text-sm">Shuffle Questions</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0a0a0b] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showResults}
                    onChange={(e) => handleInputChange('showResults', e.target.checked)}
                    className="w-4 h-4 rounded border-[#3a3a3e] bg-[#1c1c1f] text-blue-500"
                  />
                  <span className="text-sm">Show Results</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0a0a0b] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showAnswers}
                    onChange={(e) => handleInputChange('showAnswers', e.target.checked)}
                    className="w-4 h-4 rounded border-[#3a3a3e] bg-[#1c1c1f] text-blue-500"
                  />
                  <span className="text-sm">Show Answers</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="card">
          <button
            onClick={() => toggleSection('questions')}
            className="w-full p-4 flex items-center justify-between border-b border-[#2a2a2e]"
          >
            <h2 className="font-mono font-semibold flex items-center gap-2">
              <BookOpen size={18} />
              Questions ({testQuestions.length})
            </h2>
            {sectionsOpen.questions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {sectionsOpen.questions && (
            <div className="p-4">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('');
                  setShowQuestionModal(true);
                }}
                className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
              >
                <Plus size={16} />
                Add Questions
              </button>

              {testQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
                  <p className="text-[#6b6b70]">No questions added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {testQuestions.map((question, index) => (
                    <div
                      key={question._id}
                      className="flex items-center gap-3 p-3 bg-[#0a0a0b] rounded-lg group"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveQuestion(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-[#6b6b70] hover:text-[#f5f5f4] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveQuestion(index, 'down')}
                          disabled={index === testQuestions.length - 1}
                          className="p-1 text-[#6b6b70] hover:text-[#f5f5f4] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      <GripVertical size={16} className="text-[#3a3a3f]" />

                      <div className="w-8 h-8 rounded bg-[#2a2a2e] flex items-center justify-center text-sm font-medium text-[#6b6b70]">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#f5f5f4] truncate">{question.title}</p>
                        {question.description && (
                          <p className="text-sm text-[#a1a1aa] truncate mt-0.5">{question.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${typeColors[question.type] || 'bg-gray-500/10 text-gray-400'}`}>
                            {formatQuestionType(question.type)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[question.difficulty]}`}>
                            {question.difficulty}
                          </span>
                        </div>
                      </div>

                      <span className="text-sm text-[#6b6b70]">{question.points} pts</span>

                      <button
                        onClick={() => removeQuestion(question._id)}
                        className="p-2 text-[#6b6b70] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Questions Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h3 className="font-mono font-semibold">Add Questions</h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1 hover:bg-[#2a2a2e] rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-[#2a2a2e] space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="select w-full"
              >
                <option value="">All Types</option>
                <option value="multipleChoice">Multiple Choice</option>
                <option value="trueFalse">True/False</option>
                <option value="fillInTheBlank">Fill in Blank</option>
                <option value="dragDropCloze">Drag &amp; Drop</option>
                <option value="codeChallenge">Code Challenge</option>
                <option value="codeDebugging">Code Debugging</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingQuestions ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-[#6b6b70]">Loading questions...</p>
                </div>
              ) : filteredAvailableQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
                  <p className="text-[#6b6b70]">
                    {searchQuery ? 'No matching questions found' : 'No available questions'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableQuestions.map(question => (
                    <div
                      key={question._id}
                      className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded-lg hover:bg-[#1c1c1f] transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium text-[#f5f5f4] truncate">{question.title}</p>
                        {question.description && (
                          <p className="text-sm text-[#a1a1aa] line-clamp-2 mt-0.5">{question.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${typeColors[question.type] || 'bg-gray-500/10 text-gray-400'}`}>
                            {formatQuestionType(question.type)}
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
                        onClick={() => addQuestion(question)}
                        className="btn-primary px-3 py-1.5 text-sm"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#2a2a2e]">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="btn-secondary w-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
