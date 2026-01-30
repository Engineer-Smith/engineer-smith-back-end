// src/components/tests/QuestionAssignment.tsx - Updated with pagination

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Target
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import apiService from '../../services/ApiService';
import type {
  Difficulty,
  Language, Question, QuestionCategory, QuestionType, Tags, TestQuestionReference, WizardStepProps
} from '../../types';
import QuestionBrowser from './QuestionBrowser';

const ITEMS_PER_PAGE = 20;

const QuestionAssignment: React.FC<WizardStepProps> = ({
  testData,
  setTestData,
  onNext,
  onPrevious,
  setError
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Question filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<QuestionType | ''>('');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
  const [filterLanguage, setFilterLanguage] = useState<Language | ''>('');
  const [filterCategory, setFilterCategory] = useState<QuestionCategory | ''>('');
  const [filterTag, setFilterTag] = useState<Tags | ''>('');
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    testData.languages,
    testData.tags,
    debouncedSearchTerm,
    filterType,
    filterDifficulty,
    filterLanguage,
    filterCategory,
    filterTag
  ]);

  // Load questions when filters or page changes
  useEffect(() => {
    fetchQuestions();
  }, [
    testData.languages,
    testData.tags,
    debouncedSearchTerm,
    filterType,
    filterDifficulty,
    filterLanguage,
    filterCategory,
    filterTag,
    currentPage
  ]);

  const fetchQuestions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const params: Record<string, string | number | boolean> = {
        status: 'active',
        limit: ITEMS_PER_PAGE,
        skip,
        includeTotalCount: true
      };

      // Build query parameters
      if (filterLanguage) {
        params.language = filterLanguage;
      } else if (testData.languages.length > 0) {
        params.language = testData.languages[0];
      }

      if (filterTag) {
        params.tag = filterTag;
      } else if (testData.tags.length > 0) {
        params.tag = testData.tags[0];
      }

      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterType) params.type = filterType;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (filterCategory) params.category = filterCategory;

      // With improved ApiService, always get consistent format
      const response = await apiService.getAllQuestions(params, true);

      // Now we can safely access response.questions and pagination info
      setQuestions(response.questions || []);
      setTotalQuestions(response.pagination?.totalCount || 0);
      setTotalPages(Math.ceil((response.pagination?.totalCount || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setError?.(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchQuestions(true);
  };

  const handleCreateQuestion = () => {
    // Open question creation in new tab
    window.open('/admin/question-bank/add', '_blank');
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Get pagination range for display
  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Since we're using server-side pagination, we don't need client-side filtering
  // All filtering is now handled by the server
  const filteredQuestions = questions;

  // Question selection handlers
  const handleToggleQuestion = (questionId: string) => {
    if (testData.settings.useSections && testData.sections) {
      const updatedSections = [...testData.sections];
      const section = updatedSections[selectedSectionIndex];

      if (!section) return;

      const isSelected = section.questions.some(q => q.questionId === questionId);

      if (isSelected) {
        section.questions = section.questions.filter(q => q.questionId !== questionId);
      } else {
        section.questions.push({
          questionId: questionId,
          points: 10
        });
      }

      setTestData({
        ...testData,
        sections: updatedSections
      });
    } else {
      const isSelected = testData.questions?.some(q => q.questionId === questionId) || false;

      if (isSelected) {
        setTestData({
          ...testData,
          questions: testData.questions?.filter(q => q.questionId !== questionId) || []
        });
      } else {
        setTestData({
          ...testData,
          questions: [...(testData.questions || []), {
            questionId: questionId,
            points: 10
          }]
        });
      }
    }
  };

  const handleSelectAllVisible = () => {
    if (testData.settings.useSections && testData.sections) {
      const updatedSections = [...testData.sections];
      const section = updatedSections[selectedSectionIndex];

      if (!section) return;

      filteredQuestions.forEach(question => {
        const isAlreadySelected = section.questions.some(q => q.questionId === question._id);
        if (!isAlreadySelected) {
          section.questions.push({
            questionId: question._id,
            points: 10
          });
        }
      });

      setTestData({
        ...testData,
        sections: updatedSections
      });
    } else {
      const newQuestionRefs: TestQuestionReference[] = [];

      filteredQuestions.forEach(question => {
        const isAlreadySelected = testData.questions?.some(q => q.questionId === question._id) || false;
        if (!isAlreadySelected) {
          newQuestionRefs.push({
            questionId: question._id,
            points: 10
          });
        }
      });

      if (newQuestionRefs.length > 0) {
        setTestData({
          ...testData,
          questions: [...(testData.questions || []), ...newQuestionRefs]
        });
      }
    }
  };

  const handleClearSelection = () => {
    if (testData.settings.useSections && testData.sections) {
      const updatedSections = [...testData.sections];
      if (updatedSections[selectedSectionIndex]) {
        updatedSections[selectedSectionIndex].questions = [];
      }

      setTestData({
        ...testData,
        sections: updatedSections
      });
    } else {
      setTestData({
        ...testData,
        questions: []
      });
    }
  };

  // Helper functions for display
  const getTotalSelectedQuestions = () => {
    if (testData.settings.useSections && testData.sections) {
      return testData.sections.reduce((total, section) => total + section.questions.length, 0);
    }
    return testData.questions?.length || 0;
  };

  const getTotalPoints = () => {
    if (testData.settings.useSections && testData.sections) {
      return testData.sections.reduce(
        (total, section) =>
          total + section.questions.reduce((sectionTotal, q) => sectionTotal + q.points, 0),
        0
      );
    }
    return testData.questions?.reduce((total, q) => total + q.points, 0) || 0;
  };

  const handleNext = () => {
    setError?.(null);

    const totalSelectedQuestions = getTotalSelectedQuestions();

    if (totalSelectedQuestions === 0) {
      setError?.('Please add at least one question to the test');
      return;
    }

    if (testData.settings.useSections && testData.sections) {
      const emptySections = testData.sections.filter((section) => section.questions.length === 0);
      if (emptySections.length > 0) {
        setError?.(`Please add questions to all sections. ${emptySections.length} section(s) are empty.`);
        return;
      }
    }

    onNext?.();
  };

  return (
    <div>
      {/* Progress Summary */}
      <div className="card p-4 mb-4 bg-[#1a1a1e]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <h4 className="text-2xl font-bold text-blue-400 mb-1">{getTotalSelectedQuestions()}</h4>
            <small className="text-[#6b6b70]">Selected Questions</small>
          </div>
          <div className="text-center">
            <h4 className="text-2xl font-bold text-green-400 mb-1">{getTotalPoints()}</h4>
            <small className="text-[#6b6b70]">Total Points</small>
          </div>
          <div className="text-center">
            <h4 className="text-2xl font-bold text-cyan-400 mb-1">
              {testData.settings.useSections ? testData.sections?.length || 0 : 0}
            </h4>
            <small className="text-[#6b6b70]">Sections</small>
          </div>
          <div className="text-center">
            <h4 className="text-2xl font-bold text-[#a1a1aa] mb-1">{totalQuestions}</h4>
            <small className="text-[#6b6b70]">Total Available</small>
          </div>
        </div>
      </div>

      {/* Section Progress (for section-based tests) */}
      {testData.settings.useSections && testData.sections && (
        <div className="card p-4 mb-4">
          <h6 className="flex items-center gap-2 mb-3 text-[#f5f5f4] font-semibold">
            <Target size={16} />
            Section Progress
          </h6>
          {testData.sections.map((section, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-[#f5f5f4]">{section.name}</span>
                <span className="text-sm text-[#6b6b70]">{section.questions.length} questions</span>
              </div>
              <div className="progress-bar h-1">
                <div
                  className={`progress-fill ${section.questions.length ? 'bg-green-500' : 'bg-[#3a3a3e]'}`}
                  style={{ width: section.questions.length ? '100%' : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header Actions */}
      <div className="card p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h6 className="text-[#f5f5f4] font-semibold mb-0">Question Library</h6>
            <small className="text-[#6b6b70]">
              Browse and select questions for your test
              {totalQuestions > 0 && (
                <span> - Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalQuestions)} of {totalQuestions}</span>
              )}
            </small>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm flex items-center gap-1"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              className="btn-primary text-sm flex items-center gap-1"
              onClick={handleCreateQuestion}
            >
              <Plus size={14} />
              Create Question
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Question Browser Component */}
      <QuestionBrowser
        loading={loading}
        questions={questions}
        filteredQuestions={filteredQuestions}
        testData={testData}
        selectedSectionIndex={selectedSectionIndex}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterDifficulty={filterDifficulty}
        setFilterDifficulty={setFilterDifficulty}
        filterLanguage={filterLanguage}
        setFilterLanguage={setFilterLanguage}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        setSelectedSectionIndex={setSelectedSectionIndex}
        onToggleQuestion={handleToggleQuestion}
        onAssignAll={handleSelectAllVisible}
        onClear={handleClearSelection}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card p-4 mt-4">
          <div className="flex justify-center items-center gap-2">
            <nav className="flex items-center gap-1">
              <button
                className="btn-ghost p-2"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {getPaginationRange().map((page, index) => (
                <button
                  key={index}
                  className={`px-3 py-1.5 rounded text-sm ${
                    page === currentPage
                      ? 'bg-blue-500 text-white'
                      : page === '...'
                      ? 'text-[#6b6b70] cursor-default'
                      : 'btn-ghost'
                  }`}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                >
                  {page}
                </button>
              ))}

              <button
                className="btn-ghost p-2"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </nav>

            <div className="ml-3 text-[#6b6b70] text-sm">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-[#2a2a2e] mt-4">
        <button className="btn-secondary flex items-center gap-2" onClick={onPrevious}>
          <ArrowLeft size={16} />
          {testData.settings.useSections ? 'Previous: Configure Sections' : 'Previous: Test Structure'}
        </button>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleNext}
          disabled={getTotalSelectedQuestions() === 0}
        >
          Next: Review & Publish
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default QuestionAssignment;
