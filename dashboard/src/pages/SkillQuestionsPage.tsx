// pages/SkillQuestionsPage.tsx - Fixed pagination and server-side filtering - Tailwind CSS
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Code,
  CheckSquare,
  Bug,
  List,
  SquareDashed,
  GripVertical,
  TestTube,
  FileText,
  Layers
} from 'lucide-react';
import { skills } from '../config/skills';
import type { Question, QuestionType, QuestionCategory } from '../types';

import {
  getQuestionTypesForLanguage,
  getCategoriesForLanguage,
  getSupportedTypeCount
} from '../utils/languageQuestionTypes';

const ITEMS_PER_PAGE = 12;

// Type configurations with icons and descriptions
const QUESTION_TYPE_CONFIGS = {
  multipleChoice: {
    label: 'Multiple Choice',
    icon: List,
    color: 'blue',
    description: 'Choose from multiple options'
  },
  trueFalse: {
    label: 'True/False',
    icon: CheckSquare,
    color: 'cyan',
    description: 'True or false answer'
  },
  fillInTheBlank: {
    label: 'Fill in the Blank',
    icon: SquareDashed,
    color: 'green',
    description: 'Complete missing code parts'
  },
  codeChallenge: {
    label: 'Code Challenge',
    icon: Code,
    color: 'amber',
    description: 'Write code to solve problems'
  },
  codeDebugging: {
    label: 'Code Debugging',
    icon: Bug,
    color: 'red',
    description: 'Find and fix code bugs'
  },
  dragDropCloze: {
    label: 'Drag & Drop Cloze',
    icon: GripVertical,
    color: 'purple',
    description: 'Drag options into blanks'
  }
} as const;

const CATEGORY_CONFIGS: Record<QuestionCategory, { label: string; color: string; description: string }> = {
  logic: { label: 'Logic', color: 'blue', description: 'Algorithmic thinking' },
  ui: { label: 'UI', color: 'green', description: 'User interface design' },
  syntax: { label: 'Syntax', color: 'cyan', description: 'Language syntax rules' },
  debugging: { label: 'Debugging', color: 'red', description: 'Find and fix errors' },
  concept: { label: 'Concept', color: 'purple', description: 'Fundamental concepts' },
  'best-practice': { label: 'Best Practice', color: 'amber', description: 'Recommended patterns and conventions' }
};

const STATUS_CONFIGS = {
  draft: { label: 'Draft', color: 'gray', description: 'Work in progress' },
  active: { label: 'Active', color: 'green', description: 'Ready for use' },
  archived: { label: 'Archived', color: 'amber', description: 'No longer active' }
} as const;

// Helper function to get badge classes based on color
const getBadgeClasses = (color: string, outline?: boolean) => {
  const colorMap: Record<string, { bg: string; text: string; outline: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', outline: 'border-blue-500/30' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', outline: 'border-cyan-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', outline: 'border-green-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', outline: 'border-amber-500/30' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', outline: 'border-red-500/30' },
    gray: { bg: 'bg-gray-500/10', text: 'text-gray-400', outline: 'border-gray-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', outline: 'border-purple-500/30' },
  };
  const colors = colorMap[color] || colorMap.gray;
  return outline
    ? `${colors.text} border ${colors.outline} bg-transparent`
    : `${colors.bg} ${colors.text}`;
};

const SkillQuestionsPage: React.FC = () => {
  const { skillName } = useParams<{ skillName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subLanguageFilter, setSubLanguageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Search debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Find skill configuration
  const skill = skills.find(s => s.skill === skillName);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get current effective language
  const getCurrentLanguage = () => {
    if (!skill) return 'javascript';
    if (skill.subCategories) {
      return subLanguageFilter === 'all' ? skill.subCategories[0] : subLanguageFilter;
    }
    return skill.skill;
  };

  // Get available options for current language
  const getAvailableQuestionTypes = () => {
    const currentLang = getCurrentLanguage();
    return getQuestionTypesForLanguage(currentLang as any);
  };

  const getAvailableCategories = () => {
    const currentLang = getCurrentLanguage();
    return getCategoriesForLanguage(currentLang as any);
  };

  // Reset filters when language changes
  useEffect(() => {
    const availableTypes = getAvailableQuestionTypes();
    const availableCategories = getAvailableCategories();
    if (typeFilter !== 'all' && !availableTypes.includes(typeFilter as QuestionType)) {
      setTypeFilter('all');
    }
    if (categoryFilter !== 'all' && !availableCategories.includes(categoryFilter as QuestionCategory)) {
      setCategoryFilter('all');
    }
  }, [subLanguageFilter, typeFilter, categoryFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [difficultyFilter, typeFilter, categoryFilter, subLanguageFilter, statusFilter, debouncedSearchTerm]);

  // Fetch questions with proper pagination
  const fetchQuestions = async (page: number = 1) => {
    if (!user || !skill) return;
    try {
      setLoading(true);
      setError(null);

      const skip = (page - 1) * ITEMS_PER_PAGE;
      const params: any = {
        limit: ITEMS_PER_PAGE,
        skip,
        includeTotalCount: true
      };

      if (skill.subCategories) {
        params.language = subLanguageFilter === 'all' ? skill.subCategories.join(',') : subLanguageFilter;
      } else {
        params.language = skill.skill;
      }

      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim();

      const response = await apiService.getAllQuestions(params, true);

      if (!response) {
        setQuestions([]);
        setTotalQuestions(0);
        return;
      }

      if (Array.isArray(response)) {
        setQuestions(response);
        setTotalQuestions(response.length);
      } else {
        setQuestions(response.questions || []);
        // Check both totalCount and total for backwards compatibility
        setTotalQuestions(response.pagination?.totalCount || response.pagination?.total || 0);
      }
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      setError(error.message || 'Failed to fetch questions');
      setQuestions([]);
      setTotalQuestions(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skill) fetchQuestions(currentPage);
  }, [skill, currentPage, difficultyFilter, typeFilter, categoryFilter, subLanguageFilter, statusFilter, debouncedSearchTerm]);

  const totalPages = Math.ceil(totalQuestions / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateQuestion = () => {
    const defaultLanguage = skill?.subCategories ? skill.subCategories[0] : skill?.skill;
    navigate('/admin/question-bank/add', { state: { defaultLanguage } });
  };

  const handleEditQuestion = (questionId: string) => navigate(`/admin/question-bank/edit/${questionId}`);
  const handleViewQuestion = (questionId: string) => navigate(`/admin/question-bank/view/${questionId}`);

  const handleDeleteQuestion = (questionId: string, questionTitle: string) => {
    setQuestionToDelete({ id: questionId, title: questionTitle });
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      setDeleting(true);
      const response = await apiService.deleteQuestion(questionToDelete.id);
      if (!response || !response.message) throw new Error('Failed to delete question');
      setDeleteModal(false);
      setQuestionToDelete(null);
      const newTotalQuestions = totalQuestions - 1;
      const newTotalPages = Math.ceil(newTotalQuestions / ITEMS_PER_PAGE);
      const pageToFetch = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      if (pageToFetch !== currentPage) setCurrentPage(pageToFetch);
      else fetchQuestions(currentPage);
    } catch (error: any) {
      alert('Error deleting question: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
    setQuestionToDelete(null);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSubLanguageFilter('all');
    setStatusFilter('active');
    setCurrentPage(1);
  };

  const getTypeSpecificInfo = (question: Question) => {
    switch (question.type) {
      case 'codeChallenge':
      case 'codeDebugging':
        if (question.category === 'logic' && question.testCases) {
          return { icon: TestTube, text: `${question.testCases.length} test cases`, color: 'cyan' };
        }
        if (question.type === 'codeDebugging' && question.buggyCode) {
          return { icon: Bug, text: 'Has buggy code', color: 'amber' };
        }
        break;
      case 'fillInTheBlank':
        if (question.blanks) return { icon: SquareDashed, text: `${question.blanks.length} blanks`, color: 'green' };
        break;
      case 'multipleChoice':
        if (question.options) return { icon: List, text: `${question.options.length} options`, color: 'blue' };
        break;
    }
    return null;
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots: (number | string)[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) rangeWithDots.push(1, '...');
    else rangeWithDots.push(1);
    rangeWithDots.push(...range);
    if (currentPage + delta < totalPages - 1) rangeWithDots.push('...', totalPages);
    else if (totalPages > 1) rangeWithDots.push(totalPages);
    return rangeWithDots;
  };

  const availableQuestionTypes = getAvailableQuestionTypes();
  const availableCategories = getAvailableCategories();

  if (!skill) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] py-8">
        <div className="container-section">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
            <span className="text-amber-400 font-medium">Skill not found:</span> <span className="text-amber-400">{skillName}</span>
            <div className="mt-4">
              <button onClick={() => navigate('/admin/question-bank')} className="btn-primary">Back to Question Bank</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading {skill.name} questions...</p>
        </div>
      </div>
    );
  }

  const getSkillColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      yellow: 'text-yellow-400', blue: 'text-blue-400', cyan: 'text-cyan-400',
      purple: 'text-purple-400', green: 'text-green-400', amber: 'text-amber-400', red: 'text-red-400',
    };
    return colorMap[colorName] || 'text-amber-400';
  };

  const getSkillBgClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-500/10', blue: 'bg-blue-500/10', cyan: 'bg-cyan-500/10',
      purple: 'bg-purple-500/10', green: 'bg-green-500/10', amber: 'bg-amber-500/10', red: 'bg-red-500/10',
    };
    return colorMap[colorName] || 'bg-amber-500/10';
  };

  const SkillIcon = skill.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#2a2a2e]">
        <div className="container-section py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/admin/question-bank')} className="p-2 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className={`p-3 rounded-lg ${getSkillBgClass(skill.color)}`}>
                <SkillIcon className={`w-6 h-6 ${getSkillColorClass(skill.color)}`} />
              </div>
              <div>
                <h1 className="font-mono text-xl font-bold text-[#f5f5f4]">{skill.name} Questions</h1>
                <p className="text-sm text-[#6b6b70]">{skill.description}</p>
              </div>
            </div>
            <button onClick={handleCreateQuestion} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>
      </div>

      <div className="container-section py-6">
        {/* Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
                <input type="text" placeholder="Search questions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select">
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="select">
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="select" title={`Available types for ${getCurrentLanguage()}`}>
                <option value="all">All Types</option>
                {availableQuestionTypes.map(type => (
                  <option key={type} value={type}>{QUESTION_TYPE_CONFIGS[type]?.label || type}</option>
                ))}
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select">
                <option value="all">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{CATEGORY_CONFIGS[category as keyof typeof CATEGORY_CONFIGS]?.label || category}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {skill.subCategories && (
                <div className="w-48">
                  <label className="block text-xs text-[#6b6b70] mb-1">Language</label>
                  <select value={subLanguageFilter} onChange={(e) => setSubLanguageFilter(e.target.value)} className="select text-sm py-1.5">
                    <option value="all">All Languages</option>
                    {skill.subCategories.map(lang => (
                      <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}
              <button onClick={clearAllFilters} className="btn-ghost text-sm">Clear All Filters</button>
              <div className="flex-1 flex justify-end items-center gap-3">
                <span className="text-sm text-[#6b6b70]">
                  {totalQuestions > 0 ? (
                    <>Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalQuestions)} of <span className="font-medium text-[#f5f5f4]">{totalQuestions}</span> questions</>
                  ) : 'No questions found'}
                </span>
                <div className="flex gap-1 flex-wrap">
                  {statusFilter !== 'all' && <span className="badge-blue text-xs">Status: {statusFilter}</span>}
                  {difficultyFilter !== 'all' && <span className="badge-blue text-xs">{difficultyFilter}</span>}
                  {typeFilter !== 'all' && <span className="badge-blue text-xs">{QUESTION_TYPE_CONFIGS[typeFilter as keyof typeof QUESTION_TYPE_CONFIGS]?.label || typeFilter}</span>}
                  {categoryFilter !== 'all' && <span className="badge-blue text-xs">{CATEGORY_CONFIGS[categoryFilter as keyof typeof CATEGORY_CONFIGS]?.label || categoryFilter}</span>}
                  {debouncedSearchTerm && <span className="badge-blue text-xs">Search: "{debouncedSearchTerm}"</span>}
                </div>
              </div>
            </div>

            {availableQuestionTypes.length < 5 && (
              <div className="mt-3 text-sm text-[#6b6b70]">
                <span className="font-medium text-[#a1a1aa]">{getCurrentLanguage()}:</span> Supports {getSupportedTypeCount(getCurrentLanguage() as any)} question types: {availableQuestionTypes.map(type => QUESTION_TYPE_CONFIGS[type]?.label || type).join(', ')}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
              <div>
                <span className="text-red-400 font-medium">Error:</span> <span className="text-red-400">{error}</span>
                <div className="mt-2">
                  <button onClick={() => fetchQuestions(currentPage)} className="btn-primary text-sm">Retry</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((question) => {
            const typeConfig = QUESTION_TYPE_CONFIGS[question.type];
            const categoryConfig = question.category ? CATEGORY_CONFIGS[question.category] : null;
            const statusConfig = STATUS_CONFIGS[question.status];
            const typeInfo = getTypeSpecificInfo(question);
            const TypeIcon = typeConfig?.icon || FileText;

            return (
              <div key={question._id} className="card hover:border-[#3a3a3f] transition-all group">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs ${question.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' : question.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                        {question.difficulty}
                      </span>
                      {categoryConfig && (
                        <span className={`px-2 py-0.5 rounded text-xs border ${getBadgeClasses(categoryConfig.color, true)}`}>{categoryConfig.label}</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs border ${getBadgeClasses(statusConfig.color, true)}`}>{statusConfig.label}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${getBadgeClasses(typeConfig?.color || 'gray')}`}>
                      <TypeIcon className="w-3 h-3" />
                      {typeConfig?.label || question.type}
                    </span>
                  </div>

                  <h6 className="font-medium text-[#f5f5f4] mb-2 line-clamp-1" title={question.title}>{question.title}</h6>
                  <p className="text-sm text-[#6b6b70] mb-3 flex-1 line-clamp-3">{question.description}</p>

                  {typeInfo && (
                    <div className="mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${getBadgeClasses(typeInfo.color, true)}`}>
                        <typeInfo.icon className="w-3 h-3" />
                        {typeInfo.text}
                      </span>
                    </div>
                  )}

                  {question.tags && question.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {question.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-xs bg-[#2a2a2e] text-[#6b6b70]">{tag}</span>
                      ))}
                      {question.tags.length > 3 && <span className="px-1.5 py-0.5 rounded text-xs bg-[#2a2a2e] text-[#6b6b70]">+{question.tags.length - 3}</span>}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-[#2a2a2e]">
                    <span className="text-xs text-[#6b6b70] flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {question.language}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => handleViewQuestion(question._id)} className="p-1.5 hover:bg-[#2a2a2e] rounded transition-colors text-blue-400" title="View Question"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEditQuestion(question._id)} className="p-1.5 hover:bg-[#2a2a2e] rounded transition-colors text-[#6b6b70] hover:text-[#f5f5f4]" title="Edit Question"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteQuestion(question._id, question.title)} className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-red-400" title="Delete Question"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {questions.length === 0 && !loading && (
          <div className="card text-center py-12">
            <SkillIcon className={`w-12 h-12 ${getSkillColorClass(skill.color)} mx-auto mb-4`} />
            <h5 className="font-medium text-[#f5f5f4] mb-2">No {skill.name} questions found</h5>
            <p className="text-[#6b6b70] mb-6">
              {searchTerm || difficultyFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : `Start building your ${skill.name} question bank with various question types.`}
            </p>
            <div className="flex gap-2 justify-center">
              {(searchTerm || difficultyFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <button onClick={clearAllFilters} className="btn-secondary">Clear Filters</button>
              )}
              <button onClick={handleCreateQuestion} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Question
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <nav className="flex items-center gap-1">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-[#1c1c1f] disabled:opacity-50 disabled:cursor-not-allowed text-[#a1a1aa]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              {getPaginationRange().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? 'bg-amber-500 text-[#0a0a0b]' : page === '...' ? 'text-[#6b6b70] cursor-default' : 'text-[#a1a1aa] hover:bg-[#1c1c1f]'}`}
                >
                  {page}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-[#1c1c1f] disabled:opacity-50 disabled:cursor-not-allowed text-[#a1a1aa]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
            <span className="text-sm text-[#6b6b70]">Page {currentPage} of {totalPages}</span>
          </div>
        )}

        {loading && questions.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="spinner w-4 h-4" />
            <span className="text-sm text-[#6b6b70]">Loading...</span>
          </div>
        )}
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
              <p className="text-[#a1a1aa] mb-3">Are you sure you want to delete this question?</p>
              <div className="p-3 bg-[#1c1c1f] rounded-lg mb-4">
                <span className="font-medium text-[#f5f5f4]">"{questionToDelete?.title}"</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-[#6b6b70]">This action cannot be undone. The question will be permanently removed from the question bank.</span>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-[#2a2a2e]">
              <button onClick={cancelDelete} disabled={deleting} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="btn-primary bg-red-500 hover:bg-red-600 flex-1 flex items-center justify-center gap-2">
                {deleting ? (<><div className="spinner w-4 h-4" />Deleting...</>) : (<><Trash2 className="w-4 h-4" />Delete Question</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillQuestionsPage;