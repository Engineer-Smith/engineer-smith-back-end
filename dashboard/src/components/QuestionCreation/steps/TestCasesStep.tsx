// src/components/QuestionCreation/steps/TestCasesStep.tsx - Fixed for backend compatibility
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';
import type { TestCase } from '../../../types';

// Import modular components
import SolutionCodeModal from '../components/SolutionCodeModal';
import TestCaseForm from '../components/TestCaseForm';
import TestCaseSidebar from '../components/TestCaseSidebar';
import TestCasesList from '../components/TestCasesList';

// Updated interface to match backend schema
interface TestCaseFormData {
  name: string;
  args: string;
  expected: string;
  hidden: boolean;
  // Removed: description, points, id
}

const TestCasesStep: React.FC = () => {
  const {
    state,
    addTestCase,
    updateTestCase,
    removeTestCase,
    validateTestCases,
    generatePrompt,
    isTesting,
    validateTestSuite,
    generateTestCaseSuggestions,
    getTestCaseTemplates,
    formatTestCaseDisplay,
    formatTestSuitePreview,
    requiresTestCases: contextRequiresTestCases,
    requiresRuntime,
  } = useQuestionCreation();

  const [showHiddenTestCases, setShowHiddenTestCases] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TestCaseFormData>({
    name: '',
    args: '',
    expected: '',
    hidden: false
    // Removed: description, points
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [solutionCode, setSolutionCode] = useState<string>('');
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  const [testSuiteValidation, setTestSuiteValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });

  const {
    selectedQuestionType,
    selectedCategory,
    selectedLanguage,
    questionData,
    testCases,
    testCaseValidation,
    promptGeneration
  } = state;

  const requiresTestCases = contextRequiresTestCases ||
    (selectedQuestionType === 'codeChallenge' && selectedCategory === 'logic');
  const showTestCases = ['codeChallenge', 'codeDebugging'].includes(selectedQuestionType || '');

  useEffect(() => {
    if (testCases.length > 0 && questionData.codeConfig && selectedLanguage) {
      const suiteValidation = validateTestSuite();
      setTestSuiteValidation({
        isValid: suiteValidation.isValid,
        errors: suiteValidation.errors,
        warnings: suiteValidation.warnings
      });
    } else {
      setTestSuiteValidation({ isValid: true, errors: [], warnings: [] });
    }
  }, [testCases, questionData.codeConfig, selectedLanguage, validateTestSuite]);

  useEffect(() => {
    validateStep();
  }, [testCases, selectedQuestionType, selectedCategory, testSuiteValidation]);

  useEffect(() => {
    if (showSolutionModal && !solutionCode.trim()) {
      const template = questionData.codeTemplate || getDefaultTemplate();
      setSolutionCode(template);
    }
  }, [showSolutionModal]);

  const validateStep = () => {
    const errors: string[] = [];

    if (requiresTestCases && testCases.length === 0) {
      errors.push('At least one test case is required for logic challenges');
    }

    if (testCases.length > 0 && testCases.every(tc => tc.hidden)) {
      errors.push('At least one test case should be visible to students');
    }

    if (!testSuiteValidation.isValid) {
      errors.push(...testSuiteValidation.errors);
    }

    setValidationErrors(errors);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      args: '',
      expected: '',
      hidden: false
      // Removed: description, points
    });
    setEditingIndex(null);
  };

  const handleFormChange = (field: keyof TestCaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateFormData = (): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Test case name is required');
    }

    if (formData.args.trim()) {
      try {
        JSON.parse(formData.args);
      } catch (e) {
        errors.push('Arguments must be valid JSON (e.g., [1, 2, 3], "hello", or 42)');
      }
    }

    if (!formData.expected.trim()) {
      errors.push('Expected result is required');
    }

    return errors;
  };

  const handleSaveTestCase = () => {
    const formErrors = validateFormData();

    if (formErrors.length > 0) {
      setValidationErrors(formErrors);
      return;
    }

    try {
      let parsedArgs;
      if (!formData.args.trim()) {
        parsedArgs = [];
      } else {
        parsedArgs = JSON.parse(formData.args);
        // Ensure args is always an array
        if (!Array.isArray(parsedArgs)) {
          parsedArgs = [parsedArgs];
        }
      }

      // Create backend-compatible TestCase
      const testCase: TestCase = {
        name: formData.name,
        args: parsedArgs,
        expected: parseExpected(formData.expected),
        hidden: formData.hidden
        // Removed: id, description, points
      };

      if (editingIndex !== null) {
        updateTestCase(editingIndex, testCase);
      } else {
        addTestCase(testCase);
      }

      resetForm();
      setValidationErrors([]);
    } catch (error) {
      console.error('Save failed:', error);
      setValidationErrors(['Failed to save test case. Check your JSON formatting.']);
    }
  };

  const parseExpected = (expected: string): any => {
    try {
      return JSON.parse(expected);
    } catch {
      return expected;
    }
  };

  const handleEditTestCase = (index: number) => {
    const testCase = testCases[index];
    const argsToEdit = testCase.args.length === 1 ? testCase.args[0] : testCase.args;

    setFormData({
      name: testCase.name || '',
      args: JSON.stringify(argsToEdit, null, 2),
      expected: typeof testCase.expected === 'string'
        ? testCase.expected
        : JSON.stringify(testCase.expected, null, 2),
      hidden: testCase.hidden || false
      // Removed: description, points
    });
    setEditingIndex(index);
  };

  const handleRemoveTestCase = (index: number) => {
    removeTestCase(index);
    if (editingIndex === index) {
      resetForm();
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleRunTests = async () => {
    if (!solutionCode.trim()) {
      setShowSolutionModal(true);
      return;
    }
    await validateTestCases(solutionCode);
  };

  const generateSampleTestCases = () => {
    const { entryFunction } = questionData.codeConfig || {};

    if (!entryFunction) {
      setValidationErrors(['Entry function name is required to generate sample test cases']);
      return;
    }

    if (questionData.codeConfig && selectedLanguage) {
      const suggestions = generateTestCaseSuggestions();
      if (suggestions && suggestions.length > 0) {
        suggestions.forEach(testCase => addTestCase(testCase));
        return;
      }
    }

    // Fallback samples with backend-compatible structure
    const samples: TestCase[] = [
      {
        name: 'Basic functionality test',
        args: [1, 2, 3, 4],
        expected: 4,
        hidden: false
      },
      {
        name: 'Different array test',
        args: [1, 2, 3, 4, 5, 6],
        expected: 6,
        hidden: false
      },
      {
        name: 'Edge case - single element',
        args: [42],
        expected: 42,
        hidden: true
      }
    ];

    samples.forEach(testCase => addTestCase(testCase));
  };

  const generateTemplateBasedTestCases = () => {
    if (!selectedLanguage) return;

    const templates = getTestCaseTemplates('algorithm');
    templates.slice(0, 3).forEach(template => {
      const testCase: TestCase = {
        name: template.name,
        args: Array.isArray(template.args) ? template.args : [template.args],
        expected: template.expected,
        hidden: false
        // Removed: id, description, points
      };
      addTestCase(testCase);
    });
  };

  const getDefaultTemplate = (): string => {
    const functionName = questionData.codeConfig?.entryFunction || 'solution';

    switch (selectedLanguage) {
      case 'python':
        return `def ${functionName}(${getFunctionParameters()}):
    """
    TODO: Implement the function logic here
    """
    # Your implementation here
    pass`;

      case 'javascript':
      case 'typescript':
      case 'react':
      case 'reactNative':
      case 'express':
        return `function ${functionName}(${getFunctionParameters()}) {
    // TODO: Implement the function logic here
    // Your implementation here

}`;

      case 'dart':
      case 'flutter':
        return `${getReturnType()} ${functionName}(${getFunctionParameters()}) {
    // TODO: Implement the function logic here
    // Your implementation here

}`;

      default:
        return `function ${functionName}(${getFunctionParameters()}) {
    // TODO: Implement the function logic here
    // Your implementation here

}`;
    }
  };

  const getFunctionParameters = (): string => {
    if (testCases.length > 0 && testCases[0].args.length > 0) {
      const paramCount = testCases[0].args.length;
      if (paramCount === 1) {
        const firstArg = testCases[0].args[0];
        if (Array.isArray(firstArg)) {
          return 'arr';
        } else if (typeof firstArg === 'string') {
          return 'str';
        } else if (typeof firstArg === 'number') {
          return 'num';
        }
        return 'input';
      } else {
        const params = [];
        for (let i = 0; i < paramCount; i++) {
          params.push(`param${i + 1}`);
        }
        return params.join(', ');
      }
    }
    return 'input';
  };

  const getReturnType = (): string => {
    if (testCases.length > 0) {
      const expected = testCases[0].expected;
      if (typeof expected === 'number') {
        return selectedLanguage === 'dart' || selectedLanguage === 'flutter' ? 'int' : 'number';
      }
      if (typeof expected === 'string') {
        return selectedLanguage === 'dart' || selectedLanguage === 'flutter' ? 'String' : 'string';
      }
      if (typeof expected === 'boolean') {
        return 'bool';
      }
      if (Array.isArray(expected)) {
        return selectedLanguage === 'dart' || selectedLanguage === 'flutter' ? 'List<int>' : 'Array';
      }
    }
    return selectedLanguage === 'dart' || selectedLanguage === 'flutter' ? 'dynamic' : 'any';
  };

  const getTestCasesSummary = () => {
    const total = testCases.length;
    const visible = testCases.filter(tc => !tc.hidden).length;
    const hidden = total - visible;
    return { total, visible, hidden };
  };

  // Skip this step for non-code questions
  if (!showTestCases) {
    return (
      <div className="test-cases-step">
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg text-center">
          <HelpCircle size={24} className="text-blue-400 mx-auto mb-2" />
          <h6 className="font-semibold text-[#f5f5f4]">Test Cases Not Required</h6>
          <p className="mb-0 text-[#a1a1aa]">
            Test cases are only needed for code challenges and debugging questions.
            Your {selectedQuestionType} question is ready for the next step.
          </p>
        </div>
      </div>
    );
  }

  const summary = getTestCasesSummary();

  return (
    <div className="test-cases-step">
      {/* Progress and Summary */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <small className="text-[#6b6b70]">Test Cases</small>
          <small className="text-[#6b6b70]">
            {summary.total} test case{summary.total !== 1 ? 's' : ''}
          </small>
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="badge-blue">{summary.visible} visible</span>
          <span className="badge-gray">{summary.hidden} hidden</span>
          {requiresTestCases && summary.total === 0 && (
            <span className="badge-red">Required</span>
          )}
          {testSuiteValidation.isValid ? (
            <span className="badge-green">Valid Suite</span>
          ) : (
            <span className="badge-amber">Needs Validation</span>
          )}
        </div>
      </div>

      {/* Display test suite validation warnings */}
      {testSuiteValidation.warnings.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-lg mb-3 flex items-start">
          <AlertTriangle size={16} className="text-amber-400 mr-2 mt-0.5" />
          <div className="text-amber-400">
            <strong>Test Suite Warnings:</strong>
            <ul className="mb-0 mt-2 list-disc list-inside">
              {testSuiteValidation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Form and List */}
        <div className="lg:col-span-2">
          <TestCaseForm
            editingIndex={editingIndex}
            formData={formData}
            onFormChange={handleFormChange}
            onSave={handleSaveTestCase}
            onCancel={resetForm}
            onGenerateSamples={generateSampleTestCases}
            onGeneratePrompt={() => generatePrompt()}
            validationErrors={[]}
            canGenerateSamples={testCases.length === 0 && !!questionData.codeConfig?.entryFunction}
            isGeneratingPrompt={promptGeneration.isGenerating}
            onGenerateTemplates={generateTemplateBasedTestCases}
            canGenerateTemplates={testCases.length === 0 && !!selectedLanguage}
            selectedLanguage={selectedLanguage}
            selectedCategory={selectedCategory}
            codeConfig={questionData.codeConfig}
          />

          <TestCasesList
            testCases={testCases}
            testResults={testCaseValidation.results || []}
            showHiddenTestCases={showHiddenTestCases}
            onToggleHidden={() => setShowHiddenTestCases(!showHiddenTestCases)}
            onEdit={handleEditTestCase}
            onRemove={handleRemoveTestCase}
            onRunTests={handleRunTests}
            onEditSolution={() => setShowSolutionModal(true)}
            isTesting={isTesting}
            hasSolutionCode={!!solutionCode}
            formatTestCase={formatTestCaseDisplay}
          />
        </div>

        {/* Right Column - Sidebar */}
        <TestCaseSidebar
          selectedLanguage={selectedLanguage}
          codeConfig={questionData.codeConfig}
          testResults={testCaseValidation.results || []}
          allTestsPassed={testCaseValidation.allPassed}
          hasTestResults={testCaseValidation.results.length > 0}
          testSuiteValidation={testSuiteValidation}
          requiresRuntime={requiresRuntime}
        />
      </div>

      {/* Completion Status */}
      {testCases.length > 0 && validationErrors.length === 0 && testSuiteValidation.isValid && (
        <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-lg mt-4 flex items-start">
          <CheckCircle size={16} className="text-green-400 mr-2 mt-0.5" />
          <div className="text-green-400">
            Test cases are configured and ready! You have {summary.total} test case{summary.total !== 1 ? 's' : ''}.

            <details className="mt-2">
              <summary className="font-bold cursor-pointer">Preview Test Suite</summary>
              <pre className="mt-2 mb-0 text-sm bg-[#1a1a1e] p-2 rounded overflow-x-auto">
                {formatTestSuitePreview()}
              </pre>
            </details>
          </div>
        </div>
      )}

      {/* Solution Code Modal */}
      <SolutionCodeModal
        isOpen={showSolutionModal}
        onToggle={() => setShowSolutionModal(false)}
        solutionCode={solutionCode}
        onSolutionCodeChange={setSolutionCode}
        onSaveAndRunTests={handleRunTests}
        expectedResult={testCases.length > 0 ? testCases[0].expected : null}
      />
    </div>
  );
};

export default TestCasesStep;
