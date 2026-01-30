import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  ChevronRight,
  Info,
  FileText,
  Code,
  TestTube,
  Play,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useCodeChallenge } from '../../../context/CodeChallengeContext';
import SafeMonacoEditor from '../../../components/SafeMonacoEditor';
import ApiService from '../../../services/ApiService';
import { DifficultyBadge, LanguageBadge } from '../../../components/code-challenges/shared';
import type { ProgrammingLanguage, DifficultyLevel, TestCase, ChallengeExample } from '../../../types/codeChallenge';

type Step = 'basic' | 'problem' | 'code' | 'tests' | 'preview';

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'basic', label: 'Basic Info', icon: <Info size={16} /> },
  { key: 'problem', label: 'Problem', icon: <FileText size={16} /> },
  { key: 'code', label: 'Code Config', icon: <Code size={16} /> },
  { key: 'tests', label: 'Test Cases', icon: <TestTube size={16} /> },
  { key: 'preview', label: 'Preview', icon: <Play size={16} /> }
];

const LANGUAGES: ProgrammingLanguage[] = ['javascript', 'python', 'dart'];
const DIFFICULTIES: DifficultyLevel[] = ['easy', 'medium', 'hard'];

interface FormData {
  title: string;
  description: string;
  problemStatement: string;
  difficulty: DifficultyLevel;
  supportedLanguages: ProgrammingLanguage[];
  topics: string[];
  tags: string[];
  examples: ChallengeExample[];
  constraints: string[];
  hints: string[];
  codeConfig: Record<ProgrammingLanguage, { runtime: string; entryFunction: string; timeoutMs: number }>;
  startingCode: Record<ProgrammingLanguage, string>;
  testCases: TestCase[];
  solutionCode: Record<ProgrammingLanguage, string>;
  timeComplexity: string;
  spaceComplexity: string;
}

// Note: Swift removed - no longer supports code execution (UI/syntax only)
const defaultCodeConfig = {
  javascript: { runtime: 'node18', entryFunction: 'solution', timeoutMs: 5000 },
  python: { runtime: 'python3', entryFunction: 'solution', timeoutMs: 5000 },
  dart: { runtime: 'dart', entryFunction: 'solution', timeoutMs: 5000 }
};

// Note: Swift removed - no longer supports code execution (UI/syntax only)
const defaultStartingCode = {
  javascript: `function solution(/* params */) {
  // Your code here

}`,
  python: `def solution(# params):
    # Your code here
    pass`,
  dart: `dynamic solution(/* params */) {
  // Your code here

}`
};

const ChallengeEditorPage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(challengeId);

  const {
    challengeDetail,
    loading,
    loadChallengeById,
    createCodeChallenge,
    updateCodeChallenge
  } = useCodeChallenge();

  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    problemStatement: '',
    difficulty: 'easy',
    supportedLanguages: ['javascript'],
    topics: [],
    tags: [],
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: [''],
    hints: [],
    codeConfig: { ...defaultCodeConfig },
    startingCode: { ...defaultStartingCode },
    testCases: [{ name: 'Test 1', args: [], expected: null, hidden: false }],
    solutionCode: { javascript: '', python: '', dart: '' },
    timeComplexity: '',
    spaceComplexity: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Raw text inputs for comma-separated fields (allows typing commas/spaces freely)
  const [topicsInput, setTopicsInput] = useState('');

  // Validation state
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    passed: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    testResults: Array<{
      name: string;
      passed: boolean;
      expected: any;
      actual: any;
      error?: string;
      runtime?: number;
    }>;
  } | null>(null);
  const [validationLanguage, setValidationLanguage] = useState<ProgrammingLanguage>('javascript');

  // Load challenge data for edit mode
  useEffect(() => {
    if (isEditMode && challengeId) {
      loadChallengeById(challengeId);
    }
  }, [isEditMode, challengeId]);

  // Populate form when challenge data loads
  useEffect(() => {
    if (isEditMode && challengeDetail) {
      // Set raw text input for topics
      setTopicsInput((challengeDetail.topics || []).join(', '));

      setFormData({
        title: challengeDetail.title || '',
        description: challengeDetail.description || '',
        problemStatement: challengeDetail.problemStatement || '',
        difficulty: challengeDetail.difficulty || 'easy',
        supportedLanguages: challengeDetail.supportedLanguages || ['javascript'],
        topics: challengeDetail.topics || [],
        tags: challengeDetail.tags || [],
        examples: challengeDetail.examples?.length ? challengeDetail.examples : [{ input: '', output: '', explanation: '' }],
        constraints: challengeDetail.constraints?.length ? challengeDetail.constraints : [''],
        hints: challengeDetail.hints || [],
        codeConfig: challengeDetail.codeConfig || { ...defaultCodeConfig },
        startingCode: challengeDetail.startingCode || { ...defaultStartingCode },
        testCases: challengeDetail.testCases?.length ? challengeDetail.testCases : [{ name: 'Test 1', args: [], expected: null, hidden: false }],
        solutionCode: challengeDetail.solutionCode || { javascript: '', python: '', dart: '' },
        timeComplexity: challengeDetail.timeComplexity || '',
        spaceComplexity: challengeDetail.spaceComplexity || ''
      });
    }
  }, [isEditMode, challengeDetail]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);

      // Filter out empty values
      const cleanedData = {
        ...formData,
        constraints: formData.constraints.filter(c => c.trim()),
        examples: formData.examples.filter(e => e.input || e.output),
        testCases: formData.testCases.filter(t => t.name)
      };

      if (isEditMode && challengeId) {
        await updateCodeChallenge(challengeId, cleanedData);
      } else {
        await createCodeChallenge(cleanedData as any);
      }

      navigate('/admin/code-lab/challenges');
    } catch (err: any) {
      setError(err.message || 'Failed to save challenge');
    } finally {
      setSaving(false);
    }
  };

  const validateSolution = async () => {
    try {
      setValidating(true);
      setValidationResults(null);
      setError(null);

      const solutionCode = formData.solutionCode[validationLanguage];
      if (!solutionCode?.trim()) {
        setError(`No solution code provided for ${validationLanguage}`);
        return;
      }

      const validTestCases = formData.testCases.filter(t => t.name?.trim());
      if (validTestCases.length === 0) {
        setError('No test cases defined. Add test cases first.');
        return;
      }

      const response = await ApiService.validateChallengeCode({
        language: validationLanguage,
        solutionCode,
        testCases: validTestCases,
        codeConfig: formData.codeConfig[validationLanguage]
      });

      if (response.success) {
        setValidationResults(response.results);
      } else {
        setError('Validation failed. Check your solution code and test cases.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate solution');
    } finally {
      setValidating(false);
    }
  };

  const goToStep = (step: Step) => setCurrentStep(step);

  const nextStep = () => {
    const stepIndex = STEPS.findIndex(s => s.key === currentStep);
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].key);
    }
  };

  const prevStep = () => {
    const stepIndex = STEPS.findIndex(s => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].key);
    }
  };

  // Loading state for edit mode
  if (isEditMode && loading.challenge && !challengeDetail) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="container-section py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/code-lab/challenges"
              className="flex items-center gap-1 text-[#6b6b70] hover:text-[#a1a1aa] transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back</span>
            </Link>
            <div>
              <h1 className="font-mono text-2xl font-bold text-[#f5f5f4]">
                {isEditMode ? 'Edit Challenge' : 'Create Challenge'}
              </h1>
              <p className="text-sm text-[#6b6b70]">
                {isEditMode ? 'Update challenge details' : 'Create a new coding challenge'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="spinner w-4 h-4" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditMode ? 'Update' : 'Create'} Challenge
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Step Navigation */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => goToStep(step.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      currentStep === step.key
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-[#6b6b70] hover:text-[#a1a1aa] hover:bg-[#1c1c1f]'
                    }`}
                  >
                    {step.icon}
                    {step.label}
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-[#3a3a3f] flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          <div className="p-6">
            {/* Basic Info Step */}
            {currentStep === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Two Sum"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Short Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Brief summary of the challenge"
                    rows={2}
                    className="input resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Difficulty *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => updateField('difficulty', e.target.value as DifficultyLevel)}
                      className="select"
                    >
                      {DIFFICULTIES.map(d => (
                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Supported Languages *</label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map(lang => (
                        <label key={lang} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.supportedLanguages.includes(lang)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateField('supportedLanguages', [...formData.supportedLanguages, lang]);
                              } else {
                                updateField('supportedLanguages', formData.supportedLanguages.filter(l => l !== lang));
                              }
                            }}
                            className="rounded border-[#2a2a2e] bg-[#0a0a0b] text-blue-500"
                          />
                          <LanguageBadge language={lang} size="sm" />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Topics (comma-separated)</label>
                  <input
                    type="text"
                    value={topicsInput}
                    onChange={(e) => setTopicsInput(e.target.value)}
                    onBlur={() => updateField('topics', topicsInput.split(',').map(t => t.trim()).filter(Boolean))}
                    placeholder="e.g., arrays, hash-table, two-pointers"
                    className="input"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Time Complexity</label>
                    <input
                      type="text"
                      value={formData.timeComplexity}
                      onChange={(e) => updateField('timeComplexity', e.target.value)}
                      placeholder="e.g., O(n)"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Space Complexity</label>
                    <input
                      type="text"
                      value={formData.spaceComplexity}
                      onChange={(e) => updateField('spaceComplexity', e.target.value)}
                      placeholder="e.g., O(1)"
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Problem Statement Step */}
            {currentStep === 'problem' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Problem Statement *</label>
                  <textarea
                    value={formData.problemStatement}
                    onChange={(e) => updateField('problemStatement', e.target.value)}
                    placeholder="Full problem description with clear requirements..."
                    rows={10}
                    className="input resize-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Examples</label>
                  {formData.examples.map((example, index) => (
                    <div key={index} className="p-4 bg-[#0a0a0b] rounded-lg mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[#6b6b70]">Example {index + 1}</span>
                        {formData.examples.length > 1 && (
                          <button
                            onClick={() => {
                              const newExamples = formData.examples.filter((_, i) => i !== index);
                              updateField('examples', newExamples);
                            }}
                            className="text-red-400 text-sm hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[#6b6b70] mb-1 block">Input</label>
                          <input
                            type="text"
                            value={example.input as string}
                            onChange={(e) => {
                              const newExamples = [...formData.examples];
                              newExamples[index] = { ...example, input: e.target.value };
                              updateField('examples', newExamples);
                            }}
                            className="input text-sm"
                            placeholder="nums = [2,7,11,15], target = 9"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#6b6b70] mb-1 block">Output</label>
                          <input
                            type="text"
                            value={example.output as string}
                            onChange={(e) => {
                              const newExamples = [...formData.examples];
                              newExamples[index] = { ...example, output: e.target.value };
                              updateField('examples', newExamples);
                            }}
                            className="input text-sm"
                            placeholder="[0,1]"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="text-xs text-[#6b6b70] mb-1 block">Explanation</label>
                        <input
                          type="text"
                          value={example.explanation}
                          onChange={(e) => {
                            const newExamples = [...formData.examples];
                            newExamples[index] = { ...example, explanation: e.target.value };
                            updateField('examples', newExamples);
                          }}
                          className="input text-sm"
                          placeholder="Because nums[0] + nums[1] == 9"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => updateField('examples', [...formData.examples, { input: '', output: '', explanation: '' }])}
                    className="btn-secondary text-sm"
                  >
                    Add Example
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Constraints</label>
                  {formData.constraints.map((constraint, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={constraint}
                        onChange={(e) => {
                          const newConstraints = [...formData.constraints];
                          newConstraints[index] = e.target.value;
                          updateField('constraints', newConstraints);
                        }}
                        className="input text-sm flex-1"
                        placeholder="e.g., 2 <= nums.length <= 10^4"
                      />
                      {formData.constraints.length > 1 && (
                        <button
                          onClick={() => updateField('constraints', formData.constraints.filter((_, i) => i !== index))}
                          className="btn-secondary text-sm px-3"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => updateField('constraints', [...formData.constraints, ''])}
                    className="btn-secondary text-sm"
                  >
                    Add Constraint
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f5f5f4] mb-2">Hints (optional)</label>
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => {
                          const newHints = [...formData.hints];
                          newHints[index] = e.target.value;
                          updateField('hints', newHints);
                        }}
                        className="input text-sm flex-1"
                        placeholder="A hint to help students..."
                      />
                      <button
                        onClick={() => updateField('hints', formData.hints.filter((_, i) => i !== index))}
                        className="btn-secondary text-sm px-3"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateField('hints', [...formData.hints, ''])}
                    className="btn-secondary text-sm"
                  >
                    Add Hint
                  </button>
                </div>
              </div>
            )}

            {/* Code Config Step */}
            {currentStep === 'code' && (
              <div className="space-y-6">
                {formData.supportedLanguages.map(lang => (
                  <div key={lang} className="border border-[#2a2a2e] rounded-lg overflow-hidden">
                    <div className="p-3 bg-[#0a0a0b] border-b border-[#2a2a2e] flex items-center justify-between">
                      <LanguageBadge language={lang} />
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#6b6b70] mb-1 block">Entry Function Name</label>
                          <input
                            type="text"
                            value={formData.codeConfig[lang]?.entryFunction || 'solution'}
                            onChange={(e) => {
                              updateField('codeConfig', {
                                ...formData.codeConfig,
                                [lang]: { ...formData.codeConfig[lang], entryFunction: e.target.value }
                              });
                            }}
                            className="input text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#6b6b70] mb-1 block">Timeout (ms)</label>
                          <input
                            type="number"
                            value={formData.codeConfig[lang]?.timeoutMs || 5000}
                            onChange={(e) => {
                              updateField('codeConfig', {
                                ...formData.codeConfig,
                                [lang]: { ...formData.codeConfig[lang], timeoutMs: parseInt(e.target.value) }
                              });
                            }}
                            className="input text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#6b6b70] mb-1 block">Starting Code Template</label>
                        <div className="h-48 border border-[#2a2a2e] rounded-lg overflow-hidden">
                          <SafeMonacoEditor
                            height="100%"
                            language={lang}
                            value={formData.startingCode[lang] || ''}
                            onChange={(value) => {
                              updateField('startingCode', {
                                ...formData.startingCode,
                                [lang]: value || ''
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#6b6b70] mb-1 block">Solution Code (for validation)</label>
                        <div className="h-48 border border-[#2a2a2e] rounded-lg overflow-hidden">
                          <SafeMonacoEditor
                            height="100%"
                            language={lang}
                            value={formData.solutionCode[lang] || ''}
                            onChange={(value) => {
                              updateField('solutionCode', {
                                ...formData.solutionCode,
                                [lang]: value || ''
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Test Cases Step */}
            {currentStep === 'tests' && (
              <div className="space-y-6">
                <p className="text-sm text-[#6b6b70]">
                  Define test cases to validate solutions. Each test case has input arguments and expected output.
                </p>

                {formData.testCases.map((testCase, index) => (
                  <div key={index} className="p-4 bg-[#0a0a0b] rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        type="text"
                        value={testCase.name}
                        onChange={(e) => {
                          const newTestCases = [...formData.testCases];
                          newTestCases[index] = { ...testCase, name: e.target.value };
                          updateField('testCases', newTestCases);
                        }}
                        className="input text-sm w-48"
                        placeholder="Test case name"
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={testCase.hidden}
                            onChange={(e) => {
                              const newTestCases = [...formData.testCases];
                              newTestCases[index] = { ...testCase, hidden: e.target.checked };
                              updateField('testCases', newTestCases);
                            }}
                            className="rounded border-[#2a2a2e] bg-[#0a0a0b] text-blue-500"
                          />
                          <span className="text-sm text-[#a1a1aa]">Hidden</span>
                        </label>
                        {formData.testCases.length > 1 && (
                          <button
                            onClick={() => updateField('testCases', formData.testCases.filter((_, i) => i !== index))}
                            className="text-red-400 text-sm hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#6b6b70] mb-1 block">Arguments (JSON array)</label>
                        <input
                          type="text"
                          value={JSON.stringify(testCase.args)}
                          onChange={(e) => {
                            try {
                              const args = JSON.parse(e.target.value);
                              const newTestCases = [...formData.testCases];
                              newTestCases[index] = { ...testCase, args };
                              updateField('testCases', newTestCases);
                            } catch {}
                          }}
                          className="input text-sm font-mono"
                          placeholder='[[2,7,11,15], 9]'
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#6b6b70] mb-1 block">Expected Output (JSON)</label>
                        <input
                          type="text"
                          value={JSON.stringify(testCase.expected)}
                          onChange={(e) => {
                            try {
                              const expected = JSON.parse(e.target.value);
                              const newTestCases = [...formData.testCases];
                              newTestCases[index] = { ...testCase, expected };
                              updateField('testCases', newTestCases);
                            } catch {}
                          }}
                          className="input text-sm font-mono"
                          placeholder='[0, 1]'
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => updateField('testCases', [
                    ...formData.testCases,
                    { name: `Test ${formData.testCases.length + 1}`, args: [], expected: null, hidden: false }
                  ])}
                  className="btn-secondary"
                >
                  Add Test Case
                </button>
              </div>
            )}

            {/* Preview Step */}
            {currentStep === 'preview' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="font-mono text-xl font-bold text-[#f5f5f4]">
                    {formData.title || 'Untitled Challenge'}
                  </h2>
                  <DifficultyBadge difficulty={formData.difficulty} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.supportedLanguages.map(lang => (
                    <LanguageBadge key={lang} language={lang} />
                  ))}
                </div>

                <p className="text-[#a1a1aa]">{formData.description || 'No description provided'}</p>

                <div className="prose prose-invert max-w-none">
                  <h3 className="text-[#f5f5f4]">Problem Statement</h3>
                  <p className="whitespace-pre-wrap text-[#a1a1aa]">
                    {formData.problemStatement || 'No problem statement provided'}
                  </p>
                </div>

                {formData.examples.filter(e => e.input || e.output).length > 0 && (
                  <div>
                    <h3 className="font-medium text-[#f5f5f4] mb-2">Examples</h3>
                    {formData.examples.filter(e => e.input || e.output).map((example, index) => (
                      <div key={index} className="p-3 bg-[#0a0a0b] rounded-lg mb-2">
                        <div className="text-xs text-[#6b6b70] mb-1">Example {index + 1}</div>
                        <div className="font-mono text-sm">
                          <div>Input: <span className="text-[#f5f5f4]">{example.input as string}</span></div>
                          <div>Output: <span className="text-green-400">{example.output as string}</span></div>
                          {example.explanation && (
                            <div className="text-[#6b6b70] mt-1">{example.explanation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.constraints.filter(c => c.trim()).length > 0 && (
                  <div>
                    <h3 className="font-medium text-[#f5f5f4] mb-2">Constraints</h3>
                    <ul className="space-y-1">
                      {formData.constraints.filter(c => c.trim()).map((constraint, index) => (
                        <li key={index} className="text-sm text-[#a1a1aa] flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          <code className="font-mono text-xs bg-[#1c1c1f] px-1 py-0.5 rounded">{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Test Cases Summary */}
                <div className="p-4 bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TestTube className="w-5 h-5 text-blue-400" />
                    <span className="text-[#f5f5f4] font-medium">
                      {formData.testCases.filter(t => t.name?.trim()).length} test case(s) configured
                    </span>
                    <span className="text-[#6b6b70] text-sm">
                      ({formData.testCases.filter(t => t.hidden).length} hidden)
                    </span>
                  </div>
                </div>

                {/* Solution Validation Section */}
                <div className="card p-4">
                  <h3 className="font-medium text-[#f5f5f4] mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-400" />
                    Validate Solution
                  </h3>
                  <p className="text-sm text-[#6b6b70] mb-4">
                    Test your solution code against all test cases before saving.
                  </p>

                  <div className="flex items-center gap-3 mb-4">
                    <select
                      value={validationLanguage}
                      onChange={(e) => {
                        setValidationLanguage(e.target.value as ProgrammingLanguage);
                        setValidationResults(null);
                      }}
                      className="select"
                    >
                      {formData.supportedLanguages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={validateSolution}
                      disabled={validating}
                      className="btn-primary flex items-center gap-2"
                    >
                      {validating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Test Solution
                        </>
                      )}
                    </button>
                  </div>

                  {/* Validation Results */}
                  {validationResults && (
                    <div className={`p-4 rounded-lg border ${
                      validationResults.passed
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        {validationResults.passed ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-medium">
                              All tests passed! ({validationResults.passedTests}/{validationResults.totalTests})
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-red-400 font-medium">
                              {validationResults.failedTests} test(s) failed ({validationResults.passedTests}/{validationResults.totalTests} passed)
                            </span>
                          </>
                        )}
                      </div>

                      {/* Individual Test Results */}
                      <div className="space-y-2">
                        {validationResults.testResults.map((result, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded text-sm ${
                              result.passed
                                ? 'bg-green-500/5 border border-green-500/10'
                                : 'bg-red-500/5 border border-red-500/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                                {result.name}
                              </span>
                              {result.runtime !== undefined && (
                                <span className="text-[#6b6b70] text-xs ml-auto">
                                  {result.runtime}ms
                                </span>
                              )}
                            </div>
                            {!result.passed && (
                              <div className="mt-2 text-xs font-mono">
                                {result.error ? (
                                  <div className="text-red-400">Error: {result.error}</div>
                                ) : (
                                  <>
                                    <div className="text-[#a1a1aa]">Expected: <span className="text-green-400">{JSON.stringify(result.expected)}</span></div>
                                    <div className="text-[#a1a1aa]">Actual: <span className="text-red-400">{JSON.stringify(result.actual)}</span></div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!formData.solutionCode[validationLanguage]?.trim() && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
                      No solution code provided for {validationLanguage}. Go back to the Code Config step to add solution code.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="p-4 border-t border-[#2a2a2e] flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 'basic'}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            {currentStep === 'preview' ? (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? 'Saving...' : (isEditMode ? 'Update Challenge' : 'Create Challenge')}
              </button>
            ) : (
              <button onClick={nextStep} className="btn-primary">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeEditorPage;
