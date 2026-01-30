import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Move,
  CheckCircle,
  Settings,
  Zap,
  Info,
  Target,
  BarChart3,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Import types
import type { WizardStepProps } from '../../types/createTest';
import type { TestSection } from '../../types';

// Interface for recommendations
interface SectionRecommendation {
  type: 'warning' | 'suggestion' | 'info';
  message: string;
}

// Interface for section templates
interface SectionTemplate {
  name: string;
  timeLimit: number;
  questions?: never[];
}

// Template type
type TemplateType = 'frontend' | 'react' | 'fullstack';

const SectionConfig: React.FC<WizardStepProps> = ({
  testData,
  setTestData,
  onNext,
  onPrevious,
  setError
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const addSection = (): void => {
    const currentSections = testData.sections || [];
    const suggestedTime = Math.max(10, Math.floor((testData.settings?.timeLimit || 45) / (currentSections.length + 2)));
    const newSection: TestSection = {
      name: `Section ${currentSections.length + 1}`,
      timeLimit: suggestedTime,
      questions: []
    };

    setTestData({
      ...testData,
      sections: [...currentSections, newSection]
    });
  };

  const removeSection = (index: number): void => {
    const currentSections = testData.sections || [];
    if (currentSections.length <= 1) {
      setError('At least one section is required');
      return;
    }

    const newSections = currentSections.filter((_, i) => i !== index);
    setTestData({
      ...testData,
      sections: newSections
    });
    setError(null);
  };

  const updateSection = (index: number, field: keyof TestSection, value: string | number): void => {
    const currentSections = testData.sections || [];
    const newSections = [...currentSections];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };

    setTestData({
      ...testData,
      sections: newSections
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down'): void => {
    const sections = testData.sections || [];
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

    setTestData({
      ...testData,
      sections: newSections
    });
  };

  const duplicateSection = (index: number): void => {
    const sections = testData.sections || [];
    const sectionToDupe = sections[index];
    const newSection: TestSection = {
      ...sectionToDupe,
      name: `${sectionToDupe.name} (Copy)`,
      questions: []
    };

    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);

    setTestData({
      ...testData,
      sections: newSections
    });
  };

  const autoDistributeTime = (): void => {
    const sections = testData.sections || [];
    if (sections.length === 0) return;

    const totalTime = testData.settings?.timeLimit || 0;
    const timePerSection = Math.floor(totalTime / sections.length);
    const remainder = totalTime % sections.length;

    const newSections = sections.map((section, index) => ({
      ...section,
      timeLimit: timePerSection + (index < remainder ? 1 : 0)
    }));

    setTestData({
      ...testData,
      sections: newSections
    });
  };

  const applySectionTemplate = (template: TemplateType): void => {
    const templates: Record<TemplateType, SectionTemplate[]> = {
      'frontend': [
        { name: 'HTML & CSS Fundamentals', timeLimit: 15 },
        { name: 'JavaScript Basics', timeLimit: 20 },
        { name: 'DOM Manipulation', timeLimit: 15 }
      ],
      'react': [
        { name: 'React Components', timeLimit: 20 },
        { name: 'State & Props', timeLimit: 15 },
        { name: 'Hooks & Effects', timeLimit: 20 }
      ],
      'fullstack': [
        { name: 'Frontend Development', timeLimit: 25 },
        { name: 'Backend APIs', timeLimit: 25 },
        { name: 'Database Integration', timeLimit: 20 }
      ]
    };

    const templateSections = templates[template] || [];
    const sectionsWithQuestions: TestSection[] = templateSections.map(section => ({
      ...section,
      questions: []
    }));

    setTestData({
      ...testData,
      sections: sectionsWithQuestions
    });
  };

  const validateStep = (): boolean => {
    const sections = testData.sections || [];

    if (sections.length === 0) {
      setError('At least one section is required');
      return false;
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.name?.trim()) {
        setError(`Section ${i + 1} name is required`);
        return false;
      }
      if (section.timeLimit < 1) {
        setError(`Section ${i + 1} must have a time limit of at least 1 minute`);
        return false;
      }
    }

    const totalSectionTime = sections.reduce((sum, section) => sum + section.timeLimit, 0);
    const testTimeLimit = testData.settings?.timeLimit || 0;

    if (totalSectionTime > testTimeLimit) {
      setError(`Total section time (${totalSectionTime} min) cannot exceed test time limit (${testTimeLimit} min)`);
      return false;
    }

    if (totalSectionTime < testTimeLimit * 0.5) {
      setError(`Total section time (${totalSectionTime} min) is very low compared to test limit (${testTimeLimit} min). Consider adding more time.`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = (): void => {
    if (validateStep()) {
      onNext?.();
    }
  };

  const handleSectionNameChange = (index: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    updateSection(index, 'name', e.target.value);
  };

  const handleSectionTimeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    updateSection(index, 'timeLimit', parseInt(e.target.value) || 1);
  };

  const getSectionRecommendations = (): SectionRecommendation[] => {
    const sections = testData.sections || [];
    const totalSectionTime = sections.reduce((sum, section) => sum + section.timeLimit, 0);
    const testTimeLimit = testData.settings?.timeLimit || 0;
    const timeUtilization = testTimeLimit > 0 ? (totalSectionTime / testTimeLimit) * 100 : 0;

    const recommendations: SectionRecommendation[] = [];

    if (sections.length < 3 && (testData.languages?.length || 0) > 1) {
      recommendations.push({
        type: 'suggestion',
        message: 'Consider creating separate sections for different programming languages'
      });
    }

    if (timeUtilization < 80) {
      recommendations.push({
        type: 'warning',
        message: 'You\'re only using ' + Math.round(timeUtilization) + '% of available time'
      });
    }

    if (sections.some(s => s.timeLimit < 5)) {
      recommendations.push({
        type: 'warning',
        message: 'Some sections have very short time limits (< 5 minutes)'
      });
    }

    return recommendations;
  };

  const sections = testData.sections || [];
  const totalSectionTime = sections.reduce((sum, section) => sum + section.timeLimit, 0);
  const testTimeLimit = testData.settings?.timeLimit || 0;
  const remainingTime = testTimeLimit - totalSectionTime;
  const timeUtilization = testTimeLimit > 0 ? (totalSectionTime / testTimeLimit) * 100 : 0;
  const recommendations = getSectionRecommendations();

  // Initialize with one section if none exist
  useEffect(() => {
    if (sections.length === 0) {
      addSection();
    }
  }, []);

  const getAlertColor = (): string => {
    if (remainingTime < 0) return 'bg-red-500/10 border-red-500/25 text-red-400';
    if (remainingTime === 0) return 'bg-green-500/10 border-green-500/25 text-green-400';
    if (timeUtilization < 80) return 'bg-amber-500/10 border-amber-500/25 text-amber-400';
    return 'bg-blue-500/10 border-blue-500/25 text-blue-400';
  };

  const getProgressColor = (): string => {
    if (remainingTime < 0) return 'bg-red-500';
    if (timeUtilization >= 80) return 'bg-green-500';
    return 'bg-amber-500';
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Header Card with Templates */}
          <div className="card p-4 mb-4 bg-[#1a1a1e]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h6 className="mb-1 flex items-center gap-2 text-[#f5f5f4] font-semibold">
                  <Zap size={20} className="text-amber-500" />
                  Quick Section Templates
                </h6>
                <small className="text-[#6b6b70]">
                  Apply pre-configured sections based on your test type
                </small>
              </div>
              <button
                className="btn-ghost text-sm flex items-center gap-1"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings size={14} />
                {showAdvanced ? (
                  <>
                    <ChevronUp size={14} />
                    Hide Advanced
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Show Advanced
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                className="btn-secondary text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                onClick={() => applySectionTemplate('frontend')}
              >
                Frontend Template
              </button>
              <button
                className="btn-secondary text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                onClick={() => applySectionTemplate('react')}
              >
                React Template
              </button>
              <button
                className="btn-secondary text-green-400 border-green-500/30 hover:bg-green-500/10"
                onClick={() => applySectionTemplate('fullstack')}
              >
                Full Stack Template
              </button>
            </div>

            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-[#2a2a2e]">
                <div className="flex items-center gap-3">
                  <button
                    className="btn-secondary text-sm text-amber-400 border-amber-500/30 hover:bg-amber-500/10 flex items-center gap-2"
                    onClick={autoDistributeTime}
                    disabled={sections.length === 0}
                  >
                    <BarChart3 size={14} />
                    Auto-distribute Time
                  </button>
                  <small className="text-[#6b6b70]">
                    Evenly distribute {testTimeLimit} minutes across {sections.length} sections
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Main Configuration Card */}
          <div className="card p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h6 className="flex items-center gap-2 text-[#f5f5f4] font-semibold">
                <Layers size={20} className="text-blue-500" />
                Configure Sections
              </h6>
              <button
                className="btn-primary text-sm flex items-center gap-2"
                onClick={addSection}
              >
                <Plus size={16} />
                Add Section
              </button>
            </div>

            <p className="text-[#6b6b70] mb-4">
              Create timed sections to organize your test. Each section can have its own time limit and questions.
            </p>

            {/* Time Budget Alert */}
            <div className={`p-4 rounded-lg border mb-4 ${getAlertColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <div>
                    <strong>Time Budget:</strong> {totalSectionTime} / {testTimeLimit} minutes used
                    {remainingTime > 0 && ` (${remainingTime} minutes remaining)`}
                    {remainingTime < 0 && ` (${Math.abs(remainingTime)} minutes over limit!)`}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${timeUtilization >= 80 ? 'badge-green' : 'badge-amber'}`}>
                  {Math.round(timeUtilization)}%
                </span>
              </div>
              <div className="progress-bar h-1.5 mt-3">
                <div
                  className={`progress-fill ${getProgressColor()}`}
                  style={{ width: `${Math.min(timeUtilization, 100)}%` }}
                />
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mb-4 space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border flex items-center gap-2 text-sm ${
                      rec.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                        : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                    }`}
                  >
                    {rec.type === 'warning' ? (
                      <AlertCircle size={14} />
                    ) : (
                      <Info size={14} />
                    )}
                    <span>{rec.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sections List */}
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={index} className="card p-4 border border-[#2a2a2e]">
                  <div className="flex justify-between items-start mb-4">
                    <h6 className="flex items-center gap-2 text-[#f5f5f4] font-semibold">
                      <span className="badge-blue px-2 py-0.5 rounded text-xs">
                        {index + 1}
                      </span>
                      Section {index + 1}
                      {(section.questions?.length || 0) > 0 && (
                        <span className="badge-green text-xs flex items-center gap-1 px-2 py-0.5 rounded">
                          <CheckCircle size={10} />
                          {section.questions?.length || 0} questions
                        </span>
                      )}
                    </h6>

                    <div className="flex gap-1">
                      <button
                        className="btn-ghost p-1.5"
                        onClick={() => duplicateSection(index)}
                        title="Duplicate Section"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="btn-ghost p-1.5"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                      >
                        <Move size={14} style={{ transform: 'rotate(-90deg)' }} />
                      </button>
                      <button
                        className="btn-ghost p-1.5"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sections.length - 1}
                        title="Move Down"
                      >
                        <Move size={14} style={{ transform: 'rotate(90deg)' }} />
                      </button>
                      <button
                        className="btn-ghost p-1.5 text-red-400 hover:bg-red-500/10"
                        onClick={() => removeSection(index)}
                        disabled={sections.length <= 1}
                        title="Remove Section"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Section Name *</label>
                      <input
                        type="text"
                        className="input w-full"
                        placeholder="e.g., JavaScript Basics"
                        value={section.name}
                        onChange={(e) => handleSectionNameChange(index, e)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#f5f5f4] mb-2 flex items-center gap-1">
                        <Clock size={14} />
                        Time Limit (min) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          className="input w-full pr-10"
                          min="1"
                          max={testTimeLimit}
                          value={section.timeLimit}
                          onChange={(e) => handleSectionTimeChange(index, e)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b70]">
                          <Clock size={12} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#1a1a1e] rounded-lg mt-4">
                    <div className="flex justify-between items-center">
                      <small className="text-[#6b6b70]">
                        Questions will be assigned to this section in the next step.
                        Time limit: <strong className="text-[#f5f5f4]">{section.timeLimit} minutes</strong>
                      </small>
                      <div className="flex items-center gap-2">
                        <small className="text-[#6b6b70]">Progress:</small>
                        <span className={`px-2 py-0.5 rounded text-xs ${(section.questions?.length || 0) > 0 ? 'badge-green' : 'badge-amber'}`}>
                          {(section.questions?.length || 0) > 0 ? "Ready" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sections.length === 0 && (
              <div className="text-center py-12">
                <Layers className="text-[#6b6b70] mx-auto mb-3" size={48} />
                <h6 className="text-[#f5f5f4] font-semibold mb-2">No sections configured</h6>
                <p className="text-[#6b6b70] mb-4">Add your first section to get started.</p>
                <button className="btn-primary" onClick={addSection}>
                  <Plus size={16} className="mr-2" />
                  Add First Section
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-5">
            <h6 className="mb-4 flex items-center gap-2 text-[#f5f5f4] font-semibold">
              <Target size={20} className="text-cyan-500" />
              Sections Summary
            </h6>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{sections.length}</div>
                <small className="text-[#6b6b70]">Sections</small>
              </div>
              <div className="text-center p-3 bg-amber-500/10 rounded-lg">
                <div className="text-2xl font-bold text-amber-400">{totalSectionTime}</div>
                <small className="text-[#6b6b70]">Minutes</small>
              </div>
            </div>

            {/* Time Analysis */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#f5f5f4] mb-2">Time Distribution:</label>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#a1a1aa]">Used:</span>
                  <span className="text-[#a1a1aa]">{totalSectionTime} / {testTimeLimit} min</span>
                </div>
                <div className="progress-bar h-1.5">
                  <div
                    className={`progress-fill ${timeUtilization >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(timeUtilization, 100)}%` }}
                  />
                </div>
              </div>
              {remainingTime > 0 && (
                <small className="text-blue-400 flex items-center gap-1">
                  <Info size={12} />
                  {remainingTime} minutes available
                </small>
              )}
              {remainingTime < 0 && (
                <small className="text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {Math.abs(remainingTime)} minutes over limit
                </small>
              )}
            </div>

            {/* Sections List */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#f5f5f4] mb-2">Sections ({sections.length}):</label>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-[#1a1a1e] rounded-lg">
                    <div>
                      <small className="text-[#f5f5f4] block truncate" style={{ maxWidth: '120px' }}>
                        {index + 1}. {section.name}
                      </small>
                      <div className="flex gap-1 mt-1">
                        <span className="badge-blue px-1.5 py-0.5 rounded text-[10px]">
                          {section.timeLimit}m
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${(section.questions?.length || 0) > 0 ? 'badge-green' : 'badge-gray'}`}>
                          {section.questions?.length || 0} Q
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-3 rounded-lg bg-[#1a1a1e] border border-[#2a2a2e]">
              <strong className="text-[#f5f5f4]">Next Step:</strong>
              <div className="mt-1 text-sm text-[#a1a1aa]">
                Assign questions to each section and set point values. Each section should have at least one question.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-[#2a2a2e] mt-6">
        <button className="btn-secondary flex items-center gap-2" onClick={onPrevious}>
          <ArrowLeft size={16} />
          Previous: Test Structure
        </button>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleNext}
          disabled={sections.length === 0}
        >
          Next: Add Questions
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SectionConfig;
