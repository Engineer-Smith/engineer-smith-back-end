// src/components/QuestionCreation/components/TestCasesList.tsx - UPDATED
import React from 'react';
import { Trash2, Eye, EyeOff, Play, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import type { TestCase } from '../../../types';

interface TestCasesListProps {
  testCases: TestCase[];
  testResults: Array<{
    index: number;
    passed: boolean;
    error?: string;
  }>;
  showHiddenTestCases: boolean;
  onToggleHidden: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onRunTests: () => void;
  onEditSolution: () => void;
  isTesting: boolean;
  hasSolutionCode: boolean;
  formatTestCase?: (testCase: TestCase, index: number) => string;
}

const TestCasesList: React.FC<TestCasesListProps> = ({
  testCases,
  testResults,
  showHiddenTestCases,
  onToggleHidden,
  onEdit,
  onRemove,
  onRunTests,
  onEditSolution,
  isTesting,
  hasSolutionCode,
  formatTestCase
}) => {
  if (testCases.length === 0) {
    return null;
  }

  const getFormattedDisplay = (testCase: TestCase, index: number): string => {
    if (formatTestCase) {
      return formatTestCase(testCase, index);
    }
    const args = Array.isArray(testCase.args)
      ? testCase.args.map((arg: any) => JSON.stringify(arg)).join(', ')
      : JSON.stringify(testCase.args);
    const expected = JSON.stringify(testCase.expected);
    return `Test ${index + 1}: f(${args}) → ${expected}`;
  };

  const visibleCount = testCases.filter(tc => !tc.hidden).length;
  const hiddenCount = testCases.length - visibleCount;
  const passedCount = testResults.filter(r => r.passed).length;

  return (
    <div className="card">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h6 className="font-semibold text-[#f5f5f4] mb-0">Test Cases ({testCases.length})</h6>
            <div className="text-sm text-[#6b6b70]">
              {visibleCount} visible • {hiddenCount} hidden
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-sm"
              onClick={onToggleHidden}
            >
              {showHiddenTestCases ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="ml-1">{showHiddenTestCases ? 'Hide' : 'Show'} Hidden</span>
            </button>
            <button
              className="btn-primary text-sm bg-green-600 hover:bg-green-700 border-green-600"
              onClick={onRunTests}
              disabled={isTesting || testCases.length === 0}
            >
              {isTesting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Play size={14} className="mr-1" />}
              Run Tests
            </button>
            <button
              className="btn-secondary text-sm border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              onClick={onEditSolution}
            >
              <Lock size={14} className="mr-1" />
              {hasSolutionCode ? 'Edit Solution' : 'Add Solution'}
            </button>
          </div>
        </div>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <div className={`p-3 rounded-lg border mb-3 flex items-center ${
            passedCount === testCases.length
              ? 'bg-green-500/10 border-green-500/25'
              : 'bg-amber-500/10 border-amber-500/25'
          }`}>
            <div className="mr-2 text-lg">
              {passedCount === testCases.length ? "✅" : "⚠️"}
            </div>
            <div>
              <strong className={passedCount === testCases.length ? 'text-green-400' : 'text-amber-400'}>
                Test Results:
              </strong>{' '}
              <span className={passedCount === testCases.length ? 'text-green-400' : 'text-amber-400'}>
                {passedCount} of {testCases.length} tests passing
              </span>
              {passedCount < testCases.length && (
                <div className="text-sm mt-1 text-amber-400/80">
                  Review failed tests and update your solution code
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {testCases.map((testCase, index) => {
            if (testCase.hidden && !showHiddenTestCases) return null;

            const testResult = testResults[index];

            return (
              <div key={index} className="card border-[#3a3a3e]">
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={testCase.hidden ? 'badge-gray' : 'badge-blue'}>
                        Test {index + 1}
                      </span>
                      <h6 className="font-semibold text-[#f5f5f4] mb-0">{testCase.name || `Test Case ${index + 1}`}</h6>
                      {testCase.hidden && (
                        <span className="badge-gray text-xs">Hidden</span>
                      )}
                      {testResult && (
                        <span className={testResult.passed ? 'badge-green' : 'badge-red'}>
                          {testResult.passed ? "✓ Pass" : "✗ Fail"}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn-secondary text-sm"
                        onClick={() => onEdit(index)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger text-sm"
                        onClick={() => onRemove(index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Show formatted display if available */}
                  {formatTestCase && (
                    <div className="mb-2">
                      <div className="text-sm text-[#6b6b70]">
                        <strong>Function Call:</strong>
                      </div>
                      <code className="bg-[#1a1a1e] px-2 py-1 rounded block text-sm text-[#a1a1aa] mt-1">
                        {getFormattedDisplay(testCase, index)}
                      </code>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-[#a1a1aa]">Input:</strong>
                      <pre className="bg-[#1a1a1e] p-2 mb-0 mt-1 rounded text-sm text-[#a1a1aa] overflow-auto">
                        {JSON.stringify(testCase.args, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <strong className="text-[#a1a1aa]">Expected:</strong>
                      <pre className="bg-[#1a1a1e] p-2 mb-0 mt-1 rounded text-sm text-[#a1a1aa] overflow-auto">
                        {JSON.stringify(testCase.expected, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Error display */}
                  {testResult && !testResult.passed && testResult.error && (
                    <div className="mt-2 pt-2 border-t border-[#2a2a2e]">
                      <div className="flex items-center text-red-400 text-sm">
                        <AlertTriangle size={12} className="mr-1" />
                        <strong>Error:</strong>
                      </div>
                      <div className="text-[#6b6b70] mt-1 text-xs">
                        {testResult.error.length > 100
                          ? `${testResult.error.substring(0, 100)}...`
                          : testResult.error
                        }
                      </div>
                    </div>
                  )}

                  {/* Test case status */}
                  <div className="mt-2 pt-2 border-t border-[#2a2a2e] flex justify-between items-center text-sm text-[#6b6b70]">
                    <div>
                      Type: {testCase.hidden ? 'Hidden validation' : 'Visible example'}
                    </div>
                    <div>
                      Status: {testResult ?
                        (testResult.passed ?
                          <span className="text-green-400">Passing</span> :
                          <span className="text-red-400">Failing</span>
                        ) :
                        <span className="text-[#6b6b70]">Not tested</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state when all test cases are hidden */}
        {testCases.length > 0 && testCases.every(tc => tc.hidden) && !showHiddenTestCases && (
          <div className="p-6 bg-blue-500/10 border border-blue-500/25 rounded-lg text-center">
            <Eye size={24} className="mx-auto mb-2 text-blue-400" />
            <h6 className="font-semibold text-blue-400">All test cases are hidden</h6>
            <p className="text-[#a1a1aa] mb-2">Click "Show Hidden" to view and edit your test cases.</p>
            <button className="btn-secondary text-sm" onClick={onToggleHidden}>
              <Eye size={14} className="mr-1" />
              Show Hidden Test Cases
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCasesList;
