import React, { useState } from 'react';
import {
  Play,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Terminal,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { isSecurityRejection, getSecurityErrorMessage } from '../../../utils/errorMessages';

interface TestResult {
  testName: string;
  testCaseIndex: number;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTime: number;
  consoleLogs: any[];
  error: string | null;
}

interface TestResults {
  success: boolean;
  testResults: TestResult[];
  overallPassed: boolean;
  totalTestsPassed: number;
  totalTests: number;
  consoleLogs: any[];
  executionError: string | null;
  compilationError: string | null;
  message?: string;
  testType?: string;
}

interface ChallengeTestResultsPaneProps {
  testResults: TestResults | null;
  isRunning: boolean;
  isSubmitting: boolean;
  onRunTests: () => void;
  onSubmit: () => void;
  hasTestedCode: boolean;
}

const ChallengeTestResultsPane: React.FC<ChallengeTestResultsPaneProps> = ({
  testResults,
  isRunning,
  isSubmitting,
  onRunTests,
  onSubmit,
  hasTestedCode
}) => {
  const [expandedTests, setExpandedTests] = useState<Record<number, boolean>>({});
  const [showConsole, setShowConsole] = useState(false);

  const toggleTest = (index: number) => {
    setExpandedTests(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatOutput = (output: any) => {
    if (output === null || output === undefined) return 'null';
    if (typeof output === 'object') return JSON.stringify(output, null, 2);
    return String(output);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2e] bg-[#0a0a0b]">
        <button
          onClick={onRunTests}
          disabled={isRunning || isSubmitting}
          className="btn-secondary flex items-center gap-2 text-sm flex-1"
        >
          {isRunning ? (
            <>
              <div className="spinner w-4 h-4" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Tests
            </>
          )}
        </button>
        <button
          onClick={onSubmit}
          disabled={isRunning || isSubmitting}
          className="btn-primary flex items-center gap-2 text-sm flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="spinner w-4 h-4" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit
            </>
          )}
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {!testResults && !isRunning && (
          <div className="text-center py-8">
            <Terminal className="w-12 h-12 text-[#3a3a3f] mx-auto mb-3" />
            <p className="text-[#6b6b70] text-sm">
              Run tests to see results
            </p>
            <p className="text-[#3a3a3f] text-xs mt-1">
              Click "Run Tests" to test against sample cases
            </p>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-8">
            <div className="spinner w-8 h-8 mx-auto mb-3" />
            <p className="text-[#a1a1aa] text-sm">Running tests...</p>
          </div>
        )}

        {testResults && !isRunning && (
          <div className="space-y-4">
            {/* Summary */}
            <div className={`p-4 rounded-lg border ${
              testResults.overallPassed
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center gap-2">
                {testResults.overallPassed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-medium ${
                  testResults.overallPassed ? 'text-green-400' : 'text-red-400'
                }`}>
                  {testResults.overallPassed ? 'All Tests Passed!' : 'Some Tests Failed'}
                </span>
              </div>
              <p className="text-sm text-[#a1a1aa] mt-1">
                {testResults.totalTestsPassed}/{testResults.totalTests} test cases passed
                {testResults.testType === 'sample_tests' && (
                  <span className="text-[#6b6b70]"> (sample tests only)</span>
                )}
              </p>
            </div>

            {/* Compilation/Execution Errors */}
            {testResults.compilationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Compilation Error</span>
                </div>
                <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap overflow-x-auto">
                  {testResults.compilationError}
                </pre>
              </div>
            )}

            {testResults.executionError && (
              isSecurityRejection(testResults.executionError) ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Code Not Allowed</span>
                  </div>
                  <p className="text-sm text-amber-300">
                    {getSecurityErrorMessage()}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Runtime Error</span>
                  </div>
                  <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap overflow-x-auto">
                    {testResults.executionError}
                  </pre>
                </div>
              )
            )}

            {/* Individual Test Results */}
            {testResults.testResults && testResults.testResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[#f5f5f4]">Test Cases</h4>
                {testResults.testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg overflow-hidden ${
                      result.passed
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-red-500/20 bg-red-500/5'
                    }`}
                  >
                    <button
                      onClick={() => toggleTest(index)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        {result.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-sm text-[#f5f5f4]">
                          {result.testName || `Test Case ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6b6b70] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {result.executionTime}ms
                        </span>
                        {expandedTests[index] ? (
                          <ChevronDown className="w-4 h-4 text-[#6b6b70]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#6b6b70]" />
                        )}
                      </div>
                    </button>

                    {expandedTests[index] && (
                      <div className="px-3 pb-3 space-y-2 text-xs">
                        <div>
                          <span className="text-[#6b6b70]">Expected:</span>
                          <pre className="mt-1 p-2 bg-[#0a0a0b] rounded font-mono text-green-400 overflow-x-auto">
                            {formatOutput(result.expectedOutput)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[#6b6b70]">Actual:</span>
                          <pre className={`mt-1 p-2 bg-[#0a0a0b] rounded font-mono overflow-x-auto ${
                            result.passed ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatOutput(result.actualOutput)}
                          </pre>
                        </div>
                        {result.error && (
                          <div>
                            <span className="text-[#6b6b70]">Error:</span>
                            <pre className="mt-1 p-2 bg-[#0a0a0b] rounded font-mono text-red-400 overflow-x-auto">
                              {result.error}
                            </pre>
                          </div>
                        )}
                        {result.consoleLogs && result.consoleLogs.length > 0 && (
                          <div>
                            <span className="text-[#6b6b70]">Console Output:</span>
                            <pre className="mt-1 p-2 bg-[#0a0a0b] rounded font-mono text-[#a1a1aa] overflow-x-auto">
                              {result.consoleLogs.join('\n')}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Console Logs */}
            {testResults.consoleLogs && testResults.consoleLogs.length > 0 && (
              <div>
                <button
                  onClick={() => setShowConsole(!showConsole)}
                  className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4]"
                >
                  <Terminal className="w-4 h-4" />
                  Console Output ({testResults.consoleLogs.length})
                  {showConsole ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {showConsole && (
                  <pre className="mt-2 p-3 bg-[#0a0a0b] rounded-lg font-mono text-xs text-[#a1a1aa] overflow-x-auto">
                    {testResults.consoleLogs.join('\n')}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warning for unsubmitted code */}
      {hasTestedCode && testResults?.overallPassed && (
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Tests passed! Click Submit to save your solution.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChallengeTestResultsPane;
