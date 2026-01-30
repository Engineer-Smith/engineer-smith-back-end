// src/components/QuestionCreation/components/TestCaseSidebar.tsx - ENHANCED
import React from 'react';
import { CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import type { Language } from '../../../types';

interface CodeConfig {
  entryFunction?: string;
  runtime?: string;
  timeoutMs?: number;
}

interface TestResult {
  index: number;
  passed: boolean;
  error?: string;
}

interface TestSuiteValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TestCaseSidebarProps {
  selectedLanguage?: Language;
  codeConfig?: CodeConfig;
  testResults: TestResult[];
  allTestsPassed: boolean;
  hasTestResults: boolean;
  testSuiteValidation?: TestSuiteValidation;
  requiresRuntime?: boolean;
}

const TestCaseSidebar: React.FC<TestCaseSidebarProps> = ({
  selectedLanguage,
  codeConfig,
  testResults,
  allTestsPassed,
  hasTestResults,
  testSuiteValidation,
  requiresRuntime = false
}) => {
  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;
  const passPercentage = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  const getProgressColor = () => {
    if (allTestsPassed) return 'bg-green-500';
    if (passPercentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="lg:col-span-1">
      {/* Function Context */}
      <div className="card border-blue-500/50 mb-4">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <h6 className="text-blue-400 font-semibold mb-0 mr-2">Function Context</h6>
            {requiresRuntime && (
              <span className="badge-blue text-xs">Runtime Required</span>
            )}
          </div>
          <div className="text-sm">
            <div className="mb-2">
              <strong className="text-[#a1a1aa]">Language:</strong>
              <span className="ml-1 text-[#f5f5f4] capitalize">{selectedLanguage || 'Not selected'}</span>
            </div>
            {codeConfig?.entryFunction && (
              <div className="mb-2">
                <strong className="text-[#a1a1aa]">Function:</strong>
                <code className="ml-1 bg-[#1a1a1e] px-1 rounded text-[#f5f5f4]">{codeConfig.entryFunction}</code>
              </div>
            )}
            <div className="mb-2">
              <strong className="text-[#a1a1aa]">Runtime:</strong>
              <span className="ml-1 text-[#f5f5f4]">{codeConfig?.runtime || 'node'}</span>
              {!codeConfig?.runtime && requiresRuntime && (
                <span className="badge-amber ml-2 text-xs">Not Set</span>
              )}
            </div>
            <div className="mb-2 flex items-center">
              <strong className="text-[#a1a1aa]">Timeout:</strong>
              <span className="ml-1 text-[#f5f5f4]">{codeConfig?.timeoutMs || 3000}ms</span>
              <Clock size={12} className="ml-1 text-[#6b6b70]" />
            </div>

            {/* Configuration Status */}
            <div className="mt-3 pt-2 border-t border-[#2a2a2e]">
              <div className="flex items-center">
                <strong className="mr-2 text-[#a1a1aa]">Status:</strong>
                {codeConfig?.entryFunction && (requiresRuntime ? codeConfig?.runtime : true) ? (
                  <span className="badge-green flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    Ready
                  </span>
                ) : (
                  <span className="badge-amber flex items-center">
                    <AlertTriangle size={12} className="mr-1" />
                    Setup Needed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Suite Validation */}
      {testSuiteValidation && (
        <div className="card mb-4">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <h6 className="font-semibold text-[#f5f5f4] mb-0 mr-2">Test Suite Validation</h6>
              <span className={testSuiteValidation.isValid ? 'badge-green' : 'badge-amber'}>
                {testSuiteValidation.isValid ? "Valid" : "Issues"}
              </span>
            </div>

            {!testSuiteValidation.isValid && testSuiteValidation.errors.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-sm mb-2">
                <div className="flex items-center text-red-400 mb-1">
                  <AlertTriangle size={14} className="mr-1" />
                  <strong>Errors:</strong>
                </div>
                <ul className="mb-0 mt-1 space-y-1 list-disc list-inside text-red-400">
                  {testSuiteValidation.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {testSuiteValidation.errors.length > 3 && (
                    <li>... and {testSuiteValidation.errors.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}

            {testSuiteValidation.warnings.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-sm">
                <div className="flex items-center text-amber-400 mb-1">
                  <AlertTriangle size={14} className="mr-1" />
                  <strong>Warnings:</strong>
                </div>
                <ul className="mb-0 mt-1 space-y-1 list-disc list-inside text-amber-400">
                  {testSuiteValidation.warnings.slice(0, 2).map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                  {testSuiteValidation.warnings.length > 2 && (
                    <li>... and {testSuiteValidation.warnings.length - 2} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Results - Enhanced */}
      {hasTestResults && (
        <div className="card mb-4">
          <div className="p-4">
            <h6 className="font-semibold text-[#f5f5f4] mb-3">Test Results</h6>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className={`${allTestsPassed ? 'badge-green' : passPercentage >= 50 ? 'badge-amber' : 'badge-red'}`}>
                  {passedCount} / {totalCount} Passed
                </span>
                <span className="text-sm text-[#6b6b70]">
                  {Math.round(passPercentage)}%
                </span>
              </div>
              <div className="progress-bar h-1.5 mb-2">
                <div
                  className={`h-full ${getProgressColor()}`}
                  style={{ width: `${passPercentage}%` }}
                />
              </div>
              <div className="text-sm text-[#6b6b70]">
                {allTestsPassed ? 'All tests passing!' :
                 passPercentage >= 50 ? 'Most tests passing' : 'Many tests failing'}
              </div>
            </div>

            {/* Individual Test Results */}
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm text-[#a1a1aa]">Test {index + 1}</span>
                  <div className="flex items-center">
                    <span className={`${result.passed ? 'badge-green' : 'badge-red'} text-xs`}>
                      {result.passed ? "Pass" : "Fail"}
                    </span>
                    {result.error && (
                      <span title={result.error} className="inline-flex">
                        <AlertTriangle size={12} className="ml-1 text-red-400" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            {totalCount > 0 && (
              <div className="mt-3 pt-2 border-t border-[#2a2a2e] text-sm text-[#6b6b70]">
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className={allTestsPassed ? 'text-green-400' : passPercentage >= 50 ? 'text-amber-400' : 'text-red-400'}>
                    {Math.round(passPercentage)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Help Card */}
      <div className="card border-cyan-500/50">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <h6 className="text-cyan-400 font-semibold mb-0 mr-2">Test Case Tips</h6>
            <Zap size={16} className="text-cyan-400" />
          </div>

          <div className="text-sm">
            <div className="mb-3">
              <strong className="text-[#a1a1aa]">Essential Test Types:</strong>
              <ul className="mb-0 mt-1 space-y-1 text-[#6b6b70]">
                <li>✅ <strong className="text-[#a1a1aa]">Basic cases:</strong> Normal, expected inputs</li>
                <li>🔍 <strong className="text-[#a1a1aa]">Edge cases:</strong> Empty arrays, null values, boundaries</li>
                <li>🔒 <strong className="text-[#a1a1aa]">Hidden cases:</strong> Comprehensive validation</li>
                <li>⚡ <strong className="text-[#a1a1aa]">Performance:</strong> Large inputs, timeouts</li>
              </ul>
            </div>

            <div className="mb-3">
              <strong className="text-[#a1a1aa]">Best Practices:</strong>
              <ul className="mb-0 mt-1 space-y-1 text-[#6b6b70]">
                <li>Start with 3-5 test cases</li>
                <li>Make at least one visible to students</li>
                <li>Test both success and error paths</li>
                <li>Use descriptive names and descriptions</li>
              </ul>
            </div>

            {/* Language-specific tips */}
            {selectedLanguage && (
              <div>
                <strong className="text-[#a1a1aa]">Tips for {selectedLanguage}:</strong>
                <ul className="mb-0 mt-1 space-y-1 text-[#6b6b70]">
                  {selectedLanguage === 'javascript' && (
                    <>
                      <li>Test with different data types</li>
                      <li>Consider undefined/null handling</li>
                    </>
                  )}
                  {selectedLanguage === 'python' && (
                    <>
                      <li>Test with different iterable types</li>
                      <li>Consider None value handling</li>
                    </>
                  )}
                  {selectedLanguage === 'sql' && (
                    <>
                      <li>Test with empty result sets</li>
                      <li>Validate column names and types</li>
                    </>
                  )}
                  {!['javascript', 'python', 'sql'].includes(selectedLanguage) && (
                    <li>Consider language-specific edge cases</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCaseSidebar;
