import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Layers,
  RotateCcw,
  Settings,
  Shield,
  Target,
  Timer,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Import types and services
import apiService from '../../services/ApiService';
import type { TestType } from '../../types';
import type { WizardStepProps } from '../../types/createTest';

// Interfaces for component state
interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

interface TimeSuggestion {
  type: 'success' | 'warning' | 'info';
  message: string;
}

interface TestRecommendations {
  timeLimit: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  useSections: boolean;
}

interface QuestionStats {
  byLanguage: Array<{
    language: string;
    count: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
  }>;
  totals: {
    totalQuestions: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
    typeBreakdown: {
      multipleChoice: number;
      trueFalse: number;
      codeChallenge: number;
      fillInTheBlank: number;
      codeDebugging: number;
      dragDropCloze: number;
    };
  };
}

// Helper function for alert styling
const getAlertClass = (type: 'success' | 'warning' | 'info' | 'light'): string => {
  const classes: Record<string, string> = {
    success: 'bg-green-500/10 border border-green-500/25 text-green-400',
    warning: 'bg-amber-500/10 border border-amber-500/25 text-amber-400',
    info: 'bg-blue-500/10 border border-blue-500/25 text-blue-400',
    light: 'bg-[#1a1a1e] border border-[#2a2a2e] text-[#a1a1aa]'
  };
  return classes[type] || classes.info;
};

// Helper function for badge styling
const getBadgeClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    primary: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    secondary: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    light: 'bg-[#2a2a2e] text-[#a1a1aa]'
  };
  return colorMap[color] || colorMap.secondary;
};

const TestStructure: React.FC<WizardStepProps> = ({
  testData,
  setTestData,
  onNext,
  onPrevious,
  setError
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [availableQuestions, setAvailableQuestions] = useState<number>(0);
  const [difficultyDistribution, setDifficultyDistribution] = useState<DifficultyDistribution>({
    easy: 40,
    medium: 40,
    hard: 20
  });
  const [questionStats, setQuestionStats] = useState<QuestionStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Fetch real question statistics
  useEffect(() => {
    const fetchQuestionStats = async () => {
      try {
        setLoadingStats(true);
        // FIXED: getQuestionStats returns data directly, no wrapper
        const questionStats = await apiService.getQuestionStats();

        if (!questionStats || !questionStats.totals) {
          console.error('Failed to fetch question stats: Invalid data received');
          return;
        }

        setQuestionStats(questionStats);

        // Update difficulty distribution based on real data
        const { difficultyBreakdown } = questionStats.totals;
        const total = difficultyBreakdown.easy + difficultyBreakdown.medium + difficultyBreakdown.hard;

        if (total > 0) {
          setDifficultyDistribution({
            easy: Math.round((difficultyBreakdown.easy / total) * 100),
            medium: Math.round((difficultyBreakdown.medium / total) * 100),
            hard: Math.round((difficultyBreakdown.hard / total) * 100)
          });
        }
      } catch (error) {
        console.error('Error fetching question stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchQuestionStats();
  }, []);

  // Calculate available questions and estimated duration based on test configuration
  useEffect(() => {
    const calculateAvailableQuestions = async () => {
      if (!testData.languages?.length && !testData.tags?.length) {
        setAvailableQuestions(0);
        setEstimatedDuration(0);
        return;
      }

      try {
        // Build query parameters based on test configuration
        const params: Record<string, string> = {
          status: 'active'
        };

        // If we have specific languages selected, count questions for those languages
        if (testData.languages?.length > 0) {
          // For now, we'll estimate by getting count for primary language
          // TODO: Backend could support multiple language filtering
          params.language = testData.languages[0];
        }

        // FIXED: getPaginatedQuestions returns data directly, no wrapper
        const response = await apiService.getPaginatedQuestions(params);

        if (!response || typeof response.totalCount !== 'number') {
          console.error('Failed to get question count: Invalid response');
          return;
        }

        const questionCount = response.totalCount;
        setAvailableQuestions(questionCount);

        // Calculate estimated duration based on real question count and difficulty
        const baseTimePerQuestion = 2; // minutes
        const difficultyMultipliers = {
          easy: 1,
          medium: 1.5,
          hard: 2.5
        };

        const weightedTime = questionCount * (
          (difficultyDistribution.easy / 100 * baseTimePerQuestion * difficultyMultipliers.easy) +
          (difficultyDistribution.medium / 100 * baseTimePerQuestion * difficultyMultipliers.medium) +
          (difficultyDistribution.hard / 100 * baseTimePerQuestion * difficultyMultipliers.hard)
        );

        setEstimatedDuration(Math.ceil(weightedTime));
      } catch (error) {
        console.error('Error calculating available questions:', error);
      }
    };

    calculateAvailableQuestions();
  }, [testData.languages, testData.tags, difficultyDistribution]);

  const handleSettingChange = (field: keyof typeof testData.settings, value: boolean | number): void => {
    const newSettings = {
      ...testData.settings,
      [field]: value
    };

    // Auto-adjust time limit based on structure change
    if (field === 'useSections' && value === true && newSettings.timeLimit) {
      // When switching to sections, suggest distributing time across sections
      newSettings.timeLimit = Math.ceil(newSettings.timeLimit * 0.8);
    }

    setTestData({
      ...testData,
      settings: newSettings,
      // Clear existing sections/questions when switching types
      sections: value === true ? [] : testData.sections,
      questions: value === false ? [] : testData.questions
    });
  };

  const handleTestTypeChange = (useSections: boolean): void => {
    handleSettingChange('useSections', useSections);
  };

  const applyRecommendedSettings = (): void => {
    const template = testData.testType;

    // Base recommendations on real available questions
    const baseTimeLimit = availableQuestions > 0 ?
      Math.max(30, Math.min(120, availableQuestions * 2.5)) :
      45;

    const recommendations: Record<TestType, TestRecommendations> = {
      'frontend_basics': {
        timeLimit: Math.max(45, baseTimeLimit),
        attemptsAllowed: 2,
        shuffleQuestions: true,
        useSections: true
      },
      'react_developer': {
        timeLimit: Math.max(60, baseTimeLimit),
        attemptsAllowed: 2,
        shuffleQuestions: true,
        useSections: true
      },
      'fullstack_js': {
        timeLimit: Math.max(90, baseTimeLimit),
        attemptsAllowed: 1,
        shuffleQuestions: true,
        useSections: true
      },
      'mobile_development': {
        timeLimit: Math.max(75, baseTimeLimit),
        attemptsAllowed: 2,
        shuffleQuestions: true,
        useSections: true
      },
      'python_developer': {
        timeLimit: Math.max(60, baseTimeLimit),
        attemptsAllowed: 2,
        shuffleQuestions: false,
        useSections: false
      },
      'custom': {
        timeLimit: estimatedDuration || baseTimeLimit,
        attemptsAllowed: 1,
        shuffleQuestions: false,
        useSections: false
      }
    };

    const recommended = recommendations[template] || recommendations.custom;

    setTestData({
      ...testData,
      settings: {
        ...testData.settings,
        ...recommended
      }
    });
  };

  const validateStep = (): boolean => {
    if (testData.settings?.useSections === undefined) {
      setError('Please choose a test structure (Single Test or Sectioned Test)');
      return false;
    }

    if (!testData.settings?.timeLimit || testData.settings.timeLimit <= 0) {
      setError('Time limit is required and must be greater than 0');
      return false;
    }

    if (!testData.settings?.attemptsAllowed || testData.settings.attemptsAllowed <= 0) {
      setError('Number of attempts is required and must be greater than 0');
      return false;
    }

    if (testData.settings.attemptsAllowed > 10) {
      setError('Maximum 10 attempts allowed');
      return false;
    }

    if (testData.settings.timeLimit > 480) {
      setError('Time limit cannot exceed 8 hours (480 minutes)');
      return false;
    }

    if (testData.settings.timeLimit < 5) {
      setError('Time limit should be at least 5 minutes');
      return false;
    }

    setError(null);
    return true;
  };

  // Add helper function for button disabled state
  const isStepValid = (): boolean => {
    return !!(testData.settings?.useSections !== undefined &&
      testData.settings?.timeLimit > 0 &&
      testData.settings?.attemptsAllowed > 0);
  };

  const handleNext = (): void => {
    if (validateStep()) {
      onNext?.();
    }
  };

  const getTimeLimitSuggestion = (): TimeSuggestion => {
    const timeLimit = testData.settings?.timeLimit || 0;
    const estimated = estimatedDuration;

    if (estimated === 0) {
      return { type: 'info', message: 'Configure test content first' };
    }

    if (timeLimit < estimated * 0.8) {
      return { type: 'warning', message: 'May be too short for thorough completion' };
    } else if (timeLimit > estimated * 1.5) {
      return { type: 'info', message: 'Generous time allowance' };
    } else {
      return { type: 'success', message: 'Good time balance' };
    }
  };

  const getQuestionAvailability = (): string => {
    if (loadingStats) return 'Loading...';
    if (!testData.languages?.length && !testData.tags?.length) {
      return 'Select languages/topics first';
    }
    if (availableQuestions === 0) {
      return 'No questions available for this configuration';
    }
    return `${availableQuestions} questions available`;
  };

  const timeSuggestion = getTimeLimitSuggestion();

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Quick Setup Card */}
          <div className="card p-4 mb-4 bg-[#1a1a1e]">
            <div className="flex justify-between items-center">
              <div>
                <h6 className="mb-1 flex items-center gap-2 text-[#f5f5f4] font-semibold">
                  <Zap size={20} className="text-amber-500" />
                  Quick Setup
                </h6>
                <small className="text-[#6b6b70]">
                  Apply recommended settings for {testData.testType?.replace('_', ' ') || 'your test type'}
                </small>
              </div>
              <button
                className="btn-secondary flex items-center gap-2 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                onClick={applyRecommendedSettings}
              >
                <Settings size={16} />
                Apply Recommended
              </button>
            </div>
          </div>

          {/* Available Questions Alert */}
          {(testData.languages?.length > 0 || testData.tags?.length > 0) && (
            <div className={`p-4 rounded-lg mb-4 ${availableQuestions > 0 ? getAlertClass('success') : getAlertClass('warning')}`}>
              <div className="flex items-center gap-3">
                <Target size={16} />
                <div>
                  <strong>Question Availability:</strong>
                  <div className="mt-1 text-sm">
                    {loadingStats ? (
                      <span className="flex items-center gap-2">
                        <span className="spinner w-4 h-4" />
                        Checking available questions...
                      </span>
                    ) : (
                      <>
                        {getQuestionAvailability()}
                        {estimatedDuration > 0 && (
                          <span className="ml-3">
                            • Estimated test duration: <strong>{estimatedDuration} minutes</strong>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Structure Selection */}
          <div className="card p-6 mb-4">
            <h6 className="flex items-center gap-2 mb-4 text-[#f5f5f4] font-semibold">
              <Layers size={20} className="text-blue-500" />
              Test Structure
            </h6>

            <div>
              <label className="block text-sm font-semibold text-[#f5f5f4] mb-4">Choose your test structure:</label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Single Section Option */}
                <div
                  className={`card p-4 cursor-pointer transition-all border-2 ${
                    testData.settings?.useSections === false
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                  }`}
                  onClick={() => handleTestTypeChange(false)}
                >
                  <div className="text-center">
                    <div className="mb-3">
                      <FileText
                        size={48}
                        className={testData.settings?.useSections === false ? 'text-blue-500' : 'text-[#6b6b70]'}
                      />
                    </div>
                    <h6 className="mb-2 text-[#f5f5f4] font-semibold">Single Test</h6>
                    <p className="text-[#6b6b70] text-sm mb-3">
                      One continuous test with a single timer for all questions
                    </p>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${getBadgeClass('info')}`}>
                        <Timer size={12} />
                        One timer for entire test
                      </span>
                      <span className={`px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${getBadgeClass('secondary')}`}>
                        <Target size={12} />
                        Simple navigation
                      </span>
                      <span className={`px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${getBadgeClass('success')}`}>
                        <BookOpen size={12} />
                        Best for linear tests
                      </span>
                    </div>
                    {testData.settings?.useSections === false && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getBadgeClass('primary')}`}>
                          <CheckCircle size={12} />
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Multiple Sections Option */}
                <div
                  className={`card p-4 cursor-pointer transition-all border-2 ${
                    testData.settings?.useSections === true
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[#2a2a2e] hover:border-[#3a3a3e]'
                  }`}
                  onClick={() => handleTestTypeChange(true)}
                >
                  <div className="text-center">
                    <div className="mb-3">
                      <Layers
                        size={48}
                        className={testData.settings?.useSections === true ? 'text-blue-500' : 'text-[#6b6b70]'}
                      />
                    </div>
                    <h6 className="mb-2 text-[#f5f5f4] font-semibold">Sectioned Test</h6>
                    <p className="text-[#6b6b70] text-sm mb-3">
                      Multiple sections, each with its own timer and questions
                    </p>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${getBadgeClass('warning')}`}>
                        <Timer size={12} />
                        Individual section timers
                      </span>
                      <span className={`px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${getBadgeClass('info')}`}>
                        <Layers size={12} />
                        Organized by topics
                      </span>
                      <span className={`px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${getBadgeClass('success')}`}>
                        <TrendingUp size={12} />
                        Better analytics
                      </span>
                    </div>
                    {testData.settings?.useSections === true && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getBadgeClass('primary')}`}>
                          <CheckCircle size={12} />
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Structure Explanation */}
            {testData.settings?.useSections !== undefined ? (
              <div className={`mt-4 p-4 rounded-lg ${getAlertClass('info')}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {testData.settings.useSections ? <Layers size={16} /> : <FileText size={16} />}
                  </div>
                  <div>
                    <strong>
                      {testData.settings.useSections ? 'Sectioned Test Selected' : 'Single Test Selected'}
                    </strong>
                    <div className="mt-1 text-sm opacity-90">
                      {testData.settings.useSections
                        ? 'You can create multiple sections (e.g., "JavaScript Basics", "React Components") with different time limits for each section. Students will see progress through sections and can\'t go back to previous sections once time expires.'
                        : 'All questions will be in one continuous test with a single timer. Students can navigate freely between questions within the time limit.'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`mt-4 p-4 rounded-lg ${getAlertClass('warning')}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <strong>Choose Your Test Structure</strong>
                    <div className="mt-1 text-sm opacity-90">
                      Please select either a Single Test or Sectioned Test to continue. This choice will determine how questions are organized and timed.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Settings */}
          <div className="card p-6 mb-4">
            <h6 className="flex items-center gap-2 mb-4 text-[#f5f5f4] font-semibold">
              <Settings size={20} className="text-blue-500" />
              Core Settings
            </h6>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-semibold text-[#f5f5f4] mb-2">
                  <Clock size={16} className="inline mr-1" />
                  {testData.settings?.useSections ? 'Default Section Time (minutes)' : 'Total Time Limit (minutes)'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="timeLimit"
                    min="1"
                    max="480"
                    className={`input w-full pr-10 ${testData.settings?.timeLimit === 0 ? 'border-amber-500' : ''}`}
                    value={testData.settings?.timeLimit === 0 ? '' : testData.settings?.timeLimit || ''}
                    onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value) || 0)}
                    placeholder="Enter time in minutes (required)"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b70]">
                    <Clock size={14} />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <small className="text-[#6b6b70]">
                    {testData.settings?.useSections
                      ? 'Default time limit for new sections (can be customized per section)'
                      : 'Total time students have to complete the entire test'
                    }
                  </small>
                  {testData.settings?.timeLimit > 0 && timeSuggestion && (
                    <span className={`px-2 py-0.5 rounded text-xs ${getBadgeClass(timeSuggestion.type)}`}>
                      {timeSuggestion.message}
                    </span>
                  )}
                </div>
                {testData.settings?.timeLimit === 0 && (
                  <small className="text-amber-400 flex items-center gap-1 mt-1">
                    <AlertTriangle size={12} />
                    Time limit is required
                  </small>
                )}
                {estimatedDuration > 0 && testData.settings?.timeLimit > 0 && (
                  <small className="text-blue-400 flex items-center gap-1 mt-1">
                    <Info size={12} />
                    Estimated duration: {estimatedDuration} minutes
                  </small>
                )}
              </div>

              <div>
                <label htmlFor="attemptsAllowed" className="block text-sm font-semibold text-[#f5f5f4] mb-2">
                  <RotateCcw size={16} className="inline mr-1" />
                  Attempts Allowed
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="attemptsAllowed"
                    min="1"
                    max="10"
                    className={`input w-full pr-10 ${testData.settings?.attemptsAllowed === 0 ? 'border-amber-500' : ''}`}
                    value={testData.settings?.attemptsAllowed === 0 ? '' : testData.settings?.attemptsAllowed || ''}
                    onChange={(e) => handleSettingChange('attemptsAllowed', parseInt(e.target.value) || 0)}
                    placeholder="Number of attempts (required)"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b70]">
                    <Users size={14} />
                  </div>
                </div>
                <div className="mt-2">
                  <small className="text-[#6b6b70]">
                    How many times students can take this test (1-10)
                  </small>
                  {testData.settings?.attemptsAllowed === 0 && (
                    <div className="mt-1">
                      <small className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Number of attempts is required
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="card p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h6 className="flex items-center gap-2 text-[#f5f5f4] font-semibold">
                <Shield size={20} className="text-blue-500" />
                Test Behavior
              </h6>
              <button
                className="btn-ghost text-sm flex items-center gap-1"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                {showAdvancedSettings ? (
                  <>
                    <ChevronUp size={16} />
                    Hide Advanced
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show Advanced
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={testData.settings?.shuffleQuestions || false}
                    onChange={(e) => handleSettingChange('shuffleQuestions', e.target.checked)}
                  />
                  <div>
                    <span className="font-semibold text-[#f5f5f4] flex items-center gap-1">
                      <RotateCcw size={16} />
                      Shuffle Questions
                    </span>
                    <div className="text-[#6b6b70] text-sm">
                      {testData.settings?.useSections
                        ? 'Randomize question order within each section'
                        : 'Randomize the order of all questions'
                      }
                    </div>
                  </div>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-[#6b6b70]" />
                <small className="text-[#6b6b70]">
                  Shuffling helps prevent cheating and ensures fair assessment
                </small>
              </div>
            </div>

            {/* Advanced Settings Collapse */}
            {showAdvancedSettings && (
              <div className="mt-6 pt-6 border-t border-[#2a2a2e]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h6 className="text-[#f5f5f4] font-semibold mb-4">Question Distribution Insights</h6>
                    {questionStats && (
                      <div>
                        <label className="block text-sm font-semibold text-[#f5f5f4] mb-3">Available Question Distribution</label>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span className="text-[#a1a1aa]">Easy Questions</span>
                              <span className="text-[#a1a1aa]">{questionStats.totals.difficultyBreakdown.easy} ({difficultyDistribution.easy}%)</span>
                            </div>
                            <div className="progress-bar h-2">
                              <div
                                className="progress-fill bg-green-500"
                                style={{ width: `${difficultyDistribution.easy}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span className="text-[#a1a1aa]">Medium Questions</span>
                              <span className="text-[#a1a1aa]">{questionStats.totals.difficultyBreakdown.medium} ({difficultyDistribution.medium}%)</span>
                            </div>
                            <div className="progress-bar h-2">
                              <div
                                className="progress-fill bg-amber-500"
                                style={{ width: `${difficultyDistribution.medium}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span className="text-[#a1a1aa]">Hard Questions</span>
                              <span className="text-[#a1a1aa]">{questionStats.totals.difficultyBreakdown.hard} ({difficultyDistribution.hard}%)</span>
                            </div>
                            <div className="progress-bar h-2">
                              <div
                                className="progress-fill bg-red-500"
                                style={{ width: `${difficultyDistribution.hard}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={`p-4 rounded-lg ${getAlertClass('info')}`}>
                      <div className="flex items-start gap-2">
                        <Info size={16} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Question Distribution</strong>
                          <div className="mt-1 text-sm opacity-90">
                            This shows the actual distribution of questions available in your question bank.
                            Time estimates are based on these real numbers.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Settings Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-5">
            <h6 className="flex items-center gap-2 mb-4 text-[#f5f5f4] font-semibold">
              <Eye size={20} className="text-blue-500" />
              Configuration Summary
            </h6>

            {/* Test Overview */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[#a1a1aa]">Test Type:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${getBadgeClass('info')}`}>
                  {testData.testType?.replace('_', ' ').toUpperCase() || 'CUSTOM'}
                </span>
              </div>

              {testData.settings?.useSections !== undefined ? (
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-[#a1a1aa]">Structure:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${testData.settings.useSections ? getBadgeClass('primary') : getBadgeClass('success')}`}>
                    {testData.settings.useSections ? (
                      <span className="flex items-center gap-1">
                        <Layers size={12} />
                        Sectioned
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        Single
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-[#a1a1aa]">Structure:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getBadgeClass('warning')}`}>Not Selected</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[#a1a1aa]">Languages:</span>
                <span className="badge-gray px-2 py-0.5 rounded-full text-xs">
                  {testData.languages?.length || 0}
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[#a1a1aa]">Topics:</span>
                <span className="badge-gray px-2 py-0.5 rounded-full text-xs">
                  {testData.tags?.length || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#a1a1aa]">Available Questions:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${availableQuestions > 0 ? 'badge-green' : 'badge-amber'}`}>
                  {loadingStats ? <span className="spinner w-3 h-3" /> : availableQuestions}
                </span>
              </div>
            </div>

            <hr className="border-[#2a2a2e] my-4" />

            {/* Settings Details */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#f5f5f4] mb-3">Settings:</label>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Time Limit:</span>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-xs ${getBadgeClass('warning')}`}>
                      <Clock size={12} className="inline mr-1" />
                      {testData.settings?.timeLimit || 0} min
                    </span>
                    {timeSuggestion && testData.settings?.timeLimit > 0 && (
                      <div className="mt-1">
                        <span className="text-[10px]">
                          {timeSuggestion.type === 'success' ? '✓' : timeSuggestion.type === 'warning' ? '⚠' : 'ℹ'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Attempts:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getBadgeClass('info')}`}>
                    <Users size={12} className="inline mr-1" />
                    {testData.settings?.attemptsAllowed || 1}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#a1a1aa]">Shuffle Questions:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${testData.settings?.shuffleQuestions ? getBadgeClass('success') : getBadgeClass('secondary')}`}>
                    {testData.settings?.shuffleQuestions ? "Yes" : "No"}
                  </span>
                </div>

                {estimatedDuration > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#a1a1aa]">Est. Duration:</span>
                    <span className={`px-2 py-0.5 rounded text-xs border ${getBadgeClass('info')}`}>
                      ~{estimatedDuration} min
                    </span>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-[#2a2a2e] my-4" />

            {/* Real-time Stats */}
            {questionStats && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#f5f5f4] mb-3">Question Bank Stats:</label>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Total Questions:</span>
                      <span className="badge-blue px-2 py-0.5 rounded-full text-xs">
                        {questionStats.totals.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Multiple Choice:</span>
                      <span className="badge-gray px-2 py-0.5 rounded-full text-xs">
                        {questionStats.totals.typeBreakdown.multipleChoice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Code Challenges:</span>
                      <span className="badge-gray px-2 py-0.5 rounded-full text-xs">
                        {questionStats.totals.typeBreakdown.codeChallenge}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a1a1aa]">Languages Covered:</span>
                      <span className="badge-blue px-2 py-0.5 rounded-full text-xs">
                        {questionStats.byLanguage.length}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="border-[#2a2a2e] my-4" />
              </>
            )}

            {/* Recommendations */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#f5f5f4] mb-3">Recommendations:</label>
              <div className="text-sm space-y-2">
                {testData.testType && testData.testType !== 'custom' && (
                  <div className={`p-2 rounded ${getAlertClass('success')}`}>
                    <span className="flex items-center gap-1 text-xs">
                      <CheckCircle size={14} />
                      Template-based recommendations available
                    </span>
                  </div>
                )}

                {testData.settings?.useSections === true && (
                  <div className={`p-2 rounded ${getAlertClass('info')}`}>
                    <span className="flex items-center gap-1 text-xs">
                      <Layers size={14} />
                      Sectioned tests provide better analytics
                    </span>
                  </div>
                )}

                {(testData.settings?.timeLimit || 0) < 30 && testData.settings?.timeLimit > 0 && (
                  <div className={`p-2 rounded ${getAlertClass('warning')}`}>
                    <span className="flex items-center gap-1 text-xs">
                      <AlertTriangle size={14} />
                      Consider longer time for thorough assessment
                    </span>
                  </div>
                )}

                {(testData.settings?.attemptsAllowed || 0) > 3 && (
                  <div className={`p-2 rounded ${getAlertClass('info')}`}>
                    <span className="flex items-center gap-1 text-xs">
                      <Info size={14} />
                      Multiple attempts may reduce assessment value
                    </span>
                  </div>
                )}

                {availableQuestions === 0 && (testData.languages?.length > 0 || testData.tags?.length > 0) && (
                  <div className={`p-2 rounded ${getAlertClass('warning')}`}>
                    <span className="flex items-center gap-1 text-xs">
                      <AlertTriangle size={14} />
                      No questions available for current selection
                    </span>
                  </div>
                )}

                {availableQuestions > 0 && availableQuestions < 10 && (
                  <div className={`p-2 rounded ${getAlertClass('warning')}`}>
                    <span className="flex items-center gap-1 text-xs">
                      <AlertTriangle size={14} />
                      Limited questions available ({availableQuestions})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#f5f5f4] mb-2">Setup Progress:</label>
              <div className="progress-bar h-2 mb-2">
                <div
                  className="progress-fill bg-blue-500"
                  style={{
                    width: `${testData.settings?.useSections !== undefined ? 50 : 25}%`
                  }}
                />
              </div>
              <small className="text-[#6b6b70]">
                Structure: {testData.settings?.useSections !== undefined ? '✓' : '○'} |
                Settings: {testData.settings?.timeLimit && testData.settings?.attemptsAllowed ? '✓' : '○'}
              </small>
            </div>

            {/* Next Steps */}
            <div className={`p-3 rounded-lg mb-4 ${getAlertClass('light')}`}>
              <strong className="text-[#f5f5f4]">Next Step:</strong>
              <div className="mt-1 text-sm text-[#a1a1aa]">
                {testData.settings?.useSections
                  ? 'Configure your test sections with names and individual time limits'
                  : 'Add questions directly to your test'
                }
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                className="btn-secondary w-full flex items-center justify-center gap-2 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                onClick={applyRecommendedSettings}
                disabled={loadingStats}
              >
                <Zap size={14} />
                Apply Recommended Settings
              </button>

              {testData.settings?.useSections !== undefined && (
                <small className="block text-center text-[#6b6b70]">
                  {testData.settings.useSections
                    ? `Ready for ${Math.ceil((testData.settings?.timeLimit || 45) / 15)} sections`
                    : 'Ready for question assignment'
                  }
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Alerts */}
      {testData.settings?.timeLimit && testData.settings?.attemptsAllowed && (
        <div className="mt-6">
          <div className={`p-4 rounded-lg flex items-start gap-3 ${getAlertClass('success')}`}>
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>Configuration Complete!</strong>
              <div className="text-sm mt-1 opacity-90">
                Your test is configured for {testData.settings.useSections ? 'sectioned' : 'single'} delivery
                with {testData.settings.timeLimit} minutes and {testData.settings.attemptsAllowed} attempt(s) allowed.
                {availableQuestions > 0 && (
                  <span className="ml-2">
                    {availableQuestions} questions ready for assignment.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={onPrevious}
        >
          <ArrowLeft size={16} />
          Previous: Test Basics
        </button>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          Next: {testData.settings?.useSections ? 'Configure Sections' : 'Add Questions'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default TestStructure;
