// components/TestSessions/CodeTestingComponent.tsx - Updated for session-based code testing
import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Clock, Code, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import apiService from '../../services/ApiService';
import { isSecurityRejection, getSecurityErrorMessage } from '../../utils/errorMessages';

// Response type from the new endpoint
interface SessionTestResult {
    success: boolean;
    testResults: Array<{
        testName: string;
        passed: boolean;
        input: any[];
        expected: any;
        actual: any;
        error: string | null;
        executionTime: number;
    }>;
    visiblePassed: number;
    visibleTotal: number;
    hasHiddenTests: boolean;
    consoleLogs: string[];
    executionError: string | null;
    compilationError: string | null;
}

interface CodeTestingComponentProps {
    sessionId: string;
    question: {
        questionIndex: number;
        questionData: {
            title: string;
            description: string;
            type: 'multipleChoice' | 'trueFalse' | 'codeChallenge' | 'fillInTheBlank' | 'codeDebugging' | 'dragDropCloze';
            language?: string;
            category?: 'logic' | 'ui' | 'syntax';
            difficulty: 'easy' | 'medium' | 'hard';
            tags?: string[];
            points: number;
            options?: string[];
            correctAnswer?: any;
            codeTemplate?: string;
            blanks?: Array<{
                id: string;
                hint?: string;
                points: number;
            }>;
            dragOptions?: Array<{
                id: string;
                text: string;
            }>;
            buggyCode?: string;
            testCases?: Array<{
                name?: string;
                args: any[];
                expected?: any;
                hidden?: boolean;
            }>;
            codeConfig?: {
                runtime: string;
                entryFunction: string;
                timeoutMs: number;
            };
        };
        [key: string]: any;
    };
    studentCode: string;
}

const CodeTestingComponent: React.FC<CodeTestingComponentProps> = ({
    sessionId,
    question,
    studentCode
}) => {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<SessionTestResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());

    // Reset when question changes
    useEffect(() => {
        setTestResult(null);
        setError(null);
        setExpandedTests(new Set());
    }, [question.questionIndex]);

    // Reset when student code is cleared
    useEffect(() => {
        if (!studentCode.trim()) {
            setTestResult(null);
            setError(null);
            setExpandedTests(new Set());
        }
    }, [studentCode]);

    const handleTestCode = async () => {
        if (!studentCode.trim()) {
            setError('Please write some code before testing');
            return;
        }

        if (!sessionId) {
            setError('No active session');
            return;
        }

        try {
            setTesting(true);
            setError(null);

            // Use the new session-based endpoint
            const result = await apiService.runSessionCode(
                sessionId,
                studentCode,
                question.questionIndex
            );

            setTestResult(result);

            // Auto-expand failed tests for debugging
            if (result.testResults) {
                const failedTests = new Set<number>(
                    result.testResults
                        .map((test, index) => !test.passed ? index : -1)
                        .filter(index => index !== -1)
                );
                setExpandedTests(failedTests);
            }

        } catch (err: any) {
            console.error('Code testing failed:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to test code';
            setError(errorMessage);
        } finally {
            setTesting(false);
        }
    };

    const toggleTestExpansion = (index: number) => {
        const newExpanded = new Set(expandedTests);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTests(newExpanded);
    };

    const getSuccessRate = () => {
        if (!testResult || testResult.visibleTotal === 0) return 0;
        return (testResult.visiblePassed / testResult.visibleTotal) * 100;
    };

    const getSuccessColor = () => {
        const rate = getSuccessRate();
        if (rate >= 80) return 'bg-green-500';
        if (rate >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const formatValue = (value: any): string => {
        if (typeof value === 'string') return `"${value}"`;
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';
        return JSON.stringify(value);
    };

    const formatInput = (input: any[]): string => {
        if (!input || input.length === 0) return '()';
        return `(${input.map(formatValue).join(', ')})`;
    };

    // Render test results from the new API response
    const renderTestResults = () => {
        if (!testResult || !testResult.testResults || testResult.testResults.length === 0) {
            return (
                <div className="text-center text-[#6b6b70] py-4">
                    <Code className="mb-2 mx-auto" style={{ width: '20px', height: '20px' }} />
                    <div className="text-sm">Run tests to see results</div>
                </div>
            );
        }

        return testResult.testResults.map((result, index) => {
            const isExpanded = expandedTests.has(index);

            return (
                <div
                    key={index}
                    className={`mb-2 border rounded ${
                        result.passed
                            ? 'border-green-500/50'
                            : 'border-red-500/50'
                    }`}
                >
                    <div className="p-3">
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleTestExpansion(index)}
                        >
                            <div className="flex items-center gap-2">
                                {isExpanded ? (
                                    <ChevronDown size={14} className="text-[#6b6b70]" />
                                ) : (
                                    <ChevronRight size={14} className="text-[#6b6b70]" />
                                )}
                                <div className="font-medium text-sm">
                                    {result.testName || `Test Case ${index + 1}`}
                                </div>

                                {result.passed ? (
                                    <CheckCircle className="text-green-500" size={16} />
                                ) : (
                                    <XCircle className="text-red-500" size={16} />
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <small className="text-[#6b6b70] flex items-center gap-1">
                                    <Clock size={12} />
                                    {result.executionTime || 0}ms
                                </small>
                                <span className={result.passed ? 'badge-green' : 'badge-red'}>
                                    {result.passed ? 'PASS' : 'FAIL'}
                                </span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-[#2a2a2e]">
                                {/* Input */}
                                <div className="mb-2">
                                    <div className="text-sm">
                                        <span className="text-[#6b6b70] font-medium">Input:</span>{' '}
                                        <code className="bg-[#2a2a2e] px-2 py-1 rounded text-[#a1a1aa]">
                                            {formatInput(result.input)}
                                        </code>
                                    </div>
                                </div>

                                {/* Expected */}
                                <div className="mb-2">
                                    <div className="text-sm">
                                        <span className="text-[#6b6b70] font-medium">Expected:</span>{' '}
                                        <code className="bg-cyan-500/10 px-2 py-1 rounded text-cyan-400">
                                            {formatValue(result.expected)}
                                        </code>
                                    </div>
                                </div>

                                {/* Actual */}
                                <div className="mb-2">
                                    <div className="text-sm">
                                        <span className="text-[#6b6b70] font-medium">Actual:</span>{' '}
                                        <code className={`px-2 py-1 rounded ${
                                            result.passed
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {result.error ? `Error: ${result.error}` : formatValue(result.actual)}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    // Check if this question type supports testing
    const isCodeQuestion = question.questionData.type === 'codeChallenge' ||
                          question.questionData.type === 'codeDebugging';
    const canTest = isCodeQuestion && question.questionData.codeConfig;

    const allPassed = testResult && testResult.visiblePassed === testResult.visibleTotal;

    return (
        <div className="p-3">
            {/* Run Tests Button */}
            <div className="mb-3">
                <button
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleTestCode}
                    disabled={testing || !studentCode.trim() || !canTest}
                >
                    {testing ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Testing...
                        </>
                    ) : (
                        <>
                            <Play size={16} />
                            Run Tests
                        </>
                    )}
                </button>

                {/* Help text for disabled state */}
                {!canTest && (
                    <small className="text-[#6b6b70] block mt-1 text-center">
                        {!isCodeQuestion && 'Only code questions support testing'}
                        {isCodeQuestion && !question.questionData.codeConfig && 'Missing code configuration'}
                    </small>
                )}
            </div>

            {/* Overall Results Summary */}
            {testResult && (
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                        <small className="font-bold text-[#6b6b70]">VISIBLE TESTS</small>
                        <span className={`${allPassed ? 'badge-green' : 'badge-red'} flex items-center gap-1`}>
                            {allPassed ? (
                                <CheckCircle size={10} />
                            ) : (
                                <XCircle size={10} />
                            )}
                            {allPassed ? 'ALL PASSED' : 'SOME FAILED'}
                        </span>
                    </div>
                    <div className="progress-bar mb-2">
                        <div
                            className={`progress-fill ${getSuccessColor()}`}
                            style={{ width: `${getSuccessRate()}%` }}
                        />
                    </div>
                    <div className="flex justify-between">
                        <small className="text-[#6b6b70]">
                            {testResult.visiblePassed}/{testResult.visibleTotal} passed
                        </small>
                        <small className="text-[#6b6b70]">
                            {getSuccessRate().toFixed(0)}%
                        </small>
                    </div>

                    {/* Hidden tests indicator */}
                    {testResult.hasHiddenTests && (
                        <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/25 rounded flex items-center gap-2">
                            <EyeOff size={14} className="text-purple-400" />
                            <small className="text-purple-400">
                                Additional hidden tests will be checked on submit
                            </small>
                        </div>
                    )}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-3 p-2 bg-red-500/10 border border-red-500/25 rounded flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <small className="text-red-400">{error}</small>
                </div>
            )}

            {/* Compilation/Execution Errors */}
            {testResult && testResult.compilationError && (
                <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/25 rounded">
                    <div className="text-sm">
                        <strong className="text-amber-400">Compilation Error:</strong>
                        <div className="font-mono text-amber-300 break-words mt-1">
                            {testResult.compilationError}
                        </div>
                    </div>
                </div>
            )}

            {/* Execution Errors - with security rejection handling */}
            {testResult && testResult.executionError && (
                isSecurityRejection(testResult.executionError) ? (
                    <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/25 rounded">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert size={14} className="text-amber-400" />
                            <strong className="text-amber-400 text-sm">Code Not Allowed</strong>
                        </div>
                        <p className="text-sm text-amber-300">
                            {getSecurityErrorMessage()}
                        </p>
                    </div>
                ) : (
                    <div className="mb-3 p-2 bg-red-500/10 border border-red-500/25 rounded">
                        <div className="text-sm">
                            <strong className="text-red-400">Execution Error:</strong>
                            <div className="font-mono text-red-300 break-words mt-1">
                                {testResult.executionError}
                            </div>
                        </div>
                    </div>
                )
            )}

            {/* Console Logs */}
            {testResult && testResult.consoleLogs && testResult.consoleLogs.length > 0 && (
                <div className="mb-3">
                    <div className="text-sm font-medium text-[#6b6b70] mb-2">Console Output:</div>
                    <div className="bg-[#0a0a0b] text-[#f5f5f4] p-2 rounded font-mono text-xs max-h-32 overflow-y-auto">
                        {testResult.consoleLogs.map((log, index) => (
                            <div key={index} className="py-0.5 text-[#a1a1aa]">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Test Results */}
            <div className="mb-3">
                <div className="flex justify-between items-center mb-3">
                    <h6 className="font-mono text-sm font-semibold mb-0">Test Results</h6>
                    {testResult && (
                        <div className="flex items-center gap-2">
                            <span className="badge-blue text-xs flex items-center gap-1">
                                <Eye size={10} />
                                {testResult.visibleTotal} visible
                            </span>
                            {testResult.hasHiddenTests && (
                                <span className="badge-purple text-xs flex items-center gap-1">
                                    <EyeOff size={10} />
                                    + hidden
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {renderTestResults()}
                </div>
            </div>

            {/* Instructions */}
            {!testResult && canTest && (
                <div className="text-center text-[#6b6b70] py-3">
                    <div className="text-sm">
                        Run tests to check your code against visible test cases
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeTestingComponent;
