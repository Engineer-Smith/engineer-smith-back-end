// src/components/QuestionCreation/components/TestCaseForm.tsx - Fixed for backend compatibility
import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Code, AlertTriangle, Layers, CheckCircle, Loader2, HelpCircle } from 'lucide-react';
import type { TestCase, Language } from '../../../types';
import { TestCaseBuilder } from '../../../utils/testCasesStructure';
import { validateCreateQuestionData } from '../../../services/questionValidationService';

// Updated interface to match backend schema
interface TestCaseFormData {
  name: string;
  args: string;
  expected: string;
  hidden: boolean;
  // Removed: description, points (not in backend schema)
}

interface TestCaseFormProps {
  editingIndex: number | null;
  formData: TestCaseFormData;
  onFormChange: (field: keyof TestCaseFormData, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onGenerateSamples: () => void;
  onGeneratePrompt: () => void;
  validationErrors: string[];
  canGenerateSamples: boolean;
  isGeneratingPrompt: boolean;
  onGenerateTemplates?: () => void;
  canGenerateTemplates?: boolean;
  selectedLanguage?: Language;
  selectedCategory?: string;
  codeConfig?: any;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({
  editingIndex,
  formData,
  onFormChange,
  onSave,
  onCancel,
  onGenerateSamples,
  onGeneratePrompt,
  canGenerateSamples,
  isGeneratingPrompt,
  onGenerateTemplates,
  canGenerateTemplates = false,
  selectedLanguage,
  selectedCategory = 'logic',
  codeConfig
}) => {
  const [localValidationErrors, setLocalValidationErrors] = useState<string[]>([]);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // Create a test case object for validation (backend compatible)
  const currentTestCase = useMemo((): TestCase | null => {
    if (!formData.name && !formData.args && !formData.expected) {
      return null;
    }

    try {
      let parsedArgs = [];
      if (formData.args.trim()) {
        const parsed = JSON.parse(formData.args);
        parsedArgs = Array.isArray(parsed) ? parsed : [parsed];
      }

      let parsedExpected;
      if (formData.expected.trim()) {
        try {
          parsedExpected = JSON.parse(formData.expected);
        } catch {
          parsedExpected = formData.expected;
        }
      }

      // Return backend-compatible TestCase
      return {
        name: formData.name,
        args: parsedArgs,
        expected: parsedExpected,
        hidden: formData.hidden
        // Removed: id, description, points
      };
    } catch (error) {
      return null;
    }
  }, [formData]);

  // Validation function
  const validateFormData = (): string[] => {
    const errors: string[] = [];

    // Basic required field validation
    if (!formData.name.trim()) {
      errors.push('Test case name is required');
    }

    if (!formData.expected.trim()) {
      errors.push('Expected result is required');
    }

    // JSON validation for arguments
    if (formData.args.trim()) {
      try {
        const parsed = JSON.parse(formData.args);
        JSON.stringify(parsed);
      } catch (e) {
        errors.push('Arguments must be valid JSON (e.g., [1, 2, 3], "hello", or 42)');
      }
    }

    // Use TestCaseBuilder for advanced validation
    if (currentTestCase && selectedLanguage) {
      const testCaseValidation = TestCaseBuilder.validateTestCase(
        currentTestCase,
        0,
        selectedLanguage,
        codeConfig?.entryFunction
      );

      if (!testCaseValidation.isValid) {
        errors.push(...testCaseValidation.errors);
      }

      if (testCaseValidation.warnings.length > 0) {
        testCaseValidation.warnings.forEach(warning => {
          errors.push(`Warning: ${warning}`);
        });
      }
    }

    // Mock question data for comprehensive validation
    if (currentTestCase) {
      const mockQuestionData = {
        title: 'Test Question',
        description: 'Test Description',
        type: 'codeChallenge' as const,
        language: selectedLanguage || 'javascript' as const,
        category: selectedCategory as any,
        difficulty: 'medium' as const,
        testCases: [currentTestCase],
        codeConfig: codeConfig || {
          entryFunction: 'solution',
          runtime: 'node',
          timeoutMs: 3000
        }
      };

      const validationResult = validateCreateQuestionData(mockQuestionData);
      const testCaseErrors = validationResult.errors
        .filter(error => error.field.startsWith('testCases'))
        .map(error => error.message);

      errors.push(...testCaseErrors);
    }

    return errors;
  };

  // Real-time validation
  useEffect(() => {
    if (hasAttemptedSave || (formData.name.trim() && formData.expected.trim())) {
      setValidationState('validating');
      const errors = validateFormData();
      setLocalValidationErrors(errors);
      setValidationState(errors.length === 0 ? 'valid' : 'invalid');
    } else {
      setValidationState('idle');
      setLocalValidationErrors([]);
    }
  }, [formData, currentTestCase, selectedLanguage, hasAttemptedSave]);

  const handleSave = () => {
    setHasAttemptedSave(true);
    const formErrors = validateFormData();

    const actualErrors = formErrors.filter(error => !error.startsWith('Warning:'));

    if (actualErrors.length > 0) {
      setLocalValidationErrors(formErrors);
      setValidationState('invalid');
      return;
    }

    setLocalValidationErrors([]);
    setValidationState('valid');
    onSave();
    setHasAttemptedSave(false);
    setValidationState('idle');
  };

  const handleFormChange = (field: keyof TestCaseFormData, value: any) => {
    onFormChange(field, value);

    if (localValidationErrors.length > 0) {
      setValidationState('idle');
      setLocalValidationErrors([]);
    }
  };

  const errorsToShow = localValidationErrors.length > 0 ? localValidationErrors : [];
  const hasGenerationOptions = canGenerateSamples || canGenerateTemplates;

  const warnings = errorsToShow.filter(error => error.startsWith('Warning:'));
  const actualErrors = errorsToShow.filter(error => !error.startsWith('Warning:'));

  const getValidationIcon = () => {
    switch (validationState) {
      case 'validating':
        return <Loader2 size={16} className="animate-spin text-[#a1a1aa]" />;
      case 'valid':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'invalid':
        return <AlertTriangle size={16} className="text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="card mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h6 className="mb-0 font-semibold text-[#f5f5f4]">
              {editingIndex !== null ? 'Edit Test Case' : 'Add Test Case'}
            </h6>
            {getValidationIcon()}
          </div>
          <div className="flex gap-2">
            {hasGenerationOptions && (
              <div className="flex">
                {canGenerateSamples && (
                  <button
                    className="btn-secondary text-sm rounded-r-none border-r-0"
                    onClick={onGenerateSamples}
                    title="Generate sample test cases automatically"
                  >
                    <Zap size={14} className="mr-1" />
                    Samples
                  </button>
                )}
                {canGenerateTemplates && onGenerateTemplates && (
                  <button
                    className="btn-secondary text-sm rounded-l-none"
                    onClick={onGenerateTemplates}
                    title="Generate test cases from language templates"
                  >
                    <Layers size={14} className="mr-1" />
                    Templates
                  </button>
                )}
              </div>
            )}
            <button
              className="btn-secondary text-sm"
              onClick={onGeneratePrompt}
              disabled={isGeneratingPrompt}
            >
              {isGeneratingPrompt ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <Code size={14} className="mr-1" />
              )}
              AI Assist
            </button>
          </div>
        </div>

        {hasGenerationOptions && (
          <div className="p-3 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg mb-3 text-sm">
            <div className="flex items-start">
              <div className="mr-2 text-amber-400">💡</div>
              <div className="text-[#a1a1aa]">
                <strong className="text-[#f5f5f4]">Need help getting started?</strong> Use the generation buttons above to create test cases automatically:
                <ul className="mb-0 mt-1 list-disc list-inside">
                  {canGenerateSamples && <li><strong className="text-[#f5f5f4]">Samples:</strong> Basic test cases based on your function configuration</li>}
                  {canGenerateTemplates && <li><strong className="text-[#f5f5f4]">Templates:</strong> Language-specific test patterns</li>}
                  <li><strong className="text-[#f5f5f4]">AI Assist:</strong> Generate intelligent test cases using AI</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Show actual errors */}
        {actualErrors.length > 0 && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-3 flex items-start">
            <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5" />
            <div className="text-red-400">
              <strong>Please fix the following issues:</strong>
              <ul className="mb-0 mt-2 list-disc list-inside">
                {actualErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Show warnings separately */}
        {warnings.length > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-lg mb-3 flex items-start">
            <AlertTriangle size={16} className="text-amber-400 mr-2 mt-0.5" />
            <div className="text-amber-400">
              <strong>Suggestions:</strong>
              <ul className="mb-0 mt-2 list-disc list-inside">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning.replace('Warning: ', '')}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form>
          <div className="mb-4">
            <label className="block text-[#a1a1aa] font-semibold mb-2">
              Test Case Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Basic functionality test"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              className={`input w-full ${validationState === 'invalid' && !formData.name.trim() ? 'border-red-500' : ''}`}
            />
            <small className="text-[#6b6b70]">
              Give your test case a descriptive name that explains what it validates
            </small>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-[#a1a1aa] font-semibold mb-2 flex items-center">
                Function Arguments <span className="text-red-400 ml-1">*</span>
                <span className="ml-1 relative group">
                  <HelpCircle size={14} className="text-blue-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg text-sm text-[#a1a1aa] hidden group-hover:block z-10">
                    <strong className="text-[#f5f5f4]">Enter the arguments to pass to your function:</strong>
                    <br />• Single argument: <code className="text-blue-400">5</code> → <code className="text-blue-400">myFunction(5)</code>
                    <br />• Array argument: <code className="text-blue-400">[1, 2, 3]</code> → <code className="text-blue-400">myFunction([1, 2, 3])</code>
                    <br />• String argument: <code className="text-blue-400">"hello"</code> → <code className="text-blue-400">myFunction("hello")</code>
                  </div>
                </span>
              </label>
              <textarea
                rows={3}
                placeholder='[1, 2, 3, 4] or "hello" or 42'
                value={formData.args}
                onChange={(e) => handleFormChange('args', e.target.value)}
                className={`input w-full font-mono text-sm ${validationState === 'invalid' && actualErrors.some(e => e.includes('JSON')) ? 'border-red-500' : ''}`}
              />
              <small className="text-[#6b6b70]">
                Use valid JSON format. For single values, just enter the value directly.
              </small>
            </div>
            <div className="mb-4">
              <label className="block text-[#a1a1aa] font-semibold mb-2 flex items-center">
                Expected Result <span className="text-red-400 ml-1">*</span>
                <span className="ml-1 relative group">
                  <HelpCircle size={14} className="text-blue-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg text-sm text-[#a1a1aa] hidden group-hover:block z-10">
                    <strong className="text-[#f5f5f4]">The expected return value from your function:</strong>
                    <br />• Number: <code className="text-blue-400">42</code>
                    <br />• String: <code className="text-blue-400">"result"</code>
                    <br />• Boolean: <code className="text-blue-400">true</code> or <code className="text-blue-400">false</code>
                    <br />• Array: <code className="text-blue-400">[1, 2, 3]</code>
                  </div>
                </span>
              </label>
              <textarea
                rows={3}
                placeholder='4 or "hello world" or true'
                value={formData.expected}
                onChange={(e) => handleFormChange('expected', e.target.value)}
                className={`input w-full font-mono text-sm ${validationState === 'invalid' && !formData.expected.trim() ? 'border-red-500' : ''}`}
              />
              <small className="text-[#6b6b70]">
                Enter the exact value your function should return for the given arguments.
              </small>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="hidden-checkbox"
                checked={formData.hidden}
                onChange={(e) => handleFormChange('hidden', e.target.checked)}
                className="mr-2 w-4 h-4 rounded border-[#3a3a3e] bg-[#1a1a1e] text-amber-500 focus:ring-amber-500"
              />
              <span className="text-[#a1a1aa]">
                Hidden from students
                <span className="ml-1 relative group inline-block">
                  <HelpCircle size={14} className="text-blue-400 cursor-help inline" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg text-sm text-[#a1a1aa] hidden group-hover:block z-10">
                    <strong className="text-[#f5f5f4]">Hidden test cases:</strong>
                    <br />• Used for final validation but not shown to students
                    <br />• Great for edge cases and security testing
                    <br />• Students see "Test passed" but not the details
                  </div>
                </span>
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={validationState === 'validating'}
            >
              {validationState === 'validating' && <Loader2 size={14} className="mr-1 animate-spin" />}
              {editingIndex !== null ? 'Update Test Case' : 'Add Test Case'}
            </button>
            {editingIndex !== null && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCaseForm;
