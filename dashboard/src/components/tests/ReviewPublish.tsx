import {
  AlertTriangle,
  Bookmark,
  Building,
  CheckCircle,
  Edit3,
  Eye,
  Globe,
  Info,
  Send,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';
import type { WizardStepProps } from '../../types/createTest';
import { canCreateGlobalTests, createTestPayload, getTestScopeText } from '../../types/createTest';

interface ValidationIssue {
  type: 'error' | 'warning' | 'suggestion';
  field: string;
  message: string;
}

const ReviewPublish: React.FC<WizardStepProps> = ({
  testData,
  onPrevious,
  onComplete,
  setError,
  setLoading
}) => {
  const { user } = useAuth();
  const [publishModal, setPublishModal] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'active'>('active');

  // Determine test scope based on user's organization
  const isGlobalTest = canCreateGlobalTests(user?.organization);
  const testScopeText = getTestScopeText(user?.organization);

  const getValidationIssues = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // Basic validation
    if (!testData.title?.trim()) {
      issues.push({ type: 'error', field: 'title', message: 'Test title is required' });
    }
    if (!testData.description?.trim()) {
      issues.push({ type: 'error', field: 'description', message: 'Test description is required' });
    }

    // Settings validation
    if (!testData.settings?.timeLimit || testData.settings.timeLimit <= 0) {
      issues.push({ type: 'error', field: 'settings', message: 'Valid time limit is required' });
    }
    if (!testData.settings?.attemptsAllowed || testData.settings.attemptsAllowed <= 0) {
      issues.push({ type: 'error', field: 'settings', message: 'Valid attempts allowed is required' });
    }

    // Structure validation
    if (testData.settings?.useSections) {
      if (!testData.sections || testData.sections.length === 0) {
        issues.push({ type: 'error', field: 'sections', message: 'At least one section is required' });
      } else {
        testData.sections.forEach((section, index) => {
          if (!section.name?.trim()) {
            issues.push({ type: 'error', field: 'sections', message: `Section ${index + 1} name is required` });
          }
          if (!section.questions || section.questions.length === 0) {
            issues.push({ type: 'error', field: 'sections', message: `Section ${index + 1} must have at least one question` });
          }
        });
      }
    } else {
      if (!testData.questions || testData.questions.length === 0) {
        issues.push({ type: 'error', field: 'questions', message: 'At least one question is required' });
      }
    }

    // Warnings and suggestions
    if (testData.languages.length === 0) {
      issues.push({ type: 'suggestion', field: 'languages', message: 'Consider adding language tags to help categorize your test' });
    }
    if (testData.tags.length === 0) {
      issues.push({ type: 'suggestion', field: 'tags', message: 'Consider adding topic tags to improve discoverability' });
    }

    if (testData.settings?.timeLimit && testData.settings.timeLimit > 180) {
      issues.push({ type: 'warning', field: 'settings', message: 'Tests longer than 3 hours may lead to student fatigue' });
    }

    return issues;
  };

  const validationIssues = getValidationIssues();
  const hasErrors = validationIssues.some(issue => issue.type === 'error');

  const handlePublish = async () => {

    if (!user || !['admin', 'instructor'].includes(user.role)) {
      setError('Unauthorized: Only admins or instructors can publish tests');
      return;
    }

    if (hasErrors) {
      setError('Please fix all validation errors before publishing');
      return;
    }

    setPublishModal(false);
    setLoading?.(true);

    try {
      // Merge publishStatus into testData
      const testDataWithStatus = { ...testData, status: publishStatus };

      const payload = createTestPayload(testDataWithStatus);
      // FIXED: createTest returns Test directly, no wrapper
      const createdTest = await apiService.createTest(payload);

      if (!createdTest || !createdTest._id) {
        throw new Error('Failed to create test - invalid response');
      }

      setError(null);
      onComplete?.();
    } catch (error) {
      console.error('=== DEBUG: Error in handlePublish ===');
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create test');
    } finally {
      setLoading?.(false);
    }
  };

  const handlePreview = () => {
    if (hasErrors) {
      setError('Please fix validation errors before previewing');
      return;
    }
    alert('Test data logged to console. Check developer tools for details.');
  };

  const getTotalQuestions = (): number => {
    if (testData.settings?.useSections) {
      return testData.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0;
    }
    return testData.questions?.length || 0;
  };

  const getTotalPoints = (): number => {
    if (testData.settings?.useSections) {
      return testData.sections?.reduce((total, section) =>
        total + (section.questions?.reduce((sectionTotal, q) => sectionTotal + (q.points || 0), 0) || 0), 0
      ) || 0;
    }
    return testData.questions?.reduce((total, q) => total + (q.points || 0), 0) || 0;
  };

  return (
    <div>
      {/* Test Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h5 className="flex items-center gap-2 mb-6 text-[#f5f5f4] font-semibold text-lg">
              <CheckCircle size={24} className="text-blue-500" />
              Review & Publish Test
            </h5>

            {/* Test Overview */}
            <div className="mb-6">
              <h6 className="font-semibold text-[#f5f5f4] mb-4">Test Overview</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-3">
                    <strong className="text-[#f5f5f4]">Title:</strong>
                    <div className="mt-1 text-[#a1a1aa]">{testData.title || <em className="text-[#6b6b70]">Not set</em>}</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-[#f5f5f4]">Type:</strong>
                    <div className="mt-1">
                      <span className="badge-blue px-2 py-0.5 rounded text-xs">
                        {testData.testType?.replace('_', ' ').toUpperCase() || 'CUSTOM'}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-[#f5f5f4]">Structure:</strong>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${testData.settings?.useSections ? 'badge-blue' : 'badge-green'}`}>
                        {testData.settings?.useSections ? 'Sectioned Test' : 'Single Test'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-3">
                    <strong className="text-[#f5f5f4]">Questions:</strong>
                    <div className="mt-1 text-[#a1a1aa]">{getTotalQuestions()} total questions</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-[#f5f5f4]">Total Points:</strong>
                    <div className="mt-1 text-[#a1a1aa]">{getTotalPoints()} points</div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-[#f5f5f4]">Time Limit:</strong>
                    <div className="mt-1 text-[#a1a1aa]">{testData.settings?.timeLimit || 0} minutes</div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <strong className="text-[#f5f5f4]">Description:</strong>
                <div className="mt-1 text-[#6b6b70]">{testData.description || <em>Not set</em>}</div>
              </div>
            </div>

            {/* Test Scope - Shows automatic global/org setting */}
            <div className="mb-6">
              <h6 className="font-semibold text-[#f5f5f4] mb-4">Test Scope</h6>
              <div className={`p-4 rounded-lg flex items-start gap-3 ${isGlobalTest ? 'bg-blue-500/10 border border-blue-500/25' : 'bg-[#1a1a1e] border border-[#2a2a2e]'}`}>
                {isGlobalTest ? (
                  <Globe size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Building size={20} className="text-[#6b6b70] mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <strong className="text-[#f5f5f4]">{testScopeText}</strong>
                  <div className="text-sm text-[#6b6b70] mt-1">
                    {isGlobalTest ? (
                      <>
                        As a member of {user?.organization?.name}, your tests are automatically made available to all organizations and students globally.
                      </>
                    ) : (
                      <>
                        This test will only be available to members of {user?.organization?.name}.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Languages and Tags */}
            {(testData.languages.length > 0 || testData.tags.length > 0) && (
              <div className="mb-6">
                <h6 className="font-semibold text-[#f5f5f4] mb-4">Categorization</h6>
                {testData.languages.length > 0 && (
                  <div className="mb-3">
                    <strong className="text-sm text-[#f5f5f4]">Languages:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {testData.languages.map(lang => (
                        <span key={lang} className="badge-gray px-2 py-0.5 rounded text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {testData.tags.length > 0 && (
                  <div>
                    <strong className="text-sm text-[#f5f5f4]">Topics:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {testData.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded text-xs border border-[#3a3a3e] text-[#a1a1aa]">
                          {tag.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Validation Issues */}
            {validationIssues.length > 0 && (
              <div className="mb-6">
                <h6 className="font-semibold text-[#f5f5f4] mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Review Items
                </h6>
                <div className="space-y-2">
                  {validationIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border flex items-center gap-2 text-sm ${
                        issue.type === 'error'
                          ? 'bg-red-500/10 border-red-500/25 text-red-400'
                          : issue.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                          : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                      }`}
                    >
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      <strong className="mr-1">{issue.field}:</strong>
                      {issue.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h6 className="text-[#f5f5f4] font-semibold mb-4">Actions</h6>

            <div className="space-y-3">
              <button
                className="btn-primary w-full py-3"
                disabled={hasErrors}
                onClick={() => {
                  setPublishStatus('active');
                  setPublishModal(true);
                }}
              >
                {hasErrors ? 'Fix Issues to Publish' : 'Publish Test'}
              </button>

              {!hasErrors && (
                <div className="flex gap-2">
                  <button
                    className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                    onClick={() => {
                      setPublishStatus('draft');
                      setPublishModal(true);
                    }}
                  >
                    <Edit3 size={14} />
                    Save Draft
                  </button>
                  <button
                    className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                    onClick={handlePreview}
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              )}

              <button
                className="btn-secondary w-full"
                onClick={onPrevious}
              >
                &larr; Previous Step
              </button>

              {hasErrors && (
                <small className="text-[#6b6b70] text-center block flex items-center justify-center gap-1">
                  <AlertTriangle size={12} />
                  Fix {validationIssues.filter(i => i.type === 'error').length} validation issue(s) to publish
                </small>
              )}
            </div>

            {/* Backend Alignment Notice */}
            <div className="mt-4 p-3 rounded-lg bg-[#1a1a1e] border border-[#2a2a2e]">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-[#6b6b70] mt-0.5 flex-shrink-0" />
                <small className="text-[#6b6b70]">
                  <strong className="text-[#a1a1aa]">Auto-Configuration:</strong> Test scope is automatically determined based on your organization. Global tests are created for EngineerSmith, organization-specific tests for all others.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {publishModal && (
        <div className="modal-backdrop" onClick={() => setPublishModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-[#f5f5f4] font-semibold">Confirm Publication</h5>
              <button className="btn-ghost p-1" onClick={() => setPublishModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-[#a1a1aa] mb-3">You are about to {publishStatus === 'active' ? 'publish' : 'save as draft'} this test:</p>
              <div className="p-3 bg-[#1a1a1e] rounded-lg">
                <strong className="text-[#f5f5f4]">{testData.title}</strong>
                <div className="text-sm text-[#6b6b70] mt-1">{testScopeText}</div>
              </div>
            </div>

            {publishStatus === 'active' && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 mb-4">
                <strong className="text-amber-400">Publishing Notice:</strong>
                <span className="text-amber-400/80 ml-1">Once published, this test will be {isGlobalTest ? 'available globally to all organizations' : 'available to your organization members'}.</span>
              </div>
            )}

            <div className="text-sm text-[#6b6b70] mb-4">
              <div>&bull; {getTotalQuestions()} questions</div>
              <div>&bull; {getTotalPoints()} total points</div>
              <div>&bull; {testData.settings?.timeLimit} minute time limit</div>
            </div>

            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setPublishModal(false)}>
                Cancel
              </button>
              <button
                className={publishStatus === 'active' ? 'btn-primary flex items-center gap-2' : 'btn-primary flex items-center gap-2 bg-green-500 hover:bg-green-600'}
                onClick={handlePublish}
              >
                {publishStatus === 'active' ? (
                  <>
                    <Send size={14} />
                    Publish Test
                  </>
                ) : (
                  <>
                    <Bookmark size={14} />
                    Save Draft
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

export default ReviewPublish;
